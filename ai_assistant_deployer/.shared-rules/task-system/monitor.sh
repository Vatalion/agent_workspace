#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns 
# Task Management System - Real-time Monitoring Script
# Version: 1.0.0
# Purpose: Monitor task progress, epic status, and system health
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/.tasks"
EPICS_DIR="$TASKS_DIR/epics"
LOG_FILE="$SCRIPT_DIR/logs/monitor.log"
MONITOR_CONFIG="$SCRIPT_DIR/config/monitor.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Initialize monitoring system
initialize_monitor() {
    echo -e "${BLUE}🚀 TASK MANAGEMENT SYSTEM MONITOR${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""
    
    # Create logs directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log_message "INFO" "Task Management Monitor started"
    log_message "INFO" "Project root: $PROJECT_ROOT"
    log_message "INFO" "Tasks directory: $TASKS_DIR"
}

# Get task statistics
get_task_stats() {
    local planning_count=0
    local development_count=0  
    local execution_count=0
    local completion_count=0
    local total_count=0
    
    if [[ -d "$TASKS_DIR/1_planning" ]]; then
        planning_count=$(find "$TASKS_DIR/1_planning" -name "*.json" -type f | wc -l | tr -d ' ')
    fi
    
    if [[ -d "$TASKS_DIR/2_development" ]]; then
        development_count=$(find "$TASKS_DIR/2_development" -name "*.json" -type f | wc -l | tr -d ' ')
    fi
    
    if [[ -d "$TASKS_DIR/3_execution/active" ]]; then
        execution_count=$(find "$TASKS_DIR/3_execution/active" -name "*.json" -type f | wc -l | tr -d ' ')
    fi
    
    if [[ -d "$TASKS_DIR/4_completion/completed" ]]; then
        completion_count=$(find "$TASKS_DIR/4_completion/completed" -name "*.json" -type f | wc -l | tr -d ' ')
    fi
    
    total_count=$((planning_count + development_count + execution_count + completion_count))
    
    echo -e "${CYAN}📊 TASK STATISTICS${NC}"
    echo -e "${CYAN}==================${NC}"
    echo -e "Planning:    ${YELLOW}$planning_count${NC} tasks"
    echo -e "Development: ${BLUE}$development_count${NC} tasks"  
    echo -e "Execution:   ${PURPLE}$execution_count${NC} tasks"
    echo -e "Completed:   ${GREEN}$completion_count${NC} tasks"
    echo -e "Total:       ${CYAN}$total_count${NC} tasks"
    echo ""
}

# Get epic statistics
get_epic_stats() {
    local active_epics=0
    local completed_epics=0
    local total_epics=0
    
    if [[ -d "$EPICS_DIR/active" ]]; then
        active_epics=$(find "$EPICS_DIR/active" -maxdepth 1 -type d ! -path "$EPICS_DIR/active" | wc -l | tr -d ' ')
    fi
    
    if [[ -d "$EPICS_DIR/completed" ]]; then
        completed_epics=$(find "$EPICS_DIR/completed" -maxdepth 1 -type d ! -path "$EPICS_DIR/completed" | wc -l | tr -d ' ')
    fi
    
    total_epics=$((active_epics + completed_epics))
    
    echo -e "${PURPLE}🎯 EPIC STATISTICS${NC}"
    echo -e "${PURPLE}==================${NC}"
    echo -e "Active:    ${YELLOW}$active_epics${NC} epics"
    echo -e "Completed: ${GREEN}$completed_epics${NC} epics"
    echo -e "Total:     ${CYAN}$total_epics${NC} epics"
    echo ""
}

# Show active tasks
show_active_tasks() {
    echo -e "${GREEN}🔥 ACTIVE TASKS${NC}"
    echo -e "${GREEN}===============${NC}"
    
    if [[ -d "$TASKS_DIR/3_execution/active" ]]; then
        local active_tasks=()
        while IFS= read -r -d '' task_file; do
            active_tasks+=("$task_file")
        done < <(find "$TASKS_DIR/3_execution/active" -name "*.json" -type f -print0)
        
        if [[ ${#active_tasks[@]} -eq 0 ]]; then
            echo -e "${YELLOW}No active tasks found${NC}"
        else
            for task_file in "${active_tasks[@]}"; do
                local task_name=$(basename "$task_file" .json)
                local task_desc=""
                local task_agent=""
                local task_started=""
                
                if command -v jq >/dev/null 2>&1; then
                    task_desc=$(jq -r '.task_description // "No description"' "$task_file" 2>/dev/null || echo "No description")
                    task_agent=$(jq -r '.agent_name // "Unknown"' "$task_file" 2>/dev/null || echo "Unknown")
                    task_started=$(jq -r '.created_at // "Unknown"' "$task_file" 2>/dev/null || echo "Unknown")
                else
                    task_desc="Task file parsing requires jq"
                fi
                
                echo -e "  ${CYAN}●${NC} $task_name"
                echo -e "    Agent: ${BLUE}$task_agent${NC}"
                echo -e "    Started: ${YELLOW}$task_started${NC}"
                echo -e "    Description: $task_desc"
                echo ""
            done
        fi
    else
        echo -e "${YELLOW}Active tasks directory not found${NC}"
    fi
    echo ""
}

# Show active epics
show_active_epics() {
    echo -e "${PURPLE}🎯 ACTIVE EPICS${NC}"
    echo -e "${PURPLE}===============${NC}"
    
    if [[ -d "$EPICS_DIR/active" ]]; then
        local active_epics=()
        while IFS= read -r -d '' epic_dir; do
            active_epics+=("$epic_dir")
        done < <(find "$EPICS_DIR/active" -maxdepth 1 -type d ! -path "$EPICS_DIR/active" -print0)
        
        if [[ ${#active_epics[@]} -eq 0 ]]; then
            echo -e "${YELLOW}No active epics found${NC}"
        else
            for epic_dir in "${active_epics[@]}"; do
                local epic_name=$(basename "$epic_dir")
                local epic_desc=""
                local epic_progress=""
                local epic_started=""
                
                if [[ -f "$epic_dir/epic.json" ]] && command -v jq >/dev/null 2>&1; then
                    epic_desc=$(jq -r '.epic_description // "No description"' "$epic_dir/epic.json" 2>/dev/null || echo "No description")
                    epic_progress=$(jq -r '.progress_percentage // "0"' "$epic_dir/epic.json" 2>/dev/null || echo "0")
                    epic_started=$(jq -r '.created_at // "Unknown"' "$epic_dir/epic.json" 2>/dev/null || echo "Unknown")
                else
                    epic_desc="Epic file parsing requires jq"
                    epic_progress="0"
                fi
                
                echo -e "  ${PURPLE}●${NC} $epic_name"
                echo -e "    Progress: ${GREEN}$epic_progress%${NC}"
                echo -e "    Started: ${YELLOW}$epic_started${NC}"
                echo -e "    Description: $epic_desc"
                echo ""
            done
        fi
    else
        echo -e "${YELLOW}Active epics directory not found${NC}"
    fi
    echo ""
}

# Check system health
check_system_health() {
    echo -e "${RED}🔍 SYSTEM HEALTH CHECK${NC}"
    echo -e "${RED}=====================${NC}"
    
    local health_score=100
    local issues=()
    
    # Check if tasks directory exists
    if [[ ! -d "$TASKS_DIR" ]]; then
        issues+=("Tasks directory missing")
        health_score=$((health_score - 20))
    fi
    
    # Check required subdirectories
    local required_dirs=("1_planning" "2_development" "3_execution/active" "3_execution/stalled" "4_completion/completed" "4_completion/archived")
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$TASKS_DIR/$dir" ]]; then
            issues+=("Missing directory: $dir")
            health_score=$((health_score - 10))
        fi
    done
    
    # Check for stalled tasks (active for more than 24 hours)
    if [[ -d "$TASKS_DIR/3_execution/active" ]]; then
        local stalled_count=0
        local current_time=$(date +%s)
        
        while IFS= read -r -d '' task_file; do
            if command -v jq >/dev/null 2>&1; then
                local created_at=$(jq -r '.created_at // ""' "$task_file" 2>/dev/null)
                if [[ -n "$created_at" ]]; then
                    local task_time=$(date -j -f "%Y-%m-%d %H:%M:%S" "$created_at" +%s 2>/dev/null || echo "0")
                    local age_hours=$(( (current_time - task_time) / 3600 ))
                    if [[ $age_hours -gt 24 ]]; then
                        stalled_count=$((stalled_count + 1))
                    fi
                fi
            fi
        done < <(find "$TASKS_DIR/3_execution/active" -name "*.json" -type f -print0)
        
        if [[ $stalled_count -gt 0 ]]; then
            issues+=("$stalled_count stalled tasks (>24h active)")
            health_score=$((health_score - 5 * stalled_count))
        fi
    fi
    
    # Check for jq availability
    if ! command -v jq >/dev/null 2>&1; then
        issues+=("jq not available - JSON parsing limited")
        health_score=$((health_score - 15))
    fi
    
    # Display health status
    if [[ $health_score -ge 90 ]]; then
        echo -e "Health Score: ${GREEN}$health_score/100${NC} - ${GREEN}EXCELLENT${NC}"
    elif [[ $health_score -ge 70 ]]; then
        echo -e "Health Score: ${YELLOW}$health_score/100${NC} - ${YELLOW}GOOD${NC}"
    elif [[ $health_score -ge 50 ]]; then
        echo -e "Health Score: ${YELLOW}$health_score/100${NC} - ${YELLOW}FAIR${NC}"
    else
        echo -e "Health Score: ${RED}$health_score/100${NC} - ${RED}POOR${NC}"
    fi
    
    if [[ ${#issues[@]} -gt 0 ]]; then
        echo -e "${RED}Issues found:${NC}"
        for issue in "${issues[@]}"; do
            echo -e "  ${RED}✗${NC} $issue"
        done
    else
        echo -e "${GREEN}✓ No issues detected${NC}"
    fi
    echo ""
}

# Show recent activity
show_recent_activity() {
    echo -e "${BLUE}📈 RECENT ACTIVITY${NC}"
    echo -e "${BLUE}==================${NC}"
    
    local activity_files=()
    
    # Collect recent task files
    if [[ -d "$TASKS_DIR" ]]; then
        while IFS= read -r -d '' file; do
            activity_files+=("$file")
        done < <(find "$TASKS_DIR" -name "*.json" -type f -newerct "24 hours ago" -print0 2>/dev/null)
    fi
    
    if [[ ${#activity_files[@]} -eq 0 ]]; then
        echo -e "${YELLOW}No recent activity (last 24 hours)${NC}"
    else
        # Sort by modification time (newest first)
        local sorted_files=()
        while IFS= read -r -d '' file; do
            sorted_files+=("$file")
        done < <(printf '%s\0' "${activity_files[@]}" | xargs -0 ls -t)
        
        local count=0
        for file in "${sorted_files[@]}"; do
            if [[ $count -ge 10 ]]; then break; fi # Show only last 10
            
            local file_path=$(echo "$file" | sed "s|$TASKS_DIR/||")
            local mod_time=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$file" 2>/dev/null || echo "Unknown")
            
            echo -e "  ${GREEN}●${NC} $file_path"
            echo -e "    Modified: ${YELLOW}$mod_time${NC}"
            
            count=$((count + 1))
        done
    fi
    echo ""
}

# Real-time monitoring mode
real_time_monitor() {
    local refresh_interval=${1:-5}
    
    echo -e "${CYAN}🔄 Starting real-time monitoring (refresh every ${refresh_interval}s)${NC}"
    echo -e "${CYAN}Press Ctrl+C to stop${NC}"
    echo ""
    
    while true; do
        clear
        initialize_monitor
        get_task_stats
        get_epic_stats
        show_active_tasks
        show_active_epics
        check_system_health
        show_recent_activity
        
        echo -e "${CYAN}Last updated: $(date)${NC}"
        echo -e "${CYAN}Next refresh in ${refresh_interval}s...${NC}"
        
        sleep "$refresh_interval"
    done
}

# Display help
show_help() {
    echo "Task Management System Monitor"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  status                Show current system status (default)"
    echo "  stats                 Show task and epic statistics"
    echo "  active               Show active tasks and epics"
    echo "  health               Check system health"
    echo "  activity             Show recent activity"
    echo "  watch [INTERVAL]     Real-time monitoring (default: 5s)"
    echo "  help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Show status overview"
    echo "  $0 watch             # Start real-time monitoring"
    echo "  $0 watch 10          # Real-time monitoring with 10s refresh"
    echo "  $0 health            # Check system health only"
}

# Main function
main() {
    local command="${1:-status}"
    
    case "$command" in
        "status")
            initialize_monitor
            get_task_stats
            get_epic_stats
            show_active_tasks
            check_system_health
            ;;
        "stats")
            initialize_monitor
            get_task_stats
            get_epic_stats
            ;;
        "active")
            initialize_monitor
            show_active_tasks
            show_active_epics
            ;;
        "health")
            initialize_monitor
            check_system_health
            ;;
        "activity")
            initialize_monitor
            show_recent_activity
            ;;
        "watch")
            local interval="${2:-5}"
            real_time_monitor "$interval"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo -e "${RED}Error: Unknown command '$command'${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
