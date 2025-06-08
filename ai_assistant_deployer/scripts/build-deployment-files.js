#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

async function buildDeploymentFiles() {
    console.log('🔨 Building deployment files...');
    
    try {
        const rootDir = path.join(__dirname, '..');
        const templatesDir = path.join(rootDir, 'templates', 'deployment');
        const modesTemplatesDir = path.join(rootDir, 'templates', 'modes');
        const outGithubDir = path.join(rootDir, 'out', '.github');
        
        // Ensure out and dist directories exist
        await fs.ensureDir(path.join(rootDir, 'out'));
        await fs.ensureDir(path.join(rootDir, 'dist'));
        
        // Copy deployment templates to out/.github
        if (await fs.pathExists(templatesDir)) {
            console.log('📁 Copying deployment templates to out/.github');
            
            // Copy contents of templates/deployment/.github to out/.github
            const sourceGithubDir = path.join(templatesDir, '.github');
            if (await fs.pathExists(sourceGithubDir)) {
                await fs.copy(sourceGithubDir, outGithubDir, {
                    overwrite: true,
                    filter: (src, dest) => {
                        // Don't copy .history folders or other build artifacts
                        return !src.includes('.history') && !src.includes('.DS_Store');
                    }
                });
            } else {
                // If no nested .github, copy templates directly
                await fs.copy(templatesDir, outGithubDir, {
                    overwrite: true,
                    filter: (src, dest) => {
                        return !src.includes('.history') && !src.includes('.DS_Store');
                    }
                });
            }
            
            // Ensure scripts are executable
            const scriptsToMakeExecutable = [
                path.join(outGithubDir, 'mode-manager.sh'),
                path.join(outGithubDir, 'update_project_map.sh'),
                path.join(outGithubDir, 'scripts', 'mandatory_cleanup.sh'),
                path.join(outGithubDir, 'scripts', 'setup_task_system.sh'),
                path.join(outGithubDir, 'scripts', 'validate_security.sh')
            ];
            
            for (const script of scriptsToMakeExecutable) {
                if (await fs.pathExists(script)) {
                    await fs.chmod(script, 0o755);
                    console.log(`✅ Made ${path.relative(rootDir, script)} executable`);
                }
            }
            
            // Make all other .sh files executable recursively
            const { execSync } = require('child_process');
            try {
                execSync(`find "${outGithubDir}" -name "*.sh" -exec chmod +x {} \\;`);
                console.log('✅ Made all shell scripts executable');
            } catch (error) {
                console.warn('⚠️  Warning: Could not set execute permissions on all scripts:', error.message);
            }
            
            // Copy mode-specific templates
            if (await fs.pathExists(modesTemplatesDir)) {
                const modesOutDir = path.join(outGithubDir, 'modes');
                await fs.copy(modesTemplatesDir, modesOutDir, { overwrite: true });
                console.log('✅ Copied mode-specific templates');
                
                // Make scripts in modes executable
                const modes = ['enterprise', 'simplified', 'hybrid'];
                for (const mode of modes) {
                    const modeScriptsDir = path.join(modesOutDir, mode, 'scripts');
                    if (await fs.pathExists(modeScriptsDir)) {
                        const scripts = await fs.readdir(modeScriptsDir);
                        for (const script of scripts) {
                            if (script.endsWith('.sh')) {
                                await fs.chmod(path.join(modeScriptsDir, script), 0o755);
                            }
                        }
                    }
                }
            }
            
            console.log('✅ Deployment files built successfully!');
            console.log(`📍 Output: ${path.relative(rootDir, outGithubDir)}`);
            
        } else {
            console.error('❌ Templates directory not found!');
            console.error(`Expected: ${templatesDir}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Failed to build deployment files:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    buildDeploymentFiles();
}

module.exports = { buildDeploymentFiles };
