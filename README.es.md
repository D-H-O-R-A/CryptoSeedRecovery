# 🛡️ cryptoseed

🌍 **Select Language / Selecione o Idioma:**
[Português](./README.md) | [English](./README.en.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Italiano](./README.it.md) | [Türkçe](./README.tr.md) | [Русский](./README.ru.md) | [简体中文](./README.zh.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [עברית](./README.he.md)


**cryptoseed** es una biblioteca de clase empresarial, ligera y de alto rendimiento desarrollada en **JavaScript Puro** (Node.js) diseñada para el diagnóstico, validación y recuperación de frases mnemónicas mnemotécnicas (*seed phrases*) criptográficas que se han perdido, desordenado o escrito con errores ortográficos.

Desarrollada bajo el ecosistema de seguridad e infraestructura de **b2 wallet** ([better2better](https://better2better.net), bajo el liderazgo de [diegooris](https://diegohorantunes.web.app/)), la biblioteca fue diseñada para proporcionar a los desarrolladores y analistas de seguridad la máxima robustez, alta velocidad de búsqueda y precisión histórica quirúrgica en la derivación de direcciones en **39 blockchains y ecosistemas distintos**. Todo esto operando de forma 100% autónoma, sin dependencias de compilación nativa en C/C++ ni paquetes externos que puedan comprometer la portabilidad de la compilación.

---

## 📅 Variaciones de BIP Soportadas y Línea de Tiempo Histórica

Para recuperar fondos con precisión, no basta con saber las palabras; debe comprender las especificaciones técnicas y el año en que se creó la cartera. **cryptoseed** implementa y respeta rigurosamente los estándares históricos (BIPs).

### 🔍 Tabla de Estándares BIP Implementados y Alineados

| BIP | Nombre | Implementación y Soporte en **cryptoseed** |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **Soporte Total.** Es la base del árbol de derivación HD. Permite que el motor derive rutas infinitas de claves públicas/privadas (`xprv`/`xpub`) a partir de una única semilla maestra utilizando matemática pura de curva elíptica mediante nuestro motor de claves. |
| **BIP-39** | *Mnemonic Code* | **Soporte Total.** El estándar más común de la industria. Soporta frases de **12, 15, 18, 21 o 24 palabras** con verificación de integridad (*checksum*) integrada de 4 a 8 bits y diccionarios en **10 idiomas** diferentes. |
| **BIP-43** | *Purpose Field* | **Soporte Total.** Respeta la estructura que introdujo el campo de propósito (`m / purpose'`) en la parte superior del árbol de rutas, asegurando que el motor enrute correctamente a carteras multiuso. |
| **BIP-44** | *Multi-Account* | **Soporte Total.** El estándar de ruta de derivación más común en la industria: `m/44'/coin_type'/account'/change/address_index`. Usado por defecto para Bitcoin Legacy, Ethereum, EVMs, Solana Legacy, TRON, Cardano Legacy, etc. |
| **BIP-45** | *Multisig HD* | **Alineación de Rutas.** Utilizado para carteras multifirma en rutas de propósito `m/45'`. Si está recuperando una semilla individual que forma parte de una configuración multisig BIP-45, el motor deriva las claves privadas individuales de esta ruta normalmente. |
| **BIP-47** | *Payment Codes* | **Compatibilidad de Semilla.** Códigos de pago privados y reutilizables (como las carteras Samourai). El respaldo de las carteras que usan BIP-47 es una semilla BIP-39 estándar de 12 o 24 palabras. **cryptoseed** recupera esta semilla maestra perfectamente. |
| **BIP-48** | *Multisig Structure* | **Compatibilidad.** Estructura multisig avanzada basada en BIP-43 utilizando la ruta `m/48'/coin_type'/...`. Compatible para recuperar la semilla maestra que firma estas transacciones multifirma. |
| **BIP-49** | *Nested SegWit* | **Soporte Total.** Direcciones de transición de Bitcoin que comienzan con el carácter `3` (formato P2SH-P2WPKH), derivadas bajo la ruta oficial `m/49'/0'/0'/0/index`. |
| **BIP-84** | *Native SegWit* | **Soporte Total.** Direcciones modernas de alto rendimiento de Bitcoin que comienzan con `bc1q` y Litecoin que comienzan con `ltc1` (formato Bech32), derivadas bajo `m/84'/0'/0'/0/index` (y `m/84'/2'/...` para LTC). |
| **BIP-85** | *Child Seeds* | **Compatibilidad Conceptual.** Permite que una semilla maestra BIP-39 genere nuevas subsemillas seguras (de 12 o 24 palabras) para otras carteras en rutas como `m/85'/...`. Si su semilla perdida es una semilla hija derivada por BIP-85, el motor la recuperará como cualquier semilla BIP-39 normal. |
| **BIP-86** | *Taproot* | **Soporte Total.** Direcciones de Bitcoin de última generación (Schnorr/Taproot) que comienzan con `bc1p` (Bech32m), derivadas bajo la ruta estándar `m/86'/0'/0'/0/index`. |

---

## ⚡ ¿Por Qué se Creó cryptoseed?

Cuando necesité recuperar carteras para clientes y amigos del ecosistema **b2 wallet** / [better2better](https://better2better.net), me di cuenta de que las herramientas existentes eran demasiado complejas (requiriendo compilaciones nativas de C++ que rompían Node) o no comprendían la transición histórica de las blockchains. Creé esta biblioteca para ofrecer las siguientes soluciones:

1.  **Cero Dependencias Nativas (Pure JS):** Funciona sin dolores de cabeza en Windows, Linux o macOS. Excelente para compilar ejecutables portátiles utilizando `pkg`.
2.  **Tecnología de "Recorte de Letras" (Prefix Fallback):** Escribí un algoritmo que, si escribe una palabra incorrecta como `engino`, recortará la palabra carácter por carácter (`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`) identificando automáticamente la palabra más probable en el diccionario oficial.
3.  **Recuperación Inteligente de Palabras Perdidas:** Si el algoritmo encuentra una palabra desconocida sin coincidencia de prefijo en el diccionario, la convierte automáticamente en un comodín (`*`) para probar todas las posibilidades del diccionario una por una de manera automatizada.
4.  **Poda Temprana de Ramas:** Desarrollé el motor de búsqueda con poda temprana basada en restricciones (palabras obligatorias y palabras excluidas - NOK), evitando que la CPU calcule miles de millones de permutaciones inútiles.
5.  **Omisión de Checksum Integrada:** Dado que las semillas BIP-39 contienen sumas de verificación, el código descarta el **99.6%** de todas las combinaciones generadas antes de intentar realizar cálculos pesados de curva elíptica, ahorrando 1000 veces el tiempo de CPU.

---

## 🛠️ Recursos de Recuperación e Ingeniería de Búsqueda

Desarrollado originalmente en **2023** como una herramienta exclusiva del ecosistema **b2 wallet** ([better2better](https://better2better.net)), **cryptoseed** se ha abierto al público para ofrecer una infraestructura de recuperación científicamente superior a las soluciones genéricas del mercado. El motor de búsqueda cuenta con las siguientes capacidades y distinciones tecnológicas:

### 🎯 Clasificación de Estados por Palabra
A diferencia de los scripts de recuperación básicos, el asistente interactivo le permite configurar el estado de confianza de cada una de las palabras de la semilla de forma individual utilizando tres clasificaciones semánticas:
* **✔️**: La palabra y su posición exacta en la semilla están confirmadas. El motor bloquea esta palabra en su lugar y enfoca los recursos de procesamiento exclusivamente en las ranuras restantes.
* **🔀**: La palabra es conocida y pertenece a la semilla, pero su posición es incorrecta o incierta. El motor considera dinámicamente esta palabra para permutaciones seguras solo en las vacantes disponibles, evitando pruebas redundantes.
* **🎲**: La palabra está totalmente perdida, olvidada o es ilegible. El motor prueba de forma exhaustiva todas las posibilidades del diccionario del formato de forma automatizada.

### 📊 Preprocesamiento y Estimaciones de Viabilidad
Antes de gastar energía computacional, el motor analiza la semilla y las restricciones proporcionadas para mostrar un panel matemático detallado:
* **Espacio de Búsqueda Bruto**: Muestra el total matemático exacto de combinaciones teóricas que posee la configuración.
* **Poda de Árbol (Checksum y Filtros)**: Informa cuántas combinaciones quedan después de aplicar filtros lógicos inmediatos (como checksums o restricciones de palabras NOK), reduciendo drásticamente el volumen de derivaciones pesadas de claves.
* **Estimaciones de Tiempo de Escaneo**: Compara en tiempo real la proyección de tiempo necesaria utilizando conexiones de latencia media (APIs públicas) frente a conexiones de altísimo rendimiento (nodos RPC locales).
* **Alerta de Inviabilidad**: El motor advierte de forma transparente si la complejidad configurada requiere supercomputación, previniendo el bloqueo innecesario del hardware del usuario.

### 🌐 Múltiples Motores de Validación y Formatos
El ecosistema admite diferentes estructuras criptográficas con reglas de validación específicas para cada formato:
* **Motor BIP-39**: Soporte completo para semillas de **12, 15, 18, 21 y 24 palabras**, aplicando validación de integridad (*checksum*) integrada para descartar el **99.6%** de combinaciones falsas antes de cualquier derivación.
* **Motor Electrum**: Validación y derivación adaptadas exactamente a las reglas exclusivas de las semillas mnemónicas de Electrum (tanto Legacy como Modern).
* **Motor Electron Cash**: Adaptación precisa de la lógica de derivación y validación de suma de verificación del ecosistema Bitcoin Cash.
* **Modo Sin Validación (Fuerza Bruta)**: Generador básico de derivación sin filtros de suma de verificación, ideal para formatos legados propietarios o semillas personalizadas no estándar, garantizando la máxima cobertura de búsqueda.

### 🧩 Resolución de Casos Complejos Combinados
El motor resuelve problemas combinados de alta complejidad en una sola ejecución, incluyendo:
* Una o más palabras completamente perdidas en posiciones conocidas o desconocidas.
* Palabras conocidas con orden completamente desordenado.
* Escenarios mixtos (ej. semillas donde faltan algunas palabras y, al mismo tiempo, las palabras conocidas están fuera de orden).
* Elección del perfil de búsqueda: **Máxima Velocidad** (usando checksums y restricciones) o **Máxima Cobertura** (fuerza bruta matemática amplia).

---

## ⚙️ Instalación

### Instalación Global (Para ejecutar la utilidad CLI interactiva directamente en su terminal)
```bash
npm install -g cryptoseed
```

### Instalación Local (Para importar la lógica en su proyecto Node)
```bash
npm install cryptoseed
```

---

## 🛡️ Cómo Usar en su Código (API de JavaScript)

La biblioteca proporciona exportaciones limpias y bien estructuradas para la integración inmediata de la lógica de seguridad de **b2 wallet** en su aplicación:

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. Corregir error ortográfico usando "Recorte de Letras"
const diccionario = wordlists.bip39.es || wordlists.bip39.en;
const palabraConErro = "*";
const sugerencias = typo.getPrefixSuggestions(palabraConErro, diccionario);
console.log("Palabra deducida:", sugerencias); // Retorna [ 'engine' ]

// 2. Derivar dirección pública real para MetaMask (EVM)
const semilla = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const direccionEth = addressDeriver.deriveAddress(semilla, 'metamask', 'ETH', 0);
console.log("Dirección Ethereum:", direccionEth);

// 3. Derivar dirección personalizada usando la criptografía de B2 Wallet
const direccionB2 = addressDeriver.deriveAddress(semilla, 'b2wallet', 'BTC', 0);
console.log("Dirección Bitcoin en B2 Wallet:", direccionB2);
```

---

## 💻 CLI Interactiva

Simplemente escriba el comando principal en su terminal y siga el asistente:
```bash
cryptoseed
```

### Comandos de Ayuda e Información Histórica

*   **Ayuda rápida (`-h` o `--help`):** Muestra la guía de uso y las opciones de línea de comandos.
    ```bash
    cryptoseed --help
    ```
*   **Compendio de Información (`-i` o `--info`):** Muestra un resumen histórico completo de cada blockchain soportada, las rutas estándar utilizadas por año y las carteras compatibles. ¡Excelente para averiguar dónde pueden estar guardados los fondos antiguos!
    ```bash
    cryptoseed --info
    ```

---

## 🧮 La Matemática Detrás y Límites de Viabilidad

Si perdió su semilla, debe ser realista sobre las probabilidades. Escribí el motor para mostrar alertas realistas antes de comenzar cualquier búsqueda pesada:

### Tabla de Combinaciones BIP-39 (Diccionario de 2048 Palabras)

| Palabras Perdidas | Cálculo de Combinaciones | Total de Posibilidades | Viabilidad Real |
| :---: | :---: | :---: | :--- |
| **1 Palabra** | $2048^1$ | **2.048** | **Totalmente Viable** (Fracciones de segundo en cualquier CPU) |
| **2 Palabras** | $2048^2$ | **4.194.304** | **Viable** (Pocos segundos con nuestro motor optimizado) |
| **3 Palabras** | $2048^3$ | **8.589.934.592** | **Muy Pesado** (Viable si conoce las posiciones o tiene restricciones) |
| **4 Palabras** | $2048^4$ | **17.592.186.044.416** | **Inviable** para computadores comunes (demoraría semanas/meses) |
| **5 Palabras** | $2048^5$ | **36.028.797.018.963.968**| **Matemáticamente Imposible** (Exigiría supercomputadoras) |

---

## 📊 Matriz de Blockchains y Carteras Soportadas (39 Redes)

A continuación se muestra la relación completa y detallada de las 39 redes y ecosistemas soportados nativamente por el motor de derivación de **cryptoseed**, asegurando compatibilidad retrospectiva y contemporánea:

| Ecosistema / Red | Símbolo | Ruta de Derivación Predeterminada (HD Path) | Carteras de Referencia Compatibles |
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

## 🛠️ Rendimiento: Nodo RPC Local vs API Pública

Al final de cada búsqueda, **cryptoseed** guarda un informe de recuperación detallado en su disco (`resultado_recuperacao_[timestamp].txt`) y ofrece una estimación real de la velocidad de consulta para comprobar si las semillas encontradas tienen fondos en la red:

*   **Consulta a través de APIs Públicas (50ms por petición):** Útil solo si tiene muy pocas semillas candidatas ($<100$). Sufre de latencia de Internet y bloqueo de límites de velocidad.
*   **Consulta a través de Nodo RPC Local (0.1ms por petición):** La ruta ideal para búsquedas robustas ($>1000$ semillas). Reduce el tiempo de escaneo total hasta **500 veces** ejecutándose localmente en su propia máquina.

---

## 🎓 Easter Egg de la Era Satoshi (2009 - 2010)

Si intenta seleccionar en el asistente que su cartera fue creada en o antes de **2010**, el programa detendrá la ejecución y le contará un secreto histórico: **¡En esta era génesis, las frases mnemónicas de recuperación NO existían!**
El cliente original de Satoshi Nakamoto (Bitcoin-Qt) utilizaba claves privadas aleatorias almacenadas en el archivo binario `wallet.dat`. Si perdió ese archivo, ninguna frase de palabras podrá recuperar sus fondos, ya que la semilla determinista simplemente no había sido inventada todavía.

---

## 🛡️ Licencia, Seguridad y Gobernanza

Esta biblioteca se ejecuta **100% fuera de línea y localmente** en su máquina. El código es abierto, limpio y no realiza ninguna petición de red para transmitir sus palabras o claves privadas. La seguridad es lo primero.

*   **Licencia:** MIT (Creado en 2023)
*   **Créditos:** Proyecto **b2 wallet** / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/).
