// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("__BEE__", {
  client: {
    platform: "desktop",
    version: require("../package.json").version,
  },
  torrent: {
    start: (infoHash: string, fileIdx: number) =>
      ipcRenderer.invoke("start-torrent", infoHash, fileIdx),
  },
});
