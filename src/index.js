/**
 * CryptoSeedRecovery - Main Library Entrypoint
 * Exposes programmatic APIs for integration in other NPM packages and applications.
 */

const wordlists = require('./lib/wordlists');
const electrumLegacy = require('./lib/electrum-legacy');
const typo = require('./lib/typo');
const addressDeriver = require('./lib/address-deriver');
const searchEngine = require('./lib/search-engine');

module.exports = {
  // Wordlists
  wordlists,

  // Legacy Electrum v1poetic decoders
  electrumLegacy,

  // Spelling typo assistance
  typo,

  // Address derivation (EVM, Bitcoin, Solana, Tron, Stellar, etc.)
  addressDeriver,

  // Seed recovery search engines
  searchEngine
};
