import http from "http";
import path from "path";
import fs from "fs";
import { SUBTITLE_CACHE_DIR } from "./constants";
import { generatePortNumber } from "./helpers";
import finalhandler from "finalhandler";
import serveStatic from "serve-static";
import log from "electron-log";
import { srt2webvtt, httpGet } from "./helpers";
import { createHash } from "crypto";

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

  async serve(src: string): Promise<string | null> {
    if (!src) return null;

    let data = "";
    try {
      if (src.match(/http(s)?:\/\//)) {
        data = await httpGet(src);
      } else {
        fs.accessSync(src);
        data = fs.readFileSync(src, "utf8");
      }
    } catch (err) {
      log.error("subtitles-server read file:", err);
      return null;
    }

    const format =
      data.split("\n")[0].toLowerCase() === "webvtt" ? "vtt" : "srt";
    if (format == "srt") {
      data = srt2webvtt(data);
    }
    let fileName = createHash("md5").update(data).digest("hex") + ".vtt";
    fs.writeFileSync(path.join(SUBTITLE_CACHE_DIR, fileName), data);

    if (!this.server) {
      this.init();
    }

    const url = `http://localhost:${this.server.address().port}/${fileName}`;
    log.debug("serve-subtitles:", src, url);

    return url;
  }
}
