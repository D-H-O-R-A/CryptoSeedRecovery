const { parentPort } = require('worker_threads');
const { searchMode1, searchMode2And3, searchMode4 } = require('./search-engine');

if (!parentPort) {
  process.exit(1);
}

parentPort.on('message', (message) => {
  if (message.type === 'start') {
    const {
      mode,
      phraseWords,
      constraints,
      format,
      wordlist,
      walletType,
      coinKey,
      targetAddress,
      pattern,
      startPrefixes,
      startStates,
      language
    } = message;

    let lastProgressReportTime = Date.now();

    const onProgress = (checked, total) => {
      const now = Date.now();
      // Envia atualizações de progresso em lotes de no máximo 100ms para evitar gargalo de IPC
      if (now - lastProgressReportTime >= 100) {
        parentPort.postMessage({
          type: 'progress',
          checked: Number(checked)
        });
        lastProgressReportTime = now;
      }
    };

    try {
      let result;
      if (mode === 1) {
        result = searchMode1(phraseWords, format, wordlist, walletType, coinKey, targetAddress, onProgress, pattern, startPrefixes, language);
      } else if (mode === 2 || mode === 3) {
        result = searchMode2And3(phraseWords, constraints, format, wordlist, walletType, coinKey, targetAddress, onProgress, pattern, startStates, language);
      } else if (mode === 4) {
        result = searchMode4(phraseWords, format, walletType, coinKey, targetAddress, onProgress, pattern, startStates, language);
      }

      // Garante progresso de 100% ao final
      parentPort.postMessage({
        type: 'progress',
        checked: Number(result.totalChecked)
      });

      parentPort.postMessage({
        type: 'done',
        results: result.results,
        totalChecked: Number(result.totalChecked),
        assembledCandidates: result.assembledCandidates
      });
    } catch (err) {
      parentPort.postMessage({
        type: 'error',
        message: err.message
      });
    }
  }
});
