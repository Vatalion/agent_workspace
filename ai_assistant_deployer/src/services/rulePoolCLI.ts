/**
 * Rule Pool Migration CLI - Test and execute rule extraction
 * 
 * This CLI tool helps test and execute the migration from embedded rules
 * in mode files to the centralized Rule Pool Architecture.
 */

import * as path from 'path';
import { RulePoolService } from './rulePoolService';
import { RuleExtractionService } from './ruleExtractionService';
import { RuleCategory, RuleUrgency, ProjectType } from './rulePoolTypes';

class RulePoolMigrationCLI {
  private rulePoolService: RulePoolService;
  private extractionService: RuleExtractionService;
  private extensionPath: string;

  constructor() {
    // For CLI testing, use current directory structure
    this.extensionPath = path.resolve(__dirname, '..');
    this.rulePoolService = new RulePoolService(this.extensionPath);
    this.extractionService = new RuleExtractionService(this.extensionPath);
  }

  async run(): Promise<void> {
    console.log('🚀 Rule Pool Migration CLI Starting...\n');
    
    try {
      // Initialize the rule pool service
      console.log('📋 Initializing Rule Pool Service...');
      await this.rulePoolService.initialize();
      console.log('✅ Rule Pool Service initialized\n');
      
      // Extract rules from existing modes
      console.log('🔍 Extracting rules from existing mode files...');
      const extractedRules = await this.extractionService.extractAllRules();
      console.log(`✅ Extracted ${extractedRules.length} rules\n`);
      
      if (extractedRules.length === 0) {
        console.log('❌ No rules extracted. Check if mode files exist in templates/modes/');
        return;
      }
      
      // Add extracted rules to the pool
      console.log('💾 Adding extracted rules to the Rule Pool...');
      let successCount = 0;
      let errorCount = 0;
      
      for (const rule of extractedRules) {
        try {
          await this.rulePoolService.createRule(rule);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to add rule "${rule.title}":`, error instanceof Error ? error.message : String(error));
          errorCount++;
        }
      }
      
      console.log(`✅ Successfully added ${successCount} rules to the pool`);
      if (errorCount > 0) {
        console.log(`⚠️  Failed to add ${errorCount} rules`);
      }
      console.log('');
      
      // Display statistics
      await this.displayStatistics();
      
      // Test rule search
      await this.testRuleSearch();
      
      // Test rule rendering
      await this.testRuleRendering();
      
      console.log('🎉 Rule Pool Migration completed successfully!');
      
    } catch (error) {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    }
  }

  private async displayStatistics(): Promise<void> {
    console.log('📊 Rule Pool Statistics:');
    const stats = this.rulePoolService.getStatistics();
    
    console.log(`   Total Rules: ${stats.totalRules}`);
    console.log(`   Custom Rules: ${stats.customRules}`);
    console.log(`   Predefined Rules: ${stats.predefinedRules}`);
    console.log(`   Active Rules: ${stats.activeRules}`);
    console.log('');
    
    console.log('📂 Rules by Category:');
    for (const [category, count] of stats.rulesByCategory) {
      const categoryName = category.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   ${categoryName}: ${count}`);
    }
    console.log('');
    
    console.log('🚨 Rules by Urgency:');
    for (const [urgency, count] of stats.rulesByUrgency) {
      const indicator = this.getUrgencyIndicator(urgency);
      console.log(`   ${indicator} ${urgency}: ${count}`);
    }
    console.log('');
    
    console.log('🏷️  Most Used Tags:');
    stats.mostUsedTags.slice(0, 5).forEach(({ tag, count }) => {
      console.log(`   #${tag}: ${count} rules`);
    });
    console.log('');
  }

  private async testRuleSearch(): Promise<void> {
    console.log('🔍 Testing Rule Search...');
    
    // Search for Flutter-specific rules
    const flutterResults = this.rulePoolService.searchRules({
      projectTypes: [ProjectType.FLUTTER]
    });
    console.log(`   Flutter rules: ${flutterResults.totalCount}`);
    
    // Search for critical rules
    const criticalResults = this.rulePoolService.searchRules({
      urgencies: [RuleUrgency.CRITICAL]
    });
    console.log(`   Critical rules: ${criticalResults.totalCount}`);
    
    // Search for testing rules
    const testingResults = this.rulePoolService.searchRules({
      categories: [RuleCategory.TESTING_REQUIREMENTS]
    });
    console.log(`   Testing rules: ${testingResults.totalCount}`);
    
    // Text search
    const solidResults = this.rulePoolService.searchRules({
      query: 'SOLID'
    });
    console.log(`   Rules mentioning "SOLID": ${solidResults.totalCount}`);
    console.log('');
  }

  private async testRuleRendering(): Promise<void> {
    console.log('🎨 Testing Rule Rendering...');
    
    // Get a few rules to test rendering
    const allRules = this.rulePoolService.getAllRules();
    const testRuleIds = allRules.slice(0, 3).map(rule => rule.id);
    
    if (testRuleIds.length === 0) {
      console.log('   No rules available for rendering test');
      return;
    }
    
    // Create a mock mode configuration for testing
    const mockMode = {
      id: 'test-mode',
      name: 'Test Mode',
      description: 'Test mode for rendering',
      version: '1.0.0',
      ruleIds: testRuleIds,
      ruleOverrides: new Map(),
      excludedRuleIds: [],
      projectTypes: [ProjectType.ALL],
      isDefault: false,
      isCustom: true,
      generateInstructions: true,
      generateProjectRules: true,
      generateAutomation: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Test'
    };
    
    const renderContext = {
      mode: mockMode,
      projectType: ProjectType.ALL,
      outputFormat: 'markdown' as const,
      includeMetadata: true,
      groupByCategory: true,
      sortByUrgency: true
    };
    
    try {
      const renderedContent = await this.rulePoolService.renderRules(testRuleIds, renderContext);
      console.log(`   Rendered content length: ${renderedContent.length} characters`);
      console.log(`   First 200 characters:`);
      console.log(`   ${renderedContent.substring(0, 200).replace(/\n/g, '\\n')}...`);
    } catch (error) {
      console.error('   Rendering test failed:', error instanceof Error ? error.message : String(error));
    }
    console.log('');
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
}

// CLI entry point
async function main() {
  const cli = new RulePoolMigrationCLI();
  await cli.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('CLI execution failed:', error);
    process.exit(1);
  });
}

export { RulePoolMigrationCLI };
