/**
 * Preload script for AgentSOLVR Electron app
 * Provides secure API bridge between main and renderer processes
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getBackendStatus: () => ipcRenderer.invoke('get-backend-status'),
  getWindowState: () => ipcRenderer.invoke('get-window-state'),

  // Backend management
  restartBackend: () => ipcRenderer.invoke('restart-backend'),

  // Update system
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getUpdateInfo: () => ipcRenderer.invoke('get-update-info'),

  // Update event listeners
  onUpdateMessage: (callback) => {
    ipcRenderer.on('update-message', (event, data) => callback(data));
  },
  onUpdateReadyToInstall: (callback) => {
    ipcRenderer.on('update-ready-to-install', (event, data) => callback(data));
  },
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-message');
    ipcRenderer.removeAllListeners('update-ready-to-install');
  },

  // Menu actions
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-project', () => callback('new-project'));
    ipcRenderer.on('menu-open-project', () => callback('open-project'));
    ipcRenderer.on('navigate-to', (event, route) => callback('navigate', route));
  },

  // Utility functions
  openExternal: (url) => {
    // Send to main process to open external URLs safely
    ipcRenderer.send('open-external', url);
  }
});

// Version info for debugging
console.log('AgentSOLVR preload script loaded');
console.log('Node version:', process.versions.node);
console.log('Chrome version:', process.versions.chrome);
console.log('Electron version:', process.versions.electron);