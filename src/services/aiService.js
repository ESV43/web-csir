const STORAGE_KEY_GEMINI_KEY = 'vibephysics_gemini_key';

export const aiService = {
  getApiKey() {
    return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
  },

  setApiKey(key) {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
  },

  async explainStep(questionText, fullSolution, stepText) {
    const apiKey = this.getApiKey();

    const prompt = `You are QuantumNET AI, an elite CSIR NET Physics Professor.
    
Given this physics question: "${questionText}"
And full solution: "${fullSolution}"

A student asks you to explain this specific step in plain, intuitive English with zero fluff:
Step: "${stepText}"

Explain WHY we used this formula or transformation, what physical principle is behind it, and what trap to avoid. Keep it under 150 words.`;

    if (!apiKey) {
      // High-quality offline simulated response if API key is not yet set
      return `💡 **Intuitive Physics Breakdown**:
This step utilizes the principle of **Hermiticity** and operator algebra. Because the perturbation operator $H'$ acts directly on the unperturbed eigenstate $|\\psi_n^{(0)}\\rangle$, taking the inner product $\\langle \\psi_n^{(0)} |$ cancels out second-order mixing terms due to orthonormality $\\langle \\psi_n^{(0)} | \\psi_m^{(0)} \\rangle = \\delta_{nm}$.

⚠️ **CSIR Trap Warning**: Never forget to normalize your wave functions BEFORE taking expectation values! (Tip: Enter your Google Gemini API key in AI Settings for live custom breakdowns).`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      console.error('Gemini API Error:', e);
      return '⚠️ Unable to connect to Gemini AI API. Please check your API key in AI Tutor settings.';
    }
  },

  async askSocraticTutor(userQuestion, isSocraticMode = true) {
    const apiKey = this.getApiKey();

    const socraticInstruction = isSocraticMode
      ? `Guide the student using the Socratic method. Do NOT give the final numeric/formula answer right away. Ask guiding physics questions about dimensions, conservation laws, or boundary conditions to nudge them toward the answer.`
      : `Provide a direct, high-yield physics explanation with step-by-step LaTeX formula derivations and CSIR NET dimensional tricks.`;

    const prompt = `You are QuantumNET AI Vibe Tutor, expert in CSIR NET Physical Sciences syllabus (Griffiths Quantum/EMT, Goldstein Classical Mechanics, Pathria Stat Mech, Zettili QM).
    
Mode: ${socraticInstruction}
Student Question: "${userQuestion}"`;

    if (!apiKey) {
      return isSocraticMode
        ? `🤔 **Socratic Nudge**:
Before we jump into the integral, let's analyze the physical symmetries!
1. What happens to the potential $V(x)$ when you swap $x \\to -x$?
2. Does the boundary condition at $x \\to \\infty$ force the wave function to decay exponentially?
Try checking if the parity is even or odd first! What do you get?`
        : `⚡ **QuantumNET AI Direct Breakdown**:
For this system, apply the Euler-Lagrange equation with generalized momentum $p = \\frac{\\partial L}{\\partial \\dot{q}}$. Since coordinate $\\phi$ is cyclic, $p_\\phi = m r^2 \\sin^2\\theta \\dot{\\phi}$ is conserved! Use energy conservation $E = T + V_{eff}(r)$ to isolate radial turning points.`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      return '⚠️ Gemini AI API call failed. Verify your key in AI settings.';
    }
  }
};
