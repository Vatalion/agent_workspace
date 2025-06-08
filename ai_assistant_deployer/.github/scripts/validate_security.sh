#!/bin/bash
# .github folder security validator
# Location: .github/validate_security.sh

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"
GITHUB_DIR="$PROJECT_ROOT/.github"

# Define allowed files (MAXIMUM 7 FILES + 1 SUBDIRECTORY)
ALLOWED_FILES=(
    "copilot-instructions.md"
    "project-rules.md" 
    "PROJECT_MAP.md"
    "task-management.sh"
    "setup_task_system.sh"
    "update_project_map.sh"
    "validate_security.sh"
)

ALLOWED_SUBDIRS=(
    "task-management"
)

echo "🔒 VALIDATING .github/ FOLDER SECURITY..."

# Count actual files
actual_files=($(find "$GITHUB_DIR" -maxdepth 1 -type f -name "*.md" -o -name "*.sh" | xargs -n 1 basename))
actual_subdirs=($(find "$GITHUB_DIR" -maxdepth 1 -type d ! -path "$GITHUB_DIR" | xargs -n 1 basename))

# Check file count
if [ ${#actual_files[@]} -gt 7 ]; then
    echo "🚨 VIOLATION: Too many files in .github/ (${#actual_files[@]}/7 max)"
    echo "Files found: ${actual_files[*]}"
    exit 1
fi

# Check subdirectory count  
if [ ${#actual_subdirs[@]} -gt 1 ]; then
    echo "🚨 VIOLATION: Too many subdirectories in .github/ (${#actual_subdirs[@]}/1 max)"
    echo "Subdirs found: ${actual_subdirs[*]}"
    exit 1
fi

# Validate each file is allowed
for file in "${actual_files[@]}"; do
    allowed=false
    for allowed_file in "${ALLOWED_FILES[@]}"; do
        if [ "$file" = "$allowed_file" ]; then
            allowed=true
            break
        fi
    done
    
    if [ "$allowed" = false ]; then
        echo "🚨 VIOLATION: Unauthorized file in .github/: $file"
        echo "💡 Move to docs/ or appropriate location"
        exit 1
    fi
done

# Validate subdirectory
for subdir in "${actual_subdirs[@]}"; do
    allowed=false
    for allowed_subdir in "${ALLOWED_SUBDIRS[@]}"; do
        if [ "$subdir" = "$allowed_subdir" ]; then
            allowed=true
            break
        fi
    done
    
    if [ "$allowed" = false ]; then
        echo "🚨 VIOLATION: Unauthorized subdirectory in .github/: $subdir"
        exit 1
    fi
done

echo "✅ .github/ folder security validation PASSED"
echo "📊 Files: ${#actual_files[@]}/7 | Subdirs: ${#actual_subdirs[@]}/1"
exit 0
