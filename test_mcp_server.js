// Test MCP Server Tools
const { spawn } = require('child_process');

console.log('🧪 Testing Flutter Debug Assistant MCP Server...\n');

// Test the MCP server by sending a Flutter error
const testMCPTools = () => {
  console.log('📡 Testing MCP server tools...');
  
  // Simulate sending a Flutter error to the server
  const testError = {
    type: 'error',
    message: 'RenderFlex overflowed by 42 pixels on the right',
    severity: 'high',
    stackTrace: `
FlutterError: RenderFlex overflowed by 42 pixels on the right.
    at RenderFlex.performLayout (package:flutter/src/rendering/flex.dart:822:15)
    at RenderObject.layout (package:flutter/src/rendering/object.dart:1632:7)
    at RenderProxyBoxMixin.performLayout (package:flutter/src/rendering/proxy_box.dart:113:14)
    `,
    context: {
      widgetTree: 'Row > Container > Text',
      route: '/home',
      userAction: 'screen_rotation'
    },
    timestamp: new Date().toISOString()
  };

  // Send test data to the server endpoint
  fetch('http://localhost:3000/flutter-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testError)
  })
  .then(response => response.text())
  .then(data => {
    console.log('✅ MCP Server Response:', data);
    console.log('🎉 Flutter error successfully captured and processed!');
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
  });
};

// Test after a short delay to ensure server is ready
setTimeout(testMCPTools, 2000);

console.log('⏳ Waiting for MCP server to be ready...');
