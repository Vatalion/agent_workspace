/**
 * Standalone Rule Extraction Test - Test rule extraction without VS Code dependencies
 */

const path = require('path');
const fs = require('fs/promises');

// Mock the types and utilities we need
const RuleCategory = {
  SOLID_PRINCIPLES: 'SOLID_PRINCIPLES',
  CLEAN_ARCHITECTURE: 'CLEAN_ARCHITECTURE',
  FILE_PRACTICES: 'FILE_PRACTICES',
  TESTING_REQUIREMENTS: 'TESTING_REQUIREMENTS',
  BACKUP_STRATEGY: 'BACKUP_STRATEGY',
  STATE_MANAGEMENT: 'STATE_MANAGEMENT',
  PERFORMANCE_GUIDELINES: 'PERFORMANCE_GUIDELINES',
  TASK_MANAGEMENT: 'TASK_MANAGEMENT',
  SECURITY_RULES: 'SECURITY_RULES',
  DEVELOPMENT_WORKFLOW: 'DEVELOPMENT_WORKFLOW',
  REFACTORING_GUIDELINES: 'REFACTORING_GUIDELINES',
  ENTERPRISE_FEATURES: 'ENTERPRISE_FEATURES',
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

const ProjectType = {
  FLUTTER: 'FLUTTER',
  TYPESCRIPT: 'TYPESCRIPT',
  JAVASCRIPT: 'JAVASCRIPT',
  PYTHON: 'PYTHON',
  REACT: 'REACT',
  ANGULAR: 'ANGULAR',
  VUE: 'VUE',
  NODE: 'NODE',
  ALL: 'ALL'
};

class StandaloneRuleExtractor {
  constructor() {
    this.urgencyKeywords = new Map([
      [RuleUrgency.CRITICAL, ['MUST', 'NEVER', 'MANDATORY', 'REQUIRED', 'CRITICAL', '⚠️', '🚨']],
      [RuleUrgency.HIGH, ['SHOULD', 'NON-NEGOTIABLE', 'ENFORCED', 'IMPORTANT']],
      [RuleUrgency.MEDIUM, ['recommended', 'best practice', 'guideline', 'standard']],
      [RuleUrgency.LOW, ['suggestion', 'consider', 'optional', 'prefer']],
      [RuleUrgency.INFO, ['note', 'info', 'documentation', 'explanation']]
    ]);

    this.extractionPatterns = [
      {
        category: RuleCategory.SOLID_PRINCIPLES,
        patterns: [
          /SOLID.*Principles/i,
          /Single Responsibility/i,
          /Open.*Closed/i,
          /Liskov.*Substitution/i,
          /Interface.*Segregation/i,
          /Dependency.*Inversion/i
        ]
      },
      {
        category: RuleCategory.CLEAN_ARCHITECTURE,
        patterns: [
          /Clean Architecture/i,
          /lib\/core/i,
          /lib\/data/i,
          /lib\/presentation/i,
          /lib\/domain/i
        ]
      },
      {
        category: RuleCategory.TESTING_REQUIREMENTS,
        patterns: [
          /Testing.*Requirements/i,
          /Unit Tests/i,
          /Widget Tests/i,
          /Integration Tests/i,
          /test.*coverage/i
        ]
      },
      {
        category: RuleCategory.FILE_PRACTICES,
        patterns: [
          /File.*Practices/i,
          /SINGLE-FILE.*MONSTERS/i,
          /Max.*lines.*per.*file/i,
          /EXTRACT.*reusable/i
        ]
      },
      {
        category: RuleCategory.BACKUP_STRATEGY,
        patterns: [
          /Backup.*Strategy/i,
          /git.*commit/i,
          /feature.*branch/i,
          /backup.*branch/i
        ]
      },
      {
        category: RuleCategory.TASK_MANAGEMENT,
        patterns: [
          /Task Management/i,
          /MANDATORY.*WORKFLOW/i,
          /\.tasks\//i,
          /Epic.*scale/i
        ]
      }
    ];
  }

  async extractFromAllModes() {
    console.log('🔍 Starting rule extraction from all modes...\n');
    
    const modesPath = path.resolve(__dirname, 'templates', 'modes');
    let totalRules = [];
    
    try {
      const modes = await fs.readdir(modesPath);
      console.log(`📂 Found modes: ${modes.join(', ')}\n`);
      
      for (const mode of modes) {
        const modePath = path.join(modesPath, mode);
        const stat = await fs.stat(modePath);
        
        if (stat.isDirectory()) {
          console.log(`📋 Processing ${mode} mode...`);
          const modeRules = await this.extractFromMode(modePath, mode);
          totalRules.push(...modeRules);
          console.log(`   ✅ Extracted ${modeRules.length} rules from ${mode}\n`);
        }
      }
      
      return totalRules;
    } catch (error) {
      console.error('❌ Failed to extract rules:', error.message);
      return [];
    }
  }

  async extractFromMode(modePath, modeName) {
    const rules = [];
    
    // Check copilot-instructions.md
    const instructionsFile = path.join(modePath, 'copilot-instructions.md');
    if (await this.fileExists(instructionsFile)) {
      const instructionsRules = await this.extractFromFile(instructionsFile, 'copilot-instructions.md', [modeName]);
      rules.push(...instructionsRules);
    }
    
    // Check project-rules.md
    const projectRulesFile = path.join(modePath, 'project-rules.md');
    if (await this.fileExists(projectRulesFile)) {
      const projectRules = await this.extractFromFile(projectRulesFile, 'project-rules.md', [modeName]);
      rules.push(...projectRules);
    }
    
    return rules;
  }

  async extractFromFile(filePath, fileName, sourceModes) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      console.log(`   📄 Processing ${fileName} (${content.length} chars)`);
      
      const sections = this.splitIntoSections(content);
      console.log(`      Found ${sections.length} sections`);
      
      const rules = [];
      
      for (const section of sections) {
        const detectedRules = this.detectRulesInSection(section, fileName, sourceModes);
        rules.push(...detectedRules);
      }
      
      console.log(`      ✅ Extracted ${rules.length} rules from ${fileName}`);
      return rules;
    } catch (error) {
      console.error(`   ❌ Failed to process ${filePath}:`, error.message);
      return [];
    }
  }

  splitIntoSections(content) {
    const sections = [];
    const lines = content.split('\n');
    
    let currentSection = null;
    
    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      
      if (headerMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          header: headerMatch[2].trim(),
          content: line + '\n'
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  detectRulesInSection(section, sourceFile, sourceModes) {
    const rules = [];
    
    // Check against extraction patterns
    for (const pattern of this.extractionPatterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(section.content) || regex.test(section.header)) {
          const ruleContent = this.cleanupRuleContent(section.content);
          
          if (ruleContent.trim().length > 50) { // Minimum content length
            rules.push({
              title: this.generateTitle(section.header, pattern.category),
              description: `Rule extracted from ${sourceFile} (${section.header})`,
              category: pattern.category,
              urgency: this.detectUrgency(section.content),
              content: ruleContent,
              sourceFile,
              sourceSection: section.header,
              sourceModes,
              tags: this.extractTags(section.header, section.content),
              appliesTo: this.determineProjectTypes(section.content)
            });
          }
          break;
        }
      }
    }
    
    // Check for general rule indicators if no specific pattern matched
    if (rules.length === 0 && this.looksLikeRule(section.content)) {
      rules.push({
        title: section.header || 'General Rule',
        description: `Rule extracted from ${sourceFile}`,
        category: this.categorizeFromHeader(section.header),
        urgency: this.detectUrgency(section.content),
        content: this.cleanupRuleContent(section.content),
        sourceFile,
        sourceSection: section.header,
        sourceModes,
        tags: this.extractTags(section.header, section.content),
        appliesTo: this.determineProjectTypes(section.content)
      });
    }
    
    return rules;
  }

  detectUrgency(content) {
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

  extractTags(header, content) {
    const tags = [];
    
    const headerLower = (header || '').toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (headerLower.includes('flutter') || contentLower.includes('flutter')) tags.push('flutter');
    if (headerLower.includes('typescript') || contentLower.includes('typescript')) tags.push('typescript');
    if (headerLower.includes('enterprise') || contentLower.includes('enterprise')) tags.push('enterprise');
    if (headerLower.includes('simplified') || contentLower.includes('simplified')) tags.push('simplified');
    if (headerLower.includes('hybrid') || contentLower.includes('hybrid')) tags.push('hybrid');
    if (contentLower.includes('test')) tags.push('testing');
    if (contentLower.includes('git ')) tags.push('git');
    if (contentLower.includes('.tasks/')) tags.push('task-management');
    
    return [...new Set(tags)];
  }

  categorizeFromHeader(header) {
    if (!header) return RuleCategory.CUSTOM;
    
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

  determineProjectTypes(content) {
    const contentLower = content.toLowerCase();
    const types = [];
    
    if (contentLower.includes('flutter') || contentLower.includes('lib/')) {
      types.push(ProjectType.FLUTTER);
    }
    if (contentLower.includes('typescript') || contentLower.includes('npm')) {
      types.push(ProjectType.TYPESCRIPT);
    }
    if (contentLower.includes('python') || contentLower.includes('requirements.txt')) {
      types.push(ProjectType.PYTHON);
    }
    if (contentLower.includes('react')) {
      types.push(ProjectType.REACT);
    }
    
    return types.length > 0 ? types : [ProjectType.ALL];
  }

  looksLikeRule(content) {
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

  cleanupRuleContent(content) {
    return content
      .replace(/^#+\s*/gm, '') // Remove header markers
      .replace(/\n{3,}/g, '\n\n') // Reduce excessive line breaks
      .trim();
  }

  generateTitle(header, category) {
    if (header && header.length > 0 && header.length < 100) {
      return header;
    }
    
    const categoryName = category.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return `${categoryName} Rule`;
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

async function runStandaloneTest() {
  console.log('🧪 Standalone Rule Extraction Test\n');
  
  const extractor = new StandaloneRuleExtractor();
  const rules = await extractor.extractFromAllModes();
  
  console.log(`\n📊 EXTRACTION RESULTS:`);
  console.log(`   Total rules extracted: ${rules.length}\n`);
  
  if (rules.length > 0) {
    // Show sample rules
    console.log('📋 Sample extracted rules:');
    rules.slice(0, 5).forEach((rule, index) => {
      console.log(`\n   ${index + 1}. ${rule.title}`);
      console.log(`      Category: ${rule.category}`);
      console.log(`      Urgency: ${rule.urgency}`);
      console.log(`      Source: ${rule.sourceFile} (${rule.sourceSection})`);
      console.log(`      Content: ${rule.content.substring(0, 100)}...`);
      console.log(`      Tags: ${rule.tags.join(', ') || 'None'}`);
    });
    
    // Statistics
    console.log('\n📈 Rules by Category:');
    const categories = {};
    rules.forEach(rule => {
      categories[rule.category] = (categories[rule.category] || 0) + 1;
    });
    
    for (const [category, count] of Object.entries(categories)) {
      console.log(`   ${category.replace(/_/g, ' ')}: ${count}`);
    }
    
    console.log('\n🚨 Rules by Urgency:');
    const urgencies = {};
    rules.forEach(rule => {
      urgencies[rule.urgency] = (urgencies[rule.urgency] || 0) + 1;
    });
    
    for (const [urgency, count] of Object.entries(urgencies)) {
      console.log(`   ${urgency}: ${count}`);
    }
    
    console.log('\n🎯 Rules by Project Type:');
    const projectTypes = {};
    rules.forEach(rule => {
      rule.appliesTo.forEach(type => {
        projectTypes[type] = (projectTypes[type] || 0) + 1;
      });
    });
    
    for (const [type, count] of Object.entries(projectTypes)) {
      console.log(`   ${type}: ${count}`);
    }
    
    console.log('\n✅ Rule extraction test completed successfully!');
  } else {
    console.log('❌ No rules extracted. Check the mode file structure.');
  }
}

runStandaloneTest().catch(console.error);
