import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Upload, ToggleLeft, ToggleRight, Lightbulb, Zap } from 'lucide-react';
import { aiService } from '../services/aiService';
import KaTeXRenderer from '../components/KaTeXRenderer';

export default function AIVibeTutor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to QuantumNET AI Vibe Tutor. I am pre-trained on CSIR NET Physical Sciences syllabus, Griffiths QM/EMT, Goldstein Classical Mechanics, Pathria Stat Mech, and Zettili. Ask me anything or upload a photo of a problem to begin.' }
  ]);
  const [input, setInput] = useState('');
  const [socraticMode, setSocraticMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() && !imagePreview) return;
    const userMsg = { role: 'user', content: input, image: imagePreview };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImagePreview(null);
    setLoading(true);

    const query = imagePreview
      ? `I uploaded an image of a physics problem. Please identify the concept, convert visible equations to LaTeX, and guide me. Question: ${input}`
      : input;

    const result = await aiService.askSocraticTutor(query, socraticMode);
    setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    setLoading(false);
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  const presetQueries = [
    { label: 'Shortcut & Trick Finder', icon: Zap, text: 'Give me dimensional tricks and boundary condition checks for the 1D potential step-well problem in quantum mechanics.' },
    { label: 'WKB Energy Scaling', icon: Lightbulb, text: 'Using WKB approximation, how do energy levels scale for V(x) = a|x|^4? Show me the derivation and remember the general formula.' },
    { label: 'Bose-Einstein Condensation', icon: Lightbulb, text: 'Why does Bose-Einstein condensation not occur in 1D and 2D for non-relativistic particles? Explain with the IR divergence argument.' }
  ];

  return (
    <div className="py-4 flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#8A2BE2]" />
          <h1 className="text-xl font-bold text-white">AI Vibe Tutor</h1>
          <span className="text-xs text-gray-500">- Powered by Gemini</span>
        </div>
        <button
          onClick={() => setSocraticMode(!socraticMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            socraticMode ? 'bg-violet-500/15 text-[#8A2BE2] glow-violet' : 'bg-white/5 text-gray-400'
          }`}
        >
          {socraticMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          Socratic Mode {socraticMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Chat messages */}
      <div ref={chatRef} className="flex-1 glass-panel rounded-2xl p-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-cyan-500/15' : 'bg-violet-500/15'
              }`}>
                {msg.role === 'user' ? <span className="text-sm text-[#00F0FF]">U</span> : <Bot className="w-4 h-4 text-[#8A2BE2]" />}
              </div>
              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                msg.role === 'user' ? 'bg-cyan-500/10 text-gray-200' : 'bg-violet-500/5 text-gray-200'
              }`}>
                {msg.image && <img src={msg.image} alt="upload" className="rounded-lg mb-2 max-w-xs max-h-40 object-cover" />}
                <div className="whitespace-pre-wrap"><KaTeXRenderer math={msg.content} /></div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center"><Bot className="w-4 h-4 text-[#8A2BE2]" /></div>
              <div className="bg-violet-500/5 rounded-xl px-4 py-3 text-sm text-gray-500 italic">Thinking...</div>
            </div>
          )}
        </div>
      </div>

      {/* Preset queries */}
      <div className="flex flex-wrap gap-2 mt-3 shrink-0">
        {presetQueries.map(p => {
          const Icon = p.icon;
          return (
            <button key={p.label} onClick={() => setInput(p.text)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-[#00F0FF] hover:bg-cyan-500/5 transition">
              <Icon className="w-3 h-3" /> {p.label}
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className="mt-3 shrink-0">
        {imagePreview && (
          <div className="mb-2 inline-flex items-center gap-2 bg-white/5 rounded-lg p-1 pr-2">
            <img src={imagePreview} alt="preview" className="w-12 h-12 rounded object-cover" />
            <button onClick={() => setImagePreview(null)} className="text-xs text-red-400">Remove</button>
          </div>
        )}
        <div className="flex gap-2">
          <label className="cursor-pointer p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-[#00FF88] transition">
            <Upload className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about any physics concept, formula, or PYQ..."
            className="flex-1 bg-gray-900/60 rounded-xl px-4 py-2.5 text-sm text-gray-200 border border-white/10 focus:border-violet-400/50 outline-none"
          />
          <button onClick={handleSend} disabled={loading}
            className="px-4 rounded-xl bg-[#8A2BE2]/15 text-[#8A2BE2] hover:bg-[#8A2BE2]/25 transition disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
