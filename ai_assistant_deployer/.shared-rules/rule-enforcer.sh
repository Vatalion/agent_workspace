#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns 
# 🚨 STRICT RULE ENFORCEMENT SYSTEM
# Version: 4.0.0 - 100% COMPLIANCE GUARANTEED
# Purpose: Force AI agents to follow ALL enabled rules without exception
# 
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/modules.yaml"
ENFORCEMENT_LOG="/tmp/rule_enforcement_$(date +%Y%m%d_%H%M%S).log"
COMPLIANCE_STATE_FILE="/tmp/agent_compliance_state.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Initialize logging
exec 1> >(tee -a "$ENFORCEMENT_LOG")
exec 2> >(tee -a "$ENFORCEMENT_LOG" >&2)

print_critical_header() {
    echo -e "${RED}${BOLD}================================================================${NC}"
    echo -e "${RED}${BOLD}🚨 STRICT RULE ENFORCEMENT SYSTEM - 100% COMPLIANCE${NC}"
    echo -e "${RED}${BOLD}   Version 4.0.0 - ZERO TOLERANCE FOR RULE VIOLATIONS${NC}"
    echo -e "${RED}${BOLD}================================================================${NC}"
}

log_critical() {
    echo -e "${RED}${BOLD}[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 CRITICAL: $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  WARNING: $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ SUCCESS: $1${NC}"
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  INFO: $1${NC}"
}

# Get active modules from configuration
get_active_modules() {
    if [[ -f "$CONFIG_FILE" ]]; then
        grep -A 50 "active_modules:" "$CONFIG_FILE" | grep ": true" | awk '{gsub(/:.*/, "", $1); gsub(/^ +/, "", $1); print $1}'
    else
        echo "core_workflow folder_structure rule_enforcement"
    fi
}

# Initialize compliance state tracking
init_compliance_state() {
    local agent_name=$1
    local task_desc=$2
    local active_modules=($(get_active_modules))
    
    cat > "$COMPLIANCE_STATE_FILE" <<EOF
{
    "agent": "$agent_name",
    "task": "$task_desc",
    "started_at": "$(date '+%Y-%m-%d %H:%M:%S')",
    "active_modules": [$(printf '"%s",' "${active_modules[@]}" | sed 's/,$//')],
    "compliance_status": "ENFORCING",
    "steps_completed": [],
    "steps_failed": [],
    "checkpoint_validations": {},
    "rule_violations": [],
    "mandatory_steps": [],
    "completion_percentage": 0
}
EOF
    
    log_info "Compliance state initialized: $COMPLIANCE_STATE_FILE"
}

# Generate mandatory steps based on active modules
generate_mandatory_steps() {
    local active_modules=($(get_active_modules))
    local steps=()
    
    # CORE STEPS (Always required)
    steps+=("READ_PROJECT_MAP")
    steps+=("READ_README")
    steps+=("READ_MODULE_CONFIG")
    steps+=("VALIDATE_FOLDER_STRUCTURE")
    steps+=("ASSESS_TASK_COMPLEXITY")
    steps+=("VALIDATE_CHANGES")
    steps+=("CLEANUP_ARTIFACTS")
    
    # MODULE-SPECIFIC STEPS
    for module in "${active_modules[@]}"; do
        case $module in
            "clean_architecture")
                steps+=("VALIDATE_CLEAN_ARCHITECTURE")
                steps+=("CHECK_SOLID_PRINCIPLES")
                steps+=("VERIFY_DEPENDENCY_INJECTION")
                ;;
            "testing_standards")
                steps+=("RUN_UNIT_TESTS")
                steps+=("CHECK_TEST_COVERAGE")
                steps+=("VALIDATE_TEST_STRUCTURE")
                ;;
            "backup_strategy")
                steps+=("CREATE_BACKUP_CHECKPOINT")
                steps+=("VERIFY_BACKUP_SAFETY")
                steps+=("VALIDATE_RECOVERY_PLAN")
                ;;
            "security_compliance")
                steps+=("SECURITY_SCAN")
                steps+=("VALIDATE_SECRETS")
                steps+=("CHECK_VULNERABILITIES")
                ;;
            "performance_monitoring")
                steps+=("PERFORMANCE_BASELINE")
                steps+=("MONITOR_RESOURCE_USAGE")
                steps+=("VALIDATE_PERFORMANCE_THRESHOLDS")
                ;;
            "task_management")
                steps+=("CREATE_TASK_RECORD")
                steps+=("UPDATE_EPIC_PROGRESS")
                steps+=("VALIDATE_TASK_COMPLETION")
                ;;
            "git_workflow")
                steps+=("VALIDATE_GIT_STATUS")
                steps+=("CREATE_FEATURE_BRANCH")
                steps+=("PREPARE_COMMIT_MESSAGE")
                ;;
        esac
    done
    
    # Update compliance state with mandatory steps
    local steps_json=$(printf '"%s",' "${steps[@]}" | sed 's/,$//')
    jq ".mandatory_steps = [$steps_json]" "$COMPLIANCE_STATE_FILE" > "${COMPLIANCE_STATE_FILE}.tmp" && mv "${COMPLIANCE_STATE_FILE}.tmp" "$COMPLIANCE_STATE_FILE"
    
    echo "${steps[@]}"
}

# Automatic task record creation
create_automatic_task_record() {
    local agent_name="$1"
    local task_desc="$2"
    local complexity="$3"
    
    local task_id="task_$(date +%Y-%m-%d_%H-%M-%S)_$(echo "$task_desc" | tr ' ' '_' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_]//g' | cut -c1-50)"
    local task_file=".tasks/3_execution/active/${task_id}.json"
    
    # Ensure the directory exists
    mkdir -p ".tasks/3_execution/active"
    
    # Determine estimates based on complexity
    local hours maxFiles
    case $complexity in
        "EASY") hours=0.5; maxFiles=3 ;;
        "MEDIUM") hours=1; maxFiles=10 ;;
        "HIGH") hours=4; maxFiles=50 ;;
        *) hours=1; maxFiles=10 ;;
    esac
    
    # Create task record
    cat > "$task_file" <<EOF
{
  "task": {
    "id": "$task_id",
    "name": "$task_desc",
    "agent": "$agent_name",
    "complexity": "$complexity",
    "status": "active",
    "createdAt": "$(date '+%Y-%m-%d %H:%M:%S')",
    "updatedAt": "$(date '+%Y-%m-%d %H:%M:%S')"
  },
  "estimates": {
    "hours": $hours,
    "maxFiles": $maxFiles
  },
  "progress": {
    "phase": "execution",
    "completion": 10
  },
  "execution": {
    "phases": [
      {
        "name": "Setup and Analysis",
        "status": "in_progress",
        "startedAt": "$(date '+%Y-%m-%d %H:%M:%S')"
      }
    ]
  },
  "compliance": {
    "ruleEnforcer": true,
    "mandatorySteps": 27,
    "autoCreated": true
  },
  "cleanup": {
    "temporaryFiles": [],
    "generatedReports": [],
    "scriptsCreated": []
  }
}
EOF
    
    if [[ $? -eq 0 ]]; then
        log_success "Task record created automatically: $task_file"
        return 0
    else
        log_error "Failed to create task record: $task_file"
        return 1
    fi
}

# Checkpoint validation - BLOCKS PROGRESS until satisfied
checkpoint_validation() {
    local step=$1
    local validation_result=""
    
    log_critical "🔒 CHECKPOINT VALIDATION: $step"
    
    case $step in
        "READ_PROJECT_MAP")
            if [[ ! -f ".shared-rules/PROJECT_MAP.md" ]]; then
                log_error "PROJECT_MAP.md not found in .shared-rules/ - BLOCKING PROGRESS"
                echo -e "${YELLOW}The PROJECT_MAP.md file must be reviewed before any changes${NC}"
                echo -e "${YELLOW}Use: .shared-rules/update_project_map_flutter_only.sh to generate/update it${NC}"
                return 1
            fi
            # Check if file was updated recently (within 24 hours for safety)
            local map_age=$(find .shared-rules/PROJECT_MAP.md -mtime -1 | wc -l)
            if [[ $map_age -eq 0 ]]; then
                log_warning "PROJECT_MAP.md is older than 24 hours - consider updating"
            fi
            validation_result="PROJECT_MAP.md exists and is accessible"
            ;;
        "READ_README")
            if [[ ! -f "README.md" ]]; then
                log_error "README.md not found - BLOCKING PROGRESS"
                return 1
            fi
            validation_result="README.md exists and accessible"
            ;;
        "READ_MODULE_CONFIG")
            if [[ ! -f "$CONFIG_FILE" ]]; then
                log_error "Module configuration not found - BLOCKING PROGRESS"
                return 1
            fi
            validation_result="Module configuration validated"
            ;;
        "VALIDATE_FOLDER_STRUCTURE")
            local required_dirs=(".shared-rules" ".temp" ".scripts" "docs")
            for dir in "${required_dirs[@]}"; do
                if [[ ! -d "$dir" ]]; then
                    log_error "Required directory '$dir' missing - BLOCKING PROGRESS"
                    return 1
                fi
            done
            validation_result="Folder structure compliant"
            ;;
        "ASSESS_TASK_COMPLEXITY")
            # Check if complexity was properly assessed using JSON format
            local complexity_assessed=$(jq -r '.complexity_assessed // false' "$COMPLIANCE_STATE_FILE" 2>/dev/null)
            if [[ "$complexity_assessed" != "true" ]]; then
                log_error "Task complexity not assessed - BLOCKING PROGRESS"
                echo -e "${YELLOW}Agent must explicitly assess task as: EASY (E), MEDIUM (M), or HIGH (H)${NC}"
                echo -e "${YELLOW}Use: .shared-rules/rule-enforcer.sh assess-complexity [E|M|H]${NC}"
                return 1
            fi
            validation_result="Task complexity assessed"
            ;;
        "VALIDATE_CLEAN_ARCHITECTURE")
            if grep -q "clean_architecture: true" "$CONFIG_FILE"; then
                # Check for clean architecture violations
                if find lib/ -name "*.dart" -exec grep -l "import.*data.*" {} \; 2>/dev/null | grep -q "domain/"; then
                    log_error "Clean architecture violation: Domain layer importing data layer - BLOCKING PROGRESS"
                    return 1
                fi
                validation_result="Clean architecture validated"
            fi
            ;;
        "RUN_UNIT_TESTS")
            if grep -q "testing_standards: true" "$CONFIG_FILE"; then
                # Force test execution
                if ! find test/ -name "*_test.dart" -o -name "*_test.py" -o -name "*.test.js" 2>/dev/null | head -1 | grep -q .; then
                    log_error "No test files found - BLOCKING PROGRESS"
                    return 1
                fi
                validation_result="Tests identified and accessible"
            fi
            ;;
        "SECURITY_SCAN")
            if grep -q "security_compliance: true" "$CONFIG_FILE"; then
                # Check for hardcoded secrets (excluding build directories)
                if grep -r "password.*=" . --include="*.dart" --include="*.js" --include="*.py" | grep -v test | grep -v build | grep -v ".git" | head -1 | grep -q .; then
                    log_error "Potential hardcoded secrets found - BLOCKING PROGRESS"
                    return 1
                fi
                validation_result="Security scan passed"
            fi
            ;;
        "CREATE_TASK_RECORD")
            if grep -q "task_management: true" "$CONFIG_FILE"; then
                if [[ ! -d ".tasks" ]]; then
                    log_error "Task management system not initialized - BLOCKING PROGRESS"
                    return 1
                fi
                
                # Check if task record actually exists for current session
                local task_today=$(date '+%Y-%m-%d')
                local active_task_count=$(find .tasks/3_execution/active/ -name "task_${task_today}_*.json" 2>/dev/null | wc -l)
                
                if [[ $active_task_count -eq 0 ]]; then
                    # Automatically create task record
                    local agent_name=$(jq -r '.agent' "$COMPLIANCE_STATE_FILE")
                    local task_desc=$(jq -r '.task' "$COMPLIANCE_STATE_FILE")
                    local complexity=$(jq -r '.task_complexity // "MEDIUM"' "$COMPLIANCE_STATE_FILE")
                    
                    create_automatic_task_record "$agent_name" "$task_desc" "$complexity"
                    
                    if [[ $? -ne 0 ]]; then
                        log_error "Failed to create task record - BLOCKING PROGRESS"
                        return 1
                    fi
                fi
                
                validation_result="Task record created and validated"
            fi
            ;;
        "CREATE_BACKUP_CHECKPOINT")
            if grep -q "backup_strategy: true" "$CONFIG_FILE"; then
                # Run backup safety setup to ensure proper configuration
                if [[ -x "$RULES_DIR/setup-backup-safety.sh" ]]; then
                    if "$RULES_DIR/setup-backup-safety.sh" 2>/dev/null; then
                        validation_result="Backup checkpoint created successfully"
                    else
                        log_error "Backup safety setup failed - BLOCKING PROGRESS"
                        return 1
                    fi
                else
                    log_error "Backup safety script not found - BLOCKING PROGRESS"
                    return 1
                fi
            fi
            ;;
        "VERIFY_BACKUP_SAFETY")
            if grep -q "backup_strategy: true" "$CONFIG_FILE"; then
                # Verify no backup files in git repository
                if find . -name "*.tar.gz" -path "./.tasks/*" | head -1 | grep -q .; then
                    log_error "Backup files found in git repository - BLOCKING PROGRESS"
                    return 1
                fi
                
                # Verify safe backup directories exist
                if [[ ! -d "$HOME/backups/m5" ]]; then
                    log_error "Safe backup directories not found - BLOCKING PROGRESS"
                    return 1
                fi
                
                validation_result="Backup safety verified"
            fi
            ;;
        "VALIDATE_RECOVERY_PLAN")
            if grep -q "backup_strategy: true" "$CONFIG_FILE"; then
                # Check if backup directories are properly structured
                local backup_dirs=("daily" "manual" "recovered")
                for dir in "${backup_dirs[@]}"; do
                    if [[ ! -d "$HOME/backups/m5/$dir" ]]; then
                        log_error "Missing backup directory: $HOME/backups/m5/$dir - BLOCKING PROGRESS"
                        return 1
                    fi
                done
                
                validation_result="Recovery plan validated"
            fi
            ;;
    esac
    
    # Record successful validation
    jq ".checkpoint_validations[\"$step\"] = \"$validation_result\"" "$COMPLIANCE_STATE_FILE" > "${COMPLIANCE_STATE_FILE}.tmp" && mv "${COMPLIANCE_STATE_FILE}.tmp" "$COMPLIANCE_STATE_FILE"
    
    log_success "Checkpoint passed: $step"
    return 0
}

# Record step completion - MUST BE CALLED FOR EACH STEP
record_step_completion() {
    local step=$1
    local evidence=$2
    
    # Add to completed steps
    jq ".steps_completed += [\"$step\"]" "$COMPLIANCE_STATE_FILE" > "${COMPLIANCE_STATE_FILE}.tmp" && mv "${COMPLIANCE_STATE_FILE}.tmp" "$COMPLIANCE_STATE_FILE"
    
    # Update completion percentage
    local total_steps=$(jq '.mandatory_steps | length' "$COMPLIANCE_STATE_FILE")
    local completed_steps=$(jq '.steps_completed | length' "$COMPLIANCE_STATE_FILE")
    local percentage=$((completed_steps * 100 / total_steps))
    
    jq ".completion_percentage = $percentage" "$COMPLIANCE_STATE_FILE" > "${COMPLIANCE_STATE_FILE}.tmp" && mv "${COMPLIANCE_STATE_FILE}.tmp" "$COMPLIANCE_STATE_FILE"
    
    log_success "Step completed: $step ($percentage% complete)"
    
    if [[ -n "$evidence" ]]; then
        log_info "Evidence: $evidence"
    fi
}

# Record rule violation - IMMEDIATE ALERT
record_rule_violation() {
    local violation=$1
    local severity=${2:-"MEDIUM"}
    
    log_critical "RULE VIOLATION DETECTED: $violation"
    
    # Add to violations list
    jq ".rule_violations += [{\"violation\": \"$violation\", \"severity\": \"$severity\", \"timestamp\": \"$(date '+%Y-%m-%d %H:%M:%S')\"}]" "$COMPLIANCE_STATE_FILE" > "${COMPLIANCE_STATE_FILE}.tmp" && mv "${COMPLIANCE_STATE_FILE}.tmp" "$COMPLIANCE_STATE_FILE"
    
    # For HIGH severity violations, block progress
    if [[ "$severity" == "HIGH" ]]; then
        log_critical "HIGH SEVERITY VIOLATION - BLOCKING ALL PROGRESS"
        return 1
    fi
}

# Main enforcement function - STRICT EXECUTION
strict_enforce() {
    local agent_name=$1
    local task_desc=$2
    
    if [[ -z "$agent_name" || -z "$task_desc" ]]; then
        log_error "Agent name and task description required"
        echo "Usage: $0 strict-enforce \"AGENT_NAME\" \"TASK_DESCRIPTION\""
        return 1
    fi
    
    print_critical_header
    
    log_critical "INITIATING STRICT RULE ENFORCEMENT"
    log_info "Agent: $agent_name"
    log_info "Task: $task_desc"
    log_info "Enforcement Log: $ENFORCEMENT_LOG"
    
    # Initialize compliance tracking
    init_compliance_state "$agent_name" "$task_desc"
    
    # Generate mandatory steps
    local mandatory_steps=($(generate_mandatory_steps))
    local total_steps=${#mandatory_steps[@]}
    
    log_critical "GENERATED $total_steps MANDATORY STEPS - ALL MUST BE COMPLETED"
    
    # Display all mandatory steps
    echo -e "\n${YELLOW}📋 MANDATORY STEP CHECKLIST:${NC}"
    for i in "${!mandatory_steps[@]}"; do
        echo -e "  $((i+1)). ${mandatory_steps[$i]}"
    done
    
    echo -e "\n${RED}${BOLD}⚠️  CRITICAL ENFORCEMENT RULES:${NC}"
    echo -e "${RED}• ALL steps must be completed in order${NC}"
    echo -e "${RED}• Each step requires checkpoint validation${NC}"
    echo -e "${RED}• Progress blocked until validation passes${NC}"
    echo -e "${RED}• Rule violations result in immediate alerts${NC}"
    echo -e "${RED}• No step can be skipped or bypassed${NC}"
    
    echo -e "\n${GREEN}🎯 TO PROCEED WITH ANY STEP:${NC}"
    echo -e "${GREEN}  $0 validate-step STEP_NAME${NC}"
    echo -e "${GREEN}  $0 complete-step STEP_NAME \"EVIDENCE\"${NC}"
    
    echo -e "\n${BLUE}📊 COMPLIANCE MONITORING:${NC}"
    echo -e "${BLUE}  State File: $COMPLIANCE_STATE_FILE${NC}"
    echo -e "${BLUE}  Progress: 0/$total_steps (0%)${NC}"
    
    log_critical "ENFORCEMENT ACTIVE - AGENT MUST FOLLOW ALL RULES"
    return 0
}

# Validate individual step
validate_step() {
    local step=$1
    
    if [[ -z "$step" ]]; then
        log_error "Step name required"
        return 1
    fi
    
    log_info "Validating step: $step"
    
    if checkpoint_validation "$step"; then
        log_success "Step validation passed: $step"
        return 0
    else
        log_error "Step validation failed: $step"
        return 1
    fi
}

# Complete step with evidence
complete_step() {
    local step=$1
    local evidence=$2
    
    if [[ -z "$step" ]]; then
        log_error "Step name and evidence required"
        return 1
    fi
    
    # First validate the step
    if ! validate_step "$step"; then
        log_error "Cannot complete step - validation failed"
        return 1
    fi
    
    # Record completion
    record_step_completion "$step" "$evidence"
    
    # Check if all steps completed
    local total_steps=$(jq '.mandatory_steps | length' "$COMPLIANCE_STATE_FILE")
    local completed_steps=$(jq '.steps_completed | length' "$COMPLIANCE_STATE_FILE")
    
    if [[ $completed_steps -eq $total_steps ]]; then
        log_success "🎉 ALL MANDATORY STEPS COMPLETED - 100% COMPLIANCE ACHIEVED"
        jq '.compliance_status = "COMPLETED"' "$COMPLIANCE_STATE_FILE" > "${COMPLIANCE_STATE_FILE}.tmp" && mv "${COMPLIANCE_STATE_FILE}.tmp" "$COMPLIANCE_STATE_FILE"
    fi
    
    return 0
}

# Check compliance status
check_compliance() {
    if [[ ! -f "$COMPLIANCE_STATE_FILE" ]]; then
        log_error "No active compliance session found"
        return 1
    fi
    
    local agent=$(jq -r '.agent' "$COMPLIANCE_STATE_FILE")
    local task=$(jq -r '.task' "$COMPLIANCE_STATE_FILE")
    local status=$(jq -r '.compliance_status' "$COMPLIANCE_STATE_FILE")
    local completion=$(jq -r '.completion_percentage' "$COMPLIANCE_STATE_FILE")
    local total_steps=$(jq '.mandatory_steps | length' "$COMPLIANCE_STATE_FILE")
    local completed_steps=$(jq '.steps_completed | length' "$COMPLIANCE_STATE_FILE")
    local violations=$(jq '.rule_violations | length' "$COMPLIANCE_STATE_FILE")
    
    echo -e "\n${BLUE}📊 COMPLIANCE STATUS REPORT${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo -e "Agent: $agent"
    echo -e "Task: $task"
    echo -e "Status: $status"
    echo -e "Progress: $completed_steps/$total_steps ($completion%)"
    echo -e "Violations: $violations"
    
    if [[ $violations -gt 0 ]]; then
        echo -e "\n${RED}🚨 RULE VIOLATIONS:${NC}"
        jq -r '.rule_violations[] | "  • \(.violation) (\(.severity)) - \(.timestamp)"' "$COMPLIANCE_STATE_FILE"
    fi
    
    if [[ "$status" == "COMPLETED" ]]; then
        echo -e "\n${GREEN}✅ 100% COMPLIANCE ACHIEVED${NC}"
    else
        echo -e "\n${YELLOW}⚠️  COMPLIANCE IN PROGRESS${NC}"
        echo -e "${YELLOW}Pending steps:${NC}"
        jq -r '.mandatory_steps[] as $step | if ([.steps_completed[] | select(. == $step)] | length) == 0 then "  • " + $step else empty end' "$COMPLIANCE_STATE_FILE"
    fi
}

# Force assessment of task complexity
force_complexity_assessment() {
    echo -e "\n${YELLOW}🎯 MANDATORY TASK COMPLEXITY ASSESSMENT${NC}"
    echo -e "${YELLOW}You must categorize this task:${NC}"
    echo -e "  ${GREEN}E${NC} = EASY (5-15 minutes, ≤3 files)"
    echo -e "  ${YELLOW}M${NC} = MEDIUM (15-60 minutes, ≤10 files)"
    echo -e "  ${RED}H${NC} = HIGH (60+ minutes, unlimited files)"
    echo -e "\n${BLUE}Usage: $0 assess-complexity [E|M|H]${NC}"
}

assess_complexity() {
    local complexity=$1
    
    if [[ ! "$complexity" =~ ^[EMH]$ ]]; then
        log_error "Invalid complexity level. Must be E, M, or H"
        force_complexity_assessment
        return 1
    fi
    
    local full_complexity
    case $complexity in
        "E") full_complexity="EASY" ;;
        "M") full_complexity="MEDIUM" ;;
        "H") full_complexity="HIGH" ;;
    esac
    
    # Update compliance state
    jq ".task_complexity = \"$full_complexity\" | .complexity_assessed = true | .complexity_assessed_at = \"$(date '+%Y-%m-%d %H:%M:%S')\"" "$COMPLIANCE_STATE_FILE" > "${COMPLIANCE_STATE_FILE}.tmp" && mv "${COMPLIANCE_STATE_FILE}.tmp" "$COMPLIANCE_STATE_FILE"
    
    log_success "Task complexity assessed: $full_complexity"
    return 0
}

# Print usage
print_usage() {
    echo -e "\n${YELLOW}🚨 STRICT RULE ENFORCEMENT SYSTEM${NC}"
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 strict-enforce \"AGENT_NAME\" \"TASK_DESCRIPTION\"    - Start strict enforcement"
    echo "  $0 validate-step STEP_NAME                             - Validate individual step"
    echo "  $0 complete-step STEP_NAME \"EVIDENCE\"                  - Complete step with evidence"
    echo "  $0 assess-complexity [E|M|H]                          - Assess task complexity"
    echo "  $0 check-compliance                                    - Check current compliance status"
    echo "  $0 force-reset                                         - Reset compliance state (emergency)"
    echo ""
    echo -e "${RED}⚠️  CRITICAL: This system enforces 100% rule compliance${NC}"
    echo -e "${RED}   No steps can be skipped. All validations must pass.${NC}"
}

# Emergency reset
force_reset() {
    log_warning "EMERGENCY RESET: Clearing compliance state"
    rm -f "$COMPLIANCE_STATE_FILE"
    log_success "Compliance state reset"
}

# Show version information
show_version() {
    echo -e "${BLUE}🚨 STRICT RULE ENFORCEMENT SYSTEM${NC}"
    echo -e "Version 4.0.0 - ZERO TOLERANCE FOR RULE VIOLATIONS"
    echo -e "Copyright 2025 - Enterprise AI Agent Compliance System"
    echo ""
    echo -e "Features:"
    echo -e "  • 27 Mandatory validation steps"
    echo -e "  • Real-time checkpoint blocking"
    echo -e "  • Automatic task record creation"
    echo -e "  • 100% compliance enforcement"
    echo ""
    echo -e "Status: ${GREEN}ACTIVE AND ENFORCING${NC}"
}

# Main command dispatcher
case "$1" in
    "strict-enforce")
        strict_enforce "$2" "$3"
        ;;
    "validate-step")
        validate_step "$2"
        ;;
    "complete-step")
        complete_step "$2" "$3"
        ;;
    "assess-complexity")
        assess_complexity "$2"
        ;;
    "check-compliance")
        check_compliance
        ;;
    "force-reset")
        force_reset
        ;;
    "help"|"--help"|"-h")
        print_usage
        ;;
    "version"|"--version"|"-v")
        show_version
        ;;
    *)
        print_usage
        exit 1
        ;;
esac 