/**
 * Mode Migration Service
 * 
 * This service converts existing embedded mode files to rule-based configurations
 * that reference the centralized rule pool instead of containing embedded content.
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ModeConfiguration, ModeType } from './modeConfigurationTypes';
import { ModeConfigurationService } from './modeConfigurationService';
import { RulePoolService } from './rulePoolService';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

interface MigrationResult {
    success: boolean;
    modeType: ModeType;
    originalFiles: string[];
    convertedConfig: ModeConfiguration | null;
    errors: string[];
    warnings: string[];
    contentMapping: ContentMapping[];
}

interface ContentMapping {
    originalFile: string;
    section: string;
    content: string;
    mappedRules: string[];
    confidence: number; // 0-1, how confident we are in the mapping
}

interface ExtractedContent {
    file: string;
    sections: ContentSection[];
}

interface ContentSection {
    title: string;
    content: string;
    lineStart: number;
    lineEnd: number;
    type: 'workflow' | 'principles' | 'features' | 'structure' | 'rules' | 'other';
}

export class ModeMigrationService {
    private modeConfigService: ModeConfigurationService;
    private rulePool: any = null;
    private rulePoolService: RulePoolService;

    constructor(private templatesPath: string = '', private extensionPath: string = '') {
        this.rulePoolService = new RulePoolService(this.extensionPath);
        this.modeConfigService = new ModeConfigurationService(this.rulePoolService);
    }

    /**
     * Migrate all existing modes to rule-based configurations
     */
    async migrateAllModes(): Promise<MigrationResult[]> {
        const results: MigrationResult[] = [];
        const modeTypes: ModeType[] = ['enterprise', 'simplified'];

        for (const modeType of modeTypes) {
            try {
                const result = await this.migrateMode(modeType);
                results.push(result);
            } catch (error) {
                results.push({
                    success: false,
                    modeType,
                    originalFiles: [],
                    convertedConfig: null,
                    errors: [`Failed to migrate ${modeType} mode: ${error}`],
                    warnings: [],
                    contentMapping: []
                });
            }
        }

        return results;
    }

    /**
     * Migrate a specific mode from embedded content to rule-based configuration
     */
    async migrateMode(modeType: ModeType): Promise<MigrationResult> {
        const result: MigrationResult = {
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
            const extractedContent = await this.extractModeContent(modeType);
            result.originalFiles = extractedContent.map(ec => ec.file);

            // Step 2: Analyze content and map to rules
            const contentMapping = await this.mapContentToRules(extractedContent);
            result.contentMapping = contentMapping;

            // Step 3: Create rule-based configuration
            const config = await this.createRuleBasedConfiguration(modeType, contentMapping);
            result.convertedConfig = config;

            // Step 4: Validate the configuration
            const validation = await this.modeConfigService.validateModeConfiguration(config);
            if (!validation.valid) {
                result.errors.push(...validation.errors.map(e => e.message));
                result.warnings.push(...validation.warnings.map(w => w.message));
            }

            // Step 5: Save the new configuration
            await this.saveConvertedConfiguration(modeType, config);

            result.success = validation.valid;

        } catch (error) {
            result.errors.push(`Migration failed: ${error}`);
        }

        return result;
    }

    /**
     * Extract content from existing mode files
     */
    private async extractModeContent(modeType: ModeType): Promise<ExtractedContent[]> {
        const modePath = path.join(this.templatesPath || '', 'templates', 'modes', modeType);
        const extractedContent: ExtractedContent[] = [];

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
    private async extractFileContent(filePath: string): Promise<ExtractedContent> {
        const content = await readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        const sections: ContentSection[] = [];

        let currentSection: ContentSection | null = null;
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
    private categorizeSection(title: string): ContentSection['type'] {
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
    private async mapContentToRules(extractedContent: ExtractedContent[]): Promise<ContentMapping[]> {
        const mappings: ContentMapping[] = [];
        
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
    private async findMatchingRules(filePath: string, section: ContentSection): Promise<ContentMapping> {
        const mapping: ContentMapping = {
            originalFile: filePath,
            section: section.title,
            content: section.content,
            mappedRules: [],
            confidence: 0
        };

        if (!this.rulePool || !this.rulePool.rules) {
            return mapping;
        }

        const rules = Object.values(this.rulePool.rules) as any[];
        const sectionContent = section.content.toLowerCase();
        const sectionTitle = section.title.toLowerCase();

        let bestMatches: Array<{ruleId: string, score: number}> = [];

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
    private containsKeywords(text: string, reference: string): boolean {
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
    private extractKeywords(content: string): string[] {
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
    private async createRuleBasedConfiguration(
        modeType: ModeType, 
        contentMapping: ContentMapping[]
    ): Promise<ModeConfiguration> {
        
        // Get all mapped rules
        const allMappedRules = contentMapping.flatMap(m => m.mappedRules);
        const uniqueRules = [...new Set(allMappedRules)];

        // Create base configuration for the mode type
        const baseConfig: Partial<ModeConfiguration> = {
            id: `${modeType}_migrated_${Date.now()}`,
            name: `${modeType.charAt(0).toUpperCase() + modeType.slice(1)} Mode (Migrated)`,
            description: `Migrated ${modeType} mode configuration using rule-based system`,
            type: modeType,
            metadata: {
                version: '1.0.0',
                projectTypes: ['typescript', 'javascript', 'flutter'],
                complexity: modeType === 'enterprise' ? 'enterprise' : modeType === 'simplified' ? 'basic' : 'medium',
                estimatedHours: {
                    min: modeType === 'simplified' ? 5 : modeType === 'enterprise' ? 50 : 20,
                    max: modeType === 'simplified' ? 20 : modeType === 'enterprise' ? 500 : 50
                },
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                tags: [modeType, 'migrated']
            }
        };
        
        // Enhance with discovered rules
        const enhancedConfig: ModeConfiguration = {
            ...baseConfig as ModeConfiguration,
            
            ruleSelection: {
                explicitIncludes: uniqueRules,
                explicitExcludes: [],
                includeCategories: [],
                urgencyFilter: { minimum: 'LOW', maximum: 'CRITICAL' },
                maxRules: 100
            },

            metadata: {
                ...baseConfig.metadata!,
                migrationDate: new Date().toISOString(),
                originalFiles: contentMapping.map(m => m.originalFile)
            }
        };

        return enhancedConfig;
    }

    /**
     * Calculate overall confidence for the migration
     */
    private calculateOverallConfidence(contentMapping: ContentMapping[]): number {
        if (contentMapping.length === 0) return 0;
        
        const totalConfidence = contentMapping.reduce((sum, mapping) => sum + mapping.confidence, 0);
        return totalConfidence / contentMapping.length;
    }

    /**
     * Save the converted configuration
     */
    private async saveConvertedConfiguration(modeType: ModeType, config: ModeConfiguration): Promise<void> {
        const outputDir = path.join(this.templatesPath || '', 'migrated-configs');
        await this.ensureDirectoryExists(outputDir);
        
        const configPath = path.join(outputDir, `${modeType}-migrated.json`);
        await writeFile(configPath, JSON.stringify(config, null, 2));
    }

    /**
     * Load the rule pool
     */
    private async loadRulePool(): Promise<any> {
        const rulePoolPath = path.join(this.templatesPath || '', 'data', 'rule-pool.json');
        
        if (await this.fileExists(rulePoolPath)) {
            const content = await readFile(rulePoolPath, 'utf-8');
            return JSON.parse(content);
        }
        
        throw new Error(`Rule pool not found at ${rulePoolPath}`);
    }

    /**
     * Check if a file exists
     */
    private async fileExists(filePath: string): Promise<boolean> {
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
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await access(dirPath);
        } catch {
            await mkdir(dirPath, { recursive: true });
        }
    }

    /**
     * Generate migration report
     */
    async generateMigrationReport(results: MigrationResult[]): Promise<string> {
        let report = '# Mode Migration Report\n\n';
        report += `Generated on: ${new Date().toISOString()}\n\n`;

        for (const result of results) {
            report += `## ${result.modeType.toUpperCase()} Mode Migration\n\n`;
            report += `**Status**: ${result.success ? '✅ Success' : '❌ Failed'}\n\n`;
            
            if (result.originalFiles.length > 0) {
                report += `**Original Files**:\n`;
                for (const file of result.originalFiles) {
                    report += `- ${file}\n`;
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

        return report;
    }

    /**
     * Create a comparison report between original and migrated modes
     */
    async createComparisonReport(modeType: ModeType): Promise<string> {
        const config = await this.modeConfigService.loadModeConfiguration(`${modeType}_migrated`);
        
        let report = `# ${modeType.toUpperCase()} Mode Comparison Report\n\n`;
        
        report += `## Rule-Based Configuration\n\n`;
        report += `**Configuration ID**: ${config.id}\n`;
        report += `**Mode Type**: ${config.type || modeType}\n`;
        report += `**Description**: ${config.description}\n\n`;
        
        // Add rule selection summary
        if (config.ruleSelection) {
            report += `**Rule Selection**:\n`;
            report += `- Explicit includes: ${config.ruleSelection.explicitIncludes?.length || 0}\n`;
            report += `- Categories: ${config.ruleSelection.includeCategories?.join(', ') || 'none'}\n`;
            report += `- Max rules: ${config.ruleSelection.maxRules || 'unlimited'}\n`;
            report += `- Min urgency: ${config.ruleSelection.minimumUrgency || 'any'}\n\n`;
        }

        report += '\n## Generated Content Preview\n\n';
        
        // Add basic metadata information
        report += `**Metadata**:\n`;
        report += `- Version: ${config.metadata?.version}\n`;
        report += `- Complexity: ${config.metadata?.complexity}\n`;
        report += `- Project Types: ${config.metadata?.projectTypes?.join(', ')}\n`;
        report += `- Tags: ${config.metadata?.tags?.join(', ')}\n\n`;

        return report;
    }

    /**
     * Generate preview content from rules
     */
    private async generatePreviewContent(rules: any[]): Promise<string> {
        let content = '# Generated Mode Content\n\n';
        
        const categories = [...new Set(rules.map(r => r.category))];
        
        for (const category of categories) {
            const categoryRules = rules.filter(r => r.category === category);
            content += `## ${category.replace(/_/g, ' ')}\n\n`;
            
            for (const rule of categoryRules) {
                content += `### ${rule.title}\n\n`;
                content += `${rule.content}\n\n`;
            }
        }

        return content;
    }
}
