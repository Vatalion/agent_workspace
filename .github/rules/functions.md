# Function Guidelines

## Overview

This document describes standards for creating functions that are maintainable, testable, and reliable.

## Core Principles

### Pure Functions
- **SAME INPUT = SAME OUTPUT**: Functions should return the same output for the same input
- **NO SIDE EFFECTS**: Functions should not modify state outside their scope
- **PREDICTABLE**: Behavior should be consistent and expected

### Input Handling
- **NO MUTATION**: Don't modify input parameters
- **VALIDATE EARLY**: Check inputs at the beginning of functions
- **DEFAULT VALUES**: Provide sensible defaults for optional parameters

### Separation of Concerns
- **SINGLE PURPOSE**: Functions should do one thing well
- **SERVICES FOR SIDE EFFECTS**: Use services or repositories for I/O and other side effects
- **COMPOSITION**: Build complex functions by composing simpler ones

## Implementation Guidelines

### Function Size
- Keep functions small and focused
- Aim for less than 20 lines per function
- Extract complex logic into helper functions

### Return Values
- Return early to avoid deep nesting
- Be consistent with return types
- Handle edge cases explicitly

### Error Handling
- Use appropriate error handling mechanisms for your language
- Document possible error conditions
- Provide meaningful error messages

## Testing Considerations

### Testability
- Pure functions are easier to test
- Minimize dependencies on external state
- Use dependency injection for required dependencies

### Test Coverage
- Test normal operation paths
- Test edge cases and error conditions
- Consider property-based testing for pure functions

## Documentation Standards

### Function Documentation
- Describe purpose and behavior
- Document parameters and return values
- Note any side effects
- Provide examples for complex functions
