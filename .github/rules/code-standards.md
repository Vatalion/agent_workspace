# Code Standards & Architecture

## FORMATTING & QUALITY
FORMAT: `dart format lib/` + organized imports | LINT: strict analysis_options.yaml
ARCHITECTURE: No domain→presentation | STATE: Document legacy→clean migration
NAMING: Consistent across legacy/refactored | DI: Consistent injection patterns

## PRINCIPLES
PURE FUNCTIONS: Same input = Same output, No side effects, No mutation
SOLID: Single Responsibility | Open/Closed | Liskov Substitution | Interface Segregation | Dependency Inversion
SEPARATION: Services for side effects | Clean boundaries between layers 