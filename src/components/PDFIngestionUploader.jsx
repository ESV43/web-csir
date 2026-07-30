import { useState, useEffect, useCallback } from 'react';
import { X, UploadCloud, FileText, Loader, CheckCircle, AlertCircle, BookOpen, Zap, History, HardDrive } from 'lucide-react';
import { CSIR_SUBJECTS } from '../data/csirSyllabus';
import { ingestionService } from '../services/ingestionService';
import { googleSheetsService } from '../services/googleSheetsService';
import { aiService } from '../services/aiService';
import RichText from './RichText';

const SUBJECT_OPTIONS = [
  { id: 'auto', name: 'Auto-Detect Subject', icon: 'Sparkles' },
  ...CSIR_SUBJECTS.map(s => ({ id: s.id, name: s.name, icon: s.icon }))
];

export default function PDFIngestionUploader({ onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [subjectHint, setSubjectHint] = useState('auto');
  const [ingesting, setIngesting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [ingestionLog, setIngestionLog] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    setGeminiKey(aiService.getApiKey());
    if (googleSheetsService.getScriptUrl()) {
      ingestionService.fetchIngestionLog().then(log => setIngestionLog(log)).catch(() => {});
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const ingestAll = async () => {
    if (files.length === 0) return;
    const url = googleSheetsService.getScriptUrl();
    if (!url) {
      setError('No Google Apps Script URL found. Click the Database icon in the navbar to set it up first.');
      return;
    }

    setIngesting(true);
    setError(null);
    setResults([]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await ingestionService.ingestPDFFile(file, subjectHint, (p) => {
          setProgress({
            ...p,
            fileIndex: i,
            fileTotal: files.length,
            fileName: file.name
          });
        });
        setResults(prev => [...prev, { file: file.name, status: 'success', ...result }]);
      } catch (err) {
        setResults(prev => [...prev, { file: file.name, status: 'error', message: err.message }]);
      }
    }

    setIngesting(false);
    setProgress(null);
    setFiles([]);

    // Refresh ingestion log
    try {
      const log = await ingestionService.fetchIngestionLog();
      setIngestionLog(log);
    } catch {}
  };

  const total_extracted = results.reduce((sum, r) => sum + (r.itemsExtracted || 0), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-panel rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#00FF88]" />
            <h2 className="text-xl font-bold text-white">PDF Textbook Ingestion Engine</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-3">
          {[
            { id: 'upload', label: 'Upload & Ingest', icon: UploadCloud },
            { id: 'log', label: 'Ingestion History', icon: History },
            { id: 'help', label: 'How It Works', icon: BookOpen }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === t.id ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'text-gray-500 hover:text-gray-300'
                }`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-5">
            {/* Warning about key setup */}
            {!geminiKey && (
              <div className="bg-amber-500/5 border border-amber-400/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-300 font-semibold mb-1">Gemini API Key Required on Server Side</p>
                  <p className="text-gray-400 text-xs">
                    The Gemini key is needed in the Apps Script environment (not the browser) to process your PDFs.
                    Run <code className="text-amber-300 bg-black/30 px-1 rounded">setGeminiKey("AIza...")</code> in the Apps Script editor,
                    or set it in the Backend Settings modal below.
                  </p>
                </div>
              </div>
            )}

            {/* Subject selector */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">Subject Hint</label>
              <select value={subjectHint} onChange={e => setSubjectHint(e.target.value)}
                className="w-full bg-gray-900/60 rounded-lg px-3 py-2 text-sm text-gray-200 border border-white/10 focus:border-[#00FF88]/50 outline-none">
                {SUBJECT_OPTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Helps the AI categorize all content from the PDF into the correct CSIR NET subject.</p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragOver ? 'border-[#00FF88] bg-[#00FF88]/5' : 'border-white/15 hover:border-white/25'
              }`}
              onClick={() => document.getElementById('pdf-file-input').click()}
            >
              <input id="pdf-file-input" type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={handleFileSelect} />
              <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-[#00FF88]' : 'text-gray-500'}`} />
              <p className="text-sm text-gray-300 font-medium mb-1">
                {dragOver ? 'Drop PDFs here' : 'Drag & drop textbook PDFs or click to browse'}
              </p>
              <p className="text-xs text-gray-600">Supports multiple files - textbooks, PYQ compilations, formula books, etc.</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#00F0FF]" />
                      <span className="text-sm text-gray-300">{f.name}</span>
                      <span className="text-xs text-gray-600">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400 transition"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Progress */}
            {progress && (
              <div className="bg-cyan-500/5 border border-cyan-400/15 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {progress.stage === 'complete' ? <CheckCircle className="w-4 h-4 text-[#00FF88]" /> :
                   progress.stage === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                   <Loader className="w-4 h-4 text-[#00F0FF] animate-spin" />}
                  <span className="text-sm text-gray-300">{progress.message}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  File {progress.fileIndex + 1} of {progress.fileTotal}: {progress.fileName}
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00F0FF] to-[#00FF88] rounded-full transition-all duration-500"
                    style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-300">Ingestion Results</h3>
                {results.map((r, i) => (
                  <div key={i} className={`rounded-lg p-3 flex items-center justify-between ${
                    r.status === 'success' ? 'bg-green-500/5 border border-green-400/15' : 'bg-red-500/5 border border-red-400/15'
                  }`}>
                    <div className="flex items-center gap-2">
                      {r.status === 'success' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                      <div>
                        <p className="text-sm text-gray-300">{r.file}</p>
                        {r.status === 'success' ? (
                          <p className="text-xs text-gray-500">{r.itemsExtracted} items extracted | {r.totalPages} pages | {r.chunks} chunks</p>
                        ) : (
                          <p className="text-xs text-red-400">{r.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {total_extracted > 0 && (
                  <div className="text-center text-sm text-[#00FF88] font-semibold pt-2">
                    Total: {total_extracted} items added to your Knowledge Vault!
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/5 border border-red-400/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={ingestAll}
              disabled={ingesting || files.length === 0}
              className="w-full py-3 rounded-xl bg-[#00FF88]/15 text-[#00FF88] font-semibold text-sm hover:bg-[#00FF88]/25 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {ingesting ? (
                <><Loader className="w-4 h-4 animate-spin" /> Processing with AI...</>
              ) : (
                <><Zap className="w-4 h-4" /> Ingest {files.length} PDF{files.length !== 1 ? 's' : ''} with AI</>
              )}
            </button>
          </div>
        )}

        {/* Log Tab */}
        {activeTab === 'log' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Ingestion History</h3>
            {ingestionLog.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-600">
                <History className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                No ingestion history yet. Upload a PDF to get started.
              </div>
            ) : (
              ingestionLog.slice().reverse().map((entry, i) => (
                <div key={i} className="glass-panel rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{entry.fileName || 'Unknown'}</p>
                    <p className="text-xs text-gray-600">
                      {entry.totalPages || 0} pages | {entry.itemsExtracted || 0} items
                    </p>
                  </div>
                  <div className={`text-xs font-mono px-2 py-1 rounded ${
                    entry.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    entry.status === 'error' ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {entry.status}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Help Tab */}
        {activeTab === 'help' && (
          <div className="space-y-4 text-sm text-gray-400">
            <div className="bg-cyan-500/5 border border-cyan-400/15 rounded-xl p-4">
              <h3 className="text-[#00F0FF] font-semibold mb-2 flex items-center gap-1"><Zap className="w-4 h-4" /> How It Works</h3>
              <ol className="space-y-2 list-decimal list-inside text-xs">
                <li>You upload a textbook PDF (e.g., Griffiths Quantum Mechanics, 500+ pages)</li>
                <li>The PDF is sent to Google Apps Script → Google Drive OCR</li>
                <li>OCR'd text is chunked into manageable segments (~30K chars each)</li>
                <li>Each chunk is sent to <span className="text-[#00FF88]">Gemini 1.5 Flash AI</span> with a highly structured extraction prompt</li>
                <li>AI extracts <span className="text-cyan-300">PYQs</span> (with full solutions + shortcuts), <span className="text-violet-300">concept capsules</span> (with derivation steps), <span className="text-green-300">formula cards</span>, and <span className="text-amber-300">pitfall warnings</span></li>
                <li>All extracted content is auto-inserted into Google Sheets with proper LaTeX and subject classifications</li>
                <li>App auto-syncs the new data to your Knowledge Vault and Practice Studio</li>
              </ol>
            </div>

            <div className="bg-amber-500/5 border border-amber-400/15 rounded-xl p-4">
              <h3 className="text-amber-300 font-semibold mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Important Notes</h3>
              <ul className="space-y-1.5 text-xs">
                <li>- Processing a 500-page book takes ~5-15 minutes (Gemini API rate limits apply)</li>
                <li>- Gemini's free tier allows 15 RPM / 1500 requests per day — enough for several textbooks</li>
                <li>- All math is converted to proper LaTeX for KaTeX rendering in the app</li>
                <li>- Content is never lost — it persists in Google Sheets and can be manually edited</li>
                <li>- You can re-run ingestion with different subject hints if auto-detection is wrong</li>
              </ul>
            </div>

            <div className="bg-violet-500/5 border border-violet-400/15 rounded-xl p-4">
              <h3 className="text-[#8A2BE2] font-semibold mb-2">Alternative: Ingest from Google Drive</h3>
              <p className="text-xs mb-2">
                If your PDFs are already on Google Drive, you can ingest them directly from the Apps Script editor without uploading again:
              </p>
              <pre className="text-xs bg-black/40 rounded-lg p-3 text-green-400 font-mono overflow-x-auto">
{`// In Apps Script editor:
ingestFromDrive("FILE_ID_HERE", "quantum_mech")

// Batch ingest multiple files:
batchIngestFromDrive(
  ["fileId1", "fileId2", "fileId3"],
  "auto"
)`}
              </pre>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-gray-300 font-semibold mb-2">Sample Extraction Output</h3>
              <p className="text-xs text-gray-500 mb-2">Here's what Gemini produces from a textbook page:</p>
              <div className="bg-black/30 rounded-lg p-3 text-xs">
                <p className="text-violet-300 font-mono mb-1">// Capsule: LC Circuit Impedance</p>
                <p className="text-gray-400 mb-2">Series LC circuit impedance formula with complex phasor analysis</p>
                <div className="bg-black/40 rounded p-2 mb-2">
                  <RichText block>{'Z = i\\omega L + \\frac{1}{i\\omega C} = i\\left(\\omega L - \\frac{1}{\\omega C}\\right)'}</RichText>
                </div>
                <p className="text-green-400 font-mono">// Formula: Resonance condition |  Condenser: |  4 pitfalls extracted</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
