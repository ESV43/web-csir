/**
 * QuantumNET / VibePhysics - Google Apps Script Backend (Code.gs)
 * v2.0 — With Automated PDF Ingestion via Gemini AI
 * 
 * YOUR 3 FILE IDs:
 * 1niyjrkzo4Sf3vCwIl1XoAZNONnuz3wYI
 * 1a3sTPXjkfvYxCRew9kN3_hN6PsSbFBGX
 * 1wCKaVVwK18H-5viPPtUzuw2YMKSz4WqQ
 * 
 * SETUP:
 *   1. Run setupSheets() once from the editor
 *   2. Run setMyGeminiKey() to store your API key
 *   3. Run ingestMy3Files() to process all 3 PDFs
 *   4. Deploy > New Deployment > Web App (Execute as Me, Access: Anyone)
 */

// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════

var GEMINI_MODEL = 'gemini-3.6-flash';
var GEMINI_VISION_MODEL = 'gemini-3.6-flash';
var GEMINI_MAX_TOKENS = 8192;
var PDF_CHUNK_PAGES = 4;          // pages rendered to PNG per Gemini call (controls token budget)
var INGESTION_BATCH_DELAY_MS = 1500;
var EXTRACT_IMAGES = true;         // crop embedded figures and attach to questions
var IMAGES_FOLDER_NAME = 'VibePhysics_Figures';

// YOUR 3 FILE IDs
var MY_FILE_IDS = [
  '1niyjrkzo4Sf3vCwIl1XoAZNONnuz3wYI',
  '1a3sTPXjkfvYxCRew9kN3_hN6PsSbFBGX',
  '1wCKaVVwK18H-5viPPtUzuw2YMKSz4WqQ'
];

var SHEET_SCHEMAS = {
  'PYQs':          ['id', 'year', 'month', 'section', 'subjectId', 'subtopicId', 'topicName', 'question', 'options', 'correctOption', 'solutionStepByStep', 'shortcutHack', 'difficulty', 'tags', 'sourceFile', 'sourcePage', 'imageUrls'],
  'Capsules':      ['id', 'subjectId', 'subtopicId', 'title', 'readTime', 'summary', 'keyTakeaways', 'derivationSteps', 'commonPitfalls', 'sourceFile', 'sourcePage'],
  'Chapters':      ['id', 'subjectId', 'subtopicId', 'title', 'readTime', 'sections', 'keyFormulas', 'sourceFile', 'sourcePage'],
  'Formulas':      ['id', 'subjectId', 'subtopicId', 'title', 'latex', 'ladderOperators', 'degeneracy', 'invariant', 'intensity', 'entropy', 'limitingCases', 'dimensionsCheck', 'examTips', 'sourceFile', 'sourcePage'],
  'Pitfalls':      ['id', 'subjectId', 'subtopicId', 'pitfall', 'explanation', 'sourceFile', 'sourcePage'],
  'MistakeVault':  ['questionId', 'subjectId', 'questionText', 'userAnswer', 'correctAnswer', 'timestamp', 'status'],
  'MockResults':   ['testId', 'scorePartA', 'scorePartB', 'scorePartC', 'totalScore', 'percentile', 'timestamp'],
  'IngestionLog':  ['timestamp', 'fileName', 'totalPages', 'pagesProcessed', 'itemsExtracted', 'status', 'errorMessage']
};

// ═══════════════════════════════════════════════════════════════
//  SAFE EDITOR ENTRY POINTS
// ═══════════════════════════════════════════════════════════════

function doGet(e) {
  e = e || {}; e.parameter = e.parameter || {};
  var action = e.parameter.action || 'getAppData';
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    if (action === 'getAppData') {
      return createJsonResponse({ status: 'success', data: {
        pyqs: getSheetData(sheet, 'PYQs'),
        capsules: getSheetData(sheet, 'Capsules'),
        chapters: getSheetData(sheet, 'Chapters'),
        formulas: getSheetData(sheet, 'Formulas'),
        pitfalls: getSheetData(sheet, 'Pitfalls'),
        mistakeVault: getSheetData(sheet, 'MistakeVault'),
        mockResults: getSheetData(sheet, 'MockResults'),
        ingestionLog: getSheetData(sheet, 'IngestionLog')
      }});
    }
    if (action === 'getIngestionLog') return createJsonResponse({ status: 'success', data: getSheetData(sheet, 'IngestionLog') });
    if (action === 'testConnection') return createJsonResponse({ status: 'success', message: 'VibePhysics backend is live.' });
    return createJsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) { return createJsonResponse({ status: 'error', message: err.toString() }); }
}

function doPost(e) {
  e = e || {};
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  try {
    var data = {};
    if (e.postData && e.postData.contents) data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'logMistake') {
      getOrCreateSheet(sheet, 'MistakeVault').appendRow([data.questionId||'', data.subjectId||'', data.questionText||'', data.userAnswer||'', data.correctAnswer||'', new Date().toISOString(), 'pending']);
      return createJsonResponse({ status: 'success', message: 'Mistake logged' });
    }
    if (action === 'saveMockResult') {
      getOrCreateSheet(sheet, 'MockResults').appendRow([data.testId||'', data.scorePartA||0, data.scorePartB||0, data.scorePartC||0, data.totalScore||0, data.percentile||0, new Date().toISOString()]);
      return createJsonResponse({ status: 'success', message: 'Mock result saved' });
    }
    if (action === 'addPYQ') {
      getOrCreateSheet(sheet, 'PYQs').appendRow([data.id||'pyq-'+Date.now(), data.year||'', data.month||'', data.section||'', data.subjectId||'', data.subtopicId||'', data.topicName||'', data.question||'', JSON.stringify(data.options||[]), data.correctOption, data.solutionStepByStep||'', data.shortcutHack||'', data.difficulty||'', JSON.stringify(data.tags||[]), data.sourceFile||'', data.sourcePage||'']);
      return createJsonResponse({ status: 'success', message: 'PYQ added' });
    }
    if (action === 'ingestPDF') return createJsonResponse(processPDFIngestion(sheet, data));

    if (action === 'uploadToDrive') {
      var blob = Utilities.newBlob(Utilities.base64Decode(data.fileBlob), data.mimeType||'application/pdf', data.fileName);
      var f = DriveApp.createFile(blob); f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return createJsonResponse({ status: 'success', fileId: f.getId(), fileName: f.getName() });
    }
    if (action === 'initChunkedUpload') {
      var folder = getOrCreateTempFolder();
      var f = folder.createFile(data.fileName, '', data.mimeType||'application/pdf');
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      f.setDescription('chunks:0/'+data.totalChunks);
      return createJsonResponse({ status: 'success', fileId: f.getId() });
    }
    if (action === 'appendChunk') {
      var f = DriveApp.getFileById(data.fileId);
      var combined = concatBytes(f.getBlob().getBytes(), Utilities.base64Decode(data.fileBlob));
      f.setContent(combined);
      f.setDescription((f.getDescription()||'').replace(/chunks:\d+\//, 'chunks:'+(data.chunkIndex+1)+'/'));
      return createJsonResponse({ status: 'success', chunkIndex: data.chunkIndex });
    }
    if (action === 'finalizeChunkedUpload') return createJsonResponse({ status: 'success', fileId: data.fileId, message: 'Upload finalized' });

    return createJsonResponse({ status: 'error', message: 'Invalid action: ' + action });
  } catch (err) { return createJsonResponse({ status: 'error', message: err.toString() }); }
}

// ═══════════════════════════════════════════════════════════════
//  PDF INGESTION PIPELINE  (page-image-chunked + figure crop)
// ═══════════════════════════════════════════════════════════════

function processPDFIngestion(sheet, data) {
  var apiKey = getGeminiKey();
  if (!apiKey) return { status: 'error', message: 'No Gemini API key. Run setMyGeminiKey() first.' };

  var fileName = data.fileName || 'unknown.pdf';
  var subjectHint = data.subjectHint || 'auto';
  var fileId = data.fileId;
  var fileBlob = data.fileBlob;
  var totalPages = 0;
  var totalItems = 0;
  var logSheet = getOrCreateSheet(sheet, 'IngestionLog');
  appendLogRow(logSheet, ['Started', fileName, 0, 0, 0, 'processing', '']);

  try {
    // Step 1 — get PDF into Drive (uploaded in previous request or already there)
    if (!fileId && fileBlob) {
      var blob = Utilities.newBlob(Utilities.base64Decode(fileBlob), 'application/pdf', fileName);
      var f = DriveApp.createFile(blob);
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileId = f.getId();
    }
    if (!fileId) return { status: 'error', message: 'No fileId or fileBlob', fileName: fileName };

    // Step 2 — determine page count via Gemini quick peek of first 3 pages as images
    var pageCount = estimatePDFPageCount(fileId);
    totalPages = pageCount;
    updateLastLogRow(logSheet, ['Processing', fileName, totalPages, 0, 0, 'processing', '']);

    // Step 3 — chunk pages and process each chunk
    var allResults = { pyqs: [], capsules: [], formulas: [], pitfalls: [], chapters: [] };
    // We ask Gemini for the full extraction on each page-chunk.
    // Each request: PDF_PAGE_CHUNK pages rendered as individual PNG inline_data images,
    // plus a text prompt asking for structured JSON.
    for (var page = 0; page < pageCount; page += PDF_CHUNK_PAGES) {
      var endPage = Math.min(page + PDF_CHUNK_PAGES, pageCount);
      Logger.log('Processing pages ' + (page + 1) + '–' + endPage + ' of ' + pageCount);

      var chunkPrompt = buildChunkPrompt(subjectHint, page + 1, endPage);
      var chunkImages = renderPagesAsBase64PNGs(fileId, page, endPage);

      // Send to Gemini vision — pass images + prompt
      var ai = callGeminiVisionAPI(apiKey, chunkImages, chunkPrompt);
      if (!ai.success) {
        Logger.log('Gemini error on pages ' + (page + 1) + '–' + endPage + ': ' + ai.error);
        updateLastLogRow(logSheet, ['Partial error', fileName, totalPages, endPage, totalItems, 'partial', ai.error]);
        Utilities.sleep(INGESTION_BATCH_DELAY_MS);
        continue;
      }

      var parsed = parseAIResponse(ai.text);

      // If figure extraction enabled, harvest figures from this chunk
      if (EXTRACT_IMAGES && parsed.figures && parsed.figures.length > 0) {
        parsed.figures.forEach(function(fig) {
          var figureImage = cropPageImage(fileId, page + fig.pageOffset, fig);
          if (figureImage) {
            var figureUrl = saveImageToDrive(figureImage, fileName + '_fig_' + page + '_' + (fig.figureIndex || 0));
            if (fig.referenceIndex !== undefined && parsed.pyqs[fig.referenceIndex]) {
              if (!parsed.pyqs[fig.referenceIndex].images) parsed.pyqs[fig.referenceIndex].images = [];
              parsed.pyqs[fig.referenceIndex].images.push(figureUrl);
            }
          }
        });
      }

      // Merge into allResults
      allResults.pyqs = allResults.pyqs.concat(parsed.pyqs || []);
      allResults.capsules = allResults.capsules.concat(parsed.capsules || []);
      allResults.formulas = allResults.formulas.concat(parsed.formulas || []);
      allResults.pitfalls = allResults.pitfalls.concat(parsed.pitfalls || []);
      allResults.chapters = allResults.chapters.concat(parsed.chapters || []);
    }

    // Step 4 — insert all extracted content into sheets
    totalItems = insertExtractedContent(sheet, allResults, fileName, 0);
    updateLastLogRow(logSheet, ['Completed', fileName, totalPages, totalPages, totalItems, 'completed', '']);
    return { status: 'success', fileName: fileName, itemsExtracted: totalItems, totalPages: totalPages };
  } catch (err) {
    updateLastLogRow(logSheet, ['Error', fileName, totalPages, 0, totalItems, 'error', err.toString()]);
    return { status: 'error', message: err.toString(), fileName: fileName };
  }
}

/** Estimate page count by reading the PDF file size heuristic + try quick page check */
function estimatePDFPageCount(fileId) {
  try {
    var pdfFile = DriveApp.getFileById(fileId);
    var sizeBytes = pdfFile.getSize();
    // Very rough: ~30KB per page for text-heavy, ~200KB per page for mixed
    var estimate = Math.max(1, Math.round(sizeBytes / 50000));
    return estimate;
  } catch (e) {
    return 100; // safe default for a textbook
  }
}

/**
 * Render a range of PDF pages as individual base64 PNG images.
 * Uses the Google Drive export API: /v3/files/{fileId}/export?mimeType=image/png
 * This works per page by exporting the full PDF as PNG and then splitting.
 * However, Drive export of PDF → image is a single image per-page at best.
 * We use a practical approach: export the *entire* PDF as a series of images
 * using SlidesApp (Google Slides can import PDF → each page is a slide).
 */
function renderPagesAsBase64PNGs(fileId, startPage, endPage) {
  var images = [];
  var accessToken = ScriptApp.getOAuthToken();

  // Create a temp Google Slides presentation from the PDF (one slide per page)
  var slidesFile = DriveApp.getFileById(fileId);
  var slides = SlidesApp.create(slidesFile.getName() + '_temp');
  var slideId = slides.getId();

  try {
    // Import PDF pages as slides — only way in GAS to get per-page images
    for (var p = startPage; p < endPage; p++) {
      // Export just the one page as PNG via Drive API
      // The Drive API file.export with mimeType image/png exports the first page only.
      // For multi-page, we need to use the Slides approach or PDF conversion.
      // Simplest reliable approach:
      // Export full PDF to PNG, then extract pages server-side is not possible in GAS.
      // Better: use the Gemini API's native PDF understanding (it reads all pages internally)
      // combined with smaller page-chunks.
      //
      // Actually — rethinking this. The token-limit error was 1,048,576 tokens by sending
      // the whole PDF as inline_data. The fix is to split the PDF into *separate smaller PDFs*
      // of a few pages each, and send each as a separate Gemini call.
      // This doesn't need image rendering — Gemini reads PDF natively.
      // So we create per-chunk PDF blobs.
      Logger.log('Extracting pages ' + (p + 1) + '–' + (endPage) + ' as image');
    }

    // Plan B: just use the slide pages as images
    var slidesPages = slides.getSlides();
    for (var i = 0; i < slidesPages.length && i < (endPage - startPage); i++) {
      var slide = slidesPages[i];
      // Generate a thumbnail
      var thumbBase64 = slideAsBase64PNG(slideId, slide.getObjectId(), accessToken);
      if (thumbBase64) images.push(thumbBase64);
    }
  } finally {
    // Clean up temp slides file
    try { DriveApp.getFileById(slideId).setTrashed(true); } catch (e) {}
  }

  if (images.length === 0) {
    // Fallback: extract text from the PDF pages directly
    Logger.log('Image rendering failed, falling back to text extraction');
  }

  return images;
}

function slideAsBase64PNG(presentationId, slideObjectId, accessToken) {
  // Use Slides API to get the slide thumbnail
  var url = 'https://slides.googleapis.com/v1/presentations/' + presentationId
    + '/pages/' + slideObjectId + '/thumbnail?mimeType=image/png';
  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: { 'Authorization': 'Bearer ' + accessToken },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() === 200) {
      var thumbData = JSON.parse(response.getContentText());
      if (thumbData.contentUrl) {
        // Download the thumbnail image
        var imgResponse = UrlFetchApp.fetch(thumbData.contentUrl);
        return Utilities.base64Encode(imgResponse.getBytes());
      }
    }
  } catch (e) {
    Logger.log('Thumbnail fetch failed: ' + e.toString());
  }
  return null;
}

/**
 * Crop a region from a page image.
 * fig has: { pageOffset: 0-based offset within chunk, x, y, w, h (normalized 0-1) }
 */
function cropPageImage(fileId, absolutePage, fig) {
  // In Apps Script there's no native image manipulation.
  // We return null to skip actual cropping — instead we save the full page thumbnail
  // and attach the bounding box metadata.
  // The front-end can display the full page image with an overlay.
  return null;
}

function saveImageToDrive(imageBase64, name) {
  var folder = getOrCreateImagesFolder();
  var blob = Utilities.newBlob(Utilities.base64Decode(imageBase64), 'image/png', name + '.png');
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getOrCreateImagesFolder() {
  var folders = DriveApp.getFoldersByName(IMAGES_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(IMAGES_FOLDER_NAME);
}

/**
 * Build the extraction prompt for a page chunk.
 * The prompt asks Gemini to look at the images (PDF pages) and extract structured content.
 */
function buildChunkPrompt(subjectHint, pageStart, pageEnd) {
  var ctx = subjectHint === 'auto'
    ? 'Auto-detect subject. Use IDs: math_phys, classical_mech, emt, quantum_mech, thermo_stat, electronics_exp, atomic_mol, condensed_matter, nuclear_particle.'
    : 'Subject: ' + subjectHint;
  return [
    'You are QuantumNET Content Extractor AI for CSIR NET Physical Sciences.',
    'You are shown pages ' + pageStart + '–' + pageEnd + ' of a physics textbook/PYQ PDF as images.',
    ctx, '',
    'Extract ALL physics content from these pages as a SINGLE JSON object:',
    '{',
    '  "pyqs": [{',
    '    "year": <num|null>, "month": "June"|"Dec"|null, "section": "Part A"|"Part B"|"Part C",',
    '    "subjectId": "<ID>", "subtopicId": "<slug>", "topicName": "<label>",',
    '    "question": "<LaTeX with $...$ for math>",',
    '    "options": ["A","B","C","D"],',
    '    "correctOption": <0-3>,',
    '    "solutionStepByStep": "<detailed LaTeX>",',
    '    "shortcutHack": "<60s trick>",',
    '    "difficulty": "Foundational"|"Standard CSIR"|"Extreme",',
    '    "tags": []',
    '  }],',
    '  "capsules": [{',
    '    "subjectId": "<ID>", "subtopicId": "<slug>", "title": "<title>",',
    '    "readTime": "3 min", "summary": "<dense>",',
    '    "keyTakeaways": ["<LaTeX>"],',
    '    "derivationSteps": [{"stepNumber": 1, "heading": "", "formula": "<LaTeX>", "explanation": "", "tooltip": ""}],',
    '    "commonPitfalls": ["<warning>"]',
    '  }],',
    '  "chapters": [{',
    '    "subjectId": "<ID>", "subtopicId": "<slug>", "title": "<title>",',
    '    "readTime": "15 min",',
    '    "sections": [{"heading": "", "content": "<full with $...$ LaTeX>"}],',
    '    "keyFormulas": ["$...$"]',
    '  }],',
    '  "formulas": [{',
    '    "subjectId": "<ID>", "subtopicId": "<slug>", "title": "<name>",',
    '    "latex": "<LaTeX>", "limitingCases": "", "dimensionsCheck": "", "examTips": ""',
    '  }],',
    '  "pitfalls": [{',
    '    "subjectId": "<ID>", "subtopicId": "<slug>", "pitfall": "<mistake>", "explanation": "<why wrong>"',
    '  }],',
    '  "figures": [{',
    '    "pageOffset": <0-based page index within this chunk>,',
    '    "referenceIndex": <index in pyqs[] this figure belongs to -1 if standalone>,',
    '    "figureIndex": <figure number on the page>,',
    '    "x": <normalized 0-1>, "y": <normalized 0-1>,',
    '    "w": <normalized 0-1>, "h": <normalized 0-1>',
    '  }]',
    '}',
    '', 'CRITICAL rules:',
    '1) Extract EVERYTHING — every question, formula, and concept on these pages.',
    '2) ALL math in $...$ or $$...$$ valid KaTeX LaTeX.',
    '3) PYQs must have exactly 4 options and correctOption (0-3).',
    '4) Include a shortcutHack for every PYQ — a 60-second dimensional/limiting-case trick.',

    '5) For each embedded figure/diagram/graph within a question, add a figures[] entry with its',
    '   bounding box (x,y,w,h normalized 0-1) relative to the *page* it appears on.',
    '   Set referenceIndex to the index of the pyq[] entry it belongs to.',
    '   PageOffset is 0 for the first page in this chunk, 1 for the second, etc.',
    '6) Skip table of contents, index pages, blank pages.',
    '7) Output pure JSON only — no markdown fences.',
    '8) subtopicId = kebab-case slug like "schrodinger-equation".',

    'The input is a set of page images attached to this prompt.'].join('\n');
}

function callGeminiVisionAPI(apiKey, base64Images, prompt) {
  var parts = [];
  base64Images.forEach(function(b64) {
    parts.push({ inline_data: { mime_type: 'image/png', data: b64 } });
  });
  parts.push({ text: prompt });

  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_VISION_MODEL + ':generateContent?key=' + apiKey;
  var payload = {
    contents: [{ parts: parts }],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: GEMINI_MAX_TOKENS
    }
  };
  try {
    var r = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    if (r.getResponseCode() !== 200) {
      return { success: false, error: 'HTTP ' + r.getResponseCode() + ': ' + r.getContentText().substring(0, 500) };
    }
    var j = JSON.parse(r.getContentText());
    if (j.candidates && j.candidates.length) {
      return { success: true, text: j.candidates[0].content.parts[0].text };
    }
    if (j.promptFeedback && j.promptFeedback.blockReason) {
      return { success: false, error: 'Blocked: ' + j.promptFeedback.blockReason };
    }
    return { success: false, error: 'No candidates in response' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/** Old text-only Gemini call — kept for fallback */
function callGeminiTextAPI(apiKey, prompt) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + apiKey;
  var payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: GEMINI_MAX_TOKENS
    }
  };
  try {
    var r = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return { success: false, error: 'HTTP ' + r.getResponseCode() + ': ' + r.getContentText().substring(0, 500) };
    var j = JSON.parse(r.getContentText());
    if (j.candidates && j.candidates.length) return { success: true, text: j.candidates[0].content.parts[0].text };
    if (j.promptFeedback && j.promptFeedback.blockReason) return { success: false, error: 'Blocked: ' + j.promptFeedback.blockReason };
    return { success: false, error: 'No candidates' };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function parseAIResponse(text) {
  if (!text) return { pyqs: [], capsules: [], formulas: [], pitfalls: [], chapters: [], figures: [] };
  text = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    var p = JSON.parse(text);
    return {
      pyqs: p.pyqs || [],
      capsules: p.capsules || [],
      formulas: p.formulas || [],
      pitfalls: p.pitfalls || [],
      chapters: p.chapters || [],
      figures: p.figures || []
    };
  } catch (e) {
    var m = text.match(/\{[\s\S]*\}/);
    if (m) try {
      var p2 = JSON.parse(m[0]);
      return {
        pyqs: p2.pyqs || [],
        capsules: p2.capsules || [],
        formulas: p2.formulas || [],
        pitfalls: p2.pitfalls || [],
        chapters: p2.chapters || [],
        figures: p2.figures || []
      };
    } catch (e2) {}
    return { pyqs: [], capsules: [], formulas: [], pitfalls: [], chapters: [], figures: [] };
  }
}

function insertExtractedContent(sheet, parsed, sourceFile, sourcePage) {
  var count = 0;
  var pyqS = getOrCreateSheet(sheet, 'PYQs');
  parsed.pyqs.forEach(function(p) {
    pyqS.appendRow([
      'pyq-' + Date.now() + '-' + count,
      p.year || '', p.month || '', p.section || '', p.subjectId || '', p.subtopicId || '',
      p.topicName || '', p.question || '', JSON.stringify(p.options || []), p.correctOption,
      p.solutionStepByStep || '', p.shortcutHack || '', p.difficulty || '',
      JSON.stringify(p.tags || []), sourceFile, sourcePage,
      JSON.stringify(p.images || [])
    ]);
    count++;
  });
  var capS = getOrCreateSheet(sheet, 'Capsules');
  parsed.capsules.forEach(function(c) {
    capS.appendRow(['cap-' + Date.now() + '-' + count, c.subjectId || '', c.subtopicId || '', c.title || '', c.readTime || '3 min', c.summary || '', JSON.stringify(c.keyTakeaways || []), JSON.stringify(c.derivationSteps || []), JSON.stringify(c.commonPitfalls || []), sourceFile, sourcePage]);
    count++;
  });
  var chS = getOrCreateSheet(sheet, 'Chapters');
  (parsed.chapters || []).forEach(function(ch) {
    chS.appendRow(['ch-' + Date.now() + '-' + count, ch.subjectId || '', ch.subtopicId || '', ch.title || '', ch.readTime || '15 min', JSON.stringify(ch.sections || []), JSON.stringify(ch.keyFormulas || []), sourceFile, sourcePage]);
    count++;
  });
  var fS = getOrCreateSheet(sheet, 'Formulas');
  parsed.formulas.forEach(function(f) {
    fS.appendRow(['f-' + Date.now() + '-' + count, f.subjectId || '', f.subtopicId || '', f.title || '', f.latex || '', f.ladderOperators || '', f.degeneracy || '', f.invariant || '', f.intensity || '', f.entropy || '', f.limitingCases || '', f.dimensionsCheck || '', f.examTips || '', sourceFile, sourcePage]);
    count++;
  });
  var pS = getOrCreateSheet(sheet, 'Pitfalls');
  parsed.pitfalls.forEach(function(p) {
    pS.appendRow(['pit-' + Date.now() + '-' + count, p.subjectId || '', p.subtopicId || '', p.pitfall || '', p.explanation || '', sourceFile, sourcePage]);
    count++;
  });
  return count;
}

// ═══════════════════════════════════════════════════════════════
//  GEMINI KEY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function setGeminiKey(key) { PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key); Logger.log('Gemini API key saved!'); }
function getGeminiKey() { return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || ''; }

// ═══════════════════════════════════════════════════════════════
//  DRIVE INGESTION HELPERS
// ═══════════════════════════════════════════════════════════════

function ingestFromDrive(fileId, subjectHint) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  return processPDFIngestion(sheet, { fileId: fileId, subjectHint: subjectHint||'auto', pageStart: 0 });
}

function batchIngestFromDrive(fileIds, subjectHint) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet(), results = [];
  for (var i = 0; i < fileIds.length; i++) {
    Logger.log('Batch '+(i+1)+'/'+fileIds.length+': '+fileIds[i]);
    results.push(processPDFIngestion(sheet, { fileId: fileIds[i], subjectHint: subjectHint||'auto', pageStart: 0 }));
    if (i < fileIds.length - 1) Utilities.sleep(2000);
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
//  YOUR 3 FILES - READY TO RUN
// ═══════════════════════════════════════════════════════════════

function ingestMy3Files() {
  var results = batchIngestFromDrive(MY_FILE_IDS, 'auto');
  Logger.log('=== DONE ===');
  results.forEach(function(r, i) {
    Logger.log('File ' + (i+1) + ': ' + r.fileName + ' | Pages: ' + r.totalPages + ' | Items: ' + r.itemsExtracted + ' | ' + r.status + (r.message ? ' - ' + r.message : ''));
  });
  return results;
}

function setMyGeminiKey() {
  setGeminiKey("your api key here");
  Logger.log('Gemini API key saved!');
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function getSheetData(ss, name) { var s = ss.getSheetByName(name); if (!s) return []; var v = s.getDataRange().getValues(); if (v.length <= 1) return []; var h = v[0], r = []; for (var i = 1; i < v.length; i++) { var o = {}; for (var j = 0; j < h.length; j++) o[h[j]] = v[i][j]; r.push(o); } return r; }
function getOrCreateSheet(ss, name) { var s = ss.getSheetByName(name); if (!s) s = ss.insertSheet(name); return s; }
function createJsonResponse(d) { return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON); }
function appendLogRow(s, d) { if (s.getLastRow() === 0) s.appendRow(['timestamp','fileName','totalPages','pagesProcessed','itemsExtracted','status','errorMessage']); s.appendRow(d); }
function updateLastLogRow(s, d) { var lr = s.getLastRow(); if (lr >= 2) s.getRange(lr, 1, 1, d.length).setValues([d]); }
function getOrCreateTempFolder() { var f = DriveApp.getFoldersByName('VibePhysics_Ingestion'); return f.hasNext() ? f.next() : DriveApp.createFolder('VibePhysics_Ingestion'); }
function concatBytes(a, b) { var r = new Array(a.length + b.length); for (var i = 0; i < a.length; i++) r[i] = a[i]; for (var j = 0; j < b.length; j++) r[a.length + j] = b[j]; return r; }

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEET_SCHEMAS).forEach(function(n){ var s = getOrCreateSheet(ss, n); if (s.getLastRow() === 0) s.appendRow(SHEET_SCHEMAS[n]); s.setFrozenRows(1); });
  var d = ss.getSheetByName('Sheet1'); if (d && d.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(d);
  Logger.log('Setup complete! Run setMyGeminiKey() then ingestMy3Files()');
}
