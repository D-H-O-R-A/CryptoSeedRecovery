/**
 * CryptoSeedRecovery - Typo Module Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { levenshtein, generateMutations, getSuggestions, getPrefixSuggestions } = require('../src/lib/typo');

test('Typo Correction Module', async (t) => {
  await t.test('should calculate correct Levenshtein distance', () => {
    assert.strictEqual(levenshtein('test', 'test'), 0);
    assert.strictEqual(levenshtein('test', 'text'), 1);
    assert.strictEqual(levenshtein('kitten', 'sitting'), 3);
    assert.strictEqual(levenshtein('', 'hello'), 5);
    assert.strictEqual(levenshtein('world', ''), 5);
  });

  await t.test('should generate expected edit-distance 1 mutations', () => {
    const mutations = generateMutations('the');
    
    // Transposition 'the' -> 'teh'
    assert.ok(mutations.includes('teh'));
    
    // Deletion 'the' -> 'he', 'te', 'th'
    assert.ok(mutations.includes('he'));
    assert.ok(mutations.includes('te'));
    assert.ok(mutations.includes('th'));

    // Keyboard adjacent replacement on 't' (adjacent keys: 'r', 'y', 'g', 'h')
    assert.ok(mutations.includes('rhe') || mutations.includes('ghe'));

    // Double character reduction (e.g. 'committ' -> 'commit')
    const doubleMutations = generateMutations('committ');
    assert.ok(doubleMutations.includes('commit'));
  });

  await t.test('should return correct ranked suggestions from a wordlist', () => {
    const mockWordlist = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb'];

    // Word is already in list
    const exactMatch = getSuggestions('abandon', mockWordlist);
    assert.deepStrictEqual(exactMatch, ['abandon']);

    // edit distance 1 (direct mutation)
    const suggestions1 = getSuggestions('abandn', mockWordlist); // deleted 'o'
    assert.ok(suggestions1.includes('abandon'));

    // edit distance 2 (fallback Levenshtein + prefix reward)
    const suggestions2 = getSuggestions('abovv', mockWordlist); // double adjacent or spelling mistake
    assert.ok(suggestions2.includes('above'));

    // Returns empty array for empty inputs or non-string inputs
    assert.deepStrictEqual(getSuggestions('', mockWordlist), []);
    assert.deepStrictEqual(getSuggestions(123, mockWordlist), []);
  });

  await t.test('should correctly perform prefix-based fallback searching (comer por letras)', () => {
    const mockWordlist = ['cabin', 'engine', 'harvest', 'fiction', 'witness'];

    // 'engino' should match prefix 'engin' which leads to 'engine'
    const match1 = getPrefixSuggestions('engino', mockWordlist);
    assert.deepStrictEqual(match1, ['engine']);

    // 'cab' should match prefix 'cab' which leads to 'cabin'
    const match2 = getPrefixSuggestions('cab', mockWordlist);
    assert.deepStrictEqual(match2, ['cabin']);

    // 'xxxxx' should match nothing and return empty array
    const match3 = getPrefixSuggestions('xxxxx', mockWordlist);
    assert.deepStrictEqual(match3, []);

    // edge cases
    assert.deepStrictEqual(getPrefixSuggestions('', mockWordlist), []);
    assert.deepStrictEqual(getPrefixSuggestions(null, mockWordlist), []);
  });
});
