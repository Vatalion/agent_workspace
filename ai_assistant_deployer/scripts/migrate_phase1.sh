#!/bin/bash

# AI Assistant Deployer - Clean Architecture Migration Script
# Phase 1: Directory Structure Cleanup

set -e

echo "🧹 Starting Phase 1: Directory Structure Cleanup"

# Create new directory structure
echo "📁 Creating new directory structure..."

# Create main directories
mkdir -p configs/{modes,deployment/templates}
mkdir -p data/rules/schemas
mkdir -p build/{extension,deployment-packages}
mkdir -p tests/{unit,integration,e2e,fixtures}
mkdir -p scripts/{build,deploy,utils}
mkdir -p docs/{architecture,user-guides,development}
mkdir -p .artifacts/{temp}

# Move existing files to proper locations
echo "📦 Moving files to proper locations..."

# Move all test files to tests directory
echo "  → Moving test files..."
mkdir -p tests/legacy
mv test_*.js tests/legacy/ 2>/dev/null || true
mv *_test.js tests/legacy/ 2>/dev/null || true
mv test-*.json tests/legacy/ 2>/dev/null || true
mv *_COMPLETION_REPORT.md tests/legacy/ 2>/dev/null || true
mv *_REPORT.md tests/legacy/ 2>/dev/null || true
mv *_STATUS.md tests/legacy/ 2>/dev/null || true
mv *_GUIDE.md docs/user-guides/ 2>/dev/null || true

# Move documentation
echo "  → Moving documentation..."
mv BUILD_SYSTEM.md docs/architecture/ 2>/dev/null || true
mv DEPLOYMENT_GUIDE.md docs/development/ 2>/dev/null || true
mv INSTALLATION.md docs/user-guides/ 2>/dev/null || true
mv PROJECT_COMPLETE.md docs/development/ 2>/dev/null || true

# Move build-related files
echo "  → Moving build files..."
mv build.sh scripts/build/ 2>/dev/null || true
mv quick_install.sh scripts/deploy/ 2>/dev/null || true
mv *.vsix build/ 2>/dev/null || true

# Move standalone services to scripts/utils
echo "  → Moving utility scripts..."
mv standalone*.js scripts/utils/ 2>/dev/null || true
mv *Engine.js scripts/utils/ 2>/dev/null || true

# Move rule pool to data/rules
echo "  → Moving rule pool..."
mv data/rule-pool.json data/rules/ 2>/dev/null || true

# Create backup of current templates before restructuring
echo "  → Backing up current templates..."
cp -r templates .artifacts/templates-backup 2>/dev/null || true

echo "✅ Phase 1 Complete: Directory structure cleaned up"
echo ""
echo "📋 Next steps:"
echo "  1. Review the new structure"
echo "  2. Run Phase 2 to consolidate rule pool"
echo "  3. Create lightweight mode configurations"
echo ""
echo "🔍 To see the new structure:"
echo "  tree -I 'node_modules|out|dist|.history|.legacy|.DS_Store' -a"
