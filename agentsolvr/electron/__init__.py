"""
AgentTradr Electron App Package.

This package contains the Electron-based local deployment architecture
for the AgentTradr trading platform.
"""

__version__ = "1.0.0"
__author__ = "AgentTradr Team"

from .main import ElectronApp, ElectronAppConfig

__all__ = [
    "ElectronApp",
    "ElectronAppConfig"
]