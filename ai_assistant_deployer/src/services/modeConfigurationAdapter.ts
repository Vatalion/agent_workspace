/**
 * Mode Configuration Adapter
 * Adapts between migrated         const copilotRules: RuleSetConfiguration = {
            selection: {
                includeRules: migrated.ruleSelection.explicitIncludes || [],
                excludeRules: migrated.ruleSelection.explicitExcludes || [],
                categories: migrated.ruleSelection.includeCategories || [],
                urgencyFilter: {
                    minimum: migrated.ruleSelection.minimumUrgency as any || 'LOW',
                    maximum: 'CRITICAL' as any
                },
                maxRules: migrated.ruleSelection.maxRules || 100
            },
            organization: {
                groupBy: (migrated.ruleOrganization?.groupBy as any) || 'category',
                orderBy: (migrated.ruleOrganization?.sortBy as any) || 'urgency',
                customOrder: migrated.ruleOrganization?.customOrder || [],
                includeHeaders: true
            }
        };

        // Create project rules configuration
        const projectRules: RuleSetConfiguration = {
            selection: {
                includeRules: migrated.ruleSelection.explicitIncludes || [],
                excludeRules: migrated.ruleSelection.explicitExcludes || [],
                categories: migrated.ruleSelection.includeCategories || [],
                urgencyFilter: {
                    minimum: migrated.ruleSelection.minimumUrgency as any || 'LOW',
                    maximum: 'CRITICAL' as any
                },
                maxRules: migrated.ruleSelection.maxRules || 100
            },
            organization: {
                groupBy: (migrated.ruleOrganization?.groupBy as any) || 'category',
                orderBy: (migrated.ruleOrganization?.sortBy as any) || 'urgency',
                customOrder: migrated.ruleOrganization?.customOrder || [],
                includeHeaders: true
            }
        };d current TypeScript interfaces
 */

import { ModeConfiguration as TypedModeConfiguration } from './modeConfigurationTypes';
import { Rule } from './rulePoolTypes';

/**
 * Migrated mode configuration format (from Phase 2.2)
 */
export interface MigratedModeConfiguration {
    id: string;
    name: string;
    description: string;
    type: string;
    ruleSelection: {
        includeCategories?: string[];
        excludeCategories?: string[];
        minimumUrgency?: string;
        maxRules?: number;
        explicitIncludes?: string[];
        explicitExcludes?: string[];
    };
    ruleOrganization?: {
        groupBy?: string;
        sortBy?: string;
        customOrder?: string[];
    };
    templates?: {
        instructionsTemplate?: string;
        rulesTemplate?: string;
    };
    structure?: {
        includeAutomation?: boolean;
        includeScripts?: boolean;
        taskManagementLevel?: string;
    };
    deployment?: {
        targetFiles?: string[];
        includeAutomationFiles?: boolean;
        includeScriptFiles?: boolean;
    };
    metadata?: {
        created?: string;
        version?: string;
        migrationDate?: string;
        originalFiles?: string[];
        [key: string]: any;
    };
}

/**
 * Adapter class to convert between migrated and typed configurations
 */
export class ModeConfigurationAdapter {
    
    /**
     * Convert migrated configuration to typed configuration
     */
    static adaptMigratedToTyped(migrated: MigratedModeConfiguration): TypedModeConfiguration {
        const copilotRules = {
            selection: {
                includeRules: migrated.ruleSelection.explicitIncludes || [],
                excludeRules: migrated.ruleSelection.explicitExcludes || [],
                categories: migrated.ruleSelection.includeCategories || [],
                urgencyFilter: {
                    minimum: migrated.ruleSelection.minimumUrgency as any || 'LOW',
                    maximum: 'CRITICAL' as any
                },
                maxRules: migrated.ruleSelection.maxRules || 100
            },
            organization: {
                groupBy: (migrated.ruleOrganization?.groupBy as any) || 'category',
                sortBy: (migrated.ruleOrganization?.sortBy as any) || 'urgency',
                orderBy: (migrated.ruleOrganization?.sortBy as any) || 'urgency',
                customOrder: migrated.ruleOrganization?.customOrder || [],
                includeHeaders: (migrated.ruleOrganization as any)?.includeHeaders ?? true
            }
        };

        const projectRules = {
            selection: {
                includeRules: migrated.ruleSelection.explicitIncludes || [],
                excludeRules: migrated.ruleSelection.explicitExcludes || [],
                categories: migrated.ruleSelection.includeCategories || [],
                urgencyFilter: {
                    minimum: migrated.ruleSelection.minimumUrgency as any || 'LOW',
                    maximum: 'CRITICAL' as any
                },
                maxRules: migrated.ruleSelection.maxRules || 100
            },
            organization: {
                groupBy: (migrated.ruleOrganization?.groupBy as any) || 'category',
                sortBy: (migrated.ruleOrganization?.sortBy as any) || 'urgency',
                orderBy: (migrated.ruleOrganization?.sortBy as any) || 'urgency',
                customOrder: migrated.ruleOrganization?.customOrder || [],
                includeHeaders: (migrated.ruleOrganization as any)?.includeHeaders ?? true
            }
        };

        const complexity = migrated.type === 'enterprise' ? 'enterprise' :
                          migrated.type === 'simplified' ? 'basic' : 'medium';

        const adapted: TypedModeConfiguration = {
            id: migrated.id,
            name: migrated.name,
            description: migrated.description,
            metadata: {
                version: migrated.metadata?.version || '1.0.0',
                projectTypes: ['typescript', 'javascript', 'flutter'], // Default
                complexity: complexity as any,
                estimatedHours: {
                    min: complexity === 'basic' ? 1 : complexity === 'enterprise' ? 50 : 10,
                    max: complexity === 'basic' ? 10 : complexity === 'enterprise' ? 500 : 50
                },
                author: 'AI Assistant Deployer Migration',
                created: migrated.metadata?.created || new Date().toISOString(),
                lastModified: migrated.metadata?.migrationDate || new Date().toISOString(),
                tags: [migrated.type, 'migrated']
            },
            rules: {
                copilotInstructions: copilotRules,
                projectRules: projectRules
            },
            structure: {
                directories: [],
                scripts: [],
                automation: [],
                includeTaskManagement: migrated.structure?.taskManagementLevel === 'enterprise',
                includeAutomationScripts: migrated.structure?.includeAutomation || false,
                includeProjectMap: true,
                customDirectories: [],
                fileNaming: {
                    copilotInstructions: 'copilot-instructions.md',
                    projectRules: 'project-rules.md'
                }
            },
            templates: {
                baseTemplate: 'default',
                variables: {},
                copilotInstructions: migrated.templates?.instructionsTemplate || 'default-copilot',
                projectRules: migrated.templates?.rulesTemplate || 'default-rules',
                customTemplates: {}
            },
            deployment: {
                structure: {
                    root: '.github'
                },
                targetDirectory: '.github',
                backupExisting: true,
                validateAfterDeployment: true,
                cleanupOnFailure: true,
                customDeploymentSteps: []
            }
        };

        return adapted;
    }

    /**
     * Extract original migrated properties for backward compatibility
     */
    static extractMigratedProperties(migrated: MigratedModeConfiguration) {
        return {
            type: migrated.type,
            ruleSelection: migrated.ruleSelection,
            ruleOrganization: migrated.ruleOrganization,
            originalStructure: migrated.structure,
            originalDeployment: migrated.deployment,
            migrationMetadata: migrated.metadata
        };
    }

    /**
     * Check if a configuration is a migrated configuration
     */
    static isMigratedConfiguration(config: any): config is MigratedModeConfiguration {
        return config && 
               typeof config.type === 'string' &&
               config.ruleSelection &&
               Array.isArray(config.ruleSelection.explicitIncludes);
    }
}

/**
 * Extended mode configuration that includes migrated properties
 */
export interface ExtendedModeConfiguration extends TypedModeConfiguration {
    // Add migrated properties for backward compatibility
    _migrated?: {
        type: string;
        ruleSelection: MigratedModeConfiguration['ruleSelection'];
        ruleOrganization?: MigratedModeConfiguration['ruleOrganization'];
        originalStructure?: MigratedModeConfiguration['structure'];
        originalDeployment?: MigratedModeConfiguration['deployment'];
        migrationMetadata?: MigratedModeConfiguration['metadata'];
    };
}
