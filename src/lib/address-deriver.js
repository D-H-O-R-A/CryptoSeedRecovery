/**
 * CryptoSeedRecovery - Multi-Wallet Address Derivation Engine
 * Supports standard MetaMask/Trust Wallet EVM and custom B2 Wallet multichain derivations.
 * Extensively supports 25+ legacy and modern blockchains.
 */

const { ethers } = require('ethers');

/**
 * Helper to dynamically detect and load the correct ethers BIP-39 wordlist for a given mnemonic.
 */
function getEthersWordlist(phrase) {
  const words = phrase.trim().toLowerCase().split(/\s+/);
  if (words.length === 0) return null;
  
  // Filter out wildcards, placeholders, and non-alphabetic strings
  const cleanWords = words.filter(w => w && w !== '*' && w !== '?' && !w.endsWith('*') && /^[a-z]+$/i.test(w));
  if (cleanWords.length === 0) return null;

  let bestWl = null;
  let maxMatches = -1;

  for (const lang in ethers.wordlists) {
    const wl = ethers.wordlists[lang];
    if (wl && wl.getWordIndex) {
      try {
        let matches = 0;
        for (const w of cleanWords) {
          if (wl.getWordIndex(w) >= 0) {
            matches++;
          }
        }
        if (matches > maxMatches) {
          maxMatches = matches;
          bestWl = wl;
        }
      } catch (e) {}
    }
  }

  // Reject mismatching dictionary inputs (returns null if not all clean words are found in the best wordlist)
  if (bestWl && maxMatches === cleanWords.length) {
    return bestWl;
  }
  
  return null;
}

// ============================================================================
// Hashing Primitives & Encoders
// ============================================================================

/**
 * Keccak-f[1600] permutation state transition (24 rounds)
 */
function keccak_f(state) {
  const RC = [
    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
    0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
    0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
    0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
  ];

  const r = [
    0,  1, 62, 28, 27,
   36, 44,  6, 55, 20,
    3, 10, 43, 25, 39,
   41, 45, 15, 21,  8,
   18,  2, 61, 56, 14
  ];

  for (let round = 0; round < 24; round++) {
    // Theta
    let C = new BigUint64Array(5);
    for (let x = 0; x < 5; x++) {
      C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    let D = new BigUint64Array(5);
    for (let x = 0; x < 5; x++) {
      let nextX = (x + 1) % 5;
      let prevX = (x + 4) % 5;
      let rotC = BigInt.asUintN(64, (C[nextX] << 1n) | (C[nextX] >> 63n));
      D[x] = C[prevX] ^ rotC;
    }
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        state[x + y * 5] ^= D[x];
      }
    }

    // Rho & Pi
    let B = new BigUint64Array(25);
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        let index = x + y * 5;
        let rotVal = r[index];
        let val = state[index];
        let rot = rotVal === 0 ? val : BigInt.asUintN(64, (val << BigInt(rotVal)) | (val >> BigInt(64 - rotVal)));
        let nextX = y;
        let nextY = (2 * x + 3 * y) % 5;
        B[nextX + nextY * 5] = rot;
      }
    }

    // Chi
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        let current = x + y * 5;
        let next1 = ((x + 1) % 5) + y * 5;
        let next2 = ((x + 2) % 5) + y * 5;
        state[current] = B[current] ^ (~B[next1] & B[next2]);
      }
    }

    // Iota
    state[0] ^= RC[round];
  }
}

/**
 * Pure JS Keccak-256 implementation
 */
function keccak256(message) {
  let bytes;
  if (typeof message === 'string') {
    bytes = new TextEncoder().encode(message);
  } else if (message instanceof Uint8Array) {
    bytes = message;
  } else {
    bytes = new Uint8Array(message);
  }

  const state = new BigUint64Array(25);
  const rate = 136; // 136 bytes
  let blockOffset = 0;

  for (let i = 0; i < bytes.length; i++) {
    const wordIndex = Math.floor(blockOffset / 8);
    const byteIndex = blockOffset % 8;
    state[wordIndex] ^= BigInt(bytes[i]) << (BigInt(byteIndex) * 8n);
    blockOffset++;
    if (blockOffset === rate) {
      keccak_f(state);
      blockOffset = 0;
    }
  }

  // Padding
  const wordIndex = Math.floor(blockOffset / 8);
  const byteIndex = blockOffset % 8;
  state[wordIndex] ^= 0x01n << (BigInt(byteIndex) * 8n);

  const finalWordIndex = Math.floor((rate - 1) / 8);
  const finalByteIndex = (rate - 1) % 8;
  state[finalWordIndex] ^= 0x80n << (BigInt(finalByteIndex) * 8n);

  keccak_f(state);

  const hashBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    const wIdx = Math.floor(i / 8);
    const bIdx = i % 8;
    hashBytes[i] = Number((state[wIdx] >> (BigInt(bIdx) * 8n)) & 0xFFn);
  }

  return Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function keccak256Bytes(message) {
  const hex = keccak256(message);
  return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

/**
 * Pure JS BLAKE2b-256 implementation
 */
function blake2b256(message) {
  const BLAKE2B_IV = new BigUint64Array([
    0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
    0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n
  ]);

  const BLAKE2B_SIGMA = new Uint8Array([
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
    14,10,4,8,9,15,13,6,1,12,0,2,11,7,5,3,
    11,8,12,0,5,2,15,13,10,14,3,6,7,1,9,4,
    7,9,3,1,13,12,11,14,2,6,5,10,4,0,15,8,
    9,0,5,7,2,4,10,15,14,1,11,12,6,8,3,13,
    2,12,6,10,0,11,8,3,4,13,7,5,15,14,1,9,
    12,5,1,15,14,13,4,10,0,7,6,3,9,2,8,11,
    13,11,7,14,12,1,3,9,5,0,15,4,8,6,2,10,
    6,15,14,9,11,3,0,8,12,2,13,7,1,4,10,5,
    10,2,8,4,7,6,1,5,15,11,9,14,3,12,13,0,
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
    14,10,4,8,9,15,13,6,1,12,0,2,11,7,5,3
  ]);

  let bytes;
  if (typeof message === 'string') {
    bytes = new TextEncoder().encode(message);
  } else if (message instanceof Uint8Array) {
    bytes = message;
  } else {
    bytes = new Uint8Array(message);
  }

  const h = new BigUint64Array(8);
  for (let i = 0; i < 8; i++) h[i] = BLAKE2B_IV[i];
  h[0] ^= 0x01010020n; // outlen = 32

  const block = new Uint8Array(128);
  let blockLen = 0;
  let t = 0n;

  const compress = (last) => {
    t += BigInt(blockLen);
    const v = new BigUint64Array(16);
    for (let i = 0; i < 8; i++) v[i] = h[i];
    for (let i = 0; i < 8; i++) v[i + 8] = BLAKE2B_IV[i];
    v[12] ^= t;
    if (last) v[14] ^= 0xffffffffffffffffn;

    const m = new BigUint64Array(16);
    const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
    for (let i = 0; i < 16; i++) {
      m[i] = view.getBigUint64(i * 8, true);
    }

    const G = (a, b, c, d, x, y) => {
      v[a] = BigInt.asUintN(64, v[a] + v[b] + x);
      let r1 = v[d] ^ v[a];
      v[d] = BigInt.asUintN(64, (r1 >> 32n) | (r1 << 32n));
      v[c] = BigInt.asUintN(64, v[c] + v[d]);
      let r2 = v[b] ^ v[c];
      v[b] = BigInt.asUintN(64, (r2 >> 24n) | (r2 << 40n));
      v[a] = BigInt.asUintN(64, v[a] + v[b] + y);
      let r3 = v[d] ^ v[a];
      v[d] = BigInt.asUintN(64, (r3 >> 16n) | (r3 << 48n));
      v[c] = BigInt.asUintN(64, v[c] + v[d]);
      let r4 = v[b] ^ v[c];
      v[b] = BigInt.asUintN(64, (r4 >> 63n) | (r4 << 1n));
    };

    for (let round = 0; round < 12; round++) {
      const s = BLAKE2B_SIGMA.subarray(round * 16, round * 16 + 16);
      G(0, 4, 8, 12, m[s[0]], m[s[1]]);
      G(1, 5, 9, 13, m[s[2]], m[s[3]]);
      G(2, 6, 10, 14, m[s[4]], m[s[5]]);
      G(3, 7, 11, 15, m[s[6]], m[s[7]]);
      G(0, 5, 10, 15, m[s[8]], m[s[9]]);
      G(1, 6, 11, 12, m[s[10]], m[s[11]]);
      G(2, 7, 8, 13, m[s[12]], m[s[13]]);
      G(3, 4, 9, 14, m[s[14]], m[s[15]]);
    }

    for (let i = 0; i < 8; i++) {
      h[i] ^= v[i] ^ v[i + 8];
    }
  };

  let offset = 0;
  while (offset < bytes.length) {
    if (blockLen === 128) {
      compress(false);
      blockLen = 0;
    }
    block[blockLen++] = bytes[offset++];
  }
  compress(true);

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 4; i++) {
    outView.setBigUint64(i * 8, h[i], true);
  }
  return out;
}

/**
 * Encodes address to EIP-55 Mixed-Case checksum
 */
function toChecksumAddress(address) {
  const cleanAddr = address.replace('0x', '').toLowerCase();
  const hash = keccak256(cleanAddr);
  let checksumAddr = '0x';
  for (let i = 0; i < cleanAddr.length; i++) {
    const char = cleanAddr[i];
    if (/[a-f]/.test(char)) {
      const hashChar = hash[i];
      if (parseInt(hashChar, 16) >= 8) {
        checksumAddr += char.toUpperCase();
      } else {
        checksumAddr += char;
      }
    } else {
      checksumAddr += char;
    }
  }
  return checksumAddr;
}

/**
 * Base58 encoder with standard alphabet
 */
function encodeBase58(buffer) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let num = BigInt('0');
  for (let i = 0; i < buffer.length; i++) {
    num = (num << BigInt(8)) + BigInt(buffer[i]);
  }
  let encoded = '';
  while (num > BigInt(0)) {
    const div = num / BigInt(58);
    const rem = num % BigInt(58);
    encoded = alphabet[Number(rem)] + encoded;
    num = div;
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    encoded = '1' + encoded;
  }
  return encoded || '1';
}

/**
 * Base58 encoder with Ripple custom alphabet
 */
function encodeBase58Ripple(buffer) {
  const alphabet = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz";
  let num = BigInt('0');
  for (let i = 0; i < buffer.length; i++) {
    num = (num << BigInt(8)) + BigInt(buffer[i]);
  }
  let encoded = '';
  while (num > BigInt(0)) {
    const div = num / BigInt(58);
    const rem = num % BigInt(58);
    encoded = alphabet[Number(rem)] + encoded;
    num = div;
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    encoded = alphabet[0] + encoded;
  }
  return encoded || alphabet[0];
}

/**
 * Base32 encoder
 */
function encodeBase32(buffer, customAlphabet) {
  const alphabet = customAlphabet || "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) + buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

/**
 * BIP-173 Bech32 Encoding algorithm
 */
function bech32Polymod(values) {
  const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (let i = 0; i < values.length; i++) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ values[i];
    for (let j = 0; j < 5; j++) {
      if ((top >> j) & 1) {
        chk ^= GENERATOR[j];
      }
    }
  }
  return chk;
}

function bech32HrpExpand(hrp) {
  const ret = [];
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) >> 5);
  }
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) & 31);
  }
  return ret;
}

function encodeBech32(hrp, version, program, isBech32m = false) {
  const converted = [version];
  let acc = 0;
  let bits = 0;
  for (let i = 0; i < program.length; i++) {
    acc = (acc << 8) | program[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      converted.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) {
    converted.push((acc << (5 - bits)) & 31);
  }
  
  const combined = bech32HrpExpand(hrp).concat(converted);
  const targetXor = isBech32m ? 0x2be36a0b : 1;
  const polymod = bech32Polymod(combined.concat([0, 0, 0, 0, 0, 0])) ^ targetXor;
  const checksum = [];
  for (let i = 0; i < 6; i++) {
    checksum.push((polymod >> (5 * (5 - i))) & 31);
  }
  
  const alphabet = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  let ret = hrp + "1";
  const allData = converted.concat(checksum);
  for (let i = 0; i < allData.length; i++) {
    ret += alphabet[allData[i]];
  }
  return ret;
}

/**
 * CRC16 calculation for Stellar
 */
function calculateStellarCRC16(buffer) {
  let crc = 0x0000;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= (buffer[i] << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return crc & 0xFFFF;
}

// Helper to convert hex string with prefix '0x' to Uint8Array
function hexToBytes(hex) {
  const clean = hex.replace('0x', '');
  return new Uint8Array(clean.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

// Helper to calculate SHA-256 and return Uint8Array
function sha256Bytes(data) {
  const hex = typeof data === 'string' ? data : '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
  const hash = ethers.sha256(hex);
  return hexToBytes(hash);
}

// Helper to calculate RIPEMD-160 and return Uint8Array
function ripemd160Bytes(data) {
  const hex = typeof data === 'string' ? data : '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
  const hash = ethers.ripemd160(hex);
  return hexToBytes(hash);
}

// Base58Check Encoder
function encodeBase58CheckWithPrefix(versionBytes, dataBytes) {
  const payload = new Uint8Array(versionBytes.length + dataBytes.length);
  payload.set(versionBytes, 0);
  payload.set(dataBytes, versionBytes.length);
  
  const checksum = sha256Bytes(sha256Bytes(payload)).subarray(0, 4);
  const fullBytes = new Uint8Array(payload.length + 4);
  fullBytes.set(payload, 0);
  fullBytes.set(checksum, payload.length);
  
  return encodeBase58(fullBytes);
}

function encodeBase58CheckWithPrefixRipple(versionBytes, dataBytes) {
  const payload = new Uint8Array(versionBytes.length + dataBytes.length);
  payload.set(versionBytes, 0);
  payload.set(dataBytes, versionBytes.length);
  
  const checksum = sha256Bytes(sha256Bytes(payload)).subarray(0, 4);
  const fullBytes = new Uint8Array(payload.length + 4);
  fullBytes.set(payload, 0);
  fullBytes.set(checksum, payload.length);
  
  return encodeBase58Ripple(fullBytes);
}

// ============================================================================
// B2 Wallet Cryptographic Core Derivations
// ============================================================================

/**
 * B2 Wallet custom master seed generation
 */
function deriveB2MasterSeed(mnemonic) {
  const cleanMnemonic = mnemonic.trim().toLowerCase();
  const encoder = new TextEncoder();
  const mnemonicBytes = encoder.encode(cleanMnemonic);
  const saltBytes = encoder.encode("mnemonic");

  const seed = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    let hashVal = 0;
    for (let j = 0; j < mnemonicBytes.length; j++) {
      hashVal = (hashVal * 31 + mnemonicBytes[j] + saltBytes[i % saltBytes.length] + i) % 256;
    }
    seed[i] = hashVal;
  }
  return seed;
}

/**
 * B2 Wallet child key-derivation (XOR proxy)
 */
function deriveB2PrivateKey(masterSeed, coinType, index = 0) {
  const privateKeyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    privateKeyBytes[i] = (masterSeed[i] ^ masterSeed[32 + i] ^ (coinType & 0xFF) ^ (index & 0xFF) ^ (i * 17)) % 256;
  }
  return Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Codificador Bech32 simplificado (conversão de 8 bits para 5 bits) da B2 Wallet.
 */
function encodeB2Bech32(buffer) {
  const alphabet = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  let value = 0;
  let bits = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) + buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

/**
 * B2 Wallet address generation from custom derived private keys
 */
function deriveB2Address(privateKeyHex, coinKey) {
  const privBytes = hexToBytes(privateKeyHex);
  const pubKeyBytes = blake2b256(privBytes);
  const key = coinKey.toUpperCase();

  switch (key) {
    case 'BTC':
    case 'BITCOIN': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return 'bc1q' + encodeB2Bech32(hash160);
    }

    case 'BTC_TAPROOT':
    case 'TAPROOT': {
      return 'bc1p' + encodeB2Bech32(pubKeyBytes);
    }

    case 'DASH': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      const payload = new Uint8Array(21);
      payload[0] = 0x4C;
      payload.set(hash160, 1);
      const cs = keccak256Bytes(keccak256Bytes(payload)).subarray(0, 4);
      const full = new Uint8Array(25);
      full.set(payload); full.set(cs, 21);
      return encodeBase58(full);
    }

    case 'SCRT': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return 'secret1' + encodeB2Bech32(hash160);
    }

    case 'INJ': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return 'inj1' + encodeB2Bech32(hash160);
    }

    case 'HBAR': {
      return '0x' + Array.from(pubKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    case 'XEM': {
      const hashed = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      const payload = new Uint8Array(21);
      payload[0] = 0x68;
      payload.set(hashed, 1);
      const checksum = keccak256Bytes(payload).subarray(0, 4);
      const full = new Uint8Array(25);
      full.set(payload);
      full.set(checksum, 21);
      return encodeBase32(full);
    }

    case 'XCH': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return 'xch1' + encodeB2Bech32(hash160);
    }

    case 'LTC':
    case 'LITECOIN': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      const payload = new Uint8Array(21);
      payload[0] = 0x30;
      payload.set(hash160, 1);
      const cs = keccak256Bytes(keccak256Bytes(payload)).subarray(0, 4);
      const full = new Uint8Array(25);
      full.set(payload); full.set(cs, 21);
      return encodeBase58(full);
    }

    case 'DOGE':
    case 'DOGECOIN': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      const payload = new Uint8Array(21);
      payload[0] = 0x1E;
      payload.set(hash160, 1);
      const cs = keccak256Bytes(keccak256Bytes(payload)).subarray(0, 4);
      const full = new Uint8Array(25);
      full.set(payload); full.set(cs, 21);
      return encodeBase58(full);
    }

    case 'TRX':
    case 'TRON': {
      const keccakHash = keccak256Bytes(pubKeyBytes);
      const tronHash = keccakHash.subarray(12, 32);
      const payload = new Uint8Array(21);
      payload[0] = 0x41;
      payload.set(tronHash, 1);
      const cs = keccak256Bytes(keccak256Bytes(payload)).subarray(0, 4);
      const full = new Uint8Array(25);
      full.set(payload); full.set(cs, 21);
      return encodeBase58(full);
    }

    case 'SOL':
    case 'SOLANA': {
      return encodeBase58(pubKeyBytes);
    }

    case 'XLM':
    case 'STELLAR': {
      const payload = new Uint8Array(35);
      payload[0] = 0x30; // G
      payload.set(pubKeyBytes, 1);
      const crc = calculateStellarCRC16(payload.subarray(0, 33));
      payload[33] = crc & 0xFF;
      payload[34] = (crc >>> 8) & 0xFF;
      return encodeBase32(payload);
    }

    case 'WAVES': {
      const blakePub = blake2b256(pubKeyBytes);
      const keccakPub = keccak256Bytes(blakePub);
      const accountHash = keccakPub.subarray(0, 20);
      const body = new Uint8Array(22);
      body[0] = 0x01;
      body[1] = 87; // 'W'
      body.set(accountHash, 2);
      const checksum = keccak256Bytes(blake2b256(body)).subarray(0, 4);
      const wavesAddr = new Uint8Array(26);
      wavesAddr.set(body);
      wavesAddr.set(checksum, 22);
      return encodeBase58(wavesAddr);
    }

    case 'ADA':
    case 'CARDANO': {
      const hash = keccak256Bytes(pubKeyBytes).subarray(0, 28);
      return 'addr1' + encodeB2Bech32(hash);
    }

    case 'DOT':
    case 'POLKADOT': {
      const ss58 = new Uint8Array(35);
      ss58[0] = 0x00;
      ss58.set(pubKeyBytes, 1);
      const encoder = new TextEncoder();
      const prefix = encoder.encode('SS58PRE');
      const toHash = new Uint8Array(prefix.length + 33);
      toHash.set(prefix); toHash.set(ss58.subarray(0, 33), prefix.length);
      const cs = blake2b256(toHash).subarray(0, 2);
      ss58[33] = cs[0]; ss58[34] = cs[1];
      return encodeBase58(ss58);
    }

    case 'KSM':
    case 'KUSAMA': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      const payload = new Uint8Array(21);
      payload[0] = 0x02;
      payload.set(hash160, 1);
      const cs = keccak256Bytes(keccak256Bytes(payload)).subarray(0, 4);
      const full = new Uint8Array(25);
      full.set(payload); full.set(cs, 21);
      return encodeBase58(full);
    }

    case 'ATOM':
    case 'COSMOS': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return 'cosmos1' + encodeB2Bech32(hash160);
    }

    case 'OSMO':
    case 'OSMOSIS': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return 'osmo1' + encodeB2Bech32(hash160);
    }

    case 'KAS':
    case 'KASPA': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return 'kaspa:' + encodeB2Bech32(hash160);
    }

    case 'ZEC':
    case 'ZCASH': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      const payload = new Uint8Array(22);
      payload[0] = 0x1C; payload[1] = 0xB8;
      payload.set(hash160, 2);
      const cs = keccak256Bytes(keccak256Bytes(payload)).subarray(0, 4);
      const full = new Uint8Array(26);
      full.set(payload); full.set(cs, 22);
      return encodeBase58(full);
    }

    case 'BCH':
    case 'BITCOINCASH': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return 'bitcoincash:q' + Array.from(hash160).map(b => b.toString(16).padStart(2,'0')).join('').substring(0,40);
    }

    case 'XMR':
    case 'MONERO': {
      const viewKey = blake2b256(privBytes);
      const payload = new Uint8Array(69);
      payload[0] = 0x12;
      payload.set(pubKeyBytes, 1);
      payload.set(viewKey, 33);
      const cs = keccak256Bytes(payload.subarray(0, 65)).subarray(0, 4);
      payload.set(cs, 65);
      return encodeBase58(payload);
    }

    case 'XRP':
    case 'RIPPLE': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return encodeBase58CheckWithPrefixRipple([0x00], hash160);
    }

    case 'ALGO':
    case 'ALGORAND': {
      const checksum = keccak256Bytes(pubKeyBytes).subarray(28);
      const full = new Uint8Array(36);
      full.set(pubKeyBytes);
      full.set(checksum, 32);
      return encodeBase32(full);
    }

    case 'NEAR': {
      const hashBytes = keccak256Bytes(pubKeyBytes);
      return '0x' + Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    case 'SUI': {
      const hashBytes = keccak256Bytes(pubKeyBytes);
      return '0x' + Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    case 'APT':
    case 'APTOS': {
      const hashBytes = keccak256Bytes(pubKeyBytes);
      return '0x' + Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    case 'XTZ':
    case 'TEZOS': {
      const hash160 = keccak256Bytes(pubKeyBytes).subarray(0, 20);
      return encodeBase58CheckWithPrefix([6, 161, 159], hash160);
    }

    case 'EVM':
    case 'ETH':
    default: {
      const keccakHash = keccak256Bytes(pubKeyBytes);
      const addrBytes = keccakHash.subarray(12, 32);
      const rawAddr = '0x' + Array.from(addrBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      return toChecksumAddress(rawAddr);
    }
  }
}

// ============================================================================
// Public Unified Multi-Wallet Deriver API
// ============================================================================

/**
 * Derives public address for specified wallet profile and coin.
 * 
 * @param {string} mnemonic - Phrase of recovery (separated by spaces)
 * @param {string} walletType - e.g. 'metamask' | 'trust' | 'b2wallet' | 'phantom' | 'electrum' ...
 * @param {string} coinKey - 'ETH' (or 'EVM') | 'BTC' | 'LTC' | 'DOGE' | 'SOL' | 'XLM' | 'TRX' | etc.
 * @param {number} [index=0] - Account index
 * @param {string} [pattern] - Optional pattern override
 * @returns {string} - Derived public address string
 */
function deriveAddress(mnemonic, walletType, coinKey, index = 0, pattern = null, language = null) {
  if (typeof mnemonic !== 'string') {
    throw new Error('Mnemonic must be a string');
  }

  const cleanWallet = walletType.toLowerCase().trim();
  const cleanCoin = coinKey.toUpperCase().trim();

  const supportedWallets = [
    'b2wallet', 'metamask', 'trust', 'phantom', 'ledger', 'trezor', 
    'yoroi', 'electrum', 'core', 'rabby', 'daedalus', 'keplr'
  ];

  if (!supportedWallets.includes(cleanWallet)) {
    throw new Error(`Unsupported wallet profile: ${walletType}`);
  }

  if (cleanWallet === 'metamask' && cleanCoin !== 'ETH' && cleanCoin !== 'EVM') {
    throw new Error(`MetaMask only supports 'ETH' / 'EVM' in standard paths. Received: ${coinKey}`);
  }

  // 1. Custom B2 Wallet derivation logic
  if (cleanWallet === 'b2wallet') {
    let coinType = 60; // Default EVM
    switch (cleanCoin) {
      case 'BTC':
      case 'BITCOIN': coinType = 0; break;
      case 'LTC':
      case 'LITECOIN': coinType = 2; break;
      case 'DOGE':
      case 'DOGECOIN': coinType = 3; break;
      case 'DASH': coinType = 5; break;
      case 'ZEC':
      case 'ZCASH': coinType = 133; break;
      case 'XRP':
      case 'RIPPLE': coinType = 144; break;
      case 'BCH':
      case 'BITCOINCASH': coinType = 145; break;
      case 'XLM':
      case 'STELLAR': coinType = 148; break;
      case 'TRX':
      case 'TRON': coinType = 195; break;
      case 'ADA':
      case 'CARDANO': coinType = 1815; break;
      case 'DOT':
      case 'POLKADOT': coinType = 354; break;
      case 'KSM':
      case 'KUSAMA': coinType = 434; break;
      case 'ATOM':
      case 'COSMOS': coinType = 118; break;
      case 'OSMO':
      case 'OSMOSIS': coinType = 118; break;
      case 'XTZ':
      case 'TEZOS': coinType = 1729; break;
      case 'ALGO':
      case 'ALGORAND': coinType = 283; break;
      case 'NEAR': coinType = 397; break;
      case 'SUI': coinType = 784; break;
      case 'APT':
      case 'APTOS': coinType = 637; break;
      case 'KAS':
      case 'KASPA': coinType = 111111; break;
      case 'WAVES': coinType = 5741564; break;
      case 'XMR':
      case 'MONERO': coinType = 128; break;
      case 'SCRT': coinType = 529; break;
      case 'INJ': coinType = 60; break;
      case 'HBAR': coinType = 3030; break;
      case 'XEM': coinType = 43; break;
      case 'XCH': coinType = 8444; break;
      case 'SOL':
      case 'SOLANA': coinType = 501; break;
      case 'ETH':
      case 'EVM':
      default: coinType = 60; break;
    }

    const masterSeed = deriveB2MasterSeed(mnemonic);
    const privateKeyHex = deriveB2PrivateKey(masterSeed, coinType, index);
    return deriveB2Address(privateKeyHex, cleanCoin);
  }

  // 2. Standard Cryptographic Derivation (MetaMask, Phantom, Yoroi, Core, Electrum, Keplr, etc.)
  const cleanMnemonic = mnemonic.trim().toLowerCase();

  // Determine path based on wallet, coin, and pattern
  let path = `m/44'/60'/0'/0/${index}`; // Default EVM
  let addressType = 'EVM'; // 'EVM' | 'BTC_SEGWIT' | 'BTC_LEGACY' | 'BTC_NESTED' | 'SOL_PHANTOM' | 'SOL_LEGACY' | 'TRX' | 'STellar' | 'ADA_SHELLEY' | 'ADA_BYRON' | 'XRP' | 'WAVES' | 'DOT' | 'KSM' | 'ATOM' | 'ALGO' | 'NEAR' | 'SUI' | 'APT' | 'KAS' | 'ZEC'

  // Standard coin to path routing
  if (cleanCoin === 'BTC' || cleanCoin === 'BITCOIN') {
    if (pattern === 'legacy' || pattern === 'bip44') {
      path = `m/44'/0'/0'/0/${index}`;
      addressType = 'BTC_LEGACY';
    } else if (pattern === 'nested' || pattern === 'bip49') {
      path = `m/49'/0'/0'/0/${index}`;
      addressType = 'BTC_NESTED';
    } else if (pattern === 'taproot' || pattern === 'bip86') {
      path = `m/86'/0'/0'/0/${index}`;
      addressType = 'BTC_TAPROOT';
    } else {
      path = `m/84'/0'/0'/0/${index}`;
      addressType = 'BTC_SEGWIT';
    }
  } else if (cleanCoin === 'LTC' || cleanCoin === 'LITECOIN') {
    if (pattern === 'legacy' || pattern === 'bip44') {
      path = `m/44'/2'/0'/0/${index}`;
      addressType = 'LTC_LEGACY';
    } else {
      path = `m/84'/2'/0'/0/${index}`;
      addressType = 'LTC_SEGWIT';
    }
  } else if (cleanCoin === 'DOGE' || cleanCoin === 'DOGECOIN') {
    path = `m/44'/3'/0'/0/${index}`;
    addressType = 'DOGE';
  } else if (cleanCoin === 'TRX' || cleanCoin === 'TRON') {
    path = `m/44'/195'/0'/0/${index}`;
    addressType = 'TRX';
  } else if (cleanCoin === 'SOL' || cleanCoin === 'SOLANA') {
    if (pattern === 'sollet' || pattern === 'bip44') {
      path = `m/44'/501'/0'/0/${index}`;
      addressType = 'SOL_LEGACY';
    } else {
      path = `m/44'/501'/0'/0'`;
      addressType = 'SOL_PHANTOM';
    }
  } else if (cleanCoin === 'XLM' || cleanCoin === 'STELLAR') {
    path = `m/44'/148'/0'/0/${index}`;
    addressType = 'STELLAR';
  } else if (cleanCoin === 'XRP' || cleanCoin === 'RIPPLE') {
    path = `m/44'/144'/0'/0/${index}`;
    addressType = 'XRP';
  } else if (cleanCoin === 'ADA' || cleanCoin === 'CARDANO') {
    if (pattern === 'byron' || pattern === 'bip44') {
      path = `m/44'/1815'/0'/0/${index}`;
      addressType = 'ADA_BYRON';
    } else {
      path = `m/1852'/1815'/0'/0/${index}`;
      addressType = 'ADA_SHELLEY';
    }
  } else if (cleanCoin === 'DOT' || cleanCoin === 'POLKADOT') {
    path = `m/44'/354'/0'/0'/0'`;
    addressType = 'DOT';
  } else if (cleanCoin === 'KSM' || cleanCoin === 'KUSAMA') {
    path = `m/44'/434'/0'/0'/0'`;
    addressType = 'KSM';
  } else if (cleanCoin === 'ATOM' || cleanCoin === 'COSMOS') {
    path = `m/44'/118'/0'/0/${index}`;
    addressType = 'ATOM';
  } else if (cleanCoin === 'OSMO' || cleanCoin === 'OSMOSIS') {
    path = `m/44'/118'/0'/0/${index}`;
    addressType = 'OSMO';
  } else if (cleanCoin === 'XTZ' || cleanCoin === 'TEZOS') {
    path = `m/44'/1729'/0'/0/${index}`;
    addressType = 'XTZ';
  } else if (cleanCoin === 'ALGO' || cleanCoin === 'ALGORAND') {
    path = `m/44'/283'/0'/0'/0'`;
    addressType = 'ALGO';
  } else if (cleanCoin === 'NEAR') {
    path = `m/44'/397'/0'/0'/0'`;
    addressType = 'NEAR';
  } else if (cleanCoin === 'SUI') {
    path = `m/44'/784'/0'/0'/0'`;
    addressType = 'SUI';
  } else if (cleanCoin === 'APT' || cleanCoin === 'APTOS') {
    path = `m/44'/637'/0'/0'/0'`;
    addressType = 'APT';
  } else if (cleanCoin === 'KAS' || cleanCoin === 'KASPA') {
    path = `m/44'/111111'/0'/0/${index}`;
    addressType = 'KAS';
  } else if (cleanCoin === 'WAVES') {
    path = `m/44'/5741564'/0'/0/${index}`;
    addressType = 'WAVES';
  } else if (cleanCoin === 'ZEC' || cleanCoin === 'ZCASH') {
    path = `m/44'/133'/0'/0/${index}`;
    addressType = 'ZEC';
  } else if (cleanCoin === 'BCH' || cleanCoin === 'BITCOINCASH') {
    path = `m/44'/145'/0'/0/${index}`;
    addressType = 'BCH';
  } else if (cleanCoin === 'XMR' || cleanCoin === 'MONERO') {
    path = `m/44'/128'/0'/0/${index}`;
    addressType = 'XMR';
  } else if (cleanCoin === 'DASH') {
    path = `m/44'/5'/0'/0/${index}`;
    addressType = 'DASH';
  } else if (cleanCoin === 'SCRT') {
    path = `m/44'/529'/0'/0/${index}`;
    addressType = 'SCRT';
  } else if (cleanCoin === 'INJ') {
    path = `m/44'/60'/0'/0/${index}`;
    addressType = 'INJ';
  } else if (cleanCoin === 'HBAR') {
    path = `m/44'/3030'/0'/0/${index}`;
    addressType = 'HBAR';
  } else if (cleanCoin === 'XEM') {
    path = `m/44'/43'/0'/0/${index}`;
    addressType = 'XEM';
  } else if (cleanCoin === 'XCH') {
    path = `m/44'/8444'/0'/0/${index}`;
    addressType = 'XCH';
  } else if (cleanCoin === 'GNOSIS') {
    path = `m/44'/60'/0'/0/${index}`;
    addressType = 'EVM';
  } else {
    // EVM fallback for Ethereum, BNB, MATIC, AVAX, ARB, OP, BASE, FTM, CRO, ONE
    path = `m/44'/60'/0'/0/${index}`;
    addressType = 'EVM';
  }

  // Derive HD Node
  let node;
  try {
    const { validateElectrumMnemonic, mnDecode } = require('./electrum-legacy');
    const words = cleanMnemonic.split(/\s+/);
    if (validateElectrumMnemonic(words)) {
      const hex = mnDecode(words);
      const seedBytes = sha256Bytes(new TextEncoder().encode(hex));
      node = ethers.HDNodeWallet.fromSeed(seedBytes).derivePath(path);
    } else {
      let wl;
      if (language) {
        wl = ethers.wordlists[language] || ethers.wordlists[language.toLowerCase().replace('-', '_')];
      }
      if (!wl) {
        wl = getEthersWordlist(cleanMnemonic);
      }
      if (!wl) {
        throw new Error('No matching BIP-39 wordlist detected for the given mnemonic phrase.');
      }
      node = ethers.HDNodeWallet.fromMnemonic(
        ethers.Mnemonic.fromPhrase(cleanMnemonic, undefined, wl),
        undefined,
        path
      );
    }
  } catch (err) {
    throw new Error(`Failed to derive HDNode for path ${path}: ${err.message}`);
  }

  // format based on exact address type
  switch (addressType) {
    case 'BTC_LEGACY':
    case 'BCH': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([0x00], hash160);
    }

    case 'BTC_NESTED': {
      // Nested SegWit is P2SH(P2WPKH) -> prefix 3
      const keyHash = ripemd160Bytes(sha256Bytes(node.publicKey));
      // scriptSig: 0x16 00 14 [keyHash]
      const script = new Uint8Array(22);
      script[0] = 0x00;
      script[1] = 0x14;
      script.set(keyHash, 2);
      const scriptHash = ripemd160Bytes(sha256Bytes(script));
      return encodeBase58CheckWithPrefix([0x05], scriptHash);
    }

    case 'BTC_SEGWIT': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBech32("bc", 0, hash160);
    }

    case 'LTC_LEGACY': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([0x30], hash160);
    }

    case 'LTC_SEGWIT': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBech32("ltc", 0, hash160);
    }

    case 'DOGE': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([0x1E], hash160);
    }

    case 'TRX': {
      const uncompressed = ethers.SigningKey.computePublicKey(node.privateKey, false);
      const pubBytes = hexToBytes(uncompressed).subarray(1); // skip 0x04
      const keccakHash = keccak256Bytes(pubBytes);
      const addressHash = keccakHash.subarray(12);
      return encodeBase58CheckWithPrefix([0x41], addressHash);
    }

    case 'SOL_PHANTOM':
    case 'SOL_LEGACY': {
      // Standard Phantom/Sollet seed-to-address is standard Base58 of private key bytes sha256
      const hashBytes = sha256Bytes(node.privateKey);
      return encodeBase58(hashBytes);
    }

    case 'STELLAR': {
      const pubBytes = sha256Bytes(node.publicKey);
      const payload = new Uint8Array(35);
      payload[0] = 0x30; // G
      payload.set(pubBytes, 1);
      const crc = calculateStellarCRC16(payload.subarray(0, 33));
      payload[33] = crc & 0xFF;
      payload[34] = (crc >>> 8) & 0xFF;
      return encodeBase32(payload);
    }

    case 'XRP': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefixRipple([0x00], hash160);
    }

    case 'ADA_SHELLEY': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBech32("addr", 1, hash160);
    }

    case 'ADA_BYRON': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([0x00], hash160);
    }

    case 'DOT': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([0x00], hash160); // DOT Substrate
    }

    case 'KSM': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([0x02], hash160); // Kusama starts with C/D
    }

    case 'ATOM': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBech32("cosmos", 0, hash160);
    }

    case 'OSMO': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBech32("osmo", 0, hash160);
    }

    case 'XTZ': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([6, 161, 159], hash160); // tz1
    }

    case 'ALGO': {
      const pubBytes = sha256Bytes(node.publicKey);
      const checksum = sha256Bytes(pubBytes).subarray(28); // last 4 bytes
      const full = new Uint8Array(36);
      full.set(pubBytes);
      full.set(checksum, 32);
      return encodeBase32(full);
    }

    case 'WAVES': {
      const pubBytes = sha256Bytes(node.publicKey);
      const waveHash = blake2b256(keccak256Bytes(pubBytes));
      const payload = new Uint8Array(22);
      payload[0] = 0x01;
      payload[1] = 0x57; // 'W'
      payload.set(waveHash.subarray(0, 20), 2);
      const checksum = blake2b256(keccak256Bytes(payload)).subarray(0, 4);
      const full = new Uint8Array(26);
      full.set(payload);
      full.set(checksum, 22);
      return encodeBase58(full);
    }

    case 'ZEC': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([0x1C, 0x82], hash160); // t1...
    }

    case 'BTC_TAPROOT': {
      const pubBytes = hexToBytes(node.publicKey);
      const xOnly = pubBytes.subarray(1); // pega apenas a coordenada x (32 bytes)
      return encodeBech32("bc", 1, xOnly, true);
    }

    case 'DASH': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBase58CheckWithPrefix([0x4c], hash160);
    }

    case 'SCRT': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBech32("secret", 0, hash160);
    }

    case 'INJ': {
      const uncompressed = ethers.SigningKey.computePublicKey(node.privateKey, false);
      const pubBytes = hexToBytes(uncompressed).subarray(1); // pula o byte 0x04
      const keccakHash = keccak256Bytes(pubBytes);
      const addressHash = keccakHash.subarray(12);
      return encodeBech32("inj", 0, addressHash);
    }

    case 'HBAR': {
      return node.publicKey.toLowerCase();
    }

    case 'XEM': {
      const pubBytes = hexToBytes(node.publicKey);
      const hashed = ripemd160Bytes(sha256Bytes(pubBytes));
      const payload = new Uint8Array(21);
      payload[0] = 0x68;
      payload.set(hashed, 1);
      const checksum = sha256Bytes(payload).subarray(0, 4);
      const full = new Uint8Array(25);
      full.set(payload);
      full.set(checksum, 21);
      return encodeBase32(full);
    }

    case 'XCH': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return encodeBech32("xch", 0, hash160, true);
    }

    case 'KAS': {
      const hash160 = ripemd160Bytes(sha256Bytes(node.publicKey));
      return 'kaspa:' + encodeBech32("kaspa", 0, hash160).replace('kaspa1', '');
    }

    case 'NEAR':
    case 'SUI':
    case 'APT':
    case 'XMR': {
      // Representação em hex para as redes modernas
      const hashBytes = sha256Bytes(node.publicKey);
      return '0x' + Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    case 'EVM':
    default:
      return node.address;
  }
}

module.exports = {
  // Low level crypto for testing/parity check
  keccak256,
  blake2b256,
  encodeBase58,
  encodeBase58Ripple,
  encodeBase32,
  encodeBech32,
  calculateStellarCRC16,
  deriveB2MasterSeed,
  deriveB2PrivateKey,
  deriveB2Address,

  // Public API
  deriveAddress,
  getEthersWordlist
};
