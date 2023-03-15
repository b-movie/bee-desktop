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
  mpv: {
    play: (url: string) => ipcRenderer.invoke("mpv-play", url),
  },
  torrent: {
    init: () => ipcRenderer.invoke("torrent-init"),
    seed: (meta: Meta) => ipcRenderer.invoke("torrent-seed", meta),
    destroy: (infoHash: string) =>
      ipcRenderer.invoke("torrent-destroy", infoHash),
    destroyAll: () => ipcRenderer.invoke("torrent-destroy-all"),
    onStateUpdated: (
      callback: (event: IpcRendererEvent, state: Torrent) => void
    ) => ipcRenderer.on("torrent-state-updated", callback),
    removeStateUpdatedListener: () =>
      ipcRenderer.removeAllListeners("torrent-state-updated"),
  },
});
