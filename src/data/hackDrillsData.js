export const HACK_DRILLS = [
  {
    id: 'drill-1',
    title: 'Dimensional Analysis & Units Elimination',
    scenario: 'A particle of mass $m$ undergoes damped oscillations in a medium with damping coefficient $\\gamma$ (force $F = -\\gamma v$). What is the physical dimension and formula for the relaxation time $\\tau$ of mechanical energy?',
    options: [
      '\\tau = \\frac{m}{\\gamma}',
      '\\tau = \\frac{\\gamma}{m}',
      '\\tau = \\frac{m^2}{\\gamma}',
      '\\tau = \\frac{\\sqrt{m}}{\\gamma}'
    ],
    correctOption: 0,
    hackExplanation: '⚡ **Dimension Check**: Damping coefficient $\\gamma = F/v \\implies [M L T^{-2}] / [L T^{-1}] = [M T^{-1}]$. Relaxation time $\\tau$ must have dimension $[T]$. Thus $m/\\gamma = [M] / [M T^{-1}] = [T]$. Options 2, 3, 4 give wrong dimensions $[T^{-1}]$, $[M T]$, $[M^{-1/2} T]$. Option 1 eliminated all bad options instantly!',
    difficulty: 'Lightning Fast (<15s)'
  },
  {
    id: 'drill-2',
    title: 'Limiting Case Asymptotics ($m \\to 0$ or $k \\to \\infty$)',
    scenario: 'The period of oscillation for a liquid column of density $\\rho$ and total mass $M$ in a U-tube of cross-section $A$ is proposed. Which formula correctly behaves as $g \\to \\infty$?',
    options: [
      'T = 2\\pi \\sqrt{\\frac{M}{2 A \\rho g}}',
      'T = 2\\pi \\sqrt{\\frac{2 A \\rho g}{M}}',
      'T = 2\\pi \\frac{M g}{A \\rho}',
      'T = 2\\pi \\sqrt{\\frac{M g}{A}}'
    ],
    correctOption: 0,
    hackExplanation: '⚡ **Limiting Asymptotic Check**: As gravity $g \\to \\infty$, the restoring force becomes infinitely strong, so oscillations become infinitely rapid $\\implies T \\to 0$. Only Option 1 has $g$ in denominator under square root, guaranteeing $T \\to 0$ as $g \\to \\infty$!',
    difficulty: 'Lightning Fast (<15s)'
  },
  {
    id: 'drill-3',
    title: 'Symmetry & Even/Odd Parity Argument',
    scenario: 'For a 1D symmetric potential $V(-x) = V(x)$, what is the expectation value of position $\\langle x \\rangle$ for ANY non-degenerate bound state $\\psi_n(x)$?',
    options: [
      '\\langle x \\rangle = 0 \\text{ always}',
      '\\langle x \\rangle = \\frac{L}{2}',
      '\\langle x \\rangle = \\frac{\\hbar}{m\\omega}',
      '\\langle x \\rangle = n \\pi'
    ],
    correctOption: 0,
    hackExplanation: '⚡ **Parity Hack**: For symmetric potential $V(-x) = V(x)$, stationary non-degenerate bound state wave functions have definite parity (either even $\\psi(-x) = \\psi(x)$ or odd $\\psi(-x) = -\\psi(x)$). In both cases, $|\\psi(x)|^2$ is strictly EVEN. Thus integrand $x |\\psi(x)|^2$ is strictly ODD. Symmetric integral over $(-\\infty, +\\infty)$ vanishes identically $\\implies \\langle x \\rangle = 0$!',
    difficulty: 'Lightning Fast (<15s)'
  }
];
