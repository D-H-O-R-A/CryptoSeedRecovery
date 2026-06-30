# 🛡️ cryptoseed

🌍 **Select Language / Selecione o Idioma:**
[Português](./README.md) | [English](./README.en.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Italiano](./README.it.md) | [Türkçe](./README.tr.md) | [Русский](./README.ru.md) | [简体中文](./README.zh.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [עברית](./README.he.md)


**cryptoseed** 是一个企业级、轻量级且高性能的**纯 JavaScript** (Node.js) 库，专为诊断、验证和恢复丢失、被打乱或拼写错误的加密货币助记词（*seed phrases*）而设计。

本库在 **b2 wallet**（由 [diegooris](https://diegohorantunes.web.app/) 领导的 [better2better](https://better2better.net) 旗下安全与基础设施生态系统）支持下开发，旨在为开发人员和安全分析师提供极高的鲁棒性、高速搜索能力以及在 **39 个不同的区块链和生态系统**中进行地址派生的精准历史兼容性。全部功能 100% 离线自主运行，无需任何 C/C++ 原生编译依赖，也无需任何可能影响构建移植性的外部包。

---

## 📅 支持的 BIP 规范与历史时间线

为了准确恢复资金，仅知道单词是不够的；您还必须了解钱包创建时的技术规范和年份。**cryptoseed** 严格实现并遵循历史标准（BIP）。

### 🔍 已实现的规范标准对照表

| BIP | 规范名称 | **cryptoseed** 中的实现与支持情况 |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **完全支持。** HD 派生树的数学基础。允许引擎通过我们自主研发的的私钥/公钥引擎，利用纯椭圆曲线数学从单个主种子派生出无限的 `xprv`/`xpub` 路径。 |
| **BIP-39** | *Mnemonic Code* | **完全支持。** 行业通用标准。支持 **12, 15, 18, 21 或 24 个单词**的助记词，内置 4 到 8 位校验和（*checksum*）验证，并支持 **10 种语言**字典。 |
| **BIP-43** | *Purpose Field* | **完全支持。** 遵循在派生树顶部引入目的字段 (`m / purpose'`) 的结构，确保引擎正确地将地址路由到多用途钱包。 |
| **BIP-44** | *Multi-Account* | **完全支持。** 行业最通用的派生路径标准：`m/44'/coin_type'/account'/change/address_index`。默认用于 Bitcoin Legacy、Ethereum、EVM 兼容链、Solana Legacy、TRON、Cardano Legacy 等。 |
| **BIP-45** | *Multisig HD* | **路径对齐。** 用于 `m/45'` 目的路径的多签名钱包。如果您要恢复属于 BIP-45 多签配置的单个种子，引擎会正常从该路径派生单个私钥。 |
| **BIP-47** | *Payment Codes* | **种子兼容性。** 可重复使用且私密的付款码（如 Samourai 钱包）。使用 BIP-47 的钱包备份是标准的 12 或 24 单词 BIP-39 种子。**cryptoseed** 可以完美地恢复该主种子。 |
| **BIP-48** | *Multisig Structure* | **兼容性。** 基于 BIP-43 的高级多签结构，使用路径 `m/48'/coin_type'/...`。兼容恢复用于签署这些多签交易的主种子。 |
| **BIP-49** | *Nested SegWit* | **完全支持。** 以字符 `3` 开头的比特币过渡地址（P2SH-P2WPKH 格式），派生自官方路径 `m/49'/0'/0'/0/index`。 |
| **BIP-84** | *Native SegWit* | **完全支持。** 以 `bc1q` 开头的现代高性能比特币地址和以 `ltc1` 开头的莱特币地址（Bech32 格式），派生自 `m/84'/0'/0'/0/index`（莱特币为 `m/84'/2'/...`）。 |
| **BIP-85** | *Child Seeds* | **概念兼容性。** 允许 BIP-39 主种子在类似 `m/85'/...` 的路径下为其他钱包生成新的安全子种子（12 或 24 个单词）。如果您丢失的种子是由 BIP-85 派生的子种子，引擎将像处理任何普通的 BIP-39 种子一样将其恢复。 |
| **BIP-86** | *Taproot* | **完全支持。** 以 `bc1p` 开头的最新一代比特币地址（Schnorr/Taproot 签名）（Bech32m 格式），派生自标准路径 `m/86'/0'/0'/0/index`。 |

---

## ⚡ 为什么创建 cryptoseed？

当我们需要为 **b2 wallet** / [better2better](https://better2better.net) 生态系统的客户和朋友恢复钱包时，我发现现有工具要么过于复杂（需要会破坏 Node 的原生 C++ 编译环境），要么无法理解区块链的历史演变。我创建了这个库来提供以下解决方案：

1.  **零原生依赖 (纯 JS):** 在 Windows、Linux 或 macOS 上均可开箱即用。极佳地支持使用 `pkg` 编译为便携式独立可执行文件。
2.  **“字母裁剪”技术 (Prefix Fallback):** 独创的纠错算法。如果您输入了错误的单词（如 `engino`），它将逐个字符进行裁剪分析（`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`），自动在官方字典中定位并建议正确的 BIP-39 单词。
3.  **智能缺失单词恢复:** 如果算法遇到没有前缀匹配的未知单词，会自动将其转换为通配符 (`*`)，并自动对字典中的所有可能性进行 1 对 1 穷举测试。
4.  **早期分支修剪 (Early Branch Pruning):** 搜索树会根据约束条件进行早期剪枝（必须包含的单词以及排除的单词 - NOK），避免 CPU 计算数十亿次无用的排列组合。
5.  **内置校验和快速旁路 (Checksum Bypass)：** 由于 BIP-39 助记词包含校验和，引擎在执行繁重的椭圆曲线数学计算之前会提前过滤并丢弃 **99.6%** 的生成组合，从而节省 1000 倍的 CPU 时间。

---

## 🛠️ 恢复功能与搜索工程

**cryptoseed** 最初于 **2023** 年开发，是 **b2 wallet** ([better2better](https://better2better.net)) 生态系统的专属内部工具。现已面向公众开源，旨在提供在科学上远超市场普通方案的恢复基础设施。该搜索引擎具备以下核心能力与技术优势：

### 🎯 助记词状态分类标注
与常规恢复脚本不同，交互式向导允许您使用三种语义分类，为助记词中的每个单词配置个性化的信任状态：
* **✔️**: 单词及其在助记词中的确切位置已确认。引擎锁定此单词，并将计算资源完全集中在其余卡槽上。
* **🔀**: 单词已知且属于该集合，但位置不正确或不确定。引擎仅在空闲插槽中动态考虑该单词以进行安全排列组合，避免重复测试。
* **🎲**: 单词完全丢失或无法辨认。引擎自动对相应格式的字典可能性进行全面且详尽的穷举测试。

### 📊 预处理与可行性评估
在消耗计算资源之前，引擎会对助记词及提供的限制条件进行分析，以显示详细的数学面板：
* **原始搜索空间**: 显示当前配置所拥有的理论排列组合精确数学总数。
* **树木修剪 (校验和与过滤器)**: 报告在应用即时逻辑过滤器（如校验和或 NOK 单词限制）后还剩下多少种组合，极大地减少了重型密钥派生的计算量。
* **扫描时间投影**: 实时对比使用平均延迟连接（公共 API）与极速本地连接（本地 RPC 节点）的扫描时间估算。
* **不可行性警示**: 如果配置的复杂度超出了普通硬件的极限而需要超级计算机，引擎会透明地警告用户，防止无谓地锁定用户硬件。

### 🌐 多重验证引擎与格式支持
该生态系统支持多种具有特定验证规则的密码学结构：
* **BIP-39 引擎**: 支持 **12, 15, 18, 21 和 24 单词**的助记词，应用内置完整性检查 (*checksum*)，在派生密钥前直接剔除 **99.6%** 的错误假设。
* **Electrum 引擎**: 基于 Electrum 助记词（Legacy 和 Modern）独特规则的验证与派生。
* **Electron Cash 引擎**: 完美适配 Bitcoin Cash 生态系统的派生与校验和验证逻辑。
* **免验证模式 (暴力破解)**: 无校验和检查的纯粹密钥派生引擎，特别适合专有的传统格式或非标准自定义助记词，确保最大程度的搜索覆盖面。

### 🧩 解决复杂组合场景
该引擎支持在单次运行中解决极高复杂度的混合问题，包括：
* 在已知或未知位置完全丢失一个或多个单词。
* 已知单词，但顺序被打乱。
* 混合场景（例如：既缺失单词，同时已知单词的顺序也是错误的）。
* 搜索偏好选择：**极速模式**（使用校验和及约束条件）或**全面模式**（大范围数学暴力破解）。

---

## ⚙️ 安装说明

### 全局安装（以便在终端中直接运行交互式 CLI 恢复工具）
```bash
npm install -g cryptoseed
```

### 本地安装（以便在您的项目代码中导入为开发库）
```bash
npm install cryptoseed
```

---

## 🛡️ 代码 API 调用示例 (JavaScript)

本库提供了清晰且结构良好的导出，以便在您的应用程序中立即集成 **b2 wallet** 安全逻辑：

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. 使用“字母裁剪”技术纠正拼写错误
const dictionary = wordlists.bip39.zh_cn || wordlists.bip39.en;
const wordWithError = "*";
const suggestions = typo.getPrefixSuggestions(wordWithError, dictionary);
console.log("推导单词为:", suggestions); // 输出: [ 'engine' ]

// 2. 派生 MetaMask (EVM) 真实公钥地址
const seed = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const ethAddress = addressDeriver.deriveAddress(seed, 'metamask', 'ETH', 0);
console.log("Ethereum 地址:", ethAddress);

// 3. 使用 B2 Wallet 密码学派生自定义地址
const b2Address = addressDeriver.deriveAddress(seed, 'b2wallet', 'BTC', 0);
console.log("B2 Wallet 上的 Bitcoin 地址:", b2Address);
```

---

## 💻 交互式 CLI 工具

只需在终端中运行主命令，然后按照恢复向导的提示操作即可：
```bash
cryptoseed
```

### 帮助与历史信息查询命令

*   **快速帮助 (`-h` 或 `--help`):** 显示命令行使用指南。
    ```bash
    cryptoseed --help
    ```
*   **综合指南 (`-i` 或 `--info`):** 显示支持的各个区块链的历史演变综述、按年份使用的标准 HD 路径以及兼容的钱包。非常适合找回可能存放在旧路径下的资金！
    ```bash
    cryptoseed --info
    ```

---

## 🧮 算法背后的数学与可行性局限

如果您丢失了助记词，您需要对恢复概率抱有理性的预期。我编写了该恢复引擎，在开始任何高负载搜索之前都会显示客观、写实的警告：

### BIP-39 组合数计算（2048个单词的字典）

| 丢失单词数量 | 组合数计算公式 | 总可能组合 | 实际恢复可行性 |
| :---: | :---: | :---: | :--- |
| **1 个单词** | $2048^1$ | **2,048** | **完全可行**（在任何 CPU 上仅需几毫秒） |
| **2 个单词** | $2048^2$ | **4,194,304** | **非常可行**（使用我们优化的引擎仅需几秒钟） |
| **3 个单词** | $2048^3$ | **8,589,934,592** | **负载极高**（如果已知单词位置或具有约束条件则可行） |
| **4 个单词** | $2048^4$ | **17,592,186,044,416** | **不可行**（普通电脑需要数周或数月时间） |
| **5 个单词** | $2048^5$ | **36,028,797,018,963,968**| **数学上不可能**（需要超级计算机） |

---

## 📊 支持的区块链与钱包矩阵（39 个网络）

以下是 **cryptoseed** 派生引擎原生支持的全部 39 个网络和生态系统的详细列表，确保向后及现代兼容性：

| 生态系统 / 网络 | 代币符号 | 默认派生路径 (HD Path) | 兼容的参考钱包 |
| :--- | :---: | :--- | :--- |
| **Bitcoin** | BTC | `m/84'/0'/0'/0/i` (Native SegWit)<br>`m/49'/0'/0'/0/i` (Nested SegWit)<br>`m/44'/0'/0'/0/i` (Legacy)<br>`m/86'/0'/0'/0/i` (Taproot) | B2 Wallet, Electrum, Trust Wallet, Ledger, Trezor |
| **Ethereum** | ETH | `m/44'/60'/0'/0/i` | B2 Wallet, MetaMask, Rabby, Trust Wallet, Ledger, Trezor |
| **BNB Chain** | BNB | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Trust Wallet, Ledger, Trezor |
| **Polygon** | MATIC | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Trust Wallet, Ledger, Trezor |
| **Arbitrum** | ARB | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Rabby, Trust Wallet, Ledger, Trezor |
| **Optimism** | OP | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Rabby, Trust Wallet, Ledger, Trezor |
| **Avalanche** | AVAX | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, Core, MetaMask, Trust Wallet, Ledger, Trezor |
| **Base** | BASE | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Trust Wallet, Ledger, Trezor |
| **Fantom** | FTM | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Trust Wallet, Ledger, Trezor |
| **Cronos** | CRO | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Trust Wallet, Ledger, Trezor |
| **Harmony** | ONE | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Trust Wallet |
| **Gnosis Chain** | GNOSIS | `m/44'/60'/0'/0/i` (EVM) | B2 Wallet, MetaMask, Rabby, Trust Wallet, Ledger, Trezor |
| **Solana** | SOL | `m/44'/501'/0'/0'` (Phantom Standard)<br>`m/44'/501'/0'/0/i` (Sollet/Legacy) | B2 Wallet, Phantom, Sollet, Solflare, Trust Wallet |
| **Cardano** | ADA | `m/1852'/1815'/0'/0/i` (Shelley Native)<br>`m/44'/1815'/0'/0/i` (Byron Legacy) | Yoroi, Daedalus, Eternl, Lace |
| **TRON** | TRX | `m/44'/195'/0'/0/i` | B2 Wallet, TronLink, Trust Wallet, Ledger, Trezor |
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
| **Litecoin** | LTC | `m/84'/2'/0'/0/i` (Native SegWit)<br>`m/44'/2'/0'/0/i` (Legacy) | B2 Wallet, Electrum LTC, Trust Wallet, Ledger |
| **Dogecoin** | DOGE | `m/44'/3'/0'/0/i` | B2 Wallet, Multidoge, Trust Wallet, Ledger, Trezor |
| **Bitcoin Cash** | BCH | `m/44'/145'/0'/0/i` | B2 Wallet, Electron Cash, Trust Wallet, Ledger |
| **Dash** | DASH | `m/44'/5'/0'/0/i` | B2 Wallet, Dash Core, Trust Wallet, Ledger |
| **Zcash** | ZEC | `m/44'/133'/0'/0/i` | B2 Wallet, Trust Wallet, Ledger |
| **Kaspa** | KAS | `m/44'/111111'/0'/0/i` | Kaspium, Kaspa Web Wallet |
| **Monero** | XMR | `m/44'/128'/0'/0/i` | Cake Wallet, Monerujo, GUI Wallet |

---

## 🛠️ 性能对比：本地 RPC 节点 vs 公共 API

在每次搜索结束时，**cryptoseed** 都会在您的磁盘中保存一份详细的恢复报告（`resultado_recuperacao_[timestamp].txt`），并根据需要在链上验证查找出来的助记词是否含有余额来估算其真实的查询耗时：

*   **通过公共 API 校验（单次请求约50毫秒）：** 仅在候选助记词数量极少时（$<100$）有效。受限于网络延迟以及 API 请求频率限制。
*   **通过本地 RPC 节点校验（单次请求约0.1毫秒）：** 大批量搜索（$>1000$ 个助记词）的理想路径。在您自己的机器上本地运行可将总扫描时间缩短至原来的 **五百分之一**。

---

## 🎓 创世萨托什时代彩蛋 (2009 - 2010)

如果您在恢复向导中尝试选择您的钱包是在 **2010 年或更早**创建的，程序将会停止运行并向您揭示一个历史秘闻：**在那个创世时代，助记词这种恢复形式根本不存在！**
中本聪最初开发的客户端（Bitcoin-Qt）使用随机生成的私钥直接存储在二进制文件 `wallet.dat` 中。如果您丢失了该文件，任何单词短语都无法恢复您的资金，因为确定性助记词在当时尚未被发明！

---

## 🛡️ 许可协议、安全与治理

该库 **100% 离线且在您的机器上本地**运行。代码开源、整洁，绝对不会发起任何网络请求来传输您的助记词或私钥。安全第一。

*   **许可协议:** MIT (创建于 2023 年)
*   **致谢:** 本项目属于 **b2 wallet** / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/) 生态。
