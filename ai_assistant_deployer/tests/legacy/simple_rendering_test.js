#!/usr/bin/env node

/**
 * Simple Rule Rendering Engine Test
 * Tests basic functionality
 */

console.log('🎨 Simple Rule Rendering Engine Test\n');

try {
    // Test import
    console.log('📦 Testing import...');
    const RuleRenderingEngine = require('./ruleRenderingEngine.js').RuleRenderingEngine;
    console.log('✅ Import successful');

    // Test constructor
    console.log('🏗️  Testing constructor...');
    const renderingEngine = new RuleRenderingEngine();
    console.log('✅ Constructor successful');

    // Test available templates
    console.log('📋 Testing available templates...');
    const templates = renderingEngine.getAvailableTemplates();
    console.log('✅ Available templates:', templates);

    // Test simple rule rendering
    console.log('🎯 Testing simple rule rendering...');
    const testRule = {
        id: 'test-rule-1',
        title: 'Test Rule',
        content: 'This is a test rule for validation.',
        category: 'TESTING_REQUIREMENTS',
        urgency: 'MEDIUM',
        sources: ['test'],
        metadata: {
            created: new Date().toISOString()
        }
    };

    const rendered = await renderingEngine.renderRule(testRule);
    console.log('✅ Rule rendered successfully');
    console.log('📄 Rendered output:');
    console.log('---');
    console.log(rendered);
    console.log('---');

    console.log('\n🎉 All tests passed!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}
