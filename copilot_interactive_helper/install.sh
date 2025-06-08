#!/bin/bash

# Copilot Helper Installation Script
# This script installs and configures the Copilot Interactive Helper

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$HOME/.copilot_helper"
LAUNCHAGENT_DIR="$HOME/Library/LaunchAgents"
LAUNCHAGENT_PLIST="com.copilot.helper.plist"

echo "🚀 Installing Copilot Interactive Helper..."

# Create installation directory
mkdir -p "$INSTALL_DIR"
mkdir -p "$LAUNCHAGENT_DIR"

# Copy the main script
echo "📁 Installing main script..."
cp "$SCRIPT_DIR/copilot_helper.py" "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/copilot_helper.py"

# Create the LaunchAgent plist
echo "🔧 Setting up LaunchAgent..."
sed "s|__SCRIPT_PATH__|$INSTALL_DIR|g" "$SCRIPT_DIR/com.copilot.helper.plist" > "$LAUNCHAGENT_DIR/$LAUNCHAGENT_PLIST"

# Create a convenient command-line wrapper
echo "🔗 Creating command-line wrapper..."
cat > "$INSTALL_DIR/copilot-helper" << EOF
#!/bin/bash
exec python3 "$INSTALL_DIR/copilot_helper.py" "\$@"
EOF
chmod +x "$INSTALL_DIR/copilot-helper"

# Add to PATH by creating a symlink
echo "🔗 Creating PATH symlink..."
sudo mkdir -p /usr/local/bin
sudo ln -sf "$INSTALL_DIR/copilot-helper" /usr/local/bin/copilot-helper

echo "✅ Installation complete!"
echo ""
echo "🔐 IMPORTANT: You need to grant Accessibility permissions for the helper to work:"
echo "   1. Open System Settings (or System Preferences)"
echo "   2. Go to Privacy & Security > Accessibility"
echo "   3. Add Terminal and Python (or whatever terminal you use)"
echo "   4. Make sure they are enabled"
echo ""
echo "📋 Available commands:"
echo "   copilot-helper enable    - Enable the helper"
echo "   copilot-helper disable   - Disable the helper"
echo "   copilot-helper start     - Start monitoring (manual)"
echo "   copilot-helper stop      - Stop monitoring"
echo "   copilot-helper status    - Show current status"
echo "   copilot-helper daemon    - Run as daemon"
echo ""
echo "🔧 Configuration commands:"
echo "   copilot-helper configure --config-key auto_approve --config-value true"
echo "   copilot-helper configure --config-key auto_deny --config-value false"
echo "   copilot-helper configure --config-key check_interval --config-value 0.5"
echo ""
echo "🚀 To start the helper automatically at login:"
echo "   launchctl load ~/Library/LaunchAgents/$LAUNCHAGENT_PLIST"
echo ""
echo "🛑 To stop automatic startup:"
echo "   launchctl unload ~/Library/LaunchAgents/$LAUNCHAGENT_PLIST"
echo ""
echo "📖 Enable the helper and configure it:"
echo "   copilot-helper enable"
echo "   copilot-helper status"
echo ""
echo "🔍 Log files are stored in: ~/.copilot_helper_logs/"
echo "📁 Config file: ~/.copilot_helper_config.json" 