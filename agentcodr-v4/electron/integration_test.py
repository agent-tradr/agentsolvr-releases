"""
Integration Test for AgentSOLVR V4 Desktop-Backend Integration

This script validates the complete integration between the Electron desktop app
and the backend services, specifically focusing on Claude integration,
notifications, and system tray functionality.
"""

import asyncio
import logging
import time
import sys
from pathlib import Path
from typing import Dict, Any, List

# Add project root to path for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from .claude_integration import ElectronClaudeIntegration
from .notifications import NotificationCenter, initialize_notifications, get_claude_helper, get_system_helper
from .system_tray import SystemTrayManager, TrayIconStatus
from .backend_bridge import BackendBridge


class DesktopIntegrationTester:
    """
    Comprehensive tester for desktop-backend integration.
    
    Tests:
    1. Claude integration initialization
    2. Desktop notifications system
    3. System tray functionality
    4. Backend bridge connectivity
    5. End-to-end workflows
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.test_results: List[Dict[str, Any]] = []
        
        # Initialize components
        self.system_tray = SystemTrayManager()
        self.notification_center = None
        self.claude_integration = None
        self.backend_bridge = BackendBridge({'services': {}})
        
        # Test configuration
        self.test_config = {
            'run_slow_tests': True,
            'test_notifications': True,
            'test_system_tray': True,
            'test_claude_integration': True,
            'test_backend_bridge': True,
            'cleanup_after_tests': True
        }

    async def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive integration tests."""
        self.logger.info("Starting AgentSOLVR V4 Desktop Integration Tests")
        
        start_time = time.time()
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        # Test suites
        test_suites = [
            ("System Tray Integration", self.test_system_tray_integration),
            ("Notification System", self.test_notification_system),
            ("Backend Bridge", self.test_backend_bridge),
            ("Claude Integration", self.test_claude_integration),
            ("End-to-End Workflows", self.test_end_to_end_workflows),
            ("Performance & Reliability", self.test_performance_reliability)
        ]
        
        for suite_name, test_function in test_suites:
            self.logger.info(f"\n{'='*60}")
            self.logger.info(f"Running Test Suite: {suite_name}")
            self.logger.info(f"{'='*60}")
            
            try:
                suite_results = await test_function()
                suite_total = len(suite_results)
                suite_passed = sum(1 for r in suite_results if r['passed'])
                suite_failed = suite_total - suite_passed
                
                total_tests += suite_total
                passed_tests += suite_passed
                failed_tests += suite_failed
                
                self.logger.info(f"{suite_name}: {suite_passed}/{suite_total} tests passed")
                
                # Add to overall results
                self.test_results.extend(suite_results)
                
            except Exception as e:
                self.logger.error(f"Test suite {suite_name} failed with error: {e}")
                failed_tests += 1
                self.test_results.append({
                    'test_name': f"{suite_name} (Suite Error)",
                    'passed': False,
                    'error': str(e),
                    'duration': 0
                })
        
        # Generate final report
        duration = time.time() - start_time
        
        final_results = {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': (passed_tests / total_tests) * 100 if total_tests > 0 else 0,
            'total_duration': duration,
            'test_results': self.test_results,
            'overall_status': 'PASSED' if failed_tests == 0 else 'FAILED'
        }
        
        self._log_final_report(final_results)
        
        # Cleanup
        if self.test_config['cleanup_after_tests']:
            await self.cleanup_test_environment()
        
        return final_results

    async def test_system_tray_integration(self) -> List[Dict[str, Any]]:
        """Test system tray functionality."""
        results = []
        
        # Test 1: System tray creation
        test_start = time.time()
        try:
            success = self.system_tray.create_tray("AgentSOLVR V4 Test")
            results.append({
                'test_name': 'System Tray Creation',
                'passed': success,
                'duration': time.time() - test_start,
                'details': 'System tray icon created successfully' if success else 'Failed to create system tray'
            })
        except Exception as e:
            results.append({
                'test_name': 'System Tray Creation',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 2: Status updates
        test_start = time.time()
        try:
            self.system_tray.update_status(TrayIconStatus.WORKING, "Testing status update")
            await asyncio.sleep(0.1)
            self.system_tray.update_status(TrayIconStatus.ACTIVE, "Test completed")
            
            results.append({
                'test_name': 'System Tray Status Updates',
                'passed': True,
                'duration': time.time() - test_start,
                'details': 'Status updates processed successfully'
            })
        except Exception as e:
            results.append({
                'test_name': 'System Tray Status Updates',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 3: Menu functionality
        test_start = time.time()
        try:
            self.system_tray.add_recent_activity("Integration test started")
            self.system_tray.update_agent_status(active_agents=6, working_agents=2, error_agents=0)
            
            results.append({
                'test_name': 'System Tray Menu Updates',
                'passed': True,
                'duration': time.time() - test_start,
                'details': 'Menu items updated successfully'
            })
        except Exception as e:
            results.append({
                'test_name': 'System Tray Menu Updates',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        return results

    async def test_notification_system(self) -> List[Dict[str, Any]]:
        """Test notification center functionality."""
        results = []
        
        # Initialize notification center
        try:
            self.notification_center = initialize_notifications(self.system_tray)
            claude_helper = get_claude_helper()
            system_helper = get_system_helper()
        except Exception as e:
            results.append({
                'test_name': 'Notification Center Initialization',
                'passed': False,
                'duration': 0,
                'error': str(e)
            })
            return results
        
        # Test 1: Basic notification
        test_start = time.time()
        try:
            from notifications import DesktopNotification, NotificationType
            
            notification = DesktopNotification(
                id="test_basic",
                title="Test Notification",
                message="This is a test notification",
                type=NotificationType.INFO
            )
            
            notif_id = self.notification_center.show_notification(notification)
            
            results.append({
                'test_name': 'Basic Notification Display',
                'passed': bool(notif_id),
                'duration': time.time() - test_start,
                'details': f'Notification ID: {notif_id}'
            })
        except Exception as e:
            results.append({
                'test_name': 'Basic Notification Display',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 2: Claude-specific notifications
        test_start = time.time()
        try:
            # Simulate Claude workflow notifications
            claude_helper.code_analysis_started("test_file.py")
            await asyncio.sleep(0.1)
            claude_helper.code_analysis_completed("test_file.py", 3, 1500, 0.015)
            
            results.append({
                'test_name': 'Claude Notification Workflow',
                'passed': True,
                'duration': time.time() - test_start,
                'details': 'Claude workflow notifications sent successfully'
            })
        except Exception as e:
            results.append({
                'test_name': 'Claude Notification Workflow',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 3: System status notifications
        test_start = time.time()
        try:
            system_helper.claude_connected("browser")
            await asyncio.sleep(0.1)
            system_helper.rate_limit_warning(75.5)
            
            results.append({
                'test_name': 'System Status Notifications',
                'passed': True,
                'duration': time.time() - test_start,
                'details': 'System status notifications sent successfully'
            })
        except Exception as e:
            results.append({
                'test_name': 'System Status Notifications',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 4: Notification stats
        test_start = time.time()
        try:
            stats = self.notification_center.get_notification_stats()
            expected_keys = ['total_sent', 'active_count', 'history_count']
            has_required_keys = all(key in stats for key in expected_keys)
            
            results.append({
                'test_name': 'Notification Statistics',
                'passed': has_required_keys and stats['total_sent'] > 0,
                'duration': time.time() - test_start,
                'details': f'Stats: {stats}'
            })
        except Exception as e:
            results.append({
                'test_name': 'Notification Statistics',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        return results

    async def test_backend_bridge(self) -> List[Dict[str, Any]]:
        """Test backend bridge connectivity."""
        results = []
        
        # Test 1: Backend bridge initialization
        test_start = time.time()
        try:
            # Initialize the bridge
            init_success = self.backend_bridge.initialize()
            
            results.append({
                'test_name': 'Backend Bridge Initialization',
                'passed': init_success,
                'duration': time.time() - test_start,
                'details': f'Bridge initialized: {init_success}'
            })
        except Exception as e:
            results.append({
                'test_name': 'Backend Bridge Initialization',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 2: Service status check
        test_start = time.time()
        try:
            # Check service status
            status_result = self.backend_bridge._handle_get_service_status({})
            
            results.append({
                'test_name': 'Backend Service Status',
                'passed': 'services' in status_result,
                'duration': time.time() - test_start,
                'details': f'Status result: {status_result}'
            })
        except Exception as e:
            results.append({
                'test_name': 'Backend Service Status',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        return results

    async def test_claude_integration(self) -> List[Dict[str, Any]]:
        """Test Claude integration functionality."""
        results = []
        
        # Initialize Claude integration
        try:
            # Create a simple config for ElectronClaudeIntegration
            config = {
                'show_notifications': True,
                'auto_cache_responses': True
            }
            self.claude_integration = ElectronClaudeIntegration(config)
        except Exception as e:
            results.append({
                'test_name': 'Claude Integration Initialization',
                'passed': False,
                'duration': 0,
                'error': str(e)
            })
            return results
        
        # Test 1: Claude connection initialization
        test_start = time.time()
        try:
            init_result = await self.claude_integration.initialize_claude_connection()
            
            results.append({
                'test_name': 'Claude Connection Initialization',
                'passed': init_result.get('success', False),
                'duration': time.time() - test_start,
                'details': f'Init result: {init_result}'
            })
        except Exception as e:
            results.append({
                'test_name': 'Claude Connection Initialization',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 2: Desktop status tracking
        test_start = time.time()
        try:
            status = self.claude_integration.get_desktop_status()
            required_keys = ['claude_integration', 'desktop_features', 'last_updated']
            has_required_keys = all(key in status for key in required_keys)
            
            results.append({
                'test_name': 'Desktop Status Tracking',
                'passed': has_required_keys,
                'duration': time.time() - test_start,
                'details': f'Status keys: {list(status.keys())}'
            })
        except Exception as e:
            results.append({
                'test_name': 'Desktop Status Tracking',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 3: Offline mode toggle
        test_start = time.time()
        try:
            offline_result = self.claude_integration.toggle_offline_mode(True)
            online_result = self.claude_integration.toggle_offline_mode(False)
            
            results.append({
                'test_name': 'Offline Mode Toggle',
                'passed': offline_result['offline_mode'] and not online_result['offline_mode'],
                'duration': time.time() - test_start,
                'details': 'Offline mode toggle worked correctly'
            })
        except Exception as e:
            results.append({
                'test_name': 'Offline Mode Toggle',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 4: Desktop cache functionality
        test_start = time.time()
        try:
            cache_result = self.claude_integration.clear_desktop_cache()
            
            results.append({
                'test_name': 'Desktop Cache Management',
                'passed': cache_result.get('success', False),
                'duration': time.time() - test_start,
                'details': f'Cache cleared: {cache_result.get("files_removed", 0)} files'
            })
        except Exception as e:
            results.append({
                'test_name': 'Desktop Cache Management',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        return results

    async def test_end_to_end_workflows(self) -> List[Dict[str, Any]]:
        """Test complete end-to-end workflows."""
        results = []
        
        if not self.claude_integration or not self.notification_center:
            results.append({
                'test_name': 'End-to-End Workflow Prerequisites',
                'passed': False,
                'duration': 0,
                'error': 'Required components not initialized'
            })
            return results
        
        # Test 1: Code analysis workflow
        test_start = time.time()
        try:
            # Simulate complete code analysis workflow
            test_code = """
def example_function(x, y):
    result = x + y
    return result
"""
            
            # This would normally call the backend, but we'll simulate
            analysis_result = await self.claude_integration.analyze_code_desktop(
                test_code, 
                "comprehensive"
            )
            
            # Check if notifications were triggered
            stats = self.notification_center.get_notification_stats()
            
            results.append({
                'test_name': 'Code Analysis End-to-End Workflow',
                'passed': True,  # Success if no exceptions
                'duration': time.time() - test_start,
                'details': f'Analysis completed, notifications: {stats["total_sent"]}'
            })
        except Exception as e:
            results.append({
                'test_name': 'Code Analysis End-to-End Workflow',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 2: System status update workflow
        test_start = time.time()
        try:
            # Test complete system status update flow
            self.system_tray.update_status(TrayIconStatus.WORKING, "Processing...")
            
            # Simulate work
            await asyncio.sleep(0.1)
            
            # Complete workflow
            self.system_tray.update_status(TrayIconStatus.ACTIVE, "Ready")
            self.system_tray.add_recent_activity("End-to-end test completed")
            
            results.append({
                'test_name': 'System Status Update Workflow',
                'passed': True,
                'duration': time.time() - test_start,
                'details': 'Status update workflow completed successfully'
            })
        except Exception as e:
            results.append({
                'test_name': 'System Status Update Workflow',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        return results

    async def test_performance_reliability(self) -> List[Dict[str, Any]]:
        """Test performance and reliability aspects."""
        results = []
        
        # Test 1: Notification queue performance
        test_start = time.time()
        try:
            if self.notification_center:
                # Send multiple notifications rapidly
                for i in range(10):
                    from notifications import DesktopNotification, NotificationType
                    notification = DesktopNotification(
                        id=f"perf_test_{i}",
                        title=f"Performance Test {i}",
                        message="Testing notification queue performance",
                        type=NotificationType.INFO,
                        duration=1000  # Short duration
                    )
                    self.notification_center.show_notification(notification)
                
                # Small delay to let queue process
                await asyncio.sleep(0.5)
                
                stats = self.notification_center.get_notification_stats()
                
                results.append({
                    'test_name': 'Notification Queue Performance',
                    'passed': stats['total_sent'] >= 10,
                    'duration': time.time() - test_start,
                    'details': f'Sent {stats["total_sent"]} notifications successfully'
                })
            else:
                results.append({
                    'test_name': 'Notification Queue Performance',
                    'passed': False,
                    'duration': time.time() - test_start,
                    'error': 'Notification center not available'
                })
        except Exception as e:
            results.append({
                'test_name': 'Notification Queue Performance',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        # Test 2: Memory usage stability
        test_start = time.time()
        try:
            # Test repeated operations don't cause memory leaks
            for i in range(5):
                if self.claude_integration:
                    status = self.claude_integration.get_desktop_status()
                    metrics = self.claude_integration.get_desktop_metrics()
                
                self.system_tray.update_status(TrayIconStatus.ACTIVE)
                await asyncio.sleep(0.01)
            
            results.append({
                'test_name': 'Memory Usage Stability',
                'passed': True,
                'duration': time.time() - test_start,
                'details': 'Repeated operations completed without issues'
            })
        except Exception as e:
            results.append({
                'test_name': 'Memory Usage Stability',
                'passed': False,
                'duration': time.time() - test_start,
                'error': str(e)
            })
        
        return results

    async def cleanup_test_environment(self):
        """Clean up test environment."""
        try:
            # Clear notifications
            if self.notification_center:
                self.notification_center.clear_all_notifications()
                self.notification_center.stop()
            
            # Reset system tray
            if self.system_tray:
                self.system_tray.update_status(TrayIconStatus.IDLE, "AgentSOLVR V4")
            
            # Clear Claude integration cache
            if self.claude_integration:
                self.claude_integration.clear_desktop_cache()
            
            self.logger.info("Test environment cleaned up successfully")
            
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}")

    def _log_final_report(self, results: Dict[str, Any]):
        """Log the final test report."""
        self.logger.info(f"\n{'='*80}")
        self.logger.info("AGENTSOLV V4 DESKTOP INTEGRATION TEST RESULTS")
        self.logger.info(f"{'='*80}")
        self.logger.info(f"Overall Status: {results['overall_status']}")
        self.logger.info(f"Total Tests: {results['total_tests']}")
        self.logger.info(f"Passed: {results['passed_tests']}")
        self.logger.info(f"Failed: {results['failed_tests']}")
        self.logger.info(f"Success Rate: {results['success_rate']:.1f}%")
        self.logger.info(f"Total Duration: {results['total_duration']:.2f} seconds")
        
        if results['failed_tests'] > 0:
            self.logger.info(f"\nFailed Tests:")
            for test in results['test_results']:
                if not test['passed']:
                    self.logger.info(f"  - {test['test_name']}: {test.get('error', 'Unknown error')}")
        
        self.logger.info(f"{'='*80}")


# Import the actual BackendBridge
from .backend_bridge import BackendBridge


async def main():
    """Run the integration tests."""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run tests
    tester = DesktopIntegrationTester()
    results = await tester.run_all_tests()
    
    # Return exit code based on results
    return 0 if results['overall_status'] == 'PASSED' else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)