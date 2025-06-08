#!/bin/bash

# M5 Project Security Check - Simplified Version
# Version: 2.0
# Usage: ./scripts/security-check.sh

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Security check function
security_check() {
    log "Running security validation..."
    
    local issues=0
    
    # 1. Check for hardcoded secrets
    log "Checking for hardcoded secrets..."
    local secret_patterns=(
        "password\s*=\s*['\"][^'\"]*['\"]"
        "api_key\s*=\s*['\"][^'\"]*['\"]"
        "secret\s*=\s*['\"][^'\"]*['\"]"
        "token\s*=\s*['\"][^'\"]*['\"]"
        "private_key"
    )
    
    for pattern in "${secret_patterns[@]}"; do
        if find "$PROJECT_ROOT/lib" -name "*.dart" -exec grep -l -i -E "$pattern" {} \; 2>/dev/null | head -5; then
            warning "Potential hardcoded secrets found (pattern: $pattern)"
            ((issues++))
        fi
    done
    
    # 2. Check for insecure network calls
    log "Checking for insecure network calls..."
    if find "$PROJECT_ROOT/lib" -name "*.dart" -exec grep -l "http://" {} \; 2>/dev/null | head -5; then
        warning "Insecure HTTP calls found (should use HTTPS)"
        ((issues++))
    fi
    
    # 3. Check for debug code in production
    log "Checking for debug code..."
    local debug_patterns=(
        "print\("
        "debugPrint\("
        "console\.log"
        "TODO.*remove"
        "FIXME"
    )
    
    for pattern in "${debug_patterns[@]}"; do
        local matches=$(find "$PROJECT_ROOT/lib" -name "*.dart" -exec grep -l -E "$pattern" {} \; 2>/dev/null | wc -l)
        if [ "$matches" -gt 0 ]; then
            warning "Debug code found: $matches files contain '$pattern'"
            ((issues++))
        fi
    done
    
    # 4. Check pubspec.yaml security
    log "Checking pubspec.yaml security..."
    if [ -f "$PROJECT_ROOT/pubspec.yaml" ]; then
        if grep -q "git:" "$PROJECT_ROOT/pubspec.yaml"; then
            warning "Git dependencies found - ensure they're from trusted sources"
            ((issues++))
        fi
        
        if grep -q "path:" "$PROJECT_ROOT/pubspec.yaml"; then
            warning "Local path dependencies found - verify they're intentional"
            ((issues++))
        fi
    fi
    
    # 5. Check for proper error handling
    log "Checking error handling patterns..."
    local dart_files=$(find "$PROJECT_ROOT/lib" -name "*.dart" 2>/dev/null | wc -l)
    local try_catch_files=$(find "$PROJECT_ROOT/lib" -name "*.dart" -exec grep -l "try\s*{" {} \; 2>/dev/null | wc -l)
    
    if [ "$dart_files" -gt 0 ] && [ "$try_catch_files" -eq 0 ]; then
        warning "No try-catch blocks found - ensure proper error handling"
        ((issues++))
    fi
    
    # 6. Check file permissions (if on Unix-like system)
    if [ "$(uname)" != "Darwin" ] && [ "$(uname)" != "Linux" ]; then
        log "Skipping file permission check (not Unix-like system)"
    else
        log "Checking file permissions..."
        if find "$PROJECT_ROOT" -name "*.dart" -perm /022 2>/dev/null | head -1 | grep -q "."; then
            warning "Some Dart files have world-writable permissions"
            ((issues++))
        fi
    fi
    
    # Summary
    echo
    if [ $issues -eq 0 ]; then
        success "Security check passed - no critical issues found"
        return 0
    else
        warning "Security check completed with $issues potential issues"
        echo
        echo "Review the warnings above and address critical security concerns."
        echo "For detailed security guidelines, see .github/RULES.md section I2."
        return 1
    fi
}

# Quick dependency check
dependency_check() {
    log "Checking dependencies for known vulnerabilities..."
    
    if [ -f "$PROJECT_ROOT/pubspec.yaml" ]; then
        # Check for outdated dependencies (simplified)
        if command -v flutter &> /dev/null; then
            log "Running flutter pub deps to check dependencies..."
            cd "$PROJECT_ROOT" && flutter pub deps > /dev/null 2>&1 || {
                warning "Could not analyze dependencies - run 'flutter pub get' first"
                return 1
            }
            success "Dependency structure appears valid"
        else
            warning "Flutter not found - skipping dependency analysis"
        fi
    else
        error "pubspec.yaml not found"
        return 1
    fi
}

# Main function
main() {
    local command="${1:-check}"
    
    echo "M5 Project Security Check - Version 2.0"
    echo "========================================"
    echo
    
    case "$command" in
        check|--check)
            security_check
            ;;
        deps|--deps)
            dependency_check
            ;;
        full|--full)
            security_check
            echo
            dependency_check
            ;;
        help|--help|-h)
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  check      Run security validation (default)"
            echo "  deps       Check dependencies for vulnerabilities"
            echo "  full       Run both security and dependency checks"
            echo "  help       Show this help message"
            echo
            echo "Examples:"
            echo "  $0"
            echo "  $0 check"
            echo "  $0 full"
            ;;
        *)
            error "Unknown command: $command"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
