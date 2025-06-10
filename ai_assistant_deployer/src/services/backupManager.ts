import * as fs from 'fs-extra';
import * as path from 'path';

export class BackupManager {
    async createBackup(workspacePath: string): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(workspacePath, '.ai-assistant', 'backups', timestamp);
        
        await fs.ensureDir(backupDir);

        // Files and directories to backup
        const itemsToBackup = [
            '.vscode/settings.json',
            '.vscode/launch.json', 
            '.vscode/extensions.json',
            '.github',
            'package.json',
            'pubspec.yaml',
            'requirements.txt',
            'pyproject.toml'
        ];

        const backupManifest = {
            timestamp,
            workspacePath,
            backedUpItems: [] as string[]
        };

        for (const item of itemsToBackup) {
            const sourcePath = path.join(workspacePath, item);
            
            if (await fs.pathExists(sourcePath)) {
                const destPath = path.join(backupDir, item);
                await fs.ensureDir(path.dirname(destPath));
                await fs.copy(sourcePath, destPath);
                backupManifest.backedUpItems.push(item);
            }
        }

        // Save backup manifest
        await fs.writeJson(path.join(backupDir, 'manifest.json'), backupManifest, { spaces: 2 });

        return backupDir;
    }

    async restoreBackup(workspacePath: string, backupPath: string): Promise<void> {
        const manifestPath = path.join(backupPath, 'manifest.json');
        
        if (!await fs.pathExists(manifestPath)) {
            throw new Error('Invalid backup: manifest.json not found');
        }

        const manifest = await fs.readJson(manifestPath);

        for (const item of manifest.backedUpItems) {
            const sourcePath = path.join(backupPath, item);
            const destPath = path.join(workspacePath, item);
            
            if (await fs.pathExists(sourcePath)) {
                await fs.ensureDir(path.dirname(destPath));
                await fs.copy(sourcePath, destPath, { overwrite: true });
            }
        }
    }

    async listBackups(workspacePath: string): Promise<Array<{ path: string; timestamp: string; manifest: any }>> {
        const backupsDir = path.join(workspacePath, '.ai-assistant', 'backups');
        
        if (!await fs.pathExists(backupsDir)) {
            return [];
        }

        const backups = [];
        const backupDirs = await fs.readdir(backupsDir);

        for (const dir of backupDirs) {
            const backupPath = path.join(backupsDir, dir);
            const manifestPath = path.join(backupPath, 'manifest.json');
            
            if (await fs.pathExists(manifestPath)) {
                const manifest = await fs.readJson(manifestPath);
                backups.push({
                    path: backupPath,
                    timestamp: manifest.timestamp,
                    manifest
                });
            }
        }

        return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }

    async cleanupOldBackups(workspacePath: string, keepCount: number = 5): Promise<void> {
        const backups = await this.listBackups(workspacePath);
        
        if (backups.length > keepCount) {
            const backupsToDelete = backups.slice(keepCount);
            
            for (const backup of backupsToDelete) {
                await fs.remove(backup.path);
            }
        }
    }
}
