// Smart Order Router — Frontend server
// Serves the static dashboard and exposes an API to trigger the
// backend pipeline scripts (discover, graph, routes, best).
import http from "http";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, "frontend");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Map of readable step name -> node script
const SCRIPTS = {
  discover: "node src/discoverPools.js",
  graph: "node src/graphBuilder.js",
  routes: "node src/routeFinder.js",
  best: "node src/bestRoute.js",
  execute: "node src/executeSwap.js",
};

function runScript(cmd, envOverrides = {}) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: __dirname, timeout: 300000, env: { ...process.env, ...envOverrides } }, (error, stdout, stderr) => {
      const out = [];
      if (stdout) out.push(stdout.trim());
      if (stderr) out.push(stderr.trim());
      if (error && !stdout) out.push("✗ " + error.message);
      resolve(out.join("\n"));
    });
  });
}

const server = http.createServer(async (req, res) => {
  // API: trigger a pipeline step
  if (req.method === "POST" && req.url.startsWith("/api/run")) {
    let body = "";
    for await (const chunk of req) body += chunk;
    let step = "routes";
    let amount;
    try {
      const parsed = JSON.parse(body);
      step = (parsed.step || "routes").toLowerCase();
      if (parsed.amount != null) amount = String(parsed.amount);
    } catch (e) {
      /* ignore */
    }

    const cmd = SCRIPTS[step];
    if (!cmd) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `Unknown step: ${step}` }));
      return;
    }

    // Pass the scan amount to the "best" script via env so it computes
    // quotes for the user-selected input amount.
    const envOverrides = step === "best" && amount ? { INPUT_AMOUNT: amount } : {};

    const output = await runScript(cmd, envOverrides);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ step, amount: amount || null, output }));
    return;
  }

  // API: expose runtime config (executor address from .env) to the frontend.
  // This lets you change the deployed Smart Order Router contract address
  // just by editing EXECUTOR_ADDRESS in .env — no code changes needed.
  if (req.method === "GET" && req.url === "/api/config") {
    const executor = process.env.EXECUTOR_ADDRESS || "";
    const rpc = process.env.ETH_RPC_URL || "";
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ executor, rpc }));
    return;
  }

  // API: return the real best-route backend result (real on-chain quote)
  if (req.method === "GET" && req.url === "/api/best") {
    const bestPath = path.join(__dirname, "cache", "bestRoutes.json");
    fs.readFile(bestPath, "utf8", (err, data) => {
      if (err) {
        // No profitable route found / file missing
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ best: null }));
        return;
      }
      try {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ best: JSON.parse(data) }));
      } catch (e) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ best: null }));
      }
    });
    return;
  }

  // Static files
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.join(FRONTEND_DIR, urlPath);
  // Ensure the resolved path stays within the frontend dir
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Smart Order Router dashboard running at http://localhost:${PORT}`);
});
