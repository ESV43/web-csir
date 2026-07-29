export const CSIR_SUBJECTS = [
  {
    id: 'math_phys',
    code: 'MAT-01',
    name: 'Mathematical Physics',
    weightage: '30-35 Marks',
    color: '#00F0FF',
    icon: 'Sigma',
    subtopics: [
      { id: 'diff_eq', name: 'Differential Equations (Frobenius, Bessel, Legendre, Hermite)' },
      { id: 'complex_analysis', name: 'Complex Analysis (Residue Theorem, Contour Integration)' },
      { id: 'matrices_tensors', name: 'Matrices & Linear Algebra (Eigenvalues, Tensors, Metric Tensor)' },
      { id: 'fourier_laplace', name: 'Fourier & Laplace Transforms & Delta Functions' },
      { id: 'group_theory', name: 'Group Theory (SU(2), SO(3), Character Tables)' },
      { id: 'green_function', name: "Green's Function & Partial Differential Equations" }
    ]
  },
  {
    id: 'classical_mech',
    code: 'CLM-02',
    name: 'Classical Mechanics',
    weightage: '28-32 Marks',
    color: '#8A2BE2',
    icon: 'Orbit',
    subtopics: [
      { id: 'lagrangian_hamiltonian', name: 'Lagrangian & Hamiltonian Formulation & Small Oscillations' },
      { id: 'canonical_trans', name: 'Canonical Transformations & Poisson Brackets' },
      { id: 'central_force', name: 'Central Force Motion & Kepler Problem' },
      { id: 'rigid_body', name: 'Rigid Body Dynamics & Moment of Inertia Tensor' },
      { id: 'special_relativity', name: 'Special Theory of Relativity (4-Vectors, Lorentz Boost)' },
      { id: 'phase_space', name: 'Phase Space Dynamics & Chaos Intro' }
    ]
  },
  {
    id: 'emt',
    code: 'EMT-03',
    name: 'Electromagnetic Theory',
    weightage: '30-35 Marks',
    color: '#00FF88',
    icon: 'Zap',
    subtopics: [
      { id: 'maxwell_eq', name: 'Maxwell Equations & Boundary Conditions' },
      { id: 'electro_magnetostatics', name: 'Electrostatics & Magnetostatics (Multipole Expansion)' },
      { id: 'gauge_trans', name: 'Gauge Transformations (Coulomb & Lorentz Gauges)' },
      { id: 'em_waves_waveguides', name: 'EM Waves in Media, Reflection/Refraction & Waveguides' },
      { id: 'radiation_relativity', name: 'Radiation from Moving Charges & Relativistic Electrodynamics' }
    ]
  },
  {
    id: 'quantum_mech',
    code: 'QM-04',
    name: 'Quantum Mechanics',
    weightage: '35-40 Marks',
    color: '#FF007A',
    icon: 'Atom',
    subtopics: [
      { id: 'quantum_postulates', name: 'Wave Function, Operators, Uncertainty Principle' },
      { id: 'bound_states', name: '1D/3D Potential Wells, Harmonic Oscillator & Hydrogen Atom' },
      { id: 'angular_momentum', name: 'Angular Momentum, Spin & Clebsch-Gordan Coefficients' },
      { id: 'perturbation_theory', name: 'Time-Independent & Time-Dependent Perturbation Theory' },
      { id: 'wkb_variational', name: 'WKB Approximation & Variational Method' },
      { id: 'scattering_theory', name: 'Born Approximation, Phase Shifts & Scattering Theory' }
    ]
  },
  {
    id: 'thermo_stat',
    code: 'TSP-05',
    name: 'Thermodynamics & Statistical Physics',
    weightage: '25-30 Marks',
    color: '#FFB800',
    icon: 'Flame',
    subtopics: [
      { id: 'thermo_laws', name: 'Laws of Thermodynamics & Thermodynamic Potentials' },
      { id: 'ensembles', name: 'Microcanonical, Canonical & Grand Canonical Ensembles' },
      { id: 'quantum_gases', name: 'Bose-Einstein & Fermi-Dirac Statistics, BEC' },
      { id: 'phase_transitions', name: 'Phase Transitions, Ising Model & Critical Exponents' },
      { id: 'random_walk', name: 'Random Walk & Brownian Motion' }
    ]
  },
  {
    id: 'electronics_exp',
    code: 'ELE-06',
    name: 'Electronics & Experimental Methods',
    weightage: '20-25 Marks',
    color: '#00E5FF',
    icon: 'Cpu',
    subtopics: [
      { id: 'op_amps', name: 'Operational Amplifiers & Analog Circuits' },
      { id: 'digital_electronics', name: 'Logic Gates, Flip-Flops, ADCs & Microprocessors' },
      { id: 'semiconductor_devices', name: 'Diodes, Transistors (BJT, FET) & Optoelectronics' },
      { id: 'error_analysis', name: 'Error Analysis, Fourier Transforms in Signal Processing' },
      { id: 'particle_detectors', name: 'Detectors, Vacuum Systems & Cryogenics' }
    ]
  },
  {
    id: 'atomic_mol',
    code: 'AMP-07',
    name: 'Atomic & Molecular Physics',
    weightage: '15-20 Marks',
    color: '#A855F7',
    icon: 'Sparkles',
    subtopics: [
      { id: 'atomic_spectra', name: 'LS & jj Coupling, Term Symbols, Zeeman & Stark Effect' },
      { id: 'rotational_vib', name: 'Rotational, Vibrational & Raman Spectra of Molecules' },
      { id: 'lasers_optical', name: 'Einstein A/B Coefficients, Lasers & Optical Pumping' },
      { id: 'nmr_esr', name: 'NMR, ESR & Mössbauer Spectroscopy' }
    ]
  },
  {
    id: 'condensed_matter',
    code: 'CMP-08',
    name: 'Condensed Matter Physics',
    weightage: '20-25 Marks',
    color: '#EC4899',
    icon: 'Grid',
    subtopics: [
      { id: 'crystal_structure', name: 'Bravais Lattices, Reciprocal Lattice & X-Ray Diffraction' },
      { id: 'band_theory', name: 'Tight Binding Approximation, Kronig-Penney Model & Fermi Surface' },
      { id: 'superconductivity', name: 'BCS Theory, London Equations, Type-I & Type-II Superconductors' },
      { id: 'magnetic_dielectric', name: 'Dia-, Para-, Ferro-magnetism & Dielectric Properties' }
    ]
  },
  {
    id: 'nuclear_particle',
    code: 'NPP-09',
    name: 'Nuclear & Particle Physics',
    weightage: '20-25 Marks',
    color: '#10B981',
    icon: 'Radiation',
    subtopics: [
      { id: 'nuclear_models', name: 'Liquid Drop Model, Binding Energy & Shell Model' },
      { id: 'nuclear_decays', name: 'Alpha, Beta & Gamma Decays & Selection Rules' },
      { id: 'quark_model', name: 'Quarks, Gell-Mann-Nishijima Formula & Hadron Multiplets' },
      { id: 'symmetries_conservation', name: 'C, P, T Symmetries, Isospin & Conservation Laws' }
    ]
  }
];

export const ALL_SUBJECTS_METADATA = {
  physical: { name: 'CSIR NET Physical Sciences', accent: '#00F0FF', code: 'PHYS' },
  chemical: { name: 'CSIR NET Chemical Sciences', accent: '#38BDF8', code: 'CHEM' },
  mathematical: { name: 'CSIR NET Mathematical Sciences', accent: '#F43F5E', code: 'MATH' },
  life: { name: 'CSIR NET Life Sciences', accent: '#4ADE80', code: 'LIFE' }
};
