#!/bin/bash

# Task Completion System
# Version: 1.0.0
# Purpose: Complete tasks and manage task lifecycle
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/.tasks"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Usage function
show_usage() {
    echo -e "${BLUE}Task Completion System v1.0.0${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 list                    # List all active tasks"
    echo "  $0 complete TASK_ID [NOTE] # Complete a specific task"
    echo "  $0 interactive            # Interactive task selection"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 complete task_2025-06-10_10-28-28_example 'Task completed successfully'"
    echo "  $0 interactive"
}

# List active tasks
list_tasks() {
    echo -e "${BLUE}🔥 ACTIVE TASKS${NC}"
    echo -e "${BLUE}===============${NC}"
    
    local count=0
    for task_file in "$TASKS_DIR"/3_execution/active/*.json; do
        if [[ -f "$task_file" ]]; then
            local task_id=$(basename "$task_file" .json)
            local task_name=$(jq -r '.task.name // "No name"' "$task_file" 2>/dev/null || echo "Unknown")
            local agent=$(jq -r '.task.agent // "Unknown"' "$task_file" 2>/dev/null || echo "Unknown")
            
            echo -e "  ● ${task_id}"
            echo -e "    Agent: ${agent}"
            echo -e "    Name: ${task_name}"
            echo ""
            ((count++))
        fi
    done
    
    if [[ $count -eq 0 ]]; then
        echo -e "${YELLOW}No active tasks found${NC}"
    else
        echo -e "${GREEN}Found $count active tasks${NC}"
    fi
}

# Complete a task
complete_task() {
    local task_id="$1"
    local note="${2:-Task completed}"
    local task_file="$TASKS_DIR/3_execution/active/${task_id}.json"
    local completed_file="$TASKS_DIR/4_completion/completed/${task_id}.json"
    
    if [[ ! -f "$task_file" ]]; then
        echo -e "${RED}❌ Error: Task not found: $task_id${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Completing task: $task_id${NC}"
    
    # Update task status
    local updated_content=$(jq --arg note "$note" --arg timestamp "$(date '+%Y-%m-%d %H:%M:%S')" '
        .task.status = "completed" |
        .task.completedAt = $timestamp |
        .progress.completion = 100 |
        .completion = {
            "completedAt": $timestamp,
            "note": $note,
            "agent": .task.agent
        }
    ' "$task_file")
    
    # Move to completed
    echo "$updated_content" > "$completed_file"
    rm "$task_file"
    
    echo -e "${GREEN}✅ Task completed successfully${NC}"
    echo -e "${GREEN}✅ Moved to completed: $completed_file${NC}"
}

# Interactive mode
interactive_complete() {
    echo -e "${BLUE}🎯 INTERACTIVE TASK COMPLETION${NC}"
    echo -e "${BLUE}==============================${NC}"
    
    list_tasks
    
    echo -e "${YELLOW}Enter task ID to complete (or 'q' to quit):${NC}"
    read -r task_id
    
    if [[ "$task_id" == "q" ]]; then
        echo "Cancelled"
        return 0
    fi
    
    echo -e "${YELLOW}Enter completion note (optional):${NC}"
    read -r note
    
    complete_task "$task_id" "$note"
}

# Main function
main() {
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi
    
    case "$1" in
        "list")
            list_tasks
            ;;
        "complete")
            if [[ $# -lt 2 ]]; then
                echo -e "${RED}Error: Task ID required${NC}"
                show_usage
                exit 1
            fi
            complete_task "$2" "${3:-}"
            ;;
        "interactive")
            interactive_complete
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            echo -e "${RED}Error: Unknown command '$1'${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
