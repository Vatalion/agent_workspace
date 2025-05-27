#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Error data schemas
const FlutterErrorSchema = z.object({
  timestamp: z.string(),
  errorType: z.enum([
    "widget_build",
    "state_management", 
    "navigation",
    "http_api",
    "platform_channel",
    "memory_performance",
    "framework",
    "general"
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  message: z.string(),
  stackTrace: z.string().optional(),
  context: z.object({
    widgetPath: z.string().optional(),
    routeName: z.string().optional(),
    stateName: z.string().optional(),
    apiEndpoint: z.string().optional(),
    userAction: z.string().optional(),
  }).optional(),
  deviceInfo: z.object({
    platform: z.enum(["android", "ios", "web", "desktop"]),
    osVersion: z.string().optional(),
    appVersion: z.string().optional(),
    flutterVersion: z.string().optional(),
  }).optional(),
  reproduction: z.object({
    steps: z.array(z.string()).optional(),
    frequency: z.enum(["always", "frequent", "occasional", "rare"]).optional(),
    conditions: z.string().optional(),
  }).optional(),
});

const ErrorAnalysisSchema = z.object({
  errorData: FlutterErrorSchema,
  analysisRequest: z.enum([
    "root_cause",
    "debugging_steps", 
    "similar_errors",
    "fix_suggestions",
    "prevention_tips"
  ]),
});

// In-memory error storage for this session
interface ErrorEvent {
  id: string;
  error: z.infer<typeof FlutterErrorSchema>;
  capturedAt: Date;
  analyzed: boolean;
}

class FlutterErrorTransportServer {
  private errorEvents: Map<string, ErrorEvent> = new Map();
  private errorPatterns: Map<string, number> = new Map();

  constructor() {
    console.error("🚀 Flutter Error Transport MCP Server initializing...");
  }

  captureError(errorData: z.infer<typeof FlutterErrorSchema>): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorEvent: ErrorEvent = {
      id: errorId,
      error: errorData,
      capturedAt: new Date(),
      analyzed: false,
    };

    this.errorEvents.set(errorId, errorEvent);
    
    // Track error patterns
    const patternKey = `${errorData.errorType}:${errorData.severity}`;
    this.errorPatterns.set(patternKey, (this.errorPatterns.get(patternKey) || 0) + 1);

    console.error(`📥 Captured Flutter error: ${errorId} (${errorData.errorType})`);
    
    return errorId;
  }

  analyzeError(errorId: string, analysisType: string): string {
    const errorEvent = this.errorEvents.get(errorId);
    if (!errorEvent) {
      return `Error ${errorId} not found in capture history.`;
    }

    const { error } = errorEvent;
    errorEvent.analyzed = true;

    switch (analysisType) {
      case "root_cause":
        return this.generateRootCauseAnalysis(error);
      case "debugging_steps":
        return this.generateDebuggingSteps(error);
      case "similar_errors":
        return this.findSimilarErrors(error);
      case "fix_suggestions":
        return this.generateFixSuggestions(error);
      case "prevention_tips":
        return this.generatePreventionTips(error);
      default:
        return "Unknown analysis type requested.";
    }
  }

  private generateRootCauseAnalysis(error: z.infer<typeof FlutterErrorSchema>): string {
    const analysis = [`🔍 **Root Cause Analysis for ${error.errorType} Error**\n`];
    
    switch (error.errorType) {
      case "widget_build":
        analysis.push(
          "**Likely Cause**: Widget build method throwing exception",
          "- Check for null values in widget properties",
          "- Verify state is properly initialized before build",
          "- Look for async operations in build method",
          "- Ensure context is valid when building"
        );
        break;
      
      case "state_management":
        analysis.push(
          "**Likely Cause**: State management flow issue",
          "- Bloc/Cubit state not properly handled",
          "- Provider context missing or disposed",
          "- State mutation outside proper methods",
          "- Race condition in state updates"
        );
        break;

      case "navigation":
        analysis.push(
          "**Likely Cause**: Navigation stack corruption",
          "- Invalid route name or arguments",
          "- Navigator context disposed",
          "- Duplicate route push without pop",
          "- Missing route in route table"
        );
        break;

      case "http_api":
        analysis.push(
          "**Likely Cause**: Network or API integration issue",
          "- Network connectivity problems",
          "- Invalid API endpoint or parameters",
          "- Authentication/authorization failure",
          "- Response parsing error",
          "- Timeout or connection refused"
        );
        break;

      default:
        analysis.push(
          "**Generic Analysis**:",
          "- Check error message and stack trace carefully",
          "- Look for patterns in error occurrence",
          "- Verify environment and dependencies",
          "- Test in isolation if possible"
        );
    }

    if (error.context?.widgetPath) {
      analysis.push(`\n**Widget Context**: ${error.context.widgetPath}`);
    }

    if (error.stackTrace) {
      analysis.push(`\n**Stack Trace Available**: Yes - focus on the top frames for immediate cause`);
    }

    return analysis.join("\n");
  }

  private generateDebuggingSteps(error: z.infer<typeof FlutterErrorSchema>): string {
    const steps = [`🛠️ **Debugging Steps for ${error.errorType} Error**\n`];
    
    steps.push("**Immediate Actions:**");
    steps.push("1. 📋 Copy the full error message and stack trace");
    steps.push("2. 🔄 Try to reproduce the error consistently");
    steps.push("3. 📱 Test on different devices/platforms if possible");
    
    switch (error.errorType) {
      case "widget_build":
        steps.push(
          "\n**Widget Build Debugging:**",
          "4. Add debug prints in build method",
          "5. Check widget tree structure with Flutter Inspector",
          "6. Verify all required parameters are non-null",
          "7. Use debugDumpApp() to inspect widget tree",
          "8. Add error boundary widgets around problematic areas"
        );
        break;
        
      case "state_management":
        steps.push(
          "\n**State Management Debugging:**", 
          "4. Add logging to state transitions",
          "5. Check provider/bloc scope and lifecycle",
          "6. Verify state updates are on main thread",
          "7. Use Redux DevTools or Bloc Inspector",
          "8. Test state changes in isolation"
        );
        break;

      case "http_api":
        steps.push(
          "\n**API Error Debugging:**",
          "4. Test API endpoint with Postman/curl",
          "5. Check network connectivity and permissions",
          "6. Verify request headers and authentication",
          "7. Add detailed logging for requests/responses",
          "8. Test with different network conditions"
        );
        break;
    }

    steps.push(
      "\n**Advanced Debugging:**",
      "9. 🐛 Use Flutter debugger with breakpoints",
      "10. 📊 Check memory usage and performance",
      "11. 🧪 Write unit tests to isolate the issue",
      "12. 🔍 Enable verbose logging in debug mode"
    );

    return steps.join("\n");
  }

  private findSimilarErrors(error: z.infer<typeof FlutterErrorSchema>): string {
    const similarErrors = Array.from(this.errorEvents.values())
      .filter(event => 
        event.error.errorType === error.errorType && 
        event.id !== `temp_${Date.now()}`
      )
      .slice(0, 5);

    if (similarErrors.length === 0) {
      return "🔍 **Similar Errors**: No similar errors found in current session.";
    }

    const analysis = ["🔍 **Similar Errors Found:**\n"];
    
    similarErrors.forEach((event, index) => {
      analysis.push(`${index + 1}. **${event.error.errorType}** (${event.error.severity})`);
      analysis.push(`   Message: ${event.error.message.substring(0, 100)}...`);
      analysis.push(`   Time: ${event.capturedAt.toLocaleTimeString()}`);
      if (event.error.context) {
        analysis.push(`   Context: ${JSON.stringify(event.error.context)}`);
      }
      analysis.push("");
    });

    const patternKey = `${error.errorType}:${error.severity}`;
    const occurrences = this.errorPatterns.get(patternKey) || 0;
    analysis.push(`**Pattern Analysis**: This ${error.errorType} error has occurred ${occurrences} times.`);

    return analysis.join("\n");
  }

  private generateFixSuggestions(error: z.infer<typeof FlutterErrorSchema>): string {
    const suggestions = [`💡 **Fix Suggestions for ${error.errorType} Error**\n`];

    switch (error.errorType) {
      case "widget_build":
        suggestions.push(
          "**Common Fixes:**",
          "1. Add null checks: `widget?.property ?? defaultValue`",
          "2. Use FutureBuilder/StreamBuilder for async data",
          "3. Wrap widgets with error boundaries",
          "4. Initialize state before first build",
          "",
          "**Code Example:**",
          "```dart",
          "Widget build(BuildContext context) {",
          "  return data != null ? MyWidget(data: data!) : LoadingWidget();",
          "}",
          "```"
        );
        break;

      case "state_management":
        suggestions.push(
          "**State Management Fixes:**",
          "1. Use BlocListener for side effects",
          "2. Implement proper error states in your bloc",
          "3. Use context.read() instead of context.watch() for events",
          "4. Add try-catch blocks around state emissions",
          "",
          "**Code Example:**",
          "```dart",
          "try {",
          "  emit(LoadingState());",
          "  final data = await repository.fetchData();",
          "  emit(LoadedState(data));",
          "} catch (e) {",
          "  emit(ErrorState(e.toString()));",
          "}",
          "```"
        );
        break;

      case "http_api":
        suggestions.push(
          "**API Integration Fixes:**",
          "1. Add proper error handling with try-catch",
          "2. Implement retry logic with exponential backoff",
          "3. Validate responses before parsing",
          "4. Use Dio interceptors for consistent error handling",
          "",
          "**Code Example:**",
          "```dart",
          "try {",
          "  final response = await dio.get('/api/data');",
          "  return DataModel.fromJson(response.data);",
          "} on DioException catch (e) {",
          "  throw ApiException(e.message);",
          "}",
          "```"
        );
        break;

      default:
        suggestions.push(
          "**General Fixes:**",
          "1. Add comprehensive error logging",
          "2. Implement graceful degradation",
          "3. Use assert statements for debug mode",
          "4. Add user-friendly error messages"
        );
    }

    suggestions.push(
      "\n**Prevention Strategies:**",
      "• Use static analysis tools (dart analyze)",
      "• Write unit and widget tests",
      "• Implement error monitoring in production",
      "• Regular code reviews focusing on error handling"
    );

    return suggestions.join("\n");
  }

  private generatePreventionTips(error: z.infer<typeof FlutterErrorSchema>): string {
    return `🛡️ **Prevention Tips for ${error.errorType} Errors**

**Development Practices:**
• Use strict null safety and sound type system
• Implement comprehensive unit and widget tests
• Use Flutter's built-in error reporting tools
• Regular static analysis with dart analyze

**Code Quality:**
• Add error boundaries around critical UI components
• Implement proper logging throughout the app
• Use design patterns that handle errors gracefully
• Document error handling strategies for the team

**Monitoring & Detection:**
• Set up error monitoring (Sentry, Crashlytics)
• Add performance monitoring
• Use Flutter's built-in error reporting
• Implement user feedback collection

**Architecture:**
• Use dependency injection for testability
• Separate concerns with clean architecture
• Implement retry mechanisms for network calls
• Design for offline-first capabilities

**Flutter-Specific:**
• Keep build methods pure and fast
• Use proper lifecycle management
• Handle platform differences gracefully
• Test on multiple devices and OS versions`;
  }

  getErrorSummary(): string {
    const totalErrors = this.errorEvents.size;
    const errorsByType = new Map<string, number>();
    const errorsBySeverity = new Map<string, number>();

    this.errorEvents.forEach(event => {
      const type = event.error.errorType;
      const severity = event.error.severity;
      
      errorsByType.set(type, (errorsByType.get(type) || 0) + 1);
      errorsBySeverity.set(severity, (errorsBySeverity.get(severity) || 0) + 1);
    });

    const summary = [
      "📊 **Error Transport Session Summary**\n",
      `**Total Errors Captured**: ${totalErrors}`,
      "",
      "**Errors by Type:**"
    ];

    for (const [type, count] of errorsByType) {
      summary.push(`• ${type}: ${count}`);
    }

    summary.push("", "**Errors by Severity:**");
    for (const [severity, count] of errorsBySeverity) {
      summary.push(`• ${severity}: ${count}`);
    }

    const analyzedCount = Array.from(this.errorEvents.values()).filter(e => e.analyzed).length;
    summary.push(`\n**Analysis Status**: ${analyzedCount}/${totalErrors} errors analyzed`);

    return summary.join("\n");
  }
}

// Create server instance
const server = new Server(
  {
    name: "flutter-error-transport",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize error transport server
const errorTransport = new FlutterErrorTransportServer();

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "capture_flutter_error",
        description: "Capture and categorize a Flutter runtime error for analysis and debugging assistance",
        inputSchema: {
          type: "object",
          properties: {
            timestamp: {
              type: "string",
              description: "ISO timestamp when the error occurred"
            },
            errorType: {
              type: "string",
              enum: ["widget_build", "state_management", "navigation", "http_api", "platform_channel", "memory_performance", "framework", "general"],
              description: "Category of the Flutter error"
            },
            severity: {
              type: "string", 
              enum: ["low", "medium", "high", "critical"],
              description: "Severity level of the error"
            },
            message: {
              type: "string",
              description: "The error message text"
            },
            stackTrace: {
              type: "string",
              description: "Stack trace information (optional)"
            },
            context: {
              type: "object",
              description: "Additional context about where/when the error occurred",
              properties: {
                widgetPath: { type: "string" },
                routeName: { type: "string" },
                stateName: { type: "string" },
                apiEndpoint: { type: "string" },
                userAction: { type: "string" }
              }
            },
            deviceInfo: {
              type: "object",
              description: "Device and platform information",
              properties: {
                platform: { 
                  type: "string",
                  enum: ["android", "ios", "web", "desktop"]
                },
                osVersion: { type: "string" },
                appVersion: { type: "string" },
                flutterVersion: { type: "string" }
              }
            },
            reproduction: {
              type: "object",
              description: "Information about reproducing the error",
              properties: {
                steps: { 
                  type: "array",
                  items: { type: "string" }
                },
                frequency: {
                  type: "string",
                  enum: ["always", "frequent", "occasional", "rare"]
                },
                conditions: { type: "string" }
              }
            }
          },
          required: ["timestamp", "errorType", "severity", "message"]
        }
      },
      {
        name: "analyze_flutter_error",
        description: "Analyze a captured Flutter error and provide debugging insights",
        inputSchema: {
          type: "object",
          properties: {
            errorId: {
              type: "string",
              description: "ID of the captured error to analyze"
            },
            analysisType: {
              type: "string",
              enum: ["root_cause", "debugging_steps", "similar_errors", "fix_suggestions", "prevention_tips"],
              description: "Type of analysis to perform"
            }
          },
          required: ["errorId", "analysisType"]
        }
      },
      {
        name: "get_error_summary", 
        description: "Get a summary of all captured errors in the current session",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: "flutter_debug_assistant",
        description: "Get immediate debugging assistance for Flutter development issues",
        inputSchema: {
          type: "object",
          properties: {
            issue: {
              type: "string",
              description: "Description of the Flutter development issue or question"
            },
            errorType: {
              type: "string",
              enum: ["widget_build", "state_management", "navigation", "http_api", "platform_channel", "memory_performance", "framework", "general"],
              description: "Type of Flutter issue (optional)"
            },
            codeSnippet: {
              type: "string", 
              description: "Relevant code snippet (optional)"
            }
          },
          required: ["issue"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "capture_flutter_error": {
        const errorData = FlutterErrorSchema.parse(args);
        const errorId = errorTransport.captureError(errorData);
        
        return {
          content: [
            {
              type: "text",
              text: `✅ **Flutter Error Captured Successfully**\n\n**Error ID**: ${errorId}\n**Type**: ${errorData.errorType}\n**Severity**: ${errorData.severity}\n**Message**: ${errorData.message}\n\nUse the error ID with \`analyze_flutter_error\` to get detailed analysis and debugging suggestions.`
            }
          ]
        };
      }

      case "analyze_flutter_error": {
        const errorId = args?.errorId as string;
        const analysisType = args?.analysisType as string;
        
        if (!errorId || !analysisType) {
          throw new Error("Both errorId and analysisType are required");
        }

        const analysis = errorTransport.analyzeError(errorId, analysisType);
        
        return {
          content: [
            {
              type: "text", 
              text: analysis
            }
          ]
        };
      }

      case "get_error_summary": {
        const summary = errorTransport.getErrorSummary();
        
        return {
          content: [
            {
              type: "text",
              text: summary
            }
          ]
        };
      }

      case "flutter_debug_assistant": {
        const issue = args?.issue as string;
        const errorType = args?.errorType as string;
        const codeSnippet = args?.codeSnippet as string;

        if (!issue) {
          throw new Error("Issue description is required");
        }

        let assistance = "🤖 **Flutter Debug Assistant**\n\n";
        assistance += `**Your Issue**: ${issue}\n\n`;

        if (errorType) {
          assistance += `**Error Category**: ${errorType}\n\n`;
        }

        assistance += "**Immediate Suggestions**:\n";
        assistance += "1. 🔍 Check the error message and stack trace carefully\n";
        assistance += "2. 🧪 Try to reproduce the issue in a minimal test case\n";
        assistance += "3. 📚 Review Flutter documentation for the specific API\n";
        assistance += "4. 🐛 Use Flutter Inspector to examine widget tree\n\n";

        if (codeSnippet) {
          assistance += "**Code Review**:\n";
          assistance += "I can see your code snippet. Here are some quick observations:\n";
          assistance += "• Check for null safety violations\n";
          assistance += "• Ensure proper async handling\n";
          assistance += "• Verify widget lifecycle management\n";
          assistance += "• Look for performance bottlenecks\n\n";
        }

        assistance += "**Next Steps**:\n";
        assistance += "• Use `capture_flutter_error` if you have a specific error\n";
        assistance += "• Provide more details about the specific issue\n";
        assistance += "• Share relevant code snippets for detailed analysis\n";
        assistance += "• Consider using Flutter debugging tools (dart analyze, flutter doctor)";

        return {
          content: [
            {
              type: "text",
              text: assistance
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ **Error**: ${errorMessage}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Flutter Error Transport MCP Server running on stdio");
}

main().catch((error) => {
  console.error("❌ Fatal error in main():", error);
  process.exit(1);
});
