import fs from "fs";
import https from "https";
import path from "path";

export const generatePortNumber = () => {
  const min = 1024;
  const max = 65535;

  return Math.floor(Math.random() * (max - min)) + min;
};

// fix windows path
export const toUnixPath = (path: string) =>
  path.replace(/[\\/]+/g, "/").replace(/^([a-zA-Z]+:|\.\/)/, "");

export const download = (
  url: string,
  dir: string,
  filename?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const regexp = /filename=\"(.*)\"/gi;

    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        filename =
          filename ||
          (regexp.exec(response.headers["content-disposition"]) || [])[1];
        filename = filename || new URL(url).pathname.split("/").pop();
        const dest = path.join(dir, filename);
        const file = fs.createWriteStream(dest, {
          flags: "wx",
        });
        response.pipe(file);

        file.on("finish", () => {
          resolve(dest);
        });

        file.on("error", (err: any) => {
          file.close();

          if (err.code === "EEXIST") {
            resolve(dest);
          } else {
            fs.unlink(dest, () => {}); // Delete temp file
            reject(err.message);
          }
        });
      } else {
        reject(
          `Server responded with ${response.statusCode}: ${response.statusMessage}`
        );
      }
    });

    request.on("error", (err) => {
      reject(err.message);
    });
  });
};

export const httpGet = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const http = require("http");
    const https = require("https");

    let client = http;

    if (url.toString().indexOf("https") === 0) {
      client = https;
    }

    client
      .get(url, (resp: any) => {
        let chunks: any[] = [];

        // A chunk of data has been recieved.
        resp.on("data", (chunk: any) => {
          chunks.push(chunk);
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          resolve(Buffer.concat(chunks).toString("utf-8"));
        });
      })
      .on("error", (err: Error) => {
        reject(err);
      });
  });
};

// https://github.com/faizath/srt2vtt.js/blob/main/srt2vtt.js
export const srt2webvtt = (data: string) => {
  // remove dos newlines
  var srt = data.replace(/\r+/g, "");
  // trim white space start and end
  srt = srt.replace(/^\s+|\s+$/g, "");
  // get cues
  var cuelist = srt.split("\n\n");
  var result = "";
  if (cuelist.length > 0) {
    result += "WEBVTT\n\n";
    for (var i = 0; i < cuelist.length; i = i + 1) {
      result += convertSrtCue(cuelist[i]);
    }
  }
  return result;
};

// https://github.com/faizath/srt2vtt.js/blob/main/srt2vtt.js
const convertSrtCue = (caption: string) => {
  // remove all html tags for security reasons
  //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
  var cue = "";
  var s = caption.split(/\n/);
  // concatenate muilt-line string separated in array into one
  while (s.length > 3) {
    for (var i = 3; i < s.length; i++) {
      s[2] += "\n" + s[i];
    }
    s.splice(3, s.length - 3);
  }
  var line = 0;
  // detect identifier
  if (!s[0]?.match(/\d+:\d+:\d+/) && s[1]?.match(/\d+:\d+:\d+/)) {
    cue += s[0]?.match(/\w+/) + "\n";
    line += 1;
  }
  // get time strings
  if (s[line]?.match(/\d+:\d+:\d+/)) {
    // convert time string
    var m = s[1]?.match(
      /(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/
    );
    if (m) {
      cue +=
        m[1] +
        ":" +
        m[2] +
        ":" +
        m[3] +
        "." +
        m[4] +
        " --> " +
        m[5] +
        ":" +
        m[6] +
        ":" +
        m[7] +
        "." +
        m[8] +
        "\n";
      line += 1;
    } else {
      // Unrecognized timestring
      return "";
    }
  } else {
    // file format error or comment lines
    return "";
  }
  // get cue text
  if (s[line]) {
    cue += s[line] + "\n\n";
  }
  return cue;
};
