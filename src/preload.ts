// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("__BEE__", {
  cast: {
    players: () => ipcRenderer.invoke("cast-players"),
    play: (url: string, host: string, options: Object = {}) =>
      ipcRenderer.invoke("cast-play", url, host, options),
  },
  client: {
    platform: "desktop",
    version: require("../package.json").version,
  },
  mpv: {
    play: (url: string) => ipcRenderer.invoke("mpv-play", url),
    quit: () => ipcRenderer.invoke("mpv-quit"),
    onError: (callback: (event: IpcRendererEvent, error: Error) => void) =>
      ipcRenderer.on("mpv-error", callback),
    onStateUpdated: (callback: (event: IpcRendererEvent, state: any) => void) =>
      ipcRenderer.on("mpv-state-updated", callback),
    removeErrorListener: () => ipcRenderer.removeAllListeners("mpv-error"),
    removeStateUpdatedListener: () =>
      ipcRenderer.removeAllListeners("mpv-state-updated"),
  },
  opensubtitles: {
    search: (query: string) =>
      ipcRenderer.invoke("opensubtitles-search", query),
    download: (id: string) => ipcRenderer.invoke("opensubtitles-download", id),
  },
  shell: {
    openExternal: (url: string) =>
      ipcRenderer.invoke("shell-open-external", url),
  },
  store: {
    get: (key: string) => ipcRenderer.invoke("store-get", key),
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
