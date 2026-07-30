import { googleSheetsService } from './googleSheetsService';

export const ingestionService = {
  /**
   * Upload a PDF to Google Drive via the GAS proxy, then trigger ingestion by file ID.
   * This avoids the GAS ~50MB request body limit.
   *
   * Flow:
   *   1. POST file bytes to GAS `uploadToDrive` endpoint (GAS writes to Drive)
   *   2. GAS returns the Drive file ID
   *   3. POST `ingestPDF` with that file ID → GAS reads from Drive, OCRs, sends to Gemini
   */
  async ingestPDFFile(file, subjectHint = 'auto', onProgress = null) {
    const url = googleSheetsService.getScriptUrl();
    if (!url) {
      throw new Error('Google Apps Script URL not set. Click the Database icon in the navbar to configure it first.');
    }

    // Step 1: Upload to Drive via GAS
    if (onProgress) onProgress({ stage: 'uploading', message: `Uploading ${file.name} to Google Drive...`, percent: 15 });

    let fileId = null;
    try {
      // Convert to base64 in chunks if needed (FileReader handles this)
      const base64Data = await fileToBase64(file);

      // If file is large (>5MB), send in chunks to GAS
      if (base64Data.length > 5 * 1024 * 1024) {
        fileId = await this._chunkedUpload(file, base64Data, onProgress);
      } else {
        const uploadRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'uploadToDrive',
            fileName: file.name,
            mimeType: file.type || 'application/pdf',
            fileBlob: base64Data
          })
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.status !== 'success') throw new Error(uploadJson.message || 'Drive upload failed');
        fileId = uploadJson.fileId;
      }
    } catch (err) {
      // If the upload fails (file too big or network), fall back to Drive file ID method
      throw new Error(`Upload failed: ${err.message}. Try uploading the PDF to Google Drive manually and use the Drive ingestion method in the Apps Script editor:\n\n  ingestFromDrive("FILE_ID", "${subjectHint}")`);
    }

    if (onProgress) onProgress({ stage: 'processing', message: 'AI is parsing your textbook (OCR + extraction)...', percent: 40 });

    // Step 2: Trigger ingestion by file ID
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'ingestPDF',
        fileId: fileId,
        fileName: file.name,
        subjectHint: subjectHint,
        pageStart: 0
      })
    });

    if (onProgress) onProgress({ stage: 'processing', message: 'Gemini AI is extracting content...', percent: 70 });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      throw new Error('Invalid response from server. The request may have timed out. For large books, use the Drive method: ingestFromDrive() in Apps Script.');
    }

    if (result.status !== 'success') {
      throw new Error(result.message || 'Ingestion failed.');
    }

    if (onProgress) onProgress({
      stage: 'complete',
      message: `Extracted ${result.itemsExtracted || 0} items from ${result.totalPages || 0} pages!`,
      percent: 100,
      result
    });

    return result;
  },

  /**
   * For files >5MB: upload in 4MB base64 chunks via multiple requests.
   */
  async _chunkedUpload(file, fullBase64, onProgress) {
    const url = googleSheetsService.getScriptUrl();
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB base64 per request
    const totalChunks = Math.ceil(fullBase64.length / CHUNK_SIZE);
    let fileId = null;

    // Init upload
    const initRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'initChunkedUpload',
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        totalChunks
      })
    });
    const initData = await initRes.json();
    if (initData.status !== 'success') throw new Error('Failed to init chunked upload');
    fileId = initData.fileId;

    // Send chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const chunk = fullBase64.substring(start, start + CHUNK_SIZE);

      if (onProgress) onProgress({
        stage: 'uploading',
        message: `Uploading chunk ${i + 1}/${totalChunks}...`,
        percent: 15 + Math.round((i / totalChunks) * 25)
      });

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'appendChunk',
          fileId: fileId,
          chunkIndex: i,
          fileBlob: chunk
        })
      });
    }

    // Finalize
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'finalizeChunkedUpload',
        fileId: fileId
      })
    });

    return fileId;
  },

  async ingestFromDrive(fileId, fileName, subjectHint = 'auto', onProgress = null) {
    const url = googleSheetsService.getScriptUrl();
    if (!url) throw new Error('Google Apps Script URL not set.');

    if (onProgress) onProgress({ stage: 'processing', message: `AI is parsing ${fileName}...`, percent: 20 });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'ingestPDF',
        fileId: fileId,
        fileName: fileName,
        subjectHint: subjectHint,
        pageStart: 0
      })
    });

    if (onProgress) onProgress({ stage: 'processing', message: 'Gemini AI is extracting content...', percent: 50 });

    const result = await response.json();

    if (onProgress) onProgress({
      stage: result.status === 'success' ? 'complete' : 'error',
      message: result.status === 'success'
        ? `Extracted ${result.itemsExtracted || 0} items!`
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
  }
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
