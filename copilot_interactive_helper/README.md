# Copilot Interactive Helper

🤖 **Automatic Terminal Dialog Handler for macOS**

A comprehensive solution to automatically handle terminal approval dialogs (Continue/Cancel buttons) that interrupt your workflow when using AI assistants like Claude/Copilot Chat.

## 🚨 Problem Solved

- **Window Focus Interruption**: Terminal commands with approval dialogs automatically switch focus to that window
- **Workflow Disruption**: Having to manually click "Continue" or "Cancel" breaks your coding flow
- **Repetitive Actions**: Constantly approving the same dialogs over and over

## ✨ Features

- 🔄 **Auto-click approval buttons**: Continue, OK, Yes, Allow, Accept, etc.
- 🔧 **Configurable**: Choose which buttons to auto-click
- 🎛️ **Toggle on/off**: Easy enable/disable functionality
- 📝 **Smart targeting**: Only targets specific processes to avoid unwanted clicks
- 🛡️ **Safety features**: Blacklist sensitive applications
- 📊 **Logging**: Full activity logging for debugging
- 🚀 **Background operation**: Runs silently without interrupting your work
- ⚙️ **Auto-start**: Optional automatic startup at login

## 🏗️ Architecture

The solution consists of:

1. **Main Python Script** (`copilot_helper.py`): Core functionality with monitoring and auto-clicking
2. **LaunchAgent** (`com.copilot.helper.plist`): macOS service for automatic startup
3. **Installation Script** (`install.sh`): One-command setup
4. **CLI Interface**: Easy command-line control

## 📦 Installation

### Quick Install

```bash
git clone <repository-url>
cd copilot_interactive_helper
chmod +x install.sh
./install.sh
```

### Manual Installation

1. **Download the files** to a directory
2. **Run the installer**:
   ```bash
   ./install.sh
   ```
3. **Grant permissions** (see Permission Setup below)

## 🔐 Permission Setup

**CRITICAL**: The helper requires Accessibility permissions to work:

1. Open **System Settings** (macOS Ventura+) or **System Preferences** (older versions)
2. Navigate to **Privacy & Security > Accessibility**
3. Click the **+** button and add:
   - **Terminal** (or iTerm2, whatever you use)
   - **Python** (if you see it in the list)
   - **copilot-helper** (if it appears after first run)
4. **Enable** the checkboxes for all added applications

### Why These Permissions Are Needed

- The helper uses AppleScript to detect and click buttons in dialog windows
- macOS requires explicit permission for apps to control other apps' UI elements
- This is a security feature to prevent malicious automation

## 🚀 Usage

### Basic Commands

```bash
# Enable the helper
copilot-helper enable

# Check status
copilot-helper status

# Start monitoring manually (foreground)
copilot-helper start

# Run as background daemon
copilot-helper daemon

# Disable the helper
copilot-helper disable

# Stop running instance
copilot-helper stop
```

### Configuration

```bash
# Enable auto-approval of positive buttons (Continue, OK, etc.)
copilot-helper configure --config-key auto_approve --config-value true

# Disable auto-denial of negative buttons (Cancel, No, etc.)
copilot-helper configure --config-key auto_deny --config-value false

# Set check interval (how often to scan for dialogs)
copilot-helper configure --config-key check_interval --config-value 0.5

# Set log level for debugging
copilot-helper configure --config-key log_level --config-value INFO
```

### Auto-Start at Login

```bash
# Enable automatic startup
launchctl load ~/Library/LaunchAgents/com.copilot.helper.plist

# Disable automatic startup
launchctl unload ~/Library/LaunchAgents/com.copilot.helper.plist
```

## ⚙️ Configuration File

The helper stores its configuration in `~/.copilot_helper_config.json`:

```json
{
  "enabled": true,
  "auto_approve": true,
  "auto_deny": false,
  "check_interval": 0.5,
  "log_level": "INFO",
  "custom_positive_buttons": [],
  "custom_negative_buttons": [],
  "focus_prevention": true,
  "process_whitelist": [],
  "process_blacklist": ["Script Editor", "Xcode"]
}
```

### Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enabled` | boolean | `false` | Master enable/disable switch |
| `auto_approve` | boolean | `true` | Auto-click positive buttons (Continue, OK, etc.) |
| `auto_deny` | boolean | `false` | Auto-click negative buttons (Cancel, No, etc.) |
| `check_interval` | number | `0.5` | Seconds between dialog checks |
| `log_level` | string | `"INFO"` | Logging verbosity (DEBUG, INFO, WARNING, ERROR) |
| `custom_positive_buttons` | array | `[]` | Additional positive button names |
| `custom_negative_buttons` | array | `[]` | Additional negative button names |
| `focus_prevention` | boolean | `true` | Prevent focus switching (future feature) |
| `process_whitelist` | array | `[]` | Only monitor these processes (empty = all) |
| `process_blacklist` | array | `["Script Editor", "Xcode"]` | Never monitor these processes |

## 🎯 Targeted Processes

The helper monitors these common processes for approval dialogs:

- **Terminal** / **iTerm2**: Command-line tools
- **osascript**: AppleScript execution
- **System Preferences** / **System Settings**: System dialogs
- **SecurityAgent**: Security permission dialogs
- **UserNotificationCenter**: Notification dialogs
- **CoreServicesUIAgent**: System service dialogs

## 🔒 Safety Features

### Process Blacklisting

By default, these applications are **excluded** from auto-clicking:
- **Script Editor**: Prevent accidental automation in development
- **Xcode**: Avoid interfering with development workflows

### Button Type Detection

The helper categorizes buttons into:

**Positive Actions** (auto-clicked when `auto_approve: true`):
- Continue, OK, Yes, Allow, Accept, Approve, Grant, Enable, Proceed, Install, Update

**Negative Actions** (auto-clicked when `auto_deny: true`):
- Cancel, No, Deny, Refuse, Decline, Skip, Dismiss

## 📊 Monitoring and Logging

### Log Files

Logs are stored in `~/.copilot_helper_logs/copilot_helper.log`:

```bash
# View recent activity
tail -f ~/.copilot_helper_logs/copilot_helper.log

# Search for specific actions
grep "clicked" ~/.copilot_helper_logs/copilot_helper.log
```

### Status Monitoring

```bash
# Check if running
copilot-helper status

# Monitor in real-time
tail -f ~/.copilot_helper_logs/copilot_helper.log
```

## 🛠️ Troubleshooting

### Helper Not Starting

1. **Check permissions**: Ensure Accessibility permissions are granted
2. **Check status**: Run `copilot-helper status`
3. **Check logs**: View `~/.copilot_helper_logs/copilot_helper.log`
4. **Try manual start**: `copilot-helper start` to see immediate errors

### Buttons Not Being Clicked

1. **Check process list**: The target application might not be monitored
2. **Check button names**: Custom buttons might need to be added to config
3. **Check blacklist**: Process might be in the blacklist
4. **Enable debug logging**: `copilot-helper configure --config-key log_level --config-value DEBUG`

### Permission Errors

```
Error: "osascript is not allowed assistive access"
```

**Solution**: Add the terminal application to Accessibility permissions in System Settings.

### LaunchAgent Not Working

```bash
# Check if loaded
launchctl list | grep copilot

# Check agent status
launchctl print gui/$(id -u)/com.copilot.helper

# Reload agent
launchctl unload ~/Library/LaunchAgents/com.copilot.helper.plist
launchctl load ~/Library/LaunchAgents/com.copilot.helper.plist
```

## 🔧 Advanced Usage

### Custom Button Names

Add custom buttons for specific applications:

```bash
# Add a custom positive button
copilot-helper configure --config-key custom_positive_buttons --config-value '["Approve Request", "Grant Permission"]'

# Add a custom negative button  
copilot-helper configure --config-key custom_negative_buttons --config-value '["Deny Access", "Block"]'
```

### Process Whitelisting

Restrict monitoring to specific processes only:

```bash
# Only monitor Terminal and iTerm2
copilot-helper configure --config-key process_whitelist --config-value '["Terminal", "iTerm2"]'
```

### Fine-Tuning Check Interval

Balance responsiveness vs. system resources:

```bash
# Faster response (higher CPU usage)
copilot-helper configure --config-key check_interval --config-value 0.1

# Slower response (lower CPU usage)
copilot-helper configure --config-key check_interval --config-value 1.0
```

## 🔄 Uninstallation

```bash
# Stop the helper
copilot-helper stop

# Disable auto-start
launchctl unload ~/Library/LaunchAgents/com.copilot.helper.plist

# Remove files
rm -rf ~/.copilot_helper
rm ~/Library/LaunchAgents/com.copilot.helper.plist
sudo rm /usr/local/bin/copilot-helper

# Remove config and logs (optional)
rm ~/.copilot_helper_config.json
rm -rf ~/.copilot_helper_logs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with different dialog types
5. Submit a pull request

## 📝 License

MIT License - feel free to use and modify as needed.

## ⚠️ Disclaimer

This tool automates clicking buttons in dialog boxes. Use responsibly and ensure you understand what dialogs you're auto-approving. Always review the process blacklist to avoid automation in sensitive applications.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review log files for error details
3. Ensure all permissions are properly configured
4. Test with minimal configuration first

---

**Made with ❤️ to solve the annoying terminal dialog interruption problem!** 