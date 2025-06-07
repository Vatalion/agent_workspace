const vscode = require('vscode');

function activate(context) {
    console.log('🚀 Run Button Extension activated');

    // Create a code lens provider for shell scripts
    const runButtonProvider = {
        provideCodeLenses(document) {
            const codeLenses = [];
            
            // Only show run button for shell scripts
            if (document.fileName.endsWith('.sh')) {
                // Add run button at the top of the file
                const range = new vscode.Range(0, 0, 0, 0);
                const command = {
                    title: "▶️ Run Script",
                    command: 'runButton.executeScript',
                    arguments: [document.fileName]
                };
                codeLenses.push(new vscode.CodeLens(range, command));
                
                // Add run in terminal button
                const terminalCommand = {
                    title: "🖥️ Run in Terminal",
                    command: 'runButton.executeInTerminal',
                    arguments: [document.fileName]
                };
                codeLenses.push(new vscode.CodeLens(range, terminalCommand));
            }
            
            return codeLenses;
        }
    };

    // Register the code lens provider
    const disposable1 = vscode.languages.registerCodeLensProvider(
        { scheme: 'file', pattern: '**/*.sh' },
        runButtonProvider
    );

    // Register command to execute script
    const disposable2 = vscode.commands.registerCommand('runButton.executeScript', async (fileName) => {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const scriptPath = fileName;
            const scriptName = scriptPath.split('/').pop();
            
            vscode.window.showInformationMessage(`🚀 Running ${scriptName}...`);
            
            // Execute the script
            const terminal = vscode.window.createTerminal(`Run: ${scriptName}`);
            terminal.show();
            terminal.sendText(`cd "${workspaceFolder.uri.fsPath}"`);
            terminal.sendText(`chmod +x "${scriptPath}"`);
            terminal.sendText(`"${scriptPath}"`);
            
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error running script: ${error.message}`);
        }
    });

    // Register command to execute in terminal
    const disposable3 = vscode.commands.registerCommand('runButton.executeInTerminal', async (fileName) => {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder found');
                return;
            }

            const scriptPath = fileName;
            const scriptName = scriptPath.split('/').pop();
            
            // Create a new terminal
            const terminal = vscode.window.createTerminal(`Terminal: ${scriptName}`);
            terminal.show();
            terminal.sendText(`cd "${workspaceFolder.uri.fsPath}"`);
            terminal.sendText(`chmod +x "${scriptPath}"`);
            
            vscode.window.showInformationMessage(`🖥️ Terminal ready for ${scriptName}. Type: ./${scriptName}`);
            
        } catch (error) {
            vscode.window.showErrorMessage(`❌ Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable1, disposable2, disposable3);
    
    vscode.window.showInformationMessage('🎯 Run Button Extension ready! Open any .sh file to see run buttons.');
}

function deactivate() {}

module.exports = { activate, deactivate }; 