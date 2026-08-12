// Wallet connection & Swap execution logic
window.SORWallet = (function () {
  "use strict";

  const D = SOR_DATA;

  // Minimal ABI for SwapExecutor.executeSwap
  const EXECUTOR_ABI = [
    "function executeSwap(address[] routers, address[] path, uint256 amountIn, uint256 amountOutMin, uint256 deadline) returns (uint256 amountOut)",
  ];

  // Minimal WETH / ERC20 ABI
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
  ];

  let signer = null;
  let connectedAddress = null;
  let provider = null;

  // Runtime executor address. Starts as the hardcoded default (D.EXECUTOR.address),
  // but once /api/config is fetched it overrides with EXECUTOR_ADDRESS from .env.
  // This lets you change the deployed Smart Order Router address from .env only.
  let executorAddress = (D.EXECUTOR && D.EXECUTOR.address) || null;

  // ---------- State getters ----------
  function getSigner() {
    return signer;
  }
  function getAddress() {
    return connectedAddress;
  }
  function isConnected() {
    return !!connectedAddress;
  }
  function getExecutorAddress() {
    return executorAddress;
  }

  // ---------- Fetch runtime config (executor address) from the server ----------
  async function loadConfig() {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.executor) {
          executorAddress = cfg.executor;
          console.log("[SOR] Executor address from .env:", executorAddress);
        }
      }
    } catch (e) {
      console.warn("[SOR] Could not load config, using default executor.", e);
    }
  }

  // ---------- Connect via injected wallet (MetaMask) ----------
  async function connect() {
    if (!window.ethereum) {
      throw new Error(
        "No wallet detected. Please install MetaMask and refresh, or use a Hardhat-injected account."
      );
    }

    // Pull the executor address from .env before any on-chain interaction.
    await loadConfig();

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    signer = provider.getSigner();
    connectedAddress = accounts[0];

    window.ethereum.on("accountsChanged", (accs) => {
      connectedAddress = accs[0] || null;
      if (!connectedAddress) signer = null;
    });

    return connectedAddress;
  }

  // ---------- Get WETH balance & allowance ----------
  async function getWethSnapshot() {
    if (!signer || !connectedAddress) return null;
    if (!executorAddress) await loadConfig();
    const weth = new ethers.Contract(D.WETH, ERC20_ABI, provider);
    const balance = await weth.balanceOf(connectedAddress);
    const allowance = await weth.allowance(connectedAddress, executorAddress);
    return { balance, allowance, executorAddress };
  }

  // ---------- Approve WETH to the executor if needed ----------
  async function ensureAllowance(amount) {
    if (!executorAddress) await loadConfig();
    const weth = new ethers.Contract(D.WETH, ERC20_ABI, signer);
    const allowance = await weth.allowance(connectedAddress, executorAddress);
    if (allowance.lt(amount)) {
      const tx = await weth.approve(executorAddress, ethers.constants.MaxUint256);
      await tx.wait();
      return tx.hash;
    }
    return null;
  }

  // ---------- Execute the swap on-chain ----------
  async function executeSwap(route, amountInValue) {
    if (!signer || !connectedAddress) {
      throw new Error("Wallet not connected.");
    }
    if (!executorAddress) await loadConfig();
    if (!executorAddress) {
      throw new Error("No executor address configured. Set EXECUTOR_ADDRESS in .env.");
    }

    const executor = new ethers.Contract(executorAddress, EXECUTOR_ABI, signer);

    // Build routers array from route.swaps dex names
    const routers = route.swaps.map((s) => {
      const router = D.ROUTERS.find((r) => r.name === s.dex);
      if (!router) throw new Error("Unknown router: " + s.dex);
      return router.router;
    });

    // amount in WETH (input token = path[0] = WETH).
    // Use the user-selected amount from the dashboard, falling back to DATA_INPUT.
    const value = amountInValue != null ? amountInValue : D.INPUT_AMOUNT;
    const amountIn = ethers.utils.parseEther(String(value));
    // 0.5% slippage on expected output
    const amountOutMin = amountIn; // placeholder; real bot reads from quotes
    const deadline = Math.floor(Date.now() / 1000) + 600;

    // Approve WETH first
    const approveHash = await ensureAllowance(amountIn);

    // Execute
    const tx = await executor.executeSwap(
      routers,
      route.path,
      amountIn,
      amountOutMin,
      deadline
    );
    const receipt = await tx.wait();
    return { txHash: tx.hash, approvalHash: approveHash, receipt, executorAddress };
  }

  return {
    connect,
    getSigner,
    getAddress,
    isConnected,
    getWethSnapshot,
    getExecutorAddress,
    executeSwap,
  };
})();
