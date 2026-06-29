/**
 * CryptoSeedRecovery - Electrum Legacy v1 Mnemonic Logic
 * Port of ThomasV's pre-2014 Electrum v1 poetic triplet encoding/decoding.
 */

const { electrumPoet } = require('./wordlists');
const n = electrumPoet.length; // 1626

/**
 * Helper to compute mathematical modulo (always returns positive number in [0, n-1])
 */
function mod(x, y) {
  return ((x % y) + y) % y;
}

/**
 * Validates if all words in a list are part of the Electrum poetic dictionary.
 * @param {string[]} wlist 
 * @returns {boolean}
 */
function validateElectrumMnemonic(wlist) {
  if (!Array.isArray(wlist) || wlist.length < 12 || wlist.length % 3 !== 0) {
    return false;
  }
  return wlist.every(word => electrumPoet.includes(word.toLowerCase()));
}

/**
 * Encodes a 32-character hex string (16 bytes/128 bits) into a 12-word Electrum poetic seed.
 * @param {string} hexMessage 
 * @returns {string[]}
 */
function mnEncode(hexMessage) {
  if (typeof hexMessage !== 'string' || !/^[0-9a-fA-F]+$/.test(hexMessage)) {
    throw new Error('Expected hex string for encoding');
  }
  if (hexMessage.length % 8 !== 0) {
    throw new Error('Hex length must be a multiple of 8');
  }

  const out = [];
  const numChunks = hexMessage.length / 8;
  for (let i = 0; i < numChunks; i++) {
    const wordHex = hexMessage.substring(8 * i, 8 * i + 8);
    const x = parseInt(wordHex, 16);
    const w1 = x % n;
    const w2 = mod(Math.floor(x / n) + w1, n);
    const w3 = mod(Math.floor(x / (n * n)) + w2, n);
    out.push(electrumPoet[w1], electrumPoet[w2], electrumPoet[w3]);
  }
  return out;
}

/**
 * Decodes an Electrum poetic wordlist (typically 12 words) back into a 32-character hex string.
 * @param {string[]} wlist 
 * @returns {string}
 */
function mnDecode(wlist) {
  if (!Array.isArray(wlist) || wlist.length % 3 !== 0) {
    throw new Error('Wordlist length must be a multiple of 3');
  }

  const cleanList = wlist.map(w => w.toLowerCase().trim());
  let out = '';
  const numTriplets = cleanList.length / 3;

  for (let i = 0; i < numTriplets; i++) {
    const word1 = cleanList[3 * i];
    const word2 = cleanList[3 * i + 1];
    const word3 = cleanList[3 * i + 2];

    const w1 = electrumPoet.indexOf(word1);
    const w2 = electrumPoet.indexOf(word2);
    const w3 = electrumPoet.indexOf(word3);

    if (w1 === -1 || w2 === -1 || w3 === -1) {
      throw new Error(`One or more words not found in poetic dictionary: ${word1}, ${word2}, ${word3}`);
    }

    const x = w1 + n * mod(w2 - w1, n) + n * n * mod(w3 - w2, n);
    out += x.toString(16).padStart(8, '0');
  }
  return out;
}

const { bip39 } = require('./wordlists');
const { ethers } = require('ethers');

/**
 * Validates Monero 25-word or 13-word legacy mnemonics.
 * Uses electrumPoet wordlist.
 */
function validateMoneroMnemonic(words) {
  if (!Array.isArray(words) || (words.length !== 25 && words.length !== 13)) {
    return false;
  }
  const clean = words.map(w => w.toLowerCase().trim());
  if (!clean.every(w => electrumPoet.includes(w))) {
    return false;
  }
  
  if (words.length === 25) {
    const sum = clean.slice(0, 24).reduce((acc, word) => acc + electrumPoet.indexOf(word), 0);
    const checksumIdx = sum % 24;
    return clean[24] === clean[checksumIdx];
  } else if (words.length === 13) {
    const sum = clean.slice(0, 12).reduce((acc, word) => acc + electrumPoet.indexOf(word), 0);
    const checksumIdx = sum % 12;
    return clean[12] === clean[checksumIdx];
  }
  return false;
}

/**
 * Validates Algorand 25-word mnemonics using standard BIP-39 English wordlist.
 */
function validateAlgorandMnemonic(words) {
  if (!Array.isArray(words) || words.length !== 25) return false;
  const bip39En = bip39['en'];
  if (!bip39En) return false;
  if (!words.every(w => bip39En.includes(w.toLowerCase().trim()))) return false;
  
  try {
    const decodedHex = decodeAlgorandMnemonic(words);
    return !!decodedHex;
  } catch (err) {
    return false;
  }
}

/**
 * Decodes Algorand 25-word seed to a 32-byte private key in hex.
 */
function decodeAlgorandMnemonic(words) {
  const bip39En = bip39['en'];
  if (!bip39En) return '';
  const indices = words.slice(0, 24).map(w => bip39En.indexOf(w.toLowerCase().trim()));
  const bytes = new Uint8Array(33);
  let bitBuffer = 0;
  let bitLength = 0;
  let byteIdx = 0;
  for (let i = 0; i < 24; i++) {
    bitBuffer = (bitBuffer << 11) | indices[i];
    bitLength += 11;
    while (bitLength >= 8) {
      bytes[byteIdx++] = (bitBuffer >>> (bitLength - 8)) & 0xff;
      bitLength -= 8;
    }
  }
  if (bitLength > 0) {
    bytes[byteIdx++] = (bitBuffer << (8 - bitLength)) & 0xff;
  }
  const privKeyBytes = bytes.subarray(0, 32);
  return Array.from(privKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates Cardano Byron 22-word paper wallet seed.
 * All words must be in BIP-39 English.
 */
function validateCardanoByronMnemonic(words) {
  if (!Array.isArray(words) || words.length !== 22) return false;
  const bip39En = bip39['en'];
  return words.every(w => bip39En.includes(w.toLowerCase().trim()));
}

module.exports = {
  validateElectrumMnemonic,
  mnEncode,
  mnDecode,
  validateMoneroMnemonic,
  validateAlgorandMnemonic,
  decodeAlgorandMnemonic,
  validateCardanoByronMnemonic
};
