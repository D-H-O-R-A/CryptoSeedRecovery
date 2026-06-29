/**
 * CryptoSeedRecovery - Core Recovery Search Engine
 * Implements the 4 distinct search modes with optimized constraint backtracking and early pruning.
 */

const { ethers } = require('ethers');
const { validateElectrumMnemonic, mnDecode } = require('./electrum-legacy');
const { deriveAddress } = require('./address-deriver');

// Helper to calculate factorial for Mode 4 progress estimates
function factorial(n) {
  let res = 1n;
  for (let i = 2n; i <= BigInt(n); i++) {
    res *= i;
  }
  return res;
}

/**
 * Verifies if a candidate mnemonic is valid and derives the correct target public address.
 * 
 * @param {string} phrase - Candidate seed phrase (words separated by space)
 * @param {string} format - 'bip39' | 'electrum'
 * @param {string} walletType - 'metamask' | 'trust' | 'b2wallet'
 * @param {string} coinKey - 'ETH' (or 'EVM') | 'BTC' | 'LTC' | 'DOGE' | 'SOL' | 'XLM' | 'TRX'
 * @param {string} targetAddress - The public address we are looking for
 * @returns {boolean} - True if it matches exactly
 */
function verifyCandidate(phrase, format, walletType, coinKey, targetAddress, pattern = null) {
  const cleanPhrase = phrase.trim().toLowerCase();
  const cleanTarget = targetAddress.trim().toLowerCase();

  // 1. BIP-39 fast path: Verify checksum first if format is BIP-39
  if (format === 'bip39') {
    if (!ethers.Mnemonic.isValidMnemonic(cleanPhrase)) {
      return false; // Skip address derivation for 99.6% of incorrect combinations
    }
  } else if (format === 'electrum') {
    const words = cleanPhrase.split(/\s+/);
    if (!validateElectrumMnemonic(words)) {
      return false;
    }
  }

  // 2. Perform address derivation
  try {
    const derivedAddr = deriveAddress(cleanPhrase, walletType, coinKey, 0, pattern);
    return derivedAddr.toLowerCase() === cleanTarget;
  } catch (err) {
    return false; // Under incorrect path combinations or invalid sementes
  }
}

/**
 * MODE 1: Fixed Order + Wildcards
 * Expands in-place wildcards (e.g. 'bo*', '*') using product of matched words.
 */
function searchMode1(patternList, format, wordlist, walletType, coinKey, targetAddress, onProgress, pattern = null) {
  const results = [];
  const assembledCandidates = [];
  const cleanTarget = targetAddress.trim().toLowerCase();

  // Match possible dictionary words for each slot
  const slots = patternList.map(pat => {
    const clean = pat.toLowerCase().trim();
    if (clean === '*' || clean === '?') {
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
      
      let isValid = false;
      if (format === 'bip39') {
        isValid = ethers.Mnemonic.isValidMnemonic(candidate);
      } else if (format === 'electrum') {
        isValid = validateElectrumMnemonic(currentWords);
      }

      if (isValid) {
        try {
          const derivedAddr = deriveAddress(candidate, walletType, coinKey, 0, pattern);
          if (assembledCandidates.length < 50000) {
            assembledCandidates.push({ phrase: candidate, address: derivedAddr });
          }
          if (derivedAddr.toLowerCase() === cleanTarget) {
            results.push(candidate);
          }
        } catch (err) {
          // derivation fail
        }
      }
      return;
    }

    // Optimization: If the phrase is already completed up to 12 words and we are in BIP-39,
    // we can only do early check on complete sementes, but since Cartesian is sequence-based,
    // we iterate standard.
    const candidates = slots[idx];
    for (let i = 0; i < candidates.length; i++) {
      currentWords.push(candidates[i]);
      backtrack(idx + 1, currentWords);
      currentWords.pop();
    }
  }

  backtrack(0, []);
  return { results, totalChecked: checkedCount, assembledCandidates };
}

/**
 * MODES 2 & 3: Shuffled Words with or without Wildcards (Backtracking Solver)
 * Finds placements of suppliedWords in the correct positions.
 * 
 * @param {string[]} suppliedWords - The words supplied by the user (some may contain wildcards like 'bo*')
 * @param {Object} constraints - Map of index to slot constraints:
 *   {
 *     [slotIndex]: {
 *       requiredWord: string,      // If a specific word is known to be in this slot
 *       excludedWords: string[]   // List of words known NOT to be in this slot (NOK constraint)
 *     }
 *   }
 */
function searchMode2And3(suppliedWords, constraints, format, wordlist, walletType, coinKey, targetAddress, onProgress, pattern = null) {
  const results = [];
  const assembledCandidates = [];
  const cleanTarget = targetAddress.trim().toLowerCase();
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
    if (clean === '*' || clean === '?') {
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
      
      let isValid = false;
      if (format === 'bip39') {
        isValid = ethers.Mnemonic.isValidMnemonic(candidate);
      } else if (format === 'electrum') {
        isValid = validateElectrumMnemonic(assignment);
      }

      if (isValid) {
        try {
          const derivedAddr = deriveAddress(candidate, walletType, coinKey, 0, pattern);
          if (assembledCandidates.length < 50000) {
            assembledCandidates.push({ phrase: candidate, address: derivedAddr });
          }
          if (derivedAddr.toLowerCase() === cleanTarget) {
            results.push(candidate);
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

  backtrack(0);
  return { results, totalChecked: checkedCount, assembledCandidates };
}

/**
 * MODE 4: Full Descrambler
 * Tests all possible arrangements of a list of completely spelled scrambled words.
 */
function searchMode4(scrambledWords, format, walletType, coinKey, targetAddress, onProgress, pattern = null) {
  const results = [];
  const assembledCandidates = [];
  const cleanTarget = targetAddress.trim().toLowerCase();
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
    
    let isValid = false;
    if (format === 'bip39') {
      isValid = ethers.Mnemonic.isValidMnemonic(candidate);
    } else if (format === 'electrum') {
      isValid = validateElectrumMnemonic(arr);
    }

    if (isValid) {
      try {
        const derivedAddr = deriveAddress(candidate, walletType, coinKey, 0, pattern);
        if (assembledCandidates.length < 50000) {
          assembledCandidates.push({ phrase: candidate, address: derivedAddr });
        }
        if (derivedAddr.toLowerCase() === cleanTarget) {
          results.push(candidate);
        }
      } catch (err) {
        // derivation fail
      }
    }
  }

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

  return { results, totalChecked: checkedCount, assembledCandidates };
}

module.exports = {
  verifyCandidate,
  searchMode1,
  searchMode2And3,
  searchMode4
};
