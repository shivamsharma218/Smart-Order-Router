// Helper: start a local Hardhat node that forks Ethereum mainnet.
// Run with: npx hardhat node
// This file just documents the intended RPC config. The actual node is
// started via: npx hardhat node --fork <FORK_URL>, or the localhost network
// defined in hardhat.config.js.
import dotenv from "dotenv";
dotenv.config();

console.log("=== Smart Order Router — Local Fork Node ===");
console.log("");
console.log("Your .env contains a mainnet RPC (FORK_URL / ETH_RPC_URL).");
console.log("");
console.log("To run the local node the 'best' and 'execute' scripts expect");
console.log("on http://127.0.0.1:8545, start a Hardhat node forking mainnet:");
console.log("");
console.log("  npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/<YOUR_KEY>");
console.log("");
console.log("This makes the Uniswap/SushiSwap pools, reserves, and contracts");
console.log("available locally so getAmountsOut() quotes and swaps work.");
