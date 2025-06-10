#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 AI Assistant Deployer - Rules Tab Debug Test');

// Check deployment state
const workspaceRoot = process.cwd();
const githubDir = path.join(workspaceRoot, '.github');
const systemConfigPath = path.join(githubDir, 'system-config.json');

console.log('Workspace:', workspaceRoot);
console.log('.github exists:', fs.existsSync(githubDir));
console.log('system-config.json exists:', fs.existsSync(systemConfigPath));

if (fs.existsSync(systemConfigPath)) {
    try {
        const config = JSON.parse(fs.readFileSync(systemConfigPath, 'utf8'));
        console.log('Current mode:', config.currentMode);
    } catch (error) {
        console.log('Error reading config:', error.message);
    }
}

// Check rule files
const ruleFiles = [
    '.github/copilot-instructions.md',
    '.github/project-rules.md'
];

ruleFiles.forEach(filePath => {
    const fullPath = path.join(workspaceRoot, filePath);
    console.log(`${filePath} exists:`, fs.existsSync(fullPath));
});

console.log('Test completed');
