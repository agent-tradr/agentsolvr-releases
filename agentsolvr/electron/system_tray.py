"""
System tray integration for the Electron app.

This module handles system tray icon creation, context menus, and notifications
for the AgentCODR V4 Electron application.
"""

import logging
import threading
import time
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum


class TrayIconStatus(Enum):
    """System tray icon status states."""
    IDLE = "idle"
    ACTIVE = "active"
    WORKING = "working"
    ERROR = "error"
    OFFLINE = "offline"


@dataclass
class TrayMenuItem:
    """Represents a system tray context menu item."""
    id: str
    label: str
    type: str = "normal"  # normal, separator, checkbox, radio
    enabled: bool = True
    visible: bool = True
    checked: bool = False
    submenu: Optional[List['TrayMenuItem']] = None
    click_handler: Optional[Callable] = None


@dataclass
class TrayNotification:
    """Represents a system tray notification."""
    title: str
    body: str
    icon: Optional[str] = None
    timeout: int = 5000  # milliseconds
    click_handler: Optional[Callable] = None


class SystemTrayManager:
    """Manages the system tray icon and interactions."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.is_created = False
        self.current_status = TrayIconStatus.IDLE
        self.menu_items: List[TrayMenuItem] = []
        self.notification_queue: List[TrayNotification] = []
        self.status_update_handlers: List[Callable] = []
        self.click_handlers: Dict[str, Callable] = {}
        self._notification_thread = None
        self._status_icons = {
            TrayIconStatus.IDLE: "assets/tray-idle.png",
            TrayIconStatus.ACTIVE: "assets/tray-active.png", 
            TrayIconStatus.WORKING: "assets/tray-working.png",
            TrayIconStatus.ERROR: "assets/tray-error.png",
            TrayIconStatus.OFFLINE: "assets/tray-offline.png"
        }
    
    def create_tray(self, title: str = "AgentCODR V4") -> bool:
        """Create the system tray icon."""
        try:
            self.logger.info("Creating system tray icon")
            
            # Initialize default menu items
            self._create_default_menu()
            
            # Set initial status
            self.update_status(TrayIconStatus.IDLE)
            
            # Start notification processor
            self._start_notification_processor()
            
            self.is_created = True
            self.logger.info("System tray created successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to create system tray: {e}")
            return False
    
    def _create_default_menu(self) -> None:
        """Create the default context menu."""
        self.menu_items = [
            TrayMenuItem(
                id="show_window",
                label="Show AgentCODR",
                click_handler=self._handle_show_window
            ),
            TrayMenuItem(
                id="separator1",
                label="",
                type="separator"
            ),
            TrayMenuItem(
                id="agent_status",
                label="Agent Status",
                submenu=[
                    TrayMenuItem(id="agents_idle", label="All Agents Idle", enabled=False),
                    TrayMenuItem(id="agents_working", label="0 Agents Working", enabled=False),
                    TrayMenuItem(id="agents_error", label="0 Agents with Errors", enabled=False)
                ]
            ),
            TrayMenuItem(
                id="recent_activity",
                label="Recent Activity",
                submenu=[
                    TrayMenuItem(id="no_activity", label="No recent activity", enabled=False)
                ]
            ),
            TrayMenuItem(
                id="separator2", 
                label="",
                type="separator"
            ),
            TrayMenuItem(
                id="preferences",
                label="Preferences",
                click_handler=self._handle_preferences
            ),
            TrayMenuItem(
                id="about",
                label="About AgentCODR",
                click_handler=self._handle_about
            ),
            TrayMenuItem(
                id="separator3",
                label="",
                type="separator"
            ),
            TrayMenuItem(
                id="quit",
                label="Quit AgentCODR",
                click_handler=self._handle_quit
            )
        ]
    
    def update_status(self, status: TrayIconStatus, tooltip: Optional[str] = None) -> None:
        """Update the tray icon status and tooltip."""
        if not self.is_created:
            self.logger.warning("Cannot update status - tray not created")
            return
        
        self.current_status = status
        icon_path = self._status_icons.get(status, "assets/tray-default.png")
        
        if tooltip is None:
            tooltip = f"AgentCODR V4 - {status.value.title()}"
        
        self.logger.debug(f"Updated tray status to {status.value}")
        
        # Notify status update handlers
        for handler in self.status_update_handlers:
            try:
                handler(status, tooltip)
            except Exception as e:
                self.logger.error(f"Error in status update handler: {e}")
    
    def show_notification(self, notification: TrayNotification) -> None:
        """Show a system tray notification."""
        if not self.is_created:
            self.logger.warning("Cannot show notification - tray not created")
            return
        
        self.notification_queue.append(notification)
        self.logger.debug(f"Queued notification: {notification.title}")
    
    def update_menu_item(self, item_id: str, **kwargs) -> bool:
        """Update a menu item's properties."""
        def update_item(items: List[TrayMenuItem]) -> bool:
            for item in items:
                if item.id == item_id:
                    for key, value in kwargs.items():
                        if hasattr(item, key):
                            setattr(item, key, value)
                    return True
                if item.submenu and update_item(item.submenu):
                    return True
            return False
        
        if update_item(self.menu_items):
            self.logger.debug(f"Updated menu item {item_id}")
            return True
        else:
            self.logger.warning(f"Menu item {item_id} not found")
            return False
    
    def add_menu_item(self, item: TrayMenuItem, position: Optional[int] = None) -> None:
        """Add a new menu item."""
        if position is None:
            self.menu_items.append(item)
        else:
            self.menu_items.insert(position, item)
        
        self.logger.debug(f"Added menu item {item.id}")
    
    def remove_menu_item(self, item_id: str) -> bool:
        """Remove a menu item."""
        def remove_item(items: List[TrayMenuItem]) -> bool:
            for i, item in enumerate(items):
                if item.id == item_id:
                    items.pop(i)
                    return True
                if item.submenu and remove_item(item.submenu):
                    return True
            return False
        
        if remove_item(self.menu_items):
            self.logger.debug(f"Removed menu item {item_id}")
            return True
        else:
            self.logger.warning(f"Menu item {item_id} not found")
            return False
    
    def update_agent_status(self, active_agents: int, working_agents: int, error_agents: int) -> None:
        """Update agent status in the menu."""
        self.update_menu_item("agents_idle", label=f"{active_agents - working_agents - error_agents} Agents Idle")
        self.update_menu_item("agents_working", label=f"{working_agents} Agents Working")
        self.update_menu_item("agents_error", label=f"{error_agents} Agents with Errors")
        
        # Update overall status based on agent states
        if error_agents > 0:
            self.update_status(TrayIconStatus.ERROR, f"AgentCODR V4 - {error_agents} agents have errors")
        elif working_agents > 0:
            self.update_status(TrayIconStatus.WORKING, f"AgentCODR V4 - {working_agents} agents working")
        else:
            self.update_status(TrayIconStatus.ACTIVE, "AgentCODR V4 - All agents idle")
    
    def add_recent_activity(self, activity: str, timestamp: Optional[str] = None) -> None:
        """Add a recent activity item to the menu."""
        if timestamp is None:
            import datetime
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        
        # Remove "no activity" placeholder if it exists
        self.remove_menu_item("no_activity")
        
        # Add new activity item
        activity_item = TrayMenuItem(
            id=f"activity_{len(self.menu_items)}",
            label=f"{timestamp}: {activity}"[:50],  # Truncate long activities
            enabled=False
        )
        
        # Find recent activity submenu and add item
        for item in self.menu_items:
            if item.id == "recent_activity" and item.submenu:
                item.submenu.insert(0, activity_item)
                # Keep only last 5 activities
                if len(item.submenu) > 5:
                    item.submenu = item.submenu[:5]
                break
        
        self.logger.debug(f"Added recent activity: {activity}")
    
    def register_status_handler(self, handler: Callable) -> None:
        """Register a status update handler."""
        self.status_update_handlers.append(handler)
    
    def register_click_handler(self, menu_id: str, handler: Callable) -> None:
        """Register a click handler for a menu item."""
        self.click_handlers[menu_id] = handler
    
    def add_status_indicator(self, indicator_id: str, config: Dict[str, Any]) -> None:
        """Add a status indicator to the system tray."""
        self.logger.info(f"Added status indicator: {indicator_id} - {config.get('status', 'unknown')}")
    
    def update_status_indicator(self, indicator_id: str, config: Dict[str, Any]) -> None:
        """Update a status indicator in the system tray."""
        self.logger.info(f"Updated status indicator: {indicator_id} - {config.get('status', 'unknown')}")
    
    def _start_notification_processor(self) -> None:
        """Start the notification processing thread."""
        if self._notification_thread and self._notification_thread.is_alive():
            return
        
        self._notification_thread = threading.Thread(
            target=self._process_notifications,
            daemon=True
        )
        self._notification_thread.start()
    
    def _process_notifications(self) -> None:
        """Process queued notifications."""
        while True:
            try:
                if self.notification_queue:
                    notification = self.notification_queue.pop(0)
                    self._display_notification(notification)
                else:
                    time.sleep(0.1)  # Small delay when queue is empty
            except Exception as e:
                self.logger.error(f"Error processing notifications: {e}")
                time.sleep(1)
    
    def _display_notification(self, notification: TrayNotification) -> None:
        """Display a single notification."""
        try:
            self.logger.info(f"Displaying notification: {notification.title}")
            
            # In a real implementation, this would interface with the system's
            # notification API (Windows Action Center, macOS Notification Center, etc.)
            
            # Simulate notification display time
            time.sleep(notification.timeout / 1000.0)
            
            self.logger.debug(f"Notification displayed: {notification.title}")
            
        except Exception as e:
            self.logger.error(f"Failed to display notification: {e}")
    
    def _handle_show_window(self) -> None:
        """Handle show window menu click."""
        self.logger.debug("Show window clicked")
        # This would typically send a message to show the main window
    
    def _handle_preferences(self) -> None:
        """Handle preferences menu click."""
        self.logger.debug("Preferences clicked")
        # This would typically open the preferences window
    
    def _handle_about(self) -> None:
        """Handle about menu click."""
        self.logger.debug("About clicked")
        # This would typically show an about dialog
    
    def _handle_quit(self) -> None:
        """Handle quit menu click."""
        self.logger.debug("Quit clicked")
        # This would typically trigger application shutdown
    
    def destroy(self) -> None:
        """Destroy the system tray."""
        if not self.is_created:
            return
        
        self.logger.info("Destroying system tray")
        
        # Stop notification processing
        if self._notification_thread and self._notification_thread.is_alive():
            # In a real implementation, we'd properly signal the thread to stop
            pass
        
        self.is_created = False
        self.current_status = TrayIconStatus.OFFLINE
        self.menu_items.clear()
        self.notification_queue.clear()
        self.status_update_handlers.clear()
        self.click_handlers.clear()
        
        self.logger.info("System tray destroyed")


# Alias for compatibility with claude_integration imports
SystemTray = SystemTrayManager


# Global tray manager instance
tray_manager = SystemTrayManager()


def create_system_tray(title: str = "AgentSOLVR V4") -> bool:
    """Create the system tray icon."""
    return tray_manager.create_tray(title)


def get_tray_manager() -> SystemTrayManager:
    """Get the global tray manager instance."""
    return tray_manager


def show_notification(title: str, body: str, timeout: int = 5000) -> None:
    """Show a system tray notification."""
    notification = TrayNotification(title=title, body=body, timeout=timeout)
    tray_manager.show_notification(notification)


def update_status(status: TrayIconStatus, tooltip: Optional[str] = None) -> None:
    """Update the tray icon status."""
    tray_manager.update_status(status, tooltip)


def update_agent_status(active: int, working: int, errors: int) -> None:
    """Update agent status in the tray menu."""
    tray_manager.update_agent_status(active, working, errors)


