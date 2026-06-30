#!/usr/bin/env node

/**
 * scripts/validate-locales.js
 * Script de validação que confirma se todos os 5 idiomas suportados têm a mesma quantidade de chaves de tradução.
 * Caso falte alguma chave em algum idioma, ele sinaliza e mostra qual falta para que seja adicionada.
 */

const LOCALES = require('../src/lib/cli-locales');

const requiredLocales = ['pt', 'en', 'es', 'zh', 'ja'];
let hasErrors = false;

console.log('================================================================');
console.log('   🛡️  CryptoSeedRecovery - Validador de Chaves de Tradução');
console.log('================================================================\n');

// 1. Verificar se todos os idiomas necessários estão presentes
const presentLocales = Object.keys(LOCALES);
const missingLocales = requiredLocales.filter(l => !presentLocales.includes(l));

if (missingLocales.length > 0) {
  console.error(`❌ ERRO: Idiomas obrigatórios ausentes no arquivo de localização: [${missingLocales.join(', ')}]\n`);
  process.exit(1);
}

// 2. Coletar a união de todas as chaves de todos os idiomas para ter um dicionário mestre de chaves
const allKeysSet = new Set();
for (const locale of requiredLocales) {
  Object.keys(LOCALES[locale]).forEach(key => allKeysSet.add(key));
}
const allKeys = Array.from(allKeysSet).sort();

console.log(`📊 União de chaves mapeadas: ${allKeys.length} chaves encontradas no total.\n`);

// 3. Comparar cada idioma individualmente com a união de chaves
for (const locale of requiredLocales) {
  const localeKeys = Object.keys(LOCALES[locale]);
  const localeKeysSet = new Set(localeKeys);
  const missingInLocale = allKeys.filter(k => !localeKeysSet.has(k));
  const extraInLocale = localeKeys.filter(k => !allKeysSet.has(k)); // de fato impossível pela definição do allKeys, mas bom por segurança

  console.log(`🌐 Idioma: [${locale.toUpperCase()}]`);
  console.log(`   - Chaves presentes: ${localeKeys.length}/${allKeys.length}`);

  if (missingInLocale.length > 0) {
    hasErrors = true;
    console.error(`   ❌ CHAVES AUSENTES (${missingInLocale.length}):`);
    missingInLocale.forEach(k => {
      console.error(`      • ${k}`);
    });
  } else {
    console.log(`   ✔️  Nenhuma chave ausente.`);
  }

  if (extraInLocale.length > 0) {
    hasErrors = true;
    console.error(`   ⚠️  CHAVES EXTRAS NÃO-ESPERADAS (${extraInLocale.length}):`);
    extraInLocale.forEach(k => {
      console.error(`      • ${k}`);
    });
  }
  console.log('');
}

console.log('================================================================');
if (hasErrors) {
  console.error('❌ VALIDAÇÃO FALHOU: Existem discrepâncias de tradução entre os idiomas!');
  process.exit(1);
} else {
  console.log('✔️  VALIDAÇÃO CONCLUÍDA COM SUCESSO: Todos os idiomas possuem exatamente as mesmas chaves e traduções!');
  process.exit(0);
}
