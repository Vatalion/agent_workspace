const fs = require('fs');

// Read the extension file
let content = fs.readFileSync('src/extension.ts', 'utf8');

// Remove the duplicated methods from FlutterDebugAssistant class
// Find the start of the problematic methods and remove them
const startPattern = /\tprivate async initializeStatuses\(\) \{[\s\S]*?\tpublic updateCopilotStatus\(status: 'available' \| 'not-installed' \| 'not-activated' \| 'error'\) \{[\s\S]*?\t\}\n\}/;

// Replace with just the closing brace
content = content.replace(startPattern, '}');

// Write the fixed content back
fs.writeFileSync('src/extension.ts', content);

console.log('TypeScript errors fixed!'); 