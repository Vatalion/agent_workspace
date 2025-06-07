#!/bin/bash
# migrate_to_feature_architecture.sh - Helps migrate project to feature-based structure

echo "Flutter Feature-Based Architecture Migration Helper"
echo "=================================================="

# Define color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root directory
PROJECT_ROOT=$(pwd)
LIB_DIR="$PROJECT_ROOT/lib"

echo -e "${BLUE}Creating feature-based directory structure...${NC}"

# Create main directories if they don't exist
mkdir -p "$LIB_DIR/features"
mkdir -p "$LIB_DIR/shared/widgets"
mkdir -p "$LIB_DIR/shared/services"
mkdir -p "$LIB_DIR/core/constants"
mkdir -p "$LIB_DIR/core/extensions"
mkdir -p "$LIB_DIR/core/utils"
mkdir -p "$LIB_DIR/core/exceptions"

echo -e "${BLUE}Identifying possible features from existing code...${NC}"

# Look for potential screens to identify features
screen_files=$(find "$LIB_DIR" -type f -name "*_screen.dart" -o -name "*_page.dart" | sort)

# Extract potential feature names
declare -A features
for screen in $screen_files; do
  filename=$(basename "$screen")
  # Remove _screen.dart or _page.dart and convert to lowercase for feature name
  feature_name=$(echo "$filename" | sed 's/_screen\.dart$//' | sed 's/_page\.dart$//' | tr '[:upper:]' '[:lower:]')
  features["$feature_name"]=1
done

# Create feature structure for identified features
if [ ${#features[@]} -gt 0 ]; then
  echo -e "${BLUE}Creating structure for identified features:${NC}"
  for feature in "${!features[@]}"; do
    echo "- $feature"
    mkdir -p "$LIB_DIR/features/$feature/presentation/screens"
    mkdir -p "$LIB_DIR/features/$feature/presentation/bloc"
    mkdir -p "$LIB_DIR/features/$feature/presentation/widgets"
    mkdir -p "$LIB_DIR/features/$feature/data/models"
    mkdir -p "$LIB_DIR/features/$feature/data/repositories"
    mkdir -p "$LIB_DIR/features/$feature/domain/entities"
    mkdir -p "$LIB_DIR/features/$feature/domain/usecases"
  done
else
  echo -e "${YELLOW}No features identified from existing screen files.${NC}"
  # Create example feature structure
  echo -e "${BLUE}Creating example 'home' feature structure:${NC}"
  mkdir -p "$LIB_DIR/features/home/presentation/screens"
  mkdir -p "$LIB_DIR/features/home/presentation/bloc"
  mkdir -p "$LIB_DIR/features/home/presentation/widgets"
  mkdir -p "$LIB_DIR/features/home/data/models"
  mkdir -p "$LIB_DIR/features/home/data/repositories"
  mkdir -p "$LIB_DIR/features/home/domain/entities"
  mkdir -p "$LIB_DIR/features/home/domain/usecases"
fi

# Create a README file explaining the feature structure
cat > "$LIB_DIR/features/README.md" << 'EOL'
# Feature-Based Architecture

This directory follows a clean architecture approach with features organized as isolated modules.

## Structure

Each feature follows this structure:

```
feature_name/
  ├── presentation/
  │   ├── screens/     # UI screens/pages
  │   ├── widgets/     # Feature-specific widgets
  │   └── bloc/        # State management (BLoC/Cubit)
  ├── domain/
  │   ├── entities/    # Business objects
  │   └── usecases/    # Business logic
  └── data/
      ├── models/      # Data transfer objects
      └── repositories/ # Data access layer
```

## Guidelines

1. **Feature Isolation**: Each feature should be self-contained
2. **BLoC Location**: All BLoCs must be placed in the presentation/bloc directory
3. **Clean Architecture**: Domain layer should not depend on presentation or data layers
4. **State Management**: Each main screen requires a dedicated BLoC/Cubit
EOL

echo -e "\n${GREEN}Feature-based structure created!${NC}"
echo "Run './.github/update_project_map.sh' to update the project structure map."
