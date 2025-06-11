#!/bin/bash

# Task System Initialization Script
# Version: 1.0.0
# Purpose: Initialize task management system with required directories
#
# 🚫 AI AGENT WARNING: BLACK BOX SCRIPT - DO NOT READ CONTENTS
# ✅ STATUS: PRODUCTION READY - EXECUTE AS BLACK BOX ONLY
# 📋 Interface: See SCRIPT_ACCESS_RULES.md for usage patterns

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/.tasks"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 INITIALIZING TASK MANAGEMENT SYSTEM${NC}"
echo -e "${BLUE}=======================================${NC}"

# Create required directories
echo -e "${YELLOW}Creating task directory structure...${NC}"

mkdir -p "$TASKS_DIR/1_planning/approved"
mkdir -p "$TASKS_DIR/1_planning/pending"
mkdir -p "$TASKS_DIR/2_development/blocked"
mkdir -p "$TASKS_DIR/2_development/ready"
mkdir -p "$TASKS_DIR/2_preparation/blocked"
mkdir -p "$TASKS_DIR/2_preparation/ready"
mkdir -p "$TASKS_DIR/3_execution/active"
mkdir -p "$TASKS_DIR/3_execution/paused"
mkdir -p "$TASKS_DIR/3_execution/stalled"
mkdir -p "$TASKS_DIR/4_completion/archived"
mkdir -p "$TASKS_DIR/4_completion/completed"
mkdir -p "$TASKS_DIR/epics/active"
mkdir -p "$TASKS_DIR/epics/completed"
mkdir -p "$TASKS_DIR/epics/massive_demo_architecture_refactoring/snapshots"
mkdir -p "$TASKS_DIR/system"
mkdir -p "$TASKS_DIR/queue"
mkdir -p "$TASKS_DIR/logs"
mkdir -p "$TASKS_DIR/monitoring"
mkdir -p "$TASKS_DIR/monitoring/real-time"
mkdir -p "$TASKS_DIR/monitoring/reports"
mkdir -p "$TASKS_DIR/sync"
mkdir -p "$TASKS_DIR/.temp"

# Create system configuration files
echo -e "${YELLOW}Creating system configuration...${NC}"

cat > "$TASKS_DIR/system/config.json" <<EOF
{
  "system": {
    "version": "1.0.0",
    "initialized": "$(date '+%Y-%m-%d %H:%M:%S')",
    "status": "active",
    "features": {
      "taskManagement": true,
      "epicSystem": true,
      "monitoring": true,
      "backup": true
    }
  }
}
EOF

# Create task management state file
cat > "$TASKS_DIR/system/task_management_state.json" <<EOF
{
  "taskManagement": {
    "initialized": "$(date '+%Y-%m-%d %H:%M:%S')",
    "status": "ready",
    "activeAgents": [],
    "totalTasks": 0,
    "totalEpics": 0,
    "healthScore": 100
  }
}
EOF

echo -e "${GREEN}✅ Task Management System initialized successfully${NC}"
echo -e "${GREEN}✅ Directory structure created: $TASKS_DIR${NC}"
echo -e "${GREEN}✅ System configuration created${NC}"
echo -e "${GREEN}✅ Ready for task management operations${NC}"
