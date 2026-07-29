import { useState } from 'react';
import { X, Database, Check, AlertCircle, UploadCloud, ArrowRight } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheetsService';

export default function GoogleSheetsSyncModal({ onClose, openIngestionModal }) {
  const [scriptUrl, setScriptUrl] = useState(googleSheetsService.getScriptUrl());
  const [geminiKey, setGeminiKey] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSaveUrl = () => {
    googleSheetsService.setScriptUrl(scriptUrl);
    setStatus('saved-url');
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleSaveKey = () => {
    googleSheetsService.setApiKey(geminiKey);
    setStatus('saved-key');
    setTimeout(() => setStatus('idle'), 2000);
  };

  const instructions = [
    '1. Open Google Sheets and create a new spreadsheet',
    '2. Extensions > Apps Script',
    '3. Paste the Code.gs content from /appscript/Code.gs',
    '4. Run the setupSheets() function once to create all data sheets',
    '5. Deploy > New Deployment > Web App',
    '6. Execute as "Me", Access: "Anyone"',
    '7. Copy the Web App URL and paste it below'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="glass-panel rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#00FF88]" />
            <h2 className="text-xl font-bold text-white">Backend Sync & Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Google Apps Script URL */}
          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">Google Apps Script Web App URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-gray-900/60 rounded-lg px-3 py-2 text-sm text-gray-200 border border-white/10 focus:border-cyan-400/50 focus:outline-none"
              />
              <button
                onClick={handleSaveUrl}
                className="px-4 py-2 rounded-lg bg-[#00FF88]/15 text-[#00FF88] text-sm font-semibold hover:bg-[#00FF88]/25 transition"
              >
                {status === 'saved-url' ? <Check className="w-4 h-4" /> : 'Save'}
              </button>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-gray-900/40 rounded-xl p-4 border border-white/5">
            <h3 className="text-sm font-semibold text-[#00F0FF] mb-3">Setup Instructions</h3>
            <ol className="space-y-1.5">
              {instructions.map((step, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                  <span className="text-[#00F0FF] shrink-0">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Gemini AI Key */}
          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">Google Gemini AI API Key (Optional)</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="flex-1 bg-gray-900/60 rounded-lg px-3 py-2 text-sm text-gray-200 border border-white/10 focus:border-violet-400/50 focus:outline-none"
              />
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-lg bg-[#8A2BE2]/15 text-[#8A2BE2] text-sm font-semibold hover:bg-[#8A2BE2]/25 transition"
              >
                {status === 'saved-key' ? <Check className="w-4 h-4" /> : 'Save'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              App works fully offline without keys. AI features use built-in high-quality simulated responses when no key is provided. Get a free key at Google AI Studio.
            </p>
          </div>

          {/* PDF Ingestion Launcher */}
          {openIngestionModal && (
            <button
              onClick={openIngestionModal}
              className="w-full p-4 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 text-left hover:bg-[#00FF88]/15 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#00FF88]" />
                  <div>
                    <p className="text-sm font-semibold text-[#00FF88]">Upload Textbook PDFs for AI Ingestion</p>
                    <p className="text-xs text-gray-500">Drop Griffiths, Goldstein, Zettili, Pathria, PYQ PDFs - Gemini AI auto-extracts all content</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#00FF88] group-hover:translate-x-1 transition" />
              </div>
            </button>
          )}

          {/* Info banner */}
          <div className="bg-cyan-500/5 border border-cyan-400/20 rounded-xl p-4 flex items-start gap-3">
            <Database className="w-5 h-5 text-[#00F0FF] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400">
              <p className="font-semibold text-gray-300 mb-1">Completely Free & Open Source</p>
              All data is stored locally via IndexedDB / LocalStorage. Google Sheets sync is optional for backing up your progress across devices. Upload your textbook & PYQ PDFs to Google Sheets to expand the content library.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
