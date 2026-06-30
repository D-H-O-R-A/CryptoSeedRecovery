# 🛡️ cryptoseed


<p align="left">
  <a href="https://www.npmjs.com/package/cryptoseed">
    <img src="https://img.shields.io/npm/v/cryptoseed.svg?style=flat-square" alt="npm version">
  </a>
  <a href="https://github.com/D-H-O-R-A/CryptoSeedRecovery/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/D-H-O-R-A/CryptoSeedRecovery.svg?style=flat-square" alt="license">
  </a>
  <a href="https://github.com/D-H-O-R-A/CryptoSeedRecovery/stargazers">
    <img src="https://img.shields.io/github/stars/D-H-O-R-A/CryptoSeedRecovery.svg?style=flat-square" alt="stars">
  </a>
  <a href="https://github.com/D-H-O-R-A/CryptoSeedRecovery/issues">
    <img src="https://img.shields.io/github/issues/D-H-O-R-A/CryptoSeedRecovery.svg?style=flat-square" alt="issues">
  </a>
  <a href="https://better2better.com.br/softwares/b2-wallet">
    <img src="https://img.shields.io/badge/Built%20For-b2%20wallet-blueviolet?style=flat-square" alt="b2 wallet">
  </a>
</p>

🌍 **Select Language / Selecione o Idioma:**
[Português](./README.md) | [English](./README.en.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Italiano](./README.it.md) | [Türkçe](./README.tr.md) | [Русский](./README.ru.md) | [简体中文](./README.zh.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [עברית](./README.he.md)


**cryptoseed** is an enterprise-grade, lightweight, and high-performance library developed in **Pure JavaScript** (Node.js) designed for the diagnosis, validation, and recovery of cryptographic mnemonic seed phrases (*seed phrases*) that have been lost, scrambled, or typed with spelling errors.

Developed under the security and infrastructure ecosystem of [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net), under the leadership of [diegooris](https://diegohorantunes.web.app/)), the library is engineered to provide developers and security analysts with maximum robustness, ultra-high search speeds, and surgical historical accuracy in address derivation across **39 distinct blockchains and ecosystems**. All of this operates 100% autonomously, without native C/C++ compilation dependencies or external packages that could compromise build portability.

---

## 📅 Supported BIP Variations and Historical Timeline

To recover funds accurately, it is not enough to just know the words; you must understand the technical specifications and the year the wallet was created. **cryptoseed** rigorously implements and respects historical standards (BIPs).

### 🔍 Table of Implemented and Aligned BIP Standards

| BIP | Name | Implementation & Support in **cryptoseed** |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **Full Support.** The foundation of the HD derivation tree. Allows the engine to derive infinite paths of public/private keys (`xprv`/`xpub`) from a single master seed using pure elliptic curve mathematics via our key engine. |
| **BIP-39** | *Mnemonic Code* | **Full Support.** The industry standard. Supports phrases of **12, 15, 18, 21, or 24 words** with integrated 4-to-8-bit checksum verification and dictionaries in **10 different languages**. |
| **BIP-43** | *Purpose Field* | **Full Support.** Respects the structure that introduced the purpose field (`m / purpose'`) at the top of the path tree, ensuring the engine correctly routes to multi-purpose wallets. |
| **BIP-44** | *Multi-Account* | **Full Support.** The most common derivation path standard in the industry: `m/44'/coin_type'/account'/change/address_index`. Used by default for Bitcoin Legacy, Ethereum, EVMs, Solana Legacy, TRON, Cardano Legacy, etc. |
| **BIP-45** | *Multisig HD* | **Path Alignment.** Used for multi-signature wallets on purpose paths `m/45'`. If you are recovering an individual seed that is part of a BIP-45 multisig setup, the engine derives the individual private keys from this path normally. |
| **BIP-47** | *Payment Codes* | **Seed Compatibility.** Reusable and private payment codes (such as Samourai wallets). The backup of wallets using BIP-47 is a standard 12 or 24-word BIP-39 seed. **cryptoseed** recovers this master seed perfectly. |
| **BIP-48** | *Multisig Structure* | **Compatibility.** Advanced multisig structure based on BIP-43 using the path `m/48'/coin_type'/...`. Compatible for recovering the master seed that signs these multi-signature transactions. |
| **BIP-49** | *Nested SegWit* | **Full Support.** Bitcoin transition addresses starting with the character `3` (P2SH-P2WPKH format), derived under the official path `m/49'/0'/0'/0/index`. |
| **BIP-84** | *Native SegWit* | **Full Support.** Modern high-performance Bitcoin addresses starting with `bc1q` and Litecoin starting with `ltc1` (Bech32 format), derived under `m/84'/0'/0'/0/index` (and `m/84'/2'/...` for LTC). |
| **BIP-85** | *Child Seeds* | **Conceptual Compatibility.** Allows a BIP-39 master seed to generate new secure sub-seeds (12 or 24 words) for other wallets under paths like `m/85'/...`. If your lost seed was a child seed derived by BIP-85, the engine will recover it like any normal BIP-39 seed. |
| **BIP-86** | *Taproot* | **Full Support.** Next-generation Bitcoin addresses (Schnorr/Taproot) starting with `bc1p` (Bech32m), derived under the standard path `m/86'/0'/0'/0/index`. |

---

## ⚡ Why Was cryptoseed Created?

When I needed to recover wallets for clients and friends of the [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net) ecosystem, I realized that existing tools were either overly complex (requiring native C++ compilations that broke Node) or failed to understand the historical transition of blockchains. I created this library to offer the following solutions:

1.  **Zero Native Dependencies (Pure JS):** Works headache-free on Windows, Linux, or macOS. Excellent for compiling portable executables using `pkg`.
2.  **"Letter-Slicing" Technology (Prefix Fallback):** I wrote an algorithm that, if you type an incorrect word like `engino`, will slice the word character-by-character (`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`) to automatically identify the most likely word in the official dictionary.
3.  **Intelligent Missing Word Handling:** If the algorithm finds an unknown word with no prefix match in the dictionary, it automatically converts it into a wildcard (`*`) to test all dictionary possibilities 1-by-1 in an automated fashion.
4.  **Early Branch Pruning:** Developed the search engine with constraint-based early pruning (required words and excluded words - NOK), preventing the CPU from calculating billions of useless permutations.
5.  **Integrated Checksum Bypass:** Since BIP-39 seeds contain checksums, the code discards **99.6%** of all generated combinations before even attempting heavy elliptic curve calculations, saving 1000x CPU time.

---

## 🛠️ Recovery Features and Search Engineering

Originally developed in **2023** as an exclusive proprietary tool for the [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net)) ecosystem, **cryptoseed** has been open-sourced to provide a recovery infrastructure that is scientifically superior to generic marketplace solutions. The search engine features the following capabilities and technological distinctions:

### 🎯 Word-State Classification
Unlike basic recovery scripts, the interactive wizard allows you to configure the trust state of each individual word in the seed phrase using three semantic classifications:
* **✔️**: The word and its exact position in the seed phrase are confirmed. The engine locks this word in place and focuses processing power exclusively on the remaining slots.
* **🔀**: The word is known to belong to the seed, but its position is incorrect or uncertain. The engine dynamically considers this word for safe permutations only across available vacant slots, avoiding redundant permutations.
* **🎲**: The word is completely unknown, lost, or illegible. The engine exhaustively tests all dictionary possibilities for the corresponding format automatically.

### 📊 Pre-Processing and Feasibility Estimates
Before expending computational energy, the engine analyzes the seed and the provided constraints to present a detailed mathematical overview:
* **Raw Search Space**: Displays the exact mathematical total of theoretical combinations based on your configuration.
* **Tree Pruning (Checksum & Filters)**: Indicates how many combinations remain after applying immediate logical filters (such as checksums or NOK word exclusions), drastically reducing the volume of heavy key derivations.
* **Scan Time Projections**: Compares real-time scan time estimates using average latency connections (public APIs) versus high-performance local setups (local RPC nodes).
* **Infeasibility Warning**: Transparently alerts the user if the configured complexity requires supercomputing resources, preventing useless hardware lockups.

### 🌐 Multiple Validation Engines and Formats
The ecosystem supports different cryptographic structures with format-specific validation rules:
* **BIP-39 Engine**: Full support for **12, 15, 18, 21, and 24-word** seeds, applying integrated integrity verification (*checksum*) to discard **99.6%** of false combinations before any derivation occurs.
* **Electrum Engine**: Validation and derivation mapped exactly to the exclusive rules of Electrum mnemonic seeds (both Legacy and Modern).
* **Electron Cash Engine**: Precise adaptation of derivation and checksum validation logic from the Bitcoin Cash ecosystem.
* **No Validation Mode (Brute Force)**: Raw derivation generator without checksum filtering—ideal for proprietary legacy formats or custom non-standard seeds, ensuring maximum search coverage.

### 🧩 Solving Combined High-Complexity Scenarios
The engine resolves complex combined issues in a single execution sweep, including:
* One or more completely lost words in known or unknown positions.
* Known words with a completely scrambled order.
* Mixed scenarios (e.g., seeds where some words are missing while the known words are out of order).
* Search profile preference: **Maximum Speed** (utilizing checksums and constraints) or **Maximum Coverage** (broad mathematical brute force).

---

## ⚙️ Installation

### Global Installation (To run the interactive CLI utility directly in your terminal)
```bash
npm install -g cryptoseed
```

### Local Installation (To import the logic into your Node project)
```bash
npm install cryptoseed
```

---

## 🛡️ Programmatic API Usage (JavaScript)

The library provides clean and well-structured exports for immediate integration of [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) security logic into your application:

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. Correct typo using "Letter-Slicing"
const dictionary = wordlists.bip39.en;
const wordWithError = "*";
const suggestions = typo.getPrefixSuggestions(wordWithError, dictionary);
console.log("Deduced word:", suggestions); // Returns [ 'engine' ]

// 2. Derive real public address for MetaMask (EVM)
const seed = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const ethAddress = addressDeriver.deriveAddress(seed, 'metamask', 'ETH', 0);
console.log("Ethereum Address:", ethAddress);

// 3. Derive custom address using B2 Wallet cryptography
const b2Address = addressDeriver.deriveAddress(seed, 'b2wallet', 'BTC', 0);
console.log("Bitcoin Address on B2 Wallet:", b2Address);
```

---

## 💻 Interactive CLI

Simply type the main command in your terminal and follow the wizard:
```bash
cryptoseed
```

### Help and Historical Commands

*   **Quick Help (`-h` or `--help`):** Displays the usage guide and command-line options.
    ```bash
    cryptoseed --help
    ```
*   **Information Compendium (`-i` or `--info`):** Displays a complete historical summary of each supported blockchain, standard paths used per year, and compatible wallets. Excellent for figuring out where old funds might be stored!
    ```bash
    cryptoseed --info
    ```

---

## 🧮 The Mathematics Behind and Viability Limits

If you lost your seed, you need to be realistic about the probabilities. I wrote the engine to display realistic alerts before starting any heavy search:

### BIP-39 Combination Table (2048-Word Dictionary)

| Missing Words | Combination Calculation | Total Possibilities | Real Viability |
| :---: | :---: | :---: | :--- |
| **1 Word** | $2048^1$ | **2,048** | **Fully Viable** (Fractions of a second on any CPU) |
| **2 Words** | $2048^2$ | **4,194,304** | **Viable** (A few seconds with our optimized engine) |
| **3 Words** | $2048^3$ | **8,589,934,592** | **Very Heavy** (Viable if you know positions or have constraints) |
| **4 Words** | $2048^4$ | **17,592,186,044,416** | **Infeasible** for standard computers (would take weeks/months) |
| **5 Words** | $2048^5$ | **36,028,797,018,963,968**| **Mathematically Impossible** (Requires supercomputers) |

---

## 📊 Supported Blockchains and Wallets Matrix (39 Networks)

Below is the complete, detailed list of all 39 networks and ecosystems natively supported by the **cryptoseed** derivation engine, ensuring backwards and contemporary compatibility:

| Ecosystem / Network | Symbol | Default Derivation Path (HD Path) | Compatible Reference Wallets |
| :--- | :---: | :--- | :--- |
| **Bitcoin** | BTC | `m/84'/0'/0'/0/i` (Native SegWit)<br>`m/49'/0'/0'/0/i` (Nested SegWit)<br>`m/44'/0'/0'/0/i` (Legacy)<br>`m/86'/0'/0'/0/i` (Taproot) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), Electrum, Trust Wallet, Ledger, Trezor |
| **Ethereum** | ETH | `m/44'/60'/0'/0/i` | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Rabby, Trust Wallet, Ledger, Trezor |
| **BNB Chain** | BNB | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Trust Wallet, Ledger, Trezor |
| **Polygon** | MATIC | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Trust Wallet, Ledger, Trezor |
| **Arbitrum** | ARB | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Rabby, Trust Wallet, Ledger, Trezor |
| **Optimism** | OP | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Rabby, Trust Wallet, Ledger, Trezor |
| **Avalanche** | AVAX | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), Core, MetaMask, Trust Wallet, Ledger, Trezor |
| **Base** | BASE | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Trust Wallet, Ledger, Trezor |
| **Fantom** | FTM | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Trust Wallet, Ledger, Trezor |
| **Cronos** | CRO | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Trust Wallet, Ledger, Trezor |
| **Harmony** | ONE | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Trust Wallet |
| **Gnosis Chain** | GNOSIS | `m/44'/60'/0'/0/i` (EVM) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), MetaMask, Rabby, Trust Wallet, Ledger, Trezor |
| **Solana** | SOL | `m/44'/501'/0'/0'` (Phantom Standard)<br>`m/44'/501'/0'/0/i` (Sollet/Legacy) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), Phantom, Sollet, Solflare, Trust Wallet |
| **Cardano** | ADA | `m/1852'/1815'/0'/0/i` (Shelley Native)<br>`m/44'/1815'/0'/0/i` (Byron Legacy) | Yoroi, Daedalus, Eternl, Lace |
| **TRON** | TRX | `m/44'/195'/0'/0/i` | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), TronLink, Trust Wallet, Ledger, Trezor |
| **Waves** | WAVES | `m/44'/5741564'/0'/0/i` | Waves Keeper, Waves Client |
| **Stellar** | XLM | `m/44'/148'/0'/0/i` | Lobstr, Stellar Wallet, Ledger |
| **Ripple** | XRP | `m/44'/144'/0'/0/i` | Toast Wallet, Xumm, Ledger, Trezor |
| **Polkadot** | DOT | `m/44'/354'/0'/0'/0'` (Substrate Path) | Polkadot.js, Talisman, Fearless |
| **Kusama** | KSM | `m/44'/434'/0'/0'/0'` (Kusama Path) | Polkadot.js, Talisman, Fearless |
| **Cosmos** | ATOM | `m/44'/118'/0'/0/i` | Keplr, Cosmostation, Ledger |
| **Osmosis** | OSMO | `m/44'/118'/0'/0/i` | Keplr, Cosmostation, Ledger |
| **Secret Network** | SCRT | `m/44'/529'/0'/0/i` | Keplr, Cosmostation |
| **Injective** | INJ | `m/44'/60'/0'/0/i` (Keccak-256) | Keplr, MetaMask, Leap |
| **Hedera** | HBAR | `m/44'/3030'/0'/0/i` | Hashpack, Blade Wallet |
| **NEM** | XEM | `m/44'/43'/0'/0/i` | NEM Wallet |
| **Chia** | XCH | `m/44'/8444'/0'/0/i` | Chia Wallet |
| **Tezos** | XTZ | `m/44'/1729'/0'/0/i` | Temple, Kukai, Ledger |
| **Algorand** | ALGO | `m/44'/283'/0'/0'/0'` | Pera Wallet, Defly Wallet |
| **Near** | NEAR | `m/44'/397'/0'/0'/0'` | MyNearWallet, Sender Wallet |
| **Sui** | SUI | `m/44'/784'/0'/0'/0'` | Sui Wallet, Suiet, Trust Wallet |
| **Aptos** | APT | `m/44'/637'/0'/0'/0'` | Petra Wallet, Pontem, Martian |
| **Litecoin** | LTC | `m/84'/2'/0'/0/i` (Native SegWit)<br>`m/44'/2'/0'/0/i` (Legacy) | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), Electrum LTC, Trust Wallet, Ledger |
| **Dogecoin** | DOGE | `m/44'/3'/0'/0/i` | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), Multidoge, Trust Wallet, Ledger, Trezor |
| **Bitcoin Cash** | BCH | `m/44'/145'/0'/0/i` | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), Electron Cash, Trust Wallet, Ledger |
| **Dash** | DASH | `m/44'/5'/0'/0/i` | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), Dash Core, Trust Wallet, Ledger |
| **Zcash** | ZEC | `m/44'/133'/0'/0/i` | [B2 Wallet](https://better2better.com.br/softwares/b2-wallet), Trust Wallet, Ledger |
| **Kaspa** | KAS | `m/44'/111111'/0'/0/i` | Kaspium, Kaspa Web Wallet |
| **Monero** | XMR | `m/44'/128'/0'/0/i` | Cake Wallet, Monerujo, GUI Wallet |

---

## 🛠️ Performance: Local RPC Node vs Public API

At the end of each search, **cryptoseed** saves a detailed recovery report to your disk (`resultado_recuperacao_[timestamp].txt`) and provides a real estimate of the query speed required to verify if the found seeds have funds on-chain:

*   **Querying via Public APIs (50ms per request):** Useful only if you have very few candidate seeds ($<100$). Suffers from internet latency and request rate-limiting.
*   **Querying via Local RPC Node (0.1ms per request):** The ideal path for robust searches ($>1000$ seeds). Reduces total scanning time by up to **500 times** by running locally on your own machine.

---

## 🎓 Satoshi Era Easter Egg (2009 - 2010)

If you attempt to select in the wizard that your wallet was created in or before **2010**, the program will halt execution and reveal an historical secret: **In this genesis era, mnemonic seed phrases DID NOT exist!**
Satoshi Nakamoto's original client (Bitcoin-Qt) used random private keys stored in the binary file `wallet.dat`. If you lost this file, no phrase of words can recover your funds, because deterministic seeds had simply not been invented yet!

---

## 🛡️ License, Security, and Governance

This library runs **100% offline and locally** on your machine. The code is open, clean, and makes no network requests to transmit your words or private keys. Security first.

*   **License:** MIT (Created in 2023)
*   **Credits:** [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/) project.
