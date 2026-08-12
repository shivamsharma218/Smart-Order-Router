// Smart Order Router Dashboard — application logic
(function () {
  "use strict";

  const D = SOR_DATA;

  // ---------- Token helpers ----------
  function sym(addr) {
    return D.symbol(addr);
  }

  // Estimated spread for a route. Since we don't have live reserves in the
  // browser snapshot, we compute a deterministic "potential" score based on
  // route length & DEX diversity (higher = more interesting). In a live setup
  // this would be replaced by real quote data from the backend.
  function estimateSpread(route) {
    const dexSet = new Set(route.swaps.map((s) => s.dex));
    let score = 0.4; // base simulated spread (WETH)
    if (dexSet.size > 1) score += 0.15; // cross-DEX bonus
    // deterministic pseudo-random from pair addresses
    const seed = route.swaps.reduce((a, s) => a + s.pair.length, 0);
    score += (seed % 10) / 100;
    return score;
  }

function formatWeth(v) {
    return v.toFixed(4) + " WETH";
  }

  // Real backend best-route result (from /api/best), null if no profitable route
  let realBest = null;

  async function loadBest() {
    try {
      const res = await fetch("/api/best");
      const data = await res.json();
      // Normalize the numbers (backend stores them as strings)
      if (data && data.best) {
        data.best.input = BigInt(data.best.input || "0");
        data.best.output = BigInt(data.best.output || "0");
        data.best.profit = BigInt(data.best.profit || "0");
      }
      realBest = data.best || null;
    } catch (e) {
      realBest = null;
    }
    renderStats();
    renderBestRoute();
  }

  // ---------- Render: stats ----------
  function renderStats() {
    const total = D.ROUTES.length;
    const dexes = new Set(D.ROUTES.flatMap((r) => r.swaps.map((s) => s.dex))).size;

    document.getElementById("statRoutes").textContent = total;
    document.getElementById("statDex").textContent = dexes;
    document.getElementById("statTokens").textContent = D.TOKENS.length;

    // Best spread uses the real backend result if available
    const profitEl = document.getElementById("statProfit");
    if (realBest && realBest.profit > 0n) {
      profitEl.textContent = formatWeth(parseFloat(realBest.profit) / 1e18);
    } else {
      profitEl.textContent = "—";
    }
  }

  // ---------- Render: best route card ----------
  function renderBestRoute() {
    const amt = getScanAmount();
    const pv = document.getElementById("pathVisual");
    const badge = document.querySelector("#bestRouteCard .badge");
    const profitEl = document.getElementById("bestProfit");
    const inputEl = document.getElementById("bestInput");
    const outputEl = document.getElementById("bestOutput");
    const executeBtn = document.getElementById("executeSwapBtn");

    // No real profitable route found by the backend
    if (!realBest || realBest.profit <= 0n) {
      pv.innerHTML = `<div class="path-node" style="min-width:100%;padding:20px"><span class="sym" style="color:var(--text-dim)">No profitable route detected</span></div>`;
      badge.textContent = "NO PROFIT";
      badge.className = "badge badge-idle";
      inputEl.textContent = "—";
      outputEl.textContent = "—";
      profitEl.textContent = "0.0000 WETH";
      if (executeBtn) executeBtn.disabled = true;
      return;
    }

    // Real profitable route — render path
    pv.innerHTML = "";
    realBest.path.forEach((addr, i) => {
      if (i > 0) {
        const arrow = document.createElement("span");
        arrow.className = "path-arrow";
        arrow.textContent = "→";
        pv.appendChild(arrow);
      }
      const node = document.createElement("div");
      node.className = "path-node";
      const short = addr.slice(0, 6) + "…" + addr.slice(-4);
      node.innerHTML = `<span class="sym">${sym(addr)}</span><span class="dst">${short}</span>`;
      pv.appendChild(node);
    });

    const inputEth = parseFloat(realBest.input) / 1e18;
    const outputEth = parseFloat(realBest.output) / 1e18;
    const profitEth = parseFloat(realBest.profit) / 1e18;

    inputEl.textContent = inputEth.toFixed(4) + " WETH";
    outputEl.textContent = outputEth.toFixed(4) + " WETH";
    profitEl.textContent = "+" + formatWeth(profitEth);
    badge.textContent = "PROFITABLE";
    badge.className = "badge badge-green";
    if (executeBtn) executeBtn.disabled = !SORWallet.isConnected();
  }

  // ---------- Render: routes table ----------
  function populateDexFilter() {
    const dexes = [...new Set(D.ROUTES.flatMap((r) => r.swaps.map((s) => s.dex)))];
    const sel = document.getElementById("dexFilter");
    dexes.forEach((d) => {
      const o = document.createElement("option");
      o.value = d;
      o.textContent = d;
      sel.appendChild(o);
    });
  }

  function renderRoutes(filter = "") {
    const search = filter.toLowerCase();
    const dexFilter = document.getElementById("dexFilter").value;
    const rows = D.ROUTES.filter((r) => {
      const pathMatch = r.path.some((p) => sym(p).toLowerCase().includes(search));
      const dexMatch = r.swaps.some((s) => s.dex.toLowerCase().includes(search));
      const dexOk = dexFilter === "all" || r.swaps.some((s) => s.dex === dexFilter);
      return dexOk && (pathMatch || dexMatch);
    });

    const tbody = document.getElementById("routesBody");
    tbody.innerHTML = "";
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-faint);padding:24px">No routes match your filters.</td></tr>`;
      return;
    }

// Identify the real best profitable route (if any) so we can mark it
    const isBest = (r) =>
      realBest &&
      realBest.profit > 0n &&
      r.path.join(",").toLowerCase() === realBest.path.join(",").toLowerCase();

    rows.forEach((r, i) => {
      const mid = r.path[1];
      const profitable = isBest(r);
      const dexHtml = r.swaps
        .map((s) => {
          const cls = s.dex.toLowerCase().includes("uniswap") ? "dex-uniswap" : "dex-sushi";
          return `<span class="dex-badge ${cls}">${s.dex}</span>`;
        })
        .join(" → ");

      // Spread column: only the real verified best route shows a profit value.
      // All other (candidate) routes are unverified — the backend only quotes
      // the best route, so we must NOT claim a spread for them.
      const spreadCell = profitable
        ? `<td class="spread-up">+${(parseFloat(realBest.profit) / 1e18).toFixed(4)} WETH</td>`
        : `<td class="spread-none">—</td>`;

      const statusCell = profitable
        ? `<td><span class="status-pill status-ok">BEST</span></td>`
        : `<td><span class="status-pill status-idle">UNVERIFIED</span></td>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="mono">${i + 1}</td>
        <td>
          <span class="symbol-pill">${sym(r.path[0])}</span>
          <span style="color:var(--text-faint)">→</span>
          <span class="symbol-pill">${sym(mid)}</span>
          <span style="color:var(--text-faint)">→</span>
          <span class="symbol-pill">${sym(r.path[2])}</span>
        </td>
        <td>${dexHtml}</td>
        <td><span class="mono">${sym(mid)}</span></td>
        ${spreadCell}
        ${statusCell}
      `;
      tbody.appendChild(tr);
    });
  }

  // ---------- Render: tokens grid ----------
  function renderTokens() {
    const grid = document.getElementById("tokensGrid");
    grid.innerHTML = "";
    D.TOKENS.forEach((t) => {
      const card = document.createElement("div");
      card.className = "token-card";
      card.innerHTML = `
        <div class="token-top"><span class="token-symbol">${t.symbol}</span><span class="token-decimals">${t.decimals} dec</span></div>
        <div class="token-addr">${t.address}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ---------- Render: DEX grid ----------
  function renderDex() {
    const grid = document.getElementById("dexGrid");
    grid.innerHTML = "";
    D.ROUTERS.forEach((r, idx) => {
      const color = idx === 0 ? "#f87171" : "#f59e0b";
      const card = document.createElement("div");
      card.className = "dex-card";
      card.innerHTML = `
        <div class="dex-name">
          <span class="dex-dot" style="background:${color};box-shadow:0 0 8px ${color}"></span>
          ${r.name}
        </div>
        <div class="dex-row"><span>Router</span><span>${r.router}</span></div>
        <div class="dex-row"><span>Factory</span><span>${r.factory}</span></div>
      `;
      grid.appendChild(card);
    });
  }

// ---------- Automation via API ----------
  function getScanAmount() {
    const el = document.getElementById("scanAmount");
    const v = parseFloat(el?.value);
    if (!v || v <= 0) return 172; // fallback
    return v;
  }

  async function runScan(step, amount) {
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, amount: amount != null ? amount : getScanAmount() }),
      });
      const data = await res.json();
      return data.output || "";
    } catch (e) {
      return "Error: " + e.message;
    }
  }

  function appendConsole(elm, text) {
    const div = document.createElement("div");
    div.textContent = text;
    elm.appendChild(div);
    elm.scrollTop = elm.scrollHeight;
  }

  function setupAutomation() {
    const consoleEl = document.getElementById("console");
    consoleEl.innerHTML = "";
    consoleEl.classList.remove("error");

const runAllBtn = document.getElementById("runAllBtn");
    const runBestBtn = document.getElementById("runBestBtn");
    const scanBtn = document.getElementById("scanBtn");
    const runDiscoverBtn = document.getElementById("runDiscoverBtn");

const steps = ["graph", "routes", "best"]; // discovery skipped (pools cached; run separately for a fresh scan)

    async function run(name) {
const btns = [runAllBtn, runBestBtn, scanBtn, runDiscoverBtn];
      btns.forEach((b) => (b.disabled = true));
consoleEl.classList.remove("error");
      const amt = getScanAmount();

      if (name === "discover") {
        appendConsole(consoleEl, "→ Discovering pools from DEX factories (this can take a while)…");
        const out = await runScan("discover", amt);
        appendConsole(consoleEl, out.split("\n").filter(Boolean).join("\n"));
        appendConsole(consoleEl, "✓ Pool discovery complete. Run the pipeline to refresh routes.");
} else if (name === "all") {
        appendConsole(consoleEl, `→ Running fast pipeline (amount: ${amt} WETH) — skipping pool discovery (using cached pools).`)
        for (const s of steps) {
          appendConsole(consoleEl, `→ ${s} …`);
          const out = await runScan(s, amt);
          appendConsole(consoleEl, out.split("\n").filter(Boolean).join("\n"));
        }
appendConsole(consoleEl, "✓ Pipeline complete. Refreshing best route…");
        await loadBest();
} else if (name === "best") {
        appendConsole(consoleEl, `→ Scanning best route (amount: ${amt} WETH)…`);
        const out = await runScan("best", amt);
        appendConsole(consoleEl, out.split("\n").filter(Boolean).join("\n"));
appendConsole(consoleEl, "✓ Best route scan complete. Refreshing…");
        await loadBest();
} else {
        appendConsole(consoleEl, `→ ${name} (amount: ${amt} WETH) …`);
        const out = await runScan(name, amt);
        appendConsole(consoleEl, out.split("\n").filter(Boolean).join("\n"));
      }

      btns.forEach((b) => (b.disabled = false));
    }

runAllBtn.addEventListener("click", () => run("all"));
    runBestBtn.addEventListener("click", () => run("best"));
    runDiscoverBtn.addEventListener("click", () => run("discover"));
    scanBtn.addEventListener("click", () => run("routes"));
  }

// ---------- Wallet & Swap Execution ----------
  async function setupWallet() {
    const connectBtn = document.getElementById("connectBtn");
    const connectLabel = document.getElementById("connectLabel");
    const executeBtn = document.getElementById("executeSwapBtn");
    const walletHint = document.getElementById("walletHint");

    function shortAddr(a) {
      return a.slice(0, 6) + "…" + a.slice(-4);
    }

    async function updateUi() {
      const connected = SORWallet.isConnected();
      if (connected) {
        const addr = SORWallet.getAddress();
        connectLabel.textContent = shortAddr(addr);
        connectBtn.classList.add("connected");
        executeBtn.disabled = false;
        walletHint.textContent = "Wallet connected — ready to execute";
      } else {
        connectLabel.textContent = "Connect Wallet";
        connectBtn.classList.remove("connected");
        executeBtn.disabled = true;
        walletHint.textContent = "Connect wallet to execute";
      }
    }

    connectBtn.addEventListener("click", async () => {
      try {
        await SORWallet.connect();
        await updateUi();
        appendToast("Wallet connected: " + shortAddr(SORWallet.getAddress()), "ok");
      } catch (e) {
        appendToast(e.message, "error");
      }
    });

    executeBtn.addEventListener("click", async () => {
      if (!SORWallet.isConnected()) {
        appendToast("Please connect your wallet first.", "error");
        return;
      }
if (!realBest || realBest.profit <= 0n) {
        appendToast("No profitable route to execute.", "error");
        return;
      }
      try {
        executeBtn.disabled = true;
        executeBtn.textContent = "Executing…";
        appendToast("Approving WETH & executing swap on-chain…", "info");
const result = await SORWallet.executeSwap(realBest, getScanAmount());
        appendToast("Swap executed! Tx: " + result.txHash, "ok");
        const cs = document.getElementById("console");
        appendConsole(cs, "Tx: " + result.txHash);
        if (result.approvalHash) appendConsole(cs, "Approval: " + result.approvalHash);
        appendConsole(cs, "Block: " + result.receipt.blockNumber);
      } catch (e) {
        appendToast("Swap failed: " + e.message, "error");
      } finally {
        executeBtn.disabled = !SORWallet.isConnected();
        executeBtn.textContent = "Execute Swap";
      }
    });

    // If a wallet was previously connected, restore state
    if (window.ethereum && SORWallet.getAddress()) {
      await updateUi();
    }

    // Store reference for refresh button
    window.__updateWalletUi = updateUi;
  }

  // ---------- Toast ----------
  function appendToast(msg, type) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = "toast " + (type || "info");
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), 4000);
  }

  // ---------- Nav active state ----------
  function setupNav() {
    const links = document.querySelectorAll(".nav-link");
    const title = document.getElementById("page-title");
    const sections = ["overview", "routes", "tokens", "dex", "automation"];
    const titles = {
      overview: "Overview",
      routes: "Arbitrage Routes",
      tokens: "Anti-TH Tokens",
      dex: "DEX / Routers",
      automation: "Automation",
    };

    links.forEach((link) => {
      link.addEventListener("click", () => {
        links.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        const key = link.getAttribute("href").slice(1);
        title.textContent = titles[key] || "Overview";
      });
    });
  }

  // ---------- Init ----------
  function refresh() {
    renderStats();
    renderBestRoute();
    renderRoutes();
    renderTokens();
    renderDex();
  }

document.addEventListener("DOMContentLoaded", () => {
    populateDexFilter();
    setupNav();
setupAutomation();
    setupWallet();
    refresh();
    loadBest();

    document.getElementById("routeSearch").addEventListener("input", (e) => renderRoutes(e.target.value));
    document.getElementById("dexFilter").addEventListener("change", () => renderRoutes(document.getElementById("routeSearch").value));
document.getElementById("refreshBtn").addEventListener("click", () => {
      refresh();
      const c = document.getElementById("console");
      appendConsole(c, "Snapshot refreshed.");
    });

    // Re-render best-route numbers when the amount field changes
    document.getElementById("scanAmount").addEventListener("input", () => renderBestRoute());
  });
})();
