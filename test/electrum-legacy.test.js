/**
 * CryptoSeedRecovery - Electrum Legacy Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { validateElectrumMnemonic, mnEncode, mnDecode } = require('../src/lib/electrum-legacy');
const { electrumPoet } = require('../src/lib/wordlists');

test('Electrum Legacy Module', async (t) => {
  await t.test('should validate legacy Electrum mnemonics', () => {
    // 12-word mnemonic made of valid poet words
    const validMnemonic = [
      "like", "just", "love", "know", "never", "want", 
      "time", "out", "there", "make", "look", "eye"
    ];
    assert.strictEqual(validateElectrumMnemonic(validMnemonic), true);

    // Too short
    const invalidShort = ["like", "just", "love"];
    assert.strictEqual(validateElectrumMnemonic(invalidShort), false);

    // Not divisible by 3
    const invalidLength = [
      "like", "just", "love", "know", "never", "want", 
      "time", "out", "there", "make", "look", "eye", "down"
    ];
    assert.strictEqual(validateElectrumMnemonic(invalidLength), false);

    // Word not in poetic list
    const invalidWords = [
      "like", "just", "love", "know", "never", "want", 
      "time", "out", "there", "make", "look", "not_a_poet_word"
    ];
    assert.strictEqual(validateElectrumMnemonic(invalidWords), false);
  });

  await t.test('should perform correct mnEncode and mnDecode roundtrip', () => {
    const originalHex = '0123456789abcdef0123456789abcdef';
    
    // Encode to poetic words
    const words = mnEncode(originalHex);
    assert.strictEqual(words.length, 12);
    
    // Every word must be in the poet dictionary
    words.forEach(w => {
      assert.ok(electrumPoet.includes(w.toLowerCase()));
    });

    // Decode back to hex
    const decodedHex = mnDecode(words);
    assert.strictEqual(decodedHex, originalHex);
  });

  await t.test('should fail mnEncode with invalid hex inputs', () => {
    // Non-hex characters
    assert.throws(() => mnEncode('0123456789abcdeg0123456789abcdef'), /Expected hex string/);
    
    // Incorrect length (not multiple of 8)
    assert.throws(() => mnEncode('0123456'), /Hex length must be a multiple of 8/);
  });

  await t.test('should fail mnDecode with invalid wordlist lengths or unknown words', () => {
    assert.throws(() => mnDecode(["like", "just"]), /Wordlist length must be a multiple of 3/);
    assert.throws(() => mnDecode(["like", "just", "not_a_poet_word"]), /not found in poetic dictionary/);
  });
});
