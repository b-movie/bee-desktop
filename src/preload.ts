// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("__BEE__", {
  client: {
    platform: "desktop",
    version: require("../package.json").version,
    ip: () => ipcRenderer.invoke("client-ip"),
  },
  externalPlayers: {
    discover: () => ipcRenderer.invoke("external-players-discover"),
    list: () => ipcRenderer.invoke("external-players-list"),
    play: (playerId: string, params: object) =>
      ipcRenderer.invoke("external-players-play", playerId, params),
    stop: (playerId: string) =>
      ipcRenderer.invoke("external-players-stop", playerId),
    pause: (playerId: string) =>
      ipcRenderer.invoke("external-players-pause", playerId),
    resume: (playerId: string) =>
      ipcRenderer.invoke("external-players-resume", playerId),
    status: (playerId: string) =>
      ipcRenderer.invoke("external-players-status", playerId),
  },
  fs: {
    readFile: (path: string) => ipcRenderer.invoke("fs-read-file", path),
    download: (url: string, path: string) =>
      ipcRenderer.invoke("fs-download", url, path),
  },
  opensubtitles: {
    login: (username: string, password: string) =>
      ipcRenderer.invoke("opensubtitles-search", username, password),
    search: (options: Object) =>
      ipcRenderer.invoke("opensubtitles-search", options),
    download: (id: string) => ipcRenderer.invoke("opensubtitles-download", id),
  },
  settings: {
    refresh: () => ipcRenderer.invoke("settings-refresh"),
    get: (key: string) => ipcRenderer.invoke("settings-get", key),
    set: (key: string, value: any) =>
      ipcRenderer.invoke("settings-set", key, value),
  },
  shell: {
    openExternal: (url: string) =>
      ipcRenderer.invoke("shell-open-external", url),
    openPath: (path: string) => ipcRenderer.invoke("shell-open-path", path),
  },
  store: {
    get: (key: string) => ipcRenderer.invoke("store-get", key),
  },
  torrent: {
    init: () => ipcRenderer.invoke("torrent-init"),
    seed: (meta: Meta) => ipcRenderer.invoke("torrent-seed", meta),
    pause: (infoHash: String) => ipcRenderer.invoke("torrent-pause", infoHash),
    resume: (infoHash: String) =>
      ipcRenderer.invoke("torrent-resume", infoHash),
    summary: () => ipcRenderer.invoke("torrent-summary"),
    torrentFile: (infoHash: string) =>
      ipcRenderer.invoke("torrent-torrent-file", infoHash),
    currentState: (infoHash: string) =>
      ipcRenderer.invoke("torrent-current-state", infoHash),
    selectFile: (infoHash: string, fileIdx: number) =>
      ipcRenderer.invoke("torrent-select-file", infoHash, fileIdx),
    deselectAll: (infoHash: string) =>
      ipcRenderer.invoke("torrent-deselect-all", infoHash),
    destroy: (infoHash: string) =>
      ipcRenderer.invoke("torrent-destroy", infoHash),
    destroyAll: () => ipcRenderer.invoke("torrent-destroy-all"),
    onError: (callback: (event: IpcRendererEvent, error: Error) => void) =>
      ipcRenderer.on("torrent-on-error", callback),
    onState: (callback: (event: IpcRendererEvent, state: Torrent) => void) =>
      ipcRenderer.on("torrent-on-state", callback),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners("torrent-on-error");
      ipcRenderer.removeAllListeners("torrent-on-state");
    },
  },
  webpage: {
    parse: (url: string) => ipcRenderer.invoke("webpage-parse", url),
  },
});
