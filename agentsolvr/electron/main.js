/**
 * AgentCODR V4 Electron Main Process Entry Point
 * 
 * This is the main process file for the AgentCODR V4 Electron application.
 * It handles application lifecycle, window management, and communication
 * between the frontend and backend services.
 */

const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Keep references to window objects
let mainWindow = null;
let tray = null;
let backendProcess = null;

// Configure auto-updater logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Application configuration
const APP_CONFIG = {
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600
  },
  backend: {
    port: 8080,
    host: 'localhost'
  }
};

// Auto-update manager
class UpdateManager {
  constructor() {
    this.mainWindow = null;
    this.setupAutoUpdater();
  }

  setupAutoUpdater() {
    // Configure update server
    if (!isDev) {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'agentsolvr',
        repo: 'agentsolvr',
        private: false
      });
    }

    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      this.sendUpdateMessage('checking-for-update', 'Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available.');
      this.sendUpdateMessage('update-available', 'Update available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available.');
      this.sendUpdateMessage('update-not-available', 'Update not available', info);
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater: ' + err);
      this.sendUpdateMessage('update-error', 'Error occurred', { error: err.message });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
      log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
      log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;
      log.info(log_message);
      this.sendUpdateMessage('download-progress', 'Downloading update', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded');
      this.sendUpdateMessage('update-downloaded', 'Update downloaded', info);
      
      // Show dialog to user
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-ready-to-install', info);
      }
    });
  }

  checkForUpdatesAndNotify() {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall();
  }

  sendUpdateMessage(type, message, data = null) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update-message', {
        type,
        message,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }
}

const updateManager = new UpdateManager();

/**
 * Create the main application window
 */
function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: APP_CONFIG.window.width,
    height: APP_CONFIG.window.height,
    minWidth: APP_CONFIG.window.minWidth,
    minHeight: APP_CONFIG.window.minHeight,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Don't show until ready
    icon: getAppIcon(),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Load the frontend application
  if (isDev) {
    // Development: load from development server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files - try both dist and build directories
    const frontendPath = path.join(__dirname, '../frontend/dist/index.html');
    const frontendPathAlt = path.join(__dirname, '../frontend/build/index.html');
    
    try {
      if (require('fs').existsSync(frontendPath)) {
        mainWindow.loadFile(frontendPath);
      } else if (require('fs').existsSync(frontendPathAlt)) {
        mainWindow.loadFile(frontendPathAlt);
      } else {
        console.error('Frontend build not found');
        mainWindow.loadURL('data:text/html,<h1>AgentSOLVR</h1><p>Frontend build not found</p>');
      }
    } catch (error) {
      console.error('Error loading frontend:', error);
      mainWindow.loadURL('data:text/html,<h1>AgentSOLVR</h1><p>Error loading frontend</p>');
    }
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on the window
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window minimize to tray (on supported platforms)
  mainWindow.on('minimize', (event) => {
    if (process.platform !== 'darwin' && tray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Window state management
  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
}

/**
 * Get application icon path
 */
function getAppIcon() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  return nativeImage.createFromPath(iconPath);
}

/**
 * Create system tray
 */
function createTray() {
  if (process.platform === 'darwin') return; // macOS doesn't need tray

  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show AgentSOLVR',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      }
    },
    {
      label: 'Hide AgentSOLVR',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Backend Status',
      enabled: false
    },
    {
      label: backendProcess ? 'Running' : 'Stopped',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Quit AgentSOLVR',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('AgentSOLVR - Voice-controlled AI development platform');

  // Handle tray click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

/**
 * Save window state to preferences
 */
function saveWindowState() {
  if (!mainWindow) return;

  const bounds = mainWindow.getBounds();
  // In a real app, you'd save this to a config file or app settings
  console.log('Window state:', bounds);
}

/**
 * Start the backend Python process
 */
async function startBackend() {
  const { spawn } = require('child_process');
  
  try {
    // Start the Python backend
    const pythonPath = isDev ? 'python' : path.join(process.resourcesPath, 'python', 'python');
    const backendScript = path.join(__dirname, '../backend/src/main.py');
    
    backendProcess = spawn(pythonPath, [backendScript], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        AGENTCODR_MODE: 'electron',
        AGENTCODR_PORT: APP_CONFIG.backend.port.toString()
      }
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend stdout: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
      backendProcess = null;
    });

    console.log('Backend process started');
  } catch (error) {
    console.error('Failed to start backend:', error);
  }
}

/**
 * Stop the backend process
 */
function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
    console.log('Backend process stopped');
  }
}

/**
 * Setup application menu
 */
function setupApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Handle new project
            if (mainWindow) {
              mainWindow.webContents.send('menu-new-project');
            }
          }
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            // Handle open project
            if (mainWindow) {
              mainWindow.webContents.send('menu-open-project');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    },
    {
      label: 'Agents',
      submenu: [
        {
          label: 'View Agent Status',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', '/agents');
            }
          }
        },
        {
          label: 'View Progress',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', '/progress');
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Setup IPC handlers
 */
function setupIPC() {
  // Handle backend status requests
  ipcMain.handle('get-backend-status', async () => {
    return {
      running: false, // Frontend-only mode
      port: APP_CONFIG.backend.port,
      host: APP_CONFIG.backend.host,
      mode: 'frontend-only'
    };
  });

  // Handle backend restart
  ipcMain.handle('restart-backend', async () => {
    stopBackend();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await startBackend();
    return true;
  });

  // Handle app version request
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Handle update checks
  ipcMain.handle('check-for-updates', () => {
    updateManager.checkForUpdatesAndNotify();
    return true;
  });

  // Handle update installation
  ipcMain.handle('install-update', () => {
    updateManager.quitAndInstall();
    return true;
  });

  // Handle update info request
  ipcMain.handle('get-update-info', () => {
    return {
      isUpdateAvailable: false, // Will be updated by auto-updater events
      updateInfo: null,
      downloadProgress: 0
    };
  });

  // Handle window state
  ipcMain.handle('get-window-state', () => {
    if (!mainWindow) return null;
    return {
      bounds: mainWindow.getBounds(),
      isMaximized: mainWindow.isMaximized(),
      isMinimized: mainWindow.isMinimized(),
      isFullScreen: mainWindow.isFullScreen()
    };
  });
}

// App event handlers
app.whenReady().then(async () => {
  console.log('AgentSOLVR Electron app is ready');
  
  // Setup application components
  setupApplicationMenu();
  setupIPC();
  createTray();
  
  // Skip backend service for now - frontend only mode
  console.log('Running in frontend-only mode');
  
  // Create main window
  createMainWindow();
  
  // Connect update manager to main window
  updateManager.setMainWindow(mainWindow);
  
  // Check for updates after app startup (5 second delay)
  setTimeout(() => {
    updateManager.checkForUpdatesAndNotify();
  }, 5000);
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  console.log('AgentCODR V4 is shutting down');
  stopBackend();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault();
    console.log('Blocked new window creation:', url);
  });
});

console.log('AgentCODR V4 Electron main process initialized');