# 🚫 SCRIPT ACCESS RULES FOR AI AGENTS
**Version**: 1.0.0  
**Purpose**: Define agent behavior for pre-configured scripts to prevent context pollution

---

## 🎯 CORE PRINCIPLE: "BLACK BOX" EXECUTION

AI agents must treat pre-configured scripts as **BLACK BOXES** - execute without reading internal content to preserve context window space.

---

## 🔒 FORBIDDEN ACTIONS - NEVER DO THESE

### **❌ READING SCRIPT CONTENTS**
```bash
# FORBIDDEN - Never read these files
cat .shared-rules/rule-enforcer.sh           # ❌ FORBIDDEN
cat .shared-rules/module-manager.sh          # ❌ FORBIDDEN  
cat .shared-rules/setup-backup-safety.sh     # ❌ FORBIDDEN
cat .shared-rules/update_project_map.sh # ❌ FORBIDDEN
cat .shared-rules/task-system/*.sh           # ❌ FORBIDDEN
cat .shared-rules/verification/*.sh          # ❌ FORBIDDEN

# All scripts have BLACK BOX headers - DO NOT READ INTERNALS
head .shared-rules/*.sh                      # ❌ FORBIDDEN
grep -r "function" .shared-rules/            # ❌ FORBIDDEN
vim .shared-rules/task-system/monitor.sh     # ❌ FORBIDDEN
```

### **❌ ANALYZING SCRIPT INTERNALS**
- Don't examine script logic
- Don't try to understand implementation
- Don't debug script contents
- Don't modify script parameters

---

## ✅ ALLOWED ACTIONS - ONLY THESE ARE PERMITTED

### **✅ EXECUTION COMMANDS**
```bash
# ALLOWED - Execute with trust
.shared-rules/rule-enforcer.sh strict-enforce "Agent" "Task"
.shared-rules/rule-enforcer.sh check-compliance
.shared-rules/rule-enforcer.sh validate-step STEP_NAME
.shared-rules/rule-enforcer.sh complete-step STEP_NAME "Evidence"

# ALLOWED - Task system commands
.shared-rules/task-system/task-manager.sh create "Task Name"
.shared-rules/task-system/monitor.sh status
.shared-rules/task-system/create-epic.sh "Epic Name"

# ALLOWED - Module management
.shared-rules/module-manager.sh status
.shared-rules/module-manager.sh list-active

# ALLOWED - System verification
.shared-rules/verification/comprehensive_system_test.sh
```

### **✅ HELP AND USAGE**
```bash
# ALLOWED - Get help without reading internals
.shared-rules/rule-enforcer.sh --help
.shared-rules/rule-enforcer.sh help
.shared-rules/task-system/task-manager.sh --help
```

---

## 📋 SCRIPT INTERFACE SPECIFICATIONS

### **rule-enforcer.sh**
```bash
# Purpose: Main rule enforcement engine
# Interface: Command-based execution
# Usage: Execute commands, trust the output

# Available commands:
strict-enforce "Agent" "Task"     # Start enforcement
check-compliance                  # Check status
validate-step STEP_NAME           # Validate step
complete-step STEP_NAME "Evidence" # Complete step
assess-complexity [E|M|H]         # Assess task
```

### **task-system/task-manager.sh**
```bash
# Purpose: Task management system
# Interface: Command-based task operations
# Usage: Create, monitor, complete tasks

# Available commands:
create "Task Name"                # Create new task
list                             # List all tasks
status                           # Show task status
complete TASK_ID                 # Complete task
```

### **task-system/monitor.sh**
```bash
# Purpose: System monitoring
# Interface: Status reporting
# Usage: Monitor system health

# Available commands:
status                           # Show system status
health                          # System health check
performance                     # Performance metrics
```

### **module-manager.sh**
```bash
# Purpose: Module configuration management
# Interface: Module operations
# Usage: Manage active modules

# Available commands:
status                          # Show module status
list-active                     # List active modules
enable MODULE_NAME              # Enable module
disable MODULE_NAME             # Disable module
```

### **setup-backup-safety.sh**
```bash
# Purpose: Backup and safety management
# Interface: Safety operation commands
# Usage: Create backups and safety checkpoints

# Available commands:
setup                           # Initialize backup system
create-checkpoint               # Create safety checkpoint
validate-space                  # Check disk space
```

### **update_project_map.sh**
```bash
# Purpose: Project structure mapping
# Interface: Documentation generation
# Usage: Generate real-time project map

# Available commands:
[no parameters]                 # Generate PROJECT_MAP.md
--force                         # Force regeneration
```

### **task-system/init.sh**
```bash
# Purpose: Task system initialization
# Interface: Initialization commands
# Usage: Initialize task management system

# Available commands:
[no parameters]                 # Initialize task system
--reset                         # Reset task system state
```

### **task-system/create-epic.sh**
```bash
# Purpose: Epic creation and management
# Interface: Epic operations
# Usage: Create and manage large task epics

# Available commands:
"Epic Name"                     # Create new epic
"Epic Name" --complexity=HIGH   # Create complex epic
```

### **task-system/complete-task.sh**
```bash
# Purpose: Task completion management
# Interface: Task completion operations
# Usage: Complete and archive tasks

# Available commands:
TASK_ID                         # Complete specific task
TASK_ID "completion notes"      # Complete with notes
```

### **task-system/cleanup.sh**
```bash
# Purpose: System cleanup and maintenance
# Interface: Cleanup operations
# Usage: Clean temporary files and maintain system

# Available commands:
[no parameters]                 # Standard cleanup
--deep                          # Deep system cleanup
--logs                          # Clean logs only
```

### **task-system/decompose-task.sh**
```bash
# Purpose: Task decomposition
# Interface: Task breakdown operations
# Usage: Break complex tasks into subtasks

# Available commands:
"Task Name"                     # Decompose task
"Task Name" --depth=3           # Decompose with depth limit
```

### **task-system/massive_task_orchestrator.sh**
```bash
# Purpose: Large task orchestration
# Interface: Orchestration operations
# Usage: Manage massive multi-task operations

# Available commands:
orchestrate "Epic Name"         # Start orchestration
status                          # Check orchestration status
```

### **verification/comprehensive_system_test.sh**
```bash
# Purpose: Complete system verification
# Interface: Testing operations
# Usage: Run comprehensive system tests

# Available commands:
[no parameters]                 # Run all tests
--quick                         # Quick validation only
--detailed                      # Detailed test report
```

## 🔧 ADVANCED SCRIPT INTERFACES

### **task-system/auto-save-daemon.sh**
```bash
# Purpose: Automatic saving daemon
# Interface: Background service operations
# Usage: Automatic state preservation

# Available commands:
start                           # Start auto-save daemon
stop                            # Stop daemon
status                          # Check daemon status
```

### **task-system/bash_compatibility_enhancer.sh**
```bash
# Purpose: Bash compatibility enhancements
# Interface: System enhancement
# Usage: Improve bash compatibility across versions

# Available commands:
enhance                         # Apply compatibility fixes
check                           # Check compatibility status
```

### **task-system/cross-machine-sync.sh**
```bash
# Purpose: Cross-machine synchronization
# Interface: Sync operations
# Usage: Synchronize state across multiple machines

# Available commands:
sync                            # Start synchronization
status                          # Check sync status
```

### **task-system/enhanced-interrupt-handler.sh**
```bash
# Purpose: Advanced interrupt handling
# Interface: Interrupt management
# Usage: Handle system interruptions gracefully

# Available commands:
start                           # Start interrupt monitoring
handle SIGNAL                   # Handle specific signal
```

### **task-system/priority-queue-manager.sh**
```bash
# Purpose: Priority queue management
# Interface: Queue operations
# Usage: Manage task priority queues

# Available commands:
add TASK PRIORITY               # Add task to queue
process                         # Process queue
status                          # Show queue status
```

### **task-system/task-integration-api.sh**
```bash
# Purpose: Task integration API
# Interface: API operations  
# Usage: Integration interface for task system

# Available commands:
create-task "Task Name"         # Create via API
get-status TASK_ID              # Get task status
update-task TASK_ID "data"      # Update task data
```

---

## 🛡️ TRUST-BASED EXECUTION RULES

### **1. EXECUTE WITH CONFIDENCE**
- Scripts are pre-tested and validated
- Output is reliable and actionable
- No need to verify implementation

### **2. FOCUS ON RESULTS**
- Pay attention to script output
- Act on returned information
- Trust the system's responses

### **3. ERROR HANDLING**
```bash
# If script fails, trust the error message
if ! .shared-rules/rule-enforcer.sh check-compliance; then
    echo "Compliance check failed - following script guidance"
    # Act on the error message, don't read script
fi
```

---

## 📊 CONTEXT PRESERVATION BENEFITS

### **BEFORE (Reading Scripts)**
- Context window: 4000+ tokens used for script analysis
- Focus: Divided between script understanding and task execution
- Efficiency: Reduced due to internal analysis

### **AFTER (Black Box Execution)**
- Context window: 200-300 tokens for commands only
- Focus: 100% on task execution and results
- Efficiency: Maximum - no wasted cognitive load

---

## 🎯 PRACTICAL IMPLEMENTATION

### **Agent Workflow:**
1. **Execute** command without reading script
2. **Analyze** output/results
3. **Act** based on returned information
4. **Trust** the system's guidance

### **Example Execution:**
```bash
# CORRECT APPROACH
echo "Starting rule enforcement..."
.shared-rules/rule-enforcer.sh strict-enforce "MyAgent" "Flutter refactoring"
# Read output, follow guidance, proceed

# WRONG APPROACH - NEVER DO THIS
echo "Let me first understand what rule-enforcer.sh does..."
cat .shared-rules/rule-enforcer.sh  # ❌ FORBIDDEN
```

---

## 🚨 VIOLATION CONSEQUENCES

### **If Agent Reads Script Contents:**
- ❌ Context window pollution
- ❌ Reduced focus on actual task
- ❌ Unnecessary cognitive overhead
- ❌ Potential misunderstanding of implementation

### **Recommended Response:**
```bash
# If agent tries to read scripts
echo "🚫 RULE VIOLATION: Reading script contents is forbidden"
echo "✅ CORRECT ACTION: Execute command and trust output"
```

---

## 📝 SUMMARY FOR AI AGENTS

### **DO:**
- ✅ Execute scripts as black boxes
- ✅ Trust script output and guidance
- ✅ Focus on task execution
- ✅ Preserve context window space

### **DON'T:**
- ❌ Read script contents
- ❌ Analyze implementation details
- ❌ Try to understand internal logic
- ❌ Waste context on script analysis

---

**🎯 RESULT: Efficient, focused agent behavior with maximum context preservation for actual task execution.**
