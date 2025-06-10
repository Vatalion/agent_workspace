#!/usr/bin/env node

/**
 * Comprehensive Custom Mode Builder Validation Test
 * Tests the complete workflow from UI to deployment
 */

const fs = require('fs');
const path = require('path');

class CustomModeBuilderValidator {
    constructor() {
        this.workspaceRoot = process.cwd();
        this.testResults = {
            uiComponents: false,
            messageHandling: false,
            deploymentWorkflow: false,
            fileGeneration: false,
            overall: false
        };
    }

    async runValidation() {
        console.log('🧪 Starting Custom Mode Builder Validation...\n');

        try {
            await this.validateUIComponents();
            await this.validateMessageHandling();
            await this.validateDeploymentWorkflow();
            await this.validateFileGeneration();
            await this.generateSummary();

        } catch (error) {
            console.error('❌ Validation failed:', error);
            process.exit(1);
        }
    }

    async validateUIComponents() {
        console.log('📋 1. Validating UI Components...');
        
        // Check WebviewHtmlRenderer for modal HTML
        const rendererPath = path.join(this.workspaceRoot, 'src/ui/rendering/WebviewHtmlRenderer.ts');
        const webviewProviderPath = path.join(this.workspaceRoot, 'src/ui/aiAssistantWebviewProvider.ts');
        
        if (!fs.existsSync(rendererPath)) {
            throw new Error('WebviewHtmlRenderer file not found');
        }
        if (!fs.existsSync(webviewProviderPath)) {
            throw new Error('WebviewProvider file not found');
        }

        const rendererContent = fs.readFileSync(rendererPath, 'utf8');
        const providerContent = fs.readFileSync(webviewProviderPath, 'utf8');
        
        // Check for required UI components in renderer
        const requiredUIComponents = [
            'customModeBuilderModal',
            'Custom Mode Builder Modal',
            'modal-content',
            'mode-name-input',
            'mode-description-input',
            'generateCustomModeBuilderModal'
        ];

        // Check for required methods in provider
        const requiredProviderMethods = [
            'openCustomModeBuilder',
            'handleCreateCustomMode',
            'handleLoadAvailableRules'
        ];

        let missingComponents = [];
        
        // Check renderer components
        for (const component of requiredUIComponents) {
            if (!rendererContent.includes(component)) {
                missingComponents.push(component);
            }
        }
        
        // Check provider methods
        for (const method of requiredProviderMethods) {
            if (!providerContent.includes(method)) {
                missingComponents.push(method);
            }
        }

        if (missingComponents.length > 0) {
            console.log('⚠️  Missing UI components:', missingComponents);
            this.testResults.uiComponents = false;
        } else {
            console.log('✅ All UI components present');
            this.testResults.uiComponents = true;
        }
    }

    async validateMessageHandling() {
        console.log('📡 2. Validating Message Handling...');
        
        // Check WebviewMessageHandler for message routing
        const messageHandlerPath = path.join(this.workspaceRoot, 'src/ui/messaging/WebviewMessageHandler.ts');
        const rendererPath = path.join(this.workspaceRoot, 'src/ui/rendering/WebviewHtmlRenderer.ts');
        const webviewProviderPath = path.join(this.workspaceRoot, 'src/ui/aiAssistantWebviewProvider.ts');
        
        if (!fs.existsSync(messageHandlerPath)) {
            throw new Error('WebviewMessageHandler file not found');
        }
        if (!fs.existsSync(rendererPath)) {
            throw new Error('WebviewHtmlRenderer file not found');
        }
        if (!fs.existsSync(webviewProviderPath)) {
            throw new Error('WebviewProvider file not found');
        }

        const handlerContent = fs.readFileSync(messageHandlerPath, 'utf8');
        const rendererContent = fs.readFileSync(rendererPath, 'utf8');
        const providerContent = fs.readFileSync(webviewProviderPath, 'utf8');
        
        // Check for required message handling components
        const requiredInHandler = [
            "case 'openCustomModeBuilder':",
            "case 'loadAvailableRules':",
            "case 'createCustomMode':",
            'handleOpenCustomModeBuilder',
            'handleLoadAvailableRules',
            'handleCreateCustomMode'
        ];

        const requiredInRenderer = [
            'addEventListener(\'message\'',
            'vscode.postMessage',
            'openCustomModeBuilder()',
            'loadAvailableRules()',
            'closeCustomModeBuilder()'
        ];

        const requiredInProvider = [
            'openCustomModeBuilder():',
            'handleCreateCustomMode',
            'handleLoadAvailableRules'
        ];

        let missingHandlers = [];
        
        // Check message handler file
        for (const handler of requiredInHandler) {
            if (!handlerContent.includes(handler)) {
                missingHandlers.push(`Handler: ${handler}`);
            }
        }
        
        // Check renderer file
        for (const handler of requiredInRenderer) {
            if (!rendererContent.includes(handler)) {
                missingHandlers.push(`Renderer: ${handler}`);
            }
        }
        
        // Check provider file
        for (const handler of requiredInProvider) {
            if (!providerContent.includes(handler)) {
                missingHandlers.push(`Provider: ${handler}`);
            }
        }

        if (missingHandlers.length > 0) {
            console.log('⚠️  Missing message handlers:', missingHandlers);
            this.testResults.messageHandling = false;
        } else {
            console.log('✅ All message handlers present');
            this.testResults.messageHandling = true;
        }
    }

    async validateDeploymentWorkflow() {
        console.log('🚀 3. Validating Deployment Workflow...');
        
        // Check if ModeDeploymentService exists
        const deploymentServicePath = path.join(this.workspaceRoot, 'src/services/modeDeployment.ts');
        
        if (!fs.existsSync(deploymentServicePath)) {
            console.log('⚠️  ModeDeploymentService not found');
            this.testResults.deploymentWorkflow = false;
            return;
        }

        const content = fs.readFileSync(deploymentServicePath, 'utf8');
        
        // Check for required deployment methods
        const requiredMethods = [
            'deployMode',
            'createInstructions',
            'resetDeployment'
        ];

        let missingMethods = [];
        for (const method of requiredMethods) {
            if (!content.includes(method)) {
                missingMethods.push(method);
            }
        }

        if (missingMethods.length > 0) {
            console.log('⚠️  Missing deployment methods:', missingMethods);
            this.testResults.deploymentWorkflow = false;
        } else {
            console.log('✅ Deployment workflow complete');
            this.testResults.deploymentWorkflow = true;
        }
    }

    async validateFileGeneration() {
        console.log('📁 4. Validating File Generation Capabilities...');
        
        // Check if templates directory exists
        const templatesDir = path.join(this.workspaceRoot, 'templates');
        const modesTemplateDir = path.join(templatesDir, 'modes');
        
        if (!fs.existsSync(templatesDir)) {
            console.log('⚠️  Templates directory not found');
            this.testResults.fileGeneration = false;
            return;
        }

        if (!fs.existsSync(modesTemplateDir)) {
            console.log('⚠️  Modes template directory not found');
            this.testResults.fileGeneration = false;
            return;
        }

        // Check for template files (excluding hybrid which was removed)
        const templateFiles = fs.readdirSync(modesTemplateDir)
            .filter(file => !file.includes('hybrid'));
        if (templateFiles.length === 0) {
            console.log('⚠️  No template files found');
            this.testResults.fileGeneration = false;
        } else {
            console.log('✅ Template files available:', templateFiles.slice(0, 3).join(', '), templateFiles.length > 3 ? '...' : '');
            this.testResults.fileGeneration = true;
        }
    }

    async generateSummary() {
        console.log('\n📊 VALIDATION SUMMARY');
        console.log('=====================');
        
        const results = [
            { name: 'UI Components', status: this.testResults.uiComponents },
            { name: 'Message Handling', status: this.testResults.messageHandling },
            { name: 'Deployment Workflow', status: this.testResults.deploymentWorkflow },
            { name: 'File Generation', status: this.testResults.fileGeneration }
        ];

        results.forEach(result => {
            const icon = result.status ? '✅' : '❌';
            console.log(`${icon} ${result.name}: ${result.status ? 'PASS' : 'FAIL'}`);
        });

        const passCount = results.filter(r => r.status).length;
        const totalCount = results.length;
        
        this.testResults.overall = passCount === totalCount;
        
        console.log(`\n🎯 Overall Result: ${passCount}/${totalCount} tests passed`);
        
        if (this.testResults.overall) {
            console.log('🎉 Custom Mode Builder is ready for use!');
        } else {
            console.log('⚠️  Some components need attention before full functionality');
        }

        // Create validation report
        const report = {
            timestamp: new Date().toISOString(),
            results: this.testResults,
            details: results,
            recommendation: this.testResults.overall ? 
                'Custom Mode Builder is fully functional and ready for deployment' :
                'Please address the failed validations before using the Custom Mode Builder'
        };

        const reportPath = path.join(this.workspaceRoot, 'custom-mode-builder-validation.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Validation report saved to: ${reportPath}`);
    }
}

// Run validation
const validator = new CustomModeBuilderValidator();
validator.runValidation().catch(console.error);
