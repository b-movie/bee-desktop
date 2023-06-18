import http from "http";
import path from "path";
import fs from "fs";
import { SUBTITLE_CACHE_DIR } from "./constants";
import { generatePortNumber } from "./helpers";
import finalhandler from "finalhandler";
import serveStatic from "serve-static";
import log from "electron-log";
import { srt2webvtt } from "./helpers";

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

    try {
      fs.accessSync(src);

      let fileName = path.basename(src);
      const format = path.extname(src).replace(".", "");

      if (format == "srt") {
        const data = fs.readFileSync(src, "utf8");
        const vtt = srt2webvtt(data);
        fileName = fileName.replace(".srt", ".vtt");
        fs.writeFileSync(path.join(SUBTITLE_CACHE_DIR, fileName), vtt);
      } else {
        const dest = path.join(SUBTITLE_CACHE_DIR, fileName);
        if (src != dest) {
          fs.copyFileSync(src, dest);
        }
      }

      return `http://localhost:${this.server.address().port}/${fileName}`;
    } catch (err) {
      log.error(err);
      return null;
    }
  }
}
