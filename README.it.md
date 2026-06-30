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


**cryptoseed** è una libreria di classe aziendale, leggera e ad alte prestazioni sviluppata in **JavaScript Puro** (Node.js) progettata per la diagnosi, la validazione e il recupero di frasi mnemotiche (*seed phrases*) crittografiche che sono andate perse, disordinate o digitate con errori di ortografia.

Sviluppata all'interno dell'ecosistema di sicurezza e infrastruttura di [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net), sotto la guida di [diegooris](https://diegohorantunes.web.app/)), la libreria è stata progettata per fornire a sviluppatori e analisti di sicurezza la massima robustezza, un'elevata velocità di ricerca e una precisione storica chirurgica nella derivazione degli indirizzi su **39 blockchain ed ecosistemi diversi**. Tutto questo operando in modo autonomo al 100%, senza dipendenze di compilazione nativa C/C++ o pacchetti esterni che potrebbero compromettere la portabilità del build.

---

## 📅 Variazioni di BIP Supportate e Cronologia Storica

Per recuperare i fondi con precisione, non basta solo conoscere le parole; è necessario comprendere le specifiche tecniche e l'anno in cui è stato creato il portafoglio. **cryptoseed** implementa e rispetta rigorosamente gli standard storici (BIP).

### 🔍 Tabella degli Standard BIP Implementati e Allineati

| BIP | Nome | Implementazione e Supporto in **cryptoseed** |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **Supporto Completo.** È la base dell'albero di derivazione HD. Consente al motore di derivare infiniti percorsi di chiavi pubbliche/private (`xprv`/`xpub`) a partire da un singolo seed master utilizzando matematica pura delle curve ellittiche tramite il nostro motore di chiavi. |
| **BIP-39** | *Mnemonic Code* | **Supporto Completo.** Lo standard più comune del settore. Supporta frasi di **12, 15, 18, 21 o 24 parole** con verifica dell'integrità (*checksum*) integrata da 4 a 8 bit e dizionari in **10 lingue** diverse. |
| **BIP-43** | *Purpose Field* | **Supporto Completo.** Rispetta la struttura che ha introdotto il campo di scopo (`m / purpose'`) nella parte superiore dell'albero dei percorsi, garantendo che il motore indirizzi correttamente ai portafogli multiuso. |
| **BIP-44** | *Multi-Account* | **Supporto Completo.** Lo standard di percorso di derivazione più comune del settore: `m/44'/coin_type'/account'/change/address_index`. Utilizzato di default per Bitcoin Legacy, Ethereum, EVM, Solana Legacy, TRON, Cardano Legacy, ecc. |
| **BIP-45** | *Multisig HD* | **Allineamento dei Percorsi.** Utilizzato per portafogli multifirma su percorsi di scopo `m/45'`. Se si sta recuperando un seed individuale che fa parte di una configurazione multisig BIP-45, il motore deriva normalmente le singole chiavi private da questo percorso. |
| **BIP-47** | *Payment Codes* | **Compatibilità del Seed.** Codici di pagamento riutilizzabili e privati (come i portafogli Samourai). Il backup dei portafogli che utilizzano BIP-47 è un seed BIP-39 standard da 12 o 24 parole. **cryptoseed** recupera questo seed master perfettamente. |
| **BIP-48** | *Multisig Structure* | **Compatibilità.** Struttura multisig avanzata basata su BIP-43 utilizzando il percorso `m/48'/coin_type'/...`. Compatibile per recuperare il seed master che firma queste transazioni multifirma. |
| **BIP-49** | *Nested SegWit* | **Supporto Completo.** Indirizzi di transizione Bitcoin che iniziano con il carattere `3` (formato P2SH-P2WPKH), derivati sotto il percorso ufficiale `m/49'/0'/0'/0/index`. |
| **BIP-84** | *Native SegWit* | **Supporto Completo.** Indirizzi Bitcoin moderni ad alte prestazioni che iniziano con `bc1q` e Litecoin che iniziano con `ltc1` (formato Bech32), derivati sotto `m/84'/0'/0'/0/index` (e `m/84'/2'/...` per LTC). |
| **BIP-85** | *Child Seeds* | **Compatibilità Concettuale.** Consente a un seed master BIP-39 di generare nuovi sub-seed sicuri (da 12 o 24 parole) per altri portafogli sotto percorsi come `m/85'/...`. Se il seed perso è un seed figlio derivato da BIP-85, il motore lo recupererà come un qualsiasi normale seed BIP-39. |
| **BIP-86** | *Taproot* | **Supporto Completo.** Indirizzi Bitcoin di ultima generazione (Schnorr/Taproot) che iniziano con `bc1p` (Bech32m), derivati sotto il percorso standard `m/86'/0'/0'/0/index`. |

---

## ⚡ Perché è stato creato cryptoseed?

Quando ho avuto bisogno di recuperare portafogli per clienti e amici dell'ecosistema [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net), mi sono reso conto che gli strumenti esistenti erano troppo complessi (richiedevano compilazioni nativa in C++ che rompevano Node) o non comprendevano la transizione storica delle blockchain. Ho creato questa libreria per offrire le seguenti soluzioni:

1.  **Zero Dipendenze Native (Pure JS):** Funziona senza grattacapi su Windows, Linux o macOS. Eccellente per compilarlo in esecutivi portabili tramite `pkg`.
2.  **Tecnologia di "Ritaglio delle Lettere" (Prefix Fallback):** Ho scritto un algoritmo che, in caso di inserimento di una parola errata come `engino`, taglia la parola lettera per lettera (`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`) per identificare automaticamente la parola più probabile nel dizionario ufficiale.
3.  **Gestione Intelligente delle Parole Perse:** Se l'algoritmo trova una parola sconosciuta senza corrispondenza di prefisso nel dizionario, la converte automaticamente in un carattere jolly (`*`) per testare tutte le possibilità del dizionario una ad una in modo automatizzato.
4.  **Potatura Precoce dei Rami (Early Branch Pruning):** Ho sviluppato il motore di ricerca con potatura precoce basata su vincoli (parole obbligatorie ed escluse - NOK), evitando che la CPU calcoli miliardi di permutazioni inutili.
5.  **Bypass del Checksum Integrato:** Poiché i seed BIP-39 contengono checksum, il codice scarta il **99.6%** di tutte le combinazioni generate prima ancora di tentare calcoli pesanti di curve ellittiche, risparmiando 1000 volte il tempo della CPU.

---

## 🛠️ Funzionalità di Recupero e Ingegneria di Ricerca

Sviluppato originariamente nel **2023** como strumento proprietario esclusivo per l'ecosistema di [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net)), **cryptoseed** è stato aperto al pubblico per offrire un'infrastruttura di recupero scientificamente superiore alle soluzioni ordinarie del mercato. Il motore di ricerca presenta le seguenti capacità e distinzioni tecnologiche:

### 🎯 Classificazione degli Stati per Parola
A differenza degli script di recupero basilari, l'assistente interattivo consente di configurare lo stato di fiducia di ogni singola parola del seed mnemone utilizzando tre classificazioni:
* **✔️**: La parola e la sua posizione esatta nella frase sono confermate. Il motore blocca questa parola e concentra la sua potenza di calcolo esclusivamente sugli altri slot.
* **🔀**: La parola è nota per appartenere alla frase, ma la sua posizione è errata o incerta. Il motore considera dinamicamente questa parola per permutazioni sicure solo sugli slot disponibili, evitando così test ridondanti.
* **🎲**: La parola è totalmente sconosciuta, persa o illeggibile. Il motore testa automaticamente e in modo esaustivo tutte le possibilità del dizionario corrispondente.

### 📊 Pre-trattamento e Stime di Fattibilità
Prima di spendere energia informatica, il motore analizza la frase e i vincoli forniti per mostrare un quadro matematico dettagliato:
* **Spazio di Ricerca Lordo**: Mostra il totale matematico esatto delle combinazioni teoriche basate sulla tua configurazione.
* **Potatura dell'Albero (Checksum & Filtri)**: Indica quante combinazioni rimangono dopo l'applicazione di filtri logici immediati (come i checksum o le esclusioni di parole NOK), riducendo drasticamente il volume di derivazioni di chiavi.
* **Proiezioni dei Tempi di Scansione**: Confronta in tempo real le stime dei tempi di scansione utilizzando una connessione media (API pubbliche) rispetto a una connessione locale ultra-rapida (nodi RPC locali).
* **Avviso di Infattibilità**: Il motore avverte l'utente in modo trasparente se la complessità configurata richiede risorse di supercalcolo, evitando così blocchi hardware inutili.

### 🌐 Molteplici Motori di Validazione e Formati
L'ecosistema supporta diverse strutture crittografiche con regole di validazione specifiche:
* **Motore BIP-39**: Supporto completo per seed da **12, 15, 18, 21 e 24 parole**, applicando una validazione di checksum integrata per eliminare il **99.6%** delle false combinazioni prima di qualsiasi derivazione.
* **Motore Electrum**: Validazione e derivazione mappate esattamente sulle regole esclusive dei seed mnemotici Electrum (sia Legacy che Modern).
* **Motore Electron Cash**: Adattamento preciso della logica di derivazione e validazione del checksum dell'ecosistema Bitcoin Cash.
* **Modalità Senza Validazione (Forza Bruta)**: Generatore grezzo di derivazione senza filtri di checksum, ideale per formati legacy proprietari o seed personalizzati non standard, garantendo la massima copertura di ricerca.

### 🧩 Risoluzione di Casi Complessi Combinati
Il motore risolve problemi combinati complessi in una singola esecuzione, tra cui:
* Una o mais parole completamente perse in posizioni note o sconosciute.
* Parole note con un ordine completamente mescolato.
* Scenari misti (es. seed in cui mancano alcune parole mentre le parole note non sono nel giusto ordine).
* Scelta del profilo di ricerca: **Massima Velocità** (con checksum e vincoli) o **Massima Copertura** (forza bruta matematica globale).

---

## ⚙️ Installazione

### Installazione Globale (Per eseguire l'utility CLI interattiva direttamente nel terminale)
```bash
npm install -g cryptoseed
```

### Installazione Locale (Per importare la logica nel tuo progetto Node)
```bash
npm install cryptoseed
```

---

## 🛡️ Come usare nel codice (API JavaScript)

La libreria fornisce esportazioni pulite e ben strutturate per l'integrazione immediata delle logiche di sicurezza di [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) nella tua applicazione:

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. Correggere un errore ortografico usando il "Ritaglio delle Lettere"
const dizionario = wordlists.bip39.it || wordlists.bip39.en;
const parolaConErrore = "*";
const suggerimenti = typo.getPrefixSuggestions(parolaConErrore, dizionario);
console.log("Parola dedotta:", suggerimenti); // Ritorna [ 'engine' ]

// 2. Derivare l'indirizzo pubblico reale per MetaMask (EVM)
const seed = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const indirizzoEth = addressDeriver.deriveAddress(seed, 'metamask', 'ETH', 0);
console.log("Indirizzo Ethereum:", indirizzoEth);

// 3. Derivare un indirizzo personalizzato usando la crittografia di B2 Wallet
const indirizzoB2 = addressDeriver.deriveAddress(seed, 'b2wallet', 'BTC', 0);
console.log("Indirizzo Bitcoin su B2 Wallet:", indirizzoB2);
```

---

## 💻 CLI Interattiva

Basta digitare il comando principale nel terminale e seguire l'assistente:
```bash
cryptoseed
```

### Comandi di Aiuto e Informazioni Storiche

*   **Aiuto rapido (`-h` o `--help`):** Mostra la guida all'uso e le opzioni della riga di comando.
    ```bash
    cryptoseed --help
    ```
*   **Compendio Informativo (`-i` o `--info`):** Mostra un riepilogo storico completo di ogni blockchain supportata, i percorsi standard usati per anno e i portafogli compatibili. Ottimo per scoprire dove potrebbero essere conservati i vecchi fondi!
    ```bash
    cryptoseed --info
    ```

---

## 🧮 La Matematica Dietro e Limiti di Fattibilità

Se hai perso il tuo seed, devi essere realista sulle probabilità. Ho programmato il motore per mostrare avvisi realistici prima di iniziare qualsiasi ricerca pesante:

### Tabella delle Combinazioni BIP-39 (Dizionario di 2048 Parole)

| Parole Perse | Calcolo delle Combinazioni | Totale Possibilità | Fattibilità Reale |
| :---: | :---: | :---: | :--- |
| **1 Parola** | $2048^1$ | **2.048** | **Completamente Fattibile** (Frazioni di secondo su qualsiasi CPU) |
| **2 Parole** | $2048^2$ | **4.194.304** | **Fattibile** (Pochi secondi con il nostro motore ottimizzato) |
| **3 Parole** | $2048^3$ | **8.589.934.592** | **Molto Pesante** (Fattibile se si conoscono le posizioni o si hanno vincoli) |
| **4 Parole** | $2048^4$ | **17.592.186.044.416** | **Non Fattibile** per computer comuni (richiederebbe settimane/mesi) |
| **5 Parole** | $2048^5$ | **36.028.797.018.963.968**| **Matematicamente Impossibile** (Richiederebbe supercomputer) |

---

## 📊 Matrice di Blockchain e Portafogli Supportati (39 Reti)

Di seguito è riportato l'elenco completo e dettagliato di tutte le 39 reti ed ecosistemi supportati nativamente dal motore di derivazione di **cryptoseed**, garantendo la compatibilità retroattiva e contemporanea:

| Ecosistema / Rete | Simbolo | Percorso di Derivazione Predefinito (HD Path) | Portafogli di Riferimento Compatibili |
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

## 🛠️ Prestazioni: Nodo RPC Locale vs API Pubblica

Al termine di ogni ricerca, **cryptoseed** salva un rapporto di recupero dettagliato sul disco (`resultado_recuperacao_[timestamp].txt`) e fornisce una stima reale della velocità delle query per verificare se i seed trovati possiedono fondi on-chain:

*   **Query tramite API Pubbliche (50ms per richiesta):** Utile solo se si dispone di pochissimi seed candidati ($<100$). Risente della latenza di internet e del blocco dei limiti di frequenza delle richieste.
*   **Query tramite Nodo RPC Locale (0.1ms per richiesta):** Il percorso ideale per ricerche robuste ($>1000$ seed). Riduce il tempo totale di scansione fino a **500 volte** eseguendo la ricerca localmente sulla propria macchina.

---

## 🎓 Easter Egg dell'era Satoshi (2009 - 2010)

Se si tenta di selezionare nell'assistente che il portafoglio è stato creato nel o prima del **2010**, il programma interromperà l'esecuzione e svelerà un segreto storico: **In questa era di genesi, le frasi seed mnemoniche NON esistevano!**
Il client originale di Satoshi Nakamoto (Bitcoin-Qt) utilizzava chiavi private casuali memorizzate nel file binario `wallet.dat`. Se hai perso quel file, nessuna frase di parole potrà mai recuperare i fondi, poiché il seed deterministico semplicemente non era ancora stato inventato!

---

## 🛡️ Licenza, Sicurezza e Governance

Questa libreria viene eseguita al **100% offline e localmente** sulla tua macchina. Il codice è aperto, pulito e non effettua alcuna richiesta di rete per trasmettere le tue parole o chiavi private. La sicurezza prima di tutto.

*   **Licenza:** MIT (Creato nel 2023)
*   **Crediti:** Progetto [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/).
