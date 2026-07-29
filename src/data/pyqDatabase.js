export const PYQ_DATABASE = [
  // --- PART A: GENERAL APTITUDE ---
  {
    id: 'pyq-2023-a1',
    year: 2023,
    month: 'Dec',
    section: 'Part A',
    subjectId: 'math_phys',
    subtopicId: 'diff_eq',
    topicName: 'General Aptitude',
    difficulty: 'Standard CSIR',
    question: 'A particle moves along a straight line with velocity $v(t) = 3t^2 - 12t + 9$ m/s. What is the total distance traveled by the particle in the time interval $t = 0$ to $t = 3$ seconds?',
    options: ['0 meters', '8 meters', '10 meters', '12 meters'],
    correctOption: 1, // '8 meters'
    solutionStepByStep: `1. Velocity $v(t) = 3t^2 - 12t + 9 = 3(t-1)(t-3)$.
2. The roots of velocity are $t = 1$ s and $t = 3$ s.
3. On $t \\in (0,1)$, $v(t) > 0$. Distance $s_1 = \\int_0^1 (3t^2 - 12t + 9) dt = [t^3 - 6t^2 + 9t]_0^1 = 1 - 6 + 9 = 4$ m.
4. On $t \\in (1,3)$, $v(t) < 0$. Distance $s_2 = |\\int_1^3 (3t^2 - 12t + 9) dt| = |[t^3 - 6t^2 + 9t]_1^3| = |(27 - 54 + 27) - 4| = |-4| = 4$ m.
5. Total distance $S = s_1 + s_2 = 4 + 4 = 8$ meters.`,
    shortcutHack: '⚡ **Shortcut Trick**: Displacement $\\int_0^3 v(t)dt = [t^3 - 6t^2 + 9t]_0^3 = 0$. Since velocity changes sign at $t=1$, the particle turns around. Evaluate $x(0)=0, x(1)=4, x(3)=0$. Total distance $= |4-0| + |0-4| = 8$ m in 10 seconds without calculating definite integrals twice!',
    tags: ['Kinematics', 'Speed & Distance', 'Turning Point']
  },
  {
    id: 'pyq-2022-a2',
    year: 2022,
    month: 'June',
    section: 'Part A',
    subjectId: 'math_phys',
    subtopicId: 'matrices_tensors',
    topicName: 'General Aptitude',
    difficulty: 'Foundational',
    question: 'If the sum of two numbers is 10 and the sum of their reciprocals is $5/12$, what is the sum of their squares?',
    options: ['52', '48', '58', '64'],
    correctOption: 0, // '52'
    solutionStepByStep: `1. Let the numbers be $x$ and $y$.
2. Given $x + y = 10$ and $\\frac{1}{x} + \\frac{1}{y} = \\frac{5}{12} \\implies \\frac{x+y}{xy} = \\frac{5}{12}$.
3. Substitute $x+y=10$: $\\frac{10}{xy} = \\frac{5}{12} \\implies xy = 24$.
4. We need $x^2 + y^2 = (x+y)^2 - 2xy = 10^2 - 2(24) = 100 - 48 = 52$.`,
    shortcutHack: '⚡ **Shortcut Trick**: Product is 24 and sum is 10. The numbers are obviously 6 and 4. $6^2 + 4^2 = 36 + 16 = 52$. Solved mentally in 5 seconds!',
    tags: ['Algebra', 'Reciprocals', 'Identities']
  },

  // --- PART B: CORE PHYSICS ---
  {
    id: 'pyq-2023-b1',
    year: 2023,
    month: 'Dec',
    section: 'Part B',
    subjectId: 'quantum_mech',
    subtopicId: 'bound_states',
    topicName: 'Quantum Mechanics',
    difficulty: 'Standard CSIR',
    question: 'A particle of mass $m$ is in a 1D infinite square well of width $L$ extending from $x = -L/2$ to $x = +L/2$. If the system is perturbed by $V\'(x) = V_0 \\delta(x)$, the first-order energy correction to the ground state energy is:',
    options: ['$\\frac{V_0}{L}$', '$\\frac{2V_0}{L}$', '0', '$\\frac{V_0}{2L}$'],
    correctOption: 1, // '2V_0 / L'
    solutionStepByStep: `1. The ground state wave function for symmetric box $x \\in [-L/2, L/2]$ is $\\psi_1(x) = \\sqrt{\\frac{2}{L}} \\cos\\left(\\frac{\\pi x}{L}\\right)$.
2. First-order energy shift $E_1^{(1)} = \\langle \\psi_1 | V\' | \\psi_1 \\rangle = \\int_{-L/2}^{L/2} \\frac{2}{L} \\cos^2\\left(\\frac{\\pi x}{L}\\right) V_0 \\delta(x) dx$.
3. Using the property of Dirac delta function $\\int f(x) \\delta(x) dx = f(0)$:
   $E_1^{(1)} = \\frac{2 V_0}{L} \\cos^2(0) = \\frac{2 V_0}{L}$.`,
    shortcutHack: '⚡ **Dimensional & Delta Hack**: $\\delta(x)$ has dimension $1/\\text{length}$. Thus $V_0$ has units $\\text{Energy} \\times \\text{Length}$. So energy shift must be $V_0/L$. Since ground state wave function at origin is maximum $(\\psi(0) = \\sqrt{2/L})$, probability density is $2/L$. Delta function probes origin directly $\\rightarrow 2V_0/L$ immediately!',
    tags: ['Perturbation Theory', 'Infinite Well', 'Dirac Delta']
  },
  {
    id: 'pyq-2022-b2',
    year: 2022,
    month: 'June',
    section: 'Part B',
    subjectId: 'classical_mech',
    subtopicId: 'lagrangian_hamiltonian',
    topicName: 'Classical Mechanics',
    difficulty: 'Standard CSIR',
    question: 'The Lagrangian of a system with two degrees of freedom is $L = \\frac{1}{2}m(\\dot{x}^2 + \\dot{y}^2) - \\frac{1}{2}k(x^2 + y^2) + \\alpha x y$. The normal frequencies of small oscillations are:',
    options: [
      '\\sqrt{\\frac{k - \\alpha}{m}} \\text{ and } \\sqrt{\\frac{k + \\alpha}{m}}',
      '\\sqrt{\\frac{k}{m}} \\text{ and } \\sqrt{\\frac{2\\alpha}{m}}',
      '\\sqrt{\\frac{k + 2\\alpha}{m}} \\text{ and } \\sqrt{\\frac{k - 2\\alpha}{m}}',
      '\\sqrt{\\frac{2k - \\alpha}{m}} \\text{ and } \\sqrt{\\frac{2k + \\alpha}{m}}'
    ],
    correctOption: 0,
    solutionStepByStep: `1. Kinetic energy matrix $T = \\frac{1}{2}m \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$. Potential energy $V = \\frac{1}{2}k(x^2+y^2) - \\alpha x y$.
2. Potential energy matrix $V = \\begin{pmatrix} k & -\\alpha \\\\ -\\alpha & k \\end{pmatrix}$.
3. Secular equation $|V - \\omega^2 T| = 0 \\implies \\det \\begin{pmatrix} k - m\\omega^2 & -\\alpha \\\\ -\\alpha & k - m\\omega^2 \\end{pmatrix} = 0$.
4. $(k - m\\omega^2)^2 - \\alpha^2 = 0 \\implies k - m\\omega^2 = \\pm \\alpha$.
5. $\\omega_1 = \\sqrt{\\frac{k - \\alpha}{m}}$ and $\\omega_2 = \\sqrt{\\frac{k + \\alpha}{m}}$.`,
    shortcutHack: '⚡ **Symmetry / Limiting Case Hack**: Put coupling $\\alpha = 0$. Both frequencies must reduce to the uncoupled harmonic oscillator frequency $\\sqrt{k/m}$. Only option 1 reduces to $\\sqrt{k/m}$ when $\\alpha = 0$! Eliminates options 2, 3, 4 in 2 seconds without solving matrix determinants!',
    tags: ['Normal Modes', 'Small Oscillations', 'Lagrangian']
  },
  {
    id: 'pyq-2021-b3',
    year: 2021,
    month: 'Nov',
    section: 'Part B',
    subjectId: 'emt',
    subtopicId: 'maxwell_eq',
    topicName: 'Electromagnetic Theory',
    difficulty: 'Standard CSIR',
    question: 'The electric field of an electromagnetic wave in vacuum is given by $\\vec{E}(\\vec{r}, t) = E_0 \\hat{j} \\cos(k z - \\omega t)$. The corresponding magnetic field $\\vec{B}(\\vec{r}, t)$ is:',
    options: [
      '-\\frac{E_0}{c} \\hat{i} \\cos(kz - \\omega t)',
      '\\frac{E_0}{c} \\hat{i} \\cos(kz - \\omega t)',
      '-\\frac{E_0}{c} \\hat{k} \\cos(kz - \\omega t)',
      '\\frac{E_0}{c} \\hat{k} \\cos(kz - \\omega t)'
    ],
    correctOption: 0,
    solutionStepByStep: `1. Wave propagation vector $\\vec{k} = k \\hat{k}$ (along positive z-axis).
2. Relation between $\\vec{E}$ and $\\vec{B}$ for EM plane wave: $\\vec{B} = \\frac{1}{c} (\\hat{k}_{unit} \\times \\vec{E})$.
3. Here $\\hat{k}_{unit} = \\hat{k}$ and $\\vec{E} = E_0 \\hat{j} \\cos(kz - \\omega t)$.
4. Cross product: $\\hat{k} \\times \\hat{j} = -\\hat{i}$.
5. Thus $\\vec{B} = -\\frac{E_0}{c} \\hat{i} \\cos(kz - \\omega t)$.`,
    shortcutHack: '⚡ **Right Hand Rule Hack**: $\\vec{E} \\times \\vec{B}$ must point along propagation direction $+\\hat{k}$. If $\\vec{E}$ is along $+\\hat{j}$, then $+\\hat{j} \\times (-\\hat{i}) = +\\hat{k}$. So $\\vec{B}$ MUST be in the $-\\hat{i}$ direction! Option 1 immediately.',
    tags: ['EM Waves', 'Poynting Vector', 'Maxwell Equations']
  },

  // --- PART C: ADVANCED PHYSICS ---
  {
    id: 'pyq-2023-c1',
    year: 2023,
    month: 'Dec',
    section: 'Part C',
    subjectId: 'quantum_mech',
    subtopicId: 'wkb_variational',
    topicName: 'Quantum Mechanics',
    difficulty: 'Extreme',
    question: 'Using the WKB approximation, the bound state energy levels $E_n$ for a particle of mass $m$ moving in a 1D potential $V(x) = a |x|^4$ (where $a > 0$) scale with principal quantum number $n$ as:',
    options: [
      '$E_n \\propto n^{4/3}$',
      '$E_n \\propto n^{2/3}$',
      '$E_n \\propto n^{1/2}$',
      '$E_n \\propto n^2$'
    ],
    correctOption: 0, // 'E_n \propto n^{4/3}'
    solutionStepByStep: `1. WKB quantization condition: $\\int_{-x_0}^{x_0} \\sqrt{2m(E - a x^4)} dx = (n + 1/2) \\hbar \\pi$.
2. Substitute $x = (E/a)^{1/4} u \\implies dx = (E/a)^{1/4} du$.
3. Integral becomes: $\\sqrt{2m E} \\left(\\frac{E}{a}\\right)^{1/4} \\int_{-1}^{1} \\sqrt{1 - u^4} du = (n + 1/2) \\hbar \\pi$.
4. The power of $E$ on LHS is $E^{1/2} E^{1/4} = E^{3/4}$.
5. Therefore $E^{3/4} \\propto n \\implies E_n \\propto n^{4/3}$.`,
    shortcutHack: '⚡ **WKB Power-Law Scaling Hack**: For any potential $V(x) = a |x|^p$, the WKB energy levels scale as $E_n \\propto n^{\\frac{2p}{p+2}}$. Here $p=4$, so $E_n \\propto n^{\\frac{2(4)}{4+2}} = n^{8/6} = n^{4/3}$. Memorize $n^{\\frac{2p}{p+2}}$ and solve all power law WKB problems in 3 seconds!',
    tags: ['WKB Approximation', 'Power Law Potential', 'Energy Scaling']
  },
  {
    id: 'pyq-2022-c2',
    year: 2022,
    month: 'June',
    section: 'Part C',
    subjectId: 'thermo_stat',
    subtopicId: 'quantum_gases',
    topicName: 'Thermodynamics & Statistical Physics',
    difficulty: 'Extreme',
    question: 'For an ideal non-relativistic Bose gas in $D$-dimensional space, the Bose-Einstein condensation (BEC) transition occurs at a non-zero critical temperature $T_c$ only if:',
    options: [
      '$D > 2$',
      '$D \\ge 2$',
      '$D = 1$',
      '$D < 2$'
    ],
    correctOption: 0, // 'D > 2'
    solutionStepByStep: `1. Density of states for non-relativistic particles ($E \\propto p^2$) in $D$ dimensions: $g(E) \\propto E^{D/2 - 1}$.
2. Total number of excited particles $N_e = \\int_0^\\infty \\frac{g(E) dE}{e^{\\beta(E-\\mu)} - 1}$.
3. For BEC to occur at $T_c$, $N_e$ at $\\mu = 0$ must be finite: $\\int_0^\\infty \\frac{E^{D/2 - 1}}{e^{\\beta E} - 1} dE < \\infty$.
4. Near $E \\rightarrow 0$, $e^{\\beta E} - 1 \\approx \\beta E$, so integrand behaves as $E^{D/2 - 2}$.
5. For convergence at lower limit, exponent $D/2 - 2 > -1 \\implies D/2 > 1 \\implies D > 2$.`,
    shortcutHack: '⚡ **Dimensionality Rule**: BEC cannot occur in 1D or 2D for non-relativistic particles because density of states near $E=0$ is too high, leading to infrared divergence. Condensation requires $D > 2$ (e.g. 3D). Option 1 instantly!',
    tags: ['Bose-Einstein Condensation', 'Dimensionality', 'Statistical Physics']
  },
  {
    id: 'pyq-2021-c3',
    year: 2021,
    month: 'Nov',
    section: 'Part C',
    subjectId: 'condensed_matter',
    subtopicId: 'superconductivity',
    topicName: 'Condensed Matter Physics',
    difficulty: 'Extreme',
    question: 'According to the London theory of superconductivity, the magnetic field penetration depth $\\lambda_L$ depends on the superconducting electron density $n_s$ as:',
    options: [
      '$\\lambda_L \\propto n_s^{-1/2}$',
      '$\\lambda_L \\propto n_s^{1/2}$',
      '$\\lambda_L \\propto n_s^{-1}$',
      '$\\lambda_L \\propto n_s$'
    ],
    correctOption: 0, // '\lambda_L \propto n_s^{-1/2}'
    solutionStepByStep: `1. First London equation: $\\frac{\\partial \\vec{j}_s}{\\partial t} = \\frac{n_s e^2}{m} \\vec{E}$.
2. Second London equation: $\\nabla \\times \\vec{j}_s = -\\frac{n_s e^2}{m} \\vec{B}$.
3. Taking curl of Maxwell equation $\\nabla \\times \\vec{B} = \\mu_0 \\vec{j}_s \\implies \\nabla^2 \\vec{B} = \\frac{\\mu_0 n_s e^2}{m} \\vec{B} = \\frac{1}{\\lambda_L^2} \\vec{B}$.
4. Thus $\\lambda_L = \\sqrt{\\frac{m}{\\mu_0 n_s e^2}}$.
5. Therefore, penetration depth $\\lambda_L \\propto n_s^{-1/2}$.`,
    shortcutHack: '⚡ **Physical Intuition**: As superconducting density $n_s \\rightarrow \\infty$, the material screens magnetic fields faster, so penetration depth $\\lambda_L$ MUST decrease. This eliminates options 2 and 4. Dimensional analysis of $\\nabla^2 B = \\mu_0 j_s$ gives $\\lambda_L = \\sqrt{m/(\\mu_0 n_s e^2)} \\propto n_s^{-1/2}$!',
    tags: ['Superconductivity', 'London Penetration Depth', 'Condensed Matter']
  },
  {
    id: 'pyq-2020-c4',
    year: 2020,
    month: 'Nov',
    section: 'Part C',
    subjectId: 'nuclear_particle',
    subtopicId: 'quark_model',
    topicName: 'Nuclear & Particle Physics',
    difficulty: 'Standard CSIR',
    question: 'According to the Gell-Mann-Nishijima formula $Q = I_3 + \\frac{Y}{2}$, what is the hypercharge $Y$ and electric charge $Q$ of a $\\Xi^0$ (Cascade zero) baryon whose quark content is $uss$?',
    options: [
      '$Q = 0, Y = -1$',
      '$Q = 0, Y = 1$',
      '$Q = -1, Y = -1$',
      '$Q = +1, Y = 0$'
    ],
    correctOption: 0,
    solutionStepByStep: `1. Quark charges: $u = +2/3$, $s = -1/3$.
2. Electric charge $Q = u + s + s = +2/3 - 1/3 - 1/3 = 0$.
3. Baryon number $B = 1$. Strangeness $S = -2$ (since it contains two strange quarks).
4. Hypercharge $Y = B + S = 1 + (-2) = -1$.
5. Isospin third component $I_3 = Q - Y/2 = 0 - (-1/2) = +1/2$.`,
    shortcutHack: '⚡ **Quark Charge Mental Math**: $\\Xi^0$ has superscript 0 $\\implies$ electric charge $Q = 0$. It contains two $s$ quarks $\\implies$ strangeness $S = -2$. Hypercharge $Y = B + S = 1 - 2 = -1$. Result $(Q=0, Y=-1)$ in 5 seconds!',
    tags: ['Quark Model', 'Gell-Mann-Nishijima', 'Particle Physics']
  }
];
