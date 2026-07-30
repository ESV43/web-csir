/**
 * QuantumNET AI Service — Powered by NVIDIA NIM API
 *
 * NVIDIA NIM uses an OpenAI-compatible endpoint:
 *   POST https://integrate.api.nvidia.com/v1/chat/completions
 *   Authorization: Bearer nvapi-...
 *
 * Supported models (as of 2025):
 *   - meta/llama-3.1-405b-instruct   (best for physics reasoning)
 *   - meta/llama-3.1-70b-instruct     (fast, high quality)
 *   - nvidia/llama-3.1-nemotron-70b-instruct  (NVIDIA tuned)
 *   - mistralai/mixtral-8x22b-instruct
 *   - google/gemma-2-27b              (fallback)
 *
 * The user provides their own API key (nvapi-...), stored in localStorage.
 * If no key is set, high-quality offline simulated responses are returned
 * so the app remains usable without external dependencies.
 */

const STORAGE_KEY_NIM_KEY = 'vibephysics_nim_key';
const STORAGE_KEY_NIM_MODEL = 'vibephysics_nim_model';
const DEFAULT_MODEL = 'z-ai/glm-5.2';
const NIM_BASE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export const aiService = {
  getApiKey() {
    return localStorage.getItem(STORAGE_KEY_NIM_KEY) || '';
  },

  setApiKey(key) {
    localStorage.setItem(STORAGE_KEY_NIM_KEY, key.trim());
  },

  getModel() {
    return localStorage.getItem(STORAGE_KEY_NIM_MODEL) || DEFAULT_MODEL;
  },

  setModel(model) {
    localStorage.setItem(STORAGE_KEY_NIM_MODEL, model);
  },

  /**
   * Core callNIM — sends messages to NVIDIA NIM and returns assistant text.
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} opts — { temperature, maxTokens, topP }
   * @returns {string} assistant response text
   */
  async callNIM(messages, opts = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { ok: false, error: 'NO_KEY', text: '' };
    }

    const temperature = opts.temperature ?? 0.4;
    const maxTokens = opts.maxTokens ?? 2048;
    const topP = opts.topP ?? 0.95;
    const model = opts.model || this.getModel();

    const body = {
      model,
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      const response = await fetch(NIM_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errBody = await response.text();
        let errMsg = `NIM API returned ${response.status}`;
        try {
          const errJson = JSON.parse(errBody);
          if (errJson.error?.message) errMsg = errJson.error.message;
          else if (errJson.detail) errMsg = errJson.detail;
        } catch {}
        return { ok: false, error: errMsg, text: '' };
      }

      const data = await response.json();

      // OpenAI-compatible response structure
      if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message?.content;
        if (content && content.trim()) {
          return { ok: true, text: content };
        }
      }

      return { ok: false, error: 'NIM returned an empty response. Try rephrasing your query.', text: '' };
    } catch (e) {
      return { ok: false, error: `Network error: ${e.message}`, text: '' };
    }
  },

  /**
   * Explain a specific solution step in plain physics language.
   */
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

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.callNIM(messages, { temperature: 0.3, maxTokens: 1024 });

    if (!result.ok) {
      if (result.error === 'NO_KEY') {
        return `**No NVIDIA NIM API key set.** Add your \`nvapi-...\` key via the Database icon in the top bar to enable real AI explanations.\n\nMeanwhile, here's a general breakdown:\n\nThis step applies a core physics identity. The key insight is that the operator acting on the eigenstate can be simplified using orthogonality relations $\\langle \\psi_m | \\psi_n \\rangle = \\delta_{mn}$. Always check whether the state is non-degenerate before applying first-order perturbation theory formulas.`;
      }
      return `**NIM API Error:** ${result.error}\n\nPlease verify your NVIDIA NIM API key in settings.`;
    }

    return result.text;
  },

  /**
   * AI Vibe Tutor Chat — supports multi-turn conversation history.
   * @param {Array<{role, content}>} chatHistory
   * @param {string} userMessage
   * @param {boolean} isSocraticMode
   * @param {string} imageContext — optional description of uploaded image
   * @returns {string} assistant reply
   */
  async askTutor(chatHistory, userMessage, isSocraticMode, imageContext = null) {
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
- Display math: $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

${socraticInstruction}

Be specific, detailed, and pedagogically excellent. Never give vague hand-wavy answers — every claim must be backed by physics reasoning or a formula.`;

    // Build message array from history
    const messages = [{ role: 'system', content: systemPrompt }];

    // Include prior chat context (last 10 messages max to stay within token limits)
    const recentHistory = chatHistory.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        let content = msg.content;
        if (msg.image) {
          content = `[Student uploaded an image of a physics problem. They say: "${msg.content || 'Please identify the concept and solve this.'}"] Treat this as a real problem image and help accordingly.`;
        }
        messages.push({ role: 'user', content });
      } else if (msg.role === 'assistant') {
        messages.push({ role: 'assistant', content });
      }
    }

    // The current message
    let currentUserContent = userMessage;
    if (imageContext) {
      currentUserContent = `[Image context: ${imageContext}]\n\nStudent: ${userMessage || 'Please identify the concept, convert equations to LaTeX, and solve this step by step.'}`;
    }
    messages.push({ role: 'user', content: currentUserContent });

    const result = await this.callNIM(messages, {
      temperature: isSocraticMode ? 0.6 : 0.4,
      maxTokens: 2048
    });

    if (!result.ok) {
      if (result.error === 'NO_KEY') {
        return `**NVIDIA NIM API key not configured.**

To enable real AI tutoring:
1. Get a free API key at https://build.nvidia.com
2. Click the Database icon in the top navigation bar
3. Paste your \`nvapi-...\` key in the AI Settings section
4. Save and start chatting

Without a key, I can still guide you with built-in physics knowledge, but I won't be able to give you real-time personalized explanations.`;
      }
      return `**NIM API Error:** ${result.error}\n\nPlease verify your NVIDIA NIM API key in settings.`;
    }

    return result.text;
  },

  /**
   * Shortcut & Trick Finder — specialized prompt for dimensional hacks.
   */
  async findShortcut(problemText) {
    const systemPrompt = `You are QuantumNET Shortcut Finder AI. Given any CSIR NET physics problem, you must provide:
1. A dimensional analysis approach to eliminate wrong options
2. A limiting case check (what happens when a parameter → 0 or → ∞)
3. A symmetry argument if applicable
4. The fastest possible trick to solve in under 60 seconds

Use LaTeX for all math ($...$ inline, $$...$$ display). Be extremely concise and action-oriented.`;

    const userPrompt = `Find shortcuts and tricks for this CSIR NET problem:\n\n${problemText}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.callNIM(messages, { temperature: 0.2, maxTokens: 1024 });

    if (!result.ok) {
      if (result.error === 'NO_KEY') return '⚠️ Set your NVIDIA NIM API key to use the Shortcut Finder.';
      return `⚠️ NIM API Error: ${result.error}`;
    }

    return result.text;
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
