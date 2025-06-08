#!/bin/bash

# M5 Project System Mode Manager
# Usage: ./mode-manager.sh [simplified|enterprise|status|auto]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$PROJECT_ROOT/system-config.json"
BACKUP_DIR="$PROJECT_ROOT/backups"
MODES_DIR="$PROJECT_ROOT/modes"
SIMPLIFIED_DIR="$MODES_DIR/simplified"
ENTERPRISE_DIR="$MODES_DIR/enterprise"
HYBRID_DIR="$MODES_DIR/hybrid"
TASKS_DIR="$PROJECT_ROOT/../.tasks"
MAIN_PROJECT_ROOT="$PROJECT_ROOT/.."

# Core files that get rewritten based on mode
COPILOT_INSTRUCTIONS="$PROJECT_ROOT/copilot-instructions.md"
PROJECT_RULES="$PROJECT_ROOT/project-rules.md"
PROJECT_MAP="$PROJECT_ROOT/PROJECT_MAP.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }
info() { echo -e "${PURPLE}ℹ${NC} $1"; }

# Get current mode
get_current_mode() {
    if [ -f "$CONFIG_FILE" ]; then
        jq -r '.current_mode' "$CONFIG_FILE" 2>/dev/null || echo "simplified"
    else
        echo "simplified"
    fi
}

# Check if this is first time setup
is_first_time_setup() {
    if [ -f "$CONFIG_FILE" ]; then
        local first_time=$(jq -r '.first_time_setup' "$CONFIG_FILE" 2>/dev/null)
        [ "$first_time" = "true" ]
    else
        true
    fi
}

# Mark first time setup as complete
mark_setup_complete() {
    if [ -f "$CONFIG_FILE" ]; then
        jq '.first_time_setup = false' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    else
        error "Config file not found: $CONFIG_FILE"
        return 1
    fi
}

# Interactive mode selection for first-time users
interactive_mode_selection() {
    echo
    echo -e "${CYAN}╭─────────────────────────────────────────────────────────────────╮${NC}"
    echo -e "${CYAN}│                    🎯 M5 PROJECT SYSTEM                         │${NC}"
    echo -e "${CYAN}│                   First-Time Setup Required                     │${NC}"
    echo -e "${CYAN}╰─────────────────────────────────────────────────────────────────╯${NC}"
    echo
    
    info "Welcome! This is your first time using the M5 project system."
    info "Please choose your preferred development mode:"
    echo
    
    # Simplified Mode
    echo -e "${GREEN}1. SIMPLIFIED MODE${NC}"
    echo "   📋 Perfect for: Small to medium projects (< 20 hours)"
    echo "   🎯 Features:"
    echo "     • Basic Flutter development workflow"
    echo "     • SOLID principles & Clean Architecture"
    echo "     • Automated testing and backup"
    echo "     • Simple task management"
    echo "     • Security validation"
    echo "   💻 Best for: Single machine, focused development"
    echo
    
    # Enterprise Mode  
    echo -e "${PURPLE}2. ENTERPRISE MODE${NC}"
    echo "   🚀 Perfect for: Large projects (50+ hours) & team development"
    echo "   🎯 Features:"
    echo "     • Everything from Simplified Mode PLUS:"
    echo "     • Epic task orchestration (10-500+ hour projects)"
    echo "     • Priority interrupt system with graceful suspension"
    echo "     • Cross-machine synchronization with auto git branching"
    echo "     • Real-time monitoring daemon"
    echo "     • Machine state preservation"
    echo "     • Milestone tracking with automatic checkpoints"
    echo "     • Auto-save every 15 minutes"
    echo "   💻 Best for: Multi-machine, enterprise workflows"
    echo
    
    echo -e "${YELLOW}Which mode would you like to use?${NC}"
    echo -n "Enter your choice (1 for Simplified, 2 for Enterprise): "
    
    local choice
    read choice
    
    case $choice in
        1|simplified|Simplified|SIMPLIFIED)
            echo
            info "You selected: SIMPLIFIED MODE"
            echo "✅ Great choice for focused Flutter development!"
            return 0 # simplified
            ;;
        2|enterprise|Enterprise|ENTERPRISE)
            echo
            info "You selected: ENTERPRISE MODE"  
            echo "🚀 Perfect for large-scale project management!"
            return 1 # enterprise
            ;;
        *)
            echo
            warning "Invalid selection. Defaulting to Simplified Mode."
            info "You can change this later by running: ./mode-manager.sh enterprise"
            return 0 # simplified (default)
            ;;
    esac
}

# Handle first-time setup (now chat-based, not interactive terminal)
handle_first_time_setup() {
    # This function is no longer used for interactive setup
    # Setup is now handled through Copilot chat conversation
    return 1
}

# Set mode in config
set_mode() {
    local new_mode="$1"
    if [ -f "$CONFIG_FILE" ]; then
        jq ".current_mode = \"$new_mode\"" "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    else
        error "Config file not found: $CONFIG_FILE"
        return 1
    fi
}

# Create backup before switching
create_switch_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/mode_switch_$timestamp"
    
    log "Creating backup before mode switch..."
    mkdir -p "$backup_path"
    
    # Backup current core files
    cp "$COPILOT_INSTRUCTIONS" "$backup_path/" 2>/dev/null || true
    cp "$PROJECT_RULES" "$backup_path/" 2>/dev/null || true
    cp "$PROJECT_MAP" "$backup_path/" 2>/dev/null || true
    cp "$CONFIG_FILE" "$backup_path/" 2>/dev/null || true
    
    # Backup .tasks structure if it exists
    if [ -d "$TASKS_DIR" ]; then
        cp -r "$TASKS_DIR" "$backup_path/tasks_backup"
    fi
    
    success "Backup created: $backup_path"
}

# Rewrite core files based on mode
rewrite_core_files() {
    local target_mode="$1"
    local mode_dir="$MODES_DIR/$target_mode"
    
    log "Rewriting core files for $target_mode mode..."
    
    # Rewrite copilot-instructions.md
    if [ -f "$mode_dir/copilot-instructions.md" ]; then
        cp "$mode_dir/copilot-instructions.md" "$COPILOT_INSTRUCTIONS"
        success "✓ copilot-instructions.md rewritten for $target_mode mode"
    else
        warning "⚠ copilot-instructions.md template not found for $target_mode"
    fi
    
    # Rewrite project-rules.md
    if [ -f "$mode_dir/project-rules.md" ]; then
        cp "$mode_dir/project-rules.md" "$PROJECT_RULES"
        success "✓ project-rules.md rewritten for $target_mode mode"
    else
        warning "⚠ project-rules.md template not found for $target_mode"
    fi
    
    # Update PROJECT_MAP.md with current mode structure
    update_project_map "$target_mode"
}

# Update PROJECT_MAP.md with current structure
update_project_map() {
    local mode="$1"
    
    # Generate the project map content
    {
        echo "# M5 Project Structure Map"
        echo ""
        echo "## Current Mode: $(echo $mode | tr '[:lower:]' '[:upper:]')"
        echo "Last Updated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "## Core Structure (Clean Root)"
        echo '```'
        echo ".github/"
        echo "├── copilot-instructions.md    # Dynamic - Rewritten per mode"
        echo "├── project-rules.md          # Dynamic - Rewritten per mode"
        echo "├── PROJECT_MAP.md            # Dynamic - Updated per mode"
        echo "├── mode-manager.sh           # Mode switching controller"
        echo "├── system-config.json        # Mode configuration"
        echo "├── update_project_map.sh     # Project map updater"
        echo "└── modes/                    # Mode-separated structures"
        echo "    ├── simplified/           # Simplified mode files"
        echo "    │   ├── copilot-instructions.md"
        echo "    │   ├── project-rules.md"
        echo "    │   ├── scripts/          # Basic scripts"
        echo "    │   └── automation/       # Simple automation"
        echo "    └── enterprise/           # Enterprise mode files"
        echo "        ├── copilot-instructions.md"
        echo "        ├── project-rules.md"
        echo "        ├── scripts/          # Enterprise scripts"
        echo "        └── automation/       # Advanced automation"
        echo '```'
        echo ""
        echo "## Active Mode: $mode"
        if [ "$mode" = "simplified" ]; then
            echo "✓ Basic task management with essential automation"
        elif [ "$mode" = "enterprise" ]; then
            echo "✓ Advanced task orchestration with full enterprise features"
        fi
        echo ""
        echo "## Task Structure (.tasks/)"
        if [ "$mode" = "simplified" ]; then
            echo '```'
            echo ".tasks/"
            echo "├── current_task.json         # Active task"
            echo "├── completed/               # Completed tasks"
            echo "├── backups/                # Automatic backups"
            echo "└── current/                # Working files"
            echo '```'
        else
            echo '```'
            echo ".tasks/"
            echo "├── system/                 # Core system files"
            echo "├── epics/                 # Epic management"
            echo "├── 1_planning/            # Planning phase"
            echo "├── 2_review/              # Review workflow"
            echo "├── 3_work/                # Active work"
            echo "├── 4_verify/              # Verification"
            echo "├── 5_deploy/              # Deployment"
            echo "├── completed/             # Finished tasks"
            echo "├── backups/               # Auto backups"
            echo "└── sync/                  # Cross-machine sync"
            echo '```'
        fi
        echo ""
        echo "## Mode Switching"
        echo "- Current: $mode"
        echo "- Switch modes: \`./mode-manager.sh [simplified|enterprise]\`"
        echo "- View status: \`./mode-manager.sh status\`"
        echo ""
        echo "## Benefits of Clean Structure"
        echo "- **Visual Separation**: Mode-specific files in dedicated folders"
        echo "- **Clean Root**: Only 6 essential files in .github/"
        echo "- **Dynamic Content**: Core files rewritten based on active mode"
        echo "- **Data Preservation**: All data preserved during mode switches"
        echo "- **Enterprise Ready**: Full task orchestration when needed"
        echo ""
        echo "---"
        echo "*Project map automatically updated by mode-manager.sh*"
    } > "$PROJECT_MAP"
    
    success "✓ PROJECT_MAP.md updated for $mode mode"
}

# Show clean system status
show_status() {
    # Check for first-time setup
    if is_first_time_setup; then
        echo -e "${CYAN}╭─────────────────────────────────────────────────────────────────╮${NC}"
        echo -e "${CYAN}│                    🎯 M5 PROJECT SYSTEM                         │${NC}"
        echo -e "${CYAN}│                   First-Time Setup Required                     │${NC}"
        echo -e "${CYAN}╰─────────────────────────────────────────────────────────────────╯${NC}"
        echo
        echo -e "${YELLOW}⚠️  CHAT-BASED SETUP REQUIRED${NC}"
        echo "This system needs to be configured through Copilot chat conversation."
        echo "Please ask your Copilot agent about project setup to begin."
        echo
        echo -e "${BLUE}💡 Quick start: Ask 'Help me set up this project'${NC}"
        return 0
    fi
    
    local current_mode=$(get_current_mode)
    
    echo -e "${PURPLE}════════════════════════════════════════${NC}"
    echo -e "${PURPLE}     M5 CLEAN MODE SYSTEM STATUS${NC}"
    echo -e "${PURPLE}════════════════════════════════════════${NC}"
    echo ""
    
    echo -e "${BLUE}Current Active Mode:${NC} ${GREEN}$current_mode${NC}"
    echo ""
    
    echo -e "${CYAN}📁 CLEAN ROOT STRUCTURE:${NC}"
    echo "  ✓ 6 core files only in .github/"
    echo "  ✓ Mode-specific files in modes/ folders"
    echo "  ✓ Complete visual separation"
    echo ""
    
    echo -e "${CYAN}📂 VISIBLE FILES:${NC}"
    ls -1 "$PROJECT_ROOT" | grep -v "modes\|backups" | while read file; do
        echo "  • $file"
    done
    echo ""
    
    case "$current_mode" in
        "simplified")
            echo -e "${YELLOW}🔧 SIMPLIFIED MODE ACTIVE:${NC}"
            echo "  ✓ Basic task management"
            echo "  ✓ Essential automation only"
            echo "  ✓ Clean, simple structure"
            echo "  ✓ Enterprise features hidden but preserved"
            echo ""
            echo -e "${BLUE}Available Scripts:${NC}"
            echo "  • ./modes/simplified/scripts/setup_task_system.sh"
            echo "  • ./modes/simplified/scripts/validate_security.sh"
            echo "  • ./modes/simplified/scripts/mandatory_cleanup.sh"
            ;;
        "enterprise")
            echo -e "${YELLOW}🚀 ENTERPRISE MODE ACTIVE:${NC}"
            echo "  ✓ Epic task orchestration (10-500+ hours)"
            echo "  ✓ Cross-machine synchronization"
            echo "  ✓ Priority interrupt system"
            echo "  ✓ Advanced monitoring & auto-save"
            echo "  ✓ Simplified data preserved but hidden"
            echo ""
            echo -e "${BLUE}Available Scripts:${NC}"
            echo "  • ./modes/enterprise/automation/task-management.sh"
            echo "  • ./modes/enterprise/automation/task-management/scripts/*"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}Switch Mode:${NC} ./mode-manager.sh [simplified|enterprise]"
    echo -e "${GREEN}All data preserved during mode switches${NC}"
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════${NC}"
}

# Generic mode switch function
switch_mode() {
    local target_mode="$1"
    local current_mode=$(get_current_mode)
    
    if [ "$current_mode" = "$target_mode" ]; then
        warning "Already in $target_mode mode"
        return 0
    fi
    
    log "Switching to $(echo $target_mode | tr '[:lower:]' '[:upper:]') mode..."
    echo -e "${PURPLE}═══════════════════════════════════════${NC}"
    echo -e "${PURPLE}     ACTIVATING $(echo $target_mode | tr '[:lower:]' '[:upper:]') MODE${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════${NC}"
    
    # Create backup
    create_switch_backup
    
    # 1. REWRITE CORE FILES for target mode
    rewrite_core_files "$target_mode"
    
    # 2. UPDATE MODE in config
    set_mode "$target_mode"
    
    # 3. Mark setup as complete if this was first-time setup
    if is_first_time_setup; then
        mark_setup_complete
        echo -e "${GREEN}🎉 First-time setup completed!${NC}"
        echo
    fi
    
    echo ""
    success "✅ $(echo $target_mode | tr '[:lower:]' '[:upper:]') MODE ACTIVATED"
    echo ""
    echo -e "${GREEN}📁 Core Files Rewritten:${NC}"
    echo "   • copilot-instructions.md → $(echo $target_mode | sed 's/./\U&/') content"
    echo "   • project-rules.md → $(echo $target_mode | sed 's/./\U&/') rules"
    echo "   • PROJECT_MAP.md → Current structure"
    echo ""
    
    case "$target_mode" in
        "simplified")
            echo -e "${GREEN}🎯 Available Scripts:${NC}"
            echo "   • ./modes/simplified/scripts/setup_task_system.sh"
            echo "   • ./modes/simplified/scripts/validate_security.sh"
            echo "   • ./modes/simplified/scripts/mandatory_cleanup.sh"
            echo ""
            echo -e "${BLUE}💡 Switch to Enterprise:${NC} ./mode-manager.sh enterprise"
            ;;
        "enterprise")
            echo -e "${GREEN}🚀 Enterprise Features Available:${NC}"
            echo "   • Epic task orchestration (10-500+ hours)"
            echo "   • Cross-machine synchronization"
            echo "   • Priority interrupt system"
            echo "   • Advanced monitoring & auto-save"
            echo ""
            echo -e "${BLUE}💡 Switch to Simplified:${NC} ./mode-manager.sh simplified"
            ;;
    esac
}

# Main command handling
main() {
    # Normal command processing
    case "${1:-status}" in
        "simplified")
            switch_mode "simplified"
            ;;
        "enterprise")
            switch_mode "enterprise"
            ;;
        "status")
            show_status  # This will check for first-time setup internally
            ;;
        "switch")
            # Handle switch with argument: ./mode-manager.sh switch [simplified|enterprise]
            if [ -n "$2" ]; then
                switch_mode "$2"
            else
                error "Switch command requires mode argument: simplified or enterprise"
                exit 1
            fi
            ;;
        "help")
            echo ""
            echo "M5 Project Mode Manager"
            echo "======================"
            echo ""
            echo "Usage: ./mode-manager.sh [command]"
            echo ""
            echo "Commands:"
            echo "  simplified    Switch to simplified mode (basic automation)"
            echo "  enterprise    Switch to enterprise mode (full task management)"
            echo "  status        Show current mode and capabilities"
            echo "  help          Show this help message"
            echo ""
            echo "Modes:"
            echo "  SIMPLIFIED    Best for: Small-medium projects, single machine"
            echo "  ENTERPRISE    Best for: Large projects, multi-machine, complex workflows"
            echo ""
            echo "Features:"
            echo "  • Complete visual separation between modes"
            echo "  • Core files rewritten based on active mode"
            echo "  • All data preserved during mode switches"
            echo "  • Clean root structure with only essential files"
            ;;
        *)
            error "Unknown command: $1"
            echo "Use './mode-manager.sh help' for available commands"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"
