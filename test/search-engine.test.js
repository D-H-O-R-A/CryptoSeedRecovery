/**
 * CryptoSeedRecovery - Search Engine Module Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { bip39 } = require('../src/lib/wordlists');
const { 
  verifyCandidate, 
  searchMode1, 
  searchMode2And3, 
  searchMode4 
} = require('../src/lib/search-engine');

test('Search Engine Module', async (t) => {
  // A known valid BIP-39 mnemonic that derives standard EVM address 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
  const validMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  const targetAddress = "0x9858EfFD232B4033E47d90003D41EC34EcaEda94";
  const englishWords = bip39.en;

  await t.test('should verify valid candidates and reject invalid ones', () => {
    // Correct candidate and address
    assert.strictEqual(verifyCandidate(validMnemonic, 'bip39', 'metamask', 'ETH', targetAddress), true);

    // Incorrect address
    assert.strictEqual(verifyCandidate(validMnemonic, 'bip39', 'metamask', 'ETH', '0x1234567890123456789012345678901234567890'), false);

    // Invalid BIP-39 checksum
    const invalidChecksum = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";
    assert.strictEqual(verifyCandidate(invalidChecksum, 'bip39', 'metamask', 'ETH', targetAddress), false);
  });

  await t.test('should recover mnemonic using Mode 1 (Fixed Order + Wildcards)', () => {
    // We replace the last word 'about' with a wildcard prefix 'abo*'
    const pattern = [
      "abandon", "abandon", "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "abandon", "abandon", "abo*"
    ];

    const result = searchMode1(pattern, 'bip39', englishWords, 'metamask', 'ETH', targetAddress);
    
    assert.strictEqual(result.results.length, 1);
    assert.strictEqual(result.results[0], validMnemonic);
    // Since only 'abo*' was expanded, it should only check words starting with 'abo' (about, above, absorb, etc.)
    assert.ok(result.totalChecked > 0n && result.totalChecked < 20n);
  });

  await t.test('should recover mnemonic using Mode 2 & 3 (Backtracking Shuffled Words)', () => {
    // We shuffle 3 words of the mnemonic: positions 9, 10, 11 (abandon, abandon, about)
    // Floating pool: 'abandon', 'abandon', 'about'
    // Let's set up the suppliedWords array with the exact words but with some out of order
    const supplied = [
      "abandon", "abandon", "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "about", "abandon", "abandon"
    ];

    // Constrain first 9 words to make search space extremely small (3! = 6)
    const constraints = {};
    for (let i = 0; i < 9; i++) {
      constraints[i] = { requiredWord: "abandon", excludedWords: [] };
    }

    const result = searchMode2And3(supplied, constraints, 'bip39', englishWords, 'metamask', 'ETH', targetAddress);
    
    assert.strictEqual(result.results.length >= 1, true);
    assert.ok(result.results.includes(validMnemonic));
  });

  await t.test('should apply early branch pruning constraints in Mode 2 & 3', () => {
    const supplied = [
      "abandon", "abandon", "abandon", "abandon", "abandon", "abandon",
      "abandon", "abandon", "abandon", "about", "abandon", "abandon"
    ];

    // Constrain first 9 positions to make search space extremely small (3! = 6)
    const constraints = {};
    for (let i = 0; i < 9; i++) {
      constraints[i] = { requiredWord: "abandon", excludedWords: [] };
    }
    // Constraint: slot 11 (0-indexed) MUST be "about"
    constraints[11] = {
      requiredWord: "about",
      excludedWords: []
    };

    const result = searchMode2And3(supplied, constraints, 'bip39', englishWords, 'metamask', 'ETH', targetAddress);
    
    assert.strictEqual(result.results.length >= 1, true);
    assert.ok(result.results.includes(validMnemonic));
  });

  await t.test('should correctly run Mode 4 (Full Descrambler) with Heap\'s algorithm', () => {
    // We pass a 3-word array to Mode 4.
    // It should generate exactly 3! = 6 permutations.
    // Since 3-word combinations are invalid BIP-39, total checked will be 6 and results will be empty, completing instantly.
    const result = searchMode4(["word1", "word2", "word3"], 'bip39', 'metamask', 'ETH', targetAddress);
    
    assert.strictEqual(result.totalChecked, 6n);
    assert.strictEqual(result.results.length, 0);
  });
});
