#!/bin/bash

# Project Structure Analysis Tool
# Shows current mess and validates against proposed clean structure

echo "🔍 AI Assistant Deployer - Project Structure Analysis"
echo "=================================================="
echo ""

# Count current files in root
ROOT_FILES=$(find . -maxdepth 1 -type f | wc -l | tr -d ' ')
TEST_FILES=$(find . -maxdepth 1 -name "*test*" -o -name "*_test.*" | wc -l | tr -d ' ')
REPORT_FILES=$(find . -maxdepth 1 -name "*REPORT*" -o -name "*COMPLETION*" | wc -l | tr -d ' ')

echo "📊 Current Root Directory Stats:"
echo "  Total files in root: $ROOT_FILES"
echo "  Test files in root: $TEST_FILES" 
echo "  Report files in root: $REPORT_FILES"
echo ""

echo "🗂️  Current Template Duplication:"
COPILOT_FILES=$(find . -name "*copilot-instructions*" | wc -l | tr -d ' ')
PROJECT_RULES_FILES=$(find . -name "*project-rules*" | wc -l | tr -d ' ')
echo "  copilot-instructions files: $COPILOT_FILES"
echo "  project-rules files: $PROJECT_RULES_FILES"
echo ""

echo "📁 Current Templates Structure:"
if [ -d "templates" ]; then
    tree templates 2>/dev/null || find templates -type f | head -20
else
    echo "  No templates directory found"
fi
echo ""

echo "🧮 Rule Pool Analysis:" 
if [ -f "data/rule-pool.json" ]; then
    TOTAL_RULES=$(grep -o '"id":' data/rule-pool.json | wc -l | tr -d ' ')
    echo "  Total rules in pool: $TOTAL_RULES"
    
    echo "  Rule categories:"
    grep -o '"category": "[^"]*"' data/rule-pool.json | sort | uniq -c | head -10
else
    echo "  No rule pool found"
fi
echo ""

echo "💀 Problems Identified:"
echo "  ❌ $TEST_FILES test files polluting root directory"
echo "  ❌ $REPORT_FILES completion reports scattered around"
echo "  ❌ $(($COPILOT_FILES - 1)) duplicate copilot-instructions files"
echo "  ❌ $(($PROJECT_RULES_FILES - 1)) duplicate project-rules files"
echo "  ❌ Templates contain full content instead of rule references"
echo "  ❌ No clear separation between source/build/test/docs"
echo ""

echo "✨ Proposed Clean Structure:"
cat << 'EOF'
ai_assistant_deployer/
├── src/                     # TypeScript source only
├── data/rules/              # Centralized rule pool  
├── configs/                 # Lightweight mode configs
│   ├── modes/              # Rule selectors only
│   └── deployment/         # Templates with placeholders
├── build/                  # Build outputs (generated)
├── tests/                  # All tests organized
├── scripts/                # Build and utility scripts  
├── docs/                   # Documentation only
└── .artifacts/             # Generated artifacts (gitignored)
EOF
echo ""

echo "🚀 Migration Options:"
echo "  1. Run './scripts/migrate_phase1.sh' to clean up directory structure"
echo "  2. Run './scripts/migrate_phase2.sh' to create lightweight mode configs"
echo "  3. Run complete restructure with backup"
echo ""

echo "⚠️  Before migration:"
echo "  - Commit current changes"
echo "  - Backup important work"
echo "  - Review RESTRUCTURE_PROPOSAL.md"
