import * as vscode from 'vscode';
import { exec, spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class CopilotHelperExtension {
    private statusBarItem: vscode.StatusBarItem;
    private context: vscode.ExtensionContext;
    private helperProcess: ChildProcess | null = null;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'copilotHelper.status';
        this.statusBarItem.text = '$(robot) Helper';
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);

        // Register commands
        this.registerCommands();
        this.updateStatus();
    }

    private registerCommands() {
        const commands = [
            vscode.commands.registerCommand('copilotHelper.enable', () => this.enableHelper()),
            vscode.commands.registerCommand('copilotHelper.disable', () => this.disableHelper()),
            vscode.commands.registerCommand('copilotHelper.start', () => this.startHelper()),
            vscode.commands.registerCommand('copilotHelper.stop', () => this.stopHelper()),
            vscode.commands.registerCommand('copilotHelper.status', () => this.showStatus()),
            vscode.commands.registerCommand('copilotHelper.openSettings', () => this.openSettings()),
            vscode.commands.registerCommand('copilotHelper.showLogs', () => this.showLogs()),
            vscode.commands.registerCommand('copilotHelper.testDialogs', () => this.testDialogs())
        ];

        commands.forEach(cmd => this.context.subscriptions.push(cmd));
    }

    private getHelperCommand(): string {
        const possiblePaths = [
            '/usr/local/bin/copilot-helper',
            path.join(process.env.HOME || '', '.copilot_helper', 'copilot-helper'),
            'copilot-helper'
        ];

        for (const helperPath of possiblePaths) {
            if (fs.existsSync(helperPath)) {
                return helperPath;
            }
        }
        return 'copilot-helper';
    }

    private async executeHelper(args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const helperCmd = this.getHelperCommand();
            exec(`${helperCmd} ${args.join(' ')}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    private async enableHelper() {
        try {
            await this.executeHelper(['enable']);
            vscode.window.showInformationMessage('Copilot Helper enabled!');
            this.updateStatus();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to enable helper: ${error}`);
        }
    }

    private async disableHelper() {
        try {
            await this.executeHelper(['disable']);
            if (this.helperProcess) {
                this.helperProcess.kill();
                this.helperProcess = null;
            }
            vscode.window.showInformationMessage('Copilot Helper disabled!');
            this.updateStatus();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to disable helper: ${error}`);
        }
    }

    private async startHelper() {
        try {
            if (this.helperProcess) {
                vscode.window.showWarningMessage('Helper is already running');
                return;
            }

            const helperCmd = this.getHelperCommand();
            this.helperProcess = spawn(helperCmd, ['daemon']);

            this.helperProcess.on('exit', (code) => {
                this.helperProcess = null;
                this.updateStatus();
            });

            vscode.window.showInformationMessage('Copilot Helper started!');
            this.updateStatus();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start helper: ${error}`);
        }
    }

    private async stopHelper() {
        try {
            if (this.helperProcess) {
                this.helperProcess.kill();
                this.helperProcess = null;
            } else {
                await this.executeHelper(['stop']);
            }
            vscode.window.showInformationMessage('Copilot Helper stopped!');
            this.updateStatus();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to stop helper: ${error}`);
        }
    }

    private async showStatus() {
        try {
            const status = await this.executeHelper(['status']);
            vscode.window.showInformationMessage(`Copilot Helper Status:\n${status}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to get status: ${error}`);
        }
    }

    private openSettings() {
        vscode.commands.executeCommand('workbench.action.openSettings', 'copilotHelper');
    }

    private async showLogs() {
        const logPath = path.join(process.env.HOME || '', '.copilot_helper_logs', 'copilot_helper.log');
        
        if (fs.existsSync(logPath)) {
            const document = await vscode.workspace.openTextDocument(logPath);
            await vscode.window.showTextDocument(document);
        } else {
            vscode.window.showWarningMessage('Log file not found.');
        }
    }

    private async testDialogs() {
        const testScriptPath = path.join(__dirname, '..', '..', 'test_dialogs.py');
        
        if (fs.existsSync(testScriptPath)) {
            const terminal = vscode.window.createTerminal('Copilot Helper Test');
            terminal.sendText(`python3 "${testScriptPath}"`);
            terminal.show();
        } else {
            vscode.window.showErrorMessage('Test script not found.');
        }
    }

    private async updateStatus() {
        try {
            const statusOutput = await this.executeHelper(['status']);
            const enabled = statusOutput.includes('Enabled');
            const running = this.helperProcess !== null || statusOutput.includes('Running: Yes');

            if (enabled && running) {
                this.statusBarItem.text = '$(robot) Helper Active';
            } else if (enabled) {
                this.statusBarItem.text = '$(robot) Helper Ready';
            } else {
                this.statusBarItem.text = '$(robot) Helper Off';
            }
        } catch (error) {
            this.statusBarItem.text = '$(robot) Helper Error';
        }
    }

    dispose() {
        if (this.helperProcess) {
            this.helperProcess.kill();
        }
        this.statusBarItem.dispose();
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Copilot Helper extension is now active!');
    return new CopilotHelperExtension(context);
}

export function deactivate() {
    console.log('Copilot Helper extension deactivated');
}
