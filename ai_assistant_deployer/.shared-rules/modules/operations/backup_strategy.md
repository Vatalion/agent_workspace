# 💾 Backup Strategy Module

**Version**: 3.2.0  
**Purpose**: Three-tier data protection system  
**Priority**: HIGH (Safety-critical system)

---

## 🚨 CRIT    # Ensure backup directory exists outside git
    mkdir -p ~/backups/PROJECT_NAME/{daily,manual,recovered}AL UPDATE: BACKUP LOCATION SAFETY

**⚠️ IMPORTANT**: After the 21GB backup catastrophe, all backups are now stored **OUTSIDE** the git repository to prevent accidental commits of large files.

### **New Backup Locations**:
```bash
# SAFE BACKUP LOCATIONS (Outside git repository)
~/backups/PROJECT_NAME/                    # User home directory backups
/tmp/m5-backups/                 # Temporary backups  
../m5-backups/                   # Parent directory backups
~/.m5-project-backups/           # Hidden home directory

# FORBIDDEN LOCATIONS (Inside git repository)
.tasks/system/backups/           # ❌ NEVER USE - Will be committed!
.backups/                        # ❌ NEVER USE - Will be committed!
backups/                         # ❌ NEVER USE - Will be committed!
```

---

## 🏗️ THREE-TIER BACKUP SYSTEM

### **Tier 1: Real-time Backup (.history/ folder)**
- **Location**: `.history/` (git-ignored, safe)
- **Content**: Timestamped file versions from IDE
- **Use Case**: Immediate recovery from recent changes
- **Retention**: 30 days
- **Size Limit**: 100MB max per folder

**Auto-generated file naming:**
```
.history/userService.dart_20240610_143022.dart
.history/authController.dart_20240610_143023.dart
```

### **Tier 2: Legacy Folder Recovery**
- **Location**: `.legacy/` folder (git-ignored, safe)
- **Content**: Previous working versions of refactored files
- **Use Case**: Functional reference, understanding previous implementation
- **Structure**: Mirrors main project structure
- **Size Limit**: 500MB max per folder

**Example Structure:**
```
.legacy/
└── lib/
    └── services/
        └── userService.dart (original version)
```

### **Tier 3: External System Backups**
- **Location**: `~/backups/PROJECT_NAME/` (OUTSIDE git repository)
- **Content**: Complete project snapshots
- **Use Case**: Disaster recovery, major rollbacks
- **Frequency**: Daily automated, before major changes
- **Retention**: 30 days, compressed

**Structure:**
```bash
~/backups/PROJECT_NAME/
├── daily/
│   ├── project_backup_20240610.tar.gz
│   └── project_backup_20240609.tar.gz
├── manual/
│   └── before_major_refactor_20240610.tar.gz
└── cleanup/
    └── old_backups.log
```

---

## 🔄 SAFE BACKUP AUTOMATION

### **Backup Script Configuration**:
```bash
#!/bin/bash
# SAFE BACKUP SCRIPT - Stores backups OUTSIDE git repository

# Configuration
PROJECT_ROOT="$(pwd)"
BACKUP_ROOT="$HOME/backups/$(basename "$PROJECT_ROOT")"
MAX_BACKUP_SIZE="1GB"

# Ensure backup directory exists outside git
mkdir -p "$BACKUP_ROOT/daily"
mkdir -p "$BACKUP_ROOT/manual"

# Create compressed backup outside git repository
create_safe_backup() {
    local backup_type=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_ROOT/$backup_type/m5_backup_$timestamp.tar.gz"
    
    echo "🔄 Creating safe backup: $backup_file"
    
    # Exclude git repository and other large files
    tar --exclude='.git' \
        --exclude='node_modules' \
        --exclude='build' \
        --exclude='*.log' \
        --exclude='*.tmp' \
        --exclude='.tasks/system/backups' \
        -czf "$backup_file" \
        -C "$PROJECT_ROOT/.." \
        "$(basename "$PROJECT_ROOT")"
    
    # Check backup size
    local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [ $size -gt 1073741824 ]; then  # 1GB
        echo "⚠️  WARNING: Backup is larger than 1GB ($size bytes)"
        echo "   Consider cleaning up project before backup"
    fi
    
    echo "✅ Safe backup created: $backup_file ($(stat -f%z "$backup_file" | numfmt --to=iec))"
}

# Automated daily backup
daily_backup() {
    create_safe_backup "daily"
    cleanup_old_backups "daily" 30
}

# Manual backup before major changes
manual_backup() {
    local description=${1:-"manual_backup"}
    create_safe_backup "manual/$description"
}

# Cleanup old backups
cleanup_old_backups() {
    local backup_type=$1
    local days=$2
    find "$BACKUP_ROOT/$backup_type" -name "*.tar.gz" -mtime +$days -delete
}
```

### **Integration with Module Manager**:
```bash
# Add to .shared-rules/module-manager.sh
safe_backup_check() {
    echo "🔍 Checking backup system safety..."
    
    # Ensure no backups in git directory
    if find . -name "*.tar.gz" -path "./.tasks/*" | head -1 | grep -q .; then
        echo "❌ ERROR: Backup files found in git repository!"
        echo "   Moving to safe location..."
        mkdir -p ~/backups/PROJECT_NAME/recovered/
        find ./.tasks -name "*.tar.gz" -exec mv {} ~/backups/PROJECT_NAME/recovered/ \;
        echo "✅ Backup files moved to ~/backups/PROJECT_NAME/recovered/"
    fi
    
    # Ensure backup directories exist outside git
    mkdir -p ~/backups/PROJECT_NAME/{daily,manual,recovered}
    echo "✅ Safe backup directories confirmed"
}
```

---

## 🔍 RECOVERY DECISION TREE

### **Recovery Strategy Selection**:
1. **Recent changes issue (< 1 day)** → Use `.history/` folder
2. **Functionality broken after refactor** → Use `.legacy/` folder  
3. **Major disaster or corruption** → Use external backups (`~/backups/PROJECT_NAME/`)
4. **Always test recovered code** → Before deployment

### **Safe Recovery Commands**:
```bash
# Recent changes recovery (safe, git-ignored)
cp .history/filename_YYYYMMDD_HHMMSS.ext lib/path/filename.ext

# Legacy recovery (safe, git-ignored)
cp .legacy/lib/path/filename.ext lib/path/filename.ext

# External backup recovery (OUTSIDE git)
cd ~/backups/PROJECT_NAME/daily/
tar -xzf project_backup_20240610.tar.gz
cp -r extracted_project/* /path/to/current/project/

# Git recovery (version controlled)
git checkout <commit_hash> -- lib/path/filename.ext
```

---

## 📊 BACKUP SAFETY MONITORING

### **Safety Health Check**:
```bash
backup_safety_check() {
    echo "🛡️  BACKUP SAFETY AUDIT:"
    
    # Check for dangerous backup locations
    echo "📍 Checking dangerous backup locations..."
    if [ -d ".tasks/system/backups" ]; then
        echo "❌ DANGER: .tasks/system/backups exists (could be committed to git)"
        echo "   Run: rm -rf .tasks/system/backups"
    fi
    
    if find . -name "*.tar.gz" -o -name "*.backup" | head -1 | grep -q .; then
        echo "❌ DANGER: Backup files found in project directory"
        echo "   These could be accidentally committed to git!"
        find . -name "*.tar.gz" -o -name "*.backup"
    fi
    
    # Check safe backup locations
    echo "📍 Checking safe backup locations..."
    echo "  External backups: $(ls ~/backups/PROJECT_NAME/daily/ 2>/dev/null | wc -l) files"
    echo "  History backups: $(ls .history/ 2>/dev/null | wc -l) files"
    echo "  Legacy backups: $(find .legacy/ -type f 2>/dev/null | wc -l) files"
    
    # Check .gitignore coverage
    echo "📍 Checking .gitignore coverage..."
    if grep -q "\.tar\.gz" .gitignore && grep -q "backups/" .gitignore; then
        echo "✅ .gitignore properly configured"
    else
        echo "❌ .gitignore missing backup file exclusions"
    fi
    
    echo "🎯 SAFETY SCORE: $(calculate_safety_score)%"
}

# Prevent git commits of backup files
prevent_backup_commits() {
    echo "🚨 Installing backup commit prevention..."
    
    # This is handled by our pre-commit hook
    if [ -x ".git/hooks/pre-commit" ]; then
        echo "✅ Pre-commit hook installed (prevents backup commits)"
    else
        echo "❌ No pre-commit hook found - backup files could be committed!"
    fi
}
```

---

## 🎯 UPDATED WORKFLOW INTEGRATION

### **Pre-refactoring Safety Checklist**:
- [ ] Current version committed to git
- [ ] External backup created (`~/backups/PROJECT_NAME/manual/`)  
- [ ] `.history/` extension working
- [ ] No backup files in git repository
- [ ] Pre-commit hook active

### **Post-refactoring Safety Validation**:
- [ ] Original moved to `.legacy/` (safe location)
- [ ] All imports updated
- [ ] Tests passing
- [ ] External backup successful  
- [ ] No backup files committed to git

---

**🎯 PURPOSE**: Provides comprehensive data protection through a three-tier backup system with **CRITICAL SAFETY MEASURES** to prevent backup files from being committed to git, avoiding repository bloat and the 21GB catastrophe.

**🚨 SAFETY GUARANTEE**: All backup files are stored outside the git repository or in git-ignored directories, with multiple safety checks and pre-commit hooks to prevent accidental commits. 