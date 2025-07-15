const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  run: (command) => ipcRenderer.invoke("run-command", command),
  getHomeDir: () => ipcRenderer.invoke("get-home-dir"),
  hideWindow: () => ipcRenderer.send("hide-window"),
  getImageAsBase64: (filePath) =>
    ipcRenderer.invoke("get-image-as-base64", filePath),
});
