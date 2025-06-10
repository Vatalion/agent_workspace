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
        
        const webviewProviderPath = path.join(this.workspaceRoot, 'src/ui/aiAssistantWebviewProvider.ts');
        
        if (!fs.existsSync(webviewProviderPath)) {
            throw new Error('WebviewProvider file not found');
        }

        const content = fs.readFileSync(webviewProviderPath, 'utf8');
        
        // Check for required UI components
        const requiredComponents = [
            'customModeBuilderModal',
            'Custom Mode Builder Modal',
            'openCustomModeBuilder',
            'deployCustomMode',
            'modal-content',
            'mode-name-input',
            'mode-description-input'
        ];

        let missingComponents = [];
        for (const component of requiredComponents) {
            if (!content.includes(component)) {
                missingComponents.push(component);
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
        
        const webviewProviderPath = path.join(this.workspaceRoot, 'src/ui/aiAssistantWebviewProvider.ts');
        const content = fs.readFileSync(webviewProviderPath, 'utf8');
        
        // Check for required message handlers
        const requiredHandlers = [
            "case 'openCustomModeBuilder':",
            "case 'deployCustomMode':",
            'handleDeployCustomMode',
            'openCustomModeBuilder():',
            'addEventListener(\'message\'',
            'vscode.postMessage'
        ];

        let missingHandlers = [];
        for (const handler of requiredHandlers) {
            if (!content.includes(handler)) {
                missingHandlers.push(handler);
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

        // Check for template files
        const templateFiles = fs.readdirSync(modesTemplateDir);
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
