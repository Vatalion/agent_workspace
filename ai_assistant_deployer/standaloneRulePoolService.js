/**
 * Standalone Rule Pool Service for Testing
 * Version without VS Code dependencies
 */

const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Import types (we'll define them inline for this test)
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

class StandaloneRulePoolService {
  constructor(extensionPath) {
    this.extensionPath = extensionPath;
    this.poolDataPath = path.join(extensionPath, 'rule-pool.json');
    this.modeConfigsPath = path.join(extensionPath, 'mode-configs.json');
    this.backupPath = path.join(extensionPath, 'backups');
    this.rulePool = this.createEmptyPool();
    this.isInitialized = false;
  }

  createEmptyPool() {
    return {
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalRules: 0,
        description: 'AI Assistant Deployer Rule Pool'
      },
      rules: {},
      categories: Object.values(RuleCategory),
      urgencyLevels: Object.values(RuleUrgency)
    };
  }

  async ensureDataDirectory() {
    const dataDir = path.dirname(this.poolDataPath);
    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.mkdir(this.backupPath, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    await this.ensureDataDirectory();
    
    try {
      await this.loadRulePool();
    } catch (error) {
      // Create new pool if loading fails
      await this.saveRulePool();
    }

    this.isInitialized = true;
  }

  async loadRulePool() {
    try {
      const data = await fs.readFile(this.poolDataPath, 'utf8');
      this.rulePool = JSON.parse(data);
      
      // Ensure required properties
      if (!this.rulePool.rules) this.rulePool.rules = {};
      if (!this.rulePool.metadata) {
        this.rulePool.metadata = this.createEmptyPool().metadata;
      }
    } catch (error) {
      this.rulePool = this.createEmptyPool();
    }
  }

  async saveRulePool() {
    this.rulePool.metadata.lastModified = new Date().toISOString();
    this.rulePool.metadata.totalRules = Object.keys(this.rulePool.rules).length;
    
    const data = JSON.stringify(this.rulePool, null, 2);
    await fs.writeFile(this.poolDataPath, data, 'utf8');
  }

  validateRule(rule) {
    const errors = [];

    if (!rule.title || rule.title.trim().length === 0) {
      errors.push('Rule title is required');
    }

    if (!rule.content || rule.content.trim().length === 0) {
      errors.push('Rule content is required');
    }

    if (!rule.category || !Object.values(RuleCategory).includes(rule.category)) {
      errors.push('Valid rule category is required');
    }

    if (!rule.urgency || !Object.values(RuleUrgency).includes(rule.urgency)) {
      errors.push('Valid rule urgency is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async addRule(rule) {
    await this.initialize();

    const validation = this.validateRule(rule);
    if (!validation.isValid) {
      throw new Error(`Rule validation failed: ${validation.errors.join(', ')}`);
    }

    const ruleId = rule.id || uuidv4();
    const timestamp = new Date().toISOString();

    const processedRule = {
      ...rule,
      id: ruleId,
      created: rule.created || timestamp,
      lastModified: timestamp
    };

    this.rulePool.rules[ruleId] = processedRule;
    await this.saveRulePool();

    return processedRule;
  }

  async getAllRules() {
    await this.initialize();
    return Object.values(this.rulePool.rules);
  }

  async getRule(ruleId) {
    await this.initialize();
    return this.rulePool.rules[ruleId] || null;
  }

  async updateRule(ruleId, updates) {
    await this.initialize();

    const existingRule = this.rulePool.rules[ruleId];
    if (!existingRule) {
      throw new Error(`Rule with ID ${ruleId} not found`);
    }

    const updatedRule = {
      ...existingRule,
      ...updates,
      id: ruleId,
      lastModified: new Date().toISOString()
    };

    const validation = this.validateRule(updatedRule);
    if (!validation.isValid) {
      throw new Error(`Rule validation failed: ${validation.errors.join(', ')}`);
    }

    this.rulePool.rules[ruleId] = updatedRule;
    await this.saveRulePool();

    return updatedRule;
  }

  async deleteRule(ruleId) {
    await this.initialize();

    if (!this.rulePool.rules[ruleId]) {
      throw new Error(`Rule with ID ${ruleId} not found`);
    }

    delete this.rulePool.rules[ruleId];
    await this.saveRulePool();
  }

  async searchRules(criteria) {
    await this.initialize();

    const allRules = Object.values(this.rulePool.rules);
    let filteredRules = allRules;

    // Filter by categories
    if (criteria.categories && criteria.categories.length > 0) {
      filteredRules = filteredRules.filter(rule => 
        criteria.categories.includes(rule.category)
      );
    }

    // Filter by urgency levels
    if (criteria.urgencyLevels && criteria.urgencyLevels.length > 0) {
      filteredRules = filteredRules.filter(rule => 
        criteria.urgencyLevels.includes(rule.urgency)
      );
    }

    // Text search
    if (criteria.searchTerm) {
      const term = criteria.searchTerm.toLowerCase();
      filteredRules = filteredRules.filter(rule => 
        rule.title.toLowerCase().includes(term) ||
        rule.content.toLowerCase().includes(term)
      );
    }

    return {
      rules: filteredRules,
      totalCount: filteredRules.length,
      facets: {
        categories: this.calculateCategoryFacets(filteredRules),
        urgencyLevels: this.calculateUrgencyFacets(filteredRules)
      }
    };
  }

  calculateCategoryFacets(rules) {
    const facets = {};
    rules.forEach(rule => {
      facets[rule.category] = (facets[rule.category] || 0) + 1;
    });
    return facets;
  }

  calculateUrgencyFacets(rules) {
    const facets = {};
    rules.forEach(rule => {
      facets[rule.urgency] = (facets[rule.urgency] || 0) + 1;
    });
    return facets;
  }

  renderRuleAsMarkdown(rule) {
    let markdown = `## ${rule.title}\n\n`;
    
    if (rule.urgency) {
      const urgencyEmoji = {
        CRITICAL: '🚨',
        HIGH: '⚠️',
        MEDIUM: '📋',
        LOW: '💡',
        INFO: 'ℹ️'
      };
      markdown += `**Urgency**: ${urgencyEmoji[rule.urgency]} ${rule.urgency}\n\n`;
    }

    if (rule.category && rule.category !== 'CUSTOM') {
      markdown += `**Category**: ${rule.category}\n\n`;
    }

    markdown += rule.content;

    if (rule.sources && rule.sources.length > 0) {
      markdown += '\n\n**Sources**:\n';
      rule.sources.forEach(source => {
        markdown += `- ${source}\n`;
      });
    }

    return markdown;
  }

  getRulePoolStatistics() {
    const rules = Object.values(this.rulePool.rules);
    
    const byCategory = {};
    const byUrgency = {};
    const bySources = {};

    rules.forEach(rule => {
      // Category stats
      byCategory[rule.category] = (byCategory[rule.category] || 0) + 1;
      
      // Urgency stats
      byUrgency[rule.urgency] = (byUrgency[rule.urgency] || 0) + 1;
      
      // Source stats
      if (rule.sources) {
        rule.sources.forEach(source => {
          bySources[source] = (bySources[source] || 0) + 1;
        });
      }
    });

    return {
      totalRules: rules.length,
      byCategory,
      byUrgency,
      bySources
    };
  }

  async createBackup() {
    await this.initialize();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `rule-pool-backup-${timestamp}.json`;
    const backupFilePath = path.join(this.backupPath, backupFileName);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      rulePool: this.rulePool
    };

    await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
    return backupFilePath;
  }

  async clearRulePool() {
    await this.initialize();
    this.rulePool = this.createEmptyPool();
    await this.saveRulePool();
  }
}

module.exports = { StandaloneRulePoolService };
