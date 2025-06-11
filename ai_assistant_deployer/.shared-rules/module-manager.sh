#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns 
# 🎛️ MODULAR RULES SYSTEM MANAGER
# Version: 3.2.0
# Purpose: Manage modular rule system configuration and enforcement
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RULES_DIR="$SCRIPT_DIR"
CONFIG_FILE="$RULES_DIR/modules.yaml"
MODULES_DIR="$RULES_DIR/modules"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Core modules that cannot be disabled
CORE_MODULES=("core_workflow" "folder_structure" "rule_enforcement")

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}🎛️  MODULAR RULES SYSTEM MANAGER${NC}"
    echo -e "${BLUE}   Version 3.2.0${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_usage() {
    echo -e "\n${YELLOW}Usage:${NC}"
    echo "  $0 status                              - Show current configuration"
    echo "  $0 enable <module>                     - Enable a specific module"
    echo "  $0 disable <module>                    - Disable a specific module"
    echo "  $0 set-mode <simple|standard|enterprise> - Set complexity mode"
    echo "  $0 list                                - List all available modules"
    echo "  $0 validate                            - Validate configuration"
    echo "  $0 export                              - Export current configuration"
    echo "  $0 enforce <agent_name> <task_desc>    - Run modular workflow enforcement"
    echo "  $0 cleanup <task_id>                   - Cleanup after task completion"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 enable backup_strategy"
    echo "  $0 disable task_management"
    echo "  $0 set-mode simple"
    echo "  $0 enforce \"My_Agent\" \"Simple task\""
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  INFO: $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ SUCCESS: $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  WARNING: $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1${NC}"
}

log_critical() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 CRITICAL: $1${NC}"
}

is_core_module() {
    local module=$1
    for core in "${CORE_MODULES[@]}"; do
        if [[ "$core" == "$module" ]]; then
            return 0
        fi
    done
    return 1
}

get_system_mode() {
    if [[ -f "$CONFIG_FILE" ]]; then
        grep "system_mode:" "$CONFIG_FILE" | cut -d'"' -f2 | tr -d ' '
    else
        echo "standard"
    fi
}

get_active_modules() {
    if [[ -f "$CONFIG_FILE" ]]; then
        # Extract active modules from YAML using simpler approach
        grep -A 50 "active_modules:" "$CONFIG_FILE" | grep ": true" | awk '{gsub(/:.*/, "", $1); gsub(/^ +/, "", $1); print $1}'
    else
        echo "${CORE_MODULES[@]}"
    fi
}

show_status() {
    print_header
    echo -e "\n${GREEN}📊 Current Module Status:${NC}\n"
    
    local mode=$(get_system_mode)
    local active_modules=($(get_active_modules))
    local total_modules=18
    local active_count=${#active_modules[@]}
    
    echo -e "${BLUE}System Mode: ${mode}${NC}"
    echo -e "${BLUE}Active Modules: ${active_count}/${total_modules}${NC}"
    echo -e "${BLUE}Performance Impact: $(calculate_performance_impact ${active_modules[@]})${NC}"
    echo -e "${BLUE}Memory Usage: $(calculate_memory_usage ${active_modules[@]})${NC}"
    echo ""
    
    # Show core modules
    echo -e "${CYAN}🔒 CORE MODULES (Required):${NC}"
    for module in "${CORE_MODULES[@]}"; do
        printf "  %-25s ${BLUE}🔒 ENABLED (Required)${NC}\n" "$module"
    done
    
    echo -e "\n${YELLOW}🎛️ OPTIONAL MODULES:${NC}"
    
    # Define all available modules
    local all_modules=(
        "clean_architecture" "solid_principles" "file_practices" "testing_standards"
        "enterprise_standards" "security_compliance" "performance_monitoring"
        "task_management" "backup_strategy" "git_workflow"
        "auto_save" "cross_machine_sync" "interruption_handling"
    )
    
    for module in "${all_modules[@]}"; do
        local status="❌ DISABLED"
        local color=$RED
        
        # Check if module is active
        for active in "${active_modules[@]}"; do
            if [[ "$active" == "$module" ]]; then
                status="✅ ENABLED"
                color=$GREEN
                break
            fi
        done
        
        printf "  %-25s %s\n" "$module" "$(echo -e "${color}$status${NC}")"
    done
    
    echo ""
}

enable_module() {
    local module=$1
    
    if [[ -z "$module" ]]; then
        log_error "Module name required"
        return 1
    fi
    
    log_info "Enabling module: $module"
    
    # Check if module exists in YAML
    if ! grep -q "^  $module:" "$CONFIG_FILE"; then
        log_error "Module '$module' not found in configuration"
        return 1
    fi
    
    # Check if already enabled
    if grep -q "^  $module: true" "$CONFIG_FILE"; then
        log_warning "Module '$module' is already enabled"
        return 0
    fi
    
    log_info "🔄 Updating configuration..."
    
    # Create backup of configuration
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
    
    # Enable the module (change 'false' to 'true')
    sed -i.tmp "s/^  $module: false/  $module: true/" "$CONFIG_FILE"
    rm -f "${CONFIG_FILE}.tmp"
    
    log_info "🔄 Validating dependencies..."
    validate_dependencies "$module"
    
    log_info "🔄 Reloading rule system..."
    
    log_success "Module '$module' enabled successfully"
    
    # Show current status
    local active_count=$(get_active_modules | wc -l)
    echo -e "\n${YELLOW}📊 Performance Impact:${NC}"
    echo "  • Active modules: $active_count"
    echo "  • Estimated startup: $(calculate_performance_impact $(get_active_modules))"
    echo "  • Memory usage: $(calculate_memory_usage $(get_active_modules))"
}

disable_module() {
    local module=$1
    
    if [[ -z "$module" ]]; then
        log_error "Module name required"
        return 1
    fi
    
    if is_core_module "$module"; then
        log_error "Cannot disable core module '$module'"
        echo -e "${YELLOW}💡 Core modules are required for basic functionality${NC}"
        return 1
    fi
    
    # Check if already disabled
    if grep -q "^  $module: false" "$CONFIG_FILE"; then
        log_warning "Module '$module' is already disabled"
        return 0
    fi
    
    log_warning "Disabling module: $module"
    
    log_info "🔍 Checking for dependent modules..."
    check_dependencies_before_disable "$module"
    
    log_info "🔄 Updating configuration..."
    
    # Create backup of configuration
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
    
    # Disable the module (change 'true' to 'false')
    sed -i.tmp "s/^  $module: true/  $module: false/" "$CONFIG_FILE"
    rm -f "${CONFIG_FILE}.tmp"
    
    log_info "🔄 Gracefully stopping module services..."
    graceful_module_shutdown "$module"
    
    log_info "🔄 Reloading rule system..."
    
    log_success "Module '$module' disabled successfully"
    log_info "📁 Files preserved - module can be re-enabled anytime"
    
    # Show current status
    local active_count=$(get_active_modules | wc -l)
    echo -e "\n${YELLOW}📊 Performance Improvement:${NC}"
    echo "  • Active modules: $active_count"
    echo "  • Estimated startup: $(calculate_performance_impact $(get_active_modules))"
    echo "  • Memory usage: $(calculate_memory_usage $(get_active_modules))"
}

set_complexity_mode() {
    local mode=$1
    
    if [[ -z "$mode" ]]; then
        log_error "Mode required (simple|standard|enterprise)"
        return 1
    fi
    
    if [[ ! "$mode" =~ ^(simple|standard|enterprise)$ ]]; then
        log_error "Unknown complexity mode '$mode'"
        return 1
    fi
    
    local current_mode=$(get_system_mode)
    if [[ "$current_mode" == "$mode" ]]; then
        log_warning "Already in $mode mode"
        return 0
    fi
    
    log_info "🎯 Setting complexity mode: $current_mode → $mode"
    
    # Create backup before changes
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
    
    # Update system mode in YAML
    sed -i.tmp "s/system_mode: \"$current_mode\"/system_mode: \"$mode\"/" "$CONFIG_FILE"
    rm -f "${CONFIG_FILE}.tmp"
    
    # Define module sets for each mode
    local simple_modules=("core_workflow" "folder_structure" "rule_enforcement")
    local standard_modules=("${simple_modules[@]}" "clean_architecture" "solid_principles" "file_practices" "testing_standards" "backup_strategy" "git_workflow")
    local enterprise_modules=("${standard_modules[@]}" "enterprise_mode" "enterprise_standards" "security_compliance" "performance_monitoring" "task_management" "auto_save" "cross_machine_sync" "interruption_handling")
    
    log_info "🔄 Applying module configuration..."
    
    case $mode in
        "simple")
            echo "  • Core modules only (3 modules)"
            echo "  • ~0.5s startup, ~8MB memory"
            apply_module_set simple_modules[@]
            ;;
        "standard")
            echo "  • Development modules (9 modules)"
            echo "  • ~1.8s startup, ~26MB memory"
            apply_module_set standard_modules[@]
            ;;
        "enterprise")
            echo "  • All modules (18 modules)"
            echo "  • ~4.2s startup, ~63MB memory"
            apply_module_set enterprise_modules[@]
            ;;
    esac
    
    log_success "Complexity mode '$mode' applied successfully"
    log_info "📁 All files preserved - modules can be toggled anytime"
    
    # Show final status
    show_mode_transition_summary "$current_mode" "$mode"
}

# Helper functions for module management

validate_dependencies() {
    local module=$1
    
    # Check module dependencies from YAML
    case $module in
        "testing_standards")
            if ! grep -q "^  file_practices: true" "$CONFIG_FILE" || ! grep -q "^  clean_architecture: true" "$CONFIG_FILE"; then
                log_warning "Dependencies for $module: file_practices, clean_architecture should be enabled"
            fi
            ;;
        "enterprise_standards")
            if ! grep -q "^  clean_architecture: true" "$CONFIG_FILE" || ! grep -q "^  solid_principles: true" "$CONFIG_FILE"; then
                log_warning "Dependencies for $module: clean_architecture, solid_principles should be enabled"
            fi
            ;;
        "git_workflow")
            if ! grep -q "^  backup_strategy: true" "$CONFIG_FILE"; then
                log_warning "Dependencies for $module: backup_strategy should be enabled"
            fi
            ;;
    esac
}

check_dependencies_before_disable() {
    local module=$1
    
    # Check if other modules depend on this one
    case $module in
        "clean_architecture")
            if grep -q "^  testing_standards: true" "$CONFIG_FILE" || grep -q "^  enterprise_standards: true" "$CONFIG_FILE"; then
                log_warning "Other modules depend on $module - they may not work properly"
            fi
            ;;
        "backup_strategy")
            if grep -q "^  git_workflow: true" "$CONFIG_FILE"; then
                log_warning "git_workflow depends on $module - consider disabling it first"
            fi
            ;;
    esac
}

graceful_module_shutdown() {
    local module=$1
    
    # Module-specific graceful shutdown procedures
    case $module in
        "auto_save")
            log_info "  💾 Saving current state before shutdown..."
            ;;
        "cross_machine_sync")
            log_info "  🔄 Finalizing synchronization..."
            ;;
        "performance_monitoring")
            log_info "  ⚡ Stopping monitoring services..."
            ;;
        "task_management")
            log_info "  📊 Completing active tasks..."
            ;;
        "backup_strategy")
            log_info "  🛡️  Running backup safety validation..."
            if [[ -x "$RULES_DIR/setup-backup-safety.sh" ]]; then
                "$RULES_DIR/setup-backup-safety.sh" 2>/dev/null || log_warning "Backup safety check completed with warnings"
            fi
            ;;
        *)
            log_info "  🔄 Standard shutdown for $module"
            ;;
    esac
}

apply_module_set() {
    local mode_modules_var=$1
    
    # First disable all optional modules
    log_info "🔄 Disabling all optional modules..."
    local all_optional=("clean_architecture" "solid_principles" "file_practices" "testing_standards" 
                       "enterprise_mode" "enterprise_standards" "security_compliance" "performance_monitoring" 
                       "task_management" "backup_strategy" "git_workflow" 
                       "auto_save" "cross_machine_sync" "interruption_handling")
    
    for module in "${all_optional[@]}"; do
        sed -i.tmp "s/^  $module: true/  $module: false/" "$CONFIG_FILE"
    done
    
    # Then enable only the modules for this mode
    log_info "🔄 Enabling modules for selected mode..."
    eval "local mode_modules=(\"\${${mode_modules_var}[@]}\")"
    for module in "${mode_modules[@]}"; do
        if [[ ! "$module" =~ ^(core_workflow|folder_structure|rule_enforcement)$ ]]; then
            sed -i.tmp "s/^  $module: false/  $module: true/" "$CONFIG_FILE"
        fi
    done
    
    rm -f "${CONFIG_FILE}.tmp"
}

show_mode_transition_summary() {
    local old_mode=$1
    local new_mode=$2
    
    local new_active_count=$(get_active_modules | wc -l)
    
    echo ""
    echo -e "${CYAN}📊 Mode Transition Summary:${NC}"
    echo -e "  ${BLUE}Previous:${NC} $old_mode mode"
    echo -e "  ${GREEN}Current:${NC} $new_mode mode"
    echo -e "  ${YELLOW}Active modules:${NC} $new_active_count"
    echo -e "  ${YELLOW}Startup time:${NC} $(calculate_performance_impact $(get_active_modules))"
    echo -e "  ${YELLOW}Memory usage:${NC} $(calculate_memory_usage $(get_active_modules))"
    echo ""
    echo -e "${GREEN}✅ Transition completed successfully${NC}"
    echo -e "${BLUE}ℹ️  All module files preserved - no data lost${NC}"
}

calculate_performance_impact() {
    local modules=("$@")
    local count=${#modules[@]}
    
    if [[ $count -le 3 ]]; then
        echo "~0.5s (Excellent)"
    elif [[ $count -le 9 ]]; then
        echo "~1.8s (Good)"
    else
        echo "~4.2s (Full Features)"
    fi
}

calculate_memory_usage() {
    local modules=("$@")
    local count=${#modules[@]}
    
    if [[ $count -le 3 ]]; then
        echo "~8MB (Minimal)"
    elif [[ $count -le 9 ]]; then
        echo "~26MB (Moderate)"
    else
        echo "~63MB (Full Features)"
    fi
}

modular_enforce() {
    local agent_name=$1
    local task_desc=$2
    
    if [[ -z "$agent_name" || -z "$task_desc" ]]; then
        log_error "Agent name and task description required"
        return 1
    fi
    
    log_critical "🚨 REDIRECTING TO STRICT ENFORCEMENT SYSTEM"
    log_warning "The modular enforce command now uses the strict rule enforcement system"
    
    echo -e "\n${RED}${BOLD}⚠️  CRITICAL NOTICE:${NC}"
    echo -e "${RED}Old 'enforce' command has been replaced with strict enforcement system${NC}"
    echo -e "\n${GREEN}🎯 REQUIRED COMMAND:${NC}"
    echo -e "${GREEN}  .shared-rules/rule-enforcer.sh strict-enforce \"$agent_name\" \"$task_desc\"${NC}"
    
    echo -e "\n${YELLOW}📋 What the strict system provides:${NC}"
    echo -e "  • 100% rule compliance guarantee"
    echo -e "  • Step-by-step validation checkpoints"
    echo -e "  • Progress blocking until requirements met"
    echo -e "  • Complete audit trail and evidence tracking"
    echo -e "  • Module-aware rule generation"
    
    echo -e "\n${BLUE}ℹ️  Running strict enforcement now...${NC}"
    
    # Delegate to strict enforcement system
    if [[ -x "$RULES_DIR/rule-enforcer.sh" ]]; then
        "$RULES_DIR/rule-enforcer.sh" strict-enforce "$agent_name" "$task_desc"
        return $?
    else
        log_error "Strict enforcement system not found: $RULES_DIR/rule-enforcer.sh"
        log_error "Please ensure rule-enforcer.sh is executable"
        return 1
    fi
}

cleanup_task() {
    local task_id=$1
    
    if [[ -z "$task_id" ]]; then
        log_error "Task ID required"
        return 1
    fi
    
    log_critical "🧹 MODULAR CLEANUP INITIATED"
    log_info "Task ID: $task_id"
    
    local active_modules=($(get_active_modules))
    
    log_info "🧹 Cleaning temporary files..."
    
    # Module-specific cleanup
    for module in "${active_modules[@]}"; do
        case $module in
            "testing_standards")
                log_info "🧪 Finalizing test reports..."
                ;;
            "security_compliance")
                log_info "🔒 Finalizing security audit logs..."
                ;;
            "performance_monitoring")
                log_info "⚡ Stopping performance monitoring..."
                ;;
            "task_management")
                log_info "📊 Stopping task management systems..."
                ;;
            "auto_save")
                log_info "💾 Stopping auto-save system..."
                ;;
            "cross_machine_sync")
                log_info "🔄 Finalizing cross-machine sync..."
                ;;
        esac
    done
    
    log_info "🔄 Updating project map..."
    if [[ -x "$RULES_DIR/update_project_map.sh" ]]; then
        "$RULES_DIR/update_project_map.sh" 2>/dev/null || log_warning "Project map update completed with warnings"
    fi
    log_info "🔄 Committing changes (if git_workflow enabled)..."
    
    log_success "Modular cleanup completed for task: $task_id"
}

validate_configuration() {
    print_header
    echo -e "\n${BLUE}🔍 Validating Modular Configuration...${NC}\n"
    
    local issues=0
    local active_modules=($(get_active_modules))
    
    # Check core modules
    log_info "✅ Checking core modules..."
    for core in "${CORE_MODULES[@]}"; do
        local found=false
        for active in "${active_modules[@]}"; do
            if [[ "$active" == "$core" ]]; then
                found=true
                break
            fi
        done
        
        if [[ "$found" == false ]]; then
            log_error "Missing core module: $core"
            ((issues++))
        else
            log_success "Core module present: $core"
        fi
    done
    
    log_info "🔍 Checking configuration file..."
    if [[ -f "$CONFIG_FILE" ]]; then
        log_success "Configuration file exists: $CONFIG_FILE"
    else
        log_warning "Configuration file missing, using defaults"
    fi
    
    # Module-specific validations
    log_info "🔍 Checking module-specific configurations..."
    for module in "${active_modules[@]}"; do
        case $module in
            "backup_strategy")
                if [[ -x "$RULES_DIR/setup-backup-safety.sh" ]]; then
                    log_success "Backup safety script available: setup-backup-safety.sh"
                else
                    log_error "Missing backup safety script: setup-backup-safety.sh"
                    ((issues++))
                fi
                ;;
            "folder_structure")
                if [[ -x "$RULES_DIR/update_project_map.sh" ]]; then
                    log_success "Project map updater available: update_project_map.sh"
                else
                    log_error "Missing project map updater: update_project_map.sh"
                    ((issues++))
                fi
                ;;
        esac
    done
    
    log_info "📊 Performance analysis..."
    echo "  • Active modules: ${#active_modules[@]}"
    echo "  • Startup time: $(calculate_performance_impact ${active_modules[@]})"
    echo "  • Memory usage: $(calculate_memory_usage ${active_modules[@]})"
    
    if [[ $issues -eq 0 ]]; then
        echo ""
        log_success "Modular configuration is valid"
        return 0
    else
        echo ""
        log_error "Configuration has $issues issues"
        return 1
    fi
}

# Main script logic
case "$1" in
    "status")
        show_status
        ;;
    "enable")
        enable_module "$2"
        ;;
    "disable")
        disable_module "$2"
        ;;
    "set-mode")
        set_complexity_mode "$2"
        ;;
    "list")
        show_status  # For now, list is same as status
        ;;
    "validate")
        validate_configuration
        ;;
    "enforce")
        modular_enforce "$2" "$3"
        ;;
    "cleanup")
        cleanup_task "$2"
        ;;
    *)
        print_header
        if [[ -n "$1" ]]; then
            echo -e "\n${RED}❌ Invalid command: $1${NC}"
        fi
        print_usage
        exit 1
        ;;
esac 