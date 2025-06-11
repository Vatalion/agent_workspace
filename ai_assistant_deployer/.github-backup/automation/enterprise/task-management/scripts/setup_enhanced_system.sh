#!/bin/bash

# Enhanced Task Management System Setup Script
# Creates the new four-phase folder structure and templates

echo "🚀 Setting up Enhanced Task Management System..."

# Create main phase folders
mkdir -p .tasks/1_planning/{active,approved,templates}
mkdir -p .tasks/2_preparation/{active,ready,templates}
mkdir -p .tasks/3_execution/{active,pending,completed,blocked,suspended,templates}
mkdir -p .tasks/4_completion/{validating,completed,failed,templates}

# Create system folders
mkdir -p .tasks/system/{scripts,templates}
mkdir -p .tasks/archives/{$(date +%Y-%m)}

echo "📁 Created enhanced folder structure"

# Create system configuration
cat > .tasks/system/config.json << 'EOF'
{
  "version": "2.0.0",
  "system_name": "Enhanced Task Management System",
  "created": "2025-01-27T19:45:00Z",
  "phases": {
    "1_planning": {
      "name": "Planning",
      "description": "Analysis, estimation, and decomposition",
      "time_percentage": "5-15%"
    },
    "2_preparation": {
      "name": "Preparation", 
      "description": "Setup, validation, and final planning approval",
      "time_percentage": "5-10%"
    },
    "3_execution": {
      "name": "Execution",
      "description": "Active development with real-time monitoring", 
      "time_percentage": "70-80%"
    },
    "4_completion": {
      "name": "Completion",
      "description": "Final validation, documentation, and archival",
      "time_percentage": "10-15%"
    }
  },
  "complexity_levels": {
    "E": {
      "name": "Easy",
      "time_range": "5-15min",
      "max_files": 3,
      "testing_required": "Basic validation only"
    },
    "M": {
      "name": "Medium", 
      "time_range": "15-60min",
      "max_files": 10,
      "testing_required": "Unit + Widget tests"
    },
    "H": {
      "name": "High",
      "time_range": "60min+", 
      "max_files": "unlimited",
      "testing_required": "Unit + Widget + Integration tests"
    }
  }
}
EOF

echo "⚙️ Created system configuration"

# Make this script executable
chmod +x .tasks/system/scripts/setup_enhanced_system.sh

echo "✅ Enhanced Task Management System setup complete!"
echo "📍 Next: Run migration script to convert current task"
