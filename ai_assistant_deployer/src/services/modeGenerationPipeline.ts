/**
 * Mode Generation Pipeline Service
 * Converts rule-based mode configurations into deployable mode files
 * Part of Phase 2.3 - Mode Generation Pipeline
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ModeConfiguration } from './modeConfigurationTypes';
import { ModeConfigurationService } from './modeConfigurationService';
import { RulePoolService } from './rulePoolService';
import { Rule } from './rulePoolTypes';

export interface GenerationResult {
    success: boolean;
    message: string;
    generatedFiles: string[];
    mode: string;
    duration: number;
}

export interface TemplateContext {
    mode: ModeConfiguration;
    rules: Rule[];
    metadata: {
        generatedAt: string;
        generationMode: 'rule-based' | 'template-based';
        totalRules: number;
        effectiveRules: number;
    };
}

export interface ModeTemplate {
    name: string;
    targetFile: string;
    template: string;
    required: boolean;
}

export class ModeGenerationPipeline {
    private modeConfigService: ModeConfigurationService;
    private rulePoolService: RulePoolService;
    private extensionPath: string;
    private templateCache: Map<string, string> = new Map();

    constructor(
        modeConfigService: ModeConfigurationService,
        rulePoolService: RulePoolService,
        extensionPath: string
    ) {
        this.modeConfigService = modeConfigService;
        this.rulePoolService = rulePoolService;
        this.extensionPath = extensionPath;
    }

    /**
     * Generate mode files from a rule-based configuration
     */
    async generateModeFromConfiguration(
        config: ModeConfiguration,
        outputPath: string
    ): Promise<GenerationResult> {
        const startTime = Date.now();
        const result: GenerationResult = {
            success: false,
            message: '',
            generatedFiles: [],
            mode: config.id,
            duration: 0
        };

        try {
            console.log(`[ModeGeneration] Starting generation for mode: ${config.name} (${config.id})`);

            // Step 1: Resolve rules from configuration
            const rules = await this.resolveRulesFromConfiguration(config);
            console.log(`[ModeGeneration] Resolved ${rules.length} rules`);

            // Step 2: Create template context
            const context = this.createTemplateContext(config, rules);

            // Step 3: Load mode templates
            const templates = await this.loadModeTemplates(config);
            console.log(`[ModeGeneration] Loaded ${templates.length} templates`);

            // Step 4: Ensure output directory exists
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }

            // Step 5: Generate files from templates
            for (const template of templates) {
                try {
                    const generatedContent = await this.renderTemplate(template, context);
                    const targetPath = path.join(outputPath, template.targetFile);
                    
                    await fs.promises.writeFile(targetPath, generatedContent, 'utf-8');
                    result.generatedFiles.push(template.targetFile);
                    
                    console.log(`[ModeGeneration] Generated: ${template.targetFile}`);
                } catch (templateError) {
                    const errorMsg = `Failed to generate ${template.targetFile}: ${templateError}`;
                    if (template.required) {
                        throw new Error(errorMsg);
                    } else {
                        console.warn(`[ModeGeneration] ${errorMsg} (non-critical)`);
                    }
                }
            }

            // Step 6: Generate additional mode files (scripts, configs)
            if (config.structure?.includeAutomation) {
                await this.generateAutomationFiles(config, outputPath, result.generatedFiles);
            }

            if (config.structure?.includeScripts) {
                await this.generateScriptFiles(config, outputPath, result.generatedFiles);
            }

            // Step 7: Generate mode metadata file
            await this.generateMetadataFile(config, context, outputPath, result.generatedFiles);

            result.success = true;
            result.message = `Successfully generated ${result.generatedFiles.length} files for ${config.name}`;
            result.duration = Date.now() - startTime;

            console.log(`[ModeGeneration] Completed generation in ${result.duration}ms`);
            return result;

        } catch (error) {
            result.success = false;
            result.message = `Failed to generate mode ${config.name}: ${error}`;
            result.duration = Date.now() - startTime;
            
            console.error(`[ModeGeneration] Failed:`, error);
            return result;
        }
    }

    /**
     * Generate mode from migrated configuration file
     */
    async generateModeFromMigratedConfig(
        configPath: string,
        outputPath: string
    ): Promise<GenerationResult> {
        try {
            const config = await this.modeConfigService.loadModeConfiguration(configPath, {
                validateRules: true,
                expandSelections: true
            });

            return await this.generateModeFromConfiguration(config, outputPath);
        } catch (error) {
            return {
                success: false,
                message: `Failed to load configuration from ${configPath}: ${error}`,
                generatedFiles: [],
                mode: 'unknown',
                duration: 0
            };
        }
    }

    /**
     * Resolve rules from mode configuration
     */
    private async resolveRulesFromConfiguration(config: ModeConfiguration): Promise<Rule[]> {
        const resolvedRules: Rule[] = [];
        const { ruleSelection } = config;

        // Guard against undefined ruleSelection
        if (!ruleSelection) {
            return [];
        }

        // Get all rules from pool
        const allRules = await this.rulePoolService.getAllRules();

        // Start with explicit includes
        if (ruleSelection.explicitIncludes && ruleSelection.explicitIncludes.length > 0) {
            for (const ruleId of ruleSelection.explicitIncludes) {
                const rule = allRules.find(r => r.id === ruleId);
                if (rule) {
                    resolvedRules.push(rule);
                }
            }
        }

        // Add rules by category
        if (ruleSelection.includeCategories && ruleSelection.includeCategories.length > 0) {
            const categoryRules = allRules.filter(rule => 
                ruleSelection.includeCategories!.includes(rule.category) &&
                !ruleSelection.explicitExcludes?.includes(rule.id) &&
                !resolvedRules.some(r => r.id === rule.id)
            );
            resolvedRules.push(...categoryRules);
        }

        // Filter by urgency if specified
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
            // Sort by urgency and take top rules
            filteredRules = filteredRules
                .sort((a, b) => {
                    const urgencyOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
                    return urgencyOrder.indexOf(b.urgency) - urgencyOrder.indexOf(a.urgency);
                })
                .slice(0, ruleSelection.maxRules);
        }

        // Remove explicit excludes
        if (ruleSelection.explicitExcludes?.length && ruleSelection.explicitExcludes.length > 0) {
            filteredRules = filteredRules.filter(rule => 
                !ruleSelection.explicitExcludes!.includes(rule.id)
            );
        }

        return filteredRules;
    }

    /**
     * Create template context for rendering
     */
    private createTemplateContext(config: ModeConfiguration, rules: Rule[]): TemplateContext {
        return {
            mode: config,
            rules,
            metadata: {
                generatedAt: new Date().toISOString(),
                generationMode: 'rule-based',
                totalRules: rules.length,
                effectiveRules: rules.length
            }
        };
    }

    /**
     * Load mode templates based on configuration
     */
    private async loadModeTemplates(config: ModeConfiguration): Promise<ModeTemplate[]> {
        const templates: ModeTemplate[] = [];

        // Core templates
        templates.push({
            name: 'Copilot Instructions',
            targetFile: 'copilot-instructions.md',
            template: await this.loadTemplate('copilot-instructions'),
            required: true
        });

        templates.push({
            name: 'Project Rules',
            targetFile: 'project-rules.md',
            template: await this.loadTemplate('project-rules'),
            required: true
        });

        // Additional templates based on configuration
        if (config.structure?.taskManagementLevel === 'enterprise') {
            templates.push({
                name: 'Task Management',
                targetFile: 'task-management.md',
                template: await this.loadTemplate('task-management'),
                required: false
            });
        }

        return templates;
    }

    /**
     * Load a template from file or use default
     */
    private async loadTemplate(templateName: string): Promise<string> {
        // Check cache first
        if (this.templateCache.has(templateName)) {
            return this.templateCache.get(templateName)!;
        }

        try {
            // Try to load from templates directory
            const templatePath = path.join(this.extensionPath, 'templates', 'generation', `${templateName}.hbs`);
            
            if (fs.existsSync(templatePath)) {
                const template = await fs.promises.readFile(templatePath, 'utf-8');
                this.templateCache.set(templateName, template);
                return template;
            }
        } catch (error) {
            console.warn(`[ModeGeneration] Could not load template ${templateName}: ${error}`);
        }

        // Fall back to default template
        const defaultTemplate = this.getDefaultTemplate(templateName);
        this.templateCache.set(templateName, defaultTemplate);
        return defaultTemplate;
    }

    /**
     * Render template with context
     */
    private async renderTemplate(template: ModeTemplate, context: TemplateContext): Promise<string> {
        // Simple template rendering - replace basic placeholders
        let content = template.template;

        // Replace mode information
        content = content.replace(/\{\{mode\.name\}\}/g, context.mode.name || '');
        content = content.replace(/\{\{mode\.description\}\}/g, context.mode.description || '');
        content = content.replace(/\{\{mode\.type\}\}/g, context.mode.type || '');

        // Replace metadata
        content = content.replace(/\{\{metadata\.generatedAt\}\}/g, context.metadata.generatedAt);
        content = content.replace(/\{\{metadata\.totalRules\}\}/g, context.metadata.totalRules.toString());

        // Render rules section
        const rulesSection = this.renderRulesSection(context.rules, context.mode);
        content = content.replace(/\{\{rules\}\}/g, rulesSection);

        // Generate mode-specific content based on type
        const modeContent = this.generateModeSpecificContent(context.mode, context.rules);
        content = content.replace(/\{\{modeContent\}\}/g, modeContent);

        return content;
    }

    /**
     * Render rules section
     */
    private renderRulesSection(rules: Rule[], config: ModeConfiguration): string {
        if (rules.length === 0) {
            return '# No rules configured for this mode\n';
        }

        let content = `# Rules (${rules.length} active)\n\n`;

        // Group rules by category if specified
        if (config.ruleOrganization?.groupBy === 'category') {
            const groupedRules = this.groupRulesByCategory(rules);
            
            for (const [category, categoryRules] of Object.entries(groupedRules)) {
                content += `## ${category}\n\n`;
                for (const rule of categoryRules) {
                    content += this.renderRule(rule);
                }
                content += '\n';
            }
        } else {
            // Render rules in order
            for (const rule of rules) {
                content += this.renderRule(rule);
            }
        }

        return content;
    }

    /**
     * Render individual rule
     */
    private renderRule(rule: Rule): string {
        const urgencyEmoji = this.getUrgencyEmoji(rule.urgency);
        
        return `### ${rule.title}\n\n` +
               `${urgencyEmoji} **${rule.urgency}** | ${rule.category}\n\n` +
               `${rule.content}\n\n` +
               (rule.sources?.length ? `*Sources: ${rule.sources.join(', ')}*\n\n` : '');
    }

    /**
     * Group rules by category
     */
    private groupRulesByCategory(rules: Rule[]): Record<string, Rule[]> {
        return rules.reduce((groups, rule) => {
            const category = rule.category || 'UNCATEGORIZED';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(rule);
            return groups;
        }, {} as Record<string, Rule[]>);
    }

    /**
     * Generate mode-specific content
     */
    private generateModeSpecificContent(config: ModeConfiguration, rules: Rule[]): string {
        let content = '';

        if (config.type === 'enterprise') {
            content += this.generateEnterpriseContent(config, rules);
        } else if (config.type === 'simplified') {
            content += this.generateSimplifiedContent(config, rules);
        }

        return content;
    }

    /**
     * Generate enterprise-specific content
     */
    private generateEnterpriseContent(config: ModeConfiguration, rules: Rule[]): string {
        return `
## Enterprise Features

This mode includes comprehensive enterprise-grade features for large-scale development:

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
\`\`\`

### Available Commands
- \`task-management.sh\` - Main enterprise orchestrator
- \`massive_task_orchestrator.sh\` - Epic task management
- \`interrupt_handler.sh\` - Priority interrupt system
- \`auto_save.sh\` - Automatic state preservation
- \`sync_check.sh\` - Cross-machine synchronization
`;
    }

    /**
     * Generate simplified-specific content
     */
    private generateSimplifiedContent(config: ModeConfiguration, rules: Rule[]): string {
        return `
## Simplified Mode Features

This mode provides essential development guidelines with minimal complexity:

- **Basic Task Management**: Simple workflow and organization
- **Core Development Practices**: Essential coding standards
- **Standard File Organization**: Clean project structure
- **Basic Testing**: Unit tests for critical functionality

### Focus Areas
- Clean, readable code
- Simple project organization
- Basic documentation
- Essential testing practices
`;
    }

    /**
     * Generate automation files if requested
     */
    private async generateAutomationFiles(
        config: ModeConfiguration, 
        outputPath: string, 
        generatedFiles: string[]
    ): Promise<void> {
        // Generate mode-manager.sh
        const modeManagerContent = this.generateModeManagerScript(config);
        const modeManagerPath = path.join(outputPath, 'mode-manager.sh');
        await fs.promises.writeFile(modeManagerPath, modeManagerContent, 'utf-8');
        generatedFiles.push('mode-manager.sh');

        // Generate update script
        const updateScriptContent = this.generateUpdateScript(config);
        const updateScriptPath = path.join(outputPath, 'update_project_map.sh');
        await fs.promises.writeFile(updateScriptPath, updateScriptContent, 'utf-8');
        generatedFiles.push('update_project_map.sh');
    }

    /**
     * Generate script files if requested
     */
    private async generateScriptFiles(
        config: ModeConfiguration, 
        outputPath: string, 
        generatedFiles: string[]
    ): Promise<void> {
        if (config.type === 'enterprise') {
            // Generate enterprise scripts
            const scripts = [
                'task-management.sh',
                'massive_task_orchestrator.sh',
                'interrupt_handler.sh',
                'auto_save.sh',
                'sync_check.sh'
            ];

            for (const script of scripts) {
                const scriptContent = this.generateEnterpriseScript(script, config);
                const scriptPath = path.join(outputPath, script);
                await fs.promises.writeFile(scriptPath, scriptContent, 'utf-8');
                
                // Make scripts executable
                await fs.promises.chmod(scriptPath, 0o755);
                generatedFiles.push(script);
            }
        }
    }

    /**
     * Generate metadata file
     */
    private async generateMetadataFile(
        config: ModeConfiguration, 
        context: TemplateContext, 
        outputPath: string, 
        generatedFiles: string[]
    ): Promise<void> {
        const metadata = {
            mode: {
                id: config.id,
                name: config.name,
                type: config.type,
                description: config.description
            },
            generation: {
                generatedAt: context.metadata.generatedAt,
                method: 'rule-based-pipeline',
                rulesUsed: context.metadata.totalRules,
                files: generatedFiles
            },
            configuration: {
                ruleSelectionCriteria: config.ruleSelection || null,
                templates: config.templates,
                structure: config.structure
            },
            source: {
                configurationId: config.id,
                migrationDate: config.metadata?.migrationDate,
                originalFiles: config.metadata?.originalFiles
            }
        };

        const metadataPath = path.join(outputPath, 'generation-metadata.json');
        await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
        generatedFiles.push('generation-metadata.json');
    }

    /**
     * Get default template for a given type
     */
    private getDefaultTemplate(templateName: string): string {
        const defaultTemplates: Record<string, string> = {
            'copilot-instructions': `When generating code, please follow these user provided coding instructions. You can ignore an instruction if it contradicts a system message.
<instructions>
# GitHub Copilot Instructions - {{mode.name}}

{{modeContent}}

{{rules}}

---
*Generated by AI Assistant Deployer - Rule-based Mode System*
*Generated: {{metadata.generatedAt}}*
*Rules: {{metadata.totalRules}} active*
</instructions>`,

            'project-rules': `# {{mode.name}} - Project Rules

{{mode.description}}

{{rules}}

---
*Generated by AI Assistant Deployer*
*Generated: {{metadata.generatedAt}}*`,

            'task-management': `# Task Management - {{mode.name}}

{{modeContent}}

## Active Rules
{{rules}}

---
*Generated: {{metadata.generatedAt}}*`
        };

        return defaultTemplates[templateName] || `# {{mode.name}}\n\n{{rules}}`;
    }

    /**
     * Generate mode manager script
     */
    private generateModeManagerScript(config: ModeConfiguration): string {
        return `#!/bin/bash
# Mode Manager Script for ${config.name}
# Generated by AI Assistant Deployer

MODE_NAME="${config.name}"
MODE_TYPE="${config.type}"

echo "Mode Manager - $MODE_NAME ($MODE_TYPE)"
echo "Generated: ${new Date().toISOString()}"

# Add mode-specific functionality here
case "$1" in
    "status")
        echo "Current mode: $MODE_NAME"
        ;;
    "validate")
        echo "Validating $MODE_NAME configuration..."
        ;;
    *)
        echo "Usage: $0 {status|validate}"
        ;;
esac
`;
    }

    /**
     * Generate update script
     */
    private generateUpdateScript(config: ModeConfiguration): string {
        return `#!/bin/bash
# Update Script for ${config.name}
# Generated by AI Assistant Deployer

echo "Updating project map for ${config.name}..."

# Generate PROJECT_MAP.md
cat > .github/PROJECT_MAP.md << 'EOF'
# Project Map - ${config.name}

Generated: ${new Date().toISOString()}
Mode: ${config.type}

## Structure
- Active rules: ${config.ruleSelection?.maxRules || 'unlimited'}
- Categories: ${config.ruleSelection?.includeCategories?.join(', ') || 'all'}
- Minimum urgency: ${config.ruleSelection?.minimumUrgency || 'any'}

EOF

echo "Project map updated successfully"
`;
    }

    /**
     * Generate enterprise script content
     */
    private generateEnterpriseScript(scriptName: string, config: ModeConfiguration): string {
        const scripts: Record<string, string> = {
            'task-management.sh': `#!/bin/bash
# Enterprise Task Management for ${config.name}
echo "Enterprise Task Management System"
# Implementation here`,

            'massive_task_orchestrator.sh': `#!/bin/bash
# Massive Task Orchestrator for ${config.name}
echo "Massive Task Orchestrator"
# Implementation here`,

            'interrupt_handler.sh': `#!/bin/bash
# Interrupt Handler for ${config.name}
echo "Priority Interrupt System"
# Implementation here`,

            'auto_save.sh': `#!/bin/bash
# Auto Save System for ${config.name}
echo "Auto Save System"
# Implementation here`,

            'sync_check.sh': `#!/bin/bash
# Sync Check for ${config.name}
echo "Cross-Machine Synchronization Check"
# Implementation here`
        };

        return scripts[scriptName] || `#!/bin/bash\necho "${scriptName} for ${config.name}"`;
    }

    /**
     * Get urgency emoji
     */
    private getUrgencyEmoji(urgency: string): string {
        const emojis: Record<string, string> = {
            'LOW': '🔵',
            'MEDIUM': '🟡',
            'HIGH': '🟠',
            'CRITICAL': '🔴'
        };
        return emojis[urgency] || '⚪';
    }
}
