# Refactoring Guidelines

## REFACTORING GUIDELINES
- IMPROVE: Existing code without changing behavior
- REFACTOR: For better readability, maintainability, performance
- AVOID: Major rewrites unless necessary

## SAFETY-FIRST APPROACH
NEVER MODIFY ORIGINALS: Create new files with `_refactored` or `_clean` suffix
PRESERVE SAFETY NET: Keep originals untouched for rollback capability
SWITCH VIA IMPORTS: Change import path to test refactored version
GRADUAL MIGRATION: Move screens one at a time when confident

## DRASTIC CHANGES POLICY
CREATE: `filename_clean.dart` for complete rewrites
CREATE: `filename_refactored.dart` for improved versions
MAINTAIN: Original file untouched as safety net
UPDATE: Only imports to switch between versions
DOCUMENT: Clear migration path in code comments

## NAMING CONVENTIONS
- `_refactored.dart` - Improved version with same interface
- `_clean.dart` - Complete rewrite with simplified architecture

## Implementation Strategies

### Incremental Approach
1. Identify a small, self-contained unit to refactor
2. Create a new file with the appropriate suffix
3. Implement the refactored version
4. Test thoroughly
5. Update imports to switch to the new version
6. Repeat for the next unit

### Documentation Requirements
1. Comment on why the refactoring was needed
2. Explain architectural improvements
3. Document any interface changes
4. Note performance improvements
5. Provide migration guidance for related components

### Testing Standards
1. Ensure all existing tests pass with refactored code
2. Add tests for edge cases discovered during refactoring
3. Verify performance is maintained or improved
4. Test integration with dependent components
