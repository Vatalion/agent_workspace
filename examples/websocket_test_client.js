#!/usr/bin/env node

/**
 * Flutter Error Transport - WebSocket Test Client
 * 
 * This is a simple test client that connects to the MCP server's WebSocket
 * endpoint to demonstrate real-time error streaming capabilities.
 * 
 * Usage:
 *   node examples/websocket_test_client.js
 */

import WebSocket from 'ws';

const WS_URL = 'ws://localhost:8080';

console.log('🔌 Connecting to Flutter Error Transport Stream...');
console.log(`📡 URL: ${WS_URL}`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ Connected to Flutter Error Transport Stream');
  console.log('🎯 Waiting for real-time error events...\n');
  
  // Send subscription message
  ws.send(JSON.stringify({
    type: 'subscribe',
    timestamp: new Date().toISOString(),
    filters: {
      errorTypes: ['all'],
      severityLevels: ['all']
    }
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    switch (message.type) {
      case 'connection_established':
        console.log('🟢 Connection established');
        console.log(`   Server: ${message.message}`);
        console.log(`   Version: ${message.server_version}\n`);
        break;
        
      case 'subscription_confirmed':
        console.log('✅ Subscription confirmed');
        console.log(`   Filters: ${message.filters}\n`);
        break;
        
      case 'flutter_error':
        console.log('🚨 REAL-TIME ERROR RECEIVED:');
        console.log('─'.repeat(50));
        console.log(`📋 Error ID: ${message.event.id}`);
        console.log(`🔸 Type: ${message.event.error.errorType}`);
        console.log(`⚠️  Severity: ${message.event.error.severity}`);
        console.log(`💬 Message: ${message.event.error.message}`);
        console.log(`⏰ Captured: ${message.event.capturedAt}`);
        console.log(`🧠 Auto-Analysis: ${message.event.autoAnalysis}`);
        console.log(`🚨 Urgency: ${message.event.urgency}`);
        
        if (message.event.suggested_actions) {
          console.log('💡 Immediate Actions:');
          message.event.suggested_actions.forEach((action, index) => {
            console.log(`   ${index + 1}. ${action}`);
          });
        }
        
        if (message.event.error.context) {
          console.log('🔍 Context:');
          Object.entries(message.event.error.context).forEach(([key, value]) => {
            if (value) console.log(`   ${key}: ${value}`);
          });
        }
        
        console.log('─'.repeat(50));
        console.log('');
        break;
        
      case 'streaming_stats':
        console.log('📊 Streaming Statistics Update:');
        console.log(`   Total Errors: ${message.stats.totalErrors}`);
        console.log(`   Connected Clients: ${message.stats.connectedClients}`);
        console.log(`   Server Status: ${message.stats.serverStatus}`);
        console.log('');
        break;
        
      default:
        console.log(`📨 Unknown message type: ${message.type}`, message);
    }
  } catch (error) {
    console.error('❌ Failed to parse message:', error);
    console.log('Raw data:', data.toString());
  }
});

ws.on('close', () => {
  console.log('🔌 Connection closed');
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Make sure the Flutter Error Transport MCP Server is running:');
    console.log('   npm start');
    console.log('   \n   Then use the streaming_control tool to start WebSocket server:');
    console.log('   {"action": "start"}');
  }
  
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test client...');
  ws.close();
});

console.log('\n💡 Tip: Generate test errors using the MCP capture_flutter_error tool');
console.log('Press Ctrl+C to exit\n');
