"""
Auto-updater system for the Electron app.

This module handles automatic updates, version checking, and update installation
for the AgentCODR V4 Electron application.
"""

import logging
import threading
import time
import json
import hashlib
import os
import shutil
import subprocess
from typing import Dict, Any, Optional, Callable, List
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
import urllib.request
import urllib.error


class UpdateStatus(Enum):
    """Update status states."""
    IDLE = "idle"
    CHECKING = "checking"
    AVAILABLE = "available"
    DOWNLOADING = "downloading"
    DOWNLOADED = "downloaded"
    INSTALLING = "installing"
    INSTALLED = "installed"
    ERROR = "error"
    NO_UPDATE = "no_update"


class UpdateChannel(Enum):
    """Update channels."""
    STABLE = "stable"
    BETA = "beta"
    ALPHA = "alpha"
    DEV = "dev"


@dataclass
class UpdateInfo:
    """Information about an available update."""
    version: str
    channel: UpdateChannel
    release_notes: str
    download_url: str
    file_size: int
    checksum: str
    signature: Optional[str] = None
    mandatory: bool = False
    min_version: Optional[str] = None


@dataclass
class UpdateProgress:
    """Update download/installation progress."""
    status: UpdateStatus
    progress_percent: float
    bytes_downloaded: int
    total_bytes: int
    speed_bytes_per_sec: float
    eta_seconds: Optional[float] = None
    error_message: Optional[str] = None


class AutoUpdater:
    """Handles automatic updates for the Electron application."""
    
    def __init__(self, app_version: str = "1.0.0", channel: UpdateChannel = UpdateChannel.STABLE):
        self.logger = logging.getLogger(__name__)
        self.app_version = app_version
        self.channel = channel
        self.status = UpdateStatus.IDLE
        self.current_update: Optional[UpdateInfo] = None
        self.progress = UpdateProgress(
            status=UpdateStatus.IDLE,
            progress_percent=0.0,
            bytes_downloaded=0,
            total_bytes=0,
            speed_bytes_per_sec=0.0
        )
        
        # Configuration
        self.config = {
            "check_interval_hours": 24,
            "auto_download": True,
            "auto_install": False,
            "backup_enabled": True,
            "rollback_enabled": True,
            "update_server_url": "https://updates.agentcodr.com",
            "signature_verification": True
        }
        
        # Event handlers
        self.update_available_handlers: List[Callable] = []
        self.update_downloaded_handlers: List[Callable] = []
        self.update_error_handlers: List[Callable] = []
        self.progress_handlers: List[Callable] = []
        
        # Internal state
        self._check_thread: Optional[threading.Thread] = None
        self._download_thread: Optional[threading.Thread] = None
        self._auto_check_enabled = False
        self._temp_dir = Path("temp/updates")
        self._backup_dir = Path("backups")
        
        # Create necessary directories
        self._temp_dir.mkdir(parents=True, exist_ok=True)
        self._backup_dir.mkdir(parents=True, exist_ok=True)
    
    def start_auto_check(self) -> None:
        """Start automatic update checking."""
        if self._auto_check_enabled:
            self.logger.warning("Auto-check already enabled")
            return
        
        self._auto_check_enabled = True
        self._check_thread = threading.Thread(target=self._auto_check_loop, daemon=True)
        self._check_thread.start()
        
        self.logger.info(f"Auto-update check started (interval: {self.config['check_interval_hours']} hours)")
    
    def stop_auto_check(self) -> None:
        """Stop automatic update checking."""
        self._auto_check_enabled = False
        if self._check_thread and self._check_thread.is_alive():
            self.logger.info("Stopping auto-update check")
    
    def check_for_updates(self, force: bool = False) -> Optional[UpdateInfo]:
        """Check for available updates."""
        if self.status == UpdateStatus.CHECKING and not force:
            self.logger.warning("Update check already in progress")
            return None
        
        self._update_status(UpdateStatus.CHECKING)
        
        try:
            self.logger.info(f"Checking for updates (current: {self.app_version}, channel: {self.channel.value})")
            
            # Construct update check URL
            check_url = f"{self.config['update_server_url']}/api/v1/check"
            params = {
                "version": self.app_version,
                "channel": self.channel.value,
                "platform": self._get_platform(),
                "arch": self._get_architecture()
            }
            
            # Make request (simulated for now)
            update_info = self._fetch_update_info(check_url, params)
            
            if update_info:
                self.current_update = update_info
                self._update_status(UpdateStatus.AVAILABLE)
                self._notify_update_available(update_info)
                
                # Auto-download if enabled
                if self.config["auto_download"]:
                    self.download_update()
                
                return update_info
            else:
                self._update_status(UpdateStatus.NO_UPDATE)
                self.logger.info("No updates available")
                return None
                
        except Exception as e:
            self.logger.error(f"Error checking for updates: {e}")
            self._update_status(UpdateStatus.ERROR, str(e))
            self._notify_update_error(f"Update check failed: {e}")
            return None
    
    def download_update(self) -> bool:
        """Download the available update."""
        if not self.current_update:
            self.logger.error("No update available to download")
            return False
        
        if self.status == UpdateStatus.DOWNLOADING:
            self.logger.warning("Download already in progress")
            return False
        
        self._download_thread = threading.Thread(
            target=self._download_update_file,
            args=(self.current_update,),
            daemon=True
        )
        self._download_thread.start()
        return True
    
    def install_update(self, restart_app: bool = True) -> bool:
        """Install the downloaded update."""
        if self.status != UpdateStatus.DOWNLOADED:
            self.logger.error("No update downloaded and ready for installation")
            return False
        
        try:
            self._update_status(UpdateStatus.INSTALLING)
            self.logger.info("Installing update...")
            
            # Create backup if enabled
            if self.config["backup_enabled"]:
                self._create_backup()
            
            # Install update
            success = self._perform_installation()
            
            if success:
                self._update_status(UpdateStatus.INSTALLED)
                self.logger.info("Update installed successfully")
                
                if restart_app:
                    self._schedule_restart()
                
                return True
            else:
                self._update_status(UpdateStatus.ERROR, "Installation failed")
                return False
                
        except Exception as e:
            self.logger.error(f"Error installing update: {e}")
            self._update_status(UpdateStatus.ERROR, str(e))
            self._notify_update_error(f"Installation failed: {e}")
            return False
    
    def rollback_update(self) -> bool:
        """Rollback to the previous version."""
        if not self.config["rollback_enabled"]:
            self.logger.error("Rollback is disabled")
            return False
        
        try:
            backup_path = self._get_latest_backup()
            if not backup_path or not backup_path.exists():
                self.logger.error("No backup available for rollback")
                return False
            
            self.logger.info("Rolling back to previous version...")
            
            # Restore from backup
            self._restore_from_backup(backup_path)
            
            self.logger.info("Rollback completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Rollback failed: {e}")
            return False
    
    def set_config(self, key: str, value: Any) -> None:
        """Update configuration."""
        if key in self.config:
            old_value = self.config[key]
            self.config[key] = value
            self.logger.debug(f"Config updated: {key} = {value} (was: {old_value})")
        else:
            self.logger.warning(f"Unknown config key: {key}")
    
    def get_config(self, key: str) -> Any:
        """Get configuration value."""
        return self.config.get(key)
    
    def register_update_available_handler(self, handler: Callable) -> None:
        """Register update available event handler."""
        self.update_available_handlers.append(handler)
    
    def register_update_downloaded_handler(self, handler: Callable) -> None:
        """Register update downloaded event handler."""
        self.update_downloaded_handlers.append(handler)
    
    def register_update_error_handler(self, handler: Callable) -> None:
        """Register update error event handler."""
        self.update_error_handlers.append(handler)
    
    def register_progress_handler(self, handler: Callable) -> None:
        """Register update progress event handler."""
        self.progress_handlers.append(handler)
    
    def _auto_check_loop(self) -> None:
        """Auto-check loop running in background thread."""
        while self._auto_check_enabled:
            try:
                self.check_for_updates()
                
                # Wait for next check
                check_interval = self.config["check_interval_hours"] * 3600
                start_time = time.time()
                
                while self._auto_check_enabled and (time.time() - start_time) < check_interval:
                    time.sleep(60)  # Check every minute if we should stop
                    
            except Exception as e:
                self.logger.error(f"Error in auto-check loop: {e}")
                time.sleep(300)  # Wait 5 minutes before retrying
    
    def _fetch_update_info(self, url: str, params: Dict[str, str]) -> Optional[UpdateInfo]:
        """Fetch update information from server."""
        try:
            # Simulate server response for now
            # In real implementation, this would make an HTTP request
            
            # Simulate newer version available
            current_parts = self.app_version.split('.')
            next_patch = int(current_parts[2]) + 1
            newer_version = f"{current_parts[0]}.{current_parts[1]}.{next_patch}"
            
            # Simulate update info
            update_info = UpdateInfo(
                version=newer_version,
                channel=self.channel,
                release_notes="Bug fixes and performance improvements",
                download_url=f"{self.config['update_server_url']}/download/{newer_version}",
                file_size=50 * 1024 * 1024,  # 50MB
                checksum="abc123def456",
                mandatory=False
            )
            
            # Only return update if version is actually newer
            if self._is_version_newer(newer_version, self.app_version):
                return update_info
            
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to fetch update info: {e}")
            return None
    
    def _download_update_file(self, update_info: UpdateInfo) -> None:
        """Download update file in background thread."""
        try:
            self._update_status(UpdateStatus.DOWNLOADING)
            
            download_path = self._temp_dir / f"agentcodr-{update_info.version}.zip"
            
            self.logger.info(f"Downloading update from {update_info.download_url}")
            
            # Simulate download with progress updates
            total_size = update_info.file_size
            downloaded = 0
            chunk_size = 1024 * 1024  # 1MB chunks
            
            start_time = time.time()
            
            with open(download_path, 'wb') as f:
                while downloaded < total_size:
                    # Simulate download chunk
                    chunk_data = b'0' * min(chunk_size, total_size - downloaded)
                    f.write(chunk_data)
                    downloaded += len(chunk_data)
                    
                    # Update progress
                    elapsed = time.time() - start_time
                    speed = downloaded / elapsed if elapsed > 0 else 0
                    eta = (total_size - downloaded) / speed if speed > 0 else None
                    
                    self.progress = UpdateProgress(
                        status=UpdateStatus.DOWNLOADING,
                        progress_percent=(downloaded / total_size) * 100,
                        bytes_downloaded=downloaded,
                        total_bytes=total_size,
                        speed_bytes_per_sec=speed,
                        eta_seconds=eta
                    )
                    
                    self._notify_progress_update()
                    
                    # Simulate network delay
                    time.sleep(0.01)
            
            # Verify checksum
            if self._verify_checksum(download_path, update_info.checksum):
                self._update_status(UpdateStatus.DOWNLOADED)
                self._notify_update_downloaded(update_info)
                self.logger.info("Update downloaded successfully")
                
                # Auto-install if enabled
                if self.config["auto_install"]:
                    self.install_update()
            else:
                self.logger.error("Checksum verification failed")
                self._update_status(UpdateStatus.ERROR, "Checksum verification failed")
                download_path.unlink(missing_ok=True)
                
        except Exception as e:
            self.logger.error(f"Download failed: {e}")
            self._update_status(UpdateStatus.ERROR, str(e))
            self._notify_update_error(f"Download failed: {e}")
    
    def _verify_checksum(self, file_path: Path, expected_checksum: str) -> bool:
        """Verify downloaded file checksum."""
        try:
            hasher = hashlib.sha256()
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hasher.update(chunk)
            
            actual_checksum = hasher.hexdigest()
            return actual_checksum == expected_checksum
            
        except Exception as e:
            self.logger.error(f"Checksum verification error: {e}")
            return False
    
    def _perform_installation(self) -> bool:
        """Perform the actual installation."""
        try:
            # In a real implementation, this would:
            # 1. Extract the update package
            # 2. Stop the current application
            # 3. Replace application files
            # 4. Update configuration
            # 5. Restart the application
            
            self.logger.info("Simulating update installation...")
            time.sleep(2)  # Simulate installation time
            
            # Update app version
            self.app_version = self.current_update.version
            
            return True
            
        except Exception as e:
            self.logger.error(f"Installation error: {e}")
            return False
    
    def _create_backup(self) -> Path:
        """Create backup of current installation."""
        backup_name = f"backup-{self.app_version}-{int(time.time())}"
        backup_path = self._backup_dir / backup_name
        backup_path.mkdir(parents=True, exist_ok=True)
        
        self.logger.info(f"Creating backup at {backup_path}")
        
        # In real implementation, this would backup application files
        # For now, just create a marker file
        marker_file = backup_path / "backup_info.json"
        backup_info = {
            "version": self.app_version,
            "timestamp": time.time(),
            "channel": self.channel.value
        }
        
        with open(marker_file, 'w') as f:
            json.dump(backup_info, f, indent=2)
        
        return backup_path
    
    def _get_latest_backup(self) -> Optional[Path]:
        """Get the latest backup directory."""
        try:
            backups = [d for d in self._backup_dir.iterdir() if d.is_dir()]
            if not backups:
                return None
            
            # Sort by creation time
            latest = max(backups, key=lambda d: d.stat().st_ctime)
            return latest
            
        except Exception as e:
            self.logger.error(f"Error finding latest backup: {e}")
            return None
    
    def _restore_from_backup(self, backup_path: Path) -> None:
        """Restore application from backup."""
        self.logger.info(f"Restoring from backup: {backup_path}")
        
        # In real implementation, this would restore application files
        # For now, just read the backup info
        marker_file = backup_path / "backup_info.json"
        if marker_file.exists():
            with open(marker_file, 'r') as f:
                backup_info = json.load(f)
                self.app_version = backup_info["version"]
    
    def _schedule_restart(self) -> None:
        """Schedule application restart."""
        self.logger.info("Scheduling application restart...")
        # In real implementation, this would trigger app restart
    
    def _update_status(self, status: UpdateStatus, error_message: Optional[str] = None) -> None:
        """Update the current status."""
        self.status = status
        self.progress.status = status
        if error_message:
            self.progress.error_message = error_message
        
        self.logger.debug(f"Update status: {status.value}")
    
    def _notify_update_available(self, update_info: UpdateInfo) -> None:
        """Notify handlers that an update is available."""
        for handler in self.update_available_handlers:
            try:
                handler(update_info)
            except Exception as e:
                self.logger.error(f"Error in update available handler: {e}")
    
    def _notify_update_downloaded(self, update_info: UpdateInfo) -> None:
        """Notify handlers that an update has been downloaded."""
        for handler in self.update_downloaded_handlers:
            try:
                handler(update_info)
            except Exception as e:
                self.logger.error(f"Error in update downloaded handler: {e}")
    
    def _notify_update_error(self, error_message: str) -> None:
        """Notify handlers of an update error."""
        for handler in self.update_error_handlers:
            try:
                handler(error_message)
            except Exception as e:
                self.logger.error(f"Error in update error handler: {e}")
    
    def _notify_progress_update(self) -> None:
        """Notify handlers of progress update."""
        for handler in self.progress_handlers:
            try:
                handler(self.progress)
            except Exception as e:
                self.logger.error(f"Error in progress handler: {e}")
    
    def _is_version_newer(self, version1: str, version2: str) -> bool:
        """Check if version1 is newer than version2."""
        try:
            v1_parts = [int(x) for x in version1.split('.')]
            v2_parts = [int(x) for x in version2.split('.')]
            
            # Pad shorter version with zeros
            max_len = max(len(v1_parts), len(v2_parts))
            v1_parts.extend([0] * (max_len - len(v1_parts)))
            v2_parts.extend([0] * (max_len - len(v2_parts)))
            
            return v1_parts > v2_parts
            
        except Exception:
            return False
    
    def _get_platform(self) -> str:
        """Get platform name."""
        import platform
        system = platform.system().lower()
        if system == "darwin":
            return "macos"
        return system
    
    def _get_architecture(self) -> str:
        """Get architecture name."""
        import platform
        arch = platform.machine().lower()
        if arch in ["x86_64", "amd64"]:
            return "x64"
        elif arch in ["arm64", "aarch64"]:
            return "arm64"
        return arch


# Global updater instance
auto_updater = AutoUpdater()


def get_auto_updater() -> AutoUpdater:
    """Get the global auto-updater instance."""
    return auto_updater


def check_for_updates() -> Optional[UpdateInfo]:
    """Check for available updates."""
    return auto_updater.check_for_updates()


def start_auto_updates() -> None:
    """Start automatic update checking."""
    auto_updater.start_auto_check()


def stop_auto_updates() -> None:
    """Stop automatic update checking."""
    auto_updater.stop_auto_check()