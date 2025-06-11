#!/bin/bash

# Task System Cleanup Script
# Version: 1.0.0
# Purpose: Clean up task system artifacts, logs, and temporary files
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
    echo -e "${BLUE}Task System Cleanup v1.0.0${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 full                   # Comprehensive cleanup"
    echo "  $0 archived [DAYS]        # Clean archived tasks older than N days"
    echo "  $0 logs [DAYS]            # Clean log files older than N days"
    echo "  $0 temp                   # Clean temporary files"
    echo "  $0 report                 # Generate cleanup report"
    echo ""
    echo "Examples:"
    echo "  $0 full                   # Clean everything safely"
    echo "  $0 archived 30            # Remove archives older than 30 days"
    echo "  $0 logs 7                 # Remove logs older than 7 days"
}

# Full cleanup
full_cleanup() {
    echo -e "${BLUE}🧹 COMPREHENSIVE TASK SYSTEM CLEANUP${NC}"
    echo -e "${BLUE}====================================${NC}"
    
    local cleaned_files=0
    local cleaned_dirs=0
    
    # Clean temporary files
    if [[ -d "$TASKS_DIR/.temp" ]]; then
        echo -e "${YELLOW}Cleaning temporary files...${NC}"
        find "$TASKS_DIR/.temp" -type f -delete 2>/dev/null || true
        ((cleaned_files += $(find "$TASKS_DIR/.temp" -type f 2>/dev/null | wc -l)))
    fi
    
    # Clean old logs (older than 14 days)
    if [[ -d "$TASKS_DIR/logs" ]]; then
        echo -e "${YELLOW}Cleaning old log files...${NC}"
        find "$TASKS_DIR/logs" -type f -name "*.log" -mtime +14 -delete 2>/dev/null || true
    fi
    
    # Clean old monitoring reports (older than 30 days)
    if [[ -d "$TASKS_DIR/monitoring/reports" ]]; then
        echo -e "${YELLOW}Cleaning old monitoring reports...${NC}"
        find "$TASKS_DIR/monitoring/reports" -type f -mtime +30 -delete 2>/dev/null || true
    fi
    
    # Clean empty directories
    echo -e "${YELLOW}Removing empty directories...${NC}"
    find "$TASKS_DIR" -type d -empty -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    echo -e "${GREEN}✅ Files cleaned: $cleaned_files${NC}"
    echo -e "${GREEN}✅ Task system optimized${NC}"
}

# Clean archived tasks
clean_archived() {
    local days=${1:-90}
    echo -e "${BLUE}🗄️  CLEANING ARCHIVED TASKS (older than $days days)${NC}"
    
    if [[ -d "$TASKS_DIR/4_completion/archived" ]]; then
        local count=$(find "$TASKS_DIR/4_completion/archived" -type f -mtime +$days 2>/dev/null | wc -l)
        find "$TASKS_DIR/4_completion/archived" -type f -mtime +$days -delete 2>/dev/null || true
        echo -e "${GREEN}✅ Removed $count archived tasks${NC}"
    else
        echo -e "${YELLOW}No archived tasks directory found${NC}"
    fi
}

# Clean logs
clean_logs() {
    local days=${1:-7}
    echo -e "${BLUE}📋 CLEANING LOG FILES (older than $days days)${NC}"
    
    local cleaned=0
    
    # Task system logs
    if [[ -d "$TASKS_DIR/logs" ]]; then
        cleaned=$(find "$TASKS_DIR/logs" -type f -name "*.log" -mtime +$days 2>/dev/null | wc -l)
        find "$TASKS_DIR/logs" -type f -name "*.log" -mtime +$days -delete 2>/dev/null || true
    fi
    
    # Task system monitor logs
    if [[ -d "$SCRIPT_DIR/logs" ]]; then
        local monitor_cleaned=$(find "$SCRIPT_DIR/logs" -type f -name "*.log" -mtime +$days 2>/dev/null | wc -l)
        find "$SCRIPT_DIR/logs" -type f -name "*.log" -mtime +$days -delete 2>/dev/null || true
        ((cleaned += monitor_cleaned))
    fi
    
    echo -e "${GREEN}✅ Cleaned $cleaned log files${NC}"
}

# Clean temporary files
clean_temp() {
    echo -e "${BLUE}🗑️  CLEANING TEMPORARY FILES${NC}"
    
    local cleaned=0
    
    if [[ -d "$TASKS_DIR/.temp" ]]; then
        cleaned=$(find "$TASKS_DIR/.temp" -type f 2>/dev/null | wc -l)
        rm -rf "$TASKS_DIR/.temp"/*
        mkdir -p "$TASKS_DIR/.temp"
    fi
    
    echo -e "${GREEN}✅ Cleaned $cleaned temporary files${NC}"
}

# Generate cleanup report
generate_report() {
    echo -e "${BLUE}📊 TASK SYSTEM CLEANUP REPORT${NC}"
    echo -e "${BLUE}=============================${NC}"
    
    local report_file="$TASKS_DIR/monitoring/reports/cleanup_report_$(date +%Y%m%d_%H%M%S).md"
    mkdir -p "$(dirname "$report_file")"
    
    {
        echo "# Task System Cleanup Report"
        echo "Generated: $(date)"
        echo ""
        echo "## Directory Sizes"
        du -sh "$TASKS_DIR"/* 2>/dev/null || echo "No directories found"
        echo ""
        echo "## File Counts"
        echo "- Planning: $(find "$TASKS_DIR/1_planning" -type f 2>/dev/null | wc -l) files"
        echo "- Development: $(find "$TASKS_DIR/2_development" -type f 2>/dev/null | wc -l) files"
        echo "- Execution: $(find "$TASKS_DIR/3_execution" -type f 2>/dev/null | wc -l) files"
        echo "- Completed: $(find "$TASKS_DIR/4_completion" -type f 2>/dev/null | wc -l) files"
        echo "- Epics: $(find "$TASKS_DIR/epics" -type f 2>/dev/null | wc -l) files"
        echo ""
        echo "## System Health"
        echo "- Total disk usage: $(du -sh "$TASKS_DIR" | cut -f1)"
        echo "- Log files: $(find "$TASKS_DIR" -name "*.log" 2>/dev/null | wc -l)"
        echo "- Temp files: $(find "$TASKS_DIR/.temp" -type f 2>/dev/null | wc -l)"
    } > "$report_file"
    
    echo -e "${GREEN}✅ Report generated: $report_file${NC}"
    echo ""
    cat "$report_file"
}

# Main function
main() {
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi
    
    case "$1" in
        "full")
            full_cleanup
            ;;
        "archived")
            clean_archived "${2:-90}"
            ;;
        "logs")
            clean_logs "${2:-7}"
            ;;
        "temp")
            clean_temp
            ;;
        "report")
            generate_report
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
