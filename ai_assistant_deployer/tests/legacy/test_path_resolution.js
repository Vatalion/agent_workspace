#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Extension Path Resolution');
console.log('=====================================');

// Simulate the extension environment
const extensionPath = __dirname;
console.log('Extension Path:', extensionPath);

// Test the old __dirname approach (what was broken)
const oldPath = path.join(__dirname, '..', '..', 'out', '.github');
console.log('Old Path (broken):', oldPath);
console.log('Old Path Exists:', fs.existsSync(oldPath));

// Test the new extension context approach (fixed)
const newPath = path.join(extensionPath, 'out', '.github');
console.log('New Path (fixed):', newPath);
console.log('New Path Exists:', fs.existsSync(newPath));

if (fs.existsSync(newPath)) {
    console.log('\n✅ SUCCESS: Deployment files found!');
    const files = fs.readdirSync(newPath);
    console.log('Available files:', files.length);
    files.forEach(file => console.log(`  • ${file}`));
    
    // Test modes directory
    const modesPath = path.join(newPath, 'modes');
    if (fs.existsSync(modesPath)) {
        const modes = fs.readdirSync(modesPath);
        console.log('\nAvailable modes:', modes);
    }
} else {
    console.log('\n❌ FAILED: Deployment files not found!');
}

console.log('\n🎯 Path Resolution Test Complete');
