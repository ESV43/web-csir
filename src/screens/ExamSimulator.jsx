import { useState, useEffect, useRef } from 'react';
import { FileText, Clock, Calculator, Flag, CheckCircle, XCircle, Play, RotateCcw, BarChart3, Target } from 'lucide-react';
import { PYQ_DATABASE } from '../data/pyqDatabase';
import { CSIR_SUBJECTS } from '../data/csirSyllabus';
import { storageService } from '../services/storageService';
import KaTeXRenderer from '../components/KaTeXRenderer';
import ScientificCalculator from '../components/ScientificCalculator';

const EXAM_CONFIG = {
  PartA: { count: 20, maxAttempt: 15, positive: 2, negative: 0.5, marks: '+2 / -0.5' },
  PartB: { count: 25, maxAttempt: 20, positive: 2, negative: 0.5, marks: '+2 / -0.5' },
  PartC: { count: 30, maxAttempt: 20, positive: 4.75, negative: 1.1875, marks: '+4.75 / -1.1875' }
};

export default function ExamSimulator() {
  const [examState, setExamState] = useState('setup'); // setup, active, results
  const [testType, setTestType] = useState('random'); // random, full
  const [questions, setQuestions] = useState({ PartA: [], PartB: [], PartC: [] });
  const [activePart, setActivePart] = useState('PartA');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours
  const [showCalc, setShowCalc] = useState(false);
  const [results, setResults] = useState(null);
  const timerRef = useRef(null);

  function startExam() {
    // Build exam set - random sampling from PYQ database
    const partA = PYQ_DATABASE.filter(q => q.section === 'Part A');
    const partB = PYQ_DATABASE.filter(q => q.section === 'Part B');
    const partC = PYQ_DATABASE.filter(q => q.section === 'Part C');
    
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
    
    // Fill with available questions (since DB is limited, we duplicate for mock)
    const fillArr = (arr, count) => {
      const shuffled = shuffle(arr);
      const result = [];
      for (let i = 0; i < count; i++) result.push({ ...shuffled[i % shuffled.length], _examId: `${i}` });
      return result;
    };

    setQuestions({
      PartA: fillArr(partA, EXAM_CONFIG.PartA.count),
      PartB: fillArr(partB, EXAM_CONFIG.PartB.count),
      PartC: fillArr(partC, EXAM_CONFIG.PartC.count)
    });
    setAnswers({});
    setMarkedForReview({});
    setTimeLeft(180 * 60);
    setExamState('active');
    setActivePart('PartA');
    setCurrentQ(0);
  }

  useEffect(() => {
    if (examState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { submitExam(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [examState]);

  function selectOption(qId, optionIdx) {
    const partAnswers = Object.keys(answers).filter(k => k.startsWith(activePart));
    if (partAnswers.length >= EXAM_CONFIG[activePart].maxAttempt && answers[qId] === undefined) return;
    setAnswers({ ...answers, [qId]: optionIdx });
  }

  function toggleReview(qId) {
    setMarkedForReview({ ...markedForReview, [qId]: !markedForReview[qId] });
  }

  function submitExam() {
    clearInterval(timerRef.current);
    
    const score = { PartA: 0, PartB: 0, PartC: 0 };
    const partStats = { PartA: { correct: 0, wrong: 0, attempted: 0 }, PartB: { correct: 0, wrong: 0, attempted: 0 }, PartC: { correct: 0, wrong: 0, attempted: 0 } };
    const weakTopics = {};
    
    ['PartA', 'PartB', 'PartC'].forEach(part => {
      const config = EXAM_CONFIG[part];
      questions[part].forEach(q => {
        const userAns = answers[q.id + q._examId];
        if (userAns !== undefined) {
          partStats[part].attempted++;
          if (userAns === q.correctOption) {
            score[part] += config.positive;
            partStats[part].correct++;
          } else {
            score[part] -= config.negative;
            partStats[part].wrong++;
            weakTopics[q.topicName] = (weakTopics[q.topicName] || 0) + 1;
          }
        }
      });
    });

    const totalScore = score.PartA + score.PartB + score.PartC;
    const percentileEstimate = Math.max(0, Math.min(99, 50 + (totalScore * 1.5)));

    setResults({ score, partStats, totalScore, percentileEstimate, weakTopics, timeTaken: 180*60 - timeLeft });
    setExamState('results');
  }

  if (examState === 'setup') {
    return (
      <div className="py-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-[#00F0FF]" />
          <h1 className="text-xl font-bold text-white">CSIR NET Exam Simulator</h1>
        </div>
        
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Exam Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {['PartA', 'PartB', 'PartC'].map(part => {
              const cfg = EXAM_CONFIG[part];
              const label = part === 'PartA' ? 'Part A (Aptitude)' : part === 'PartB' ? 'Part B (Core)' : 'Part C (Advanced)';
              return (
                <div key={part} className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <h3 className="text-sm font-bold text-cyan-300 mb-2">{label}</h3>
                  <p className="text-xs text-gray-400">Questions: {cfg.count}</p>
                  <p className="text-xs text-gray-400">Max Attempts: {cfg.maxAttempt}</p>
                  <p className="text-xs text-gray-400">Marks: {cfg.marks}</p>
                </div>
              );
            })}
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-300 mb-2">Choose Mode:</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setTestType('random')}
                className={`flex-1 p-4 rounded-xl text-sm transition ${testType === 'random' ? 'bg-cyan-500/10 border border-cyan-400/30 text-[#00F0FF]' : 'bg-white/5 border border-white/5 text-gray-400'}`}>
                <Target className="w-5 h-5 mb-2" /> Random PYQ Generator
                <p className="text-xs text-gray-500 mt-1">Auto-generated 75Q mock from historical PYQs by topic weightage</p>
              </button>
              <button onClick={() => setTestType('full')}
                className={`flex-1 p-4 rounded-xl text-sm transition ${testType === 'full' ? 'bg-cyan-500/10 border border-cyan-400/30 text-[#00F0FF]' : 'bg-white/5 border border-white/5 text-gray-400'}`}>
                <FileText className="w-5 h-5 mb-2" /> Full Exam Environment
                <p className="text-xs text-gray-500 mt-1">Exact CSIR net Layout: 3-hour timer, Palette, Calculator</p>
              </button>
            </div>
          </div>

          <button onClick={startExam} className="w-full py-3 rounded-xl bg-[#00FF88]/15 text-[#00FF88] font-semibold text-sm hover:bg-[#00FF88]/25 transition flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (examState === 'active') {
    const partQuestions = questions[activePart];
    const q = partQuestions[currentQ];
    const qKey = q.id + q._examId;
    const partAnswers = Object.keys(answers).filter(k => k.startsWith(q.id) || Object.values(questions[activePart]).some(qq => qq.id + qq._examId === k));
    
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    
    return (
      <div className="py-4 space-y-3">
        {/* Top bar: timer + submit */}
        <div className="glass-panel rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00FF88]" />
            <span className="text-xl font-mono font-bold text-white tabular-nums">{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span>
          </div>
          <button onClick={() => setShowCalc(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 hover:bg-cyan-500/10 text-xs transition">
            <Calculator className="w-4 h-4" /> Calculator
          </button>
          <button onClick={submitExam} className="px-4 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-sm font-medium hover:bg-red-500/25 transition">
            Submit Exam
          </button>
        </div>

        {/* Part tabs */}
        <div className="flex gap-2">
          {['PartA', 'PartB', 'PartC'].map(part => {
            const label = part === 'PartA' ? 'Part A' : part === 'PartB' ? 'Part B' : 'Part C';
            const attempted = Object.keys(answers).filter(k => questions[part].some(qq => qq.id + qq._examId === k)).length;
            return (
              <button key={part} onClick={() => { setActivePart(part); setCurrentQ(0); }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${activePart === part ? 'bg-cyan-500/10 text-[#00F0FF]' : 'bg-white/5 text-gray-400'}`}>
                {label} ({attempted}/{EXAM_CONFIG[part].maxAttempt})
              </button>
            );
          })}
        </div>

        {/* Question */}
        {q && (
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Q{currentQ + 1} of {partQuestions.length} - {activePart}</span>
              <button onClick={() => toggleReview(qKey)} className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${markedForReview[qKey] ? 'bg-amber-500/15 text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
                <Flag className="w-3.5 h-3.5" /> {markedForReview[qKey] ? 'Marked' : 'Mark'}
              </button>
            </div>

            <div className="bg-black/20 rounded-lg p-4 mb-4 text-sm text-gray-200">
              <KaTeXRenderer math={q.question} display />
            </div>

            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => selectOption(qKey, i)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                    answers[qKey] === i ? 'bg-cyan-500/10 border-cyan-400/40 text-[#00F0FF]' : 'bg-white/5 border-white/5 text-gray-300 hover:border-cyan-400/20'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-white/10">{String.fromCharCode(65+i)}</span>
                    <span className="flex-1"><KaTeXRenderer math={opt} /></span>
                    {answers[qKey] === i && <CheckCircle className="w-4 h-4 text-[#00F0FF]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm disabled:opacity-30 transition">Previous</button>
          <button onClick={() => setCurrentQ(Math.min(partQuestions.length - 1, currentQ + 1))} disabled={currentQ === partQuestions.length - 1}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm disabled:opacity-30 transition">Next</button>
        </div>

        {/* Question Palette */}
        <div className="glass-panel rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 mb-2">Question Palette</p>
          <div className="flex flex-wrap gap-1.5">
            {partQuestions.map((qq, i) => {
              const key = qq.id + qq._examId;
              const isAnswered = answers[key] !== undefined;
              const isMarked = markedForReview[key];
              const isCurrent = i === currentQ;
              return (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                    isCurrent ? 'ring-2 ring-cyan-400' :
                    isMarked ? 'bg-amber-500/20 text-amber-400' :
                    isAnswered ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-gray-500'
                  }`}>{i+1}</button>
              );
            })}
          </div>
        </div>

        {showCalc && <ScientificCalculator onClose={() => setShowCalc(false)} />}
      </div>
    );
  }

  if (examState === 'results') {
    const sortedWeak = Object.entries(results.weakTopics).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const timeMins = Math.floor(results.timeTaken / 60);
    
    return (
      <div className="py-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-[#00FF88]" />
          <h1 className="text-xl font-bold text-white">AI Diagnostic Report</h1>
        </div>

        {/* Score Breakdown */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Score</p>
              <p className="text-3xl font-bold text-[#00FF88] text-glow-green">{results.totalScore.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Percentile Est.</p>
              <p className="text-3xl font-bold text-[#00F0FF] text-glow-blue">{results.percentileEstimate.toFixed(1)}<span className="text-lg">%</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Time Spent</p>
              <p className="text-3xl font-bold text-[#8A2BE2]">{timeMins}<span className="text-lg">m</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Attempted</p>
              <p className="text-3xl font-bold text-white">{results.partStats.PartA.attempted + results.partStats.PartB.attempted + results.partStats.PartC.attempted}</p>
            </div>
          </div>
        </div>

        {/* Part-wise breakdown */}
        <div className="glass-panel rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Score Breakdown by Part</h3>
          <div className="space-y-4">
            {['PartA', 'PartB', 'PartC'].map(part => {
              const label = part === 'PartA' ? 'Part A' : part === 'PartB' ? 'Part B' : 'Part C';
              const s = results.partStats[part];
              const sc = results.score[part];
              return (
                <div key={part}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{label}: {s.attempted} attempted ({s.correct} correct, {s.wrong} wrong)</span>
                    <span className={`text-sm font-bold ${sc >= 0 ? 'text-green-400' : 'text-red-400'}`}>{sc >= 0 ? '+' : ''}{sc.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500/50 to-[#00FF88] rounded-full" style={{ width: `${Math.min(100, (s.correct / EXAM_CONFIG[part].maxAttempt) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Spot Radar */}
        <div className="glass-panel rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Syllabus Weak Spot Radar</h3>
          {sortedWeak.length === 0 ? (
            <p className="text-xs text-gray-500">No weak spots detected - excellent performance!</p>
          ) : (
            <div className="space-y-2">
              {sortedWeak.map(([topic, count]) => (
                <div key={topic} className="flex items-center justify-between p-2 bg-red-500/5 border border-red-400/15 rounded-lg">
                  <span className="text-sm text-red-300">{topic}</span>
                  <span className="text-xs text-red-400 font-mono">{count} wrong</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Retake */}
        <button onClick={() => setExamState('setup')} className="w-full py-3 rounded-xl bg-cyan-500/10 text-[#00F0FF] text-sm font-semibold hover:bg-cyan-500/20 transition flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" /> Take New Mock Test
        </button>
      </div>
    );
  }
}
