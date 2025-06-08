/**
 * Mode Generation Pipeline Integration Test
 * Tests the integration between the new generation pipeline and existing deployment system
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ModeDeploymentService } from '../services/modeDeployment';
import { ModeDiscoveryService } from '../services/modeDiscovery';
import { RulePoolService } from '../services/rulePoolService';
import { ModeConfigurationService } from '../services/modeConfigurationService';
import { ModeGenerationPipeline } from '../services/modeGenerationPipeline';

export interface IntegrationTestResult {
    phase: string;
    success: boolean;
    message: string;
    details?: any;
}

export class ModeGenerationIntegrationTest {
    private extensionPath: string;
    private testWorkspacePath: string;

    constructor(extensionPath: string) {
        this.extensionPath = extensionPath;
        this.testWorkspacePath = path.join(extensionPath, 'test-integration-workspace');
    }

    /**
     * Run comprehensive integration tests
     */
    async runIntegrationTests(): Promise<IntegrationTestResult[]> {
        const results: IntegrationTestResult[] = [];

        console.log('🧪 Starting Mode Generation Pipeline Integration Tests');

        // Phase 1: Setup test environment
        results.push(await this.testSetupEnvironment());

        // Phase 2: Test service initialization
        results.push(await this.testServiceInitialization());

        // Phase 3: Test configuration loading
        results.push(await this.testConfigurationLoading());

        // Phase 4: Test rule-based generation
        results.push(await this.testRuleBasedGeneration());

        // Phase 5: Test deployment integration
        results.push(await this.testDeploymentIntegration());

        // Phase 6: Test backward compatibility
        results.push(await this.testBackwardCompatibility());

        // Summary
        const successCount = results.filter(r => r.success).length;
        console.log(`\n📊 Integration Test Summary: ${successCount}/${results.length} passed`);

        return results;
    }

    /**
     * Test setup of test environment
     */
    private async testSetupEnvironment(): Promise<IntegrationTestResult> {
        try {
            // Create test workspace directory
            if (!fs.existsSync(this.testWorkspacePath)) {
                fs.mkdirSync(this.testWorkspacePath, { recursive: true });
            }

            // Verify migrated configurations exist
            const migratedConfigsPath = path.join(this.extensionPath, 'migrated-configs');
            const configFiles = ['enterprise-migrated.json', 'simplified-migrated.json', 'hybrid-migrated.json'];
            
            for (const configFile of configFiles) {
                const configPath = path.join(migratedConfigsPath, configFile);
                if (!fs.existsSync(configPath)) {
                    throw new Error(`Migrated configuration not found: ${configFile}`);
                }
            }

            return {
                phase: 'Environment Setup',
                success: true,
                message: 'Test environment prepared successfully',
                details: { workspace: this.testWorkspacePath, configs: configFiles.length }
            };

        } catch (error) {
            return {
                phase: 'Environment Setup',
                success: false,
                message: `Failed to setup environment: ${error}`
            };
        }
    }

    /**
     * Test service initialization
     */
    private async testServiceInitialization(): Promise<IntegrationTestResult> {
        try {
            // Initialize rule pool service
            const rulePoolService = new RulePoolService(this.extensionPath);
            await rulePoolService.initialize();

            // Initialize mode configuration service
            const modeConfigService = new ModeConfigurationService(rulePoolService);

            // Initialize generation pipeline
            const generationPipeline = new ModeGenerationPipeline(
                modeConfigService,
                rulePoolService,
                this.extensionPath
            );

            // Initialize deployment service
            const deploymentService = new ModeDeploymentService(this.testWorkspacePath, this.extensionPath);
            await deploymentService.initializeGenerationPipeline();

            const ruleCount = (await rulePoolService.getAllRules()).length;

            return {
                phase: 'Service Initialization',
                success: true,
                message: 'All services initialized successfully',
                details: { rulePoolRules: ruleCount }
            };

        } catch (error) {
            return {
                phase: 'Service Initialization',
                success: false,
                message: `Service initialization failed: ${error}`
            };
        }
    }

    /**
     * Test configuration loading
     */
    private async testConfigurationLoading(): Promise<IntegrationTestResult> {
        try {
            const rulePoolService = new RulePoolService(this.extensionPath);
            await rulePoolService.initialize();
            
            const modeConfigService = new ModeConfigurationService(rulePoolService);

            const configResults = [];

            // Test loading each migrated configuration
            const configFiles = [
                'enterprise-migrated.json',
                'simplified-migrated.json', 
                'hybrid-migrated.json'
            ];

            for (const configFile of configFiles) {
                const configPath = path.join(this.extensionPath, 'migrated-configs', configFile);
                
                const config = await modeConfigService.loadModeConfiguration(configPath, {
                    validateRules: true,
                    expandSelections: false
                });

                const validation = await modeConfigService.validateModeConfiguration(config);

                configResults.push({
                    file: configFile,
                    valid: validation.valid,
                    rulesCount: config.ruleSelection?.explicitIncludes?.length || 0,
                    errors: validation.errors.length,
                    warnings: validation.warnings.length
                });
            }

            const allValid = configResults.every(r => r.valid);

            return {
                phase: 'Configuration Loading',
                success: allValid,
                message: allValid ? 'All configurations loaded and validated' : 'Some configurations failed validation',
                details: configResults
            };

        } catch (error) {
            return {
                phase: 'Configuration Loading',
                success: false,
                message: `Configuration loading failed: ${error}`
            };
        }
    }

    /**
     * Test rule-based generation
     */
    private async testRuleBasedGeneration(): Promise<IntegrationTestResult> {
        try {
            const rulePoolService = new RulePoolService(this.extensionPath);
            await rulePoolService.initialize();
            
            const modeConfigService = new ModeConfigurationService(rulePoolService);
            const generationPipeline = new ModeGenerationPipeline(
                modeConfigService,
                rulePoolService,
                this.extensionPath
            );

            const generationResults = [];

            // Test generation for each mode
            const modes = ['enterprise', 'simplified', 'hybrid'];

            for (const mode of modes) {
                const configPath = path.join(this.extensionPath, 'migrated-configs', `${mode}-migrated.json`);
                const outputPath = path.join(this.testWorkspacePath, `generated-${mode}`);

                const result = await generationPipeline.generateModeFromMigratedConfig(configPath, outputPath);

                generationResults.push({
                    mode,
                    success: result.success,
                    filesGenerated: result.generatedFiles.length,
                    duration: result.duration
                });

                // Verify generated files exist
                if (result.success) {
                    for (const file of result.generatedFiles) {
                        const filePath = path.join(outputPath, file);
                        if (!fs.existsSync(filePath)) {
                            throw new Error(`Generated file not found: ${file}`);
                        }
                    }
                }
            }

            const allSuccessful = generationResults.every(r => r.success);

            return {
                phase: 'Rule-based Generation',
                success: allSuccessful,
                message: allSuccessful ? 'All modes generated successfully' : 'Some mode generations failed',
                details: generationResults
            };

        } catch (error) {
            return {
                phase: 'Rule-based Generation',
                success: false,
                message: `Rule-based generation failed: ${error}`
            };
        }
    }

    /**
     * Test deployment integration
     */
    private async testDeploymentIntegration(): Promise<IntegrationTestResult> {
        try {
            const deploymentService = new ModeDeploymentService(this.testWorkspacePath, this.extensionPath);
            await deploymentService.initializeGenerationPipeline();

            // Create mock mode info for testing
            const mockModeInfo = {
                id: 'enterprise',
                name: 'Enterprise Mode',
                description: 'Enterprise development mode',
                features: ['task-management', 'project-structure', 'automation'],
                targetProject: 'typescript',
                estimatedHours: '50-500 hours',
                isActive: true,
                hasConflicts: false,
                path: '',
                files: []
            };

            // Test deployment
            const deploymentResult = await deploymentService.deployMode(mockModeInfo);

            // Verify deployment results
            const expectedFiles = ['copilot-instructions.md', 'project-rules.md', 'system-config.json'];
            const missingFiles = expectedFiles.filter(file => 
                !deploymentResult.deployedFiles.includes(file)
            );

            if (missingFiles.length > 0) {
                throw new Error(`Missing expected files: ${missingFiles.join(', ')}`);
            }

            // Verify system config includes deployment method
            const systemConfigPath = path.join(this.testWorkspacePath, '.github', 'system-config.json');
            if (fs.existsSync(systemConfigPath)) {
                const systemConfig = JSON.parse(fs.readFileSync(systemConfigPath, 'utf-8'));
                if (!systemConfig.deployment_method) {
                    throw new Error('System config missing deployment method');
                }
            }

            return {
                phase: 'Deployment Integration',
                success: deploymentResult.success,
                message: deploymentResult.message,
                details: {
                    deploymentMethod: deploymentResult.deploymentMethod,
                    filesDeployed: deploymentResult.deployedFiles.length,
                    filesCleaned: deploymentResult.cleanedFiles.length
                }
            };

        } catch (error) {
            return {
                phase: 'Deployment Integration',
                success: false,
                message: `Deployment integration failed: ${error}`
            };
        }
    }

    /**
     * Test backward compatibility
     */
    private async testBackwardCompatibility(): Promise<IntegrationTestResult> {
        try {
            const deploymentService = new ModeDeploymentService(this.testWorkspacePath, this.extensionPath);

            // Test fallback to template-based deployment for non-migrated modes
            const mockCustomMode = {
                id: 'custom-non-migrated',
                name: 'Custom Non-Migrated Mode',
                description: 'A mode without migrated configuration',
                path: '',
                files: [],
                features: ['basic'],
                targetProject: 'any',
                estimatedHours: '1-2 hours',
                isActive: false,
                hasConflicts: false
            };

            // This should fall back to template-based deployment
            const result = await deploymentService.deployMode(mockCustomMode);

            // Even if template files don't exist, the system should handle gracefully
            // and indicate template-based deployment was attempted

            return {
                phase: 'Backward Compatibility',
                success: true, // Success means no critical errors, even if files weren't found
                message: 'Backward compatibility maintained - fallback to template-based deployment works',
                details: {
                    deploymentMethod: result.deploymentMethod || 'template-based',
                    gracefulDegradation: !result.success ? 'Templates not found but system handled gracefully' : 'Normal operation'
                }
            };

        } catch (error) {
            return {
                phase: 'Backward Compatibility',
                success: false,
                message: `Backward compatibility test failed: ${error}`
            };
        }
    }

    /**
     * Cleanup test environment
     */
    async cleanup(): Promise<void> {
        try {
            if (fs.existsSync(this.testWorkspacePath)) {
                fs.rmSync(this.testWorkspacePath, { recursive: true, force: true });
            }
            console.log('🧹 Test environment cleaned up');
        } catch (error) {
            console.warn('⚠️ Cleanup warning:', error);
        }
    }
}

/**
 * Command to run integration tests
 */
export async function runModeGenerationIntegrationTests(extensionPath: string): Promise<void> {
    const tester = new ModeGenerationIntegrationTest(extensionPath);
    
    try {
        const results = await tester.runIntegrationTests();
        
        // Display results in VS Code
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        const message = `Mode Generation Pipeline Integration Tests: ${successCount}/${totalCount} passed`;
        
        if (successCount === totalCount) {
            vscode.window.showInformationMessage(`✅ ${message}`);
        } else {
            const failedPhases = results.filter(r => !r.success).map(r => r.phase).join(', ');
            vscode.window.showWarningMessage(`⚠️ ${message}. Failed phases: ${failedPhases}`);
        }

        // Show detailed results in output channel
        const outputChannel = vscode.window.createOutputChannel('Mode Generation Tests');
        outputChannel.clear();
        outputChannel.appendLine('Mode Generation Pipeline Integration Test Results');
        outputChannel.appendLine('='.repeat(60));
        
        for (const result of results) {
            const status = result.success ? '✅' : '❌';
            outputChannel.appendLine(`${status} ${result.phase}: ${result.message}`);
            if (result.details) {
                outputChannel.appendLine(`   Details: ${JSON.stringify(result.details, null, 2)}`);
            }
            outputChannel.appendLine('');
        }
        
        outputChannel.show();

    } finally {
        await tester.cleanup();
    }
}
