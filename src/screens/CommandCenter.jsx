import { useEffect, useState } from 'react';
import { Calendar, Flame, Target, Zap, TrendingUp, Clock, ArrowRight, Activity } from 'lucide-react';
import { CSIR_SUBJECTS } from '../data/csirSyllabus';
import { PYQ_DATABASE } from '../data/pyqDatabase';
import { storageService } from '../services/storageService';

export default function CommandCenter({ navigate }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [dailyPulse, setDailyPulse] = useState(null);
  const [streak, setStreak] = useState({ count: 0 });
  const [lastViewed, setLastViewed] = useState(null);

  useEffect(() => {
    // CSIR NET exam countdown - estimated next session Dec 2026
    const examDate = new Date('2026-12-15T09:00:00');
    const updateCountdown = () => {
      const now = new Date();
      const diff = examDate - now;
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown({ days, hours, mins, secs });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Daily pulse - deterministic from date seed
    const today = new Date().toDateString();
    const dayHash = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const partA = PYQ_DATABASE.filter(q => q.section === 'Part A');
    const partB = PYQ_DATABASE.filter(q => q.section === 'Part B');
    const partC = PYQ_DATABASE.filter(q => q.section === 'Part C');
    setDailyPulse({
      partA: partA[dayHash % partA.length],
      partB: partB[(dayHash * 7) % partB.length],
      partC: partC[(dayHash * 13) % partC.length]
    });

    setStreak(storageService.getStreak());
    setLastViewed(storageService.getLastViewed());

    return () => clearInterval(interval);
  }, []);

  const heatmap = storageService.getHeatmap();

  // Build last 12 weeks (84 days) GitHub-style grid
  const heatmapCells = [];
  for (let i = 83; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const count = heatmap[date] || 0;
    heatmapCells.push({ date, count });
  }

  const getHeatColor = (count) => {
    if (count === 0) return 'bg-white/5';
    if (count <= 2) return 'bg-green-900/60';
    if (count <= 4) return 'bg-green-600/70';
    if (count <= 6) return 'bg-green-400/80';
    return 'bg-[#00FF88] glow-green';
  };

  const totalSolved = (storageService.getProgress().solvedPyqIds || []).length;

  return (
    <div className="py-6 space-y-6">
      {/* CSIR NET Countdown Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/15 via-transparent to-violet-900/15 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-[#00FF88]" />
              <h2 className="text-lg font-bold text-white">CSIR NET Exam Countdown</h2>
            </div>
            <p className="text-sm text-gray-500">Physical Sciences - December 2026 Session</p>
          </div>
          <div className="flex gap-2 md:gap-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-[#00FF88] text-glow-green">{countdown.days}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Days</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-[#00F0FF] text-glow-blue">{String(countdown.hours).padStart(2,'0')}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Hours</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-[#8A2BE2] text-glow-violet">{String(countdown.mins).padStart(2,'0')}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Mins</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-[#00FF88]">{String(countdown.secs).padStart(2,'0')}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Streak</span>
          </div>
          <p className="text-2xl font-bold text-white">{streak.count} <span className="text-base text-gray-500">days</span></p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-[#00F0FF]" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">PYQs Solved</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalSolved}</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-[#00FF88]" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Subjects</span>
          </div>
          <p className="text-2xl font-bold text-white">9 <span className="text-base text-gray-500">Modules</span></p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#8A2BE2]" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Mistakes</span>
          </div>
          <p className="text-2xl font-bold text-white">{storageService.getMistakes().length}</p>
        </div>
      </div>

      {/* Daily Physics Pulse */}
      {dailyPulse && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-[#00FF88]" />
            <h2 className="text-lg font-bold text-white">Daily Physics Pulse</h2>
            <span className="text-xs text-gray-500">Today's high-yield PYQs</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['partA', 'partB', 'partC'].map((key, idx) => {
              const q = dailyPulse[key];
              const labels = ['Part A (Aptitude)', 'Part B (Core)', 'Part C (Advanced)'];
              const colors = ['#38BDF8', '#00F0FF', '#8A2BE2'];
              return (
                <button
                  key={key}
                  onClick={() => navigate('practice')}
                  className="glass-panel rounded-xl p-4 text-left hover:border-cyan-400/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: colors[idx] }}>{labels[idx]}</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-3">{q.topicName} - {q.difficulty}</p>
                  <p className="text-[10px] text-gray-600 mt-1">{q.month} {q.year}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mastery Heatmap */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#00F0FF]" />
          <h2 className="text-lg font-bold text-white">Mastery Heatmap</h2>
          <span className="text-xs text-gray-500">- Last 12 weeks activity</span>
        </div>
        <div className="flex gap-[3px] flex-wrap">
          {heatmapCells.map((cell, i) => (
            <div
              key={i}
              title={`${cell.date}: ${cell.count} tasks`}
              className={`w-3 h-3 rounded-sm ${getHeatColor(cell.count)}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-white/5" />
          <div className="w-3 h-3 rounded-sm bg-green-900/60" />
          <div className="w-3 h-3 rounded-sm bg-green-600/70" />
          <div className="w-3 h-3 rounded-sm bg-green-400/80" />
          <div className="w-3 h-3 rounded-sm bg-[#00FF88]" />
          <span>More</span>
        </div>
      </div>

      {/* Quick Resume Bar */}
      <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#00FF88]" />
          <div>
            <p className="text-sm text-gray-400">Quick Resume</p>
            {lastViewed ? (
              <button onClick={() => navigate(lastViewed.screen, lastViewed.subtopic)} className="text-sm text-cyan-300 hover:text-cyan-200">
                Continue {lastViewed.label} <ArrowRight className="w-3 h-3 inline" />
              </button>
            ) : (
              <button onClick={() => navigate('vault')} className="text-sm text-cyan-300 hover:text-cyan-200">
                Start Learning <ArrowRight className="w-3 h-3 inline" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
