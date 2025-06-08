/**
 * Simple Rule Extraction Debug Test
 */

const path = require('path');
const fs = require('fs/promises');

async function debugExtraction() {
  console.log('🔍 Debug Rule Extraction Test\n');
  
  try {
    // Check if templates directory exists
    const templatesPath = path.resolve(__dirname, 'templates', 'modes');
    console.log(`📂 Checking templates path: ${templatesPath}`);
    
    const stat = await fs.stat(templatesPath);
    console.log(`   ✅ Templates directory exists (${stat.isDirectory() ? 'directory' : 'file'})`);
    
    // List modes
    const modes = await fs.readdir(templatesPath);
    console.log(`   📋 Found modes: ${modes.join(', ')}\n`);
    
    // Check each mode
    for (const mode of modes) {
      console.log(`🔍 Checking ${mode} mode...`);
      const modePath = path.join(templatesPath, mode);
      const modeStat = await fs.stat(modePath);
      
      if (modeStat.isDirectory()) {
        const files = await fs.readdir(modePath);
        console.log(`   📄 Files: ${files.join(', ')}`);
        
        // Check specific files
        const instructionsFile = path.join(modePath, 'copilot-instructions.md');
        const projectRulesFile = path.join(modePath, 'project-rules.md');
        
        try {
          const instructionsStat = await fs.stat(instructionsFile);
          console.log(`   ✅ copilot-instructions.md exists (${instructionsStat.size} bytes)`);
          
          // Read first 200 chars to test
          const content = await fs.readFile(instructionsFile, 'utf8');
          console.log(`   📖 Sample content: ${content.substring(0, 100).replace(/\n/g, '\\n')}...`);
        } catch (e) {
          console.log(`   ❌ copilot-instructions.md not accessible: ${e.message}`);
        }
        
        try {
          const projectRulesStat = await fs.stat(projectRulesFile);
          console.log(`   ✅ project-rules.md exists (${projectRulesStat.size} bytes)`);
        } catch (e) {
          console.log(`   ❌ project-rules.md not accessible: ${e.message}`);
        }
      }
      console.log('');
    }
    
    console.log('✅ Debug extraction completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error.stack);
  }
}

debugExtraction();
