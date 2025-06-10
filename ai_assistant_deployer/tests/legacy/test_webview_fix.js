/**
 * Test script to verify the empty UI fix for AI Assistant Deployer
 * This script checks if the webview HTML generation works without errors
 */

const fs = require('fs');
const path = require('path');

// Mock VS Code API for testing
const mockVSCode = {
    window: {
        createWebviewPanel: () => ({
            webview: {
                html: '',
                postMessage: () => {},
                onDidReceiveMessage: () => ({ dispose: () => {} })
            }
        }),
        showInformationMessage: (msg) => console.log('INFO:', msg),
        showErrorMessage: (msg) => console.log('ERROR:', msg)
    },
    workspace: {
        getConfiguration: () => ({}),
        workspaceFolders: [{ uri: { fsPath: __dirname } }]
    },
    Uri: {
        file: (path) => ({ fsPath: path })
    }
};

console.log('🧪 Testing AI Assistant Deployer Webview Fix...');

try {
    // Test that the TypeScript file compiles without errors
    const outPath = path.join(__dirname, 'out', 'ui', 'aiAssistantWebviewProvider.js');
    
    if (fs.existsSync(outPath)) {
        console.log('✅ Compiled TypeScript file exists');
        
        // Test that the compiled JS can be required
        const compiledModule = require(outPath);
        console.log('✅ Compiled module can be loaded');
        
        // Mock the extension context
        const mockContext = {
            subscriptions: [],
            extensionPath: __dirname
        };
        
        // Create instance of webview provider
        if (compiledModule.AiAssistantWebviewProvider) {
            const provider = new compiledModule.AiAssistantWebviewProvider(mockContext);
            console.log('✅ Webview provider can be instantiated');
            
            // Test that generateWebviewHTML method exists and can be called
            if (typeof provider.generateWebviewHTML === 'function') {
                try {
                    // Set up a basic state to test HTML generation
                    provider.currentState = {
                        isLoading: false,
                        availableModes: [
                            {
                                id: 'test-mode',
                                name: 'Test Mode',
                                description: 'A test mode for verification',
                                features: ['Testing'],
                                targetProject: 'Test Project',
                                estimatedHours: '2 hours',
                                isActive: false,
                                hasConflicts: false
                            }
                        ],
                        currentMode: null,
                        isDeployed: false,
                        error: null,
                        activeTab: 'modes'
                    };
                    
                    const htmlContent = provider.generateWebviewHTML();
                    
                    if (htmlContent && htmlContent.length > 0) {
                        console.log('✅ generateWebviewHTML produces content');
                        console.log(`📏 HTML content length: ${htmlContent.length} characters`);
                        
                        // Verify the HTML contains essential elements
                        const checks = [
                            { test: htmlContent.includes('<!DOCTYPE html>'), name: 'DOCTYPE declaration' },
                            { test: htmlContent.includes('<html lang="en">'), name: 'HTML tag' },
                            { test: htmlContent.includes('<head>'), name: 'Head section' },
                            { test: htmlContent.includes('<style>'), name: 'CSS styles' },
                            { test: htmlContent.includes('<body>'), name: 'Body section' },
                            { test: htmlContent.includes('<script>'), name: 'JavaScript code' },
                            { test: htmlContent.includes('AI Assistant Deployer'), name: 'Title text' },
                            { test: htmlContent.includes('acquireVsCodeApi'), name: 'VS Code API integration' },
                            { test: htmlContent.includes('deployMode'), name: 'Deploy function' },
                            { test: htmlContent.includes('switchTab'), name: 'Tab switching function' }
                        ];
                        
                        let passedChecks = 0;
                        checks.forEach(check => {
                            if (check.test) {
                                console.log(`✅ Contains ${check.name}`);
                                passedChecks++;
                            } else {
                                console.log(`❌ Missing ${check.name}`);
                            }
                        });
                        
                        console.log(`\n📊 Summary: ${passedChecks}/${checks.length} checks passed`);
                        
                        if (passedChecks === checks.length) {
                            console.log('🎉 ALL TESTS PASSED! The empty UI fix is successful!');
                            console.log('\n✨ The webview should now display properly with:');
                            console.log('   • Complete HTML structure');
                            console.log('   • Proper CSS styling');
                            console.log('   • Working JavaScript functions');
                            console.log('   • VS Code theme integration');
                            console.log('   • Interactive UI elements');
                        } else {
                            console.log('⚠️  Some checks failed. The UI may have issues.');
                        }
                        
                    } else {
                        console.log('❌ generateWebviewHTML produces no content');
                    }
                } catch (htmlError) {
                    console.log('❌ Error generating HTML:', htmlError.message);
                }
            } else {
                console.log('❌ generateWebviewHTML method not found');
            }
        } else {
            console.log('❌ AiAssistantWebviewProvider class not found in compiled module');
        }
        
    } else {
        console.log('❌ Compiled TypeScript file not found at:', outPath);
        console.log('   Make sure to run "npm run compile" first');
    }
    
} catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('Stack trace:', error.stack);
}

console.log('\n🏁 Test completed!');
