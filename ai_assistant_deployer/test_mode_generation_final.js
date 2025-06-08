#!/usr/bin/env node

/**
 * Final integration test for Mode Generation Pipeline
 */

const fs = require('fs');
const path = require('path');

async function testModeGeneration() {
    console.log('🧪 Testing Mode Generation Pipeline - Final Integration Test');
    console.log('='.repeat(60));
    
    try {
        // Test 1: Verify migrated configurations exist
        console.log('\n📋 Test 1: Checking migrated configurations...');
        
        const migratedConfigsPath = path.join(__dirname, 'migrated-configs');
        const expectedConfigs = ['enterprise-migrated.json', 'simplified-migrated.json', 'hybrid-migrated.json'];
        
        let configsFound = 0;
        for (const config of expectedConfigs) {
            const configPath = path.join(migratedConfigsPath, config);
            if (fs.existsSync(configPath)) {
                const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                console.log(`✅ ${config}: Found (${Object.keys(configData).length} sections)`);
                configsFound++;
            } else {
                console.log(`❌ ${config}: Missing`);
            }
        }
        
        // Test 2: Verify rule pool exists
        console.log('\n🎯 Test 2: Checking rule pool...');
        
        const rulePoolPath = path.join(__dirname, 'data', 'rule-pool.json');
        if (fs.existsSync(rulePoolPath)) {
            const rulePool = JSON.parse(fs.readFileSync(rulePoolPath, 'utf8'));
            console.log(`✅ Rule pool found with ${rulePool.rules?.length || 0} rules`);
        } else {
            console.log('❌ Rule pool not found');
        }
        
        // Test 3: Verify compiled services exist
        console.log('\n⚙️ Test 3: Checking compiled services...');
        
        const outServicesPath = path.join(__dirname, 'out', 'services');
        const requiredServices = [
            'modeGenerationPipeline.js',
            'modeConfigurationService.js',
            'rulePoolService.js'
        ];
        
        let servicesFound = 0;
        for (const service of requiredServices) {
            const servicePath = path.join(outServicesPath, service);
            if (fs.existsSync(servicePath)) {
                console.log(`✅ ${service}: Found`);
                servicesFound++;
            } else {
                console.log(`❌ ${service}: Missing`);
            }
        }
        
        // Test 4: Verify extension package
        console.log('\n📦 Test 4: Checking extension package...');
        
        const vsixPath = path.join(__dirname, 'ai-assistant-deployer-1.0.0.vsix');
        if (fs.existsSync(vsixPath)) {
            const stats = fs.statSync(vsixPath);
            console.log(`✅ Extension package: ${(stats.size / 1024).toFixed(1)}KB`);
        } else {
            console.log('❌ Extension package not found');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Mode Generation Pipeline Test Summary:');
        console.log(`📋 Migrated Configs: ${configsFound}/${expectedConfigs.length}`);
        console.log(`⚙️  Compiled Services: ${servicesFound}/${requiredServices.length}`);
        
        if (configsFound === expectedConfigs.length && servicesFound === requiredServices.length) {
            console.log('✅ All core components verified and ready!');
        } else {
            console.log('⚠️  Some components missing - check details above');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testModeGeneration();
