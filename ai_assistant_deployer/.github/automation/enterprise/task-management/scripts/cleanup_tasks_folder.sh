#!/bin/bash
# TASKS FOLDER CLEANUP - PRESERVE CORE SYSTEM
# Move old completed tasks to archive, keep only active execution files

set -e
cd "$(dirname "$0")/.."

echo "🧹 CLEANING .tasks/ FOLDER - PRESERVING CORE SYSTEM"
echo "=================================================="

# Create archive structure
mkdir -p docs/archive/completed-tasks
mkdir -p docs/archive/old-monitoring
mkdir -p docs/archive/old-planning

echo "📊 BEFORE CLEANUP:"
total_files=$(find .tasks/ -name "*.md" | wc -l)
echo "  Total .tasks/ MD files: $total_files"

# Move completed tasks older than current session to archive
echo ""
echo "📦 Moving old completed tasks to archive..."
if [ -d .tasks/completed/ ]; then
    completed_files=$(find .tasks/completed/ -name "*.md" | wc -l)
    echo "  Found $completed_files completed task files"
    
    # Keep only the most recent 5 completed tasks, archive the rest
    find .tasks/completed/ -name "*.md" | sort | head -n -5 | while read -r file; do
        echo "  📁 Archiving: $(basename "$file")"
        mv "$file" docs/archive/completed-tasks/
    done
fi

# Move old monitoring files (keep only current active monitoring)
echo ""
echo "📦 Moving old monitoring files to archive..."
if [ -d .tasks/monitoring/ ]; then
    find .tasks/monitoring/ -name "*.md" | grep -v "PROGRESS_TRACKER.md" | while read -r file; do
        echo "  📁 Archiving: $(basename "$file")"
        mv "$file" docs/archive/old-monitoring/
    done
fi

# Move old planning files (keep only active planning)
echo ""
echo "📦 Moving old planning files to archive..."
if [ -d .tasks/planning/ ]; then
    find .tasks/planning/ -name "*.md" | grep -v "ACTIVE_PLANNING.md" | while read -r file; do
        echo "  📁 Archiving: $(basename "$file")"
        mv "$file" docs/archive/old-planning/
    done
fi

# Move any documentation files that ended up in .tasks/
echo ""
echo "📦 Moving documentation files to proper locations..."
find .tasks/ -name "*.md" | while read -r file; do
    content=$(head -5 "$file" 2>/dev/null || echo "")
    filename=$(basename "$file")
    
    # Skip essential active task files
    if [[ "$filename" == "ACTIVE_TASK.md" ]] || [[ "$filename" == "PROGRESS_TRACKER.md" ]] || [[ "$filename" == "ACTIVE_PLANNING.md" ]]; then
        continue
    fi
    
    # Move documentation files
    if [[ $content == *"documentation"* ]] || [[ $content == *"rules"* ]] || [[ $content == *"investigation"* ]] || [[ $content == *"analysis"* ]]; then
        echo "  📁 Moving documentation: $(basename "$file")"
        mv "$file" docs/analysis/
    fi
done

echo ""
echo "📊 AFTER CLEANUP:"
remaining_files=$(find .tasks/ -name "*.md" | wc -l)
echo "  Remaining .tasks/ MD files: $remaining_files"

echo ""
echo "✅ ESSENTIAL .tasks/ FILES PRESERVED:"
[ -f .tasks/current.json ] && echo "  ✅ current.json (active task state)"
[ -f .tasks/ACTIVE_TASK.md ] && echo "  ✅ ACTIVE_TASK.md (current execution)"
[ -d .tasks/epics/ ] && echo "  ✅ epics/ folder (epic management)"
[ -d .tasks/execution/ ] && echo "  ✅ execution/ folder (execution engine)"
[ -d .tasks/monitoring/ ] && echo "  ✅ monitoring/ folder (progress tracking)"

echo ""
if [ "$remaining_files" -le 10 ]; then
    echo "🎯 SUCCESS: .tasks/ folder now complies with 10-file limit!"
else
    echo "⚠️  ATTENTION: .tasks/ still has $remaining_files files (limit: 10)"
    echo "   Manual review may be needed for remaining files"
fi

echo ""
echo "📁 ARCHIVED CONTENT MOVED TO:"
echo "  docs/archive/completed-tasks/ - Old completed tasks"
echo "  docs/archive/old-monitoring/  - Old monitoring files"
echo "  docs/archive/old-planning/    - Old planning files"
echo "  docs/analysis/               - Documentation files"
