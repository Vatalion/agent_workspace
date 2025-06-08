/**
 * Standalone Rule Extraction Service for Testing
 * Version without VS Code dependencies
 */

const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const RuleCategory = {
  TASK_MANAGEMENT: 'TASK_MANAGEMENT',
  ENTERPRISE_FEATURES: 'ENTERPRISE_FEATURES',
  SOLID_PRINCIPLES: 'SOLID_PRINCIPLES',
  CLEAN_ARCHITECTURE: 'CLEAN_ARCHITECTURE',
  FILE_PRACTICES: 'FILE_PRACTICES',
  TESTING_REQUIREMENTS: 'TESTING_REQUIREMENTS',
  BACKUP_STRATEGY: 'BACKUP_STRATEGY',
  STATE_MANAGEMENT: 'STATE_MANAGEMENT',
  PERFORMANCE_GUIDELINES: 'PERFORMANCE_GUIDELINES',
  REFACTORING_GUIDELINES: 'REFACTORING_GUIDELINES',
  SECURITY_RULES: 'SECURITY_RULES',
  DEVELOPMENT_WORKFLOW: 'DEVELOPMENT_WORKFLOW',
  MODE_SWITCHING: 'MODE_SWITCHING',
  CUSTOM: 'CUSTOM'
};

const RuleUrgency = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

class StandaloneRuleExtractionService {
  constructor(basePath) {
    this.basePath = basePath || __dirname;
  }

  detectRuleCategory(title, content) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    const combined = `${titleLower} ${contentLower}`;

    // Category detection patterns
    if (combined.includes('task') && combined.includes('management')) return RuleCategory.TASK_MANAGEMENT;
    if (combined.includes('enterprise') && combined.includes('feature')) return RuleCategory.ENTERPRISE_FEATURES;
    if (combined.includes('solid') && combined.includes('principle')) return RuleCategory.SOLID_PRINCIPLES;
    if (combined.includes('clean') && combined.includes('architecture')) return RuleCategory.CLEAN_ARCHITECTURE;
    if (combined.includes('file') && (combined.includes('practice') || combined.includes('organization'))) return RuleCategory.FILE_PRACTICES;
    if (combined.includes('test') && combined.includes('requirement')) return RuleCategory.TESTING_REQUIREMENTS;
    if (combined.includes('backup') && combined.includes('strategy')) return RuleCategory.BACKUP_STRATEGY;
    if (combined.includes('state') && combined.includes('management')) return RuleCategory.STATE_MANAGEMENT;
    if (combined.includes('performance') && combined.includes('guideline')) return RuleCategory.PERFORMANCE_GUIDELINES;
    if (combined.includes('refactor') && combined.includes('guideline')) return RuleCategory.REFACTORING_GUIDELINES;
    if (combined.includes('security') && combined.includes('rule')) return RuleCategory.SECURITY_RULES;
    if (combined.includes('development') && combined.includes('workflow')) return RuleCategory.DEVELOPMENT_WORKFLOW;
    if (combined.includes('mode') && combined.includes('switch')) return RuleCategory.MODE_SWITCHING;

    return RuleCategory.CUSTOM;
  }

  detectRuleUrgency(title, content) {
    const combined = `${title} ${content}`.toLowerCase();

    // Critical indicators
    if (combined.includes('critical') || combined.includes('mandatory') || 
        combined.includes('required') || combined.includes('non-negotiable') ||
        combined.includes('enforced') || combined.includes('never skip')) {
      return RuleUrgency.CRITICAL;
    }

    // High indicators  
    if (combined.includes('important') || combined.includes('essential') ||
        combined.includes('must') || combined.includes('always')) {
      return RuleUrgency.HIGH;
    }

    // Low indicators
    if (combined.includes('optional') || combined.includes('consider') ||
        combined.includes('prefer') || combined.includes('suggestion')) {
      return RuleUrgency.LOW;
    }

    // Info indicators
    if (combined.includes('note') || combined.includes('info') ||
        combined.includes('overview') || combined.includes('context')) {
      return RuleUrgency.INFO;
    }

    // Default to medium
    return RuleUrgency.MEDIUM;
  }

  isRuleSection(title, content) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();

    // Skip sections that are clearly not rules
    if (titleLower.includes('overview') || titleLower.includes('context') ||
        titleLower.includes('available') || titleLower.includes('structure') ||
        titleLower.includes('features') && !titleLower.includes('rule') ||
        contentLower.length < 50) {
      return false;
    }

    // Include sections that look like rules
    if (titleLower.includes('rule') || titleLower.includes('requirement') ||
        titleLower.includes('practice') || titleLower.includes('guideline') ||
        titleLower.includes('principle') || titleLower.includes('standard') ||
        titleLower.includes('workflow') || titleLower.includes('strategy') ||
        titleLower.includes('management') || titleLower.includes('mandatory') ||
        titleLower.includes('critical') || titleLower.includes('switching')) {
      return true;
    }

    // Check for rule-like content patterns
    const rulePatterns = [
      /must\s+/i, /should\s+/i, /always\s+/i, /never\s+/i,
      /required\s+/i, /mandatory\s+/i, /enforced\s+/i,
      /follow\s+/i, /use\s+/i, /implement\s+/i
    ];

    return rulePatterns.some(pattern => pattern.test(contentLower));
  }

  parseMarkdownSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for headers (## or ###)
      const headerMatch = trimmedLine.match(/^(#{2,3})\s+(.+)$/);
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: headerMatch[2].trim(),
          level: headerMatch[1].length,
          content: '',
          lines: []
        };
      } else if (currentSection) {
        // Add content to current section
        currentSection.lines.push(line);
      }
    }

    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // Join content lines for each section
    sections.forEach(section => {
      section.content = section.lines.join('\n').trim();
      delete section.lines;
    });

    return sections;
  }

  async extractRulesFromFile(filePath, mode) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const sections = this.parseMarkdownSections(content);
      const rules = [];

      for (const section of sections) {
        if (this.isRuleSection(section.title, section.content)) {
          const rule = {
            id: uuidv4(),
            title: section.title,
            content: section.content,
            category: this.detectRuleCategory(section.title, section.content),
            urgency: this.detectRuleUrgency(section.title, section.content),
            sources: [`${mode}/${path.basename(filePath)}`],
            projectTypes: ['all'],
            contentType: 'markdown',
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
          };

          rules.push(rule);
        }
      }

      return rules;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return [];
    }
  }

  async extractAllRulesFromMode(mode) {
    const allRules = [];
    const modeBasePath = path.join(this.basePath, 'templates', 'modes', mode);

    const files = ['copilot-instructions.md', 'project-rules.md'];

    for (const file of files) {
      const filePath = path.join(modeBasePath, file);
      try {
        const rules = await this.extractRulesFromFile(filePath, mode);
        allRules.push(...rules);
      } catch (error) {
        console.error(`Error extracting rules from ${filePath}:`, error);
      }
    }

    return allRules;
  }
}

module.exports = { StandaloneRuleExtractionService };
