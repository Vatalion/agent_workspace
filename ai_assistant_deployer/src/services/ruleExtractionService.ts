/**
 * Rule Extraction Service - Migrate existing rules from modes to Rule Pool
 * 
 * This service analyzes existing mode files and extracts rules into the
 * standardized Rule Pool format, enabling migration from embedded rules
 * to the centralized Rule Pool Architecture.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import {
  Rule,
  RuleCategory,
  RuleUrgency,
  RuleContentType,
  ProjectType
} from './rulePoolTypes';

interface ExtractionPattern {
  category: RuleCategory;
  patterns: RegExp[];
  urgencyIndicators: Map<string, RuleUrgency>;
  projectTypeMapping: ProjectType[];
}

interface SourceRule {
  content: string;
  sourceFile: string;
  sourceSection: string;
  sourceModes: string[];
  detectedCategory: RuleCategory;
  detectedUrgency: RuleUrgency;
  tags: string[];
}

export class RuleExtractionService {
  private readonly extractionPatterns: ExtractionPattern[] = [];
  private readonly urgencyKeywords = new Map<RuleUrgency, string[]>([
    [RuleUrgency.CRITICAL, ['MUST', 'NEVER', 'MANDATORY', 'REQUIRED', 'CRITICAL', '⚠️', '🚨']],
    [RuleUrgency.HIGH, ['SHOULD', 'NON-NEGOTIABLE', 'ENFORCED', 'IMPORTANT']],
    [RuleUrgency.MEDIUM, ['recommended', 'best practice', 'guideline', 'standard']],
    [RuleUrgency.LOW, ['suggestion', 'consider', 'optional', 'prefer']],
    [RuleUrgency.INFO, ['note', 'info', 'documentation', 'explanation']]
  ]);

  constructor(private readonly extensionPath: string) {
    this.initializeExtractionPatterns();
  }

  /**
   * Extract all rules from existing mode files
   */
  async extractAllRules(): Promise<Rule[]> {
    const extractedRules: Rule[] = [];
    const modesPath = path.join(this.extensionPath, 'templates', 'modes');
    
    try {
      const modes = await fs.readdir(modesPath);
      
      for (const mode of modes) {
        const modePath = path.join(modesPath, mode);
        const stat = await fs.stat(modePath);
        
        if (stat.isDirectory()) {
          console.log(`Extracting rules from ${mode} mode...`);
          const modeRules = await this.extractRulesFromMode(modePath, mode);
          extractedRules.push(...modeRules);
        }
      }
      
      console.log(`Successfully extracted ${extractedRules.length} rules from all modes`);
      return extractedRules;
    } catch (error) {
      console.error('Failed to extract rules:', error);
      throw error;
    }
  }

  /**
   * Extract rules from a specific mode directory
   */
  async extractRulesFromMode(modePath: string, modeName: string): Promise<Rule[]> {
    const rules: Rule[] = [];
    
    // Extract from copilot-instructions.md
    const instructionsFile = path.join(modePath, 'copilot-instructions.md');
    if (await this.fileExists(instructionsFile)) {
      const instructionsRules = await this.extractRulesFromFile(
        instructionsFile, 
        'copilot-instructions.md', 
        [modeName]
      );
      rules.push(...instructionsRules);
    }
    
    // Extract from project-rules.md
    const projectRulesFile = path.join(modePath, 'project-rules.md');
    if (await this.fileExists(projectRulesFile)) {
      const projectRules = await this.extractRulesFromFile(
        projectRulesFile, 
        'project-rules.md', 
        [modeName]
      );
      rules.push(...projectRules);
    }
    
    // Extract from automation scripts (if needed)
    const automationPath = path.join(modePath, 'automation');
    if (await this.fileExists(automationPath)) {
      const automationRules = await this.extractRulesFromAutomation(automationPath, [modeName]);
      rules.push(...automationRules);
    }
    
    return rules;
  }

  /**
   * Extract rules from a specific file
   */
  async extractRulesFromFile(filePath: string, fileName: string, sourceModes: string[]): Promise<Rule[]> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const sourceRules = this.parseContentForRules(content, fileName, sourceModes);
      
      return sourceRules.map(sourceRule => this.convertToRule(sourceRule));
    } catch (error) {
      console.error(`Failed to extract rules from ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Parse content and identify rule sections
   */
  private parseContentForRules(content: string, sourceFile: string, sourceModes: string[]): SourceRule[] {
    const rules: SourceRule[] = [];
    
    // Split content into sections based on headers
    const sections = this.splitIntoSections(content);
    
    for (const section of sections) {
      const detectedRules = this.detectRulesInSection(section, sourceFile, sourceModes);
      rules.push(...detectedRules);
    }
    
    return rules;
  }

  /**
   * Split content into logical sections
   */
  private splitIntoSections(content: string): Array<{ header: string; content: string }> {
    const sections: Array<{ header: string; content: string }> = [];
    const lines = content.split('\n');
    
    let currentSection: { header: string; content: string } | null = null;
    
    for (const line of lines) {
      // Check for headers (## or ###)
      const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          header: headerMatch[2].trim(),
          content: line + '\n'
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Detect rules within a section
   */
  private detectRulesInSection(section: { header: string; content: string }, sourceFile: string, sourceModes: string[]): SourceRule[] {
    const rules: SourceRule[] = [];
    
    // Check if section contains rule patterns
    for (const pattern of this.extractionPatterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(section.content) || regex.test(section.header)) {
          // This section contains rules of this category
          const ruleContent = this.cleanupRuleContent(section.content);
          
          if (ruleContent.trim().length > 0) {
            rules.push({
              content: ruleContent,
              sourceFile,
              sourceSection: section.header,
              sourceModes,
              detectedCategory: pattern.category,
              detectedUrgency: this.detectUrgency(section.content),
              tags: this.extractTags(section.header, section.content)
            });
          }
          
          break; // Don't double-match the same section
        }
      }
    }
    
    // If no specific pattern matched, check for general rule indicators
    if (rules.length === 0 && this.looksLikeRule(section.content)) {
      rules.push({
        content: this.cleanupRuleContent(section.content),
        sourceFile,
        sourceSection: section.header,
        sourceModes,
        detectedCategory: this.categorizeFromHeader(section.header),
        detectedUrgency: this.detectUrgency(section.content),
        tags: this.extractTags(section.header, section.content)
      });
    }
    
    return rules;
  }

  /**
   * Convert a source rule to a standardized Rule object
   */
  private convertToRule(sourceRule: SourceRule): Rule {
    const title = this.generateRuleTitle(sourceRule);
    const description = this.generateRuleDescription(sourceRule);
    
    return {
      id: uuidv4(),
      title,
      description,
      category: sourceRule.detectedCategory,
      urgency: sourceRule.detectedUrgency,
      version: '1.0.0',
      content: sourceRule.content,
      contentType: RuleContentType.MARKDOWN,
      tags: sourceRule.tags,
      appliesTo: this.determineProjectTypes(sourceRule),
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Migration',
      isCustom: false,
      isActive: true,
      sourceFile: sourceRule.sourceFile,
      sourceSection: sourceRule.sourceSection,
      sourceModes: sourceRule.sourceModes,
      dependsOn: [],
      conflicts: [],
      supersedes: [],
      validationRules: [],
      constraints: []
    };
  }

  /**
   * Extract rules from automation scripts
   */
  private async extractRulesFromAutomation(automationPath: string, sourceModes: string[]): Promise<Rule[]> {
    const rules: Rule[] = [];
    
    try {
      const items = await fs.readdir(automationPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isFile() && item.name.endsWith('.sh')) {
          const scriptPath = path.join(automationPath, item.name);
          const scriptRules = await this.extractRulesFromScript(scriptPath, sourceModes);
          rules.push(...scriptRules);
        } else if (item.isDirectory()) {
          // Recursively check subdirectories
          const subDirPath = path.join(automationPath, item.name);
          const subRules = await this.extractRulesFromAutomation(subDirPath, sourceModes);
          rules.push(...subRules);
        }
      }
    } catch (error) {
      console.error(`Failed to extract rules from automation at ${automationPath}:`, error);
    }
    
    return rules;
  }

  /**
   * Extract rules from shell scripts
   */
  private async extractRulesFromScript(scriptPath: string, sourceModes: string[]): Promise<Rule[]> {
    try {
      const content = await fs.readFile(scriptPath, 'utf8');
      const fileName = path.basename(scriptPath);
      
      // Look for comments that contain rule-like content
      const commentRules = this.extractRulesFromComments(content, fileName, sourceModes);
      
      return commentRules;
    } catch (error) {
      console.error(`Failed to extract rules from script ${scriptPath}:`, error);
      return [];
    }
  }

  /**
   * Extract rules from script comments
   */
  private extractRulesFromComments(content: string, sourceFile: string, sourceModes: string[]): Rule[] {
    const rules: Rule[] = [];
    const lines = content.split('\n');
    
    let currentComment = '';
    let inComment = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('#')) {
        inComment = true;
        currentComment += trimmed.substring(1).trim() + '\n';
      } else if (inComment && currentComment.trim()) {
        // End of comment block, check if it's a rule
        if (this.looksLikeRule(currentComment)) {
          const sourceRule: SourceRule = {
            content: this.cleanupRuleContent(currentComment),
            sourceFile,
            sourceSection: 'Script Comments',
            sourceModes,
            detectedCategory: RuleCategory.TASK_MANAGEMENT,
            detectedUrgency: this.detectUrgency(currentComment),
            tags: ['automation', 'script']
          };
          
          rules.push(this.convertToRule(sourceRule));
        }
        
        currentComment = '';
        inComment = false;
      } else if (inComment) {
        inComment = false;
        currentComment = '';
      }
    }
    
    return rules;
  }

  // Helper methods

  private initializeExtractionPatterns(): void {
    this.extractionPatterns.push(
      {
        category: RuleCategory.SOLID_PRINCIPLES,
        patterns: [
          /SOLID.*Principles/i,
          /Single Responsibility/i,
          /Open.*Closed/i,
          /Liskov.*Substitution/i,
          /Interface.*Segregation/i,
          /Dependency.*Inversion/i
        ],
        urgencyIndicators: new Map(),
        projectTypeMapping: [ProjectType.ALL]
      },
      {
        category: RuleCategory.CLEAN_ARCHITECTURE,
        patterns: [
          /Clean Architecture/i,
          /lib\/core/i,
          /lib\/data/i,
          /lib\/presentation/i,
          /lib\/domain/i
        ],
        urgencyIndicators: new Map(),
        projectTypeMapping: [ProjectType.FLUTTER]
      },
      {
        category: RuleCategory.TESTING_REQUIREMENTS,
        patterns: [
          /Testing.*Requirements/i,
          /Unit Tests/i,
          /Widget Tests/i,
          /Integration Tests/i,
          /test.*coverage/i
        ],
        urgencyIndicators: new Map(),
        projectTypeMapping: [ProjectType.ALL]
      },
      {
        category: RuleCategory.FILE_PRACTICES,
        patterns: [
          /File.*Practices/i,
          /SINGLE-FILE.*MONSTERS/i,
          /Max.*lines.*per.*file/i,
          /EXTRACT.*reusable/i
        ],
        urgencyIndicators: new Map(),
        projectTypeMapping: [ProjectType.ALL]
      },
      {
        category: RuleCategory.BACKUP_STRATEGY,
        patterns: [
          /Backup.*Strategy/i,
          /git.*commit/i,
          /feature.*branch/i,
          /backup.*branch/i
        ],
        urgencyIndicators: new Map(),
        projectTypeMapping: [ProjectType.ALL]
      },
      {
        category: RuleCategory.STATE_MANAGEMENT,
        patterns: [
          /State Management/i,
          /Provider.*setState/i,
          /Riverpod.*Bloc/i,
          /global.*variables/i
        ],
        urgencyIndicators: new Map(),
        projectTypeMapping: [ProjectType.FLUTTER]
      },
      {
        category: RuleCategory.PERFORMANCE_GUIDELINES,
        patterns: [
          /Performance.*Guidelines/i,
          /Lazy Loading/i,
          /Image Optimization/i,
          /Memory Management/i,
          /Build Optimization/i
        ],
        urgencyIndicators: new Map(),
        projectTypeMapping: [ProjectType.FLUTTER]
      },
      {
        category: RuleCategory.TASK_MANAGEMENT,
        patterns: [
          /Task Management/i,
          /MANDATORY.*WORKFLOW/i,
          /\.tasks\//i,
          /Epic.*scale/i
        ],
        urgencyIndicators: new Map(),
        projectTypeMapping: [ProjectType.ALL]
      }
    );
  }

  private detectUrgency(content: string): RuleUrgency {
    const upperContent = content.toUpperCase();
    
    for (const [urgency, keywords] of this.urgencyKeywords) {
      for (const keyword of keywords) {
        if (upperContent.includes(keyword.toUpperCase())) {
          return urgency;
        }
      }
    }
    
    return RuleUrgency.MEDIUM;
  }

  private extractTags(header: string, content: string): string[] {
    const tags: string[] = [];
    
    // Extract tags from header
    if (header.toLowerCase().includes('flutter')) tags.push('flutter');
    if (header.toLowerCase().includes('typescript')) tags.push('typescript');
    if (header.toLowerCase().includes('enterprise')) tags.push('enterprise');
    if (header.toLowerCase().includes('simplified')) tags.push('simplified');
    if (header.toLowerCase().includes('hybrid')) tags.push('hybrid');
    
    // Extract tags from content patterns
    if (content.includes('lib/')) tags.push('flutter');
    if (content.includes('npm install')) tags.push('node');
    if (content.includes('requirements.txt')) tags.push('python');
    if (content.includes('.tasks/')) tags.push('task-management');
    if (content.includes('git ')) tags.push('git');
    if (content.includes('test')) tags.push('testing');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  private categorizeFromHeader(header: string): RuleCategory {
    const lowerHeader = header.toLowerCase();
    
    if (lowerHeader.includes('solid')) return RuleCategory.SOLID_PRINCIPLES;
    if (lowerHeader.includes('architecture')) return RuleCategory.CLEAN_ARCHITECTURE;
    if (lowerHeader.includes('test')) return RuleCategory.TESTING_REQUIREMENTS;
    if (lowerHeader.includes('file')) return RuleCategory.FILE_PRACTICES;
    if (lowerHeader.includes('backup')) return RuleCategory.BACKUP_STRATEGY;
    if (lowerHeader.includes('state')) return RuleCategory.STATE_MANAGEMENT;
    if (lowerHeader.includes('performance')) return RuleCategory.PERFORMANCE_GUIDELINES;
    if (lowerHeader.includes('task')) return RuleCategory.TASK_MANAGEMENT;
    if (lowerHeader.includes('security')) return RuleCategory.SECURITY_RULES;
    if (lowerHeader.includes('workflow')) return RuleCategory.DEVELOPMENT_WORKFLOW;
    if (lowerHeader.includes('refactor')) return RuleCategory.REFACTORING_GUIDELINES;
    if (lowerHeader.includes('enterprise')) return RuleCategory.ENTERPRISE_FEATURES;
    if (lowerHeader.includes('mode')) return RuleCategory.MODE_SWITCHING;
    
    return RuleCategory.CUSTOM;
  }

  private determineProjectTypes(sourceRule: SourceRule): ProjectType[] {
    const content = sourceRule.content.toLowerCase();
    const tags = sourceRule.tags;
    const types: ProjectType[] = [];
    
    if (content.includes('flutter') || content.includes('lib/') || tags.includes('flutter')) {
      types.push(ProjectType.FLUTTER);
    }
    if (content.includes('typescript') || content.includes('npm') || tags.includes('typescript')) {
      types.push(ProjectType.TYPESCRIPT);
    }
    if (content.includes('python') || content.includes('requirements.txt') || tags.includes('python')) {
      types.push(ProjectType.PYTHON);
    }
    if (content.includes('react') || tags.includes('react')) {
      types.push(ProjectType.REACT);
    }
    
    // If no specific types detected, apply to all
    return types.length > 0 ? types : [ProjectType.ALL];
  }

  private looksLikeRule(content: string): boolean {
    const ruleIndicators = [
      /MUST|NEVER|SHOULD|REQUIRED|MANDATORY/i,
      /best practice/i,
      /guideline/i,
      /rule/i,
      /principle/i,
      /requirement/i,
      /standard/i,
      /convention/i
    ];
    
    return ruleIndicators.some(pattern => pattern.test(content)) && content.trim().length > 50;
  }

  private cleanupRuleContent(content: string): string {
    return content
      .replace(/^#+\s*/gm, '') // Remove header markers
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // Preserve bold formatting
      .replace(/\n{3,}/g, '\n\n') // Reduce excessive line breaks
      .trim();
  }

  private generateRuleTitle(sourceRule: SourceRule): string {
    const section = sourceRule.sourceSection;
    const category = sourceRule.detectedCategory;
    
    // Use section header if descriptive
    if (section && section.length > 0 && section.length < 100) {
      return section;
    }
    
    // Generate title from category and content
    const categoryName = category.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return `${categoryName} Rule`;
  }

  private generateRuleDescription(sourceRule: SourceRule): string {
    const firstParagraph = sourceRule.content.split('\n\n')[0];
    if (firstParagraph && firstParagraph.length < 200) {
      return firstParagraph.replace(/\n/g, ' ').trim();
    }
    
    return `Rule extracted from ${sourceRule.sourceFile} (${sourceRule.sourceSection})`;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
