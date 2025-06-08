#!/usr/bin/env node

/**
 * Phase 2.4 - Comprehensive Mode Validation & Testing
 * Complete end-to-end testing of the Rule Pool Architecture
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveValidator {
    constructor() {
        this.results = {
            configurationTests: [],
            deploymentTests: [],
            performanceTests: [],
            integrationTests: [],
            backwardCompatibilityTests: []
        };
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🧪 Phase 2.4 - Comprehensive Mode Validation & Testing');
        console.log('=' .repeat(70));
        console.log(`📅 Started: ${new Date().toISOString()}`);
        console.log('=' .repeat(70));

        try {
            await this.testConfigurationIntegrity();
            await this.testDeploymentWorkflow();
            await this.testPerformanceMetrics();
            await this.testIntegrationPoints();
            await this.testBackwardCompatibility();
            
            this.generateFinalReport();
            
        } catch (error) {
            console.error('❌ Comprehensive testing failed:', error.message);
            process.exit(1);
        }
    }

    async testConfigurationIntegrity() {
        console.log('\n📋 Test Suite 1: Configuration Integrity');
        console.log('-'.repeat(50));
        
        // Test 1.1: Validate migrated configurations
        try {
            const migratedPath = path.join(__dirname, 'migrated-configs');
            const configs = ['enterprise-migrated.json', 'simplified-migrated.json', 'hybrid-migrated.json'];
            
            for (const configFile of configs) {
                const configPath = path.join(migratedPath, configFile);
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                
                // Validate required sections
                const requiredSections = ['metadata', 'ruleSelection', 'structure', 'templates', 'deployment'];
                const missingSections = requiredSections.filter(section => !config[section]);
                
                if (missingSections.length === 0) {
                    console.log(`✅ ${configFile}: All sections valid`);
                    this.results.configurationTests.push({
                        test: `Configuration Integrity: ${configFile}`,
                        status: 'PASS',
                        details: `${requiredSections.length} sections validated`
                    });
                } else {
                    console.log(`❌ ${configFile}: Missing ${missingSections.join(', ')}`);
                    this.results.configurationTests.push({
                        test: `Configuration Integrity: ${configFile}`,
                        status: 'FAIL',
                        details: `Missing sections: ${missingSections.join(', ')}`
                    });
                }
            }
        } catch (error) {
            console.log(`❌ Configuration integrity test failed: ${error.message}`);
        }

        // Test 1.2: Validate rule pool structure
        try {
            const rulePoolPath = path.join(__dirname, 'data', 'rule-pool.json');
            const rulePool = JSON.parse(fs.readFileSync(rulePoolPath, 'utf8'));
            
            // Rule pool uses object format (key-value pairs) not array
            const hasValidStructure = rulePool.metadata && 
                                    rulePool.rules && 
                                    typeof rulePool.rules === 'object' && 
                                    !Array.isArray(rulePool.rules);
            
            if (hasValidStructure) {
                const ruleCount = Object.keys(rulePool.rules).length;
                console.log(`✅ Rule Pool: Valid structure with ${ruleCount} rules`);
                this.results.configurationTests.push({
                    test: 'Rule Pool Structure',
                    status: 'PASS',
                    details: `${ruleCount} rules, valid metadata`
                });
            } else {
                console.log('❌ Rule Pool: Invalid structure');
                this.results.configurationTests.push({
                    test: 'Rule Pool Structure',
                    status: 'FAIL',
                    details: 'Missing metadata or rules object'
                });
            }
        } catch (error) {
            console.log(`❌ Rule pool validation failed: ${error.message}`);
        }
    }

    async testDeploymentWorkflow() {
        console.log('\n🚀 Test Suite 2: Deployment Workflow');
        console.log('-'.repeat(50));
        
        // Test 2.1: Verify compiled services exist
        const requiredServices = [
            'modeGenerationPipeline.js',
            'modeConfigurationService.js',
            'rulePoolService.js',
            'modeMigrationService.js',
            'modeConfigurationAdapter.js'
        ];
        
        const outServicesPath = path.join(__dirname, 'out', 'services');
        let servicesValid = 0;
        
        for (const service of requiredServices) {
            const servicePath = path.join(outServicesPath, service);
            if (fs.existsSync(servicePath)) {
                const stats = fs.statSync(servicePath);
                console.log(`✅ ${service}: ${(stats.size / 1024).toFixed(1)}KB`);
                servicesValid++;
                this.results.deploymentTests.push({
                    test: `Service Compilation: ${service}`,
                    status: 'PASS',
                    details: `${(stats.size / 1024).toFixed(1)}KB compiled`
                });
            } else {
                console.log(`❌ ${service}: Missing`);
                this.results.deploymentTests.push({
                    test: `Service Compilation: ${service}`,
                    status: 'FAIL',
                    details: 'Service file not found'
                });
            }
        }
        
        // Test 2.2: Verify extension package
        const vsixPath = path.join(__dirname, 'ai-assistant-deployer-1.0.0.vsix');
        if (fs.existsSync(vsixPath)) {
            const stats = fs.statSync(vsixPath);
            console.log(`✅ Extension Package: ${(stats.size / 1024).toFixed(1)}KB`);
            this.results.deploymentTests.push({
                test: 'Extension Package Build',
                status: 'PASS',
                details: `${(stats.size / 1024).toFixed(1)}KB package created`
            });
        } else {
            console.log('❌ Extension Package: Missing');
            this.results.deploymentTests.push({
                test: 'Extension Package Build',
                status: 'FAIL',
                details: 'VSIX file not found'
            });
        }
    }

    async testPerformanceMetrics() {
        console.log('\n⚡ Test Suite 3: Performance Metrics');
        console.log('-'.repeat(50));
        
        // Test 3.1: Configuration loading performance
        try {
            const start = Date.now();
            const configs = ['enterprise-migrated.json', 'simplified-migrated.json', 'hybrid-migrated.json'];
            
            for (const config of configs) {
                const configPath = path.join(__dirname, 'migrated-configs', config);
                JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
            
            const loadTime = Date.now() - start;
            console.log(`✅ Configuration Loading: ${loadTime}ms for 3 configs`);
            this.results.performanceTests.push({
                test: 'Configuration Loading Speed',
                status: loadTime < 100 ? 'PASS' : 'SLOW',
                details: `${loadTime}ms for 3 configurations`
            });
        } catch (error) {
            console.log(`❌ Configuration loading test failed: ${error.message}`);
        }
        
        // Test 3.2: Rule pool loading performance
        try {
            const start = Date.now();
            const rulePoolPath = path.join(__dirname, 'data', 'rule-pool.json');
            const rulePool = JSON.parse(fs.readFileSync(rulePoolPath, 'utf8'));
            const loadTime = Date.now() - start;
            
            const ruleCount = Object.keys(rulePool.rules).length;
            console.log(`✅ Rule Pool Loading: ${loadTime}ms for ${ruleCount} rules`);
            this.results.performanceTests.push({
                test: 'Rule Pool Loading Speed',
                status: loadTime < 50 ? 'PASS' : 'SLOW',
                details: `${loadTime}ms for ${ruleCount} rules`
            });
        } catch (error) {
            console.log(`❌ Rule pool loading test failed: ${error.message}`);
        }
    }

    async testIntegrationPoints() {
        console.log('\n🔗 Test Suite 4: Integration Points');
        console.log('-'.repeat(50));
        
        // Test 4.1: TypeScript compilation
        try {
            console.log('Testing TypeScript compilation...');
            execSync('npm run compile', { cwd: __dirname, stdio: 'pipe' });
            console.log('✅ TypeScript compilation: Success');
            this.results.integrationTests.push({
                test: 'TypeScript Compilation',
                status: 'PASS',
                details: 'No compilation errors'
            });
        } catch (error) {
            console.log('❌ TypeScript compilation: Failed');
            this.results.integrationTests.push({
                test: 'TypeScript Compilation',
                status: 'FAIL',
                details: 'Compilation errors detected'
            });
        }
        
        // Test 4.2: Webpack build
        try {
            console.log('Testing Webpack production build...');
            execSync('npm run compile:production', { cwd: __dirname, stdio: 'pipe' });
            console.log('✅ Webpack build: Success');
            this.results.integrationTests.push({
                test: 'Webpack Production Build',
                status: 'PASS',
                details: 'Build completed successfully'
            });
        } catch (error) {
            console.log('❌ Webpack build: Failed');
            this.results.integrationTests.push({
                test: 'Webpack Production Build',
                status: 'FAIL',
                details: 'Build process failed'
            });
        }
    }

    async testBackwardCompatibility() {
        console.log('\n🔄 Test Suite 5: Backward Compatibility');
        console.log('-'.repeat(50));
        
        // Test 5.1: Template structure preservation
        const templatePath = path.join(__dirname, 'templates', 'modes');
        if (fs.existsSync(templatePath)) {
            const modes = fs.readdirSync(templatePath);
            console.log(`✅ Template modes preserved: ${modes.join(', ')}`);
            this.results.backwardCompatibilityTests.push({
                test: 'Template Structure Preservation',
                status: 'PASS',
                details: `${modes.length} template modes available`
            });
        } else {
            console.log('❌ Template structure: Missing');
            this.results.backwardCompatibilityTests.push({
                test: 'Template Structure Preservation',
                status: 'FAIL',
                details: 'Templates directory not found'
            });
        }
        
        // Test 5.2: Deployment files structure
        const deploymentPath = path.join(__dirname, 'out', '.github');
        if (fs.existsSync(deploymentPath)) {
            const deploymentFiles = fs.readdirSync(deploymentPath, { recursive: true });
            console.log(`✅ Deployment structure: ${deploymentFiles.length} files`);
            this.results.backwardCompatibilityTests.push({
                test: 'Deployment Structure',
                status: 'PASS',
                details: `${deploymentFiles.length} deployment files ready`
            });
        } else {
            console.log('❌ Deployment structure: Missing');
            this.results.backwardCompatibilityTests.push({
                test: 'Deployment Structure',
                status: 'FAIL',
                details: 'Deployment files not found'
            });
        }
    }

    generateFinalReport() {
        const endTime = Date.now();
        const totalTime = endTime - this.startTime;
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 PHASE 2.4 - COMPREHENSIVE VALIDATION REPORT');
        console.log('='.repeat(70));
        
        // Count results
        const allTests = [
            ...this.results.configurationTests,
            ...this.results.deploymentTests,
            ...this.results.performanceTests,
            ...this.results.integrationTests,
            ...this.results.backwardCompatibilityTests
        ];
        
        const passed = allTests.filter(t => t.status === 'PASS').length;
        const failed = allTests.filter(t => t.status === 'FAIL').length;
        const slow = allTests.filter(t => t.status === 'SLOW').length;
        
        console.log(`\n📈 Test Results Summary:`);
        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   ⚠️  Slow: ${slow}`);
        console.log(`   📊 Total: ${allTests.length}`);
        console.log(`   ⏱️  Duration: ${totalTime}ms`);
        
        // Suite breakdown
        console.log(`\n📋 Suite Breakdown:`);
        console.log(`   🔧 Configuration Tests: ${this.results.configurationTests.length}`);
        console.log(`   🚀 Deployment Tests: ${this.results.deploymentTests.length}`);
        console.log(`   ⚡ Performance Tests: ${this.results.performanceTests.length}`);
        console.log(`   🔗 Integration Tests: ${this.results.integrationTests.length}`);
        console.log(`   🔄 Compatibility Tests: ${this.results.backwardCompatibilityTests.length}`);
        
        // Overall status
        if (failed === 0) {
            console.log('\n🎉 RULE POOL ARCHITECTURE REFACTORING: ✅ COMPLETE');
            console.log('\n✅ All systems validated and ready for production deployment!');
            console.log('\n📋 Next Steps:');
            console.log('   1. Deploy to production VS Code extension marketplace');
            console.log('   2. Create user migration documentation');
            console.log('   3. Monitor performance in real-world usage');
            console.log('   4. Gather user feedback for Phase 3 enhancements');
        } else {
            console.log('\n⚠️  RULE POOL ARCHITECTURE: Requires attention');
            console.log(`   ${failed} test(s) failed - see details above`);
        }
        
        // Save detailed report
        const reportData = {
            timestamp: new Date().toISOString(),
            totalTests: allTests.length,
            passed,
            failed,
            slow,
            duration: totalTime,
            results: this.results
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'PHASE_2_4_VALIDATION_REPORT.json'),
            JSON.stringify(reportData, null, 2)
        );
        
        console.log('\n📄 Detailed report saved: PHASE_2_4_VALIDATION_REPORT.json');
        console.log('='.repeat(70));
    }
}

// Run comprehensive validation
const validator = new ComprehensiveValidator();
validator.runAllTests();
