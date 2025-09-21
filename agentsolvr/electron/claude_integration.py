"""
Electron Claude Integration for AgentSOLVR V4 Desktop App

This module provides desktop-specific integration with Claude Code API,
bridging the Electron frontend with the backend Claude integration system.
Includes desktop notifications, system tray status updates, and local caching.
"""

import asyncio
import json
import time
import logging
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path

from .backend_bridge import BackendBridge
from .system_tray import SystemTray


@dataclass
class DesktopClaudeEvent:
    """Event data for desktop Claude integration notifications"""
    event_type: str
    data: Dict[str, Any]
    timestamp: float
    priority: str = "normal"  # low, normal, high, critical


class ElectronClaudeIntegration:
    """
    Desktop-specific Claude integration for the Electron app.
    
    Provides:
    - Desktop notifications for Claude operations
    - System tray status indicators for Claude connectivity
    - Local caching for offline access
    - Desktop-specific configuration management
    - Integration with Electron menu system
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize desktop Claude integration."""
        self.config = config or {}
        
        # Core components
        bridge_config = self.config.get('backend_bridge', {'services': {}})
        self.backend_bridge = BackendBridge(bridge_config)
        self.system_tray = SystemTray()
        
        # Desktop-specific state
        self.desktop_cache_path = Path.home() / ".agentsolv" / "claude_cache"
        self.desktop_cache_path.mkdir(parents=True, exist_ok=True)
        
        # Event handling
        self.event_listeners: Dict[str, List[Callable]] = {}
        self.notification_queue = []
        
        # Status tracking
        self.claude_status = {
            'connected': False,
            'authenticated': False,
            'auth_method': None,
            'last_activity': None,
            'offline_mode': False,
            'rate_limit_status': 'normal',
            'cost_tracking': {'daily_usage': 0.0, 'monthly_usage': 0.0}
        }
        
        # Desktop configuration
        self.desktop_config = {
            'show_notifications': self.config.get('show_notifications', True),
            'tray_status_updates': self.config.get('tray_status_updates', True),
            'auto_cache_responses': self.config.get('auto_cache_responses', True),
            'notification_sound': self.config.get('notification_sound', True),
            'minimize_to_tray': self.config.get('minimize_to_tray', True)
        }
        
        self.logger = logging.getLogger(__name__)
        
        # Initialize desktop features
        self._setup_desktop_features()

    def _setup_desktop_features(self):
        """Setup desktop-specific features."""
        # Setup system tray integration
        if self.desktop_config['tray_status_updates']:
            self.system_tray.add_status_indicator('claude', {
                'icon': 'claude_disconnected',
                'tooltip': 'Claude: Disconnected',
                'status': 'disconnected'
            })
        
        # Load cached data
        self._load_desktop_cache()
        
        # Register event listeners
        self.register_event_listener('connection_changed', self._update_tray_status)
        self.register_event_listener('authentication_changed', self._update_auth_status)
        self.register_event_listener('rate_limit_warning', self._show_rate_limit_notification)
        self.register_event_listener('cost_threshold_reached', self._show_cost_notification)

    async def initialize_claude_connection(self) -> Dict[str, Any]:
        """Initialize connection to Claude through backend bridge."""
        try:
            # Connect to backend Claude integration
            connection_result = await self.backend_bridge.connect_to_service('claude_integration')
            
            if connection_result['success']:
                self.claude_status['connected'] = True
                self.claude_status['last_activity'] = time.time()
                
                self._emit_event('connection_changed', {
                    'connected': True,
                    'timestamp': time.time()
                })
                
                # Show desktop notification
                if self.desktop_config['show_notifications']:
                    self._show_notification(
                        title="Claude Integration",
                        message="Connected to Claude Code API",
                        type="info"
                    )
                
                return {
                    'success': True,
                    'message': 'Claude integration initialized successfully',
                    'desktop_features_enabled': True
                }
            else:
                self._emit_event('connection_changed', {
                    'connected': False,
                    'error': connection_result.get('error')
                })
                
                return {
                    'success': False,
                    'error': connection_result.get('error', 'Failed to connect to Claude')
                }
                
        except Exception as e:
            self.logger.error(f"Claude initialization error: {e}")
            return {
                'success': False,
                'error': f"Claude initialization failed: {str(e)}"
            }

    async def authenticate_claude_desktop(self, auth_method: str = 'browser') -> Dict[str, Any]:
        """Authenticate with Claude using desktop-appropriate method."""
        try:
            if auth_method == 'browser':
                # Use browser authentication with desktop integration
                auth_result = await self.backend_bridge.call_service(
                    'claude_integration',
                    'authenticate_browser'
                )
            elif auth_method == 'api_key':
                # Handle API key authentication with secure desktop storage
                api_key = self._get_stored_api_key()
                if not api_key:
                    return {
                        'success': False,
                        'error': 'API key not configured. Please set up authentication.'
                    }
                
                auth_result = await self.backend_bridge.call_service(
                    'claude_integration',
                    'authenticate_api_key',
                    {'api_key': api_key}
                )
            else:
                return {
                    'success': False,
                    'error': f'Unsupported authentication method: {auth_method}'
                }
            
            if auth_result['success']:
                self.claude_status['authenticated'] = True
                self.claude_status['auth_method'] = auth_method
                
                self._emit_event('authentication_changed', {
                    'authenticated': True,
                    'method': auth_method,
                    'user_info': auth_result.get('data', {})
                })
                
                # Show success notification
                if self.desktop_config['show_notifications']:
                    self._show_notification(
                        title="Claude Authentication",
                        message=f"Successfully authenticated using {auth_method}",
                        type="success"
                    )
                
                return {
                    'success': True,
                    'method': auth_method,
                    'user_info': auth_result.get('data', {})
                }
            else:
                self._emit_event('authentication_changed', {
                    'authenticated': False,
                    'error': auth_result.get('error')
                })
                
                return {
                    'success': False,
                    'error': auth_result.get('error', 'Authentication failed')
                }
                
        except Exception as e:
            self.logger.error(f"Claude authentication error: {e}")
            return {
                'success': False,
                'error': f"Authentication failed: {str(e)}"
            }

    async def analyze_code_desktop(self, code: str, analysis_type: str = 'comprehensive') -> Dict[str, Any]:
        """Analyze code with desktop-specific features."""
        try:
            # Check if we can use cached results
            cache_result = self._check_desktop_cache('analyze_code', {
                'code_hash': hash(code),
                'analysis_type': analysis_type
            })
            
            if cache_result:
                # Show cache notification
                if self.desktop_config['show_notifications']:
                    self._show_notification(
                        title="Code Analysis",
                        message="Using cached analysis results",
                        type="info",
                        duration=3000
                    )
                
                return {
                    'success': True,
                    'data': cache_result,
                    'cached': True,
                    'source': 'desktop_cache'
                }
            
            # Call backend Claude integration
            analysis_result = await self.backend_bridge.call_service(
                'claude_integration',
                'analyze_code',
                {'code': code, 'analysis_type': analysis_type}
            )
            
            if analysis_result['success']:
                # Cache results if enabled
                if self.desktop_config['auto_cache_responses']:
                    self._cache_desktop_response('analyze_code', {
                        'code_hash': hash(code),
                        'analysis_type': analysis_type
                    }, analysis_result['data'])
                
                # Show completion notification
                if self.desktop_config['show_notifications']:
                    issues_count = len(analysis_result['data'].get('issues', []))
                    self._show_notification(
                        title="Code Analysis Complete",
                        message=f"Found {issues_count} issues to review",
                        type="success"
                    )
                
                # Update status
                self.claude_status['last_activity'] = time.time()
                
                return {
                    'success': True,
                    'data': analysis_result['data'],
                    'cached': False,
                    'tokens_used': analysis_result.get('tokens_used', 0),
                    'cost_estimate': analysis_result.get('cost_estimate', 0.0)
                }
            else:
                # Show error notification
                if self.desktop_config['show_notifications']:
                    self._show_notification(
                        title="Code Analysis Failed",
                        message=analysis_result.get('error', 'Unknown error'),
                        type="error"
                    )
                
                return analysis_result
                
        except Exception as e:
            self.logger.error(f"Desktop code analysis error: {e}")
            return {
                'success': False,
                'error': f"Desktop code analysis failed: {str(e)}"
            }

    async def generate_tests_desktop(self, code: str, test_framework: str = 'pytest') -> Dict[str, Any]:
        """Generate tests with desktop integration."""
        try:
            # Show progress notification
            if self.desktop_config['show_notifications']:
                self._show_notification(
                    title="Test Generation",
                    message="Generating tests with Claude...",
                    type="info",
                    duration=5000
                )
            
            test_result = await self.backend_bridge.call_service(
                'claude_integration',
                'generate_tests',
                {'code': code, 'test_framework': test_framework}
            )
            
            if test_result['success']:
                # Cache results
                if self.desktop_config['auto_cache_responses']:
                    self._cache_desktop_response('generate_tests', {
                        'code_hash': hash(code),
                        'framework': test_framework
                    }, test_result['data'])
                
                # Show success notification with test count
                test_count = test_result['data'].get('test_count', 0)
                if self.desktop_config['show_notifications']:
                    self._show_notification(
                        title="Test Generation Complete",
                        message=f"Generated {test_count} tests for {test_framework}",
                        type="success"
                    )
                
                self.claude_status['last_activity'] = time.time()
                return test_result
            else:
                # Show error notification
                if self.desktop_config['show_notifications']:
                    self._show_notification(
                        title="Test Generation Failed",
                        message=test_result.get('error', 'Unknown error'),
                        type="error"
                    )
                
                return test_result
                
        except Exception as e:
            self.logger.error(f"Desktop test generation error: {e}")
            return {
                'success': False,
                'error': f"Desktop test generation failed: {str(e)}"
            }

    def get_desktop_status(self) -> Dict[str, Any]:
        """Get comprehensive desktop Claude status."""
        rate_limit_status = self._get_rate_limit_status()
        cost_status = self._get_cost_status()
        
        return {
            'claude_integration': self.claude_status.copy(),
            'rate_limits': rate_limit_status,
            'cost_tracking': cost_status,
            'desktop_features': {
                'notifications_enabled': self.desktop_config['show_notifications'],
                'tray_integration': self.desktop_config['tray_status_updates'],
                'auto_caching': self.desktop_config['auto_cache_responses'],
                'cache_size': self._get_cache_size(),
                'offline_capabilities': self._get_offline_capabilities()
            },
            'last_updated': time.time()
        }

    def toggle_offline_mode(self, offline: bool) -> Dict[str, Any]:
        """Toggle offline mode for desktop usage."""
        self.claude_status['offline_mode'] = offline
        
        if offline:
            # Switch to offline mode
            self._emit_event('offline_mode_enabled', {
                'cached_responses_available': self._get_cache_size()
            })
            
            if self.desktop_config['show_notifications']:
                self._show_notification(
                    title="Offline Mode",
                    message="Switched to offline mode - using cached responses",
                    type="warning"
                )
        else:
            # Switch to online mode
            self._emit_event('offline_mode_disabled', {})
            
            if self.desktop_config['show_notifications']:
                self._show_notification(
                    title="Online Mode",
                    message="Reconnected to Claude Code API",
                    type="success"
                )
        
        return {
            'offline_mode': offline,
            'cache_available': self._get_cache_size() > 0,
            'last_activity': self.claude_status['last_activity']
        }

    def register_event_listener(self, event_type: str, callback: Callable):
        """Register event listener for desktop notifications."""
        if event_type not in self.event_listeners:
            self.event_listeners[event_type] = []
        self.event_listeners[event_type].append(callback)

    def _emit_event(self, event_type: str, data: Dict[str, Any]):
        """Emit event to registered listeners."""
        event = DesktopClaudeEvent(
            event_type=event_type,
            data=data,
            timestamp=time.time()
        )
        
        if event_type in self.event_listeners:
            for callback in self.event_listeners[event_type]:
                try:
                    callback(event)
                except Exception as e:
                    self.logger.error(f"Event listener error: {e}")

    def _update_tray_status(self, event: DesktopClaudeEvent):
        """Update system tray status based on Claude connection."""
        if not self.desktop_config['tray_status_updates']:
            return
        
        if event.data.get('connected'):
            self.system_tray.update_status_indicator('claude', {
                'icon': 'claude_connected',
                'tooltip': 'Claude: Connected',
                'status': 'connected'
            })
        else:
            self.system_tray.update_status_indicator('claude', {
                'icon': 'claude_disconnected',
                'tooltip': 'Claude: Disconnected',
                'status': 'disconnected'
            })

    def _update_auth_status(self, event: DesktopClaudeEvent):
        """Update authentication status in tray."""
        if not self.desktop_config['tray_status_updates']:
            return
        
        if event.data.get('authenticated'):
            method = event.data.get('method', 'unknown')
            self.system_tray.update_status_indicator('claude', {
                'icon': 'claude_authenticated',
                'tooltip': f'Claude: Authenticated ({method})',
                'status': 'authenticated'
            })

    def _show_rate_limit_notification(self, event: DesktopClaudeEvent):
        """Show rate limit warning notification."""
        if self.desktop_config['show_notifications']:
            limit_info = event.data.get('limit_info', {})
            self._show_notification(
                title="Rate Limit Warning",
                message=f"Approaching rate limit: {limit_info.get('usage', 'N/A')}",
                type="warning"
            )

    def _show_cost_notification(self, event: DesktopClaudeEvent):
        """Show cost threshold notification."""
        if self.desktop_config['show_notifications']:
            cost_info = event.data.get('cost_info', {})
            threshold = cost_info.get('threshold', 0)
            current = cost_info.get('current', 0)
            
            self._show_notification(
                title="Cost Alert",
                message=f"Usage cost: ${current:.2f} (threshold: ${threshold:.2f})",
                type="warning"
            )

    def _show_notification(self, title: str, message: str, type: str = "info", duration: int = 5000):
        """Show desktop notification."""
        notification = {
            'title': title,
            'message': message,
            'type': type,  # info, success, warning, error
            'duration': duration,
            'timestamp': time.time(),
            'sound': self.desktop_config['notification_sound']
        }
        
        self.notification_queue.append(notification)
        
        # Emit to Electron frontend for display
        self._emit_event('desktop_notification', notification)

    def _check_desktop_cache(self, operation: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check desktop cache for cached responses."""
        cache_key = f"{operation}_{hash(str(sorted(params.items())))}"
        cache_file = self.desktop_cache_path / f"{cache_key}.json"
        
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    cache_data = json.load(f)
                
                # Check cache expiry (24 hours)
                if time.time() - cache_data['timestamp'] < 86400:
                    return cache_data['response']
            except Exception as e:
                self.logger.error(f"Cache read error: {e}")
        
        return None

    def _cache_desktop_response(self, operation: str, params: Dict[str, Any], response: Dict[str, Any]):
        """Cache response for desktop offline usage."""
        cache_key = f"{operation}_{hash(str(sorted(params.items())))}"
        cache_file = self.desktop_cache_path / f"{cache_key}.json"
        
        cache_data = {
            'operation': operation,
            'params': params,
            'response': response,
            'timestamp': time.time()
        }
        
        try:
            with open(cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
        except Exception as e:
            self.logger.error(f"Cache write error: {e}")

    def _load_desktop_cache(self):
        """Load existing desktop cache."""
        if not self.desktop_cache_path.exists():
            return
        
        cache_files = list(self.desktop_cache_path.glob("*.json"))
        self.logger.info(f"Found {len(cache_files)} cached responses")

    def _get_cache_size(self) -> int:
        """Get number of cached responses."""
        if not self.desktop_cache_path.exists():
            return 0
        return len(list(self.desktop_cache_path.glob("*.json")))

    def _get_offline_capabilities(self) -> Dict[str, bool]:
        """Get available offline capabilities."""
        return {
            'cached_analysis': self._get_cache_size() > 0,
            'basic_syntax_check': True,
            'file_operations': True,
            'local_search': True,
            'documentation_view': True
        }

    def _get_rate_limit_status(self) -> Dict[str, Any]:
        """Get current rate limit status."""
        # This would be provided by backend bridge
        return {
            'requests_remaining': 45,
            'tokens_remaining': 95000,
            'reset_time': time.time() + 3600,
            'current_usage_percentage': 0.15
        }

    def _get_cost_status(self) -> Dict[str, Any]:
        """Get current cost tracking status."""
        return {
            'daily_usage': self.claude_status['cost_tracking']['daily_usage'],
            'monthly_usage': self.claude_status['cost_tracking']['monthly_usage'],
            'estimated_monthly': self.claude_status['cost_tracking']['monthly_usage'] * 30,
            'last_updated': time.time()
        }

    def _get_stored_api_key(self) -> Optional[str]:
        """Get stored API key from secure desktop storage."""
        # In a real implementation, this would use secure storage
        # For now, return None to indicate API key setup is needed
        return None

    def clear_desktop_cache(self) -> Dict[str, Any]:
        """Clear desktop cache."""
        try:
            cache_files = list(self.desktop_cache_path.glob("*.json"))
            files_removed = 0
            
            for cache_file in cache_files:
                cache_file.unlink()
                files_removed += 1
            
            if self.desktop_config['show_notifications']:
                self._show_notification(
                    title="Cache Cleared",
                    message=f"Removed {files_removed} cached responses",
                    type="info"
                )
            
            return {
                'success': True,
                'files_removed': files_removed
            }
            
        except Exception as e:
            self.logger.error(f"Cache clear error: {e}")
            return {
                'success': False,
                'error': f"Failed to clear cache: {str(e)}"
            }

    def get_desktop_metrics(self) -> Dict[str, Any]:
        """Get desktop-specific metrics."""
        return {
            'session_duration': time.time() - (self.claude_status.get('session_start', time.time())),
            'notifications_sent': len(self.notification_queue),
            'cache_hit_rate': 0.85,  # Would be calculated from actual usage
            'offline_requests_served': 0,  # Would track offline usage
            'total_requests': 0,  # Would track all requests
            'average_response_time': 1.5,  # Would track response times
            'desktop_integration_health': 'excellent'
        }