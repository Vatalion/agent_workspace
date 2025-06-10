/**
 * Standalone Mode Migration Service
 * 
 * VS Code-independent version for testing mode migration functionality
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

class StandaloneModeMigrationService {
    constructor(basePath = '') {
        this.basePath = basePath;
        this.rulePool = null;
    }

    /**
     * Migrate all existing modes to rule-based configurations
     */
    async migrateAllModes() {
        const results = [];
        const modeTypes = ['enterprise', 'simplified', 'hybrid'];

        console.log('🚀 Starting mode migration process...\n');

        for (const modeType of modeTypes) {
            console.log(`📁 Migrating ${modeType} mode...`);
            try {
                const result = await this.migrateMode(modeType);
                results.push(result);
                console.log(`${result.success ? '✅' : '❌'} ${modeType} migration ${result.success ? 'completed' : 'failed'}`);
                if (result.errors.length > 0) {
                    console.log(`   Errors: ${result.errors.length}`);
                }
                if (result.warnings.length > 0) {
                    console.log(`   Warnings: ${result.warnings.length}`);
                }
            } catch (error) {
                const failedResult = {
                    success: false,
                    modeType,
                    originalFiles: [],
                    convertedConfig: null,
                    errors: [`Failed to migrate ${modeType} mode: ${error}`],
                    warnings: [],
                    contentMapping: []
                };
                results.push(failedResult);
                console.log(`❌ ${modeType} migration failed: ${error.message}`);
            }
        }

        console.log('\n📊 Generating migration report...');
        const report = await this.generateMigrationReport(results);
        const reportPath = path.join(this.basePath, 'migration-report.md');
        await writeFile(reportPath, report);
        console.log(`📄 Migration report saved to: ${reportPath}`);

        return results;
    }

    /**
     * Migrate a specific mode from embedded content to rule-based configuration
     */
    async migrateMode(modeType) {
        const result = {
            success: false,
            modeType,
            originalFiles: [],
            convertedConfig: null,
            errors: [],
            warnings: [],
            contentMapping: []
        };

        try {
            // Step 1: Extract content from existing mode files
            console.log(`   📖 Extracting content from ${modeType} mode files...`);
            const extractedContent = await this.extractModeContent(modeType);
            result.originalFiles = extractedContent.map(ec => ec.file);
            console.log(`   📝 Found ${extractedContent.length} files with ${extractedContent.reduce((sum, ec) => sum + ec.sections.length, 0)} sections`);

            // Step 2: Analyze content and map to rules
            console.log(`   🔍 Mapping content to rules...`);
            const contentMapping = await this.mapContentToRules(extractedContent);
            result.contentMapping = contentMapping;
            
            const totalMappedRules = contentMapping.reduce((sum, m) => sum + m.mappedRules.length, 0);
            const avgConfidence = contentMapping.length > 0 
                ? contentMapping.reduce((sum, m) => sum + m.confidence, 0) / contentMapping.length 
                : 0;
            console.log(`   📋 Mapped ${totalMappedRules} rules with ${(avgConfidence * 100).toFixed(1)}% average confidence`);

            // Step 3: Create rule-based configuration
            console.log(`   ⚙️ Creating rule-based configuration...`);
            const config = await this.createRuleBasedConfiguration(modeType, contentMapping);
            result.convertedConfig = config;

            // Step 4: Validate the configuration
            console.log(`   ✅ Validating configuration...`);
            const validation = await this.validateConfiguration(config);
            if (!validation.isValid) {
                result.errors.push(...validation.errors);
                result.warnings.push(...validation.warnings);
            }

            // Step 5: Save the new configuration
            console.log(`   💾 Saving converted configuration...`);
            await this.saveConvertedConfiguration(modeType, config);

            result.success = validation.isValid;

        } catch (error) {
            result.errors.push(`Migration failed: ${error.message}`);
        }

        return result;
    }

    /**
     * Extract content from existing mode files
     */
    async extractModeContent(modeType) {
        const modePath = path.join(this.basePath, 'templates', 'modes', modeType);
        const extractedContent = [];

        // Extract from copilot-instructions.md
        const instructionsFile = path.join(modePath, 'copilot-instructions.md');
        if (await this.fileExists(instructionsFile)) {
            const instructionsContent = await this.extractFileContent(instructionsFile);
            extractedContent.push(instructionsContent);
        }

        // Extract from project-rules.md
        const rulesFile = path.join(modePath, 'project-rules.md');
        if (await this.fileExists(rulesFile)) {
            const rulesContent = await this.extractFileContent(rulesFile);
            extractedContent.push(rulesContent);
        }

        return extractedContent;
    }

    /**
     * Extract structured content from a file
     */
    async extractFileContent(filePath) {
        const content = await readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        const sections = [];

        let currentSection = null;
        let inCodeBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Track code blocks
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
            }

            // Find section headers (# ## ###)
            const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
            if (headerMatch && !inCodeBlock) {
                // Save previous section
                if (currentSection) {
                    currentSection.lineEnd = i - 1;
                    currentSection.content = lines
                        .slice(currentSection.lineStart, currentSection.lineEnd + 1)
                        .join('\n');
                    sections.push(currentSection);
                }

                // Start new section
                const title = headerMatch[2].trim();
                const type = this.categorizeSection(title);
                
                currentSection = {
                    title,
                    content: '',
                    lineStart: i,
                    lineEnd: -1,
                    type
                };
            }
        }

        // Save last section
        if (currentSection) {
            currentSection.lineEnd = lines.length - 1;
            currentSection.content = lines
                .slice(currentSection.lineStart, currentSection.lineEnd + 1)
                .join('\n');
            sections.push(currentSection);
        }

        return {
            file: filePath,
            sections
        };
    }

    /**
     * Categorize a section based on its title
     */
    categorizeSection(title) {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('workflow') || titleLower.includes('steps')) {
            return 'workflow';
        }
        if (titleLower.includes('principle') || titleLower.includes('solid')) {
            return 'principles';
        }
        if (titleLower.includes('feature') || titleLower.includes('command')) {
            return 'features';
        }
        if (titleLower.includes('structure') || titleLower.includes('organization')) {
            return 'structure';
        }
        if (titleLower.includes('rule') || titleLower.includes('requirement')) {
            return 'rules';
        }
        
        return 'other';
    }

    /**
     * Map extracted content to rules from the rule pool
     */
    async mapContentToRules(extractedContent) {
        const mappings = [];
        
        // Load rule pool if not already loaded
        if (!this.rulePool) {
            this.rulePool = await this.loadRulePool();
        }

        for (const file of extractedContent) {
            for (const section of file.sections) {
                const mapping = await this.findMatchingRules(file.file, section);
                mappings.push(mapping);
            }
        }

        return mappings;
    }

    /**
     * Find rules that match the content of a section
     */
    async findMatchingRules(filePath, section) {
        const mapping = {
            originalFile: filePath,
            section: section.title,
            content: section.content,
            mappedRules: [],
            confidence: 0
        };

        if (!this.rulePool || !this.rulePool.rules) {
            return mapping;
        }

        const rules = Object.values(this.rulePool.rules);
        const sectionContent = section.content.toLowerCase();
        const sectionTitle = section.title.toLowerCase();

        let bestMatches = [];

        for (const rule of rules) {
            let score = 0;
            const ruleContent = (rule.content || '').toLowerCase();
            const ruleTitle = (rule.title || '').toLowerCase();

            // Title matching (higher weight)
            if (this.containsKeywords(sectionTitle, ruleTitle)) {
                score += 3;
            }

            // Content matching
            if (this.containsKeywords(sectionContent, ruleContent)) {
                score += 2;
            }

            // Category-based matching
            if (section.type === 'workflow' && rule.category === 'CUSTOM') {
                score += 1;
            }
            if (section.type === 'principles' && rule.category === 'SOLID_PRINCIPLES') {
                score += 2;
            }
            if (section.type === 'features' && rule.category === 'ENTERPRISE_FEATURES') {
                score += 1;
            }
            if (section.type === 'structure' && rule.category === 'FILE_ORGANIZATION') {
                score += 1;
            }

            // Keyword matching
            const keywords = this.extractKeywords(sectionContent);
            for (const keyword of keywords) {
                if (ruleContent.includes(keyword)) {
                    score += 0.5;
                }
            }

            if (score > 0) {
                bestMatches.push({ ruleId: rule.id, score });
            }
        }

        // Sort by score and take top matches
        bestMatches.sort((a, b) => b.score - a.score);
        const topMatches = bestMatches.slice(0, 5); // Take top 5 matches

        mapping.mappedRules = topMatches.map(m => m.ruleId);
        mapping.confidence = topMatches.length > 0 ? Math.min(topMatches[0].score / 10, 1) : 0;

        return mapping;
    }

    /**
     * Check if text contains keywords from another text
     */
    containsKeywords(text, reference) {
        const keywords = reference.split(/\s+/).filter(word => word.length > 3);
        let matches = 0;
        
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                matches++;
            }
        }
        
        return matches > 0 && (matches / keywords.length) > 0.3;
    }

    /**
     * Extract keywords from content
     */
    extractKeywords(content) {
        const words = content.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        // Remove common words
        const commonWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'their', 'said', 'each', 'which', 'more', 'only', 'other', 'after', 'first', 'never', 'these'];
        
        return words.filter(word => !commonWords.includes(word));
    }

    /**
     * Create rule-based configuration from content mapping
     */
    async createRuleBasedConfiguration(modeType, contentMapping) {
        // Get all mapped rules
        const allMappedRules = contentMapping.flatMap(m => m.mappedRules);
        const uniqueRules = [...new Set(allMappedRules)];

        // Create base configuration from predefined templates
        const predefinedConfig = await this.getPredefinedConfiguration(modeType);
        
        // Enhance with discovered rules
        const enhancedConfig = {
            ...predefinedConfig,
            id: `${modeType}_migrated_${Date.now()}`,
            name: `${modeType.charAt(0).toUpperCase() + modeType.slice(1)} Mode (Migrated)`,
            description: `Migrated ${modeType} mode configuration using rule-based system`,
            
            ruleSelection: {
                ...predefinedConfig.ruleSelection,
                explicitIncludes: [...(predefinedConfig.ruleSelection.explicitIncludes || []), ...uniqueRules],
            },

            metadata: {
                ...predefinedConfig.metadata,
                migrationDate: new Date().toISOString(),
                originalFiles: contentMapping.map(m => m.originalFile),
                migrationConfidence: this.calculateOverallConfidence(contentMapping)
            }
        };

        return enhancedConfig;
    }

    /**
     * Get predefined configuration for a mode type
     */
    async getPredefinedConfiguration(modeType) {
        // Default configurations based on the Phase 2.1 implementation
        const configs = {
            enterprise: {
                id: 'enterprise',
                name: 'Enterprise Mode',
                description: 'Full-featured enterprise mode with comprehensive task management and automation',
                type: 'enterprise',
                ruleSelection: {
                    includeCategories: ['CUSTOM', 'TASK_MANAGEMENT', 'ENTERPRISE_FEATURES'],
                    excludeCategories: [],
                    minimumUrgency: 'MEDIUM',
                    maxRules: 50,
                    explicitIncludes: [],
                    explicitExcludes: []
                },
                ruleOrganization: {
                    groupBy: 'category',
                    sortBy: 'urgency',
                    customOrder: []
                },
                templates: {
                    instructionsTemplate: 'enterprise-instructions',
                    rulesTemplate: 'enterprise-rules'
                },
                structure: {
                    includeAutomation: true,
                    includeScripts: true,
                    taskManagementLevel: 'enterprise'
                },
                deployment: {
                    targetFiles: ['copilot-instructions.md', 'project-rules.md'],
                    includeAutomationFiles: true,
                    includeScriptFiles: true
                },
                metadata: {
                    created: new Date().toISOString(),
                    version: '1.0.0'
                }
            },
            simplified: {
                id: 'simplified',
                name: 'Simplified Mode',
                description: 'Streamlined mode for basic projects with essential features only',
                type: 'simplified',
                ruleSelection: {
                    includeCategories: ['CUSTOM', 'BASIC_FEATURES'],
                    excludeCategories: ['ENTERPRISE_FEATURES', 'ADVANCED_AUTOMATION'],
                    minimumUrgency: 'LOW',
                    maxRules: 20,
                    explicitIncludes: [],
                    explicitExcludes: []
                },
                ruleOrganization: {
                    groupBy: 'category',
                    sortBy: 'urgency',
                    customOrder: []
                },
                templates: {
                    instructionsTemplate: 'simplified-instructions',
                    rulesTemplate: 'simplified-rules'
                },
                structure: {
                    includeAutomation: false,
                    includeScripts: false,
                    taskManagementLevel: 'basic'
                },
                deployment: {
                    targetFiles: ['copilot-instructions.md', 'project-rules.md'],
                    includeAutomationFiles: false,
                    includeScriptFiles: false
                },
                metadata: {
                    created: new Date().toISOString(),
                    version: '1.0.0'
                }
            },
            hybrid: {
                id: 'hybrid',
                name: 'Hybrid Mode',
                description: 'Balanced mode with selective enterprise features',
                type: 'hybrid',
                ruleSelection: {
                    includeCategories: ['CUSTOM', 'TASK_MANAGEMENT'],
                    excludeCategories: [],
                    minimumUrgency: 'MEDIUM',
                    maxRules: 35,
                    explicitIncludes: [],
                    explicitExcludes: []
                },
                ruleOrganization: {
                    groupBy: 'category',
                    sortBy: 'urgency',
                    customOrder: []
                },
                templates: {
                    instructionsTemplate: 'hybrid-instructions',
                    rulesTemplate: 'hybrid-rules'
                },
                structure: {
                    includeAutomation: true,
                    includeScripts: false,
                    taskManagementLevel: 'hybrid'
                },
                deployment: {
                    targetFiles: ['copilot-instructions.md', 'project-rules.md'],
                    includeAutomationFiles: true,
                    includeScriptFiles: false
                },
                metadata: {
                    created: new Date().toISOString(),
                    version: '1.0.0'
                }
            }
        };

        return configs[modeType] || configs.simplified;
    }

    /**
     * Calculate overall confidence for the migration
     */
    calculateOverallConfidence(contentMapping) {
        if (contentMapping.length === 0) return 0;
        
        const totalConfidence = contentMapping.reduce((sum, mapping) => sum + mapping.confidence, 0);
        return totalConfidence / contentMapping.length;
    }

    /**
     * Basic validation of the configuration
     */
    async validateConfiguration(config) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Basic structure validation
        if (!config.id || !config.name || !config.type) {
            result.isValid = false;
            result.errors.push('Missing required fields: id, name, or type');
        }

        if (!config.ruleSelection) {
            result.isValid = false;
            result.errors.push('Missing ruleSelection configuration');
        }

        // Rule selection validation
        if (config.ruleSelection) {
            const { includeCategories, maxRules } = config.ruleSelection;
            
            if (!includeCategories || includeCategories.length === 0) {
                result.warnings.push('No categories specified for rule inclusion');
            }

            if (maxRules && maxRules < 1) {
                result.errors.push('maxRules must be greater than 0');
                result.isValid = false;
            }
        }

        return result;
    }

    /**
     * Save the converted configuration
     */
    async saveConvertedConfiguration(modeType, config) {
        const outputDir = path.join(this.basePath, 'migrated-configs');
        await this.ensureDirectoryExists(outputDir);
        
        const configPath = path.join(outputDir, `${modeType}-migrated.json`);
        await writeFile(configPath, JSON.stringify(config, null, 2));
    }

    /**
     * Load the rule pool
     */
    async loadRulePool() {
        const rulePoolPath = path.join(this.basePath, 'data', 'rule-pool.json');
        
        if (await this.fileExists(rulePoolPath)) {
            const content = await readFile(rulePoolPath, 'utf-8');
            return JSON.parse(content);
        }
        
        throw new Error(`Rule pool not found at ${rulePoolPath}`);
    }

    /**
     * Check if a file exists
     */
    async fileExists(filePath) {
        try {
            await access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Ensure a directory exists
     */
    async ensureDirectoryExists(dirPath) {
        try {
            await access(dirPath);
        } catch {
            await mkdir(dirPath, { recursive: true });
        }
    }

    /**
     * Generate migration report
     */
    async generateMigrationReport(results) {
        let report = '# Mode Migration Report\n\n';
        report += `Generated on: ${new Date().toISOString()}\n\n`;

        let totalSuccess = 0;
        let totalRulesMapped = 0;
        let totalConfidence = 0;

        for (const result of results) {
            if (result.success) totalSuccess++;
            totalRulesMapped += result.contentMapping.reduce((sum, m) => sum + m.mappedRules.length, 0);
            
            const avgConfidence = result.contentMapping.length > 0 
                ? result.contentMapping.reduce((sum, m) => sum + m.confidence, 0) / result.contentMapping.length 
                : 0;
            totalConfidence += avgConfidence;

            report += `## ${result.modeType.toUpperCase()} Mode Migration\n\n`;
            report += `**Status**: ${result.success ? '✅ Success' : '❌ Failed'}\n`;
            report += `**Confidence**: ${(avgConfidence * 100).toFixed(1)}%\n`;
            report += `**Rules Mapped**: ${result.contentMapping.reduce((sum, m) => sum + m.mappedRules.length, 0)}\n\n`;
            
            if (result.originalFiles.length > 0) {
                report += `**Original Files**:\n`;
                for (const file of result.originalFiles) {
                    const filename = path.basename(file);
                    report += `- ${filename}\n`;
                }
                report += '\n';
            }

            if (result.contentMapping.length > 0) {
                report += `**Content Mapping**:\n`;
                for (const mapping of result.contentMapping) {
                    report += `- **${mapping.section}** (confidence: ${(mapping.confidence * 100).toFixed(1)}%)\n`;
                    report += `  - Mapped to ${mapping.mappedRules.length} rules\n`;
                }
                report += '\n';
            }

            if (result.errors.length > 0) {
                report += `**Errors**:\n`;
                for (const error of result.errors) {
                    report += `- ${error}\n`;
                }
                report += '\n';
            }

            if (result.warnings.length > 0) {
                report += `**Warnings**:\n`;
                for (const warning of result.warnings) {
                    report += `- ${warning}\n`;
                }
                report += '\n';
            }

            report += '---\n\n';
        }

        // Summary
        report += `## Summary\n\n`;
        report += `**Total Modes**: ${results.length}\n`;
        report += `**Successful Migrations**: ${totalSuccess}\n`;
        report += `**Total Rules Mapped**: ${totalRulesMapped}\n`;
        report += `**Average Confidence**: ${results.length > 0 ? ((totalConfidence / results.length) * 100).toFixed(1) : 0}%\n\n`;

        return report;
    }
}

module.exports = { StandaloneModeMigrationService };

// If running directly
if (require.main === module) {
    async function runMigration() {
        const service = new StandaloneModeMigrationService(__dirname);
        
        try {
            const results = await service.migrateAllModes();
            
            console.log('\n🎉 Migration completed!');
            console.log(`✅ Successful: ${results.filter(r => r.success).length}/${results.length}`);
            console.log(`❌ Failed: ${results.filter(r => !r.success).length}/${results.length}`);
            
            // Save results for inspection
            const resultsPath = path.join(__dirname, 'migration-results.json');
            await require('fs').promises.writeFile(resultsPath, JSON.stringify(results, null, 2));
            console.log(`📁 Detailed results saved to: ${resultsPath}`);
            
        } catch (error) {
            console.error('💥 Migration failed:', error);
            process.exit(1);
        }
    }

    runMigration();
}
