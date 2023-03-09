// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("__BEE__", {
  client: {
    platform: "desktop",
    version: require("../package.json").version,
  },
  torrent: {
    start: (meta: Meta) => ipcRenderer.invoke("start-torrent", meta),
    stop: (infoHash: string) => ipcRenderer.invoke("stop-torrent", infoHash),
    onStarted: (callback: (event: IpcRendererEvent, meta: Meta) => void) =>
      ipcRenderer.on("torrent-started", callback),
    onStateUpdated: (
      callback: (event: IpcRendererEvent, state: TorrentClientInfo) => void
    ) => ipcRenderer.on("torrent-state-updated", callback),
  },
});
