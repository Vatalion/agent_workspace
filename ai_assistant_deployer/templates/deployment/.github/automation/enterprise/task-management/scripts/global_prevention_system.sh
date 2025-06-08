#!/bin/bash
# Global Prevention System - Main Entry Point  
# Integrates GitHub security validation into all project operations

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"

# 🔐 MANDATORY SECURITY CHECK FUNCTION
validate_github_security() {
    echo "🔐 Validating .github/ folder security..."
    
    if [ -f "$PROJECT_ROOT/.github/task-management/scripts/github_security_monitor.sh" ]; then
        cd "$PROJECT_ROOT"
        ./.github/task-management/scripts/github_security_monitor.sh --quiet
        if [ $? -ne 0 ]; then
            echo "❌ CRITICAL: .github/ folder security violation detected!"
            echo "🚨 All operations blocked until violations are fixed"
            echo ""
            echo "🔧 Run manual check:"
            echo "   ./.github/task-management/scripts/github_security_monitor.sh"
            return 1
        fi
    else
        echo "⚠️  Security monitor not found at .github/task-management/scripts/github_security_monitor.sh"
        return 1
    fi
    
    return 0
}

# 🛡️ FILE CREATION SAFETY CHECK
validate_file_creation() {
    local file_path="$1"
    local description="$2"
    
    if [ -f "$PROJECT_ROOT/.github/task-management/scripts/validate_file_creation.sh" ]; then
        cd "$PROJECT_ROOT"
        ./.github/task-management/scripts/validate_file_creation.sh "$file_path" "$description"
        return $?
    else
        echo "⚠️  File creation validator not found"
        return 1
    fi
}

# 🧹 MANDATORY CLEANUP EXECUTION
execute_mandatory_cleanup() {
    echo "🧹 Executing mandatory cleanup..."
    
    if [ -f "$PROJECT_ROOT/.github/mandatory_cleanup.sh" ]; then
        cd "$PROJECT_ROOT"
        ./.github/mandatory_cleanup.sh
        return $?
    else
        echo "⚠️  Mandatory cleanup script not found"
        return 1
    fi
}

# Export functions for use in other scripts
export -f validate_github_security
export -f validate_file_creation  
export -f execute_mandatory_cleanup

echo "✅ Global prevention system loaded"
echo "🛡️ Use 'validate_github_security' before any operations"
echo "🔐 Use 'validate_file_creation' before creating files"
echo "🧹 Use 'execute_mandatory_cleanup' after task completion"
