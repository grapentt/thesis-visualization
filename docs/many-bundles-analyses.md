# One space, many bundles: the full analyses and referee reports

The working material behind [many-bundles.md](many-bundles.md): three analyses
(A, B, C), each followed by an independent referee report. Where a referee
corrects an analysis, the referee wins; [many-bundles.md](many-bundles.md) has
the corrected, merged statements. Bead-model numbers here are for the earlier
cartoon geometry with O–N–O = 104° (see the note in many-bundles.md).

# Part A. The rotor U(1), and the bundles in one configuration space


### 0. Setup, notation, conventions

- **Atoms.** c = C₂ (the parent carbon), n = N (the vertex), a, b = the two lips (O, O). The **frame** F is every non-lip atom; it includes c and n. The masses mᵢ are positive. The mass-weighted metric is ⟨v, w⟩ = Σᵢ mᵢ vᵢ·wᵢ on X = ℝ³ᴺ.
- **Axis.** u(x) = (x_n − x_c)/|x_n − x_c|. It is defined on the open set X' = {x_c ≠ x_n}.
- **Lip coordinates.** For each lip, rᵢ = xᵢ − x_n. Split it as rᵢ = zᵢu + sᵢ with zᵢ = u·rᵢ (height along the axis) and sᵢ ⊥ u. Write ρᵢ = |sᵢ| (distance to the axis), and β for the signed angle from s_a to s_b about u.
- **Lip inertia.** I_u = m_aρ_a² + m_bρ_b² is the lips' moment of inertia about the axis. The weights are wᵢ = mᵢρᵢ²/I_u, with w_a + w_b = 1.
- **Rotations.** R_u(θ)v = cos θ v + sin θ u×v + (1 − cos θ)(u·v)u, a right-handed rotation about u.
- **Symmetric locus.** Σ = {m_a = m_b and r_b = R_u(π) r_a}: the C₂-symmetric, planar-type NO₂ local geometry. The drawn pose lies in Σ.
- **Connection conventions.** A principal U(1) connection A satisfies A(ξ) = 1 and Φ_θ*A = A. In a local trivialisation x = Φ_φ σ(b), A = dφ + σ*A. The holonomy of a loop is hol = −∮σ*A (mod 2π), which equals −∬F when the loop bounds a disc inside the gauge patch.
- **Centred configurations.** The video works on centred configurations. Turning the lips moves the centre of mass unless x ∈ Σ, so on X₀ = {Σmᵢxᵢ = 0} the rotor must be "turn, then recentre". This is legitimate because Φ_θ commutes with translations (R6). Every result below holds verbatim on X₀.

**Numerical checks.** Every formula marked as checked below was verified numerically:
- many-bundles-checks/rotor_checks.py
- many-bundles-checks/torsion_holonomy.py
- many-bundles-checks/coords_check.py
- many-bundles-checks/bisector.py

#### Corrections and refinements for the current video text (src/videos/bundles)

1. **Scene 04** writes "X = ℝ³ᴺ (centred)". On centred configurations the rotor must recentre, because it moves the centre of mass off Σ. Alternatively, work on ℝ³ᴺ with SE(3).
2. **Scene 05**, "Globally, no such choice exists". This is true on the whole free locus (R10b). It is false on the chemically accessible region, where the dihedral angle C₁–C₂–N–O₄ is a smooth global section. What never exists near planar NO₂ is a choice that treats the two identical O atoms symmetrically (R10d). Suggested wording: "There is no canonical choice. Over all configurations there is not even a continuous one."
3. **Scene 05, freeness.** "Free wherever one lip is off the axis" is correct on X. On shape space M you also need some frame atom off the C–N axis. Otherwise turning the lips is just a rigid rotation.
4. **"Lips don't turn".** The naive metric (mechanical) definition is not a principal connection for the rotor (R11a). The fix is short and is given in R11b.

---

### Part 1. The rotor action

#### R1. The rotor is a smooth U(1)-action on X'

**Definition.** For θ ∈ U(1) = ℝ/2πℤ, set (Φ_θ x)ᵢ = xᵢ for i ∉ {a, b} and (Φ_θ x)ᵢ = x_n + R_{u(x)}(θ)(xᵢ − x_n) for i ∈ {a, b}. Any point of the axis can serve as the pivot.

**Proposition.** Φ is a smooth action of U(1) on the open, dense, invariant set X'.

**Proof.**
- (θ, u) ↦ R_u(θ) is smooth by the formula, and u is smooth on X'. So (θ, x) ↦ Φ_θ x is smooth.
- Φ_θ fixes x_c and x_n, so u(Φ_θ x) = u(x) and X' is invariant.
- Hence Φ_ψ(Φ_θ x) rotates the lips by R_u(ψ)R_u(θ) = R_u(ψ + θ): the group law holds. Φ_0 = id, and Φ_θ is a diffeomorphism with inverse Φ_{−θ}. ∎

**Lemma (other axes).** Let the axis be any direction w = f(r_a, r_b) built from the moving atoms equivariantly, i.e. f(Qr_a, Qr_b) = Q f(r_a, r_b) for Q ∈ SO(3). Then rotating the lips about the line through x_n with direction w is again an action.

*Proof.* R_w(θ) fixes w, so f(R r_a, R r_b) = R f = f. The axis is invariant, and the group law follows as above. ∎

Two examples are the bisector w = (r̂_a + r̂_b)/|·| and the mouth midpoint w ∝ r_a + r_b. They agree when |r_a| = |r_b|. The bisector rotor is defined where r̂_a ≠ −r̂_b.

- The bisector rotor commutes with the C–N rotor. The C–N rotor moves the lips rigidly about N, and the bisector is equivariant (checked).
- The two rotors coincide on Σ, where w = u.
- Off Σ they differ. The C–N rotor preserves the bond angles C–N–O; the bisector rotor preserves O–N–O and each lip's angle to w, but not C–N–O.
- Physically, the C–N rotor is the torsion: a soft mode. The bisector rotor is a wag/rock and costs energy.

**Slide intuition.** "The axis is read off the molecule, but turning the lips does not move it. So turning by ψ and then by θ is turning by ψ + θ."

#### R2. Where the action is free

**Proposition.** The stabiliser of x ∈ X' is trivial if at least one lip is off the axis line, and all of U(1) if both lips are on it. There are no finite stabilisers.

**Proof.** For v ∉ ℝu, R_u(θ)v = v forces θ ≡ 0. ∎

The fixed set Fix = {s_a = s_b = 0} is a closed submanifold of codimension 4 in X'. Hence X_free = X' \ Fix is open, dense and connected. It is simply connected, because X' ≃ S² and removing a codimension-4 set does not change π₁.

**Slide intuition.** "If both lips lie on the axis, their circle shrinks to a point."

#### R3. X_free → X_free/U(1) is a principal U(1)-bundle

**Theorem.** B := X_free/U(1) is a smooth manifold of dimension 3N − 1, and π: X_free → B is a principal U(1)-bundle.

**Proof 1.** U(1) is compact, so the action is proper. A free proper smooth action has a smooth manifold quotient and π is a submersion: the Quotient Manifold Theorem (Lee, *Introduction to Smooth Manifolds*, 2nd ed., Thm 21.10). A free proper action is then a principal bundle.

**Proof 2 (explicit, and useful later).**
1. *Gauge field.* For a fixed unit vector k, let e_k(u) = (k − (k·u)u)/|·|. This is a smooth unit vector field ⊥ u on {u ≠ ±k}.
2. *Equivariant angle.* On U_{i,k} = {u ≠ ±k, sᵢ ≠ 0}, let f(x) ∈ S¹ be the angle of sᵢ measured from e_k(u) in the plane u^⊥, oriented by u. Then f(Φ_θ x) = f(x) + θ.
3. *Local product.* An equivariant map f: U → U(1) has df(ξ) = 1, so f is a submersion and S = f⁻¹(0) is a submanifold. The map U(1) × S → U, (θ, s) ↦ Φ_θ s, is an equivariant diffeomorphism with inverse x ↦ (f(x), Φ_{−f(x)} x).
4. *Covering.* The sets U_{i,k} with i ∈ {a, b} and k ∈ {e₁, e₂} cover X_free. The slices give compatible charts on B, with smooth transition maps s ↦ Φ_{−f'(s)} s. B is Hausdorff because the group is compact. ∎

**Slide intuition.** "Near any configuration, measure the lip angle from a reference direction. The space looks like (everything else) × (circle)."

#### R4. Energy invariance: what is exact and what is approximate

**Exact symmetries** of an isolated molecule's Born–Oppenheimer energy E:
- SE(3), indeed E(3) including reflections (R6 for how reflections act on the rotor).
- Permutations of identical nuclei.

The molecular symmetry group consists of the feasible permutations and permutation-inversions (Longuet-Higgins 1963). For nitromethane it is the group G₁₂ (as stated in the literature found).

**The rotor is not an exact symmetry.** E depends on the torsion through the rest of the molecule (for nitromethane, the CH₃ hydrogens).

**Proposition (exact discrete periodicity).** Let P swap the two identical lips.
- (i) P commutes with every Φ_φ, and on Σ, Φ_π = P.
- (ii) Hence for x ∈ Σ, V(φ) := E(Φ_φ x) satisfies V(φ + π) = V(φ).
- (iii) Suppose in addition the frame contains a C₃-symmetric methyl about the same axis, i.e. x lies in Σ_CH₃, where cycling the H labels equals rotating them by 2π/3. Then V(φ + 2π/3) = V(φ) as well, so V has period π/3: a sixfold barrier.

**Proof.**
- (i) The axis depends only on c and n. P permutes the two lips, which Φ_φ treats identically, so P commutes with Φ_φ. On Σ, r_b = R_u(π) r_a, so rotating both lips by π swaps their positions.
- (ii) E(Φ_{φ+π}x) = E(Φ_φ P x) = E(P Φ_φ x) = E(Φ_φ x).
- (iii) The NO₂ rotor by φ equals a global rotation about the C–N axis by φ composed with the CH₃ rotor by −φ. Both rotors use the same axis and fix c and n, so they commute. By SO(3)-invariance, E(Φ^{NO₂}_φ y) = E(Φ^{CH₃}_{−φ} y). On Σ_CH₃, the CH₃ rotor by −2π/3 is a permutation of the H atoms, so E(Φ^{NO₂}_{2π/3} y) = E(y). The NO₂ rotor never moves the H atoms, so Σ_CH₃ is preserved along the way. Finally, π and 2π/3 are both periods, so π − 2π/3 = π/3 is a period. ∎

This is the standard explanation of the sixfold barrier. The same argument applies to the relaxed torsion profile.

**Numbers.**
- Nitromethane: V₆ = 6.03 cal/mol ≈ 2.11 cm⁻¹ (Tannenbaum, Myers, Gwinn 1956; verified). Compare kT ≈ 207 cm⁻¹ at 298 K: an essentially free rotor.
- Nitroethane (the molecule in the animation) is less symmetric, so its profile may contain twofold terms. The published barriers disagree:
  - "extremely small" (≲ 5 cm⁻¹) from microwave work (Ekkers, Bauder, Günthard 1973);
  - about 120 cm⁻¹ (range 50–200) from electron diffraction (J. Mol. Struct. 2007).
  - UNVERIFIED in detail; I only saw abstracts.

**Does the bundle need energy invariance? No.**
- R1–R3 use only the group action on configurations. The bundle is pure kinematics.
- Energy invariance buys three things:
  - E descends to the base;
  - a conserved momentum (Noether);
  - dynamical meaning for a connection.

  The rotor has none of these exactly. See R5: it is not even a symmetry of the kinetic energy.

**Slide intuition.** "The bundle needs only the motion, not the energy. Invariance is what lets the energy live on the base. For SO(3) it is exact; for the nitro rotor it is nearly exact (barrier about 2 cm⁻¹, against thermal energy about 200 cm⁻¹)."

#### R5. The rotor is not an isometry of the kinetic metric

**Proposition.** No Φ_θ with θ ≢ 0 is an isometry of (X', mass metric).

**Proof.** Isometries of a Euclidean space are affine (Mazur–Ulam). Φ_θ is not affine: the rotation applied to the lips depends nonlinearly on x_c and x_n through u.

Concretely, take a variation δx that moves only x_c. Then dΦ_θ(δx) has nonzero lip components (∂_u R_u(θ)·δu) rᵢ unless rᵢ ∥ u, so |dΦ_θ δx|² > |δx|². (Checked: |v|² = 292.67 against |dΦ_θ v|² = 292.78 for a random vector.) ∎

**Consequences.**
- No Noether charge for the rotor.
- The metric-orthogonal complement of the rotor orbit is not U(1)-invariant, so it is not a principal connection (R11a).
- The SO(3) mechanical connection is not rotor-invariant either (checked: relative error about 13%, even on Σ).

By contrast, the global SO(3) action x ↦ (Qxᵢ)ᵢ is linear and orthogonal, which is why the SO(3) mechanical connection is canonical.

**Slide intuition.** "Rotating the whole molecule is a rigid motion of configuration space. Turning the lips is not, because which way they turn depends on where C and N are."

---

### Part 2. Commutation, the diamond, and the torsion loop

#### R6. Commutation

**Proposition.**
- (i) For g = (Q, t) ∈ SE(3), Φ_θ(gx) = g Φ_θ(x).
- (ii) For an improper Q (det Q = −1), Φ_θ(Qx) = Q Φ_{−θ}(x). So O(3) × U(1) is a semidirect product: a mirror reverses the sense of the torsion.
- (iii) Lip swap P commutes with Φ_θ.

**Proof.** u(gx) = Qu(x) and Q(a × b) = det(Q)(Qa × Qb), so R_{Qu}(θ) = Q R_u(det Q · θ) Qᵀ. Hence (Φ_θ gx)ᵢ = Qx_n + t + Q R_u(±θ) rᵢ. Part (iii) is R4(i). (All checked to machine precision.) ∎

**Lemma (several rotors; torsion torus).** Let rotor k have axis atoms D_k^ax and moving set S_k, and write D_k = D_k^ax ∪ S_k. Suppose:
- D₁ ∩ S₂ = ∅, and
- either D₂ ∩ S₁ = ∅ or D₂ ⊂ S₁ ∪ D₁^ax.

Then rotors 1 and 2 commute.

*Proof.* In the second case, rotor 1 acts on all of D₂ by one rigid motion g that fixes axis 1. By SE(3)-equivariance of rotor 2, rotor 2 after g is g ∘ rotor 2 on S₂ ⊂ S₁. In the first case the rotors are disjoint. ∎

For an acyclic bond graph, root the tree and let each bond rotate the side away from the root. The hypotheses then hold for every pair, so the k torsions generate a free-where-generic action of the torus Tᵏ. The hypotheses are sharp: rotating {D, E} about B–C does not commute with rotating {D} about A–E (checked numerically, defect 0.085). Rings break independence.

In nitromethane, the NO₂ rotor and the CH₃ rotor commute. Their diagonal is the global rotation about the C–N axis, so on M they induce inverse actions.

**Slide intuition.** "Rotate the molecule and then turn the lips, or turn and then rotate: same result, because the axis turns with the molecule."

#### R7. The bundles in X, and the action on shape space

**Proposition (freeness of the product).** SE(3) × U(1) acts on X'. The action is free exactly where:
- the frame is not collinear, i.e. some non-lip atom is off the C–N line; and
- some lip is off the axis.

If the whole frame lies on the axis, (R_u(−θ), θ) fixes x for every θ: the rotor is a rigid rotation in disguise.

**Proof.** If (Q, t)Φ_θ x = x, then (Q, t) fixes every frame atom, since Φ does not move them. A non-collinear frame forces (Q, t) = id, and then R2 forces θ = 0. ∎

**The bundles that live in X** (each over the open set where the relevant action is free):
- X → X/ℝ³ ≅ X₀. Trivial, with a canonical section (R10a).
- X₀ → M = X₀/SO(3), principal SO(3); free on non-collinear configurations.
- X → X/U(1), principal U(1); free on X_free.
- X → X/(SE(3) × U(1)).
- More generally, one bundle X → X/H for every closed subgroup H of SE(3) × Tᵏ.

**The diamond.**

```
              X
      U(1) /     \ SE(3)
     X/U(1)       M = X/SE(3)
      SE(3) \     / U(1)
        X/(SE(3)×U(1)) = M/U(1)
```

All four edges are principal bundles on the common free locus. The diamond commutes because both composites are quotients by the product group.

**U(1) descends to M.** Set Φ̄_θ[x] = [Φ_θ x].
- Well defined, by commutation.
- Smooth: π: X → M is a surjective submersion and Φ̄_θ ∘ π = π ∘ Φ_θ is smooth.
- Stabilisers are preserved, since gΦ_θ x = Φ_θ x ⇔ gx = x. So Φ̄ preserves the free part.

**Stabilisers on M.** Φ̄_θ[x] = [x] if and only if Φ_θ x = gx for some g ∈ SE(3). With a non-collinear frame this forces g = id and θ = 0, unless both lips are on the axis. With a collinear frame, every θ fixes [x].

So on M the rotor is a genuine shape change exactly when some frame atom is off the C–N axis. For a bare C–N–O₂ fragment it acts trivially.

**Slide intuition.** "One space carries all these bundles at once. On shape space, turning the lips is a change of shape, provided something else in the molecule can tell that the lips turned."

#### R8. Is the rotor generator SO(3)-horizontal? The torsion loop holonomy

**Angular momentum of the generator.** The generator is ξ_a = u × r_a, ξ_b = u × r_b, and zero elsewhere. Write d = x_n − X_cm and S = m_a r_a + m_b r_b. Then

J(ξ) = Σᵢ mᵢ(xᵢ − X_cm) × ξᵢ = I_N^{lips} u + d × (u × S),

where I_N^{lips} is the lips' inertia tensor about N. On Σ we have S = 2mz u and u is an eigenvector of I_N^{lips}, so

**J(ξ) = I_u u exactly, whatever the centre of mass** (checked).

So ξ is never SO(3)-horizontal: turning the lips carries angular momentum I_u about the axis. Its horizontal lift (the L = 0 torsion) is

ξʰ = ξ − Ω × (x − X_cm), with Ω = I_tot⁻¹ J(ξ).

On shape space the descended field ξ̄ is a shape direction. Its zero-angular-momentum realisation in X includes a counter-rotation of the whole molecule.

**Theorem ("bicycle wheel on a rotating stool").** Assume:
- (H1) x ∈ Σ (identical, C₂-symmetric lips);
- (H2) the frame's centre of mass lies on the C–N axis, and u is an eigenvector of the frame's inertia tensor. For example, the frame has an n-fold axis (n ≥ 2) along u, as CH₃ does in nitromethane.

Let I_u^F be the frame's moment about the axis and I_tot = I_u + I_u^F. Then the L = 0 lift of the torsion loop γ(φ) = [Φ_φ x], φ ∈ [0, 2π] in M, ends at Q·x with

**Q = R_u(−2π I_u/I_tot) = R_u(+2π I_u^F/I_tot).**

Along the way the frame turns by −φ I_u/I_tot and the lips by +φ I_u^F/I_tot.

**Proof.**
1. Write the lift as x(t) = Q(t) y(φ(t)), with y(φ) = Φ_φ x the body-frame shape. Then L = Q(I(φ)Ω_b + J(φ)φ̇), so L = 0 means Ω_b = −I(φ)⁻¹ J(φ) φ̇.
2. Under (H1) and (H2), every part has its centre of mass on the axis and u as a principal axis. A parallel-axis shift along u preserves that: (|d|² − d dᵀ)u = 0 for d ∥ u.
3. So I(φ)u = I_tot u. I_tot is constant because the rotor preserves distances to the axis, and J = I_u u by the computation above.
4. Hence Ω_b = −(I_u/I_tot) φ̇ u has a fixed direction. Integrating gives Q = R_u(−2π I_u/I_tot). ∎

When it is exact: under (H1), (H2) and the rigid-torsion assumption (only φ varies). Without (H2) one needs a path-ordered exponential, Q = P exp(−∫₀^{2π} I(φ)⁻¹ J dφ), and the axis tilts away from u.

**Numbers** (checked by integrating L = 0).

*Nitromethane.* Masses C 12, N 14, O 16, H 1. Approximate geometry: r_CN = 1.489, r_NO = 1.224, ∠ONO = 125.3°, r_CH = 1.088 Å, ∠HCN = 107.2°; these geometry values are from memory and not verified.
- I_u^{O₂} = 2·16·(1.224 sin 62.65°)² = 37.82 amu Å².
- I_u^{H₃} = 3·(1.088 sin 107.2°)² = 3.24 amu Å².
- I_u/I_tot = 0.921.
- Holonomy: R_u(+28.4°). The numerical result has axis exactly u, matching the formula.
- One full turn of NO₂ relative to CH₃ at L = 0: the methyl swings −331.6° (≡ +28.4°) and the heavy NO₂ only +28.4°.

*The animation's united-atom nitroethane.* X0 in shared.js, masses 15, 14, 14, 16, 16.
- (H2) fails: the CH₃ bead is off the axis.
- The naive formula would give 183.4°.
- The true holonomy is a rotation by 100.6° about an axis tilted 17.2° from u.
- J(ξ) = 29.58 u, exact on Σ.

**Slide intuition.** "Spin a wheel while sitting on a free swivel stool and the stool turns back. Turn the nitro group once with no angular momentum, and the molecule comes back rotated about the C–N bond."

---

### Part 3. What the base is ("a coarse-grained molecule?")

#### R9. The rotor quotient, the Hopf map, and the honest answer

**Invariants.** By the first fundamental theorem for U(1) acting on ℂ², the polynomial invariants of the lips' perpendicular parts are generated by |s_a|², |s_b|² and s̄_a s_b. Here s̄_a s_b := s_a·s_b + i u·(s_a × s_b), which needs no frame. Together with the frame positions and z_a, z_b, these are all the invariants.

**Theorem (structure of X_free/U(1)).** Let F' be the frame configurations with x_c ≠ x_n. Define the mass-weighted Hopf vector

h = (m_aρ_a² − m_bρ_b², 2√(m_a m_b) Re(s̄_a s_b), 2√(m_a m_b) Im(s̄_a s_b)) ∈ ℝ³ \ {0}.

Note |h| = I_u, and h = (m_aρ_a² − m_bρ_b², 2√(m_am_b)ρ_aρ_b cos β, 2√(m_am_b)ρ_aρ_b sin β).

Then x ↦ (frame, z_a, z_b, h) induces a diffeomorphism

**X_free/U(1) ≅ F' × ℝ² × (ℝ³ \ {0}) ≃ S²(bond direction) × S²(Hopf).**

**Proof.**
- The map is invariant, since sᵢ ↦ e^{iθ}sᵢ, and frame-independent.
- Fix u and choose a frame of u^⊥ ≅ ℂ. With ψᵢ = √mᵢ sᵢ, h is the Hopf map ℂ² \ 0 → ℝ³ \ 0, (ψ_a, ψ_b) ↦ (|ψ_a|² − |ψ_b|², 2ψ̄_aψ_b).
- The Hopf map is a surjective submersion whose fibres are exactly the U(1)-orbits.
- Hence the induced map on the quotient is a bijective local diffeomorphism. Locally in u it is id × (Hopf). ∎

**Answers to the "coarse-graining" questions.**
- *Is the base the configuration space of fewer beads?* Never. Its dimension is 3N − 1, which is not a multiple of 3.
- *What does the base remember?* All frame atoms, both heights z_a and z_b, and h, which encodes ρ_a, ρ_b and the relative angle β. The lips are smeared into two coaxial rings with a relative phase.
- *Is h a bead?* No. h is SO(3)-invariant, so it is not a position in physical space; it lives in an internal ℝ³.
- *On Σ:* the quotient is the frame plus one "ring bead" on the axis (height z, radius ρ). This is the closest the base comes to a coarse-grained molecule, and the bead is constrained to the axis.
- *SO(3), for comparison:* the base M has dimension 3N − 6 and is not a bead model either.

**What "splitting" buys.** X' ≅ F' × (r_a, r_b). U(1) acts only on the lip factor, through the axis map u: F' → S². So the rotor bundle is the pullback along u of a universal rotor bundle over S², defined by the rotor group alone (axis direction plus lips): E_univ = ℝ²(heights) ⊕ TS² ⊕ TS² minus the axis, with U(1) acting on TS² ⊗ ℂ².

- *Not a product on X.* u: F' → S² is a homotopy equivalence, and the S²-class is nonzero (R10b).
- *What splitting does not buy: the bundle.* If a lip were also bonded elsewhere (a ring), Φ would still be a free action and still a bundle. Rotating would just stretch bonds, so it would not be a soft mode.
- *What splitting does buy:*
  - (a) approximate energy invariance, i.e. physical relevance;
  - (b) commutation with the other torsions (R6 lemma), hence a torus Tᵏ and a clean diamond.

**Honest answer to "maybe it is not a bundle?"** It is always a principal bundle wherever it is free, for any choice of axis atoms and moving set. "Free" means exactly that the U(1) element relating two configurations in the same orbit is uniquely determined, which is the user's own criterion. What can fail:
- freeness at special configurations (lips on the axis; on M, a collinear frame), where one gets a stratified quotient instead of a bundle;
- physical relevance (energy not invariant);
- commutation with other rotors;
- global triviality.

**Slide intuition.** "Forget the rotor angle and each lip becomes a ring around the axis. The base remembers the rings' sizes and heights and the angle between the lips, but not where on the rings the lips sit. Coarser, but not a molecule with fewer beads."

---

### Part 4. Sections and triviality

#### R10. Translations, the rotor and SO(3)

**(a) Translations.** σ([x]) = x − X_cm(x) is a global smooth section of X → X/ℝ³.
- Well defined, since X_cm(x + t) = X_cm(x) + t.
- SO(3)-equivariant, and invariant under permutations of identical atoms.
- Any element-dependent weights would also give an equivariant section. The masses single out the centre of mass because the mechanical connection for translations is A_trans = dX_cm. It is flat, and its horizontal leaves {X_cm = const} are orthogonal to the translation fibres; the section is the leaf X_cm = 0.
- Structurally, ℝ³ is contractible, so every principal ℝ³-bundle over a paracompact base is trivial.

**(b) The rotor.**

*Local sections.* For a reference frame atom j off the axis, the dihedral τ = angle from s_j to s_a about u (that is, the dihedral j–C–N–O_a) is SO(3)-invariant and U(1)-equivariant: τ ∘ Φ_θ = τ + θ. So {τ = 0} is a section on R_{j,a} = {s_j ≠ 0, s_a ≠ 0}. It fails exactly where atom j or lip a crosses the C–N axis line.

*Chemically accessible region.* For example, nitroethane with C–C–N ≈ 110° and C–N–O ≈ 117–128°: C₁ and both O atoms never reach the axis. So the bundle is trivial there, on X and on M alike, via τ(C₁, C₂, N, O₄).

**Theorem (global nontriviality).**
- (i) X_free → X_free/U(1) has no continuous global section. Its Chern class is c₁ = (±2, ±1) on H²(S² × S²) = ℤ², the generators being the bond-direction sphere and the Hopf sphere.
- (ii) Assume p ≥ 1 frame atoms can leave the axis (p = N − 4). Then M_free → M_free/U(1) is nontrivial. Its base is homotopy equivalent to ℂP^{p−1} × ℂP¹, with c₁ = (±1, ±1).

**Proof.**

*(i), bond sphere.* Fix all frame atoms except N, with x_c = 0. Set x_n = u ∈ S², and put the lips at x_n + z u + ρ v and x_n + z u + ρ R_u(β) v, with v ∈ T_uS² a unit vector and z, ρ > 0, β fixed. This is a U(1)-equivariant embedding of the unit tangent bundle T¹S², with U(1) rotating v. An equivariant map of principal bundles identifies T¹S² → S² with the pullback. A global section of the rotor bundle would therefore pull back to a nowhere-vanishing vector field on S², contradicting the hairy-ball theorem. Euler number 2.

*(i), lip sphere.* Fix the frame. Let (s_a, s_b) range over {|ψ_a|² + |ψ_b|² = 1} ≅ S³, with the heights fixed. The rotor acts by scalar multiplication, so the pullback is the Hopf bundle S³ → S², which is nontrivial with c₁ = ±1. By R9, these two spheres generate H² of the base, which gives c₁.

*(ii).* Use SO(3) to set u = e_z with c at the origin. The residual SO(2) about z acts diagonally on the perpendicular parts F ∈ ℂ^p \ 0 (frame) and L ∈ ℂ² \ 0 (lips). The rotor multiplies L alone, so

M_free/U(1) ≃ (ℂ^p \ 0)/U(1) × (ℂ² \ 0)/U(1),

and the rotor bundle is (ℂ^p \ 0 × ℂ² \ 0)/U(1)_diag over it, with c₁ = (∓1, ±1). The lip sphere, with the frame fixed, is still Hopf. ∎

**Remark.** The bond-direction class dies on M: rotations can align u. But the bundle stays nontrivial because of lips (or frame atoms) passing through the axis. With p = 1 (the animation's molecule) the base is homotopy equivalent to ℂP¹, and the obstruction is purely "a lip crosses the axis". With p = 1 and only one lip, H–C–N–O style, the bundle is trivial: one dihedral works globally.

Also: c₁ ≠ 0 is not torsion, so by Chern–Weil every connection on the rotor bundle over X_free has curvature with ∫_{S²} F = 2π c₁. No choice of "lips don't turn" avoids holonomy.

**(c) SO(3) over shape space** (centred configurations; k = N − 1 Jacobi vectors).
- *N = 3: trivial.* Put ρ₁ along +e₁ and ρ₂ in the e₁e₂-plane with positive e₂-component. This defines a section on all non-collinear triangles. Shape space here is the open cone {Gram matrices with c² < ab}, which is contractible (Iwai 1987b; Littlejohn and Reinsch 1997, Sec. III.D, where the "xxy gauge" is exactly this section).
- *N ≥ 4: nontrivial.* Littlejohn and Reinsch 1997, Sec. III.D state this ("For n ≥ 4, globally smooth sections no longer exist"); I located the sentence in the paper. They give no proof there. A short proof:
  1. The total space W = ℝ^{3k} \ {rank ≤ 1} is the complement of a closed cone of dimension k + 2, i.e. codimension 2k − 2 ≥ 4.
  2. Hence W is simply connected.
  3. If W ≅ M × SO(3), the fibre inclusion would inject π₁(SO(3)) = ℤ/2 into π₁(W) = 0. Contradiction. ∎
- *By-product (Dirac-belt flavour).* For N ≥ 4, a rigid 2π rotation can be undone continuously through non-collinear shape wiggles. For triangles it cannot.
- *Practical frames.* The Eckart frame is a section only near its reference geometry. The principal-axes frame is singular where moments coincide, and is defined only up to sign flips. Over a realistic region that deformation-retracts to the torsion circle S¹, the SO(3)-bundle is trivial, because SO(3) is connected.

**(d) "No canonical section" is a separate, rigorous obstruction.**

**Proposition.** Take "canonical" to mean equivariant under permutations of identical nuclei.
- (i) There is no permutation-equivariant section of the SO(3)-bundle at any shape [x] with Px = Qx for some permutation P and some Q ∈ SO(3) \ {I}.
- (ii) There is no lip-swap-equivariant section of the rotor bundle through any point of Σ ∩ X_free. That is near the planar-NO₂ geometry of every nitro compound.

**Proof.**
- (i) P[x] = [x]. Equivariance gives σ([x]) = Pσ([x]). Writing σ([x]) = Rx, this reads Rx = PRx = RPx = RQx, so Qx = x, contradicting freeness.
- (ii) On Σ, P = Φ_π (R4). So σ(b) = Pσ(b) = Φ_π σ(b), contradicting freeness. ∎

The dihedral section uses "O₄" and "C₁"; it breaks this symmetry. For example, τ_b = τ_a + π on Σ. Symmetric data fix the angle only modulo π. The translation section, by contrast, is canonical.

Because the rotor is local, its obstruction needs only the local C₂ of the NO₂ group. The SO(3) obstruction needs a global point-group rotation; nitromethane at equilibrium (C_s) has none.

**(e) Evaluating "it only makes sense relative to where you started, because there is no global section".**
- *Exactly right.* Each fibre is a U(1)-torsor (or SO(3)-torsor): it has no origin, and only differences x' = Φ_θ x are meaningful. This holds whether or not a global section exists. Even the translation fibres are torsors; the centre of mass supplies a canonical origin.
- *Needs care.* "No global section" is a topological statement:
  - Rotor: true on X_free and on M_free; false on the chemically accessible region (dihedral angle).
  - SO(3): true for N ≥ 4 on non-collinear shapes; false for N = 3.
- *Better phrasing.* "There is no canonical origin on the fibre (unlike the centre of mass). Globally there is not even a continuous one."

**Slide intuition.** "An angle needs a reference. The centre of mass gives translations a natural one. For the lips you can measure from a neighbouring atom, but the two identical O atoms make every such choice arbitrary, and once atoms may pass through the axis, no continuous choice survives."

---

### Part 5. Connections for the rotor, and holonomy

#### R11. Which "lips don't turn"?

**(a) The metric connection is not principal.** A_orth(v) = ⟨ξ, v⟩/⟨ξ, ξ⟩ = (1/I_u) u·Σ_lips mᵢ rᵢ × vᵢ (absolute velocities) defines a complement to the orbits. It is not U(1)-invariant, because Φ is not an isometry (R5).
- Checked: Φ*A_orth − A_orth = 0.149 at a generic point.
- The vertex-relative variant A_naive = (1/I_u) u·Σ mᵢ rᵢ × (vᵢ − v_n), the "angular momentum about the axis relative to the vertex", also fails. Its defect is −(u·rᵢ)(R rᵢ − rᵢ)·ω per lip, which vanishes only if zᵢ = 0.
- **On Σ, A_orth = A_naive = A_LC as 1-forms on all of T_xX,** so all three are invariant there (proof below, after A_LC). The user's angular-momentum definition is correct for the symmetric NO₂ pose and wrong off it.

**(b) The invariant "axis-frame" connection.** With ω = u × u̇, the minimal (non-spinning) angular velocity that carries the axis, define

**A_LC(ẋ) = (1/I_u) Σ_{i∈{a,b}} mᵢ u·( rᵢ × (ṙᵢ − ω × rᵢ) ) = A_naive + (1/I_u) Σ mᵢ zᵢ (rᵢ·ω).**

In words: the lips' angular momentum about the axis, measured relative to the bond's non-spinning frame.

**Theorem.** A_LC is a principal connection on X_free → B that is invariant under SE(3) and under U(1).

**Proof.**
- A_LC(ξ) = Σ mᵢ|u × rᵢ|²/I_u = 1.
- U(1)-invariance. Under Φ_θ, u and ω are unchanged, since C and N and their velocities are untouched, and rᵢ ↦ Rrᵢ. Since R_{u(t)}(θ) depends only on u, Ṙ = [ω×, R]. So ṙ'ᵢ − ω × r'ᵢ = Rṙᵢ + ω × Rrᵢ − R(ω × rᵢ) − ω × Rrᵢ = R(ṙᵢ − ω × rᵢ). Finally u·(Rr × Rv) = u·(r × v), as Rᵀu = u.
- SE(3)-invariance: every vector rotates covariantly under constant Q. (Checked: invariance defect about 10⁻¹⁰.) ∎

*Why A_orth, A_naive and A_LC agree on Σ.* On Σ, Σmᵢrᵢ = 2mz u, which kills the extra term in A_orth, and Σ mᵢzᵢ(rᵢ·ω) = 2mz² u·ω = 0, which kills the extra term in A_naive.

*Metric interpretation.* A_LC is the mechanical connection of the modified, U(1)-invariant, positive-definite metric

g_LC(v, v) = Σ_frame mⱼ|vⱼ|² + Σ_lips mᵢ|ṙᵢ − ω × rᵢ|².

*Coordinates.* Let u = (ϑ, ϕ) be spherical angles, use the gauge e = e_ϑ, and let φ_a be the angle of s_a from e_ϑ. Then

**A_LC = dφ_a + w_b dβ + cos ϑ dϕ** (all nine coordinate components checked).

In general, with ψᵢ = √mᵢ sᵢ:

A_LC = Im⟨ψ, dψ⟩/|ψ|² + u*α_LC,

i.e. the Berry/tautological connection on ℂ² \ 0 → ℂP¹ plus the Levi-Civita connection of S² pulled back by u. Sign conventions vary.

**Curvature.**

**F = dw_b ∧ dβ − u*σ = ½ ĥ*σ − u*σ,**

where σ is the area form of the unit sphere and ĥ = h/|h|. Indeed w_b = (1 − cos χ)/2, with χ the polar angle of ĥ and β its azimuth. The integrals over the Hopf sphere and the bond sphere give c₁ = (1, −2), matching R10b.

**Holonomy.**

**hol = −½ Ω(ĥ-loop) + Ω(u-loop) (mod 2π).**

- *Bond phase: Foucault, spin-1-like.* If the C–N axis is swung around a cone of half-angle ϑ₀ while the lips are held rigid and "not turning", they come back turned by the enclosed solid angle 2π(1 − cos ϑ₀). Proof: hol = −∮cos ϑ₀ dϕ = −2π cos ϑ₀ ≡ 2π(1 − cos ϑ₀).
  - Checked by integration: 30° → 48.23°; **41.41° → 90.00°**; **60° → 180.00°** (for identical O atoms the mouth lands on itself with the lips swapped); 75° → 266.8°.
  - This is parallel transport on S², exactly the Foucault pendulum (Hart, Miller, Mills 1987). Zero spin about the axis means every perpendicular body vector obeys ṡ = −(u̇·s)u, which is Levi-Civita parallel transport.
- *Internal phase: falling-cat, spin-½-like.* With u fixed, horizontality means m_aρ_a²φ̇_a + m_bρ_b²φ̇_b = 0: the planar two-body cat in the plane ⊥ u.
  - Example (animation geometry: ρ = 0.961 Å, equal masses). Open β from π to π + 30°, pull lip b in to ρ_b = 0.60 Å, close back to π, push out again. Then Δφ_a = −Δβ (w_b(0.961) − w_b(0.60)) = −30° × (0.5 − 0.2805) ≈ −6.6°.

**(c) The relative connection on shape space.** A_LC(η × x) = u·η ≠ 0 (checked), so A_LC does not descend to M: global spin about the bond counts as the lips turning. Correct it with the same construction applied to the off-axis frame atoms,

A_F = (1/I_u^F) Σ_{j ∈ frame} mⱼ u·(rⱼ × (ṙⱼ − ω × rⱼ)), with I_u^F > 0 exactly when the frame is non-collinear,

and set A_M = A_LC − A_F.
- A_M is U(1)-invariant, A_M(ξ) = 1, and A_M vanishes on so(3) (checked to about 10⁻¹⁶). So it is a principal connection on M_free → M_free/U(1).
- In gauge: A_M = dτ₁ + w_b dβ − Σ_{j≥2} w^F_j dβ^F_j, where τ₁ is the dihedral (frame atom 1, C, N, O_a). The Levi-Civita term cancels.
- F_M = Ω_FS(lips) − Ω_FS(frame).
- **For rigid groups A_M = dτ₁ is flat:** "not turning relative to the rest" means "dihedral constant", and there is no shape-space holonomy.
- Rotor holonomy therefore needs either motion of the axis in the lab (the X picture: Foucault) or deformation of the rotor or frame (the cat term).
- For the animation's molecule (p = 1): A_M = dτ + w_b dβ and F_M = ½ĥ*σ exactly.

**(d) The product group SO(3) × U(1).** There is no canonical product connection.
- The SO(3) mechanical connection is not rotor-invariant (R5, checked), so the horizontal space {L = 0} ∩ {A_M = 0} is not U(1)-invariant.
- A principal (so(3) ⊕ u(1))-connection is obtained as (Ã, A_M), with Ā = ∫Φ_θ*A_mech dθ/2π (Haar average) and Ã = Ā − Ā(ξ) A_M.
- Equivalently, use the mechanical connection of the U(1)-averaged metric.
- Physically, L = 0 stays the canonical part; the rotor part is a choice.

**(e) Dynamics caveat.**
- For SO(3), horizontality is dynamically meaningful: L is conserved, so L = 0 motions stay horizontal.
- For the rotor it is a kinematic definition. A free rotor follows A_LC exactly only if it is an axially symmetric top. By Euler's equation, I₃ω̇₃ = (I₁ − I₂)ω₁ω₂. CH₃ is symmetric; NO₂ is not.
- The user's statement that "the connection must define what it means for the lips not to change" is therefore exactly right, and the choice is not canonical.

**Slide intuitions.**
- "Swing the C–N bond around a cone without twisting it, and the nitro group comes back turned by the cone's solid angle: Foucault's pendulum on a molecule. At 41° the turn is 90°."
- "Measured against the rest of the molecule, a rigid nitro group turns only if something changes shape."

#### R12. Remark: associated bundles and "the point could lie on the axis"

x ↦ s_a(x) satisfies s_a(Φ_θ x) = e^{iθ} s_a(x). So it is a section of the associated line bundle L = X_free ×_{U(1)} ℂ (charge 1).
- Where s_a ≠ 0, it determines the U(1) element; normalising it gives exactly the dihedral trivialisation.
- Its zeros are precisely the user's worry: "lip a on the rotation axis".
- Since c₁(L) ≠ 0, every such section must vanish somewhere (Poincaré–Hopf). On the bond sphere, s_a is a tangent field with total index 2; on the Hopf sphere it has a single zero.

So the failure is a property of the tracked point, not a difference between global and local symmetry. U(1) acts freely on ℂ \ 0, so one generic point suffices. SO(3) never acts freely on ℝ³ (a nonzero vector has stabiliser SO(2)), so one point never suffices and two non-parallel ones do.

**Slide intuition.** "One tracked lip fixes the angle, except when it sits on the axis, and topology forces it onto the axis somewhere: hairy ball for the bond sphere, Hopf for the lips."

---

### Key takeaways

1. **The bundle is kinematics.** The rotor is a smooth U(1)-action, free exactly where some lip is off the C–N axis. That alone makes X_free → X_free/U(1) a principal bundle; no energy invariance is needed.
2. **Commutation and the diamond.** The rotor commutes with SE(3) (a mirror flips the sense of θ) and with lip swap. Torsions in a tree commute and form a torus Tᵏ. The diamond X → X/U(1), M → M/U(1) is real, and on M the rotor is a shape change iff some frame atom is off the axis.
3. **Not a metric symmetry.** The rotor is not an isometry (it is not affine). Hence there is no Noether charge, and the metric "mechanical" connection is not principal. It agrees with the right one only on the symmetric NO₂ locus Σ.
4. **The right "lips don't turn" connection** is A_LC = dφ_a + w_b dβ + cos ϑ dϕ: lip angular momentum measured in the bond's non-spinning frame. Its curvature is F = ½ĥ*σ − u*σ, a spin-½ Berry phase of the Hopf vector minus the Foucault phase of the bond.
5. **Foucault example.** Swinging the bond around a cone returns the lips turned by the solid angle: 90° at a 41.4° half-angle, 180° at 60° (checked).
6. **Relative to the rest of the molecule,** the natural connection A_M is flat for rigid groups (dihedral constant). Shape-space rotor holonomy needs deformation (the falling-cat term).
7. **Bicycle wheel.** One L = 0 turn of the NO₂ group rotates the molecule by R_u(2π I_frame/I_tot), exactly under symmetric hypotheses: 28.4° for nitromethane. For the animation's asymmetric united-atom nitroethane it is 100.6° about an axis 17° from u.
8. **The base is not a smaller molecule.** It is frame × heights × ℝ³\0, through the mass-weighted Hopf map with |h| = I_u. The lips become rings with a relative phase; the dimension 3N − 1 is never 3K.
9. **Global triviality.**
   - Rotor: nontrivial on X_free (c₁ = (±2, ±1): hairy ball plus Hopf) and on M_free (Hopf). Trivial on the chemically accessible region via a dihedral angle.
   - SO(3): trivial for N = 3, nontrivial for N ≥ 4 (π₁ argument).
10. **"Canonical" is a separate question from "global".** No section can respect the swap of identical O atoms near planar NO₂, and no body frame can respect a permutation symmetry realised by a rotation. The centre of mass is canonical: permutation-invariant, SO(3)-equivariant, and the leaf of a flat connection.
11. **"Relative to where you started"** is the torsor property and holds always. "No global section" is topology, and depends on the region. Even a trivial bundle has no canonical trivialisation.
12. **The point on the axis is the obstruction.** A tracked lip is a section of the associated line bundle; it fails exactly on the axis, and Chern/Euler numbers count those axis crossings. Nitromethane's torsion barrier is exactly sixfold by permutation symmetry and tiny: V₆ ≈ 2.1 cm⁻¹ against kT ≈ 207 cm⁻¹.

### Literature

**Verified by web search** (existence, venue and the specific claims noted):
- R. G. Littlejohn, M. Reinsch, "Gauge fields in the separation of rotations and internal motions in the n-body problem", *Rev. Mod. Phys.* 69, 213–275 (1997), DOI 10.1103/RevModPhys.69.213. Sec. III.D (checked in the text): n = 3 bundle trivial (citing Iwai 1987b); for n ≥ 4 no globally smooth section; collinear configurations excluded; principal-axis gauge not globally smooth. [link](https://link.aps.org/doi/10.1103/RevModPhys.69.213); [pdf](https://chaosbook.org/library/LiRe97.pdf)
- A. Guichardet, "On rotation and vibration motions of molecules", *Ann. Inst. H. Poincaré Phys. Théor.* 40(3), 329–342 (1984). SO(3) principal bundle, mechanical connection, nonzero curvature. [EuDML](https://eudml.org/doc/76239)
- T. Iwai, "A geometric setting for internal motions of the quantum three-body system", *J. Math. Phys.* 28, 1315–1326 (1987), DOI 10.1063/1.527534. The triatomic bundle is trivial. [link](https://pubs.aip.org/aip/jmp/article-abstract/28/6/1315/227578/A-geometric-setting-for-internal-motions-of-the)
- T. Iwai, "A gauge theory for the quantum planar three-body problem", *J. Math. Phys.* 28, 964–974 (1987). Several sources mis-cite it as 28, 1315.
- T. Iwai, "A geometric setting for classical molecular dynamics", *Ann. Inst. H. Poincaré Phys. Théor.* 47, 199–219 (1987). [EuDML](https://eudml.org/doc/76377)
- D. G. Kendall, "Shape manifolds, Procrustean metrics, and complex projective spaces", *Bull. London Math. Soc.* 16, 81–121 (1984), DOI 10.1112/blms/16.2.81. [link](https://doi.org/10.1112/blms/16.2.81)
- A. Shapere, F. Wilczek, "Gauge kinematics of deformable bodies", *Am. J. Phys.* 57, 514–518 (1989), DOI 10.1119/1.15986.
- R. Montgomery, "Gauge theory of the falling cat", in *Dynamics and Control of Mechanical Systems*, Fields Inst. Commun. 1, 193–218 (AMS, 1993), DOI 10.1090/fic/001/09. [AMS](https://pubs.ams.org/ebooks/fic/001/)
- J. B. Hart, R. E. Miller, R. L. Mills, "A simple geometric model for visualizing the motion of a Foucault pendulum", *Am. J. Phys.* 55, 67–70 (1987), DOI 10.1119/1.14972. Parallel displacement. [ADS](https://ui.adsabs.harvard.edu/abs/1987AmJPh..55...67H/abstract)
- J. von Bergmann, H. von Bergmann, "Foucault pendulum through basic geometry", *Am. J. Phys.* 75, 888–892 (2007).
- E. Tannenbaum, R. D. Johnson, R. J. Myers, W. D. Gwinn, "Microwave spectrum and barrier to internal rotation of nitromethane", *J. Chem. Phys.* 22, 949 (1954), DOI 10.1063/1.1740230.
- E. Tannenbaum, R. J. Myers, W. D. Gwinn, "Microwave spectra, dipole moment, and barrier to internal rotation of CH₃NO₂ and CD₃NO₂", *J. Chem. Phys.* 25, 42–47 (1956), DOI 10.1063/1.1742845. V₆ = 6.03 cal/mol ≈ 2.11 cm⁻¹, consistent with later IR and mm-wave work. [link](https://pubs.aip.org/aip/jcp/article-abstract/25/1/42/204191/Microwave-Spectra-Dipole-Moment-and-Barrier-to); [mm-wave 2017](https://www.sciencedirect.com/science/article/abs/pii/S0022285217303673)
- H. C. Longuet-Higgins, "The symmetry groups of non-rigid molecules", *Mol. Phys.* 6, 445–460 (1963), DOI 10.1080/00268976300100501. [ADS](https://ui.adsabs.harvard.edu/abs/1963MolPh...6..445L/abstract)
- C. C. Lin, J. D. Swalen, "Internal rotation and microwave spectroscopy", *Rev. Mod. Phys.* 31, 841–892 (1959), DOI 10.1103/RevModPhys.31.841. General reference for internal-rotation Hamiltonians; its specific formulas were not checked.
- J. M. Lee, *Introduction to Smooth Manifolds*, 2nd ed., GTM 218 (Springer), Thm 21.10, the Quotient Manifold Theorem. Theorem number confirmed through citing papers. [Springer](https://link.springer.com/book/10.1007/978-1-4419-9982-5)
- C. Eckart, *Phys. Rev.* 47, 552 (1935). Confirmed via the Littlejohn–Reinsch bibliography.

**Partially verified (abstracts or secondary summaries only):**
- Nitroethane NO₂ torsion: microwave (Ekkers, Bauder, Günthard, *Chem. Phys. Lett.*, 1973), "nearly free", upper limit ≈ 5 cm⁻¹; electron diffraction plus quantum chemistry (*J. Mol. Struct.*, 2007), barrier about 120 cm⁻¹ (50–200). The two disagree. UNVERIFIED in detail. [microwave](https://www.sciencedirect.com/science/article/abs/pii/0009261473800867); [electron diffraction](https://www.sciencedirect.com/science/article/abs/pii/S0022286007002037)

**Standard textbooks, cited from memory and not re-verified (UNVERIFIED as to exact sections):**
- J. W. Milnor, J. D. Stasheff, *Characteristic Classes* (Princeton, 1974): Euler class, hairy ball.
- R. Bott, L. W. Tu, *Differential Forms in Algebraic Topology* (GTM 82): Chern–Weil, Hopf bundle.
- J. E. Marsden, T. S. Ratiu, *Introduction to Mechanics and Symmetry* (Springer, 1994): mechanical connection. Existence confirmed via the Littlejohn–Reinsch bibliography.
- J. E. Marsden, R. Montgomery, T. Ratiu, "Reduction, symmetry, and phases in mechanics", *Mem. AMS* 436 (1990). UNVERIFIED.

**Not taken from the literature.** These are my own results, each proved above:
- the axis-frame connection A_LC and its curvature formula F = ½ĥ*σ − u*σ;
- the Hopf-map description of X/U(1);
- the Chern classes of the rotor bundle;
- the permutation obstruction to canonical sections;
- the explicit π₁ proof for N ≥ 4.

I know of no source that states them in this form. Treat them as new, proved here, and worth having a second reader check.

---

# Part B. Associated bundles, coupling and the one-bead question


### Executive summary

1. **Building blocks.** E = P ×_SO(3) ℝ³ is the bundle of "positions relative to the molecule".
   - Every atom gives a tautological section s_i([x]) = [x, x_i] of E.
   - The shape is the isometry class of (s_1,…,s_N) in the fibre.
   - A configuration in space is a shape plus a frame of E: P is canonically the oriented orthonormal frame bundle of E.
   - The mechanical connection is the unique connection for which the atoms, seen as sections, carry no angular momentum: Σ m_i s_i × ∇s_i = 0.
2. **Coupling.**
   - Where the molecule is non-degenerate, the shape space of "molecule + k beads" *is* P ×_G ℝ^{3k}.
   - Parallel transport in this bundle means the beads stay at rest in the frame where the molecule moves with L = 0. After a loop of molecular shapes, the beads are rotated relative to the molecule by the inverse holonomy.
   - The molecule's connection, pulled back to the combined system, equals the combined system's mechanical connection exactly when the beads are massless.
   - Otherwise the correction is the beads' angular momentum relative to the L = 0 frame, divided by the total inertia. For example, a full NO₂ turn at zero angular momentum turns nitromethane by 28.4°; massless test particles would predict 0°.
3. **The doubt.** A probe records the orientation only up to its stabiliser.
   - SO(3) contains a rotation about the axis through *every* point. So a single bead is always on some axis: it records only a direction (2 of the 3 angles). Two non-collinear beads record everything.
   - The rotor's U(1) has only one axis, so one bead off that axis records the angle.
   - Whether the symmetry is global or local plays no role. A global planar SO(2) behaves like the rotor.
4. **The rotor's line bundle.**
   - The line bundle is the plane perpendicular to the C–N axis, attached to the rest of the molecule.
   - The lip projections into that plane are tautological sections. They vanish exactly on the non-free locus (lip on the axis).
   - On the sphere of axis directions the plane bundle is TS², with c₁ = 2 (hairy ball).
   - With flexible lips there is also a Hopf sphere with c₁ = ±1, and the rotor bundle is provably non-trivial.
5. **What a section and a connection mean.**
   - A section is a *reference* (zero) for the rotor angle.
   - A connection is a definition of "the lips are not changing". It is extra data.
   - The mass-metric choice is a genuine principal connection only at symmetric geometries. Otherwise it has to be averaged over U(1).

Status labels used below:
- **[P]** proved here, or a standard theorem with proof sketch.
- **[N]** checked numerically; scripts are listed at the end.
- **[O]** open or conjectural.

---

### 0. Set-up, conventions, standing facts

- **Atoms and metric.** There are N atoms with masses m_i > 0, total mass M = Σm_i. The configuration space is Q = {x ∈ (ℝ³)^N : Σ m_i x_i = 0} ≅ ℝ^{3N−3}, with the mass metric ⟨u,w⟩ = Σ m_i u_i·w_i.
- **Group.** G = SO(3) acts on the left by (Rx)_i = R x_i. Identify so(3) ≅ ℝ³ by ξ ↦ (v ↦ ξ × v). This is equivariant, since R(ξ×v) = Rξ × Rv, so Ad is the standard representation.
- **Inertia, angular momentum, connection.**
  - Locked inertia: I(x)ξ = Σ m_i x_i × (ξ × x_i).
  - Angular momentum: L(x,u) = Σ m_i x_i × u_i.
  - Mechanical connection: A_x(u) = I(x)⁻¹L(x,u).
  - Horizontal part: u^h = u − A_x(u) × x.
- **Associated bundles.** (x,f) ~ (gx, gf). This is Kobayashi–Nomizu's (p,f) ~ (pg, g⁻¹f) with the right action p·g := g⁻¹x.

**Lemma 0.1 (freeness) [P].**
- Stab(x) is trivial iff x_1,…,x_N span ≥ 2 dimensions.
- Stab(x) is SO(2) (rotations about the line) iff they span a line.
- Stab(x) is SO(3) iff x = 0.
- I(x) is invertible iff the span is ≥ 2-dimensional.

*Proof.* A rotation fixing two independent vectors fixes their cross product, so it is the identity. Rotations fixing a line are exactly the rotations about it. Finally, ξ·I(x)ξ = Σ m_i|ξ × x_i|², which vanishes for some ξ ≠ 0 iff every x_i ∥ ξ. ∎

**Lemma 0.2 [P].** Let P = {x ∈ Q non-collinear}. Then P → M = P/G is a smooth principal G-bundle with dim M = 3N−6 (for N ≥ 3). A is a principal connection whose horizontal space is H_x = V_x^⊥ = {u : L(x,u) = 0}.

*Proof.*
- The action is free (Lemma 0.1) and proper (G is compact), so the quotient manifold theorem applies.
- A_x(ξ×x) = I⁻¹Iξ = ξ.
- A_{Rx}(Ru) = (RIRᵀ)⁻¹RL = R A_x(u).
- ⟨ξ×x, u⟩ = ξ·L(x,u), so H_x = ker A = V_x^⊥. ∎

**Theorem 0.3 (global topology of the SO(3) bundle) [P].**
- (a) For N = 3, P → M is trivial.
- (b) For N ≥ 4, P and M are simply connected and P → M is **not** trivial: there is no global body frame. Hence E = P ×_G ℝ³ is a non-trivial vector bundle. Both statements still hold after removing collision configurations.

*Proof.*
- (a) Gram–Schmidt on (x₂−x₁, x₃−x₁), completed by their cross product, is a global section. For three points, non-collinear forces both vectors to be non-zero and independent.
- (b) In Jacobi coordinates Q ≅ {3×n matrices}, with n = N−1. The collinear set is {rank ≤ 1}, a finite union of submanifolds of dimension ≤ n+2, i.e. codimension 2n−2 = 2N−4 ≥ 4 for N ≥ 4. Removing closed submanifolds of codimension ≥ 3 from a simply connected manifold leaves it simply connected (by transversality), so π₁(P) = 0. Collisions x_i = x_j have codimension 3, so removing them changes nothing.
- If P were trivial, P ≅ M × SO(3) would give π₁(P) ⊇ π₁(SO(3)) = ℤ/2, a contradiction.
- The exact sequence π₁(P) → π₁(M) → π₀(SO(3)) = 0 gives π₁(M) = 0.
- If E were trivial, three everywhere-independent sections, made orthonormal and oriented, would give a section of its frame bundle, which is ≅ P (Theorem 1.5a). ∎

For nitromethane (N = 7) the degenerate set has codimension 10. The statement that the N = 4 bundle is non-trivial also appears in Alba–Lusanna–Pauri (2002); see the literature notes. Physically, a molecule explores a small neighbourhood of its equilibrium, where local sections (Eckart frames) exist. Iwai (1987) shows they exist but are not unique.

*Slide:* "Shape space has no global 'standard pose' for four or more atoms. Body frames are always local."

---

### 1. Associated bundles and tautological sections

**Definition 1.1.** For a smooth left G-manifold F, define P ×_G F := (P × F)/G with g·(x,f) = (gx, gf). Points are written [x,f], and π_F[x,f] = [x] ∈ M.

**Proposition 1.2 [P].** P ×_G F → M is a smooth fibre bundle with typical fibre F, for *any* smooth G-space F (the action on F need not be free).

*Proof.* G acts freely on P × F (it already does on the P factor) and properly (it is compact), so the quotient is a manifold. A local section σ: U → P gives the trivialisation U × F → π_F⁻¹(U), (m,f) ↦ [σ(m), f]. ∎

**Interpretation for F = ℝ³.** A point [x,v] is a bead at v placed alongside the molecule in pose x, with "rotating both together" identified. So [x,v] is the bead's position *relative to the molecule*. In a gauge σ, writing x = gσ([x]), the bead's body coordinates are g⁻¹v. Canonically, E_m ≅ Map_G(π⁻¹(m), ℝ³) via [x,v] ↦ (gx ↦ gv). A vector attached to the molecule is a rule that, for every pose of the molecule in space, says where the vector points, compatibly with rotations.

**Proposition 1.3 (sections ↔ equivariant maps) [P].** Smooth maps f: P → F with f(gx) = g f(x) correspond bijectively to smooth sections of P ×_G F, via s_f([x]) = [x, f(x)].

*Proof.*
- **Well defined:** [gx, f(gx)] = [gx, g f(x)] = [x, f(x)].
- **Smooth:** s_f ∘ π is smooth and π is a surjective submersion.
- **Inverse:** given s, for x ∈ P write s(π(x)) = [x, v]. Such v exists, since any representative is (gx, v') ~ (x, g⁻¹v'). It is unique: [x,v] = [x,w] means (x,w) = (gx, gv), so g = e by freeness and v = w. Set f(x) := v.
- **Equivariance:** s(π(gx)) = [x, f(x)] = [gx, g f(x)].
- **Smoothness of f:** in a local trivialisation, f(gσ(m)) = g φ(m) with φ smooth. ∎

**Corollary 1.4 (atoms are tautological sections) [P].**
- f_i(x) = x_i is equivariant, so s_i([x]) = [x, x_i] is a section of E := P ×_G ℝ³.
- The sections satisfy Σ m_i s_i = 0.
- At every point, the s_i together with their pairwise cross products span E.
- Other equivariant observables are sections of other associated bundles: the dipole moment is a section of E, the inertia tensor a section of Sym²E. This is the geometric content of "equivariant features".

**Theorem 1.5 ("the associated space gives the building blocks", made precise) [P].**
- **(a) Frame bundle.** E has a fibre metric ⟨[x,v],[x,w]⟩ := v·w, an orientation and a cross product, all well defined because G ⊂ SO(3). For x ∈ P, φ_x: ℝ³ → E_{[x]}, v ↦ [x,v], is an orientation-preserving isometry with φ_{gx} = φ_x ∘ g⁻¹. The map x ↦ φ_x is a G-equivariant diffeomorphism P → SO(E) onto the oriented orthonormal frame bundle, and x_i = φ_x⁻¹(s_i([x])).
  *So a configuration in space is its shape together with a frame "lab ℝ³ ← E_m", and the atoms are that frame applied to the tautological sections.*
- **(b) Shape from sections.** m = m' iff some orientation-preserving isometry E_m → E_{m'} carries s_i(m) to s_i(m') for all i. Hence internal coordinates are fibre invariants of the s_i:
  - bond lengths |s_i − s_j|;
  - bond angles;
  - dihedrals det(s_i−s_j, s_k−s_j, s_l−s_k) / norms.
  The Gram matrix ⟨s_i,s_j⟩ together with the triple products determines m.
- **(c) Global sections without a global frame.** The s_i are N global sections that, with their cross products, span E everywhere. Yet E is non-trivial for N ≥ 4 (Theorem 0.3). The building blocks are global, but no global frame can be assembled from them.

*Proof.*
- (a) Linearity and the isometry property are clear. Each fibre of P and each fibre of SO(E) is a G-torsor, and an equivariant map between torsors is bijective. Smoothness follows in local trivialisations. Finally, φ_x(x_i) = [x, x_i] = s_i([x]).
- (b) Write m = [x], m' = [x']. Every orientation-preserving isometry E_m → E_{m'} has the form φ_{x'} R φ_x⁻¹ with R ∈ SO(3). It maps s_i(m) to s_i(m') iff R x_i = x'_i for all i, i.e. iff m = m'. The Gram and triple-product statement is linear algebra: equal Gram matrices give an O(3) relation, triple products fix the sign when the span is 3-dimensional, and for planar configurations the reflection in their plane fixes them, so an SO(3) relation can always be chosen. ∎

**Proposition 1.6 (covariant derivative; characterisation of the mechanical connection) [P].** Let ∇ be the covariant derivative on E induced by A.
- (a) (∇_X s_f)([x]) = [x, df_x(X^h)], where X^h is the horizontal lift. In a gauge σ with a := σ*A and φ := f∘σ, this reads ∇φ = dφ − a × φ.
- (b) For atoms: ∇_X s_i = [x, (X^h)_i]. **The covariant derivative of an atom's section is that atom's velocity in the L = 0 frame.** Hence Σ m_i s_i × ∇s_i = 0.
- (c) **A is the unique principal connection with property (b).**

*Proof.*
- (a) Let x̃(t) = g(t)σ(c(t)) be horizontal. From A(ẋ̃) = 0 and A_{gx}(gu) = gA_x(u) one gets g⁻¹ġ = −a(ċ). Then (d/dt)[x̃, f(x̃)] = [σ, g⁻¹ġ φ + dφ(ċ)] = [σ, dφ(ċ) − a(ċ) × φ].
- (b) Apply (a) to f = f_i, and use L(x, u^h) = 0.
- (c) Any other connection is A' = A + β with β ∈ Ω¹(M; ad P) ≅ Ω¹(M; E). Then ∇'s = ∇s − β × s, so Σ m_i s_i × ∇'s_i = −Σ m_i s_i × (β × s_i) = −𝕀β, where 𝕀 is the inertia endomorphism of E. 𝕀 is positive definite on non-degenerate shapes, so β = 0. ∎

*Slide (Section 1):* "E is space *as seen from the molecule*. Each atom is a point in it that moves when the shape changes. The molecule in the lab is shape plus a frame. The connection is the one rule for which the atoms, seen from the molecule, carry no angular momentum."

---

### 2. Coupling: the shape space of the whole is a bundle over the shape space of a part

Add k beads with masses μ_a ≥ 0 and positions y_a. Fix translations by putting the *molecule's* centre of mass at 0. This is an SO(3)-equivariant identification of the translation-reduced space with Q × ℝ^{3k}. Shape spaces do not depend on which section of translations is chosen; the metric does, and is handled in Theorem 2.4.

**Theorem 2.1 [P].** Q̃₀ := P × ℝ^{3k} is an open, dense, G-invariant subset of the combined configuration space, consisting of non-collinear configurations. Its shape space is

  M̃₀ = Q̃₀/G = **P ×_G ℝ^{3k}**,

and the bundle projection is the forgetful map [x,y] ↦ [x].

The complement M̃ ∖ M̃₀ consists of shapes where the molecule is collinear but the whole is not. There, "forget the beads" is not a bundle: over a collinear molecular pose x the fibre is ℝ^{3k}/SO(2)_x, a cone of dimension 3k−1, and [x] is a singular point of ℝ^{3N}/G.

*Proof.* The first part is Definition 1.1 with F = ℝ^{3k}, together with Proposition 1.2. Proposition 1.2 needs freeness only on the *part*, which is exactly the hypothesis. The non-bundle locus is described by Lemma 0.1. ∎

This answers the user's "is the base a more coarse-grained molecule?" in one precise sense. **The shape space of the whole fibres over the shape space of any sub-molecule, exactly on the open set where that sub-molecule is non-collinear.**

**Proposition 2.2 (induced transport and holonomy) [P].**
- The horizontal spaces Hor_{[x,f]} := dq(H_x × {0}) define an Ehresmann connection on P ×_G F.
- Parallel transport along a curve c in M is t ↦ [x̃(t), f] with f *constant*, where x̃ is the horizontal lift.
- If x̃(1) = h·x̃(0) for a loop c, the transport sends [x₀, v] to [x₀, h⁻¹v]. So Hol_E(c) = ρ(h⁻¹) in the frame φ_{x₀}.
- Infinitesimally, the curvature acts on E by the rotation F(X,Y) × ·.

*Proof.* Hor is well defined by G-invariance of H. It is complementary to the fibre directions: dq(0 × TF) is vertical, and dq(ξ_P, 0) = −dq(0, ξ_F). Also d/dt q(x̃, f) = dq(ẋ̃, 0). Finally [h x₀, v] = [x₀, h⁻¹v]. ∎

*Precise wording.* "Held fixed in the molecule's L = 0 frame" means: when the molecule actually moves along x̃(t), with L = 0 in the lab, the beads are **at rest in the lab**. In a gauge, with x̃ = g(t)σ, their body coordinates g(t)⁻¹v rotate. After the loop the molecule has turned by h and the bead has not, so relative to the molecule the bead has turned by h⁻¹.

**Proposition 2.3 [P; N].** For any bead masses μ_a, the motion (x̃(t), y ≡ const) has zero total linear and angular momentum. It is therefore horizontal for the combined system's mechanical connection.

*Proof.* Total momentum is Σm_iẋ̃_i + 0 = 0. With zero total momentum, angular momentum does not depend on the reference point, and about 0 it equals L(x̃, ẋ̃) + 0 = 0. ∎ (Checked numerically: Ã = 0 to machine precision.)

**Theorem 2.4 (test-particle theorem) [P; N].** On P̃₀ → M̃₀ consider two principal connections:
- pr₁*A, "only the molecule's angular momentum counts";
- the true mechanical connection Ã of the (N+k)-body system: Ã = Ĩ⁻¹𝓛, with total inertia Ĩ and total angular momentum 𝓛 taken about the total centre of mass c. This is defined for μ_a ≥ 0 by the locked-inertia formula.

Then:
- (a) Ã = pr₁*A at (x,y) **iff μ_a y_a = 0 for every a**, i.e. every massive bead sits at the molecule's centre of mass. Hence **Ã = pr₁*A everywhere iff all beads are massless.**
- (b) Exactly: Ã(u,w) = Ω₀ + Ĩ⁻¹ 𝓛(u − Ω₀ × x, w − Ω₀ × y), where Ω₀ := A_x(u).
- (c) To first order in μ:

  Ã(u,w) = A_x(u) + I(x)⁻¹ Σ_a μ_a y_a × (w_a − Ω₀ × y_a) + O(μ²).

  In words: the correction is the beads' angular momentum relative to the frame rotating with Ω₀, divided by the inertia. This is the back-reaction (recoil).

*Proof.*
- pr₁*A is a connection: by Lemma 2.6 below.
- (b) 𝓛 is linear, and 𝓛(Ω × q) = ĨΩ, because the uniform part Ω × c contributes nothing about c.
- (a), direction ⇐: c = 0, the bead inertia vanishes, Σμ_a y_a × w_a = 0, so Ã = A.
- (a), direction ⇒: take u = 0. Then 𝓛(0,w) = Σ_a μ_a (y_a − c) × w_a, which must vanish for all w. So μ_a(y_a − c) = 0 for all a. Summing gives (M_tot − μ)c = Mc = 0, so c = 0 and μ_a y_a = 0.
- (c) Expand. The centre-of-mass shift contributes only at O(μ²). ∎

Numerically, the error after subtracting the first-order term behaves like O(μ²): 9.3·10⁻⁵, 1.4·10⁻⁶, 5·10⁻⁹ for μ = 10⁻¹, 10⁻², 10⁻³.

**Example 2.5 (nitromethane torsion: the back-reaction in numbers) [N].**
- **Model inputs.** Masses C 12, N 14, O 16, H 1. Geometry: C–N 1.489 Å, N–O 1.224 Å, ∠ONO 125.3°, C–H 1.088 Å, ∠HCN 107.2°. These are typical literature values, used as inputs and not independently verified.
- **Principal moments:** 41.06 (about the C–N axis), 47.72 and 85.54 amu Å². The C–N axis is a principal axis at every torsion angle, by the C₂ symmetry of NO₂ and the C₃ symmetry of CH₃.
- **Axial moments:** I_NO₂ = 37.82 and I_CH₃ = 3.24 amu Å².
- **Torsion loop.** Turn the NO₂ once (2π) relative to the CH₃ at zero total angular momentum, and treat the two O atoms as the "beads" coupled to the C,N,H₃ part.
  - Test-particle prediction (massless O): the part does not turn.
  - True result: CH₃ turns by −2π·37.82/41.06 = −331.6° and NO₂ by +28.4°. The shape is back, and the whole molecule has turned by **28.41° about the C–N axis**. Direct numerical integration of the mechanical connection gives 28.411°.
- **Rule:** holonomy per torsion turn = 2π·I_frame/(I_frame + I_top), with I_frame = I_CH₃ and I_top = I_NO₂ here.

**2.6 Natural maps between shape spaces and what connections induce [P].** Take the user's example, a 3-bead molecule A coupled to a 2-bead molecule B.
- **(i) Forgetful map** M_{A∪B} → M_A. A bundle with fibre ℝ^{3k} over the free part of M_A (Theorem 2.1).
- **(ii) Product map** M_{A∪B} → M_A × M_B, [x,y] ↦ ([x],[y]). Its fibre over ([x],[y]) with x free is G/Stab(y). For a triangle A and dumbbell B, Stab(y) = SO(2), so the fibre is S² (the dumbbell's direction relative to the triangle), times ℝ³ (B's centre of mass relative to A).
  Under transport (A moving horizontally, B at rest in A's L = 0 frame), B's own shape (its length) is invariant, because transport acts by elements of G. B's relative direction in S² is moved by the holonomy. For planar triangle loops the holonomy is a rotation about the plane normal, so only the dumbbell's azimuth changes.
- **(iii) Equivariant maps** Φ: Q_N → Q_K, for example linear coarse-graining (bead = weighted average of atoms).
- **(iv) Placement rules.** An equivariant f: P → ℝ^{3k} (a section of P ×_G ℝ^{3k}, "where the extra beads sit relative to the molecule") gives an embedding Ψ_f(x) = (x, f(x)).

**Lemma 2.6 (pullback) [P].** If Φ: P₁ → P₂ is G-equivariant and A₂ is a principal connection, then Φ*A₂ is a principal connection on P₁. Holonomy and curvature are natural: Hol_{Φ*A₂}(γ) = Hol_{A₂}(φ∘γ) and F_{Φ*A₂} = Φ*F_{A₂}.

*Proof.* Φ*A₂(ξ_{P₁}) = A₂(Φ_*ξ_{P₁}) = A₂(ξ_{P₂}) = ξ. Equivariance and naturality are immediate. ∎

So **a part's connection induces one on the whole** by pulling back along the forgetful map. This is pr₁*A, the test-particle connection.

**Proposition 2.7 (gluing = pulling back) [P].** If S ⊂ Q̃ is a G-invariant submanifold with free action, the mechanical connection of the constrained system (metric restricted to S) equals ι*Ã. In particular, for beads rigidly placed by a rule f:

  Ψ_f*Ã (u) = Ĩ(x, f(x))⁻¹ 𝓛(u, df_x(u)).

So **the whole's connection induces one on the part** once a placement rule is chosen.

*Proof.* The orbit directions are tangent to S, so the vertical spaces coincide. The orthogonal complement of the vertical space inside TS is TS ∩ V^⊥ = ker(Ã|_TS). ∎

**Proposition 2.8 (coarse-graining is not mechanical) [P].** For a coarse-graining map Φ, Φ*A_K = A_N fails as soon as some bead contains at least two atoms.

*Proof.* Rotate two atoms of one bead about their weighted centre. Then Φu = 0, so Φ*A_K(u) = 0, while L_N(x,u) ≠ 0. ∎

*Remark [P].* Connections form an affine space, so any G-equivariant average of connections is again a connection. This gives a rigorous way to build an "effective" connection by averaging pulled-back connections over bead placements.

*Slide (Section 2):* "Molecule plus extra beads = a bundle over the molecule's shapes. Loop the molecule's shape at zero angular momentum: a passive bead stays put in the lab, so seen from the molecule it has rotated by the holonomy. This is exact for massless beads; massive beads push back (NO₂ spinning once turns nitromethane by 28°)."

---

### 3. The doubt: one bead, the rotation axis, and global vs local

**Lemma 3.1 (torsors) [P].** If F is a G-torsor, then P ×_G F ≅ P over M. Concretely, P ×_G G ≅ P via [x,g] ↦ g⁻¹x, with inverse x ↦ [x,e]. A general torsor is ≅ G after choosing a base point.

**Lemma 3.2 [P].** For a closed subgroup H, P ×_G (G/H) ≅ P/H via [x, gH] ↦ H·g⁻¹x. Sections of P ×_G (G/H) correspond to reductions of the structure group to H.

*Proof.*
- Well defined: replacing g by gh gives H h⁻¹g⁻¹x = H g⁻¹x; replacing (x, gH) by (kx, kgH) gives H g⁻¹k⁻¹kx = H g⁻¹x.
- Inverse: Hx ↦ [x, H]. This is well defined since [hx, H] = [hx, hH] = [x, H].
- The reduction statement is classical (Kobayashi–Nomizu, Ch. I). ∎

**Proposition 3.3 (SO(3) probes) [P].**
- SO(3) on ℝ³: the orbit of v ≠ 0 is the sphere S²_{|v|} ≅ SO(3)/SO(2)_v, where SO(2)_v is the rotations about v. The orbit of 0 is a point.
- SO(3) on ℝ³ × ℝ³: an independent pair (v₁,v₂) has trivial stabiliser. Its orbit {(w₁,w₂) : |w_i| = |v_i|, w₁·w₂ = v₁·v₂} ≅ V₂(ℝ³) ≅ SO(3), via Gram–Schmidt plus cross product. A collinear pair (not both 0) has stabiliser SO(2).

So:
- one bead gives P ×_G S² ≅ P/SO(2): a direction, 2 of the 3 rotational degrees of freedom;
- two non-collinear beads give P ×_G V₂ ≅ P: the full orientation.

**Proposition 3.4 (U(1) probes) [P].** U(1) on ℂ: every z ≠ 0 has trivial stabiliser and its orbit is a circle (a torsor), so P ×_{U(1)} S¹_{|z|} ≅ P. Only z = 0, the axis, is fixed.

**Theorem 3.5 (what a probe records) [P].** For any G-space F and f ∈ F with H = Stab(f), the probe [x,f] determines x exactly up to H: P ×_G (G·f) ≅ P/H (Lemma 3.2). A probe records the full orientation iff Stab(f) = {e}. A necessary condition is dim G ≤ dim F; it is not sufficient, since ℝ³ has dimension 3 but no free SO(3)-orbits.

**Answer 3.6 to the doubt.** "One point could lie on the rotation axis" is the right instinct, aimed at the wrong axis. **For SO(3), every point v ≠ 0 lies on the axis through itself.** Rotations about that axis fix it, so one bead never suffices; this is not a special position. Two beads not on a common line through the centre do suffice. The rotor's U(1) contains rotations about **one** axis only, so any bead off that axis records the angle, and a bead on it records nothing.

| group acting on probe space | probe | stabiliser | what it records |
|---|---|---|---|
| SO(3) on ℝ³ | v ≠ 0 | SO(2) (rotations about v) | direction only, P/SO(2) |
| SO(3) on ℝ³ | v = 0 | SO(3) | nothing |
| SO(3) on (ℝ³)² | non-collinear pair | {e} | full orientation |
| SO(3) on (ℝ³)² | collinear pair | SO(2) | direction only |
| rotor U(1) on ℂ (plane ⊥ axis) | lip off axis | {e} | full angle |
| rotor U(1) on ℂ | lip on axis | U(1) | nothing |
| global SO(2), planar molecule rotating in its plane | bead ≠ centre | {e} | full angle (same as rotor) |
| local SO(3), e.g. sub-body on an ideal ball joint | one marker | SO(2) | direction only (same as global SO(3)) |

**Global vs local is irrelevant to this question.** What matters is the stabiliser of the probe. There is an exact parallel with the configurations themselves:
- SO(3) fails to act freely exactly when *all atoms lie on one axis* (the collinear set).
- The rotor fails to act freely exactly when *all moving atoms (lips) lie on its axis*.

Both are the statement "the moving points sit on a rotation axis". For SO(3) every line through the centre is an axis; for the rotor only one line is.

*Where global vs local genuinely differs* (used in Sections 4 and 5):
- (i) SO(3) is an exact symmetry of both the kinetic energy and the potential, so its mechanical connection is canonical. The rotor is at best an approximate symmetry of the potential and, in general, **not** a symmetry of the kinetic metric (Proposition 5.3).
- (ii) The non-free set has codimension 2N−4 for SO(3), but codimension 4 for the rotor, independent of N.
- (iii) The plane in which the rotor acts is carried by the rest of the molecule. Its "lab" is itself a vector bundle Π over the base (Section 4), whereas the lab ℝ³ of SO(3) is fixed.
- (iv) If the rest of the molecule lies on the rotor axis, the rotor *is* a subgroup of the global SO(3) and acts trivially on shape space (Lemma 4.2).

*Slide (Section 3):* "A marker records your orientation up to the symmetries that fix it. In 3D every point sits on an axis through itself, so one marker gives a direction and two give everything. A rotor has one axis, so one off-axis marker suffices. It's about axes, not global vs local."

---

### 4. The rotor U(1)-bundle and its associated line bundle

**Definition 4.1.**
- Lip atoms O₁, O₂, vertex N, parent C. The rotor acts on Q_ax = {x_C ≠ x_N} (translation-reduced).
- Axis direction: ê(x) = (x_N − x_C)/|x_N − x_C|.
- Action: ρ_θ(x)_O = x_N + R_{ê(x)}(θ)(x_O − x_N) for O ∈ {O₁, O₂}; all other atoms are fixed.
- The "stator" is all non-lip atoms, including C and N.

**Lemma 4.2 [P].**
- ρ is a smooth U(1)-action commuting with SE(3), since R R_ê(θ) Rᵀ = R_{Rê}(θ) for R ∈ SO(3). It therefore descends to shape space.
- On shape space, Stab_{U(1)}([x]) is trivial iff **(some lip is off the axis) and (the stator is not contained in the axis line)**. Otherwise it is all of U(1).
- Let M^♮ be the open set where U(1) acts freely, P_rot := M^♮ and B_rot := M^♮/U(1). Then P_rot → B_rot is a principal U(1)-bundle. No metric is needed for this.

*Proof.* Suppose Rx = ρ_θ x as configurations up to translation. Then R fixes all stator difference vectors.
- If the stator is non-collinear, R = I, and then θ = 0 provided some lip has a non-zero projection perpendicular to the axis.
- If the stator lies on the axis, R ∈ SO(2)_ê, and R = R_ê(θ) works for every θ. ∎

Example of the degenerate case: in F–NO₂, rotating the NO₂ is just an overall rotation, so there is no internal rotor.

**Proposition 4.3 (the rotor inside the part's constituent bundle) [P].**
- Let "part" = stator (C, N, H₃), assumed non-collinear, with bundle P_part → M_part and constituent bundle E_part.
- By Theorem 2.1, with the lips' displacements from N as fibre coordinates, M|_{part free} ≅ P_part ×_G (ℝ³)² = **E_part ⊕ E_part**.
- The axis ê is a tautological unit section of E_part. Put Π := ê^⊥ ⊂ E_part, a complex line bundle with J = ê × ·. Then E_part = ℝê ⊕ Π.
- So M|_{part free} ≅ ℝ² ⊕ Π ⊕ Π over M_part, and **the rotor is scalar multiplication by e^{iθ} on Π ⊕ Π**. It is free where (p₁, p₂) ≠ 0.
- Hence B_rot fibres over M_part with fibre ℝ² × ℝ_{>0} × ℂP¹. The ℂP¹ coordinate is p₂/p₁: its modulus is the ratio of the lips' distances from the axis, its argument the azimuth between the two N–O bonds about the axis (180° in planar NO₂).

*Proof.* The diagonal G-action on (ℝ³)² gives a Whitney sum. The rotor rotates the lip vectors about ê(m) inside each fibre E_m. ∎

Dimensions for nitromethane: dim M = 15, dim M_part = 9, fibre 6, dim B_rot = 14. Answer to "is the base a coarse-grained molecule?": B_rot is *not* the shape space of a smaller molecule. It is a bundle *over* the part's shape space, in which the lip angle has been forgotten.

**Theorem 4.4 (L is the plane perpendicular to the axis) [P].**
- **(a)** Over M_ax, Π is a complex line bundle with tautological sections p_O := (s_O − s_N) − ⟨s_O − s_N, ê⟩ê, the lip projections. **p_O vanishes exactly where lip O is on the axis.**
- **(b)** The rotor lifts to E by [x,v] ↦ [ρ_θ x, v]. This is well defined since ρ commutes with SO(3), and it preserves Π. Moreover p_O(ρ_θ m) = e^{iθ}·(lift of p_O(m)), while stator sections are invariant.
- **(c)** On {p₁ ≠ 0}, x ↦ p₁/|p₁| is a U(1)-equivariant isomorphism P_rot ≅ S(π*Π), where π: B_rot → M_part. So **each rotor fibre is literally the circle of lip directions in the plane perpendicular to the axis.**
- **(d)** With our convention, L := P_rot ×_{U(1)} ℂ ≅ (π*Π)* via [w,z] ↦ z w⁻¹. Check: [λw, λz] ↦ λz(λw)⁻¹ = z w⁻¹. For the dual representation (Kobayashi–Nomizu's (p,z) ~ (pλ, λ⁻¹z)), L ≅ π*Π. As real oriented planes these are the same plane with opposite orientations.
  Globally, L is the (dual of the) tautological line of ℙ(π*(Π ⊕ Π)). Lip 1 and lip 2 give two local identifications, differing by the transition function p₂/p₁.
- **(e)** The vector bundle Π ⊕ Π extends smoothly across the non-free locus as its zero section. The circle bundle collapses there. The line bundle is the "polar-coordinates completion" of the U(1)-bundle.

**Why the tautological section lives over M and not over B_rot** (the precise version of item 4). Atom positions *relative to the molecule* are functions of the SO(3)-shape, so the s_i descend to M = P/SO(3). The lip angle relative to the stator is *not* a function on B_rot, because B_rot forgets it. So the lip projection is a section of Π over M (equivalently, the tautological section of π*L over P_rot), exactly as the tautological line bundle over projective space has its canonical section only on the total space.

*Proof of 4.4.* (a) ê is a smooth unit section, so Π is a smooth rank-2 subbundle, and J² = −1 on ê^⊥. (b) [Rx, Rv] ↦ [ρRx, Rv] = [Rρx, Rv] = [ρx, v], and ê(ρx) = ê(x). (c) Both sides are U(1)-torsors over each point, and the map is equivariant. (d) The general identity S(W) ×_{U(1)} ℂ ≅ W*. (e) Proposition 4.3. ∎

**Proposition 4.5 (sphere of axis directions: TS², c₁ = 2, hairy ball) [P; N].**
- Hold CH₃ and NO₂ rigid and let only the direction ê of the C–N bond relative to CH₃ vary. In the stator gauge this gives a 2-sphere S_part ⊂ M_part. (N never meets an H, since 1.49 Å ≠ 1.09 Å; this sphere probes topology, not physically explored geometry.)
- Then **Π|_{S_part} ≅ TS²**, since Π at ê is ê^⊥ = T_ê S², and J = ê× is the standard complex structure.
- So c₁(Π|S) = χ(S²) = 2, and c₁(L|S) = ∓2 depending on convention (|c₁| = 2 is convention-free).
- For rigid symmetric NO₂ (p₂ = −p₁ ≠ 0), P_rot|_S ≅ S(TS²) = UTS² ≅ **SO(3)** ≅ ℝP³. The local rotor plus the axis direction reassemble the global rotation group. Consistently, c₁ = 2 gives π₁ = ℤ/2.
- **Hairy ball:** every section of Π|S vanishes somewhere, so **no continuous choice of "zero rotor angle" exists for all axis directions.**
- The standard dihedral (H–C–N–O) reference σ_H(ê) = v_H − (v_H·ê)ê vanishes exactly at ê = ±v̂_H (C–N parallel or antiparallel to C–H). Each zero has index +1 [N], total 2.
- With no stator (rigid C–NO₂ alone), the rotor *is* SO(2)_ê ⊂ SO(3), and the sphere is the lab sphere SO(3)/SO(2) = P ×_G (G/H) ≅ P/H (Lemma 3.2). This ties Section 3 to Section 4.

**Proposition 4.6 (flexible lips: Hopf sphere; which lip defines the angle?) [P].**
- In a fibre of Proposition 4.3, the sphere {|p₁|² + |p₂|² = r²} ⊂ ℂ² = Π_m ⊕ Π_m (axial components fixed, a₁ ≠ a₂ to avoid O–O collision) maps to ℂP¹ ⊂ B_rot, and **P_rot restricted to it is the Hopf bundle, c₁ = ±1.**
- "Angle via O₁" fails where p₁ = 0, "via O₂" fails where p₂ = 0, and the two differ by arg(p₂/p₁).
- **Pitfall:** "angle of the lips' centre of mass", p₁ + p₂, fails *exactly at the C₂-symmetric equilibrium* (p₂ = −p₁).
- For a C₂-symmetric group the natural invariant is q := Σ m_O p_O² ∈ Π^{⊗2}. It defines the doubled angle 2θ (that is, θ mod π, the identical-O symmetry). q vanishes only when the projected lip distribution is isotropic.
- The same q measures the rotor's perpendicular inertia anisotropy, which is what spoils kinetic-metric invariance (Proposition 5.3). For NO₂, q = 37.8 amu Å², i.e. maximally anisotropic.

**Theorem 4.7 (no global rotor gauge) [P].** For N ≥ 4, P_rot → B_rot is non-trivial: no global section, no global absolute rotor angle.

*Proof.*
- M is simply connected (Theorem 0.3).
- M^♮ = M minus {C = N} (codimension 3), minus {both lips on the axis} (codimension 4), minus {stator ⊂ axis} (codimension ≥ 6). These are semi-algebraic sets of codimension ≥ 3, so π₁(M^♮) = 0.
- The fibration exact sequence π₂(B_rot) →∂ π₁(U(1)) = ℤ → π₁(M^♮) = 0 makes ∂ surjective, so some 2-sphere in B_rot has c₁ = ±1. The Hopf sphere of Proposition 4.6 realises it. ∎

*Slide (Section 4):* "Replace the two lips by their shadows in the plane perpendicular to the C–N bond. The rotor fibre is the circle of shadow directions, and the plane is the associated line bundle. If the bond could point anywhere, that plane is the tangent plane of a sphere, and by the hairy-ball theorem no single 'zero angle' works everywhere."

---

### 5. Sections and connections: "tracking the rotor angle" and "the lips are not changing"

**5.1 Sections are references [P].**
- A non-vanishing local section σ of π*Π (equivalently of L, or a local section of P_rot) is a *reference direction* in the plane perpendicular to the axis, determined by the rest of the shape.
- The rotor angle is θ(x) := arg(p₁(x)/σ(b)). Example: the dihedral H–C–N–O, with σ = σ_H.
- Theorems 4.5 and 4.7 say every such reference fails somewhere. Only *relative* angles (relative to a reference, or to the starting point via transport) are global.
- Contrast:
  - translations have the global section "centre of mass" (every principal ℝ³-bundle is trivial because ℝ³ is contractible);
  - SO(3) has no global section for N ≥ 4 (Theorem 0.3).

**5.2 Covariant derivative [P].**
- In a gauge σ, with connection potential a_σ := σ*A_rot, sections of L or Π satisfy ∇ = d ± i a_σ (sign per the Theorem 4.4d convention).
- Along an actual motion x(t) over b(t), write x = e^{iθ}·σ̃(b). Then A_rot(ẋ) = θ̇ + a_σ(ḃ), so

  θ̇ = A_rot(ẋ) − a_σ(ḃ).

- **"The lips are not changing" means A_rot(ẋ) = 0**, i.e. ∇p₁ = 0 along the base curve. The measured dihedral then still drifts by −∫a_σ, forced purely by geometry.

**Proposition 5.3 (the connection is extra data, and the natural one is only nearly principal) [P; N].**
- **(a)** ρ is **not** an isometry of the mass metric, nor of the reduced metric on M. Numerically, |dρ u|² ≠ |u|² for random u (e.g. 119.2 vs 147.9). The kinetic energy of a unit-rate tilt of the C–NO₂ fragment about N is 37.27 at lip angle 0° and 18.36 at 90° (amu Å² rad²/s²). Cause: the NO₂ inertia about N is anisotropic perpendicular to the axis: 37.82 (about the axis), 10.12 (in-plane perpendicular), 47.94 (normal), in amu Å².
- **(b)** The mass-orthogonal complement of the rotor orbits in (M, g_M) has connection form

  A_rot^mech(u) = ℓ(u^h)/ℓ(ζ^h),  where ℓ(v) := ê · Σ_O m_O (x_O − x_N) × v_O,

  ζ is the rotor generator, and u^h is the SO(3)-horizontal lift. It satisfies A(ζ) = 1, so it is always an Ehresmann connection. It is U(1)-invariant, hence a principal connection, at geometries with **C₂-symmetric lips and a stator making ê a principal axis** (e.g. C₃-symmetric CH₃): agreement to ~10⁻⁶. Breaking either symmetry breaks invariance (e.g. 0.133 vs 0.199; 2.571 vs 2.541).
  *Proof sketch at the symmetric locus:* ê is principal for the lips and for the whole, and the lips' centre of mass is on the axis. Then ζ^h = ζ − (I_top/I_∥) ê × (x − c), with |ζ^h|²/|ζ|² = I_frame/I_∥ (checked: 0.0789). Every ingredient (ℓ, I_∥, c) is ρ-invariant; the cancellation for ℓ uses Σ m_O(ê·r_O) r_O⊥ = 0.
- **(c)** The U(1)-average Ā := (1/2π)∫ρ_θ*A_rot^mech dθ is a genuine principal connection agreeing with A^mech on the symmetric locus. Averaging works because ρ_θ*A(ζ) = 1 (U(1) is abelian, so ζ is ρ-invariant).
- **(d)** Any two principal connections differ by a 1-form β on B_rot, and their holonomies by exp(i∮β).

Conclusion: the user's "not obviously canonical — that is what the connection must define" is correct. **[O]** Which choice is physically right off the symmetric locus is a modelling question, e.g. averaging versus a reduced rigid-frame/symmetric-top model. In the rigid frame + C₃ top model (CH₃ as the top), the torsion shift is an isometry.

**Proposition 5.4 (characterisation, parallel to Proposition 1.6) [P].** On the symmetric locus, A_rot^mech-horizontal is equivalent to

  Σ_O m_O ⟨J p_O, ∇p_O⟩ = 0,

with ∇ the SO(3) mechanical covariant derivative on E. In words: **the lips have zero angular momentum about the rotor axis, measured in the molecule's L = 0 frame.** It is the unique U(1)-connection with this property where Σ m_O|p_O|² > 0, i.e. on the free locus.

*Proof.* ⟨u^h, ζ^h⟩ = ⟨u^h, ζ⟩ = ℓ(u^h). By Proposition 1.6, ∇(s_O − s_N) = u^h_O − u^h_N. The axial correction terms cancel by C₂ symmetry, Σ(ê·r_O)⟨Jp_O, ∇ê⟩ = 0. Uniqueness: a shift by β changes the expression by (Σ m_O|p_O|²)β. ∎

The structure is the same as for SO(3): "invertible locked inertia ⟺ free action ⟺ connection uniquely determined by a zero-momentum condition."

**Proposition 5.5 (heavy-stator limit: Levi-Civita, solid-angle holonomy) [P; N].**
- Fix the stator in space and swing the C–N axis while the rigid symmetric NO₂ follows.
- Horizontal ⟺ ê·ω = 0 (no spin about the axis), because ê is principal for the lips and their centre of mass is on the axis.
- Then ḟ = (ê × ê̇) × f = −ê(ê̇·f), which is normal to the sphere. So **the lip direction is Levi-Civita parallel on TS², curvature = area form, and holonomy = the enclosed solid angle.**
- Numbers: a cone of half-angle α returns the lips rotated by 2π(1 − cos α), in the same sense as the loop. α = 30° gives 48.23°; α = 60° gives 180.00°. The total curvature 4π = 2π·c₁ is consistent with Proposition 4.5.

**Proposition 5.6 (flat-but-singular vs smooth-but-curved) [P].** "Keep the dihedral constant" is the flat connection of the reference σ_H. It is defined only away from the zeros of σ_H, where it has vortices. By Poincaré–Hopf for line bundles, their indices sum to c₁ = 2: the two unit vortices at C–H ∥ ±C–N carry all of the curvature.
Topology forces a choice. A reference-defined notion of "unchanged" must be singular somewhere; a smooth one (mechanical) must be curved.

*Slide (Section 5):* "A section is a choice of zero for the rotor angle, and topology forbids a perfect one. A connection says what 'the lips didn't turn' means: zero lip angular momentum about the axis. That is a physical choice, and only then do holonomies like 'swing the bond around a cone, lips turn by the solid angle' follow."

---

### 6. Key take-aways

1. The associated bundle E = P ×_SO(3) ℝ³ is space as seen from the molecule. Atoms are its tautological sections s_i([x]) = [x, x_i], and internal coordinates are fibre invariants of the s_i.
2. P is the frame bundle of E: a molecule in the lab is shape plus frame, and x_i = φ_x⁻¹(s_i). That is the precise sense of "building blocks".
3. The mechanical connection is the unique connection with Σ m_i s_i × ∇s_i = 0, and ∇s_i is atom i's velocity in the L = 0 frame.
4. Coupling theorem: where a sub-molecule is non-collinear, the whole shape space is P_part ×_G ℝ^{3k}, a bundle over the part's shapes. It fails to be a bundle exactly over the part's degenerate shapes.
5. Associated transport means extra beads at rest in the L = 0 frame. After a shape loop with holonomy h, a bead sits at h⁻¹v relative to the molecule.
6. The test-particle connection pr₁*A equals the true combined connection iff the beads are massless. The correction is the beads' relative angular momentum over the total inertia (nitromethane torsion: 28.4° instead of 0°).
7. Part → whole: pull back along the forgetful map. Whole → part: pull back along a placement rule, which gives the constrained system's true mechanical connection. Coarse-graining is never mechanical once a bead contains two atoms.
8. One probe records the orientation modulo its stabiliser: P ×_G (G/H) ≅ P/H. SO(3) needs two non-collinear beads, since every point is on its own axis. U(1) needs one off-axis bead. Global vs local plays no role.
9. The rotor's line bundle is the plane perpendicular to the C–N axis, attached to the stator. Lip projections are tautological sections vanishing exactly on the non-free locus, and the circle bundle is the bundle of lip directions in that plane.
10. Topology: the plane bundle over the sphere of axis directions is TS² with c₁ = 2 (hairy ball), and the rigid-NO₂ rotor bundle over it is SO(3) itself. Flexible lips add a Hopf sphere (c₁ = ±1). Both the rotor bundle (always) and the SO(3) bundle (N ≥ 4) have no global section, while translations do (centre of mass).
11. Do not define the rotor angle by the lips' centre of mass: it lies on the axis at the symmetric equilibrium. Use one lip or the doubled-angle invariant q = Σ m p² ∈ Π^{⊗2}.
12. The rotor connection is a modelling choice. The mass-metric choice is principal only at symmetric geometries (otherwise average over U(1)), and in the heavy-stator limit it reduces to Levi-Civita on TS² (holonomy = solid angle).

---

### 7. Literature

Verified means the bibliographic data and the stated content were confirmed by search. Content claims about specific sections not visible in search results are marked.

- S. Kobayashi, K. Nomizu, *Foundations of Differential Geometry, Vol. I*, Interscience/Wiley, 1963 (Wiley Classics 1996). Verified bibliographically ([Wiley](https://www.wiley.com/en-us/Foundations+of+Differential+Geometry%2C+Volume+1-p-9780471157335), [Wikipedia](https://en.wikipedia.org/wiki/Foundations_of_Differential_Geometry)). Location of associated bundles (Ch. I §5), reductions, and tensorial forms / sections ↔ equivariant maps (Ch. II §5): **UNVERIFIED section numbers**.
- R. Montgomery, *A Tour of Subriemannian Geometries, Their Geodesics and Applications*, AMS Math. Surveys and Monographs 91, 2002, doi:10.1090/surv/091. Verified ([AMS](https://www.ams.org/books/surv/091/)). Ch. 14 "Falling, swimming, and orbiting" and App. A "Geometric mechanics" confirmed from the table of contents.
- R. Montgomery, "Gauge theory of the falling cat", in *Dynamics and Control of Mechanical Systems* (M. Enos, ed.), Fields Inst. Commun. 1, AMS, 1993, pp. 193–218, doi:10.1090/fic/001/09. Verified ([Semantic Scholar](https://www.semanticscholar.org/paper/Gauge-theory-of-the-falling-cat-Montgomery/a9e063e5bc89d3251c6c1c188e4304ac5c9ff520)).
- J. E. Marsden, *Lectures on Mechanics*, LMS Lecture Note Series 174, Cambridge UP, 1992. Verified ([free PDF](https://www.cds.caltech.edu/~marsden/volume/LecturesOnMechanics/lom.pdf), [review](https://onlinelibrary.wiley.com/doi/10.1002/zamm.19940741010)). §3.3 "The Mechanical Connection" and the locked-inertia formula confirmed.
- J. E. Marsden, R. Montgomery, T. Ratiu, "Reduction, symmetry, and phases in mechanics", Mem. AMS 88 (1990), no. 436, doi:10.1090/memo/0436. Verified ([AMS](https://www.ams.org/books/memo/0436/)).
- H. Cendra, J. E. Marsden, T. S. Ratiu, "Lagrangian reduction by stages", Mem. AMS 152 (2001), no. 722, doi:10.1090/memo/0722. Verified ([PDF](https://www.cds.caltech.edu/~marsden/bib/2001/06-CeMaRa2001/CeMaRa2001.pdf)). Connections and covariant derivatives on reduced bundles; the reduction-by-stages context for "whole over part" (Section 2).
- R. G. Littlejohn, M. Reinsch, "Gauge fields in the separation of rotations and internal motions in the n-body problem", Rev. Mod. Phys. 69, 213–275 (1997), doi:10.1103/RevModPhys.69.213. Verified ([PDF](https://chaosbook.org/library/LiRe97.pdf)).
- A. Shapere, F. Wilczek, "Gauge kinematics of deformable bodies", Am. J. Phys. 57, 514–518 (1989), doi:10.1119/1.15986. Verified ([Wilczek publication list](https://web.mit.edu/~csuggs/www/new06PUB-FW.pdf)).
- A. Guichardet, "On rotation and vibration motions of molecules", Ann. Inst. H. Poincaré Phys. Théor. 40(3), 329–342 (1984). Verified ([EuDML](https://eudml.org/doc/76239)): principal SO(3)-bundle, mechanical connection, zero-angular-momentum curves.
- T. Iwai, "A geometric setting for classical molecular dynamics", Ann. Inst. H. Poincaré Phys. Théor. 47(2), 199–219 (1987). Verified ([Numdam](https://www.numdam.org/item/AIHPA_1987__47_2_199_0.pdf)): Eckart frame exists but is not unique.
- K. A. Mitchell, R. G. Littlejohn, "Kinematic orbits and the structure of the internal space for systems of five or more bodies", J. Phys. A 33(7) (2000), doi:10.1088/0305-4470/33/7/309, arXiv:physics/9910001. Verified ([arXiv](https://arxiv.org/abs/physics/9910001)). Frame singularities; triviality of bundles over kinematic orbits left open.
- D. Alba, L. Lusanna, M. Pauri, "Centers of mass and rotational kinematics for the relativistic N-body problem in the rest-frame instant form", J. Math. Phys. 43, 1677–1727 (2002), doi:10.1063/1.1435424, arXiv:hep-th/0102087. Verified bibliographically ([arXiv](https://arxiv.org/abs/hep-th/0102087)). The phrase "N = 4 non-trivial SO(3) principal bundle" appears in the body according to a search snippet, but not in the abstract: **location UNVERIFIED**. Theorem 0.3 above is proved independently.
- J. Milnor, J. Stasheff, *Characteristic Classes*, Ann. of Math. Studies 76, Princeton UP, 1974. Verified bibliographically ([TOC/PDF](https://www.sas.rochester.edu/mth/sites/doug-ravenel/otherpapers/milnor-stasheff2.pdf)). Euler class = Euler characteristic (Ch. 11; **corollary number UNVERIFIED**); used for c₁(TS²) = 2.
- C. C. Lin, J. D. Swalen, "Internal rotation and microwave spectroscopy", Rev. Mod. Phys. 31, 841–892 (1959), doi:10.1103/RevModPhys.31.841. Verified ([APS](https://link.aps.org/doi/10.1103/RevModPhys.31.841)). Standard reference for torsion Hamiltonians, frame + top models.
- Nitromethane barrier:
  - E. Tannenbaum, R. J. Myers, W. D. Gwinn, J. Chem. Phys. 25, 42–47 (1956), doi:10.1063/1.1742845: **V₆ = 6.03 ± 0.03 cal/mol** (CH₃NO₂), V₁₂ < 0.05 cal/mol. Verified via the abstract ([AIP](https://pubs.aip.org/aip/jcp/article-abstract/25/1/42/204191/Microwave-Spectra-Dipole-Moment-and-Barrier-to?redirectedFrom=fulltext)).
  - The 1954 paper (Tannenbaum, Johnson, Myers, Gwinn, J. Chem. Phys. 22, 949, doi:10.1063/1.1740230) introduced the sixfold model; secondary sources sometimes attribute 6.03 cal/mol to it.
  - Conversion: 6.03 cal/mol = 25.2 J/mol ≈ 2.1 cm⁻¹ ≈ 0.01 k_BT at 300 K, so the rotor is essentially free.
  - Caution: a 2023 J. Phys. Chem. A paper misprints the barrier as "6 kcal/mol".

---

### Numerical checks

Scripts:
- many-bundles-checks/checks.py
- many-bundles-checks/cone.py

They check:
- nitromethane inertia and the 28.41° torsion holonomy (closed form and ODE integration);
- Proposition 2.3 (Ã = 0 for beads at rest);
- the O(μ²) accuracy of Theorem 2.4(c);
- the rotor's non-isometry and the tilt kinetic-energy ratio;
- U(1)-invariance of the rotor connection on and off the symmetric locus;
- indices +1, +1 of the dihedral reference field on S²;
- cone holonomy equal to the solid angle.

---

# Part C. Brownian motion, holonomy and curvature


### 0. Conventions

- **Brownian motion (BM).** Standard BM has generator ½Δ, so E[dxⁱdxʲ] = δⁱʲ dt. Two conversions:
  - Physics convention, E[dx²] = 2D dt per coordinate: replace t by 2Dt.
  - Generator Δ: replace t by 2t.
- **Lévy area.** A_t = ½∫₀ᵗ (x dy − y dx). The Itô and Stratonovich integrals agree here, because d⟨x,y⟩ = 0.
  - Geometric meaning: A_t is the signed area enclosed by the path together with its straight chord back to the start.
  - Lévy's 1950 note is titled after exactly this, "l'aire comprise entre un arc … et sa corde".
- **Part 0 model.** P = ℝ³ → ℝ², ω = dz − (λ/2)(x dy − y dx).
  - Horizontal lift: dz = (λ/2)(x dy − y dx). This is exactly `horizontalLift` in `src/videos/part-0/shared.js`.
  - Curvature: dω = −λ dx∧dy. A counter-clockwise loop enclosing area S lifts with a vertical gap of +λS.
  - The video uses λ = 0.5 (`TWIST` in `bundleBox.js`).
- **General setting.**
  - π: P → M is a principal G-bundle with connection ω and curvature Ω = dω + ½[ω∧ω].
  - In an orthonormal frame, Ω_ij = Ω(e_i, e_j) ∈ 𝔤. For G = SO(3), identify 𝔤 ≅ ℝ³; then Ω_ij is a rotation (angular-velocity vector) per unit area.
  - |Ω|² := Σ_{i<j} |Ω_ij|² is the pointwise Yang–Mills energy density.
  - The locked inertia tensor is ⟨ξ,η⟩_u = g(ξ*_u, η*_u), written |·|_I.
- **Brownian loop of duration t at p.** The Brownian bridge from p to p in time t.
- **Rotation vector.** Θ = log(hol) ∈ 𝔤, using the principal log, so |Θ| ∈ [0, π].
- **Status tags:**
  - [Proved]: complete proof given.
  - [Sketch]: argument a careful reader can complete.
  - [Cited]: standard result with a reference.
  - [Derived here]: I did not find it stated in the literature.
  - [Heuristic]: not proved.
  - [MC]: checked by Monte Carlo (scripts are listed at the end).

---

### Key take-aways

1. **Exact planar result.** In the Part 0 model, the vertical displacement of the horizontal lift of planar BM is exactly λ × Lévy's stochastic area.
2. **Lévy's formulas.**
   - Free BM: E e^{iμA_t} = 1/cosh(μt/2), so E A² = t²/4.
   - Brownian loop: E e^{iμA_t} = (μt/2)/sinh(μt/2), so E A² = t²/12.
   - Hence E cos θ = (λt/2)/sinh(λt/2) for loops.
3. **The mean is zero; curvature shows up in the spread.**
   - The mean rotation of a Brownian loop is exactly zero: E Θ = 0 for every t and every bundle, by time reversal.
   - The mean square is E|Θ|² = (t²/12)|Ω|² + O(t³).
   - The rms rotation therefore grows like t: rms angle = |curvature| × rms area, and the rms area is t/√12.
4. **Only loops are gauge invariant.** For open paths the "orientation change" depends on the section (the body-frame convention).
   - In the planar model the mean square is t²/4 in the symmetric gauge and t²/2 in the Landau gauge.
   - The symmetric gauge ("close the path by its chord") gives the smallest mean square of all gauges.
   - For N ≥ 4 atoms there is no global section of ℝ^{3N}_{non-collinear} → M at all (proof in C3).
5. **The nonabelian constant is c = 1/24.** E[hol] = I + (t²/24) Σ_{i<j} Ω_ij² + O(t³), with generator ½Δ (c = 1/6 for generator Δ).
   - It is negative semidefinite: averaging contracts the holonomy.
   - It agrees with Gilkey's heat coefficient (1/12)Ω_ijΩ_ij and with Arnaudon–Thalmaier (order 4 in the bridge scale for loops). [MC] for SO(3).
6. **A Brownian loop is not a planar loop.** It sweeps uncorrelated areas of variance t²/12 in all n(n−1)/2 coordinate planes at once. That is why the answer is a sum over planes (a trace) and not a single sectional value.
7. **"Ricci or scalar?"** The quantity is the Yang–Mills density |Ω|². By O'Neill (no total-geodesy assumption needed for horizontal planes): K_M(X,Y) = K_P(X̃,Ỹ) + ¾|Ω(X,Y)|²_I.
   - Molecules (P flat, mass metric): K_shape = ¾|Ω|²_I = 3 J·I⁻¹J ≥ 0, with J = Σ m_a u_a×v_a.
   - Scalar curvature: s_M = (3/2) Σ_{i<j} |Ω_ij|²_I.
   - Brownian link: E[Θ·IΘ] = t² s_M(p)/18 + O(t³). So inertia-weighted Brownian holonomy measures the scalar curvature of shape space.
8. **Long times depend on confinement and global geometry.**
   - Free planar BM: ballistic (θ_t/t has a fixed sech law).
   - CPⁿ (singular gauge): θ_t/t → Cauchy (Baudoin–Wang).
   - Confined shapes (Ornstein–Uhlenbeck, OU, or CHⁿ): diffusive.
9. **OU result.** With dx = −kx dt + √(2D) dW, the drift cancels in x dy − y dx and A_t is a martingale.
   - Var A_t = Dσ² t exactly for a stationary start, with σ² = D/k.
   - D_rot = ½λ²Dσ² = λ²D²/(2k). [MC]
   - General rule [Derived here]: D_rot = D² Σ_{i<j} Ω_ijΩ_ijᵀ/(k_i + k_j), where k_i are the relaxation rates of the shape modes. Gauge choice does not affect D_rot.
10. **Physics literature.** Rotation at L = 0 driven by internal noise or chaos is established numerically and theoretically: Katz–Efrati PRL 2019, Silva–Efrati 2025, Español–Thachuk–de la Torre 2023.
    - Silva–Efrati find the same ballistic→diffusive picture with a quadratic confinement; their open-path ⟨A²⟩ agrees with my formula.
    - I did not find the closed formulas D_rot = D⟨F, G_V F⟩ or D_rot = λ²D²/(k₁+k₂) stated anywhere.
11. **Numbers for the actual bead model (nitroethane, `bundles/shared.js`).**
    - |Ω|² = 7.2×10⁻³ rad²/(amu Å²)².
    - s_M = 0.55 (amu Å²)⁻¹.
    - One full turn of the NO₂ rotor at L = 0 rotates the whole molecule by 100.6° (that is, −259.4°) about an axis 17° off the C–N bond. This is checked by two independent methods.
12. **Side finding for the U(1) analyses.** The rotor U(1) action is not an isometry of the mass metric. "Orthogonal to the rotor orbits" therefore does not define a principal U(1)-connection, and the O'Neill identities above hold for SO(3) only.

---

### C1. Exact: holonomy = λ × Lévy area [Proved, MC]

**Statement.** Let B = (x,y) be any continuous semimartingale in ℝ² from 0. Its Stratonovich horizontal lift in the Part 0 model satisfies

z_t − z_0 = λ A_t, with A_t = ½∫(x∘dy − y∘dx).

For BM the Stratonovich and Itô integrals coincide, because the correction ½ d⟨x,y⟩ − ½ d⟨y,x⟩ is 0.

**Proof.** The horizontal lift solves the Stratonovich equation dz = (λ/2)(x∘dy − y∘dx). Integrate.

**Slide.** "Walk randomly in the plane and stay horizontal. Your height is λ times the area you have swept around the start."

### C2. Lévy's formulas [Cited: Lévy 1951; proof sketch below; MC]

Standard BM from 0, t > 0, μ ∈ ℝ.

| | Characteristic function E e^{iμA_t} | Density of A_t | E A_t² | E cos(λA_t) |
|---|---|---|---|---|
| Free BM | 1/cosh(μt/2) | (1/t) sech(πa/t) | t²/4 | 1/cosh(λt/2) |
| Loop (bridge to 0) | (μt/2)/sinh(μt/2) | (π/2t) sech²(πa/t) | t²/12 | (λt/2)/sinh(λt/2) |

Conditional on the endpoint B_t = z:

E[e^{iμA_t} | B_t = z] = (μt/2)/sinh(μt/2) · exp(−(|z|²/2t)((μt/2) coth(μt/2) − 1)).

This agrees with Baudoin–Wang eq. (1.1) after their S = 2A.

- **Moments.** E A = 0 by reflection symmetry. The free second moment follows from Itô's isometry: E A² = ¼∫E|B_s|² ds = ¼∫2s ds = t²/4. Expanding the characteristic functions gives the rest: 1/cosh u ≈ 1 − u²/2 gives t²/4, and u/sinh u ≈ 1 − u²/6 gives t²/12. The loop law is logistic with exponential tails, P(|A| > a) ≈ 2e^{−2πa/t}.
- **Proof of the characteristic function (Yor's argument).**
  1. Write A_t = ½∫|B| dβ, where β = ∫(x dy − y dx)/|B| is a BM independent of the radial process |B|. Indeed (β, ∫(x dx + y dy)/|B|) is a planar BM by Lévy's characterisation, and |B| is a strong solution driven by the second component.
  2. Hence, conditionally on |B|, A_t ~ N(0, ¼∫|B|²).
  3. So E e^{iμA} = E exp(−(μ²/8)∫|B|²) = [E exp(−(μ²/8)∫b²)]², with b a one-dimensional BM.
  4. Cameron–Martin gives E exp(−(c²/2)∫₀ᵗ b²) = (cosh ct)^{−1/2}; Mehler gives (ct/sinh ct)^{1/2} for the bridge. Take c = μ/2.
- **Heat-kernel meaning (the Gaveau link).** The loop characteristic function is the ratio of diagonal heat kernels for a charged particle in a constant magnetic field B = μ (Landau/Mehler): (μt/2)/sinh(μt/2) = p^{(B=μ)}_t(0,0)/p_t(0,0). Equivalently, the joint process (B_t, A_t) is horizontal BM on the Heisenberg group (Gaveau 1977). Its sub-Laplacian heat kernel is the Fourier transform in the fibre variable of these magnetic kernels.
- **Holonomy.** θ = λA. For loops: E θ = 0, E θ² = λ²t²/12, E cos θ = (λt/2)/sinh(λt/2) = 1 − λ²t²/24 + O(t⁴).

**Slide.** "A random loop rotates you by a random amount, as often left as right. The curvature sets the spread: rms rotation = λ × rms area = λ t/√12."

### C3. Gauge: open paths versus loops; no global body frame [Proved]

1. **Gauge dependence.** A change of section s ↦ s·e^{if} changes the open-path displacement to θ_f = λA_t + f(B_t) − f(0). Only loops (B_t = B_0) are gauge invariant. Examples:
   - Symmetric gauge: E θ² = λ²t²/4.
   - Landau gauge (A = dz − λx dy): E θ² = λ²∫E x² = λ²t²/2. [MC: 0.2485 vs 0.25 and 0.4952 vs 0.5 at t = 1, λ = 1]
2. **The symmetric gauge minimises the mean square.** Among all gauges with f(0) = 0:
   - E[(λA + f(B_t))²] = λ²E A² + E f(B_t)², because E[A | B_t] = 0.
   - E[A | B_t] = 0 holds because the conditional characteristic function above is real; equivalently, reflect across the line through 0 and B_t.
   - So "close the open path by the shortest return (the chord)" is the canonical, minimal-variance convention. On a curved shape space it becomes the geodesic-closure rule used for open-path geometric phases (Krishna–Samuel–Sinha 2000).
3. **Molecules.** "How much did the molecule turn along an open path" requires a body-frame convention σ: M → P (Eckart frame, principal axes, …). For N ≥ 4 no continuous global convention exists:
   - Let P_nc be the non-collinear configurations with the centre of mass at 0, inside ℝ^{3(N−1)}.
   - The collinear set has dimension N + 1, hence codimension 2N − 4 ≥ 4. So P_nc is simply connected (general position for loops and discs).
   - SO(3) acts freely and properly on P_nc, so P_nc → M_nc is a principal bundle.
   - If it were trivial, P_nc ≅ M_nc × SO(3) would have π₁ ⊇ ℤ/2, a contradiction. ∎
   - For N = 3 the bundle is trivial: M_nc is contractible, and the Gram–Schmidt frame of the two Jacobi vectors is a global section.
   - Translations always have the global section given by the centre of mass, as the user says.
4. **Long times.** If shapes stay confined, f(B_t) − f(B_0) stays bounded, so long-time diffusion coefficients do not depend on the gauge (C9).

**Slide.** "Only a closed loop of shapes has a convention-free rotation. For an open path, close it the shortest way home."

### C4. Small Brownian loops on a general bundle: the constant c [Sketch + Cited + MC]

**Setting.** M is a Riemannian n-manifold. P → M is a principal G-bundle (G compact) with connection ω. ρ is a unitary or orthogonal representation and E = P ×_ρ V, with curvature F_ij ∈ End(V). H_t is the stochastic (Stratonovich) parallel transport around the Brownian loop of duration t at p (generator ½Δ_M), acting on E_p.

**Theorem.**

(i) E H_t = E H_t⁻¹. Consequently E Θ_t = 0 exactly, for all t, as long as Θ is defined; this fails only for the probability-zero event |Θ| = π.

(ii) E H_t = I + (t²/24) Σ_{i<j} F_ij² + O(t³). Here F_ij² ≤ 0, so the mean holonomy contracts. Equivalently, E H_t = p^E_t(p,p)/p_t(p,p).

(iii) For SO(3) on ℝ³:
- E[Θ Θᵀ] = (t²/12) Σ_{i<j} Ω_ij Ω_ijᵀ + O(t³);
- E|Θ|² = (t²/12)|Ω|² + O(t³);
- E[1 − cos|Θ|] = (t²/24)|Ω|² + O(t³).

**Proof sketch.**

- **(i) Reversal.** The bridge measure from p to p is invariant under time reversal, because the heat kernel is symmetric. Stratonovich transport along the reversed path is the inverse transport. In particular E∮η = 0 for every 1-form η.
- **(ii) Dyson expansion.** Write H = I − ∮A + S₂ − …, where S₂ = ∬_{s<u} A_u A_s.
  1. The first-order term vanishes by (i).
  2. Under reversal, S₂ ↦ S₂^{rev}, and S₂ + S₂^{rev} = (∮A)². Hence E S₂ = ½ E(∮A)² exactly.
  3. In normal coordinates and radial (Fock–Schwinger) gauge, A_i = ½xʲF_ji(p) + O(|x|²). So ∮A = Σ_{i<j} F_ij a^{ij} + O(t^{3/2}), where a^{ij} = ½∮(xⁱdxʲ − xʲdxⁱ).
  4. In normal coordinates the bridge is √t × a flat Brownian bridge, up to relative corrections of order O(t).
  5. Flat bridge: E[a^{ij}a^{kl}] = (t²/12) δ_{(ij),(kl)}. Different planes are uncorrelated by reflecting one coordinate.
  6. Hence E H = I + ½(t²/12) Σ F_ij² + R. Every half-integer-order part of R vanishes by the parity x ↦ −x of the leading Gaussian, so R = O(t³).
- **Rigorous cross-check.** The Feynman–Kac–Itô formula gives p^E_t(p,p) = p_t(p,p) E[H_t⁻¹] (Hsu; Driver–Thalmaier; Bismut). Vassilevich's eq. (4.27) gives the a₄ coefficient for D = −(∇² + E) and e^{−tD}, verified in the PDF text: (1/360)·tr(… + 30 Ω_ijΩ_ij), summed over all ordered pairs i, j. The a₁ = R/6 terms are identical on E and M and cancel in the ratio. So for generator Δ, E H = I + (t²/12) Σ_{i,j} F_ijF_ij = I + (t²/6) Σ_{i<j}; replacing t by t/2 for generator ½Δ gives 1/24. Vassilevich states the traced coefficient; the untraced (endomorphism-valued) version follows from the same computation, or from the direct argument above.
- **Abelian check.** F₁₂² = −λ², and (λt/2)/sinh(λt/2) = 1 − λ²t²/24 + … ✓.
- **(iii)** Take the symmetric part of E H, using H = I + [Θ]_× + ½[Θ]_×² + O(|Θ|³) and E|Θ|³ = O(t³).
- **Monte Carlo.** Constant so(3) curvature in ℝ³, Σ|Ω_ij|² = 3.75. Simulated E|Θ|² against the prediction:
  - t = 0.05: 7.78e−4 vs 7.81e−4;
  - t = 0.1: 3.06e−3 vs 3.13e−3;
  - t = 0.2: 1.232e−2 vs 1.250e−2.
  - The symmetric part of E H − I matches (t²/24)ΣΩ_ij² entry by entry.
- **Literature consistency.** Arnaudon–Thalmaier (Ann. Probab. 2003) expand transport along small rescaled bridges and show the order-ε³ drift vanishes iff the connection is Yang–Mills. Here ε is the bridge scale, t = ε². For loops there is no ε³ term at all (no direction is available to contract ∇F against), so the first nonzero term is order ε⁴ = t², which is the term above.
- **Lattice analogy (standard).** A Wilson plaquette of side a has 1 − Re U_p ≈ ½a⁴F² for U(1), and 1 − (1/N) Re tr U_p ∝ a⁴ tr F² for SU(N) (Wilson 1974). A Brownian loop behaves like a random plaquette with rms area t/√12 in every plane at once: E[1 − cos θ] = ½|Ω|² E a² = (t²/24)|Ω|².

**Slide.** "A random loop of duration t sweeps random areas of size about t/√12 in every plane of shape space at once. Each plane turns its area into rotation at the rate set by the curvature. The averages cancel and the squares add: mean-square rotation = (t²/12) × (sum of squared curvatures)."

**On the user's "I walked a loop spanning a plane".**
- In dimension ≥ 3, BM does not return exactly to its starting point (points are polar). The right objects are bridges, or returns to within ε followed by geodesic closure.
- A Brownian loop is not planar; it spans all planes at once. That is why a trace appears.

### C5. Mean zero, spread ~ curvature × time: the precise version [Proved]

- E θ = 0 holds exactly (C4(i)). "Average rotation" is therefore not the right observable; the mean square is.
- In the planar model: E θ²/E A² = λ² exactly, so curvature = rms rotation / rms area.
- Since the rms area of a Brownian loop is t/√12, the rms rotation is |λ| t/√12. "Divide by time" is right for the rms angle, not for the variance.
- Free BM: Var θ = λ²t²/4 (symmetric gauge) is ballistic; there is no diffusion constant (C6). A diffusion constant appears only with confinement (C9).

### C6. Long times: confinement and global geometry decide [Proved / Cited]

- **Flat plane, free BM.** By scaling, A_t = t·A_1 in law, so θ_t/t has the fixed density (1/λ) sech(πθ/λ)/1… more simply, θ_t/(λt) has density sech(πa). There is no diffusive regime.
- **CPⁿ** (Hopf fibration, compact base, nonzero Chern number). Baudoin–Wang (PTRF 2017, Thm 2.9): θ_t/t → Cauchy with parameter n. θ is defined with a 1-form α that is singular on a divisor (no global gauge exists). The heavy tails come from windings around that singularity, a Spitzer-type effect; this interpretation is mine. The gauge-invariant object e^{iθ} simply equidistributes.
- **CHⁿ** (anti-de Sitter fibration). θ_t/√t → N(0,1) (Thm 3.7): diffusive.
- **Lesson.** Local curvature fixes the small-t spread (C4). The long-t law depends on confinement and topology.

### C7. O'Neill: how much more curved shape space is than configuration space [Cited + Derived here + checked]

**Setting.** π: (P, g_P) → (M, g_M) is a Riemannian submersion and a principal G-bundle. G acts freely, properly and isometrically. The connection is the metric (mechanical) one: horizontal means orthogonal to the orbits.

**Fact 1 (O'Neill 1966, formula {2}).** For any Riemannian submersion and g_M-orthonormal X, Y with horizontal lifts X̃, Ỹ:

K_M(X,Y) = K_P(X̃,Ỹ) + 3|A_X̃Ỹ|², with A_X̃Ỹ = ½[X̃,Ỹ]^V.

- This needs no total geodesy. The T-tensor (second fundamental form of the fibres) enters only the vertical and mixed formulas:
  - {0} K_P(U,V) = K_fibre(U,V) − |T_UV|² + ⟨T_UU, T_VV⟩;
  - {1} K_P(X,U) = ⟨(∇_X T)_U U, X⟩ + |A_X U|² − |T_U X|²;
  - and the scalar identity s_P = s_M + s_F − |A|² − |T|² − |N|² − 2δ̌N (Besse, Ch. 9; this form is recalled, UNVERIFIED).
- So the user's restriction "when fibres are totally geodesic" is not needed for horizontal planes.

**Fact 2.** For horizontal X̃, Ỹ, the formula Ω(X̃,Ỹ) = dω(X̃,Ỹ) = −ω([X̃,Ỹ]) gives [X̃,Ỹ]^V = −(Ω(X,Y))*. The fundamental field satisfies |ξ*_u|² = ξ·I_u ξ. Hence

**K_M(X,Y) = K_P(X̃,Ỹ) + ¾ |Ω(X,Y)|²_{I_u}.**

**Molecules.** Remove translations, so P = ℝ^{3(N−1)}_{nc} with the mass metric, which is flat.
- Mechanical connection: ω = I⁻¹ℓ, with ℓ = Σ m_a r_a × dx_a.
- For horizontal u, v the d(I⁻¹)∧ℓ terms vanish, since ℓ(u) = ℓ(v) = 0. This gives **Ω(u,v) = 2 I(x)⁻¹ Σ_a m_a u_a × v_a**. [Numerically checked against the loop integral of ω to all digits printed.]
- Therefore, for u, v orthonormal horizontal in the mass metric, with J = Σ m_a u_a × v_a:
  - K_M = ¾|Ω|²_I = 3 J·I⁻¹J ≥ 0;
  - Ric_M(X,X) = ¾ Σ_j |Ω(X,e_j)|²_I;
  - s_M = (3/2) Σ_{i<j} |Ω_ij|²_I.
- **Honest conclusions:**
  - (a) The regular part of shape space has nonnegative sectional curvature, for any masses and any N.
  - (b) K = 0 on a plane exactly when Ω vanishes on it.
  - (c) For N ≥ 4, curvature is unbounded near collinear configurations [Sketch]. Near a line along e, take u, v to be two genuinely internal bends out of the line, one along e_y and one along e_z. They have J·e = O(1) while I_ee = O(ε²), so K ~ 1/ε². For N = 3 the out-of-line bend is a rigid rotation (three points always lie in a plane), so K stays bounded.

**Checks.**
- **Planar three-body** (ℂ² → ℂ²/U(1)):
  - M is the cone over S²(½), with hyperradius ρ and I = ρ².
  - A Hermitian-orthogonal unit pair has J = 1, so K = 3/ρ².
  - The cone over a round sphere of curvature 4 has tangential curvature (4 − 1)/ρ² = 3/ρ² ✓.
  - |Ω| = 2/ρ², and the holonomy of a loop is half the solid angle it encloses on the shape sphere. Analytic check: the latitude loop gives −2π sin²(α/2) = −Ω_solid/2. This matches Iwai's monopole of half strength.
  - Kendall: planar triangles modulo scale form S²(½). In O'Neill terms, S³(1) → S²(½) gives 4 = 1 + ¾·4 ✓.
- **Part 0 model / Heisenberg group** with the Kaluza–Klein metric dx² + dy² + ω²:
  - The base is flat, and K_P(horizontal) = −¾λ². The difference K_M − K_P = ¾λ² again.
  - Kaluza–Klein with unit fibres: s_P = s_M − ¼F_{μν}F^{μν} = s_M − ½Σ_{i<j}F_ij², which is −λ²/2 for Nil.

### C8. Brownian holonomy measures the curvature of shape space [Derived here, from C4 + C7]

**Corollary.** Under the hypotheses of C7, at a regular point p, with Θ measured in the inertia norm at a frame u over p:

E[Θ·I_uΘ] = (t²/12) Σ_{i<j} |Ω_ij|²_I + O(t³)
 = (t²/9) Σ_{i<j} [K_M − K_P](e_i,e_j) + O(t³)
 = (t²/18) [s_M(p) − Σ_{i≠j} K_P(ẽ_i,ẽ_j)] + O(t³).

**For molecules (P flat): E[Θ·IΘ] = t² s_M(p)/18 + O(t³).**

**Exactly when this holds:**
1. The group acts isometrically and freely. This is true for SO(3) on non-collinear configurations, and not for the rotor U(1) (side finding below).
2. The connection is the metric/mechanical one.
3. The loops are Brownian with respect to the quotient metric. An added smooth gradient drift is allowed; it changes only O(t³).
   - This matters physically: the projection of mass-weighted atomic BM onto shape space is BM_M plus the drift ½∇ log vol(orbit) = ¼∇ log det I.
   - A Riemannian submersion maps BM to BM iff its fibres are minimal (Elworthy–Le Jan–Li), and here they are not.
4. Θ is measured with the inertia tensor. With the Euclidean angle norm one gets |Ω|²_e instead, which equals (2/3)s_M/I₀ only if I = I₀·1.

**The answer to "Ricci or scalar?":**
- Brownian loops average over all planes, giving the scalar curvature of shape space (inertia-weighted).
- Ricci in a direction X collects only the planes that contain X.
- The scalar curvature of M also enters the return probability, p_t(p,p) = (2πt)^{−n/2}(1 + s_M t/12 + …). So for molecules, curvature makes loops both more frequent and more rotating.

**Slide.** "Shape space is curved because the bundle is twisted: K_shape = ¾|Ω|². Weight the rotation of a random shape loop by the molecule's inertia: its mean square is t²/18 × the scalar curvature of shape space."

### C9. OU shape fluctuations: exact law and rotational diffusion [Proved, MC]

**Model.** dx = −kx dt + √(2D) dW¹, dy = −ky dt + √(2D) dW². σ² = D/k per coordinate. θ = λA, symmetric gauge about the equilibrium.

1. **Drift cancels.** x dy − y dx = x(−ky dt + √(2D) dW²) − y(−kx dt + √(2D) dW¹) = √(2D)(x dW² − y dW¹). So A_t is a martingale.
2. **Variance.**
   - Stationary start: Var A_t = ¼·2D·E(x²+y²)·t = Dσ²t exactly.
   - From 0: Var A_t = (D²/k)(t − (1 − e^{−2kt})/2k). This agrees with Silva–Efrati Appendix C, written there with Ω = α/f.
3. **Exact characteristic function from 0.** The same radial/angular decomposition and the OU Feynman–Kac formula give
   E e^{iμθ_t} = e^{kt} / [cosh γt + (k/γ) sinh γt], with γ = √(k² + λ²μ²D²).
   - Check: k = 0, D = ½ recovers 1/cosh(λμt/2).
   - MC (k = 1, D = 0.5, t = 3, values of μ applied to A): 0.7408 vs 0.7409; 0.3364 vs 0.3381; 0.0333 vs 0.0339.
4. **Long times.**
   - The quadratic variation per unit time tends to λ²Dσ² almost surely (ergodic theorem). The martingale CLT then gives θ_t/√t ⇒ N(0, 2D_rot).
   - **D_rot = ½λ²Dσ² = λ²D²/(2k).**
   - Cumulant rate: k − √(k² + λ²μ²D²). This is the exponent of a symmetric normal-inverse-Gaussian Lévy process with α = k/(λD), δ = λD.
   - E cos θ_t ≈ e^{−D_rot t}.
5. **Gauge.** Any other gauge adds f(X_t) − f(X_0), which is tight for a stationary OU. So D_rot is gauge invariant.

[MC] Stationary start, Var(A)/T for (k, D) = (0.5, 0.5), (1, 0.5), (2, 1) against D²/k: 0.485 vs 0.5, 0.249 vs 0.25, and (as D_rot) 0.0618 vs 0.0625.

**Slide.** "Let the shape jitter around its rest shape with zero angular momentum. The molecule's orientation does a random walk: D_rot = ½ × curvature² × D × σ²."

### C10. General rule: rotational diffusion = curvature² × area-sweeping rate [Derived here]

**(a) Abelian, 2D, reversible ergodic shape diffusion** with generator D(Δ − ∇V·∇), invariant law μ ∝ e^{−V}, and curvature F.
- **Coulomb gauge.** Choose a with div(e^{−V}a) = 0. Then the Stratonovich integral ∫a∘dX has drift D e^{V} div(e^{−V}a) = 0, so it is a martingale.
- **Diffusion constant.** D_rot = D ∫|a|² dμ = D min_φ ∫|a − dφ|² dμ = D ⟨F, (−∇·e^{V}∇)⁻¹ F⟩. This is an "electrostatic energy" of the curvature in a medium of permittivity e^{V}.
- Valid assuming the Coulomb gauge exists with ∫|a|²dμ < ∞ (true for smooth confining V and bounded F).
- **Anisotropic Gaussian, constant λ.** a = (−αy, βx), with α = λσ₁²/(σ₁²+σ₂²) and β = λσ₂²/(σ₁²+σ₂²), gives **D_rot = λ²D²/(k₁ + k₂)**. [MC: k = (0.5, 2), D = 0.5 → Var(A)/T = 0.203 vs 0.2] Both modes must fluctuate to sweep area.

**(b) n-dimensional, leading order.** Shape normal modes have rates k_i and isotropic mobility D in orthonormal coordinates; Ω_ij is constant to leading order.
- The Coulomb gauge is M = ΣS with ΣS + SΣ = −Ω; for diagonal Σ = diag(D/k_i), this gives a_i = −Σ_j σ_i²Ω_ij xʲ/(σ_i²+σ_j²).
- Hence **D_rot = D² Σ_{i<j} Ω_ij Ω_ijᵀ/(k_i + k_j)** (a 3×3 tensor for SO(3)).
- For isotropic fluctuations: tr D_rot = ½Dσ²|Ω|², and for molecules tr(I D_rot) = Dσ² s_M/3.
- **Status:** rigorous for each Lie-algebra component at linear order. For the full SO(3) motion, convergence to a Brownian motion on SO(3) with this diffusion tensor needs |Ω|σ² ≪ 1. That is standard averaging/homogenisation (Papanicolaou–Stroock–Varadhan; Kipnis–Varadhan for the CLT), but I did not check a reference that states exactly this. [Heuristic for non-abelian]

**(c) Physical translation** (overdamped Langevin, friction per atom ζ_a = γm_a, no hydrodynamic interactions).
- With these frictions the zero-net-torque connection equals the mechanical connection.
- D = k_BT/γ and k_i = ω_i²/γ, giving D_rot^{geom} = (k_BT)²/γ · Σ_{i<j} Ω_ijΩ_ijᵀ/(ω_i² + ω_j²).
- The vertical noise adds ordinary rigid rotational diffusion D·I⁻¹. To leading order the two add.
- **Rough order of magnitude [Heuristic]:** geometric/rigid ≈ s_Mσ²/9 ≈ 3×10⁻³, using s_M = 0.55 and σ² = k_BT/ω² ≈ 0.044 amu Å² for a 400 cm⁻¹ mode at 300 K. Harmonic vibrations barely matter in solution.
- Large-amplitude motion (a free rotor) does matter (C12).

### C11. What the literature says (rigorous versus folklore)

**Rigorous:**
- Lévy's area laws (Lévy 1951; Yor's proof).
- Area and horizontal BM on the Heisenberg group (Gaveau 1977).
- Lévy area and Brownian holonomy giving the Â-genus in index theory (Bismut 1984).
- Bundle heat-kernel coefficients (Gilkey; Vassilevich 2003).
- Small bridges and Yang–Mills (Arnaudon–Thalmaier 2003).
- Exact areas and limit laws on CPⁿ/CHⁿ (Baudoin–Wang 2017; Baudoin–Demni–Wang book).
- Minimal fibres ⇔ BM maps to BM (Elworthy–Le Jan–Li; Bernard–Campbell–Davie).
- Martingale CLT tools (Kipnis–Varadhan 1986).

**Physics: established:**
- Rotation at zero angular momentum is a gauge field on shape space: Guichardet 1984; Shapere–Wilczek 1989; Iwai 1987; Montgomery 1990 and 1996; Littlejohn–Reinsch 1997; Putterman–Raz 2008.
- Chaotic internal motion produces a rotational random walk at L = 0, including Lévy walks and fractional diffusion (Katz–Efrati PRL 2019).
- Phase variance of a confined Brownian shape grows linearly; free motion gives ballistic growth (Silva–Efrati 2025, who fit D rather than giving it in closed form; Desbois–Comtet 1992 for hard-wall domains).
- A deformable free body at L = 0 explores all orientations through thermal fluctuations (Español–Thachuk–de la Torre 2023; their abstract does not mention a gauge field).
- Translational analogues: stochastic swimmers (Golestanian–Ajdari 2009) and enhanced diffusion by reciprocal swimmers (Lauga 2011).
- Solid-angle statistics on the sphere, with geodesic closure for open paths (Antoine–Comtet–Desbois–Ouvry 1991; Krishna–Samuel–Sinha 2000).

**Not found, so derived here (treat as new until a source turns up):**
- E[Θ·IΘ] = t²s_M/18.
- K_shape = 3J·I⁻¹J.
- D_rot = D⟨F, G_V F⟩ and D_rot = D²ΣΩΩᵀ/(k_i + k_j).

### C12. Concrete numbers to animate

**Part 0 model, λ = 0.5, standard BM.** All of the following are exact. Sample loops as B_s − (s/t)B_t, and reuse `horizontalLift` to get θ = z_end − z_start.

| t | Loop E θ² | Loop rms | Loop E cos θ | Free (symmetric) E θ² | Free rms | Free (Landau) E θ² |
|---|---|---|---|---|---|---|
| 0.5 | 0.0052 | 4.1° | 0.9974 | 0.0156 | 7.2° | 0.031 |
| 1 | 0.0208 | 8.3° | 0.9897 | 0.0625 | 14.3° | 0.125 |
| 2 | 0.0833 | 16.5° | 0.9595 | 0.25 | 28.6° | 0.5 |
| 4 | 0.333 | 33.1° | 0.8509 | 1.0 | 57.3° | 2.0 |
| 8 | 1.333 | 66.2° | 0.5514 | 4.0 | 114.6° | 8.0 |

Loop histogram: θ has density (π/(2λt)) sech²(πθ/(λt)). For t = 4 this is (π/4) sech²(πθ/2), with variance 1/3.

**OU, λ = 0.5** (both sets have σ = 0.71, so the motion stays well inside the ±1.65 base frame):
- **Set A:** k = 2, D = 1. Correlation time 0.5, D_rot = 0.0625. rms angle: 44° at t = 5, 63° at t = 10, 90° at t = 20, 128° at t = 40. E cos θ at t = 20 is 0.296 (Gaussian approximation 0.291). [MC D_rot 0.0618]
- **Set B:** k = 1, D = 0.5. D_rot = 0.03125. This is set A slowed down by a factor of 2.

**Bead nitroethane** (masses 15/14/14/16/16, `bundles/shared.js` geometry). Time t is in amu Å², so 1 √amu·Å moves an O atom by 0.25 Å.
- Principal moments: 36.3, 118.9, 149.9 amu Å².
- |Ω|² = 7.19×10⁻³; Σ Ω·IΩ = 0.368; s_M = 0.552 (amu Å²)⁻¹; largest basis-plane sectional curvature 0.053.
- Brownian loops: rms rotation ≈ 1.40° × t.
- **Full rotor turn at L = 0:** the holonomy is a rotation by 100.6° (≡ −259.4°) about (0.955, −0.237, −0.176), which is 17° from the C₂→N axis. Two independent methods agree to 10⁻⁶°: path-ordered integration of ω = I⁻¹ℓ, and Kabsch-aligned stepping. The frame counter-rotates by about 259°, so the lips advance only about 101° in the lab. A naive estimate 2π·I_rot/I_uu = 197° is wrong, because of the products of inertia.
- **Diffusing rotor** with only the torsion moving: long-time orientational diffusion about that axis ≈ (259.4/360)² D_φ ≈ 0.52 D_φ [Heuristic about unwrapping]. This is comparable to ordinary rigid rotational diffusion.
- **Nitromethane barrier (verified):** V₆ = 6.03 cal/mol ≈ 2.1 cm⁻¹, against k_BT ≈ 208 cm⁻¹ at 300 K, so the rotor is essentially free (Tannenbaum–Myers–Gwinn 1956). The sixfold form is specific to CH₃NO₂; for nitroethane the barrier is UNVERIFIED.

**On-screen statements (pick one or two):**
- "A random loop of shapes turns the molecule by a random angle: zero on average, spread = curvature × area."
- "Brownian loop of duration t: θ_rms = λ t/√12."
- "Jittering shape, zero angular momentum → orientation random walk: D_rot = ½ λ² D σ²."
- "Shape space is curved because the bundle twists: K_shape = ¾ |Ω|²."

---

### Side finding for the U(1)-rotor analyses

The rotor map Φ_φ (turn the two O atoms about the C₂–N axis) is a free U(1) action, wherever the O atoms are off the axis. It commutes with SO(3). But it is **not an isometry** of the mass metric: at φ = π/2, max|JᵀGJ − G| = 160, where the diagonal entries of G are 14–16. The reason is that moving C₂ or N swings the axis.

Consequently the orthogonal complement of the rotor orbits is not U(1)-invariant, so it is not a principal connection. Possible fixes are a U(1)-averaged metric or an intrinsic definition. The Brownian results C1–C6 and C9–C10 hold for any principal connection; C7–C8 need an invariant metric.

---

### Literature

"Verified" means existence and bibliographic data were confirmed by web search; for content I checked the abstract or full text where indicated.

**Verified:**
1. P. Lévy, "Wiener's random function, and other Laplacian random functions," Proc. 2nd Berkeley Symp. Math. Stat. Prob. (1951) 171–187, projecteuclid bsmsp/1200500228 (gives the characteristic function of the area).
2. B. Gaveau, "Principe de moindre action, propagation de la chaleur et estimées sous elliptiques sur certains groupes nilpotents," Acta Math. 139 (1977) 95–153, doi:10.1007/BF02392235.
3. J.-M. Bismut, "The Atiyah–Singer theorems: a probabilistic approach. I," J. Funct. Anal. 57 (1984) 56–99, doi:10.1016/0022-1236(84)90101-0. Its use of Lévy's formula is confirmed via the Baudoin–Wang introduction and the survey arXiv:2107.03557.
4. E. P. Hsu, *Stochastic Analysis on Manifolds*, AMS GSM 38 (2002), doi:10.1090/gsm/038, Ch. 7 on index theorems. That it has specific sections on Brownian holonomy and Lévy area: UNVERIFIED.
5. D. V. Vassilevich, "Heat kernel expansion: user's manual," Phys. Rep. 388 (2003) 279–360, doi:10.1016/j.physrep.2003.09.002, arXiv:hep-th/0306138. Checked in the full text: eq. (4.15), α₁₀ = 30, R = 2 on the unit S², Ω = dω + ω∧ω.
6. M. Arnaudon, A. Thalmaier, "Yang–Mills fields and random holonomy along Brownian bridges," Ann. Probab. 31 (2003) 769–790, doi:10.1214/aop/1048516535 (abstract checked).
7. B. K. Driver, A. Thalmaier, "Heat equation derivative formulas for vector bundles," J. Funct. Anal. 183 (2001) 42–108, doi:10.1006/jfan.2001.3746.
8. F. Baudoin, J. Wang, "Stochastic areas, winding numbers and Hopf fibrations," PTRF 169 (2017) 977–1005, doi:10.1007/s00440-016-0745-x, arXiv:1602.06470. Full-text introduction checked: θ/t → Cauchy(n) on CPⁿ; θ/√t → N(0,1) on CHⁿ.
9. K. D. Elworthy, Y. Le Jan, X.-M. Li, *The Geometry of Filtering*, arXiv:0810.2253 (states the minimal-fibre criterion). The book edition (Birkhäuser 2010) is UNVERIFIED.
10. T. Lévy, *Yang–Mills measure on compact surfaces*, Mem. AMS 166 (2003) no. 790, doi:10.1090/memo/0790.
11. K. G. Wilson, "Confinement of quarks," Phys. Rev. D 10 (1974) 2445, doi:10.1103/PhysRevD.10.2445.
12. B. O'Neill, "The fundamental equations of a submersion," Michigan Math. J. 13 (1966) 459–469, doi:10.1307/mmj/1028999604.
13. J. Milnor, "Curvatures of left invariant metrics on Lie groups," Adv. Math. 21 (1976) 293–329. The Heisenberg value −¾ was derived here and not located in the paper.
14. D. G. Kendall, Bull. LMS 16 (1984) 81–121, doi:10.1112/blms/16.2.81. The statement "triangles form S²(½)" is confirmed via secondary sources.
15. H. Le, D. G. Kendall, Ann. Stat. 21 (1993) 1225–1271. Their curvature-blow-up statements: UNVERIFIED.
16. A. Guichardet, Ann. IHP A 40 (1984) 329–342.
17. A. Shapere, F. Wilczek, J. Fluid Mech. 198 (1989) 557–585, doi:10.1017/S002211208900025X.
18. T. Iwai, J. Math. Phys. 28 (1987) 964–974, doi:10.1063/1.527588 (monopole field on the planar triatomic internal space).
19. R. Montgomery, Commun. Math. Phys. 128 (1990) 565–592, doi:10.1007/BF02096874; and Nonlinearity 9 (1996) 1341–1360.
20. R. G. Littlejohn, M. Reinsch, Rev. Mod. Phys. 69 (1997) 213–275, doi:10.1103/RevModPhys.69.213.
21. O. Saporta Katz, E. Efrati, Phys. Rev. Lett. 122 (2019) 024102, doi:10.1103/PhysRevLett.122.024102. The preprint is probably arXiv:1706.09868 (inferred).
22. A. Silva, E. Efrati, arXiv:2503.11278 (2025). Full text checked: eqs. (16)–(18) and Appendix C.
23. P. Español, M. Thachuk, J. A. de la Torre, arXiv:2303.15295; Eur. J. Mech. A/Solids (PII S0997753823002760; volume and year not checked).
24. R. Golestanian, A. Ajdari, J. Phys.: Condens. Matter 21 (2009) 204104, arXiv:0901.1624.
25. E. Lauga, Phys. Rev. Lett. 106 (2011) 178101, arXiv:1104.0047.
26. M. M. G. Krishna, J. Samuel, S. Sinha, J. Phys. A 33 (2000) 5965, arXiv:cond-mat/0005345.
27. Antoine, Comtet, Desbois, Ouvry, J. Phys. A 24 (1991) 2581. Title known only from a listing.
28. J. Desbois, A. Comtet, "Algebraic areas enclosed by Brownian curves on bounded domains," J. Phys. A 25 (1992). Sources disagree on the first page.
29. E. Putterman, O. Raz, "The square cat," Am. J. Phys. 76 (2008) 1040, arXiv:0801.0926.
30. N. A. Sinitsyn, I. Nemenman, EPL 77 (2007) 58001 (stochastic pumps and the Berry phase).
31. C. Kipnis, S. R. S. Varadhan, Commun. Math. Phys. 104 (1986) 1–19.
32. G. Papanicolaou, D. Stroock, S. R. S. Varadhan, "Martingale approach to some limit theorems," Duke Turbulence Conf. (1977).
33. A. Bernard, E. A. Campbell, A. M. Davie, Ann. Inst. Fourier 29 (1979) 207–228.
34. Tannenbaum, Myers, Gwinn, J. Chem. Phys. 25 (1956) 42, doi:10.1063/1.1742845.
35. A. S. de Wijn, A. Fasolino, J. Phys.: Condens. Matter 21 (2009) 264002. It exists; its abstract is about internal chaos and diffusion on a substrate, not about rotation.

**UNVERIFIED (not searched, or recalled from memory):**
- Gilkey, *Invariance Theory, the Heat Equation…* (1984/1995).
- Besse, *Einstein Manifolds* (1987), Ch. 9 (scalar-curvature identity).
- Baudoin–Demni–Wang, *Stochastic areas, horizontal Brownian motions, and hypoelliptic heat kernels* (EMS 2024): reported by search, not opened.
- Ikeda–Watanabe; Norris (1993); Shapere–Wilczek, Am. J. Phys. 57 (1989); Pinsky, *Lectures on Random Evolution*.

---

**Scripts used for the checks**, all in `many-bundles-checks/`:
- `levy_check.py`: Lévy laws, gauges, OU.
- `nonabelian_check.py`: SO(3) small loops.
- `nitro_curvature.py`: Ω, K and s_M for the bead model, and the rotor-loop holonomy.
- `rotor_check.py`: Kabsch cross-check of the rotor loop.
- `rotor_isometry.py`: shows the rotor action is not an isometry.
- `numbers.py`: the animation tables.


---

# Referee report on analysis A (the rotor)


Most of Analysis A holds up. I recomputed its numbers and they reproduce. I found four substantive errors: a wrong identification of line bundles in R12, which also feeds scene 11; contradictory hypotheses in the rotor-commutation lemma of R6; a false "never horizontal" claim in R8; and a wrong exception in the proof of R5. There are also several smaller citation and notation problems. A does not address the user's Brownian-motion question at all.

My checks, written independently of A's scripts:
- many-bundles-checks/referee-check_A.py
- many-bundles-checks/referee-check_B.py

---

### A. Errors, gaps and overclaims

#### A1. R12 and takeaway 12: the lip position is a section of the wrong line bundle (substantive)

**A's claim.** "x ↦ s_a(x) … is a section of the associated line bundle L = X_free ×_{U(1)} ℂ (charge 1)." "On the bond sphere, s_a is a tangent field with total index 2." "Chern/Euler numbers count those axis crossings." "The failure is a property of the tracked point."

**Why it is wrong.**
- s_a is not a ℂ-valued equivariant function. It takes values in the moving plane u(x)^⊥. It is therefore an equivariant section of u*TS², and it descends to a section of E ⊗ u_B*TS² (or E* ⊗ u_B*TS², depending on the sign convention), where E = X_free ×_{U(1)} ℂ. It is not a section of E.
- A's own bond-sphere embedding in R10b puts lip a at x_n + zu + ρv with v a unit vector and ρ > 0. So s_a = ρv is nowhere zero on that sphere: its index there is 0, not 2.
- Consistency check: c₁ = 0 on the bond sphere for the bundle that s_a actually lives in, and c₁(u*TS²) = 2. Together these force c₁(E)[bond] = ∓2, which agrees with R10b.
- For a bare C–N–O₂ fragment on X (N = 4), no atom ever crosses the axis on that sphere, yet c₁ = ±2 there. On X the bond class is the hairy-ball obstruction for the reference direction in u^⊥, not a lip crossing the axis.

**Corrected statement.**
- A genuine section of E needs a reference direction. Take the ℂ-valued equivariant function s_a·conj(s_j)/|s_j|², where j is a frame atom off the axis; this is the dihedral.
- Its zeros are where lip a is on the axis, and its poles are where reference atom j is on the axis.
- On the bond sphere, with frame atom j fixed, s_j(u) = x_j − (x_j·u)u has two zeros of index +1 (at u = ±x̂_j). These produce the class ±2.
- The zeros of s_a alone detect only the Hopf class: c₁ of the bundle s_a lives in is (0, ±1) in (bond, Hopf) order.
- On M_free (bond class gone, R10b(ii)), "axis crossings of lips or of the reference frame atom" is correct.

**Effect on the video.** Scene 11 (src/videos/bundles/scenes/11-rotor-line-bundle.js) puts "tautological section, vanishes exactly where the lip is on the axis" right next to "Chern number 2, the hairy ball". The two statements are each defensible separately, because E restricted to the bond sphere is isomorphic to the tangent bundle up to conjugation, via s_a. But they must not be read as "the 2 counts lip zeros".

The answer to the user's question survives. The associated bundle can recover the group element only from a fibre point with trivial stabiliser: U(1) acts freely on ℂ\0, while SO(3) never acts freely on ℝ³. So the issue is the stabiliser of the tracked point, not "global versus local symmetry".

#### A2. R6 lemma (several rotors): the hypotheses contradict each other in the nested case

**A's claim.** "Suppose D₁ ∩ S₂ = ∅, and either D₂ ∩ S₁ = ∅ or D₂ ⊂ S₁ ∪ D₁^ax."

**Why it is wrong.** In the second case S₂ ⊂ D₂ ⊂ S₁ ∪ D₁^ax = D₁, while also D₁ ∩ S₂ = ∅. Together these force S₂ = ∅, so the nested case is empty. The proof itself then uses "S₂ ⊂ S₁", which contradicts the hypothesis. So the tree corollary (nested torsions) is not proved as written.

**Corrected statement.** Rotors 1 and 2 commute in either of these cases:
- (a) disjoint: D₁ ∩ S₂ = ∅ and D₂ ∩ S₁ = ∅;
- (b) nested: D₁^ax ∩ S₂ = ∅ and D₂ ⊂ S₁ ∪ D₁^ax.

Proof of (b): rotor 2 does not move axis 1. Rotor 1 moves all of D₂ by one rigid motion g that fixes axis 1. SE(3)-equivariance of rotor 2 then gives the commutation.

For a rooted tree with bond (p, c) rotating subtree(c) \ {c}, every pair of bonds falls into (a) or (b), so the Tᵏ claim holds. Nitromethane NO₂ with CH₃ is case (a).

"The hypotheses are sharp" is an overclaim. One counterexample in which both conditions fail shows nothing about sharpness.

#### A3. R8: "ξ is never SO(3)-horizontal" is false off Σ

The identity u·J(ξ) = I_u + d·(m_a s_a + m_b s_b) can vanish. Counterexample, checked numerically:
- Put lip b at N (r_b = 0), with lip a off the axis, so the configuration is in X_free.
- Place another frame atom so that the centre of mass sits at lip a.
- Then J(ξ) = (0, 0, 0) exactly.

The correct statement: on Σ, J(ξ) = I_u u ≠ 0, so ξ is never horizontal there. Off Σ, J(ξ) = 0 on an exceptional set of codimension ≤ 3.

Two further problems:
- The lift ξʰ = ξ − Ω × (x − X_cm) omits the centre-of-mass correction V = (Σ mᵢξᵢ)/M. This vanishes on Σ but not off it.
- "I_tot" means the full inertia tensor here but a scalar moment in the theorem. One of the two should be renamed.

#### A4. R5: wrong exception, and a misapplied theorem

**The exception.** "dΦ_θ(δx) has nonzero lip components … unless rᵢ ∥ u" is wrong. For rᵢ = z u the lip component is z(I − R_u(θ))δu, which is nonzero whenever z ≠ 0, δu ≠ 0 and θ ≢ 0. I checked this numerically: (0, −0.122, 0.090) for a lip on the axis. The only exceptions are rᵢ = 0 or δu = 0.

**The theorem.** Mazur–Ulam concerns surjective metric isometries of whole normed spaces. Φ_θ is defined only on X' and is discontinuous at x_c = x_n. The correct tool is Liouville rigidity: a smooth map of a connected open subset of Euclidean space whose differential is orthogonal everywhere is the restriction of a rigid motion. The conclusion of R5 stands, and in any case the concrete inequality |dΦ_θ δx|² > |δx|² already proves it.

#### A5. A omits the Brownian-motion question entirely

The user asked how Brownian noise, curvature and holonomy relate. A does not address it. The correct statements are below.

**Constant-curvature U(1) bundle over the plane.**
- Take curvature F = κ dx∧dy and standard 2D Brownian motion. In the symmetric gauge the horizontal phase is θ_t = −κ L_t, where L_t = ½∫(x dy − y dx) is Lévy's stochastic area.
- The mean is E θ = 0, so there is no average rotation.
- Lévy's characteristic function is E e^{iλL_t} = 1/cosh(λt/2), which gives Var L_t = t²/4. My Monte Carlo gives 0.257 at t = 1.
- For loops (the Brownian bridge) the characteristic function is (λt/2)/sinh(λt/2), which gives Var = t²/12.
- So the rms rotation grows like t, not √t.

**Non-abelian case.**
- At small t the holonomy is approximately exp(−Σ_{i<j} F_ij L^{ij}). The different areas L^{ij} are uncorrelated.
- The mean rotation vanishes at leading order, and E[hol] − I is of order t² Σ F_ij², i.e. the Yang–Mills density |F|².
- What appears is not the Ricci or scalar curvature of the base. The nearest link is O'Neill's formula, in which |F|² enters the scalar curvature of the total space; normalisations are convention-dependent.
- The existing scenes 12 and 13 use these t²/12 and t²/24 constants. They are consistent with this derivation, but I did not referee them.

#### A6. Minor errors

- **Chern-class order.** R10b writes c₁ = (±2, ±1) in (bond, Hopf) order; R11b writes (1, −2) in (Hopf, bond) order. Fix one order and one sign convention.
- **Group notation.** "O(3) × U(1) is a semidirect product" should be written U(1) ⋊ O(3), with Q acting on U(1) by θ ↦ det(Q)·θ.
- **Path-ordered exponential.** P exp(−∫I⁻¹J dφ) needs the hat map (vector to skew matrix) and an ordering convention. With Q̇ = QΩ̂_b, later times go on the right.
- **Eckart frame.** "A section only near its reference geometry" understates it. Iwai (1987) shows an Eckart frame exists at every configuration, though not uniquely; it fails to be a smooth single-valued section on a singular set.
- **"Never a bead model".** The dimension argument is right. It should also cover M/U(1): its dimension 3N − 7 is never 3K − 6.
- **R11(e) dynamics caveat.** The Euler-equation argument is valid only for a rigid rotor on a frictionless bearing with no torsional torque. Present it as a model statement, not a theorem about the molecule.
- **Base of the Berry connection.** "Connection on ℂ²\0 → ℂP¹": the base is actually ℝ³\0, which only retracts onto ℂP¹.

#### A7. Citations

| Citation | Status |
|---|---|
| Nitroethane electron diffraction, "J. Mol. Struct. 2007" | Exists, but is Tarasov, Kochikov, Vogt et al., *J. Mol. Struct.* 872, 150–165 (2008), DOI 10.1016/j.molstruc.2007.02.038. Reports 50–200 cm⁻¹, most probably about 120 cm⁻¹, with a syn minimum. A also omits a later "alternative" electron-diffraction study (*J. Mol. Struct.*, about 2009) giving 50–90 cm⁻¹ (0.6–1.1 kJ/mol); its authors are UNVERIFIED. |
| Ekkers, Bauder, Günthard | Exists: *Chem. Phys. Lett.* 22, 249–252 (1973), DOI 10.1016/0009-2614(73)80086-7, reporting "nearly free" internal rotation. A's "≲ 5 cm⁻¹" remains UNVERIFIED (paywall). |
| "mm-wave 2017" | Is Ilyushin et al., *J. Mol. Spectrosc.* 345, 64–69 (2018), DOI 10.1016/j.jms.2017.12.005, with V₆ ≈ 2 cm⁻¹. |
| Iwai, "several sources mis-cite it as 28, 1315" | Unsupported and confusing: 28, 1315 is a different real Iwai paper ("A geometric setting for internal motions of the quantum three-body system", Littlejohn–Reinsch's 1987b). Delete the remark. |

---

### B. Claims checked and confirmed

**Group actions, freeness, quotients.**
- R1: smooth action and group law. The other-axes lemma holds. The bisector rotor commutes with the C–N rotor; it coincides with it on Σ provided z > 0 (for z < 0 the two rotors are inverse).
- R2: stabilisers are trivial or all of U(1). Fix has codimension 4, and X_free is connected and simply connected.
- R3: Quotient Manifold Theorem (Lee, 2nd ed., Thm 21.10; confirmed). The explicit slice construction works, and the sets U_{i,k} cover X_free.
- R7: the product action is free exactly when the frame is non-collinear and some lip is off the axis. The rotor descends to M. On M, stabilisers are trivial iff the frame is non-collinear; for a bare C–N–O₂ fragment the rotor acts trivially.

**Symmetries and periodicity.**
- R4: exact π-periodicity on Σ, and π/3 (sixfold) with a C₃ methyl. Since π and 2π/3 are periods, so is their difference π/3.
- V₆ = 6.03 cal/mol = 2.109 cm⁻¹ (Tannenbaum, Myers, Gwinn 1956, confirmed). kT at 298 K is about 207 cm⁻¹. The nitromethane molecular symmetry group is G₁₂ (confirmed in the literature).
- R6 (i)–(iii): R_{Qu}(θ) = Q R_u(det Q·θ) Qᵀ, and the resulting mirror law is correct.

**Torsion holonomy (R8).**
- J(ξ) = I_N^{lips} u + d × (u × S), and J = I_u u exactly on Σ.
- The bicycle-wheel theorem and its proof under (H1) and (H2) are correct. Parallel-axis shifts along u preserve u as an eigenvector.

| Molecule | Quantity | Value (recomputed) |
|---|---|---|
| Nitromethane | I_u of O₂ | 37.82 amu Å² |
| | I_u of H₃ | 3.24 amu Å² |
| | I_u / I_tot | 0.921 |
| | Holonomy, formula and numerical (axis exactly u) | 28.41° |
| Animation's united-atom nitroethane | ρ | 0.9614 Å |
| | I_u | 29.58 amu Å² |
| | ρ of C₁ | 1.431 Å |
| | C–C–N angle | 109.97° |
| | Naive formula | 183.43° |
| | True holonomy | 100.60° about an axis 17.18° from u |

The nitromethane geometry is correct: C–N 1.489 Å, N–O 1.224 Å, ∠ONO 125.3°, ∠NCH 107.2° (Cox & Waring 1972). The value r_CH = 1.088 Å is not confirmed by the sources I found.

**Base of the rotor bundle (R9).**
- |h| = I_u. The quotient X_free/U(1) ≅ F' × ℝ² × (ℝ³\0), which retracts onto S² × S², via the mass-weighted Hopf map.
- The invariants of the lips' perpendicular parts and the universal-bundle (pullback) description are correct.

**Sections and triviality (R10).**
- (a) The centre-of-mass section; the translation connection is flat.
- (b)(i) c₁ = ±2 on the bond sphere (hairy ball, unit tangent bundle T¹S²) and ±1 on the Hopf sphere.
- (b)(ii) The base of M_free → M_free/U(1) retracts onto ℂP^{p−1} × ℂP¹, with c₁ = (∓1, ±1).
- (c) The SO(3)-bundle is trivial for N = 3 (the "xxy gauge" section; shape space is the contractible Gram cone). It is nontrivial for N ≥ 4: the codimension of {rank ≤ 1} is 2k − 2 ≥ 4, so the total space is simply connected, which cannot hold for M × SO(3).
- Littlejohn–Reinsch Sec. III.D, which I checked in the text: N = 3 is trivial (citing Iwai 1987b, J. Math. Phys. 28, 1315), and "for n ≥ 4, globally smooth sections no longer exist", with no proof given.
- (d) Both permutation obstructions to canonical sections are correct.

**Connections (R11).**
- The defect formula of A_naive is −z(Rr − r)·ω.
- Ṙ = [ω×, R], so A_LC is U(1)- and SE(3)-invariant. Note that A_LC is odd under reflections.
- g_LC is positive-definite and U(1)-invariant, and A_LC is its mechanical connection.
- On Σ, A_orth = A_naive = A_LC on all of T_xX. For equal masses the agreement locus is exactly Σ.
- The derivation u·(r × (ṙ − ω×r)) = u·(s × ṡ) = ρ²(φ̇ + cos ϑ ϕ̇) gives A_LC = dφ_a + w_b dβ + cos ϑ dϕ.
- F = ½ĥ*σ − u*σ, with w_b = (1 − cos χ)/2.
- Foucault holonomy by integration: 30° gives 48.231°, 41.41° gives 90.002°, 60° gives 180.000°, 75° gives 266.83°, each equal to 2π(1 − cos ϑ₀).
- Cat example: −30° × (0.5 − 0.2805) = −6.585°, which matches the solid-angle form.
- (c) A_M kills so(3) and translations, A_M(ξ) = 1, and A_M is U(1)-invariant. In gauge, A_M = dτ₁ + w_b dβ − Σ w^F_j dβ^F_j; for p = 1, F_M = ½ĥ*σ.
- (d) The averaged product connection (Ã, A_M) is a principal connection.

**Other citations confirmed.**
- Guichardet 1984, *Ann. IHP* 40, 329–342.
- Iwai, *J. Math. Phys.* 28, 964 (1987) and 28, 1315 (1987); *Ann. IHP* 47, 199 (1987).
- Littlejohn–Reinsch, *Rev. Mod. Phys.* 69, 213 (1997).
- Hart, Miller, Mills, *Am. J. Phys.* 55, 67 (1987).
- von Bergmann and von Bergmann, *Am. J. Phys.* 75, 888 (2007).
- Montgomery, *Fields Inst. Commun.* 1, 193–218 (1993).
- Tannenbaum et al. 1954 and 1956.
- Lévy 1951, Berkeley Symposium II, pp. 171–187.

Sources:
- [Tannenbaum, Myers, Gwinn 1956](https://pubs.aip.org/aip/jcp/article/25/1/42/204191/Microwave-Spectra-Dipole-Moment-and-Barrier-to)
- [Ekkers, Bauder, Günthard 1973](https://www.sciencedirect.com/science/article/abs/pii/0009261473800867)
- [Tarasov et al. 2008 electron diffraction](https://www.sciencedirect.com/science/article/abs/pii/S0022286007002037)
- [Alternative electron-diffraction study, about 2009](https://www.sciencedirect.com/science/article/abs/pii/S0022286009007327)
- [Ilyushin et al. 2018](https://www.sciencedirect.com/science/article/abs/pii/S0022285217303673)
- [Dawadi et al. 2017 (G₁₂)](https://www.sciencedirect.com/science/article/abs/pii/S002228521730320X)
- [Cox & Waring 1972](https://pubs.rsc.org/en/content/articlelanding/1972/f2/f29726801060/unauth)
- [Iwai, J. Math. Phys. 28, 964 (1987)](https://www.semanticscholar.org/paper/A-gauge-theory-for-the-quantum-planar-three%E2%80%90body-Iwai/e0ac791a12dba62c1c8c37b81f7ee418be6a8f7c)
- [Iwai, J. Math. Phys. 28, 1315 (1987)](https://doi.org/10.1063/1.527534)
- [Iwai, Ann. IHP 47, 199 (1987)](https://www.numdam.org/article/AIHPA_1987__47_2_199_0.pdf)
- [Guichardet 1984](https://eudml.org/doc/76239)
- [Hart, Miller, Mills 1987 (cited)](https://www.academia.edu/54015494/The_Formulations_of_Classical_Mechanics_with_Foucault_s_Pendulum)
- [von Bergmann and von Bergmann 2007](https://pubs.aip.org/aapt/ajp/article/75/10/888/983714/Foucault-pendulum-through-basic-geometry)
- [Montgomery 1993](https://www.researchgate.net/publication/243771835_Gauge_theory_of_the_falling_cat)
- [Lee, Thm 21.10 (as cited in arXiv:1804.10379)](https://arxiv.org/pdf/1804.10379)
- [Lévy 1951](https://projecteuclid.org/euclid.bsmsp/1200500228)
- [Lévy's stochastic area](https://en.wikipedia.org/wiki/L%C3%A9vy's_stochastic_area)

---

# Referee report on analysis B (associated bundles)


**Overall verdict.** The core differential geometry is sound. I checked every proof sketch in Sections 0–2 and found no mathematical error in them. All key numbers reproduce:
- nitromethane inertia;
- the 28.41° torsion holonomy (closed form and ODE);
- the rotor-connection invariance at the symmetric locus;
- the cone/solid-angle numbers and the barrier conversions.

There are real problems in Sections 3–5:
- one false theorem hypothesis (Theorem 4.7);
- one false codimension claim (§3 (ii));
- an incomplete hypothesis plus an overclaim (Proposition 5.3);
- a wrong coefficient (Proposition 5.4);
- several statements that would mislead on a slide: what spins in the torsion loop, the topology claims, and the labelled-atom assumption;
- two citation attributions that need fixing.

The Brownian-motion/curvature question the user asked is not addressed by Analysis B at all.

My recomputation script is `many-bundles-checks/referee-ref_checks.py`. Run it with `python3 -I`.

---

### A. Errors and overclaims (most serious first)

#### A1. Theorem 4.7 ("for N ≥ 4, P_rot → B_rot is non-trivial") is false as stated
**Why it is wrong.**
- For N = 4, e.g. F–NO₂ (Analysis B's own example after Lemma 4.2), the stator is {F, N}. It always lies on the rotor axis, so by Lemma 4.2 the rotor acts trivially on shape space. Then M^♮ = ∅ and there is no rotor bundle at all.
- For N = 5 (stator C, N, X), the removed set {stator ⊂ axis} = {X on the C–N line} has codimension 2, not "≥ 6". So π₁(M^♮) = 0 is unproved, and the exact-sequence argument collapses.
- In general that locus has codimension 2(N−4). It is 6 only for N = 7.

**Corrected statement.**
- If the stator contains an atom off the C–N line (so N ≥ 5), P_rot → B_rot is non-trivial. The proof is Proposition 4.6 directly: the Hopf sphere inside one fibre has c₁ = ±1.
- The simply-connectedness route via the exact sequence is valid for N ≥ 6.
- Executive summary item 10, "the rotor bundle (always)", must read "whenever the stator has an atom off the rotor axis".

#### A2. §3 (ii): "codimension 4 for the rotor, independent of N" is false
**Why it is wrong.** The non-free set has two parts:
- {both lips on axis}, codimension 4;
- {stator ⊂ axis}, codimension 2(N−4).

**Correct statement.** The codimension of the non-free set is:
- everything (the action is never free) for N = 4;
- 2 for N = 5;
- 4 for N ≥ 6.

#### A3. Proposition 5.3(b): hypothesis incomplete, "only at symmetric geometries" unproven, phrase ill-posed
**"Principal connection at a geometry" is not a meaningful notion.** What is true is a statement about a ρ-invariant submanifold. I proved it analytically and confirmed it numerically (differences ~1e-10).

**Corrected claim.** Let Σ be the set of shapes where:
- (i) the lips are exchanged by the C₂ rotation about the C–N line (equal masses, p₂ = −p₁, equal axial offsets);
- (ii) the C–N line passes through the total centre of mass;
- (iii) the C–N line is a principal axis of the total inertia.

Then Σ is ρ-invariant, and A_rot^mech restricted to TM|_Σ is ρ-invariant. So it restricts to a principal connection on P_rot|_Σ.

**Why condition (ii) is needed.** Invariance of ê·L_c(dρ u) requires x_N − c ∥ ê. Otherwise a term ê·(d × (R−I)w) survives for arbitrary w.
- Analysis B's wording ("a stator making ê a principal axis") omits this condition.
- It holds automatically for a C₃-symmetric CH₃, which is why their example works.
- With unequal H masses my test breaks invariance by about 0.05–0.16.

**On "only at symmetric geometries".** Off Σ, non-invariance is supported only by numerical examples:
- lip C₂ broken: Δ ≈ 2–4·10⁻³;
- stator broken: Δ ≈ 0.1.

"Only" (i.e. Σ is exactly the invariance locus) is unproven. Executive summary item 5 inherits the overclaim.

**Proof sketch.** The sketch is incomplete as written. The cancellations actually used are:
- Σ m_O r_O ∥ ê;
- the derivative-of-axis term Σ m (dR r_O)·(ê × R r_O), which vanishes because the p-linear parts cancel under C₂ and the p-quadratic parts vanish identically.

#### A4. Proposition 5.4 uniqueness: wrong coefficient
**Claim.** "A shift by β changes the expression by (Σ m_O|p_O|²)β."

**Why it is wrong.** The expression E(u) = Σ m⟨Jp, ∇_u p⟩ uses the SO(3) covariant derivative, so it equals ℓ(u^h) = ⟨u, ζ^h⟩. On (A+β)-horizontal vectors it changes by −β·E(ζ).

E(ζ) = |ζ^h|² = (I_frame/I_∥)·Σ m|p|². Numerically:
- E(ζ) = 2.985;
- Σ m|p|² = 37.82.

So the claimed coefficient is wrong by a factor of 12.7.

**Corrected statement.** Uniqueness holds wherever |ζ^h|² > 0. That needs the stator off the axis as well as the lips; it is equivalent to the free locus. 2.985 = I_NO₂·I_CH₃/(I_NO₂+I_CH₃) is the standard reduced torsional moment of inertia, a nice slide number.

#### A5. Torsion example: what actually spins (critical for the animation), and the rule's hypotheses
**Slide wording.** "NO₂ spinning once turns nitromethane by 28°" and "a full NO₂ turn at zero angular momentum" suggest the NO₂ spins in the lab. In the L = 0 motion:
- CH₃ turns −331.6° in the lab;
- NO₂ turns only +28.4°.

The "full turn" is relative. The animation must show the light CH₃ whirling and the heavy NO₂ barely moving.

**"Rule: holonomy = 2π·I_frame/(I_frame+I_top)".** This holds only if both parts' centres of mass lie on the torsion axis and that axis is principal for each part. Under those conditions, counter-rotation generates angular momentum only along the axis and no translation. For a general asymmetric molecule the holonomy is a general SO(3) element, not a rotation about the bond.

**Naming.** Analysis B calls NO₂ the "top" and CH₃ the "frame". That is the reverse of internal-rotation convention (Lin–Swalen: methyl = top). Harmless mathematically, but it will confuse chemists.

#### A6. Missing hypothesis: labelled (distinguishable) atoms
All freeness statements (Lemma 4.2, "free where (p₁, p₂) ≠ 0") and "the shape returns after a 2π turn" assume labelled atoms. If identical O's and H's are identified, as chemists do:
- ρ_π fixes every C₂-symmetric NO₂ geometry, so the rotor has ℤ/2 isotropy exactly on the physically relevant set and B_rot is an orbifold there.
- The honest variable is the doubled angle (their q ∈ Π^⊗2). On the sphere of axis directions that bundle has c₁ = 4, not 2.
- The unlabelled shape loop closes after a relative turn of π/3: C₂ × C₃ gives a sixfold period, which is also why the barrier is V₆. Its holonomy is 60°·I_CH₃/I_tot = **4.74°** (up to a permutation).

State the hypothesis explicitly or add this remark.

#### A7. "No global rotor gauge / topology forbids a perfect zero" (§5.1, §5.6, slides 4–5): overclaim for physics
These statements are true on the full free shape space. They rely on far-from-equilibrium shapes:
- the C–N bond swung over the whole sphere relative to CH₃ (Proposition 4.5 admits this);
- lips moved onto the axis (the Hopf sphere of Proposition 4.6, not admitted).

On any contractible neighbourhood of the physically explored region, P_rot is trivial and the H–C–N–O dihedral is a perfectly good global angle. The same caveat applies to the SO(3) body frame (Eckart frames exist locally, as B notes).

Slides must say "on the space of *all* shapes". Otherwise they contradict what chemists do daily.

#### A8. Proposition 5.3(a): the quoted evidence does not show the stated claim
The tilt kinetic energies 37.27 and 18.36 are correct (I reproduced both: ½·(26.61+47.94) and ½·(26.61+10.12)). But they are ambient, unreduced lab kinetic energies of a non-centred motion. They show non-isometry of the mass metric on (ℝ³)^N, not of g_M.

The claim for g_M is nevertheless true: |u^h|² vs |(dρu)^h|² = 60.13 vs 63.06 and 98.96 vs 117.79, at the symmetric locus. Replace the evidence with reduced-metric numbers.

#### A9. Curvature sign never defined (Proposition 2.2) and the slide sign
"The curvature acts on E by the rotation F(X,Y)×·" leaves F undefined. With the left-action conventions used throughout (A(ξ_P) = ξ, g⁻¹ġ = −a):
- the natural curvature is F = dA − ½[A∧A];
- the curvature of ∇ = d − a× is R^∇(X,Y) = −F(X,Y)×.

The sign is +F× only with the KN right-action form F_R = −F.

The Section 2 slide says the bead "has rotated by the holonomy". By Analysis B's own Proposition 2.2 it is by the **inverse** holonomy h⁻¹. Pick one convention; the direction of the animated turn depends on it.

#### A10. Theorem 4.4(d): convention attribution inconsistent
§0 states that the (x,f) ~ (gx, gf) convention *is* Kobayashi–Nomizu's convention via p·g := g⁻¹x. Under that dictionary KN's (p,z) ~ (pλ, λ⁻¹z) gives the same answer, L ≅ (π*Π)*, not π*Π.

L ≅ π*Π arises from the inverse (conjugate) representation, or from the different dictionary p·λ := λp (allowed because U(1) is abelian). Only |c₁| = 2 is convention-free, and that is what the slides should use.

#### A11. Smaller issues
- **Theorem 1.5(b) dihedral.** "det(s_i−s_j, s_k−s_j, s_l−s_k)/norms" is not the dihedral angle. The correct form is sin φ = |b₂| b₁·(b₂×b₃)/(|b₁×b₂||b₂×b₃|), with cos φ from (b₁×b₂)·(b₂×b₃).
- **Theorem 2.1, non-bundle locus.** The fibre over a collinear molecular pose, inside M̃, is {y not all on the axis}/SO(2)_x. That is a smooth (3k−1)-manifold, not a "cone". The base point [x] lies in Q/G (singular stratum), not in M (collinear shapes were excluded). The correct statement: fibre dimension drops from 3k to 3k−1 and the base point is singular.
- **§2.6(ii).** Transport also rotates B's centre-of-mass vector relative to A (the ℝ³ factor), not only the dumbbell azimuth.
- **Proposition 5.5.** "Fix the stator in space and swing the C–N axis" conflicts with Definition 4.1, where the stator contains N. It should read: CH₃ (with C) infinitely heavy, N moves with NO₂. The result is a limit statement; with real masses the rotor connection is not Levi-Civita.
- **Executive summary item 4.** "Lip projections vanish exactly on the non-free locus" is wrong. Each p_O vanishes on a larger set (one lip on the axis, still free). The pair (p₁, p₂) vanishes on the lip part of the non-free locus, which matches Theorem 4.4(a).
- **O(μ²) numerics.** The reported 9.3e-5 / 1.4e-6 / 5e-9 give ratios 66 and 280, inconsistent with a fixed-point test. I get 0.1→93.6, 0.01→99.3, 0.001→99.9 (Theorem 2.4(c) itself is correct). They probably used different random draws.
- **"Rigid frame + C₃ top model: torsion shift is an isometry".** This is vague. In the rigid model shape space is the torsion circle and B_rot is a point. On M, rotating the H's by −θ equals rotating the O's by θ (compose with a global rotation about the C–N line). So "CH₃ as top" vs "NO₂ as top" differ only as lifts to configuration space.
- **Proposition 2.8.** Needs Φ(P_N) ⊂ P_K. If bead weights are not mass-proportional, rotating about the weighted centre moves the molecular centre of mass and needs a translation correction (harmless).
- **Editorial.**
  - "Lemma 2.6" collides with "2.6 Natural maps".
  - "Theorems 4.5 and 4.7": 4.5 is a Proposition.
  - M_ax is used but never defined (only Q_ax is).
  - "Poincaré–Hopf for line bundles" should be "sum of zero indices of a section = c₁".

---

### B. Citation check

| Item | Status |
|---|---|
| Alba–Lusanna–Pauri, JMP 43, 1677 (2002), hep-th/0102087, as source for "N = 4 non-trivial SO(3) bundle" | **Likely misattributed.** The phrase I found ("N=4 static non-trivial SO(3) principal bundle of Ref.1") is in the same authors' 2005 review hep-th/0505005 ([arXiv](https://arxiv.org/html/hep-th/0505005v1)), citing *another* "Ref. 1". Replace with Littlejohn & Reinsch 1997 (next row). |
| Littlejohn & Reinsch, RMP 69, 213–275 (1997), doi:10.1103/RevModPhys.69.213 | Verified ([PDF](https://chaosbook.org/library/LiRe97.pdf)). The text on p. 232 says that for n = 3 the bundle is trivial (citing Iwai 1987b), and "For n≥4, globally smooth sections no longer exist, and the bundle is nontrivial" (OCR shows "n>4"; context implies ≥). **This is the right citation for Theorem 0.3.** |
| Guichardet, AIHP 40(3), 329–342 (1984) | Verified ([EuDML](https://eudml.org/doc/76239), [Numdam](https://www.numdam.org/article/AIHPA_1984__40_3_329_0.pdf)). Its Theorem 1 says that for ≥ 4 atoms, zero-angular-momentum ("vibrational") motions can realise any rotation, i.e. holonomy is all of SO(3). This is worth citing. |
| Iwai, AIHP 47(2), 199–219 (1987) | Verified ([EuDML](https://eudml.org/doc/76377)). The abstract says the Eckart frame "exists for any configuration... but not uniquely". Matches B. |
| Marsden, *Lectures on Mechanics*, LMS LN 174 (1992) | Verified. §3.3 "The Mechanical Connection" has the locked inertia tensor (3.3.1) and A = I⁻¹J (3.3.3), confirmed in the 2009 online version ([PDF](https://www.cds.caltech.edu/~marsden/volume/LecturesOnMechanics/lom.pdf)). Print pages may differ. |
| Montgomery, *Tour of Subriemannian Geometries*, AMS Surv. 91 (2002) | Verified ([AMS](https://pubs.ams.org/ebooks/surv/091/)). Ch. 14 "Falling, swimming, and orbiting", pp. 189–206; App. A "Geometric mechanics"; App. B "Bundles and the Hopf fibration" is also relevant. |
| Montgomery, "Gauge theory of the falling cat", Fields Inst. Commun. 1, 193–218 (1993), doi:10.1090/fic/001/09 | Verified ([CV](https://people.ucsc.edu/~rmont/vita2022.pdf), [Semantic Scholar](https://www.semanticscholar.org/paper/Gauge-theory-of-the-falling-cat-Montgomery/a9e063e5bc89d3251c6c1c188e4304ac5c9ff520)). |
| Shapere & Wilczek, Am. J. Phys. 57, 514–518 (1989), doi:10.1119/1.15986 | Verified ([Wilczek list](https://web.mit.edu/~csuggs/www/new06PUB-FW.pdf)). |
| Mitchell & Littlejohn, J. Phys. A 33(7) (2000), doi:10.1088/0305-4470/33/7/309, physics/9910001 | Bibliographic data verified ([arXiv](https://arxiv.org/abs/physics/9910001)). The content claim ("frame singularities; triviality ... left open") is not in the abstract: **UNVERIFIED**. |
| Cox & Waring (input geometry) | B marks the geometry "not independently verified"; it is now verified. A. P. Cox, S. Waring, "Microwave spectrum and structure of nitromethane", J. Chem. Soc. Faraday Trans. 2, 68, 1060–1071 (1972), doi:10.1039/F29726801060 ([RSC](https://pubs.rsc.org/en/content/articlelanding/1972/f2/f29726801060)): C–N 1.489, N–O 1.224 Å, ∠ONO 125.3°, ∠NCH 107.2°. C–H 1.088 Å is not in the abstract (**UNVERIFIED**; 1.089 is used elsewhere; the effect on the holonomy is +0.05°). |
| Tannenbaum, Myers, Gwinn, JCP 25, 42–47 (1956), doi:10.1063/1.1742845 | Bibliographic data verified. Abstract constants: B = 10542.7, C = 5876.6 MHz; NO₂ axial constant 13277.5 MHz, giving I_NO₂ = 38.06 amu Å² against the model's 37.82. The model gives B, C = 10591, 5908 MHz, agreeing to 0.5%. "6.03 ± 0.03 cal/mol": I saw only secondary confirmation (0.006 kcal/mol, [Pramana](https://www.ias.ac.in/article/fulltext/pram/025/02/0201-0209)); the exact digits are **partially verified**. A 2017 J. Mol. Spectrosc. study gives V₆ ≈ 2 cm⁻¹ ([ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0022285217303673)), consistent. |
| Tannenbaum, Johnson, Myers, Gwinn, JCP 22, 949 (1954), doi:10.1063/1.1740230 | Consistent (sixfold V₆(1−cos 6φ) model). |
| "2023 J. Phys. Chem. A misprint" | **Confirmed, but B gives no reference; add it.** Dalagnol, Bettega, Jones, Hoffmann, Souza Barbosa, Limão-Vieira, "Electronic State Spectroscopy of Nitromethane and Nitroethane", J. Phys. Chem. A 127(6), 1445–1457 (2023), doi:10.1021/acs.jpca.2c08023 ([PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9940216/)). It writes "0.26 meV (6 kcal mol⁻¹)". 0.26 meV per molecule = 25 J/mol = 6.0 cal/mol, so the meV figure is right and "kcal" is the misprint. |
| Kobayashi–Nomizu section numbers; Milnor–Stasheff corollary number (I believe Cor. 11.12) | UNVERIFIED, as B already says. |
| Lin–Swalen RMP 31, 841 (1959); Marsden–Montgomery–Ratiu Mem. AMS 436 (1990); Cendra–Marsden–Ratiu Mem. AMS 722 (2001) | Match my knowledge; not re-searched. |

---

### C. Claims checked and confirmed

**Section 0**
- Lemma 0.1, including ξ·Iξ = Σm|ξ×x_i|².
- Lemma 0.2: equivariance and H = V^⊥ via ⟨ξ×x, u⟩ = ξ·L.
- Theorem 0.3:
  - (a) N = 3 trivial;
  - (b) the rank-≤1 set has codimension 2N−4 (10 for nitromethane), π₁(P) = 0, and triviality would force ℤ/2 ⊂ π₁, so the bundle is non-trivial; π₁(M) = 0; E is non-trivial; collisions (codimension 3) are harmless.

**Section 1**
- Propositions 1.2 and 1.3.
- Corollary 1.4: the s_i and their cross products span E on non-collinear shapes.
- Theorem 1.5(a): φ_{gx} = φ_x∘g⁻¹ and P ≅ SO(E).
- Theorem 1.5(b): the O(3)-to-SO(3) argument via the reflection in the plane.
- Proposition 1.6: g⁻¹ġ = −a; ∇φ = dφ − a×φ; Σ m s×∇s = 0; uniqueness via −𝕀β.

**Section 2**
- Theorem 2.1 (fibre over the part's free set).
- Proposition 2.2: Hol_E = h⁻¹.
- Proposition 2.3.
- Theorem 2.4:
  - (a) both directions, including (M_tot − μ)c = Mc;
  - (b);
  - (c) the first-order formula. Atoms contribute exactly 0 because Σ m u = 0. Error ratios: 93.6, 99.3, 99.9.
- Lemma 2.6 and Proposition 2.7: TS ∩ V^⊥ = ker Ã|_TS.

**Nitromethane (Example 2.5)**
- Principal moments 41.063, 47.720, 85.542 amu Å².
- I_NO₂ = 37.823 and I_CH₃ = 3.241 amu Å².
- C–N is a principal axis at all torsions.
- Holonomy 360°·3.2407/41.0632 = **28.411°**, matching the ODE integration of the mechanical connection (28.4111°, axis = C–N).
- CH₃ −331.59° and NO₂ +28.41°.

**Section 3**
- Lemmas 3.1 and 3.2.
- Propositions 3.3 and 3.4.
- Theorem 3.5 and the stabiliser table.
- Answer 3.6 is the correct resolution of the user's doubt: in ℝ³ every nonzero vector has stabiliser SO(2); in ℝ² only the origin is fixed.

**Section 4**
- Lemma 4.2 (freeness criterion; F–NO₂ degenerate).
- Proposition 4.3:
  - E⊕E = ℝ²⊕Π⊕Π;
  - fibre ℝ²×ℝ_{>0}×ℂP¹;
  - dimensions 15, 9, 6, 14.
- Theorem 4.4(a–c, e).
- Proposition 4.5:
  - Π|_S ≅ TS², c₁ = 2;
  - UTS² ≅ SO(3) ≅ ℝP³, π₁ = ℤ/2;
  - the dihedral field is the gradient of the height function, zeros ±v̂_H, indices +1 and +1.
- Proposition 4.6:
  - Hopf, c₁ = ±1;
  - the centre-of-mass pitfall at p₂ = −p₁;
  - q = 0 iff the projected distribution is isotropic;
  - |q| = 37.82 = Σm|p|², maximal anisotropy.
- NO₂ inertia about N: 37.82, 10.12, 47.94.

**Section 5**
- Proposition 5.3:
  - (b) formula A = ℓ(u^h)/ℓ(ζ^h), and |ζ^h|²/|ζ|² = I_CH₃/I_∥ = 0.0789;
  - (c) U(1) averaging works because ρ_*ζ = ζ;
  - (d).
- Proposition 5.4 equivalence (needs only C₂ lips).
- Proposition 5.5 (heavy-stator limit):
  - horizontal iff ê·ω = 0;
  - ḟ = −ê(ê̇·f), i.e. Levi-Civita transport;
  - cone holonomy 2π(1−cos α), same sense as the loop: 30° gives 48.23° (numerical transport 48.232°); 60° gives 180°;
  - ∫K = 4π = 2πc₁.
- Proposition 5.6 (any connection on a bundle over S² with c₁ ≠ 0 is curved; a flat one must be singular).
- §5.2: θ̇ = A_rot(ẋ) − a_σ(ḃ).

**Barrier conversion**
- 6.03 cal/mol = 25.23 J/mol = 2.109 cm⁻¹ = 0.261 meV per molecule = 0.0101 k_BT at 300 K.

---

### D. Scope gaps
- The user's third topic is not treated anywhere in Analysis B: Brownian motion on shape space with horizontal SO(3) transport, and whether the expected orientation change relates to Ricci or scalar curvature. Analysis B also contains no Lévy-area constants to check. This part must come from another analysis.
- The rotor connection's physical choice off Σ is correctly labelled [O] (open).

---

# Referee report on analysis C (noise and curvature)


**Verdict.** The core mathematics holds up. I recomputed every key constant and they are all right: Lévy's laws, the 1/24 for small nonabelian loops, O'Neill's ¾, Ω = 2I⁻¹J, the t²s_M/18 link, the OU formulas, and the bead-model numbers. That includes a direct curvature computation that does not rely on O'Neill.

The defects are of three kinds:
- one sign error in a side formula;
- several wrong or misleading side statements (a dimension threshold, "CHⁿ is confined", a "gauge-invariant" open-path quantity, and an invalid argument in the U(1) side finding, whose conclusion survives only in a weaker form);
- citation slips, and animation numbers that need labels or caveats. The bead geometry itself has an unrealistic O–N–O angle.

---

### A. Errors and required corrections

**A1. O'Neill's vertical formula {0} has its signs flipped (C7).**
- **Claim:** K_P(U,V) = K_fibre(U,V) − |T_UV|² + ⟨T_UU, T_VV⟩.
- **Why it is wrong:** By the Gauss equation, K_ambient = K_intrinsic − ⟨II(U,U), II(V,V)⟩ + |II(U,V)|². Test it on the unit sphere in ℝ³: the correct form gives 1 − 1 + 0 = 0, while the stated one gives 2.
- **Corrected:** K_P(U,V) = K_fibre(U,V) + |T_UV|² − ⟨T_UU, T_VV⟩ (O'Neill 1966; Besse 9.29a). Nothing downstream uses it, but it must be fixed.
- Formula {1} and the horizontal formula {2} are correct as stated.

**A2. "In dimension ≥ 3, BM does not return exactly to its start (points are polar)" (C4).**
- **Why it is wrong:** Points are polar for every d ≥ 2. Planar BM is neighbourhood-recurrent but almost surely never revisits a given point after t > 0.
- **Corrected:** "In dimension ≥ 2." This already applies to the planar Part 0 model, which is why bridges are needed there too.

**A3. Side finding (rotor U(1)): non-isometry does not imply that the orthogonal complement fails to be invariant.**
- **The claim:** max|JᵀGJ − G| = 160, "consequently" the orthogonal complement of the rotor orbits is not U(1)-invariant.
- **Why the argument fails:** Invariance only requires (Φ*G)(w, V) ∝ G(w, V). That is much weaker than Φ*G = G.
- **What I computed** (in `rotorinv.py`):
  - At the drawn, mirror-symmetric pose, the defect is max|G(dΦ_φ w, V(Φ_φ x))| = 6.5×10⁻¹⁶ for φ = π/2 and π. So the complement is exactly invariant there, even though JᵀGJ − G reaches 160 and 347.
  - At a generic shape (a random 0.15 Å perturbation) the defect is 0.83 and 0.93.
- **Proof sketch.** Let e be the unit C₂→N axis, r_a = x_{O_a} − x_N, R = R_{e,φ}, η = e × δe, and δR = [η×, R]. Then

  G(dΦw, V(Φx)) − G(w, V(x)) = ⟨w_N, e × (R − I) Σ m_a r_a⟩ + Σ m_a (e·r_a) η·(I − R) r_a.

  Both terms vanish when the two O atoms are mirror images through the axis (r₁ + r₂ ∥ e and e·r₁ = e·r₂). Generic shapes violate this.
- **Corrected statement:**
  - The G-orthogonal complement of the rotor orbits is U(1)-invariant exactly along the mirror-symmetric locus, which has positive codimension, and fails off it.
  - Hence it is not a principal connection on any open set.
  - Fixes: average the connection form over U(1) (ω̄ = ∫Φ_φ*ω dφ/2π is a principal connection), or use a U(1)-averaged metric.
- The remark that "C7–C8 need an invariant metric" stands.

**A4. "Confined shapes (OU, or CHⁿ): diffusive" (take-away 8 and the C6 lesson).**
- **Why it is wrong:** CHⁿ is not confining. Brownian motion there is transient; Baudoin–Wang say so explicitly for CH¹. The √t scaling on CHⁿ has nothing to do with confinement.
- Meanwhile CPⁿ, which is compact and so genuinely confined, gives θ_t/t → Cauchy(n). That limit comes from the singular gauge.
- **Corrected:** "Long-time laws depend on the global geometry and the gauge. Confined with a smooth gauge (OU): diffusive. CPⁿ with singular α: θ_t/t → Cauchy(n). CHⁿ (transient): θ_t/√t → N(0,1)."

**A5. "The gauge-invariant object e^{iθ} simply equidistributes" (C6).**
- **Why it is wrong:** For an open path, e^{iθ_t} depends on the section.
- **Corrected:** The fibre position of horizontal BM on S^{2n+1}, read in any gauge, becomes uniform as t → ∞.

**A6. Logic gap in C4(i).**
- **Claim:** "E H = E H⁻¹, consequently E Θ = 0."
- **Why it does not follow:** E H = E H⁻¹ does not imply E log H = 0.
- **What is needed:** the stronger fact that H and H⁻¹ have the same law, which the time-reversal argument does give. Then E Θ(H) = E Θ(H⁻¹) = −E Θ(H).
- Also, "|Θ| = π has probability zero" needs the law of H to be absolutely continuous near the π-shell. That is fine for small loops on a simply connected region. It can fail globally, for example with a flat connection whose holonomy around a non-contractible loop is a π-rotation.
- Reversibility of the base diffusion is required. A gradient drift is fine; a non-gradient drift is not. So take-away 3's "for every bundle" should read "for every bundle, with a reversible base diffusion".

**A7. Normalisation missing in C10(a).**
- **Claim:** D_rot = D⟨F, (−∇·e^V∇)⁻¹F⟩.
- **Derivation:** e^{−V}a = ∇^⊥ψ gives F = ∇·(e^V∇ψ), and so D_rot = (D/Z)⟨F, (−∇·e^V∇)⁻¹F⟩ with Z = ∫e^{−V}.
- **Corrected:** Either normalise V so that ∫e^{−V} = 1, or divide by Z. Also state the decay condition on ψ.
- The Gaussian check D_rot = λ²D²/(k₁ + k₂) is correct.

**A8. C0's reason for Itô = Stratonovich.**
- C0 says the two agree "because d⟨x,y⟩ = 0".
- The real reason is the one C1 gives: ⟨x,y⟩ = ⟨y,x⟩. So equality holds for every continuous semimartingale.
- More generally, the correction for ∫a∘dX involves only the symmetric part of ∂a. That is exactly the term C10(a) uses.

**A9. Smaller slips.**
- **C6:** the sentence "(1/λ) sech(πθ/λ)/1…" is garbled. It should read: θ_t/t has density (1/λ)·sech(πx/λ).
- **C4 Monte Carlo:** called "constant so(3) curvature". The connection A_i = ½xʲF_ji with non-commuting F_ij has curvature F_ij + [A_i, A_j], which depends on x. It tests the leading order only, which is all that is needed.
- The agreement there is 1–2.4% at M = 20 000 samples, roughly 2σ. That is acceptable but not stronger.
- **Take-away 3:** "rms angle = |curvature| × rms area" holds for one plane. In general the rms angle is (Σ_{i<j}|Ω_ij|²)^{1/2} · t/√12.
- **C3.2:** the minimal-variance property is proved only for planar BM started at the symmetric-gauge centre. On a curved shape space, "geodesic closure" (Samuel–Bhandari; Krishna–Samuel–Sinha) is a convention by analogy; it is not proven to minimise variance.
- **Yor attribution:** Baudoin–Wang describe Yor's proof as a rotation-invariance plus Girsanov→OU argument. The skew-product argument in C2 is also valid; it is just attributed loosely.

---

### B. Overclaims and missing caveats

**B1. Physical observability of t²s_M/18 (C8 slide).**
- Physical atomic Brownian motion also has vertical noise, i.e. rigid rotational diffusion. In the mass metric with generator ½Δ, that adds E[Θ·IΘ] ≈ tr(I·I⁻¹)t = 3t.
- This dominates t²s_M/18 for t < 54/s_M ≈ 98 amu Å².
- The statement is correct for horizontal transport, as the user posed it. Physically, you only see it after removing the rigid rotation, i.e. by reconstructing the holonomy from the shape trajectory.

**B2. Part 0's fibre is ℝ, not U(1).**
- In Part 0 the vertical direction is a z-translation. "θ in degrees" and "E cos θ" in C12 require reading z mod 2π (a U(1) quotient).
- That is fine for the animation, but say so.

**B3. OU animation numbers (C12).**
- The rms values 44°, 63°, 90°, 128° are for a start at rest (X₀ = 0). With the stationary start used for D_rot they are 45.3°, 64.1°, 90.6°, 128.1°. Label which one is shown.
- "σ = 0.71 stays well inside ±1.65" is false: 1.65 is only 2.33σ. Each coordinate is outside about 2% of the time, the pair about 4%, so over t = 40 there will be many exits.
- Fix: clip or reflect, or reduce σ. For example k = 2, D = 0.5 gives σ = 0.5, at the cost of D_rot = 0.0156.
- E cos θ(t = 20) = 0.296 (exact, from 0) against the Gaussian 0.291: confirmed.

**B4. Bead model versus real nitroethane.**
- The bead geometry uses HALF_MOUTH = 52°, i.e. O–N–O = 104°. Real nitro groups have about 125°.
- The drawn pose has C–C–N–O ≈ 33°. The gas-phase minimum is syn, at 0°.
- With O–N–O = 125° (`bead_real.py`) the numbers change:

  | Quantity | Bead model as drawn (104°) | O–N–O = 125° |
  |---|---|---|
  | Holonomy of one rotor turn | 100.6° about an axis 17.2° off the C₂→N axis | 81.6° (≡ −278.4°) about an axis 17.8° off |
  | Σ\|Ω_ij\|² (Euclidean, rad²/(amu Å²)²) | 7.19×10⁻³ | 6.03×10⁻³ |
  | s_M, (amu Å²)⁻¹ | 0.552 | 0.527 |
  | rms rotation of a Brownian loop | 1.40° × t | 1.28° × t |

- The analysis's numbers belong to the cartoon geometry. Say so on screen, or fix the angle.

**B5. "Largest basis-plane sectional curvature 0.053" depends on the basis.**
- The true maximum over horizontal 2-planes at X₀ is about 0.083 (amu Å²)⁻¹ (multistart optimisation).
- The average sectional curvature is s_M/72 ≈ 0.0077.

**B6. Nitroethane barrier.**
- The analysis marks it UNVERIFIED. It can now be stated: gas electron diffraction plus quantum chemistry (J. Mol. Struct. 2008, ScienceDirect PII S0022286007002037; authors not checked) gives a barrier of 50–200 cm⁻¹, most probably about 120 cm⁻¹, with the minimum at syn.
- That is about 0.6 k_BT at 300 K: a low but real barrier, not "essentially free".
- An older microwave paper (Chem. Phys. Lett. ~1973, PII 0009261473800867) reports "nearly free" rotation.
- Nitromethane is verified: V₆ = 6.03 ± 0.03 cal/mol ≈ 2.1 cm⁻¹, against k_BT = 208 cm⁻¹.

**B7. "Diffusing rotor ≈ 0.52 D_φ" (correctly tagged Heuristic).**
- 0.52 is the diffusion rate of the unwrapped angle. It is right when the frame path is close to a pure counter-rotation, which my SU(2) lift supports.
- Write R(φ) = H^{φ/2π}Q(φ) with Q periodic. Orientation correlations then decay at rates (α/2π + k)²D_φ, with α = 100.6°.
- A small k = 0 component (rate 0.078 D_φ) exists because the axis wobbles, and it dominates eventually at small amplitude.
- Torsion alone also never randomises the axis.

---

### C. Citations

**Confirmed by search, plus content where stated:**
- Lévy, C. R. Acad. Sci. Paris 230 (1950) 432–435, errata p. 689. The title matches.
- Lévy, Proc. 2nd Berkeley Symp. (1951) 171–187, bsmsp/1200500228.
- Baudoin–Wang, arXiv:1602.06470 / PTRF; full text checked:
  - eq. (1.1) uses S = ∫(x dy − y dx) = 2A, so C2's conditional formula matches;
  - Thm 2.9 gives θ_t/t → Cauchy with parameter n on CPⁿ;
  - Thm 3.7 gives θ_t/√t → N(0,1) on CHⁿ;
  - α on CPⁿ is singular (dα is the Kähler form only almost everywhere);
  - Caution: their introduction writes the planar loop density as ∝ sech²(πs/t) for S. That is the law of A, not of S = 2A. C2's (π/2t) sech²(πa/t) for A is correct.
- Arnaudon–Thalmaier, Ann. Probab. 31 (2003) 769–790. The abstract says: Yang–Mills ⇔ all drift terms up to order 3 vanish ⇔ the average rotation along small bridges and loops is of order 4. This is consistent with C4: loops alone never have an ε³ term, and the Yang–Mills content sits in bridges with distinct endpoints.
- Vassilevich, Phys. Rep. 388 (2003). **Equation numbers are wrong:**
  - a₄, with 30Ω_ijΩ_ij, is eq. (4.28). Eq. (4.27) is a₂.
  - Eq. (4.15) is only the general ansatz. α₁₀ = 30 is obtained from (4.25).
  - Eq. (4.25) is the untraced flat-space local expansion with (1/12)Ω_μνΩ_μν. It directly supports the "untraced" claim.
- Elworthy–Le Jan–Li, arXiv:0810.2253, Ch. 7: "p maps Brownian motion to Brownian motion iff p has minimal fibres" (following Liao). Their formula also confirms C8's projected drift ½∇log vol(orbit).
- Bernard–Campbell–Davie, Ann. Inst. Fourier 29 (1979) 207–228, doi:10.5802/aif.735. It exists, but it treats maps between Euclidean domains that preserve BM up to a time change (harmonic morphisms), so it is only a special case of the minimal-fibre criterion.
- Silva–Efrati, arXiv:2503.11278 (14 Mar 2025, nlin.CD), full text checked:
  - eq. (17): loop ⟨A²⟩ → D²T²/3, which equals t²/12 under t → 2DT;
  - eq. (18): ⟨A²⟩ → D²fT/α;
  - Appendix C, eq. (C7): ⟨A²⟩ = (D²/Ω²)(TΩ − e^{−TΩ} sinh TΩ), identical to C9's from-0 formula with Ω = k.
  - So the isotropic λ²D²/(2k) is effectively already in their eq. (18), for the stationary-start loop ensemble. The anisotropic and n-dimensional rules are not.
- Saporta Katz–Efrati, PRL 122, 024102 (2019). The preprint arXiv:1706.09868 appears under a different title, "Rotational random walk of the harmonic three body system". In the text, cite as "Saporta Katz–Efrati".
- Español–Thachuk–de la Torre: now Eur. J. Mech. A/Solids 103 (2024) 105184, doi:10.1016/j.euromechsol.2023.105184, arXiv:2303.15295. The abstract says that at zero angular momentum the body explores all orientations; there is no gauge language.
- Antoine–Comtet–Desbois–Ouvry, "Magnetic fields and Brownian motion on the 2-sphere", J. Phys. A 24 (1991) 2581–2586. This fills in the title.
- Krishna–Samuel–Sinha, J. Phys. A 33 (2000) 5965–5971, doi:10.1088/0305-4470/33/34/302: geodesic closure for open paths.
- Desbois–Comtet, J. Phys. A 25 (1992). The title is confirmed; the first page is still unresolved (3095 or 3079).
- Iwai, J. Math. Phys. 28 (1987) 964–974, doi:10.1063/1.527588.
- Tannenbaum–Myers–Gwinn, J. Chem. Phys. 25 (1956) 42–47.
- Sinitsyn–Nemenman, EPL 77 (2007) 58001.
- Putterman–Raz, Am. J. Phys. 76 (2008) 1040, doi:10.1119/1.2952448.

**Still UNVERIFIED:** "Iwai's monopole of half strength" (the wording); the curvature blow-up statements attributed to Le–Kendall; the content of Besse Ch. 9 (I believe the stated scalar identity is Besse 9.37, from memory); Gilkey (the normalisation is consistent with Vassilevich).

---

### D. Claims I recomputed and confirm

**Planar Lévy area (C1–C2):**
- dω = −λ dx∧dy; a counter-clockwise loop lifts with a gap of +λS.
- `horizontalLift` (z += (λ/2)(x₀y₁ − y₀x₁)) and TWIST = 0.5 match the code.
- Free BM: characteristic function 1/cosh(μt/2), density (1/t)sech(πa/t), E A² = t²/4.
- Loop: (μt/2)/sinh(μt/2), logistic density (π/2t)sech²(πa/t), E A² = t²/12, P(A > a) = 1/(1 + e^{2πa/t}).
- Conditional characteristic function (integrating it over z gives back 1/cosh).
- The skew-product proof, Cameron–Martin and Mehler.
- Landau-kernel ratio (Bt/2)/sinh(Bt/2).
- E cos θ = 1 − λ²t²/24 + O(t⁴).

**Gauges (C3):**
- Landau gauge gives λ²t²/2; it differs from the symmetric gauge by f = (λ/2)xy.
- E[A | B_t] = 0, so the symmetric gauge minimises the mean square.

**No global section (C3.3):**
- The collinear set has dimension N + 1 and codimension 2N − 4 ≥ 4.
- So P_nc is simply connected; the bundle would be trivial, forcing ℤ/2 ⊂ π₁ — a contradiction.
- For N = 3 the Gram–Schmidt frame is a global section.

**Small loops (C4):**
- E S₂ = ½E(∮A)² by reversal.
- E[a^{ij}a^{kl}] = (t²/12)δ.
- E H = I + (t²/24)Σ_{i<j}F_ij² + O(t³).
- Cross-check with Vassilevich: 30/360 = 1/12 for generator Δ, hence 1/24 for ½Δ.
- The SO(3) forms of (iii) are consistent with (ii) via [Ω]×² = ΩΩᵀ − |Ω|²I.
- The predicted Monte Carlo values (7.81e−4, 3.13e−3, 1.25e−2) are right.
- A gradient drift changes only O(t³): the linear part of the Girsanov weight is odd.

**O'Neill and molecules (C7):**
- K_M = K_P + ¾|Ω|²_I; Ω(u,v) = 2I⁻¹Σ m u×v on horizontal vectors; K = 3J·I⁻¹J ≥ 0; Ric and s_M = (3/2)Σ|Ω_ij|²_I.
- **Independent check:** I computed the curvature of the N = 4 quotient metric directly, in pairwise-distance coordinates, by finite differences (`oneill_check2.py`). It agrees with 3J·I⁻¹J to 0.1–0.8% on four random planes, with values 7×10⁻⁴ to 2.6×10⁻².
- Unbounded curvature near collinear configurations for N ≥ 4, and bounded for N = 3 (the out-of-plane bend along the only profile is a rotation about the line).
- Planar three-body: K = 3/ρ², |Ω| = 2/ρ², holonomy = ½ × solid angle. Kendall's 4 = 1 + 3.
- Heisenberg: K = −¾λ², s = −λ²/2, Kaluza–Klein formula.

**C8:**
- t²/12 · Σ|Ω|²_I = t²/9 · Σ(K_M − K_P) = t²/18 · (s_M − ΣK_P).
- Bead check: 0.3677/12 = 0.552/18 = 0.0306.
- Projected drift ¼∇log det I.
- Return probability (2πt)^{−n/2}(1 + s_M t/12).

**OU (C9–C10):**
- Drift cancels in x dy − y dx; stationary Var = Dσ²t; from-0 variance formula.
- Characteristic function e^{kt}/(cosh γt + (k/γ) sinh γt). The Monte Carlo values match for μ = 1, 2, 4 (0.7408, 0.338, 0.0339).
- D_rot = λ²D²/(2k); NIG exponent with α = k/(λD), δ = λD.
- Anisotropic λ²D²/(k₁ + k₂); n-dimensional D²ΣΩΩᵀ/(k_i + k_j); trace identities.
- σ² = 0.044 amu Å² for a 400 cm⁻¹ mode at 300 K; ratio s_Mσ²/9 ≈ 2.7×10⁻³.

**C12 Part 0 table:** every entry is correct.

**Bead model (as coded):** I recomputed everything with my own code.
- Principal moments 36.29, 118.94, 149.92 amu Å².
- Σ|Ω|² = 7.189×10⁻³; ΣΩ·IΩ = 0.3677; s_M = 0.5516; rms 1.402° × t.
- Rotor holonomy 100.604° about (0.9554, −0.2369, −0.1764), 17.18° from C₂→N.
- A continuous SU(2) lift confirms the frame actually turns by −259.4° (mod 720°), so the counter-rotation interpretation is right.

---

### Files

My scripts (now in many-bundles-checks/, prefixed referee-C-):
- `many-bundles-checks/referee-C-bead.py`: curvature, maximum sectional curvature, Magnus holonomy.
- `many-bundles-checks/referee-C-unwrap.py`: SU(2) lift of the rotor holonomy.
- `many-bundles-checks/referee-C-rotorinv.py`: U(1) invariance test.
- `many-bundles-checks/referee-C-oneill_check2.py`, output in `many-bundles-checks/referee-C-oneill_out.txt`: direct curvature check for N = 4.
- `many-bundles-checks/referee-C-bead_real.py`, output in `many-bundles-checks/referee-C-bead_real_out.txt`: numbers with O–N–O = 125°.

Code checked:
- `/Users/I745505/private/thesis/animation/src/videos/bundles/shared.js` (HALF_MOUTH = 52°)
- `/Users/I745505/private/thesis/animation/src/videos/part-0/shared.js` (horizontalLift)
- `/Users/I745505/private/thesis/animation/src/videos/part-0/bundleBox.js` (TWIST = 0.5)

### Sources
- [Baudoin–Wang, arXiv:1602.06470](https://arxiv.org/abs/1602.06470)
- [Arnaudon–Thalmaier, Ann. Probab. 31 (2003)](https://projecteuclid.org/journals/annals-of-probability/volume-31/issue-2/Yang--Mills-fields-and-random-holonomy-along-Brownian-bridges/10.1214/aop/1048516535.full)
- [Vassilevich, arXiv:hep-th/0306138](https://arxiv.org/abs/hep-th/0306138)
- [Lévy bibliography (S. J. Taylor, LMS obituary)](https://mathshistory.st-andrews.ac.uk/LMS/levy_paul_lms_obit.pdf)
- [Lévy, Berkeley Symposium 1951](https://projecteuclid.org/ebooks/berkeley-symposium-on-mathematical-statistics-and-probability/Proceedings-of-the-Second-Berkeley-Symposium-on-Mathematical-Statistics-and/chapter/Wieners-Random-Function-and-Other-Laplacian-Random-Functions/bsmsp/1200500228)
- [Silva–Efrati, arXiv:2503.11278](https://arxiv.org/abs/2503.11278)
- [Español–Thachuk–de la Torre, arXiv:2303.15295](https://arxiv.org/abs/2303.15295)
- [Español–Thachuk–de la Torre, Eur. J. Mech. A/Solids](https://www.sciencedirect.com/science/article/pii/S0997753823002760)
- [Saporta Katz–Efrati, PRL 122, 024102](https://link.aps.org/doi/10.1103/PhysRevLett.122.024102)
- [Saporta Katz–Efrati preprint, arXiv:1706.09868](https://arxiv.org/pdf/1706.09868)
- [Elworthy–Le Jan–Li, arXiv:0810.2253](https://arxiv.org/abs/0810.2253)
- [Bernard–Campbell–Davie (Numdam)](http://www.numdam.org/item/AIF_1979__29_1_207_0/)
- [Tannenbaum–Myers–Gwinn, J. Chem. Phys. 25 (1956) 42](https://pubs.aip.org/aip/jcp/article-abstract/25/1/42/204191/Microwave-Spectra-Dipole-Moment-and-Barrier-to?redirectedFrom=fulltext)
- [Nitroethane electron diffraction, J. Mol. Struct. (2008)](https://www.sciencedirect.com/science/article/abs/pii/S0022286007002037)
- [Nitroethane microwave spectrum, Chem. Phys. Lett.](https://www.sciencedirect.com/science/article/abs/pii/0009261473800867)
- [Krishna–Samuel–Sinha, arXiv:cond-mat/0005345](https://arxiv.org/abs/cond-mat/0005345)
- [Comtet–Desbois–Texier, citing Desbois–Comtet 1992](https://arxiv.org/pdf/cond-mat/0504513v2)
- [Antoine et al. 1991, as cited in arXiv:1207.2569](https://arxiv.org/html/1207.2569v1)
- [Iwai 1987 (Semantic Scholar)](https://www.semanticscholar.org/paper/A-gauge-theory-for-the-quantum-planar-three%E2%80%90body-Iwai/e0ac791a12dba62c1c8c37b81f7ee418be6a8f7c)
- [Sinitsyn–Nemenman, EPL 77 (2007) 58001](https://iopscience.iop.org/article/10.1209/0295-5075/77/58001)
- [Putterman–Raz, Am. J. Phys. 76 (2008) 1040](https://pubs.aip.org/aapt/ajp/article-abstract/76/11/1040/1042360/The-square-cat?redirectedFrom=fulltext)