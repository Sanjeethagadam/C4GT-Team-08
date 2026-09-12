import { createServer } from "vite";

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

async function start() {
  try {
    const server = await createServer({
      configFile: "./vite.config.js",
      server: { port: 3000 },
    });
    await server.listen();
    server.printUrls();

    // Prevent event loop from terminating in non-interactive shells
    const timer = setInterval(() => {}, 60000);
    timer.unref = () => {}; // keep referenced
  } catch (err) {
    console.error("Failed to start Vite dev server:", err);
    process.exit(1);
  }
}

start();
