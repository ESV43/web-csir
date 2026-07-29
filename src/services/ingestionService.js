import { googleSheetsService } from './googleSheetsService';

const INGEST_CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks for base64 transport safety

export const ingestionService = {
  async ingestPDFFile(file, subjectHint = 'auto', onProgress = null) {
    const url = googleSheetsService.getScriptUrl();
    if (!url) {
      throw new Error('Google Apps Script URL not set. Click the Database icon in the navbar to configure it first.');
    }

    if (onProgress) onProgress({ stage: 'reading', message: `Reading ${file.name}...`, percent: 5 });

    // Convert file to base64
    const base64Data = await fileToBase64(file);

    if (onProgress) onProgress({ stage: 'uploading', message: 'Uploading PDF to Google Apps Script...', percent: 20 });

    // POST to GAS
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ingestPDF',
        fileBlob: base64Data,
        fileName: file.name,
        contentType: file.type || 'application/pdf',
        subjectHint: subjectHint,
        pageStart: 0
      })
    });

    if (onProgress) onProgress({ stage: 'processing', message: 'Gemini AI is parsing your textbook...', percent: 60 });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      throw new Error('Invalid response from server. Make sure the Apps Script is deployed as a Web App.');
    }

    if (result.status !== 'success') {
      throw new Error(result.message || 'Ingestion failed.');
    }

    if (onProgress) onProgress({
      stage: 'complete',
      message: `Extracted ${result.itemsExtracted} items from ${result.totalPages} pages!`,
      percent: 100,
      result
    });

    return result;
  },

  async ingestFromDrive(fileId, fileName, subjectHint = 'auto', onProgress = null) {
    const url = googleSheetsService.getScriptUrl();
    if (!url) throw new Error('Google Apps Script URL not set.');

    if (onProgress) onProgress({ stage: 'uploading', message: `Requesting ingestion of ${fileName}...`, percent: 10 });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ingestPDF',
        fileId: fileId,
        fileName: fileName,
        subjectHint: subjectHint,
        pageStart: 0
      })
    });

    if (onProgress) onProgress({ stage: 'processing', message: 'Gemini AI is parsing...', percent: 50 });

    const result = await response.json();

    if (onProgress) onProgress({
      stage: result.status === 'success' ? 'complete' : 'error',
      message: result.status === 'success'
        ? `Extracted ${result.itemsExtracted} items!`
        : result.message || 'Failed',
      percent: 100,
      result
    });

    return result;
  },

  async fetchIngestionLog() {
    const url = googleSheetsService.getScriptUrl();
    if (!url) return [];
    try {
      const res = await fetch(`${url}?action=getIngestionLog`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  setGeminiKey(key) {
    // Store the key script-side by calling the GAS endpoint
    const url = googleSheetsService.getScriptUrl();
    if (url) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setGeminiKey', key })
      }).catch(() => {});
    }
  }
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
