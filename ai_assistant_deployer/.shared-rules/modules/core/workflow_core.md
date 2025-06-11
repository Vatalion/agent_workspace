# 🎯 CORE WORKFLOW MODULE
**Module**: core_workflow  
**Version**: 3.2.0  
**Category**: CORE (Required)  
**Dependencies**: None  
**Cannot be disabled**

---

## 📋 ESSENTIAL WORKFLOW (6 STEPS)

**⚠️ CRITICAL**: Simplified workflow for modular system

### **Required Steps (Cannot be skipped)**:

1. **READ**: `.shared-rules/PROJECT_MAP.md` (🚨 MANDATORY: Project structure overview)
2. **READ**: `README.md` (Project overview)
3. **READ**: `.shared-rules/modules.yaml` (Active modules configuration)
4. **CHECK**: Active modules and complexity level
5. **ASSESS**: Task complexity: E(5-15min) | M(15-60min) | H(60min+)
6. **VALIDATE**: Changes against active rules only
7. **CLEAN**: Remove temporary artifacts

### **Optional Steps (Based on active modules)**:
- **INITIALIZE**: Task system (if task_management module enabled)
- **UPDATE**: Project map (if file_practices module enabled)
- **MONITOR**: Progress (if performance_monitoring module enabled)
- **BACKUP**: State (if backup_strategy module enabled)

---

## 🔧 WORKFLOW ADAPTION

### Based on System Mode:

#### **SIMPLE MODE (6 steps)**
```
1. Read README.md
2. Check active modules (core only)
3. Assess complexity (basic)
4. Make changes
5. Basic validation
6. Clean up
```

#### **STANDARD MODE (8-10 steps)**
```
1-6. Core workflow steps
7. Architecture validation (if clean_architecture enabled)
8. File practice validation (if file_practices enabled)
9. Git workflow (if git_workflow enabled)
10. Backup verification (if backup_strategy enabled)
```

#### **ENTERPRISE MODE (12-16 steps)**
```
1-10. Standard workflow steps
11. Task management (if task_management enabled)
12. Security validation (if security_validation enabled)
13. Performance monitoring (if performance_monitoring enabled)
14. Cross-machine sync (if cross_machine_sync enabled)
15. Enterprise compliance (if enterprise_standards enabled)
16. Complete system verification
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Workflow Skipping Rules:
- Skip task management if `task_management: false`
- Skip monitoring if `performance_monitoring: false`
- Skip enterprise checks if `enterprise_mode: false`
- Skip backup verification if `backup_strategy: false`

### Validation Levels:
- **Minimal**: File existence only
- **Standard**: Basic rule compliance
- **Full**: Complete enterprise validation

---

## 🚨 CRITICAL REQUIREMENTS

### Non-Negotiable Steps:
1. **Module Configuration Check**: Always verify active modules
2. **Basic Validation**: Ensure changes don't break core functionality
3. **Cleanup**: Remove temporary files (always required)

### Conditional Requirements:
- Git commits (only if `git_workflow: true`)
- Task creation (only if `task_management: true`)
- Performance tracking (only if `performance_monitoring: true`)

---

**🎯 PURPOSE**: This module provides the essential workflow backbone that adapts based on active modules, ensuring optimal performance while maintaining functionality. 