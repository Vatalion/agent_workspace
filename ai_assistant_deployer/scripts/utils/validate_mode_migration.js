/**
 * Mode Migration Validation
 * 
 * This script validates that the migrated rule-based configurations
 * produce equivalent content to the original embedded mode files.
 */

const fs = require('fs').promises;
const path = require('path');

// Import our services
const { StandaloneModeMigrationService } = require('./standaloneModeMigrationService');

class MigrationValidationService {
    constructor(basePath = '') {
        this.basePath = basePath;
        this.migrationService = new StandaloneModeMigrationService(basePath);
    }

    /**
     * Validate all migrated configurations
     */
    async validateAllMigrations() {
        console.log('🔍 Validating Mode Migrations\n');
        console.log('=' .repeat(50));

        const results = [];
        const modeTypes = ['enterprise', 'simplified', 'hybrid'];

        for (const modeType of modeTypes) {
            console.log(`\n📊 Validating ${modeType} mode migration...`);
            const validation = await this.validateModeConversion(modeType);
            results.push(validation);
        }

        // Generate validation report
        await this.generateValidationReport(results);

        return results;
    }

    /**
     * Validate a specific mode migration
     */
    async validateModeConversion(modeType) {
        const validation = {
            modeType,
            success: false,
            originalContentAnalysis: null,
            migratedConfigAnalysis: null,
            contentCoverage: 0,
            ruleMappingQuality: 0,
            recommendations: [],
            errors: [],
            warnings: []
        };

        try {
            // Step 1: Analyze original content
            console.log(`   📖 Analyzing original ${modeType} content...`);
            const originalAnalysis = await this.analyzeOriginalContent(modeType);
            validation.originalContentAnalysis = originalAnalysis;

            // Step 2: Analyze migrated configuration
            console.log(`   ⚙️ Analyzing migrated configuration...`);
            const migratedAnalysis = await this.analyzeMigratedConfiguration(modeType);
            validation.migratedConfigAnalysis = migratedAnalysis;

            // Step 3: Calculate content coverage
            console.log(`   📏 Calculating content coverage...`);
            const coverage = this.calculateContentCoverage(originalAnalysis, migratedAnalysis);
            validation.contentCoverage = coverage;

            // Step 4: Assess rule mapping quality
            console.log(`   🎯 Assessing rule mapping quality...`);
            const mappingQuality = this.assessRuleMappingQuality(migratedAnalysis);
            validation.ruleMappingQuality = mappingQuality;

            // Step 5: Generate recommendations
            console.log(`   💡 Generating recommendations...`);
            const recommendations = this.generateRecommendations(originalAnalysis, migratedAnalysis, coverage, mappingQuality);
            validation.recommendations = recommendations;

            // Determine overall success
            validation.success = coverage > 0.7 && mappingQuality > 0.6;

            console.log(`   ${validation.success ? '✅' : '⚠️'} Validation ${validation.success ? 'passed' : 'needs attention'}`);
            console.log(`   📊 Content coverage: ${(coverage * 100).toFixed(1)}%`);
            console.log(`   🎯 Mapping quality: ${(mappingQuality * 100).toFixed(1)}%`);

        } catch (error) {
            validation.errors.push(`Validation failed: ${error.message}`);
            console.log(`   ❌ Validation failed: ${error.message}`);
        }

        return validation;
    }

    /**
     * Analyze original content structure and key elements
     */
    async analyzeOriginalContent(modeType) {
        const analysis = {
            files: [],
            totalSections: 0,
            keyTopics: [],
            codeBlocks: 0,
            commandsFound: 0,
            featuresListed: 0
        };

        try {
            const modePath = path.join(this.basePath, 'templates', 'modes', modeType);
            
            // Analyze copilot-instructions.md
            const instructionsFile = path.join(modePath, 'copilot-instructions.md');
            if (await this.fileExists(instructionsFile)) {
                const instructionsAnalysis = await this.analyzeFile(instructionsFile);
                analysis.files.push(instructionsAnalysis);
            }

            // Analyze project-rules.md
            const rulesFile = path.join(modePath, 'project-rules.md');
            if (await this.fileExists(rulesFile)) {
                const rulesAnalysis = await this.analyzeFile(rulesFile);
                analysis.files.push(rulesAnalysis);
            }

            // Aggregate analysis
            analysis.totalSections = analysis.files.reduce((sum, file) => sum + file.sections, 0);
            analysis.keyTopics = [...new Set(analysis.files.flatMap(file => file.topics))];
            analysis.codeBlocks = analysis.files.reduce((sum, file) => sum + file.codeBlocks, 0);
            analysis.commandsFound = analysis.files.reduce((sum, file) => sum + file.commands, 0);
            analysis.featuresListed = analysis.files.reduce((sum, file) => sum + file.features, 0);

        } catch (error) {
            throw new Error(`Failed to analyze original content: ${error.message}`);
        }

        return analysis;
    }

    /**
     * Analyze a specific file for content structure
     */
    async analyzeFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        
        const analysis = {
            path: filePath,
            sections: 0,
            topics: [],
            codeBlocks: 0,
            commands: 0,
            features: 0,
            keyPhrases: []
        };

        let inCodeBlock = false;

        for (const line of lines) {
            // Count sections (headers)
            if (line.match(/^#{1,3}\s+/)) {
                analysis.sections++;
                const topic = line.replace(/^#{1,3}\s+/, '').trim();
                analysis.topics.push(topic);
            }

            // Count code blocks
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                if (inCodeBlock) analysis.codeBlocks++;
            }

            // Count commands (lines with ` or -`)
            if (line.includes('`') && (line.includes('.sh') || line.includes('task-') || line.includes('mode-'))) {
                analysis.commands++;
            }

            // Count features (bullet points with features)
            if (line.trim().startsWith('- **') || line.includes('Feature')) {
                analysis.features++;
            }

            // Extract key phrases
            const keyWords = ['MANDATORY', 'REQUIRED', 'CRITICAL', 'Enterprise', 'Flutter', 'SOLID'];
            for (const keyword of keyWords) {
                if (line.toUpperCase().includes(keyword.toUpperCase())) {
                    analysis.keyPhrases.push(keyword);
                }
            }
        }

        analysis.keyPhrases = [...new Set(analysis.keyPhrases)];
        return analysis;
    }

    /**
     * Analyze migrated configuration
     */
    async analyzeMigratedConfiguration(modeType) {
        const configPath = path.join(this.basePath, 'migrated-configs', `${modeType}-migrated.json`);
        
        if (!await this.fileExists(configPath)) {
            throw new Error(`Migrated configuration not found: ${configPath}`);
        }

        const configContent = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configContent);

        const analysis = {
            configId: config.id,
            ruleCount: config.ruleSelection.explicitIncludes?.length || 0,
            categories: config.ruleSelection.includeCategories || [],
            excludedCategories: config.ruleSelection.excludeCategories || [],
            maxRules: config.ruleSelection.maxRules,
            migrationConfidence: config.metadata?.migrationConfidence || 0,
            originalFiles: config.metadata?.originalFiles || [],
            hasAutomation: config.structure?.includeAutomation || false,
            hasScripts: config.structure?.includeScripts || false,
            taskManagementLevel: config.structure?.taskManagementLevel
        };

        return analysis;
    }

    /**
     * Calculate how well the migrated configuration covers the original content
     */
    calculateContentCoverage(originalAnalysis, migratedAnalysis) {
        let coverage = 0;
        let totalChecks = 0;

        // Check if key topics are represented by categories
        const keyTopicsMapped = originalAnalysis.keyTopics.filter(topic => {
            const topicLower = topic.toLowerCase();
            return migratedAnalysis.categories.some(category => {
                const categoryWords = category.toLowerCase().split('_');
                return categoryWords.some(word => topicLower.includes(word) || word.includes(topicLower.substring(0, 4)));
            });
        });

        coverage += keyTopicsMapped.length / Math.max(originalAnalysis.keyTopics.length, 1);
        totalChecks++;

        // Check automation coverage
        const hasAutomationInOriginal = originalAnalysis.files.some(file => 
            file.topics.some(topic => topic.toLowerCase().includes('automation') || topic.toLowerCase().includes('command'))
        );
        
        if (hasAutomationInOriginal === migratedAnalysis.hasAutomation) {
            coverage += 1;
        }
        totalChecks++;

        // Check script coverage
        const hasScriptsInOriginal = originalAnalysis.commandsFound > 0;
        if (hasScriptsInOriginal === migratedAnalysis.hasScripts) {
            coverage += 1;
        }
        totalChecks++;

        // Check rule count appropriateness
        const expectedRules = this.estimateExpectedRules(originalAnalysis);
        const ruleCountScore = Math.max(0, 1 - Math.abs(migratedAnalysis.ruleCount - expectedRules) / expectedRules);
        coverage += ruleCountScore;
        totalChecks++;

        return coverage / totalChecks;
    }

    /**
     * Estimate expected number of rules based on original content
     */
    estimateExpectedRules(originalAnalysis) {
        // Base on sections and complexity
        const baseRules = originalAnalysis.totalSections * 2; // Rough estimate
        const complexityMultiplier = originalAnalysis.keyTopics.length > 15 ? 1.5 : 1.0;
        return Math.min(50, Math.max(10, Math.round(baseRules * complexityMultiplier)));
    }

    /**
     * Assess the quality of rule mapping
     */
    assessRuleMappingQuality(migratedAnalysis) {
        let quality = 0;
        let factors = 0;

        // Migration confidence
        quality += migratedAnalysis.migrationConfidence;
        factors++;

        // Rule count appropriateness (not too few, not too many)
        const ruleCountScore = migratedAnalysis.ruleCount >= 10 && migratedAnalysis.ruleCount <= 50 ? 1 : 0.5;
        quality += ruleCountScore;
        factors++;

        // Category diversity
        const categoryScore = migratedAnalysis.categories.length >= 2 ? 1 : 0.6;
        quality += categoryScore;
        factors++;

        // Exclusion logic (simplified should exclude enterprise features)
        const exclusionScore = migratedAnalysis.excludedCategories.length > 0 ? 1 : 0.8;
        quality += exclusionScore;
        factors++;

        return quality / factors;
    }

    /**
     * Generate recommendations for improvement
     */
    generateRecommendations(originalAnalysis, migratedAnalysis, coverage, mappingQuality) {
        const recommendations = [];

        if (coverage < 0.8) {
            recommendations.push({
                type: 'improvement',
                message: `Content coverage is ${(coverage * 100).toFixed(1)}%. Consider reviewing topic mapping.`,
                priority: 'high'
            });
        }

        if (mappingQuality < 0.7) {
            recommendations.push({
                type: 'improvement',
                message: `Rule mapping quality is ${(mappingQuality * 100).toFixed(1)}%. Review rule selection criteria.`,
                priority: 'medium'
            });
        }

        if (migratedAnalysis.ruleCount > 40) {
            recommendations.push({
                type: 'optimization',
                message: `High rule count (${migratedAnalysis.ruleCount}). Consider consolidating or filtering rules.`,
                priority: 'low'
            });
        }

        if (migratedAnalysis.categories.length < 2) {
            recommendations.push({
                type: 'enhancement',
                message: 'Consider including more rule categories for better coverage.',
                priority: 'medium'
            });
        }

        if (originalAnalysis.featuresListed > 5 && !migratedAnalysis.hasAutomation) {
            recommendations.push({
                type: 'feature',
                message: 'Original content mentions many features. Consider enabling automation.',
                priority: 'low'
            });
        }

        return recommendations;
    }

    /**
     * Generate validation report
     */
    async generateValidationReport(validationResults) {
        let report = '# Mode Migration Validation Report\n\n';
        report += `Generated on: ${new Date().toISOString()}\n\n`;

        const successCount = validationResults.filter(r => r.success).length;
        const avgCoverage = validationResults.reduce((sum, r) => sum + r.contentCoverage, 0) / validationResults.length;
        const avgQuality = validationResults.reduce((sum, r) => sum + r.ruleMappingQuality, 0) / validationResults.length;

        report += `## Summary\n\n`;
        report += `**Validation Success Rate**: ${successCount}/${validationResults.length} (${((successCount / validationResults.length) * 100).toFixed(1)}%)\n`;
        report += `**Average Content Coverage**: ${(avgCoverage * 100).toFixed(1)}%\n`;
        report += `**Average Mapping Quality**: ${(avgQuality * 100).toFixed(1)}%\n\n`;

        for (const validation of validationResults) {
            report += `## ${validation.modeType.toUpperCase()} Mode Validation\n\n`;
            report += `**Status**: ${validation.success ? '✅ Passed' : '⚠️ Needs Attention'}\n`;
            report += `**Content Coverage**: ${(validation.contentCoverage * 100).toFixed(1)}%\n`;
            report += `**Mapping Quality**: ${(validation.ruleMappingQuality * 100).toFixed(1)}%\n\n`;

            if (validation.originalContentAnalysis) {
                const orig = validation.originalContentAnalysis;
                report += `**Original Content Analysis**:\n`;
                report += `- Total sections: ${orig.totalSections}\n`;
                report += `- Key topics: ${orig.keyTopics.length}\n`;
                report += `- Code blocks: ${orig.codeBlocks}\n`;
                report += `- Commands: ${orig.commandsFound}\n`;
                report += `- Features: ${orig.featuresListed}\n\n`;
            }

            if (validation.migratedConfigAnalysis) {
                const migr = validation.migratedConfigAnalysis;
                report += `**Migrated Configuration Analysis**:\n`;
                report += `- Rules mapped: ${migr.ruleCount}\n`;
                report += `- Categories: ${migr.categories.join(', ')}\n`;
                report += `- Migration confidence: ${(migr.migrationConfidence * 100).toFixed(1)}%\n`;
                report += `- Automation enabled: ${migr.hasAutomation ? 'Yes' : 'No'}\n`;
                report += `- Scripts enabled: ${migr.hasScripts ? 'Yes' : 'No'}\n\n`;
            }

            if (validation.recommendations.length > 0) {
                report += `**Recommendations**:\n`;
                for (const rec of validation.recommendations) {
                    const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
                    report += `${priority} ${rec.message}\n`;
                }
                report += '\n';
            }

            report += '---\n\n';
        }

        const reportPath = path.join(this.basePath, 'migration-validation-report.md');
        await fs.writeFile(reportPath, report);
        console.log(`\n📊 Validation report saved to: ${reportPath}`);

        return report;
    }

    /**
     * Check if a file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

async function runValidation() {
    try {
        const validator = new MigrationValidationService(__dirname);
        const results = await validator.validateAllMigrations();
        
        console.log('\n🎯 Validation Summary:');
        console.log('=' .repeat(40));
        
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Passed: ${successCount}/${results.length}`);
        
        if (successCount === results.length) {
            console.log('🎉 All migrations validated successfully!');
            console.log('🚀 Ready to proceed with Phase 2.3 - Mode Generation Pipeline');
        } else {
            console.log('⚠️ Some validations need attention. Check the report for details.');
        }

    } catch (error) {
        console.error('💥 Validation failed:', error);
        process.exit(1);
    }
}

// Export for use in other modules
module.exports = { MigrationValidationService };

// Run validation if this file is executed directly
if (require.main === module) {
    runValidation();
}
