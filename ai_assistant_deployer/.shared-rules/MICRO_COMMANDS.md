# 🚀 COMMAND REFERENCE - ALL AVAILABLE COMMANDS
**Complete command guide for AI agents**

## 🎯 ESSENTIAL COMMANDS (95% coverage)

### **MANDATORY START:**
```bash
# Initialize enforcement (ALWAYS FIRST)
.shared-rules/rule-enforcer.sh strict-enforce "AGENT_NAME" "TASK_DESC"

# Check your progress 
.shared-rules/rule-enforcer.sh check-compliance
```

### **STEP MANAGEMENT:**
```bash
# Validate specific step
.shared-rules/rule-enforcer.sh validate-step STEP_NAME

# Complete step with evidence
.shared-rules/rule-enforcer.sh complete-step STEP_NAME "Evidence text"

# Assess task complexity (required)
.shared-rules/rule-enforcer.sh assess-complexity [E|M|H]
```

### **TASK SYSTEM:**
```bash
# Create new epic (for large tasks)
.shared-rules/task-system/task-manager.sh epic create "Epic Name"

# Monitor system status
.shared-rules/task-system/monitor.sh status

# Interactive task management
.shared-rules/task-system/task-manager.sh interactive

# Complete specific task
.shared-rules/task-system/task-manager.sh task complete TASK_ID "Notes"
```

### **SYSTEM STATUS:**
```bash
# Check module configuration
.shared-rules/module-manager.sh status

# Update project structure map
.shared-rules/update_project_map_flutter_only.sh

# Initialize task system (if needed)
.shared-rules/task-system/init.sh

# System cleanup
.shared-rules/task-system/cleanup.sh

# Create safety backup
.shared-rules/setup-backup-safety.sh setup
```

## ⚡ ADVANCED COMMANDS (rare use)

### **EMERGENCY PROCEDURES:**
```bash
# Force reset enforcement (emergency only)
.shared-rules/rule-enforcer.sh force-reset

# System health check
.shared-rules/verification/comprehensive_system_test.sh
```

### **MODULE MANAGEMENT:**
```bash
# Enable/disable modules
.shared-rules/module-manager.sh enable MODULE_NAME
.shared-rules/module-manager.sh disable MODULE_NAME

# Change system complexity
.shared-rules/module-manager.sh set-mode [simple|standard|enterprise]
```

### **TASK MANAGEMENT (ADVANCED):**
```bash
# Decompose complex task
.shared-rules/task-system/decompose-task.sh "Task Name"

# Complete specific task
.shared-rules/task-system/complete-task.sh TASK_ID

# Orchestrate massive task
.shared-rules/task-system/massive_task_orchestrator.sh orchestrate "Epic Name"

# Priority queue management
.shared-rules/task-system/priority-queue-manager.sh add "Task" HIGH
```

### **BACKGROUND SERVICES:**
```bash
# Start auto-save daemon
.shared-rules/task-system/auto-save-daemon.sh start

# Start interrupt handler
.shared-rules/task-system/enhanced-interrupt-handler.sh start

# Cross-machine sync
.shared-rules/task-system/cross-machine-sync.sh sync
```

---
**🎯 90% of agents only need the ESSENTIAL commands section**
