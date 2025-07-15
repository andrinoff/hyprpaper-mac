const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { exec } = require("child_process");
const os = require("os");

let mainWindow;

// Promisified exec for running osascript commands
const run = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(new Error(stderr));
      resolve(stdout.trim());
    });
  });

// A dedicated function to set the wallpaper using AppleScript
async function setWallpaper(imagePath) {
  const script = `osascript -e 'tell application "System Events" to tell every desktop to set picture to (POSIX file "${imagePath}")'`;
  return run(script);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    transparent: true,
    show: false,
    vibrancy: "ultra-dark",
    alwaysOnTop: true,
    level: "floating",
    visibleOnAllWorkspaces: true,
    resizable: false,
    focusable: true,
  });

  if (process.platform === "darwin") {
    app.dock.hide();
  }

  mainWindow.loadFile(path.join(__dirname, "dist/index.html"));

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

// Handler to get the list of wallpapers from the ~/wallpapers directory
ipcMain.handle("get-wallpapers", async () => {
  const wallpaperDir = path.join(os.homedir(), "wallpapers");
  try {
    const files = await fs.readdir(wallpaperDir);
    // Filter for common image file types
    return files.filter((file) => /\.(jpg|jpeg|png|heic|webp)$/i.test(file));
  } catch (error) {
    console.error(`Error reading wallpaper directory: ${wallpaperDir}`, error);
    throw new Error(
      `Could not read wallpapers from: ~/wallpapers. Please make sure this folder exists and isn't empty.`
    );
  }
});

// Handler to set the desktop wallpaper
ipcMain.handle("set-wallpaper", async (event, imageName) => {
  const imagePath = path.join(os.homedir(), "wallpapers", imageName);
  try {
    await setWallpaper(imagePath);
    return imagePath; // Return the full path to the renderer process
  } catch (error) {
    console.error(`Failed to set wallpaper: ${imageName}`, error);
    throw error;
  }
});

// Handler to get the current wallpaper's full path
ipcMain.handle("get-current-wallpaper", async () => {
  try {
    return await run(
      `osascript -e 'tell application "System Events" to tell every desktop to get picture'`
    );
  } catch (error) {
    console.error("Failed to get current wallpaper", error);
    throw error;
  }
});

// **FIXED**: Handler to get an image as Base64. It now correctly handles
// both full paths and simple filenames.
ipcMain.handle("get-image-as-base64", async (event, fileIdentifier) => {
  let filePath;

  // If the identifier is already an absolute path, use it directly.
  // This happens when loading the initial background.
  if (path.isAbsolute(fileIdentifier)) {
    filePath = fileIdentifier;
  } else {
    // Otherwise, construct the full path from the home directory and wallpapers folder.
    // This happens when loading the grid thumbnails.
    filePath = path.join(os.homedir(), "wallpapers", fileIdentifier);
  }

  try {
    const data = await fs.readFile(filePath);
    return data.toString("base64");
  } catch (error) {
    // Log the error with the full path for easier debugging
    console.error(`Failed to read file: ${filePath}`, error);
    throw error; // Propagate the error back to the renderer
  }
});

// Handler to hide the main window
ipcMain.on("hide-window", () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});
