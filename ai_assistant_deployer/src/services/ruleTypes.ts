export interface Rule {
    id: string;
    title: string;
    description: string;
    content: string;
    category: RuleCategory;
    urgency: RuleUrgency;
    isEnabled: boolean;
    source: RuleSource;
    tags: string[];
    createdAt: Date;
    modifiedAt: Date;
    appliesTo: string[]; // project types, file types, etc.
}

export interface RuleSource {
    file: string;
    section: string;
    lineStart?: number;
    lineEnd?: number;
    mode: string; // which mode this rule belongs to
}

export enum RuleCategory {
    CODING_STANDARDS = 'coding-standards',
    WORKFLOW = 'workflow',
    SECURITY = 'security',
    DOCUMENTATION = 'documentation',
    TESTING = 'testing',
    ARCHITECTURE = 'architecture',
    PERFORMANCE = 'performance',
    UI_UX = 'ui-ux',
    DEPLOYMENT = 'deployment',
    CUSTOM = 'custom'
}

export enum RuleUrgency {
    CRITICAL = 'critical',      // Must follow - blocking
    HIGH = 'high',              // Should follow - important
    MEDIUM = 'medium',          // Good to follow - recommended
    LOW = 'low',                // Optional - suggestion
    INFO = 'info'               // Informational only
}

export interface RuleSet {
    mode: string;
    rules: Rule[];
    totalRules: number;
    enabledRules: number;
    rulesByCategory: Record<RuleCategory, number>;
    rulesByUrgency: Record<RuleUrgency, number>;
}

export interface RuleFilter {
    categories?: RuleCategory[];
    urgencies?: RuleUrgency[];
    enabled?: boolean;
    searchText?: string;
    tags?: string[];
}

export interface RuleBulkOperation {
    type: 'enable' | 'disable' | 'setUrgency' | 'addTag' | 'removeTag' | 'delete';
    ruleIds: string[];
    value?: any; // for setUrgency, addTag, etc.
}

export interface RuleTemplate {
    id: string;
    name: string;
    description: string;
    category: RuleCategory;
    defaultUrgency: RuleUrgency;
    template: string;
    variables: RuleTemplateVariable[];
}

export interface RuleTemplateVariable {
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: any[]; // for select type
}

export interface RuleAnalytics {
    mostUsedCategories: Array<{ category: RuleCategory; count: number }>;
    urgencyDistribution: Record<RuleUrgency, number>;
    recentlyModified: Rule[];
    disabledRules: Rule[];
    conflictingRules: Array<{ rule1: Rule; rule2: Rule; conflict: string }>;
}
