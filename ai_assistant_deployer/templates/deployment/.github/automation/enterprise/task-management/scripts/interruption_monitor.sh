#!/bin/bash
# Enterprise Task Management - Critical Interruption Monitor
# Location: .github/task-management/scripts/interruption_monitor.sh
# PURPOSE: Continuous monitoring for interruption signals and graceful handling

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"
TASKS_DIR="$PROJECT_ROOT/.tasks"
GITHUB_DIR="$PROJECT_ROOT/.github"
TASK_MGMT_DIR="$GITHUB_DIR/task-management"
LOG_FILE="$TASK_MGMT_DIR/logs/interruption_monitor.log"

# PID file for daemon management
PID_FILE="$TASKS_DIR/system/interruption_monitor.pid"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Trap signals for graceful shutdown
cleanup() {
    log "Interruption monitor shutting down gracefully"
    rm -f "$PID_FILE"
    exit 0
}

trap cleanup SIGTERM SIGINT

# Check if monitor is already running
if [ -f "$PID_FILE" ]; then
    if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
        echo "Interruption monitor already running (PID: $(cat "$PID_FILE"))"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

# Write PID file
echo $$ > "$PID_FILE"

log "Starting enterprise interruption monitor (PID: $$)"

# Main monitoring loop
while true; do
    # Check for interrupt signals
    if [ -f "$TASKS_DIR/system/interrupt_signal" ]; then
        INTERRUPT_CONTENT=$(cat "$TASKS_DIR/system/interrupt_signal")
        log "Interrupt signal detected: $INTERRUPT_CONTENT"
        
        # Execute interrupt handler
        "$TASK_MGMT_DIR/scripts/interrupt_handler.sh" suspend "interrupt_signal_received"
        
        # Clear the signal
        rm "$TASKS_DIR/system/interrupt_signal"
        
        # Create suspension trigger for auto-save
        touch "$TASKS_DIR/system/triggers/suspension"
        
        log "Interrupt handled successfully"
    fi
    
    # Check for resume signals
    if [ -f "$TASKS_DIR/system/resume_signal" ]; then
        RESUME_CONTENT=$(cat "$TASKS_DIR/system/resume_signal")
        log "Resume signal detected: $RESUME_CONTENT"
        
        # Extract task ID from resume signal
        TASK_ID=$(echo "$RESUME_CONTENT" | cut -d':' -f2 | xargs)
        
        # Execute resume handler
        "$TASK_MGMT_DIR/scripts/interrupt_handler.sh" resume "$TASK_ID"
        
        # Clear the signal
        rm "$TASKS_DIR/system/resume_signal"
        
        log "Resume handled successfully for task: $TASK_ID"
    fi
    
    # Check system health
    if ! "$TASK_MGMT_DIR/scripts/sync_check.sh" > /dev/null 2>&1; then
        log "WARNING: System health check failed"
        echo "HEALTH_CHECK_FAILED" > "$TASKS_DIR/system/sync_alert"
    fi
    
    # Monitor for critical alerts
    if [ -f "$TASKS_DIR/system/sync_alert" ]; then
        ALERT_TYPE=$(cat "$TASKS_DIR/system/sync_alert")
        log "CRITICAL ALERT: $ALERT_TYPE"
        
        case "$ALERT_TYPE" in
            "CONFLICT")
                log "Manual conflict resolution required"
                ;;
            "VALIDATION_FAILED")
                log "System validation failed - automatic recovery attempt"
                "$TASK_MGMT_DIR/scripts/sync_check.sh"
                ;;
            "HEALTH_CHECK_FAILED")
                log "Health check failed - monitoring continues"
                ;;
        esac
        
        # Keep alert for 5 minutes then clear
        sleep 300
        rm -f "$TASKS_DIR/system/sync_alert"
    fi
    
    # Update machine registry heartbeat
    current_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    sed -i '' "s/\"last_seen\": \"[^\"]*\"/\"last_seen\": \"$current_time\"/" "$TASKS_DIR/system/machine_registry.json"
    
    # Sleep for monitoring interval (5 seconds)
    sleep 5
done
