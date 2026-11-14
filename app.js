/* eslint-disable @typescript-eslint/no-require-imports -- Passenger loads this entry point as CommonJS. */
// cPanel / Passenger entry point. Build with `npm run build` before starting.
process.env.NODE_ENV = "production";
const { createServer } = require("node:http");
const next = require("next");

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    Promise.resolve(handle(req, res)).catch(() => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });
  server.on("error", () => {
    console.error("Munchadoo server failed to start.");
    process.exit(1);
  });
  server.listen(process.env.PORT || 3000);
}).catch(() => {
  console.error("Munchadoo could not load its production build.");
  process.exit(1);
});
