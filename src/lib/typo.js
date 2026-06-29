/**
 * CryptoSeedRecovery - Spelling Correction and Suggestion Module
 * Uses QWERTY keyboard adjacency, Levenshtein distance, and edit transpositions.
 */

// QWERTY keyboard adjacency mapping for adjacent-key typos
const KEYBOARD_ADJACENCY = {
  'q': 'wa', 'w': 'qeas', 'e': 'wrds', 'r': 'etfg', 't': 'rygh', 'y': 'tuhj', 'u': 'yijk', 'i': 'uokl', 'o': 'ipl', 'p': 'o',
  'a': 'qwsz', 's': 'wedaxz', 'd': 'erfcsx', 'f': 'rtgvcd', 'g': 'tyhbvf', 'h': 'yujnbg', 'j': 'uikmnh', 'k': 'ijlm', 'l': 'kop',
  'z': 'asx', 'x': 'zsdc', 'c': 'xdfv', 'v': 'cfgb', 'b': 'vghn', 'n': 'bhjm', 'm': 'njk'
};

/**
 * Computes the Levenshtein distance between two strings.
 * @param {string} s1 
 * @param {string} s2 
 * @returns {number}
 */
function levenshtein(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1) return s2.length;
  if (!s2) return s1.length;

  let prevRow = Array(s2.length + 1);
  let currRow = Array(s2.length + 1);

  for (let j = 0; j <= s2.length; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    currRow[0] = i;
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,        // Deletion
        currRow[j - 1] + 1,    // Insertion
        prevRow[j - 1] + cost  // Substitution
      );
    }
    prevRow = [...currRow];
  }
  return prevRow[s2.length];
}

/**
 * Generates spelling mutations with edit distance 1.
 * @param {string} word 
 * @returns {string[]} - List of mutated words
 */
function generateMutations(word) {
  const mutations = new Set();
  const chars = word.split('');

  // 1. Transpositions (swap adjacent characters)
  for (let i = 0; i < chars.length - 1; i++) {
    const nextChars = [...chars];
    const temp = nextChars[i];
    nextChars[i] = nextChars[i + 1];
    nextChars[i + 1] = temp;
    mutations.add(nextChars.join(''));
  }

  // 2. Keyboard adjacent replacements
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const adj = KEYBOARD_ADJACENCY[char];
    if (adj) {
      for (let j = 0; j < adj.length; j++) {
        const nextChars = [...chars];
        nextChars[i] = adj[j];
        mutations.add(nextChars.join(''));
      }
    }
  }

  // 3. Deletions
  for (let i = 0; i < chars.length; i++) {
    const nextChars = [...chars];
    nextChars.splice(i, 1);
    mutations.add(nextChars.join(''));
  }

  // 4. Double-character reductions (e.g. "committ" -> "commit")
  for (let i = 0; i < chars.length - 1; i++) {
    if (chars[i] === chars[i + 1]) {
      const nextChars = [...chars];
      nextChars.splice(i, 1);
      mutations.add(nextChars.join(''));
    }
  }

  return Array.from(mutations);
}

/**
 * Returns a list of ranked spelling suggestions for a given input word.
 * @param {string} inputWord 
 * @param {string[]} wordlist 
 * @param {number} maxResults 
 * @returns {string[]}
 */
function getSuggestions(inputWord, wordlist, maxResults = 5) {
  if (typeof inputWord !== 'string') return [];
  const cleanWord = inputWord.toLowerCase().trim();
  if (cleanWord.length === 0) return [];

  // If the word is already in the list, no suggestions needed
  if (wordlist.includes(cleanWord)) {
    return [cleanWord];
  }

  const results = new Set();

  // Step 1: Check generated direct edit distance 1 mutations (very fast)
  const mutations = generateMutations(cleanWord);
  for (const mut of mutations) {
    if (wordlist.includes(mut)) {
      results.add(mut);
    }
  }

  // Step 2: Fallback to full Levenshtein and prefix matching if we need more results
  if (results.size < maxResults) {
    const candidates = [];
    for (const dictWord of wordlist) {
      // Exclude words that are too far in length to optimize
      if (Math.abs(dictWord.length - cleanWord.length) > 2) continue;

      const dist = levenshtein(cleanWord, dictWord);
      if (dist <= 2) {
        let score = dist * 10;
        // Reward prefix match (often typos happen at the end)
        if (dictWord.startsWith(cleanWord.substring(0, 3))) {
          score -= 3;
        }
        candidates.push({ word: dictWord, score });
      }
    }

    // Sort candidates by score ascending (lowest score is best)
    candidates.sort((a, b) => a.score - b.score);

    for (const cand of candidates) {
      results.add(cand.word);
      if (results.size >= maxResults) break;
    }
  }

  return Array.from(results).slice(0, maxResults);
}

/**
 * Prefix-based fallback search (comer por letras)
 * Increments prefix characters from left to right until there are no matches,
 * then returns the matching words starting with the last successful prefix.
 * If no letters match, returns empty array.
 * @param {string} inputWord 
 * @param {string[]} wordlist 
 * @returns {string[]}
 */
function getPrefixSuggestions(inputWord, wordlist) {
  if (typeof inputWord !== 'string') return [];
  const cleanWord = inputWord.toLowerCase().trim();
  if (cleanWord.length === 0) return [];

  let lastMatches = [];

  for (let i = 1; i <= cleanWord.length; i++) {
    const prefix = cleanWord.substring(0, i);
    const matches = wordlist.filter(w => w.startsWith(prefix));
    if (matches.length > 0) {
      lastMatches = matches;
    } else {
      break;
    }
  }

  return lastMatches;
}

module.exports = {
  levenshtein,
  generateMutations,
  getSuggestions,
  getPrefixSuggestions
};
