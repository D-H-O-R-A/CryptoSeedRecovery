# 🛡️ cryptoseed

🌍 **Select Language / Selecione o Idioma:**
[Português](./README.md) | [English](./README.en.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Italiano](./README.it.md) | [Türkçe](./README.tr.md) | [Русский](./README.ru.md) | [简体中文](./README.zh.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [עברית](./README.he.md)


**cryptoseed**는 분실되었거나, 순서가 뒤섞였거나, 혹은 철자 오류로 잘못 입력된 암호화 연상 기호 복구 단어(*seed phrases*)를 진단, 검증 및 복구하기 위해 설계된 **순수 JavaScript**(Node.js) 기반의 가볍고 고성능인 기업급 라이브러리입니다.

**b2 wallet**([diegooris](https://diegohorantunes.web.app/)의 지휘 아래 [better2better](https://better2better.net)가 운영하는 보안 및 인프라 에코시스템) 아래에서 개발된 이 라이브러리는 개발자와 보안 분석가에게 **39개의 서로 다른 블록체인 및 에코시스템**에서 주소 도출 시 최고의 견고함, 초고속 검색 속도, 그리고 수술과 같이 정교한 역사적 정확성을 제공하도록 설계되었습니다. 이 모든 것은 빌드의 이식성을 해칠 수 있는 네이티브 C/C++ 컴파일 종속성이나 외부 패키지 없이 100% 자율적으로 작동합니다.

---

## 📅 지원하는 BIP 변형 및 역사적 타임라인

자금을 정확하게 복구하려면 단순히 단어를 아는 것만으로는 부족합니다. 기술적인 사양과 지갑이 생성된 연도를 이해해야 합니다. **cryptoseed**는 역사적인 표준(BIP)을 엄격하게 구현하고 준수합니다.

### 🔍 구현 및 정렬된 BIP 표준 일람표

| BIP | 규격명 | **cryptoseed**에서의 구현 및 지원 상황 |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **완전 지원.** HD 도출 트리의 수학적 기반입니다. 자체 키 엔진을 통해 순수 타원 곡선 수학을 사용하여 엔진이 단일 마스터 시드로부터 공개 키/개인 키(`xprv`/`xpub`)의 무한한 경로를 도출할 수 있도록 합니다. |
| **BIP-39** | *Mnemonic Code* | **완전 지원.** 업계 공통 표준. **10개의 서로 다른 언어** 사전과 통합된 4~8비트 체크섬(*checksum*) 검증을 통해 **12, 15, 18, 21 또는 24개 단어**의 구문을 지원합니다. |
| **BIP-43** | *Purpose Field* | **완전 지원.** 경로 트리의 최상위에서 목적 필드(`m / purpose'`)를 정의하는 구조를 준수하며, 엔진이 다목적 지갑으로 올바르게 라우팅할 수 있도록 합니다. |
| **BIP-44** | *Multi-Account* | **완전 지원.** 업계에서 가장 일반적인 도출 경로 표준: `m/44'/coin_type'/account'/change/address_index`. 비트코인 레거시, 이더리움, EVM 호환 체인, 솔라나 레거시, 트론, 카르다노 레거시 등에 기본적으로 사용됩니다. |
| **BIP-45** | *Multisig HD* | **경로 정렬.** 목적 경로 `m/45'`의 다중 서명 지갑에 사용됩니다. BIP-45 멀티시그 설정의 일부인 개별 시드를 복구하는 경우, 엔진은 이 경로에서 일반적인 방식으로 개별 개인 키를 도출합니다. |
| **BIP-47** | *Payment Codes* | **시드 호환성.** 재사용 가능하고 프라이빗한 결제 코드(사무라이 지갑 등). BIP-47을 사용하는 지갑의 백업은 표준 12단어 또는 24단어 BIP-39 시드입니다. **cryptoseed**는 이 마스터 시드를 완벽하게 복구합니다. |
| **BIP-48** | *Multisig Structure* | **호환성.** 경로 `m/48'/coin_type'/...`을 사용하는 BIP-43 기반의 고급 멀티시그 구조. 이러한 멀티시그 트랜잭션을 서명하는 마스터 시드의 복구에 호환됩니다. |
| **BIP-49** | *Nested SegWit* | **완전 지원.** 공식 경로 `m/49'/0'/0'/0/index` 아래에서 도출되는, 문자 `3`으로 시작하는 비트코인 과도기 주소(P2SH-P2WPKH 형식). |
| **BIP-84** | *Native SegWit* | **완전 지원.** `m/84'/0'/0'/0/index`(LTC의 경우 `m/84'/2'/...`) 아래에서 도출되는, `bc1q`로 시작하는 최신 고성능 비트코인 주소 및 `ltc1`로 시작하는 라이트코인 주소(Bech32 형식). |
| **BIP-85** | *Child Seeds* | **개념적 호환성.** BIP-39 마스터 시드가 `m/85'/...`와 같은 경로 아래에서 다른 지갑을 위해 새로운 안전한 하위 시드(12단어 또는 24단어)를 생성할 수 있도록 합니다. 분실한 시드가 BIP-85에 의해 도출된 하위 시드인 경우, 엔진은 일반적인 BIP-39 시드와 마찬가지로 이를 복구합니다. |
| **BIP-86** | *Taproot* | **완전 지원.** 표준 경로 `m/86'/0'/0'/0/index` 아래에서 도출되는, `bc1p`로 시작하는 차세대 비트코인 주소(Schnorr/Taproot 서명)(Bech32m 형식). |

---

## ⚡ 왜 cryptoseed가 생성되었는가?

**b2 wallet** / [better2better](https://better2better.net) 에코시스템의 고객과 친구들을 위해 지갑을 복구해야 했을 때, 기존 도구는 너무 복잡하거나(Node를 손상시키는 네이티브 C++ 컴파일이 필요함) 블록체인의 역사적 변화를 이해하지 못한다는 것을 깨달았습니다. 저는 다음과 같은 솔루션을 제공하기 위해 이 라이브러리를 만들었습니다.

1.  **네이티브 종속성 제로 (Pure JS):** Windows, Linux 또는 macOS에서 문제없이 작동합니다. `pkg`를 사용하여 이식 가능한 실행 파일을 컴파일하는 데 적합합니다.
2.  **"글자 슬라이싱" 기술 (Prefix Fallback):** `engino`와 같이 잘못된 단어를 입력하면 공식 사전에서 가장 가능성이 높은 단어를 자동으로 식별하기 위해 단어를 문자별로 슬라이싱하는(`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`) 알고리즘을 작성했습니다.
3.  **스마트한 분실 단어 처리:** 사전에 접두사 일치가 없는 미지의 단어를 알고리즘이 발견하면, 사전의 모든 가능성을 자동으로 하나씩 테스트하기 위해 이를 와일드카드(`*`)로 변환합니다.
4.  **조기 가지치기 (Early Branch Pruning):** 제약 조건(필수 단어 및 제외 단어 - NOK)을 기반으로 한 조기 가지치기를 갖춘 검색 엔진을 개발하여 프로세서가 수십억 개의 무의미한 조합을 계산하는 것을 방지했습니다.
5.  **통합 체크섬 우회:** BIP-39 시드에는 체크섬이 포함되어 있으므로 코드는 무거운 타원 곡선 수학을 시도하기 전에 생성된 모든 조합의 **99.6%**를 무시하여 CPU 시간을 1000배 단축합니다.

---

## 🛠️ 복구 기능 및 검색 엔지니어링

원래 **2023**년에 **b2 wallet**([better2better](https://better2better.net)) 에코시스템 전용 툴로 개발된 **cryptoseed**는 시장의 일반적인 솔루션에 비해 과학적으로 우수한 복구 인프라를 제공하고자 대중에게 오픈소스로 공개되었습니다. 검색 엔진은 다음과 같은 기능과 기술적 차별점을 갖추고 있습니다:

### 🎯 단어별 상태 분류
일반적인 복구 스크립트와 달리, 대화형 마법사를 사용하면 세 가지 의미 체계 분류를 통해 시드 구문의 각 단어별 신뢰 상태를 개별적으로 구성할 수 있습니다:
* **✔️**: 단어와 시드 내의 정확한 위치가 확인되었습니다. 엔진이 해당 단어를 고정(Lock)하고 처리 능력을 나머지 슬롯에만 집중합니다.
* **🔀**: 단어는 알려져 있고 세트에 포함되지만, 그 위치가 잘못되었거나 불확실합니다. 엔진은 사용 가능한 빈 슬롯 내에서만 안전한 순열(Permutations)을 위해 이 단어를 동적으로 처리하여 중복 테스트를 방지합니다.
* **🎲**: 단어를 완전히 분실했거나 알아볼 수 없습니다. 엔진이 해당 형식의 사전 내 모든 가능성을 자동적이고 전수적으로 테스트합니다.

### 📊 전처리 및 실현 가능성 예측
컴퓨팅 에너지를 소모하기 전에 엔진은 제공된 제약 조건과 시드를 분석하여 상세한 수학적 패널을 표시합니다:
* **원시 검색 공간**: 구성된 구조가 갖는 이론적 조합의 정확한 수학적 합계를 표시합니다.
* **트리 가지치기 (체크섬 & 필터)**: 체크섬이나 NOK 단어 제약 조건과 같은 논리 필터를 적용한 후 남은 조합의 수를 알려주어 무거운 키 도출 계산량을 대폭 줄여줍니다.
* **스캔 시간 예측**: 평균 지연 연결(공개 API)과 고성능 로컬 연결(로컬 RPC 노드)을 사용할 때의 실시간 스캔 시간 예상치를 비교합니다.
* **실현 불가능성 경고**: 구성된 복잡도가 슈퍼컴퓨터 성능을 요구하는 수준일 경우 엔진이 사용자에게 투명하게 경고를 표시하여 사용자의 하드웨어가 무의미하게 잠기는 현상을 방지합니다.

### 🌐 다중 검증 엔진 및 형식 지원
에코시스템은 고유의 형식 검증 규칙을 가진 다양한 암호화 구조를 지원합니다:
* **BIP-39 엔진**: **12, 15, 18, 21, 24단어** 시드를 지원하며, 도출 전에 잘못된 가설의 **99.6%**를 필터링하기 위해 통합 무결성 검사(*checksum*)를 적용합니다.
* **Electrum 엔진**: Electrum 시드(Legacy 및 Modern)의 고유 규칙에 기반한 검증 및 도출.
* **Electron Cash 엔진**: Bitcoin Cash 에코시스템의 도출 및 체크섬 검증 로직의 정확한 포팅.
* **무검증 모드 (무차별 대입)**: 체크섬 검사가 없는 원시 도출 엔진으로, 독점적인 기존 레거시 형식이나 비표준 커스텀 시드 구문에 적합하며 최대의 검색 범위를 보장합니다.

### 🧩 복잡한 결합 케이스 해결
엔진은 단 한 번의 실행으로 다음과 같은 고난도 복합 문제를 해결합니다:
* 알려진 위치 또는 알려지지 않은 위치에서 하나 이상의 단어가 완전히 분실된 경우.
* 알려진 단어들의 순서가 뒤섞인 경우.
* 혼합 시나리오(예: 단어가 누락되는 동시에 알려진 단어들의 순서도 어긋난 경우).
* 검색 프로필 선택: **최대 속도**(체크섬 및 제약 조건 사용) 또는 **최대 범위**(광범위한 수학적 무차별 대입).

---

## ⚙️ 설치

### 글로벌 설치 (대화형 CLI 도구를 터미널에서 직접 실행할 경우)
```bash
npm install -g cryptoseed
```

### 로컬 설치 (Node 프로젝트에 로직을 임포트할 경우)
```bash
npm install cryptoseed
```

---

## 🛡️ 코드에서의 사용 방법 (JavaScript API)

이 라이브러리는 애플리케이션에 **b2 wallet**의 보안 로직을 즉시 통합하기 위한 깨끗하고 잘 구조화된 내보내기를 제공합니다.

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. "글자 슬라이싱"을 사용하여 철자 오류 수정하기
const dictionary = wordlists.bip39.ko || wordlists.bip39.en;
const wordWithError = "engino";
const suggestions = typo.getPrefixSuggestions(wordWithError, dictionary);
console.log("추정된 단어:", suggestions); // [ 'engine' ]을 반환합니다.

// 2. MetaMask (EVM)의 실제 공개 키 주소 도출하기
const seed = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const ethAddress = addressDeriver.deriveAddress(seed, 'metamask', 'ETH', 0);
console.log("Ethereum 주소:", ethAddress);

// 3. B2 Wallet의 암호화 기술을 사용하여 맞춤형 주소 도출하기
const b2Address = addressDeriver.deriveAddress(seed, 'b2wallet', 'BTC', 0);
console.log("B2 Wallet상의 Bitcoin 주소:", b2Address);
```

---

## 💻 대화형 CLI

터미널에서 메인 명령을 입력하고 마법사의 지시를 따르기만 하면 됩니다.
```bash
cryptoseed
```

### 도움말 및 역사 관련 명령

*   **빠른 도움말 (`-h` 또는 `--help`):** 사용 가이드와 명령줄 옵션을 표시합니다.
    ```bash
    cryptoseed --help
    ```
*   **정보 콘펜디움 (`-i` 또는 `--info`):** 지원되는 각 블록체인의 완전한 역사적 요약, 연도별로 사용되는 표준 HD 경로 및 호환되는 지갑을 표시합니다. 옛 자금이 어디에 보관되어 있는지 찾는 데 적합합니다!
    ```bash
    cryptoseed --info
    ```

---

## 🧮 수학적 배경 및 실현 가능성의 한계

시드를 분실한 경우 복구 확률에 대해 현실적이어야 합니다. 부하가 높은 검색을 시작하기 전에 현실적인 경고를 표시하도록 검색 엔진을 설계했습니다.

### BIP-39 조합 표 (2048단어 사전)

| 분실한 단어 수 | 조합 계산 공식 | 총 가능성 | 실제 실현 가능성 |
| :---: | :---: | :---: | :--- |
| **1 단어** | $2048^1$ | **2,048** | **완전히 가능** (모든 CPU에서 1초 미만) |
| **2 단어** | $2048^2$ | **4,194,304** | **가능** (최적화된 엔진으로 몇 초 내에 복구) |
| **3 단어** | $2048^3$ | **8,589,934,592** | **매우 무거움** (단어 위치를 알거나 제약 조건이 있으면 가능) |
| **4 단어** | $2048^4$ | **17,592,186,044,416** | **실행 불가능** (일반 PC에서는 수주 또는 수개월 소요) |
| **5 단어** | $2048^5$ | **36,028,797,018,963,968**| **수학적으로 불가능** (슈퍼컴퓨터 필요) |

---

## 📊 지원하는 블록체인 및 지갑 매트릭스 (39개 네트워크)

다음은 **cryptoseed** 도출 엔진에 의해 고유하게 지원되는 모든 39개의 네트워크 및 에코시스템의 상세 목록이며, 하위 호환성 및 현대적 호환성을 보장합니다.

| 에코시스템 / 네트워크 | 심볼 | 기본 도출 경로 (HD Path) | 호환 가능한 참조 지갑 |
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

## 🛠️ 성능: 로컬 RPC 노드 vs 공개 API

각 검색의 종료 시점에 **cryptoseed**는 상세한 복구 보고서를 디스크에 저장하고(`resultado_recuperacao_[timestamp].txt`), 발견된 시드가 온체인에서 자금을 가지고 있는지 검증하기 위해 필요한 쿼리 속도의 현실적인 예측을 제공합니다.

*   **공개 API에 의한 쿼리 (요청당 50ms):** 후보 시드가 극히 적은 경우($<100$)에만 유용합니다. 인터넷 지연 및 요청 속도 제한의 영향을 받습니다.
*   **로컬 RPC 노드에 의한 쿼리 (요청당 0.1ms):** 대규모 검색($>1000$ 시드)에 이상적인 접근 방식입니다. 자신의 컴퓨터에서 로컬로 실행하여 총 스캔 시간을 최대 **500분의 1**로 단축할 수 있습니다.

---

## 🎓 사토시 시대의 이스터 에그 (2009 - 2010)

지갑이 **2010년 이전**에 생성된 것을 복구 마법사에서 선택하려고 하면 프로그램은 실행을 중단하고 역사적 비밀을 알려줍니다. **이 창세기 시대에는 연상 기호 복구 시드 구문이라는 것 자체가 존재하지 않았습니다!**
사토시 나카모토의 원래 클라이언트(Bitcoin-Qt)는 이진 파일 `wallet.dat`에 저장된 무작위 개인 키를 사용했습니다. 이 파일을 분실한 경우 결정론적 시드는 아직 발명되지 않았기 때문에 어떠한 단어 구문도 자금을 복구할 수 없습니다!

---

## 🛡️ 라이선스, 보안 및 거버넌스

이 라이브러리는 사용자의 컴퓨터에서 **100% 오프라인 및 로컬**로 작동합니다. 코드는 개방적이고 깨끗하며 단어나 개인 키를 전송하기 위한 네트워크 요청은 전혀 수행하지 않습니다. 보안이 최우선입니다.

*   **라이선스:** MIT (2023년 개발)
*   **크레딧:** **b2 wallet** / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/) 프로젝트.
