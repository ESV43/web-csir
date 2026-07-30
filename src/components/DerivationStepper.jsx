import { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, CheckCircle } from 'lucide-react';
import RichText from './RichText';

export default function DerivationStepper({ stepperData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const steps = stepperData.steps;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900/30 to-transparent px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-violet-300">Interactive Derivation</span>
          <span className="text-xs text-gray-500">- {stepperData.title}</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {steps.map((s, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= currentStep ? 'bg-violet-400' : 'bg-white/10'
            }`} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 text-xs font-mono">
            Step {steps[currentStep].stepNumber}
          </span>
          <h3 className="text-sm font-semibold text-gray-200">{steps[currentStep].heading}</h3>
        </div>

        <div className="my-4 py-3 bg-black/30 rounded-xl px-4">
          <RichText block>{steps[currentStep].formula}</RichText>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-3">{steps[currentStep].explanation}</p>

        {/* How we got here tooltip */}
        <div className="mb-2">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
          >
            <Info className="w-3.5 h-3.5" />
            {showTooltip ? 'Hide' : 'How we got here'}
          </button>
          {showTooltip && steps[currentStep].tooltip && (
            <div className="mt-2 p-3 bg-cyan-500/5 border border-cyan-400/15 rounded-lg text-xs text-gray-400">
              {steps[currentStep].tooltip}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
        <button
          onClick={() => { setCurrentStep(Math.max(0, currentStep - 1)); setShowTooltip(false); }}
          disabled={currentStep === 0}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <span className="text-xs text-gray-500 font-mono">
          {currentStep + 1} / {steps.length}
        </span>

        {currentStep === steps.length - 1 ? (
          <span className="flex items-center gap-1 text-sm text-[#00FF88]">
            <CheckCircle className="w-4 h-4" /> Done
          </span>
        ) : (
          <button
            onClick={() => { setCurrentStep(Math.min(steps.length - 1, currentStep + 1)); setShowTooltip(false); }}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
