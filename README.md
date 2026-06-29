# 🛡️ cryptoseed

🌍 **Select Language / Selecione o Idioma:**
[Português](./README.md) | [English](./README.en.md) | [Español](./README.es.md) | [Français](./README.fr.md) | [Italiano](./README.it.md) | [Türkçe](./README.tr.md) | [Русский](./README.ru.md) | [简体中文](./README.zh.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [עברית](./README.he.md)


O **cryptoseed** é uma biblioteca de classe empresarial, leve e de alta performance desenvolvida em **JavaScript Puro** (Node.js) voltada ao diagnóstico, validação e recuperação de sementes mnemônicas (*seed phrases*) criptográficas que foram perdidas, desordenadas ou digitadas com incorreções ortográficas.

Desenvolvida sob o ecossistema de segurança e infraestrutura da **b2 wallet** ([better2better](https://better2better.net), sob liderança de [diegooris](https://diegohorantunes.web.app/)), a biblioteca foi projetada para prover a desenvolvedores e analistas de segurança robustez máxima, alta velocidade de busca e precisão histórica cirúrgica na derivação de endereços em **39 blockchains e ecossistemas distintos**. Tudo isso operando de forma 100% autônoma, sem dependências de compilação nativa C/C++ ou pacotes externos que possam comprometer a portabilidade do build.

---

## 📅 Linha do Tempo e Variações de BIPs Suportadas

Para recuperar fundos com precisão, não basta saber as palavras; você precisa entender em qual especificação técnica e em qual ano a carteira foi criada. O **cryptoseed** implementa e respeita rigorosamente as variações dos padrões históricos (BIPs).

### 🔍 Tabela de Padrões BIP Implementados e Alinhados

| BIP | Nome | Implementação & Suporte no **cryptoseed** |
| :---: | :--- | :--- |
| **BIP-32** | *Hierarchical Deterministic Wallets* | **Suporte Total.** É a base da árvore de derivação HD. Permite que o motor derive caminhos infinitos de chaves públicas/privadas (`xprv`/`xpub`) a partir de uma única semente mestre usando matemática de curva elíptica pura via nosso motor de chaves. |
| **BIP-39** | *Mnemonic Code* | **Suporte Total.** O padrão mais comum do mercado. Suporta frases de **12, 15, 18, 21 ou 24 palavras** com verificação de integridade (*checksum*) integrada de 4 a 8 bits e dicionários em **10 idiomas** diferentes. |
| **BIP-43** | *Purpose Field* | **Suporte Total.** Respeita a estrutura que introduziu o campo de propósito (`m / purpose'`) no topo da árvore de caminhos, garantindo que o motor roteie corretamente para carteiras multiuso. |
| **BIP-44** | *Multi-Account* | **Suporte Total.** O padrão de rota mais comum da indústria: `m/44'/coin_type'/account'/change/address_index`. Usado por padrão para Bitcoin Legacy, Ethereum, EVMs, Solana Legacy, TRON, Cardano Legacy, etc. |
| **BIP-45** | *Multisig HD* | **Alinhamento de Caminho.** Utilizado para carteiras multifirmas em caminhos de propósito `m/45'`. Se você estiver recuperando uma semente individual que faz parte de um conjunto multisig BIP-45, o motor deriva as chaves privadas individuais desse caminho normalmente. |
| **BIP-47** | *Payment Codes* | **Compatibilidade de Semente.** Códigos de pagamento reutilizáveis e privados (como as carteiras Samourai). O backup das carteiras que usam BIP-47 é uma semente BIP-39 padrão de 12 ou 24 palavras. O **cryptoseed** recupera essa semente mestre perfeitamente. |
| **BIP-48** | *Multisig Structure* | **Compatibilidade.** Estrutura multisig avançada baseada em BIP-43 utilizando o caminho `m/48'/coin_type'/...`. Compatível para recuperar a semente mestre que assina essas transações multifirmas. |
| **BIP-49** | *Nested SegWit* | **Suporte Total.** Endereços de transição do Bitcoin que iniciam com o caractere `3` (formato P2SH-P2WPKH), derivados sob o caminho oficial `m/49'/0'/0'/0/index`. |
| **BIP-84** | *Native SegWit* | **Suporte Total.** Endereços modernos de alta performance do Bitcoin que iniciam com `bc1q` e Litecoin iniciando com `ltc1` (formato Bech32), derivados sob `m/84'/0'/0'/0/index` (e `m/84'/2'/...` para LTC). |
| **BIP-85** | *Child Seeds* | **Compatibilidade Conceitual.** Permite que uma semente mestre BIP-39 gere novas sub-sementes seguras (de 12 ou 24 palavras) para outras carteiras em caminhos como `m/85'/...`. Se a sua semente perdida for uma semente filha derivada por BIP-85, o motor a recuperará como qualquer semente BIP-39 normal. |
| **BIP-86** | *Taproot* | **Suporte Total.** Endereços Bitcoin de última geração (Schnorr/Taproot) iniciando com `bc1p` (Bech32m), derivados sob o caminho padrão `m/86'/0'/0'/0/index`. |

---

## ⚡ Por Que Escrevi o cryptoseed?

Quando precisei recuperar carteiras de clientes e amigos do ecossistema **b2 wallet** / [better2better](https://better2better.net), percebi que as ferramentas existentes eram ou muito complexas (exigindo compilações em C++ nativo que quebravam o Node) ou não entendiam a história de transição das blockchains. Criei esta biblioteca com as seguintes soluções:

1.  **Zero Dependências Nativas (Pure JS):** Funciona sem dor de cabeça no Windows, Linux ou macOS. Excelente para compilar executáveis portáteis usando o `pkg`.
2.  **Tecnologia "Comer por Letras" (Prefix Fallback):** Escrevi um algoritmo que, se você digitar uma palavra errada como `engino`, fatiará a palavra letra por letra (`e-n-g-i-n-o` -> `e-n-g-i-n` -> `engine`) identificando a palavra mais provável no dicionário oficial automaticamente.
3.  **Tratamento Inteligente de Palavras Perdidas:** Se o algoritmo encontrar uma palavra desconhecida que não tenha correspondência de prefixo no dicionário, ele a transforma em um curinga (`*`) para testar todas as possibilidades do dicionário 1 por 1 de maneira automatizada.
4.  **Early Branch Pruning (Poda de Árvores):** Desenvolvi o motor de busca com poda antecipada baseada em restrições (palavras obrigatórias e palavras excluídas - NOK), evitando que o processador calcule bilhões de permutações inúteis.
5.  **Checksum Bypass Integrado:** Como sementes BIP-39 contêm somas de verificação, o código descarta **99.6%** de todas as combinações geradas antes mesmo de tentar fazer a matemática pesada de chaves elípticas, economizando 1000x de tempo de CPU.

---

## 🛠️ Recursos de Recuperação e Engenharia de Busca

Originalmente desenvolvido em **2023** como uma ferramenta de uso exclusivo do ecossistema **b2 wallet** ([better2better](https://better2better.net)), o **cryptoseed** foi aberto ao público para fornecer uma infraestrutura de recuperação cientificamente superior às soluções comuns do mercado. O motor de busca possui as seguintes capacidades e diferenciais:

### 🎯 Marcação de Estados por Palavra
Diferente de scripts rudimentares, o assistente permite que você configure o estado de confiança de cada uma das palavras da semente de forma individual usando três classificações semânticas:
* **✔️**: A palavra e a sua posição exata na semente estão confirmadas. O motor trava essa palavra e foca os recursos de processamento exclusivamente nos outros slots.
* **🔀**: A palavra é conhecida e pertence ao conjunto, mas a sua posição está incorreta ou é incerta. O motor considera essa palavra dinamicamente para permutações seguras apenas nas vagas disponíveis, evitando testes redundantes.
* **🎲**: A palavra está totalmente perdida ou é ilegível. O motor testa de forma exaustiva todas as possibilidades do dicionário do padrão de forma automatizada.

### 📊 Pré-Processamento e Estimativa de Viabilidade
Antes de gastar energia computacional, o motor analisa a semente e as restrições fornecidas para exibir um painel matemático detalhado:
* **Espaço de Busca Bruto**: Exibe o total matemático exato de combinações teóricas que a estrutura configurada possui.
* **Poda de Árvore (Checksum & Filtros)**: Informa quantas combinações restam após aplicar filtros lógicos imediatos (como checksums ou restrições de palavras NOK), reduzindo drasticamente o número de derivações pesadas.
* **Estimativas de Tempo de Varredura**: Compara em tempo real a projeção de tempo necessária usando conexões de latência média (APIs públicas) vs. conexões de altíssima performance (RPC local).
* **Alerta de Inviabilidade**: O motor avisa de forma transparente caso a complexidade configurada exija supercomputação, prevenindo o travamento desnecessário do hardware do usuário.

### 🌐 Múltiplos Motores de Validação e Formatos
O ecossistema suporta diferentes estruturas criptográficas com regras específicas de validação:
* **Motor BIP-39**: Suporte a sementes de **12, 15, 18, 21 e 24 palavras**, aplicando verificação de integridade (*checksum*) integrada para descartar **99.6%** das hipóteses falsas antes da derivação.
* **Motor Electrum**: Validação e derivação baseadas nas regras exclusivas de sementes Electrum (Legacy e Modern).
* **Motor Electron Cash**: Adaptação exata das lógicas de derivação e verificação de somas do ecossistema Bitcoin Cash.
* **Modo Sem Validação (Força Bruta)**: Gerador cru de derivação sem checagem de checksum, ideal para formatos legados proprietários ou sementes customizadas não padronizadas, garantindo máxima abrangência de busca.

### 🧩 Resolução de Casos Complexos Combinados
O motor resolve problemas de alta complexidade em uma única execução, incluindo:
* Uma ou mais palavras completamente perdidas em posições conhecidas ou desconhecidas.
* Palavras conhecidas com ordem embaralhada.
* Cenários mistos (ex: sementes onde faltam palavras e, ao mesmo tempo, as palavras conhecidas estão fora de ordem).
* Escolha do perfil de busca: **Máxima Velocidade** (usando checksums e restrições) ou **Máxima Abrangência** (força bruta matemática ampla).

---

## ⚙️ Instalação

### Instalação Global (Para rodar o utilitário CLI interativo direto no terminal)
```bash
npm install -g cryptoseed
```

### Instalação Local (Para importar as lógicas no seu projeto Node)
```bash
npm install cryptoseed
```

---

## 🛡️ Como Usar no Seu Código (API JavaScript)

A biblioteca disponibiliza exportações limpas e bem-estruturadas para integração imediata das lógicas de segurança da **b2 wallet** em sua aplicação:

```javascript
const { wordlists, searchEngine, addressDeriver, typo } = require('cryptoseed');

// 1. Corrigir palavra errada usando "Comer por Letras"
const dicionario = wordlists.bip39.en;
const palavraComErro = "engino";
const sugestoes = typo.getPrefixSuggestions(palavraComErro, dicionario);
console.log("Palavra deduzida:", sugestoes); // Retorna [ 'engine' ]

// 2. Derivar endereço público real para MetaMask (EVM)
const seed = "cabin engine harvest fiction witness walnut ladder tumble insect fox notable spoon";
const enderecoEth = addressDeriver.deriveAddress(seed, 'metamask', 'ETH', 0);
console.log("Endereço Ethereum:", enderecoEth);

// 3. Derivar endereço personalizado usando a criptografia da B2 Wallet
const enderecoB2 = addressDeriver.deriveAddress(seed, 'b2wallet', 'BTC', 0);
console.log("Endereço Bitcoin na B2 Wallet:", enderecoB2);
```

---

## 💻 Como Usar a CLI Interativa

Basta digitar o comando principal no seu terminal e seguir o assistente:
```bash
cryptoseed
```

### Comandos de Ajuda e Histórico

*   **Ajuda rápida (`-h` ou `--help`):** Mostra o guia de uso e as opções de linha de comando.
    ```bash
    cryptoseed --help
    ```
*   **Compêndio de Informação (`-i` ou `--info`):** Exibe um resumo histórico completo de cada blockchain suportada, os caminhos padrão usados por cada ano e as carteiras compatíveis. Excelente para entender onde os fundos antigos podem estar guardados!
    ```bash
    cryptoseed --info
    ```

---

## 🧮 A Matemática por Trás e Limites de Viabilidade

Se você perdeu sua semente, precisa ser realista sobre as probabilidades. Escrevi o motor para exibir alertas realistas antes de iniciar qualquer busca pesada:

### Tabela de Combinações BIP-39 (Dicionário de 2048 Palavras)

| Palavras Perdidas | Cálculo de Combinações | Total de Possibilidades | Viabilidade Real |
| :---: | :---: | :---: | :--- |
| **1 Palavra** | $2048^1$ | **2.048** | **Totalmente Viável** (Frações de segundo em qualquer CPU) |
| **2 Palavras** | $2048^2$ | **4.194.304** | **Viável** (Poucos segundos com nosso motor otimizado) |
| **3 Palavras** | $2048^3$ | **8.589.934.592** | **Muito Pesado** (Viável se souber as posições ou tiver restrições) |
| **4 Palavras** | $2048^4$ | **17.592.186.044.416** | **Inviável** para computadores comuns (demoraria semanas/meses) |
| **5 Palavras** | $2048^5$ | **36.028.797.018.963.968**| **Matematicamente Impossível** (Exigiria supercomputadores) |

---

## 📊 Matriz de Blockchains e Carteiras Suportadas (39 Redes)

Abaixo consta a relação completa e detalhada de todas as 39 redes e ecossistemas suportados nativamente pelo motor de derivação do **cryptoseed**, assegurando compatibilidade retroativa e contemporânea:

| Ecossistema / Rede | Símbolo | Caminho de Derivação Padrão (HD Path) | Carteiras de Referência Compatíveis |
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

## 🛠️ Performance: Nó RPC Local vs API Pública

Ao fim de cada busca, o **cryptoseed** salva um relatório de recuperação detalhado no seu disco (`resultado_recuperacao_[timestamp].txt`) e faz uma estimativa real da velocidade de consulta para ver se as sementes encontradas têm saldo na rede:

*   **Consultando via APIs Públicas (50ms por requisição):** Útil apenas se você tiver poucas sementes candidatas ($<100$). Sofre com latência de internet e bloqueio de limite de requisições.
*   **Consultando via RPC Node Local (0.1ms por requisição):** O caminho ideal para buscas robustas ($>1000$ sementes). Reduz o tempo total de varredura em até **500 vezes** rodando de forma local na sua própria máquina.

---

## 🎓 Easter Egg da Era Satoshi (2009 - 2010)

Se você tentar selecionar no assistente que sua carteira foi criada em ou antes de **2010**, o programa interromperá a execução e te contará um segredo histórico: **Nesta era gênese, sementes mnemônicas NÃO existiam!** 
O cliente original de Satoshi Nakamoto (Bitcoin-Qt) usava chaves privadas aleatórias armazenadas no arquivo binário `wallet.dat`. Se você perdeu esse arquivo, nenhuma frase de palavras poderá recuperar os fundos, pois a semente determinística simplesmente não tinha sido inventada!

---

## 🛡️ Licença, Segurança e Governança

Esta biblioteca roda de forma **100% offline e local** na sua máquina. O código é aberto, limpo e não faz nenhuma requisição de rede para transmitir suas palavras ou chaves privadas. Segurança em primeiro lugar.

*   **Licença:** MIT (Criado em 2023)
*   **Créditos:** Projeto **b2 wallet** / [better2better](https://better2better.net) / [diegooris](https://diegohorantunes.web.app/).
