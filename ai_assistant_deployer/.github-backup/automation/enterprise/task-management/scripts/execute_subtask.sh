#!/bin/bash

# Enhanced Task Management - Subtask Execution Script
# Manages individual subtask execution with real-time monitoring

TASK_DIR="/Users/vitalijsimko/workspace/projects/flutter/m5/.tasks/3_execution/active/fix_compilation_errors"
SUBTASKS_DIR="$TASK_DIR/subtasks"

function update_subtask_status() {
    local subtask_file="$1"
    local status="$2"
    local start_time="$3"
    local end_time="$4"
    local actual_time="$5"
    
    # Update subtask JSON with new status
    if [[ "$status" == "active" ]]; then
        jq --arg status "$status" --arg start "$start_time" \
           '.status = $status | .started_at = $start' \
           "$subtask_file" > "$subtask_file.tmp" && mv "$subtask_file.tmp" "$subtask_file"
    elif [[ "$status" == "completed" ]]; then
        jq --arg status "$status" --arg end "$end_time" --arg time "$actual_time" \
           '.status = $status | .completed_at = $end | .actual_time = $time' \
           "$subtask_file" > "$subtask_file.tmp" && mv "$subtask_file.tmp" "$subtask_file"
    fi
    
    echo "📝 Updated subtask status: $status"
}

function update_dashboard() {
    local completed_count=$(find "$SUBTASKS_DIR" -name "*.json" -exec jq -r '.status' {} \; | grep -c "completed")
    local total_count=$(find "$SUBTASKS_DIR" -name "*.json" | wc -l | tr -d ' ')
    local progress=$((completed_count * 100 / total_count))
    
    echo "📊 Progress: $completed_count/$total_count completed ($progress%)"
    
    # Update monitoring.json
    jq --arg completed "$completed_count" --arg progress "$progress" \
       '.subtasks.completed = ($completed | tonumber) | .progress_percentage = ($progress | tonumber)' \
       "$TASK_DIR/monitoring.json" > "$TASK_DIR/monitoring.json.tmp" && \
       mv "$TASK_DIR/monitoring.json.tmp" "$TASK_DIR/monitoring.json"
}

function execute_subtask() {
    local subtask_number="$1"
    local subtask_file="$SUBTASKS_DIR/${subtask_number}_*.json"
    
    if [[ ! -f $subtask_file ]]; then
        echo "❌ Subtask file not found: $subtask_file"
        return 1
    fi
    
    local subtask_id=$(jq -r '.subtask_id' $subtask_file)
    local title=$(jq -r '.title' $subtask_file)
    local estimated_time=$(jq -r '.estimated_time' $subtask_file)
    
    echo "🚀 Starting subtask: $title"
    echo "⏱️  Estimated time: $estimated_time"
    
    local start_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    update_subtask_status "$subtask_file" "active" "$start_time"
    
    echo "✅ Subtask $subtask_id ready for manual execution"
    echo "📁 Files to modify: $(jq -r '.files_to_modify[]' $subtask_file)"
    echo "🎯 Success criteria: $(jq -r '.success_criteria' $subtask_file)"
    echo ""
    echo "Please proceed with the actual file modifications..."
}

# Main execution
if [[ "$1" == "start" ]]; then
    execute_subtask "01"
elif [[ "$1" == "complete" ]]; then
    # Mark current subtask as complete and update dashboard
    local current_file="$SUBTASKS_DIR/01_*.json"
    local end_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    update_subtask_status "$current_file" "completed" "" "$end_time" "actual_time_here"
    update_dashboard
    echo "✅ Subtask marked as completed"
elif [[ "$1" == "status" ]]; then
    update_dashboard
else
    echo "Usage: $0 {start|complete|status}"
    echo "  start   - Begin first subtask execution"
    echo "  complete - Mark current subtask as completed"  
    echo "  status   - Show current progress"
fi
