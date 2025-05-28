#!/usr/bin/env node

// Test the Flutter Debug Assistant MCP Server HTTP endpoint
const testFlutterError = {
  timestamp: new Date().toISOString(),
  type: "error",
  errorType: "widget_build",
  severity: "high",
  message: "RenderFlex overflow by 14 pixels on the right",
  stackTrace: "FlutterError: RenderFlex overflow\n    at Object.throw_ [as throw] (http://localhost:8080/dart_sdk.js:5067:11)",
  context: {
    widgetPath: "MaterialApp > Scaffold > Column > Row",
    routeName: "/home"
  },
  deviceInfo: {
    platform: "android",
    osVersion: "Android 13",
    appVersion: "1.0.0"
  }
};

async function testEndpoint() {
  try {
    console.log("Testing Flutter Debug Assistant HTTP endpoint...");
    
    const response = await fetch('http://localhost:3000/flutter-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFlutterError)
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Test successful!");
      console.log("Response:", result);
    } else {
      console.log("❌ Test failed!");
      console.log("Status:", response.status);
      console.log("Response:", await response.text());
    }
  } catch (error) {
    console.log("❌ Connection failed - make sure the MCP server is running");
    console.log("Error:", error.message);
  }
}

testEndpoint();
