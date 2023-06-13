export const generatePortNumber = () => {
  var min = 1024,
    max = 65535;

  return Math.floor(Math.random() * (max - min)) + min;
};

// fix windows path
export const toUnixPath = (path: string) =>
  path.replace(/[\\/]+/g, "/").replace(/^([a-zA-Z]+:|\.\/)/, "");
