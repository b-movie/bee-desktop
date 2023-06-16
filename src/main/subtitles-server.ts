import http from "http";
import path from "path";
import fs from "fs";
import { SUBTITLE_CACHE_DIR } from "./constants";
import { generatePortNumber } from "./helpers";
import finalhandler from "finalhandler";
import serveStatic from "serve-static";
import log from "electron-log";

export default class SubtitlesServer {
  public server: any;

  init() {
    if (!this.server) {
      if (!fs.existsSync(SUBTITLE_CACHE_DIR)) {
        fs.mkdirSync(SUBTITLE_CACHE_DIR);
      }
      this.server = http.createServer(function (req, res) {
        log.debug("serve static file", SUBTITLE_CACHE_DIR);
        const serve = serveStatic(SUBTITLE_CACHE_DIR, {
          setHeaders: (res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
          },
        });
        serve(req, res, finalhandler(req, res));
      });
      this.server.listen(generatePortNumber());
    }
  }

  serve(src: string) {
    if (!this.server) {
      this.init();
    }

    const fileName = src.split("/").pop();

    const dest = path.join(SUBTITLE_CACHE_DIR, fileName);
    if (src != dest) {
      fs.copyFileSync(src, dest);
    }

    return `http://localhost:${this.server.address().port}/${fileName}`;
  }
}
