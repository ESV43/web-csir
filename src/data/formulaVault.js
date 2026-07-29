export const VARIABLE_DICTIONARY = {
  '\\hbar': { name: 'Reduced Planck Constant', value: '1.054571817 × 10⁻³⁴ J·s', dimensions: '[M L² T⁻¹]' },
  'm': { name: 'Particle Mass / Inertial Mass', value: 'kg', dimensions: '[M]' },
  'E': { name: 'Energy Level / Eigenvalue', value: 'Joules (J) or eV', dimensions: '[M L² T⁻²]' },
  'c': { name: 'Speed of Light in Vacuum', value: '2.99792458 × 10⁸ m/s', dimensions: '[L T⁻¹]' },
  'e': { name: 'Elementary Electric Charge', value: '1.60217663 × 10⁻¹⁹ C', dimensions: '[I T]' },
  '\\epsilon_0': { name: 'Vacuum Permittivity', value: '8.854187812 × 10⁻¹² F/m', dimensions: '[M⁻¹ L⁻³ T⁴ I²]' },
  '\\mu_0': { name: 'Vacuum Permeability', value: '4π × 10⁻⁷ H/m', dimensions: '[M L T⁻² I⁻²]' },
  'k_B': { name: 'Boltzmann Constant', value: '1.380649 × 10⁻²³ J/K', dimensions: '[M L² T⁻² K⁻¹]' },
  '\\omega': { name: 'Angular Frequency', value: 'rad/s', dimensions: '[T⁻¹]' },
  '\\psi': { name: 'Wave Function Probability Amplitude', value: 'm⁻¹/² (1D), m⁻³/² (3D)', dimensions: '[L⁻ᵈ/²]' }
};

export const FORMULA_VAULT = [
  {
    id: 'f-qm-1',
    subjectId: 'quantum_mech',
    title: '1D Harmonic Oscillator Energy & Ladder Operators',
    latex: 'E_n = \\left(n + \\frac{1}{2}\\right) \\hbar \\omega, \\quad n = 0, 1, 2, \\dots',
    ladderOperators: 'a = \\sqrt{\\frac{m\\omega}{2\\hbar}} \\left(x + \\frac{ip}{m\\omega}\\right), \\quad [a, a^\\dagger] = 1',
    limitingCases: 'Zero-point energy $E_0 = \\frac{1}{2} \\hbar \\omega > 0$ due to Heisenberg uncertainty principle.',
    dimensionsCheck: '$\\hbar \\omega \\implies (\\text{J}\\cdot\\text{s})(\\text{s}^{-1}) = \\text{Joules [M L}^2 \\text{T}^{-2}]$',
    examTips: 'Matrix elements: $\\langle n+1 | x | n \\rangle = \\sqrt{\\frac{\\hbar (n+1)}{2m\\omega}}$. $\\langle n | x | n \\rangle = 0$.'
  },
  {
    id: 'f-qm-2',
    subjectId: 'quantum_mech',
    title: '3D Hydrogen Atom Energy Levels',
    latex: 'E_n = -\\frac{m e^4}{32 \\pi^2 \\epsilon_0^2 \\hbar^2 \\frac{1}{n^2}} = -\\frac{13.6 \\text{ eV}}{n^2}',
    degeneracy: 'Degeneracy excluding spin $g_n = n^2$. Including spin $g_n = 2n^2$.',
    limitingCases: 'As $n \\to \\infty$, $E_n \\to 0^-$ (continuum limit).',
    dimensionsCheck: 'Energy in eV.',
    examTips: 'Virial theorem for Coulomb potential $V \\propto -1/r$: $\\langle T \\rangle = -\\frac{1}{2} \\langle V \\rangle = -E_n$.'
  },
  {
    id: 'f-cm-1',
    subjectId: 'classical_mech',
    title: 'Relativistic Energy-Momentum Relation & 4-Momentum',
    latex: 'E^2 = p^2 c^2 + m_0^2 c^4, \\quad \\vec{P} = (E/c, \\vec{p})',
    invariant: 'Invariant norm: $P^2 = P_\\mu P^\\mu = \\frac{E^2}{c^2} - p^2 = m_0^2 c^2$',
    limitingCases: 'Non-relativistic limit $p \\ll m_0 c \\implies E \\approx m_0 c^2 + \\frac{p^2}{2m_0}$. Ultra-relativistic limit $E \\approx pc$.',
    dimensionsCheck: 'Energy squared $[M^2 L^4 T^{-4}]$.',
    examTips: 'For massless particles (photons, neutrinos), $E = pc$ and $v = c$.'
  },
  {
    id: 'f-emt-1',
    subjectId: 'emt',
    title: 'Poynting Vector & Electromagnetic Energy Density',
    latex: '\\vec{S} = \\frac{1}{\\mu_0} (\\vec{E} \\times \\vec{B}), \\quad u = \\frac{1}{2} \\left( \\epsilon_0 E^2 + \\frac{B^2}{\\mu_0} \\right)',
    intensity: 'Time-averaged intensity $\\langle S \\rangle = I = \\frac{1}{2} c \\epsilon_0 E_0^2 = c \\langle u \\rangle$',
    limitingCases: 'In vacuum plane wave, electric energy density equals magnetic energy density $u_E = u_B = \\frac{1}{2} \\epsilon_0 E_0^2$.',
    dimensionsCheck: '$\\vec{S}$ has dimensions of power per unit area $[M T^{-3}]$, $u$ has energy density $[M L^{-1} T^{-2}]$.',
    examTips: 'Radiation pressure $P_{rad} = I/c$ (for total absorption) or $2I/c$ (for total reflection).'
  },
  {
    id: 'f-tsp-1',
    subjectId: 'thermo_stat',
    title: 'Canonical Partition Function & Thermodynamic Relations',
    latex: 'Z = \\sum_i e^{-\\beta E_i}, \\quad F = -k_B T \\ln Z, \\quad U = -\\frac{\\partial \\ln Z}{\\partial \\beta}',
    entropy: 'Entropy $S = -\\left(\\frac{\\partial F}{\\partial T}\\right)_V = k_B (\\ln Z + \\beta U)$',
    limitingCases: 'High temperature limit $\\beta \\to 0 \\implies Z \\to N_{states}$. Low temperature limit $\\beta \\to \\infty \\implies Z \\to g_0 e^{-\\beta E_0}$.',
    dimensionsCheck: 'Partition function $Z$ is dimensionless.',
    examTips: 'For $N$ indistinguishable non-interacting particles, $Z_N = \\frac{Z_1^N}{N!}$.'
  }
];
