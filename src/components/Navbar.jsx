import { LayoutDashboard, BookOpen, Target, FileText, Bot, AlertTriangle, Zap, Moon, Sun, Database, Atom, UploadCloud } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'vault', label: 'Knowledge Vault', icon: BookOpen },
  { id: 'practice', label: 'Practice Studio', icon: Target },
  { id: 'exam', label: 'Exam Simulator', icon: FileText },
  { id: 'tutor', label: 'AI Vibe Tutor', icon: Bot },
  { id: 'mistakes', label: 'Mistake Vault', icon: AlertTriangle },
  { id: 'hacks', label: 'Hack Drills', icon: Zap }
];

export default function Navbar({ activeScreen, navigate, theme, toggleTheme, openSyncModal, openIngestionModal }) {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2 group"
          >
            <Atom className="w-7 h-7 text-[#00F0FF] group-hover:rotate-180 transition-transform duration-700" />
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-glow-blue tracking-tight" style={{ color: '#00F0FF' }}>
                VibePhysics
              </span>
              <span className="text-[10px] text-gray-500 -mt-1 tracking-widest">QUANTUMNET</span>
            </div>
          </button>

          {/* Nav items */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-cyan-500/10 text-[#00F0FF] glow-blue'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={openSyncModal}
              title="Google Sheets Sync"
              className="p-2 rounded-lg text-gray-400 hover:text-[#00FF88] hover:bg-white/5 transition-all"
            >
              <Database className="w-5 h-5" />
            </button>
            <button
              onClick={openIngestionModal}
              title="Upload Textbook PDFs"
              className="p-2 rounded-lg text-gray-400 hover:text-[#00FF88] hover:bg-white/5 transition-all"
            >
              <UploadCloud className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2 rounded-lg text-gray-400 hover:text-[#00F0FF] hover:bg-white/5 transition-all"
            >
              {theme === 'deepspace' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all
                  ${active
                    ? 'bg-cyan-500/10 text-[#00F0FF]'
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
        </div>
      </div>
    </nav>
  );
}
