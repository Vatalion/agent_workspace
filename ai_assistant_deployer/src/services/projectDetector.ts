import * as fs from 'fs-extra';
import * as path from 'path';

export interface ProjectDetails {
    type: ProjectType;
    framework: string;
    language: string;
    packageManager: string;
    hasTests: boolean;
    dependencies: string[];
}

export type ProjectType = 'flutter' | 'react' | 'angular' | 'vue' | 'node' | 'python' | 'unknown';

export class ProjectDetector {
    async detectProjectType(workspacePath: string): Promise<ProjectType> {
        try {
            // Check for Flutter project
            if (await this.isFlutterProject(workspacePath)) {
                return 'flutter';
            }

            // Check for React project
            if (await this.isReactProject(workspacePath)) {
                return 'react';
            }

            // Check for Angular project
            if (await this.isAngularProject(workspacePath)) {
                return 'angular';
            }

            // Check for Vue project
            if (await this.isVueProject(workspacePath)) {
                return 'vue';
            }

            // Check for Node.js project
            if (await this.isNodeProject(workspacePath)) {
                return 'node';
            }

            // Check for Python project
            if (await this.isPythonProject(workspacePath)) {
                return 'python';
            }

            return 'unknown';
        } catch (error) {
            console.error('Error detecting project type:', error);
            return 'unknown';
        }
    }

    async getProjectDetails(workspacePath: string): Promise<ProjectDetails> {
        const type = await this.detectProjectType(workspacePath);
        const details: ProjectDetails = {
            type,
            framework: '',
            language: '',
            packageManager: '',
            hasTests: false,
            dependencies: []
        };

        switch (type) {
            case 'flutter':
                details.framework = 'Flutter';
                details.language = 'Dart';
                details.packageManager = 'pub';
                details.hasTests = await fs.pathExists(path.join(workspacePath, 'test'));
                details.dependencies = await this.getFlutterDependencies(workspacePath);
                break;

            case 'react':
                details.framework = 'React';
                details.language = await this.detectJSLanguage(workspacePath);
                details.packageManager = await this.detectPackageManager(workspacePath);
                details.hasTests = await this.hasTestFiles(workspacePath, ['.test.', '.spec.']);
                details.dependencies = await this.getNodeDependencies(workspacePath);
                break;

            case 'angular':
                details.framework = 'Angular';
                details.language = 'TypeScript';
                details.packageManager = await this.detectPackageManager(workspacePath);
                details.hasTests = await this.hasTestFiles(workspacePath, ['.spec.ts']);
                details.dependencies = await this.getNodeDependencies(workspacePath);
                break;

            case 'vue':
                details.framework = 'Vue';
                details.language = await this.detectJSLanguage(workspacePath);
                details.packageManager = await this.detectPackageManager(workspacePath);
                details.hasTests = await this.hasTestFiles(workspacePath, ['.test.', '.spec.']);
                details.dependencies = await this.getNodeDependencies(workspacePath);
                break;

            case 'node':
                details.framework = 'Node.js';
                details.language = await this.detectJSLanguage(workspacePath);
                details.packageManager = await this.detectPackageManager(workspacePath);
                details.hasTests = await this.hasTestFiles(workspacePath, ['.test.', '.spec.']);
                details.dependencies = await this.getNodeDependencies(workspacePath);
                break;

            case 'python':
                details.framework = 'Python';
                details.language = 'Python';
                details.packageManager = await this.detectPythonPackageManager(workspacePath);
                details.hasTests = await this.hasTestFiles(workspacePath, ['test_', '_test.py']);
                details.dependencies = await this.getPythonDependencies(workspacePath);
                break;
        }

        return details;
    }

    private async isFlutterProject(workspacePath: string): Promise<boolean> {
        const pubspecPath = path.join(workspacePath, 'pubspec.yaml');
        if (await fs.pathExists(pubspecPath)) {
            const content = await fs.readFile(pubspecPath, 'utf8');
            return content.includes('flutter:') || content.includes('sdk: flutter');
        }
        return false;
    }

    private async isReactProject(workspacePath: string): Promise<boolean> {
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            return 'react' in deps || 'react-dom' in deps;
        }
        return false;
    }

    private async isAngularProject(workspacePath: string): Promise<boolean> {
        const angularJsonPath = path.join(workspacePath, 'angular.json');
        const packageJsonPath = path.join(workspacePath, 'package.json');
        
        if (await fs.pathExists(angularJsonPath)) {
            return true;
        }
        
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            return '@angular/core' in deps;
        }
        
        return false;
    }

    private async isVueProject(workspacePath: string): Promise<boolean> {
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            return 'vue' in deps || '@vue/cli-service' in deps;
        }
        return false;
    }

    private async isNodeProject(workspacePath: string): Promise<boolean> {
        return await fs.pathExists(path.join(workspacePath, 'package.json'));
    }

    private async isPythonProject(workspacePath: string): Promise<boolean> {
        const pythonFiles = [
            'requirements.txt',
            'setup.py',
            'pyproject.toml',
            'Pipfile',
            'environment.yml'
        ];
        
        for (const file of pythonFiles) {
            if (await fs.pathExists(path.join(workspacePath, file))) {
                return true;
            }
        }
        
        // Check for .py files in root
        const files = await fs.readdir(workspacePath);
        return files.some((file: string) => file.endsWith('.py'));
    }

    private async detectJSLanguage(workspacePath: string): Promise<string> {
        if (await fs.pathExists(path.join(workspacePath, 'tsconfig.json'))) {
            return 'TypeScript';
        }
        return 'JavaScript';
    }

    private async detectPackageManager(workspacePath: string): Promise<string> {
        if (await fs.pathExists(path.join(workspacePath, 'yarn.lock'))) {
            return 'yarn';
        }
        if (await fs.pathExists(path.join(workspacePath, 'pnpm-lock.yaml'))) {
            return 'pnpm';
        }
        return 'npm';
    }

    private async detectPythonPackageManager(workspacePath: string): Promise<string> {
        if (await fs.pathExists(path.join(workspacePath, 'Pipfile'))) {
            return 'pipenv';
        }
        if (await fs.pathExists(path.join(workspacePath, 'poetry.lock'))) {
            return 'poetry';
        }
        if (await fs.pathExists(path.join(workspacePath, 'environment.yml'))) {
            return 'conda';
        }
        return 'pip';
    }

    private async hasTestFiles(workspacePath: string, patterns: string[]): Promise<boolean> {
        try {
            const files = await this.getAllFiles(workspacePath);
            return files.some(file => patterns.some(pattern => file.includes(pattern)));
        } catch {
            return false;
        }
    }

    private async getAllFiles(dir: string): Promise<string[]> {
        const files: string[] = [];
        const items = await fs.readdir(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                files.push(...await this.getAllFiles(fullPath));
            } else if (stat.isFile()) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    private async getFlutterDependencies(workspacePath: string): Promise<string[]> {
        try {
            const pubspecPath = path.join(workspacePath, 'pubspec.yaml');
            if (await fs.pathExists(pubspecPath)) {
                const content = await fs.readFile(pubspecPath, 'utf8');
                const lines = content.split('\n');
                const deps: string[] = [];
                let inDependencies = false;
                
                for (const line of lines) {
                    if (line.trim() === 'dependencies:') {
                        inDependencies = true;
                    } else if (line.trim() === 'dev_dependencies:' || line.trim() === 'flutter:') {
                        inDependencies = false;
                    } else if (inDependencies && line.trim() && !line.startsWith(' ')) {
                        inDependencies = false;
                    } else if (inDependencies && line.includes(':')) {
                        const depName = line.split(':')[0].trim();
                        if (depName !== 'flutter') {
                            deps.push(depName);
                        }
                    }
                }
                
                return deps;
            }
        } catch {
            // Ignore errors
        }
        return [];
    }

    private async getNodeDependencies(workspacePath: string): Promise<string[]> {
        try {
            const packageJsonPath = path.join(workspacePath, 'package.json');
            if (await fs.pathExists(packageJsonPath)) {
                const packageJson = await fs.readJson(packageJsonPath);
                const deps = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies });
                return deps;
            }
        } catch {
            // Ignore errors
        }
        return [];
    }

    private async getPythonDependencies(workspacePath: string): Promise<string[]> {
        try {
            const reqPath = path.join(workspacePath, 'requirements.txt');
            if (await fs.pathExists(reqPath)) {
                const content = await fs.readFile(reqPath, 'utf8');
                return content.split('\n')
                    .map((line: string) => line.trim())
                    .filter((line: string) => line && !line.startsWith('#'))
                    .map((line: string) => line.split('==')[0].split('>=')[0].split('<=')[0]);
            }
        } catch {
            // Ignore errors
        }
        return [];
    }
}
