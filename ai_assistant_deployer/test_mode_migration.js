/**
 * Test Mode Migration
 * 
 * This script tests the mode migration functionality by converting existing
 * embedded mode files to rule-based configurations.
 */

const { StandaloneModeMigrationService } = require('./standaloneModeMigrationService');
const path = require('path');
const fs = require('fs').promises;

async function testModeMigration() {
    console.log('🧪 Testing Mode Migration Service\n');
    console.log('=' .repeat(50));
    
    try {
        // Initialize the migration service
        const migrationService = new StandaloneModeMigrationService(__dirname);
        
        // Step 1: Test individual mode migration
        console.log('\n📋 Step 1: Testing Individual Mode Migration');
        console.log('-'.repeat(30));
        
        const modeTypes = ['enterprise', 'simplified', 'hybrid'];
        const individualResults = [];
        
        for (const modeType of modeTypes) {
            console.log(`\n🔄 Testing ${modeType} mode migration...`);
            
            try {
                const result = await migrationService.migrateMode(modeType);
                individualResults.push(result);
                
                console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
                console.log(`   Original Files: ${result.originalFiles.length}`);
                console.log(`   Content Sections: ${result.contentMapping.length}`);
                console.log(`   Rules Mapped: ${result.contentMapping.reduce((sum, m) => sum + m.mappedRules.length, 0)}`);
                
                if (result.contentMapping.length > 0) {
                    const avgConfidence = result.contentMapping.reduce((sum, m) => sum + m.confidence, 0) / result.contentMapping.length;
                    console.log(`   Avg Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
                }
                
                if (result.errors.length > 0) {
                    console.log(`   Errors: ${result.errors.length}`);
                    result.errors.forEach(error => console.log(`     - ${error}`));
                }
                
                if (result.warnings.length > 0) {
                    console.log(`   Warnings: ${result.warnings.length}`);
                }
                
            } catch (error) {
                console.log(`   ❌ Failed: ${error.message}`);
                individualResults.push({
                    success: false,
                    modeType,
                    errors: [error.message],
                    warnings: [],
                    contentMapping: [],
                    originalFiles: []
                });
            }
        }
        
        // Step 2: Test batch migration
        console.log('\n\n📦 Step 2: Testing Batch Migration');
        console.log('-'.repeat(30));
        
        const batchResults = await migrationService.migrateAllModes();
        
        console.log(`\n✅ Batch migration completed!`);
        console.log(`   Total modes: ${batchResults.length}`);
        console.log(`   Successful: ${batchResults.filter(r => r.success).length}`);
        console.log(`   Failed: ${batchResults.filter(r => !r.success).length}`);
        
        // Step 3: Test content analysis
        console.log('\n\n🔍 Step 3: Content Analysis Summary');
        console.log('-'.repeat(30));
        
        for (const result of batchResults) {
            if (result.success && result.contentMapping.length > 0) {
                console.log(`\n📊 ${result.modeType.toUpperCase()} Analysis:`);
                
                // Show top mapped sections
                const sortedMappings = result.contentMapping
                    .sort((a, b) => b.confidence - a.confidence)
                    .slice(0, 3);
                
                for (const mapping of sortedMappings) {
                    console.log(`   📝 "${mapping.section}"`);
                    console.log(`      Confidence: ${(mapping.confidence * 100).toFixed(1)}%`);
                    console.log(`      Rules mapped: ${mapping.mappedRules.length}`);
                }
            }
        }
        
        // Step 4: Test configuration validation
        console.log('\n\n✅ Step 4: Configuration Validation');
        console.log('-'.repeat(30));
        
        for (const result of batchResults) {
            if (result.convertedConfig) {
                console.log(`\n🔧 ${result.modeType} Configuration:`);
                console.log(`   ID: ${result.convertedConfig.id}`);
                console.log(`   Name: ${result.convertedConfig.name}`);
                console.log(`   Type: ${result.convertedConfig.type}`);
                
                const ruleSelection = result.convertedConfig.ruleSelection;
                console.log(`   Include Categories: ${ruleSelection.includeCategories?.join(', ') || 'none'}`);
                console.log(`   Exclude Categories: ${ruleSelection.excludeCategories?.join(', ') || 'none'}`);
                console.log(`   Max Rules: ${ruleSelection.maxRules || 'unlimited'}`);
                console.log(`   Explicit Includes: ${ruleSelection.explicitIncludes?.length || 0}`);
                
                if (result.convertedConfig.metadata?.migrationConfidence) {
                    console.log(`   Migration Confidence: ${(result.convertedConfig.metadata.migrationConfidence * 100).toFixed(1)}%`);
                }
            }
        }
        
        // Step 5: Check generated files
        console.log('\n\n📁 Step 5: Generated Files Check');
        console.log('-'.repeat(30));
        
        const outputDir = path.join(__dirname, 'migrated-configs');
        try {
            const files = await fs.readdir(outputDir);
            console.log(`\n📂 Found ${files.length} generated files:`);
            for (const file of files) {
                console.log(`   - ${file}`);
                
                // Show file size
                const filePath = path.join(outputDir, file);
                const stats = await fs.stat(filePath);
                console.log(`     Size: ${(stats.size / 1024).toFixed(1)} KB`);
            }
        } catch (error) {
            console.log(`   ⚠️ No output directory found: ${error.message}`);
        }
        
        // Final summary
        console.log('\n\n🎯 Final Summary');
        console.log('=' .repeat(50));
        
        const successCount = batchResults.filter(r => r.success).length;
        const totalRules = batchResults.reduce((sum, r) => 
            sum + r.contentMapping.reduce((ruleSum, m) => ruleSum + m.mappedRules.length, 0), 0);
        const avgConfidence = batchResults.length > 0 
            ? batchResults.reduce((sum, r) => {
                const confidence = r.contentMapping.length > 0 
                    ? r.contentMapping.reduce((cSum, m) => cSum + m.confidence, 0) / r.contentMapping.length 
                    : 0;
                return sum + confidence;
            }, 0) / batchResults.length 
            : 0;
        
        console.log(`✅ Successfully migrated: ${successCount}/${batchResults.length} modes`);
        console.log(`📋 Total rules mapped: ${totalRules}`);
        console.log(`🎯 Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
        
        if (successCount === batchResults.length) {
            console.log('\n🎉 All modes successfully migrated to rule-based configuration!');
            console.log('🚀 Ready for Phase 2.3 - Mode Generation Pipeline');
        } else {
            console.log('\n⚠️ Some migrations failed. Check the errors above.');
        }
        
        // Save detailed test results
        const testResults = {
            timestamp: new Date().toISOString(),
            summary: {
                totalModes: batchResults.length,
                successfulMigrations: successCount,
                totalRulesMapped: totalRules,
                averageConfidence: avgConfidence
            },
            individualResults,
            batchResults
        };
        
        const testResultsPath = path.join(__dirname, 'test-migration-results.json');
        await fs.writeFile(testResultsPath, JSON.stringify(testResults, null, 2));
        console.log(`\n📊 Detailed test results saved to: ${testResultsPath}`);
        
    } catch (error) {
        console.error('\n💥 Test failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testModeMigration();
}

module.exports = { testModeMigration };
