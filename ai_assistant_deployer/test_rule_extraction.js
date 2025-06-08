/**
 * Test Rule Extraction - Simple test to validate rule extraction from existing modes
 */

const path = require('path');

// Import the compiled JavaScript modules
const { RulePoolService } = require('./out/services/rulePoolService');
const { RuleExtractionService } = require('./out/services/ruleExtractionService');

async function testRuleExtraction() {
  console.log('🧪 Testing Rule Extraction...\n');
  
  try {
    const extensionPath = path.resolve(__dirname, '..');
    const extractionService = new RuleExtractionService(extensionPath);
    
    // Extract rules from all modes
    console.log('📋 Extracting rules from all modes...');
    const extractedRules = await extractionService.extractAllRules();
    
    console.log(`✅ Successfully extracted ${extractedRules.length} rules\n`);
    
    if (extractedRules.length > 0) {
      console.log('📊 Sample of extracted rules:');
      extractedRules.slice(0, 5).forEach((rule, index) => {
        console.log(`\n   ${index + 1}. ${rule.title}`);
        console.log(`      Category: ${rule.category}`);
        console.log(`      Urgency: ${rule.urgency}`);
        console.log(`      Source: ${rule.sourceFile} (${rule.sourceSection})`);
        console.log(`      Content length: ${rule.content.length} chars`);
        console.log(`      Tags: ${rule.tags.join(', ') || 'None'}`);
      });
      
      console.log('\n📈 Rules by Category:');
      const categories = {};
      extractedRules.forEach(rule => {
        categories[rule.category] = (categories[rule.category] || 0) + 1;
      });
      
      for (const [category, count] of Object.entries(categories)) {
        console.log(`   ${category.replace(/_/g, ' ')}: ${count}`);
      }
      
      console.log('\n🚨 Rules by Urgency:');
      const urgencies = {};
      extractedRules.forEach(rule => {
        urgencies[rule.urgency] = (urgencies[rule.urgency] || 0) + 1;
      });
      
      for (const [urgency, count] of Object.entries(urgencies)) {
        console.log(`   ${urgency}: ${count}`);
      }
    } else {
      console.log('❌ No rules extracted. Checking template structure...');
      
      const fs = require('fs');
      const templatesPath = path.join(extensionPath, 'templates', 'modes');
      
      try {
        const modes = fs.readdirSync(templatesPath);
        console.log(`   Found modes: ${modes.join(', ')}`);
        
        for (const mode of modes) {
          const modePath = path.join(templatesPath, mode);
          const stat = fs.statSync(modePath);
          
          if (stat.isDirectory()) {
            const files = fs.readdirSync(modePath);
            console.log(`   ${mode} mode files: ${files.join(', ')}`);
          }
        }
      } catch (error) {
        console.error('   Template directory not found:', error.message);
      }
    }
    
    console.log('\n✅ Rule extraction test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    console.error(error.stack);
  }
}

// Run the test
testRuleExtraction();
