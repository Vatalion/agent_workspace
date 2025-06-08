#!/usr/bin/env python3
"""
Test Dialog Generator for Copilot Helper

This script creates various types of dialogs to test the helper's functionality.
Run this while the helper is running to see auto-clicking in action.
"""

import subprocess
import time
import argparse


def create_applescript_dialog(message, buttons, default_button=None):
    """Create a dialog using AppleScript"""
    buttons_str = ', '.join(f'"{btn}"' for btn in buttons)
    
    script = f'display dialog "{message}" buttons {{{buttons_str}}}'
    
    if default_button:
        script += f' default button "{default_button}"'
    
    try:
        result = subprocess.run(['osascript', '-e', script], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return f"User clicked: {result.stdout.strip()}"
        else:
            return f"Dialog cancelled or error: {result.stderr.strip()}"
    except subprocess.TimeoutExpired:
        return "Dialog was auto-handled (likely by helper)"
    except Exception as e:
        return f"Error: {e}"


def test_positive_dialogs():
    """Test dialogs with positive action buttons"""
    print("🔄 Testing positive action dialogs...")
    
    test_cases = [
        ("Continue with installation?", ["Cancel", "Continue"], "Continue"),
        ("Accept terms and conditions?", ["Decline", "Accept"], "Accept"),
        ("Allow camera access?", ["Deny", "Allow"], "Allow"),
        ("Install updates now?", ["Skip", "Install"], "Install"),
        ("Grant permissions?", ["Refuse", "Grant"], "Grant"),
    ]
    
    for message, buttons, default in test_cases:
        print(f"  Testing: {message}")
        result = create_applescript_dialog(message, buttons, default)
        print(f"  Result: {result}")
        time.sleep(2)


def test_negative_dialogs():
    """Test dialogs with negative action buttons"""
    print("❌ Testing negative action dialogs...")
    
    test_cases = [
        ("Delete all files?", ["Cancel", "Delete"], "Cancel"),
        ("Send crash report?", ["No", "Yes"], "No"),
        ("Enable tracking?", ["Decline", "Enable"], "Decline"),
    ]
    
    for message, buttons, default in test_cases:
        print(f"  Testing: {message}")
        result = create_applescript_dialog(message, buttons, default)
        print(f"  Result: {result}")
        time.sleep(2)


def test_mixed_dialogs():
    """Test dialogs with various button combinations"""
    print("🔀 Testing mixed dialog types...")
    
    test_cases = [
        ("Save changes before closing?", ["Don't Save", "Cancel", "Save"], "Save"),
        ("Connection failed. Retry?", ["Quit", "Retry"], "Retry"),
        ("File already exists. Replace?", ["Skip", "Replace"], "Skip"),
        ("Enable automatic backups?", ["Not Now", "Enable"], "Enable"),
    ]
    
    for message, buttons, default in test_cases:
        print(f"  Testing: {message}")
        result = create_applescript_dialog(message, buttons, default)
        print(f"  Result: {result}")
        time.sleep(2)


def create_system_dialog():
    """Create a system-like dialog"""
    print("🔧 Testing system-style dialog...")
    
    script = '''
    tell application "System Events"
        display dialog "System wants to make changes. Enter your password." ¬
            buttons {"Cancel", "OK"} ¬
            default button "OK" ¬
            with icon caution
    end tell
    '''
    
    try:
        result = subprocess.run(['osascript', '-e', script], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            return f"User clicked: {result.stdout.strip()}"
        else:
            return f"Dialog cancelled: {result.stderr.strip()}"
    except subprocess.TimeoutExpired:
        return "Dialog was auto-handled (likely by helper)"
    except Exception as e:
        return f"Error: {e}"


def main():
    parser = argparse.ArgumentParser(description="Test dialogs for Copilot Helper")
    parser.add_argument("--test-type", choices=["positive", "negative", "mixed", "system", "all"], 
                       default="all", help="Type of dialogs to test")
    parser.add_argument("--delay", type=float, default=3.0, 
                       help="Delay between dialogs (seconds)")
    
    args = parser.parse_args()
    
    print("🧪 Copilot Helper Dialog Tester")
    print("=================================")
    print()
    print("This script will create various dialogs to test the helper.")
    print("If the helper is running and configured correctly, dialogs")
    print("should be automatically dismissed.")
    print()
    print("Make sure the helper is running: copilot-helper start")
    print()
    
    input("Press Enter to start testing...")
    print()
    
    if args.test_type in ["positive", "all"]:
        test_positive_dialogs()
        time.sleep(args.delay)
    
    if args.test_type in ["negative", "all"]:
        test_negative_dialogs()
        time.sleep(args.delay)
    
    if args.test_type in ["mixed", "all"]:
        test_mixed_dialogs()
        time.sleep(args.delay)
    
    if args.test_type in ["system", "all"]:
        result = create_system_dialog()
        print(f"System dialog result: {result}")
    
    print()
    print("✅ Testing complete!")
    print()
    print("Expected behavior if helper is working:")
    print("- Positive dialogs should be auto-clicked")
    print("- Negative dialogs should only be auto-clicked if auto_deny is enabled")
    print("- Check logs: tail -f ~/.copilot_helper_logs/copilot_helper.log")


if __name__ == "__main__":
    main() 