const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  screen,
} = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { exec } = require("child_process");
const os = require("os");

// Make mainWindow a global variable so we can access it everywhere.
let mainWindow = null;

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
  // **FIX:** Get the display that currently has focus.
  const currentDisplay = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );
  const { width, height } = currentDisplay.workAreaSize;

  const windowWidth = 900;
  const windowHeight = 700;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    // Center the window on the currently active screen
    x: Math.round(currentDisplay.bounds.x + (width - windowWidth) / 2),
    y: Math.round(currentDisplay.bounds.y + (height - windowHeight) / 2),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    transparent: true,
    show: false, // Start hidden and show when ready
    vibrancy: "ultra-dark", // This provides the blurred transparency
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

  // Show the window gracefully when the content is ready.
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // When the window is closed, set its variable to null.
  // This is crucial for our open/close logic.
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Set up the global shortcut to toggle the window's visibility.
  globalShortcut.register("CommandOrControl+Shift+P", () => {
    // If the window exists, close it. Otherwise, create it.
    if (mainWindow) {
      mainWindow.close();
    } else {
      createWindow();
    }
  });
});

// **FIX:** Prevent the app from quitting when all windows are closed.
// This allows the background process to persist.
app.on("window-all-closed", () => {
  // On macOS, it's common for applications to stay active until the user
  // explicitly quits. This line prevents the default quit behavior.
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// --- IPC Handlers ---

ipcMain.handle("get-wallpapers", async () => {
  const wallpaperDir = path.join(os.homedir(), "wallpapers");
  try {
    const files = await fs.readdir(wallpaperDir);
    return files.filter((file) => /\.(jpg|jpeg|png|heic|webp)$/i.test(file));
  } catch (error) {
    console.error(`Error reading wallpaper directory: ${wallpaperDir}`, error);
    throw new Error(
      `Could not read wallpapers from: ~/wallpapers. Please make sure this folder exists and isn't empty.`
    );
  }
});

ipcMain.handle("set-wallpaper", async (event, imageName) => {
  const imagePath = path.join(os.homedir(), "wallpapers", imageName);
  try {
    await setWallpaper(imagePath);
    return imagePath;
  } catch (error) {
    console.error(`Failed to set wallpaper: ${imageName}`, error);
    throw error;
  }
});

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

ipcMain.handle("get-image-as-base64", async (event, fileIdentifier) => {
  let filePath;
  if (path.isAbsolute(fileIdentifier)) {
    filePath = fileIdentifier;
  } else {
    filePath = path.join(os.homedir(), "wallpapers", fileIdentifier);
  }

  try {
    const data = await fs.readFile(filePath);
    return data.toString("base64");
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    throw error;
  }
});

// This handler now closes the window instead of just hiding it.
ipcMain.on("hide-window", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
