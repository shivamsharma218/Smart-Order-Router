// Embedded snapshot of the Smart Order Router project data.
// This gives the dashboard a standalone data source in the browser.
// To refresh, re-run the backend scripts and update these arrays.

const SOR_DATA = (() => {
  // Token address -> symbol mapping
  const TOKEN_SYMBOLS = {
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
    "0x514910771AF9Ca656af840dff83E8264EcF986CA": "LINK",
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": "UNI",
    "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": "AAVE",
    "0x0d8775f648430679a709e98d2b0cb6250d2887ef": "BAT",
    "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f": "SNX",
    "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": "MKR",
    "0xd46ba6d942050d489dbd938a2c909a5d5039a161": "AMP",
    "0x57ab1ec28d129707052df4df418d58a2d46d5f51": "SUSD",
    "0x40fd72257597aa14c7231a7b1aaa29fce868f677": "XOR",
    "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d": "PNT",
    "0x408e41876cccdc0f92210600ef50372656052a38": "REN",
    "0x960b236a07cf122663c4303350609a66a7b288c0": "YFI",
    "0x04fa0d235c4abf4bcf4787af4cf447de572ef828": "ENJ",
    "0xba11d00c5f74255f56a5e366f4f77f5a186d7f55": "BAND",
    "0x80fb784b7ed66730e8b1dbd9820afd29931aab03": "LEND",
  };

  const TOKENS = [
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 },
    { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", decimals: 18 },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18 },
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8 },
    { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", decimals: 18 },
    { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", decimals: 18 },
    { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", decimals: 18 },
  ];

  const ROUTERS = [
    {
      name: "UniswapV2",
      factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
      router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    },
    {
      name: "SushiSwap",
      factory: "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac",
      router: "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f",
    },
  ];

  const FACTORIES = {
    UniswapV2: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    SushiSwap: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
  };

  const DECIMALS = {
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": 18,
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": 6,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": 6,
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": 18,
    "0x2260fac5e5542a773Aa44fBCfeDf7C193bc2C599": 8,
  };

  // Routes discovered by routeFinder.js (WETH -> token -> WETH)
  const ROUTES = [
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", dex: "UniswapV2", pair: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x6b175474e89094c44da98b954eedeac495271d0f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x6b175474e89094c44da98b954eedeac495271d0f", dex: "UniswapV2", pair: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0d8775f648430679a709e98d2b0cb6250d2887ef", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x0d8775f648430679a709e98d2b0cb6250d2887ef", dex: "UniswapV2", pair: "0xB6909B960DbbE7392D405429eB2b3649752b4838" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0x998BF04788C1c631C0e02BD1eED3D945308Bf0a3" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", dex: "UniswapV2", pair: "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", dex: "UniswapV2", pair: "0x43AE24960e5534731Fc831386c07755A2dc33D47" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0xA1d7b2d891e3A1f9ef4bBC5be20630C2FEB1c470" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x514910771af9ca656af840dff83e8264ecf986ca", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x514910771af9ca656af840dff83e8264ecf986ca", dex: "UniswapV2", pair: "0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0xC40D16476380e4037e6b1A2594cAF6a6cc8Da967" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", dex: "UniswapV2", pair: "0xC2aDdA861F89bBB333c90c492cB837741916A225" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0xBa13afEcda9beB75De5c56BbAF696b880a5A50dD" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xd46ba6d942050d489dbd938a2c909a5d5039a161", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0xd46ba6d942050d489dbd938a2c909a5d5039a161", dex: "UniswapV2", pair: "0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0xCb2286d9471cc185281c4f763d34A962ED212962" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x57ab1ec28d129707052df4df418d58a2d46d5f51", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x57ab1ec28d129707052df4df418d58a2d46d5f51", dex: "UniswapV2", pair: "0xf80758aB42C3B07dA84053Fd88804bCB6BAA4b5c" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0xF1F85b2C54a2bD284B1cf4141D64fD171Bd85539" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x40fd72257597aa14c7231a7b1aaa29fce868f677", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x40fd72257597aa14c7231a7b1aaa29fce868f677", dex: "UniswapV2", pair: "0x01962144D41415cCA072900Fe87Bbe2992A99F10" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0x47FF5a2ad7A36cfCF7867539f5851A4A573Bf4e1" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d", dex: "UniswapV2", pair: "0x343FD171caf4F0287aE6b87D75A8964Dc44516Ab" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0xEF4F1D5007B4FF88c1A56261fec00264AF6001Fb" },
      ],
    },
    {
      path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x408e41876cccdc0f92210600ef50372656052a38", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
      swaps: [
        { token: "0x408e41876cccdc0f92210600ef50372656052a38", dex: "UniswapV2", pair: "0x8Bd1661Da98EBDd3BD080F0bE4e6d9bE8cE9858c" },
        { token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", dex: "SushiSwap", pair: "0x611CDe65deA90918c0078ac0400A72B0D25B9bb1" },
      ],
    },
  ];

  // Helper to get a token symbol from its address (case-insensitive)
  function symbol(addr) {
    if (!addr) return "?";
    const key = addr.toLowerCase();
    return TOKEN_SYMBOLS[key] || shortAddr(addr);
  }

  function shortAddr(addr) {
    if (!addr) return "?";
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

// Smart Order Router on-chain configuration
  const EXECUTOR = {
    address: "0x0c82CB749B53cB3433319cd6Be18d746b3781B9B",
  };

  // Default amount used by the backend bot (WETH)
  const INPUT_AMOUNT = 1;

  // Supported networks for the dashboard
  const NETWORKS = {
    hardhat: { chainId: 31337, name: "Hardhat", rpc: "http://127.0.0.1:8545" },
    mainnet: { chainId: 1, name: "Ethereum Mainnet" },
    sepolia: { chainId: 11155111, name: "Sepolia" },
  };

  return {
    TOKEN_SYMBOLS,
    TOKENS,
    ROUTERS,
    FACTORIES,
    DECIMALS,
    ROUTES,
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    EXECUTOR,
    INPUT_AMOUNT,
    NETWORKS,
    symbol,
    shortAddr,
  };
})();
