/**
 * Standalone Mode Configuration Service
 * VS Code-independent version for testing
 */

const fs = require('fs').promises;
const path = require('path');

// Import our standalone rule pool service
const { StandaloneRulePoolService } = require('./standaloneRulePoolService');

class StandaloneModeConfigurationService {
  constructor(rulePoolService) {
    this.rulePoolService = rulePoolService;
    this.configCache = new Map();
    this.validationCache = new Map();
  }

  /**
   * Load a mode configuration from file
   */
  async loadModeConfiguration(configPath, options = {}) {
    try {
      // Check cache first
      const cacheKey = `${configPath}_${JSON.stringify(options)}`;
      if (this.configCache.has(cacheKey)) {
        return this.configCache.get(cacheKey);
      }

      // Read configuration file
      const configContent = await fs.readFile(configPath, 'utf-8');
      let config;

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
  async validateModeConfiguration(config) {
    const errors = [];
    const warnings = [];

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

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      ruleResolution
    };
  }

  /**
   * Create a new mode configuration from a predefined template
   */
  createModeConfiguration(type, customizations = {}) {
    const defaults = this.getModeDefaults();
    const baseConfig = defaults[type] || defaults.custom;

    const config = {
      ...baseConfig,
      ...customizations,
      id: customizations.id || this.generateModeId(),
      metadata: {
        ...baseConfig.metadata,
        ...customizations.metadata,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };

    return config;
  }

  /**
   * Save a mode configuration to file
   */
  async saveModeConfiguration(config, targetPath) {
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
      await fs.mkdir(dir, { recursive: true });

      // Write configuration
      const content = JSON.stringify(config, null, 2);
      await fs.writeFile(targetPath, content, 'utf-8');

      // Clear cache
      this.clearCache();

    } catch (error) {
      throw new Error(`Failed to save mode configuration to ${targetPath}: ${error}`);
    }
  }

  /**
   * Resolve rules based on selection criteria
   */
  async resolveRules(selection) {
    const rules = await this.rulePoolService.getAllRules();
    let selectedRules = Object.values(rules);

    // Apply include criteria
    if (selection.include) {
      const includeRules = new Set();
      for (const criteria of selection.include) {
        const foundRules = await this.findRulesByCriteria(criteria);
        foundRules.forEach(rule => includeRules.add(rule.id));
      }
      if (includeRules.size > 0) {
        selectedRules = selectedRules.filter(rule => includeRules.has(rule.id));
      }
    }

    // Apply explicit includes
    if (selection.explicitIncludes) {
      const explicitSet = new Set(selection.explicitIncludes);
      selectedRules = selectedRules.filter(rule => explicitSet.has(rule.id));
    }

    // Apply exclude criteria
    if (selection.exclude) {
      const excludeRules = new Set();
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
   * Get predefined mode defaults
   */
  getModeDefaults() {
    return {
      enterprise: {
        name: 'Enterprise Mode',
        description: 'Full-featured enterprise development environment with comprehensive task management',
        metadata: {
          version: '1.0.0',
          projectTypes: ['flutter', 'typescript', 'javascript'],
          complexity: 'enterprise',
          estimatedHours: { min: 50, max: 500 },
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
      hybrid: {
        name: 'Hybrid Mode',
        description: 'Balanced approach combining simplified workflows with selected enterprise features',
        metadata: {
          version: '1.0.0',
          projectTypes: ['flutter', 'typescript', 'javascript'],
          complexity: 'medium',
          estimatedHours: { min: 20, max: 50 },
          tags: ['hybrid', 'flexible', 'configurable']
        },
        rules: {
          copilotInstructions: {
            selection: {
              include: [
                { categories: ['CUSTOM', 'TASK_MANAGEMENT'] },
                { urgency: ['CRITICAL'] }
              ],
              exclude: [
                { categories: ['ENTERPRISE_FEATURES'], urgency: ['LOW'] }
              ]
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
                { categories: ['FILE_PRACTICES', 'CLEAN_ARCHITECTURE'] }
              ],
              minUrgency: 'MEDIUM'
            },
            organization: {
              groupBy: 'category',
              orderBy: 'urgency',
              includeHeaders: false
            }
          }
        },
        structure: {
          directories: [
            { path: '.tasks/current', description: 'Active tasks', required: true },
            { path: '.tasks/completed', description: 'Completed tasks', required: true },
            { path: '.tasks/epics', description: 'Optional epic management', required: false },
            { path: '.tasks/system', description: 'Optional system monitoring', required: false },
            { path: '.tasks/backups', description: 'Flexible backup strategy', required: true }
          ],
          scripts: [],
          automation: []
        },
        templates: {
          baseTemplate: 'hybrid',
          variables: {
            mode: 'HYBRID',
            features: 'Selective automation, Optional cross-machine sync, Flexible monitoring'
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
              structure: ['.tasks/current', '.tasks/completed', '.tasks/epics', '.tasks/system', '.tasks/backups'],
              type: 'hybrid'
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
          tags: ['custom']
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
  applyDefaults(config) {
    return {
      ...config,
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [],
        ...config.metadata
      }
    };
  }

  /**
   * Find rules by criteria
   */
  async findRulesByCriteria(criteria) {
    try {
      const searchCriteria = {
        categories: criteria.categories,
        urgencyLevels: criteria.urgency, // Use urgencyLevels, not urgency
        projectTypes: criteria.projectTypes,
        tags: criteria.tags
      };

      const result = await this.rulePoolService.searchRules(searchCriteria);
      
      // The search result is an object with a rules property
      if (result && result.rules && Array.isArray(result.rules)) {
        return result.rules;
      } else {
        return [];
      }
    } catch (error) {
      console.warn('Error searching rules:', error.message);
      return [];
    }
  }

  /**
   * Validate basic configuration structure
   */
  validateBasicStructure(config, errors) {
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
  async validateRuleReferences(config, errors, warnings) {
    const resolvedRules = [];
    const failedResolutions = [];
    const rulesByCategory = {};
    const rulesByUrgency = {};

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
  validateTemplates(config, errors, warnings) {
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
  validateStructure(config, errors, warnings) {
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
  validateDeployment(config, errors, warnings) {
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
  generateModeId() {
    return `mode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear configuration cache
   */
  clearCache() {
    this.configCache.clear();
    this.validationCache.clear();
  }
}

module.exports = { StandaloneModeConfigurationService };
