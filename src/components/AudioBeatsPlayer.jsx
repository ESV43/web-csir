import { useState, useEffect } from 'react';
import { Music, CloudRain, Brain, Radio, Play, Pause, Volume2 } from 'lucide-react';
import { audioBeatsEngine, BEATS_MODES } from '../services/audioService';

export default function AudioBeatsPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState('synthwave');
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    audioBeatsEngine.setVolume(volume);
  }, [volume]);

  const handleToggle = () => {
    audioBeatsEngine.toggle(mode);
    setIsPlaying(audioBeatsEngine.isPlaying);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (isPlaying) {
      audioBeatsEngine.play(newMode);
      setIsPlaying(true);
    }
  };

  const iconMap = { Music, CloudRain, Brain, Radio };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {showVolume && (
        <div className="glass-panel rounded-xl p-3 flex items-center gap-2 mb-1">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400"
          />
        </div>
      )}

      <div className="glass-panel rounded-xl p-2 flex items-center gap-1.5">
        {BEATS_MODES.map((m) => {
          const Icon = iconMap[m.icon] || Music;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              title={m.name}
              className={`p-2 rounded-lg transition-all duration-200
                ${active
                  ? 'text-[#00F0FF] glow-blue bg-cyan-500/10'
                  : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}

        <div className="w-px h-6 bg-white/10 mx-0.5" />

        <button
          onClick={handleToggle}
          className={`p-2 rounded-lg transition-all duration-200
            ${isPlaying
              ? 'text-[#00FF88] glow-green bg-green-500/10'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setShowVolume(!showVolume)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
