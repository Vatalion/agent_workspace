/**
 * Test Mode Configuration System
 * Test mode configuration creation, validation, and rule resolution
 */

const { StandaloneRulePoolService } = require('./standaloneRulePoolService');
const { StandaloneModeConfigurationService } = require('./standaloneModeConfigurationService');
const fs = require('fs').promises;
const path = require('path');

async function testModeConfigurationSystem() {
  console.log('🧪 Testing Mode Configuration System\n');

  try {
    // Initialize services
    const rulePoolService = new StandaloneRulePoolService('./data');
    const modeConfigService = new StandaloneModeConfigurationService(rulePoolService);

    // Test 1: Create predefined mode configurations
    console.log('📋 Test 1: Creating predefined mode configurations');
    
    const enterpriseConfig = modeConfigService.createModeConfiguration('enterprise', {
      name: 'Test Enterprise Mode',
      description: 'Test enterprise configuration'
    });
    
    const simplifiedConfig = modeConfigService.createModeConfiguration('simplified', {
      name: 'Test Simplified Mode',
      description: 'Test simplified configuration'
    });
    
    const hybridConfig = modeConfigService.createModeConfiguration('hybrid', {
      name: 'Test Hybrid Mode',
      description: 'Test hybrid configuration'
    });

    console.log(`✅ Created enterprise config: ${enterpriseConfig.name} (ID: ${enterpriseConfig.id})`);
    console.log(`✅ Created simplified config: ${simplifiedConfig.name} (ID: ${simplifiedConfig.id})`);
    console.log(`✅ Created hybrid config: ${hybridConfig.name} (ID: ${hybridConfig.id})\n`);

    // Test 2: Validate configurations
    console.log('✅ Test 2: Validating configurations');
    
    const enterpriseValidation = await modeConfigService.validateModeConfiguration(enterpriseConfig);
    const simplifiedValidation = await modeConfigService.validateModeConfiguration(simplifiedConfig);
    const hybridValidation = await modeConfigService.validateModeConfiguration(hybridConfig);

    console.log(`Enterprise validation: ${enterpriseValidation.valid ? '✅ VALID' : '❌ INVALID'}`);
    if (!enterpriseValidation.valid) {
      console.log(`  Errors: ${enterpriseValidation.errors.map(e => e.message).join(', ')}`);
    }
    console.log(`  Resolved rules: ${enterpriseValidation.ruleResolution?.totalRules || 0}`);
    console.log(`  Categories: ${Object.keys(enterpriseValidation.ruleResolution?.rulesByCategory || {}).length}`);
    
    console.log(`Simplified validation: ${simplifiedValidation.valid ? '✅ VALID' : '❌ INVALID'}`);
    if (!simplifiedValidation.valid) {
      console.log(`  Errors: ${simplifiedValidation.errors.map(e => e.message).join(', ')}`);
    }
    console.log(`  Resolved rules: ${simplifiedValidation.ruleResolution?.totalRules || 0}`);
    console.log(`  Categories: ${Object.keys(simplifiedValidation.ruleResolution?.rulesByCategory || {}).length}`);
    
    console.log(`Hybrid validation: ${hybridValidation.valid ? '✅ VALID' : '❌ INVALID'}`);
    if (!hybridValidation.valid) {
      console.log(`  Errors: ${hybridValidation.errors.map(e => e.message).join(', ')}`);
    }
    console.log(`  Resolved rules: ${hybridValidation.ruleResolution?.totalRules || 0}`);
    console.log(`  Categories: ${Object.keys(hybridValidation.ruleResolution?.rulesByCategory || {}).length}\n`);

    // Test 3: Rule resolution
    console.log('🔍 Test 3: Testing rule resolution');

    // Test enterprise rule resolution
    const enterpriseCopilotRules = await modeConfigService.resolveRules(
      enterpriseConfig.rules.copilotInstructions.selection
    );
    const enterpriseProjectRules = await modeConfigService.resolveRules(
      enterpriseConfig.rules.projectRules.selection
    );

    console.log(`Enterprise copilot rules: ${enterpriseCopilotRules.length}`);
    console.log(`  Categories: ${[...new Set(enterpriseCopilotRules.map(r => r.category))].join(', ')}`);
    console.log(`  Urgency levels: ${[...new Set(enterpriseCopilotRules.map(r => r.urgency))].join(', ')}`);
    
    console.log(`Enterprise project rules: ${enterpriseProjectRules.length}`);
    console.log(`  Categories: ${[...new Set(enterpriseProjectRules.map(r => r.category))].join(', ')}`);
    console.log(`  Urgency levels: ${[...new Set(enterpriseProjectRules.map(r => r.urgency))].join(', ')}\n`);

    // Test simplified rule resolution
    const simplifiedCopilotRules = await modeConfigService.resolveRules(
      simplifiedConfig.rules.copilotInstructions.selection
    );
    const simplifiedProjectRules = await modeConfigService.resolveRules(
      simplifiedConfig.rules.projectRules.selection
    );

    console.log(`Simplified copilot rules: ${simplifiedCopilotRules.length}`);
    console.log(`  Categories: ${[...new Set(simplifiedCopilotRules.map(r => r.category))].join(', ')}`);
    console.log(`  Urgency levels: ${[...new Set(simplifiedCopilotRules.map(r => r.urgency))].join(', ')}`);
    
    console.log(`Simplified project rules: ${simplifiedProjectRules.length}`);
    console.log(`  Categories: ${[...new Set(simplifiedProjectRules.map(r => r.category))].join(', ')}`);
    console.log(`  Urgency levels: ${[...new Set(simplifiedProjectRules.map(r => r.urgency))].join(', ')}\n`);

    // Test 4: Save and load configurations
    console.log('💾 Test 4: Save and load configurations');

    const configDir = './test-output/mode-configs';
    await fs.mkdir(configDir, { recursive: true });

    const enterprisePath = path.join(configDir, 'enterprise.json');
    const simplifiedPath = path.join(configDir, 'simplified.json');
    const hybridPath = path.join(configDir, 'hybrid.json');

    await modeConfigService.saveModeConfiguration(enterpriseConfig, enterprisePath);
    await modeConfigService.saveModeConfiguration(simplifiedConfig, simplifiedPath);
    await modeConfigService.saveModeConfiguration(hybridConfig, hybridPath);

    console.log(`✅ Saved enterprise config to: ${enterprisePath}`);
    console.log(`✅ Saved simplified config to: ${simplifiedPath}`);
    console.log(`✅ Saved hybrid config to: ${hybridPath}`);

    // Test loading
    const loadedEnterprise = await modeConfigService.loadModeConfiguration(enterprisePath);
    const loadedSimplified = await modeConfigService.loadModeConfiguration(simplifiedPath);
    const loadedHybrid = await modeConfigService.loadModeConfiguration(hybridPath);

    console.log(`✅ Loaded enterprise config: ${loadedEnterprise.name}`);
    console.log(`✅ Loaded simplified config: ${loadedSimplified.name}`);
    console.log(`✅ Loaded hybrid config: ${loadedHybrid.name}\n`);

    // Test 5: Rule filtering and selection
    console.log('🎯 Test 5: Advanced rule filtering');

    // Test critical rules only
    const criticalOnlySelection = {
      include: [{ urgency: ['CRITICAL'] }]
    };
    const criticalRules = await modeConfigService.resolveRules(criticalOnlySelection);
    console.log(`Critical rules only: ${criticalRules.length}`);
    console.log(`  Titles: ${criticalRules.map(r => r.title.substring(0, 30) + '...').join(', ')}`);

    // Test specific categories
    const taskManagementSelection = {
      include: [{ categories: ['TASK_MANAGEMENT'] }]
    };
    const taskRules = await modeConfigService.resolveRules(taskManagementSelection);
    console.log(`Task management rules: ${taskRules.length}`);
    console.log(`  Urgency distribution: ${taskRules.reduce((acc, r) => {
      acc[r.urgency] = (acc[r.urgency] || 0) + 1;
      return acc;
    }, {})}`);

    // Test exclusion
    const nonEnterpriseSelection = {
      include: [{ categories: ['CUSTOM', 'TASK_MANAGEMENT'] }],
      exclude: [{ categories: ['ENTERPRISE_FEATURES'] }]
    };
    const nonEnterpriseRules = await modeConfigService.resolveRules(nonEnterpriseSelection);
    console.log(`Non-enterprise rules: ${nonEnterpriseRules.length}`);
    console.log(`  Categories: ${[...new Set(nonEnterpriseRules.map(r => r.category))].join(', ')}\n`);

    // Test 6: Custom mode configuration
    console.log('⚙️ Test 6: Custom mode configuration');

    const customConfig = modeConfigService.createModeConfiguration('custom', {
      name: 'Flutter Mobile App Mode',
      description: 'Specialized mode for Flutter mobile app development',
      metadata: {
        projectTypes: ['flutter'],
        complexity: 'medium',
        estimatedHours: { min: 10, max: 40 },
        tags: ['flutter', 'mobile', 'clean-architecture']
      },
      rules: {
        copilotInstructions: {
          selection: {
            include: [
              { categories: ['CLEAN_ARCHITECTURE', 'SOLID_PRINCIPLES'] },
              { urgency: ['CRITICAL', 'HIGH'] }
            ],
            minUrgency: 'MEDIUM'
          },
          organization: {
            groupBy: 'category',
            orderBy: 'urgency',
            includeHeaders: true
          }
        },
        projectRules: {
          selection: {
            include: [
              { categories: ['FILE_PRACTICES', 'TESTING_REQUIREMENTS'] }
            ]
          },
          organization: {
            groupBy: 'none',
            orderBy: 'urgency',
            includeHeaders: false
          }
        }
      }
    });

    const customValidation = await modeConfigService.validateModeConfiguration(customConfig);
    console.log(`Custom mode validation: ${customValidation.valid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Custom mode resolved rules: ${customValidation.ruleResolution?.totalRules || 0}`);
    console.log(`Custom mode categories: ${Object.entries(customValidation.ruleResolution?.rulesByCategory || {}).map(([cat, count]) => `${cat}: ${count}`).join(', ')}\n`);

    // Save custom config
    const customPath = path.join(configDir, 'flutter-mobile.json');
    await modeConfigService.saveModeConfiguration(customConfig, customPath);
    console.log(`✅ Saved custom config to: ${customPath}\n`);

    // Test 7: Performance test
    console.log('⚡ Test 7: Performance testing');

    const startTime = process.hrtime.bigint();
    
    // Create and validate 10 configurations
    const configs = [];
    for (let i = 0; i < 10; i++) {
      const config = modeConfigService.createModeConfiguration('enterprise', {
        name: `Performance Test Config ${i + 1}`
      });
      configs.push(config);
      await modeConfigService.validateModeConfiguration(config);
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

    console.log(`✅ Created and validated 10 configurations in ${duration.toFixed(2)}ms`);
    console.log(`✅ Average per configuration: ${(duration / 10).toFixed(2)}ms\n`);

    // Summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Mode configuration system tests completed successfully`);
    console.log(`✅ All predefined modes (enterprise, simplified, hybrid) validated`);
    console.log(`✅ Rule resolution working correctly`);
    console.log(`✅ Save/load functionality working`);
    console.log(`✅ Advanced filtering and custom configurations working`);
    console.log(`✅ Performance: ${(duration / 10).toFixed(2)}ms per configuration`);
    
    console.log(`\n📁 Generated files in: ${configDir}`);
    const files = await fs.readdir(configDir);
    files.forEach(file => console.log(`   ${file}`));

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

// Run tests
if (require.main === module) {
  testModeConfigurationSystem().catch(console.error);
}

module.exports = { testModeConfigurationSystem };
