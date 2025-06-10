import * as fs from 'fs-extra';
import * as path from 'path';

export class FileUtils {
    static async copyFileIfExists(sourcePath: string, destPath: string): Promise<boolean> {
        if (await fs.pathExists(sourcePath)) {
            await fs.ensureDir(path.dirname(destPath));
            await fs.copy(sourcePath, destPath);
            return true;
        }
        return false;
    }

    static async createDirectoryStructure(basePath: string, structure: string[]): Promise<void> {
        for (const dir of structure) {
            await fs.ensureDir(path.join(basePath, dir));
        }
    }

    static async mergeJsonFiles(targetPath: string, sourceData: any): Promise<void> {
        let existingData = {};
        
        if (await fs.pathExists(targetPath)) {
            try {
                existingData = await fs.readJson(targetPath);
            } catch {
                // If reading fails, start with empty object
            }
        }

        const mergedData = this.deepMerge(existingData, sourceData);
        await fs.writeJson(targetPath, mergedData, { spaces: 2 });
    }

    static deepMerge(target: any, source: any): any {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    static async findFiles(dir: string, pattern: RegExp, maxDepth: number = 3): Promise<string[]> {
        const found: string[] = [];
        
        const search = async (currentDir: string, depth: number) => {
            if (depth > maxDepth) return;
            
            const items = await fs.readdir(currentDir);
            
            for (const item of items) {
                if (item.startsWith('.')) continue;
                
                const fullPath = path.join(currentDir, item);
                const stat = await fs.stat(fullPath);
                
                if (stat.isFile() && pattern.test(item)) {
                    found.push(fullPath);
                } else if (stat.isDirectory() && item !== 'node_modules' && item !== 'build') {
                    await search(fullPath, depth + 1);
                }
            }
        };
        
        await search(dir, 0);
        return found;
    }

    static async getFileSize(filePath: string): Promise<number> {
        try {
            const stats = await fs.stat(filePath);
            return stats.size;
        } catch {
            return 0;
        }
    }

    static formatFileSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}

export class PathUtils {
    static getRelativePath(from: string, to: string): string {
        return path.relative(from, to);
    }

    static joinPaths(...paths: string[]): string {
        return path.join(...paths);
    }

    static normalizePath(filePath: string): string {
        return path.normalize(filePath);
    }

    static getExtension(filePath: string): string {
        return path.extname(filePath);
    }

    static getBasename(filePath: string, ext?: string): string {
        return path.basename(filePath, ext);
    }

    static getDirname(filePath: string): string {
        return path.dirname(filePath);
    }
}

export class ValidationUtils {
    static isValidWorkspace(workspacePath: string): boolean {
        // Basic validation - check if it's a directory
        try {
            return fs.statSync(workspacePath).isDirectory();
        } catch {
            return false;
        }
    }

    static isValidJson(content: string): boolean {
        try {
            JSON.parse(content);
            return true;
        } catch {
            return false;
        }
    }

    static isValidProjectName(name: string): boolean {
        // Check for valid project name (alphanumeric, hyphens, underscores)
        const projectNameRegex = /^[a-zA-Z0-9_-]+$/;
        return projectNameRegex.test(name) && name.length > 0 && name.length <= 100;
    }

    static sanitizeFileName(fileName: string): string {
        // Remove invalid characters for file names
        return fileName.replace(/[<>:"/\\|?*]/g, '_');
    }
}
