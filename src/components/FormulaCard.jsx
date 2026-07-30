import { useState } from 'react';
import { Zap, Info, Check } from 'lucide-react';
import RichText from './RichText';
import { VARIABLE_DICTIONARY } from '../data/formulaVault';

export default function FormulaCard({ formula }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedVar, setSelectedVar] = useState(null);

  function renderWithHighlights(latex) {
    return <RichText block>{latex}</RichText>;
  }

  function extractVariables(latex) {
    const vars = [];
    for (const key of Object.keys(VARIABLE_DICTIONARY)) {
      if (latex.includes(key)) vars.push(key);
    }
    return vars;
  }

  const vars = extractVariables(formula.latex);

  return (
    <div className="glass-panel rounded-xl p-4 hover:border-cyan-400/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#00FF88]" />
          <h4 className="text-sm font-semibold text-gray-200">{formula.title}</h4>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-500 hover:text-cyan-300 transition"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-black/30 rounded-lg p-3 my-2">
        {renderWithHighlights(formula.latex)}
      </div>

      {/* Variable chips */}
      {vars.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {vars.map(v => (
            <button
              key={v}
              onClick={() => setSelectedVar(selectedVar === v ? null : v)}
              className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-cyan-300 hover:bg-cyan-500/10 transition"
            >
              {v.replace('\\','')}
            </button>
          ))}
        </div>
      )}

      {/* Variable detail */}
      {selectedVar && VARIABLE_DICTIONARY[selectedVar] && (
        <div className="mt-3 p-3 bg-cyan-500/5 border border-cyan-400/15 rounded-lg text-xs space-y-1">
          <p className="text-cyan-300 font-semibold">{VARIABLE_DICTIONARY[selectedVar].name}</p>
          <p className="text-gray-400"><span className="text-gray-500">Value:</span> {VARIABLE_DICTIONARY[selectedVar].value}</p>
          <p className="text-gray-400"><span className="text-gray-500">Dimensions:</span> <span className="font-mono text-green-400">{VARIABLE_DICTIONARY[selectedVar].dimensions}</span></p>
        </div>
      )}

      {/* Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
          {formula.degeneracy && (
            <p className="text-gray-400"><span className="text-violet-300 font-semibold">Degeneracy:</span> {formula.degeneracy}</p>
          )}
          {formula.ladderOperators && (
            <div className="text-gray-400">
              <span className="text-violet-300 font-semibold">Ladder Operators:</span>
              <div className="mt-1"><RichText>{formula.ladderOperators}</RichText></div>
            </div>
          )}
          {formula.invariant && (
            <p className="text-gray-400"><span className="text-violet-300 font-semibold">Invariant:</span> {formula.invariant}</p>
          )}
          {formula.intensity && (
            <p className="text-gray-400"><span className="text-violet-300 font-semibold">Intensity:</span> {formula.intensity}</p>
          )}
          {formula.entropy && (
            <p className="text-gray-400"><span className="text-violet-300 font-semibold">Entropy:</span> {formula.entropy}</p>
          )}
          {formula.limitingCases && (
            <p className="text-gray-400"><span className="text-amber-300 font-semibold">Limiting Cases:</span> {formula.limitingCases}</p>
          )}
          {formula.dimensionsCheck && (
            <p className="text-gray-400"><span className="text-green-300 font-semibold">Dim Check:</span> <span className="font-mono text-green-400">{formula.dimensionsCheck}</span></p>
          )}
          {formula.examTips && (
            <p className="text-gray-400"><span className="text-cyan-300 font-semibold">Exam Tip:</span> {formula.examTips}</p>
          )}
        </div>
      )}
    </div>
  );
}
