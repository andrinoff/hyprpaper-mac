const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getWallpapers: () => ipcRenderer.invoke("get-wallpapers"),
  setWallpaper: (imageName) => ipcRenderer.invoke("set-wallpaper", imageName),
  getCurrentWallpaper: () => ipcRenderer.invoke("get-current-wallpaper"),
  hideWindow: () => ipcRenderer.send("hide-window"),
  getImageAsBase64: (fullPath) =>
    ipcRenderer.invoke("get-image-as-base64", fullPath),
  getThumbnail: (imageName) => ipcRenderer.invoke("get-thumbnail", imageName),
  // **NEW**: Expose the new methods to the renderer process
  openWallpapersFolder: () => ipcRenderer.invoke("open-wallpapers-folder"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
