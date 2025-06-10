import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Rule, RuleCategory, RuleUrgency, RuleSet, RuleFilter, RuleBulkOperation } from './ruleTypes';

interface RuleModification {
    ruleId: string;
    field: keyof Rule;
    oldValue: any;
    newValue: any;
    timestamp: Date;
}

export class RuleManagementService {
    private workspaceRoot: string;
    private rules: Rule[] = [];
    private modifications: RuleModification[] = [];

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
        this.loadRules();
    }

    async createRule(rule: Omit<Rule, 'id' | 'createdAt' | 'modifiedAt'>): Promise<Rule> {
        const newRule: Rule = {
            ...rule,
            id: this.generateRuleId(),
            createdAt: new Date(),
            modifiedAt: new Date()
        };

        this.rules.push(newRule);
        await this.saveRules();
        return newRule;
    }

    async updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule | null> {
        const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1) {
            return null;
        }

        const oldRule = this.rules[ruleIndex];
        const updatedRule = {
            ...oldRule,
            ...updates,
            modifiedAt: new Date()
        };

        // Track modifications
        Object.keys(updates).forEach(key => {
            if (key !== 'modifiedAt' && oldRule[key as keyof Rule] !== updates[key as keyof Rule]) {
                this.modifications.push({
                    ruleId,
                    field: key as keyof Rule,
                    oldValue: oldRule[key as keyof Rule],
                    newValue: updates[key as keyof Rule],
                    timestamp: new Date()
                });
            }
        });

        this.rules[ruleIndex] = updatedRule;
        await this.saveRules();
        return updatedRule;
    }

    async deleteRule(ruleId: string): Promise<boolean> {
        const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1) {
            return false;
        }

        this.rules.splice(ruleIndex, 1);
        await this.saveRules();
        return true;
    }

    getRule(ruleId: string): Rule | null {
        return this.rules.find(r => r.id === ruleId) || null;
    }

    getAllRules(): Rule[] {
        return [...this.rules];
    }

    getFilteredRules(filter: RuleFilter): Rule[] {
        return this.rules.filter(rule => {
            if (filter.categories && filter.categories.length > 0 && !filter.categories.includes(rule.category)) {
                return false;
            }
            if (filter.urgencies && filter.urgencies.length > 0 && !filter.urgencies.includes(rule.urgency)) {
                return false;
            }
            if (filter.enabled !== undefined && rule.isEnabled !== filter.enabled) {
                return false;
            }
            if (filter.tags && filter.tags.length > 0) {
                const hasMatchingTag = filter.tags.some(tag => rule.tags.includes(tag));
                if (!hasMatchingTag) {
                    return false;
                }
            }
            if (filter.searchText) {
                const query = filter.searchText.toLowerCase();
                const matchesTitle = rule.title.toLowerCase().includes(query);
                const matchesDescription = rule.description.toLowerCase().includes(query);
                const matchesContent = rule.content.toLowerCase().includes(query);
                if (!matchesTitle && !matchesDescription && !matchesContent) {
                    return false;
                }
            }
            return true;
        });
    }

    async bulkUpdateRules(operation: RuleBulkOperation): Promise<Rule[]> {
        const affectedRules: Rule[] = [];

        for (const ruleId of operation.ruleIds) {
            if (operation.type === 'enable' || operation.type === 'disable') {
                const isEnabled = operation.type === 'enable';
                const updated = await this.updateRule(ruleId, { isEnabled });
                if (updated) affectedRules.push(updated);
            }
            if (operation.type === 'setUrgency' && operation.value) {
                const updated = await this.updateRule(ruleId, { urgency: operation.value });
                if (updated) affectedRules.push(updated);
            }
            if (operation.type === 'addTag' && operation.value) {
                const rule = this.getRule(ruleId);
                if (rule) {
                    const newTags = [...new Set([...rule.tags, operation.value])];
                    const updated = await this.updateRule(ruleId, { tags: newTags });
                    if (updated) affectedRules.push(updated);
                }
            }
            if (operation.type === 'removeTag' && operation.value) {
                const rule = this.getRule(ruleId);
                if (rule) {
                    const newTags = rule.tags.filter(tag => tag !== operation.value);
                    const updated = await this.updateRule(ruleId, { tags: newTags });
                    if (updated) affectedRules.push(updated);
                }
            }
            if (operation.type === 'delete') {
                await this.deleteRule(ruleId);
            }
        }

        return affectedRules;
    }

    async bulkDeleteRules(ruleIds: string[]): Promise<string[]> {
        const deletedIds: string[] = [];

        for (const ruleId of ruleIds) {
            const success = await this.deleteRule(ruleId);
            if (success) {
                deletedIds.push(ruleId);
            }
        }

        return deletedIds;
    }

    async exportRules(filter?: RuleFilter): Promise<string> {
        const rulesToExport = filter ? this.getFilteredRules(filter) : this.getAllRules();
        return JSON.stringify({
            version: '1.0',
            exportDate: new Date().toISOString(),
            rules: rulesToExport
        }, null, 2);
    }

    async importRules(jsonData: string, overwrite: boolean = false): Promise<{ imported: number; skipped: number; errors: string[] }> {
        const result = { imported: 0, skipped: 0, errors: [] as string[] };

        try {
            const data = JSON.parse(jsonData);
            const rules = data.rules || [];

            for (const ruleData of rules) {
                try {
                    if (!overwrite && this.getRule(ruleData.id)) {
                        result.skipped++;
                        continue;
                    }

                    await this.createRule({
                        title: ruleData.title,
                        description: ruleData.description,
                        content: ruleData.content,
                        category: ruleData.category,
                        urgency: ruleData.urgency,
                        isEnabled: ruleData.isEnabled !== false,
                        source: ruleData.source || { file: 'imported', section: 'import', mode: 'custom' },
                        appliesTo: ruleData.appliesTo || [],
                        tags: ruleData.tags || []
                    });
                    result.imported++;
                } catch (error) {
                    result.errors.push('Failed to import rule ' + ruleData.title + ': ' + (error as Error).message);
                }
            }
        } catch (error) {
            result.errors.push('Failed to parse JSON: ' + (error as Error).message);
        }

        return result;
    }

    async loadCurrentRuleSet(): Promise<RuleSet> {
        const rules = this.getAllRules();
        const enabledRules = rules.filter(r => r.isEnabled);

        const rulesByCategory: Record<RuleCategory, number> = {
            [RuleCategory.CODING_STANDARDS]: 0,
            [RuleCategory.WORKFLOW]: 0,
            [RuleCategory.SECURITY]: 0,
            [RuleCategory.DOCUMENTATION]: 0,
            [RuleCategory.TESTING]: 0,
            [RuleCategory.ARCHITECTURE]: 0,
            [RuleCategory.PERFORMANCE]: 0,
            [RuleCategory.UI_UX]: 0,
            [RuleCategory.DEPLOYMENT]: 0,
            [RuleCategory.CUSTOM]: 0
        };

        const rulesByUrgency: Record<RuleUrgency, number> = {
            [RuleUrgency.CRITICAL]: 0,
            [RuleUrgency.HIGH]: 0,
            [RuleUrgency.MEDIUM]: 0,
            [RuleUrgency.LOW]: 0,
            [RuleUrgency.INFO]: 0
        };

        rules.forEach(rule => {
            rulesByCategory[rule.category]++;
            rulesByUrgency[rule.urgency]++;
        });

        return {
            mode: 'custom',
            rules: enabledRules,
            totalRules: rules.length,
            enabledRules: enabledRules.length,
            rulesByCategory,
            rulesByUrgency
        };
    }

    private async loadRules(): Promise<void> {
        try {
            const rulesPath = path.join(this.workspaceRoot, '.vscode', 'ai-assistant-rules.json');
            if (fs.existsSync(rulesPath)) {
                const data = fs.readFileSync(rulesPath, 'utf8');
                const parsed = JSON.parse(data);
                this.rules = parsed.rules || [];
            }
        } catch (error) {
            console.error('Failed to load rules:', error);
            this.rules = [];
        }
    }

    private async saveRules(): Promise<void> {
        try {
            const vscodeDir = path.join(this.workspaceRoot, '.vscode');
            if (!fs.existsSync(vscodeDir)) {
                fs.mkdirSync(vscodeDir, { recursive: true });
            }

            const rulesPath = path.join(vscodeDir, 'ai-assistant-rules.json');
            const data = {
                version: '1.0',
                lastModified: new Date().toISOString(),
                rules: this.rules
            };

            fs.writeFileSync(rulesPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to save rules:', error);
            throw error;
        }
    }

    private generateRuleId(): string {
        return 'rule_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
