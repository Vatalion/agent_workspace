#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const node_http_1 = require("node:http");
const node_url_1 = require("node:url");
const zod_1 = require("zod");
// Default configuration
let currentConfig = {
    captureErrors: true,
    captureLogs: false,
    capturePerformance: false,
    severityFilter: ["medium", "high", "critical"],
    maxBufferSize: 100
};
// Data schemas
const FlutterErrorSchema = zod_1.z.object({
    timestamp: zod_1.z.string(),
    type: zod_1.z.literal("error"),
    errorType: zod_1.z.enum([
        "widget_build",
        "state_management",
        "navigation",
        "http_api",
        "platform_channel",
        "memory_performance",
        "framework",
        "general"
    ]),
    severity: zod_1.z.enum(["low", "medium", "high", "critical"]),
    message: zod_1.z.string(),
    stackTrace: zod_1.z.string().optional(),
    context: zod_1.z.object({
        widgetPath: zod_1.z.string().optional(),
        routeName: zod_1.z.string().optional(),
        stateName: zod_1.z.string().optional(),
        apiEndpoint: zod_1.z.string().optional(),
        userAction: zod_1.z.string().optional(),
    }).optional(),
    deviceInfo: zod_1.z.object({
        platform: zod_1.z.enum(["android", "ios", "web", "desktop"]),
        osVersion: zod_1.z.string().optional(),
        appVersion: zod_1.z.string().optional(),
        flutterVersion: zod_1.z.string().optional(),
    }).optional(),
});
const FlutterLogSchema = zod_1.z.object({
    timestamp: zod_1.z.string(),
    type: zod_1.z.literal("log"),
    level: zod_1.z.enum(["debug", "info", "warning", "error"]),
    message: zod_1.z.string(),
    source: zod_1.z.string().optional(),
    context: zod_1.z.object({
        routeName: zod_1.z.string().optional(),
        userAction: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }).optional(),
});
const FlutterPerformanceSchema = zod_1.z.object({
    timestamp: zod_1.z.string(),
    type: zod_1.z.literal("performance"),
    metric: zod_1.z.enum(["frame_time", "memory_usage", "cpu_usage", "network_latency"]),
    value: zod_1.z.number(),
    threshold: zod_1.z.number().optional(),
    context: zod_1.z.object({
        routeName: zod_1.z.string().optional(),
        operationType: zod_1.z.string().optional(),
    }).optional(),
});
class FlutterDebugAssistant {
    constructor() {
        this.capturedData = new Map();
        this.selectedForAI = new Set();
        console.error("🚀 Flutter Debug Assistant MCP Server initializing...");
    }
    // Configure what data to capture from Flutter app
    configureListener(config) {
        currentConfig = { ...currentConfig, ...config };
        console.error(`⚙️ Listener configured: errors=${currentConfig.captureErrors}, logs=${currentConfig.captureLogs}, performance=${currentConfig.capturePerformance}`);
        return `**Flutter Listener Configuration Updated**

**What we're capturing:**
- Errors: ${currentConfig.captureErrors ? '✅' : '❌'}
- Logs: ${currentConfig.captureLogs ? '✅' : '❌'}
- Performance: ${currentConfig.capturePerformance ? '✅' : '❌'}

**Severity Filter:** ${currentConfig.severityFilter.join(', ')}
**Buffer Size:** ${currentConfig.maxBufferSize} items

The Flutter app will now send data according to this configuration.`;
    }
    // Capture data from Flutter app (called via HTTP endpoint)
    captureFlutterData(data) {
        // Check if we should capture this data based on config
        if (!this.shouldCapture(data)) {
            return "Data filtered out by configuration";
        }
        const dataId = `${data.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const capturedItem = {
            id: dataId,
            data: data,
            capturedAt: new Date(),
            selected: false,
        };
        this.capturedData.set(dataId, capturedItem);
        // Maintain buffer size limit
        if (this.capturedData.size > currentConfig.maxBufferSize) {
            const oldestId = Array.from(this.capturedData.keys())[0];
            this.capturedData.delete(oldestId);
            this.selectedForAI.delete(oldestId);
        }
        console.error(`📥 Captured Flutter ${data.type}: ${dataId}`);
        return dataId;
    }
    // Check if data should be captured based on configuration
    shouldCapture(data) {
        if (data.type === "error" && !currentConfig.captureErrors)
            return false;
        if (data.type === "log" && !currentConfig.captureLogs)
            return false;
        if (data.type === "performance" && !currentConfig.capturePerformance)
            return false;
        // Check severity filter for errors
        if (data.type === "error") {
            return currentConfig.severityFilter.includes(data.severity);
        }
        // Check level filter for logs
        if (data.type === "log") {
            const logLevelMap = { debug: 0, info: 1, warning: 2, error: 3 };
            const minLevel = currentConfig.severityFilter.includes("low") ? 0 :
                currentConfig.severityFilter.includes("medium") ? 1 : 2;
            return logLevelMap[data.level] >= minLevel;
        }
        return true; // Performance data always captured if enabled
    }
    // Get all captured data for user selection
    getCapturedData(type, limit) {
        let items = Array.from(this.capturedData.values());
        if (type) {
            items = items.filter(item => item.data.type === type);
        }
        if (limit) {
            items = items.slice(-limit);
        }
        if (items.length === 0) {
            return "No captured data found. Make sure your Flutter app is running and sending data to the MCP server.";
        }
        let result = `**Captured Flutter Data (${items.length} items)**\n\n`;
        items.forEach((item, index) => {
            const selected = this.selectedForAI.has(item.id) ? "🟢 SELECTED" : "⚪ Available";
            const timestamp = item.capturedAt.toLocaleTimeString();
            if (item.data.type === "error") {
                result += `**${index + 1}. ERROR** [${selected}] - ${timestamp}\n`;
                result += `   • Type: ${item.data.errorType}\n`;
                result += `   • Severity: ${item.data.severity}\n`;
                result += `   • Message: ${item.data.message.substring(0, 100)}${item.data.message.length > 100 ? '...' : ''}\n`;
                result += `   • ID: \`${item.id}\`\n\n`;
            }
            else if (item.data.type === "log") {
                result += `**${index + 1}. LOG** [${selected}] - ${timestamp}\n`;
                result += `   • Level: ${item.data.level}\n`;
                result += `   • Source: ${item.data.source || 'unknown'}\n`;
                result += `   • Message: ${item.data.message.substring(0, 100)}${item.data.message.length > 100 ? '...' : ''}\n`;
                result += `   • ID: \`${item.id}\`\n\n`;
            }
            else if (item.data.type === "performance") {
                result += `**${index + 1}. PERFORMANCE** [${selected}] - ${timestamp}\n`;
                result += `   • Metric: ${item.data.metric}\n`;
                result += `   • Value: ${item.data.value}\n`;
                result += `   • ID: \`${item.id}\`\n\n`;
            }
        });
        result += `\n**Usage:** Use \`select_for_ai\` to choose which items to send to AI as context.`;
        return result;
    }
    // Select specific items to send to AI as context
    selectForAI(itemIds) {
        const results = [];
        itemIds.forEach(id => {
            if (this.capturedData.has(id)) {
                this.selectedForAI.add(id);
                results.push(`✅ Selected: ${id}`);
            }
            else {
                results.push(`❌ Not found: ${id}`);
            }
        });
        const selectedCount = this.selectedForAI.size;
        results.push(`\n**Total selected for AI context: ${selectedCount} items**`);
        return results.join('\n');
    }
    // Deselect items
    deselectFromAI(itemIds) {
        const results = [];
        itemIds.forEach(id => {
            if (this.selectedForAI.has(id)) {
                this.selectedForAI.delete(id);
                results.push(`🔄 Deselected: ${id}`);
            }
            else {
                results.push(`ℹ️ Was not selected: ${id}`);
            }
        });
        const selectedCount = this.selectedForAI.size;
        results.push(`\n**Total selected for AI context: ${selectedCount} items**`);
        return results.join('\n');
    }
    // Get selected items formatted for AI context
    getAIContext() {
        if (this.selectedForAI.size === 0) {
            return "No Flutter data selected for AI context. Use the `select_for_ai` tool to choose items.";
        }
        const selectedItems = Array.from(this.selectedForAI)
            .map(id => this.capturedData.get(id))
            .filter(item => item !== undefined);
        let context = `**Flutter Debug Context (${selectedItems.length} items)**\n\n`;
        selectedItems.forEach((item, index) => {
            const timestamp = item.capturedAt.toISOString();
            if (item.data.type === "error") {
                context += `**ERROR ${index + 1}** [${timestamp}]\n`;
                context += `Type: ${item.data.errorType}\n`;
                context += `Severity: ${item.data.severity}\n`;
                context += `Message: ${item.data.message}\n`;
                if (item.data.stackTrace) {
                    context += `Stack Trace:\n\`\`\`\n${item.data.stackTrace}\n\`\`\`\n`;
                }
                if (item.data.context) {
                    context += `Context: ${JSON.stringify(item.data.context, null, 2)}\n`;
                }
                context += `\n---\n\n`;
            }
            else if (item.data.type === "log") {
                context += `**LOG ${index + 1}** [${timestamp}]\n`;
                context += `Level: ${item.data.level}\n`;
                context += `Source: ${item.data.source || 'unknown'}\n`;
                context += `Message: ${item.data.message}\n`;
                if (item.data.context) {
                    context += `Context: ${JSON.stringify(item.data.context, null, 2)}\n`;
                }
                context += `\n---\n\n`;
            }
            else if (item.data.type === "performance") {
                context += `**PERFORMANCE ${index + 1}** [${timestamp}]\n`;
                context += `Metric: ${item.data.metric}\n`;
                context += `Value: ${item.data.value}\n`;
                if (item.data.threshold) {
                    context += `Threshold: ${item.data.threshold}\n`;
                }
                if (item.data.context) {
                    context += `Context: ${JSON.stringify(item.data.context, null, 2)}\n`;
                }
                context += `\n---\n\n`;
            }
        });
        context += `**Instructions for AI:** The above Flutter debug data has been captured from a running Flutter application. Please analyze these errors, logs, or performance metrics and provide helpful debugging assistance, root cause analysis, or optimization suggestions.`;
        return context;
    }
    // Clear all captured data
    clearData() {
        const count = this.capturedData.size;
        this.capturedData.clear();
        this.selectedForAI.clear();
        return `🗑️ Cleared ${count} captured items and selections.`;
    }
    // Get statistics
    getStats() {
        const total = this.capturedData.size;
        const selected = this.selectedForAI.size;
        const errors = Array.from(this.capturedData.values()).filter(item => item.data.type === "error").length;
        const logs = Array.from(this.capturedData.values()).filter(item => item.data.type === "log").length;
        const performance = Array.from(this.capturedData.values()).filter(item => item.data.type === "performance").length;
        return `**Flutter Debug Assistant Statistics**

📊 **Data Captured:**
- Total Items: ${total}
- Errors: ${errors}
- Logs: ${logs}
- Performance: ${performance}

🎯 **AI Context:**
- Selected for AI: ${selected}

⚙️ **Configuration:**
- Capturing Errors: ${currentConfig.captureErrors ? '✅' : '❌'}
- Capturing Logs: ${currentConfig.captureLogs ? '✅' : '❌'}
- Capturing Performance: ${currentConfig.capturePerformance ? '✅' : '❌'}
- Severity Filter: ${currentConfig.severityFilter.join(', ')}
- Buffer Size: ${currentConfig.maxBufferSize}`;
    }
}
// Create server instance
const server = new index_js_1.Server({
    name: "flutter-debug-assistant",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Initialize Flutter Debug Assistant
const debugAssistant = new FlutterDebugAssistant();
// HTTP server for receiving Flutter data
let httpServer = null;
// Define MCP tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "configure_flutter_listener",
                description: "Configure what data to capture from Flutter app (errors, logs, performance)",
                inputSchema: {
                    type: "object",
                    properties: {
                        captureErrors: {
                            type: "boolean",
                            description: "Whether to capture Flutter errors",
                        },
                        captureLogs: {
                            type: "boolean",
                            description: "Whether to capture Flutter logs",
                        },
                        capturePerformance: {
                            type: "boolean",
                            description: "Whether to capture Flutter performance metrics",
                        },
                        severityFilter: {
                            type: "array",
                            items: { type: "string", enum: ["low", "medium", "high", "critical"] },
                            description: "Which severity levels to capture",
                        },
                        maxBufferSize: {
                            type: "number",
                            description: "Maximum number of items to keep in buffer",
                        },
                    },
                },
            },
            {
                name: "get_captured_data",
                description: "Get list of captured Flutter data (errors, logs, performance) for user selection",
                inputSchema: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            enum: ["error", "log", "performance"],
                            description: "Filter by data type (optional)",
                        },
                        limit: {
                            type: "number",
                            description: "Limit number of results (optional)",
                        },
                    },
                },
            },
            {
                name: "select_for_ai",
                description: "Select specific captured items to send to AI as debugging context",
                inputSchema: {
                    type: "object",
                    properties: {
                        itemIds: {
                            type: "array",
                            items: { type: "string" },
                            description: "Array of item IDs to select for AI context",
                        },
                    },
                    required: ["itemIds"],
                },
            },
            {
                name: "deselect_from_ai",
                description: "Deselect items from AI context",
                inputSchema: {
                    type: "object",
                    properties: {
                        itemIds: {
                            type: "array",
                            items: { type: "string" },
                            description: "Array of item IDs to deselect from AI context",
                        },
                    },
                    required: ["itemIds"],
                },
            },
            {
                name: "get_ai_context",
                description: "Get the selected Flutter data formatted as context for AI debugging assistance",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "clear_captured_data",
                description: "Clear all captured Flutter data and selections",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_debug_stats",
                description: "Get statistics about captured Flutter data and current configuration",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        switch (name) {
            case "configure_flutter_listener":
                return {
                    content: [
                        {
                            type: "text",
                            text: debugAssistant.configureListener(args || {}),
                        },
                    ],
                };
            case "get_captured_data":
                return {
                    content: [
                        {
                            type: "text",
                            text: debugAssistant.getCapturedData(args?.type, args?.limit),
                        },
                    ],
                };
            case "select_for_ai":
                if (!args?.itemIds || !Array.isArray(args.itemIds)) {
                    throw new Error("itemIds array is required");
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: debugAssistant.selectForAI(args.itemIds),
                        },
                    ],
                };
            case "deselect_from_ai":
                if (!args?.itemIds || !Array.isArray(args.itemIds)) {
                    throw new Error("itemIds array is required");
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: debugAssistant.deselectFromAI(args.itemIds),
                        },
                    ],
                };
            case "get_ai_context":
                return {
                    content: [
                        {
                            type: "text",
                            text: debugAssistant.getAIContext(),
                        },
                    ],
                };
            case "clear_captured_data":
                return {
                    content: [
                        {
                            type: "text",
                            text: debugAssistant.clearData(),
                        },
                    ],
                };
            case "get_debug_stats":
                return {
                    content: [
                        {
                            type: "text",
                            text: debugAssistant.getStats(),
                        },
                    ],
                };
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
// Function to start HTTP server for receiving Flutter data
function startFlutterDataReceiver(port = 3000) {
    httpServer = (0, node_http_1.createServer)((req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        const parsedUrl = (0, node_url_1.parse)(req.url || '', true);
        if (req.method === 'POST' && parsedUrl.pathname === '/flutter-data') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    // Validate and capture the data
                    let validatedData;
                    if (data.type === 'error') {
                        validatedData = FlutterErrorSchema.parse(data);
                    }
                    else if (data.type === 'log') {
                        validatedData = FlutterLogSchema.parse(data);
                    }
                    else if (data.type === 'performance') {
                        validatedData = FlutterPerformanceSchema.parse(data);
                    }
                    else {
                        throw new Error(`Unknown data type: ${data.type}`);
                    }
                    const itemId = debugAssistant.captureFlutterData(validatedData);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, itemId }));
                }
                catch (error) {
                    console.error('Failed to process Flutter data:', error);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    }));
                }
            });
        }
        else if (req.method === 'GET' && parsedUrl.pathname === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    });
    httpServer.listen(port, () => {
        console.error(`🌐 Flutter data receiver listening on http://localhost:${port}`);
        console.error(`📡 Send Flutter data to: http://localhost:${port}/flutter-data`);
    });
}
// Main function
async function main() {
    // Start HTTP server for receiving Flutter data
    startFlutterDataReceiver(3000);
    // Start MCP server
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("✅ Flutter Debug Assistant MCP Server running!");
    console.error("🔧 Use MCP tools to configure Flutter data capture and select items for AI context");
}
// Handle shutdown
process.on('SIGINT', () => {
    console.error("\n🛑 Shutting down Flutter Debug Assistant...");
    if (httpServer) {
        httpServer.close();
    }
    process.exit(0);
});
main().catch((error) => {
    console.error("❌ Fatal error in main():", error);
    process.exit(1);
});
