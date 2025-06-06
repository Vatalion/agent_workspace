# Project Organization Rules

## ROOT FOLDER CLEANLINESS
**MANDATORY**: Keep root folder minimal and professional

### ALLOWED IN ROOT
- README.md (main project documentation)
- LICENSE (project license)
- package.json (main project dependencies)
- tsconfig.json (TypeScript configuration)
- PROJECT_STRUCTURE.md (navigation guide)
- Core component folders only

### FORBIDDEN IN ROOT
- ❌ Report files (→ docs/)
- ❌ Test scripts (→ testing/)
- ❌ Demo scripts (→ scripts/)
- ❌ Examples (→ examples/)
- ❌ Temporary files
- ❌ Build artifacts (except essential)

## FOLDER STRUCTURE STANDARDS

### MANDATORY FOLDERS
```
/docs/           # All documentation files
/scripts/        # Utility and demo scripts  
/testing/        # Test files and utilities
/examples/       # Code examples and samples
/.archive/       # Deprecated/legacy files
```

### COMPONENT FOLDERS
```
/src/            # Main MCP server source
/flutter_debug_extension/  # VS Code extension
/test_flutter_app/         # Flutter test application
```

### HIDDEN FOLDERS
```
/.github/        # GitHub workflows and rules
/.vscode/        # VS Code configuration
/.tasks/         # Task tracking
```

## ORGANIZATION WORKFLOW

### BEFORE CREATING FILES
1. Determine appropriate folder location
2. Never place non-essential files in root
3. Use existing folder structure

### DURING DEVELOPMENT
1. Place files in correct folders immediately
2. Move files if they end up in wrong location
3. Keep root clean at all times

### AFTER COMPLETION
1. Audit root folder for cleanliness
2. Move any misplaced files
3. Update PROJECT_STRUCTURE.md if needed

## FILE NAMING CONVENTIONS

### DOCUMENTATION
- Use UPPERCASE for major reports
- Use descriptive names with dates
- Group related docs in subfolders if needed

### SCRIPTS
- Use descriptive names with .sh extension
- Include purpose in filename
- Make executable with chmod +x

### TESTING
- Prefix with test_ for test files
- Use appropriate file extensions
- Include clear purpose in name

## ENFORCEMENT

### BEFORE COMMIT
- [ ] Check root folder contains only allowed files
- [ ] Verify all files are in correct folders
- [ ] Update PROJECT_STRUCTURE.md if needed
- [ ] Run organization audit

### AUTOMATED CHECKS
Create scripts to verify:
- Root folder cleanliness
- Proper file organization
- Missing files in wrong locations

## EXAMPLES

### ✅ GOOD ROOT STRUCTURE
```
README.md
LICENSE  
package.json
tsconfig.json
PROJECT_STRUCTURE.md
/docs/
/scripts/
/testing/
/src/
/flutter_debug_extension/
```

### ❌ BAD ROOT STRUCTURE  
```
README.md
FINAL_REPORT.md          # → docs/
test_script.js           # → testing/
demo.sh                  # → scripts/
old_readme.md            # → .archive/
random_file.txt          # → DELETE or appropriate folder
```
