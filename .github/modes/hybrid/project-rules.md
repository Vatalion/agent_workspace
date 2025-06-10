# Project Rules - HYBRID MODE

## Core Principles
- **Balanced Approach**: Combine simplicity with selective complexity
- **Configurable Features**: Enable enterprise features as needed
- **Flexible Scaling**: Adapt to changing project requirements
- **Selective Automation**: Use automation where it adds value

## Task Management Rules
1. **Adaptive Structure**: Switch between simple and epic management
2. **Optional Interrupts**: Enable priority handling when needed
3. **Configurable Sync**: Cross-machine sync available but optional
4. **Flexible Monitoring**: Enable monitoring for complex phases
5. **Selective Auto-Save**: Configure save intervals based on task complexity

## File Organization
- Start simple, add complexity as needed
- Configurable folder structures
- Optional enterprise organization
- Flexible automation deployment

## Development Workflow
1. **Assess Complexity**: Determine required feature level
2. **Configure Mode**: Enable/disable features as needed
3. **Flexible Execution**: Adapt workflow to current task
4. **Optional Monitoring**: Enable when beneficial
5. **Configurable Completion**: Simple or detailed as appropriate

## Configurable Features
- **Cross-Machine Sync**: Enable for multi-machine development
- **Epic Management**: Activate for large tasks (20+ hours)
- **Priority Interrupts**: Enable for urgent workflow requirements
- **Advanced Monitoring**: Activate for complex project phases
- **Auto-Save Intervals**: Configure based on task criticality

## Mode Selection Guidelines
- **Use Simplified**: Single tasks, basic requirements, <20 hours
- **Use Enterprise**: Large projects, multi-machine, >50 hours
- **Use Hybrid**: Variable complexity, selective features, 20-50 hours

## Feature Configuration
```bash
# Enable specific features
./mode-manager.sh hybrid --enable cross-sync
./mode-manager.sh hybrid --enable epic-management
./mode-manager.sh hybrid --enable priority-interrupts

# Disable features
./mode-manager.sh hybrid --disable cross-sync
./mode-manager.sh hybrid --configure
```

## Switching Guidelines
- **To Simplified**: When reducing complexity permanently
- **To Enterprise**: When scaling up to full enterprise needs
- **Reconfigure Hybrid**: When changing feature requirements

---
*Hybrid Mode Rules - Flexible adaptation to changing complexity*
