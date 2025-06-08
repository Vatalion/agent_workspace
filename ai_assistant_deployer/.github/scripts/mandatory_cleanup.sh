#!/bin/bash
# 🧹 MANDATORY CLEANUP PROTOCOL
# Execute after EVERY task cycle - NO EXCEPTIONS

set -e
cd "$(dirname "$0")/.."

echo "🧹 EXECUTING MANDATORY CLEANUP PROTOCOL..."
echo "========================================"

# 1. Remove temporary files
echo "🗑️  Step 1: Removing temporary files..."
find .temp/ -name "*analysis*" -mtime +1 -delete 2>/dev/null || true
find .temp/ -name "*investigation*" -mtime +1 -delete 2>/dev/null || true
find .temp/ -name "*report*" -mtime +1 -delete 2>/dev/null || true
find . -maxdepth 1 -name "*_temp*" -delete 2>/dev/null || true
find . -maxdepth 1 -name "*TEMP*" -delete 2>/dev/null || true
echo "   ✅ Temporary files cleaned"

# 2. CRITICAL: Validate .github/ folder security
echo "🔐 Step 2: Validating .github/ folder security..."
if [ -f ".github/task-management/scripts/github_security_monitor.sh" ]; then
    ./.github/task-management/scripts/github_security_monitor.sh
    if [ $? -ne 0 ]; then
        echo "❌ CRITICAL: .github/ folder security violation detected!"
        echo "🚨 IMMEDIATE ACTION REQUIRED: Fix violations before continuing"
        exit 1
    fi
    echo "   ✅ .github/ folder security validated"
else
    echo "   ⚠️  Security monitor not found - manual check required"
fi

# 3. Check for root folder violations  
echo "🚫 Step 3: Checking root folder violations..."
root_violations=$(find . -maxdepth 1 -name "*.md" ! -name "README.md" | wc -l)
if [ $root_violations -gt 0 ]; then
    echo "   ⚠️  WARNING: $root_violations markdown files found in root folder:"
    find . -maxdepth 1 -name "*.md" ! -name "README.md" -exec basename {} \;
    echo "   📋 Move these to appropriate folders (.temp/, docs/, scripts/)"
else
    echo "   ✅ Root folder clean"
fi

# 3. Validate .github/ folder compliance
echo "🔍 Step 3: Validating .github/ folder compliance..."
github_md_count=$(find .github/ -maxdepth 1 -name "*.md" | wc -l)
github_sh_count=$(find .github/ -maxdepth 1 -name "*.sh" | wc -l)
github_json_count=$(find .github/ -maxdepth 1 -name "*.json" | wc -l)
github_dir_count=$(find .github/ -maxdepth 1 -type d ! -name ".github" | wc -l | xargs)

echo "   📊 .github/ status: $github_md_count/3 MD, $github_sh_count/5 SH, $github_json_count/1 JSON, $github_dir_count/1 subdirs"

if [ $github_md_count -gt 3 ]; then
    echo "   🚨 VIOLATION: .github/ has $github_md_count markdown files (limit: 3)"
fi

if [ $github_sh_count -gt 5 ]; then
    echo "   🚨 VIOLATION: .github/ has $github_sh_count shell files (limit: 5)"
fi

if [ $github_json_count -gt 1 ]; then
    echo "   🚨 VIOLATION: .github/ has $github_json_count JSON files (limit: 1)"
fi

if [ $github_dir_count -gt 1 ]; then
    echo "   🚨 VIOLATION: .github/ has $github_dir_count subdirectories (limit: 1)"
fi
# 4. Monitor folder populations
echo "📈 Step 4: Monitoring folder populations..."
temp_count=$(find .temp/ -type f | wc -l)
tasks_count=$(find .tasks/ -type f | wc -l)
docs_count=$(find docs/ -type f | wc -l)

echo "   📁 Folder populations:"
echo "      .temp/: $temp_count/20 files"
echo "      .tasks/: $tasks_count/10 files"
echo "      docs/: $docs_count files"

if [ $temp_count -gt 20 ]; then
    echo "   ⚠️  WARNING: .temp/ folder over limit ($temp_count/20)"
fi

if [ $tasks_count -gt 10 ]; then
    echo "   ⚠️  WARNING: .tasks/ folder over limit ($tasks_count/10)"
fi

# 5. Clean old files
echo "🧹 Step 5: Cleaning old files (>7 days)..."
old_temp_count=$(find .temp/ -name "*.md" -mtime +7 2>/dev/null | wc -l)
if [ $old_temp_count -gt 0 ]; then
    find .temp/ -name "*.md" -mtime +7 -delete 2>/dev/null || true
    echo "   🗑️  Removed $old_temp_count old files from .temp/"
else
    echo "   ✅ No old files to clean"
fi

# 6. Update project map
echo "🗺️  Step 6: Updating project map..."
if [ -f ".github/update_project_map.sh" ]; then
    ./.github/update_project_map.sh > /dev/null 2>&1 || true
    echo "   ✅ Project map updated"
else
    echo "   ⚠️  Project map script not found"
fi

echo ""
echo "🎯 CLEANUP PROTOCOL COMPLETED"
echo "==============================="

# Show final status
violation_count=0
if [ $root_violations -gt 0 ]; then violation_count=$((violation_count + 1)); fi
if [ $github_md_count -gt 3 ]; then violation_count=$((violation_count + 1)); fi
if [ $github_sh_count -gt 5 ]; then violation_count=$((violation_count + 1)); fi
if [ $github_json_count -gt 1 ]; then violation_count=$((violation_count + 1)); fi
if [ $github_dir_count -gt 1 ]; then violation_count=$((violation_count + 1)); fi
if [ $temp_count -gt 20 ]; then violation_count=$((violation_count + 1)); fi
if [ $tasks_count -gt 10 ]; then violation_count=$((violation_count + 1)); fi

if [ $violation_count -eq 0 ]; then
    echo "✅ STATUS: ALL CLEAN - No violations detected"
else
    echo "⚠️  STATUS: $violation_count violations require attention"
fi

echo ""
echo "🎯 CLEANUP COMPLETE - Project hygiene maintained!"
echo "================================================"
