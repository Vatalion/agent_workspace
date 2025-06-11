# 📁 FOLDER STRUCTURE MODULE
**Module**: folder_structure  
**Version**: 3.2.0  
**Category**: CORE (Required)  
**Dependencies**: None  
**Cannot be disabled**

---

## 🏗️ MANDATORY FOLDER STRUCTURE

**⚠️ CRITICAL**: These folders are required for system operation

### **Core Required Folders**:
```
project_root/
├── .shared-rules/          # Rules and configuration system
│   ├── modules/           # Modular rule definitions
│   ├── modules.yaml       # Module configuration
│   └── rule-enforcer.sh   # Strict enforcement system
├── .temp/                  # Temporary files (AI agents MUST use)
├── .scripts/              # Generated scripts (AI agents MUST use)
└── docs/                  # Documentation files
```

### **Conditional Folders (Based on active modules)**:

#### **If backup_strategy module enabled**:
```
├── .history/              # IDE extension history files
└── .legacy/               # Legacy file versions
    └── [mirror structure] # Maintains original structure
```

#### **If task_management module enabled**:
```
├── .tasks/                # Task management system
│   ├── 1_planning/       # Task planning
│   ├── 2_execution/      # Active tasks
│   ├── 3_monitoring/     # Progress tracking
│   └── 4_completion/     # Completed tasks
```

#### **If clean_architecture module enabled**:
```
lib/
├── features/             # Feature-based organization
├── core/                # Data management layer
├── shared/              # Cross-cutting concerns
└── main.dart           # App entry point
```

---

## 🚨 FOLDER USAGE RULES

### **AI Agent Obligations (Always enforced)**:
1. **NO ROOT FOLDER USAGE**: Never create files in project root
2. **Use .temp/ for temporary files**: All working files go here
3. **Use .scripts/ for generated scripts**: All automation scripts go here
4. **Use docs/ for documentation**: When documentation is needed

### **Automatic Cleanup**:
- `.temp/` folder: Cleaned after each task
- `.scripts/` folder: Generated scripts removed after use
- Task-specific cleanup based on active modules

---

## 🔧 FOLDER VALIDATION

### **Basic Validation (Always performed)**:
```bash
# Check core folders exist
[ -d ".shared-rules" ] || error "Missing .shared-rules folder"
[ -d ".temp" ] || mkdir -p ".temp"
[ -d ".scripts" ] || mkdir -p ".scripts"
[ -d "docs" ] || mkdir -p "docs"
```

### **Module-based Validation**:
```bash
# Check backup folders (if backup_strategy enabled)
if module_enabled "backup_strategy"; then
  [ -d ".history" ] || warning "History folder missing"
  [ -d ".legacy" ] || mkdir -p ".legacy"
fi

# Check task folders (if task_management enabled)
if module_enabled "task_management"; then
  [ -d ".tasks" ] || initialize_task_system
fi
```

---

## 📊 FOLDER MONITORING

### **Usage Tracking**:
- Monitor `.temp/` folder size
- Track `.scripts/` folder contents
- Validate folder structure compliance

### **Cleanup Automation**:
- Remove old temporary files (>24 hours)
- Clean up completed scripts
- Archive old task files

---

## 🎯 FOLDER PERMISSIONS

### **Read/Write Access**:
- ✅ `.temp/`: Full AI agent access
- ✅ `.scripts/`: Full AI agent access
- ✅ `docs/`: Full AI agent access
- ⚠️ `.shared-rules/`: Read access, controlled write
- ❌ Root folder: No file creation allowed

### **Security Restrictions**:
- Cannot modify core system files
- Cannot create files outside designated folders
- Cannot bypass folder structure requirements

---

**🎯 PURPOSE**: Ensures organized, secure, and maintainable folder structure while preventing root folder pollution and enabling proper cleanup automation. 