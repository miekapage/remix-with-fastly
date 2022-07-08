/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverBuildTarget: "cloudflare-workers",
  ignoredRouteFiles: [".*"],
  serverBuildPath: "src/build/index.js"
};
