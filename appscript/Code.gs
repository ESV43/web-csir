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

var GEMINI_MODEL = 'gemini-1.5-flash';
var GEMINI_MAX_TOKENS = 8192;
var PDF_CHUNK_PAGES = 8;
var INGESTION_BATCH_DELAY_MS = 1500;

// YOUR 3 FILE IDs
var MY_FILE_IDS = [
  '1niyjrkzo4Sf3vCwIl1XoAZNONnuz3wYI',
  '1a3sTPXjkfvYxCRew9kN3_hN6PsSbFBGX',
  '1wCKaVVwK18H-5viPPtUzuw2YMKSz4WqQ'
];

var SHEET_SCHEMAS = {
  'PYQs':          ['id', 'year', 'month', 'section', 'subjectId', 'subtopicId', 'topicName', 'question', 'options', 'correctOption', 'solutionStepByStep', 'shortcutHack', 'difficulty', 'tags', 'sourceFile', 'sourcePage'],
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
//  PDF INGESTION PIPELINE
// ═══════════════════════════════════════════════════════════════

function processPDFIngestion(sheet, data) {
  var apiKey = getGeminiKey();
  if (!apiKey) return { status: 'error', message: 'No Gemini API key. Run setMyGeminiKey() first.' };

  var fileName = data.fileName || 'unknown.pdf';
  var subjectHint = data.subjectHint || 'auto';
  var pageStart = parseInt(data.pageStart) || 0;
  var base64Data = data.fileBlob || (data.fileId ? Utilities.base64Encode(DriveApp.getFileById(data.fileId).getBlob().getBytes()) : null);
  if (!base64Data) return { status: 'error', message: 'No PDF data (fileBlob or fileId required)' };
  if (data.fileId && !data.fileName) fileName = DriveApp.getFileById(data.fileId).getName();

  var logSheet = getOrCreateSheet(sheet, 'IngestionLog');
  var logRow = ['Ingestion started', fileName, 0, 0, 0, 'processing', ''];
  try {
    var pdfText = extractTextFromBase64PDF(base64Data);
    var totalPages = estimatePageCount(pdfText);
    logRow[2] = totalPages; appendLogRow(logSheet, logRow);

    var totalItems = 0, pagesProcessed = 0;
    var chunks = chunkText(pdfText, 30000);

    for (var i = 0; i < chunks.length; i++) {
      var prompt = buildIngestionPrompt(chunks[i], subjectHint, pageStart + pagesProcessed, i, chunks.length);
      var ai = callGeminiTextAPI(apiKey, prompt);
      if (!ai.success) { Logger.log('Gemini error chunk '+(i+1)+': '+ai.error); continue; }
      var parsed = parseAIResponse(ai.text);
      totalItems += insertExtractedContent(sheet, parsed, fileName, pageStart + pagesProcessed);
      pagesProcessed += Math.ceil(PDF_CHUNK_PAGES);
      logRow[3] = pagesProcessed; logRow[4] = totalItems; logRow[5] = 'processing';
      updateLastLogRow(logSheet, logRow);
      if (i < chunks.length - 1) Utilities.sleep(INGESTION_BATCH_DELAY_MS);
    }
    logRow[5] = 'completed'; logRow[6] = ''; updateLastLogRow(logSheet, logRow);
    return { status: 'success', fileName: fileName, totalPages: totalPages, pagesProcessed: pagesProcessed, itemsExtracted: totalItems, chunks: chunks.length };
  } catch (err) { logRow[5] = 'error'; logRow[6] = err.toString(); updateLastLogRow(logSheet, logRow); return { status: 'error', message: err.toString(), fileName: fileName }; }
}

function extractTextFromBase64PDF(base64Data) {
  // For base64 data (from web upload), create a temp file in Drive, convert to Google Doc for OCR
  var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'application/pdf', 'temp_ingestion.pdf');
  var pdfFile = DriveApp.createFile(blob);
  pdfFile.setTrashed(true); // cleanup after OCR
  
  // Convert PDF to Google Doc (this triggers OCR)
  var docFile = DriveApp.getFileById(pdfFile.getId());
  var doc = DocumentApp.openById(docFile.getId());
  var text = doc.getBody().getText();
  
  // Clean up
  try { docFile.setTrashed(true); } catch(e) {}
  return text;
}

function estimatePageCount(text) { return Math.max(1, Math.ceil(text.length / 3000)); }

function chunkText(text, maxSize) {
  if (text.length <= maxSize) return [text];
  var chunks = [], paras = text.split('\n'), cur = '';
  for (var i = 0; i < paras.length; i++) {
    if ((cur + paras[i]).length > maxSize && cur.length > 0) {
      var bp = findSentenceBoundary(cur, maxSize * 0.9);
      chunks.push(cur.substring(0, bp)); cur = cur.substring(bp) + paras[i];
    } else cur += paras[i] + '\n';
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

function findSentenceBoundary(text, pos) {
  for (var i = pos; i < Math.min(pos + 500, text.length); i++) if ('.?!'.indexOf(text[i]) >= 0) return i + 1;
  return pos;
}

function buildIngestionPrompt(text, subjectHint, startPage, idx, total) {
  var ctx = subjectHint === 'auto' ? 'Auto-detect subject. Use IDs: math_phys, classical_mech, emt, quantum_mech, thermo_stat, electronics_exp, atomic_mol, condensed_matter, nuclear_particle.' : 'Subject: ' + subjectHint;
  return [
    'You are QuantumNET Content Extractor AI for CSIR NET Physical Sciences.',
    'Processing chunk ' + (idx + 1) + '/' + total + ' (page ~' + startPage + ').',
    ctx, '', 'Extract ALL physics content as JSON:',
    '{ "pyqs": [{ "year": <num|null>, "month": "June"|"Dec"|null, "section": "Part A"|"Part B"|"Part C", "subjectId": "<ID>", "subtopicId": "<slug>", "topicName": "<label>", "question": "<LaTeX>", "options": ["A","B","C","D"], "correctOption": <0-3>, "solutionStepByStep": "<detailed LaTeX>", "shortcutHack": "<60s trick>", "difficulty": "Foundational"|"Standard CSIR"|"Extreme", "tags": [] }],',
    '  "capsules": [{ "subjectId": "<ID>", "subtopicId": "<slug>", "title": "<title>", "readTime": "3 min", "summary": "<dense>", "keyTakeaways": ["<LaTeX>"], "derivationSteps": [{ "stepNumber": 1, "heading": "", "formula": "<LaTeX>", "explanation": "", "tooltip": "" }], "commonPitfalls": ["<warning>"] }],',
    '  "chapters": [{ "subjectId": "<ID>", "subtopicId": "<slug>", "title": "<title>", "readTime": "15 min", "sections": [{ "heading": "", "content": "<full with $...$ LaTeX>" }], "keyFormulas": ["$...$"] }],',
    '  "formulas": [{ "subjectId": "<ID>", "subtopicId": "<slug>", "title": "<name>", "latex": "<LaTeX>", "limitingCases": "", "dimensionsCheck": "", "examTips": "" }],',
    '  "pitfalls": [{ "subjectId": "<ID>", "subtopicId": "<slug>", "pitfall": "<mistake>", "explanation": "<why wrong>" }] }',
    '', 'CRITICAL: 1) Extract ALL. 2) ALL math in $...$ / $$...$$. 3) PYQ = 4 options → extract fully with correctOption (0-3). 4) Shortcut hack for 60s solve. 5) Full derivations. 6) Skip TOC/index. 7) Pure JSON only. 8) subtopicId = slug.',
    'TEXT:', '---', text
  ].join('\n');
}

function callGeminiTextAPI(apiKey, prompt) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + apiKey;
  var payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, topK: 32, topP: 0.95, maxOutputTokens: GEMINI_MAX_TOKENS, responseMimeType: 'application/json' } };
  try {
    var r = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return { success: false, error: 'HTTP ' + r.getResponseCode() + ': ' + r.getContentText().substring(0, 500) };
    var j = JSON.parse(r.getContentText());
    if (j.candidates && j.candidates.length) return { success: true, text: j.candidates[0].content.parts[0].text };
    if (j.promptFeedback?.blockReason) return { success: false, error: 'Blocked: ' + j.promptFeedback.blockReason };
    return { success: false, error: 'No candidates' };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function parseAIResponse(text) {
  if (!text) return { pyqs: [], capsules: [], formulas: [], pitfalls: [], chapters: [] };
  text = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    var p = JSON.parse(text);
    return { pyqs: p.pyqs||[], capsules: p.capsules||[], formulas: p.formulas||[], pitfalls: p.pitfalls||[], chapters: p.chapters||[] };
  } catch (e) {
    var m = text.match(/\{[\s\S]*\}/);
    if (m) try { var p2 = JSON.parse(m[0]); return { pyqs: p2.pyqs||[], capsules: p2.capsules||[], formulas: p2.formulas||[], pitfalls: p2.pitfalls||[], chapters: p2.chapters||[] }; } catch(e2) {}
    return { pyqs: [], capsules: [], formulas: [], pitfalls: [], chapters: [] };
  }
}

function insertExtractedContent(sheet, parsed, sourceFile, sourcePage) {
  var count = 0;
  var pyqS = getOrCreateSheet(sheet, 'PYQs');
  parsed.pyqs.forEach(function(p){ pyqS.appendRow(['pyq-'+Date.now()+'-'+count, p.year||'', p.month||'', p.section||'', p.subjectId||'', p.subtopicId||'', p.topicName||'', p.question||'', JSON.stringify(p.options||[]), p.correctOption, p.solutionStepByStep||'', p.shortcutHack||'', p.difficulty||'', JSON.stringify(p.tags||[]), sourceFile, sourcePage]); count++; });
  var capS = getOrCreateSheet(sheet, 'Capsules');
  parsed.capsules.forEach(function(c){ capS.appendRow(['cap-'+Date.now()+'-'+count, c.subjectId||'', c.subtopicId||'', c.title||'', c.readTime||'3 min', c.summary||'', JSON.stringify(c.keyTakeaways||[]), JSON.stringify(c.derivationSteps||[]), JSON.stringify(c.commonPitfalls||[]), sourceFile, sourcePage]); count++; });
  var chS = getOrCreateSheet(sheet, 'Chapters');
  (parsed.chapters||[]).forEach(function(ch){ chS.appendRow(['ch-'+Date.now()+'-'+count, ch.subjectId||'', ch.subtopicId||'', ch.title||'', ch.readTime||'15 min', JSON.stringify(ch.sections||[]), JSON.stringify(ch.keyFormulas||[]), sourceFile, sourcePage]); count++; });
  var fS = getOrCreateSheet(sheet, 'Formulas');
  parsed.formulas.forEach(function(f){ fS.appendRow(['f-'+Date.now()+'-'+count, f.subjectId||'', f.subtopicId||'', f.title||'', f.latex||'', f.ladderOperators||'', f.degeneracy||'', f.invariant||'', f.intensity||'', f.entropy||'', f.limitingCases||'', f.dimensionsCheck||'', f.examTips||'', sourceFile, sourcePage]); count++; });
  var pS = getOrCreateSheet(sheet, 'Pitfalls');
  parsed.pitfalls.forEach(function(p){ pS.appendRow(['pit-'+Date.now()+'-'+count, p.subjectId||'', p.subtopicId||'', p.pitfall||'', p.explanation||'', sourceFile, sourcePage]); count++; });
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
  setGeminiKey("AQ.Ab8RN6KyWlI_gvbHELUX7EOCBmLG2_rtXeJXo17HSKI0dyobWQ");
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