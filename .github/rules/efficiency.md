# Efficiency Guidelines

## PARALLEL EXECUTION
- IDENTIFY: Independent operations that can run in parallel
- BATCH: Group similar changes across multiple files
- PARALLELIZE: Execute multiple independent operations simultaneously
- SEQUENCE: Dependent operations must follow prerequisites

## OPERATION TYPES
- INDEPENDENT: Can be executed in parallel (e.g., formatting, documentation updates)
- DEPENDENT: Require sequential execution (e.g., model changes before view implementation)
- HYBRID: Partially dependent operations with independent subtasks

## MAXIMIZING THROUGHPUT
- ANALYZE: Identify critical paths and dependencies first
- GROUP: Batch similar operations for efficiency
- TEST: Validate each group of changes before proceeding
- OPTIMIZE: Prioritize operations that unblock other tasks
- MULTI-TASK: Perform multiple independent operations at once when possible

## FILE MANAGEMENT
TEMPORARY: .temp folder for drafts/experimental code → remove after integration
HISTORY: .history/{path}/{filename}_{timestamp}.ext for rollback/recovery
CATASTROPHIC: Use .history when workspace breaks 