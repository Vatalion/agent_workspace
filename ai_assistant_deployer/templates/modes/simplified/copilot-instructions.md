# GitHub Copilot Instructions - SIMPLIFIED MODE

## Current System Mode: SIMPLIFIED
This project operates in **Simplified Mode** - a streamlined task management system designed for small to medium projects (< 20 hours).

## Mode Overview
- **Target**: Basic task management with essential automation
- **Best For**: Single machine development, straightforward workflows
- **Features**: Basic backup/recovery, security validation, simple documentation

## Project Context
This is a Flutter M5 project using simplified task management. Focus on:
- Basic task completion tracking
- Simple backup and recovery
- Essential security validation
- Straightforward documentation updates

## Task Management Structure (Simplified)
```
.tasks/
├── current_task.json     # Your active task
├── completed/           # Completed tasks
├── backups/            # Automatic backups
└── current/            # Current working files
```

## Available Commands
- `task-system.sh` - Basic task management
- `security-check.sh` - Security validation
- `project-update.sh` - Documentation updates

## Flutter Development Guidelines

### Essential Flutter Practices
- **Clean Code**: Follow Flutter/Dart conventions
- **State Management**: Use Provider or setState for simple apps
- **Widget Organization**: Separate UI components logically
- **File Structure**: Keep related files together
- **Testing**: Write basic tests for critical functionality

### Basic Architecture
```
lib/
├── main.dart           # App entry point
├── screens/           # App screens/pages
├── widgets/          # Reusable widgets
├── models/           # Data models
└── services/         # API/data services
```

### Development Rules
- **File Size**: Keep files under 300 lines
- **Naming**: Use descriptive names for files and classes
- **Comments**: Add comments for complex logic
- **Git**: Commit frequently with clear messages
- **Testing**: Test critical user flows

## Code Preferences
- Keep solutions simple and straightforward
- Focus on essential functionality
- Avoid over-engineering
- Prioritize clarity over complexity
- Follow Flutter best practices
- Maintain clean code structure

## Mode Switching
To access enterprise features: `../.github/mode-manager.sh enterprise`

---
*Simplified Mode Active - Enterprise features preserved but hidden*
