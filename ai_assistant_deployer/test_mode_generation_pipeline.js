/**
 * Test Mode Generation Pipeline
 * Tests the new rule-based mode generation system
 */

const fs = require('fs').promises;
const path = require('path');

// Import standalone services
const StandaloneRulePoolService = require('./standaloneRulePoolService');
const StandaloneModeConfigurationService = require('./standaloneModeConfigurationService');

// Simple Generation Pipeline for testing
class TestModeGenerationPipeline {
    constructor() {
        this.extensionPath = __dirname;
        this.rulePoolService = new StandaloneRulePoolService(this.extensionPath);
        this.modeConfigService = new StandaloneModeConfigurationService(this.rulePoolService);
    }

    async initialize() {
        await this.rulePoolService.initialize();
        console.log('🚀 Test pipeline initialized');
    }

    async testGenerateFromMigratedConfig(configPath, outputPath) {
        console.log(`\n📋 Testing generation from: ${path.basename(configPath)}`);
        
        try {
            // Load configuration
            const configContent = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(configContent);
            
            console.log(`   Mode: ${config.name} (${config.type})`);
            console.log(`   Rules: ${config.ruleSelection.explicitIncludes?.length || 0} explicit + categories`);

            // Resolve rules
            const rules = await this.resolveRulesFromConfiguration(config);
            console.log(`   Resolved: ${rules.length} rules`);

            // Create output directory
            await fs.mkdir(outputPath, { recursive: true });

            // Generate files
            const generatedFiles = [];

            // Generate copilot-instructions.md
            const copilotContent = this.generateCopilotInstructions(config, rules);
            const copilotPath = path.join(outputPath, 'copilot-instructions.md');
            await fs.writeFile(copilotPath, copilotContent);
            generatedFiles.push('copilot-instructions.md');

            // Generate project-rules.md
            const rulesContent = this.generateProjectRules(config, rules);
            const rulesPath = path.join(outputPath, 'project-rules.md');
            await fs.writeFile(rulesPath, rulesContent);
            generatedFiles.push('project-rules.md');

            // Generate metadata
            const metadata = {
                mode: config,
                generation: {
                    generatedAt: new Date().toISOString(),
                    method: 'test-pipeline',
                    rulesUsed: rules.length,
                    files: generatedFiles
                },
                rules: rules.map(r => ({ id: r.id, title: r.title, category: r.category }))
            };

            const metadataPath = path.join(outputPath, 'generation-metadata.json');
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
            generatedFiles.push('generation-metadata.json');

            console.log(`   ✅ Generated ${generatedFiles.length} files successfully`);
            return { success: true, files: generatedFiles, rules: rules.length };

        } catch (error) {
            console.error(`   ❌ Generation failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async resolveRulesFromConfiguration(config) {
        const allRules = await this.rulePoolService.getAllRules();
        const resolvedRules = [];
        const { ruleSelection } = config;

        // Add explicit includes
        if (ruleSelection.explicitIncludes?.length > 0) {
            for (const ruleId of ruleSelection.explicitIncludes) {
                const rule = allRules.find(r => r.id === ruleId);
                if (rule) {
                    resolvedRules.push(rule);
                }
            }
        }

        // Add category-based rules
        if (ruleSelection.includeCategories?.length > 0) {
            const categoryRules = allRules.filter(rule => 
                ruleSelection.includeCategories.includes(rule.category) &&
                !ruleSelection.explicitExcludes?.includes(rule.id) &&
                !resolvedRules.some(r => r.id === rule.id)
            );
            resolvedRules.push(...categoryRules);
        }

        // Apply urgency filter
        let filteredRules = resolvedRules;
        if (ruleSelection.minimumUrgency) {
            const urgencyOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
            const minIndex = urgencyOrder.indexOf(ruleSelection.minimumUrgency);
            filteredRules = resolvedRules.filter(rule => {
                const ruleIndex = urgencyOrder.indexOf(rule.urgency);
                return ruleIndex >= minIndex;
            });
        }

        // Apply max rules limit
        if (ruleSelection.maxRules && filteredRules.length > ruleSelection.maxRules) {
            filteredRules = filteredRules
                .sort((a, b) => {
                    const urgencyOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
                    return urgencyOrder.indexOf(b.urgency) - urgencyOrder.indexOf(a.urgency);
                })
                .slice(0, ruleSelection.maxRules);
        }

        return filteredRules;
    }

    generateCopilotInstructions(config, rules) {
        const modeSpecificContent = this.getModeSpecificContent(config.type);
        const rulesSection = this.generateRulesSection(rules, config);

        return `When generating code, please follow these user provided coding instructions. You can ignore an instruction if it contradicts a system message.
<instructions>
# GitHub Copilot Instructions - ${config.name}

${config.description}

${modeSpecificContent}

${rulesSection}

---
*Generated by AI Assistant Deployer - Rule-based Mode System*
*Generated: ${new Date().toISOString()}*
*Rules: ${rules.length} active*
</instructions>`;
    }

    generateProjectRules(config, rules) {
        const rulesSection = this.generateRulesSection(rules, config);

        return `# ${config.name} - Project Rules

${config.description}

## Configuration
- **Type**: ${config.type}
- **Rules**: ${rules.length} active
- **Categories**: ${config.ruleSelection.includeCategories?.join(', ') || 'all'}
- **Minimum Urgency**: ${config.ruleSelection.minimumUrgency || 'any'}

${rulesSection}

---
*Generated by AI Assistant Deployer*
*Generated: ${new Date().toISOString()}*`;
    }

    generateRulesSection(rules, config) {
        if (rules.length === 0) {
            return '# No rules configured for this mode\n';
        }

        let content = `# Active Rules (${rules.length})\n\n`;

        // Group by category if specified
        if (config.ruleOrganization?.groupBy === 'category') {
            const grouped = this.groupRulesByCategory(rules);
            
            for (const [category, categoryRules] of Object.entries(grouped)) {
                content += `## ${category}\n\n`;
                for (const rule of categoryRules) {
                    content += this.formatRule(rule);
                }
                content += '\n';
            }
        } else {
            // Sort by urgency
            const sorted = rules.sort((a, b) => {
                const urgencyOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
                return urgencyOrder.indexOf(b.urgency) - urgencyOrder.indexOf(a.urgency);
            });

            for (const rule of sorted) {
                content += this.formatRule(rule);
            }
        }

        return content;
    }

    formatRule(rule) {
        const urgencyEmoji = { 'LOW': '🔵', 'MEDIUM': '🟡', 'HIGH': '🟠', 'CRITICAL': '🔴' }[rule.urgency] || '⚪';
        
        return `### ${rule.title}\n\n` +
               `${urgencyEmoji} **${rule.urgency}** | ${rule.category}\n\n` +
               `${rule.content}\n\n` +
               (rule.sources?.length ? `*Sources: ${rule.sources.join(', ')}*\n\n` : '');
    }

    groupRulesByCategory(rules) {
        return rules.reduce((groups, rule) => {
            const category = rule.category || 'UNCATEGORIZED';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(rule);
            return groups;
        }, {});
    }

    getModeSpecificContent(type) {
        const content = {
            enterprise: `
## ENTERPRISE MODE - Full Feature Set Active

### Enterprise Features
- **Advanced Task Management**: Epic-scale orchestration and priority interrupt systems
- **Cross-Machine Synchronization**: Automatic git branching and state preservation
- **Monitoring & Auto-Save**: Real-time oversight with 15-minute snapshots
- **SOLID Principles**: Enforced architecture patterns for maintainability
- **Comprehensive Testing**: Minimum 80% coverage requirements

### Task Management Structure
\`\`\`
.tasks/
├── system/              # Core system files
├── epics/              # Large-scale task orchestration
├── 1_planning/         # Task planning and milestones
├── 2_review/           # Review and approval workflow
├── 3_execution/        # Active task execution
├── 4_completion/       # Completion tracking
└── cross_machine/      # Multi-machine sync
\`\`\``,

            simplified: `
## SIMPLIFIED MODE - Essential Features Only

### Focus Areas
- Clean, readable code
- Simple project organization
- Basic documentation
- Essential testing practices

### Principles
- Keep it simple and maintainable
- Focus on core functionality
- Minimal configuration overhead
- Clear, straightforward workflows`,

            hybrid: `
## HYBRID MODE - Balanced Approach

### Features
- Selective enterprise capabilities
- Flexible task management
- Scalable architecture patterns
- Balanced testing approach

### Philosophy
- Start simple, add complexity as needed
- Enterprise features available on-demand
- Project-appropriate tooling
- Grow with your needs`
        };

        return content[type] || `## ${type.toUpperCase()} MODE\n\nCustom mode configuration.`;
    }
}

// Main test function
async function testModeGenerationPipeline() {
    console.log('🧪 Testing Mode Generation Pipeline\n');

    const pipeline = new TestModeGenerationPipeline();
    await pipeline.initialize();

    const migratedConfigs = [
        './migrated-configs/enterprise-migrated.json',
        './migrated-configs/simplified-migrated.json',
        './migrated-configs/hybrid-migrated.json'
    ];

    const results = [];

    for (const configPath of migratedConfigs) {
        const configName = path.basename(configPath, '.json').replace('-migrated', '');
        const outputPath = `./test-generation-output/${configName}`;
        
        const result = await pipeline.testGenerateFromMigratedConfig(configPath, outputPath);
        results.push({ config: configName, ...result });
    }

    // Summary
    console.log('\n📊 Generation Test Results:');
    console.log('=' .repeat(50));
    
    let totalSuccess = 0;
    for (const result of results) {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.config}: ${result.success ? `${result.files?.length} files, ${result.rules} rules` : result.error}`);
        if (result.success) totalSuccess++;
    }

    console.log('\n📈 Summary:');
    console.log(`   Success Rate: ${totalSuccess}/${results.length} (${(totalSuccess/results.length*100).toFixed(1)}%)`);
    console.log(`   Output Directory: ./test-generation-output/`);
    
    if (totalSuccess === results.length) {
        console.log('\n🎉 All mode generation tests passed! Pipeline ready for Phase 2.3 integration.');
    } else {
        console.log('\n⚠️  Some tests failed. Check errors above.');
    }

    return results;
}

// Run tests if called directly
if (require.main === module) {
    testModeGenerationPipeline().catch(console.error);
}

module.exports = { TestModeGenerationPipeline, testModeGenerationPipeline };
