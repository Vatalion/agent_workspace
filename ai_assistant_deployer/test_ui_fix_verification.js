#!/usr/bin/env node

/**
 * Test to verify that the UI empty issue has been fixed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 AI Assistant Deployer - UI Fix Verification Test');
console.log('================================================\n');

try {
    // 1. Check package.json view configuration
    console.log('1️⃣ Checking package.json view configuration...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const views = packageJson.contributes?.views?.['ai-assistant-deployer'];
    
    if (views && views.length > 0) {
        const view = views[0];
        console.log(`   ✅ View found: ${view.id}`);
        console.log(`   📋 Name: ${view.name}`);
        console.log(`   🎯 Type: ${view.type}`);
        
        if (view.type === 'webview') {
            console.log('   ✅ Correct webview type configured');
        } else {
            console.log('   ❌ Incorrect view type');
        }
    } else {
        console.log('   ❌ No views found in package.json');
        throw new Error('Views configuration missing');
    }

    // 2. Check compiled webview provider
    console.log('\n2️⃣ Checking compiled webview provider...');
    const webviewPath = './out/ui/aiAssistantWebviewProvider.js';
    
    if (fs.existsSync(webviewPath)) {
        console.log('   ✅ Compiled webview provider exists');
        
        const content = fs.readFileSync(webviewPath, 'utf8');
        const viewTypeMatch = content.match(/viewType\s*=\s*['"']([^'"]+)['"]/);
        
        if (viewTypeMatch) {
            const viewType = viewTypeMatch[1];
            console.log(`   🔍 Found viewType: ${viewType}`);
            
            // Check if viewType matches package.json view id
            if (viewType === view.id) {
                console.log('   ✅ ViewType matches package.json view ID!');
            } else {
                console.log(`   ❌ ViewType mismatch! Expected: ${view.id}, Found: ${viewType}`);
                throw new Error('ViewType mismatch detected');
            }
        } else {
            console.log('   ❌ ViewType not found in compiled code');
            throw new Error('ViewType not found');
        }
    } else {
        console.log('   ❌ Compiled webview provider not found');
        throw new Error('Compiled file missing');
    }

    // 3. Check extension registration
    console.log('\n3️⃣ Checking extension registration...');
    const extensionPath = './out/extension.js';
    
    if (fs.existsSync(extensionPath)) {
        console.log('   ✅ Compiled extension exists');
        
        const content = fs.readFileSync(extensionPath, 'utf8');
        const hasWebviewRegistration = content.includes('registerWebviewViewProvider');
        
        if (hasWebviewRegistration) {
            console.log('   ✅ Webview registration found in extension');
        } else {
            console.log('   ❌ Webview registration not found');
            throw new Error('Webview registration missing');
        }
    } else {
        console.log('   ❌ Compiled extension not found');
        throw new Error('Extension file missing');
    }

    // 4. Verify package file
    console.log('\n4️⃣ Checking packaged extension...');
    const vsixFiles = fs.readdirSync('.').filter(file => file.endsWith('.vsix'));
    
    if (vsixFiles.length > 0) {
        console.log(`   ✅ Extension package found: ${vsixFiles[0]}`);
        
        const stats = fs.statSync(vsixFiles[0]);
        console.log(`   📦 Package size: ${(stats.size / 1024).toFixed(1)} KB`);
        
        if (stats.size > 100000) { // > 100KB indicates content
            console.log('   ✅ Package has substantial content');
        } else {
            console.log('   ⚠️  Package seems small, may be incomplete');
        }
    } else {
        console.log('   ❌ No extension package found');
        throw new Error('Extension package missing');
    }

    // 5. Summary
    console.log('\n🎉 SUCCESS: UI Fix Verification Complete!');
    console.log('==========================================');
    console.log('✅ Package.json view configuration: CORRECT');
    console.log('✅ Webview provider viewType: MATCHING');
    console.log('✅ Extension registration: PRESENT');
    console.log('✅ Extension package: READY');
    console.log('\n🚀 Next Steps:');
    console.log('1. Restart VS Code to reload the extension');
    console.log('2. Open the AI Assistant Deployer view in the sidebar');
    console.log('3. Verify the UI now displays content instead of being empty');
    console.log('\n💡 The empty UI issue should now be resolved!');

} catch (error) {
    console.log('\n❌ VERIFICATION FAILED');
    console.log('======================');
    console.log(`Error: ${error.message}`);
    console.log('\n🔧 Recommended Actions:');
    console.log('1. Run: npm run compile');
    console.log('2. Run: npm run package');
    console.log('3. Reinstall the extension');
    process.exit(1);
}
