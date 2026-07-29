import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { CSIR_SUBJECTS } from '../data/csirSyllabus';
import KaTeXRenderer from '../components/KaTeXRenderer';
import confetti from 'canvas-confetti';

export default function MistakeVault({ navigate }) {
  const [mistakes, setMistakes] = useState([]);
  const [filter, setFilter] = useState('due'); // all, due, resolved

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    const all = storageService.getMistakes();
    const now = Date.now();
    const enriched = all.map(m => ({ ...m, isDue: new Date(m.nextReviewDate).getTime() <= now }));
    setMistakes(enriched);
  }

  function resolveMistake(id) {
    storageService.markMistakeResolved(id);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#00F0FF', '#8A2BE2', '#00FF88'] });
    refresh();
  }

  function deleteMistake(id) {
    const all = storageService.getMistakes();
    const filtered = all.filter(m => m.id !== id);
    storageService.saveLocalMistakes(filtered);
    refresh();
  }

  const filtered = mistakes.filter(m => {
    if (filter === 'due') return m.isDue;
    if (filter === 'all') return true;
    return false;
  });

  const dueCount = mistakes.filter(m => m.isDue).length;

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <h1 className="text-xl font-bold text-white">Mistake Vault</h1>
        <span className="text-xs text-gray-500">&mdash; Spaced Repetition (3-day cycle)</span>
        {dueCount > 0 && <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-xs font-bold animate-pulse">{dueCount} due</span>}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['due', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-gray-400'}`}>
            {f === 'due' ? `Due for Review (${dueCount})` : `All Mistakes (${mistakes.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          {mistakes.length === 0 ? (
            <>
              <CheckCircle className="w-12 h-12 text-[#00FF88] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-1">No Mistakes Logged Yet!</h3>
              <p className="text-sm text-gray-600 mb-6">Your error journal is empty. Practice more questions to populate it!</p>
              <button onClick={() => navigate('practice')} className="px-4 py-2 rounded-lg bg-cyan-500/10 text-[#00F0FF] text-sm hover:bg-cyan-500/20 transition">
                Go to Practice Studio
              </button>
            </>
          ) : (
            <>
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">No Mistakes Due for Review</h3>
              <p className="text-sm text-gray-600 mt-2">All your mistakes have been resolved! Next review cycle automatically schedules wrong answers after 3 days.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m, i) => {
            const subjectInfo = CSIR_SUBJECTS.find(s => s.id === m.subjectId);
            return (
              <div key={i} className="glass-panel rounded-xl p-4 border-l-2 border-amber-400/40">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${subjectInfo?.color || '#888'}15`, color: subjectInfo?.color || '#888' }}>
                    {subjectInfo?.name || 'Unknown'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => resolveMistake(m.id)} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition px-2 py-1 rounded bg-green-500/10">
                      <RefreshCw className="w-3 h-3" /> Resolved
                    </button>
                    <button onClick={() => deleteMistake(m.id)} className="text-xs text-red-400/60 hover:text-red-400 transition p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-300 mb-3"><KaTeXRenderer math={m.question} /></div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-red-500/5 border border-red-400/15 rounded-lg p-2">
                    <p className="text-[10px] text-red-400 mb-0.5">Your Answer:</p>
                    <p className="text-xs text-red-300">{m.correctAnswer !== undefined && m.userAnswer !== m.correctAnswer ? `Option ${String.fromCharCode(65 + m.userAnswer)}` : '-'}</p>
                  </div>
                  <div className="bg-green-500/5 border border-green-400/15 rounded-lg p-2">
                    <p className="text-[10px] text-green-400 mb-0.5">Correct Answer:</p>
                    <p className="text-xs text-green-300">{`Option ${String.fromCharCode(65 + m.correctAnswer)}`}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2">
                  <span>Review count: {m.reviewCount || 1}</span>
                  <span>Next review: {new Date(m.nextReviewDate).toLocaleDateString()}</span>
                </div>

                {m.isDue && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 text-xs text-amber-400">
                    <RefreshCw className="w-3 h-3" /> Due for review now - re-attempt to strengthen weak spot!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
