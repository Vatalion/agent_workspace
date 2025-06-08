/**
 * Focused Rule Extraction Test - Process one file at a time
 */

const path = require('path');
const fs = require('fs/promises');

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

function detectUrgency(content) {
  const urgencyKeywords = {
    [RuleUrgency.CRITICAL]: ['MUST', 'NEVER', 'MANDATORY', 'REQUIRED', 'CRITICAL', '⚠️', '🚨'],
    [RuleUrgency.HIGH]: ['SHOULD', 'NON-NEGOTIABLE', 'ENFORCED', 'IMPORTANT'],
    [RuleUrgency.MEDIUM]: ['recommended', 'best practice', 'guideline', 'standard'],
    [RuleUrgency.LOW]: ['suggestion', 'consider', 'optional', 'prefer'],
    [RuleUrgency.INFO]: ['note', 'info', 'documentation', 'explanation']
  };

  const upperContent = content.toUpperCase();
  
  for (const [urgency, keywords] of Object.entries(urgencyKeywords)) {
    for (const keyword of keywords) {
      if (upperContent.includes(keyword.toUpperCase())) {
        return urgency;
      }
    }
  }
  
  return RuleUrgency.MEDIUM;
}

function splitIntoSections(content) {
  console.log('   🔍 Splitting content into sections...');
  const sections = [];
  const lines = content.split('\n');
  
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
    
    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      
      currentSection = {
        header: headerMatch[2].trim(),
        content: line + '\n',
        lineStart: i
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  console.log(`   ✅ Found ${sections.length} sections`);
  return sections;
}

function categorizeFromHeader(header) {
  if (!header) return RuleCategory.CUSTOM;
  
  const lowerHeader = header.toLowerCase();
  
  if (lowerHeader.includes('solid')) return RuleCategory.SOLID_PRINCIPLES;
  if (lowerHeader.includes('architecture')) return RuleCategory.CLEAN_ARCHITECTURE;
  if (lowerHeader.includes('test')) return RuleCategory.TESTING_REQUIREMENTS;
  if (lowerHeader.includes('file')) return RuleCategory.FILE_PRACTICES;
  if (lowerHeader.includes('backup')) return RuleCategory.BACKUP_STRATEGY;
  if (lowerHeader.includes('state')) return RuleCategory.STATE_MANAGEMENT;
  if (lowerHeader.includes('performance')) return RuleCategory.PERFORMANCE_GUIDELINES;
  if (lowerHeader.includes('task') || lowerHeader.includes('workflow')) return RuleCategory.TASK_MANAGEMENT;
  if (lowerHeader.includes('security')) return RuleCategory.SECURITY_RULES;
  if (lowerHeader.includes('workflow')) return RuleCategory.DEVELOPMENT_WORKFLOW;
  if (lowerHeader.includes('refactor')) return RuleCategory.REFACTORING_GUIDELINES;
  if (lowerHeader.includes('enterprise')) return RuleCategory.ENTERPRISE_FEATURES;
  if (lowerHeader.includes('mode')) return RuleCategory.MODE_SWITCHING;
  
  return RuleCategory.CUSTOM;
}

function looksLikeRule(content) {
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

async function extractFromSingleFile(filePath, fileName, mode) {
  console.log(`📄 Processing ${fileName} from ${mode} mode...`);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    console.log(`   📖 Read ${content.length} characters`);
    
    const sections = splitIntoSections(content);
    const rules = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`   🔍 Processing section ${i + 1}: "${section.header}"`);
      
      if (looksLikeRule(section.content)) {
        const rule = {
          title: section.header || `Rule from ${fileName}`,
          category: categorizeFromHeader(section.header),
          urgency: detectUrgency(section.content),
          content: section.content.trim(),
          sourceFile: fileName,
          sourceSection: section.header,
          sourceMode: mode,
          contentLength: section.content.length
        };
        
        rules.push(rule);
        console.log(`   ✅ Extracted rule: "${rule.title}" (${rule.category}, ${rule.urgency})`);
      } else {
        console.log(`   ⏭️  Skipped section: doesn't look like a rule`);
      }
    }
    
    console.log(`   📊 Total rules extracted from ${fileName}: ${rules.length}\n`);
    return rules;
    
  } catch (error) {
    console.error(`   ❌ Failed to process ${filePath}:`, error.message);
    return [];
  }
}

async function runFocusedTest() {
  console.log('🎯 Focused Rule Extraction Test\n');
  
  const allRules = [];
  const files = [
    { mode: 'enterprise', file: 'copilot-instructions.md' },
    { mode: 'enterprise', file: 'project-rules.md' },
    { mode: 'simplified', file: 'copilot-instructions.md' },
    { mode: 'simplified', file: 'project-rules.md' },
    { mode: 'hybrid', file: 'copilot-instructions.md' },
    { mode: 'hybrid', file: 'project-rules.md' }
  ];
  
  for (const { mode, file } of files) {
    const filePath = path.resolve(__dirname, 'templates', 'modes', mode, file);
    const rules = await extractFromSingleFile(filePath, file, mode);
    allRules.push(...rules);
  }
  
  console.log(`\n📊 FINAL RESULTS:`);
  console.log(`   Total rules extracted: ${allRules.length}\n`);
  
  if (allRules.length > 0) {
    console.log('📋 Sample rules:');
    allRules.slice(0, 10).forEach((rule, index) => {
      console.log(`   ${index + 1}. ${rule.title}`);
      console.log(`      📂 ${rule.sourceMode}/${rule.sourceFile}`);
      console.log(`      🏷️  ${rule.category} | ${rule.urgency}`);
      console.log(`      📝 ${rule.contentLength} chars\n`);
    });
    
    // Statistics
    const categories = {};
    const urgencies = {};
    const modes = {};
    
    allRules.forEach(rule => {
      categories[rule.category] = (categories[rule.category] || 0) + 1;
      urgencies[rule.urgency] = (urgencies[rule.urgency] || 0) + 1;
      modes[rule.sourceMode] = (modes[rule.sourceMode] || 0) + 1;
    });
    
    console.log('📈 Statistics:');
    console.log('\n   Categories:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`     ${cat.replace(/_/g, ' ')}: ${count}`);
    });
    
    console.log('\n   Urgencies:');
    Object.entries(urgencies).forEach(([urg, count]) => {
      console.log(`     ${urg}: ${count}`);
    });
    
    console.log('\n   By Mode:');
    Object.entries(modes).forEach(([mode, count]) => {
      console.log(`     ${mode}: ${count}`);
    });
  }
  
  console.log('\n✅ Focused extraction test completed!');
}

runFocusedTest().catch(console.error);
