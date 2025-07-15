const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getWallpapers: () => ipcRenderer.invoke("get-wallpapers"),
  setWallpaper: (imageName) => ipcRenderer.invoke("set-wallpaper", imageName),
  getCurrentWallpaper: () => ipcRenderer.invoke("get-current-wallpaper"),
  hideWindow: () => ipcRenderer.send("hide-window"),
  // Gets full-res image data (used for initial background)
  getImageAsBase64: (fullPath) =>
    ipcRenderer.invoke("get-image-as-base64", fullPath),
  // **NEW**: Gets thumbnail data for the grid
  getThumbnail: (imageName) => ipcRenderer.invoke("get-thumbnail", imageName),
});
