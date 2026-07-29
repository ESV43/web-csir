import { useState } from 'react';
import { X, Delete } from 'lucide-react';

export default function ScientificCalculator({ onClose }) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [isScientific, setIsScientific] = useState(false);

  function appendInput(val) {
    setDisplay(prev => (prev === '0' && val !== '.') ? val : prev + val);
  }

  function handleClear() {
    setDisplay('0');
  }

  function handleDelete() {
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  }

  function handleEval() {
    try {
      let expr = display
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/pi/g, 'Math.PI')
        .replace(/e(?![0-9])/g, 'Math.E')
        .replace(/(\d+)!/g, (_, n) => {
          let f = 1;
          for (let i = 2; i <= parseInt(n); i++) f *= i;
          return f;
        });
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      setDisplay(String(result));
    } catch (e) {
      setDisplay('Error');
    }
  }

  const basicKeys = [
    ['7','8','9','/'],
    ['4','5','6','*'],
    ['1','2','3','-'],
    ['0','.','=','+'],
  ];

  const sciKeys = [
    ['sin(','cos(','tan(','pi','^'],
    ['log(','ln(','sqrt(','e','!'],
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-panel rounded-2xl p-5 w-80" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#00F0FF]">Scientific Calculator</span>
          <button onClick={() => setIsScientific(!isScientific)} className="text-xs text-gray-400 hover:text-[#00F0FF] px-2 py-0.5 rounded border border-white/10">
            {isScientific ? 'Basic' : 'Scientific'}
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="bg-black/50 rounded-lg px-3 py-4 mb-3 text-right overflow-x-auto">
          <span className="text-2xl text-white font-mono">{display}</span>
        </div>

        {isScientific && (
          <div className="grid grid-cols-5 gap-1.5 mb-1.5">
            {sciKeys.flat().map(k => (
              <button key={k} onClick={() => appendInput(k)}
                className="bg-white/5 hover:bg-cyan-500/10 text-cyan-300 text-sm rounded-lg py-2 transition">
                {k}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-4 gap-1.5">
          <button onClick={handleClear} className="bg-red-500/10 text-red-400 text-sm rounded-lg py-2 hover:bg-red-500/20 transition">C</button>
          <button onClick={handleDelete} className="bg-white/5 text-gray-300 text-sm rounded-lg py-2 hover:bg-white/10 transition"><Delete className="w-3.5 h-3.5 inline" /></button>
          <button onClick={() => appendInput('(')} className="bg-white/5 text-gray-300 text-sm rounded-lg py-2 hover:bg-white/10">(</button>
          <button onClick={() => appendInput(')')} className="bg-white/5 text-gray-300 text-sm rounded-lg py-2 hover:bg-white/10">)</button>

          {basicKeys.flat().map(k => (
            <button key={k}
              onClick={k === '=' ? handleEval : () => appendInput(k)}
              className={`text-sm rounded-lg py-2 transition ${
                k === '='
                  ? 'bg-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/30'
                  : 'bg-white/5 text-gray-200 hover:bg-white/10'
              }`}>
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
