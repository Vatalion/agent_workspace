#!/usr/bin/env node

/**
 * Rule Pool Service Integration Test
 * Tests the full RulePoolService functionality with real extracted rules
 */

const path = require('path');
const fs = require('fs');

// Set up TypeScript compilation
require('ts-node').register({
    project: path.join(__dirname, 'tsconfig.json'),
    transpileOnly: true
});

const { RulePoolService } = require('./src/services/rulePoolService.ts');
const { RuleExtractionService } = require('./src/services/ruleExtractionService.ts');

async function testRulePoolIntegration() {
    console.log('🔧 Rule Pool Service Integration Test\n');

    try {
        // Initialize services
        console.log('📋 Initializing services...');
        const rulePoolService = new RulePoolService(__dirname);
        const extractionService = new RuleExtractionService();
        
        // Test 1: Clear any existing rule pool
        console.log('\n🧹 Clearing existing rule pool...');
        await rulePoolService.clearRulePool();
        console.log('✅ Rule pool cleared');

        // Test 2: Extract and add rules from all modes
        console.log('\n📤 Extracting and adding rules from all modes...');
        
        const modes = ['enterprise', 'simplified', 'hybrid'];
        let totalRulesAdded = 0;
        
        for (const mode of modes) {
            console.log(`\n  🔍 Processing ${mode} mode...`);
            
            // Extract rules for this mode
            const rules = await extractionService.extractAllRulesFromMode(mode);
            console.log(`    📊 Extracted ${rules.length} rules`);
            
            // Add each rule to the pool
            for (const rule of rules) {
                try {
                    await rulePoolService.addRule(rule);
                    console.log(`    ✅ Added: ${rule.title} (${rule.category})`);
                    totalRulesAdded++;
                } catch (error) {
                    console.log(`    ❌ Failed to add: ${rule.title} - ${error.message}`);
                }
            }
        }
        
        console.log(`\n📊 Total rules added to pool: ${totalRulesAdded}`);

        // Test 3: Verify rule pool contents
        console.log('\n🔍 Verifying rule pool contents...');
        const allRules = await rulePoolService.getAllRules();
        console.log(`✅ Rule pool contains ${allRules.length} rules`);

        // Test 4: Test search functionality
        console.log('\n🔎 Testing search functionality...');
        
        // Search by category
        const taskMgmtRules = await rulePoolService.searchRules({
            categories: ['TASK_MANAGEMENT']
        });
        console.log(`  📋 Task Management rules: ${taskMgmtRules.length}`);
        
        // Search by urgency
        const criticalRules = await rulePoolService.searchRules({
            urgencyLevels: ['CRITICAL']
        });
        console.log(`  🚨 Critical rules: ${criticalRules.length}`);
        
        // Search by text
        const flutterRules = await rulePoolService.searchRules({
            searchTerm: 'flutter'
        });
        console.log(`  📱 Flutter-related rules: ${flutterRules.length}`);

        // Test 5: Test rule rendering
        console.log('\n🎨 Testing rule rendering...');
        
        if (allRules.length > 0) {
            const sampleRule = allRules[0];
            const rendered = rulePoolService.renderRuleAsMarkdown(sampleRule);
            console.log(`✅ Rendered sample rule "${sampleRule.title}" (${rendered.length} chars)`);
            
            // Show a snippet of the rendered content
            const snippet = rendered.substring(0, 100) + '...';
            console.log(`    Preview: ${snippet}`);
        }

        // Test 6: Test rule pool statistics
        console.log('\n📈 Testing rule pool statistics...');
        const stats = rulePoolService.getRulePoolStatistics();
        console.log('  Statistics:');
        console.log(`    Total rules: ${stats.totalRules}`);
        console.log(`    Categories: ${Object.keys(stats.byCategory).length}`);
        console.log(`    Urgency levels: ${Object.keys(stats.byUrgency).length}`);
        console.log(`    Sources: ${Object.keys(stats.bySources).length}`);
        
        // Show category breakdown
        console.log('\n  📊 Category breakdown:');
        for (const [category, count] of Object.entries(stats.byCategory)) {
            console.log(`    ${category}: ${count}`);
        }

        // Test 7: Test rule updates
        console.log('\n✏️  Testing rule updates...');
        if (allRules.length > 0) {
            const ruleToUpdate = allRules[0];
            const originalTitle = ruleToUpdate.title;
            
            // Update the rule
            const updatedRule = {
                ...ruleToUpdate,
                title: `${originalTitle} (Updated)`,
                content: `${ruleToUpdate.content}\n\n**Updated for testing purposes**`
            };
            
            await rulePoolService.updateRule(ruleToUpdate.id, updatedRule);
            console.log(`✅ Updated rule: ${ruleToUpdate.id}`);
            
            // Verify the update
            const retrievedRule = await rulePoolService.getRule(ruleToUpdate.id);
            if (retrievedRule && retrievedRule.title.includes('(Updated)')) {
                console.log(`✅ Update verified: ${retrievedRule.title}`);
            } else {
                console.log(`❌ Update verification failed`);
            }
        }

        // Test 8: Test backup and restore
        console.log('\n💾 Testing backup functionality...');
        const backupPath = await rulePoolService.createBackup();
        console.log(`✅ Backup created: ${backupPath}`);
        
        // Verify backup file exists
        if (fs.existsSync(backupPath)) {
            const backupSize = fs.statSync(backupPath).size;
            console.log(`✅ Backup file exists (${backupSize} bytes)`);
        } else {
            console.log(`❌ Backup file not found`);
        }

        // Test 9: Test rule deletion
        console.log('\n🗑️  Testing rule deletion...');
        if (allRules.length > 1) {
            const ruleToDelete = allRules[allRules.length - 1];
            await rulePoolService.deleteRule(ruleToDelete.id);
            console.log(`✅ Deleted rule: ${ruleToDelete.title}`);
            
            // Verify deletion
            const remainingRules = await rulePoolService.getAllRules();
            console.log(`✅ Remaining rules: ${remainingRules.length}`);
        }

        // Test 10: Test rule validation
        console.log('\n✅ Testing rule validation...');
        try {
            // Try to add an invalid rule
            await rulePoolService.addRule({
                // Missing required fields
                title: '',
                content: '',
                category: 'INVALID_CATEGORY'
            });
            console.log(`❌ Validation failed - invalid rule was accepted`);
        } catch (error) {
            console.log(`✅ Validation working - rejected invalid rule: ${error.message}`);
        }

        console.log('\n🎉 Rule Pool Service Integration Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test
testRulePoolIntegration().catch(console.error);
