// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("__BEE__", {
  client: {
    platform: "desktop",
    version: require("../package.json").version,
  },
  store: {
    get: (key: string) => ipcRenderer.invoke("store-get", key),
  },
  torrent: {
    init: () => ipcRenderer.invoke("init-torrent"),
    seed: (meta: Meta) => ipcRenderer.invoke("seed-torrent", meta),
    destroy: (infoHash: string) =>
      ipcRenderer.invoke("destroy-torrent", infoHash),
    destroyAll: () => ipcRenderer.invoke("destroy-all-torrent"),
    onStateUpdated: (
      callback: (event: IpcRendererEvent, state: Torrent) => void
    ) => ipcRenderer.on("torrent-state-updated", callback),
    removeStateUpdatedListener: () =>
      ipcRenderer.removeAllListeners("torrent-state-updated"),
  },
});
