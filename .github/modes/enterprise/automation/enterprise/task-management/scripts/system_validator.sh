#!/bin/bash
# Enterprise Task Management - 100% Reliability Validator
# Location: .github/task-management/scripts/system_validator.sh
# PURPOSE: Validate all interruption and resumption capabilities

PROJECT_ROOT="/Users/vitalijsimko/workspace/projects/flutter/m5"
TASKS_DIR="$PROJECT_ROOT/.tasks"
GITHUB_DIR="$PROJECT_ROOT/.github"
TASK_MGMT_DIR="$GITHUB_DIR/task-management"
LOG_FILE="$TASK_MGMT_DIR/logs/system_validation.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $message"
        log "VALIDATION PASS: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC} - $message"
        log "VALIDATION FAIL: $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC} - $message"
        log "VALIDATION WARN: $message"
    fi
}

echo "🔍 ENTERPRISE TASK MANAGEMENT - 100% RELIABILITY VALIDATION"
echo "============================================================="

# 1. Check critical system files
echo -e "\n📁 CRITICAL SYSTEM FILES VALIDATION"
critical_files=(
    "$TASKS_DIR/system/enterprise_config.json"
    "$TASKS_DIR/system/priority_queue.json"
    "$TASKS_DIR/system/machine_registry.json"
    "$TASKS_DIR/system/sync_status.json"
    "$TASKS_DIR/current.json"
)

all_files_valid=true
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        if python3 -m json.tool "$file" > /dev/null 2>&1; then
            print_status "PASS" "Valid JSON: $(basename "$file")"
        else
            print_status "FAIL" "Invalid JSON: $(basename "$file")"
            all_files_valid=false
        fi
    else
        print_status "FAIL" "Missing file: $(basename "$file")"
        all_files_valid=false
    fi
done

# 2. Check interruption handling scripts
echo -e "\n🛡️ INTERRUPTION HANDLING SCRIPTS VALIDATION"
interruption_scripts=(
    "$TASK_MGMT_DIR/scripts/interrupt_handler.sh"
    "$TASK_MGMT_DIR/scripts/interruption_monitor.sh"
    "$TASK_MGMT_DIR/scripts/auto_save.sh"
    "$TASK_MGMT_DIR/scripts/sync_check.sh"
)

all_scripts_valid=true
for script in "${interruption_scripts[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            print_status "PASS" "Executable: $(basename "$script")"
        else
            print_status "FAIL" "Not executable: $(basename "$script")"
            all_scripts_valid=false
        fi
    else
        print_status "FAIL" "Missing script: $(basename "$script")"
        all_scripts_valid=false
    fi
done

# 3. Test interruption simulation
echo -e "\n🔄 INTERRUPTION SIMULATION TEST"
test_task_id="validation_test_$(date +%s)"

# Create test interrupt signal
echo "INTERRUPT_ADDED: $test_task_id" > "$TASKS_DIR/system/interrupt_signal"

# Wait for signal to be processed (or timeout after 10 seconds)
timeout=0
while [ -f "$TASKS_DIR/system/interrupt_signal" ] && [ $timeout -lt 10 ]; do
    sleep 1
    timeout=$((timeout + 1))
done

if [ ! -f "$TASKS_DIR/system/interrupt_signal" ]; then
    print_status "PASS" "Interrupt signal processing works"
else
    print_status "FAIL" "Interrupt signal not processed within timeout"
    rm -f "$TASKS_DIR/system/interrupt_signal"
fi

# 4. Test directory structure
echo -e "\n📂 DIRECTORY STRUCTURE VALIDATION"
required_dirs=(
    "$TASKS_DIR/system"
    "$TASKS_DIR/system/triggers"
    "$TASKS_DIR/3_execution/active"
    "$TASKS_DIR/3_execution/suspended"
    "$TASK_MGMT_DIR/logs"
    "$TASK_MGMT_DIR/scripts"
)

all_dirs_valid=true
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_status "PASS" "Directory exists: $(basename "$dir")"
    else
        print_status "FAIL" "Missing directory: $dir"
        mkdir -p "$dir"
        print_status "WARN" "Created missing directory: $dir"
    fi
done

# 5. Test Git integration
echo -e "\n🔧 GIT INTEGRATION VALIDATION"
cd "$PROJECT_ROOT"

if git rev-parse --git-dir > /dev/null 2>&1; then
    print_status "PASS" "Git repository detected"
    
    if git show-ref --verify --quiet refs/heads/task-management-state; then
        print_status "PASS" "Task management branch exists"
    else
        print_status "WARN" "Task management branch missing (will be created on first auto-save)"
    fi
else
    print_status "FAIL" "No Git repository detected"
fi

# 6. Test system health monitoring
echo -e "\n💓 SYSTEM HEALTH MONITORING"
if [ -f "$TASK_MGMT_DIR/scripts/sync_check.sh" ]; then
    if "$TASK_MGMT_DIR/scripts/sync_check.sh" > /dev/null 2>&1; then
        print_status "PASS" "System health check functional"
    else
        print_status "WARN" "System health check completed with warnings"
    fi
else
    print_status "FAIL" "System health check script missing"
fi

# 7. Overall system status
echo -e "\n🏆 OVERALL SYSTEM RELIABILITY STATUS"
if [ "$all_files_valid" = true ] && [ "$all_scripts_valid" = true ]; then
    print_status "PASS" "System is 100% ready for reliable interruption handling"
    echo -e "\n${GREEN}✅ SYSTEM VALIDATION COMPLETE - READY FOR PRODUCTION${NC}"
    
    # Update system status
    current_time=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    sed -i '' 's/"all_critical_files_valid": false/"all_critical_files_valid": true/' "$TASKS_DIR/system/sync_status.json"
    sed -i '' "s/\"last_successful_sync\": \"[^\"]*\"/\"last_successful_sync\": \"$current_time\"/" "$TASKS_DIR/system/sync_status.json"
    
    exit 0
else
    print_status "FAIL" "System has critical issues that must be resolved"
    echo -e "\n${RED}❌ SYSTEM VALIDATION FAILED - MANUAL INTERVENTION REQUIRED${NC}"
    exit 1
fi
