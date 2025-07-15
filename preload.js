const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object.
contextBridge.exposeInMainWorld("api", {
  // Gets the list of wallpaper filenames
  getWallpapers: () => ipcRenderer.invoke("get-wallpapers"),
  // Sets the wallpaper by filename
  setWallpaper: (imageName) => ipcRenderer.invoke("set-wallpaper", imageName),
  // Gets the full path of the current wallpaper
  getCurrentWallpaper: () => ipcRenderer.invoke("get-current-wallpaper"),
  // Hides the application window
  hideWindow: () => ipcRenderer.send("hide-window"),
  // Gets image data as Base64. The main process handles path resolution.
  getImageAsBase64: (fileIdentifier) =>
    ipcRenderer.invoke("get-image-as-base64", fileIdentifier),
});
