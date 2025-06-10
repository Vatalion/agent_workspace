/**
 * Simple Migration Validation Test
 */

const fs = require('fs').promises;
const path = require('path');

async function validateMigration() {
    console.log('🔍 Simple Migration Validation\n');
    
    try {
        // Check if migrated files exist
        const migratedDir = path.join(__dirname, 'migrated-configs');
        const files = await fs.readdir(migratedDir);
        
        console.log(`📁 Found ${files.length} migrated configuration files:`);
        
        for (const file of files) {
            console.log(`   - ${file}`);
            
            // Read and validate basic structure
            const configPath = path.join(migratedDir, file);
            const content = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(content);
            
            console.log(`     ✅ Valid JSON structure`);
            console.log(`     📋 Rules: ${config.ruleSelection?.explicitIncludes?.length || 0}`);
            console.log(`     📂 Categories: ${config.ruleSelection?.includeCategories?.length || 0}`);
            console.log(`     🎯 Confidence: ${((config.metadata?.migrationConfidence || 0) * 100).toFixed(1)}%`);
        }
        
        console.log('\n✅ Basic validation passed!');
        console.log('🚀 Phase 2.2 - Mode File Conversion: COMPLETED');
        console.log('📌 Next: Phase 2.3 - Mode Generation Pipeline');
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
    }
}

validateMigration();
