# Smart Order Router

<div align="center">

![Smart Order Router](https://img.shields.io/badge/Smart%20Order%20Router-DeFi%20Trading%20Engine-blue?style=for-the-badge&logo=ethereum)
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-lightgrey?style=flat-square&logo=solidity)
![Node.js](https://img.shields.io/badge/Node.js-ES6%20Modules-green?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-ISC-orange?style=flat-square)

**An intelligent decentralized exchange (DEX) aggregation and smart routing engine for optimal token swaps on Ethereum.**

[Overview](#overview) • [Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📋 Overview

**Smart Order Router** is an advanced DeFi trading aggregation platform that discovers liquidity across multiple DEXs, analyzes optimal trading routes, and executes swaps with minimal slippage and gas costs. It combines on-chain smart contracts with an off-chain optimization engine to find the best trading paths in real-time.

### Why Smart Order Router?

- 🔍 **Automatic Liquidity Discovery** - Scan multiple DEXs for the best rates
- 🧠 **Intelligent Route Finding** - Find optimal multi-hop swap paths
- ⚡ **Slippage Minimization** - Execute swaps with price protection
- 💰 **Gas Optimization** - Minimize transaction costs
- 🎨 **Interactive Dashboard** - Visualize pools, routes, and execute swaps
- 🔐 **Secure Smart Contracts** - Battle-tested on Ethereum

---

## ✨ Key Features

### 🔍 Liquidity Discovery
- Automatically scan DEX factories (Uniswap V2, SushiSwap, etc.)
- Real-time pool discovery and caching
- Configurable limits and batch processing
- Support for multiple DEXs

### 🌐 Graph-Based Routing
- Build a directed graph of token pairs and liquidity pools
- Identify optimal trading paths
- Multi-hop route support (2-4 hops)
- Connectivity analysis

### 🧠 Route Optimization
- Query live on-chain quotes from each DEX
- Rank routes by profitability and gas cost
- Automatic slippage calculation
- Best route selection algorithm

### ⚡ Swap Execution
- Smart contract-based swap execution
- Atomic transactions with error handling
- Gas optimization for batch operations
- Wallet integration (MetaMask, etc.)

### 🎨 Web Dashboard
- Real-time pool visualization
- Interactive route analysis
- One-click token swapping
- Live quote display
- Responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- Ethereum RPC endpoint (Alchemy, Infura, etc.)
- MetaMask or similar wallet

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/smart-order-router.git
cd smart-order-router

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key_here
EXECUTOR_ADDRESS=0x...
PORT=3000
EOF

# 4. Deploy contracts (if first time)
npx hardhat run scripts/deploy.js --network sepolia

# 5. Start server
node server.js

# Dashboard available at: http://localhost:3000
```

### First Swap

1. Open http://localhost:3000 in your browser
2. Click "Connect Wallet"
3. Click "Discover Pools" to scan liquidity
4. Click "Find Routes" to identify swap paths
5. Enter amount and click "Swap"

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│     Web Dashboard (Interactive UI)          │
└──────────────────┬──────────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────────┐
│     REST API Server (Node.js)               │
│  • Routes requests to backend pipeline      │
│  • Exposes configuration                    │
│  • Serves static files                      │
└──────────────────┬──────────────────────────┘
                   │ Child Process
┌──────────────────▼──────────────────────────┐
│  Optimization Pipeline                      │
│  ┌──────────────────────────────────────┐   │
│  │ 1. Discover Pools → pool data        │   │
│  │ 2. Build Graph → routing graph       │   │
│  │ 3. Find Routes → candidate paths     │   │
│  │ 4. Best Route → optimal quote        │   │
│  │ 5. Execute Swap → blockchain tx      │   │
│  └──────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ RPC Calls
┌──────────────────▼──────────────────────────┐
│  Ethereum Mainnet/Testnet                   │
│  • DEX Factories & Pools                    │
│  • SwapExecutor Smart Contract              │
│  • Token Contracts (ERC20)                  │
└─────────────────────────────────────────────┘
```

### Pipeline Stages

| Stage | Purpose | Input | Output |
|-------|---------|-------|--------|
| **Discover** | Scan DEX factories | Factory addresses | Pool data |
| **Graph** | Build routing graph | Pool data | Token pairs |
| **Routes** | Find swap paths | Token graph | Candidate routes |
| **Best** | Calculate quotes | Routes + amount | Optimal route |
| **Execute** | Execute swap | Route + wallet | Tx hash |

---

## 📁 Project Structure

```
smart-order-router/
├── contracts/              # Solidity smart contracts
│   ├── swapExecutor.sol    # Core swap logic
│   └── interfaces/         # ERC20, Factory, Pair ABIs
├── src/                    # Backend pipeline
│   ├── discoverPools.js    # Phase 1: Discover
│   ├── graphBuilder.js     # Phase 2: Build graph
│   ├── routeFinder.js      # Phase 3: Find routes
│   ├── bestRoute.js        # Phase 4: Best quote
│   └── executeSwap.js      # Phase 5: Execute
├── config/                 # Configuration
│   ├── tokens.js           # Supported tokens
│   ├── factories.js        # DEX factories
│   └── routers.js          # DEX routers
├── frontend/               # Web Dashboard
│   ├── index.html          # UI
│   ├── js/
│   │   ├── app.js          # Main app logic
│   │   └── wallet.js       # Wallet integration
│   └── css/
├── cache/                  # Runtime data
│   ├── pools.json
│   ├── graph.json
│   ├── routes.json
│   └── bestRoutes.json
├── test/                   # Test suite
├── scripts/                # Utility scripts
│   ├── deploy.js           # Deployment
│   └── fundWallet.js       # Fund accounts
├── server.js               # HTTP server
├── hardhat.config.js       # Hardhat config
└── package.json
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Required
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key
EXECUTOR_ADDRESS=0x...

# Optional
PORT=3000
LIMIT=200           # Max pools per DEX
BATCH_SIZE=20      # Query batch size
MAX_RETRIES=3      # Retry attempts
```

### Supported Tokens

Edit `config/tokens.js`:

```javascript
export const TOKENS = {
  WETH:  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC:  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT:  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI:   "0x6B175474E89094C44Da98b954EedeAC495271d0F",
};
```

### Supported DEXs

Edit `config/factories.js` and `config/routers.js`:

```javascript
// Uniswap V2, SushiSwap, Curve, Balancer, etc.
```

---

## 📚 Usage

### Web Dashboard (Recommended)

```bash
# Start server
node server.js

# Open http://localhost:3000
# Click buttons to trigger pipeline stages
```

### Command Line

```bash
# Discover pools
node src/discoverPools.js

# Build routing graph
node src/graphBuilder.js

# Find all routes
node src/routeFinder.js

# Get best quote for 1 ETH
INPUT_AMOUNT=1 node src/bestRoute.js

# Execute swap
node src/executeSwap.js
```

### Continuous Automation

```bash
# Periodically update pools and quotes
node src/automation.js
```

---

## 🔌 API Endpoints

### POST /api/run
Trigger a pipeline stage

```json
{
  "step": "best",
  "amount": "1.5"
}
```

Valid steps: `discover`, `graph`, `routes`, `best`, `execute`

### GET /api/config
Get runtime configuration

### GET /api/best
Get cached best route

### GET /
Serve dashboard

---

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/executeSwap.js

# Generate gas report
REPORT_GAS=true npx hardhat test
```

---

## 📊 Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Discover 200 pools | 2-5s | Network dependent |
| Build graph | 100-300ms | In-memory |
| Find routes | 200-500ms | Path enumeration |
| Get best quote | 1-2s | On-chain calls |
| Execute swap | 15-45s | Network dependent |

---

## 🐛 Troubleshooting

**"Invalid RPC URL"**
→ Check ETH_RPC_URL in .env

**"Pools not discovered"**
→ Verify LIMIT and BATCH_SIZE settings
→ Ensure RPC has archive data

**"No routes found"**
→ Increase pool discovery limit
→ Verify tokens exist in pools
→ Try with intermediate token (WETH)

**"Insufficient liquidity"**
→ Reduce swap amount
→ Use different token pair
→ Split across multiple routes

**"Transaction reverted"**
→ Increase SLIPPAGE in config/constants.js
→ Check wallet balance and approvals

---

## 🔐 Security

- Never commit `.env` file
- Rotate private keys regularly
- Test thoroughly on Sepolia before mainnet
- Verify contract addresses carefully
- Monitor gas usage for anomalies

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test: `npx hardhat test`
4. Commit: `git commit -m 'Add my feature'`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

---

## 📄 License

ISC License - see LICENSE file

---

## 📞 Support

- 📖 **Documentation**: See full README for detailed guides
- 🐛 **Issues**: GitHub Issues for bugs and features
- 💬 **Discussions**: GitHub Discussions for questions
- ⭐ **Star us**: If you find this useful!

---

## 🚀 Next Steps

1. **Deploy on Sepolia** - Test on testnet first
2. **Add More DEXs** - Integrate Curve, Balancer, etc.
3. **Optimize Routes** - Use machine learning
4. **UI Enhancements** - Add charting and analytics
5. **Cross-chain** - Support other chains (Arbitrum, Optimism)

---

Made with ❤️ for the DeFi community | **[Full Documentation](./README_PRODUCTION.md)**
