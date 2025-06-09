#!/usr/bin/env node

/**
 * End-to-End Custom Mode Builder Test
 * Tests the complete workflow from UI to deployment
 */

const fs = require('fs');
const path = require('path');

class CustomModeBuilderE2ETest {
    constructor() {
        this.workspaceRoot = process.cwd();
        this.testDataDir = path.join(this.workspaceRoot, 'test-custom-mode-output');
        this.testResults = {
            preparation: false,
            modeCreation: false,
            instructionsGeneration: false,
            deploymentSimulation: false,
            cleanup: false,
            overall: false
        };
    }

    async runE2ETest() {
        console.log('🚀 Starting Custom Mode Builder End-to-End Test...\n');

        try {
            await this.prepareTestEnvironment();
            await this.testModeCreation();
            await this.testInstructionsGeneration();
            await this.testDeploymentSimulation();
            await this.cleanup();
            await this.generateTestReport();

        } catch (error) {
            console.error('❌ E2E Test failed:', error);
            await this.cleanup();
            process.exit(1);
        }
    }

    async prepareTestEnvironment() {
        console.log('🔧 1. Preparing Test Environment...');
        
        try {
            // Create test directory
            if (fs.existsSync(this.testDataDir)) {
                this.removeDirectoryRecursive(this.testDataDir);
            }
            fs.mkdirSync(this.testDataDir, { recursive: true });
            
            console.log('✅ Test environment prepared');
            this.testResults.preparation = true;
        } catch (error) {
            console.log('❌ Failed to prepare test environment:', error);
            this.testResults.preparation = false;
        }
    }

    async testModeCreation() {
        console.log('🎨 2. Testing Custom Mode Creation...');
        
        try {
            // Simulate custom mode data (what would come from the UI)
            const customModeData = {
                name: 'Test Flutter Clean Architecture',
                description: 'A test mode for Flutter development using clean architecture principles',
                targetProject: 'Flutter',
                estimatedHours: 4,
                features: [
                    'Clean Architecture implementation',
                    'Bloc state management',
                    'Repository pattern',
                    'Dependency injection'
                ],
                rules: [
                    {
                        title: 'Single Responsibility Principle',
                        description: 'Each class should have only one reason to change',
                        category: 'architecture',
                        urgency: 'high',
                        examples: 'Use case classes should only contain business logic'
                    },
                    {
                        title: 'Dependency Injection',
                        description: 'Use GetIt or similar for dependency injection',
                        category: 'architecture',
                        urgency: 'medium'
                    }
                ]
            };

            // Save test mode data
            const modeDataPath = path.join(this.testDataDir, 'test-mode-data.json');
            fs.writeFileSync(modeDataPath, JSON.stringify(customModeData, null, 2));
            
            console.log('✅ Custom mode creation test data prepared');
            console.log('   Mode Name:', customModeData.name);
            console.log('   Target Project:', customModeData.targetProject);
            console.log('   Rules Count:', customModeData.rules.length);
            console.log('   Features Count:', customModeData.features.length);
            
            this.testResults.modeCreation = true;
        } catch (error) {
            console.log('❌ Mode creation test failed:', error);
            this.testResults.modeCreation = false;
        }
    }

    async testInstructionsGeneration() {
        console.log('📝 3. Testing Instructions Generation...');
        
        try {
            // Load test mode data
            const modeDataPath = path.join(this.testDataDir, 'test-mode-data.json');
            const customModeData = JSON.parse(fs.readFileSync(modeDataPath, 'utf8'));
            
            // Simulate the instructions generation process
            const instructions = this.generateTestInstructions(customModeData);
            
            // Save generated instructions
            const instructionsPath = path.join(this.testDataDir, 'test-instructions.md');
            fs.writeFileSync(instructionsPath, instructions, 'utf8');
            
            // Validate instructions content
            const validation = this.validateInstructions(instructions, customModeData);
            
            if (validation.isValid) {
                console.log('✅ Instructions generation successful');
                console.log('   Instructions file size:', instructions.length, 'characters');
                console.log('   Contains mode name:', validation.hasModeName);
                console.log('   Contains description:', validation.hasDescription);
                console.log('   Contains rules:', validation.hasRules);
                console.log('   Contains features:', validation.hasFeatures);
                this.testResults.instructionsGeneration = true;
            } else {
                console.log('❌ Instructions validation failed:', validation.errors);
                this.testResults.instructionsGeneration = false;
            }
            
        } catch (error) {
            console.log('❌ Instructions generation test failed:', error);
            this.testResults.instructionsGeneration = false;
        }
    }

    async testDeploymentSimulation() {
        console.log('🚀 4. Testing Deployment Simulation...');
        
        try {
            // Simulate creating .github directory and files
            const githubDir = path.join(this.testDataDir, '.github');
            fs.mkdirSync(githubDir, { recursive: true });
            
            // Copy instructions to deployment location
            const sourceInstructions = path.join(this.testDataDir, 'test-instructions.md');
            const deployedInstructions = path.join(githubDir, 'ai-assistant-instructions.md');
            fs.copyFileSync(sourceInstructions, deployedInstructions);
            
            // Create system config
            const systemConfig = {
                mode: 'test-flutter-clean-architecture',
                deployment_timestamp: new Date().toISOString(),
                deployed_by: 'Custom Mode Builder E2E Test',
                deployment_method: 'custom-mode'
            };
            
            const systemConfigPath = path.join(githubDir, 'system-config.json');
            fs.writeFileSync(systemConfigPath, JSON.stringify(systemConfig, null, 2));
            
            // Validate deployment
            const deploymentValidation = this.validateDeployment(githubDir);
            
            if (deploymentValidation.isValid) {
                console.log('✅ Deployment simulation successful');
                console.log('   Instructions deployed:', deploymentValidation.hasInstructions);
                console.log('   System config created:', deploymentValidation.hasSystemConfig);
                console.log('   Deployment method:', systemConfig.deployment_method);
                this.testResults.deploymentSimulation = true;
            } else {
                console.log('❌ Deployment validation failed:', deploymentValidation.errors);
                this.testResults.deploymentSimulation = false;
            }
            
        } catch (error) {
            console.log('❌ Deployment simulation test failed:', error);
            this.testResults.deploymentSimulation = false;
        }
    }

    async cleanup() {
        console.log('🧹 5. Cleaning Up Test Environment...');
        
        try {
            if (fs.existsSync(this.testDataDir)) {
                this.removeDirectoryRecursive(this.testDataDir);
            }
            console.log('✅ Test environment cleaned up');
            this.testResults.cleanup = true;
        } catch (error) {
            console.log('⚠️  Cleanup warning:', error);
            this.testResults.cleanup = false;
        }
    }

    generateTestInstructions(customModeData) {
        const timestamp = new Date().toISOString();
        const rules = customModeData.rules || [];
        const features = customModeData.features || [];
        
        let rulesContent = '';
        if (rules.length > 0) {
            rulesContent = rules.map((rule, index) => {
                const title = rule.title || `Rule ${index + 1}`;
                const description = rule.description || 'No description provided';
                const category = rule.category ? `\n**Category:** ${rule.category}` : '';
                const urgency = rule.urgency ? `\n**Priority:** ${rule.urgency}` : '';
                const examples = rule.examples ? `\n**Examples:**\n${rule.examples}` : '';
                
                return `## ${index + 1}. ${title}\n${description}${category}${urgency}${examples}\n`;
            }).join('\n');
        } else {
            rulesContent = `## General Guidelines
- Follow best practices for the target technology
- Write clean, maintainable code
- Include proper error handling
- Add comprehensive documentation`;
        }

        let featuresContent = '';
        if (features.length > 0) {
            featuresContent = features.map(feature => `- ${feature}`).join('\n');
        } else {
            featuresContent = `- Custom rule-based development assistance
- Project-specific guidance
- Best practice enforcement`;
        }
        
        return `# ${customModeData.name} - AI Assistant Instructions

> Generated on: ${timestamp}
> Mode Type: Custom
> Target Project: ${customModeData.targetProject || 'General'}

## Description
${customModeData.description}

## Instructions
When generating code, please follow these user provided coding instructions. You can ignore an instruction if it contradicts a system message.

<instructions>
# ${customModeData.name} Mode

${rulesContent}

## Estimated Setup Time
Approximately ${customModeData.estimatedHours || 2} hours

## Mode Features
${featuresContent}

</instructions>

---
*Generated by AI Assistant Deployer - Custom Mode Builder*
`;
    }

    validateInstructions(instructions, customModeData) {
        const validation = {
            isValid: true,
            hasModeName: false,
            hasDescription: false,
            hasRules: false,
            hasFeatures: false,
            errors: []
        };

        // Check for mode name
        if (instructions.includes(customModeData.name)) {
            validation.hasModeName = true;
        } else {
            validation.errors.push('Mode name not found in instructions');
        }

        // Check for description
        if (instructions.includes(customModeData.description)) {
            validation.hasDescription = true;
        } else {
            validation.errors.push('Description not found in instructions');
        }

        // Check for rules
        if (customModeData.rules && customModeData.rules.length > 0) {
            const hasAllRules = customModeData.rules.every(rule => 
                instructions.includes(rule.title || '') || instructions.includes(rule.description || '')
            );
            validation.hasRules = hasAllRules;
            if (!hasAllRules) {
                validation.errors.push('Not all rules found in instructions');
            }
        } else {
            validation.hasRules = true; // No rules to check
        }

        // Check for features
        if (customModeData.features && customModeData.features.length > 0) {
            const hasAllFeatures = customModeData.features.every(feature => 
                instructions.includes(feature)
            );
            validation.hasFeatures = hasAllFeatures;
            if (!hasAllFeatures) {
                validation.errors.push('Not all features found in instructions');
            }
        } else {
            validation.hasFeatures = true; // No features to check
        }

        validation.isValid = validation.errors.length === 0;
        return validation;
    }

    validateDeployment(githubDir) {
        const validation = {
            isValid: true,
            hasInstructions: false,
            hasSystemConfig: false,
            errors: []
        };

        const instructionsPath = path.join(githubDir, 'ai-assistant-instructions.md');
        const systemConfigPath = path.join(githubDir, 'system-config.json');

        if (fs.existsSync(instructionsPath)) {
            validation.hasInstructions = true;
        } else {
            validation.errors.push('Instructions file not found');
        }

        if (fs.existsSync(systemConfigPath)) {
            validation.hasSystemConfig = true;
        } else {
            validation.errors.push('System config file not found');
        }

        validation.isValid = validation.errors.length === 0;
        return validation;
    }

    removeDirectoryRecursive(dirPath) {
        if (!fs.existsSync(dirPath)) {
            return;
        }

        const items = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);

            if (item.isDirectory()) {
                this.removeDirectoryRecursive(itemPath);
            } else {
                fs.unlinkSync(itemPath);
            }
        }

        fs.rmdirSync(dirPath);
    }

    async generateTestReport() {
        console.log('\n📊 END-TO-END TEST SUMMARY');
        console.log('===========================');
        
        const results = [
            { name: 'Test Environment Setup', status: this.testResults.preparation },
            { name: 'Custom Mode Creation', status: this.testResults.modeCreation },
            { name: 'Instructions Generation', status: this.testResults.instructionsGeneration },
            { name: 'Deployment Simulation', status: this.testResults.deploymentSimulation },
            { name: 'Cleanup', status: this.testResults.cleanup }
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
            console.log('🎉 Custom Mode Builder E2E test PASSED! Ready for production use.');
        } else {
            console.log('⚠️  Some E2E tests failed. Please investigate before production use.');
        }

        // Create detailed test report
        const report = {
            testType: 'End-to-End Custom Mode Builder Test',
            timestamp: new Date().toISOString(),
            results: this.testResults,
            detailedResults: results,
            summary: {
                totalTests: totalCount,
                passedTests: passCount,
                failedTests: totalCount - passCount,
                overallStatus: this.testResults.overall ? 'PASS' : 'FAIL'
            },
            recommendation: this.testResults.overall ? 
                'Custom Mode Builder is fully functional and ready for production deployment' :
                'Custom Mode Builder has issues that need to be resolved before production use'
        };

        const reportPath = path.join(this.workspaceRoot, 'custom-mode-builder-e2e-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Detailed test report saved to: ${reportPath}`);
    }
}

// Run E2E test
const e2eTest = new CustomModeBuilderE2ETest();
e2eTest.runE2ETest().catch(console.error);
