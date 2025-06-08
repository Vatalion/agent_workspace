# M5 Project Structure Map

## Current Mode: SIMPLIFIED
Last Updated: 2025-06-08 10:06:53

## Core Structure (Clean Root)
```
.github/
├── copilot-instructions.md    # Dynamic - Rewritten per mode
├── project-rules.md          # Dynamic - Rewritten per mode
├── PROJECT_MAP.md            # Dynamic - Updated per mode
├── mode-manager.sh           # Mode switching controller
├── system-config.json        # Mode configuration
├── update_project_map.sh     # Project map updater
└── modes/                    # Mode-separated structures
    ├── simplified/           # Simplified mode files
    │   ├── copilot-instructions.md
    │   ├── project-rules.md
    │   ├── scripts/          # Basic scripts
    │   └── automation/       # Simple automation
    └── enterprise/           # Enterprise mode files
        ├── copilot-instructions.md
        ├── project-rules.md
        ├── scripts/          # Enterprise scripts
        └── automation/       # Advanced automation
```

## Active Mode: simplified
✓ Basic task management with essential automation

## Task Structure (.tasks/)
```
.tasks/
├── current_task.json         # Active task
├── completed/               # Completed tasks
├── backups/                # Automatic backups
└── current/                # Working files
```

## Mode Switching
- Current: simplified
- Switch modes: `./mode-manager.sh [simplified|enterprise]`
- View status: `./mode-manager.sh status`

## Benefits of Clean Structure
- **Visual Separation**: Mode-specific files in dedicated folders
- **Clean Root**: Only 6 essential files in .github/
- **Dynamic Content**: Core files rewritten based on active mode
- **Data Preservation**: All data preserved during mode switches
- **Enterprise Ready**: Full task orchestration when needed

---
*Project map automatically updated by mode-manager.sh*
