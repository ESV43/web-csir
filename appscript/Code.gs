/**
 * QuantumNET / VibePhysics - Google Apps Script Backend (Code.gs)
 * v2.0 — With Automated PDF Ingestion via Gemini AI
 *
 * Deploy as Web App: Execute as "Me", Access: "Anyone"
 *
 * SETUP:
 *   1. Run setupSheets() once from the editor
 *   2. Set your Gemini API key via setGeminiKey("AIza...") or the web GUI
 *   3. Deploy > New Deployment > Web App
 */

// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════

var GEMINI_MODEL = 'gemini-1.5-flash';
var GEMINI_MAX_TOKENS = 8192;
var PDF_CHUNK_PAGES = 8;           // Pages per Gemini API call (keep small for token limits)
var INGESTION_BATCH_DELAY_MS = 1500; // Delay between API calls to avoid rate limits

var SHEET_SCHEMAS = {
  'PYQs':          ['id', 'year', 'month', 'section', 'subjectId', 'subtopicId', 'topicName', 'question', 'options', 'correctOption', 'solutionStepByStep', 'shortcutHack', 'difficulty', 'tags', 'sourceFile', 'sourcePage'],
  'Capsules':      ['id', 'subjectId', 'subtopicId', 'title', 'readTime', 'summary', 'keyTakeaways', 'derivationSteps', 'commonPitfalls', 'sourceFile', 'sourcePage'],
  'Formulas':      ['id', 'subjectId', 'subtopicId', 'title', 'latex', 'ladderOperators', 'degeneracy', 'invariant', 'intensity', 'entropy', 'limitingCases', 'dimensionsCheck', 'examTips', 'sourceFile', 'sourcePage'],
  'Pitfalls':      ['id', 'subjectId', 'subtopicId', 'pitfall', 'explanation', 'sourceFile', 'sourcePage'],
  'MistakeVault':  ['questionId', 'subjectId', 'questionText', 'userAnswer', 'correctAnswer', 'timestamp', 'status'],
  'MockResults':   ['testId', 'scorePartA', 'scorePartB', 'scorePartC', 'totalScore', 'percentile', 'timestamp'],
  'IngestionLog':  ['timestamp', 'fileName', 'totalPages', 'pagesProcessed', 'itemsExtracted', 'status', 'errorMessage']
};

// ═══════════════════════════════════════════════════════════════
//  SAFE EDITOR ENTRY POINTS (fixes "Cannot read properties of undefined")
// ═══════════════════════════════════════════════════════════════

function doGet(e) {
  e = e || {};
  e.parameter = (e.parameter) || {};
  var action = e.parameter.action || 'getAppData';

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'getAppData') {
      return createJsonResponse({
        status: 'success',
        data: {
          pyqs: getSheetData(sheet, 'PYQs'),
          capsules: getSheetData(sheet, 'Capsules'),
          formulas: getSheetData(sheet, 'Formulas'),
          pitfalls: getSheetData(sheet, 'Pitfalls'),
          mistakeVault: getSheetData(sheet, 'MistakeVault'),
          mockResults: getSheetData(sheet, 'MockResults'),
          ingestionLog: getSheetData(sheet, 'IngestionLog')
        }
      });
    }

    if (action === 'getIngestionLog') {
      return createJsonResponse({
        status: 'success',
        data: getSheetData(sheet, 'IngestionLog')
      });
    }

    if (action === 'testConnection') {
      return createJsonResponse({ status: 'success', message: 'VibePhysics backend is live.' });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action: ' + action });

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  e = e || {};
  var sheet = SpreadsheetApp.getActiveSpreadsheet();

  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    var action = data.action;

    if (action === 'logMistake') {
      var mistakeSheet = getOrCreateSheet(sheet, 'MistakeVault');
      mistakeSheet.appendRow([
        data.questionId || '', data.subjectId || '', data.questionText || '',
        data.userAnswer || '', data.correctAnswer || '',
        new Date().toISOString(), 'pending'
      ]);
      return createJsonResponse({ status: 'success', message: 'Mistake logged' });
    }

    if (action === 'saveMockResult') {
      var mockSheet = getOrCreateSheet(sheet, 'MockResults');
      mockSheet.appendRow([
        data.testId || '', data.scorePartA || 0, data.scorePartB || 0,
        data.scorePartC || 0, data.totalScore || 0, data.percentile || 0,
        new Date().toISOString()
      ]);
      return createJsonResponse({ status: 'success', message: 'Mock result saved' });
    }

    if (action === 'addPYQ') {
      var pyqSheet = getOrCreateSheet(sheet, 'PYQs');
      pyqSheet.appendRow([
        data.id || 'pyq-' + Date.now(), data.year || '', data.month || '',
        data.section || '', data.subjectId || '', data.subtopicId || '',
        data.topicName || '', data.question || '', JSON.stringify(data.options || []),
        data.correctOption, data.solutionStepByStep || '', data.shortcutHack || '',
        data.difficulty || '', JSON.stringify(data.tags || []),
        data.sourceFile || '', data.sourcePage || ''
      ]);
      return createJsonResponse({ status: 'success', message: 'PYQ added' });
    }

    if (action === 'addCapsule') {
      var capSheet = getOrCreateSheet(sheet, 'Capsules');
      capSheet.appendRow([
        data.id || 'cap-' + Date.now(), data.subjectId || '', data.subtopicId || '',
        data.title || '', data.readTime || '3 min', data.summary || '',
        JSON.stringify(data.keyTakeaways || []), JSON.stringify(data.derivationSteps || []),
        JSON.stringify(data.commonPitfalls || []), data.sourceFile || '', data.sourcePage || ''
      ]);
      return createJsonResponse({ status: 'success', message: 'Capsule added' });
    }

    if (action === 'addFormula') {
      var fSheet = getOrCreateSheet(sheet, 'Formulas');
      fSheet.appendRow([
        data.id || 'f-' + Date.now(), data.subjectId || '', data.subtopicId || '',
        data.title || '', data.latex || '', data.ladderOperators || '',
        data.degeneracy || '', data.invariant || '', data.intensity || '',
        data.entropy || '', data.limitingCases || '', data.dimensionsCheck || '',
        data.examTips || '', data.sourceFile || '', data.sourcePage || ''
      ]);
      return createJsonResponse({ status: 'success', message: 'Formula added' });
    }

    if (action === 'addPitfall') {
      var pSheet = getOrCreateSheet(sheet, 'Pitfalls');
      pSheet.appendRow([
        data.id || 'pit-' + Date.now(), data.subjectId || '', data.subtopicId || '',
        data.pitfall || '', data.explanation || '',
        data.sourceFile || '', data.sourcePage || ''
      ]);
      return createJsonResponse({ status: 'success', message: 'Pitfall added' });
    }

    // ═══════════════════════════════════════════════════════════════
    //  PDF INGESTION ENDPOINT
    // ═══════════════════════════════════════════════════════════════

    if (action === 'ingestPDF') {
      var result = processPDFIngestion(sheet, data);
      return createJsonResponse(result);
    }

    return createJsonResponse({ status: 'error', message: 'Invalid action: ' + action });

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// ═══════════════════════════════════════════════════════════════
//  AUTOMATED PDF INGESTION PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Main PDF ingestion function.
 * Called via POST with:
 *   { action: 'ingestPDF', fileBlob: "<base64 PDF data>", fileName: "...",
 *     contentType: "application/pdf", subjectHint: "quantum_mech", pageStart: 0 }
 *
 * Also runnable from the editor for testing:
 *   testIngestion()
 */
function processPDFIngestion(sheet, data) {
  var apiKey = getGeminiKey();
  if (!apiKey) {
    return {
      status: 'error',
      message: 'No Gemini API key set. Run setGeminiKey("AIza...") first or set it via the GUI.'
    };
  }

  var fileName = data.fileName || 'unknown.pdf';
  var subjectHint = data.subjectHint || 'auto';
  var pageStart = parseInt(data.pageStart) || 0;

  // Decode the base64 PDF
  var base64Data;
  if (data.fileBlob) {
    base64Data = data.fileBlob;
  } else if (data.fileId) {
    // Fetch from Google Drive by file ID
    var file = DriveApp.getFileById(data.fileId);
    base64Data = Utilities.base64Encode(file.getBlob().getBytes());
    fileName = file.getName();
  } else {
    return { status: 'error', message: 'No PDF data provided. Send fileBlob (base64) or fileId.' };
  }

  var logSheet = getOrCreateSheet(sheet, 'IngestionLog');
  var logRow = ['Ingestion started', fileName, 0, 0, 0, 'processing', ''];

  // The Gemini API accepts PDF as inline_data with base64
  // We send the FULL PDF (Gemini 1.5 supports up to 2M tokens input)
  // For huge books, we chunk by extracting text first

  try {
    // Extract text from the PDF
    var pdfText = extractTextFromBase64PDF(base64Data);
    var totalPages = estimatePageCount(pdfText);

    logRow[2] = totalPages;
    appendLogRow(logSheet, logRow);

    var totalItems = 0;
    var pagesProcessed = 0;

    // Chunk the text into segments for Gemini processing
    var chunks = chunkText(pdfText, 30000); // ~30k chars per chunk (safe within token limits)

    for (var i = 0; i < chunks.length; i++) {
      var chunk = chunks[i];
      var chunkStartPage = pageStart + pagesProcessed;

      Logger.log('Processing chunk ' + (i + 1) + '/' + chunks.length + ' (' + chunk.length + ' chars)');

      // Determine what prompt to use based on content type
      var prompt = buildIngestionPrompt(chunk, subjectHint, chunkStartPage, i, chunks.length);

      var aiResponse = callGeminiTextAPI(apiKey, prompt);
      if (!aiResponse.success) {
        Logger.log('Gemini API error on chunk ' + (i + 1) + ': ' + aiResponse.error);
        continue;
      }

      var parsed = parseAIResponse(aiResponse.text);

      // Insert extracted items into sheets
      var itemsAdded = insertExtractedContent(sheet, parsed, fileName, chunkStartPage);
      totalItems += itemsAdded;
      pagesProcessed += Math.ceil(PDF_CHUNK_PAGES);
      logRow[3] = pagesProcessed;
      logRow[4] = totalItems;
      logRow[5] = 'processing';
      // Update last log row
      updateLastLogRow(logSheet, logRow);

      // Rate limit protection
      if (i < chunks.length - 1) {
        Utilities.sleep(INGESTION_BATCH_DELAY_MS);
      }
    }

    logRow[5] = 'completed';
    logRow[6] = '';
    updateLastLogRow(logSheet, logRow);

    return {
      status: 'success',
      fileName: fileName,
      totalPages: totalPages,
      pagesProcessed: pagesProcessed,
      itemsExtracted: totalItems,
      chunks: chunks.length
    };

  } catch (err) {
    logRow[5] = 'error';
    logRow[6] = err.toString();
    updateLastLogRow(logSheet, logRow);
    return { status: 'error', message: err.toString(), fileName: fileName };
  }
}

/**
 * Extract text from a base64-encoded PDF using Apps Script's built-in OCR
 * via Google Drive (upload → convert → read).
 */
function extractTextFromBase64PDF(base64Data) {
  // Strategy: Upload the PDF to Google Drive, convert to Google Doc (OCR happens automatically),
  // then read the text content.

  var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'application/pdf', 'temp_ingestion.pdf');

  // Upload to Drive with OCR conversion
  var file = Drive.Files.insert(
    { title: 'vibephysics_temp_pdf', mimeType: 'application/pdf' },
    blob,
    { ocr: true, ocrLanguage: 'en' }
  );

  // The OCR'd content is in the converted Google Doc
  var docId = file.id;
  var doc = DocumentApp.openById(docId);
  var text = doc.getBody().getText();

  // Clean up temp files
  try { Drive.Files.remove(docId); } catch (e) {}
  try {
    // Also remove the original PDF file that Drive.Files.insert creates
    var files = DriveApp.getFilesByName('vibephysics_temp_pdf');
    while (files.hasNext()) {
      var f = files.next();
      f.setTrashed(true);
    }
  } catch (e) {}

  return text;
}

/**
 * Estimate page count from text length (rough heuristic: ~3000 chars/page)
 */
function estimatePageCount(text) {
  return Math.max(1, Math.ceil(text.length / 3000));
}

/**
 * Split large text into manageable chunks for AI processing.
 */
function chunkText(text, maxChunkSize) {
  if (text.length <= maxChunkSize) return [text];

  var chunks = [];
  var paragraphs = text.split('\n');
  var currentChunk = '';

  for (var i = 0; i < paragraphs.length; i++) {
    var para = paragraphs[i];
    if ((currentChunk + para).length > maxChunkSize && currentChunk.length > 0) {
      // Try to break at a sentence boundary near the end
      var breakPoint = findSentenceBoundary(currentChunk, maxChunkSize * 0.9);
      chunks.push(currentChunk.substring(0, breakPoint));
      currentChunk = currentChunk.substring(breakPoint) + para;
    } else {
      currentChunk += para + '\n';
    }
  }

  if (currentChunk.length > 0) chunks.push(currentChunk);

  return chunks;
}

function findSentenceBoundary(text, targetPos) {
  // Look for ".", "?", "!" near targetPos
  for (var i = targetPos; i < Math.min(targetPos + 500, text.length); i++) {
    var ch = text[i];
    if (ch === '.' || ch === '?' || ch === '!') return i + 1;
  }
  return targetPos;
}

/**
 * Build a highly structured AI prompt that forces Gemini to return JSON
 * with content classified into PYQs, Capsules, Formulas, Pitfalls.
 */
function buildIngestionPrompt(text, subjectHint, startPage, chunkIndex, totalChunks) {
  var subjectContext = subjectHint === 'auto'
    ? 'Determine the physics subject automatically from the content. Use these IDs: math_phys, classical_mech, emt, quantum_mech, thermo_stat, electronics_exp, atomic_mol, condensed_matter, nuclear_particle.'
    : 'The subject is: ' + subjectHint + '. Use this subjectId for all extracted items.';

  return [
    'You are QuantumNET Content Extractor AI, an expert in CSIR NET Physical Sciences.',
    'You are processing chunk ' + (chunkIndex + 1) + ' of ' + totalChunks + ' from a physics textbook or PYQ compilation.',
    subjectContext,
    'The approximate starting page for this chunk is: ' + startPage,
    '',
    'From the following text, extract ALL physics learning content and return it as a SINGLE JSON object with this exact structure:',
    '',
    '{',
    '  "pyqs": [',
    '    {',
    '      "year": <number or null>,',
    '      "month": "June" or "Dec" or null,',
    '      "section": "Part A" or "Part B" or "Part C",',
    '      "subjectId": "<one of the IDs above>",',
    '      "subtopicId": "<specific subtopic slug>",',
    '      "topicName": "<short topic label>",',
    '      "question": "<question text, use LaTeX notation for math>",',
    '      "options": ["option A", "option B", "option C", "option D"],',
    '      "correctOption": <0-3 index>,',
    '      "solutionStepByStep": "<detailed multi-line solution with LaTeX>",',
    '      "shortcutHack": "<fast trick to solve in under 60 seconds>",',
    '      "difficulty": "Foundational" or "Standard CSIR" or "Extreme",',
    '      "tags": ["tag1", "tag2"]',
    '    }',
    '  ],',
    '  "capsules": [',
    '    {',
    '      "subjectId": "<ID>",',
    '      "subtopicId": "<subtopic slug>",',
    '      "title": "<concise capsule title>",',
    '      "readTime": "3 min",',
    '      "summary": "<3-sentence high-density summary with zero fluff>",',
    '      "keyTakeaways": ["takeaway with LaTeX", "takeaway with LaTeX"],',
    '      "derivationSteps": [',
    '        {"stepNumber": 1, "heading": "<step title>", "formula": "<LaTeX>", "explanation": "<text>", "tooltip": "<how we got here>"}',
    '      ],',
    '      "commonPitfalls": ["pitfall with warning", "pitfall with warning"]',
    '    }',
    '  ],',
    '  "formulas": [',
    '    {',
    '      "subjectId": "<ID>",',
    '      "subtopicId": "<subtopic slug>",',
    '      "title": "<formula name>",',
    '      "latex": "<LaTeX equation>",',
    '      "limitingCases": "<what happens in limiting cases>",',
    '      "dimensionsCheck": "<dimensional analysis>",',
    '      "examTips": "<CSIR NET specific tip>"',
    '    }',
    '  ],',
    '  "pitfalls": [',
    '    {',
    '      "subjectId": "<ID>",',
    '      "subtopicId": "<subtopic slug>",',
    '      "pitfall": "<the common mistake>",',
    '      "explanation": "<why it is wrong and correct approach>"',
    '    }',
    '  ]',
    '}',
    '',
    'CRITICAL RULES:',
    '1. Extract EVERY question, concept, formula, and pitfall from the text. Do NOT skip or summarize away details.',
    '2. Convert ALL mathematical expressions to proper LaTeX notation (use \\frac, \\int, \\sum, \\nabla, etc.).',
    '3. For PYQ questions: infer the section (Part A=aptitude, Part B=core physics, Part C=advanced), difficulty, and year from context.',
    '4. For concept capsules: capture full physics depth including derivations with individual steps.',
    '5. If a section of text is irrelevant (TOC, acknowledgments, etc.), skip it.',
    '6. Return ONLY the JSON object, no markdown fences, no commentary.',
    '7. If nothing extractable is found, return empty arrays.',
    '',
    'TEXT TO PROCESS:',
    '---',
    text
  ].join('\n');
}

/**
 * Call Gemini API with a text-only prompt (for parsed text processing)
 */
function callGeminiTextAPI(apiKey, promptText) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + apiKey;

  var payload = {
    contents: [{
      parts: [{ text: promptText }]
    }],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: GEMINI_MAX_TOKENS,
      responseMimeType: 'application/json'
    }
  };

  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    var body = response.getContentText();

    if (code !== 200) {
      return { success: false, error: 'HTTP ' + code + ': ' + body.substring(0, 500) };
    }

    var json = JSON.parse(body);

    if (json.candidates && json.candidates.length > 0) {
      var text = json.candidates[0].content.parts[0].text;
      return { success: true, text: text };
    }

    if (json.promptFeedback && json.promptFeedback.blockReason) {
      return { success: false, error: 'Blocked: ' + json.promptFeedback.blockReason };
    }

    return { success: false, error: 'No candidates in response' };

  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Call Gemini API with a PDF (inline base64) — for multimodal direct PDF processing
 * This is an alternative approach that sends the raw PDF to Gemini instead of OCR'd text.
 */
function callGeminiPDFAPI(apiKey, base64PdfData, promptText) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + apiKey;

  var payload = {
    contents: [{
      parts: [
        { inline_data: { mime_type: 'application/pdf', data: base64PdfData } },
        { text: promptText }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: GEMINI_MAX_TOKENS,
      responseMimeType: 'application/json'
    }
  };

  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var body = response.getContentText();
    if (response.getResponseCode() !== 200) {
      return { success: false, error: 'HTTP ' + response.getResponseCode() + ': ' + body.substring(0, 500) };
    }

    var json = JSON.parse(body);
    if (json.candidates && json.candidates.length > 0) {
      return { success: true, text: json.candidates[0].content.parts[0].text };
    }
    return { success: false, error: 'No candidates in response' };

  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Parse the AI response (handle potential markdown fences, clean up)
 */
function parseAIResponse(text) {
  if (!text) return { pyqs: [], capsules: [], formulas: [], pitfalls: [] };

  // Strip markdown code fences if present
  text = text.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }

  try {
    var parsed = JSON.parse(text);
    return {
      pyqs: parsed.pyqs || [],
      capsules: parsed.capsules || [],
      formulas: parsed.formulas || [],
      pitfalls: parsed.pitfalls || []
    };
  } catch (e) {
    // Sometimes Gemini returns JSON with trailing text — try to extract just the JSON object
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        var parsed2 = JSON.parse(jsonMatch[0]);
        return {
          pyqs: parsed2.pyqs || [],
          capsules: parsed2.capsules || [],
          formulas: parsed2.formulas || [],
          pitfalls: parsed2.pitfalls || []
        };
      } catch (e2) {
        Logger.log('Failed to parse AI response: ' + e2.toString());
      }
    }
    Logger.log('Raw AI response (unparseable): ' + text.substring(0, 1000));
    return { pyqs: [], capsules: [], formulas: [], pitfalls: [] };
  }
}

/**
 * Insert parsed content into appropriate sheets
 */
function insertExtractedContent(sheet, parsed, sourceFile, sourcePage) {
  var count = 0;

  // Insert PYQs
  var pyqSheet = getOrCreateSheet(sheet, 'PYQs');
  parsed.pyqs.forEach(function(p) {
    pyqSheet.appendRow([
      'pyq-' + Date.now() + '-' + count,
      p.year || '', p.month || '',
      p.section || '', p.subjectId || '', p.subtopicId || '',
      p.topicName || '', p.question || '', JSON.stringify(p.options || []),
      p.correctOption, p.solutionStepByStep || '', p.shortcutHack || '',
      p.difficulty || '', JSON.stringify(p.tags || []),
      sourceFile, sourcePage
    ]);
    count++;
  });

  // Insert Capsules
  var capSheet = getOrCreateSheet(sheet, 'Capsules');
  parsed.capsules.forEach(function(c) {
    capSheet.appendRow([
      'cap-' + Date.now() + '-' + count,
      c.subjectId || '', c.subtopicId || '',
      c.title || '', c.readTime || '3 min', c.summary || '',
      JSON.stringify(c.keyTakeaways || []),
      JSON.stringify(c.derivationSteps || []),
      JSON.stringify(c.commonPitfalls || []),
      sourceFile, sourcePage
    ]);
    count++;
  });

  // Insert Formulas
  var fSheet = getOrCreateSheet(sheet, 'Formulas');
  parsed.formulas.forEach(function(f) {
    fSheet.appendRow([
      'f-' + Date.now() + '-' + count,
      f.subjectId || '', f.subtopicId || '',
      f.title || '', f.latex || '',
      f.ladderOperators || '', f.degeneracy || '', f.invariant || '',
      f.intensity || '', f.entropy || '', f.limitingCases || '',
      f.dimensionsCheck || '', f.examTips || '',
      sourceFile, sourcePage
    ]);
    count++;
  });

  // Insert Pitfalls
  var pSheet = getOrCreateSheet(sheet, 'Pitfalls');
  parsed.pitfalls.forEach(function(p) {
    pSheet.appendRow([
      'pit-' + Date.now() + '-' + count,
      p.subjectId || '', p.subtopicId || '',
      p.pitfall || '', p.explanation || '',
      sourceFile, sourcePage
    ]);
    count++;
  });

  return count;
}

// ═══════════════════════════════════════════════════════════════
//  GEMINI KEY MANAGEMENT (stored in Script Properties)
// ═══════════════════════════════════════════════════════════════

function setGeminiKey(key) {
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key);
  SpreadsheetApp.getActiveSpreadsheet().getUi().alert('Gemini API key saved successfully!');
}

function getGeminiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';
}

// ═══════════════════════════════════════════════════════════════
//  ALTERNATIVE: UPLOAD PDF VIA GOOGLE DRIVE GUI (apps script sidebar)
// ═══════════════════════════════════════════════════════════════

/**
 * Ingest a PDF that's already uploaded to Google Drive.
 * Usage from editor:  ingestFromDrive("your_file_id_here", "quantum_mech")
 */
function ingestFromDrive(fileId, subjectHint) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var result = processPDFIngestion(sheet, {
    fileId: fileId,
    subjectHint: subjectHint || 'auto',
    pageStart: 0
  });
  SpreadsheetApp.getActiveSpreadsheet().getUi().alert(
    'Ingestion Result:\n' +
    'File: ' + result.fileName + '\n' +
    'Pages: ' + (result.totalPages || 0) + '\n' +
    'Items Extracted: ' + (result.itemsExtracted || 0) + '\n' +
    'Status: ' + result.status +
    (result.message ? '\n' + result.message : '')
  );
  return result;
}

/**
 * List recent PDF files in Google Drive for the picker GUI
 */
function listDrivePDFs() {
  var files = DriveApp.getFilesByType('application/pdf');
  var results = [];
  var count = 0;
  while (files.hasNext() && count < 50) {
    var f = files.next();
    results.push({
      id: f.getId(),
      name: f.getName(),
      size: f.getSize(),
      lastModified: f.getLastUpdated().toISOString()
    });
    count++;
  }
  return results;
}

/**
 * BATCH ingest multiple Drive PDFs.
 * Usage:  batchIngestFromDrive(["fileId1", "fileId2", "fileId3"], "quantum_mech")
 */
function batchIngestFromDrive(fileIds, subjectHint) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var results = [];
  for (var i = 0; i < fileIds.length; i++) {
    Logger.log('Batch ingestion: ' + (i + 1) + '/' + fileIds.length + ' - ' + fileIds[i]);
    var result = processPDFIngestion(sheet, {
      fileId: fileIds[i],
      subjectHint: subjectHint || 'auto',
      pageStart: 0
    });
    results.push(result);
    if (i < fileIds.length - 1) Utilities.sleep(2000); // Delay between files
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
//  TEST / DEBUGGING FUNCTIONS (run from editor, no HTTP needed)
// ═══════════════════════════════════════════════════════════════

function testDoGet() {
  var result = doGet({});
  Logger.log(JSON.parse(result.getContent()));
}

function testDoPost() {
  var mockEvent = {
    postData: { contents: JSON.stringify({ action: 'logMistake', questionId: 'test-001', subjectId: 'quantum_mech', questionText: 'Test question', userAnswer: 1, correctAnswer: 2 }) }
  };
  var result = doPost(mockEvent);
  Logger.log(JSON.parse(result.getContent()));
}

function testGeminiConnection() {
  var key = getGeminiKey();
  if (!key) { Logger.log('No key set. Run setGeminiKey() first.'); return; }
  var result = callGeminiTextAPI(key, 'Return JSON: {"status":"ok","message":"Gemini is working"}');
  Logger.log(result);
}

// ═══════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getSheetData(spreadsheet, sheetName) {
  var sh = spreadsheet.getSheetByName(sheetName);
  if (!sh) return [];
  var values = sh.getDataRange().getValues();
  if (values.length <= 1) return [];

  var headers = values[0];
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function getOrCreateSheet(spreadsheet, sheetName) {
  var sh = spreadsheet.getSheetByName(sheetName);
  if (!sh) {
    sh = spreadsheet.insertSheet(sheetName);
  }
  return sh;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function appendLogRow(logSheet, rowData) {
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(['timestamp', 'fileName', 'totalPages', 'pagesProcessed', 'itemsExtracted', 'status', 'errorMessage']);
  }
  logSheet.appendRow(rowData);
}

function updateLastLogRow(logSheet, rowData) {
  var lastRow = logSheet.getLastRow();
  if (lastRow >= 2) {
    logSheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
  }
}

// ═══════════════════════════════════════════════════════════════
//  ONE-CLICK SETUP (run from editor)
// ═══════════════════════════════════════════════════════════════

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SHEET_SCHEMAS).forEach(function(sheetName) {
    var sh = getOrCreateSheet(ss, sheetName);
    if (sh.getLastRow() === 0) {
      sh.appendRow(SHEET_SCHEMAS[sheetName]);
    }
    // Freeze header row
    sh.setFrozenRows(1);
  });

  // Remove the default "Sheet1" if it exists and is empty
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.getActiveSpreadsheet().getUi().alert(
    'VibePhysics / QuantumNET setup complete!\n\n' +
    'All sheets created with headers:\n' +
    Object.keys(SHEET_SCHEMAS).join(', ') + '\n\n' +
    'NEXT STEPS:\n' +
    '1. Run setGeminiKey("AIza...") to set your Gemini API key\n' +
    '2. Deploy > New Deployment > Web App\n' +
    '3. Execute as: Me, Access: Anyone\n' +
    '4. Copy the Web App URL into VibePhysics'
  );
}
