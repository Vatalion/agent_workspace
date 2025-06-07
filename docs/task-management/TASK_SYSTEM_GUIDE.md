# Task Management System Guide

This document explains the task management system used in our project, following our organizational rules.

## Directory Structure

- **`.github/`**: Central control hub for all task management business logic
  - `copilot-instructions.md`: Core instructions for AI assistance
  - `project-rules.md`: Project rules and standards
  - `PROJECT_MAP.md`: Auto-generated structure snapshot
  - `task-management.sh`: Main orchestration entry point
  - `setup_task_system.sh`: System initialization
  - `update_project_map.sh`: Structure automation
  - `validate_security.sh`: Security validation enforcement
  - `task-management/`: Business logic subdirectory
    - `scripts/`: Core orchestration scripts
    - `logs/`: System operation logs

- **`.tasks/`**: Task data and state storage
  - `current.json`: Current active task details
  - `ACTIVE_TASK.md`: Detailed task in progress
  - `epics/`: Long-term strategic initiatives
  - `completed/`: Archive of completed tasks
  - `system/`: Configuration files and metadata

## Task Workflow

### Task Creation
1. Create task in `.tasks/current.json` with proper metadata
2. Create `.tasks/ACTIVE_TASK.md` with initial description and plan
3. Update project map using `./.github/update_project_map.sh`

### Task Progress
1. Update `.tasks/ACTIVE_TASK.md` with ongoing progress
2. Commit atomic changes with descriptive messages
3. Validate each change against project rules

### Task Completion
1. Move task data to `.tasks/completed/[taskid].json`
2. Clean up any temporary files
3. Update final status in `.tasks/ACTIVE_TASK.md`
4. Run final validation with `scripts/validate_project_structure.sh`

## Complexity Assessment

Tasks are assessed using the following complexity criteria:

- **EASY (E)**: 5-15min | ≤3 files | Simple config/single edits
- **MEDIUM (M)**: 15-60min | ≤10 files | Multi-file changes, new features
- **HIGH (H)**: 60min+ | Unlimited files | Architecture changes, complex patterns

## Task States

- **Pending**: Task created but not started
- **In-Progress**: Work actively ongoing
- **Review**: Implementation complete, awaiting validation
- **Completed**: Task finished and validated
- **Blocked**: Cannot proceed due to dependencies

## Security Protocol

The `.github/` folder follows strict security protocols:

- Maximum of 7 files + 1 subdirectory allowed
- All task management business logic stays in `.github/`
- All task data goes to `.tasks/` folder
- Documentation goes to `docs/`
- Utility scripts go to `scripts/`

## Validation Requirements

All tasks must pass these validation gates:

1. `scripts/validate_project_structure.sh` passes without errors
2. Project map is up-to-date via `./.github/update_project_map.sh`
3. Code follows feature-based architecture standards
4. Performance meets benchmarks in `docs/PERFORMANCE_STANDARDS.md`
