/**
 * Mode Configuration Service
 * Handles loading, validation, and processing of mode configurations
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { 
  ModeConfiguration, 
  ModeConfigurationValidationResult, 
  ModeConfigurationLoadOptions,
  ValidationError,
  ValidationWarning,
  RuleResolutionResult,
  FailedRuleResolution,
  RuleSelection,
  RuleSelectionCriteria,
  PredefinedModeType,
  ModeConfigurationDefaults
} from './modeConfigurationTypes';
import { RulePoolService } from './rulePoolService';
import { Rule, RuleCategory, ProjectType, RuleUrgency, RuleSearchCriteria } from './rulePoolTypes';

/**
 * Mode Configuration Service
 * Handles loading, validation, and processing of mode configurations
 */
export class ModeConfigurationService {
  private rulePoolService: RulePoolService;
  private configCache: Map<string, ModeConfiguration> = new Map();
  private validationCache: Map<string, ModeConfigurationValidationResult> = new Map();

  constructor(rulePoolService: RulePoolService) {
    this.rulePoolService = rulePoolService;
  }

  /**
   * Load a mode configuration from file
   */
  async loadModeConfiguration(
    configPath: string, 
    options: ModeConfigurationLoadOptions = {}
  ): Promise<ModeConfiguration> {
    try {
      // Check cache first
      const cacheKey = `${configPath}_${JSON.stringify(options)}`;
      if (this.configCache.has(cacheKey)) {
        return this.configCache.get(cacheKey)!;
      }

      // Read configuration file
      const configContent = await fs.promises.readFile(configPath, 'utf-8');
      let config: ModeConfiguration;

      try {
        config = JSON.parse(configContent);
      } catch (error) {
        throw new Error(`Invalid JSON in mode configuration: ${error}`);
      }

      // Apply defaults
      config = this.applyDefaults(config);

      // Validate if requested
      if (options.validateRules !== false) {
        const validation = await this.validateModeConfiguration(config);
        if (!validation.valid) {
          const errors = validation.errors.filter(e => e.severity === 'error');
          if (errors.length > 0) {
            throw new Error(`Mode configuration validation failed: ${errors.map(e => e.message).join('; ')}`);
          }
        }
      }

      // Resolve inheritance if requested
      if (options.resolveInheritance) {
        config = await this.resolveInheritance(config);
      }

      // Expand rule selections if requested
      if (options.expandSelections) {
        config = await this.expandRuleSelections(config);
      }

      // Cache the result
      this.configCache.set(cacheKey, config);

      return config;
    } catch (error) {
      throw new Error(`Failed to load mode configuration from ${configPath}: ${error}`);
    }
  }

  /**
   * Validate a mode configuration
   */
  async validateModeConfiguration(config: ModeConfiguration): Promise<ModeConfigurationValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic structure validation
    this.validateBasicStructure(config, errors);

    // Rule reference validation
    const ruleResolution = await this.validateRuleReferences(config, errors, warnings);

    // Template validation
    this.validateTemplates(config, errors, warnings);

    // Structure validation
    this.validateStructure(config, errors, warnings);

    // Deployment validation
    this.validateDeployment(config, errors, warnings);

    const result: ModeConfigurationValidationResult = {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      ruleResolution
    };

    return result;
  }

  /**
   * Create a new mode configuration from a predefined template
   */
  createModeConfiguration(
    type: PredefinedModeType,
    customizations?: Partial<ModeConfiguration>
  ): ModeConfiguration {
    const defaults = this.getModeDefaults();
    const baseConfig = defaults[type] || defaults.custom;

    const config: ModeConfiguration = {
      ...baseConfig,
      ...customizations,
      id: customizations?.id || this.generateModeId(),
      metadata: {
        ...baseConfig.metadata,
        ...customizations?.metadata,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    } as ModeConfiguration;

    return config;
  }

  /**
   * Save a mode configuration to file
   */
  async saveModeConfiguration(config: ModeConfiguration, targetPath: string): Promise<void> {
    try {
      // Validate before saving
      const validation = await this.validateModeConfiguration(config);
      if (!validation.valid) {
        const errors = validation.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
          throw new Error(`Cannot save invalid configuration: ${errors.map(e => e.message).join('; ')}`);
        }
      }

      // Update modification time
      config.metadata.lastModified = new Date().toISOString();

      // Ensure directory exists
      const dir = path.dirname(targetPath);
      await fs.promises.mkdir(dir, { recursive: true });

      // Write configuration
      const content = JSON.stringify(config, null, 2);
      await fs.promises.writeFile(targetPath, content, 'utf-8');

      // Clear cache
      this.clearCache();

    } catch (error) {
      throw new Error(`Failed to save mode configuration to ${targetPath}: ${error}`);
    }
  }

  /**
   * Resolve rules based on selection criteria
   */
  async resolveRules(selection: RuleSelection): Promise<Rule[]> {
    const rules = await this.rulePoolService.getAllRules();
    let selectedRules: Rule[] = [];

    // Start with all rules if no specific criteria
    if (!selection.include && !selection.explicitIncludes) {
      selectedRules = Object.values(rules);
    }

    // Apply include criteria
    if (selection.include) {
      const includeRules = new Set<string>();
      for (const criteria of selection.include) {
        const foundRules = await this.findRulesByCriteria(criteria);
        foundRules.forEach(rule => includeRules.add(rule.id));
      }
      selectedRules = selectedRules.filter(rule => includeRules.has(rule.id));
    }

    // Apply explicit includes
    if (selection.explicitIncludes) {
      const explicitSet = new Set(selection.explicitIncludes);
      selectedRules = selectedRules.filter(rule => explicitSet.has(rule.id));
    }

    // Apply exclude criteria
    if (selection.exclude) {
      const excludeRules = new Set<string>();
      for (const criteria of selection.exclude) {
        const foundRules = await this.findRulesByCriteria(criteria);
        foundRules.forEach(rule => excludeRules.add(rule.id));
      }
      selectedRules = selectedRules.filter(rule => !excludeRules.has(rule.id));
    }

    // Apply explicit excludes
    if (selection.explicitExcludes) {
      const excludeSet = new Set(selection.explicitExcludes);
      selectedRules = selectedRules.filter(rule => !excludeSet.has(rule.id));
    }

    // Apply required categories
    if (selection.requiredCategories) {
      const requiredSet = new Set(selection.requiredCategories);
      selectedRules = selectedRules.filter(rule => requiredSet.has(rule.category));
    }

    // Apply minimum urgency
    if (selection.minUrgency) {
      const urgencyLevels = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const minLevel = urgencyLevels.indexOf(selection.minUrgency);
      selectedRules = selectedRules.filter(rule => 
        urgencyLevels.indexOf(rule.urgency) >= minLevel
      );
    }

    // Apply max rules limit
    if (selection.maxRules && selectedRules.length > selection.maxRules) {
      // Sort by urgency and take top rules
      const urgencyOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1, 'INFO': 0 };
      selectedRules.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
      selectedRules = selectedRules.slice(0, selection.maxRules);
    }

    return selectedRules;
  }

  /**
   * Convert existing mode files to mode configuration
   */
  async convertModeToConfiguration(modePath: string): Promise<ModeConfiguration> {
    // This would analyze existing mode files and create a configuration
    // Implementation would involve parsing current mode structure
    // For now, return a basic configuration
    
    const modeName = path.basename(modePath);
    
    return this.createModeConfiguration('custom', {
      name: modeName,
      description: `Converted from existing mode: ${modeName}`,
      // Additional conversion logic would go here
    });
  }

  /**
   * Get predefined mode defaults
   */
  private getModeDefaults(): ModeConfigurationDefaults {
    return {
      enterprise: {
        name: 'Enterprise Mode',
        description: 'Full-featured enterprise development environment with comprehensive task management',
        metadata: {
          version: '1.0.0',
          projectTypes: ['flutter', 'typescript', 'javascript'],
          complexity: 'enterprise',
          estimatedHours: { min: 50, max: 500 },
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          tags: ['enterprise', 'task-management', 'automation']
        },
        rules: {
          copilotInstructions: {
            selection: {
              include: [
                { categories: ['CUSTOM', 'TASK_MANAGEMENT', 'ENTERPRISE_FEATURES'] },
                { urgency: ['CRITICAL', 'HIGH'] }
              ],
              minUrgency: 'MEDIUM'
            },
            organization: {
              groupBy: 'category',
              orderBy: 'urgency',
              includeHeaders: true
            }
          },
          projectRules: {
            selection: {
              include: [
                { categories: ['CLEAN_ARCHITECTURE', 'SOLID_PRINCIPLES', 'FILE_PRACTICES'] },
                { urgency: ['CRITICAL', 'HIGH'] }
              ]
            },
            organization: {
              groupBy: 'category',
              orderBy: 'urgency',
              includeHeaders: true
            }
          }
        },
        structure: {
          directories: [
            { path: '.tasks/system', description: 'Core system files', required: true },
            { path: '.tasks/epics', description: 'Large-scale task orchestration', required: true },
            { path: '.tasks/1_planning', description: 'Task planning', required: true },
            { path: '.tasks/2_review', description: 'Task review', required: true },
            { path: '.tasks/3_execution', description: 'Active task execution', required: true },
            { path: '.tasks/4_completion', description: 'Completion tracking', required: true },
            { path: '.tasks/cross_machine', description: 'Multi-machine sync', required: true }
          ],
          scripts: [],
          automation: []
        },
        templates: {
          baseTemplate: 'enterprise',
          variables: {
            mode: 'ENTERPRISE',
            features: 'Epic-scale task orchestration, Priority interrupt system, Cross-machine sync'
          }
        },
        deployment: {
          structure: {
            root: '.',
            github: {
              useGitHubDir: true,
              files: [
                { source: 'copilot-instructions.md', target: 'copilot-instructions.md', type: 'copilot-instructions' },
                { source: 'project-rules.md', target: 'project-rules.md', type: 'project-rules' }
              ]
            },
            tasks: {
              structure: ['.tasks/system', '.tasks/epics', '.tasks/1_planning', '.tasks/2_review', '.tasks/3_execution', '.tasks/4_completion', '.tasks/cross_machine'],
              type: 'enterprise'
            }
          }
        }
      },
      simplified: {
        name: 'Simplified Mode',
        description: 'Streamlined development environment for small to medium projects',
        metadata: {
          version: '1.0.0',
          projectTypes: ['flutter', 'typescript', 'javascript'],
          complexity: 'basic',
          estimatedHours: { min: 5, max: 20 },
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          tags: ['simplified', 'basic', 'lightweight']
        },
        rules: {
          copilotInstructions: {
            selection: {
              include: [
                { categories: ['CUSTOM', 'TASK_MANAGEMENT'] },
                { urgency: ['CRITICAL', 'HIGH'] }
              ],
              exclude: [
                { categories: ['ENTERPRISE_FEATURES'] }
              ]
            },
            organization: {
              groupBy: 'urgency',
              orderBy: 'urgency',
              includeHeaders: false
            }
          },
          projectRules: {
            selection: {
              include: [
                { categories: ['FILE_PRACTICES', 'DEVELOPMENT_WORKFLOW'] }
              ],
              minUrgency: 'MEDIUM'
            },
            organization: {
              groupBy: 'none',
              orderBy: 'urgency',
              includeHeaders: false
            }
          }
        },
        structure: {
          directories: [
            { path: '.tasks/current', description: 'Current tasks', required: true },
            { path: '.tasks/completed', description: 'Completed tasks', required: true },
            { path: '.tasks/backups', description: 'Automatic backups', required: true }
          ],
          scripts: [],
          automation: []
        },
        templates: {
          baseTemplate: 'simplified',
          variables: {
            mode: 'SIMPLIFIED',
            features: 'Basic task management, Essential automation, Simple backup/recovery'
          }
        },
        deployment: {
          structure: {
            root: '.',
            github: {
              useGitHubDir: true,
              files: [
                { source: 'copilot-instructions.md', target: 'copilot-instructions.md', type: 'copilot-instructions' },
                { source: 'project-rules.md', target: 'project-rules.md', type: 'project-rules' }
              ]
            },
            tasks: {
              structure: ['.tasks/current', '.tasks/completed', '.tasks/backups'],
              type: 'simple'
            }
          }
        }
      },
      custom: {
        name: 'Custom Mode',
        description: 'Custom mode configuration',
        metadata: {
          version: '1.0.0',
          projectTypes: ['all'],
          complexity: 'medium',
          estimatedHours: { min: 1, max: 100 },
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          tags: ['custom', 'configurable']
        },
        rules: {
          copilotInstructions: {
            selection: {
              include: [{ categories: ['CUSTOM'] }]
            },
            organization: {
              groupBy: 'none',
              orderBy: 'title',
              includeHeaders: false
            }
          },
          projectRules: {
            selection: {
              include: [{ categories: ['FILE_PRACTICES'] }]
            },
            organization: {
              groupBy: 'none',
              orderBy: 'title',
              includeHeaders: false
            }
          }
        },
        structure: {
          directories: [],
          scripts: [],
          automation: []
        },
        templates: {
          baseTemplate: 'basic',
          variables: {}
        },
        deployment: {
          structure: {
            root: '.',
            github: {
              useGitHubDir: true,
              files: [
                { source: 'copilot-instructions.md', target: 'copilot-instructions.md', type: 'copilot-instructions' }
              ]
            }
          }
        }
      }
    };
  }

  /**
   * Apply default values to configuration
   */
  private applyDefaults(config: ModeConfiguration): ModeConfiguration {
    // Apply any missing defaults
    return {
      ...config,
      metadata: {
        ...config.metadata,
        created: config.metadata?.created || new Date().toISOString(),
        lastModified: config.metadata?.lastModified || new Date().toISOString(),
        tags: config.metadata?.tags || []
      }
    };
  }

  /**
   * Resolve template inheritance
   */
  private async resolveInheritance(config: ModeConfiguration): Promise<ModeConfiguration> {
    // Implementation for resolving template inheritance
    // For now, return as-is
    return config;
  }

  /**
   * Expand rule selections to actual rule IDs
   */
  private async expandRuleSelections(config: ModeConfiguration): Promise<ModeConfiguration> {
    // Implementation for expanding rule selections
    // For now, return as-is
    return config;
  }

  /**
   * Find rules by selection criteria
   */
  private async findRulesByCriteria(criteria: RuleSelectionCriteria): Promise<Rule[]> {
    const searchCriteria: RuleSearchCriteria = {
      categories: criteria.categories?.map(cat => cat as RuleCategory),
      urgencies: criteria.urgency ? [criteria.urgency?.[0] as RuleUrgency] : undefined, // Take first urgency for now
      projectTypes: criteria.projectTypes?.map(pt => pt as ProjectType),
      tags: criteria.tags
    };

    const searchResults = await this.rulePoolService.searchRules(searchCriteria);
    return searchResults.rules || [];
  }

  /**
   * Validate basic configuration structure
   */
  private validateBasicStructure(config: ModeConfiguration, errors: ValidationError[]): void {
    if (!config.id) {
      errors.push({
        code: 'MISSING_ID',
        message: 'Mode configuration must have an ID',
        path: 'id',
        severity: 'error'
      });
    }

    if (!config.name) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Mode configuration must have a name',
        path: 'name',
        severity: 'error'
      });
    }

    if (!config.metadata) {
      errors.push({
        code: 'MISSING_METADATA',
        message: 'Mode configuration must have metadata',
        path: 'metadata',
        severity: 'error'
      });
    }
  }

  /**
   * Validate rule references
   */
  private async validateRuleReferences(
    config: ModeConfiguration, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): Promise<RuleResolutionResult> {
    const resolvedRules: string[] = [];
    const failedResolutions: FailedRuleResolution[] = [];
    const rulesByCategory: { [category: string]: number } = {};
    const rulesByUrgency: { [urgency: string]: number } = {};

    // Validate copilot instructions rules
    if (config.rules?.copilotInstructions) {
      try {
        const rules = await this.resolveRules(config.rules.copilotInstructions.selection);
        rules.forEach(rule => {
          resolvedRules.push(rule.id);
          rulesByCategory[rule.category] = (rulesByCategory[rule.category] || 0) + 1;
          rulesByUrgency[rule.urgency] = (rulesByUrgency[rule.urgency] || 0) + 1;
        });
      } catch (error) {
        failedResolutions.push({
          criteria: config.rules.copilotInstructions.selection,
          reason: `Failed to resolve copilot instructions rules: ${error}`,
          suggestions: []
        });
      }
    }

    // Validate project rules
    if (config.rules?.projectRules) {
      try {
        const rules = await this.resolveRules(config.rules.projectRules.selection);
        rules.forEach(rule => {
          if (!resolvedRules.includes(rule.id)) {
            resolvedRules.push(rule.id);
            rulesByCategory[rule.category] = (rulesByCategory[rule.category] || 0) + 1;
            rulesByUrgency[rule.urgency] = (rulesByUrgency[rule.urgency] || 0) + 1;
          }
        });
      } catch (error) {
        failedResolutions.push({
          criteria: config.rules.projectRules.selection,
          reason: `Failed to resolve project rules: ${error}`,
          suggestions: []
        });
      }
    }

    return {
      resolvedRules,
      failedResolutions,
      totalRules: resolvedRules.length,
      rulesByCategory,
      rulesByUrgency
    };
  }

  /**
   * Validate templates
   */
  private validateTemplates(
    config: ModeConfiguration, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    // Template validation logic
    if (!config.templates?.baseTemplate) {
      warnings.push({
        code: 'MISSING_BASE_TEMPLATE',
        message: 'No base template specified, using default',
        path: 'templates.baseTemplate'
      });
    }
  }

  /**
   * Validate structure configuration
   */
  private validateStructure(
    config: ModeConfiguration, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    // Structure validation logic
    if (!config.structure?.directories || config.structure.directories.length === 0) {
      warnings.push({
        code: 'NO_DIRECTORIES',
        message: 'No directories specified in structure',
        path: 'structure.directories'
      });
    }
  }

  /**
   * Validate deployment configuration
   */
  private validateDeployment(
    config: ModeConfiguration, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    // Deployment validation logic
    if (!config.deployment?.structure) {
      errors.push({
        code: 'MISSING_DEPLOYMENT_STRUCTURE',
        message: 'Deployment structure must be specified',
        path: 'deployment.structure',
        severity: 'error'
      });
    }
  }

  /**
   * Generate a unique mode ID
   */
  private generateModeId(): string {
    return `mode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear configuration cache
   */
  private clearCache(): void {
    this.configCache.clear();
    this.validationCache.clear();
  }
}
