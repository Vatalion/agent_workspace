# 📋 TASK MANAGEMENT MODULE
**Module**: task_management  
**Version**: 1.0.0  
**Category**: OPERATIONS (Critical)  
**Dependencies**: core_workflow, folder_structure  

---

## 📋 MANDATORY TASK LIFECYCLE

### **Task Creation Requirements**
Every AI agent task MUST create a task record in `.tasks/` folder following this structure:

```json
{
  "task": {
    "id": "task_YYYY-MM-DD_HH-MM-SS_description",
    "name": "Human readable task name",
    "agent": "Agent identifier",
    "complexity": "EASY|MEDIUM|HIGH",
    "status": "planning|active|paused|completed|failed",
    "createdAt": "YYYY-MM-DD HH:MM:SS",
    "updatedAt": "YYYY-MM-DD HH:MM:SS"
  },
  "estimates": {
    "hours": 1.5,
    "maxFiles": 10
  },
  "progress": {
    "phase": "current_phase",
    "completion": 75
  },
  "execution": {
    "phases": [
      {
        "name": "Phase 1: Analysis",
        "status": "completed|in_progress|pending",
        "duration": "30 minutes"
      }
    ]
  },
  "cleanup": {
    "temporaryFiles": [],
    "generatedReports": [],
    "scriptsCreated": []
  }
}
```

---

## 🗂️ TASK ORGANIZATION

### **Task States & Locations**
```
.tasks/
├── 1_planning/
│   ├── pending/           # Tasks awaiting approval
│   └── approved/          # Tasks ready for execution
├── 2_preparation/
│   ├── blocked/           # Tasks blocked by dependencies
│   └── ready/             # Tasks ready to start
├── 3_execution/
│   ├── active/            # Currently executing tasks
│   └── paused/            # Temporarily suspended tasks
└── 4_completion/
    ├── completed/         # Successfully completed tasks
    └── archived/          # Long-term storage
```

### **Epic Management**
For complex multi-task work, create epics using:
```bash
.shared-rules/task-system/create-epic.sh "Epic Name" --complexity=HIGH
```

---

## ⚡ COMPLEXITY ASSESSMENT

### **EASY Tasks** (E)
- **Duration**: 5-15 minutes
- **Files Affected**: ≤3 files
- **Examples**: Bug fixes, documentation updates, simple refactoring
- **Planning Required**: Minimal

### **MEDIUM Tasks** (M)
- **Duration**: 15-60 minutes
- **Files Affected**: ≤10 files
- **Examples**: Feature additions, architecture changes, complex refactoring
- **Planning Required**: Basic breakdown

### **HIGH Tasks** (H)
- **Duration**: 60+ minutes
- **Files Affected**: Unlimited
- **Examples**: Major refactoring, new features, system overhauls
- **Planning Required**: Epic creation with phases

---

## 🔄 MANDATORY WORKFLOW STEPS

### **For Every Task (No Exceptions)**:

1. **Create Task Record**: Always create task file in appropriate `.tasks/` subfolder
2. **Assess Complexity**: Categorize as E/M/H based on scope
3. **Plan Execution**: Break down into phases for M/H complexity
4. **Monitor Progress**: Update task status and completion percentage
5. **Document Results**: Record outcomes, issues, and lessons learned
6. **Clean Up**: Remove temporary files, archive artifacts
7. **Move to Completion**: Transfer task file to appropriate completion folder

---

## 🚨 ENFORCEMENT RULES

### **Rule Violations**
- **CRITICAL**: Starting work without task record creation
- **HIGH**: Skipping complexity assessment
- **MEDIUM**: Not updating progress status
- **LOW**: Incomplete cleanup documentation

### **Compliance Validation**
```bash
# Check if task record exists
if [[ ! -f ".tasks/3_execution/active/task_$(date +%Y-%m-%d)_*.json" ]]; then
    echo "VIOLATION: No active task record found"
    return 1
fi

# Validate task structure
jq '.task.complexity' .tasks/3_execution/active/task_*.json >/dev/null || {
    echo "VIOLATION: Invalid task structure"
    return 1
}
```

---

## 🛠️ INTEGRATION WITH RULE ENFORCER

### **CREATE_TASK_RECORD Step Implementation**
When rule enforcer reaches CREATE_TASK_RECORD step:

```bash
create_task_record() {
    local task_name="$1"
    local complexity="$2"
    local agent_name="$3"
    
    local task_id="task_$(date +%Y-%m-%d_%H-%M-%S)_$(echo "$task_name" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')"
    local task_file=".tasks/3_execution/active/${task_id}.json"
    
    # Create task record
    cat > "$task_file" <<EOF
{
  "task": {
    "id": "$task_id",
    "name": "$task_name",
    "agent": "$agent_name",
    "complexity": "$complexity",
    "status": "active",
    "createdAt": "$(date '+%Y-%m-%d %H:%M:%S')",
    "updatedAt": "$(date '+%Y-%m-%d %H:%M:%S')"
  },
  "estimates": {
    "hours": $(get_estimated_hours "$complexity"),
    "maxFiles": $(get_max_files "$complexity")
  },
  "progress": {
    "phase": "initialization",
    "completion": 0
  },
  "cleanup": {
    "temporaryFiles": [],
    "generatedReports": [],
    "scriptsCreated": []
  }
}
EOF
    
    echo "Task record created: $task_file"
    return 0
}
```

---

## 📊 MONITORING & REPORTING

### **Real-time Monitoring**
```bash
# Monitor active tasks
.shared-rules/task-system/monitor.sh --real-time

# Generate progress report
.shared-rules/task-system/report.sh --summary
```

### **Completion Metrics**
- Task completion rate
- Average task duration by complexity
- Agent productivity metrics
- Rule compliance percentage

---

## 🎯 SUCCESS CRITERIA

### **Agent Compliance**
- [ ] 100% of tasks have task records
- [ ] All tasks properly categorized by complexity
- [ ] Progress updates at least every 30 minutes for active tasks
- [ ] Proper cleanup and completion documentation

### **System Health**
- [ ] No orphaned tasks in active state
- [ ] Task lifecycle respected (no skipping states)
- [ ] Monitoring system operational
- [ ] Regular compliance audits passing

---

**🎯 PURPOSE**: Ensure systematic task tracking, proper planning, and accountability for all AI agent work while maintaining clean project organization and enabling progress monitoring.
