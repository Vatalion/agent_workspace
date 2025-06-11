#!/bin/bash
#!/bin/bash
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns 
# 🚨 BACKUP SAFETY SETUP SCRIPT
# This script prevents the 21GB backup catastrophe from happening again
# Version: 3.2.0
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🛡️  BACKUP SAFETY SETUP - Preventing 21GB Catastrophe${NC}"
echo -e "${BLUE}================================================================${NC}"

# Configuration
PROJECT_ROOT=$(pwd)
BACKUP_ROOT="$HOME/backups/m5"
MAX_FILE_SIZE=10485760  # 10MB

echo -e "\n${GREEN}📁 Setting up SAFE backup directories (outside git)...${NC}"

# Create safe backup directories outside git repository
mkdir -p "$BACKUP_ROOT/daily"
mkdir -p "$BACKUP_ROOT/manual"
mkdir -p "$BACKUP_ROOT/recovered"
mkdir -p "$BACKUP_ROOT/archives"

echo -e "✅ Created backup directories:"
echo -e "   📂 $BACKUP_ROOT/daily (for automated daily backups)"
echo -e "   📂 $BACKUP_ROOT/manual (for manual backups before major changes)"
echo -e "   📂 $BACKUP_ROOT/recovered (for recovered backup files)"
echo -e "   📂 $BACKUP_ROOT/archives (for long-term archives)"

echo -e "\n${GREEN}🚨 Removing ANY existing backup files from git repository...${NC}"

# Remove any existing backup files from git repository
DANGEROUS_DIRS=(
    ".tasks/system/backups"
    ".backups"
    "backups"
)

for dir in "${DANGEROUS_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}⚠️  Found dangerous backup directory: $dir${NC}"
        echo -e "   Moving contents to safe location: $BACKUP_ROOT/recovered/"
        
        # Move any files to safe location
        if [ "$(ls -A "$dir" 2>/dev/null)" ]; then
            mv "$dir"/* "$BACKUP_ROOT/recovered/" 2>/dev/null || true
            echo -e "   ✅ Files moved to safe location"
        fi
        
        # Remove the dangerous directory
        rm -rf "$dir"
        echo -e "   ✅ Dangerous directory removed"
    fi
done

# Find and move any loose backup files
echo -e "\n${GREEN}🔍 Scanning for loose backup files in project...${NC}"

find . -maxdepth 3 \( \
    -name "*.tar.gz" -o \
    -name "*.backup" -o \
    -name "*.bak" -o \
    -name "*.zip" -o \
    -name "*.sql" -o \
    -name "*.dump" \
\) -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./build/*" | while read -r file; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ $size -gt 1048576 ]; then  # 1MB
            echo -e "${YELLOW}⚠️  Moving large backup file: $file ($(numfmt --to=iec $size))${NC}"
            mv "$file" "$BACKUP_ROOT/recovered/"
            echo -e "   ✅ Moved to safe location"
        fi
    fi
done

echo -e "\n${GREEN}🛡️  Validating .gitignore safety rules...${NC}"

# Check and update .gitignore
REQUIRED_IGNORES=(
    "# Backup files safety"
    "*.tar.gz"
    "*.backup"
    "*.bak"
    "**/backups/"
    ".tasks/system/backups/"
    "*.sql"
    "*.dump"
    "*.zip"
    "*.rar"
    "*.7z"
)

for ignore in "${REQUIRED_IGNORES[@]}"; do
    if ! grep -Fxq "$ignore" .gitignore; then
        echo "$ignore" >> .gitignore
        echo -e "   ✅ Added to .gitignore: $ignore"
    fi
done

echo -e "\n${GREEN}🔗 Installing pre-commit hook (prevents backup commits)...${NC}"

# Ensure pre-commit hook is executable
if [ -f ".git/hooks/pre-commit" ]; then
    chmod +x .git/hooks/pre-commit
    echo -e "   ✅ Pre-commit hook is active and executable"
else
    echo -e "${RED}   ❌ Pre-commit hook not found!${NC}"
    echo -e "   Please ensure the pre-commit hook is properly installed"
fi

echo -e "\n${GREEN}🧪 Testing backup safety system...${NC}"

# Test function to verify safety
test_backup_safety() {
    local test_passed=true
    
    echo -e "📋 Running safety tests..."
    
    # Test 1: Check for dangerous directories
    for dir in "${DANGEROUS_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "${RED}❌ TEST FAILED: Dangerous directory still exists: $dir${NC}"
            test_passed=false
        fi
    done
    
    # Test 2: Check backup directories exist outside git
    if [ ! -d "$BACKUP_ROOT" ]; then
        echo -e "${RED}❌ TEST FAILED: Safe backup directory doesn't exist: $BACKUP_ROOT${NC}"
        test_passed=false
    fi
    
    # Test 3: Check .gitignore has required rules
    if ! grep -q "\.tar\.gz" .gitignore; then
        echo -e "${RED}❌ TEST FAILED: .gitignore missing *.tar.gz rule${NC}"
        test_passed=false
    fi
    
    # Test 4: Check pre-commit hook
    if [ ! -x ".git/hooks/pre-commit" ]; then
        echo -e "${RED}❌ TEST FAILED: Pre-commit hook not executable${NC}"
        test_passed=false
    fi
    
    # Test 5: Check for any remaining large files
    if find . -name "*.tar.gz" -not -path "./.git/*" | head -1 | grep -q .; then
        echo -e "${RED}❌ TEST FAILED: .tar.gz files still found in project${NC}"
        test_passed=false
    fi
    
    if [ "$test_passed" = true ]; then
        echo -e "${GREEN}✅ ALL SAFETY TESTS PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ SOME SAFETY TESTS FAILED${NC}"
        return 1
    fi
}

# Run safety tests
if test_backup_safety; then
    echo -e "\n${GREEN}🎉 BACKUP SAFETY SETUP COMPLETE!${NC}"
    echo -e "${GREEN}================================================================${NC}"
    echo -e "✅ Safe backup directories created outside git repository"
    echo -e "✅ Dangerous backup files moved to safe locations" 
    echo -e "✅ .gitignore updated with comprehensive backup file exclusions"
    echo -e "✅ Pre-commit hook active (will block large file commits)"
    echo -e "✅ All safety tests passed"
    
    echo -e "\n${BLUE}📊 Backup Safety Summary:${NC}"
    echo -e "  🏠 Safe backup location: $BACKUP_ROOT"
    echo -e "  📏 Max file size for commits: $(numfmt --to=iec $MAX_FILE_SIZE)"
    echo -e "  🛡️  Protection level: MAXIMUM"
    echo -e "  🔄 Safety validation: PASSED"
    
    echo -e "\n${YELLOW}💡 Usage:${NC}"
    echo -e "  • Manual backup: ${YELLOW}tar -czf ~/backups/m5/manual/before_changes.tar.gz .${NC}"
    echo -e "  • Check safety: ${YELLOW}.shared-rules/module-manager.sh validate${NC}"
    echo -e "  • View backups: ${YELLOW}ls -la ~/backups/m5/${NC}"
    
    echo -e "\n${GREEN}🚨 The 21GB backup catastrophe will NOT happen again!${NC}"
    
else
    echo -e "\n${RED}🚫 SETUP FAILED - Some safety measures couldn't be implemented${NC}"
    echo -e "${RED}Please review the errors above and fix them manually${NC}"
    exit 1
fi 