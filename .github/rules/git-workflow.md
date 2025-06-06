# Git Workflow & Error Recovery

## ERROR RECOVERY & COMMITS
ROLLBACK: `git stash` on breaks → `.history` files → isolate changes → minimal fix
VALIDATION: `flutter analyze && flutter build ios --simulator` before each commit
ATOMIC: Each commit = deployable state | NEVER commit broken builds | PRE-COMMIT: analyze + test

## BRANCH STRATEGY
MAIN: Production only | DEVELOP: Integration | FEATURE: Short-lived | HOTFIX: Critical
MERGE: Tests pass + review + docs | CONFLICTS: Pair review required | ROLLBACK: Tagged releases

## DEPENDENCY & SECURITY
VERSIONS: Pin critical packages | AUDIT: Regular vulnerability scans  
AUTH: Secure token storage | DATA: Privacy compliance | API: Input validation
ROLLBACK: Archive working pubspec.lock | COMPATIBILITY: Test upgrades isolated

## CHECKLIST
✅ Complexity assessed | ✅ Quality gates passed | ✅ Performance validated | ✅ Security checked 