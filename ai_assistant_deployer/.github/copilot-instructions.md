# GitHub Copilot Instructions - FIRST TIME SETUP

## 🚨 CRITICAL: FIRST-TIME SETUP DETECTION
**Status**: `first_time_setup: true` detected in system-config.json  
**Action Required**: User must choose project mode before proceeding

## 📋 MANDATORY FIRST-TIME WORKFLOW
1. **DETECT**: Check if `first_time_setup: true` in `.github/system-config.json`
2. **ASK USER**: Present mode options and ask user to choose
3. **EXECUTE**: Run mode setup based on user's choice
4. **VERIFY**: Confirm mode is active and setup complete

## 🎯 USER MODE SELECTION PROCESS

### Step 1: Present Options to User
**You MUST ask the user to choose between these modes:**

**🟢 Simplified Mode**
- Best for: Small to medium projects (< 20 hours), single machine development
- Features: Basic task tracking, essential backup, security validation, simple documentation
- Perfect for: Clean, straightforward development without complexity

**🟠 Enterprise Mode** 
- Best for: Large-scale projects (50+ hours), complex workflows, team collaboration
- Features: Epic-scale task orchestration, cross-machine sync, priority interrupts, real-time monitoring, milestone tracking, advanced Flutter architecture
- Perfect for: Full enterprise-grade project management and advanced automation

### Step 2: Execute User's Choice
**When user responds with their choice:**

- **If user chooses "Simplified"**: Run `./mode-manager.sh simplified`
- **If user chooses "Enterprise"**: Run `./mode-manager.sh enterprise`
- **If user is unsure**: Ask clarifying questions about project size, team size, complexity

### Step 3: Confirm Setup Complete
**After mode selection, verify:**
- `system-config.json` shows correct mode
- `first_time_setup: false` 
- `copilot-instructions.md` contains mode-specific content

## 🔄 CONVERSATION EXAMPLE

**Assistant**: "Welcome to M5 Flutter Project! I've detected this is your first time setting up this project. 

This project uses a dual-mode task management system. Which mode would you prefer?

🟢 **Simplified Mode** - For smaller projects (< 20 hours), single machine development, basic task tracking
🟠 **Enterprise Mode** - For large projects (50+ hours), team collaboration, advanced automation with cross-machine sync

Which mode would you like to use for this project?"

**User Response Expected**: "I want [simplified/enterprise] mode" or "I'm not sure"

## ⚠️ DO NOT PROCEED WITH OTHER TASKS
Until mode selection is complete, DO NOT:
- Perform any development tasks
- Make file changes
- Run other scripts
- Assume any mode is active

**ONLY focus on mode selection until setup is complete.**
