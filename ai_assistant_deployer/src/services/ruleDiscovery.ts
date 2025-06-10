import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Rule, RuleCategory, RuleUrgency, RuleSource, RuleSet } from './ruleTypes';

export class RuleDiscoveryService {
    private workspaceRoot: string;
    private deployedPath: string;

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
        this.deployedPath = path.join(workspaceRoot, '.github');
    }

    /**
     * Discover all rules from the currently deployed mode
     */
    async discoverDeployedRules(): Promise<RuleSet> {
        const currentMode = await this.getCurrentMode();
        if (!currentMode) {
            return this.createEmptyRuleSet('none');
        }

        const rules: Rule[] = [];

        try {
            // Parse different types of rule files
            const copilotRules = await this.parseCopilotInstructions();
            const projectRules = await this.parseProjectRules();
            const scriptRules = await this.parseScriptRules();
            const configRules = await this.parseConfigurationRules();

            rules.push(...copilotRules);
            rules.push(...projectRules);
            rules.push(...scriptRules);
            rules.push(...configRules);

            console.log(`Discovered ${rules.length} rules for mode ${currentMode}`);
            return this.createRuleSet(currentMode, rules);
        } catch (error) {
            console.error('Error discovering rules:', error);
            return this.createEmptyRuleSet(currentMode);
        }
    }

    /**
     * Parse copilot-instructions.md for rules
     */
    private async parseCopilotInstructions(): Promise<Rule[]> {
        const instructionsPath = path.join(this.deployedPath, 'copilot-instructions.md');
        if (!fs.existsSync(instructionsPath)) {
            return [];
        }

        const content = fs.readFileSync(instructionsPath, 'utf8');
        const rules: Rule[] = [];

        // Parse sections as rules
        const sections = this.extractMarkdownSections(content);
        
        for (const section of sections) {
            const rule = this.createRuleFromSection(
                section,
                RuleCategory.CODING_STANDARDS,
                {
                    file: 'copilot-instructions.md',
                    section: section.title,
                    lineStart: section.lineStart,
                    lineEnd: section.lineEnd,
                    mode: await this.getCurrentMode() || 'unknown'
                }
            );
            if (rule) {
                rules.push(rule);
            }
        }

        // Parse specific instruction patterns
        const instructionRules = await this.extractInstructionRules(content);
        rules.push(...instructionRules);

        return rules;
    }

    /**
     * Parse project-rules.md for rules
     */
    private async parseProjectRules(): Promise<Rule[]> {
        const rulesPath = path.join(this.deployedPath, 'project-rules.md');
        if (!fs.existsSync(rulesPath)) {
            return [];
        }

        const content = fs.readFileSync(rulesPath, 'utf8');
        const rules: Rule[] = [];

        // Parse different rule sections
        const sections = this.extractMarkdownSections(content);
        
        for (const section of sections) {
            const category = this.inferCategoryFromTitle(section.title);
            const urgency = this.inferUrgencyFromContent(section.content);
            
            const rule = this.createRuleFromSection(
                section,
                category,
                {
                    file: 'project-rules.md',
                    section: section.title,
                    lineStart: section.lineStart,
                    lineEnd: section.lineEnd,
                    mode: await this.getCurrentMode() || 'unknown'
                },
                urgency
            );
            if (rule) {
                rules.push(rule);
            }
        }

        return rules;
    }

    /**
     * Parse shell scripts for automation rules
     */
    private async parseScriptRules(): Promise<Rule[]> {
        const rules: Rule[] = [];
        
        // Look for script files
        const scriptDirs = ['scripts', 'automation'];
        
        for (const dir of scriptDirs) {
            const scriptPath = path.join(this.deployedPath, dir);
            if (fs.existsSync(scriptPath)) {
                const scriptRules = await this.parseScriptDirectory(scriptPath);
                rules.push(...scriptRules);
            }
        }

        return rules;
    }

    /**
     * Parse configuration files for rules
     */
    private async parseConfigurationRules(): Promise<Rule[]> {
        const rules: Rule[] = [];
        
        // Parse system-config.json
        const systemConfigPath = path.join(this.deployedPath, 'system-config.json');
        if (fs.existsSync(systemConfigPath)) {
            const configRules = await this.parseSystemConfig(systemConfigPath);
            rules.push(...configRules);
        }

        return rules;
    }

    /**
     * Extract markdown sections from content
     */
    private extractMarkdownSections(content: string): Array<{
        title: string;
        content: string;
        level: number;
        lineStart: number;
        lineEnd: number;
    }> {
        const sections: Array<{
            title: string;
            content: string;
            level: number;
            lineStart: number;
            lineEnd: number;
        }> = [];

        const lines = content.split('\n');
        let currentSection: any = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

            if (headerMatch) {
                // Save previous section
                if (currentSection) {
                    currentSection.lineEnd = i - 1;
                    sections.push(currentSection);
                }

                // Start new section
                currentSection = {
                    title: headerMatch[2].trim(),
                    content: '',
                    level: headerMatch[1].length,
                    lineStart: i,
                    lineEnd: i
                };
            } else if (currentSection) {
                currentSection.content += line + '\n';
            }
        }

        // Add last section
        if (currentSection) {
            currentSection.lineEnd = lines.length - 1;
            sections.push(currentSection);
        }

        return sections;
    }

    /**
     * Extract specific instruction rules from content
     */
    private async extractInstructionRules(content: string): Promise<Rule[]> {
        const rules: Rule[] = [];
        
        // Extract "MUST", "SHOULD", "NEVER" patterns
        const patterns = [
            { pattern: /- \*\*MUST\*\*:\s*(.+)/gi, urgency: RuleUrgency.CRITICAL },
            { pattern: /- \*\*SHOULD\*\*:\s*(.+)/gi, urgency: RuleUrgency.HIGH },
            { pattern: /- \*\*NEVER\*\*:\s*(.+)/gi, urgency: RuleUrgency.CRITICAL },
            { pattern: /- \*\*REQUIRED\*\*:\s*(.+)/gi, urgency: RuleUrgency.HIGH },
            { pattern: /- \*\*MANDATORY\*\*:\s*(.+)/gi, urgency: RuleUrgency.CRITICAL }
        ];

        for (const { pattern, urgency } of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const rule: Rule = {
                    id: this.generateRuleId(),
                    title: `Instruction Rule: ${match[1].substring(0, 50)}...`,
                    description: match[1],
                    content: match[0],
                    category: RuleCategory.CODING_STANDARDS,
                    urgency,
                    isEnabled: true,
                    source: {
                        file: 'copilot-instructions.md',
                        section: 'Instructions',
                        mode: await this.getCurrentMode() || 'unknown'
                    },
                    tags: ['instruction', urgency],
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    appliesTo: ['all']
                };
                rules.push(rule);
            }
        }

        return rules;
    }

    /**
     * Parse script directory for automation rules
     */
    private async parseScriptDirectory(scriptPath: string): Promise<Rule[]> {
        const rules: Rule[] = [];
        
        try {
            const files = fs.readdirSync(scriptPath, { withFileTypes: true });
            
            for (const file of files) {
                if (file.isFile() && file.name.endsWith('.sh')) {
                    const scriptFilePath = path.join(scriptPath, file.name);
                    const scriptRules = await this.parseShellScript(scriptFilePath);
                    rules.push(...scriptRules);
                }
            }
        } catch (error) {
            console.error('Error parsing script directory:', error);
        }

        return rules;
    }

    /**
     * Parse individual shell script for rules
     */
    private async parseShellScript(scriptPath: string): Promise<Rule[]> {
        const rules: Rule[] = [];
        
        try {
            const content = fs.readFileSync(scriptPath, 'utf8');
            const fileName = path.basename(scriptPath);
            
            // Extract script description and purpose
            const descriptionMatch = content.match(/^#\s*(.+)/);
            const description = descriptionMatch ? descriptionMatch[1] : `Automation script: ${fileName}`;

            const rule: Rule = {
                id: this.generateRuleId(),
                title: `Script: ${fileName}`,
                description,
                content: content.substring(0, 200) + '...',
                category: RuleCategory.WORKFLOW,
                urgency: RuleUrgency.MEDIUM,
                isEnabled: true,
                source: {
                    file: path.relative(this.deployedPath, scriptPath),
                    section: 'script',
                    mode: await this.getCurrentMode() || 'unknown'
                },
                tags: ['automation', 'script'],
                createdAt: new Date(),
                modifiedAt: new Date(),
                appliesTo: ['all']
            };
            
            rules.push(rule);
        } catch (error) {
            console.error(`Error parsing script ${scriptPath}:`, error);
        }

        return rules;
    }

    /**
     * Parse system configuration for rules
     */
    private async parseSystemConfig(configPath: string): Promise<Rule[]> {
        const rules: Rule[] = [];
        
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // Create rule from configuration
            const rule: Rule = {
                id: this.generateRuleId(),
                title: 'System Configuration',
                description: `Current mode: ${config.mode}`,
                content: JSON.stringify(config, null, 2),
                category: RuleCategory.DEPLOYMENT,
                urgency: RuleUrgency.HIGH,
                isEnabled: true,
                source: {
                    file: 'system-config.json',
                    section: 'config',
                    mode: config.mode || 'unknown'
                },
                tags: ['configuration', 'system'],
                createdAt: new Date(),
                modifiedAt: new Date(),
                appliesTo: ['all']
            };
            
            rules.push(rule);
        } catch (error) {
            console.error('Error parsing system config:', error);
        }

        return rules;
    }

    /**
     * Create rule from markdown section
     */
    private createRuleFromSection(
        section: any,
        category: RuleCategory,
        source: RuleSource,
        urgency?: RuleUrgency
    ): Rule | null {
        if (!section.title || !section.content.trim()) {
            return null;
        }

        return {
            id: this.generateRuleId(),
            title: section.title,
            description: this.extractDescription(section.content),
            content: section.content,
            category,
            urgency: urgency || this.inferUrgencyFromContent(section.content),
            isEnabled: true,
            source,
            tags: this.extractTags(section.content),
            createdAt: new Date(),
            modifiedAt: new Date(),
            appliesTo: this.extractAppliesTo(section.content)
        };
    }

    /**
     * Infer category from section title
     */
    private inferCategoryFromTitle(title: string): RuleCategory {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('security') || titleLower.includes('validation')) {
            return RuleCategory.SECURITY;
        }
        if (titleLower.includes('test') || titleLower.includes('coverage')) {
            return RuleCategory.TESTING;
        }
        if (titleLower.includes('document') || titleLower.includes('readme')) {
            return RuleCategory.DOCUMENTATION;
        }
        if (titleLower.includes('architect') || titleLower.includes('design')) {
            return RuleCategory.ARCHITECTURE;
        }
        if (titleLower.includes('perform') || titleLower.includes('optimi')) {
            return RuleCategory.PERFORMANCE;
        }
        if (titleLower.includes('ui') || titleLower.includes('ux') || titleLower.includes('interface')) {
            return RuleCategory.UI_UX;
        }
        if (titleLower.includes('deploy') || titleLower.includes('build')) {
            return RuleCategory.DEPLOYMENT;
        }
        if (titleLower.includes('workflow') || titleLower.includes('process')) {
            return RuleCategory.WORKFLOW;
        }
        
        return RuleCategory.CODING_STANDARDS;
    }

    /**
     * Infer urgency from content
     */
    private inferUrgencyFromContent(content: string): RuleUrgency {
        const contentLower = content.toLowerCase();
        
        if (contentLower.includes('critical') || contentLower.includes('mandatory') || 
            contentLower.includes('must') || contentLower.includes('required')) {
            return RuleUrgency.CRITICAL;
        }
        if (contentLower.includes('should') || contentLower.includes('important')) {
            return RuleUrgency.HIGH;
        }
        if (contentLower.includes('recommend') || contentLower.includes('prefer')) {
            return RuleUrgency.MEDIUM;
        }
        if (contentLower.includes('optional') || contentLower.includes('suggestion')) {
            return RuleUrgency.LOW;
        }
        
        return RuleUrgency.MEDIUM;
    }

    /**
     * Extract description from content
     */
    private extractDescription(content: string): string {
        // Get first paragraph or first 150 characters
        const firstParagraph = content.split('\n\n')[0];
        return firstParagraph.length > 150 
            ? firstParagraph.substring(0, 150) + '...'
            : firstParagraph;
    }

    /**
     * Extract tags from content
     */
    private extractTags(content: string): string[] {
        const tags: string[] = [];
        
        // Extract common patterns
        if (content.includes('Flutter')) tags.push('flutter');
        if (content.includes('React')) tags.push('react');
        if (content.includes('TypeScript')) tags.push('typescript');
        if (content.includes('JavaScript')) tags.push('javascript');
        if (content.includes('Python')) tags.push('python');
        if (content.includes('test')) tags.push('testing');
        if (content.includes('security')) tags.push('security');
        
        return tags;
    }

    /**
     * Extract applies to from content
     */
    private extractAppliesTo(content: string): string[] {
        const appliesTo: string[] = ['all'];
        
        // Extract specific project types
        if (content.includes('Flutter')) appliesTo.push('flutter');
        if (content.includes('React')) appliesTo.push('react');
        if (content.includes('Node.js')) appliesTo.push('nodejs');
        if (content.includes('Python')) appliesTo.push('python');
        
        return appliesTo;
    }

    /**
     * Get current mode from system config
     */
    private async getCurrentMode(): Promise<string | null> {
        const systemConfigPath = path.join(this.deployedPath, 'system-config.json');
        
        try {
            if (!fs.existsSync(systemConfigPath)) {
                return null;
            }

            const config = JSON.parse(fs.readFileSync(systemConfigPath, 'utf8'));
            return config.mode || null;
        } catch (error) {
            console.error('Error getting current mode:', error);
            return null;
        }
    }

    /**
     * Create rule set from rules array
     */
    private createRuleSet(mode: string, rules: Rule[]): RuleSet {
        const enabledRules = rules.filter(r => r.isEnabled).length;
        
        const rulesByCategory: Record<RuleCategory, number> = {} as any;
        const rulesByUrgency: Record<RuleUrgency, number> = {} as any;
        
        // Initialize counters
        Object.values(RuleCategory).forEach(cat => rulesByCategory[cat] = 0);
        Object.values(RuleUrgency).forEach(urg => rulesByUrgency[urg] = 0);
        
        // Count rules
        rules.forEach(rule => {
            rulesByCategory[rule.category]++;
            rulesByUrgency[rule.urgency]++;
        });

        return {
            mode,
            rules,
            totalRules: rules.length,
            enabledRules,
            rulesByCategory,
            rulesByUrgency
        };
    }

    /**
     * Create empty rule set
     */
    private createEmptyRuleSet(mode: string): RuleSet {
        return {
            mode,
            rules: [],
            totalRules: 0,
            enabledRules: 0,
            rulesByCategory: {} as any,
            rulesByUrgency: {} as any
        };
    }

    /**
     * Generate unique rule ID
     */
    private generateRuleId(): string {
        return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
