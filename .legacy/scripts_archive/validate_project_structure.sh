#!/bin/bash
# validate_project_structure.sh - Validates project structure against rules

echo "Validating project structure against architecture rules..."

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get project root directory
PROJECT_ROOT=$(pwd)
LIB_DIR="$PROJECT_ROOT/lib"

# Check if features directory exists
if [ ! -d "$LIB_DIR/features" ]; then
  echo -e "${YELLOW}⚠️ Warning: No 'features' directory found.${NC}"
  echo "Consider organizing code in feature-based structure."
  HAS_WARNINGS=1
fi

# Check for main directories
directories_to_check=("shared" "core")
for dir in "${directories_to_check[@]}"; do
  if [ ! -d "$LIB_DIR/$dir" ]; then
    echo -e "${YELLOW}⚠️ Warning: $dir directory missing${NC}"
    HAS_WARNINGS=1
  fi
done

# Check task management structure
if [ ! -d ".tasks" ]; then
  echo -e "${RED}❌ ERROR: .tasks directory is missing${NC}"
  HAS_ERRORS=1
elif [ ! -f ".tasks/ACTIVE_TASK.md" ]; then
  echo -e "${YELLOW}⚠️ Warning: .tasks/ACTIVE_TASK.md file is missing${NC}"
  HAS_WARNINGS=1
fi

# Check task subdirectories
task_subdirs=("epics" "completed" "system")
for dir in "${task_subdirs[@]}"; do
  if [ ! -d ".tasks/$dir" ]; then
    echo -e "${YELLOW}⚠️ Warning: .tasks/$dir directory missing${NC}"
    HAS_WARNINGS=1
  fi
done

# Check GitHub folder structure
github_files=("PROJECT_MAP.md" "project-rules.md" "copilot-instructions.md" "task-management.sh" "update_project_map.sh" "validate_security.sh" "setup_task_system.sh")
for file in "${github_files[@]}"; do
  if [ ! -f ".github/$file" ]; then
    echo -e "${RED}❌ ERROR: .github/$file is missing${NC}"
    HAS_ERRORS=1
  fi
done

# Check for BLoC placement if flutter_bloc is used
if grep -q "flutter_bloc" pubspec.yaml; then
  find "$LIB_DIR" -type f -name "*bloc.dart" | while read -r bloc_file; do
    dir_path=$(dirname "$bloc_file")
    if [[ "$dir_path" != *"/presentation/bloc"* ]] && [[ "$dir_path" != *"/bloc"* ]]; then
      rel_path=$(realpath --relative-to="$PROJECT_ROOT" "$bloc_file")
      echo -e "${YELLOW}⚠️ Warning: BLoC file $rel_path not in correct location${NC}"
      echo "   Should be in features/[feature]/presentation/bloc/"
      HAS_WARNINGS=1
    fi
  done
fi

# Final output
if [ "$HAS_ERRORS" == "1" ]; then
  echo -e "\n${RED}❌ Project structure validation failed with errors${NC}"
  echo "Please fix errors to comply with architecture rules."
  exit 1
elif [ "$HAS_WARNINGS" == "1" ]; then
  echo -e "\n${YELLOW}⚠️ Project structure validation completed with warnings${NC}"
  echo "Consider addressing warnings to better comply with architecture rules."
  exit 0
else
  echo -e "\n${GREEN}✅ Project structure validation passed${NC}"
  echo "Structure complies with architecture rules."
  exit 0
fi
