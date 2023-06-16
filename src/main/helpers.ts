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
