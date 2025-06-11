d# 🚨 AI AGENT INSTRUCTIONS - ENTERPRISE MODE
**Version 6.0.0 - Memory Optimized (17/18 modules active)**

## ⚡ START HERE (2 Commands Only)

```bash
# 1. MANDATORY FIRST STEP (initializes everything)
.shared-rules/rule-enforcer.sh strict-enforce "YOUR_NAME" "TASK_DESCRIPTION"

# 2. CHECK WHAT TO DO (shows your checklist)
.shared-rules/rule-enforcer.sh check-compliance
```

## 🎯 THAT'S ALL YOU NEED TO KNOW!

The system will:
- ✅ Generate your personalized compliance checklist (15-27 steps)
- ✅ Guide you through each mandatory validation  
- ✅ Block progress until requirements are met
- ✅ Track all evidence and maintain audit trail

### **📋 Need More Commands?**
See `MICRO_COMMANDS.md` for the complete command reference.

### **🚫 MEMORY RULE: NEVER READ SCRIPT CONTENTS**
- ❌ Never `cat` or read `.sh` script files  
- ✅ Execute commands as black boxes only
- 🎯 Focus your context window on actual work

---

**🚨 ENTERPRISE MODE ACTIVE: 17 modules enforcing strict compliance**

### **STEP 1: INITIALIZATION (REQUIRED)**
```bash
# MANDATORY: Start strict enforcement
.shared-rules/rule-enforcer.sh strict-enforce "YourAgentName" "Your task description"
```

### **STEP 2: READ MANDATORY STEPS (REQUIRED)**
- System will generate ALL mandatory steps based on active modules
- Review the complete checklist (6-27 steps depending on complexity)
- Understand ALL validation requirements
- **NO STEP CAN BE SKIPPED**

### **STEP 3: FOLLOW STEP-BY-STEP PROCESS (REQUIRED)**
For each mandatory step:
```bash
# Validate the step (BLOCKS until requirements met)
.shared-rules/rule-enforcer.sh validate-step STEP_NAME

# Complete the step with evidence
.shared-rules/rule-enforcer.sh complete-step STEP_NAME "Evidence of completion"
```

### **STEP 4: MONITOR PROGRESS (REQUIRED)**
```bash
# Check your compliance status anytime
.shared-rules/rule-enforcer.sh check-compliance
```

### **STEP 5: ASSESS COMPLEXITY (MANDATORY)**
```bash
# MUST assess task complexity before validation passes
.shared-rules/rule-enforcer.sh assess-complexity [E|M|H]
```

---

## 🔥 ENFORCEMENT MECHANISMS - HOW IT FORCES COMPLIANCE

### **1. BLOCKING VALIDATIONS**
Each step has **MANDATORY CHECKPOINTS** that must pass:
- **READ_README**: Verifies README.md exists and is accessible
- **VALIDATE_FOLDER_STRUCTURE**: Checks all required directories exist
- **VALIDATE_CLEAN_ARCHITECTURE**: Scans for architecture violations
- **SECURITY_SCAN**: Detects hardcoded secrets and vulnerabilities
- **RUN_UNIT_TESTS**: Ensures test files exist and are accessible

### **2. PROGRESS BLOCKING**
- **Cannot proceed** to next step until current validation passes
- **Error messages** explain exactly what needs to be fixed
- **No workarounds** or bypasses allowed

### **3. EVIDENCE REQUIREMENTS**
Every step completion requires **PROOF**:
- File changes made
- Commands executed
- Test results
- Validation confirmations

### **4. AUDIT TRAIL**
Complete logging of:
- All commands executed
- Validation results
- Step completion times
- Evidence provided
- Rule violations (if any)

---

## 📊 COMPLIANCE LEVELS BY SYSTEM MODE

### **SIMPLE MODE (6-9 steps)**
```
1. READ_README ✅
2. READ_MODULE_CONFIG ✅
3. VALIDATE_FOLDER_STRUCTURE ✅
4. ASSESS_TASK_COMPLEXITY ✅
5. VALIDATE_CHANGES ✅
6. CLEANUP_ARTIFACTS ✅
```

### **STANDARD MODE (9-15 steps)**
```
1-6. Core steps (as above)
7. VALIDATE_CLEAN_ARCHITECTURE ✅
8. RUN_UNIT_TESTS ✅
9. CREATE_BACKUP_CHECKPOINT ✅
10. VALIDATE_GIT_STATUS ✅
+ Module-specific validations
```

### **ENTERPRISE MODE (15-27 steps)**
```
1-10. Standard steps (as above)
11. SECURITY_SCAN ✅
12. PERFORMANCE_BASELINE ✅
13. CREATE_TASK_RECORD ✅
14. CHECK_VULNERABILITIES ✅
15. MONITOR_RESOURCE_USAGE ✅
+ Full enterprise compliance
```

---

## 🚫 WHAT AGENTS CANNOT DO ANYMORE

### **IMPOSSIBLE ACTIONS:**
- ❌ Skip the initialization command
- ❌ Bypass validation checkpoints
- ❌ Proceed without evidence
- ❌ Ignore failed validations
- ❌ Skip mandatory steps
- ❌ Disable compliance tracking

### **BLOCKED SCENARIOS:**
- 🚫 "I'll just quickly skip the setup" - **BLOCKED**
- 🚫 "I don't need to run tests" - **BLOCKED**
- 🚫 "Let me bypass the security scan" - **BLOCKED**
- 🚫 "I'll skip the backup" - **BLOCKED**

---

## 📈 SUCCESS CRITERIA

### **100% COMPLIANCE ACHIEVED WHEN:**
- ✅ All mandatory steps completed
- ✅ All validations passed
- ✅ Evidence provided for each step
- ✅ Zero rule violations
- ✅ Complete audit trail
- ✅ Performance within thresholds

### **COMPLETION CONFIRMATION:**
```bash
# Must show "100% COMPLIANCE ACHIEVED"
.shared-rules/rule-enforcer.sh check-compliance
```

---

## 🆘 EMERGENCY PROCEDURES

### **IF ENFORCEMENT FAILS:**
```bash
# Emergency reset (use only if absolutely necessary)
.shared-rules/rule-enforcer.sh force-reset

# Restart strict enforcement
.shared-rules/rule-enforcer.sh strict-enforce "YourAgentName" "Task description"
```

### **IF VALIDATION BLOCKS PROGRESS:**
1. **DO NOT BYPASS** - fix the underlying issue
2. **Check logs** for specific error details  
3. **Resolve the issue** that caused validation failure
4. **Re-run validation** until it passes

---

## 📋 QUICK REFERENCE COMMANDS

```bash
# Start enforcement (MANDATORY FIRST STEP)
.shared-rules/rule-enforcer.sh strict-enforce "Agent" "Task"

# Check what you need to do
.shared-rules/rule-enforcer.sh check-compliance

# Validate a step
.shared-rules/rule-enforcer.sh validate-step STEP_NAME

# Complete a step
.shared-rules/rule-enforcer.sh complete-step STEP_NAME "Evidence"

# Assess complexity (MANDATORY)
.shared-rules/rule-enforcer.sh assess-complexity [E|M|H]
```

---

## 🛠️ TECHNICAL SYSTEM OVERVIEW

### **Core Components:**
- **rule-enforcer.sh** - Main enforcement engine
- **modules.yaml** - Active rule configuration
- **modules/** - Individual rule definitions
- **AI_AGENT_INSTRUCTIONS.md** - This file (complete guide)

### **State Management:**
- **Compliance State File**: Tracks progress in real-time (`/tmp/agent_compliance_state.json`)
- **Enforcement Log**: Complete audit trail (`/tmp/rule_enforcement_*.log`)
- **Evidence Archive**: All proof of completion

---

## 🎯 GUARANTEED RESULTS FOR PROJECT OWNERS

### **IMMEDIATE BENEFITS:**
- ✅ **100% Rule Compliance** - No more forgotten steps
- ✅ **Complete Accountability** - Full audit trail of all actions
- ✅ **Consistent Quality** - Every task follows same rigorous process
- ✅ **Evidence-Based Completion** - Proof of every step
- ✅ **Risk Mitigation** - No more "oops, I forgot to..."

### **LONG-TERM IMPACT:**
- 🎯 **No more cleanup tasks** from non-compliant work
- 🎯 **Predictable outcomes** from every agent
- 🎯 **Reduced oversight needed** - system enforces automatically
- 🎯 **Higher quality deliverables** - rigorous validation required

---

## 🚫 CRITICAL: SCRIPT ACCESS RULES (MANDATORY)

### **FORBIDDEN: NEVER READ SCRIPT CONTENTS**
```bash
# ❌ FORBIDDEN - Never waste context on these
cat .shared-rules/rule-enforcer.sh
cat .shared-rules/module-manager.sh  
cat .shared-rules/task-system/*.sh
cat .shared-rules/verification/*.sh
```

### **✅ ALLOWED: BLACK BOX EXECUTION ONLY**
```bash
# ✅ Execute without reading internals
.shared-rules/rule-enforcer.sh strict-enforce "Agent" "Task"
.shared-rules/rule-enforcer.sh check-compliance
.shared-rules/task-system/task-manager.sh create "Task"
.shared-rules/module-manager.sh status
```

### **🎯 CONTEXT PRESERVATION**
- Scripts are pre-configured and tested
- Execute commands, trust output
- Focus context on actual task work
- Never analyze script implementation

**📋 Full rules**: See `SCRIPT_ACCESS_RULES.md`

---

**🚨 CRITICAL: This is MANDATORY for ALL AI agents. 100% compliance is required. Zero exceptions allowed.**

**⚡ ENFORCEMENT IS ACTIVE - FOLLOW THESE RULES OR PROGRESS WILL BE BLOCKED**