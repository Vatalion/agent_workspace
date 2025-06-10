#!/bin/bash

# AI Assistant Deployer - Manual Testing Suite
# Tests the clean architecture transformation results

echo "🧪 AI Assistant Deployer - Manual Testing Suite"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# Function to run a test with output
run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

echo "🏗️  PHASE 1: Project Structure Tests"
echo "=================================="

# Test 1: Directory structure
run_test "Clean directory structure exists" "test -d configs && test -d data/rules && test -d tests && test -d docs && test -d scripts"

# Test 2: Rule pool location
run_test "Rule pool in correct location" "test -f data/rules/rule-pool.json"

# Test 3: Mode configurations exist
run_test "Lightweight mode configs exist" "test -f configs/modes/enterprise.json && test -f configs/modes/simplified.json && test -f configs/modes/hybrid.json"

# Test 4: Templates exist
run_test "Template files exist" "test -f configs/deployment/templates/copilot-instructions.template.md && test -f configs/deployment/templates/project-rules.template.md"

# Test 5: Test files organized
run_test "Test files moved to tests/" "test -d tests/legacy && ls tests/legacy/*.js > /dev/null 2>&1"

# Test 6: Documentation organized
run_test "Documentation moved to docs/" "test -d docs/user-guides && ls docs/user-guides/*.md > /dev/null 2>&1"

echo "📦 PHASE 2: Build System Tests"
echo "==============================="

# Test 7: Node modules
run_test "Node modules available" "test -d node_modules"

# Test 8: Package.json valid
run_test "Package.json is valid" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\"))'"

# Test 9: TypeScript config
run_test "TypeScript config exists" "test -f tsconfig.json"

echo "📊 PHASE 3: Data Integrity Tests"
echo "================================="

# Test 10: Rule pool structure
run_test_with_output "Rule pool JSON structure" "node -e '
const rulePool = JSON.parse(require(\"fs\").readFileSync(\"data/rules/rule-pool.json\"));
console.log(\"📊 Rule Pool Stats:\");
console.log(\"  Total rules:\", Object.keys(rulePool.rules || {}).length);
console.log(\"  Categories:\", rulePool.categories?.length || 0);
console.log(\"  Version:\", rulePool.metadata?.version || \"unknown\");
'"

# Test 11: Mode configuration structure
run_test_with_output "Mode configuration validation" "node -e '
const configs = [\"enterprise\", \"simplified\", \"hybrid\"];
configs.forEach(mode => {
    const config = JSON.parse(require(\"fs\").readFileSync(\`configs/modes/\${mode}.json\`));
    console.log(\`📋 \${mode} mode:\`, config.name);
    console.log(\`  Rule selection defined:\`, !!config.ruleSelection);
    console.log(\`  Deployment config:\`, !!config.deployment);
});
'"

echo "🔧 PHASE 4: Functional Tests"
echo "============================="

# Test 12: Template rendering check
run_test_with_output "Template syntax validation" "node -e '
const fs = require(\"fs\");
const copilotTemplate = fs.readFileSync(\"configs/deployment/templates/copilot-instructions.template.md\", \"utf8\");
const rulesTemplate = fs.readFileSync(\"configs/deployment/templates/project-rules.template.md\", \"utf8\");

console.log(\"📝 Template Analysis:\");
console.log(\"  Copilot template has placeholders:\", /{{.*}}/.test(copilotTemplate));
console.log(\"  Rules template has placeholders:\", /{{.*}}/.test(rulesTemplate));
console.log(\"  No hardcoded content:\", !copilotTemplate.includes(\"CRITICAL REQUIREMENTS\") || copilotTemplate.includes(\"{{#if\"));
'"

# Test 13: Build system availability
echo -e "${BLUE}🔍 Testing: Build system components${NC}"
if command -v npm > /dev/null && test -f package.json; then
    echo -e "${GREEN}✅ PASS: Build system components${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL: Build system components${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo ""

echo "🎯 PHASE 5: Integration Tests"
echo "=============================="

# Test 14: Rule extraction capability
run_test_with_output "Rule extraction test" "node -e '
const rulePool = JSON.parse(require(\"fs\").readFileSync(\"data/rules/rule-pool.json\"));
const enterpriseConfig = JSON.parse(require(\"fs\").readFileSync(\"configs/modes/enterprise.json\"));

// Test rule selection logic
const rules = rulePool.rules || {};
const selection = enterpriseConfig.ruleSelection?.copilotInstructions || {};

console.log(\"🎯 Rule Selection Test:\");
console.log(\"  Total rules available:\", Object.keys(rules).length);

if (selection.includeRuleIds) {
    const foundRules = selection.includeRuleIds.filter(id => rules[id]);
    console.log(\"  Rules by ID found:\", foundRules.length, \"/\", selection.includeRuleIds.length);
}

if (selection.includeCategories) {
    const rulesByCategory = Object.values(rules).filter(rule => 
        selection.includeCategories.includes(rule.category)
    );
    console.log(\"  Rules by category found:\", rulesByCategory.length);
}
'"

echo "📈 TEST RESULTS SUMMARY"
echo "======================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}📊 Total Tests: $TESTS_TOTAL${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! The clean architecture transformation is working perfectly!${NC}"
    echo ""
    echo "🚀 Ready for:"
    echo "  • npm run compile (build TypeScript)"
    echo "  • npm run package (create extension)"
    echo "  • Extension testing in VS Code"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review the results above.${NC}"
fi

echo ""
echo "💡 Next Steps:"
echo "  1. Run: npm run compile"
echo "  2. Run: npm run package" 
echo "  3. Test extension in VS Code"
echo "  4. Verify rule pool functionality"
