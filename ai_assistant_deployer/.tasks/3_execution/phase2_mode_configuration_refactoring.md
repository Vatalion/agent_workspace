# TASK: Rule Pool Architecture - Phase 2: Mode Configuration Refactoring

## OBJECTIVE
Transform existing modes from embedded content to rule-based configuration that references the centralized rule pool.

## TASK CLASSIFICATION
- **Complexity**: MEDIUM (20-31 hours)
- **Scope**: Mode system refactoring
- **Dependencies**: Phase 1 (Rule Pool Foundation) ✅ Complete
- **Impact**: Core architecture change

## PROGRESS TRACKING

### Phase 2.1: Mode Configuration Schema ⏳ IN PROGRESS
- [ ] Analyze existing mode structure and requirements
- [ ] Design comprehensive mode configuration JSON schema
- [ ] Create mode configuration validation system
- [ ] Build mode configuration parser and loader
- [ ] Test configuration loading and validation with existing modes

### Phase 2.2: Mode File Conversion (Planned)
- [ ] Convert enterprise mode to rule references
- [ ] Convert simplified mode to rule references  
- [ ] Convert hybrid mode to rule references
- [ ] Validate converted modes produce identical output to originals
- [ ] Create migration validation tools

### Phase 2.3: Mode Generation Pipeline (Planned)
- [ ] Integrate rule pool with mode generation system
- [ ] Update deployment system to use rule-based modes
- [ ] Test full mode deployment with rule references
- [ ] Validate backward compatibility with existing deployments
- [ ] Update extension commands to use new system

### Phase 2.4: Mode Validation & Testing (Planned)
- [ ] Create comprehensive test suite for new mode system
- [ ] Validate all existing functionality works with new architecture
- [ ] Performance testing for rule-based generation vs embedded content
- [ ] Documentation updates for new mode configuration system
- [ ] User migration guide for custom modes

## CURRENT ANALYSIS

### Existing Mode Structure
Based on the current implementation, each mode contains:

1. **copilot-instructions.md**
   - Embedded rule content directly in file
   - Mode-specific formatting and organization
   - Custom sections and ordering

2. **project-rules.md**
   - Embedded rule content directly in file
   - Mode-specific rule groupings
   - Different emphasis and formatting

3. **automation/** (if present)
   - Mode-specific scripts and automation
   - Task management configurations
   - Deployment workflows

### Target Mode Configuration Schema (Draft)
```json
{
  "name": "enterprise",
  "displayName": "Enterprise Mode",
  "description": "Full-featured mode for large-scale Flutter projects",
  "version": "1.0.0",
  "rules": {
    "included": [
      "rule-id-1",
      "rule-id-2"
    ],
    "excluded": [],
    "overrides": {
      "rule-id-1": {
        "urgency": "CRITICAL",
        "customContent": "Modified content for this mode"
      }
    }
  },
  "templates": {
    "copilot-instructions": "enterprise-copilot-template",
    "project-rules": "enterprise-rules-template"
  },
  "automation": {
    "scripts": ["setup_task_system.sh", "validate_security.sh"],
    "taskManagement": "enterprise"
  },
  "features": {
    "taskManagement": true,
    "enterpriseFeatures": true,
    "advancedValidation": true
  }
}
```

## IMPLEMENTATION PLAN

### Phase 2.1: Configuration Schema (Current Focus)
1. **Schema Design**: Create comprehensive JSON schema for mode configurations
2. **Validation**: Build validation system for mode configurations
3. **Parser**: Create configuration parser and loader
4. **Testing**: Test with existing modes to ensure coverage

### Phase 2.2: Content Migration
1. **Analysis**: Map existing mode content to rule references
2. **Conversion**: Create automated conversion tools
3. **Validation**: Ensure converted modes produce identical output
4. **Testing**: Comprehensive testing of converted modes

### Phase 2.3: Integration
1. **Pipeline**: Update mode generation to use rule pool
2. **Deployment**: Update deployment system
3. **Compatibility**: Ensure backward compatibility
4. **Extension**: Update VS Code extension commands

### Phase 2.4: Validation
1. **Testing**: Create comprehensive test suite
2. **Performance**: Test performance vs embedded content
3. **Documentation**: Update all documentation
4. **Migration**: Create user migration tools

## SUCCESS CRITERIA
- [ ] All existing modes converted to rule-based configuration
- [ ] Generated mode files identical to original embedded versions
- [ ] No breaking changes to existing functionality
- [ ] Performance equal to or better than embedded content
- [ ] Complete test coverage for new mode system
- [ ] Clear migration path for custom modes

## RISK MITIGATION
- **Breaking Changes**: Maintain backward compatibility during transition
- **Performance**: Monitor generation performance vs embedded content
- **Complexity**: Incremental migration with validation at each step
- **User Impact**: Transparent migration with fallback to embedded content

---

**Phase 2 Start Date**: June 8, 2025
**Estimated Completion**: June 9-10, 2025 (depending on complexity)
**Current Status**: Phase 2.1 in progress
