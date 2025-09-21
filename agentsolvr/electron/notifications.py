"""
Desktop Notifications for AgentSOLVR V4 Electron App

Enhanced notification system for Claude integration, system events, and user interactions.
Provides rich notifications with actions, progress tracking, and intelligent queuing.
"""

import time
import threading
import queue
import logging
from typing import Dict, List, Any, Optional, Callable, Union
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta

from .system_tray import SystemTrayManager, TrayNotification, TrayIconStatus


class NotificationType(Enum):
    """Types of notifications."""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    PROGRESS = "progress"
    CLAUDE_ACTIVITY = "claude_activity"
    SYSTEM_STATUS = "system_status"
    USER_ACTION_REQUIRED = "user_action_required"


class NotificationPriority(Enum):
    """Notification priority levels."""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4
    URGENT = 5


@dataclass
class NotificationAction:
    """Represents an action button in a notification."""
    id: str
    label: str
    action_type: str = "button"  # button, input, dismiss
    callback: Optional[Callable] = None
    style: str = "default"  # default, primary, secondary, danger


@dataclass
class DesktopNotification:
    """Enhanced desktop notification with rich features."""
    id: str
    title: str
    message: str
    type: NotificationType = NotificationType.INFO
    priority: NotificationPriority = NotificationPriority.NORMAL
    timestamp: float = field(default_factory=time.time)
    
    # Display options
    duration: int = 5000  # milliseconds, 0 = persistent
    sound: bool = True
    badge_count: Optional[int] = None
    icon: Optional[str] = None
    image: Optional[str] = None
    
    # Interaction
    actions: List[NotificationAction] = field(default_factory=list)
    click_callback: Optional[Callable] = None
    dismiss_callback: Optional[Callable] = None
    
    # Progress tracking (for progress notifications)
    progress_value: Optional[float] = None  # 0.0 - 1.0
    progress_text: Optional[str] = None
    
    # Grouping and updating
    group_id: Optional[str] = None
    replace_id: Optional[str] = None  # Replace existing notification
    
    # Metadata
    source: str = "system"
    tags: List[str] = field(default_factory=list)
    data: Dict[str, Any] = field(default_factory=dict)


class NotificationCenter:
    """
    Advanced notification center for desktop integration.
    
    Features:
    - Intelligent notification queuing and batching
    - Rich notifications with actions and progress
    - Claude-specific notifications
    - System status updates
    - User interaction tracking
    """

    def __init__(self, system_tray: SystemTrayManager):
        self.system_tray = system_tray
        self.logger = logging.getLogger(__name__)
        
        # Notification management
        self.active_notifications: Dict[str, DesktopNotification] = {}
        self.notification_queue = queue.PriorityQueue()
        self.notification_history: List[DesktopNotification] = []
        
        # Configuration
        self.config = {
            'max_simultaneous': 3,
            'queue_size_limit': 50,
            'history_limit': 100,
            'batch_similar_notifications': True,
            'smart_timing': True,
            'do_not_disturb_hours': None,  # (start_hour, end_hour)
            'priority_escalation': True
        }
        
        # State tracking
        self.is_active = True
        self.do_not_disturb = False
        self.processing_thread = None
        self.stats = {
            'total_sent': 0,
            'dismissed_count': 0,
            'action_clicks': 0,
            'claude_notifications': 0,
            'system_notifications': 0
        }
        
        # Claude integration tracking
        self.claude_session_active = False
        self.claude_activity_notifications = {}
        
        self._start_processing()

    def _start_processing(self):
        """Start the notification processing thread."""
        if self.processing_thread and self.processing_thread.is_alive():
            return
        
        self.processing_thread = threading.Thread(
            target=self._process_notification_queue,
            daemon=True
        )
        self.processing_thread.start()
        self.logger.info("Notification center started")

    def show_notification(self, notification: DesktopNotification) -> str:
        """Show a desktop notification."""
        # Generate ID if not provided
        if not notification.id:
            notification.id = f"notif_{int(time.time() * 1000)}_{hash(notification.title)}"
        
        # Check for do not disturb
        if self.do_not_disturb and notification.priority.value < NotificationPriority.CRITICAL.value:
            self.logger.debug(f"Notification blocked by DND: {notification.id}")
            return notification.id
        
        # Handle replacement notifications
        if notification.replace_id and notification.replace_id in self.active_notifications:
            self._dismiss_notification(notification.replace_id, "replaced")
        
        # Add to queue with priority
        priority_value = (100 - notification.priority.value, notification.timestamp)
        self.notification_queue.put((priority_value, notification))
        
        self.logger.debug(f"Queued notification: {notification.id} (priority: {notification.priority.name})")
        return notification.id

    def show_claude_notification(self, 
                                operation: str, 
                                status: str, 
                                details: Optional[Dict] = None) -> str:
        """Show Claude-specific notification."""
        details = details or {}
        
        # Determine notification type and message
        if status == "started":
            title = f"Claude {operation.title()}"
            message = f"Starting {operation}..."
            notif_type = NotificationType.CLAUDE_ACTIVITY
            icon = "claude_working"
        elif status == "completed":
            title = f"Claude {operation.title()} Complete"
            tokens = details.get('tokens_used', 0)
            cost = details.get('cost_estimate', 0.0)
            message = f"Analysis complete. Tokens: {tokens}, Cost: ${cost:.3f}"
            notif_type = NotificationType.SUCCESS
            icon = "claude_success"
        elif status == "failed":
            title = f"Claude {operation.title()} Failed"
            error = details.get('error', 'Unknown error')
            message = f"Operation failed: {error}"
            notif_type = NotificationType.ERROR
            icon = "claude_error"
        else:
            title = f"Claude {operation.title()}"
            message = details.get('message', f"Claude {operation} {status}")
            notif_type = NotificationType.INFO
            icon = "claude_info"
        
        # Create notification
        notification = DesktopNotification(
            id=f"claude_{operation}_{int(time.time())}",
            title=title,
            message=message,
            type=notif_type,
            priority=NotificationPriority.NORMAL,
            icon=icon,
            source="claude",
            tags=["claude", operation],
            data=details,
            group_id="claude_operations"
        )
        
        # Add relevant actions
        if status == "completed" and operation == "analyze_code":
            notification.actions = [
                NotificationAction("view_results", "View Results", callback=self._view_claude_results),
                NotificationAction("run_tests", "Generate Tests", callback=self._generate_tests_action)
            ]
        elif status == "failed":
            notification.actions = [
                NotificationAction("retry", "Retry", callback=self._retry_claude_operation),
                NotificationAction("view_error", "View Error", callback=self._view_error_details)
            ]
        
        self.stats['claude_notifications'] += 1
        return self.show_notification(notification)

    def show_progress_notification(self, 
                                 operation_id: str,
                                 title: str,
                                 progress: float,
                                 status_text: str = "") -> str:
        """Show or update a progress notification."""
        notification = DesktopNotification(
            id=f"progress_{operation_id}",
            title=title,
            message=status_text,
            type=NotificationType.PROGRESS,
            priority=NotificationPriority.NORMAL,
            duration=0,  # Persistent until completed
            progress_value=progress,
            progress_text=f"{int(progress * 100)}%",
            source="system",
            replace_id=f"progress_{operation_id}"  # Replace previous progress
        )
        
        return self.show_notification(notification)

    def show_system_status(self, 
                          component: str, 
                          status: str, 
                          details: Optional[str] = None) -> str:
        """Show system status notification."""
        status_icons = {
            'connected': 'status_connected',
            'disconnected': 'status_disconnected',
            'error': 'status_error',
            'warning': 'status_warning',
            'maintenance': 'status_maintenance'
        }
        
        status_types = {
            'connected': NotificationType.SUCCESS,
            'disconnected': NotificationType.WARNING,
            'error': NotificationType.ERROR,
            'warning': NotificationType.WARNING,
            'maintenance': NotificationType.INFO
        }
        
        notification = DesktopNotification(
            id=f"system_{component}_{status}",
            title=f"{component.title()} {status.title()}",
            message=details or f"{component} is {status}",
            type=status_types.get(status, NotificationType.INFO),
            priority=NotificationPriority.HIGH if status == 'error' else NotificationPriority.NORMAL,
            icon=status_icons.get(status, 'status_info'),
            source="system",
            tags=["system", component, status],
            group_id=f"system_{component}"
        )
        
        # Update system tray status
        if component == "claude" and status in ['connected', 'disconnected', 'error']:
            tray_status = {
                'connected': TrayIconStatus.ACTIVE,
                'disconnected': TrayIconStatus.OFFLINE,
                'error': TrayIconStatus.ERROR
            }[status]
            self.system_tray.update_status(tray_status, f"Claude: {status}")
        
        self.stats['system_notifications'] += 1
        return self.show_notification(notification)

    def show_cost_alert(self, current_cost: float, threshold: float, period: str = "daily") -> str:
        """Show cost threshold alert."""
        percentage = (current_cost / threshold) * 100
        
        notification = DesktopNotification(
            id=f"cost_alert_{period}",
            title="Cost Alert",
            message=f"{period.title()} usage: ${current_cost:.2f} ({percentage:.1f}% of ${threshold:.2f} limit)",
            type=NotificationType.WARNING if percentage >= 80 else NotificationType.INFO,
            priority=NotificationPriority.HIGH if percentage >= 100 else NotificationPriority.NORMAL,
            icon="cost_warning",
            actions=[
                NotificationAction("view_usage", "View Usage Details", callback=self._view_usage_details),
                NotificationAction("adjust_limits", "Adjust Limits", callback=self._adjust_cost_limits)
            ],
            source="cost_monitor",
            tags=["cost", "alert", period],
            group_id="cost_monitoring"
        )
        
        return self.show_notification(notification)

    def dismiss_notification(self, notification_id: str, reason: str = "user_dismissed") -> bool:
        """Dismiss a specific notification."""
        return self._dismiss_notification(notification_id, reason)

    def dismiss_group(self, group_id: str) -> int:
        """Dismiss all notifications in a group."""
        dismissed_count = 0
        to_dismiss = [nid for nid, notif in self.active_notifications.items() 
                     if notif.group_id == group_id]
        
        for notification_id in to_dismiss:
            if self._dismiss_notification(notification_id, "group_dismissed"):
                dismissed_count += 1
        
        return dismissed_count

    def set_do_not_disturb(self, enabled: bool, duration_minutes: Optional[int] = None):
        """Enable or disable do not disturb mode."""
        self.do_not_disturb = enabled
        
        if enabled:
            self.logger.info(f"Do not disturb enabled{f' for {duration_minutes} minutes' if duration_minutes else ''}")
            
            # Schedule automatic disable
            if duration_minutes:
                def disable_dnd():
                    time.sleep(duration_minutes * 60)
                    self.do_not_disturb = False
                    self.logger.info("Do not disturb automatically disabled")
                
                threading.Thread(target=disable_dnd, daemon=True).start()
        else:
            self.logger.info("Do not disturb disabled")

    def get_active_notifications(self) -> List[DesktopNotification]:
        """Get list of currently active notifications."""
        return list(self.active_notifications.values())

    def get_notification_stats(self) -> Dict[str, Any]:
        """Get notification statistics."""
        return {
            **self.stats,
            'active_count': len(self.active_notifications),
            'queue_size': self.notification_queue.qsize(),
            'history_count': len(self.notification_history),
            'do_not_disturb': self.do_not_disturb
        }

    def clear_all_notifications(self) -> int:
        """Clear all active notifications."""
        count = len(self.active_notifications)
        
        for notification_id in list(self.active_notifications.keys()):
            self._dismiss_notification(notification_id, "cleared_all")
        
        self.logger.info(f"Cleared {count} notifications")
        return count

    def _process_notification_queue(self):
        """Process the notification queue in a separate thread."""
        while self.is_active:
            try:
                # Get next notification (blocking with timeout)
                try:
                    priority_tuple, notification = self.notification_queue.get(timeout=1.0)
                except queue.Empty:
                    continue
                
                # Check if we can display more notifications
                if len(self.active_notifications) >= self.config['max_simultaneous']:
                    # Put back in queue and wait
                    self.notification_queue.put((priority_tuple, notification))
                    time.sleep(0.5)
                    continue
                
                # Display the notification
                self._display_notification(notification)
                
                # Mark task as done
                self.notification_queue.task_done()
                
            except Exception as e:
                self.logger.error(f"Error processing notification queue: {e}")
                time.sleep(1)

    def _display_notification(self, notification: DesktopNotification):
        """Display a single notification."""
        try:
            # Add to active notifications
            self.active_notifications[notification.id] = notification
            
            # Add to history
            self.notification_history.append(notification)
            if len(self.notification_history) > self.config['history_limit']:
                self.notification_history.pop(0)
            
            # Create system tray notification
            tray_notification = TrayNotification(
                title=notification.title,
                body=notification.message,
                timeout=notification.duration,
                click_handler=notification.click_callback
            )
            
            # Show via system tray
            self.system_tray.show_notification(tray_notification)
            
            # Update stats
            self.stats['total_sent'] += 1
            
            # Auto-dismiss if duration is set
            if notification.duration > 0:
                def auto_dismiss():
                    time.sleep(notification.duration / 1000.0)
                    self._dismiss_notification(notification.id, "auto_dismissed")
                
                threading.Thread(target=auto_dismiss, daemon=True).start()
            
            self.logger.info(f"Displayed notification: {notification.id}")
            
        except Exception as e:
            self.logger.error(f"Failed to display notification {notification.id}: {e}")

    def _dismiss_notification(self, notification_id: str, reason: str) -> bool:
        """Dismiss a notification."""
        if notification_id not in self.active_notifications:
            return False
        
        notification = self.active_notifications.pop(notification_id)
        
        # Call dismiss callback if provided
        if notification.dismiss_callback:
            try:
                notification.dismiss_callback(notification, reason)
            except Exception as e:
                self.logger.error(f"Error in dismiss callback: {e}")
        
        self.stats['dismissed_count'] += 1
        self.logger.debug(f"Dismissed notification {notification_id}: {reason}")
        return True

    # Action handlers
    def _view_claude_results(self, notification: DesktopNotification, action: NotificationAction):
        """Handle view Claude results action."""
        self.logger.info("Opening Claude results viewer")
        # This would open the results in the main application

    def _generate_tests_action(self, notification: DesktopNotification, action: NotificationAction):
        """Handle generate tests action."""
        self.logger.info("Initiating test generation")
        # This would start the test generation process

    def _retry_claude_operation(self, notification: DesktopNotification, action: NotificationAction):
        """Handle retry Claude operation action."""
        operation = notification.tags[1] if len(notification.tags) > 1 else "unknown"
        self.logger.info(f"Retrying Claude operation: {operation}")
        # This would retry the failed operation

    def _view_error_details(self, notification: DesktopNotification, action: NotificationAction):
        """Handle view error details action."""
        self.logger.info("Opening error details viewer")
        # This would show detailed error information

    def _view_usage_details(self, notification: DesktopNotification, action: NotificationAction):
        """Handle view usage details action."""
        self.logger.info("Opening usage dashboard")
        # This would open the cost/usage dashboard

    def _adjust_cost_limits(self, notification: DesktopNotification, action: NotificationAction):
        """Handle adjust cost limits action."""
        self.logger.info("Opening cost limit settings")
        # This would open cost limit configuration

    def stop(self):
        """Stop the notification center."""
        self.is_active = False
        if self.processing_thread:
            self.processing_thread.join(timeout=5.0)
        self.logger.info("Notification center stopped")


# Convenience classes for specific notification types
class ClaudeNotificationHelper:
    """Helper class for Claude-specific notifications."""
    
    def __init__(self, notification_center: NotificationCenter):
        self.nc = notification_center
    
    def code_analysis_started(self, file_name: str) -> str:
        return self.nc.show_claude_notification(
            "code_analysis",
            "started",
            {"file_name": file_name}
        )
    
    def code_analysis_completed(self, file_name: str, issues_found: int, tokens_used: int, cost: float) -> str:
        return self.nc.show_claude_notification(
            "code_analysis",
            "completed",
            {
                "file_name": file_name,
                "issues_found": issues_found,
                "tokens_used": tokens_used,
                "cost_estimate": cost
            }
        )
    
    def test_generation_completed(self, test_count: int, coverage: float) -> str:
        return self.nc.show_claude_notification(
            "test_generation",
            "completed",
            {
                "test_count": test_count,
                "estimated_coverage": coverage
            }
        )
    
    def refactoring_suggestions_ready(self, suggestions_count: int) -> str:
        return self.nc.show_claude_notification(
            "refactoring",
            "completed",
            {"suggestions_count": suggestions_count}
        )


class SystemNotificationHelper:
    """Helper class for system status notifications."""
    
    def __init__(self, notification_center: NotificationCenter):
        self.nc = notification_center
    
    def claude_connected(self, auth_method: str) -> str:
        return self.nc.show_system_status(
            "claude",
            "connected",
            f"Authenticated using {auth_method}"
        )
    
    def claude_disconnected(self, reason: str = None) -> str:
        details = f"Reason: {reason}" if reason else "Connection lost"
        return self.nc.show_system_status("claude", "disconnected", details)
    
    def offline_mode_enabled(self, cached_responses: int) -> str:
        return self.nc.show_system_status(
            "system",
            "maintenance",
            f"Offline mode enabled. {cached_responses} cached responses available."
        )
    
    def rate_limit_warning(self, usage_percentage: float) -> str:
        return self.nc.show_system_status(
            "claude",
            "warning",
            f"Rate limit at {usage_percentage:.1f}% capacity"
        )


# Global notification center instance (will be initialized with system tray)
_notification_center: Optional[NotificationCenter] = None


def initialize_notifications(system_tray: SystemTrayManager) -> NotificationCenter:
    """Initialize the global notification center."""
    global _notification_center
    _notification_center = NotificationCenter(system_tray)
    return _notification_center


def get_notification_center() -> NotificationCenter:
    """Get the global notification center instance."""
    if _notification_center is None:
        raise RuntimeError("Notification center not initialized. Call initialize_notifications() first.")
    return _notification_center


def get_claude_helper() -> ClaudeNotificationHelper:
    """Get Claude notification helper."""
    return ClaudeNotificationHelper(get_notification_center())


def get_system_helper() -> SystemNotificationHelper:
    """Get system notification helper."""
    return SystemNotificationHelper(get_notification_center())