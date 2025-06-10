/**
 * Mode Configuration Types for Rule Pool Architecture
 * Defines JSON schema and interfaces for mode configurations that reference rules from the pool
 */

import { Rule } from './rulePoolTypes';

/**
 * Mode Configuration - Core structure for defining a mode using rule references
 */
export interface ModeConfiguration {
  /** Unique identifier for the mode */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Brief description of the mode's purpose */
  description: string;
  
  /** Mode type */
  type?: 'enterprise' | 'simplified' | 'custom';
  
  /** Mode metadata */
  metadata: ModeMetadata;
  
  /** Rules configuration for different output files */
  rules: ModeRulesConfiguration;
  
  /** Rule selection configuration (legacy support) */
  ruleSelection?: RuleSelection;
  
  /** Rule organization configuration (legacy support) */
  ruleOrganization?: RuleOrganization;
  
  /** File structure and automation configuration */
  structure: ModeStructureConfiguration;
  
  /** Template customization settings */
  templates: ModeTemplateConfiguration;
  
  /** Deployment and setup configuration */
  deployment: ModeDeploymentConfiguration;
}

/**
 * Mode metadata information
 */
export interface ModeMetadata {
  /** Mode version */
  version: string;
  
  /** Target project types (flutter, typescript, python, etc.) */
  projectTypes: string[];
  
  /** Project size/complexity target */
  complexity: 'basic' | 'medium' | 'enterprise';
  
  /** Estimated project duration in hours */
  estimatedHours: {
    min: number;
    max: number;
  };
  
  /** Mode author/maintainer */
  author?: string;
  
  /** Creation date */
  created: string;
  
  /** Last modification date */
  lastModified: string;
  
  /** Tags for categorization */
  tags: string[];
  
  /** Migration date (for migrated configurations) */
  migrationDate?: string;
  
  /** Original files (for migrated configurations) */
  originalFiles?: string[];
}

/**
 * Rules configuration for different output files
 */
export interface ModeRulesConfiguration {
  /** Rules for copilot-instructions.md */
  copilotInstructions: RuleSetConfiguration;
  
  /** Rules for project-rules.md */
  projectRules: RuleSetConfiguration;
  
  /** Additional rule sets for custom files */
  customFiles?: { [filename: string]: RuleSetConfiguration };
}

/**
 * Configuration for a set of rules in a specific output file
 */
export interface RuleSetConfiguration {
  /** Rule selection criteria */
  selection: RuleSelection;
  
  /** Rule ordering and grouping */
  organization: RuleOrganization;
  
  /** Custom content to include */
  customContent?: CustomContent[];
  
  /** Template overrides */
  templateOverrides?: TemplateOverrides;
}

/**
 * Rule selection criteria and methods
 */
export interface RuleSelection {
  /** Include all rules matching these criteria */
  include?: RuleSelectionCriteria[];
  
  /** Exclude specific rules or criteria */
  exclude?: RuleSelectionCriteria[];
  
  /** Specific rule IDs to include */
  explicitIncludes?: string[];
  
  /** Include rules by IDs (alias for explicitIncludes) */
  includeRules?: string[];
  
  /** Specific rule IDs to exclude */
  explicitExcludes?: string[];
  
  /** Exclude rules by IDs (alias for explicitExcludes) */
  excludeRules?: string[];
  
  /** Required rule categories */
  requiredCategories?: string[];
  
  /** Include categories */
  includeCategories?: string[];
  
  /** Categories to filter by */
  categories?: string[];
  
  /** Maximum number of rules */
  maxRules?: number;
  
  /** Minimum urgency level */
  minUrgency?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  /** Minimum urgency level (alias) */
  minimumUrgency?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  /** Urgency filter configuration */
  urgencyFilter?: {
    minimum?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    maximum?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
}

/**
 * Criteria for selecting rules
 */
export interface RuleSelectionCriteria {
  /** Rule categories to match */
  categories?: string[];
  
  /** Rule urgency levels to match */
  urgency?: ('INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  
  /** Project types to match */
  projectTypes?: string[];
  
  /** Tags to match */
  tags?: string[];
  
  /** Source files to match */
  sources?: string[];
  
  /** Text content to search for */
  contentSearch?: string;
  
  /** Title patterns to match */
  titlePattern?: string;
}

/**
 * Rule organization and ordering configuration
 */
export interface RuleOrganization {
  /** How to group rules */
  groupBy: 'category' | 'urgency' | 'source' | 'none' | 'custom';
  
  /** Custom grouping configuration */
  customGroups?: RuleGroup[];
  
  /** Ordering within groups */
  orderBy: 'urgency' | 'title' | 'created' | 'custom';
  
  /** Sort by (alias for orderBy) */
  sortBy?: 'urgency' | 'title' | 'created' | 'custom';
  
  /** Custom ordering specification */
  customOrder?: string[];
  
  /** Whether to include group headers */
  includeHeaders: boolean;
  
  /** Custom header templates */
  headerTemplates?: { [groupName: string]: string };
}

/**
 * Custom rule group definition
 */
export interface RuleGroup {
  /** Group identifier */
  id: string;
  
  /** Group display name */
  name: string;
  
  /** Header template for this group */
  header?: string;
  
  /** Rule selection criteria for this group */
  criteria: RuleSelectionCriteria;
  
  /** Order within the overall structure */
  order: number;
}

/**
 * Custom content that can be injected into templates
 */
export interface CustomContent {
  /** Content identifier */
  id: string;
  
  /** Content type */
  type: 'markdown' | 'text' | 'template';
  
  /** Position relative to rules */
  position: 'before' | 'after' | 'replace';
  
  /** Target location in template */
  target?: string;
  
  /** Content text or template */
  content: string;
  
  /** Order when multiple custom content items exist */
  order: number;
}

/**
 * Template override configurations
 */
export interface TemplateOverrides {
  /** Override header template */
  header?: string;
  
  /** Override footer template */
  footer?: string;
  
  /** Override rule rendering template */
  ruleTemplate?: string;
  
  /** Override group header template */
  groupHeaderTemplate?: string;
  
  /** Custom variables for template rendering */
  variables?: { [key: string]: any };
}

/**
 * Mode structure configuration (directories, files, scripts)
 */
export interface ModeStructureConfiguration {
  /** Directories to create */
  directories: DirectoryConfiguration[];
  
  /** Scripts to include */
  scripts: ScriptConfiguration[];
  
  /** Automation configurations */
  automation: AutomationConfiguration[];
  
  /** Additional files to copy or generate */
  additionalFiles?: FileConfiguration[];
  
  /** Include automation features */
  includeAutomation?: boolean;
  
  /** Include scripts */
  includeScripts?: boolean;
  
  /** Task management level */
  taskManagementLevel?: 'basic' | 'enterprise' | 'simplified';
  
  /** Include task management */
  includeTaskManagement?: boolean;
  
  /** Include automation scripts */
  includeAutomationScripts?: boolean;
  
  /** Include project map */
  includeProjectMap?: boolean;
  
  /** Custom directories */
  customDirectories?: string[];
  
  /** File naming configuration */
  fileNaming?: {
    copilotInstructions?: string;
    projectRules?: string;
  };
}

/**
 * Directory structure configuration
 */
export interface DirectoryConfiguration {
  /** Directory path relative to project root */
  path: string;
  
  /** Directory description */
  description?: string;
  
  /** Whether directory is required */
  required: boolean;
  
  /** Subdirectories */
  subdirectories?: string[];
  
  /** Example or template files */
  templateFiles?: string[];
}

/**
 * Script configuration
 */
export interface ScriptConfiguration {
  /** Script filename */
  filename: string;
  
  /** Script source path in templates */
  sourcePath: string;
  
  /** Target path in deployment */
  targetPath: string;
  
  /** Script description */
  description: string;
  
  /** Execution permissions */
  executable: boolean;
  
  /** Dependencies */
  dependencies?: string[];
}

/**
 * Automation configuration
 */
export interface AutomationConfiguration {
  /** Automation type */
  type: 'script' | 'task' | 'git-hook' | 'monitor';
  
  /** Automation identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Source configuration path */
  sourcePath: string;
  
  /** Target deployment path */
  targetPath: string;
  
  /** Trigger conditions */
  triggers?: AutomationTrigger[];
  
  /** Dependencies */
  dependencies?: string[];
}

/**
 * Automation trigger configuration
 */
export interface AutomationTrigger {
  /** Trigger type */
  type: 'file-change' | 'time-interval' | 'command' | 'git-event';
  
  /** Trigger configuration */
  config: any;
}

/**
 * Additional file configuration
 */
export interface FileConfiguration {
  /** Source file path */
  sourcePath: string;
  
  /** Target file path */
  targetPath: string;
  
  /** File type */
  type: 'copy' | 'template' | 'generate';
  
  /** Template variables if type is template */
  variables?: { [key: string]: any };
}

/**
 * Mode template configuration
 */
export interface ModeTemplateConfiguration {
  /** Base template set to use */
  baseTemplate: string;
  
  /** Custom template overrides */
  overrides?: TemplateOverrideSet;
  
  /** Template variables */
  variables: { [key: string]: any };
  
  /** Template inheritance */
  inherits?: string[];
  
  /** Copilot instructions template */
  copilotInstructions?: string;
  
  /** Project rules template */
  projectRules?: string;
  
  /** Instructions template */
  instructionsTemplate?: string;
  
  /** Custom templates */
  customTemplates?: { [key: string]: any };
}

/**
 * Template override set
 */
export interface TemplateOverrideSet {
  /** Copilot instructions template */
  copilotInstructions?: string;
  
  /** Project rules template */
  projectRules?: string;
  
  /** Custom file templates */
  customFiles?: { [filename: string]: string };
}

/**
 * Mode deployment configuration
 */
export interface ModeDeploymentConfiguration {
  /** Target deployment structure */
  structure: DeploymentStructure;
  
  /** Post-deployment actions */
  postDeployment?: DeploymentAction[];
  
  /** Validation rules */
  validation?: ValidationRule[];
  
  /** Target directory */
  targetDirectory?: string;
  
  /** Backup existing files */
  backupExisting?: boolean;
  
  /** Validate after deployment */
  validateAfterDeployment?: boolean;
  
  /** Cleanup on failure */
  cleanupOnFailure?: boolean;
  
  /** Custom deployment steps */
  customDeploymentSteps?: any[];
}

/**
 * Deployment structure specification
 */
export interface DeploymentStructure {
  /** Root directory for deployment */
  root: string;
  
  /** GitHub-specific configurations */
  github?: GitHubConfiguration;
  
  /** Task system configurations */
  tasks?: TaskSystemConfiguration;
  
  /** Additional deployment paths */
  additionalPaths?: { [key: string]: string };
}

/**
 * GitHub-specific deployment configuration
 */
export interface GitHubConfiguration {
  /** Deploy to .github directory */
  useGitHubDir: boolean;
  
  /** Specific GitHub files to deploy */
  files: GitHubFile[];
}

/**
 * GitHub file configuration
 */
export interface GitHubFile {
  /** Source filename */
  source: string;
  
  /** Target filename in .github */
  target: string;
  
  /** File type */
  type: 'copilot-instructions' | 'project-rules' | 'workflow' | 'template';
}

/**
 * Task system configuration
 */
export interface TaskSystemConfiguration {
  /** Task directory structure */
  structure: string[];
  
  /** Initial task files */
  initialFiles?: string[];
  
  /** Task system type */
  type: 'simple' | 'enterprise';
}

/**
 * Post-deployment action
 */
export interface DeploymentAction {
  /** Action type */
  type: 'script' | 'command' | 'validation' | 'notification';
  
  /** Action configuration */
  config: any;
  
  /** Execution order */
  order: number;
}

/**
 * Validation rule for deployment
 */
export interface ValidationRule {
  /** Rule type */
  type: 'file-exists' | 'content-match' | 'script-validation' | 'custom';
  
  /** Rule configuration */
  config: any;
  
  /** Error message if validation fails */
  errorMessage: string;
}

/**
 * Mode configuration validation result
 */
export interface ModeConfigurationValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  
  /** Validation errors */
  errors: ValidationError[];
  
  /** Validation warnings */
  warnings: ValidationWarning[];
  
  /** Rule resolution results */
  ruleResolution?: RuleResolutionResult;
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error code */
  code: string;
  
  /** Error message */
  message: string;
  
  /** Configuration path where error occurred */
  path: string;
  
  /** Error severity */
  severity: 'error' | 'warning';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  
  /** Warning message */
  message: string;
  
  /** Configuration path where warning occurred */
  path: string;
}

/**
 * Rule resolution result
 */
export interface RuleResolutionResult {
  /** Successfully resolved rule IDs */
  resolvedRules: string[];
  
  /** Failed rule resolutions */
  failedResolutions: FailedRuleResolution[];
  
  /** Total rules found */
  totalRules: number;
  
  /** Rules by category */
  rulesByCategory: { [category: string]: number };
  
  /** Rules by urgency */
  rulesByUrgency: { [urgency: string]: number };
}

/**
 * Failed rule resolution
 */
export interface FailedRuleResolution {
  /** Selection criteria that failed */
  criteria: RuleSelectionCriteria;
  
  /** Reason for failure */
  reason: string;
  
  /** Suggested alternatives */
  suggestions?: string[];
}

/**
 * Mode configuration loading options
 */
export interface ModeConfigurationLoadOptions {
  /** Whether to validate rule references */
  validateRules?: boolean;
  
  /** Whether to resolve template inheritance */
  resolveInheritance?: boolean;
  
  /** Whether to expand rule selections */
  expandSelections?: boolean;
  
  /** Custom validation rules */
  customValidations?: ValidationRule[];
}

/**
 * Mode configuration export options
 */
export interface ModeConfigurationExportOptions {
  /** Include rule definitions inline */
  includeRuleDefinitions?: boolean;
  
  /** Export format */
  format: 'json' | 'yaml' | 'typescript';
  
  /** Include metadata */
  includeMetadata?: boolean;
  
  /** Minify output */
  minify?: boolean;
}

/**
 * Predefined mode types
 */
export type PredefinedModeType = 'enterprise' | 'simplified' | 'custom';
export type ModeType = PredefinedModeType;

/**
 * Mode configuration defaults for different mode types
 */
export interface ModeConfigurationDefaults {
  [key: string]: Partial<ModeConfiguration>;
}
