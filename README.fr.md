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


**cryptoseed** est une bibliothèque de classe entreprise, légère et de haute performance développée en **JavaScript Pur** (Node.js) conçue pour le diagnostic, la validation et la récupération de phrases mnémoniques (*seed phrases*) cryptographiques perdues, désordonnées ou saisies avec des fautes d'orthographe.

Développée dans l'écosystème de sécurité et d'infrastructure de [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net), sous la direction de [diegooris](https://diegohorantunes.web.app/)), la bibliothèque a été conçue pour fournir aux développeurs et analystes de sécurité une robustesse maximale, une vitesse de recherche ultra-rapide et une précision historique chirurgicale pour la dérivation d'adresses sur **39 blockchains et écosystèmes différents**. Tout cela fonctionne de manière 100% autonome, sans dépendances de compilation C/C++ native ni paquets externes qui pourraient compromettre la portabilité de la version compilée.

---

## 📅 Variations de BIP Supportées et Chronologie Historique

Pour récupérer des fonds avec précision, il ne suffit pas de connaître les mots ; vous devez comprendre les spécifications techniques et l'année de création du portefeuille. **cryptoseed** implémente et respecte rigoureusement les normes historiques (BIPs).

### 🔍 Tableau des Normes BIP Implémentées et Alignées

| BIP | Nom | Implémentation & Support dans **cryptoseed** |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **Support Complet.** Fondation de l'arbre de dérivation HD. Permet au moteur de dériver des chemins infinis de clés publiques/privées (`xprv`/`xpub`) à partir d'une seule graine principale en utilisant des mathématiques de courbe elliptique pures via notre moteur de clés. |
| **BIP-39** | *Mnemonic Code* | **Support Complet.** Le standard le plus répandu. Supporte les phrases de **12, 15, 18, 21 ou 24 mots** avec vérification de l'intégrité intégrée (*checksum*) de 4 à 8 bits et dictionnaires en **10 langues** différentes. |
| **BIP-43** | *Purpose Field* | **Support Complet.** Respecte la structure qui a introduit le champ de but (`m / purpose'`) au sommet de l'arbre des chemins, assurant un routage correct vers les portefeuilles multi-usages. |
| **BIP-44** | *Multi-Account* | **Support Complet.** Le chemin de dérivation standard le plus utilisé dans l'industrie : `m/44'/coin_type'/account'/change/address_index`. Utilisé par défaut pour Bitcoin Legacy, Ethereum, EVMs, Solana Legacy, TRON, Cardano Legacy, etc. |
| **BIP-45** | *Multisig HD* | **Alignement de Chemins.** Utilisé pour les portefeuilles multi-signatures dans les chemins de but `m/45'`. Si vous récupérez une graine individuelle faisant partie d'un portefeuille multisig BIP-45, le moteur dérive les clés privées individuelles normalement. |
| **BIP-47** | *Payment Codes* | **Compatibilité des Graines.** Codes de paiement réutilisables et privés (comme les portefeuilles Samourai). La sauvegarde des portefeuilles utilisant le BIP-47 est une graine BIP-39 standard de 12 ou 24 mots. **cryptoseed** récupère cette graine maîtresse parfaitement. |
| **BIP-48** | *Multisig Structure* | **Compatibilité.** Structure multisig avancée basée sur BIP-43 utilisant le chemin `m/48'/coin_type'/...`. Compatible pour récupérer la graine maîtresse signant ces transactions multi-signatures. |
| **BIP-49** | *Nested SegWit* | **Support Complet.** Adresses Bitcoin de transition commençant par le caractère `3` (format P2SH-P2WPKH), dérivées sous le chemin officiel `m/49'/0'/0'/0/index`. |
| **BIP-84** | *Native SegWit* | **Support Complet.** Adresses Bitcoin modernes de haute performance commençant par `bc1q` et Litecoin commençant par `ltc1` (format Bech32), dérivées sous `m/84'/0'/0'/0/index` (et `m/84'/2'/...` pour LTC). |
| **BIP-85** | *Child Seeds* | **Compatibilité Conceptuelle.** Permer à une graine principale BIP-39 de générer de nouvelles sous-graines sécurisées (de 12 ou 24 mots) pour d'autres portefeuilles sous les chemins comme `m/85'/...`. Si votre graine perdue est une graine enfant dérivée par le BIP-85, le moteur la récupérera comme toute graine BIP-39 normale. |
| **BIP-86** | *Taproot* | **Support Complet.** Adresses Bitcoin de dernière génération (Schnorr/Taproot) commençant par `bc1p` (Bech32m), dérivées sous le chemin standard `m/86'/0'/0'/0/index`. |

---

## ⚡ Pourquoi cryptoseed a-t-il été créé ?

Lorsque j'ai dû récupérer des portefeuilles pour des clients et des amis de l'écosystème [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net), j'ai réalisé que les outils existants étaient soit trop complexes (nécessitant des compilations C++ natives qui cassaient Node) soit ne comprenaient pas la transition historique des blockchains. J'ai créé cette bibliothèque pour proposer les solutions suivantes :

1.  **Zéro Dépendance Native (Pure JS):** Fonctionne sans problème sous Windows, Linux ou macOS. Idéal pour compiler des exécutables portables avec `pkg`.
2.  **Technologie de "Découpage de Lettres" (Prefix Fallback):** J'ai écrit un algorithme qui, si vous saisissez un mot incorrect comme `engino`, découpera le mot caractère par caractère (`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`) pour identifier automatiquement le mot le plus probable dans le dictionnaire officiel.
3.  **Gestion Intelligente des Mots Manquants:** Si l'algorithme trouve un mot inconnu sans correspondance de préfixe dans le dictionnaire, il le convertit automatiquement en un caractère générique (`*`) pour tester toutes les possibilités du dictionnaire 1 par 1 de manière automatisée.
4.  **Élagage Précoce des Branches (Early Branch Pruning):** J'ai développé le moteur de recherche avec un élagage précoce basé sur des contraintes (mots requis et exclus - NOK), évitant au processeur de calculer des milliards de permutations inutiles.
5.  **Contournement Intégré du Checksum:** Comme les graines BIP-39 contiennent des sommes de contrôle, le code élimine **99.6%** de toutes les combinaisons générées avant même de tenter les calculs complexes de courbe elliptique, économisant 1000 fois le temps de processeur.

---

## 🛠️ Fonctionnalités de Récupération et Ingénierie de Recherche

Développé à l'origine en **2023** comme outil propriétaire exclusif pour l'écosystème de la [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net)), **cryptoseed** a été ouvert au public pour offrir une infrastructure de récupération scientifiquement supérieure aux solutions ordinaires du marché. Le moteur de recherche présente les capacités et distinctions technologiques suivantes :

### 🎯 Classification des États par Mot
Contrairement aux scripts de récupération basiques, l'assistant interactif vous permet de configurer l'état de confiance de chaque mot individuel de la graine mnémonique en utilisant trois classifications :
* **✔️**: Le mot et sa position exacte dans la phrase sont confirmés. Le moteur verrouille ce mot et concentre sa puissance de calcul exclusivement sur les autres emplacements.
* **🔀**: Le mot est connu pour appartenir à la phrase, mais sa position est incorrecte ou incertaine. Le moteur considère dynamiquement ce mot pour des permutations sécurisées uniquement sur les emplacements disponibles, évitant ainsi les tests redondants.
* **🎲**: Le mot est totalement inconnu, perdu ou illisible. Le moteur teste automatiquement et de manière exhaustive toutes les possibilités du dictionnaire correspondant.

### 📊 Pré-traitement et Estimations de Faisabilité
Avant de dépenser de l'énergie informatique, le moteur analyse la phrase et les contraintes fournies pour afficher un tableau mathématique détaillé :
* **Espace de Recherche Brut**: Affiche le total mathématique exact des combinaisons théoriques basées sur votre configuration.
* **Élagage de l'Arbre (Somme de Contrôle & Filtres)**: Indique combien de combinaisons restent après l'application de filtres logiques immédiats (tels que les sommes de contrôle ou les exclusions de mots NOK), réduisant ainsi considérablement le volume de dérivations de clés.
* **Projections de Temps d'Analyse**: Compare en temps réel les estimations de temps de scan à l'aide d'une connexion moyenne (APIs publiques) par rapport à une connexion locale ultra-rapide (nœuds RPC locaux).
* **Alerte d'Infaisabilité**: Le moteur alerte l'utilisateur de manière transparente si la complexité configurée nécessite des ressources de supercalcul, évitant ainsi les blocages matériels inutiles.

### 🌐 Multiples Moteurs de Validation et Formats
L'écosystème prend en charge différentes structures cryptographiques avec des règles de validation spécifiques :
* **Moteur BIP-39**: Prise en charge des graines de **12, 15, 18, 21 et 24 mots**, appliquant une validation de somme de contrôle (*checksum*) intégrée pour éliminer **99.6%** des fausses combinaisons avant toute dérivation.
* **Moteur Electrum**: Validation et dérivation adaptées exactement aux règles exclusives des graines mnémoniques Electrum (Legacy et Modern).
* **Moteur Electron Cash**: Adaptation précise de la logique de dérivation et de validation du checksum de l'écosystème Bitcoin Cash.
* **Mode Sans Validation (Force Brute)**: Générateur brut de dérivation sans filtre de somme de contrôle, idéal pour les formats hérités propriétaires ou les phrases personnalisées non standard, garantissant une couverture de recherche maximale.

### 🧩 Résolution de Cas Complexes Combinés
Le moteur résout des problèmes combinés complexes en une seule exécution, notamment :
* Un ou plusieurs mots complètement perdus dans des positions connues ou inconnues.
* Mots connus avec un ordre complètement mélangé.
* Scénarios mixtos (ex. graines où certains mots sont manquants alors que les mots connus ne sont pas dans le bon ordre).
* Choix du profil de recherche : **Vitesse Maximale** (avec sommes de contrôle et contraintes) ou **Couverture Maximale** (force brute mathématique globale).

---

## ⚙️ Installation

### Installation Globale (Pour exécuter l'utilitaire CLI interactif directement dans le terminal)
```bash
npm install -g cryptoseed
```

### Installation Locale (Pour importer les logiques dans votre projet Node)
```bash
npm install cryptoseed
```

---

## 🛡️ Utilisation de l'API (JavaScript)

La bibliothèque met à disposition des exports propres et bien structurés pour une intégration immédiate des logiques de sécurité de [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) dans votre application :

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. Corriger un mot erroné avec le "Découpage de Lettres"
const dictionnaire = wordlists.bip39.fr || wordlists.bip39.en;
const motErrone = "*";
const suggestions = typo.getPrefixSuggestions(motErrone, dictionnaire);
console.log("Mot déduit :", suggestions); // Retourne [ 'engine' ]

// 2. Dériver l'adresse publique réelle pour MetaMask (EVM)
const seed = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const adresseEth = addressDeriver.deriveAddress(seed, 'metamask', 'ETH', 0);
console.log("Adresse Ethereum :", adresseEth);

// 3. Dériver l'adresse personnalisée en utilisant la cryptographie B2 Wallet
const adresseB2 = addressDeriver.deriveAddress(seed, 'b2wallet', 'BTC', 0);
console.log("Adresse Bitcoin dans B2 Wallet :", adresseB2);
```

---

## 💻 CLI Interactive

Tapez simplement la commande principale dans votre terminal et suivez l'assistant :
```bash
cryptoseed
```

### Commandes d'Aide et d'Information Historique

*   **Aide rapide (`-h` ou `--help`):** Affiche le guide d'utilisation et les options de ligne de commande.
    ```bash
    cryptoseed --help
    ```
*   **Recueil d'informations (`-i` ou `--info`):** Affiche un résumé historique complet de chaque blockchain supportée, les chemins par défaut utilisés par année et les portefeuilles compatibles. Excellent pour savoir où de vieux fonds pourraient être stockés !
    ```bash
    cryptoseed --info
    ```

---

## 🧮 Mathématiques et Limites de Viabilité

Si vous avez perdu votre graine, vous devez être réaliste quant aux probabilités. J'ai configuré le moteur pour afficher des alertes réalistes avant de lancer une recherche lourde :

### Tableau des Combinaisons BIP-39 (Dictionnaire de 2048 Mots)

| Mots Perdus | Calcul de Combinaisons | Total des Possibilités | Viabilité Réelle |
| :---: | :---: | :---: | :--- |
| **1 Mot** | $2048^1$ | **2 048** | **Totalement Viable** (Fractions de seconde sur n'importe quel CPU) |
| **2 Mots** | $2048^2$ | **4 194 304** | **Viable** (Quelques secondes avec notre moteur optimisé) |
| **3 Mots** | $2048^3$ | **8 589 934 592** | **Très Lourd** (Viable si vous connaissez les positions ou si vous avez des contraintes) |
| **4 Mots** | $2048^4$ | **17 592 186 044 416** | **Inviable** pour les ordinateurs ordinaires (prendrait des semaines/mois) |
| **5 Mots** | $2048^5$ | **36 028 797 018 963 968**| **Mathématiquement Impossible** (Nécessiterait des superordinateurs) |

---

## 📊 Matrice des Blockchains et Portefeuilles Supportés (39 Réseaux)

Voici la liste complète et détaillée des 39 réseaux et écosystèmes pris en charge nativement par le moteur de dérivation de **cryptoseed**, garantissant une compatibilité descendante et contemporaine :

| Écosystème / Réseau | Symbole | Chemin de Dérivation par Défaut (HD Path) | Portefeuilles de Référence Compatibles |
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

## 🛠️ Performance : Nœud RPC local vs API publique

À la fin de chaque recherche, **cryptoseed** enregistre un rapport de récupération détaillé sur votre disque (`resultado_recuperacao_[timestamp].txt`) et fournit une estimation en temps réel de la vitesse de requête pour vérifier si les adresses trouvées ont des fonds en ligne :

*   **Requêtes via API Publiques (50ms par requête):** Utile uniquement si vous avez très peu de graines candidates ($<100$). Souffre de la latence d'internet et des limites de taux.
*   **Requêtes via Nœud RPC Local (0.1ms par requête):** La solution idéale pour les recherches volumineuses ($>1000$ graines). Divise le temps d'analyse par **500** en s'exécutant localement sur votre propre machine.

---

## 🎓 Easter Egg de l'ère Satoshi (2009 - 2010)

Si vous tentez de sélectionner dans l'assistant que votre portefeuille a été créé en ou avant **2010**, le programme s'arrêtera et vous dévoilera un secret historique : **À cette époque originelle, les graines mnémoniques de récupération N'EXISTAIENT PAS !**
Le client d'origine de Satoshi Nakamoto (Bitcoin-Qt) générait des clés privées aléatoires enregistrées directement dans le fichier binaire `wallet.dat`. Si vous avez perdu ce fichier, aucune phrase de récupération ne pourra récupérer vos fonds, car le concept de graine mnémonique déterministe n'avait simplement pas encore été inventé !

---

## 🛡️ Licence, Sécurité et Gouvernance

Cette bibliothèque s'exécute de manière **100% locale et hors ligne** sur votre machine. Le code est ouvert, propre et n'effectue aucune requête réseau pour transmettre vos mots ou clés privées. La sécurité avant tout.

*   **Licence :** MIT (Créé en 2023)
*   **Crédits :** Projet [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/).
