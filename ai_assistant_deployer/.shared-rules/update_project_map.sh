#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns 
# 🗺️ PROJECT MAP UPDATE SCRIPT (Flutter-Only Mode)
# Updates project structure documentation for Flutter projects
# Version: 2.1.0
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🗺️  PROJECT MAP UPDATE${NC}"
echo -e "${BLUE}=========================${NC}"

# Configuration
PROJECT_ROOT=$(pwd)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_MAP_FILE="$SCRIPT_DIR/PROJECT_MAP.md"

echo -e "\n${GREEN}📊 Analyzing project structure...${NC}"

# Auto-detect project type
detect_project_type() {
    if [ -f "package.json" ]; then
        echo "node"
    elif [ -f "pubspec.yaml" ]; then
        echo "e "
    elif [ -f "pom.xml" ]; then
        echo "java"
    elif [ -f "Cargo.toml" ]; then
        echo "rust"
    elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then
        echo "python"
    else
        echo "generic"
    fi
}

PROJECT_TYPE=$(detect_project_type)
echo -e "\n${GREEN}📊 Detected project type: $PROJECT_TYPE${NC}"

# Generate project map content based on project type
generate_project_map() {
    case $PROJECT_TYPE in
        "node")
            generate_node_project_map
            ;;
        "flutter")
            generate_flutter_project_map
            ;;
        *)
            generate_generic_project_map
            ;;
    esac
}

generate_node_project_map() {
    cat > "$PROJECT_MAP_FILE" << EOF
# 🗺️ Project Map

## Project Structure

### Current Project Structure
\`\`\`
./
├── src/                             # Source code
│   ├── extension.ts                 # Main extension entry point
│   ├── services/                    # Service modules
│   ├── ui/                          # UI components
│   └── utils/                       # Utility functions
├── tests/                           # Test files
├── build/                           # Build artifacts (generated)
├── docs/                            # Documentation
│   ├── architecture/                # Architecture documentation
│   └── user-guides/                 # User guides
├── configs/                         # Configuration files
├── scripts/                         # Build and deployment scripts
├── templates/                       # Template files
├── .shared-rules/                   # Enterprise rule enforcement system
│   ├── modules/                     # Rule modules
│   ├── task-system/                 # Task management system
│   └── verification/                # System verification
├── .tasks/                          # Task management directories
│   ├── 1_planning/                  # Task planning
│   ├── 2_development/               # Development tasks
│   ├── 3_execution/                 # Active tasks
│   └── 4_completion/                # Completed tasks
├── .vscode/                         # VS Code configuration
├── package.json                     # Project dependencies and configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # Project documentation
\`\`\`

### Current src/ Structure
\`\`\`
src/
├── extension.ts                     # Main extension entry point
├── services/                        # Service layer
└── ui/                              # UI components
\`\`\`

### Technology Stack
\`\`\`
package.json                         # Node.js/TypeScript project
tsconfig.json                       # TypeScript configuration
webpack.config.js                    # Build configuration
\`\`\`

## Key Configuration Files

### Project Configuration
- \`package.json\` - Project dependencies and configuration
- \`tsconfig.json\` - TypeScript compilation settings
- \`webpack.config.js\` - Build and bundling configuration
- \`README.md\` - Project documentation and setup instructions

### Development Tools
- \`.shared-rules/\` - Enterprise rule enforcement system
- \`.tasks/\` - Task management and workflow system
- \`.vscode/\` - VS Code editor configuration

## Current Project State

### Code Structure
- **Modular src/**: Well-organized source code structure
- **Service Layer**: Clean separation of concerns
- **Enterprise Tooling**: Comprehensive rule system and task management

### Development Workflow
1. Review this PROJECT_MAP.md (mandatory first step)
2. Check active modules in .shared-rules/modules.yaml
3. Follow task management workflow in .tasks/
4. Use enterprise rules for code quality assurance

---
*Generated by update_project_map.sh - Node.js/TypeScript Project Structure*
EOF
}

generate_flutter_project_map() {
    cat > "$PROJECT_MAP_FILE" << EOF
# 🗺️ Flutter Project Map

## Project Structure

### Real Flutter Project Structure
\`\`\`
./
├── lib/                             # Flutter application code
│   ├── main.dart                    # Application entry point
│   └── simple_main.dart             # Simplified entry point
├── test/                            # Test files
├── build/                           # Build artifacts (generated)
├── docs/                            # Documentation
│   ├── analysis/                    # Code analysis reports
│   └── task-management/             # Task management documentation
├── .shared-rules/                   # Enterprise rule enforcement system
│   ├── modules/                     # Rule modules
│   ├── task-system/                 # Task management system
│   └── verification/                # System verification
├── .tasks/                          # Task management directories
│   ├── 1_planning/                  # Task planning
│   ├── 2_development/               # Development tasks
│   ├── 3_execution/                 # Active tasks
│   └── 4_completion/                # Completed tasks
├── .vscode/                         # VS Code configuration
├── pubspec.yaml                     # Flutter project configuration
├── analysis_options.yaml            # Dart analysis configuration
└── README.md                        # Project documentation
\`\`\`

### Current lib/ Structure (Post-Refactoring)
\`\`\`
lib/
├── main.dart                        # Main application entry point
└── simple_main.dart                 # Simplified entry point
\`\`\`

### Platform-Specific Directories
\`\`\`
android/                             # Android-specific code and configuration
ios/                                 # iOS-specific code and configuration  
amplify/                             # AWS backend integration
\`\`\`

### Asset Management
\`\`\`
assets/                              # Static assets
├── icons/                           # Application icons
└── [various image files]            # PNG, SVG assets
fonts/                               # Font files
\`\`\`
    cat >> "$PROJECT_MAP_FILE" << EOF

## Key Configuration Files

### Flutter Configuration
- \`pubspec.yaml\` - Flutter project dependencies and configuration
- \`analysis_options.yaml\` - Dart analysis rules and linting
- \`README.md\` - Project documentation and setup instructions

### Platform Configuration  
- \`android/app/build.gradle\` - Android build configuration
- \`android/gradle.properties\` - Android Gradle properties
- \`ios/Podfile\` - iOS CocoaPods dependencies
- \`ios/Runner.xcodeproj/\` - Xcode project configuration

### AWS Amplify
- \`amplify/backend/\` - Backend services configuration
- \`amplify/team-provider-info.json\` - Team provider settings

### Development Tools
- \`.shared-rules/\` - Enterprise rule enforcement system
- \`.tasks/\` - Task management and workflow system
- \`.vscode/\` - VS Code editor configuration

## Current Project State

### Code Structure
- **Simplified lib/**: Post-refactoring clean state with minimal files
- **Full Platform Support**: Android, iOS, and AWS Amplify integration
- **Enterprise Tooling**: Comprehensive rule system and task management

### Development Workflow
1. Review this PROJECT_MAP.md (mandatory first step)
2. Check active modules in .shared-rules/modules.yaml
3. Follow task management workflow in .tasks/
4. Use enterprise rules for code quality assurance

---
*Generated by update_project_map.sh - Flutter Project Structure*
EOF
}

generate_generic_project_map() {
    cat > "$PROJECT_MAP_FILE" << EOF
# 🗺️ Project Map

## Project Structure

### Current Project Structure
\`\`\`
./
├── src/                             # Source code
├── docs/                            # Documentation
├── configs/                         # Configuration files
├── scripts/                         # Build and deployment scripts
├── .shared-rules/                   # Enterprise rule enforcement system
│   ├── modules/                     # Rule modules
│   ├── task-system/                 # Task management system
│   └── verification/                # System verification
├── .tasks/                          # Task management directories
└── README.md                        # Project documentation
\`\`\`

## Development Workflow
1. Review this PROJECT_MAP.md (mandatory first step)
2. Check active modules in .shared-rules/modules.yaml
3. Follow task management workflow in .tasks/
4. Use enterprise rules for code quality assurance

---
*Generated by update_project_map.sh - Generic Project Structure*
EOF
}

# Generate detailed directory analysis
analyze_directories() {
    echo -e "\n${GREEN}📁 Project Directory Analysis:${NC}"
    
    # Define common directories based on project type
    case $PROJECT_TYPE in
        "node")
            local common_dirs=("src" "tests" "build" "docs" "configs" "scripts" ".shared-rules" ".tasks" "node_modules")
            ;;
        "flutter")
            local common_dirs=("lib" "test" "assets" "fonts" "android" "ios" "docs" ".shared-rules" ".tasks")
            ;;
        *)
            local common_dirs=("src" "docs" "configs" "scripts" ".shared-rules" ".tasks")
            ;;
    esac
    
    for dir in "${common_dirs[@]}"; do
        if [ -d "$dir" ]; then
            local file_count=$(find "$dir" -type f | wc -l | tr -d ' ')
            local dir_count=$(find "$dir" -type d | wc -l | tr -d ' ')
            echo -e "  ✅ $dir/ ($file_count files, $dir_count directories)"
            
            # Special analysis for key directories
            case $dir in
                "lib")
                    if [ -f "lib/main.dart" ]; then
                        echo -e "     🚀 Entry point: main.dart found"
                    fi
                    if [ -f "lib/simple_main.dart" ]; then
                        echo -e "     🔧 Simplified entry: simple_main.dart found"
                    fi
                    ;;
                "test")
                    local test_files=$(find test -name "*.dart" | wc -l | tr -d ' ')
                    echo -e "     🧪 Test files: $test_files Dart tests"
                    ;;
                "assets")
                    local icons=$(find assets -name "*.png" -o -name "*.svg" | wc -l | tr -d ' ')
                    echo -e "     🎨 Visual assets: $icons icons/images"
                    ;;
                ".shared-rules")
                    local modules=$(find .shared-rules/modules -name "*.md" | wc -l | tr -d ' ')
                    echo -e "     📋 Rule modules: $modules modules"
                    ;;
                ".tasks")
                    local phases=$(find .tasks -maxdepth 1 -type d -name "*_*" | wc -l | tr -d ' ')
                    echo -e "     📊 Task phases: $phases phases"
                    ;;
                "android")
                    if [ -f "android/app/build.gradle" ]; then
                        echo -e "     🤖 Android config: build.gradle found"
                    fi
                    ;;
                "ios")
                    if [ -f "ios/Podfile" ]; then
                        echo -e "     🍎 iOS config: Podfile found"
                    fi
                    ;;
                "amplify")
                    if [ -d "amplify/backend" ]; then
                        echo -e "     ☁️  AWS backend: configuration found"
                    fi
                    ;;
            esac
        else
            echo -e "  ⚪ $dir/ (not present)"
        fi
    done
    
    # Summary statistics
    echo -e "\n${BLUE}📊 Project Statistics:${NC}"
    local total_files=$(find . -type f -not -path "./.git/*" -not -path "./.history/*" -not -path "./build/*" | wc -l | tr -d ' ')
    local dart_files=$(find . -name "*.dart" -not -path "./.git/*" -not -path "./.history/*" | wc -l | tr -d ' ')
    echo -e "  📄 Total files: $total_files"
    echo -e "  🎯 Dart files: $dart_files"
}

# Update project dependencies info
analyze_dependencies() {
    echo -e "\n${GREEN}📦 Dependencies Analysis:${NC}"
    
    case $PROJECT_TYPE in
        "node")
            if [ -f "package.json" ]; then
                echo -e "  ✅ package.json found"
                
                # Count dependencies
                deps=$(jq '.dependencies | length' package.json 2>/dev/null || echo "0")
                dev_deps=$(jq '.devDependencies | length' package.json 2>/dev/null || echo "0")
                echo -e "     📚 Dependencies: $deps packages"
                echo -e "     🔧 Dev Dependencies: $dev_deps packages"
                
                # Check for common frameworks
                if jq -e '.dependencies.express' package.json >/dev/null 2>&1; then
                    echo -e "     🌐 Framework: Express.js detected"
                fi
                
                if jq -e '.dependencies.react' package.json >/dev/null 2>&1; then
                    echo -e "     ⚛️  Framework: React detected"
                fi
                
                if jq -e '.dependencies.typescript' package.json >/dev/null 2>&1 || jq -e '.devDependencies.typescript' package.json >/dev/null 2>&1; then
                    echo -e "     📘 Language: TypeScript detected"
                fi
            else
                echo -e "  ❌ package.json not found"
            fi
            ;;
        "flutter")
            if [ -f "pubspec.yaml" ]; then
                echo -e "  ✅ pubspec.yaml found"
                
                # Count dependencies
                deps=$(grep -c "^  [a-zA-Z]" pubspec.yaml 2>/dev/null || echo "0")
                echo -e "     📚 Dependencies: $deps packages"
                
                # Check for common Flutter packages
                if grep -q "flutter_bloc" pubspec.yaml; then
                    echo -e "     🏗️  State Management: BLoC pattern detected"
                fi
                
                if grep -q "provider" pubspec.yaml; then
                    echo -e "     🏗️  State Management: Provider pattern detected"
                fi
            else
                echo -e "  ❌ pubspec.yaml not found"
            fi
            ;;
        *)
            echo -e "  ℹ️  Generic project - dependency analysis skipped"
            ;;
    esac
}

# Main execution
echo -e "\n${BLUE}🔄 Generating project map...${NC}"

# Generate the project map
generate_project_map

# Perform analysis
analyze_directories
analyze_dependencies

# Check enterprise rules integration
echo -e "\n${GREEN}🏢 Enterprise Rules Integration:${NC}"
if [ -d ".shared-rules" ]; then
    echo -e "  ✅ Enterprise rule system active"
    if [ -f ".shared-rules/modules.yaml" ]; then
        active_modules=$(grep -c "true" .shared-rules/modules.yaml 2>/dev/null || echo "0")
        echo -e "     📊 Active modules: $active_modules"
    fi
else
    echo -e "  ⚪ Enterprise rule system not found"
fi

# Finalize
echo -e "\n${GREEN}✅ Project map updated successfully!${NC}"
echo -e "📄 Documentation saved to: $PROJECT_MAP_FILE"

# Show file size
if [ -f "$PROJECT_MAP_FILE" ]; then
    size=$(wc -c < "$PROJECT_MAP_FILE")
    echo -e "📏 Documentation size: $size bytes"
fi

echo -e "\n${BLUE}💡 Next Steps:${NC}"
echo -e "  1. Review the generated PROJECT_MAP.md"
echo -e "  2. Update any missing sections manually"
echo -e "  3. Commit the documentation to version control"
echo -e "  4. Share with team members for reference"

echo -e "\n${GREEN}🎉 Flutter project documentation is now up to date!${NC}"
