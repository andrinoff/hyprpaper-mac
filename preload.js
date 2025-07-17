const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getWallpapers: () => ipcRenderer.invoke("get-wallpapers"),
  setWallpaper: (imageName) => ipcRenderer.invoke("set-wallpaper", imageName),
  getCurrentWallpaper: () => ipcRenderer.invoke("get-current-wallpaper"),
  hideWindow: () => ipcRenderer.send("hide-window"),
  getImageAsBase64: (fullPath) =>
    ipcRenderer.invoke("get-image-as-base64", fullPath),
  getThumbnail: (imageName) => ipcRenderer.invoke("get-thumbnail", imageName),
  openWallpapersFolder: () => ipcRenderer.invoke("open-wallpapers-folder"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  openExternalLink: (url) => ipcRenderer.invoke("open-external-link", url),
  toggleSettings: () => ipcRenderer.send("toggle-settings"),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  getThemes: () => ipcRenderer.invoke("get-themes"),
  onThemeUpdated: (callback) => {
    const listener = (event, ...args) => callback(...args);
    ipcRenderer.on("theme-updated", listener);
    return () => {
      ipcRenderer.removeListener("theme-updated", listener);
    };
  },
});
