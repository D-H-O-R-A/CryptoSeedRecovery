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


**cryptoseed** は、紛失、順序の入れ替わり、またはスペルミスで入力された暗号資産の暗号化ニーモニックシードフレーズ（*seed phrases*）の診断、検証、および復旧のために設計された、**純粋な JavaScript** (Node.js) で開発された軽量かつ高性能なエンタープライズクラスのライブラリです。

[**b2 wallet**](https://better2better.com.br/softwares/b2-wallet)（[diegooris](https://diegohorantunes.web.app/) の指導の下、[better2better](https://better2better.net) が運営するセキュリティおよびインフラエコシステム）の下で開発されたこのライブラリは、開発者やセキュリティアナリストに最大限の堅牢性、超高速検索、および **39 の異なるブロックチェーンとエコシステム**におけるアドレス導出の外科的な歴史的正確性を提供するように設計されています。これらはすべて、ビルドのポータビリティを損なう可能性のあるネイティブな C/C++ コンパイル依存関係や外部パッケージなしで、100% 自律的に動作します。

---

## 📅 サポートされている BIP バリエーションと歴史的タイムライン

資金を正確に復旧するには、単に単語を知っているだけでは不十分です。技術的な仕様とウォレットが作成された年を理解する必要があります。**cryptoseed** は、歴史的な標準（BIP）を厳格に実装し、準拠しています。

### 🔍 実装および調整された BIP 標準一覧表

| BIP | 規格名 | **cryptoseed** における実装およびサポート状況 |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **完全サポート。** HD 導出ツリーの数学的基盤です。私たちのキーエンジンを介して純粋な楕円曲線数学を使用し、単一のマスターシードから公開鍵/秘密鍵（`xprv`/`xpub`）の無限のパスをエンジンが導出できるようにします。 |
| **BIP-39** | *Mnemonic Code* | **完全サポート。** 業界の共通標準。**10 の異なる言語**の辞書と、統合された 4〜8 ビットのチェックサム（*checksum*）検証により、**12、15、18、21、または 24 語**のフレーズをサポートします。 |
| **BIP-43** | *Purpose Field* | **完全サポート。** パスツリーの最上部で目的フィールド（`m / purpose'`）を導入した構造に準拠し、エンジンが多目的ウォレットに正しくルーティングできるようにします。 |
| **BIP-44** | *Multi-Account* | **完全サポート。** 業界で最も一般的な導出パス標準：`m/44'/coin_type'/account'/change/address_index`。Bitcoin Legacy、Ethereum、EVM 互換チェーン、Solana Legacy、TRON、Cardano Legacy などにデフォルトで使用されます。 |
| **BIP-45** | *Multisig HD* | **パスの整合。** 目的パス `m/45'` のマルチシグウォレットに使用されます。BIP-45 マルチシグ設定の一部である個別のシードを復旧する場合、エンジンはこのパスから通常通りに個別の秘密鍵を導出します。 |
| **BIP-47** | *Payment Codes* | **シード互換性。** 再利用可能でプライベートなペイメントコード（Samourai ウォレットなど）。BIP-47 を使用するウォレット的のバックアップは、標準の 12 語または 24 語の BIP-39 シードです。**cryptoseed** はこのマスターシードを完璧に復旧します。 |
| **BIP-48** | *Multisig Structure* | **互換性。** パス `m/48'/coin_type'/...` を使用した BIP-43 に基づく高度なマルチシグ構造。これらのマルチシグトランザクションを署名するマスターシードの復旧に対応しています。 |
| **BIP-49** | *Nested SegWit* | **完全サポート。** 公式パス `m/49'/0'/0'/0/index` の下で導出される、文字 `3` で始まるビットコインの移行アドレス（P2SH-P2WPKH 形式）。 |
| **BIP-84** | *Native SegWit* | **完全サポート。** `m/84'/0'/0'/0/index`（LTC の場合は `m/84'/2'/...`）の下で導出される、`bc1q` で始まるモダンで高性能なビットコインアドレス、および `ltc1` で始まるライトコインアドレス（Bech32 形式）。 |
| **BIP-85** | *Child Seeds* | **概念的互換性。** BIP-39 マスターシードが、`m/85'/...` のようなパスの下で他のウォレット向けに新しい安全なサブシード（12 語または 24 語）を生成できるようにします。紛失したシードが BIP-85 によって導出された子シードである場合、エンジンは通常の BIP-39 シードと同様にそれを復旧します。 |
| **BIP-86** | *Taproot* | **完全サポート。** 標準パス `m/86'/0'/0'/0/index` の下で導出される、`bc1p` で始まる次世代ビットコインアドレス（Schnorr/Taproot 署名）（Bech32m 形式）。 |

---

## ⚡ なぜ cryptoseed が作成されたのか？

[**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net) エコシステムのお客様や友人のためにウォレットを復旧する必要があったとき、既存のツールは過度に複雑（Node を破損させるネイティブな C++ コンパイルが必要）であるか、ブロックチェーンの歴史的な変遷を理解していないかのどちらかであることに気づきました。私は以下のソリューションを提供するためにこのライブラリを作成しました：

1.  **ネイティブ依存関係ゼロ (Pure JS):** Windows、Linux、または macOS 上で問題なく動作します。`pkg` を使用してポータブルな実行可能ファイルをコンパイルするのに最適です。
2.  **「文字スライス」テクノロジー (Prefix Fallback):** `engino` のような誤った単語を入力した場合、公式辞書から最も可能性の高い単語を自動的に特定するために、単語をキャラクターごとにスライスする（`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`）アルゴリズムを作成しました。
3.  **スマートな紛失単語処理:** 辞書にプレフィックスの一致がない未知の単語をアルゴリズムが検出した場合、辞書のすべての可能性を自動的に 1 つずつテストするために、それを自動的にワイルドカード（`*`）に変換します。
4.  **早期の枝刈り (Early Branch Pruning):** 制約（必須単語および除外単語 - NOK）に基づく早期の枝刈りを備えた検索エンジンを開発し、プロセッサが何十億もの無駄な組み合わせを計算するのを防ぎました。
5.  **統合されたチェックサムバイパス:** BIP-39 シードにはチェックサムが含まれているため、コードは重い楕円曲線計算を試みる前に、生成されたすべての組み合わせの **99.6%** を破棄し、CPU 時間を 1000 倍節約します。

---

## 🛠️ 復旧機能と検索エンジニアリング

もともと **2023** 年に [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net)) エコシステム専用のツールとして開発された **cryptoseed** は、市場の一般的なソリューションに比べて科学的に優れた復旧インフラを提供することを目的として一般公開されました。検索エンジンは以下の機能と技術的な利点を備えています：

### 🎯 単語ごとの状態分類
単純な復旧スクリプトとは異なり、インタラクティブなウィザードでは、3つのセマンティック分類を使用して、シード内の各単語の信頼状態を個別に構成できます：
* **✔️**: 単語とそのシード内の正確な位置が確認されています。エンジンはこの単語を固定し、処理能力を残りのスロットのみに集中させます。
* **🔀**: 単語は既知でありセットに属していますが、その位置が正しくないか不確実です。エンジンは、利用可能な空きスロットでの安全な順列についてのみこの単語を動的に処理し、無駄なテストを回避します。
* **🎲**: 単語が完全に失われているか、判読不能です。エンジンは、対応する形式の辞書内のすべての可能性を自動的かつ網羅的にテストします。

### 📊 前処理と実現可能性の見積もり
計算エネルギーを消費する前に、エンジンは提供された制約とシードを分析し、詳細な数学的パネルを表示します：
* **生検索スペース**: 構成された構造が持つ理論的な組み合わせの正確な数学的合計を表示します。
* **ツリーの枝刈り (チェックサムとフィルター)**: チェックサムや NOK 単語制約などの論理フィルターを適用した後に残る組み合わせの数を報告し、重いキー導出の計算量を大幅に削減します。
* **スキャン時間の予測**: 平均遅延接続（パブリック API）と高性能ローカル接続（ローカル RPC ノード）を使用したリアルタイムのスキャン時間予測を比較します。
* **実行不可能性の警告**: 構成された複雑さがスーパーコンピューターのパワーを必要とする場合、エンジンはユーザーに透過的に警告し、ユーザーのハードウェアが無駄にロックされるのを防ぎます。

### 🌐 複数の検証エンジンと形式
エコシステムは、形式固有の検証ルールを持つ異なる暗号構造をサポートしています：
* **BIP-39 エンジン**: **12、15、18、21、および 24 語**のシードをサポートし、導出前に誤った仮説の **99.6%** を排除するために統合された整合性チェック（*checksum*）を適用します。
* **Electrum エンジン**: Electrum シード（Legacy および Modern）の独自のルールに基づく検証と導出。
* **Electron Cash エンジン**: Bitcoin Cash エコシステムの導出およびチェックサム検証ロジックの正確な移植。
* **検証なしモード (総当たり)**: チェックサムチェックのない生導出エンジン。独自のレガシー形式や非標準のカスタムシードに最適で、最大の検索範囲を保証します。

### 🧩 複雑な複合状況の解決
エンジンは、1 回の実行で以下の高難度の問題を解決します：
* 既知または未知の位置で完全に失われた 1 つ以上の単語。
* 順序が混ざり合った既知の単語。
* 混合シナリオ（例：単語が欠落しており、同時に既知の単語の順序も崩れている場合）。
* 検索プロファイルの選択：**最高速度**（チェックサムと制約を使用）または**最大範囲**（広範な数学的総当たり）。

---

## ⚙️ インストール

### グローバルインストール（インタラクティブな CLI ツールをターミナルで直接実行する場合）
```bash
npm install -g cryptoseed
```

### ローカルインストール（Node プロジェクトにロジックをインポートする場合）
```bash
npm install cryptoseed
```

---

## 🛡️ コードでの使用方法（JavaScript API）

このライブラリは、アプリケーションに [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) のセキュリティロジックを即座に統合するための、クリーンでよく構造化されたエクスポートを提供します：

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. 「文字スライス」を使用してスペルミスを修正する
const dictionary = wordlists.bip39.ja || wordlists.bip39.en;
const wordWithError = "*";
const suggestions = typo.getPrefixSuggestions(wordWithError, dictionary);
console.log("推測された単語:", suggestions); // [ 'engine' ] を返します

// 2. MetaMask (EVM) の実際の公開鍵アドレスを導出する
const seed = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const ethAddress = addressDeriver.deriveAddress(seed, 'metamask', 'ETH', 0);
console.log("Ethereum アドレス:", ethAddress);

// 3. B2 Wallet の暗号化技術を使用してカスタムアドレスを導出する
const b2Address = addressDeriver.deriveAddress(seed, 'b2wallet', 'BTC', 0);
console.log("B2 Wallet 上の Bitcoin アドレス:", b2Address);
```

---

## 💻 インタラクティブ CLI

ターミナルでメインコマンドを入力し、ウィザードに従うだけです：
```bash
cryptoseed
```

### ヘルプおよび歴史に関するコマンド

*   **クイックヘルプ (`-h` または `--help`):** 使用ガイドとコマンドラインオプションを表示します。
    ```bash
    cryptoseed --help
    ```
*   **情報コンペンディウム (`-i` または `--info`):** サポートされている各ブロックチェーンの完全な歴史的要約、年別に使用されている標準の HD パス、および互換性のあるウォレットを表示します。古い資金がどこに保管されているかを見つけるのに最適です！
    ```bash
    cryptoseed --info
    ```

---

## 🧮 その数学的背景と実現可能性の限界

シードを紛失した場合、復旧の確率について現実的になる必要があります。負荷の高い検索を開始する前に、現実的な警告を表示するように検索エンジンをプログラムしました：

### BIP-39 組み合わせ表（2048語の辞書）

| 紛失した単語の数 | 組み合わせの計算 | 合計の可能性 | 実際の実現可能性 |
| :---: | :---: | :---: | :--- |
| **1 語** | $2048^1$ | **2,048** | **完全に可能**（任意の CPU で 1 秒の数分の一） |
| **2 語** | $2048^2$ | **4,194,304** | **可能**（最適化されたエンジンにより数秒） |
| **3 語** | $2048^3$ | **8,589,934,592** | **非常に重い**（単語の位置がわかっているか、制約がある場合は可能） |
| **4 語** | $2048^4$ | **17,592,186,044,416** | **実行不可能**（一般的な PC では数週間または数ヶ月かかります） |
| **5 語** | $2048^5$ | **36,028,797,018,963,968**| **数学的に不可能**（スーパーコンピュータが必要） |

---

## 📊 サポートされているブロックチェーンとウォレットのマトリクス（39ネットワーク）

以下は、**cryptoseed** 導出エンジンによってネイティブにサポートされているすべての 39 のネットワークとエコシステムの詳細なリストであり、後方互換性および現代の互換性を保証します：

| エコシステム / ネットワーク | シンボル | デフォルトの導出パス (HD Path) | 互換性のある参照ウォレット |
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

## 🛠️ パフォーマンス：ローカル RPC ノード vs 公開 API

各検索の終了時に、**cryptoseed** は詳細な復旧レポートをディスクに保存し（`resultado_recuperacao_[timestamp].txt`）、見つかったシードがオンチェーンで資金を持っているかどうかを検証するために必要なクエリ速度の現実的な予測を提供します：

*   **公開 API によるクエリ（リクエストあたり 50ms）：** 候補シードが極めて少ない場合（$<100$）にのみ有用です。インターネットの遅延やリクエストレート制限の影響を受けます。
*   **ローカル RPC ノードによるクエリ（リクエストあたり 0.1ms）：** 大規模な検索（$>1000$ シード）にとって理想的なアプローチです。自身のマシンでローカルに実行することにより、総スキャン時間を最大 **500 分の 1** に短縮できます。

---

## 🎓 サトシ時代のイースターエッグ (2009 - 2010)

アシスタントでウォレットが **2010年以前**に作成されたことを選択しようとすると、プログラムは実行を停止し、歴史的な秘密を明らかにします：**この創世記（ジェネシス）の時代、ニーモニック復旧シードフレーズは存在していませんでした！**
サトシ・ナカモトのオリジナルのクライアント（Bitcoin-Qt）は、バイナリファイル `wallet.dat` に保存されたランダムな秘密鍵を使用していました。このファイルを紛失した場合、決定論的なシードはまだ発明されていなかったため、いかなる単語のフレーズも資金を復旧することはできません！

---

## 🛡️ ライセンス、セキュリティ、およびガバナンス

このライブラリは、お使いのマシンで **100% オフラインかつローカル**に動作します。コードはオープンでクリーンであり、単語や秘密鍵を送信するためのネットワークリクエストは一切行いません。セキュリティ第一。

*   **ライセンス:** MIT (2023年に開発)
*   **クレジット:** [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/) プロジェクト。
