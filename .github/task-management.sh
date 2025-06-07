#!/bin/bash
# Enterprise Task Management - Main Entry Point
# Location: .github/task-management.sh

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"
TASK_MGMT_DIR="$PROJECT_ROOT/.github/task-management"
SCRIPTS_DIR="$TASK_MGMT_DIR/scripts"

# Enterprise Task Management Commands
case "$1" in
    "massive"|"epic")
        # Massive task orchestration
        shift
        "$SCRIPTS_DIR/massive_task_orchestrator.sh" "$@"
        ;;
    "auto-save"|"autosave")
        # Auto-save functionality
        shift
        "$SCRIPTS_DIR/auto_save.sh" "$@"
        ;;
    "interrupt")
        # Interrupt handling
        shift
        "$SCRIPTS_DIR/interrupt_handler.sh" "$@"
        ;;
    "sync")
        # Sync checking
        shift
        "$SCRIPTS_DIR/sync_check.sh" "$@"
        ;;
    "setup")
        # System setup
        shift
        "$SCRIPTS_DIR/setup_enhanced_system.sh" "$@"
        ;;
    "execute")
        # Execute subtask
        shift
        "$SCRIPTS_DIR/execute_subtask.sh" "$@"
        ;;
    "config")
        # Show configuration
        echo "📁 Task Management Configuration:"
        echo "  Config Dir: $TASK_MGMT_DIR/config"
        echo "  Scripts Dir: $TASK_MGMT_DIR/scripts" 
        echo "  Logs Dir: $TASK_MGMT_DIR/logs"
        echo "  Tasks Data: $PROJECT_ROOT/.tasks"
        ;;
    "monitor")
        # Start interruption monitoring daemon
        shift
        "$SCRIPTS_DIR/interruption_monitor.sh" "$@" &
        echo "🔍 Interruption monitor started in background"
        ;;
    "validate")
        # Validate system reliability
        shift
        "$SCRIPTS_DIR/system_validator.sh" "$@"
        ;;
    "test-interrupt")
        # Test interruption handling
        echo "🧪 Testing interruption handling..."
        echo "INTERRUPT_TEST_$(date +%s)" > "$PROJECT_ROOT/.tasks/system/interrupt_signal"
        sleep 2
        if [ ! -f "$PROJECT_ROOT/.tasks/system/interrupt_signal" ]; then
            echo "✅ Interruption handling working correctly"
        else
            echo "❌ Interruption handling failed - monitor may not be running"
            echo "💡 Start monitor with: ./.github/task-management.sh monitor"
        fi
        ;;
    "stop-monitor")
        # Stop interruption monitoring daemon
        if [ -f "$PROJECT_ROOT/.tasks/system/interruption_monitor.pid" ]; then
            kill $(cat "$PROJECT_ROOT/.tasks/system/interruption_monitor.pid") 2>/dev/null
            rm -f "$PROJECT_ROOT/.tasks/system/interruption_monitor.pid"
            echo "🛑 Interruption monitor stopped"
        else
            echo "ℹ️  No interruption monitor running"
        fi
        ;;
    "status")
        # Quick status of all epics and monitoring
        echo "🏗️  ENTERPRISE TASK MANAGEMENT STATUS"
        echo "📋 Current Task: $(jq -r '.task_id' "$PROJECT_ROOT/.tasks/current.json" 2>/dev/null || echo "None")"
        
        # Check monitor status
        if [ -f "$PROJECT_ROOT/.tasks/system/interruption_monitor.pid" ]; then
            monitor_pid=$(cat "$PROJECT_ROOT/.tasks/system/interruption_monitor.pid")
            if ps -p $monitor_pid > /dev/null 2>&1; then
                echo "🔍 Interruption Monitor: RUNNING (PID: $monitor_pid)"
            else
                echo "🔍 Interruption Monitor: STOPPED (stale PID file)"
                rm -f "$PROJECT_ROOT/.tasks/system/interruption_monitor.pid"
            fi
        else
            echo "🔍 Interruption Monitor: NOT RUNNING"
        fi
        echo "====================================="
        
        if [[ -d "$PROJECT_ROOT/.tasks/epics" ]]; then
            echo "📊 Active Epics:"
            for epic_dir in "$PROJECT_ROOT/.tasks/epics"/*; do
                if [[ -d "$epic_dir" ]]; then
                    epic_name=$(basename "$epic_dir")
                    echo "  • $epic_name"
                    if [[ -f "$epic_dir/progress.json" ]]; then
                        jq -r '  "    Status: " + .status + " | Milestones: " + (.milestones_completed | length | tostring) + " | Interruptions: " + (.interruption_history | length | tostring)' "$epic_dir/progress.json"
                    fi
                fi
            done
        else
            echo "  No active epics found"
        fi
        
        echo ""
        echo "📈 System Health:"
        if [[ -f "$TASK_MGMT_DIR/config/enterprise_config.json" ]]; then
            echo "  ✅ Enterprise config loaded"
        else
            echo "  ❌ Enterprise config missing"
        fi
        
        if [[ -f "$TASK_MGMT_DIR/logs/massive_task.log" ]]; then
            echo "  ✅ Logging active"
        else
            echo "  ⚠️  No recent log activity"
        fi
        ;;
    "help"|"-h"|"--help"|"")
        echo "🚀 Enterprise Task Management System"
        echo "===================================="
        echo ""
        echo "Usage: .github/task-management.sh <command> [args...]"
        echo ""
        echo "MASSIVE TASK COMMANDS:"
        echo "  massive init <task_file>              - Initialize massive task (10-500+ hours)"
        echo "  massive status <epic_id>              - Show epic status and progress"
        echo "  massive checkpoint <epic_id> <type>   - Create checkpoint (emergency|milestone|manual)"
        echo "  massive interrupt <epic_id> <priority> <reason> - Interrupt task with priority"
        echo "  massive resume <epic_id> <from_machine> - Resume task (cross-machine support)"
        echo "  massive milestone <epic_id> <name>    - Complete milestone with auto-sync"
        echo ""
        echo "AUTOMATION COMMANDS:"
        echo "  auto-save start                       - Start auto-commit daemon (15min intervals)"
        echo "  auto-save stop                        - Stop auto-commit daemon"
        echo "  auto-save status                      - Check auto-save status"
        echo ""
        echo "SYSTEM COMMANDS:"
        echo "  interrupt <epic_id> <priority>        - Interrupt current work"
        echo "  sync check                            - Validate cross-machine sync"
        echo "  setup                                 - Setup enhanced task system"
        echo "  execute <subtask_file>                - Execute individual subtask"
        echo ""
        echo "UTILITY COMMANDS:"
        echo "  config                                - Show system configuration"
        echo "  status                                - Show all epics and system health"
        echo "  help                                  - Show this help message"
        echo ""
        echo "EXAMPLES:"
        echo "  # Initialize 60-80 hour epic"
        echo "  .github/task-management.sh massive init .tasks/planning/my_epic.json"
        echo ""
        echo "  # Check status of all tasks"
        echo "  .github/task-management.sh status"
        echo ""
        echo "  # Interrupt for urgent work"
        echo "  .github/task-management.sh massive interrupt my_epic CRITICAL 'urgent_bug_fix'"
        echo ""
        echo "  # Resume on different machine"
        echo "  .github/task-management.sh massive resume my_epic 'previous_machine_name'"
        echo ""
        echo "📁 SYSTEM ORGANIZATION:"
        echo "  .github/task-management/     - Scripts, config, and automation logic"
        echo "  .tasks/                      - Task data, progress, and epic state"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Use '.github/task-management.sh help' for available commands"
        exit 1
        ;;
esac
