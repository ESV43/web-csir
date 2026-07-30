import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Upload, ToggleLeft, ToggleRight, Lightbulb, Zap, Cpu, ChevronDown } from 'lucide-react';
import { aiService, NIM_MODELS } from '../services/aiService';
import RichText from '../components/RichText';

export default function AIVibeTutor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to QuantumNET AI Vibe Tutor. I am pre-trained on CSIR NET Physical Sciences syllabus, Griffiths QM/EMT, Goldstein Classical Mechanics, Pathria Stat Mech, and Zettili.\n\nAsk me anything — or upload a photo of a problem and I\'ll convert it to LaTeX and guide you.\n\nSelect a model from the dropdown above and toggle Socratic Mode for guided questioning.' }
  ]);
  const [input, setInput] = useState('');
  const [socraticMode, setSocraticMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageContext, setImageContext] = useState(null);
  const [selectedModel, setSelectedModel] = useState(aiService.getModel());
  const [showModelList, setShowModelList] = useState(false);
  const [hasKey, setHasKey] = useState(!!aiService.getApiKey());
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages, loading]);

  const currentModel = NIM_MODELS.find(m => m.id === selectedModel) || NIM_MODELS[0];

  function handleModelChange(modelId) {
    setSelectedModel(modelId);
    aiService.setModel(modelId);
    setShowModelList(false);
  }

  async function handleSend() {
    if (!input.trim() && !imagePreview) return;
    const userMsg = { role: 'user', content: input, image: imagePreview };
    const currentInput = input;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImagePreview(null);
    setLoading(true);

    const result = await aiService.askTutor(
      messages,
      currentInput,
      socraticMode,
      imageContext
    );
    setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    setLoading(false);
    setImageContext(null);
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        setImageContext(`User uploaded a physics problem image (${file.name}). Please identify the concept, convert visible equations to LaTeX, and guide the solution.`);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleShortcutFinder() {
    if (!input.trim()) return;
    setLoading(true);
    const result = await aiService.findShortcut(input);
    setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'assistant', content: result }]);
    setInput('');
    setLoading(false);
  }

  const presetQueries = [
    { label: 'Shortcut & Trick Finder', icon: Zap, text: 'Give me dimensional tricks and boundary condition checks for the 1D potential step-well problem in quantum mechanics.' },
    { label: 'WKB Energy Scaling', icon: Lightbulb, text: 'Using WKB approximation, how do energy levels scale for $V(x) = a|x|^4$? Show me the derivation and the general formula for $V(x) = a|x|^p$.' },
    { label: 'Bose-Einstein Condensation', icon: Lightbulb, text: 'Why does Bose-Einstein condensation not occur in 1D and 2D for non-relativistic particles? Explain with the infrared divergence argument.' },
    { label: 'Lagrangian Normal Modes', icon: Lightbulb, text: 'Two coupled oscillators with $L = \\frac{1}{2}m(\\dot{x}^2 + \\dot{y}^2) - \\frac{1}{2}k(x^2 + y^2) + \\alpha x y$. Find normal frequencies.' }
  ];

  return (
    <div className="py-4 flex flex-col h-[calc(100vh-7rem)]">
      {/* Top bar: title + model selector + socratic toggle */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#8A2BE2]" />
          <h1 className="text-xl font-bold text-white">AI Vibe Tutor</h1>
          {!hasKey && (
            <span className="text-xs text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
              No API key set — click Database icon to configure
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelList(!showModelList)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 hover:bg-white/10 transition border border-white/10"
            >
              <Cpu className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="max-w-[120px] truncate">{currentModel.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showModelList && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowModelList(false)} />
                <div className="absolute right-0 mt-1 z-20 w-80 max-h-96 overflow-y-auto glass-panel rounded-xl p-2 shadow-2xl">
                  <div className="px-2 py-1 mb-1 border-b border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Select AI Model</p>
                  </div>
                  {NIM_MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleModelChange(m.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition flex items-start gap-2 ${
                        selectedModel === m.id ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-medium ${selectedModel === m.id ? 'text-[#00F0FF]' : 'text-gray-200'}`}>
                            {m.name}
                          </span>
                          {m.free && (
                            <span className="text-[9px] text-[#00FF88] bg-[#00FF88]/10 px-1 py-0.5 rounded">FREE</span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{m.description}</p>
                        <p className="text-[9px] text-gray-600 mt-0.5 font-mono">{m.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Socratic Toggle */}
          <button
            onClick={() => setSocraticMode(!socraticMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              socraticMode ? 'bg-violet-500/15 text-[#8A2BE2] glow-violet' : 'bg-white/5 text-gray-400'
            }`}
          >
            {socraticMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            Socratic {socraticMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div ref={chatRef} className="flex-1 glass-panel rounded-2xl p-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-cyan-500/15' : 'bg-violet-500/15'
              }`}>
                {msg.role === 'user' ? <span className="text-sm text-[#00F0FF] font-bold">U</span> : <Bot className="w-4 h-4 text-[#8A2BE2]" />}
              </div>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user' ? 'bg-cyan-500/10 text-gray-200' : 'bg-violet-500/5 text-gray-200'
              }`}>
                {msg.image && <img src={msg.image} alt="upload" className="rounded-lg mb-2 max-w-xs max-h-40 object-cover" />}
                <RichText block>{msg.content}</RichText>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center"><Bot className="w-4 h-4 text-[#8A2BE2] animate-pulse" /></div>
              <div className="bg-violet-500/5 rounded-xl px-4 py-3 text-sm text-gray-500 italic flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-[#8A2BE2] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="inline-block w-2 h-2 bg-[#8A2BE2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="inline-block w-2 h-2 bg-[#8A2BE2] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-xs">{currentModel.name} is thinking...</span>
              </div>
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
            <button onClick={() => { setImagePreview(null); setImageContext(null); }} className="text-xs text-red-400">Remove</button>
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
          <button onClick={handleShortcutFinder} disabled={loading || !input.trim()}
            title="Shortcut & Trick Finder"
            className="px-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-40">
            <Zap className="w-4 h-4" />
          </button>
          <button onClick={handleSend} disabled={loading}
            className="px-4 rounded-xl bg-[#8A2BE2]/15 text-[#8A2BE2] hover:bg-[#8A2BE2]/25 transition disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5 text-center">
          Using: <span className="text-gray-400">{currentModel.name}</span> · {socraticMode ? 'Socratic guided mode' : 'Direct answer mode'} · Powered by NVIDIA NIM
        </p>
      </div>
    </div>
  );
}
