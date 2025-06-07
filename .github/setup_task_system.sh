#!/bin/bash

# Enhanced Task Management System Setup
# Sets up the 4-phase task management folder structure

echo "🚀 Setting up Enhanced 4-Phase Task Management System..."

# Create base .tasks directory if it doesn't exist
mkdir -p .tasks

# Create Phase 1: Planning & Estimation
mkdir -p .tasks/planning/{plans,estimates}
echo "📋 Phase 1: Planning & Estimation folders created"

# Create Phase 2: Execution
mkdir -p .tasks/execution/{queue/{urgent,normal,blocked},subtasks}
echo "⚡ Phase 2: Execution folders created"

# Create Phase 3: Monitoring & Quality Assurance  
mkdir -p .tasks/monitoring/{suspended,validation}
echo "📊 Phase 3: Monitoring folders created"

# Create Phase 4: Archive & History
mkdir -p .tasks/archive/{completed,cancelled,history}
echo "📚 Phase 4: Archive folders created"

# Copy templates if they exist
if [ -f ".tasks/planning/PLANNING_TEMPLATE.md" ]; then
    echo "✅ Planning template already exists"
else
    echo "⚠️  Planning template not found - will be created by next task"
fi

if [ -f ".tasks/execution/EXECUTION_TEMPLATE.md" ]; then
    echo "✅ Execution template already exists"
else
    echo "⚠️  Execution template not found - will be created by next task"
fi

# Initialize history file if it doesn't exist
if [ ! -f ".tasks/archive/history/TASK_HISTORY.md" ]; then
    cat > .tasks/archive/history/TASK_HISTORY.md << 'EOF'
# Task History Log - Enhanced 4-Phase System
**System Activated**: $(date '+%Y-%m-%d %H:%M')

## Completed Tasks
*Format: Date | Complexity | Task Name | Duration | Files Modified | Outcome | Phase Notes*

## Statistics
- **Total Tasks Completed**: 0
- **Average Duration by Complexity**:
  - Easy (E): TBD
  - Medium (M): TBD  
  - High (H): TBD
- **Success Rate**: 100%
- **Most Common Issues**: TBD

## Lessons Learned
- [To be populated as tasks are completed]

## System Improvements
- [Track improvements to the 4-phase system]
EOF
    echo "📝 History file initialized"
fi

echo ""
echo "✅ Enhanced 4-Phase Task Management System setup complete!"
echo ""
echo "📁 Folder Structure:"
echo ".tasks/"
echo "├── planning/          # Phase 1: Planning & Estimation"
echo "├── execution/         # Phase 2: Active Execution"  
echo "├── monitoring/        # Phase 3: Progress Tracking"
echo "└── archive/          # Phase 4: Completion & History"
echo ""
echo "🎯 Next: Use this system for all future tasks"
