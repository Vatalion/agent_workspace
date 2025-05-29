
// Test script to run in VS Code Developer Console
// Open: Help → Toggle Developer Tools → Console

console.log('🧪 Testing Flutter Debug Assistant Button Functionality');

// Test 1: Check if commands are available
const testCommands = [
    'flutter-debug-assistant.sendConsoleErrorToAI',
    'flutter-debug-assistant.testConnection',
    'flutter-debug-assistant.addTestError'
];

async function testCommandAvailability() {
    console.log('Testing command availability...');
    
    for (const command of testCommands) {
        try {
            const commands = await vscode.commands.getCommands();
            if (commands.includes(command)) {
                console.log('✅ Command available:', command);
            } else {
                console.log('❌ Command missing:', command);
            }
        } catch (error) {
            console.log('❌ Error checking command:', command, error);
        }
    }
}

// Test 2: Try to execute a test command
async function testCommandExecution() {
    console.log('Testing command execution...');
    
    try {
        await vscode.commands.executeCommand('flutter-debug-assistant.addTestError');
        console.log('✅ Test error command executed successfully');
    } catch (error) {
        console.log('❌ Test error command failed:', error);
    }
}

// Test 3: Check extension activation
function testExtensionActivation() {
    console.log('Testing extension activation...');
    
    const extension = vscode.extensions.getExtension('your-publisher.flutter-debug-assistant');
    if (extension) {
        console.log('✅ Extension found');
        console.log('Active:', extension.isActive);
    } else {
        console.log('❌ Extension not found');
    }
}

// Run all tests
testCommandAvailability();
testCommandExecution();
testExtensionActivation();

console.log('🎯 If you see errors above, that explains why buttons don\'t work');
