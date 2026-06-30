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


**cryptoseed**, kaybolan, karıştırılan veya yanlış yazılan kriptografik mnemotik kurtarma kelimelerinin (*seed phrases*) teşhisi, doğrulanması ve kurtarılması için tasarlanmış, **Saf JavaScript** (Node.js) ile geliştirilmiş, kurumsal sınıfta, hafif ve yüksek performanslı bir kütüphanedir.

[**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net), [diegooris](https://diegohorantunes.web.app/) liderliğinde) güvenlik ve altyapı ekosistemi altında geliştirilen bu kütüphane, geliştiricilere ve güvenlik analistlerine **39 farklı blockchain ve ekosistemde** adres türetmede maksimum sağlamlık, ultra yüksek arama hızları ve cerrahi tarihsel doğruluk sağlamak üzere tasarlanmıştır. Tüm bunlar, taşınabilirliği tehlikeye atabilecek yerel C/C++ derleme bağımlılıkları veya harici paketler olmadan, %100 otonom olarak çalışır.

---

## 📅 Desteklenen BIP Varyasyonları ve Tarihsel Zaman Çizelgesi

Fonları doğru bir şekilde kurtarmak için sadece kelimeleri bilmek yetmez; teknik özellikleri ve cüzdanın oluşturulduğu yılı da anlamanız gerekir. **cryptoseed**, tarihsel standartları (BIP'ler) titizlikle uygular ve bunlara saygı duyar.

### 🔍 Uygulanan ve Hizalanan BIP Standartları Tablosu

| BIP | İsim | **cryptoseed** İçindeki Uygulama ve Destek |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **Tam Destek.** HD türetme ağacının temelidir. Anahtar motorumuz aracılığıyla saf eliptik eğri matematiğini kullanarak motorun tek bir ana seed'den sınırsız genel/özel anahtar (`xprv`/`xpub`) yolu türetmesini sağlar. |
| **BIP-39** | *Mnemonic Code* | **Tam Destek.** Sektör standardı. **10 farklı dilde** sözlükler ve entegre 4 ila 8 bitlik hata kontrolü (*checksum*) doğrulaması ile **12, 15, 18, 21 veya 24 kelimelik** ifadeleri destekler. |
| **BIP-43** | *Purpose Field* | **Tam Destek.** Yol ağacının en üstünde amaç alanını (`m / purpose'`) tanıtan yapıya uyar ve motorun çok amaçlı cüzdanlara doğru şekilde yönlendirme yapmasını sağlar. |
| **BIP-44** | *Multi-Account* | **Tam Destek.** Sektördeki en yaygın türetme yolu standardı: `m/44'/coin_type'/account'/change/address_index`. Bitcoin Legacy, Ethereum, EVM'ler, Solana Legacy, TRON, Cardano Legacy vb. için varsayılan olarak kullanılır. |
| **BIP-45** | *Multisig HD* | **Yol Hizalama.** `m/45'` amaç yollarında çoklu imzalı cüzdanlar için kullanılır. BIP-45 çoklu imza kurulumunun parçası olan bireysel bir seed'i kurtarıyorsanız, motor bireysel özel anahtarları bu yoldan normal şekilde türetir. |
| **BIP-47** | *Payment Codes* | **Seed Uyumluluğu.** Yeniden kullanılabilir ve özel ödeme kodları (Samourai cüzdanları gibi). BIP-47 kullanan cüzdanların yedeği standart 12 veya 24 kelimelik bir BIP-39 seed'idir. **cryptoseed** bu ana seed'i mükemmel bir şekilde kurtarır. |
| **BIP-48** | *Multisig Structure* | **Uyumluluk.** `m/48'/coin_type'/...` yolunu kullanarak BIP-43'e dayalı gelişmiş çoklu imza yapısı. Bu çoklu imzalı işlemleri imzalayan ana seed'i kurtarmak için uyumludur. |
| **BIP-49** | *Nested SegWit* | **Tam Destek.** `m/49'/0'/0'/0/index` resmi yolu altında türetilen, `3` karakteriyle başlayan Bitcoin geçiş adresleri (P2SH-P2WPKH formatı). |
| **BIP-84** | *Native SegWit* | **Tam Destek.** `m/84'/0'/0'/0/index` (ve LTC için `m/84'/2'/...`) altında türetilen, `bc1q` ile başlayan modern yüksek performanslı Bitcoin adresleri ve `ltc1` ile başlayan Litecoin adresleri (Bech32 formatı). |
| **BIP-85** | *Child Seeds* | **Kavramsal Uyumluluk.** Bir BIP-39 ana seed'inin, `m/85'/...` gibi yollar altında diğer cüzdanlar için yeni güvenli alt seed'ler (12 or 24 kelimelik) oluşturmasını sağlar. Kayıp seed'iniz BIP-85 tarafından türetilmiş bir çocuk seed ise, motor bunu normal bir BIP-39 seed'i gibi kurtaracaktır. |
| **BIP-86** | *Taproot* | **Tam Destek.** Standart yol `m/86'/0'/0'/0/index` altında türetilen, `bc1p` ile başlayan yeni nesil Bitcoin adresleri (Schnorr/Taproot) (Bech32m). |

---

## ⚡ cryptoseed Neden Oluşturuldu?

[**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net) ekosisteminin müşterileri ve dostları için cüzdanları kurtarmam gerektiğinde, mevcut araçların ya aşırı karmaşık olduğunu (Node'u bozan yerel C++ derlemeleri gerektiren) ya da blockchain'lerin tarihsel geçişini anlamadığını fark ettim. Bu kütüphaneyi aşağıdaki çözümleri sunmak için oluşturdum:

1.  **Sıfır Yerel Bağımlılık (Pure JS):** Windows, Linux veya macOS üzerinde sorunsuz çalışır. `pkg` kullanarak taşınabilir yürütülebilir dosyalar derlemek için mükemmeldir.
2.  **"Harf Dilimleme" Teknolojisi (Prefix Fallback):** `engino` gibi yanlış bir kelime yazarsanız, resmi sözlükteki en olası kelimeyi otomatik olarak belirlemek için kelimeyi karakter karakter dilimleyen (`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`) bir algoritma yazdım.
3.  **Akıllı Kayıp Kelime Yönetimi:** Algoritma, sözlükte ön ek eşleşmesi olmayan bilinmeyen bir kelime bulursa, dökümandaki tüm olasılıkları otomatik bir şekilde tek tek test etmek için bunu otomatik olarak bir joker karaktere (`*`) dönüştürür.
4.  **Erken Dal Budama (Early Branch Pruning):** Arama motorunu kısıtlamalara dayalı erken budama ile geliştirdim (gerekli kelimeler ve hariç tutulan kelimeler - NOK), işlemcinin milyarlarca gereksiz kombinasyonu hesaplamasını engelledim.
5.  **Entegre Checksum Bypass:** BIP-39 seed'leri checksum içerdiğinden, kod ağır eliptik eğri hesaplamalarına girişmeden önce üretilen tüm kombinasyonların **%99.6**'sını eler ve CPU süresinden 1000 kat tasarruf sağlar.

---

## 🛠️ Kurtarma Özellikleri ve Arama Mühendisliği

İlk olarak **2023** yılında [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) ([better2better](https://better2better.net)) ekosistemine özel bir araç olarak geliştirilen **cryptoseed**, piyasadaki sıradan çözümlere göre bilimsel olarak üstün bir kurtarma altyapısı sağlamak amacıyla açık kaynaklı hale getirilmiştir. Arama motoru aşağıdaki yeteneklere ve teknolojik ayrıcalıklara sahiptir:

### 🎯 Kelime Bazlı Durum Belirleme
Sıradan kurtarma betiklerinin aksine, etkileşimli sihirbaz, seed ifadesindeki her bir kelimenin güven durumunu üç semantik sınıflandırma kullanarak bireysel olarak yapılandırmanıza olanak tanır:
* **✔️**: Kelime ve seed üzerindeki tam konumu onaylanmıştır. Motor bu kelimeyi kilitler ve işlem gücünü yalnızca kalan diğer yuvalara odaklar.
* **🔀**: Kelime bilinmektedir ve sete aittir, ancak konumu yanlış veya belirsizdir. Motor, bu kelimeyi yalnızca mevcut boş yuvalarda güvenli permütasyonlar için dinamik olarak değerlendirir ve gereksiz testleri önler.
* **🎲**: Kelime tamamen kaybolmuş veya okunamaz durumdadır. Motor, ilgili formatın sözlüğündeki tüm olasılıkları otomatik bir şekilde kapsamlı olarak test eder.

### 📊 Ön İşleme ve Fizibilite Tahmini
Hesaplama enerjisi harcamadan önce motor, sağlanan kısıtlamaları ve seed'i analiz ederek ayrıntılı bir matematiksel panel sunar:
* **Ham Arama Alanı**: Yapılandırılan yapının sahip olduğu teorik kombinasyonların tam matematiksel toplamını gösterir.
* **Ağaç Budama (Checksum & Filtreler)**: Doğrudan mantıksal filtreler (checksum'lar veya NOK kelime kısıtlamaları gibi) uygulandıktan sonra kaç kombinasyon kaldığını bildirerek ağır anahtar türetme hacmini büyük ölçüde azaltır.
* **Tarama Süresi Öngörüleri**: Ortalama gecikmeli bağlantılar (kamu API'leri) ile yüksek performanslı yerel bağlantılar (yerel RPC düğümü) kullanan gerçek zamanlı tarama süresi tahminlerini karşılaştırır.
* **Uygulanamazlık Uyarısı**: Yapılandırılan karmaşıklığın süper bilgisayar gücü gerektirmesi durumunda kullanıcıyı şeffaf bir şekilde uyarır ve kullanıcının donanımının gereksiz yere kilitlenmesini önler.

### 🌐 Çoklu Doğrulama Motorları ve Formatlar
Ekosistem, formata özgü doğrulama kurallarına sahip farklı kriptografik yapıları destekler:
* **BIP-39 Motoru**: **12, 15, 18, 21 ve 24 kelimelik** seed ifadelerini destekler ve türetmeden önce yanlış hipotezlerin **%99.6**'sını elemek için entegre bir bütünlük kontrolü (*checksum*) uygular.
* **Electrum Motoru**: Electrum seed'lerinin (Legacy ve Modern) benzersiz kurallarına dayalı doğrulama ve türetme.
* **Electron Cash Motoru**: Bitcoin Cash ekosisteminin türetme ve checksum doğrulama mantığının tam uyarlaması.
* **Doğrulamasız Mod (Kaba Kuvvet)**: Checksum kontrolü olmayan ham türetme motoru; tescilli eski biçimler veya standart olmayan özel seed'ler için idealdir ve maksimum arama kapsamı sağlar.

### 🧩 Karmaşık Kombine Durumların Çözümü
Motor, tek bir çalıştırmada aşağıdaki yüksek karmaşıklıktaki sorunları çözer:
* Bilinen veya bilinmeyen konumlarda tamamen kaybolmuş bir veya daha fazla kelime.
* Karışık sıradaki bilinen kelimeler.
* Karışık senaryolar (örneğin: hem kelimelerin eksik olduğu hem de bilinen kelimelerin sırasının bozuk olduğu durumlar).
* Arama profili seçimi: **Maksimum Hız** (checksum'lar ve kısıtlamalar kullanarak) veya **Maksimum Kapsam** (geniş matematiksel kaba kuvvet).

---

## ⚙️ Kurulum

### Küresel Kurulum (Etkileşimli CLI aracını doğrudan terminalinizde çalıştırmak için)
```bash
npm install -g cryptoseed
```

### Yerel Kurulum (Mantığı Node projenize dahil etmek için)
```bash
npm install cryptoseed
```

---

## 🛡️ Kodunuzda Nasıl Kullanılır (JavaScript API)

Kütüphane, [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) güvenlik mantığının uygulamanıza hemen entegre edilmesi için temiz ve iyi yapılandırılmış dışa aktarımlar sağlar:

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. "Harf Dilimleme" kullanarak yazım hatasını düzeltin
const sozluk = wordlists.bip39.tr || wordlists.bip39.en;
const hataliKelime = "*";
const oneriler = typo.getPrefixSuggestions(hataliKelime, sozluk);
console.log("Tahmin edilen kelime:", oneriler); // [ 'engine' ] döner

// 2. MetaMask (EVM) için gerçek genel adresi türetin
const seed = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const ethAdresi = addressDeriver.deriveAddress(seed, 'metamask', 'ETH', 0);
console.log("Ethereum Adresi:", ethAdresi);

// 3. B2 Wallet kriptografisini kullanarak özel adres türetin
const b2Adresi = addressDeriver.deriveAddress(seed, 'b2wallet', 'BTC', 0);
console.log("B2 Wallet üzerindeki Bitcoin Adresi:", b2Adresi);
```

---

## 💻 Etkileşimli CLI

Terminalinizde ana komutu yazmanız ve sihirbazı takip etmeniz yeterlidir:
```bash
cryptoseed
```

### Yardım ve Tarihsel Komutlar

*   **Hızlı Yardım (`-h` veya `--help`):** Kullanım kılavuzunu ve komut satırı seçeneklerini görüntüler.
    ```bash
    cryptoseed --help
    ```
*   **Bilgi Derlemesi (`-i` or `--info`):** Desteklenen her bir blockchain'in tam bir tarihsel özetini, yıla göre kullanılan standart yolları ve uyumlu cüzdanları görüntüler. Eski fonların nerede saklanabileceğini bulmak için mükemmel!
    ```bash
    cryptoseed --info
    ```

---

## 🧮 Arka Plandaki Matematik ve Uygunluk Sınırları

Seed'inizi kaybettiyseniz, olasılıklar konusunda gerçekçi olmanız gerekir. Arama motorunu ağır bir aramaya başlamadan önce gerçekçi uyarılar gösterecek şekilde yazdım:

### BIP-39 Kombinasyon Tablosu (2048 Kelimelik Sözlük)

| Kayıp Kelimeler | Kombinasyon Hesaplaması | Toplam Olasılık | Gerçek Uygunluk |
| :---: | :---: | :---: | :--- |
| **1 Kelime** | $2048^1$ | **2.048** | **Tamamen Uygun** (Herhangi bir CPU'da saniyenin küçük bir kısmı) |
| **2 Kelime** | $2048^2$ | **4.194.304** | **Uygun** (Optimize edilmiş motorumuzla birkaç saniye) |
| **3 Kelime** | $2048^3$ | **8.589.934.592** | **Çok Ağır** (Konumları biliyorsanız veya kısıtlamalarınız varsa uygun) |
| **4 Kelime** | $2048^4$ | **17.592.186.044.416** | **Uygun Değil** (Standart bilgisayarlar için haftalar/aylar sürer) |
| **5 Kelime** | $2048^5$ | **36.028.797.018.963.968**| **Matematiksel Olarak İmkansız** (Süper bilgisayarlar gerektirir) |

---

## 📊 Desteklenen Blockchain ve Cüzdanlar Matrisi (39 Ağ)

Aşağıda, **cryptoseed** türetme motoru tarafından yerel olarak desteklenen, geriye dönük ve çağdaş uyumluluğu garanti eden 39 ağın ve ekosistemin eksiksiz, ayrıntılı listesi bulunmaktadır:

| Ekosistem / Ağ | Sembol | Varsayılan Türetme Yolu (HD Path) | Uyumlu Referans Cüzdanlar |
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

## 🛠️ Performans: Yerel RPC Düğümü vs Genel API

Her aramanın sonunda, **cryptoseed** diskinize ayrıntılı bir kurtarma raporu kaydeder (`resultado_recuperacao_[timestamp].txt`) ve bulunan seed'lerin on-chain fonlara sahip olup olmadığını doğrulamak için gereken sorgu hızına dair gerçek bir tahmin sağlar:

*   **Genel API'ler Aracılığıyla Sorgulama (istek başına 50ms):** Yalnızca çok az sayıda aday seed'iniz varsa ($<100$) kullanışlıdır. İnternet gecikmesinden ve istek hızı sınırlamasından muzdariptir.
*   **Yerel RPC Düğümü Aracılığıyla Sorgulama (istek başına 0.1ms):** Sağlam aramalar ($>1000$ seed) için ideal yoldur. Kendi makinenizde yerel olarak çalıştırarak toplam tarama süresini **500 kata** kadar azaltır.

---

## 🎓 Satoshi Dönemi Easter Egg (2009 - 2010)

Sihirbazda cüzdanınızın **2010** veya daha öncesinde oluşturulduğunu seçmeye çalışırsanız, program yürütmeyi durduracak ve tarihsel bir sırrı açığa çıkaracaktır: **Bu başlangıç (genesis) döneminde, mnemotik kurtarma kelimeleri MEVCUT DEĞİLDİ!**
Satoshi Nakamoto'ın orijinal istemcisi (Bitcoin-Qt), `wallet.dat` ikili dosyasında saklanan rastgele özel anahtarlar kullanıyordu. Bu dosyayı kaybettiyseniz, hiçbir kelime grubu fonlarınızı kurtaramaz, çünkü deterministik seed'ler henüz icat edilmemişti!

---

## 🛡️ Lisans, Güvenlik ve Yönetişim

Bu kütüphane makinenizde **%100 çevrimdışı ve yerel** olarak çalışır. Kod açık, temizdir ve kelimelerinizi veya özel anahtarlarınızı iletmek için asla ağ istekleri yapmaz. Önce güvenlik.

*   **Lisans:** MIT (2023'te oluşturuldu)
*   **Krediler:** [**b2 wallet**](https://better2better.com.br/softwares/b2-wallet) / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/) projesi.
