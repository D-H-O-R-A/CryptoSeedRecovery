/**
 * CryptoSeedRecovery - Core Recovery Search Engine
 * Implements the 4 distinct search modes with optimized constraint backtracking and early pruning.
 */

const { ethers } = require('ethers');
const { 
  validateElectrumMnemonic, 
  mnDecode,
  validateMoneroMnemonic,
  validateAlgorandMnemonic,
  validateCardanoByronMnemonic
} = require('./electrum-legacy');
const { deriveAddress, getEthersWordlist } = require('./address-deriver');

// Helper to calculate factorial for Mode 4 progress estimates
function factorial(n) {
  let res = 1n;
  for (let i = 2n; i <= BigInt(n); i++) {
    res *= i;
  }
  return res;
}

/**
 * Validates any candidate mnemonic phrase based on coinKey and format.
 * Utilizes specialized validation functions to support non-standard BIP-39 counts.
 * 
 * @param {string} phrase - Candidate phrase
 * @param {string} format - 'bip39' | 'electrum'
 * @param {string} coinKey - Currency code
 * @returns {boolean}
 */
function isValidPhrase(phrase, format, coinKey, language = null) {
  const cleanPhrase = phrase.trim().toLowerCase();
  const words = cleanPhrase.split(/\s+/);
  
  if (format === 'electrum') {
    return validateElectrumMnemonic(words);
  }
  
  if (format === 'bip39') {
    const cleanCoin = coinKey.toUpperCase().trim();
    if (cleanCoin === 'XMR' || cleanCoin === 'MONERO') {
      return validateMoneroMnemonic(words);
    }
    if (cleanCoin === 'ALGO' || cleanCoin === 'ALGORAND') {
      return validateAlgorandMnemonic(words);
    }
    if ((cleanCoin === 'ADA' || cleanCoin === 'CARDANO') && words.length === 22) {
      return validateCardanoByronMnemonic(words);
    }
    // Standard BIP-39 validation
    let wl = null;
    if (language) {
      wl = ethers.wordlists[language] || ethers.wordlists[language.toLowerCase().replace('-', '_')];
    }
    if (!wl) {
      wl = getEthersWordlist(cleanPhrase);
    }
    if (!wl) {
      return false;
    }
    try {
      return ethers.Mnemonic.isValidMnemonic(cleanPhrase, wl);
    } catch (e) {
      return false;
    }
  }
  
  return false;
}

/**
 * Verifies if a candidate mnemonic is valid and derives the correct target public address.
 * 
 * @param {string} phrase - Candidate seed phrase (words separated by space)
 * @param {string} format - 'bip39' | 'electrum'
 * @param {string} walletType - 'metamask' | 'trust' | 'b2wallet'
 * @param {string} coinKey - 'ETH' (or 'EVM') | 'BTC' | 'LTC' | 'DOGE' | 'SOL' | 'XLM' | 'TRX'
 * @param {string} targetAddress - The public address we are looking for (optional)
 * @returns {boolean} - True if it matches exactly
 */
function verifyCandidate(phrase, format, walletType, coinKey, targetAddress, pattern = null, language = null) {
  const cleanPhrase = phrase.trim().toLowerCase();
  const cleanTarget = targetAddress ? targetAddress.trim().toLowerCase() : '';

  // 1. Unified fast path check (validates BIP-39, Electrum, Monero, Algorand, or Cardano paper seeds)
  if (!isValidPhrase(cleanPhrase, format, coinKey, language)) {
    return false;
  }

  // 2. Perform address derivation
  try {
    const derivedAddr = deriveAddress(cleanPhrase, walletType, coinKey, 0, pattern, language);
    return !cleanTarget || derivedAddr.toLowerCase() === cleanTarget;
  } catch (err) {
    return false; // Under incorrect path combinations or invalid sementes
  }
}

/**
 * MODE 1: Fixed Order + Wildcards
 * Expands in-place wildcards (e.g. 'bo*', '*') using product of matched words.
 */
function searchMode1(patternList, format, wordlist, walletType, coinKey, targetAddress, onProgress, pattern = null, startPrefixes = null, language = null) {
  const results = [];
  const assembledCandidates = [];
  const cleanTarget = targetAddress ? targetAddress.trim().toLowerCase() : '';

  // Match possible dictionary words for each slot
  const slots = patternList.map(pat => {
    const clean = pat.toLowerCase().trim();
    if (clean.includes(',')) {
      return clean.split(',').map(s => s.trim()).filter(Boolean);
    } else if (clean === '*' || clean === '?') {
      return wordlist;
    } else if (clean.endsWith('*')) {
      const prefix = clean.slice(0, -1);
      return wordlist.filter(w => w.startsWith(prefix));
    } else {
      return [clean];
    }
  });

  const totalCombinations = slots.reduce((acc, slot) => acc * BigInt(slot.length), 1n);
  let checkedCount = 0n;

  function backtrack(idx, currentWords) {
    if (idx === slots.length) {
      checkedCount++;
      if (onProgress && checkedCount % 1000n === 0n) {
        onProgress(checkedCount, totalCombinations);
      }
      const candidate = currentWords.join(' ');
      
      const isValid = isValidPhrase(candidate, format, coinKey, language);

      if (isValid) {
        try {
          const derivedAddr = deriveAddress(candidate, walletType, coinKey, 0, pattern, language);
          if (assembledCandidates.length < 50000) {
            assembledCandidates.push({ phrase: candidate, address: derivedAddr });
          }
          if (!cleanTarget || derivedAddr.toLowerCase() === cleanTarget) {
            if (results.length < 50000) {
              results.push(candidate);
            }
          }
        } catch (err) {
          // derivation fail
        }
      }
      return;
    }

    const candidates = slots[idx];
    for (let i = 0; i < candidates.length; i++) {
      currentWords.push(candidates[i]);
      backtrack(idx + 1, currentWords);
      currentWords.pop();
    }
  }

  if (startPrefixes && startPrefixes.length > 0) {
    for (const pref of startPrefixes) {
      backtrack(pref.length, [...pref]);
    }
  } else {
    backtrack(0, []);
  }

  return { results, totalChecked: checkedCount, assembledCandidates };
}

/**
 * MODES 2 & 3: Shuffled Words with or without Wildcards (Backtracking Solver)
 * Finds placements of suppliedWords in the correct positions.
 */
function searchMode2And3(suppliedWords, constraints, format, wordlist, walletType, coinKey, targetAddress, onProgress, pattern = null, startStates = null, language = null) {
  const results = [];
  const assembledCandidates = [];
  const cleanTarget = targetAddress ? targetAddress.trim().toLowerCase() : '';
  const seedSize = suppliedWords.length; // e.g. 12 or 24
  const assignment = Array(seedSize).fill(null);
  
  // Exclude fixed/required slot words from the floating pool
  const fixedPositions = {};
  const activeConstraints = constraints || {};
  
  for (let idx = 0; idx < seedSize; idx++) {
    if (activeConstraints[idx] && activeConstraints[idx].requiredWord) {
      assignment[idx] = activeConstraints[idx].requiredWord.toLowerCase().trim();
      fixedPositions[idx] = true;
    }
  }

  // Words that are not fixed and must be assigned
  // Since the suppliedWords is shuffled, we copy it and remove the required/fixed words
  const floatingWords = suppliedWords.map(w => w.toLowerCase().trim());
  for (let idx = 0; idx < seedSize; idx++) {
    if (fixedPositions[idx]) {
      const fixedWord = assignment[idx];
      const matchIdx = floatingWords.indexOf(fixedWord);
      if (matchIdx !== -1) {
        floatingWords.splice(matchIdx, 1);
      }
    }
  }
  const floatingPositions = [];
  for (let i = 0; i < seedSize; i++) {
    if (!fixedPositions[i]) {
      floatingPositions.push(i);
    }
  }

  // Pre-expand wildcards inside the floating words if any
  const expandedFloatingPools = floatingWords.map(word => {
    const clean = word.toLowerCase().trim();
    if (clean.includes(',')) {
      return clean.split(',').map(s => s.trim()).filter(Boolean);
    } else if (clean === '*' || clean === '?') {
      return wordlist;
    } else if (clean.endsWith('*')) {
      const prefix = clean.slice(0, -1);
      return wordlist.filter(w => w.startsWith(prefix));
    } else {
      return [clean];
    }
  });

  // Calculate approximate total search space
  let totalCombinations = 1n;
  let remainingWordsCount = expandedFloatingPools.length;
  for (let i = 0; i < expandedFloatingPools.length; i++) {
    totalCombinations *= BigInt(expandedFloatingPools[i].length) * BigInt(remainingWordsCount);
    remainingWordsCount--;
  }

  let checkedCount = 0n;
  const usedWords = Array(expandedFloatingPools.length).fill(false);

  function backtrack(posIdx) {
    if (posIdx === floatingPositions.length) {
      checkedCount++;
      if (onProgress && checkedCount % 1000n === 0n) {
        onProgress(checkedCount, totalCombinations);
      }
      const candidate = assignment.join(' ');
      
      const isValid = isValidPhrase(candidate, format, coinKey, language);

      if (isValid) {
        try {
          const derivedAddr = deriveAddress(candidate, walletType, coinKey, 0, pattern, language);
          if (assembledCandidates.length < 50000) {
            assembledCandidates.push({ phrase: candidate, address: derivedAddr });
          }
          if (!cleanTarget || derivedAddr.toLowerCase() === cleanTarget) {
            if (results.length < 50000) {
              results.push(candidate);
            }
          }
        } catch (err) {
          // derivation fail
        }
      }
      return;
    }

    const currentSlot = floatingPositions[posIdx];
    const slotConstraint = activeConstraints[currentSlot];

    // For this slot, try placing any of the unused floating words
    for (let wordIdx = 0; wordIdx < expandedFloatingPools.length; wordIdx++) {
      if (usedWords[wordIdx]) continue;

      const candidates = expandedFloatingPools[wordIdx];
      for (let cIdx = 0; candidates.length > cIdx; cIdx++) {
        const candidateWord = candidates[cIdx];

        // --- Early Branch Pruning Constraint Check ---
        if (slotConstraint) {
          // If word is excluded from this slot (NOK constraint), skip recursive branch entirely!
          if (slotConstraint.excludedWords && slotConstraint.excludedWords.includes(candidateWord)) {
            continue;
          }
        }

        assignment[currentSlot] = candidateWord;
        usedWords[wordIdx] = true;

        backtrack(posIdx + 1);

        usedWords[wordIdx] = false;
        assignment[currentSlot] = null;
      }
    }
  }

  if (startStates && startStates.length > 0) {
    for (const state of startStates) {
      for (let i = 0; i < seedSize; i++) {
        assignment[i] = state.assignment[i];
      }
      for (let i = 0; i < usedWords.length; i++) {
        usedWords[i] = state.usedWords[i];
      }
      backtrack(state.posIdx);
    }
  } else {
    backtrack(0);
  }

  return { results, totalChecked: checkedCount, assembledCandidates };
}

/**
 * MODE 4: Full Descrambler
 * Tests all possible arrangements of a list of completely spelled scrambled words.
 */
function searchMode4(scrambledWords, format, walletType, coinKey, targetAddress, onProgress, pattern = null, startStates = null, language = null) {
  const results = [];
  const assembledCandidates = [];
  const cleanTarget = targetAddress ? targetAddress.trim().toLowerCase() : '';
  const words = scrambledWords.map(w => w.toLowerCase().trim());
  const n = words.length;

  const totalPermutations = factorial(n);
  let checkedCount = 0n;

  function testCandidate(arr) {
    checkedCount++;
    if (onProgress && checkedCount % 1000n === 0n) {
      onProgress(checkedCount, totalPermutations);
    }
    const candidate = arr.join(' ');
    
    const isValid = isValidPhrase(candidate, format, coinKey, language);

    if (isValid) {
      try {
        const derivedAddr = deriveAddress(candidate, walletType, coinKey, 0, pattern, language);
        if (assembledCandidates.length < 50000) {
          assembledCandidates.push({ phrase: candidate, address: derivedAddr });
        }
        if (!cleanTarget || derivedAddr.toLowerCase() === cleanTarget) {
          if (results.length < 50000) {
            results.push(candidate);
          }
        }
      } catch (err) {
        // derivation fail
      }
    }
  }

  // Backtracking-based permutation for starting states
  function backtrackPermute(prefix, usedIndices) {
    if (prefix.length === n) {
      testCandidate(prefix);
      return;
    }
    for (let i = 0; i < n; i++) {
      if (usedIndices[i]) continue;
      usedIndices[i] = true;
      prefix.push(words[i]);
      backtrackPermute(prefix, usedIndices);
      prefix.pop();
      usedIndices[i] = false;
    }
  }

  if (startStates && startStates.length > 0) {
    for (const state of startStates) {
      backtrackPermute([...state.prefix], [...state.usedIndices]);
    }
  } else {
    // Heap's algorithm for generating permutations in-place
    const arrCopy = [...words];
    testCandidate(arrCopy);

    const c = Array(n).fill(0);
    let i = 0;

    while (i < n) {
      if (c[i] < i) {
        if (i % 2 === 0) {
          const temp = arrCopy[0];
          arrCopy[0] = arrCopy[i];
          arrCopy[i] = temp;
        } else {
          const temp = arrCopy[c[i]];
          arrCopy[c[i]] = arrCopy[i];
          arrCopy[i] = temp;
        }
        testCandidate(arrCopy);
        c[i]++;
        i = 0;
      } else {
        c[i] = 0;
        i++;
      }
    }
  }

  return { results, totalChecked: checkedCount, assembledCandidates };
}

/**
 * Task generation helpers for Worker Threads load balancing
 */
function getMode1Prefixes(patternList, format, wordlist, coinKey, W) {
  const slots = patternList.map(pat => {
    const clean = pat.toLowerCase().trim();
    if (clean.includes(',')) {
      return clean.split(',').map(s => s.trim()).filter(Boolean);
    } else if (clean === '*' || clean === '?') {
      return wordlist;
    } else if (clean.endsWith('*')) {
      const prefix = clean.slice(0, -1);
      return wordlist.filter(w => w.startsWith(prefix));
    } else {
      return [clean];
    }
  });

  let maxDepth = 0;
  let count = 1;
  while (maxDepth < slots.length && count < W * 4) {
    count *= slots[maxDepth].length;
    maxDepth++;
  }

  const results = [];
  function backtrack(idx, current) {
    if (idx === maxDepth || idx === slots.length) {
      results.push([...current]);
      return;
    }
    for (const w of slots[idx]) {
      current.push(w);
      backtrack(idx + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return results;
}

function getMode23PartialStates(suppliedWords, constraints, format, wordlist, coinKey, W) {
  const seedSize = suppliedWords.length;
  const assignment = Array(seedSize).fill(null);
  const fixedPositions = {};
  const activeConstraints = constraints || {};

  for (let idx = 0; idx < seedSize; idx++) {
    if (activeConstraints[idx] && activeConstraints[idx].requiredWord) {
      assignment[idx] = activeConstraints[idx].requiredWord.toLowerCase().trim();
      fixedPositions[idx] = true;
    }
  }

  const floatingWords = suppliedWords.map(w => w.toLowerCase().trim());
  for (let idx = 0; idx < seedSize; idx++) {
    if (fixedPositions[idx]) {
      const fixedWord = assignment[idx];
      const matchIdx = floatingWords.indexOf(fixedWord);
      if (matchIdx !== -1) {
        floatingWords.splice(matchIdx, 1);
      }
    }
  }

  const floatingPositions = [];
  for (let i = 0; i < seedSize; i++) {
    if (!fixedPositions[i]) {
      floatingPositions.push(i);
    }
  }

  const expandedFloatingPools = floatingWords.map(word => {
    const clean = word.toLowerCase().trim();
    if (clean.includes(',')) {
      return clean.split(',').map(s => s.trim()).filter(Boolean);
    } else if (clean === '*' || clean === '?') {
      return wordlist;
    } else if (clean.endsWith('*')) {
      const prefix = clean.slice(0, -1);
      return wordlist.filter(w => w.startsWith(prefix));
    } else {
      return [clean];
    }
  });

  const states = [];
  const usedWords = Array(expandedFloatingPools.length).fill(false);

  function backtrackShallow(posIdx, currentAssignment, currentUsed) {
    if (states.length >= W * 16 || posIdx === floatingPositions.length) {
      states.push({
        posIdx,
        assignment: [...currentAssignment],
        usedWords: [...currentUsed]
      });
      return;
    }

    const currentSlot = floatingPositions[posIdx];
    const slotConstraint = activeConstraints[currentSlot];

    for (let wordIdx = 0; wordIdx < expandedFloatingPools.length; wordIdx++) {
      if (currentUsed[wordIdx]) continue;

      const candidates = expandedFloatingPools[wordIdx];
      for (let cIdx = 0; cIdx < candidates.length; cIdx++) {
        const candidateWord = candidates[cIdx];

        if (slotConstraint) {
          if (slotConstraint.excludedWords && slotConstraint.excludedWords.includes(candidateWord)) {
            continue;
          }
        }

        currentAssignment[currentSlot] = candidateWord;
        currentUsed[wordIdx] = true;

        backtrackShallow(posIdx + 1, currentAssignment, currentUsed);

        currentUsed[wordIdx] = false;
        currentAssignment[currentSlot] = null;
      }
    }
  }

  backtrackShallow(0, assignment, usedWords);
  return states;
}

function getMode4PartialStates(scrambledWords, W) {
  const words = scrambledWords.map(w => w.toLowerCase().trim());
  const n = words.length;
  const states = [];

  function backtrack(prefix, usedIndices) {
    if (states.length >= W * 4 || prefix.length === n) {
      states.push({
        prefix: [...prefix],
        usedIndices: [...usedIndices]
      });
      return;
    }

    for (let i = 0; i < n; i++) {
      if (usedIndices[i]) continue;
      usedIndices[i] = true;
      prefix.push(words[i]);
      backtrack(prefix, usedIndices);
      prefix.pop();
      usedIndices[i] = false;
    }
  }

  backtrack([], Array(n).fill(false));
  return states;
}

module.exports = {
  verifyCandidate,
  searchMode1,
  searchMode2And3,
  searchMode4,
  getMode1Prefixes,
  getMode23PartialStates,
  getMode4PartialStates
};
