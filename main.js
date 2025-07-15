const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs/promises"); // Use the promise-based version of fs
const { exec } = require("child_process");
const os = require("os");

let mainWindow;

// Promisified exec with a larger buffer for safety, though not strictly needed for osascript
const run = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      // 10MB buffer
      if (error) return reject(error);
      if (stderr) return reject(new Error(stderr));
      resolve(stdout.trim());
    });
  });

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    transparent: true,
    show: false,
    vibrancy: "ultra-dark",

    // --- A more robust combination for floating ---
    alwaysOnTop: true,
    level: "floating", // 'floating' is the correct level for this kind of panel
    visibleOnAllWorkspaces: true,
    resizable: false, // Prevents the window manager from trying to resize it
    focusable: true, // Ensures the window can accept keyboard input
  });

  // We still hide the dock icon as it helps define the app as a utility
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  mainWindow.loadFile(path.join(__dirname, "dist/index.html"));

  // Hide the window when it loses focus
  mainWindow.on("blur", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("CommandOrControl+Shift+P", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// --- IPC Handlers ---

// NEW: Specific handler for reading image files efficiently
ipcMain.handle("get-image-as-base64", async (event, filePath) => {
  try {
    const data = await fs.readFile(filePath);
    return data.toString("base64");
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    throw error;
  }
});

// This is still needed for osascript and ls commands
ipcMain.handle("run-command", async (event, command) => {
  try {
    return await run(command);
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
    throw error;
  }
});

ipcMain.handle("get-home-dir", () => os.homedir());

ipcMain.on("hide-window", () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});
