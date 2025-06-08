#!/bin/bash

# validate_file_creation.sh - MANDATORY validation before creating ANY file
# Prevents .github/ folder security violations

set -e

FILEPATH="$1"
DESCRIPTION="$2"

if [ -z "$FILEPATH" ]; then
    echo "❌ ERROR: No filepath provided"
    echo "Usage: ./validate_file_creation.sh <filepath> <description>"
    exit 1
fi

echo "🔍 MANDATORY PRE-CREATE VALIDATION"
echo "📁 Target: $FILEPATH"
echo "📋 Description: $DESCRIPTION"

# Check if target is .github/ folder
if [[ "$FILEPATH" == *".github/"* ]]; then
    echo ""
    echo "🚨 SECURITY ALERT: Attempting to create file in .github/ folder"
    echo "🛡️ MANDATORY VALIDATION REQUIRED"
    echo ""
    
    # Show current .github/ contents
    echo "📊 Current .github/ contents:"
    ls -la .github/ | grep -v "^total"
    echo ""
    
    # Count current files (excluding . and ..)
    CURRENT_COUNT=$(find .github/ -maxdepth 1 -type f | wc -l | xargs)
    CURRENT_DIRS=$(find .github/ -maxdepth 1 -type d ! -path .github/ | wc -l | xargs)
    
    echo "📈 Current counts: $CURRENT_COUNT files + $CURRENT_DIRS subdirectories"
    echo "🎯 Limit: 10 files + 1 subdirectory"
    echo ""
    
    # Mandatory questions
    echo "🛡️ MANDATORY PRE-CREATE VALIDATION QUESTIONS:"
    echo "1. ❓ Is this a task management script? (If NO → docs/ or scripts/)"
    echo "2. ❓ Is this documentation? (If YES → docs/task-management/)"
    echo "3. ❓ Is this a config/data file? (If YES → .tasks/system/)"
    echo "4. ❓ Is this a utility script? (If YES → scripts/)"
    echo "5. ❓ Is this project documentation? (If YES → docs/)"
    echo ""
    
    # Check against allowed list
    FILENAME=$(basename "$FILEPATH")
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
    )
    
    IS_ALLOWED=false
    for allowed in "${ALLOWED_FILES[@]}"; do
        if [ "$FILENAME" = "$allowed" ]; then
            IS_ALLOWED=true
            break
        fi
    done
    
    if [ "$IS_ALLOWED" = false ] && [ "$FILENAME" != "task-management" ]; then
        echo "❌ VIOLATION: '$FILENAME' is NOT in allowed list"
        echo ""
        echo "📋 ALLOWED FILES ONLY:"
        printf '%s\n' "${ALLOWED_FILES[@]}" | sed 's/^/   ✅ /'
        echo "   ✅ task-management/ (subdirectory)"
        echo ""
        echo "🔄 SUGGESTED ALTERNATIVES:"
        
        if [[ "$FILENAME" == *.md ]]; then
            echo "   📁 docs/task-management/$FILENAME (for task documentation)"
            echo "   📁 docs/$FILENAME (for project documentation)"
        elif [[ "$FILENAME" == *.sh ]]; then
            echo "   📁 scripts/$FILENAME (for utility scripts)"
        elif [[ "$FILENAME" == *.json ]] || [[ "$FILENAME" == *.yaml ]]; then
            echo "   📁 .tasks/system/$FILENAME (for config/data files)"
        else
            echo "   📁 docs/$FILENAME (default for documentation)"
            echo "   📁 .tasks/system/$FILENAME (for data files)"
        fi
        
        echo ""
        echo "🚫 SECURITY VIOLATION PREVENTED"
        exit 1
    fi
    
    # Check count limits
    if [ "$CURRENT_COUNT" -ge 10 ] && [ "$IS_ALLOWED" = false ]; then
        echo "❌ VIOLATION: File limit exceeded ($CURRENT_COUNT/10 files)"
        echo "🚫 SECURITY VIOLATION PREVENTED"
        exit 1
    fi
    
    echo "✅ VALIDATION PASSED: File is allowed in .github/"
    echo ""
fi

echo "✅ VALIDATION COMPLETE: File creation approved"
echo "📁 Target: $FILEPATH"
