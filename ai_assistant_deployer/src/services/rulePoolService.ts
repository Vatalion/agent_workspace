/**
 * Rule Pool Service - Core Rule Pool Architecture Implementation
 * 
 * This service manages the centralized rule pool, providing CRUD operations,
 * validation, searching, and rendering capabilities for the Rule Pool Architecture.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import {
  Rule,
  RulePool,
  RulePoolMetadata,
  ModeConfiguration,
  RuleCategory,
  RuleUrgency,
  RuleContentType,
  ProjectType,
  RuleSearchCriteria,
  RuleSearchResults,
  RuleValidationResult,
  RuleRenderContext,
  RuleExportData,
  RuleStatistics,
  RuleOverride
} from './rulePoolTypes';

export class RulePoolService {
  private rulePool: RulePool;
  private readonly poolDataPath: string;
  private readonly modeConfigsPath: string;
  private readonly backupPath: string;
  private isInitialized: boolean = false;

  constructor(private readonly extensionPath: string) {
    this.poolDataPath = path.join(extensionPath, 'data', 'rule-pool.json');
    this.modeConfigsPath = path.join(extensionPath, 'data', 'mode-configs.json');
    this.backupPath = path.join(extensionPath, 'data', 'backups');
    this.rulePool = this.createEmptyPool();
  }

  /**
   * Initialize the Rule Pool Service
   */
  async initialize(): Promise<void> {
    try {
      // Ensure data directories exist
      await this.ensureDataDirectories();
      
      // Load existing rule pool or create new one
      await this.loadRulePool();
      
      // Validate rule pool integrity
      const validationResult = await this.validateRulePool();
      if (!validationResult.isValid) {
        vscode.window.showWarningMessage(
          `Rule pool validation found ${validationResult.errors.length} errors. Check output for details.`
        );
      }
      
      this.isInitialized = true;
      console.log('Rule Pool Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Rule Pool Service:', error);
      throw new Error(`Rule Pool Service initialization failed: ${error}`);
    }
  }

  /**
   * Create a new rule in the pool
   */
  async createRule(ruleData: Partial<Rule>): Promise<Rule> {
    this.ensureInitialized();
    
    const rule: Rule = {
      id: ruleData.id || uuidv4(),
      title: ruleData.title || 'Untitled Rule',
      description: ruleData.description || '',
      category: ruleData.category || RuleCategory.CUSTOM,
      urgency: ruleData.urgency || RuleUrgency.MEDIUM,
      version: ruleData.version || '1.0.0',
      content: ruleData.content || '',
      contentType: ruleData.contentType || RuleContentType.MARKDOWN,
      tags: ruleData.tags || [],
      appliesTo: ruleData.appliesTo || [ProjectType.ALL],
      createdAt: new Date(),
      updatedAt: new Date(),
      author: ruleData.author || 'System',
      isCustom: ruleData.isCustom ?? true,
      isActive: ruleData.isActive ?? true,
      sourceFile: ruleData.sourceFile,
      sourceSection: ruleData.sourceSection,
      sourceModes: ruleData.sourceModes,
      dependsOn: ruleData.dependsOn || [],
      conflicts: ruleData.conflicts || [],
      supersedes: ruleData.supersedes || [],
      validationRules: ruleData.validationRules || [],
      constraints: ruleData.constraints || []
    };

    // Validate the rule
    const validationResult = await this.validateRule(rule);
    if (!validationResult.isValid) {
      throw new Error(`Rule validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Add to pool
    this.rulePool.rules.set(rule.id, rule);
    this.updatePoolIndices(rule);
    this.updatePoolMetadata();

    // Save to disk
    await this.saveRulePool();

    return rule;
  }

  /**
   * Update an existing rule
   */
  async updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule> {
    this.ensureInitialized();
    
    const existingRule = this.rulePool.rules.get(ruleId);
    if (!existingRule) {
      throw new Error(`Rule with ID ${ruleId} not found`);
    }

    const updatedRule: Rule = {
      ...existingRule,
      ...updates,
      id: ruleId, // Ensure ID cannot be changed
      updatedAt: new Date()
    };

    // Validate the updated rule
    const validationResult = await this.validateRule(updatedRule);
    if (!validationResult.isValid) {
      throw new Error(`Rule validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Update in pool
    this.rulePool.rules.set(ruleId, updatedRule);
    this.updatePoolIndices(updatedRule);
    this.updatePoolMetadata();

    // Save to disk
    await this.saveRulePool();

    return updatedRule;
  }

  /**
   * Delete a rule from the pool
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    this.ensureInitialized();
    
    const rule = this.rulePool.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    // Check for dependencies
    const dependentRules = this.findRulesDependingOn(ruleId);
    if (dependentRules.length > 0) {
      throw new Error(`Cannot delete rule ${ruleId}: ${dependentRules.length} rules depend on it`);
    }

    // Remove from pool
    this.rulePool.rules.delete(ruleId);
    this.removeFromIndices(rule);
    this.updatePoolMetadata();

    // Save to disk
    await this.saveRulePool();

    return true;
  }

  /**
   * Get a rule by ID
   */
  getRule(ruleId: string): Rule | undefined {
    this.ensureInitialized();
    return this.rulePool.rules.get(ruleId);
  }

  /**
   * Get all rules
   */
  getAllRules(): Rule[] {
    this.ensureInitialized();
    return Array.from(this.rulePool.rules.values());
  }

  /**
   * Search rules with criteria
   */
  searchRules(criteria: RuleSearchCriteria): RuleSearchResults {
    this.ensureInitialized();
    
    let rules = Array.from(this.rulePool.rules.values());

    // Apply filters
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      rules = rules.filter(rule => 
        rule.title.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.content.toLowerCase().includes(query) ||
        rule.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (criteria.categories && criteria.categories.length > 0) {
      rules = rules.filter(rule => criteria.categories!.includes(rule.category));
    }

    if (criteria.urgencies && criteria.urgencies.length > 0) {
      rules = rules.filter(rule => criteria.urgencies!.includes(rule.urgency));
    }

    if (criteria.tags && criteria.tags.length > 0) {
      rules = rules.filter(rule => 
        criteria.tags!.some(tag => rule.tags.includes(tag))
      );
    }

    if (criteria.projectTypes && criteria.projectTypes.length > 0) {
      rules = rules.filter(rule => 
        rule.appliesTo.includes(ProjectType.ALL) ||
        criteria.projectTypes!.some(type => rule.appliesTo.includes(type))
      );
    }

    if (criteria.isCustom !== undefined) {
      rules = rules.filter(rule => rule.isCustom === criteria.isCustom);
    }

    if (criteria.isActive !== undefined) {
      rules = rules.filter(rule => rule.isActive === criteria.isActive);
    }

    if (criteria.author) {
      rules = rules.filter(rule => rule.author === criteria.author);
    }

    // Generate facets
    const facets = {
      categories: new Map<RuleCategory, number>(),
      urgencies: new Map<RuleUrgency, number>(),
      tags: new Map<string, number>(),
      projectTypes: new Map<ProjectType, number>()
    };

    rules.forEach(rule => {
      // Categories
      facets.categories.set(rule.category, (facets.categories.get(rule.category) || 0) + 1);
      
      // Urgencies
      facets.urgencies.set(rule.urgency, (facets.urgencies.get(rule.urgency) || 0) + 1);
      
      // Tags
      rule.tags.forEach(tag => {
        facets.tags.set(tag, (facets.tags.get(tag) || 0) + 1);
      });
      
      // Project types
      rule.appliesTo.forEach(type => {
        facets.projectTypes.set(type, (facets.projectTypes.get(type) || 0) + 1);
      });
    });

    return {
      rules,
      totalCount: rules.length,
      facets
    };
  }

  /**
   * Render rules to markdown based on context
   */
  async renderRules(ruleIds: string[], context: RuleRenderContext): Promise<string> {
    this.ensureInitialized();
    
    const rules = ruleIds.map(id => this.rulePool.rules.get(id)).filter(Boolean) as Rule[];
    
    if (rules.length === 0) {
      return '<!-- No rules to render -->';
    }

    // Apply rule overrides from mode configuration
    const processedRules = rules.map(rule => {
      const override = context.mode.ruleOverrides.get(rule.id);
      if (!override) return rule;

      return {
        ...rule,
        title: override.title || rule.title,
        content: override.content || rule.content,
        urgency: override.urgency || rule.urgency,
        tags: override.tags ? [...rule.tags, ...override.tags] : rule.tags
      };
    }).filter(rule => {
      const override = context.mode.ruleOverrides.get(rule.id);
      return !override?.isDisabled;
    });

    // Sort and group rules
    let sortedRules = processedRules;
    if (context.sortByUrgency) {
      const urgencyOrder = [RuleUrgency.CRITICAL, RuleUrgency.HIGH, RuleUrgency.MEDIUM, RuleUrgency.LOW, RuleUrgency.INFO];
      sortedRules = sortedRules.sort((a, b) => urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency));
    }

    // Generate markdown
    const sections: string[] = [];
    
    if (context.groupByCategory) {
      const rulesByCategory = new Map<RuleCategory, Rule[]>();
      sortedRules.forEach(rule => {
        if (!rulesByCategory.has(rule.category)) {
          rulesByCategory.set(rule.category, []);
        }
        rulesByCategory.get(rule.category)!.push(rule);
      });

      for (const [category, categoryRules] of rulesByCategory) {
        sections.push(`## ${this.formatCategoryName(category)}`);
        sections.push('');
        
        categoryRules.forEach(rule => {
          sections.push(this.renderSingleRule(rule, context));
          sections.push('');
        });
      }
    } else {
      sortedRules.forEach(rule => {
        sections.push(this.renderSingleRule(rule, context));
        sections.push('');
      });
    }

    return sections.join('\n').trim();
  }

  /**
   * Get rule pool statistics
   */
  getStatistics(): RuleStatistics {
    this.ensureInitialized();
    
    const rules = Array.from(this.rulePool.rules.values());
    
    const rulesByCategory = new Map<RuleCategory, number>();
    const rulesByUrgency = new Map<RuleUrgency, number>();
    const rulesByProjectType = new Map<ProjectType, number>();
    const tagCounts = new Map<string, number>();

    rules.forEach(rule => {
      // Categories
      rulesByCategory.set(rule.category, (rulesByCategory.get(rule.category) || 0) + 1);
      
      // Urgencies
      rulesByUrgency.set(rule.urgency, (rulesByUrgency.get(rule.urgency) || 0) + 1);
      
      // Project types
      rule.appliesTo.forEach(type => {
        rulesByProjectType.set(type, (rulesByProjectType.get(type) || 0) + 1);
      });
      
      // Tags
      rule.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const mostUsedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const recentlyUpdated = rules
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10);

    return {
      totalRules: rules.length,
      rulesByCategory,
      rulesByUrgency,
      rulesByProjectType,
      customRules: rules.filter(r => r.isCustom).length,
      predefinedRules: rules.filter(r => !r.isCustom).length,
      activeRules: rules.filter(r => r.isActive).length,
      inactiveRules: rules.filter(r => !r.isActive).length,
      mostUsedTags,
      recentlyUpdated
    };
  }

  /**
   * Export rules to JSON format
   */
  async exportRules(ruleIds?: string[], includeModes: boolean = false): Promise<RuleExportData> {
    this.ensureInitialized();
    
    const rulesToExport = ruleIds 
      ? ruleIds.map(id => this.rulePool.rules.get(id)).filter(Boolean) as Rule[]
      : Array.from(this.rulePool.rules.values());

    const exportData: RuleExportData = {
      version: '1.0.0',
      exportedAt: new Date(),
      rules: rulesToExport,
      metadata: {
        source: 'rule-pool-service',
        totalRules: rulesToExport.length,
        totalModes: 0
      }
    };

    if (includeModes) {
      // TODO: Load and include mode configurations
      exportData.modes = [];
      exportData.metadata.totalModes = 0;
    }

    return exportData;
  }

  // Private helper methods

  private createEmptyPool(): RulePool {
    return {
      rules: new Map(),
      categories: new Map(),
      tags: new Map(),
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date(),
        totalRules: 0,
        customRules: 0,
        predefinedRules: 0,
        source: 'fresh'
      }
    };
  }

  private async ensureDataDirectories(): Promise<void> {
    const dataDir = path.dirname(this.poolDataPath);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(this.backupPath, { recursive: true });
  }

  private async loadRulePool(): Promise<void> {
    try {
      const data = await fs.readFile(this.poolDataPath, 'utf8');
      const poolData = JSON.parse(data);
      
      // Convert Map structures back from JSON
      this.rulePool = {
        rules: new Map(Object.entries(poolData.rules)),
        categories: new Map(Object.entries(poolData.categories).map(([k, v]) => [k as RuleCategory, v as string[]])),
        tags: new Map(Object.entries(poolData.tags)),
        metadata: poolData.metadata
      };
      
      // Convert date strings back to Date objects
      this.rulePool.rules.forEach(rule => {
        rule.createdAt = new Date(rule.createdAt);
        rule.updatedAt = new Date(rule.updatedAt);
      });
      
      this.rulePool.metadata.lastUpdated = new Date(this.rulePool.metadata.lastUpdated);
      
    } catch (error) {
      console.log('No existing rule pool found, creating new one');
      this.rulePool = this.createEmptyPool();
    }
  }

  private async saveRulePool(): Promise<void> {
    // Create backup before saving
    await this.createBackup();
    
    // Convert Map structures to JSON-serializable format
    const poolData = {
      rules: Object.fromEntries(this.rulePool.rules),
      categories: Object.fromEntries(this.rulePool.categories),
      tags: Object.fromEntries(this.rulePool.tags),
      metadata: this.rulePool.metadata
    };
    
    await fs.writeFile(this.poolDataPath, JSON.stringify(poolData, null, 2));
  }

  private async createBackup(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupPath, `rule-pool-${timestamp}.json`);
      
      if (await fs.access(this.poolDataPath).then(() => true).catch(() => false)) {
        const data = await fs.readFile(this.poolDataPath);
        await fs.writeFile(backupFile, data);
      }
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }

  private updatePoolIndices(rule: Rule): void {
    // Update category index
    if (!this.rulePool.categories.has(rule.category)) {
      this.rulePool.categories.set(rule.category, []);
    }
    const categoryRules = this.rulePool.categories.get(rule.category)!;
    if (!categoryRules.includes(rule.id)) {
      categoryRules.push(rule.id);
    }

    // Update tag indices
    rule.tags.forEach(tag => {
      if (!this.rulePool.tags.has(tag)) {
        this.rulePool.tags.set(tag, []);
      }
      const tagRules = this.rulePool.tags.get(tag)!;
      if (!tagRules.includes(rule.id)) {
        tagRules.push(rule.id);
      }
    });
  }

  private removeFromIndices(rule: Rule): void {
    // Remove from category index
    const categoryRules = this.rulePool.categories.get(rule.category);
    if (categoryRules) {
      const index = categoryRules.indexOf(rule.id);
      if (index > -1) {
        categoryRules.splice(index, 1);
      }
      if (categoryRules.length === 0) {
        this.rulePool.categories.delete(rule.category);
      }
    }

    // Remove from tag indices
    rule.tags.forEach(tag => {
      const tagRules = this.rulePool.tags.get(tag);
      if (tagRules) {
        const index = tagRules.indexOf(rule.id);
        if (index > -1) {
          tagRules.splice(index, 1);
        }
        if (tagRules.length === 0) {
          this.rulePool.tags.delete(tag);
        }
      }
    });
  }

  private updatePoolMetadata(): void {
    const rules = Array.from(this.rulePool.rules.values());
    this.rulePool.metadata = {
      ...this.rulePool.metadata,
      lastUpdated: new Date(),
      totalRules: rules.length,
      customRules: rules.filter(r => r.isCustom).length,
      predefinedRules: rules.filter(r => !r.isCustom).length
    };
  }

  private async validateRule(rule: Rule): Promise<RuleValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Basic validation
    if (!rule.title.trim()) {
      errors.push({ field: 'title', message: 'Title cannot be empty', code: 'REQUIRED' });
    }

    if (!rule.content.trim()) {
      errors.push({ field: 'content', message: 'Content cannot be empty', code: 'REQUIRED' });
    }

    if (rule.appliesTo.length === 0) {
      warnings.push({ field: 'appliesTo', message: 'Rule applies to no project types', code: 'EMPTY_APPLIES_TO' });
    }

    // TODO: Add more validation rules

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validateRulePool(): Promise<RuleValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check for duplicate IDs (shouldn't happen with Map, but just in case)
    const ids = Array.from(this.rulePool.rules.keys());
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push({ field: 'rules', message: 'Duplicate rule IDs detected', code: 'DUPLICATE_IDS' });
    }

    // Validate individual rules
    for (const rule of this.rulePool.rules.values()) {
      const ruleValidation = await this.validateRule(rule);
      errors.push(...ruleValidation.errors);
      warnings.push(...ruleValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private findRulesDependingOn(ruleId: string): Rule[] {
    return Array.from(this.rulePool.rules.values()).filter(rule => 
      rule.dependsOn?.includes(ruleId)
    );
  }

  private renderSingleRule(rule: Rule, context: RuleRenderContext): string {
    const sections: string[] = [];
    
    // Title with urgency indicator
    const urgencyIndicator = this.getUrgencyIndicator(rule.urgency);
    sections.push(`### ${urgencyIndicator} ${rule.title}`);
    
    // Description if available
    if (rule.description) {
      sections.push(rule.description);
      sections.push('');
    }
    
    // Main content
    sections.push(rule.content);
    
    // Metadata if requested
    if (context.includeMetadata) {
      sections.push('');
      sections.push(`*Category: ${this.formatCategoryName(rule.category)} | Urgency: ${rule.urgency} | Tags: ${rule.tags.join(', ') || 'None'}*`);
    }
    
    return sections.join('\n');
  }

  private getUrgencyIndicator(urgency: RuleUrgency): string {
    switch (urgency) {
      case RuleUrgency.CRITICAL: return '🚨';
      case RuleUrgency.HIGH: return '⚠️';
      case RuleUrgency.MEDIUM: return '📋';
      case RuleUrgency.LOW: return '💡';
      case RuleUrgency.INFO: return 'ℹ️';
      default: return '📋';
    }
  }

  private formatCategoryName(category: RuleCategory): string {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Rule Pool Service not initialized. Call initialize() first.');
    }
  }
}
