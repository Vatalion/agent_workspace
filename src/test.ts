#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

console.log("Testing basic MCP server imports...");

const server = new Server(
  {
    name: "test-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

console.log("MCP Server created successfully!");
