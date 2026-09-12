import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const BACKEND_PORT = 5000;
const PORT = 3000;

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

const server = http.createServer((req, res) => {
  // Proxy /api and /uploads to backend on port 5000
  if (req.url.startsWith("/api") || req.url.startsWith("/uploads")) {
    const proxyReq = http.request(
      {
        host: "localhost",
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on("error", (err) => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Bad Gateway", message: err.message }));
    });

    req.pipe(proxyReq);
    return;
  }

  // Serve static files from dist
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let filePath = path.join(distDir, parsedUrl.pathname);

  // If path is a directory or does not exist, check for file or serve index.html for SPA routing
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA Fallback: serve dist/index.html
      const indexPath = path.join(distDir, "index.html");
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Academic Engagement Frontend running at http://localhost:${PORT}/`);
  console.log(`Proxying /api and /uploads to http://localhost:${BACKEND_PORT}`);
});
