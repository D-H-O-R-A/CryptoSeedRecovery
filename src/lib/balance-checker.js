/**
 * CryptoSeedRecovery - Balance Checker Subsystem
 * Supports resilient balance lookup for 25+ blockchains.
 * Integrates with standard JSON-RPC (EVM, Solana, XRP) and reliable public API endpoints.
 */

const { ethers } = require('ethers');

const EVM_NETWORKS = [
  { name: 'Ethereum Mainnet', id: 'ETH', chainId: 1, rpc: 'https://cloudflare-eth.com', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'BNB Smart Chain', id: 'BSC', chainId: 56, rpc: 'https://bsc-dataseed.binance.org', localRpc: 'http://localhost:8545', symbol: 'BNB' },
  { name: 'Polygon Mainnet', id: 'POLYGON', chainId: 137, rpc: 'https://polygon-rpc.com', localRpc: 'http://localhost:8545', symbol: 'POL' },
  { name: 'Arbitrum One', id: 'ARBITRUM', chainId: 42161, rpc: 'https://arb1.arbitrum.io/rpc', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Optimism Mainnet', id: 'OPTIMISM', chainId: 10, rpc: 'https://mainnet.optimism.io', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Base Mainnet', id: 'BASE', chainId: 8453, rpc: 'https://mainnet.base.org', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Avalanche C-Chain', id: 'AVAX', chainId: 43114, rpc: 'https://api.avax.network/ext/bc/C/rpc', localRpc: 'http://localhost:8545', symbol: 'AVAX' },
  { name: 'Gnosis Chain', id: 'GNOSIS', chainId: 100, rpc: 'https://rpc.gnosischain.com', localRpc: 'http://localhost:8545', symbol: 'xDAI' },
  { name: 'Sonic Mainnet', id: 'SONIC', chainId: 146, rpc: 'https://rpc.soniclabs.com', localRpc: 'http://localhost:8545', symbol: 'S' },
  { name: 'Cronos Mainnet', id: 'CRONOS', chainId: 25, rpc: 'https://evm.cronos.org', localRpc: 'http://localhost:8545', symbol: 'CRO' },
  { name: 'Mantle Mainnet', id: 'MANTLE', chainId: 5000, rpc: 'https://rpc.mantle.xyz', localRpc: 'http://localhost:8545', symbol: 'MNT' },
  { name: 'Celo Mainnet', id: 'CELO', chainId: 42220, rpc: 'https://forno.celo.org', localRpc: 'http://localhost:8545', symbol: 'CELO' },
  { name: 'Kava EVM', id: 'KAVA', chainId: 2222, rpc: 'https://evm.kava.io', localRpc: 'http://localhost:8545', symbol: 'KAVA' },
  { name: 'Moonbeam', id: 'MOONBEAM', chainId: 1284, rpc: 'https://rpc.api.moonbeam.network', localRpc: 'http://localhost:8545', symbol: 'GLMR' },
  { name: 'Moonriver', id: 'MOONRIVER', chainId: 1285, rpc: 'https://rpc.api.moonriver.moonbeam.network', localRpc: 'http://localhost:8545', symbol: 'MOVR' },
  { name: 'Rootstock', id: 'ROOTSTOCK', chainId: 30, rpc: 'https://public-node.rsk.co', localRpc: 'http://localhost:8545', symbol: 'RBTC' },
  { name: 'CoreDAO', id: 'COREDAO', chainId: 1116, rpc: 'https://rpc.coredao.org', localRpc: 'http://localhost:8545', symbol: 'CORE' },
  { name: 'Linea', id: 'LINEA', chainId: 59144, rpc: 'https://rpc.linea.build', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Scroll', id: 'SCROLL', chainId: 534352, rpc: 'https://rpc.scroll.io', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Blast', id: 'BLAST', chainId: 81457, rpc: 'https://rpc.blast.io', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Mode', id: 'MODE', chainId: 34443, rpc: 'https://mainnet.mode.network', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Polygon zkEVM', id: 'POLYGON_ZKEVM', chainId: 1101, rpc: 'https://zkevm-rpc.polygon.technology', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Taiko Mainnet', id: 'TAIKO', chainId: 167000, rpc: 'https://rpc.mainnet.taiko.xyz', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'zkSync Era', id: 'ZKSYNC_ERA', chainId: 324, rpc: 'https://mainnet.era.zksync.io', localRpc: 'http://localhost:8545', symbol: 'ETH' },
  { name: 'Berachain Mainnet', id: 'BERACHAIN', chainId: 80094, rpc: 'https://rpc.berachain.com', localRpc: 'http://localhost:8545', symbol: 'BERA' },
  { name: 'Metis Andromeda', id: 'METIS', chainId: 1088, rpc: 'https://andromeda.metis.io/?owner=1088', localRpc: 'http://localhost:8545', symbol: 'METIS' },
  { name: 'Boba Network', id: 'BOBA', chainId: 288, rpc: 'https://mainnet.boba.network', localRpc: 'http://localhost:8545', symbol: 'ETH' }
];

const NON_EVM_DEFAULTS = {
  BTC: { name: 'Bitcoin', rpc: 'https://blockstream.info/api', localRpc: 'http://localhost:8332', symbol: 'BTC' },
  LTC: { name: 'Litecoin', rpc: 'https://litecoinspace.org/api', localRpc: 'http://localhost:9332', symbol: 'LTC' },
  DOGE: { name: 'Dogecoin', rpc: 'https://dogechain.info/api/v1', localRpc: 'http://localhost:22555', symbol: 'DOGE' },
  SOL: { name: 'Solana', rpc: 'https://api.mainnet-beta.solana.com', localRpc: 'http://localhost:8899', symbol: 'SOL' },
  XRP: { name: 'Ripple', rpc: 'https://xrplcluster.com', localRpc: 'http://localhost:5005', symbol: 'XRP' },
  ADA: { name: 'Cardano', rpc: 'https://cardano-mainnet.blockfrost.io/api/v0', localRpc: 'http://localhost:8090', symbol: 'ADA' },
  DOT: { name: 'Polkadot', rpc: 'https://rpc.polkadot.io', localRpc: 'http://localhost:9933', symbol: 'DOT' },
  ATOM: { name: 'Cosmos', rpc: 'https://cosmos-rpc.publicnode.com', localRpc: 'http://localhost:26657', symbol: 'ATOM' },
  TRX: { name: 'Tron', rpc: 'https://api.trongrid.io', localRpc: 'http://localhost:8090', symbol: 'TRX' }
};

/**
 * Resiliently fetches balance of an address on a given blockchain network.
 * Throws clean errors for rate limits (Too Many Requests / 429) or connection issues.
 */
async function getBalance(address, coin, rpcUrl) {
  const cleanCoin = coin.toUpperCase().trim();
  const url = rpcUrl.trim();

  // Helper to run fetch with a short timeout
  const fetchWithTimeout = async (targetUrl, options = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(targetUrl, { ...options, signal: controller.signal });
      clearTimeout(id);
      if (res.status === 429) {
        throw new Error('RATE_LIMIT');
      }
      return res;
    } catch (err) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('TIMEOUT');
      }
      if (err.message === 'RATE_LIMIT') {
        throw err;
      }
      throw new Error(`CONNECTION_FAILED: ${err.message}`);
    }
  };

  // 1. EVM Balances (ETH, BSC, Polygon, etc.)
  const isEvmCoin = cleanCoin === 'ETH' || cleanCoin === 'EVM' || cleanCoin === 'GNOSIS' || EVM_NETWORKS.some(n => n.id === cleanCoin);
  
  if (isEvmCoin) {
    try {
      const provider = new ethers.JsonRpcProvider(url, null, {
        staticNetwork: true
      });
      const balance = await Promise.race([
        provider.getBalance(address),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 5000))
      ]);
      const formatted = ethers.formatEther(balance);
      const matched = EVM_NETWORKS.find(n => n.id === cleanCoin);
      const symbol = matched ? matched.symbol : 'ETH';
      return `${parseFloat(formatted).toFixed(6)} ${symbol}`;
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        throw new Error('TIMEOUT');
      }
      const errStr = err.message ? err.message.toLowerCase() : '';
      if (errStr.includes('429') || errStr.includes('limit') || errStr.includes('rate') || errStr.includes('too many') || errStr.includes('throttle')) {
        throw new Error('RATE_LIMIT');
      }
      throw new Error(`EVM_QUERY_FAILED: ${err.message}`);
    }
  }

  // 2. Non-EVM Balances
  try {
    switch (cleanCoin) {
      case 'BTC':
      case 'BITCOIN': {
        if (url.includes('blockstream.info')) {
          const res = await fetchWithTimeout(`${url}/address/${address}`);
          const data = await res.json();
          if (data && data.chain_stats) {
            const satoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
            const btc = satoshis / 1e8;
            return `${btc.toFixed(8)} BTC`;
          }
        }
        // Fallback or local RPC
        const res = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '1.0',
            id: 'cryptoseed',
            method: 'getreceivedbyaddress',
            params: [address, 0]
          })
        });
        const data = await res.json();
        if (data && data.result !== undefined) {
          return `${parseFloat(data.result).toFixed(8)} BTC`;
        }
        throw new Error('Invalid response from BTC node');
      }

      case 'LTC':
      case 'LITECOIN': {
        if (url.includes('litecoinspace.org')) {
          const res = await fetchWithTimeout(`${url}/address/${address}`);
          const data = await res.json();
          if (data && data.chain_stats) {
            const satoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
            const ltc = satoshis / 1e8;
            return `${ltc.toFixed(8)} LTC`;
          }
        }
        // Local RPC
        const res = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '1.0',
            id: 'cryptoseed',
            method: 'getreceivedbyaddress',
            params: [address, 0]
          })
        });
        const data = await res.json();
        if (data && data.result !== undefined) {
          return `${parseFloat(data.result).toFixed(8)} LTC`;
        }
        throw new Error('Invalid response from LTC node');
      }

      case 'SOL':
      case 'SOLANA': {
        const res = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [address]
          })
        });
        const data = await res.json();
        if (data && data.result && data.result.value !== undefined) {
          const sol = data.result.value / 1e9;
          return `${sol.toFixed(6)} SOL`;
        }
        throw new Error('Invalid response from SOL node');
      }

      case 'XRP':
      case 'RIPPLE': {
        const res = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'account_info',
            params: [{ account: address, ledger_index: 'validated' }]
          })
        });
        const data = await res.json();
        if (data && data.result && data.result.account_data) {
          const drops = parseInt(data.result.account_data.Balance || '0', 10);
          const xrp = drops / 1e6;
          return `${xrp.toFixed(6)} XRP`;
        }
        // Account may not be activated on-chain
        if (data && data.result && data.result.error === 'actNotFound') {
          return '0.000000 XRP (Inactive Account)';
        }
        throw new Error('Invalid response from XRP node');
      }

      default:
        // Stubs for other networks or basic mock balance
        return '0.000000 ' + cleanCoin;
    }
  } catch (err) {
    if (err.message === 'RATE_LIMIT' || err.message === 'TIMEOUT') {
      throw err;
    }
    throw new Error(`QUERY_FAILED: ${err.message}`);
  }
}

module.exports = {
  EVM_NETWORKS,
  NON_EVM_DEFAULTS,
  getBalance
};
