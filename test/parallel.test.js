/**
 * CryptoSeedRecovery - Parallel Search and Optional Address Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { bip39 } = require('../src/lib/wordlists');
const { 
  searchMode1, 
  searchMode2And3, 
  searchMode4,
  getMode1Prefixes,
  getMode23PartialStates,
  getMode4PartialStates
} = require('../src/lib/search-engine');

test('Parallel Search and Optional Target Address', async (t) => {
  const englishWords = bip39.en;
  // A known valid BIP-39 mnemonic
  const validMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  await t.test('should run searchMode1 with empty/falsy targetAddress and collect valid checksum seeds', () => {
    // We replace the last word 'about' with a wildcard prefix 'abo*'
    const pattern = [
      "abandon", "abandon", "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "abandon", "abandon", "abo*"
    ];

    // No targetAddress specified
    const result = searchMode1(pattern, 'bip39', englishWords, 'metamask', 'ETH', '', null);
    
    assert.strictEqual(result.results.length, 1);
    assert.strictEqual(result.results[0], validMnemonic);
    assert.strictEqual(result.assembledCandidates.length, 1);
    assert.strictEqual(result.assembledCandidates[0].phrase, validMnemonic);
    assert.strictEqual(result.assembledCandidates[0].address, "0x9858EfFD232B4033E47d90003D41EC34EcaEda94");
  });

  await t.test('should run searchMode2And3 with empty/falsy targetAddress and collect valid checksum seeds', () => {
    const supplied = [
      "abandon", "abandon", "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "about", "abandon", "abandon"
    ];

    // Constrain first 9 words to make search space extremely small (3! = 6)
    const constraints = {};
    for (let i = 0; i < 9; i++) {
      constraints[i] = { requiredWord: "abandon", excludedWords: [] };
    }

    // No targetAddress specified
    const result = searchMode2And3(supplied, constraints, 'bip39', englishWords, 'metamask', 'ETH', '', null);
    
    assert.strictEqual(result.results.length >= 1, true);
    assert.ok(result.results.includes(validMnemonic));
    assert.ok(result.assembledCandidates.some(c => c.phrase === validMnemonic));
  });

  await t.test('should split Mode 1 tasks correctly using getMode1Prefixes', () => {
    const pattern = [
      "abandon", "abandon", "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "abandon", "abandon", "abo*"
    ];

    // We ask to split for 4 threads
    const prefixes = getMode1Prefixes(pattern, 'bip39', englishWords, 'ETH', 4);
    
    // There are about 8 words starting with "abo" in BIP39 (words like about, above, absorb, etc.)
    // It should generate at least 4 prefixes or separate paths to execute
    assert.ok(prefixes.length >= 1);
    assert.ok(Array.isArray(prefixes[0]));
  });

  await t.test('should split Mode 2/3 tasks correctly using getMode23PartialStates', () => {
    const supplied = [
      "abandon", "abandon", "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "about", "abandon", "abandon"
    ];

    const constraints = {};
    for (let i = 0; i < 9; i++) {
      constraints[i] = { requiredWord: "abandon", excludedWords: [] };
    }

    const states = getMode23PartialStates(supplied, constraints, 'bip39', englishWords, 'ETH', 4);
    
    assert.ok(states.length >= 1);
    assert.ok(states[0].assignment);
    assert.ok(states[0].usedWords);
  });

  await t.test('should split Mode 4 tasks correctly using getMode4PartialStates', () => {
    const words = ["abandon", "abandon", "about"];
    const states = getMode4PartialStates(words, 4);
    
    assert.ok(states.length >= 1);
    assert.ok(states[0].prefix);
    assert.ok(states[0].usedIndices);
  });
});
