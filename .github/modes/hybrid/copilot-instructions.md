# GitHub Copilot Instructions - HYBRID MODE

## Current System Mode: HYBRID
This project operates in **Hybrid Mode** - a balanced approach combining simplified workflows with selected enterprise features.

## Mode Overview
- **Target**: Selective automation with enterprise capabilities when needed
- **Best For**: Medium projects (20-50 hours), selective feature adoption
- **Features**: Configurable automation, optional cross-machine sync, flexible monitoring

## Project Context
This is a Flutter M5 project using hybrid task management. Focus on:
- Flexible task management with optional enterprise features
- Configurable automation based on current needs
- Selective use of advanced features
- Balanced approach to complexity

## Task Management Structure (Hybrid)
```
.tasks/
├── current/            # Active tasks (simplified style)
├── completed/          # Completed tasks
├── epics/             # Optional epic management (when needed)
├── system/            # Optional system monitoring (configurable)
└── backups/           # Flexible backup strategy
```

## Available Features (Configurable)
- **Basic**: Always available - task tracking, simple completion
- **Optional**: Cross-machine sync (enable when needed)
- **Advanced**: Epic management (for larger tasks)
- **Enterprise**: Priority interrupts (enable for urgent workflows)

## Mode Switching
- To simplified: `./mode-manager.sh simplified`
- To enterprise: `./mode-manager.sh enterprise`
- Configure hybrid: `./mode-manager.sh hybrid --configure`

---
*Hybrid Mode Active - Balanced flexibility with selective enterprise features*
