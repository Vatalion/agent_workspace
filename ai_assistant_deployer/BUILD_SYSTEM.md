# Build System Architecture

This document explains how the AI Assistant Deployer extension build system works.

## Overview

The extension uses a two-phase build process:
1. **TypeScript Compilation** - Compiles source code to JavaScript
2. **Deployment Template Building** - Copies and organizes deployment files

## Directory Structure

```
ai_assistant_deployer/
├── src/                          # Source TypeScript code
├── templates/                    # Deployment file templates
│   ├── deployment/              # Base deployment files
│   │   └── .github/            # Core GitHub configuration
│   └── modes/                  # Mode-specific templates
│       ├── enterprise/         # Enterprise mode files
│       ├── simplified/         # Simplified mode files
│       └── hybrid/            # Hybrid mode files
├── out/                         # Build output (generated)
│   ├── *.js                    # Compiled extension code
│   └── .github/               # Ready-to-deploy files
└── scripts/
    └── build-deployment-files.js # Deployment build script
```

## Build Process

### Phase 1: TypeScript Compilation
- Runs: `tsc -p ./`
- Compiles `src/**/*.ts` → `out/**/*.js`
- Creates source maps for debugging

### Phase 2: Deployment Template Building
- Runs: `node scripts/build-deployment-files.js`
- Copies `templates/deployment/.github/` → `out/.github/`
- Copies `templates/modes/` → `out/.github/modes/`
- Makes shell scripts executable (chmod +x)
- Preserves file structure and permissions

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | TypeScript compilation only |
| `npm run build:deployment` | Deployment templates only |
| `npm run build` | Full build (both phases) |
| `npm run watch` | Watch mode for development |

## Deployment Flow

When users press deployment buttons:

1. **Extension reads** from `out/.github/`
2. **Copies files** to target workspace `.github/`
3. **Sets permissions** for shell scripts
4. **Updates configuration** based on selected mode

## Key Features

- **Separation of Concerns**: Source templates vs built artifacts
- **Mode Support**: Enterprise, Simplified, Hybrid configurations
- **Permission Management**: Automatic executable permissions
- **Build Validation**: Ensures all required files are present
- **Clean Builds**: Reproducible output every time

## Development Workflow

1. **Edit templates** in `templates/` directory
2. **Run build** with `npm run build`
3. **Test extension** with new deployment files
4. **Package** with `npm run package`

## Troubleshooting

### Missing Deployment Files
- Run `npm run build` to regenerate `out/.github/`
- Check that `templates/` directory exists
- Verify build script completed successfully

### Permission Issues
- Build script automatically sets +x on shell scripts
- Check file permissions after build with `ls -la out/.github/`

### Template Changes Not Appearing
- Ensure you're editing files in `templates/` not `out/`
- Run `npm run build:deployment` after template changes
- Clear `out/.github/` and rebuild if needed
