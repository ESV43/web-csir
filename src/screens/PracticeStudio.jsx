import { useState, useMemo } from 'react';
import { Filter, Check, X, Eye, Zap, Bot, Target, ChevronDown } from 'lucide-react';
import { PYQ_DATABASE } from '../data/pyqDatabase';
import { CSIR_SUBJECTS } from '../data/csirSyllabus';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import KaTeXRenderer from '../components/KaTeXRenderer';

export default function PracticeStudio() {
  const [filters, setFilters] = useState({ year: 'all', section: 'all', subjectId: 'all', difficulty: 'all' });
  const [selectedQ, setSelectedQ] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showShortcut, setShowShortcut] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const filteredQs = useMemo(() => {
    return PYQ_DATABASE.filter(q => {
      if (filters.year !== 'all' && String(q.year) !== filters.year) return false;
      if (filters.section !== 'all' && q.section !== filters.section) return false;
      if (filters.subjectId !== 'all' && q.subjectId !== filters.subjectId) return false;
      if (filters.difficulty !== 'all' && q.difficulty !== filters.difficulty) return false;
      return true;
    });
  }, [filters]);

  function handleSubmit(qId, optionIdx, subtopicId) {
    setSelectedOption(optionIdx);
    if (optionIdx !== selectedQ.correctOption) {
      storageService.addMistake({
        id: qId,
        subjectId: selectedQ.subjectId,
        subtopicId,
        question: selectedQ.question,
        userAnswer: optionIdx,
        correctAnswer: selectedQ.correctOption
      });
    }
    storageService.recordPyqSolved(qId, subtopicId);
  }

  async function handleExplainStep() {
    setAiLoading(true);
    const steps = selectedQ.solutionStepByStep.split('\n');
    const lastStep = steps[steps.length - 1];
    const result = await aiService.explainStep(selectedQ.question, selectedQ.solutionStepByStep, lastStep);
    setAiExplanation(result);
    setAiLoading(false);
  }

  const years = [...new Set(PYQ_DATABASE.map(q => q.year))].sort((a,b) => b - a);

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-[#00F0FF]" />
        <h1 className="text-xl font-bold text-white">PYQ & Practice Studio</h1>
        <span className="text-xs text-gray-500">- {filteredQs.length} questions available</span>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-300">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})}
            className="bg-gray-900/60 rounded-lg px-3 py-2 text-xs text-gray-200 border border-white/10 focus:border-cyan-400/50 outline-none">
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          <select value={filters.section} onChange={e => setFilters({...filters, section: e.target.value})}
            className="bg-gray-900/60 rounded-lg px-3 py-2 text-xs text-gray-200 border border-white/10 focus:border-cyan-400/50 outline-none">
            <option value="all">All Sections</option>
            <option value="Part A">Part A (Aptitude)</option>
            <option value="Part B">Part B (Core)</option>
            <option value="Part C">Part C (Advanced)</option>
          </select>
          <select value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value})}
            className="bg-gray-900/60 rounded-lg px-3 py-2 text-xs text-gray-200 border border-white/10 focus:border-cyan-400/50 outline-none">
            <option value="all">All Subjects</option>
            {CSIR_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})}
            className="bg-gray-900/60 rounded-lg px-3 py-2 text-xs text-gray-200 border border-white/10 focus:border-cyan-400/50 outline-none">
            <option value="all">All Difficulty</option>
            <option value="Foundational">Foundational</option>
            <option value="Standard CSIR">Standard CSIR</option>
            <option value="Extreme">Extreme</option>
          </select>
        </div>
      </div>

      {!selectedQ ? (
        /* Question List */
        <div className="space-y-2">
          {filteredQs.map(q => {
            const subjectInfo = CSIR_SUBJECTS.find(s => s.id === q.subjectId);
            return (
              <button key={q.id} onClick={() => { setSelectedQ(q); setSelectedOption(null); setShowSolution(false); setShowShortcut(false); setAiExplanation(null); }}
                className="glass-panel rounded-xl p-4 text-left w-full hover:border-cyan-400/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${subjectInfo?.color}15`, color: subjectInfo?.color }}>{q.section}</span>
                    <span className="text-xs text-gray-500">{q.month} {q.year}</span>
                    <span className="text-xs text-gray-600">- {q.difficulty}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-300"><KaTeXRenderer math={q.question} /></div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Question Detail */
        <div className="space-y-4">
          <button onClick={() => setSelectedQ(null)} className="text-xs text-gray-400 hover:text-cyan-300 transition">← Back to list</button>

          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/15 text-[#00F0FF]">{selectedQ.section}</span>
                <span className="text-xs text-gray-500">{selectedQ.month} {selectedQ.year} - {selectedQ.difficulty}</span>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4 mb-4 text-sm text-gray-200">
              <KaTeXRenderer math={selectedQ.question} display />
            </div>

            <div className="space-y-2">
              {selectedQ.options.map((opt, i) => (
                <button key={i}
                  onClick={() => setSelectedOption(i)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                    selectedOption === i && i === selectedQ.correctOption
                      ? 'bg-green-500/10 border-green-400/40 text-green-300'
                      : selectedOption === i && i !== selectedQ.correctOption
                      ? 'bg-red-500/10 border-red-400/40 text-red-300'
                      : selectedOption !== null && i === selectedQ.correctOption
                      ? 'bg-green-500/10 border-green-400/40 text-green-300'
                      : 'bg-white/5 border-white/5 text-gray-300 hover:border-cyan-400/20'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white/10">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1"><KaTeXRenderer math={opt} /></span>
                    {selectedOption !== null && i === selectedQ.correctOption && <Check className="w-4 h-4 text-green-400" />}
                    {selectedOption === i && i !== selectedQ.correctOption && <X className="w-4 h-4 text-red-400" />}
                  </div>
                </button>
              ))}
            </div>

            {selectedOption !== null && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setShowSolution(!showSolution)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-[#00F0FF] text-xs hover:bg-cyan-500/20 transition">
                  <Eye className="w-3.5 h-3.5" /> {showSolution ? 'Hide' : 'Show'} Solution
                </button>
                <button onClick={() => setShowShortcut(!showShortcut)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs hover:bg-amber-500/20 transition">
                  <Zap className="w-3.5 h-3.5" /> Shortcut Trick
                </button>
                <button onClick={handleExplainStep} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-[#8A2BE2] text-xs hover:bg-violet-500/20 transition">
                  <Bot className="w-3.5 h-3.5" /> {aiLoading ? 'Explaining...' : 'Explain This Step'}
                </button>
              </div>
            )}

            {/* Solution View */}
            {showSolution && (
              <div className="mt-4 p-4 bg-black/20 rounded-xl">
                <p className="text-xs font-semibold text-[#00F0FF] mb-2">Step-by-Step Solution:</p>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans"><KaTeXRenderer math={selectedQ.solutionStepByStep} /></pre>
              </div>
            )}

            {/* Shortcut */}
            {showShortcut && (
              <div className="mt-4 p-4 bg-amber-500/5 border border-amber-400/15 rounded-xl">
                <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Shortcut Solution:</p>
                <div className="text-sm text-gray-300"><KaTeXRenderer math={selectedQ.shortcutHack} /></div>
              </div>
            )}

            {/* AI Explanation */}
            {aiExplanation && (
              <div className="mt-4 p-4 bg-violet-500/5 border border-violet-400/15 rounded-xl">
                <p className="text-xs font-semibold text-[#8A2BE2] mb-2 flex items-center gap-1"><Bot className="w-3.5 h-3.5" /> AI Vibe Tutor Explanation:</p>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{aiExplanation}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
