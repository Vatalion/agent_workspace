# Documentation Rules

## DOCUMENTATION STRUCTURE RULES
HIERARCHICAL STRUCTURE: Main README.md at project root with package-specific READMEs in major directories
CONNECTED DOCUMENTATION: Package READMEs should reference and connect to the main README
AVOID REDUNDANCY: Never duplicate general project info across multiple README files
CONSOLIDATE: Merge overlapping content, keep package-specific details in their respective READMEs

## DOCUMENTATION HIERARCHY
- README.md: Project overview, quick start, architecture status, core rules, links to package docs
- Package READMEs: Technical details specific to major packages (lib/, amplify/, etc.)
- Temporary docs: Use .temp/ folder for work-in-progress documentation
- Specialized docs: Technical implementation details in appropriate subdirectories

## DOCUMENTATION MAINTENANCE
PREVENT BLOAT: Before creating new .md files, check if content belongs in README.md
ELIMINATE CROSS-REFERENCES: Don't create webs of interconnected documentation files
CLEAN REGULARLY: Audit and consolidate documentation during major milestones
PRESERVE ESSENTIAL: Keep technical implementation details in appropriate locations

## FORBIDDEN PATTERNS
- Multiple overview files (PROJECT_SUMMARY.md, OVERVIEW.md, etc.)
- Rule files that duplicate README content (WORKING_RULES.md, GUIDELINES.md)
- Process files that belong in README (METHODOLOGY.md, PROCESS.md)
- Cross-referencing documentation webs

## Best Practices

### Content Organization
- Start with the most important information
- Use clear headings and structure
- Provide concrete examples
- Keep documentation close to the code it describes

### Maintenance Schedule
- Review documentation during major releases
- Update examples when code changes
- Remove outdated information promptly
- Consolidate related documentation regularly 