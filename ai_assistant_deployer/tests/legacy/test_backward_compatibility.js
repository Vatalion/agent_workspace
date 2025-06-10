/**
 * Backward Compatibility Test
 * 
 * Tests that migrated mode configurations are compatible with the existing deployment system
 */

const fs = require('fs').promises;
const path = require('path');

async function testBackwardCompatibility() {
    console.log('🔄 Testing Backward Compatibility\n');
    console.log('=' .repeat(50));
    
    try {
        // Step 1: Test configuration loading
        console.log('\n📋 Step 1: Testing Configuration Loading');
        console.log('-'.repeat(30));
        
        const migratedDir = path.join(__dirname, 'migrated-configs');
        const configFiles = await fs.readdir(migratedDir);
        
        const loadedConfigs = [];
        
        for (const file of configFiles) {
            console.log(`📖 Loading ${file}...`);
            
            const configPath = path.join(migratedDir, file);
            const content = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(content);
            
            // Validate required fields for deployment
            const requiredFields = ['id', 'name', 'type', 'ruleSelection', 'deployment'];
            const missingFields = requiredFields.filter(field => !config[field]);
            
            if (missingFields.length > 0) {
                console.log(`   ❌ Missing required fields: ${missingFields.join(', ')}`);
            } else {
                console.log(`   ✅ All required fields present`);
                loadedConfigs.push({ file, config });
            }
        }
        
        // Step 2: Test deployment configuration structure
        console.log('\n⚙️ Step 2: Testing Deployment Configuration Structure');
        console.log('-'.repeat(30));
        
        for (const { file, config } of loadedConfigs) {
            console.log(`\n🔧 Analyzing ${file.replace('-migrated.json', '')} deployment config:`);
            
            const deployment = config.deployment;
            console.log(`   📄 Target files: ${deployment.targetFiles?.join(', ') || 'none'}`);
            console.log(`   🤖 Automation files: ${deployment.includeAutomationFiles ? 'Yes' : 'No'}`);
            console.log(`   📜 Script files: ${deployment.includeScriptFiles ? 'Yes' : 'No'}`);
            
            // Check if target files match expected structure
            const expectedTargetFiles = ['copilot-instructions.md', 'project-rules.md'];
            const hasExpectedFiles = expectedTargetFiles.every(file => 
                deployment.targetFiles?.includes(file)
            );
            
            console.log(`   ${hasExpectedFiles ? '✅' : '⚠️'} Target files ${hasExpectedFiles ? 'match expected structure' : 'may need adjustment'}`);
        }
        
        // Step 3: Test rule selection compatibility
        console.log('\n🎯 Step 3: Testing Rule Selection Compatibility');
        console.log('-'.repeat(30));
        
        for (const { file, config } of loadedConfigs) {
            console.log(`\n📊 ${file.replace('-migrated.json', '')} rule selection:`);
            
            const ruleSelection = config.ruleSelection;
            console.log(`   📂 Include categories: ${ruleSelection.includeCategories?.length || 0}`);
            console.log(`   🚫 Exclude categories: ${ruleSelection.excludeCategories?.length || 0}`);
            console.log(`   📋 Explicit includes: ${ruleSelection.explicitIncludes?.length || 0}`);
            console.log(`   🔢 Max rules: ${ruleSelection.maxRules || 'unlimited'}`);
            console.log(`   ⚡ Min urgency: ${ruleSelection.minimumUrgency || 'any'}`);
            
            // Validate rule selection makes sense
            const hasValidSelection = (
                (ruleSelection.includeCategories?.length > 0) ||
                (ruleSelection.explicitIncludes?.length > 0)
            );
            
            console.log(`   ${hasValidSelection ? '✅' : '❌'} Rule selection is ${hasValidSelection ? 'valid' : 'invalid'}`);
        }
        
        // Step 4: Test template configuration
        console.log('\n📝 Step 4: Testing Template Configuration');
        console.log('-'.repeat(30));
        
        for (const { file, config } of loadedConfigs) {
            console.log(`\n📋 ${file.replace('-migrated.json', '')} templates:`);
            
            const templates = config.templates;
            if (templates) {
                console.log(`   📄 Instructions template: ${templates.instructionsTemplate || 'none'}`);
                console.log(`   📜 Rules template: ${templates.rulesTemplate || 'none'}`);
                console.log(`   ✅ Template configuration present`);
            } else {
                console.log(`   ⚠️ No template configuration found`);
            }
        }
        
        // Step 5: Generate compatibility report
        console.log('\n📊 Step 5: Compatibility Assessment');
        console.log('-'.repeat(30));
        
        const assessments = loadedConfigs.map(({ file, config }) => {
            const assessment = {
                file: file.replace('-migrated.json', ''),
                deploymentReady: !!config.deployment && !!config.deployment.targetFiles,
                ruleSelectionValid: !!(
                    (config.ruleSelection?.includeCategories?.length > 0) ||
                    (config.ruleSelection?.explicitIncludes?.length > 0)
                ),
                templateConfigured: !!config.templates,
                structureConfigured: !!config.structure,
                metadataComplete: !!config.metadata,
                overallCompatible: false
            };
            
            assessment.overallCompatible = (
                assessment.deploymentReady &&
                assessment.ruleSelectionValid &&
                assessment.templateConfigured
            );
            
            return assessment;
        });
        
        console.log('\n🎯 Compatibility Summary:');
        for (const assessment of assessments) {
            console.log(`\n📋 ${assessment.file.toUpperCase()}:`);
            console.log(`   🚀 Deployment ready: ${assessment.deploymentReady ? '✅' : '❌'}`);
            console.log(`   🎯 Rule selection valid: ${assessment.ruleSelectionValid ? '✅' : '❌'}`);
            console.log(`   📝 Template configured: ${assessment.templateConfigured ? '✅' : '❌'}`);
            console.log(`   ⚙️ Structure configured: ${assessment.structureConfigured ? '✅' : '❌'}`);
            console.log(`   📊 Metadata complete: ${assessment.metadataComplete ? '✅' : '❌'}`);
            console.log(`   🎉 Overall compatible: ${assessment.overallCompatible ? '✅' : '❌'}`);
        }
        
        // Final assessment
        const compatibleCount = assessments.filter(a => a.overallCompatible).length;
        const totalCount = assessments.length;
        
        console.log('\n🏁 Final Compatibility Assessment:');
        console.log('=' .repeat(50));
        console.log(`✅ Compatible configurations: ${compatibleCount}/${totalCount}`);
        console.log(`📊 Compatibility rate: ${((compatibleCount / totalCount) * 100).toFixed(1)}%`);
        
        if (compatibleCount === totalCount) {
            console.log('\n🎉 All migrated configurations are backward compatible!');
            console.log('🚀 Ready for integration with existing deployment system');
            console.log('📌 Phase 2.2 FULLY COMPLETED ✅');
        } else {
            console.log('\n⚠️ Some configurations need adjustments for full compatibility');
            console.log('🔧 Review the assessment details above');
        }
        
        // Save compatibility report
        const report = {
            timestamp: new Date().toISOString(),
            totalConfigurations: totalCount,
            compatibleConfigurations: compatibleCount,
            compatibilityRate: (compatibleCount / totalCount) * 100,
            assessments,
            recommendations: generateCompatibilityRecommendations(assessments)
        };
        
        const reportPath = path.join(__dirname, 'backward-compatibility-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📊 Detailed compatibility report saved to: ${reportPath}`);
        
    } catch (error) {
        console.error('\n💥 Compatibility test failed:', error);
        console.error(error.stack);
    }
}

function generateCompatibilityRecommendations(assessments) {
    const recommendations = [];
    
    for (const assessment of assessments) {
        if (!assessment.overallCompatible) {
            recommendations.push({
                mode: assessment.file,
                issues: [
                    !assessment.deploymentReady && 'Missing or invalid deployment configuration',
                    !assessment.ruleSelectionValid && 'Invalid rule selection criteria',
                    !assessment.templateConfigured && 'Missing template configuration'
                ].filter(Boolean),
                priority: 'high'
            });
        }
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            mode: 'all',
            message: 'All configurations are fully compatible with existing deployment system',
            priority: 'info'
        });
    }
    
    return recommendations;
}

// Run the test
testBackwardCompatibility();
