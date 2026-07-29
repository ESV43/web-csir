import { useState } from 'react';
import { Zap, Check, X, RotateCcw, Trophy } from 'lucide-react';
import { HACK_DRILLS } from '../data/hackDrillsData';
import KaTeXRenderer from '../components/KaTeXRenderer';
import confetti from 'canvas-confetti';

export default function HackDrills() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  const current = HACK_DRILLS[currentIdx];

  const handleSelect = (optionIdx) => {
    setSelected(optionIdx);
    setShowAnswer(true);
    if (optionIdx === current.correctOption) {
      setScore(s => s + 1);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ['#00F0FF', '#00FF88'] });
    }
  };

  const handleNext = () => {
    if (currentIdx < HACK_DRILLS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setCurrentIdx(0);
      setSelected(null);
      setShowAnswer(false);
      setScore(0);
    }
  };

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-[#00FF88]" />
        <h1 className="text-xl font-bold text-white">Dimensional & Limiting Case Hack Drills</h1>
        <span className="text-xs text-gray-500">- Eliminate options fast via tricks, not calculations</span>
      </div>

      {/* Score bar */}
      <div className="glass-panel rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-sm text-gray-300">Streak: {score} / {HACK_DRILLS.length}</span>
        </div>
        <span className="text-xs text-gray-500">Drill {currentIdx + 1} / {HACK_DRILLS.length}</span>
      </div>

      {/* Drill card */}
      <div className="glass-panel rounded-2xl p-6">
        <span className="inline-block px-2 py-0.5 rounded bg-[#00FF88]/15 text-[#00FF88] text-xs font-mono mb-3">
          {current.difficulty}
        </span>
        <h3 className="text-sm font-bold text-gray-200 mb-3">{current.title}</h3>

        <div className="bg-black/20 rounded-lg p-4 mb-4 text-sm text-gray-200">
          <KaTeXRenderer math={current.scenario} display />
        </div>

        <div className="space-y-2">
          {current.options.map((opt, i) => (
            <button key={i} onClick={() => !showAnswer && handleSelect(i)}
              disabled={showAnswer}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                showAnswer && i === current.correctOption
                  ? 'bg-green-500/10 border-green-400/40 text-green-300'
                  : selected === i && i !== current.correctOption
                  ? 'bg-red-500/10 border-red-400/40 text-red-300'
                  : 'bg-white/5 border-white/5 text-gray-300 hover:border-cyan-400/20'
              }`}>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white/10">{String.fromCharCode(65+i)}</span>
                <span className="flex-1"><KaTeXRenderer math={opt} /></span>
                {showAnswer && i === current.correctOption && <Check className="w-4 h-4 text-green-400" />}
                {showAnswer && selected === i && i !== current.correctOption && <X className="w-4 h-4 text-red-400" />}
              </div>
            </button>
          ))}
        </div>

        {showAnswer && (
          <div className="mt-4 p-4 bg-[#00FF88]/5 border border-[#00FF88]/15 rounded-xl">
            <p className="text-xs font-semibold text-[#00FF88] mb-2 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Hack Explanation:</p>
            <div className="text-sm text-gray-300"><KaTeXRenderer math={current.hackExplanation} /></div>
          </div>
        )}

        {showAnswer && (
          <button onClick={handleNext} className="mt-4 w-full py-2.5 rounded-xl bg-cyan-500/10 text-[#00F0FF] text-sm font-semibold hover:bg-cyan-500/20 transition flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Next Drill
          </button>
        )}
      </div>
    </div>
  );
}
