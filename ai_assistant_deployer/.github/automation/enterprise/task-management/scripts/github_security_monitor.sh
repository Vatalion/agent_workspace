#!/bin/bash

# github_security_monitor.sh - Continuous monitoring for .github/ violations
# Runs validation checks and prevents violations

set -e

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"
GITHUB_DIR="$PROJECT_ROOT/.github"

# Check for quiet mode
QUIET_MODE=false
if [ "$1" = "--quiet" ] || [ "$1" = "-q" ]; then
    QUIET_MODE=true
fi

if [ "$QUIET_MODE" = false ]; then
    echo "🛡️ GITHUB SECURITY MONITOR - Checking for violations..."
fi

# Count current files and directories
CURRENT_FILES=$(find "$GITHUB_DIR" -maxdepth 1 -type f | wc -l | xargs)
CURRENT_DIRS=$(find "$GITHUB_DIR" -maxdepth 1 -type d ! -path "$GITHUB_DIR" | wc -l | xargs)

if [ "$QUIET_MODE" = false ]; then
    echo "📊 Current status: $CURRENT_FILES files + $CURRENT_DIRS subdirectories"
fi

# Define allowed files
ALLOWED_FILES=(
    "copilot-instructions.md"
    "project-rules.md"
    "PROJECT_MAP.md" 
    "current.json"
    "task-management.sh"
    "setup_task_system.sh"
    "update_project_map.sh"
    "validate_security.sh"
    "mandatory_cleanup.sh"
    "RULES.md"
    "mode-manager.sh"
    "system-config.json"
    "MIGRATION_REPORT.md"
    "DETAILED_MIGRATION_REPORT.md"
    "LOST_FUNCTIONALITY_ANALYSIS.md"
)

# Check for violations
VIOLATIONS=()

# Check file count (increased for dual-mode system)
if [ "$CURRENT_FILES" -gt 16 ]; then
    VIOLATIONS+=("❌ File count violation: $CURRENT_FILES/16 files")
fi

# Check directory count (allow more for enterprise mode)
if [ "$CURRENT_DIRS" -gt 6 ]; then
    VIOLATIONS+=("❌ Directory count violation: $CURRENT_DIRS/6 subdirectories")
fi

# Check for unauthorized files
while IFS= read -r -d '' file; do
    FILENAME=$(basename "$file")
    IS_ALLOWED=false
    
    for allowed in "${ALLOWED_FILES[@]}"; do
        if [ "$FILENAME" = "$allowed" ]; then
            IS_ALLOWED=true
            break
        fi
    done
    
    if [ "$IS_ALLOWED" = false ]; then
        VIOLATIONS+=("❌ Unauthorized file: $FILENAME")
    fi
done < <(find "$GITHUB_DIR" -maxdepth 1 -type f -print0)

# Check for unauthorized .md files (allow RULES.md for dual-mode system)
UNAUTHORIZED_MD=$(find "$GITHUB_DIR" -maxdepth 1 -name "*.md" ! -name "copilot-instructions.md" ! -name "project-rules.md" ! -name "PROJECT_MAP.md" ! -name "RULES.md" ! -name "MIGRATION_REPORT.md" ! -name "DETAILED_MIGRATION_REPORT.md" ! -name "LOST_FUNCTIONALITY_ANALYSIS.md")

if [ -n "$UNAUTHORIZED_MD" ]; then
    while IFS= read -r md_file; do
        VIOLATIONS+=("❌ Unauthorized .md file: $(basename "$md_file")")
    done <<< "$UNAUTHORIZED_MD"
fi

# Report results
if [ ${#VIOLATIONS[@]} -eq 0 ]; then
    echo "✅ SECURITY STATUS: COMPLIANT"
    echo "🛡️ All .github/ folder rules are followed"
else
    echo ""
    echo "🚨 SECURITY VIOLATIONS DETECTED:"
    printf '%s\n' "${VIOLATIONS[@]}"
    echo ""
    echo "🔧 SUGGESTED FIXES:"
    echo "   📁 Move .md files to docs/task-management/"
    echo "   📁 Move utility scripts to scripts/"
    echo "   📁 Move config files to .tasks/system/"
    echo ""
    echo "🚫 IMMEDIATE ACTION REQUIRED"
    exit 1
fi

echo "🕐 Monitor completed at $(date)"
