import fs from "fs";
import https from "https";

export const generatePortNumber = () => {
  const min = 1024;
  const max = 65535;

  return Math.floor(Math.random() * (max - min)) + min;
};

// fix windows path
export const toUnixPath = (path: string) =>
  path.replace(/[\\/]+/g, "/").replace(/^([a-zA-Z]+:|\.\/)/, "");

export const download = (url: string, dest: string) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest, { flags: "wx" });

    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
      } else {
        file.close();
        fs.unlink(dest, () => {}); // Delete temp file
        reject(
          `Server responded with ${response.statusCode}: ${response.statusMessage}`
        );
      }
    });

    request.on("error", (err) => {
      file.close();
      fs.unlink(dest, () => {}); // Delete temp file
      reject(err.message);
    });

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
  });
};
