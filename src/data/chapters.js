/**
 * Full detailed chapters for the Knowledge Vault "Derivations" tab.
 * These are complete textbook-quality chapter notes with LaTeX throughout.
 * The PDF ingestion pipeline can add more chapters to Google Sheets which
 * will be merged with these.
 */

export const CHAPTERS = [
  {
    id: 'ch-qm-perturbation-full',
    subjectId: 'quantum_mech',
    subtopicId: 'perturbation_theory',
    title: 'Time-Independent Perturbation Theory — Complete Chapter',
    readTime: '15 min',
    sections: [
      {
        heading: '1. Introduction & Physical Motivation',
        content: `In many physical systems, the Hamiltonian $H$ can be split into a solvable part $H_0$ and a small correction $H'$:

$$H = H_0 + \\lambda H'$$

where $\\lambda$ is a dimensionless ordering parameter ($0 \\le \\lambda \\le 1$) that we will set to 1 at the end. The unperturbed eigenstates satisfy:

$$H_0 |\\psi_n^{(0)}\\rangle = E_n^{(0)} |\\psi_n^{(0)}\\rangle$$

The key insight of perturbation theory is that if $H'$ is "small" compared to the energy spacing $|E_n^{(0)} - E_m^{(0)}|$, then the exact eigenstates and eigenvalues of $H$ are smooth, analytic functions of $\\lambda$ that can be expanded in a power series.`
      },
      {
        heading: '2. Power Series Expansion (Rayleigh-Schrödinger)',
        content: `We expand both the energy and the state vector as power series in $\\lambda$:

$$E_n = E_n^{(0)} + \\lambda E_n^{(1)} + \\lambda^2 E_n^{(2)} + \\cdots$$

$$|\\psi_n\\rangle = |\\psi_n^{(0)}\\rangle + \\lambda |\\psi_n^{(1)}\\rangle + \\lambda^2 |\\psi_n^{(2)}\\rangle + \\cdots$$

Substituting into the Schrödinger equation $H|\\psi_n\\rangle = E_n|\\psi_n\\rangle$:

$$(H_0 + \\lambda H') \\sum_{k=0}^{\\infty} \\lambda^k |\\psi_n^{(k)}\\rangle = \\left(\\sum_{j=0}^{\\infty} \\lambda^j E_n^{(j)}\\right) \\left(\\sum_{k=0}^{\\infty} \\lambda^k |\\psi_n^{(k)}\\rangle\\right)$$

Collecting terms order by order in $\\lambda$:

- **Order $\\lambda^0$**: $H_0|\\psi_n^{(0)}\\rangle = E_n^{(0)}|\\psi_n^{(0)}\\rangle$ (just the unperturbed SE)
- **Order $\\lambda^1$**: $H_0|\\psi_n^{(1)}\\rangle + H'|\\psi_n^{(0)}\\rangle = E_n^{(0)}|\\psi_n^{(1)}\\rangle + E_n^{(1)}|\\psi_n^{(0)}\\rangle$`
      },
      {
        heading: '3. First-Order Energy Correction',
        content: `Projecting the order-$\\lambda^1$ equation onto $\\langle \\psi_n^{(0)} |$:

$$\\langle \\psi_n^{(0)} | H_0 | \\psi_n^{(1)} \\rangle + \\langle \\psi_n^{(0)} | H' | \\psi_n^{(0)} \\rangle = E_n^{(0)} \\langle \\psi_n^{(0)} | \\psi_n^{(1)} \\rangle + E_n^{(1)} \\langle \\psi_n^{(0)} | \\psi_n^{(0)} \\rangle$$

Since $H_0$ is Hermitian, $\\langle \\psi_n^{(0)} | H_0 = E_n^{(0)} \\langle \\psi_n^{(0)} |$, so the first terms on both sides cancel. Using normalization $\\langle \\psi_n^{(0)} | \\psi_n^{(0)} \\rangle = 1$:

$$\\boxed{E_n^{(1)} = \\langle \\psi_n^{(0)} | H' | \\psi_n^{(0)} \\rangle}$$

**Physical meaning**: The first-order energy shift is simply the expectation value of the perturbation in the unperturbed state — it's the "average" effect of the perturbation.

**Key result for CSIR NET**: If $H'$ has odd parity and $|\\psi_n^{(0)}\\rangle$ has definite parity, then $E_n^{(1)} = 0$ (because the integrand $|\\psi|^2 H'$ is odd).`
      },
      {
        heading: '4. First-Order Wave Function Correction',
        content: `We expand $|\\psi_n^{(1)}\\rangle$ in the complete unperturbed basis:

$$|\\psi_n^{(1)}\\rangle = \\sum_{m \\neq n} c_m^{(1)} |\\psi_m^{(0)}\\rangle$$

(excluding $m = n$ because that component is already in $|\\psi_n^{(0)}\\rangle$). Substituting into the order-$\\lambda^1$ equation and projecting onto $\\langle \\psi_k^{(0)} |$ with $k \\neq n$:

$$E_k^{(0)} c_k^{(1)} + \\langle \\psi_k^{(0)} | H' | \\psi_n^{(0)} \\rangle = E_n^{(0)} c_k^{(1)}$$

Solving for $c_k^{(1)}$:

$$c_k^{(1)} = \\frac{\\langle \\psi_k^{(0)} | H' | \\psi_n^{(0)} \\rangle}{E_n^{(0)} - E_k^{(0)}}$$

Therefore:

$$\\boxed{|\\psi_n^{(1)}\\rangle = \\sum_{m \\neq n} \\frac{\\langle \\psi_m^{(0)} | H' | \\psi_n^{(0)} \\rangle}{E_n^{(0)} - E_m^{(0)}} |\\psi_m^{(0)}\\rangle}$$

**Critical observation**: The first-order state correction mixes in other unperturbed states, weighted by the matrix element of $H'$ and inversely weighted by the energy denominator. States close in energy are mixed more strongly.`
      },
      {
        heading: '5. Second-Order Energy Correction',
        content: `Going to order $\\lambda^2$ and projecting onto $\\langle \\psi_n^{(0)} |$:

$$E_n^{(2)} = \\sum_{m \\neq n} \\frac{|\\langle \\psi_m^{(0)} | H' | \\psi_n^{(0)} \\rangle|^2}{E_n^{(0)} - E_m^{(0)}}$$

$$\\boxed{E_n^{(2)} = \\sum_{m \\neq n} \\frac{|H'_{mn}|^2}{E_n^{(0)} - E_m^{(0)}}}$$

**Key properties for CSIR NET**:

1. **Ground state second-order shift is always negative**: For $n=0$ (ground state), $E_0^{(0)} < E_m^{(0)}$ for all $m > 0$, so every denominator is negative, making $E_0^{(2)} < 0$. The ground state energy is always lowered in second order.

2. **Second-order shift respects the "sum rule"**: Using the Thomas-Reiche-Kuhn sum rule, $\\sum_m |\\langle m | x | n \\rangle|^2 (E_m - E_n) = \\frac{\\hbar^2}{2m}$, one can evaluate $E_n^{(2)}$ for specific perturbations.

3. **For degenerate states**: The above formulas FAIL when $E_n^{(0)} = E_m^{(0)}$ (division by zero). This requires degenerate perturbation theory (see Section 7).`
      },
      {
        heading: '6. Validity Condition & Breakdown',
        content: `Perturbation theory is valid when the corrections are small compared to the unperturbed energy spacings:

$$\\left| \\frac{\\langle \\psi_m^{(0)} | H' | \\psi_n^{(0)} \\rangle}{E_n^{(0)} - E_m^{(0)}} \\right| \\ll 1 \\quad \\text{for all } m \\neq n$$

**When does it break?**

1. **Degeneracy**: If $E_n^{(0)} = E_m^{(0)}$, the denominator vanishes → use degenerate perturbation theory.
2. **Near-degeneracy**: Even if not exactly degenerate, if the coupling matrix element is comparable to the energy spacing, the series diverges.
3. **Strong perturbation**: If $H'$ is not "small" compared to level spacing, the power series may not converge at all.

**CSIR NET Trap**: Always check for degeneracies BEFORE applying non-degenerate formulas! This is the #1 mistake students make in perturbation theory problems.`
      },
      {
        heading: '7. Degenerate Perturbation Theory',
        content: `When the unperturbed level $E_n^{(0)}$ has degeneracy of degree $g$ (i.e., $g$ states $|\\psi_n^{(1)}\\rangle, \\ldots, |\\psi_n^{(g)}\\rangle$ share the same energy), we must diagonalize the perturbation within the degenerate subspace.

**Step 1**: Form the $g \\times g$ matrix $W$ where:

$$W_{ij} = \\langle \\psi_n^{(i)} | H' | \\psi_n^{(j)} \\rangle$$

**Step 2**: Diagonalize $W$. The eigenvalues of $W$ give the first-order energy corrections $E_n^{(1)}$, and the eigenvectors give the "correct" zeroth-order states.

**Step 3**: If $W$ has eigenvalues with multiplicity > 1, there is still "accidental" degeneracy — go to second-order degenerate theory.

**Example (Stark Effect in Hydrogen)**: For the $n=2$ level of hydrogen, there is 4-fold degeneracy ($2s$ and $2p$ states). The perturbation $H' = e\\mathcal{E}z$ couples $2s$ and $2p_z$ states (but not $2p_x$ or $2p_y$). Diagonalizing the $2 \\times 2$ block gives first-order Stark shift of $\\pm 3e a_0 \\mathcal{E}$.`
      },
      {
        heading: '8. Standard CSIR NET Problems & Tricks',
        content: `**Problem Type 1 — Infinite Square Well with Delta Perturbation**:

Given $V = V_0 \\delta(x - L/2)$ in a box $[0, L]$:

$$E_n^{(1)} = \\frac{2 V_0}{L} \\sin^2\\left(\\frac{n \\pi}{2}\\right)$$

For even $n$: $E_n^{(1)} = 0$ (node at center). For odd $n$: $E_n^{(1)} = 2V_0/L$.

**Problem Type 2 — Harmonic Oscillator with $\\alpha x^3$ or $\\alpha x^4$ Perturbation**:

- For $H' = \\alpha x^3$: $E_n^{(1)} = 0$ (odd parity). $E_n^{(2)} \\propto \\alpha^2$ with specific selection rules.
- For $H' = \\beta x^4$: $E_n^{(1)} = \\beta \\langle n | x^4 | n \\rangle = \\frac{3\\beta \\hbar^2}{4m^2 \\omega^2}(2n^2 + 2n + 1)$.

**Dimensional Trick**: For $H' = \\beta x^4$, dimensions of $\\beta$ are $[E/L^4] = [M L^{-2} T^{-2}]$. The energy shift must scale as $\\beta \\langle x^4 \\rangle \\propto \\beta \\left(\\frac{\\hbar}{m\\omega}\\right)^2$, giving the characteristic scale $\\frac{\\beta \\hbar^2}{m^2 \\omega^2}$.`
      }
    ],
    keyFormulas: [
      'E_n^{(1)} = \\langle \\psi_n^{(0)} | H\' | \\psi_n^{(0)} \\rangle',
      'E_n^{(2)} = \\sum_{m \\neq n} \\frac{|\\langle \\psi_m^{(0)} | H\' | \\psi_n^{(0)} \\rangle|^2}{E_n^{(0)} - E_m^{(0)}}',
      '|\\psi_n^{(1)}\\rangle = \\sum_{m \\neq n} \\frac{\\langle \\psi_m^{(0)} | H\' | \\psi_n^{(0)} \\rangle}{E_n^{(0)} - E_m^{(0)}} |\\psi_m^{(0)}\\rangle'
    ]
  },
  {
    id: 'ch-cm-lagrangian-full',
    subjectId: 'classical_mech',
    subtopicId: 'lagrangian_hamiltonian',
    title: 'Lagrangian Mechanics & Euler-Lagrange Equation — Complete Chapter',
    readTime: '12 min',
    sections: [
      {
        heading: '1. The Principle of Least Action (Hamilton\'s Principle)',
        content: `Classical mechanics can be reformulated entirely in terms of a single scalar function — the Lagrangian:

$$L(q_i, \\dot{q}_i, t) = T - V$$

where $T$ is the kinetic energy and $V$ is the potential energy, expressed in terms of generalized coordinates $q_i$ and generalized velocities $\\dot{q}_i$.

**Hamilton's Principle** states that the actual trajectory of a system between times $t_1$ and $t_2$ is the one that makes the action functional stationary (usually a minimum):

$$\\delta S = \\delta \\int_{t_1}^{t_2} L(q_i, \\dot{q}_i, t) \\, dt = 0$$

This is a variational principle — of all possible paths connecting the endpoints, nature chooses the one that extremizes the action.`
      },
      {
        heading: '2. Derivation of the Euler-Lagrange Equation',
        content: `To find the condition for $\\delta S = 0$, we vary the path: $q_i(t) \\to q_i(t) + \\delta q_i(t)$, with $\\delta q_i(t_1) = \\delta q_i(t_2) = 0$ (fixed endpoints).

The variation of the action is:

$$\\delta S = \\int_{t_1}^{t_2} \\left( \\frac{\\partial L}{\\partial q_i} \\delta q_i + \\frac{\\partial L}{\\partial \\dot{q}_i} \\delta \\dot{q}_i \\right) dt$$

Integrating the second term by parts:

$$\\int_{t_1}^{t_2} \\frac{\\partial L}{\\partial \\dot{q}_i} \\delta \\dot{q}_i \\, dt = \\left[ \\frac{\\partial L}{\\partial \\dot{q}_i} \\delta q_i \\right]_{t_1}^{t_2} - \\int_{t_1}^{t_2} \\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}_i}\\right) \\delta q_i \\, dt$$

The boundary term vanishes because $\\delta q_i(t_1) = \\delta q_i(t_2) = 0$. Therefore:

$$\\delta S = \\int_{t_1}^{t_2} \\left( \\frac{\\partial L}{\\partial q_i} - \\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot{q}_i} \\right) \\delta q_i \\, dt$$

For this to be zero for arbitrary $\\delta q_i$, the integrand must vanish:

$$\\boxed{\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}_i}\\right) - \\frac{\\partial L}{\\partial q_i} = 0}$$

This is the **Euler-Lagrange equation** — the fundamental equation of motion in Lagrangian mechanics.`
      },
      {
        heading: '3. Generalized Momentum & Cyclic Coordinates',
        content: `We define the **generalized (conjugate) momentum** as:

$$p_i = \\frac{\\partial L}{\\partial \\dot{q}_i}$$

If a coordinate $q_k$ does not appear explicitly in the Lagrangian (i.e., $\\frac{\\partial L}{\\partial q_k} = 0$), then $q_k$ is called a **cyclic** (or ignorable) coordinate. The Euler-Lagrange equation immediately gives:

$$\\frac{d}{dt} p_k = \\frac{d}{dt} \\frac{\\partial L}{\\partial \\dot{q}_k} = 0 \\implies p_k = \\text{constant}$$

**This is a conservation law!** Every cyclic coordinate implies a conserved generalized momentum.

**Example**: In central force motion with $L = \\frac{1}{2}m(\\dot{r}^2 + r^2 \\dot{\\theta}^2) - V(r)$, the coordinate $\\theta$ is cyclic, so $p_\\theta = mr^2\\dot{\\theta} = L_z$ (angular momentum) is conserved.`
      },
      {
        heading: '4. Lagrangian in Different Coordinate Systems',
        content: `**Cartesian**: $L = \\frac{1}{2}m(\\dot{x}^2 + \\dot{y}^2 + \\dot{z}^2) - V(x, y, z)$

**Spherical Polar** (with $x = r \\sin\\theta \\cos\\phi$, etc.):

$$T = \\frac{1}{2}m(\\dot{r}^2 + r^2 \\dot{\\theta}^2 + r^2 \\sin^2\\theta \\, \\dot{\\phi}^2)$$

**CSIR NET Super-Trap**: Students frequently forget the $r^2 \\sin^2\\theta$ factor for the $\\phi$ kinetic energy! If you omit it, the Euler-Lagrange equation for $\\phi$ will give WRONG conservation laws.

**Cylindrical Polar**: $T = \\frac{1}{2}m(\\dot{\\rho}^2 + \\rho^2 \\dot{\\phi}^2 + \\dot{z}^2)$

The Lagrangian is coordinate-invariant — you can choose ANY set of generalized coordinates $q_i$ that describe the configuration of the system, and the Euler-Lagrange equations will automatically give the correct equations of motion.`
      },
      {
        heading: '5. From Lagrangian to Hamiltonian (Legendre Transform)',
        content: `The Hamiltonian formulation uses $(q_i, p_i)$ as independent variables instead of $(q_i, \\dot{q}_i)$. The transformation is via a **Legendre transform**:

$$H(q_i, p_i, t) = \\sum_i p_i \\dot{q}_i - L(q_i, \\dot{q}_i, t)$$

where $\\dot{q}_i$ must be expressed in terms of $(q_j, p_j)$ using $p_i = \\frac{\\partial L}{\\partial \\dot{q}_i}$.

**Hamilton\'s Equations** (the canonical equations of motion):

$$\\dot{q}_i = \\frac{\\partial H}{\\partial p_i}, \\qquad \\dot{p}_i = -\\frac{\\partial H}{\\partial q_i}$$

**When is $H = T + V$?** Only when:
1. The kinetic energy $T$ is a homogeneous quadratic function of $\\dot{q}_i$ (i.e., $T = \\sum_{ij} a_{ij}(q) \\dot{q}_i \\dot{q}_j$), AND
2. The potential $V$ does not depend on velocities, AND
3. The coordinate transformation is time-independent.

If the transformation to generalized coordinates explicitly depends on time, then $H \\neq T + V$ — the Hamiltonian is the total energy only when $\\frac{\\partial L}{\\partial t} = 0$ (no explicit time dependence).`
      },
      {
        heading: '6. Symmetries & Noether\'s Theorem',
        content: `**Noether\'s Theorem**: Every continuous symmetry of the Lagrangian corresponds to a conserved quantity.

| Symmetry | Transformation | Conserved Quantity |
|----------|---------------|-------------------|
| Time translation | $t \\to t + \\epsilon$ | Energy $H = \\sum p_i \\dot{q}_i - L$ |
| Space translation | $x \\to x + \\epsilon$ | Linear momentum $p_x$ |
| Rotation | $\\theta \\to \\theta + \\epsilon$ | Angular momentum $L_z$ |
| Galilean boost | $v \\to v + \\epsilon$ | Center of mass motion |

**CSIR NET Application**: Given a Lagrangian, check which coordinates are cyclic → each gives a conserved momentum. Check if $\\frac{\\partial L}{\\partial t} = 0$ → energy is conserved. These two observations alone can solve 80% of Lagrangian mechanics problems without solving any differential equations!`
      }
    ],
    keyFormulas: [
      '\\frac{d}{dt}\\left(\\frac{\\partial L}{\\partial \\dot{q}_i}\\right) - \\frac{\\partial L}{\\partial q_i} = 0',
      'p_i = \\frac{\\partial L}{\\partial \\dot{q}_i}',
      'H = \\sum_i p_i \\dot{q}_i - L',
      '\\dot{q}_i = \\frac{\\partial H}{\\partial p_i}, \\quad \\dot{p}_i = -\\frac{\\partial H}{\\partial q_i}'
    ]
  }
];
