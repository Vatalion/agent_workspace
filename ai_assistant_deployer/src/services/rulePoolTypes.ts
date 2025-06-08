/**
 * Rule Pool Architecture - Core Type Definitions
 * 
 * This file defines the comprehensive type system for the Rule Pool Architecture
 * that will replace the current embedded rule approach in modes.
 */

// Core rule urgency levels based on analysis of existing patterns
export enum RuleUrgency {
  CRITICAL = 'CRITICAL',    // "MUST", "NEVER", "MANDATORY", "REQUIRED"
  HIGH = 'HIGH',           // "SHOULD", "NON-NEGOTIABLE"
  MEDIUM = 'MEDIUM',       // Standard practices and guidelines
  LOW = 'LOW',             // Suggestions and recommendations
  INFO = 'INFO'            // Documentation and explanatory content
}

// Rule categories identified from existing mode analysis
export enum RuleCategory {
  SOLID_PRINCIPLES = 'SOLID_PRINCIPLES',
  CLEAN_ARCHITECTURE = 'CLEAN_ARCHITECTURE',
  FILE_PRACTICES = 'FILE_PRACTICES',
  TESTING_REQUIREMENTS = 'TESTING_REQUIREMENTS',
  BACKUP_STRATEGY = 'BACKUP_STRATEGY',
  STATE_MANAGEMENT = 'STATE_MANAGEMENT',
  PERFORMANCE_GUIDELINES = 'PERFORMANCE_GUIDELINES',
  TASK_MANAGEMENT = 'TASK_MANAGEMENT',
  SECURITY_RULES = 'SECURITY_RULES',
  DEVELOPMENT_WORKFLOW = 'DEVELOPMENT_WORKFLOW',
  REFACTORING_GUIDELINES = 'REFACTORING_GUIDELINES',
  ENTERPRISE_FEATURES = 'ENTERPRISE_FEATURES',
  MODE_SWITCHING = 'MODE_SWITCHING',
  CUSTOM = 'CUSTOM'
}

// Rule content format types
export enum RuleContentType {
  MARKDOWN = 'MARKDOWN',
  CHECKLIST = 'CHECKLIST',
  CODE_SNIPPET = 'CODE_SNIPPET',
  SHELL_COMMAND = 'SHELL_COMMAND',
  WORKFLOW = 'WORKFLOW'
}

// Supported project types that rules can apply to
export enum ProjectType {
  FLUTTER = 'FLUTTER',
  TYPESCRIPT = 'TYPESCRIPT',
  JAVASCRIPT = 'JAVASCRIPT',
  PYTHON = 'PYTHON',
  REACT = 'REACT',
  ANGULAR = 'ANGULAR',
  VUE = 'VUE',
  NODE = 'NODE',
  ALL = 'ALL'
}

// Core rule interface - the fundamental unit of the rule pool
export interface Rule {
  // Metadata
  id: string;                           // Unique identifier (UUID)
  title: string;                        // Human-readable title
  description: string;                  // Brief description of what the rule does
  category: RuleCategory;               // Category for organization
  urgency: RuleUrgency;                // Urgency level for prioritization
  version: string;                      // Semantic version for rule evolution
  
  // Content
  content: string;                      // Main rule content (markdown by default)
  contentType: RuleContentType;        // Type of content format
  tags: string[];                       // Tags for filtering and search
  appliesTo: ProjectType[];            // Project types this rule applies to
  
  // Sources information
  sources?: string[];                   // Source references or documentation
  
  // Metadata and tracking
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last update timestamp
  author: string;                      // Rule author/creator
  isCustom: boolean;                   // True if user-created, false if predefined
  isActive: boolean;                   // Whether rule is currently active
  
  // Source tracking (for migration from existing modes)
  sourceFile?: string;                 // Original file path (for migration)
  sourceSection?: string;              // Section within source file
  sourceModes?: string[];              // Original modes this rule came from
  
  // Dependencies and relationships
  dependsOn?: string[];                // Rule IDs this rule depends on
  conflicts?: string[];                // Rule IDs this rule conflicts with
  supersedes?: string[];               // Rule IDs this rule replaces
  
  // Validation and constraints
  validationRules?: RuleValidation[];  // Custom validation rules
  constraints?: RuleConstraint[];      // Constraints for rule application
}

// Rule validation definition
export interface RuleValidation {
  type: 'regex' | 'length' | 'custom';
  rule: string;                        // Validation rule expression
  message: string;                     // Error message if validation fails
}

// Rule constraints for conditional application
export interface RuleConstraint {
  type: 'file_exists' | 'project_type' | 'mode' | 'custom';
  condition: string;                   // Constraint condition
  required: boolean;                   // Whether constraint must be met
}

// Rule pool interface - manages collections of rules
export interface RulePool {
  rules: Map<string, Rule>;            // All rules indexed by ID
  categories: Map<RuleCategory, string[]>; // Rule IDs grouped by category
  tags: Map<string, string[]>;         // Rule IDs grouped by tags
  metadata: RulePoolMetadata;          // Pool-level metadata
}

// Rule pool metadata
export interface RulePoolMetadata {
  version: string;                     // Pool schema version
  lastUpdated: Date;                   // Last update timestamp
  totalRules: number;                  // Total number of rules
  customRules: number;                 // Number of custom rules
  predefinedRules: number;             // Number of predefined rules
  source: 'migration' | 'fresh' | 'mixed'; // Source of the pool
}

// Mode configuration - how modes reference rules from the pool
export interface ModeConfiguration {
  id: string;                          // Unique mode identifier
  name: string;                        // Human-readable mode name
  description: string;                 // Mode description
  version: string;                     // Mode configuration version
  
  // Rule selection and ordering
  ruleIds: string[];                   // Ordered list of rule IDs to include
  ruleOverrides: Map<string, RuleOverride>; // Rule-specific overrides
  excludedRuleIds: string[];           // Rule IDs to explicitly exclude
  
  // Mode-specific settings
  projectTypes: ProjectType[];         // Supported project types
  isDefault: boolean;                  // Whether this is a default mode
  isCustom: boolean;                   // Whether this is a user-created mode
  
  // Generation settings
  generateInstructions: boolean;       // Generate copilot-instructions.md
  generateProjectRules: boolean;       // Generate project-rules.md
  generateAutomation: boolean;         // Generate automation scripts
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  author: string;
}

// Rule overrides for mode-specific customization
export interface RuleOverride {
  ruleId: string;                      // Target rule ID
  title?: string;                      // Override title
  content?: string;                    // Override content
  urgency?: RuleUrgency;              // Override urgency
  tags?: string[];                     // Additional tags
  isDisabled?: boolean;                // Disable rule in this mode
}

// Rule search and filtering
export interface RuleSearchCriteria {
  query?: string;                      // Text search query
  categories?: RuleCategory[];         // Filter by categories
  urgencies?: RuleUrgency[];          // Filter by urgency levels
  tags?: string[];                     // Filter by tags
  projectTypes?: ProjectType[];        // Filter by project types
  isCustom?: boolean;                  // Filter custom vs predefined
  isActive?: boolean;                  // Filter active vs inactive
  author?: string;                     // Filter by author
}

// Rule search results
export interface RuleSearchResults {
  rules: Rule[];                       // Matching rules
  totalCount: number;                  // Total number of matches
  facets: {                           // Faceted search results
    categories: Map<RuleCategory, number>;
    urgencies: Map<RuleUrgency, number>;
    tags: Map<string, number>;
    projectTypes: Map<ProjectType, number>;
  };
}

// Rule rendering context
export interface RuleRenderContext {
  mode: ModeConfiguration;             // Target mode configuration
  projectType: ProjectType;            // Target project type
  outputFormat: 'markdown' | 'html' | 'json'; // Output format
  includeMetadata: boolean;            // Include rule metadata
  groupByCategory: boolean;            // Group rules by category
  sortByUrgency: boolean;              // Sort by urgency level
}

// Rule validation result
export interface RuleValidationResult {
  isValid: boolean;                    // Overall validation result
  errors: RuleValidationError[];       // Validation errors
  warnings: RuleValidationWarning[];   // Validation warnings
}

// Rule validation error
export interface RuleValidationError {
  field: string;                       // Field with error
  message: string;                     // Error message
  code: string;                        // Error code
}

// Rule validation warning
export interface RuleValidationWarning {
  field: string;                       // Field with warning
  message: string;                     // Warning message
  code: string;                        // Warning code
}

// Rule export/import formats
export interface RuleExportData {
  version: string;                     // Export format version
  exportedAt: Date;                    // Export timestamp
  rules: Rule[];                       // Exported rules
  modes?: ModeConfiguration[];         // Exported mode configurations
  metadata: {                          // Export metadata
    source: string;
    totalRules: number;
    totalModes: number;
  };
}

// Rule statistics for analytics
export interface RuleStatistics {
  totalRules: number;
  rulesByCategory: Map<RuleCategory, number>;
  rulesByUrgency: Map<RuleUrgency, number>;
  rulesByProjectType: Map<ProjectType, number>;
  customRules: number;
  predefinedRules: number;
  activeRules: number;
  inactiveRules: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
  recentlyUpdated: Rule[];
}
