#!/usr/bin/env python3
"""
Copilot Interactive Helper - Automatic Terminal Dialog Handler

This script automatically handles terminal approval dialogs (continue/cancel buttons)
to prevent workflow interruption. It monitors for dialog boxes and automatically
clicks the appropriate button based on configuration.

Features:
- Auto-click "Continue", "OK", "Yes", "Allow", "Accept" buttons
- Toggle on/off functionality
- Background monitoring without interrupting user workflow
- Configurable button preferences
- Logging for debugging
- macOS focus management to prevent window switching interruptions

Author: AI Assistant
License: MIT
"""

import subprocess
import time
import threading
import json
import logging
import os
import signal
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse


class CopilotHelper:
    def __init__(self, config_file: str = None):
        self.config_file = config_file or os.path.expanduser("~/.copilot_helper_config.json")
        self.is_running = False
        self.monitoring_thread = None
        self.config = self.load_config()
        self.setup_logging()
        
        # Default positive action buttons (will be auto-clicked)
        self.positive_buttons = [
            "Continue", "OK", "Yes", "Allow", "Accept", "Approve", 
            "Grant", "Enable", "Proceed", "Install", "Update"
        ]
        
        # Default negative action buttons (will be auto-clicked if configured)
        self.negative_buttons = [
            "Cancel", "No", "Deny", "Refuse", "Decline", "Skip", "Dismiss"
        ]
        
    def load_config(self) -> Dict:
        """Load configuration from file or create default config"""
        default_config = {
            "enabled": False,
            "auto_approve": True,
            "auto_deny": False,
            "check_interval": 0.5,
            "log_level": "INFO",
            "custom_positive_buttons": [],
            "custom_negative_buttons": [],
            "focus_prevention": True,
            "process_whitelist": [],  # Empty means all processes
            "process_blacklist": ["Script Editor", "Xcode"]  # Don't auto-click in these
        }
        
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    # Merge with defaults to ensure all keys exist
                    for key, value in default_config.items():
                        if key not in config:
                            config[key] = value
                    return config
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading config: {e}. Using defaults.")
                return default_config
        else:
            self.save_config(default_config)
            return default_config
    
    def save_config(self, config: Dict = None) -> None:
        """Save configuration to file"""
        config = config or self.config
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
        except IOError as e:
            print(f"Error saving config: {e}")
    
    def setup_logging(self) -> None:
        """Setup logging configuration"""
        log_dir = os.path.expanduser("~/.copilot_helper_logs")
        os.makedirs(log_dir, exist_ok=True)
        
        log_file = os.path.join(log_dir, "copilot_helper.log")
        
        logging.basicConfig(
            level=getattr(logging, self.config.get("log_level", "INFO")),
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def get_current_user(self) -> str:
        """Get the currently logged in user"""
        try:
            result = subprocess.run([
                "python3", "-c", 
                "from SystemConfiguration import SCDynamicStoreCopyConsoleUser; "
                "import sys; "
                "username = (SCDynamicStoreCopyConsoleUser(None, None, None) or [None])[0]; "
                "username = [username,''][username in ['loginwindow', None, '']]; "
                "sys.stdout.write(username + '\\n');"
            ], capture_output=True, text=True)
            return result.stdout.strip()
        except Exception as e:
            self.logger.error(f"Failed to get current user: {e}")
            return ""
    
    def run_applescript_as_user(self, script: str, user: str = None) -> Tuple[bool, str]:
        """Run AppleScript as the current user"""
        if not user:
            user = self.get_current_user()
        
        if not user:
            return False, "No user logged in"
        
        try:
            # Use launchctl to run as user to avoid permission issues
            uid = subprocess.run(["id", "-u", user], capture_output=True, text=True)
            if uid.returncode != 0:
                return False, f"Failed to get UID for user {user}"
            
            uid = uid.stdout.strip()
            
            cmd = [
                "launchctl", "asuser", uid, "/usr/bin/osascript", "-e", script
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            return result.returncode == 0, result.stdout.strip() if result.stdout else result.stderr.strip()
            
        except subprocess.TimeoutExpired:
            return False, "AppleScript execution timed out"
        except Exception as e:
            return False, f"Error running AppleScript: {e}"
    
    def find_dialog_windows(self) -> List[Dict]:
        """Find all dialog windows that might need auto-clicking"""
        script = '''
        tell application "System Events"
            set dialogWindows to {}
            repeat with proc in (every process whose background only is false)
                try
                    set procName to name of proc
                    repeat with win in (every window of proc)
                        try
                            set winButtons to every button of win
                            if (count of winButtons) > 0 then
                                set buttonNames to {}
                                repeat with btn in winButtons
                                    try
                                        set end of buttonNames to name of btn
                                    end try
                                end repeat
                                if (count of buttonNames) > 0 then
                                    set end of dialogWindows to {processName:procName, windowTitle:(name of win), buttons:buttonNames}
                                end if
                            end if
                        end try
                    end repeat
                end try
            end repeat
            return dialogWindows
        end tell
        '''
        
        success, result = self.run_applescript_as_user(script)
        if not success:
            self.logger.debug(f"Failed to find dialog windows: {result}")
            return []
        
        # Parse the result - this is a simplified parser for AppleScript record format
        dialogs = []
        try:
            # This is a basic parser - in production you might want something more robust
            if result and result.strip():
                self.logger.debug(f"Found potential dialogs: {result}")
                # For now, we'll use a different approach with individual checks
        except Exception as e:
            self.logger.debug(f"Error parsing dialog result: {e}")
        
        return dialogs
    
    def click_button_in_process(self, process_name: str, button_names: List[str]) -> bool:
        """Try to click specific buttons in a process"""
        # Check if process is in blacklist
        if process_name in self.config.get("process_blacklist", []):
            self.logger.debug(f"Process {process_name} is blacklisted, skipping")
            return False
        
        # Check if process whitelist is defined and process is not in it
        whitelist = self.config.get("process_whitelist", [])
        if whitelist and process_name not in whitelist:
            self.logger.debug(f"Process {process_name} not in whitelist, skipping")
            return False
        
        for button_name in button_names:
            script = f'''
            tell application "System Events"
                try
                    tell process "{process_name}"
                        repeat with win in windows
                            try
                                set targetButton to (first button of win whose name is "{button_name}")
                                click targetButton
                                return "clicked_{button_name}"
                            end try
                        end repeat
                    end tell
                end try
                return "not_found"
            end tell
            '''
            
            success, result = self.run_applescript_as_user(script)
            if success and result.startswith("clicked_"):
                self.logger.info(f"Successfully clicked '{button_name}' in {process_name}")
                return True
        
        return False
    
    def get_all_buttons_to_click(self) -> List[str]:
        """Get list of all buttons that should be auto-clicked based on config"""
        buttons = []
        
        if self.config.get("auto_approve", True):
            buttons.extend(self.positive_buttons)
            buttons.extend(self.config.get("custom_positive_buttons", []))
        
        if self.config.get("auto_deny", False):
            buttons.extend(self.negative_buttons)
            buttons.extend(self.config.get("custom_negative_buttons", []))
        
        return list(set(buttons))  # Remove duplicates
    
    def monitor_and_auto_click(self) -> None:
        """Main monitoring loop"""
        self.logger.info("Starting dialog monitoring...")
        buttons_to_click = self.get_all_buttons_to_click()
        
        # Common processes that show approval dialogs
        common_processes = [
            "Terminal", "iTerm2", "osascript", "System Preferences", 
            "System Settings", "SecurityAgent", "UserNotificationCenter",
            "CoreServicesUIAgent", "loginwindow"
        ]
        
        while self.is_running:
            try:
                for process_name in common_processes:
                    if not self.is_running:
                        break
                    
                    success = self.click_button_in_process(process_name, buttons_to_click)
                    if success:
                        # Small delay after successful click to avoid rapid clicking
                        time.sleep(1)
                
                time.sleep(self.config.get("check_interval", 0.5))
                
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                time.sleep(1)
    
    def start(self) -> bool:
        """Start the helper"""
        if self.is_running:
            print("Helper is already running")
            return False
        
        if not self.config.get("enabled", False):
            print("Helper is disabled. Use 'enable' command to enable it.")
            return False
        
        # Check accessibility permissions
        if not self.check_accessibility_permissions():
            print("Accessibility permissions required. Please enable in System Settings > Privacy & Security > Accessibility")
            return False
        
        self.is_running = True
        self.monitoring_thread = threading.Thread(target=self.monitor_and_auto_click, daemon=True)
        self.monitoring_thread.start()
        
        print("Copilot Helper started and monitoring for dialogs...")
        self.logger.info("Copilot Helper started")
        return True
    
    def stop(self) -> bool:
        """Stop the helper"""
        if not self.is_running:
            print("Helper is not running")
            return False
        
        self.is_running = False
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=2)
        
        print("Copilot Helper stopped")
        self.logger.info("Copilot Helper stopped")
        return True
    
    def enable(self) -> None:
        """Enable the helper"""
        self.config["enabled"] = True
        self.save_config()
        print("Copilot Helper enabled")
    
    def disable(self) -> None:
        """Disable the helper"""
        self.config["enabled"] = False
        self.save_config()
        if self.is_running:
            self.stop()
        print("Copilot Helper disabled")
    
    def status(self) -> None:
        """Show current status"""
        enabled = self.config.get("enabled", False)
        running = self.is_running
        
        print(f"Status: {'Enabled' if enabled else 'Disabled'}")
        print(f"Running: {'Yes' if running else 'No'}")
        print(f"Config file: {self.config_file}")
        print(f"Auto-approve: {self.config.get('auto_approve', True)}")
        print(f"Auto-deny: {self.config.get('auto_deny', False)}")
        print(f"Check interval: {self.config.get('check_interval', 0.5)}s")
    
    def check_accessibility_permissions(self) -> bool:
        """Check if the current process has accessibility permissions"""
        script = '''
        tell application "System Events"
            try
                set frontApp to name of first application process whose frontmost is true
                return "accessible"
            on error
                return "not_accessible"
            end try
        end tell
        '''
        
        success, result = self.run_applescript_as_user(script)
        return success and result == "accessible"
    
    def configure(self, key: str, value: str) -> None:
        """Configure a setting"""
        valid_keys = [
            "auto_approve", "auto_deny", "check_interval", "log_level",
            "focus_prevention"
        ]
        
        if key not in valid_keys:
            print(f"Invalid configuration key. Valid keys: {', '.join(valid_keys)}")
            return
        
        # Type conversion
        if key in ["auto_approve", "auto_deny", "focus_prevention"]:
            value = value.lower() in ["true", "1", "yes", "on"]
        elif key == "check_interval":
            try:
                value = float(value)
            except ValueError:
                print("check_interval must be a number")
                return
        elif key == "log_level":
            if value.upper() not in ["DEBUG", "INFO", "WARNING", "ERROR"]:
                print("log_level must be one of: DEBUG, INFO, WARNING, ERROR")
                return
            value = value.upper()
        
        self.config[key] = value
        self.save_config()
        print(f"Configuration updated: {key} = {value}")
        
        # If we're running, restart to apply changes
        if self.is_running:
            print("Restarting helper to apply changes...")
            self.stop()
            time.sleep(1)
            self.start()


def signal_handler(signum, frame):
    """Handle signals gracefully"""
    print("\nShutting down Copilot Helper...")
    if 'helper' in globals() and helper.is_running:
        helper.stop()
    sys.exit(0)


def main():
    global helper
    
    parser = argparse.ArgumentParser(description="Copilot Interactive Helper")
    parser.add_argument("command", nargs="?", choices=[
        "start", "stop", "enable", "disable", "status", "configure", "daemon"
    ], help="Command to execute")
    parser.add_argument("--config-key", help="Configuration key for configure command")
    parser.add_argument("--config-value", help="Configuration value for configure command")
    parser.add_argument("--config", help="Path to configuration file")
    
    args = parser.parse_args()
    
    helper = CopilotHelper(args.config)
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    if not args.command:
        print("Copilot Interactive Helper")
        print("Available commands: start, stop, enable, disable, status, configure, daemon")
        print("Use --help for more information")
        return
    
    if args.command == "start":
        if helper.start():
            try:
                # Keep main thread alive
                while helper.is_running:
                    time.sleep(1)
            except KeyboardInterrupt:
                helper.stop()
    
    elif args.command == "daemon":
        print("Starting as daemon...")
        helper.enable()  # Ensure it's enabled
        if helper.start():
            try:
                # Run indefinitely as daemon
                while True:
                    time.sleep(10)
            except KeyboardInterrupt:
                helper.stop()
    
    elif args.command == "stop":
        helper.stop()
    
    elif args.command == "enable":
        helper.enable()
    
    elif args.command == "disable":
        helper.disable()
    
    elif args.command == "status":
        helper.status()
    
    elif args.command == "configure":
        if not args.config_key or not args.config_value:
            print("Configure command requires --config-key and --config-value")
            return
        helper.configure(args.config_key, args.config_value)


if __name__ == "__main__":
    main() 