export const CONCEPT_CAPSULES = [
  {
    id: 'cap-qm-perturbation',
    subjectId: 'quantum_mech',
    subtopicId: 'perturbation_theory',
    title: 'Time-Independent Perturbation Theory (Non-Degenerate & Degenerate)',
    readTime: '3 min',
    summary: 'When Hamiltonian $H = H_0 + \\lambda H\'$ where $H_0 \\psi_n^{(0)} = E_n^{(0)} \\psi_n^{(0)}$, small perturbations modify energy levels and state vectors systematically.',
    keyTakeaways: [
      '1st Order Energy Correction: $E_n^{(1)} = \\langle \\psi_n^{(0)} | H\' | \\psi_n^{(0)} \\rangle$',
      '2nd Order Energy Correction: $E_n^{(2)} = \\sum_{k \\neq n} \\frac{|\\langle \\psi_k^{(0)} | H\' | \\psi_n^{(0)} \\rangle|^2}{E_n^{(0)} - E_k^{(0)}}$',
      'Ground state 2nd-order energy shift is ALWAYS negative ($E_0^{(2)} \\le 0$).',
      'For degenerate states, diagonalize the $W$ matrix in the degenerate subspace: $W_{ij} = \\langle \\phi_i | H\' | \\phi_j \\rangle$.'
    ],
    derivationStepper: {
      title: 'Derivation of First & Second Order Rayleigh-Schrödinger Corrections',
      steps: [
        {
          stepNumber: 1,
          heading: 'Power Series Expansion',
          formula: '(H_0 + \\lambda H\') \\sum_{m=0}^\\infty \\lambda^m |\\psi_n^{(m)}\\rangle = \\sum_{m=0}^\\infty \\lambda^m E_n^{(m)} \\sum_{k=0}^\\infty \\lambda^k |\\psi_n^{(k)}\\rangle',
          explanation: 'Expand both the wave function and energy eigenvalue in powers of the ordering parameter $\\lambda$.',
          tooltip: 'How we got here: We assume the exact Hamiltonian solution smoothly connects to the unperturbed state as $\\lambda \\to 0$.'
        },
        {
          stepNumber: 2,
          heading: 'Equating Order $\\lambda^1$ Terms',
          formula: 'H_0 |\\psi_n^{(1)}\\rangle + H\' |\\psi_n^{(0)}\\rangle = E_n^{(0)} |\\psi_n^{(1)}\\rangle + E_n^{(1)} |\\psi_n^{(0)}\\rangle',
          explanation: 'Group all terms multiplied by $\\lambda^1$ on both sides.',
          tooltip: 'How we got here: Matching coefficients of like powers of $\\lambda$ guarantees equality for any continuous perturbation parameter.'
        },
        {
          stepNumber: 3,
          heading: 'Projecting onto Unperturbed State $\\langle \\psi_n^{(0)} |$',
          formula: '\\langle \\psi_n^{(0)} | H_0 | \\psi_n^{(1)} \\rangle + \\langle \\psi_n^{(0)} | H\' | \\psi_n^{(0)} \\rangle = E_n^{(0)} \\langle \\psi_n^{(0)} | \\psi_n^{(1)} \\rangle + E_n^{(1)} \\langle \\psi_n^{(0)} | \\psi_n^{(0)} \\rangle',
          explanation: 'Since $H_0$ is Hermitian, $\\langle \\psi_n^{(0)} | H_0 = E_n^{(0)} \\langle \\psi_n^{(0)} |$, so the first terms cancel on both sides.',
          tooltip: 'How we got here: Hermiticity allows operator $H_0$ to act to the left on its bra eigenvector giving eigenvalue $E_n^{(0)}$.'
        },
        {
          stepNumber: 4,
          heading: 'Final 1st-Order Energy Result',
          formula: 'E_n^{(1)} = \\langle \\psi_n^{(0)} | H\' | \\psi_n^{(0)} \\rangle',
          explanation: 'The 1st-order correction is simply the expectation value of the perturbation operator in the unperturbed state.',
          tooltip: 'How we got here: Normalization $\\langle \\psi_n^{(0)} | \\psi_n^{(0)} \\rangle = 1$ leaves $E_n^{(1)}$ isolated on RHS.'
        }
      ]
    },
    commonPitfalls: [
      '⚠️ Applying non-degenerate formulas when states are degenerate! ALWAYS check if $E_a^{(0)} = E_b^{(0)}$ first.',
      '⚠️ Forgetting that 2nd-order correction to ground state $E_0^{(2)}$ must be negative or zero because $E_0^{(0)} - E_k^{(0)} < 0$ for all $k > 0$.',
      '⚠️ Misinterpreting parity: if $H\'$ has odd parity, all 1st-order diagonal corrections vanish for states of definite parity!'
    ]
  },
  {
    id: 'cap-cm-lagrangian',
    subjectId: 'classical_mech',
    subtopicId: 'lagrangian_hamiltonian',
    title: 'Lagrangian Mechanics & Cyclic Coordinates',
    readTime: '3 min',
    summary: 'The Lagrangian $L(q_i, \\dot{q}_i, t) = T - V$ provides coordinate-invariant equations of motion via Hamilton’s Principle of Least Action.',
    keyTakeaways: [
      'Euler-Lagrange Equation: \\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}_i}\\right) - \\frac{\\partial L}{\\partial q_i} = 0',
      'Generalized Momentum: p_i = \\frac{\\partial L}{\\partial \\dot{q}_i}',
      'Cyclic Coordinate: If $q_k$ does not explicitly appear in $L$ ($\\frac{\\partial L}{\\partial q_k} = 0$), then $p_k$ is a conserved constant of motion!',
      'Hamiltonian Construction: $H = \\sum_i p_i \\dot{q}_i - L$'
    ],
    derivationStepper: {
      title: 'Derivation of Conservation Law for Cyclic Coordinates',
      steps: [
        {
          stepNumber: 1,
          heading: 'Euler-Lagrange Statement',
          formula: '\\frac{d}{dt} \\left( \\frac{\\partial L}{\\partial \\dot{q}_k} \\right) = \\frac{\\partial L}{\\partial q_k}',
          explanation: 'Fundamental equation of motion for any generalized coordinate $q_k$.',
          tooltip: 'How we got here: Derived from minimizing action $S = \\int L dt$ using calculus of variations.'
        },
        {
          stepNumber: 2,
          heading: 'Condition for Cyclic Coordinate',
          formula: '\\frac{\\partial L}{\\partial q_k} = 0 \\implies \\frac{d}{dt} \\left( \\frac{\\partial L}{\\partial \\dot{q}_k} \\right) = 0',
          explanation: 'If coordinate $q_k$ is absent from Lagrangian, its partial derivative vanishes.',
          tooltip: 'How we got here: Ignorable or cyclic coordinate definition.'
        },
        {
          stepNumber: 3,
          heading: 'Conserved Conjugate Momentum',
          formula: 'p_k = \\frac{\\partial L}{\\partial \\dot{q}_k} = \\text{Constant}',
          explanation: 'The generalized momentum $p_k$ is strictly constant in time.',
          tooltip: 'How we got here: Integrating $\\frac{d}{dt}(p_k) = 0$ yields $p_k(t) = \\text{const}$.'
        }
      ]
    },
    commonPitfalls: [
      '⚠️ Using $T = \\frac{1}{2} m \\dot{r}^2$ in spherical coordinates without including angular terms: $T = \\frac{1}{2}m (\\dot{r}^2 + r^2 \\dot{\\theta}^2 + r^2 \\sin^2\\theta \\dot{\\phi}^2)$.',
      '⚠️ Assuming $H = T + V$ always! $H = T + V$ holds ONLY when kinetic energy $T$ is a quadratic homogeneous function of generalized velocities and constraints are time-independent.'
    ]
  },
  {
    id: 'cap-emt-maxwell',
    subjectId: 'emt',
    subtopicId: 'maxwell_eq',
    title: 'Maxwell Equations & Electromagnetic Boundary Conditions',
    readTime: '3 min',
    summary: 'The fundamental equations governing electromagnetic fields across media interfaces.',
    keyTakeaways: [
      'Normal $\\vec{D}$: $D_{1n} - D_{2n} = \\sigma_f$ (Free surface charge density)',
      'Tangential $\\vec{E}$: $E_{1t} - E_{2t} = 0$ (Always continuous)',
      'Normal $\\vec{B}$: $B_{1n} - B_{2n} = 0$ (No magnetic monopoles)',
      'Tangential $\\vec{H}$: $H_{1t} - H_{2t} = |\\vec{K}_f \\times \\hat{n}|$ (Free surface current)'
    ],
    derivationStepper: {
      title: 'Derivation of Tangential Electric Field Continuity across Boundary',
      steps: [
        {
          stepNumber: 1,
          heading: 'Faraday Law in Integral Form',
          formula: '\\oint \\vec{E} \\cdot d\\vec{l} = -\\frac{d}{dt} \\int \\vec{B} \\cdot d\\vec{A}',
          explanation: 'Apply Maxwell equation around a thin rectangular loop spanning the interface.',
          tooltip: 'How we got here: Stokes theorem applied to $\\nabla \\times \\vec{E} = -\\partial \\vec{B}/\\partial t$.'
        },
        {
          stepNumber: 2,
          heading: 'Limiting Loop Height $h \\to 0$',
          formula: 'E_{1t} \\Delta l - E_{2t} \\Delta l + O(h) = -\\frac{\\partial B}{\\partial t} (h \\Delta l) \\to 0',
          explanation: 'As rectangle thickness shrinks to zero, enclosed magnetic flux vanishes.',
          tooltip: 'How we got here: Area $h \\Delta l \\to 0$ as height $h \\to 0$.'
        },
        {
          stepNumber: 3,
          heading: 'Tangential Continuity',
          formula: 'E_{1t} = E_{2t}',
          explanation: 'Tangential component of electric field is strictly continuous across any interface.',
          tooltip: 'How we got here: Canceling $\\Delta l$ on both sides.'
        }
      ]
    },
    commonPitfalls: [
      '⚠️ Confusing dielectric boundary conditions with conductor boundaries: for a conductor, $\\vec{E}_{inside} = 0$, so $E_{1n} = \\sigma/\\epsilon_0$.',
      '⚠️ Forgetting that $H = B/\\mu$: tangential $B_t$ is NOT continuous unless $\\mu_1 = \\mu_2$!'
    ]
  }
];
