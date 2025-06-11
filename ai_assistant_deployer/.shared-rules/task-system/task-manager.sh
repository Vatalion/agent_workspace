#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns 
# Task Management System - Master Control Script
# Version: 1.0.0
# Purpose: Unified interface for all task management operations
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Display banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    TASK MANAGEMENT SYSTEM                       ║"
    echo "║                         Master Control                         ║"
    echo "║                        Version 1.0.0                          ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# Check system requirements
check_requirements() {
    local missing_tools=()
    
    # Check for required tools
    if ! command -v jq >/dev/null 2>&1; then
        missing_tools+=("jq")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        echo -e "${YELLOW}⚠️  Warning: Missing tools detected:${NC}"
        for tool in "${missing_tools[@]}"; do
            echo -e "  - $tool"
        done
        echo ""
        echo -e "${BLUE}To install missing tools on macOS:${NC}"
        echo -e "  brew install jq"
        echo ""
    fi
}

# System status overview
show_status() {
    echo -e "${BLUE}📊 SYSTEM STATUS${NC}"
    echo -e "${BLUE}=================${NC}"
    
    # Run monitor script in status mode
    if [[ -x "$SCRIPT_DIR/monitor.sh" ]]; then
        "$SCRIPT_DIR/monitor.sh" status
    else
        echo -e "${RED}Error: Monitor script not found or not executable${NC}"
    fi
}

# Task operations
task_operations() {
    local operation="$1"
    shift
    
    case "$operation" in
        "list")
            if [[ -x "$SCRIPT_DIR/complete-task.sh" ]]; then
                "$SCRIPT_DIR/complete-task.sh" list
            else
                echo -e "${RED}Error: Complete-task script not found${NC}"
            fi
            ;;
        "complete")
            if [[ -x "$SCRIPT_DIR/complete-task.sh" ]]; then
                "$SCRIPT_DIR/complete-task.sh" complete "$@"
            else
                echo -e "${RED}Error: Complete-task script not found${NC}"
            fi
            ;;
        "interactive")
            if [[ -x "$SCRIPT_DIR/complete-task.sh" ]]; then
                "$SCRIPT_DIR/complete-task.sh" interactive
            else
                echo -e "${RED}Error: Complete-task script not found${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Error: Unknown task operation '$operation'${NC}"
            echo "Available operations: list, complete, interactive"
            ;;
    esac
}

# Epic operations
epic_operations() {
    local operation="$1"
    shift
    
    case "$operation" in
        "create")
            if [[ -x "$SCRIPT_DIR/create-epic.sh" ]]; then
                "$SCRIPT_DIR/create-epic.sh" "$@"
            else
                echo -e "${RED}Error: Create-epic script not found${NC}"
            fi
            ;;
        "list")
            if [[ -x "$SCRIPT_DIR/monitor.sh" ]]; then
                "$SCRIPT_DIR/monitor.sh" active | grep -A 20 "ACTIVE EPICS"
            else
                echo -e "${RED}Error: Monitor script not found${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Error: Unknown epic operation '$operation'${NC}"
            echo "Available operations: create, list"
            ;;
    esac
}

# Monitoring operations
monitor_operations() {
    local operation="$1"
    shift
    
    if [[ -x "$SCRIPT_DIR/monitor.sh" ]]; then
        "$SCRIPT_DIR/monitor.sh" "$operation" "$@"
    else
        echo -e "${RED}Error: Monitor script not found${NC}"
    fi
}

# Cleanup operations
cleanup_operations() {
    local operation="$1"
    shift
    
    if [[ -x "$SCRIPT_DIR/cleanup.sh" ]]; then
        "$SCRIPT_DIR/cleanup.sh" "$operation" "$@"
    else
        echo -e "${RED}Error: Cleanup script not found${NC}"
    fi
}

# Initialize system
initialize_system() {
    echo -e "${BLUE}🚀 INITIALIZING TASK MANAGEMENT SYSTEM${NC}"
    echo -e "${BLUE}=======================================${NC}"
    
    if [[ -x "$SCRIPT_DIR/init.sh" ]]; then
        "$SCRIPT_DIR/init.sh"
    else
        echo -e "${RED}Error: Init script not found${NC}"
        echo "Please ensure init.sh exists and is executable"
    fi
}

# System maintenance
system_maintenance() {
    echo -e "${PURPLE}🔧 SYSTEM MAINTENANCE${NC}"
    echo -e "${PURPLE}=====================${NC}"
    
    echo -e "${BLUE}Running comprehensive cleanup...${NC}"
    if [[ -x "$SCRIPT_DIR/cleanup.sh" ]]; then
        "$SCRIPT_DIR/cleanup.sh" full
    else
        echo -e "${RED}Error: Cleanup script not found${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Generating system report...${NC}"
    if [[ -x "$SCRIPT_DIR/cleanup.sh" ]]; then
        "$SCRIPT_DIR/cleanup.sh" report
    fi
    
    echo ""
    echo -e "${GREEN}✓ System maintenance completed${NC}"
}

# Interactive menu
interactive_menu() {
    while true; do
        clear
        show_banner
        check_requirements
        
        echo -e "${CYAN}🎛️  INTERACTIVE MENU${NC}"
        echo -e "${CYAN}====================${NC}"
        echo ""
        echo -e "${GREEN}1)${NC} System Status"
        echo -e "${GREEN}2)${NC} Monitor Tasks (Real-time)"
        echo -e "${GREEN}3)${NC} List Active Tasks"
        echo -e "${GREEN}4)${NC} Complete Task (Interactive)"
        echo -e "${GREEN}5)${NC} Create Epic"
        echo -e "${GREEN}6)${NC} System Maintenance"
        echo -e "${GREEN}7)${NC} Initialize System"
        echo -e "${GREEN}8)${NC} View Logs"
        echo -e "${GREEN}9)${NC} Help"
        echo -e "${RED}0)${NC} Exit"
        echo ""
        echo -e "${YELLOW}Select an option [0-9]:${NC}"
        read -r choice
        
        case "$choice" in
            "1")
                clear
                show_status
                echo ""
                echo -e "${YELLOW}Press Enter to continue...${NC}"
                read -r
                ;;
            "2")
                clear
                echo -e "${CYAN}Starting real-time monitoring...${NC}"
                echo -e "${CYAN}Press Ctrl+C to return to menu${NC}"
                sleep 2
                monitor_operations "watch" 5
                ;;
            "3")
                clear
                task_operations "list"
                echo ""
                echo -e "${YELLOW}Press Enter to continue...${NC}"
                read -r
                ;;
            "4")
                clear
                task_operations "interactive"
                echo ""
                echo -e "${YELLOW}Press Enter to continue...${NC}"
                read -r
                ;;
            "5")
                clear
                echo -e "${BLUE}Creating new epic...${NC}"
                echo ""
                epic_operations "create"
                echo ""
                echo -e "${YELLOW}Press Enter to continue...${NC}"
                read -r
                ;;
            "6")
                clear
                system_maintenance
                echo ""
                echo -e "${YELLOW}Press Enter to continue...${NC}"
                read -r
                ;;
            "7")
                clear
                initialize_system
                echo ""
                echo -e "${YELLOW}Press Enter to continue...${NC}"
                read -r
                ;;
            "8")
                clear
                echo -e "${BLUE}📋 RECENT LOG ENTRIES${NC}"
                echo -e "${BLUE}=====================${NC}"
                if [[ -f "$SCRIPT_DIR/logs/monitor.log" ]]; then
                    tail -20 "$SCRIPT_DIR/logs/monitor.log"
                else
                    echo -e "${YELLOW}No log files found${NC}"
                fi
                echo ""
                echo -e "${YELLOW}Press Enter to continue...${NC}"
                read -r
                ;;
            "9")
                clear
                show_help
                echo ""
                echo -e "${YELLOW}Press Enter to continue...${NC}"
                read -r
                ;;
            "0")
                echo -e "${GREEN}Thank you for using Task Management System!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please try again.${NC}"
                sleep 2
                ;;
        esac
    done
}

# Display help
show_help() {
    echo "Task Management System - Master Control"
    echo ""
    echo "Usage: $0 [COMMAND] [SUBCOMMAND] [OPTIONS]"
    echo ""
    echo "Main Commands:"
    echo "  status                     Show system status overview"
    echo "  init                       Initialize task management system"
    echo "  interactive               Launch interactive menu"
    echo "  maintenance               Run system maintenance"
    echo ""
    echo "Task Commands:"
    echo "  task list                  List all active tasks"
    echo "  task complete TASK [NOTES] Complete a specific task"
    echo "  task interactive           Interactive task completion"
    echo ""
    echo "Epic Commands:"
    echo "  epic create [NAME] [DESC]  Create a new epic"
    echo "  epic list                  List all active epics"
    echo ""
    echo "Monitor Commands:"
    echo "  monitor status             Show current status"
    echo "  monitor watch [INTERVAL]   Real-time monitoring"
    echo "  monitor stats              Show statistics only"
    echo "  monitor health             Check system health"
    echo ""
    echo "Cleanup Commands:"
    echo "  cleanup full               Comprehensive cleanup"
    echo "  cleanup archived [DAYS]    Clean archived tasks"
    echo "  cleanup logs [DAYS]        Clean old log files"
    echo "  cleanup report             Generate health report"
    echo ""
    echo "Examples:"
    echo "  $0 status                       # Show system overview"
    echo "  $0 interactive                  # Launch interactive menu"
    echo "  $0 task complete my_task \"Done\" # Complete specific task"
    echo "  $0 monitor watch 10             # Monitor with 10s refresh"
    echo "  $0 epic create \"New Feature\"   # Create new epic"
    echo "  $0 cleanup full                 # Run full cleanup"
}

# Main function
main() {
    local command="${1:-interactive}"
    
    # Handle special case for no arguments - show interactive menu
    if [[ $# -eq 0 ]]; then
        interactive_menu
        return
    fi
    
    case "$command" in
        "status")
            show_banner
            check_requirements
            show_status
            ;;
        "init")
            show_banner
            initialize_system
            ;;
        "interactive")
            interactive_menu
            ;;
        "maintenance")
            show_banner
            system_maintenance
            ;;
        "task")
            if [[ $# -lt 2 ]]; then
                echo -e "${RED}Error: Task operation required${NC}"
                echo "Usage: $0 task [list|complete|interactive]"
                exit 1
            fi
            shift
            task_operations "$@"
            ;;
        "epic")
            if [[ $# -lt 2 ]]; then
                echo -e "${RED}Error: Epic operation required${NC}"
                echo "Usage: $0 epic [create|list]"
                exit 1
            fi
            shift
            epic_operations "$@"
            ;;
        "monitor")
            if [[ $# -lt 2 ]]; then
                echo -e "${RED}Error: Monitor operation required${NC}"
                echo "Usage: $0 monitor [status|watch|stats|health]"
                exit 1
            fi
            shift
            monitor_operations "$@"
            ;;
        "cleanup")
            if [[ $# -lt 2 ]]; then
                echo -e "${RED}Error: Cleanup operation required${NC}"
                echo "Usage: $0 cleanup [full|archived|logs|report]"
                exit 1
            fi
            shift
            cleanup_operations "$@"
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
