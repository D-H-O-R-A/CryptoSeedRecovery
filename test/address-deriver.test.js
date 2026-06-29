/**
 * CryptoSeedRecovery - Address Deriver Module Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { 
  keccak256, 
  blake2b256, 
  encodeBase58, 
  encodeBase32, 
  encodeBech32,
  calculateStellarCRC16,
  deriveAddress 
} = require('../src/lib/address-deriver');

test('Address Deriver Module', async (t) => {
  // Test mnemonic phrase
  const testMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  await t.test('should calculate correct Keccak-256 hash', () => {
    const hash = keccak256('hello');
    // Expected SHA3-256 / Keccak-256 of 'hello'
    assert.strictEqual(hash, '1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8');
  });

  await t.test('should calculate correct BLAKE2b-256 hash', () => {
    const hashBytes = blake2b256('hello');
    const hashHex = Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    // Expected Blake2b-256 of 'hello'
    assert.strictEqual(hashHex, '324dcf027dd4a30a932c441f365a25e86b173defa4b8e58948253471b81b72cf');
  });

  await t.test('should encode base58 correctly', () => {
    const bytes = new Uint8Array([0, 1, 2, 3]);
    const encoded = encodeBase58(bytes);
    assert.match(encoded, /^[1-9A-HJ-NP-Za-km-z]+$/);
  });

  await t.test('should encode base32 correctly', () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const encoded = encodeBase32(bytes);
    assert.match(encoded, /^[A-Z2-7]+$/);
  });

  await t.test('should encode bech32 correctly', () => {
    const bytes = new Uint8Array([10, 20, 30, 40]);
    const encoded = encodeBech32('bc', 0, bytes);
    assert.match(encoded, /^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/);
  });

  await t.test('should calculate Stellar CRC16', () => {
    const bytes = new Uint8Array([0x01, 0x02, 0x03]);
    const crc = calculateStellarCRC16(bytes);
    assert.ok(crc >= 0 && crc <= 65535);
  });

  await t.test('should derive correct standard MetaMask and Trust EVM addresses', () => {
    // MetaMask EVM derivation
    const ethAddressMeta = deriveAddress(testMnemonic, 'metamask', 'ETH');
    assert.strictEqual(ethAddressMeta.startsWith('0x'), true);
    assert.strictEqual(ethAddressMeta.length, 42);
    // Address checksum check
    assert.strictEqual(ethAddressMeta, '0x9858EfFD232B4033E47d90003D41EC34EcaEda94');

    // Trust EVM derivation
    const ethAddressTrust = deriveAddress(testMnemonic, 'trust', 'EVM');
    assert.strictEqual(ethAddressTrust, '0x9858EfFD232B4033E47d90003D41EC34EcaEda94');
  });

  await t.test('should derive custom B2 Wallet multichain addresses with expected format and prefixes', () => {
    // 1. Ethereum / EVM under B2 Wallet
    const ethAddr = deriveAddress(testMnemonic, 'b2wallet', 'EVM');
    assert.strictEqual(ethAddr.startsWith('0x'), true);
    assert.strictEqual(ethAddr.length, 42);

    // 2. Bitcoin SegWit (Bech32)
    const btcAddr = deriveAddress(testMnemonic, 'b2wallet', 'BTC');
    assert.strictEqual(btcAddr.startsWith('bc1q'), true);

    // 3. Litecoin Legacy (starts with 'L')
    const ltcAddr = deriveAddress(testMnemonic, 'b2wallet', 'LTC');
    assert.strictEqual(ltcAddr.startsWith('L'), true);

    // 4. Dogecoin Legacy (starts with 'D')
    const dogeAddr = deriveAddress(testMnemonic, 'b2wallet', 'DOGE');
    assert.strictEqual(dogeAddr.startsWith('D'), true);

    // 5. Tron (starts with 'T')
    const trxAddr = deriveAddress(testMnemonic, 'b2wallet', 'TRX');
    assert.strictEqual(trxAddr.startsWith('T'), true);

    // 6. Solana (base58, length ~44)
    const solAddr = deriveAddress(testMnemonic, 'b2wallet', 'SOL');
    assert.strictEqual(solAddr.length >= 32 && solAddr.length <= 44, true);

    // 7. Stellar (starts with 'G')
    const xlmAddr = deriveAddress(testMnemonic, 'b2wallet', 'XLM');
    assert.strictEqual(xlmAddr.startsWith('G'), true);
    assert.strictEqual(xlmAddr.length, 56);
  });

  await t.test('should derive correct standard and B2 wallet addresses for new blockchains', () => {
    // 1. Dash (starts with 'X')
    const dashAddr = deriveAddress(testMnemonic, 'trust', 'DASH');
    assert.strictEqual(dashAddr.startsWith('X'), true);

    const dashB2 = deriveAddress(testMnemonic, 'b2wallet', 'DASH');
    assert.strictEqual(dashB2.startsWith('X'), true);

    // 2. Secret Network (starts with 'secret1')
    const scrtAddr = deriveAddress(testMnemonic, 'trust', 'SCRT');
    assert.strictEqual(scrtAddr.startsWith('secret1'), true);

    const scrtB2 = deriveAddress(testMnemonic, 'b2wallet', 'SCRT');
    assert.strictEqual(scrtB2.startsWith('secret1'), true);

    // 3. Injective (starts with 'inj1')
    const injAddr = deriveAddress(testMnemonic, 'trust', 'INJ');
    assert.strictEqual(injAddr.startsWith('inj1'), true);

    const injB2 = deriveAddress(testMnemonic, 'b2wallet', 'INJ');
    assert.strictEqual(injB2.startsWith('inj1'), true);

    // 4. Hedera (starts with '0x')
    const hbarAddr = deriveAddress(testMnemonic, 'trust', 'HBAR');
    assert.strictEqual(hbarAddr.startsWith('0x'), true);

    const hbarB2 = deriveAddress(testMnemonic, 'b2wallet', 'HBAR');
    assert.strictEqual(hbarB2.startsWith('0x'), true);

    // 5. NEM (starts with 'N')
    const xemAddr = deriveAddress(testMnemonic, 'trust', 'XEM');
    assert.strictEqual(xemAddr.startsWith('N'), true);

    const xemB2 = deriveAddress(testMnemonic, 'b2wallet', 'XEM');
    assert.strictEqual(xemB2.startsWith('N'), true);

    // 6. Chia (starts with 'xch1')
    const xchAddr = deriveAddress(testMnemonic, 'trust', 'XCH');
    assert.strictEqual(xchAddr.startsWith('xch1'), true);

    const xchB2 = deriveAddress(testMnemonic, 'b2wallet', 'XCH');
    assert.strictEqual(xchB2.startsWith('xch1'), true);

    // 7. BIP-86 Taproot (starts with 'bc1p')
    const taprootAddr = deriveAddress(testMnemonic, 'trust', 'BTC', 0, 'taproot');
    assert.strictEqual(taprootAddr.startsWith('bc1p'), true);

    const taprootB2 = deriveAddress(testMnemonic, 'b2wallet', 'TAPROOT');
    assert.strictEqual(taprootB2.startsWith('bc1p'), true);
  });

  await t.test('should throw on unsupported wallet profiles or coin types', () => {
    assert.throws(() => deriveAddress(testMnemonic, 'unknown_wallet', 'ETH'), /Unsupported wallet profile/);
    assert.throws(() => deriveAddress(testMnemonic, 'metamask', 'SOL'), /supports 'ETH' \/ 'EVM'/);
  });
});
