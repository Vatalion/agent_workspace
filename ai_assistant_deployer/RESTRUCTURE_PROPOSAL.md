# AI Assistant Deployer - Clean Architecture Restructure Proposal

## Current Problems

### 1. **Massive Duplication**
- 41+ test files cluttering root directory
- 3x duplicate copilot-instructions.md files (enterprise/simplified/hybrid)
- 3x duplicate project-rules.md files
- Templates contain full content instead of rule references

### 2. **Broken Rule Pool Concept**
- Templates should select rules from pool, not store full content
- Mode definitions should be lightweight configuration files
- Current system defeats the purpose of having a centralized rule pool

### 3. **Deployment Chaos**
- Complex nested template structures
- Unclear separation between base and mode-specific configs
- Build system copying files unnecessarily

## Proposed Clean Structure

```
ai_assistant_deployer/
├── src/                                 # Core TypeScript source
│   ├── services/
│   ├── webview/
│   └── extension.ts
├── data/
│   ├── rules/                          # SINGLE SOURCE OF TRUTH
│   │   ├── rule-pool.json             # All rules centralized
│   │   └── schemas/
│   │       ├── rule-schema.json
│   │       └── mode-config-schema.json
├── configs/                            # Mode configurations (lightweight)
│   ├── modes/
│   │   ├── enterprise.json            # Rule selectors only
│   │   ├── simplified.json            # Rule selectors only
│   │   ├── hybrid.json                # Rule selectors only
│   │   └── custom/                    # User-defined modes
│   └── deployment/
│       ├── base-deployment.json       # Base deployment structure
│       └── templates/                 # File templates with placeholders
│           ├── copilot-instructions.template.md
│           ├── project-rules.template.md
│           └── mode-manager.template.sh
├── build/                             # Build outputs (generated)
│   ├── extension/                     # Compiled extension
│   └── deployment-packages/          # Ready-to-deploy packages
├── tests/                            # All tests organized
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── scripts/                          # Build and utility scripts
│   ├── build/
│   ├── deploy/
│   └── utils/
├── docs/                            # Documentation only
│   ├── architecture/
│   ├── user-guides/
│   └── development/
└── .artifacts/                      # Generated artifacts (gitignored)
    ├── .history/
    ├── .legacy/
    └── temp/
```

## Mode Configuration Example (Lightweight)

### `configs/modes/enterprise.json`
```json
{
  "id": "enterprise",
  "name": "Enterprise Mode",
  "description": "Full enterprise features with advanced task management",
  "ruleSelection": {
    "copilotInstructions": {
      "includeRuleIds": [
        "6de0c86a-4108-4411-9771-ac2ffe3292f2",
        "532f542a-f64c-425e-9f11-385c345d60b9",
        "c44c6c4a-54c2-44dd-b1ba-12b12805c5af"
      ],
      "includeCategories": ["CRITICAL", "ENTERPRISE_FEATURES"],
      "urgencyFilter": "HIGH"
    },
    "projectRules": {
      "includeCategories": ["TASK_MANAGEMENT", "CLEAN_ARCHITECTURE"],
      "excludeRuleIds": ["simple-mode-specific-rules"]
    }
  },
  "deployment": {
    "structure": "enterprise",
    "includeAutomation": true,
    "includeScripts": ["epic-management", "cross-machine-sync"]
  }
}
```

### `configs/modes/simplified.json`
```json
{
  "id": "simplified",
  "name": "Simplified Mode", 
  "description": "Basic features for small projects",
  "ruleSelection": {
    "copilotInstructions": {
      "includeCategories": ["ESSENTIAL", "FILE_PRACTICES"],
      "excludeCategories": ["ENTERPRISE_FEATURES"],
      "urgencyFilter": "MEDIUM"
    },
    "projectRules": {
      "includeCategories": ["BASIC_WORKFLOW"],
      "maxRules": 10
    }
  },
  "deployment": {
    "structure": "simple",
    "includeAutomation": false,
    "includeScripts": ["basic-backup"]
  }
}
```

## Template System (Rule-Based Generation)

### `configs/deployment/templates/copilot-instructions.template.md`
```markdown
# GitHub Copilot Instructions - {{MODE_NAME}}

{{#if isCriticalMode}}
## CRITICAL REQUIREMENTS
{{#each criticalRules}}
{{this.content}}
{{/each}}
{{/if}}

## Core Development Rules
{{#each coreRules}}
### {{this.title}}
{{this.content}}
{{/each}}

## Mode-Specific Features
{{#each modeSpecificRules}}
- {{this.title}}: {{this.content}}
{{/each}}
```

## Benefits of This Structure

### 1. **True Single Source of Truth**
- All rules in `data/rules/rule-pool.json`
- No duplication of content
- Easy to update rules globally

### 2. **Clean Separation of Concerns**
- **Source code** → `src/`
- **Configuration** → `configs/`
- **Build outputs** → `build/`
- **Tests** → `tests/`
- **Documentation** → `docs/`

### 3. **Lightweight Mode Definitions**
- Mode files are just rule selectors
- Easy to create new modes
- No content duplication

### 4. **Scalable Architecture**
- Add new rules without touching templates
- Create new modes by combining existing rules
- Clean build and deployment process

### 5. **Clear Build Process**
1. Load rule pool
2. Apply mode configuration (rule selection)
3. Generate files from templates
4. Package for deployment

## Migration Strategy

### Phase 1: Structure Cleanup
1. Move all tests to `tests/` directory
2. Move docs to `docs/` directory  
3. Clean up root directory
4. Create new folder structure

### Phase 2: Rule Pool Consolidation
1. Extract all rule content to centralized pool
2. Create lightweight mode configurations
3. Update templates to use rule references

### Phase 3: Build System Refactor
1. Update build scripts for new structure
2. Implement template generation engine
3. Create deployment packaging system

### Phase 4: Testing & Validation
1. Migrate tests to new structure
2. Validate all modes generate correctly
3. Test deployment process

## Implementation Plan

Would you like me to:
1. **Start with Phase 1** - Clean up the current mess and organize files properly?
2. **Create the new structure** and begin migrating content?
3. **Focus on a specific area** first (like cleaning up the root directory)?

This restructure will transform the project from a chaotic mess into a clean, maintainable architecture that actually uses the rule pool concept correctly.
