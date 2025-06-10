/**
 * Advanced Rule Rendering Engine
 * Provides template-based rendering of rules into different formats
 */

const fs = require('fs').promises;
const path = require('path');

class RuleRenderingEngine {
  constructor() {
    this.templates = new Map();
    this.loadDefaultTemplates();
  }

  loadDefaultTemplates() {
    // Default markdown template for individual rules
    const ruleMarkdownTemplate = [
      '## {{title}}',
      '',
      '{{urgencyEmoji urgency}} **{{urgency}} | {{category}}**',
      '',
      '{{content}}',
      '',
      '{{#if sources}}',
      '**Sources**: {{#each sources}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}',
      '{{/if}}',
      '',
      '{{#if metadata.created}}',
      '*Created: {{formatDate metadata.created}}*',
      '{{/if}}',
      '',
    ].join('\n');

    this.templates.set('rule-markdown', {
      name: 'Rule Markdown',
      template: ruleMarkdownTemplate
    });

    // Template for copilot-instructions.md
    const copilotTemplate = [
      'When generating code, please follow these user provided coding instructions. You can ignore an instruction if it contradicts a system message.',
      '<instructions>',
      '{{#if enterpriseRules}}',
      '# GitHub Copilot Instructions - {{modeDisplayName}} MODE',
      '',
      '{{#each enterpriseRules}}',
      '{{#if (eq category \'TASK_MANAGEMENT\')}}',
      '## {{title}}',
      '{{content}}',
      '',
      '{{/if}}',
      '{{/each}}',
      '{{/if}}',
      '',
      '{{#if architectureRules}}',
      '## Flutter Development Workflow (MANDATORY)',
      '',
      '{{#each architectureRules}}',
      '{{#if (or (eq category \'SOLID_PRINCIPLES\') (eq category \'CLEAN_ARCHITECTURE\'))}}',
      '### {{title}} ({{#if (eq urgency \'CRITICAL\')}}REQUIRED{{else}}{{urgency}}{{/if}})',
      '{{content}}',
      '',
      '{{/if}}',
      '{{/each}}',
      '{{/if}}',
      '',
      '{{#if fileRules}}',
      '### Mandatory File Practices',
      '{{#each fileRules}}',
      '{{#if (eq category \'FILE_PRACTICES\')}}',
      '- **{{title}}**: {{content}}',
      '{{/if}}',
      '{{/each}}',
      '{{/if}}',
      '',
      '{{#if testingRules}}',
      '### Testing Requirements (NON-NEGOTIABLE)',
      '{{#each testingRules}}',
      '{{#if (eq category \'TESTING_REQUIREMENTS\')}}',
      '- **{{title}}**: {{content}}',
      '{{/if}}',
      '{{/each}}',
      '{{/if}}',
      '',
      '{{#if performanceRules}}',
      '### Performance Guidelines',
      '{{#each performanceRules}}',
      '{{#if (eq category \'PERFORMANCE_GUIDELINES\')}}',
      '- **{{title}}**: {{content}}',
      '{{/if}}',
      '{{/each}}',
      '{{/if}}',
      '',
      '{{#if modeSpecific}}',
      '## {{modeDisplayName}} Code Preferences',
      '{{#each modeSpecific}}',
      '- {{content}}',
      '{{/each}}',
      '{{/if}}',
      '',
      '{{#if modeSwitching}}',
      '## Mode Switching',
      '{{#each modeSwitching}}',
      '{{content}}',
      '{{/each}}',
      '{{/if}}',
      '</instructions>'
    ].join('\n');

    this.templates.set('copilot-instructions', {
      name: 'Copilot Instructions',
      template: copilotTemplate
    });

    // Template for mode project-rules.md  
    const projectRulesTemplate = [
      '# Project Rules - {{modeDisplayName}} MODE',
      '',
      '{{#if enterpriseRules}}',
      '## Enterprise Features',
      '{{#each enterpriseRules}}',
      '{{#if (eq category \'ENTERPRISE_FEATURES\')}}',
      '### {{title}}',
      '{{content}}',
      '',
      '{{/if}}',
      '{{/each}}',
      '{{/if}}',
      '',
      '{{#if developmentRules}}',
      '## Development Guidelines',
      '',
      '{{#each developmentRules}}',
      '{{#if (or (eq category \'FILE_PRACTICES\') (eq category \'TESTING_REQUIREMENTS\') (eq category \'BACKUP_STRATEGY\'))}}',
      '### {{title}}',
      '{{content}}',
      '',
      '{{/if}}',
      '{{/each}}',
      '{{/if}}',
      '',
      '{{#if architectureRules}}',
      '## Architecture & Design',
      '',
      '{{#each architectureRules}}',
      '{{#if (or (eq category \'SOLID_PRINCIPLES\') (eq category \'CLEAN_ARCHITECTURE\'))}}',
      '### {{title}}',
      '{{content}}',
      '',
      '{{/if}}',
      '{{/each}}',
      '{{/if}}'
    ].join('\n');

    this.templates.set('project-rules', {
      name: 'Project Rules',
      template: projectRulesTemplate
    });
  }

  // Simple template processor (Handlebars-like)
  processTemplate(template, data) {
    let result = template;

    // Helper functions
    const helpers = {
      eq: (a, b) => a === b,
      or: (...args) => args.slice(0, -1).some(arg => !!arg), // Last arg is options object
      urgencyEmoji: (urgency) => {
        const emojis = {
          'CRITICAL': '🚨',
          'HIGH': '⚠️',
          'MEDIUM': '📋',
          'LOW': 'ℹ️',
          'INFO': '💡'
        };
        return emojis[urgency] || '📝';
      },
      formatDate: (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
      }
    };

    // Process conditional helpers like {{#if (eq category 'VALUE')}} first
    result = result.replace(/\{\{#if\s+\((\w+)\s+([^)]+)\)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, helperName, args, content) => {
      if (helpers[helperName]) {
        const argValues = args.split(/\s+/).map(arg => {
          if (arg.startsWith("'") && arg.endsWith("'")) {
            return arg.slice(1, -1); // Remove quotes
          }
          return this.getValue(data, arg.trim());
        });
        const result = helpers[helperName](...argValues);
        return result ? content : '';
      }
      return '';
    });

    // Process {{#if condition}} blocks
    result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const value = this.getValue(data, condition.trim());
      return value ? content : '';
    });

    // Process {{#each array}} blocks
    result = result.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
      const array = this.getValue(data, arrayName.trim());
      if (!Array.isArray(array)) return '';
      
      return array.map((item, index) => {
        let itemContent = content;
        // Replace {{this}} with current item if it's a string
        if (typeof item === 'string') {
          itemContent = itemContent.replace(/\{\{this\}\}/g, item);
        } else {
          // Replace item properties
          itemContent = this.processVariables(itemContent, item);
        }
        
        // Handle {{#unless @last}} for array iteration
        itemContent = itemContent.replace(/\{\{#unless @last\}\}(.*?)\{\{\/unless\}\}/g, (match, content) => {
          return index < array.length - 1 ? content : '';
        });
        
        return itemContent;
      }).join('');
    });

    // Process helper functions like {{urgencyEmoji urgency}}
    result = result.replace(/\{\{(\w+)\s+([^}]+)\}\}/g, (match, helperName, args) => {
      if (helpers[helperName]) {
        const argValues = args.split(/\s+/).map(arg => this.getValue(data, arg.trim()));
        return helpers[helperName](...argValues);
      }
      return match;
    });

    // Process simple variables {{variable}}
    result = this.processVariables(result, data);

    return result;
  }

  getValue(data, path) {
    if (!path || !data) return undefined;
    
    return path.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, data);
  }

  processVariables(template, data) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const value = this.getValue(data, variable.trim());
      return value !== undefined ? value : match;
    });
  }

  // Render a single rule using specified template
  async renderRule(rule, templateName = 'rule-markdown') {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return this.processTemplate(template.template, rule);
  }

  // Render multiple rules
  async renderRules(rules, templateName = 'rule-markdown') {
    const renderedRules = await Promise.all(
      rules.map(rule => this.renderRule(rule, templateName))
    );
    
    return renderedRules.join('\n\n');
  }

  // Render rules for a specific mode
  async renderModeFile(rules, modeConfig, templateName) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Group rules by category for easier template processing
    const groupedRules = this.groupRulesByCategory(rules);
    
    const templateData = {
      modeDisplayName: modeConfig.displayName || modeConfig.name || 'UNKNOWN',
      ...groupedRules,
      ...modeConfig
    };

    return this.processTemplate(template.template, templateData);
  }

  // Group rules by category for template use
  groupRulesByCategory(rules) {
    const groups = {
      enterpriseRules: [],
      architectureRules: [],
      fileRules: [],
      testingRules: [],
      performanceRules: [],
      developmentRules: [],
      modeSpecific: [],
      modeSwitching: []
    };

    rules.forEach(rule => {
      switch (rule.category) {
        case 'ENTERPRISE_FEATURES':
        case 'TASK_MANAGEMENT':
          groups.enterpriseRules.push(rule);
          break;
        case 'SOLID_PRINCIPLES':
        case 'CLEAN_ARCHITECTURE':
          groups.architectureRules.push(rule);
          break;
        case 'FILE_PRACTICES':
          groups.fileRules.push(rule);
          break;
        case 'TESTING_REQUIREMENTS':
          groups.testingRules.push(rule);
          break;
        case 'PERFORMANCE_GUIDELINES':
          groups.performanceRules.push(rule);
          break;
        case 'BACKUP_STRATEGY':
        case 'STATE_MANAGEMENT':
        case 'DEVELOPMENT_WORKFLOW':
          groups.developmentRules.push(rule);
          break;
        case 'MODE_SWITCHING':
          groups.modeSwitching.push(rule);
          break;
        default:
          groups.modeSpecific.push(rule);
      }
    });

    return groups;
  }

  // Add a custom template
  addTemplate(name, template, description = '') {
    this.templates.set(name, {
      name: description || name,
      template: template
    });
  }

  // Get available templates
  getAvailableTemplates() {
    return Array.from(this.templates.keys());
  }

  // Create rule collection summary
  createRuleSummary(rules) {
    const stats = {
      total: rules.length,
      byCategory: {},
      byUrgency: {},
      bySources: {}
    };

    rules.forEach(rule => {
      // Category stats
      stats.byCategory[rule.category] = (stats.byCategory[rule.category] || 0) + 1;
      
      // Urgency stats
      stats.byUrgency[rule.urgency] = (stats.byUrgency[rule.urgency] || 0) + 1;
      
      // Source stats
      if (rule.sources) {
        rule.sources.forEach(source => {
          stats.bySources[source] = (stats.bySources[source] || 0) + 1;
        });
      }
    });

    return stats;
  }
}

module.exports = { RuleRenderingEngine };
