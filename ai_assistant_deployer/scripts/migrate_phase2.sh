#!/bin/bash

# AI Assistant Deployer - Rule Pool Consolidation
# Phase 2: Extract rules from templates and create lightweight mode configs

set -e

echo "🔧 Starting Phase 2: Rule Pool Consolidation"

# Create mode configurations based on current templates
echo "📝 Creating lightweight mode configurations..."

# Enterprise mode configuration
cat > configs/modes/enterprise.json << 'EOF'
{
  "id": "enterprise",
  "name": "Enterprise Mode", 
  "description": "Full enterprise features with advanced task management",
  "type": "enterprise",
  "ruleSelection": {
    "copilotInstructions": {
      "includeRuleIds": [
        "6de0c86a-4108-4411-9771-ac2ffe3292f2",
        "532f542a-f64c-425e-9f11-385c345d60b9", 
        "58b8688c-4611-4318-bb76-fb8fd667a474",
        "c44c6c4a-54c2-44dd-b1ba-12b12805c5af",
        "f6165c09-e233-4134-aae0-89d6db048d8c",
        "69ef8b0c-8764-4a5a-b9df-30985ea103f3"
      ],
      "includeCategories": ["CRITICAL", "ENTERPRISE_FEATURES", "CLEAN_ARCHITECTURE"],
      "urgencyFilter": "HIGH",
      "organization": {
        "groupBy": "category",
        "orderBy": "urgency"
      }
    },
    "projectRules": {
      "includeCategories": ["TASK_MANAGEMENT", "ENTERPRISE_FEATURES", "CLEAN_ARCHITECTURE"],
      "urgencyFilter": "MEDIUM",
      "maxRules": 50
    }
  },
  "deployment": {
    "structure": "enterprise",
    "includeAutomation": true,
    "includeScripts": ["epic-management", "cross-machine-sync", "advanced-monitoring"],
    "taskSystem": "enterprise"
  }
}
EOF

# Simplified mode configuration
cat > configs/modes/simplified.json << 'EOF'
{
  "id": "simplified",
  "name": "Simplified Mode",
  "description": "Basic features for small projects",
  "type": "simplified", 
  "ruleSelection": {
    "copilotInstructions": {
      "includeCategories": ["FILE_PRACTICES", "TESTING_REQUIREMENTS"],
      "excludeCategories": ["ENTERPRISE_FEATURES"],
      "urgencyFilter": "HIGH",
      "maxRules": 15,
      "organization": {
        "groupBy": "urgency",
        "orderBy": "category"
      }
    },
    "projectRules": {
      "includeCategories": ["DEVELOPMENT_WORKFLOW", "FILE_PRACTICES"],
      "urgencyFilter": "HIGH",
      "maxRules": 10
    }
  },
  "deployment": {
    "structure": "simple",
    "includeAutomation": false,
    "includeScripts": ["basic-backup"],
    "taskSystem": "simple"
  }
}
EOF

# Hybrid mode configuration  
cat > configs/modes/hybrid.json << 'EOF'
{
  "id": "hybrid",
  "name": "Hybrid Mode",
  "description": "Balanced approach with selective enterprise features",
  "type": "hybrid",
  "ruleSelection": {
    "copilotInstructions": {
      "includeCategories": ["ENTERPRISE_FEATURES", "FILE_PRACTICES", "TASK_MANAGEMENT"],
      "urgencyFilter": "MEDIUM",
      "maxRules": 25,
      "organization": {
        "groupBy": "category", 
        "orderBy": "urgency"
      }
    },
    "projectRules": {
      "includeCategories": ["TASK_MANAGEMENT", "ENTERPRISE_FEATURES"],
      "urgencyFilter": "LOW",
      "maxRules": 20
    }
  },
  "deployment": {
    "structure": "hybrid",
    "includeAutomation": "configurable", 
    "includeScripts": ["selective-automation", "optional-sync"],
    "taskSystem": "hybrid"
  }
}
EOF

# Create base deployment configuration
echo "📦 Creating base deployment configuration..."

cat > configs/deployment/base-deployment.json << 'EOF'
{
  "name": "AI Assistant Deployer Base Deployment",
  "version": "2.0.0",
  "structure": {
    "github": {
      "useGitHubDir": true,
      "requiredFiles": [
        {
          "template": "copilot-instructions.template.md",
          "target": "copilot-instructions.md",
          "type": "generated"
        },
        {
          "template": "project-rules.template.md", 
          "target": "project-rules.md",
          "type": "generated"
        },
        {
          "source": "mode-manager.sh",
          "target": "mode-manager.sh",
          "type": "static"
        },
        {
          "source": "PROJECT_MAP.md",
          "target": "PROJECT_MAP.md", 
          "type": "static"
        }
      ]
    },
    "tasks": {
      "createDirectory": true,
      "initialFiles": ["current_task.json"]
    }
  },
  "postDeployment": [
    {
      "type": "script",
      "config": {
        "command": "chmod +x .github/mode-manager.sh"
      },
      "order": 1
    }
  ]
}
EOF

# Create template files with placeholders
echo "🎨 Creating template files..."

cat > configs/deployment/templates/copilot-instructions.template.md << 'EOF'
# GitHub Copilot Instructions - {{MODE_NAME}}

{{#if showCriticalRequirements}}
## CRITICAL REQUIREMENTS
{{#each criticalRules}}
{{this.content}}

{{/each}}
{{/if}}

{{#if showWorkflow}}
## MANDATORY WORKFLOW
{{#each workflowRules}}
{{this.content}}

{{/each}}
{{/if}}

## Development Guidelines
{{#each coreRules}}
### {{this.title}}
{{this.content}}

{{/each}}

{{#if showModeSpecific}}
## Mode-Specific Features
{{#each modeSpecificRules}}
### {{this.title}}
{{this.content}}

{{/each}}
{{/if}}

---
*Generated by AI Assistant Deployer v{{version}} - {{mode}} mode*
EOF

cat > configs/deployment/templates/project-rules.template.md << 'EOF'
# Project Rules - {{MODE_NAME}}

## Overview
This project operates in **{{MODE_NAME}}** mode with the following rule set:

{{#each ruleCategories}}
## {{this.name}}
{{#each this.rules}}
### {{this.title}}
{{this.content}}

{{/each}}
{{/each}}

## Mode Configuration
- **Type**: {{mode}}
- **Rules Count**: {{rulesCount}}
- **Last Updated**: {{timestamp}}

---
*Auto-generated from rule pool - Do not edit manually*
EOF

echo "✅ Phase 2 Complete: Rule pool consolidated and mode configs created"
echo ""
echo "📋 Created files:"
echo "  - configs/modes/enterprise.json"
echo "  - configs/modes/simplified.json" 
echo "  - configs/modes/hybrid.json"
echo "  - configs/deployment/base-deployment.json"
echo "  - configs/deployment/templates/*.template.md"
echo ""
echo "🔍 Next steps:"
echo "  1. Review the new mode configurations"
echo "  2. Run Phase 3 to implement the build system"
echo "  3. Test the new template generation"
