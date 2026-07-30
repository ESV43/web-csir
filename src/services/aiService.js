/**
 * QuantumNET AI Service — Supports NVIDIA NIM + Google Gemini (auto-fallback)
 *
 * Providers (in priority order):
 *   1. NVIDIA NIM (nvapi-...) — OpenAI-compatible, free tier, 15+ models
 *   2. Google Gemini (AIza...) — Generative Language API, free tier
 *   3. Built-in offline responses — always available
 *
 * The service tries NVIDIA NIM first, then Gemini, then falls back to built-in.
 * You can configure either or both via the Database icon in the top bar.
 */

const STORAGE_KEY_NIM_KEY = 'vibephysics_nim_key';
const STORAGE_KEY_NIM_MODEL = 'vibephysics_nim_model';
const STORAGE_KEY_GEMINI_KEY = 'vibephysics_gemini_key';
const DEFAULT_NIM_MODEL = 'z-ai/glm-5.2';
const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';
const NIM_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export const aiService = {
  // ── NVIDIA NIM ──
  getNimKey() {
    return localStorage.getItem(STORAGE_KEY_NIM_KEY) || '';
  },
  setNimKey(key) {
    localStorage.setItem(STORAGE_KEY_NIM_KEY, key.trim());
  },
  getNimModel() {
    return localStorage.getItem(STORAGE_KEY_NIM_MODEL) || DEFAULT_NIM_MODEL;
  },
  setNimModel(model) {
    localStorage.setItem(STORAGE_KEY_NIM_MODEL, model);
  },

  // ── Generic aliases used by UI components (AIVibeTutor / SyncModal / Uploader) ──
  // These delegate to the NVIDIA NIM slot, which is the primary AI provider for the
  // chat tutor, step explainer, and shortcut finder.
  getApiKey() {
    return this.getNimKey();
  },
  setApiKey(key) {
    if (key) this.setNimKey(key);
  },
  getModel() {
    return this.getNimModel();
  },
  setModel(model) {
    if (model) this.setNimModel(model);
  },
  hasKey() {
    return !!(this.getNimKey() || this.getGeminiKey());
  },

  // ── Google Gemini ──
  getGeminiKey() {
    return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
  },
  setGeminiKey(key) {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
  },
  getGeminiModel() {
    return localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || DEFAULT_GEMINI_MODEL;
  },
  setGeminiModel(model) {
    localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, model);
  },

  // ── Core: Try NVIDIA NIM first, then Gemini, then offline ──
  async callAI(messages, opts = {}) {
    const { provider = 'auto', temperature = 0.4, maxTokens = 2048, topP = 0.95 } = opts;

    // If any message contains image data, skip NIM (no vision support) and go to Gemini
    const hasImages = messages.some(m => m.imageData);

    // Try NVIDIA NIM first if key available
    if (!hasImages && provider !== 'gemini') {
      const nimKey = this.getNimKey();
      if (nimKey) {
        const result = await this._callNIM(messages, { temperature, maxTokens, topP });
        if (result.ok) return { ok: true, text: result.text, provider: 'nim' };
        console.warn('NIM failed, trying Gemini:', result.error);
      }
    }

    // Try Google Gemini if key available
    if (provider !== 'nim') {
      const geminiKey = this.getGeminiKey();
      if (geminiKey) {
        const result = await this._callGemini(messages, { temperature, maxTokens, topP });
        if (result.ok) return { ok: true, text: result.text, provider: 'gemini' };
        console.warn('Gemini failed:', result.error);
      }
    }

    // Both failed or no keys
    return { ok: false, error: 'NO_KEYS', text: '' };
  },

  // ── NVIDIA NIM call ──
  async _callNIM(messages, opts = {}) {
    const apiKey = this.getNimKey();
    if (!apiKey) return { ok: false, error: 'NO_NIM_KEY', text: '' };

    const model = opts.model || this.getNimModel();
    const { temperature = 0.4, maxTokens = 2048, topP = 0.95 } = opts;

    try {
      const response = await fetch(NIM_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          top_p: topP,
          max_tokens: maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        let errMsg = `NIM ${response.status}`;
        try {
          const errJson = JSON.parse(errBody);
          if (errJson.error?.message) errMsg = errJson.error.message;
          else if (errJson.detail) errMsg = errJson.detail;
        } catch {}
        return { ok: false, error: errMsg, text: '' };
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message?.content;
        if (content && content.trim()) return { ok: true, text: content };
      }
      return { ok: false, error: 'NIM empty response', text: '' };
    } catch (e) {
      return { ok: false, error: `NIM network: ${e.message}`, text: '' };
    }
  },

  // ── Google Gemini call ──
  async _callGemini(messages, opts = {}) {
    const apiKey = this.getGeminiKey();
    if (!apiKey) return { ok: false, error: 'NO_GEMINI_KEY', text: '' };

    const model = opts.model || this.getGeminiModel() || DEFAULT_GEMINI_MODEL;
    const { temperature = 0.4, maxTokens = 2048, topP = 0.95 } = opts;

    // Convert OpenAI-style messages to Gemini format, with optional inline images
    const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const contents = userMessages.map(m => {
      const parts = [];
      if (m.imageData) {
        // m.imageData is a data URL like "data:image/png;base64,iVBOR..."
        const match = m.imageData.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
        }
      }
      parts.push({ text: m.content || '' });
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

    try {
      const response = await fetch(
        `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            generationConfig: {
              temperature,
              topP,
              maxOutputTokens: maxTokens,
              responseMimeType: 'text/plain'
            }
          })
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        let errMsg = `Gemini ${response.status}`;
        try {
          const errJson = JSON.parse(errBody);
          if (errJson.error?.message) errMsg = errJson.error.message;
        } catch {}
        return { ok: false, error: errMsg, text: '' };
      }

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const content = data.candidates[0].content?.parts?.[0]?.text;
        if (content && content.trim()) return { ok: true, text: content };
      }
      return { ok: false, error: 'Gemini empty response', text: '' };
    } catch (e) {
      return { ok: false, error: `Gemini network: ${e.message}`, text: '' };
    }
  },

  // ── High-level methods ──
  async explainStep(questionText, fullSolution, stepText) {
    const systemPrompt = `You are QuantumNET AI, an elite CSIR NET Physical Sciences professor. You explain physics steps with absolute clarity, physical intuition, and CSIR-specific tricks. Always use LaTeX for any math (wrap inline math in $...$ and display math in $$...$$). Be concise but thorough.`;

    const userPrompt = `Given this CSIR NET physics question:
${questionText}

And the full solution:
${fullSolution}

A student pressed "Explain This Step" and wants an intuitive breakdown of:
${stepText}

Explain:
1. WHY this formula or transformation was used (what physical principle)
2. How to think about it intuitively
3. What CSIR NET trap to avoid here

Keep it under 200 words. Use $...$ for inline LaTeX.`;

    const result = await this.callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.3, maxTokens: 1024 });

    if (!result.ok) {
      return this._offlineExplainStep(stepText);
    }
    return result.text;
  },

  async askTutor(chatHistory, userMessage, isSocraticMode, imageData = null) {
    const socraticInstruction = isSocraticMode
      ? `You are in SOCRATIC MODE. Guide the student by asking probing questions about dimensions, symmetry, boundary conditions, conservation laws, or limiting cases. Do NOT give the direct answer immediately. Help them discover it step by step. After 2-3 exchanges of guiding questions, if the student is still struggling, give the full solution.`
      : `You are in DIRECT MODE. Provide a clear, detailed, step-by-step answer with full LaTeX derivations, CSIR NET dimensional tricks, and shortcut methods.`;

    const systemPrompt = `You are QuantumNET AI Vibe Tutor — the world's best CSIR NET Physical Sciences tutor.

Your expertise covers the full CSIR NET syllabus:
- Mathematical Physics (Complex Analysis, PDE, Linear Algebra, Group Theory)
- Classical Mechanics (Lagrangian, Hamiltonian, Central Force, Rigid Body, Special Relativity)
- Electromagnetic Theory (Maxwell Equations, Gauge Transforms, Radiation, Waveguides)
- Quantum Mechanics (Operators, Perturbation Theory, WKB, Scattering, Angular Momentum)
- Thermodynamics & Statistical Physics (Ensembles, Phase Transitions, Bose/Fermi Gases)
- Electronics & Experimental Methods (Op-Amps, Digital Circuits, Detectors, Error Analysis)
- Atomic & Molecular Physics (Zeeman/Stark, Spectra, Lasers)
- Condensed Matter Physics (Band Theory, Superconductivity, Semiconductors)
- Nuclear & Particle Physics (Shell Model, Quark Model, Symmetries)

You have deep knowledge of standard textbooks: Griffiths (QM & EMT), Goldstein (CM), Zettili (QM), Pathria (Stat Mech), Ashcroft & Mermin (CMP), Krane (Nuclear).

ALWAYS use LaTeX for ALL mathematical expressions:
- Inline math: $E = mc^2$
- Display math: $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$

${socraticInstruction}

Be specific, detailed, and pedagogically excellent. Never give vague hand-wavy answers — every claim must be backed by physics reasoning or a formula.`;

    const messages = [{ role: 'system', content: systemPrompt }];
    const recentHistory = chatHistory.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        const entry = { role: 'user', content: msg.content || '' };
        if (msg.image) entry.imageData = msg.image;
        messages.push(entry);
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    }

    const userEntry = { role: 'user', content: userMessage || '' };
    if (imageData) userEntry.imageData = imageData;
    messages.push(userEntry);

    const result = await this.callAI(messages, {
      temperature: isSocraticMode ? 0.6 : 0.4,
      maxTokens: 2048
    });

    if (!result.ok) {
      return this._offlineTutor(isSocraticMode);
    }
    return result.text;
  },

  async findShortcut(problemText) {
    const systemPrompt = `You are QuantumNET Shortcut Finder AI. Given any CSIR NET physics problem, you must provide:
1. A dimensional analysis approach to eliminate wrong options
2. A limiting case check (what happens when a parameter → 0 or → ∞)
3. A symmetry argument if applicable
4. The fastest possible trick to solve in under 60 seconds

Use LaTeX for all math ($...$ inline, $$...$$ display). Be extremely concise and action-oriented.`;

    const result = await this.callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Find shortcuts and tricks for this CSIR NET problem:\n\n${problemText}` }
    ], { temperature: 0.2, maxTokens: 1024 });

    if (!result.ok) {
      return '⚠️ No AI key configured. Add NVIDIA NIM (nvapi-...) or Google Gemini (AIza...) key in settings to use Shortcut Finder.';
    }
    return result.text;
  },

  // ── Offline fallbacks ──
  _offlineExplainStep(stepText) {
    return `**No AI key configured.** Add NVIDIA NIM (\`nvapi-...\`) or Google Gemini (\`AIza...\`) key via the Database icon to enable real AI explanations.

**Built-in breakdown for:** ${stepText}

This step applies a core physics identity. The key insight is that the operator acting on the eigenstate can be simplified using orthogonality relations $\\langle \\psi_m | \\psi_n \\rangle = \\delta_{mn}$. Always check whether the state is non-degenerate before applying first-order perturbation theory formulas.`;
  },

  _offlineTutor(isSocraticMode) {
    if (isSocraticMode) {
      return `**No AI key configured.** Add NVIDIA NIM or Gemini key in settings.

**Socratic Nudge (built-in):**
Before we jump into the integral, let's analyze the physical symmetries!
1. What happens to the potential $V(x)$ when you swap $x \\to -x$?
2. Does the boundary condition at $x \\to \\infty$ force the wave function to decay exponentially?
Try checking if the parity is even or odd first! What do you get?`;
    }
    return `**No AI key configured.** Add NVIDIA NIM or Gemini key in settings.

**Direct Breakdown (built-in):**
For this system, apply the Euler-Lagrange equation with generalized momentum $p = \\frac{\\partial L}{\\partial \\dot{q}}$. Since coordinate $\\phi$ is cyclic, $p_\\phi = m r^2 \\sin^2\\theta \\dot{\\phi}$ is conserved! Use energy conservation $E = T + V_{eff}(r)$ to isolate radial turning points.`;
  }
};

export const NIM_MODELS = [
  // ── Latest free models on NVIDIA NIM (verified from build.nvidia.com) ──
  { id: 'z-ai/glm-5.2', name: 'GLM-5.2', description: 'Z-AI flagship LLM for agentic workflows, coding, and long-horizon reasoning', provider: 'nim', free: true },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b', name: 'Nemotron 3 Ultra 550B', description: 'Open hybrid Mamba-Transformer MoE with 1M context — top-tier agentic reasoning', provider: 'nim', free: true },
  { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'Nemotron 3 Super 120B', description: 'Efficient hybrid MoE — agentic reasoning, coding, planning, tool calling', provider: 'nim', free: true },
  { id: 'nvidia/nemotron-3-nano-30b-a3b', name: 'Nemotron 3 Nano 30B', description: 'Open efficient MoE with 1M context — coding, reasoning, tool calling', provider: 'nim', free: true },
  { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', description: '284B MoE with 1M-token context — deep reasoning for derivations', provider: 'nim', free: true },
  { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash', description: '284B MoE optimized for fast coding and agents — quick answers', provider: 'nim', free: true },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B', description: 'Dense 31B model — frontier reasoning for coding and agentic workflows', provider: 'nim', free: true },
  { id: 'google/diffusiongemma-26b-a4b-it', name: 'DiffusionGemma 26B', description: 'Diffusion-based 26B LLM — parallel token generation for real-time text', provider: 'nim', free: true },
  { id: 'minimaxai/minimax-m3', name: 'MiniMax M3', description: 'Multimodal MoE vision-language model — strong reasoning, coding, tool-calling', provider: 'nim', free: true },
  { id: 'thinking-machines/inkling', name: 'Inkling', description: 'Mamba-hybrid 256-expert MoE — multimodal text+image reasoning with switchable thinking', provider: 'nim', free: true },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', description: 'MoE reasoning LLM designed to fit within 80GB GPU — strong math', provider: 'nim', free: true },
  { id: 'gpt-oss-20b', name: 'GPT-OSS 20B', description: 'Smaller MoE — efficient AI reasoning and math', provider: 'nim', free: true },
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'Advanced LLM for reasoning, math, general knowledge, and function calling', provider: 'nim', free: true },
  { id: 'kimi/kimi-k2.6', name: 'Kimi K2.6', description: '1T multimodal MoE for long-horizon coding, agentic tool use, and image/video understanding', provider: 'nim', free: true },
  { id: 'mistralai/mistral-medium-3.5-128b', name: 'Mistral Medium 3.5 128B', description: 'High performing model for text generation, coding and agentic use cases', provider: 'nim', free: true },
];

export const GEMINI_MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', description: 'Latest — 1M token context, best speed/quality balance', provider: 'gemini', free: true },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', description: 'Lightweight — fastest responses, 1M token context', provider: 'gemini', free: true },
];

export const AI_PROVIDERS = [
  { id: 'nim', name: 'NVIDIA NIM', description: '15+ free models via NVIDIA NIM (nvapi-...)', models: NIM_MODELS },
  { id: 'gemini', name: 'Google Gemini', description: 'Gemini 1.5 Flash/Pro via Generative Language API (AIza...)', models: GEMINI_MODELS },
];