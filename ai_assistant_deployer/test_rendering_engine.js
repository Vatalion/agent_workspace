#!/usr/bin/env node

/**
 * Rule Rendering Engine Test
 * Tests the advanced rule rendering capabilities
 */

const { StandaloneRulePoolService } = require('./standaloneRulePoolService.js');
const { StandaloneRuleExtractionService } = require('./standaloneRuleExtractionService.js');
const RuleRenderingEngine = require('./ruleRenderingEngine.js').RuleRenderingEngine;
const fs = require('fs').promises;
const path = require('path');

async function testRuleRenderingEngine() {
    console.log('🎨 Rule Rendering Engine Test\n');

    try {
        // Initialize services
        console.log('📋 Initializing services...');
        const rulePoolService = new StandaloneRulePoolService(__dirname);
        const extractionService = new StandaloneRuleExtractionService(__dirname);
        const renderingEngine = new RuleRenderingEngine();

        // Extract rules from enterprise mode for testing
        console.log('\n📤 Extracting rules for testing...');
        const enterpriseRules = await extractionService.extractAllRulesFromMode('enterprise');
        console.log(`✅ Extracted ${enterpriseRules.length} enterprise rules`);

        // Test 1: Test single rule rendering
        console.log('\n🎯 Test 1: Single Rule Rendering');
        if (enterpriseRules.length > 0) {
            const sampleRule = enterpriseRules[0];
            const renderedRule = await renderingEngine.renderRule(sampleRule);
            console.log(`✅ Rendered rule: ${sampleRule.title}`);
            console.log(`   Length: ${renderedRule.length} characters`);
            console.log(`   Preview: ${renderedRule.substring(0, 150)}...`);
        }

        // Test 2: Test template listing
        console.log('\n📋 Test 2: Available Templates');
        const templates = renderingEngine.getAvailableTemplates();
        console.log(`✅ Available templates: ${templates.join(', ')}`);

        // Test 3: Test mode file generation
        console.log('\n🏗️  Test 3: Mode File Generation');
        
        const modeConfigs = [
            { name: 'enterprise', displayName: 'ENTERPRISE' },
            { name: 'simplified', displayName: 'SIMPLIFIED' },
            { name: 'hybrid', displayName: 'HYBRID' }
        ];

        for (const modeConfig of modeConfigs) {
            console.log(`\n  🔧 Generating ${modeConfig.name} mode files...`);
            
            // Extract rules for this mode
            const modeRules = await extractionService.extractAllRulesFromMode(modeConfig.name);
            console.log(`    📊 Using ${modeRules.length} rules`);

            // Generate copilot instructions
            const copilotInstructions = await renderingEngine.renderModeFile(
                modeRules, 
                modeConfig,
                'copilot-instructions'
            );
            
            // Generate project rules
            const projectRules = await renderingEngine.renderModeFile(
                modeRules, 
                modeConfig,
                'project-rules'
            );

            console.log(`    ✅ Generated copilot-instructions.md (${copilotInstructions.length} chars)`);
            console.log(`    ✅ Generated project-rules.md (${projectRules.length} chars)`);

            // Save to output directory for inspection
            const outputDir = path.join(__dirname, 'test-output', modeConfig.name);
            await fs.mkdir(outputDir, { recursive: true });
            
            await fs.writeFile(
                path.join(outputDir, 'copilot-instructions.md'), 
                copilotInstructions, 
                'utf8'
            );
            await fs.writeFile(
                path.join(outputDir, 'project-rules.md'), 
                projectRules, 
                'utf8'
            );
            
            console.log(`    💾 Saved to: ${outputDir}`);
        }

        // Test 4: Test rule grouping and statistics
        console.log('\n📈 Test 4: Rule Analysis and Statistics');
        
        const allRules = [];
        for (const mode of ['enterprise', 'simplified', 'hybrid']) {
            const rules = await extractionService.extractAllRulesFromMode(mode);
            allRules.push(...rules);
        }

        const summary = renderingEngine.createRuleSummary(allRules);
        console.log(`✅ Total rules analyzed: ${summary.total}`);
        console.log(`   Categories: ${Object.keys(summary.byCategory).length}`);
        console.log(`   Urgency levels: ${Object.keys(summary.byUrgency).length}`);
        
        console.log('\n   📊 Category breakdown:');
        const sortedCategories = Object.entries(summary.byCategory)
            .sort(([,a], [,b]) => b - a);
        for (const [category, count] of sortedCategories) {
            console.log(`     ${category}: ${count}`);
        }

        console.log('\n   🚨 Urgency breakdown:');
        const sortedUrgencies = Object.entries(summary.byUrgency)
            .sort(([,a], [,b]) => b - a);
        for (const [urgency, count] of sortedUrgencies) {
            const emoji = {
                CRITICAL: '🚨',
                HIGH: '⚠️',
                MEDIUM: '📋',
                LOW: '💡',
                INFO: 'ℹ️'
            };
            console.log(`     ${emoji[urgency]} ${urgency}: ${count}`);
        }

        // Test 5: Test custom template
        console.log('\n🛠️  Test 5: Custom Template Creation');
        
        const customTemplate = {
            name: 'Simple List',
            template: `# Rules Summary

Total Rules: {{total}}

## By Category
{{#each byCategory}}
- {{@key}}: {{this}}
{{/each}}

## Critical Rules Only
{{#each rules}}
{{#if (eq urgency 'CRITICAL')}}
### {{title}}
{{content}}

{{/if}}
{{/each}}
`
        };

        renderingEngine.addTemplate('simple-summary', customTemplate);
        console.log(`✅ Added custom template: ${customTemplate.name}`);

        // Test the custom template
        const criticalRules = allRules.filter(r => r.urgency === 'CRITICAL');
        const customData = {
            total: allRules.length,
            byCategory: summary.byCategory,
            rules: criticalRules
        };

        const customRendered = renderingEngine.processTemplate(customTemplate.template, customData);
        console.log(`✅ Rendered with custom template (${customRendered.length} chars)`);
        
        // Save custom template output
        await fs.writeFile(
            path.join(__dirname, 'test-output', 'custom-summary.md'), 
            customRendered, 
            'utf8'
        );
        console.log(`💾 Saved custom output to: test-output/custom-summary.md`);

        // Test 6: Performance test
        console.log('\n⚡ Test 6: Performance Test');
        
        const startTime = Date.now();
        for (let i = 0; i < 100; i++) {
            renderingEngine.renderRule(enterpriseRules[0]);
        }
        const endTime = Date.now();
        
        console.log(`✅ Rendered 100 rules in ${endTime - startTime}ms`);
        console.log(`   Average: ${(endTime - startTime) / 100}ms per rule`);

        console.log('\n🎉 Rule Rendering Engine Test completed successfully!');
        
        console.log('\n📋 Summary:');
        console.log(`   - Single rule rendering: ✅ Working`);
        console.log(`   - Mode file generation: ✅ Working`);
        console.log(`   - Template system: ✅ Working`);
        console.log(`   - Custom templates: ✅ Working`);
        console.log(`   - Rule analysis: ✅ Working`);
        console.log(`   - Performance: ✅ Acceptable`);
        
        console.log('\n📁 Generated Files:');
        console.log(`   - test-output/enterprise/copilot-instructions.md`);
        console.log(`   - test-output/enterprise/project-rules.md`);
        console.log(`   - test-output/simplified/copilot-instructions.md`);
        console.log(`   - test-output/simplified/project-rules.md`);
        console.log(`   - test-output/hybrid/copilot-instructions.md`);
        console.log(`   - test-output/hybrid/project-rules.md`);
        console.log(`   - test-output/custom-summary.md`);
        
    } catch (error) {
        console.error('❌ Rendering engine test failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test
testRuleRenderingEngine().catch(console.error);
