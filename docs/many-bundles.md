# One space, many bundles: the mathematics behind the video

Rigorous notes for the video in `src/videos/bundles`. The video shows only the
intuition; this file holds the precise statements, proofs or proof sketches,
the numbers the scenes use, and the references, so that every slide can be
backed up on request.

How it was made: three analyses (the rotor U(1) and the bundles in one
configuration space; associated bundles, coupling and the one-bead question;
Brownian motion, holonomy and curvature), each refereed independently with the
constants recomputed and the citations checked, then merged into these notes
with every referee correction adopted. The analyses and referee reports in full
are in [many-bundles-analyses.md](many-bundles-analyses.md). The numerical
checks are in [many-bundles-checks/](many-bundles-checks/) (Python with NumPy
and SciPy; run them from that folder).

Results marked "derived here" were not found in the literature. Treat them as
new until someone else has checked them, in particular E[Θ·IΘ] = t²s_M/18,
K_shape = 3 J·I⁻¹J, the axis-frame rotor connection and its curvature, the Chern
classes of the rotor bundle, and the rotational-diffusion formula
D_rot = D² Σ ΩΩᵀ/(k_i + k_j).

**Geometry used in the video.** The bead model is nitroethane with CH₃ and CH₂
as single beads (masses 15, 14, 14, 16, 16), C–C 1.52 Å, C–N 1.47 Å, N–O
1.22 Å, C–C–N 110°, O–N–O 125.3°. The analyses computed the bead-model numbers
for an earlier cartoon with O–N–O = 104°: one rotor turn at zero angular
momentum then gave 100.6° about an axis 17° off the bond. With the realistic
125.3° the video computes 81.4° about an axis 18° off the bond (referee C:
81.6° with C–N 1.489 Å), the rest turning back by 281°; referee C also gives
Σ|Ω_ij|² = 6.03×10⁻³ rad²/(amu Å²)² and s_M = 0.527 (amu Å²)⁻¹ for this
geometry, and an rms Brownian-loop rotation of 1.28° × t.

## 0. Conventions and editorial decisions

**0.1 Notation.**
- **Configuration space.** N atoms with masses mᵢ > 0 and M_tot = Σmᵢ. X = ℝ³ᴺ with the mass metric ⟨v, w⟩ = Σᵢ mᵢ vᵢ·wᵢ. X₀ = {Σmᵢxᵢ = 0} is the set of centred configurations.
- **Atom labels.** c = parent carbon, n = nitrogen, a, b = the two lips (O). The **rest** (frame, stator) F is all non-lip atoms, including c and n. p = N − 4 is the number of rest atoms other than c and n.
- **Axis and lip coordinates.**
  - Axis u = (x_n − x_c)/|x_n − x_c|, defined on X' = {x_c ≠ x_n}.
  - rᵢ = xᵢ − x_n, zᵢ = u·rᵢ, sᵢ = rᵢ − zᵢu, ρᵢ = |sᵢ|.
  - β is the signed angle from s_a to s_b about u.
  - u^⊥ is a complex line with i = u×.
- **Moments about the axis.** I_u = m_aρ_a² + m_bρ_b² (lips) and I_rest = Σ_{j∈F} mⱼρⱼ² (c and n contribute 0). I_tot = I_u + I_rest. Weights w_b = m_bρ_b²/I_u.
- **Rotations.** R_u(θ)v = cos θ v + sin θ u×v + (1 − cos θ)(u·v)u.
- **Symmetric loci.**
  - Σ_m = {m_a s_a + m_b s_b = 0, z_a = z_b}, the mass-weighted mirror locus.
  - For m_a = m_b this is Σ = {r_b = R_u(π)r_a}, the C₂-symmetric NO₂.
- **Shape space.** P = non-collinear centred configurations and M = P/SO(3). E = P ×_{SO(3)} ℝ³.

**0.2 Conventions.**
- **Associated bundles.** Left actions, with (x, f) ~ (gx, gf). The holonomy h of a loop is defined by x̃(1) = h·x̃(0) for the horizontal lift. Transport sends [x₀, v] to [x₀, h⁻¹v].
- **U(1) connections.**
  - A(ξ) = 1 and Φ_θ*A = A.
  - In a gauge x = Φ_φσ(b), A = dφ + σ*A.
  - hol(γ) = −∮σ*A = −∬F (mod 2π) when the loop bounds a disc in the gauge patch.
- **Curvature.** On horizontal vectors F(X̃, Ỹ) = dω(X̃, Ỹ) = −ω([X̃, Ỹ]). This is convention-independent. The sign of the bracket term in the structure equation depends on left versus right actions.
- **Chern numbers.** Quoted as (1/2π)∫F for the stated connection. The overall sign is a convention; |c₁| is not.
- **Brownian motion.** Generator ½Δ, so E dxⁱdxʲ = δⁱʲ dt. For the physics convention E dx² = 2D dt, replace t by 2Dt. A "Brownian loop" is a Brownian bridge.
- **Atoms are labelled** unless stated otherwise (see 1.10).
- **Units.** amu, Å, amu Å². For molecular Brownian formulas, time is measured in amu Å².

**0.3 Decisions on the referee reports.**
- **All referee corrections are adopted.** Their content is written into the statements below.
- **One disagreement (recomputed).** Referee B gives 4.74° for the unlabelled nitromethane torsion loop. The correct holonomy is 184.7°; 4.74° is only the NO₂'s lab turn (Result 9.5).
- **Two additions of my own.**
  - The exact invariance locus of the mass-orthogonal rotor connection on X for unequal lip masses (Result 8.1).
  - A consistency check that Analysis B's bond sphere is twice the generator of H₂(ℂP^{p−1}) (Result 3.4).

**0.4 Numerical-check scripts** (from the analyses and referees; not re-run here):
- many-bundles-checks/rotor_checks.py
- many-bundles-checks/torsion_holonomy.py
- many-bundles-checks/checks.py
- many-bundles-checks/cone.py
- many-bundles-checks/levy_check.py
- many-bundles-checks/nonabelian_check.py
- many-bundles-checks/nitro_curvature.py
- many-bundles-checks/referee-check_A.py
- many-bundles-checks/referee-ref_checks.py
- many-bundles-checks/referee-C-rotorinv.py
- many-bundles-checks/referee-C-bead_real.py
- many-bundles-checks/referee-C-oneill_check2.py

---

## 1. Group actions and principal bundles in X

**Result 1.1 (rotor action).** Define (Φ_θx)ᵢ = xᵢ for i ∉ {a, b} and (Φ_θx)ᵢ = x_n + R_{u(x)}(θ)rᵢ for i ∈ {a, b}. Then Φ is a smooth U(1)-action on the open, dense, invariant set X'.

*Proof.*
- Φ fixes x_c and x_n, so u(Φ_θx) = u(x).
- Hence R_u(ψ)R_u(θ) = R_u(ψ + θ), which is the group law.
- Smoothness follows from the formula for R_u. ∎

*Remark.* Any axis w = f(r_a, r_b) built SO(3)-equivariantly from the moving atoms also gives an action. Example: the bisector rotor, w = (r̂_a + r̂_b)/|·|. It commutes with the C–N rotor. On Σ it coincides with the C–N rotor when z > 0 and is its inverse when z < 0. It is a wag/rock mode, not the soft torsion.

**Result 1.2 (stabilisers on X).** Stab(x) is trivial if some lip is off the axis line, and all of U(1) otherwise. There are no finite stabilisers. Fix = {s_a = s_b = 0} has codimension 4, so X_free = X'∖Fix is open, dense, connected and simply connected (X' ≃ S²).

**Result 1.3 (principal bundle).** π: X_free → B = X_free/U(1) is a principal U(1)-bundle, and dim B = 3N − 1.

*Proof.*
- The action is free and, since U(1) is compact, proper. The Quotient Manifold Theorem (Lee, 2nd ed., Thm 21.10) gives the bundle.
- Explicit slices: on U_{i,k} = {u ≠ ±k, sᵢ ≠ 0}, the angle f of sᵢ from e_k(u) = (k − (k·u)u)/|·| satisfies f∘Φ_θ = f + θ. Then (θ, s) ↦ Φ_θs is an equivariant diffeomorphism U(1) × f⁻¹(0) → U_{i,k}. ∎

**Result 1.4 (commutation).**
- (i) Translations: Φ_θ(x + t) = Φ_θ(x) + t.
- (ii) Rotations and mirrors: Φ_θ(Qx) = QΦ_{det(Q)θ}(x) for Q ∈ O(3), because R_{Qu}(θ) = Q R_u(det Q·θ) Qᵀ.
- (iii) The lip swap P commutes with Φ_θ, and on Σ, Φ_π = P.

So the combined group is U(1) ⋊ E(3), with E(3) acting on U(1) by θ ↦ det(Q)θ, and SE(3) × U(1) is a direct product. (Checked to machine precision.)

**Result 1.5 (several rotors; corrected from Analysis A).** Let rotor k have axis atoms D_k^ax and moving set S_k, and write D_k = D_k^ax ∪ S_k. Rotors 1 and 2 commute in either of these cases:
- (a) **disjoint:** D₁ ∩ S₂ = ∅ and D₂ ∩ S₁ = ∅;
- (b) **nested:** D₁^ax ∩ S₂ = ∅ and D₂ ⊂ S₁ ∪ D₁^ax.

*Proof of (b).* Rotor 2 does not move axis 1. Rotor 1 moves all of D₂ by a single rigid motion g fixing axis 1. SE(3)-equivariance of rotor 2 then gives the commutation. ∎

For an acyclic bond graph rooted anywhere, each bond (p, c) rotates subtree(c)∖{c}. Every pair of bonds is in case (a) or (b), so the k torsions generate a torus action Tᵏ. Rings break this.

Nitromethane's NO₂ and CH₃ rotors are case (a). Their composite (diagonal) is the global rotation about C–N, so on M they act as mutually inverse rotations.

**Result 1.6 (product action, the diamond, descent to M).**
- **Freeness of SE(3) × U(1).** It acts freely on X' exactly where the rest is non-collinear and some lip is off the axis. Proof: (Q, t)Φ_θx = x forces (Q, t) to fix every rest atom; a non-collinear rest gives (Q, t) = id; then Result 1.2 applies.
- **Descent to M.** Φ̄_θ[x] = [Φ_θx] is well defined and smooth.
- **Stabilisers on M.** Φ̄_θ[x] = [x] if and only if Φ_θx = gx. This forces θ = 0 when the rest is non-collinear and some lip is off the axis. Otherwise all θ fix [x].
- **Non-free set on M.** It is the union of three pieces: {x_c = x_n} (codimension 3), {both lips on the axis} (codimension 4), and {rest ⊂ C–N line} (codimension 2(N − 4)). Hence:
  - N = 4 (e.g. F–NO₂): the rotor is never free on M;
  - N = 5: the non-free set has codimension 2;
  - N ≥ 6: it has codimension 4.
  This corrects Analysis B §3(ii).
- **The diamond.** X → X/U(1) and X → M = X/SE(3) both map on to X/(SE(3) × U(1)) = M/U(1). All four edges are principal bundles on the common free locus.
- **Centring.** Turning the lips moves the centre of mass unless x ∈ Σ_m. On X₀ the rotor is therefore "turn, then recentre", which is legitimate by (i).

**Result 1.7 (SO(3) bundle).**
- (a) Stab(x) is trivial if span{xᵢ} has dimension ≥ 2, SO(2) if it is a line, and SO(3) if x = 0. The locked inertia I(x) is invertible if and only if the span has dimension ≥ 2, since ξ·Iξ = Σm|ξ × xᵢ|².
- (b) P → M is a principal SO(3)-bundle with dim M = 3N − 6. The mechanical connection A = I⁻¹L has horizontal space {L = 0} = (orbit)^⊥.
- (c) For N = 3 the bundle is trivial: Gram–Schmidt on the two Jacobi vectors gives a global section, the "xxy gauge" of Littlejohn–Reinsch.
- (d) For N ≥ 4 the bundle is non-trivial, and so is E.
  - *Proof.* With k = N − 1 Jacobi vectors, {rank ≤ 1} has dimension k + 2, hence codimension 2N − 4 ≥ 4, so P is simply connected. A trivialisation P ≅ M × SO(3) would make π₁(SO(3)) = ℤ/2 inject into π₁(P) = 0. If E were trivial, three orthonormal oriented sections would trivialise SO(E) ≅ P (Result 4.4). ∎
  - The statement is in Littlejohn–Reinsch 1997, Sec. III.D, without proof.
- (e) Guichardet 1984, Thm 1 (per referee B): for ≥ 4 atoms, zero-angular-momentum motions realise every rotation, i.e. the holonomy group is SO(3).

**Result 1.8 (the energy is not needed; exact periodicities).**
- R1–R3 and 1.7 use only the group action on configurations. Energy invariance would add three things: descent of E to the base, a Noether charge, and dynamical meaning for a connection. The rotor has none of them exactly.
- On Σ, V(φ) = E(Φ_φx) satisfies V(φ + π) = V(φ). Proof: E(Φ_{φ+π}x) = E(Φ_φPx) = E(PΦ_φx).
- If the rest also contains a C₃ methyl about the same axis, V(φ + 2π/3) = V(φ). Proof: the NO₂ rotor equals a global rotation composed with the inverse CH₃ rotor, and the CH₃ rotor by 2π/3 is a permutation.
- Hence the period is π/3, a sixfold barrier.
- Numbers:
  - Nitromethane: V₆ = 6.03 cal/mol = 25.2 J/mol = 2.11 cm⁻¹ = 0.261 meV ≈ 0.01 k_BT at 300 K.
  - Nitroethane: about 120 cm⁻¹ (range 50–200, syn minimum) from electron diffraction (Tarasov et al. 2008), roughly 0.6 k_BT; "nearly free" from microwave work (Ekkers et al. 1973). The two disagree.

**Result 1.9 (the rotor is not an isometry; corrected from Analysis A).**
- **On X.** No Φ_θ with θ ≢ 0 is an isometry of (X', mass metric).
  - Take a variation δx that moves only x_c, so δx_n = 0. Lip i then moves by (δR)rᵢ, where δR = [η×, R] and η = u × δu.
  - For rᵢ = zu this equals z(I − R)δu, which is non-zero unless z = 0, δu = 0 or θ ≡ 0. Analysis A's exception "rᵢ ∥ u" was wrong.
  - Numerically |dΦ_θv|² ≠ |v|² (292.67 vs 292.78).
  - The right rigidity theorem is Liouville's (a C¹ map with orthogonal differential on a connected open set is rigid), not Mazur–Ulam.
- **On M (reduced metric).** Also not an isometry. At the symmetric locus, |u^h|² vs |(dρu)^h|² = 60.13 vs 63.06 and 98.96 vs 117.79 (referee B).
- **Consequence.** There is no Noether charge for the rotor, and the "orthogonal complement" connection is principal only on a special locus (Result 8.1).

**Result 1.10 (labelled versus unlabelled atoms).**
- Everything above assumes labelled atoms.
- If identical nuclei are identified, Φ_π fixes every point of Σ, which is the physically relevant set. The rotor then has ℤ/2 isotropy there, and the base is an orbifold.
- The natural variable is the doubled angle, represented by q = Σ m_O p_O² ∈ Π^{⊗2} (Result 7.3). On the bond sphere that bundle has c₁ = 4.
- The molecular symmetry group of nitromethane is G₁₂ (Longuet-Higgins 1963; Dawadi et al. 2017).

---

## 2. The base of the rotor bundle

**Result 2.1 (Hopf description on X).**
- Set ψᵢ = √mᵢ sᵢ ∈ u^⊥ ≅ ℂ and ψ̄_aψ_b := ψ_a·ψ_b + i u·(ψ_a × ψ_b). This needs no choice of frame.
- Define h = (|ψ_a|² − |ψ_b|², 2ψ̄_aψ_b) ∈ ℝ³∖0. Then |h| = I_u, and h = (m_aρ_a² − m_bρ_b², 2√(m_am_b)ρ_aρ_b cos β, 2√(m_am_b)ρ_aρ_b sin β).
- The map x ↦ (rest, z_a, z_b, h) induces a diffeomorphism

  X_free/U(1) ≅ F' × ℝ² × (ℝ³∖0) ≃ S²(bond) × S²(Hopf).

*Proof.* The map is invariant. Fibrewise it is the Hopf map ℂ²∖0 → ℝ³∖0, a surjective submersion whose fibres are exactly the U(1)-orbits. ∎

**Result 2.2 (base over shape space; Analysis B 4.3).**
- Suppose the part (the rest) is non-collinear. Then M ≅ P_part ×_G (ℝ³)² = E_part ⊕ E_part over M_part, the fibre coordinates being the lip vectors from N.
- With ê a unit tautological section of E_part and Π := ê^⊥ (a complex line bundle, J = ê×), this becomes M ≅ ℝ² ⊕ Π ⊕ Π over M_part.
- The rotor is scalar multiplication by e^{iθ} on Π ⊕ Π.
- Hence B_rot fibres over M_part with fibre ℝ² × ℝ_{>0} × ℂP¹. The ℂP¹ coordinate is p_b/p_a: its modulus is the ratio of the distances to the axis, its argument the relative azimuth β (π for planar NO₂).
- Nitromethane: dim M = 15, dim M_part = 9, fibre dimension 6, dim B_rot = 14.

**Result 2.3 (never a bead model).** 3N − 1 ≠ 3K, 3N − 4 ≠ 3K − 3, and 3N − 7 ≠ 3K − 6, because 3(N − K) ≠ 1. h is SO(3)-invariant, so it is an internal vector, not a position in space.

On Σ the quotient is the rest plus one "ring bead" on the axis, with height z and radius ρ. That is the closest the base comes to a coarse-grained molecule.

*Remark (what "splitting" buys).* The rotor bundle is the pullback along u of a universal bundle defined by the rotor alone. Splitting the molecule into a rotating part and a rest buys approximate energy invariance and commutation with other torsions. It does not buy the bundle: a ringed rotor would still be a free action.

---

## 3. Sections and triviality

**Result 3.1 (translations).** σ([x]) = x − X_cm(x) is a global section of X → X/ℝ³. It is SO(3)-equivariant and permutation-invariant, and it is the leaf X_cm = 0 of the flat mechanical connection dX_cm. Every principal ℝ³-bundle over a paracompact base is trivial.

**Result 3.2 (rotor: local sections).**
- For a rest atom j off the axis, the dihedral τ = ∠(s_j → s_a about u) satisfies τ∘Φ_θ = τ + θ and is SO(3)-invariant. So {τ = 0} is a section on {s_j ≠ 0, s_a ≠ 0}.
- It fails exactly where atom j or lip a crosses the C–N line.
- On the chemically accessible region of nitroethane (C–C–N ≈ 110°, C–N–O ≈ 117–128°), neither C₁ nor the O atoms reach the axis. So the rotor bundle is trivial there, on X and on M, via τ(C₁, C₂, N, O_a).

**Result 3.3 (global non-triviality on X).** X_free → B has no continuous section. With A_LC (Result 8.2), (1/2π)∫F = −2 on the bond sphere and +1 on the Hopf sphere.

*Proof.*
- *Bond sphere.* Fix the rest except N, with x_c = 0 and x_n = u ∈ S². Put lip a at x_n + zu + ρv and lip b at x_n + zu + ρR_u(β)v, with v ∈ T¹_uS². This is an equivariant embedding of the unit tangent bundle T¹S² → S². A global section would give a nowhere-zero vector field on S², contradicting the hairy-ball theorem.
- *Hopf sphere.* Fix the rest and let (ψ_a, ψ_b) range over S³; the pullback is the Hopf bundle. ∎

**Correction (referee A1).** On the bond sphere the lip shadow s_a = ρv never vanishes. The class 2 is carried by the zeros of a reference direction: for a fixed rest atom j, s_j(u) has zeros of index +1 at u = ±x̂_j.

**Result 3.4 (global non-triviality on M; corrected hypothesis).**
- **Hypothesis.** Some rest atom other than c, n is off the C–N line, so N ≥ 5.
- **Statement.** Then M_free → M_free/U(1) is non-trivial. The base is homotopy equivalent to ℂP^{p−1} × ℂP¹, and c₁ = (∓1, ±1) on the two generators.
- **Proof.** Use SO(3) to set u = e_z with c at the origin. The residual SO(2) acts diagonally on the rest's perpendicular parts F ∈ ℂ^p∖0 and the lips' L ∈ ℂ²∖0, while the rotor multiplies L alone. The Hopf sphere (rest fixed) already proves non-triviality.
- **Why the exact-sequence proof needs more.** Analysis B's route via π₁(M^♮) = 0 needs codimension 2(N − 4) ≥ 3, i.e. N ≥ 6.
- **Bad cases.** For N = 4 there is no rotor bundle on M at all, since M^♮ = ∅.
- **Consistency check (my computation).** Take B's sphere of bond directions relative to a rigid methyl (rigid symmetric NO₂). It maps into ℂP^{p−1} with degree 2, because the pullback of O(−1) is Π* ≅ (TS²)*. So |c₁| = 2 there, in agreement with Result 7.2.
- **The animation's 5-bead model (p = 1).** The base is homotopy equivalent to ℂP¹, and the only obstruction is the lips crossing the axis.

**Result 3.5 (SO(3)).**
- The bundle is trivial for N = 3 and non-trivial for N ≥ 4 (Result 1.7).
- Eckart frames exist at every configuration but not uniquely (Iwai 1987), so they are not a smooth single-valued global section.
- Principal-axis frames are singular where moments coincide.
- Over any region that deformation-retracts onto the torsion circle, the SO(3)-bundle is trivial, because SO(3) is connected.

**Result 3.6 (no canonical section).** "Canonical" here means equivariant under permutations of identical nuclei.
- (i) There is none for the SO(3)-bundle at any [x] with Px = Qx for some permutation P and some Q ≠ I.
- (ii) There is none for the rotor bundle through any point of Σ ∩ X_free.

*Proof of (ii).* On Σ, P = Φ_π. Equivariance would give σ(b) = Φ_πσ(b), which contradicts freeness. ∎

Dihedral sections break the swap: τ_b = τ_a + π on Σ. The centre-of-mass section is canonical.

**Remark 3.7.** Each fibre is a torsor, so "only relative to where you started" holds always. "No global section" is a topological statement that depends on the region considered.

---

## 4. Associated bundles (Analysis B §1; all confirmed by referee B)

- **Proposition 4.1.** P ×_G F → M is a smooth fibre bundle with fibre F for every smooth G-space F; freeness on P suffices.
- **Proposition 4.2.** Sections correspond bijectively to equivariant maps f: P → F, via s_f([x]) = [x, f(x)].
- **Corollary 4.3 (tautological sections).**
  - sᵢ([x]) = [x, xᵢ] are sections of E, with Σmᵢsᵢ = 0.
  - Together with their cross products they span E on non-collinear shapes.
  - The dipole moment is a section of E and the inertia tensor a section of Sym²E.
- **Theorem 4.4.**
  - (a) φ_x: v ↦ [x, v] is an oriented isometry ℝ³ → E_{[x]} with φ_{gx} = φ_x∘g⁻¹, and x ↦ φ_x is an equivariant diffeomorphism P → SO(E). Also xᵢ = φ_x⁻¹(sᵢ).
  - (b) m = m' if and only if some oriented isometry E_m → E_{m'} carries sᵢ(m) to sᵢ(m') for all i. Internal coordinates are fibre invariants of the sᵢ. The dihedral angle (corrected formula, with b₁ = s_j − s_i, b₂ = s_k − s_j, b₃ = s_l − s_k) is given by
    - sin φ = |b₂| b₁·(b₂×b₃)/(|b₁×b₂||b₂×b₃|),
    - cos φ = (b₁×b₂)·(b₂×b₃)/(|b₁×b₂||b₂×b₃|).
  - (c) For N ≥ 4 the global sections sᵢ span E, but E is non-trivial.
- **Proposition 4.5 (characterisation of the mechanical connection).**
  - (a) ∇_X s_f = [x, df(X^h)]. In a gauge, ∇φ = dφ − a × φ.
  - (b) ∇sᵢ is atom i's velocity in the L = 0 frame, so Σmᵢ sᵢ × ∇sᵢ = 0.
  - (c) The mechanical connection A is the unique principal connection with property (b). Proof: for A' = A + β, the sum becomes −𝕀β, and the inertia endomorphism 𝕀 is positive definite on non-collinear shapes, so β = 0.

---

## 5. Coupling (Analysis B §2, with referee corrections)

**Theorem 5.1 (the whole over a part).** Add k beads, with positions y_a measured from the molecule's centre of mass. On Q̃₀ = P × ℝ^{3k}, the shape space is M̃₀ = P ×_G ℝ^{3k}, and the projection is forgetting the beads.

Over a collinear molecular pose x (outside M̃₀), the fibre is {y not all on the axis}/SO(2)_x. This is a smooth (3k − 1)-manifold, so the fibre dimension drops by one there, and [x] is a singular point of ℝ^{3N}/G. (Analysis B's "cone" was wrong.)

**Proposition 5.2 (transport).**
- Hor := dq(H × 0) is an Ehresmann connection on the associated bundle.
- Transport is t ↦ [x̃(t), f] with f constant.
- Hol_E(γ) = h⁻¹ in the frame φ_{x₀}.
- With ∇ = d − a×, the curvature of ∇ is R^∇(X, Y) = −F(X, Y)× (referee A9).
- Physically: the beads are at rest in the lab while the molecule moves with L = 0, so seen from the molecule they turn by h⁻¹.

**Proposition 5.3.** For any bead masses, the motion (x̃(t), y ≡ const) has zero total linear and angular momentum, so it is horizontal for the combined mechanical connection.

**Theorem 5.4 (test-particle theorem).** Let Ã be the true mechanical connection of the (N + k)-body system. Then:
- (a) Ã = pr₁*A at (x, y) if and only if μ_a y_a = 0 for every a. So Ã = pr₁*A everywhere if and only if all beads are massless.
- (b) Exactly: Ã(u, w) = Ω₀ + Ĩ⁻¹𝓛(u − Ω₀ × x, w − Ω₀ × y), with Ω₀ = A_x(u).
- (c) To first order: Ã = A + I⁻¹ Σ_a μ_a y_a × (w_a − Ω₀ × y_a) + O(μ²). Error ratios at μ = 0.1, 0.01, 0.001 are 93.6, 99.3, 99.9 (referee B), consistent with O(μ²).

**Lemma 5.5 (pullback).** If Φ is equivariant, Φ*A₂ is a principal connection, with Hol_{Φ*A₂}(γ) = Hol_{A₂}(φ∘γ) and F_{Φ*A₂} = Φ*F_{A₂}. In particular pr₁*A is the test-particle connection.

**Proposition 5.6 (gluing).** For an invariant constrained submanifold S on which the action is free, the constrained mechanical connection is ι*Ã. For beads placed by a rule f this gives Ψ_f*Ã(u) = Ĩ(x, f(x))⁻¹𝓛(u, df(u)).

**Proposition 5.7 (coarse-graining is not mechanical).** Assume Φ(P_N) ⊂ P_K. Then Φ*A_K ≠ A_N as soon as some bead contains two or more atoms. Proof: rotate two atoms about their weighted centre; a translation correction is needed if the weights are not mass-proportional. ∎

**Example 5.8 (nitromethane, the oxygens as beads).**
- Test particles: the rest does not rotate.
- True motion: the rest rotates by 28.41° about C–N (Result 9.4).

*Remark.* For the product map M_{A∪B} → M_A × M_B, transport moves B's relative direction in S² and also B's centre-of-mass vector relative to A.

---

## 6. Probes and stabilisers (Analysis B §3; confirmed by referee B)

- **Lemma 6.1.** P ×_G G ≅ P.
- **Lemma 6.2.** P ×_G (G/H) ≅ P/H via [x, gH] ↦ H·g⁻¹x. Sections of it correspond to reductions of the structure group to H.
- **Theorem 6.3.** The probe [x, f] determines x exactly up to Stab(f). It determines the full orientation if and only if Stab(f) = {e}. dim G ≤ dim F is necessary but not sufficient: SO(3) acts on the 3-dimensional ℝ³ with no free orbits.

| probe space | probe | stabiliser | records |
|---|---|---|---|
| SO(3) on ℝ³ | v ≠ 0 | SO(2) about v | direction (P/SO(2)) |
| SO(3) on ℝ³ | 0 | SO(3) | nothing |
| SO(3) on (ℝ³)² | non-collinear pair | {e} | full orientation |
| SO(3) on (ℝ³)² | collinear pair | SO(2) | direction |
| rotor U(1) on u^⊥ | lip off axis | {e} | full angle |
| rotor U(1) on u^⊥ | lip on axis | U(1) | nothing |
| global SO(2), planar | bead ≠ centre | {e} | full angle |
| ball joint SO(3) | one marker | SO(2) | direction |

*Parallel with the non-free sets.* SO(3) is non-free exactly when all atoms lie on one line through the centre. The rotor is non-free exactly when all lips lie on its axis (and, on M, when the rest is collinear with that axis).

---

## 7. The rotor's associated line bundle (Analysis B §4, with referee A1 on A)

**Theorem 7.1.** Assume a non-collinear rest, so that Π = ê^⊥ → M_part, pulled back to M.
- (a) p_O = (s_O − s_N) − ⟨s_O − s_N, ê⟩ê is a section of Π over M. It vanishes exactly where lip O is on the axis, and p_O∘Φ_θ = e^{iθ}p_O.
- (b) As an equivariant map on P_rot, p_O is a section of L ⊗ π*Π over B_rot, where L = P_rot ×_{U(1)} ℂ. It is not a section of L.
- (c) On {p_a ≠ 0}, P_rot ≅ S(π*Π), the circle bundle of lip directions. Then L ≅ (π*Π)* in the convention (x, z) ~ (gx, gz); in the conjugate convention L ≅ π*Π. Either way it is the same plane with opposite orientation. In this trivialisation p_b becomes the invariant p_b/p_a.
- (d) A genuine section of L is p_a/σ = p_a σ̄/|σ|², for a reference σ such as the projection of rest atom j. Its zeros are where the lip is on the axis, and its poles are where the reference atom is on the axis. The normalised version is e^{iτ}, the dihedral.
- (e) Π ⊕ Π extends across the non-free locus as its zero section, and the circle bundle collapses there.

**Proposition 7.2 (bond sphere).**
- *Set-up.* Rigid CH₃ and rigid NO₂, with the direction ê of the C–N bond relative to CH₃ varying over a sphere S ⊂ M_part. This is a topological probe, not physically explored geometry.
- Π|_S ≅ TS², so |c₁| = 2.
- For symmetric NO₂ (p_b = −p_a ≠ 0), P_rot|_S ≅ T¹S² ≅ SO(3) ≅ ℝP³, with π₁ = ℤ/2.
- The H–C–N–O reference σ_H(ê) = v_H − (v_H·ê)ê vanishes at ±v̂_H with index +1 each; the total is 2.
- The lip shadows never vanish on S. So |c₁| counts reference zeros (poles of the section in (d)), not lip zeros.
- The same holds on X with the lab bond sphere (Result 3.3).

**Proposition 7.3 (Hopf sphere; choosing the angle).**
- In a fibre of Result 2.2, take {|p_a|² + |p_b|² = r²}, with unequal axial offsets if collisions are excluded. On it P_rot is the Hopf bundle, c₁ = ±1.
- "Angle via O_a" fails where p_a = 0, and the two lips' angles differ by arg(p_b/p_a).
- **Pitfall:** the angle of the lips' centre of mass, p_a + p_b, fails exactly at the C₂-symmetric equilibrium.
- The C₂-natural invariant is q = Σm_O p_O² ∈ Π^{⊗2}, which gives 2θ. It vanishes only for an isotropic projected distribution. For NO₂, |q| = Σm|p|² = 37.82 amu Å², the maximal anisotropy.

---

## 8. Connections for the rotor

**Result 8.1 (the mass-orthogonal connection on X; exact invariance locus, my computation).**

Let A_orth(v) = ⟨ξ, v⟩/⟨ξ, ξ⟩ = (1/I_u) Σ_lips mᵢ u·(rᵢ × vᵢ). For R = R_u(θ), η = u × δu and S = Σ_lips mᵢrᵢ, a direct computation gives

  ⟨ξ(Φx), dΦ v⟩ − ⟨ξ(x), v⟩ = v_n·(u × (R − I)S) + Σ_lips mᵢ zᵢ η·(I − R)sᵢ.

- v_n and η vary independently, and ⟨ξ, ξ⟩ = I_u is invariant.
- So Φ*A_orth = A_orth at x for all θ if and only if m_a s_a + m_b s_b = 0 and z_a = z_b, i.e. x ∈ Σ_m. For equal masses this is Σ.
- Σ_m is Φ-invariant, so A_orth|_{TX|Σ_m} is invariant. A_orth is not U(1)-invariant on any open set, so it is not a principal connection on X.
- On Σ_m, A_orth = A_naive = A_LC, where A_naive uses vᵢ − v_n.
- This agrees with referee C (mirror-symmetric locus, defect 6.5×10⁻¹⁶ there and 0.83–0.93 at generic shapes).

**Result 8.2 (the axis-frame connection A_LC; Analysis A, confirmed).**
- **Definition.** With ω = u × u̇,

  A_LC(ẋ) = (1/I_u) Σ_lips mᵢ u·(rᵢ × (ṙᵢ − ω × rᵢ)).

- **Properties.** A_LC is a principal connection on X_free → B, invariant under SE(3) and U(1) (odd under mirrors). Key step: Ṙ = [ω×, R] gives ṙ' − ω × r' = R(ṙ − ω × r).
- **Metric interpretation.** It is the mechanical connection of the U(1)-invariant metric g_LC = Σ_rest m|v|² + Σ_lips m|ṙ − ω × r|².
- **Coordinates.** With u = (ϑ, ϕ), gauge e_ϑ, and φ_a the angle of s_a from e_ϑ:

  A_LC = dφ_a + w_b dβ + cos ϑ dϕ,  F = ½ĥ*σ − u*σ,  w_b = (1 − cos χ)/2,

  where χ and β are the polar and azimuthal angles of ĥ. Hence (1/2π)∫F = −2 on the bond sphere and +1 on the Hopf sphere.
- **Holonomy.** hol = −½Ω(ĥ-loop) + Ω(u-loop) (mod 2π). Chern–Weil: no choice of connection avoids holonomy, because ∫F = 2πc₁ ≠ 0.

**Corollary 8.3 (Foucault).** Swing u around a cone of half-angle α with rigid lips and A_LC = 0. Then hol = −2π cos α ≡ 2π(1 − cos α), in the same sense as the circuit, about the outward normal u. Values (checked by integration):

| α | 30° | 41.41° | 60° | 75° |
|---|---|---|---|---|
| hol | 48.23° | 90.00° | 180.00° | 266.83° |

At 60° the identical O atoms land on each other's positions. The law is Levi-Civita transport on S², ṡ = −(u̇·s)u (Hart–Miller–Mills 1987).

**Corollary 8.4 (falling cat).** With u fixed, horizontality is m_aρ_a²φ̇_a + m_bρ_b²φ̇_b = 0, i.e. dφ_a = −w_b dβ. For a rectangle loop in (β, ρ_b):

  Δφ_a = −Δβ (w_b(ρ_open) − w_b(ρ_closed)).

Example: equal masses, ρ_a = 0.961 Å, open by Δβ = 30° at ρ_b = 0.961, close at ρ_b = 0.60: Δφ_a = −30° × (0.5 − 0.2805) = −6.59°.

**Result 8.5 (relative connection on M).**
- A_LC(η × x) = u·η ≠ 0, so A_LC does not descend to M.
- Define A_F as A_LC applied to the rest atoms (with I_rest > 0 if and only if the rest is non-collinear), and A_M = A_LC − A_F.
- A_M is U(1)-invariant, satisfies A_M(ξ) = 1, and vanishes on so(3) and on translations. So it is a principal connection on M_free → M_free/U(1).
- Gauge form: A_M = dτ₁ + w_b dβ − Σ_{j≥2} w^F_j dβ^F_j, and F_M = Ω_FS(lips) − Ω_FS(rest).
- With a rigid rest and rigid lips, A_M = dτ₁ is flat: no shape-space holonomy without deformation.
- For p = 1, F_M = ½ĥ*σ exactly.

**Result 8.6 (shape-space mechanical rotor connection; corrected hypotheses).**
- **Definition.** A^mech(u) = ℓ(u^h)/ℓ(ζ^h), with ℓ(v) = ê·Σ_O m_O(x_O − x_N) × v_O and u^h the SO(3)-horizontal lift. It always satisfies A(ζ) = 1.
- **Invariance locus.** Let Σ' be the set where:
  - (i) the lips are C₂-exchanged about the C–N line (equal masses);
  - (ii) the C–N line passes through the total centre of mass;
  - (iii) the C–N line is a principal axis of the total inertia.

  Σ' is ρ-invariant and A^mech|_{TM|Σ'} is ρ-invariant, so it restricts to a principal connection on P_rot|_{Σ'}. Off Σ', invariance fails in all numerical tests; "only on Σ'" is unproved. A C₃ methyl makes (ii) and (iii) automatic.
- **Averaging.** The U(1)-average Ā = ∫ρ_θ*A^mech dθ/2π is a principal connection everywhere.
- **Characterisation on Σ'.** Horizontality is equivalent to Σm_O⟨Jp_O, ∇p_O⟩ = 0 (needs only C₂ lips). Uniqueness holds where |ζ^h|² > 0. The coefficient is |ζ^h|² = (I_rest/I_tot)·Σm|p|², not Σm|p|². For nitromethane |ζ^h|² = 2.985 amu Å² = I_O₂I_CH₃/(I_O₂ + I_CH₃), the reduced torsional moment.
- **Heavy-stator limit.** Take CH₃ and C infinitely heavy (fixed in space), with N moving with the NO₂. Horizontality becomes ê·ω = 0, which is Levi-Civita transport on TS²: cone holonomy 2π(1 − cos α), total curvature 4π = 2π|c₁|. This is a limit statement; with real masses the connection is not Levi-Civita.
- **Flat versus curved.** "Keep the dihedral constant" is flat but singular at the zeros of σ_H, whose indices sum to |c₁|. A smooth connection must be curved.

**Result 8.7 (product group SO(3) × U(1)).**
- There is no canonical product connection, because the SO(3) mechanical connection is not rotor-invariant.
- A principal (so(3) ⊕ u(1))-connection is (Ã, A_M), with Ā the Haar average of the SO(3) mechanical connection over the rotor and Ã = Ā − Ā(ξ)A_M.

**Remark 8.8 (dynamics).**
- For SO(3), L is conserved, so L = 0 motions stay horizontal.
- For the rotor, horizontality is a kinematic definition. In a frictionless, torque-free rigid-rotor model, Euler's equation I₃ω̇₃ = (I₁ − I₂)ω₁ω₂ conserves spin about the axis only for an axially symmetric rotor (CH₃ yes, NO₂ no). This is a model statement, not a theorem about the molecule.

---

## 9. The torsion loop at zero angular momentum

**Result 9.1 (angular momentum of the generator).**
- With ξ_lips = u × rᵢ, d = x_n − X_cm and S = Σ_lips mᵢrᵢ:

  J(ξ) = I_N^{lips}u + d × (u × S).

- On Σ_m, J(ξ) = I_u u, so ξ is never horizontal there.
- Off Σ_m, J(ξ) can vanish. Example (referee A): r_b = 0 with the centre of mass placed at lip a gives J = 0. So Analysis A's "never horizontal" is false off Σ_m.
- The L = 0 lift is ξʰ = ξ − V − Ω × (x − X_cm), with V = Σmξ/M_tot and Ω = I_cm⁻¹J(ξ). The V term vanishes on Σ_m.

**Theorem 9.2 (bicycle wheel).**
- **Hypotheses.** (H1) x ∈ Σ_m. (H2) The rest's centre of mass lies on the C–N axis, and u is an eigenvector of the rest's inertia tensor.
- **Statement.** The L = 0 lift of one full relative turn ends at Qx with

  Q = R_u(−2πI_u/I_tot) = R_u(+2πI_rest/I_tot).

  After relative angle φ, the lips have turned +φI_rest/I_tot in the lab and the rest −φI_u/I_tot.
- **Proof.**
  1. Write x(t) = Q(t)y(φ(t)). Then L = 0 gives Ω_b = −I(φ)⁻¹J(φ)φ̇.
  2. Under (H1) and (H2), each part has its centre of mass on the axis with u principal. Parallel-axis shifts along u preserve this.
  3. So I(φ)u = I_tot u with I_tot constant, and J = I_u u.
  4. Hence Ω_b is a constant multiple of u times φ̇, and integrating gives Q. ∎

**Remark 9.3 (general case).** Without (H2), Q̇ = Q·Ω̂_b with Ω_b = −I(φ)⁻¹J(φ)φ̇ and ^ the hat map. So Q = P exp(∫₀^{2π} −(I⁻¹J)^ dφ), with later φ to the right. The axis tilts off u.

**Result 9.4 (numbers).**
- **Nitromethane.** Geometry: C–N 1.489, N–O 1.224 Å, ∠ONO 125.3°, ∠NCH 107.2° (Cox–Waring 1972); C–H 1.088 Å (UNVERIFIED; using 1.089 changes the holonomy by +0.05°).
  - I_O₂ = 37.82, I_CH₃ = 3.24, I_tot = 41.06 amu Å².
  - Principal moments: 41.06 (about C–N), 47.72, 85.54 amu Å².
  - Holonomy 360° × 3.2407/41.0632 = 28.41°, about C–N.
  - Lab turns: CH₃ −331.59°, NO₂ +28.41°.
  - The Tannenbaum axial constant gives I_O₂ = 38.06 amu Å² (model 37.82).
- **Animation's 5-bead nitroethane** (masses 15/14/14/16/16; HALF_MOUTH = 52°, so O–N–O = 104°). (H2) fails.
  - ρ = 0.9614 Å, I_u = 29.58 amu Å², J(ξ) = 29.58u.
  - The naive formula would give 183.43°.
  - True holonomy: 100.60° (≡ −259.4°) about (0.9554, −0.2369, −0.1764), which is 17.18° from C₂→N. Two independent methods agree; an SU(2) lift confirms the rest turns −259.4°.
- **Same model with a realistic O–N–O = 125°.** 81.6° (≡ −278.4°) about an axis 17.8° off.

**Result 9.5 (unlabelled loop; I disagree with referee B and recomputed).**
- With identical O and H atoms, the shape depends on the relative angle only modulo ⟨π, 2π/3⟩ = (π/3)ℤ. So the unlabelled shape loop closes after a relative turn of 60°.
- At L = 0 the NO₂ then turns +60° × 0.07892 = +4.735° and the CH₃ −55.265°.
- The rotation g about C–N that carries the initial unlabelled molecule onto the final one must satisfy g ≡ 4.735° (mod 180°) and g ≡ −55.265° (mod 120°). The unique solution is g = 184.735° (≡ −175.265°).
- The SO(3)-isotropy at generic torsion is trivial, so this is well defined. The holonomy is π + 4.74°; 4.74° is only the NO₂'s lab turn.

---

## 10. Brownian holonomy

**Result 10.1 (planar model, exact).**
- Part 0 model: ω = dz − (λ/2)(x dy − y dx), dω = −λ dx∧dy, TWIST λ = 0.5 in the code.
- For any continuous semimartingale B = (x, y) from 0, the horizontal lift satisfies z_t − z₀ = λ𝒜_t, with 𝒜_t = ½∫(x∘dy − y∘dx).
- Itô and Stratonovich agree because the correction ½(d⟨x,y⟩ − d⟨y,x⟩) = 0 identically.
- The fibre is ℝ; angles, and E cos θ below, read z modulo 2π.

**Result 10.2 (Lévy's laws).** Standard planar BM from 0:

| | E e^{iμ𝒜_t} | density of 𝒜_t | E𝒜_t² | E cos(λ𝒜_t) |
|---|---|---|---|---|
| free | 1/cosh(μt/2) | (1/t) sech(πa/t) | t²/4 | 1/cosh(λt/2) |
| loop (bridge to 0) | (μt/2)/sinh(μt/2) | (π/2t) sech²(πa/t) | t²/12 | (λt/2)/sinh(λt/2) |

- Bridge to a general endpoint z: E[e^{iμ𝒜} | B_t = z] = (μt/2)/sinh(μt/2) · exp(−(|z|²/2t)((μt/2)coth(μt/2) − 1)). This matches Baudoin–Wang eq. (1.1) with S = 2𝒜.
- Loop tails: P(𝒜 > a) = 1/(1 + e^{2πa/t}).
- *Proof sketch.*
  1. 𝒜 = ½∫|B| dβ, with β a BM independent of |B|.
  2. So 𝒜 | |B| ~ N(0, ¼∫|B|²).
  3. Cameron–Martin gives E exp(−(c²/2)∫b²) = (cosh ct)^{−1/2}; Mehler gives (ct/sinh ct)^{1/2} for the bridge. Take c = μ/2.
- Heisenberg interpretation (Gaveau 1977): the loop factor is the ratio of magnetic to free diagonal heat kernels.

**Result 10.3 (gauge).**
- A change of gauge f gives θ_f = λ𝒜 + f(B_t) − f(0). Only loops are gauge-invariant.
- Mean squares: λ²t²/4 in the symmetric gauge, λ²t²/2 in the Landau gauge.
- Since E[𝒜 | B_t] = 0, E(λ𝒜 + f(B_t))² = λ²E𝒜² + Ef(B_t)². So the symmetric (chord-closure) gauge minimises the mean square.
- This minimality is proved only for planar BM started at the symmetric centre. Geodesic closure on curved spaces (Samuel–Bhandari; Krishna–Samuel–Sinha) is an analogy, not a proven minimiser.
- Points are polar for planar BM (indeed for every d ≥ 2), so loops must be realised as bridges.

**Theorem 10.4 (small loops, general bundle).**
- **Setting.** Riemannian base M, compact structure group, curvature F_ij ∈ End(V), H_t the Stratonovich transport around a Brownian bridge of duration t, generator ½Δ_M (a gradient drift is allowed).
- (i) The bridge law is invariant under time reversal, and reversed transport is inverse transport. So H_t and H_t⁻¹ have the same law, and EΘ_t = E log H_t = 0 wherever the principal log is defined almost surely (true for small loops on a simply connected region). This needs a reversible base diffusion.
- (ii) E H_t = I + (t²/24) Σ_{i<j} F_ij² + O(t³). Since F_ij² ≤ 0, averaging contracts the holonomy. Equivalently E H_t = p^E_t(p,p)/p_t(p,p).
- (iii) For SO(3) on ℝ³:
  - E ΘΘᵀ = (t²/12) Σ Ω_ijΩ_ijᵀ + O(t³);
  - E|Θ|² = (t²/12)|Ω|² + O(t³);
  - E(1 − cos|Θ|) = (t²/24)|Ω|² + O(t³).
- *Proof sketch.*
  1. Dyson series H = I − ∮A + S₂ − …; reversal gives E S₂ = ½E(∮A)².
  2. In radial gauge A_i ≈ ½xʲF_ji, so ∮A ≈ Σ F_ij a^{ij}.
  3. Flat bridge areas satisfy E a^{ij}a^{kl} = (t²/12)δ.
  4. Half-integer orders vanish by parity.
  5. Cross-check: Vassilevich's a₄ coefficient (his eq. 4.28) contains 30Ω_ijΩ_ij/360 over ordered pairs; the untraced flat-space form (1/12)ΩΩ is his eq. 4.25. This gives 1/12 for generator Δ, hence 1/24 for ½Δ.
  6. Abelian check: (λt/2)/sinh(λt/2) = 1 − λ²t²/24 + ….
- Arnaudon–Thalmaier 2003: the connection is Yang–Mills if and only if all drift terms up to order 3 (in the bridge scale ε, t = ε²) vanish. Loops never have an ε³ term.
- Monte Carlo (leading order, about 1–2% at 2×10⁴ samples): 7.78e−4, 3.06e−3, 1.232e−2 against predictions 7.81e−4, 3.13e−3, 1.25e−2.
- The rms angle is (Σ|Ω_ij|²)^{1/2}·t/√12; the "|curvature| × rms area" form holds plane by plane.

---

## 11. Curvature of shape space

**Result 11.1 (O'Neill 1966).** For a Riemannian submersion:
- {2} K_M(X, Y) = K_P(X̃, Ỹ) + 3|A_X̃Ỹ|², with A_X̃Ỹ = ½[X̃, Ỹ]^V. No totally-geodesic assumption is needed.
- {0} K_P(U, V) = K_F(U, V) + |T_UV|² − ⟨T_UU, T_VV⟩. (Analysis C had the signs reversed; checked against the Gauss equation.)
- For a principal bundle with free isometric action and the mechanical connection, [X̃, Ỹ]^V = −(Ω(X, Y))*, so

  K_M = K_P + ¾|Ω|²_I.

**Result 11.2 (molecules).** P is flat with the mass metric, and ω = I⁻¹ℓ with ℓ = Σm r × dx. For horizontal u, v:
- Ω(u, v) = 2I⁻¹Σm u_a × v_a;
- K_M = 3J·I⁻¹J ≥ 0, with J = Σm u_a × v_a (orthonormal u, v);
- Ric(X, X) = ¾Σ_j|Ω(X, e_j)|²_I;
- s_M = (3/2)Σ_{i<j}|Ω_ij|²_I.

Curvature is unbounded near collinear configurations for N ≥ 4 and bounded for N = 3. An independent finite-difference check for N = 4 agrees with 3J·I⁻¹J to 0.1–0.8%.

Further checks:
- Planar three-body: K = 3/ρ², holonomy = ½ × solid angle.
- Kendall's triangle shape space: 4 = 1 + ¾·4.
- Heisenberg group: K_P(horizontal) = −¾λ², and s_P = s_M − ¼F_{μν}F^{μν} (Kaluza–Klein with unit fibres).

**Corollary 11.3.** Assume:
1. a free isometric action (SO(3) on non-collinear shapes; not the rotor);
2. the mechanical connection;
3. loops that are Brownian for g_M (a gradient drift changes only O(t³); projected atomic BM has drift ¼∇log det I, and fibres are not minimal, per Elworthy–Le Jan–Li);
4. Θ measured in the inertia norm.

Then

  E[Θ·IΘ] = (t²/12)Σ|Ω_ij|²_I = (t²/18)(s_M − Σ_{i≠j}K_P) + O(t³),

which for molecules is t²s_M/18.
- Physical atomic BM adds vertical noise with E[Θ·IΘ] ≈ 3t. This dominates for t < 54/s_M (about 98 amu Å² for the bead model).
- The return probability is p_t(p,p) = (2πt)^{−n/2}(1 + s_M t/12 + …).

---

## 12. Long times

**Result 12.1 (free planar BM).** 𝒜_t = t𝒜₁ in law, so θ_t/t has density (1/λ)sech(πx/λ). The motion is ballistic, with no diffusive regime.

**Result 12.2 (global geometry; corrected).**
- CPⁿ (compact, singular gauge α): θ_t/t → Cauchy(n) (Baudoin–Wang Thm 2.9). The winding interpretation is heuristic.
- CHⁿ (transient, not confining): θ_t/√t → N(0, 1) (Thm 3.7).
- For open paths θ is gauge-dependent. On S^{2n+1} the fibre position of horizontal BM becomes uniform in any gauge.

**Result 12.3 (Ornstein–Uhlenbeck, exact).**
- Model: dx = −kx dt + √(2D)dW¹, dy = −ky dt + √(2D)dW², σ² = D/k, θ = λ𝒜 in the symmetric gauge about equilibrium.
- The drift cancels: x dy − y dx = √(2D)(x dW² − y dW¹), so 𝒜 is a martingale.
- Variance: Var𝒜_t = Dσ²t exactly from a stationary start, and (D²/k)(t − (1 − e^{−2kt})/2k) from 0 (= Silva–Efrati eq. C7).
- Characteristic function from 0: E e^{iμθ_t} = e^{kt}/(cosh γt + (k/γ)sinh γt), with γ = √(k² + λ²μ²D²).
- Long-time limit: θ_t/√t ⇒ N(0, 2D_rot), with **D_rot = ½λ²Dσ² = λ²D²/(2k)**. The cumulant rate k − √(k² + λ²μ²D²) is normal-inverse-Gaussian, and E cos θ_t ≈ e^{−D_rot t}.
- D_rot is gauge-invariant.

**Result 12.4 (general rule).**
- (a) **Two dimensions, reversible.** Generator D(Δ − ∇V·∇), μ = e^{−V}/Z, Coulomb gauge div(e^{−V}a) = 0:

  D_rot = D∫|a|²dμ = (D/Z)⟨F, (−∇·e^V∇)⁻¹F⟩.

  This assumes the Coulomb gauge exists with finite energy. For an anisotropic Gaussian, D_rot = λ²D²/(k₁ + k₂).
- (b) **n modes, leading order.** D_rot = D²Σ_{i<j}Ω_ijΩ_ijᵀ/(k_i + k_j). This is rigorous per Lie-algebra component at linear order and heuristic for the full non-abelian motion; it needs |Ω|σ² ≪ 1.
- (c) **Overdamped Langevin with friction γmᵢ.**
  - D = k_BT/γ and k_i = ω_i²/γ.
  - D_rot^{geom} = (k_BT)²/γ · ΣΩΩᵀ/(ω_i² + ω_j²), which adds to the rigid D·I⁻¹.
  - The ratio geometric/rigid is about s_Mσ²/9 ≈ 3×10⁻³ (heuristic: 400 cm⁻¹ mode at 300 K, σ² = 0.044 amu Å²).

**Remark 12.5 (torsion-driven diffusion; heuristic).**
- Write R(φ) = H^{φ/2π}Q(φ) with Q periodic and α = 100.6°. Orientation correlations then decay at rates (α/2π + k)²D_φ.
- The dominant component (k = −1) gives the unwrapped-angle rate 0.52D_φ.
- A small k = 0 component, at rate 0.078D_φ, comes from axis wobble and eventually dominates at small amplitude.
- Torsion alone never randomises the axis.

---

## 13. Formulas and constants for the animations

**Rotor holonomy.**
- Bicycle wheel: Q = R_u(2πI_rest/I_tot). Lips at φI_rest/I_tot, rest at −φI_u/I_tot.
- Nitromethane: 28.41°; the CH₃ sweeps −331.6° and the NO₂ +28.4°.
- Unlabelled nitromethane loop (60° relative turn): 184.7°.
- Bead model: 100.60° about an axis 17.18° off C₂→N (cartoon geometry, O–N–O = 104°). With O–N–O = 125°: 81.6° about an axis 17.8° off.
- Foucault: 2π(1 − cos α); the lip angle relative to e_ϑ is ψ(ϕ) = ψ₀ − ϕ cos α.
- Cat: dφ_a = −w_b dβ, with the example value −6.59°.

**Part 0 Lévy table** (λ = 0.5; sample loops as B_s − (s/t)B_t and reuse `horizontalLift`):

| t | loop Eθ² | loop rms | loop E cos θ | free (sym) Eθ² | free rms | free (Landau) Eθ² |
|---|---|---|---|---|---|---|
| 0.5 | 0.0052 | 4.1° | 0.9974 | 0.0156 | 7.2° | 0.031 |
| 1 | 0.0208 | 8.3° | 0.9897 | 0.0625 | 14.3° | 0.125 |
| 2 | 0.0833 | 16.5° | 0.9595 | 0.25 | 28.6° | 0.5 |
| 4 | 0.333 | 33.1° | 0.8509 | 1.0 | 57.3° | 2.0 |
| 8 | 1.333 | 66.2° | 0.5514 | 4.0 | 114.6° | 8.0 |

- Loop density of θ: (π/(2λt))sech²(πθ/(λt)).
- Physics convention: Eθ²_loop = λ²D²t²/3 (Silva–Efrati eq. 17).

**Small loops in SO(3).**
- E|Θ|² = t²|Ω|²/12.
- E(1 − cos|Θ|) = t²|Ω|²/24.
- E H − I = (t²/24)Σ[Ω_ij]×².

**OU parameter sets** (λ = 0.5):

| set | k | D | σ | D_rot | rms at t = 5 / 10 / 20 / 40 | E cos θ(20) from 0 |
|---|---|---|---|---|---|---|
| A, from rest | 2 | 1 | 0.71 | 0.0625 | 44.2° / 63.3° / 90.0° / 127.7° | 0.296 (Gaussian approx. 0.291) |
| A, stationary | 2 | 1 | 0.71 | 0.0625 | 45.3° / 64.1° / 90.6° / 128.1° | – |
| B | 1 | 0.5 | 0.71 | 0.03125 | (= A slowed by a factor 2) | – |
| safe | 2 | 0.5 | 0.5 | 0.0156 | 22.6° / 32.0° / 45.3° / 64.1° (stationary) | – |

With σ = 0.71, the frame edge ±1.65 is only 2.33σ: each coordinate is outside about 2% of the time, so clip or reflect, or use the safe set.

**Bead-model curvature** (as coded; the O–N–O = 125° values are in brackets):
- Principal moments: 36.29, 118.94, 149.92 amu Å².
- Σ|Ω|²_e = 7.19×10⁻³ (6.03×10⁻³) rad²/(amu Å²)².
- ΣΩ·IΩ = 0.368.
- s_M = 0.552 (0.527) (amu Å²)⁻¹.
- Maximum horizontal sectional curvature ≈ 0.083; the average is s_M/72 ≈ 0.0077.
- rms loop rotation: 1.40° × t (1.28° × t).
- E[Θ·IΘ] = 0.0306t².

**Barriers.**
- Nitromethane: V₆ = 2.11 cm⁻¹, against k_BT = 207 cm⁻¹ at 298 K.
- Nitroethane: about 120 cm⁻¹ (50–200).
- These are physical context only; the bundle does not depend on them.

---

## 14. Notes for the existing scene text (src/videos/bundles)

- **Scene 04.** "X = ℝ³ᴺ (centred)": the rotor must recentre, unless one works modulo translations.
- **Scene 05.** Write "no canonical choice; over all configurations not even a continuous one". The current wording is false on the chemically visited region. Freeness on M needs a rest atom off the C–N line.
- **Scene 11.** Do not let "Chern number 2" read as counting lip zeros: it counts reference zeros.
- **Torsion animation.** Show the light methyl whirling and the heavy NO₂ barely moving. Label bead-model numbers as cartoon geometry.
- **Bead transport.** Beads turn by h⁻¹ relative to the molecule.
- **"Lips don't turn" as angular momentum about the axis.** Correct only on Σ_m.
- **Scenes 12 and 13.** The constants t²/12 and t²/24 are consistent with Theorem 10.4.

---

## 15. Bibliography

**Legend.**
- [V]: confirmed by web search in at least one analysis or referee report. I did not re-search.
- [P]: bibliographic data confirmed, content only partly.
- [U]: UNVERIFIED.

*Geometry and topology*
1. J. M. Lee, *Introduction to Smooth Manifolds*, 2nd ed., GTM 218, Springer, 2013. Thm 21.10. [V]
2. S. Kobayashi, K. Nomizu, *Foundations of Differential Geometry I*, Interscience, 1963. Section numbers [U]. [P]
3. J. Milnor, J. Stasheff, *Characteristic Classes*, Princeton, 1974. Corollary number (11.12?) [U]. [P]
4. R. Bott, L. Tu, *Differential Forms in Algebraic Topology*, GTM 82. [U]
5. B. O'Neill, Michigan Math. J. 13 (1966) 459–469, doi:10.1307/mmj/1028999604. [V]
6. A. Besse, *Einstein Manifolds*, 1987, Ch. 9 (9.29, 9.37). [U]
7. J. Milnor, Adv. Math. 21 (1976) 293–329. The Heisenberg value was not located in the paper. [P]
8. D. G. Kendall, Bull. LMS 16 (1984) 81–121, doi:10.1112/blms/16.2.81. [V]
9. H. Le, D. G. Kendall, Ann. Stat. 21 (1993) 1225–1271. Content [U]. [P]

*Molecular gauge theory and mechanics*
10. A. Guichardet, Ann. IHP Phys. Théor. 40 (1984) 329–342. Thm 1. [V]
11. T. Iwai, J. Math. Phys. 28 (1987) 964–974, doi:10.1063/1.527588. [V]
12. T. Iwai, J. Math. Phys. 28 (1987) 1315–1326, doi:10.1063/1.527534. [V]
13. T. Iwai, Ann. IHP Phys. Théor. 47 (1987) 199–219. [V]
14. R. G. Littlejohn, M. Reinsch, Rev. Mod. Phys. 69 (1997) 213–275, doi:10.1103/RevModPhys.69.213. Sec. III.D, p. 232. [V] This replaces Alba–Lusanna–Pauri (2002), which was misattributed.
15. A. Shapere, F. Wilczek, Am. J. Phys. 57 (1989) 514–518, doi:10.1119/1.15986. [V]
16. A. Shapere, F. Wilczek, J. Fluid Mech. 198 (1989) 557–585. [V]
17. R. Montgomery, Fields Inst. Commun. 1 (1993) 193–218, doi:10.1090/fic/001/09. [V]
18. R. Montgomery, Commun. Math. Phys. 128 (1990) 565–592; Nonlinearity 9 (1996) 1341–1360. [V]
19. R. Montgomery, *A Tour of Subriemannian Geometries*, AMS Surv. 91 (2002). [V]
20. J. E. Marsden, *Lectures on Mechanics*, LMS LN 174 (1992), §3.3. [V]
21. J. E. Marsden, R. Montgomery, T. Ratiu, Mem. AMS 436 (1990). [V]
22. H. Cendra, J. E. Marsden, T. Ratiu, Mem. AMS 722 (2001). [V]
23. J. E. Marsden, T. Ratiu, *Introduction to Mechanics and Symmetry*, Springer, 1994. Sections [U]. [P]
24. K. A. Mitchell, R. G. Littlejohn, J. Phys. A 33 (2000), doi:10.1088/0305-4470/33/7/309. Content [U]. [P]
25. J. B. Hart, R. E. Miller, R. L. Mills, Am. J. Phys. 55 (1987) 67–70, doi:10.1119/1.14972. [V]
26. J. von Bergmann, H. von Bergmann, Am. J. Phys. 75 (2007) 888–892. [V]
27. E. Putterman, O. Raz, Am. J. Phys. 76 (2008) 1040, doi:10.1119/1.2952448. [V]
28. C. Eckart, Phys. Rev. 47 (1935) 552. [P]

*Spectroscopy and structure*
29. H. C. Longuet-Higgins, Mol. Phys. 6 (1963) 445–460. [V]
30. E. Tannenbaum, R. D. Johnson, R. J. Myers, W. D. Gwinn, J. Chem. Phys. 22 (1954) 949. [V]
31. E. Tannenbaum, R. J. Myers, W. D. Gwinn, J. Chem. Phys. 25 (1956) 42–47, doi:10.1063/1.1742845. V₆ = 6.03 cal/mol. [V]
32. V. Ilyushin et al., J. Mol. Spectrosc. 345 (2018) 64–69, doi:10.1016/j.jms.2017.12.005. Co-authors [U]. [P]
33. Dawadi et al., J. Mol. Spectrosc. (2017), G₁₂. Details [U]. [P]
34. A. P. Cox, S. Waring, J. Chem. Soc. Faraday Trans. 2, 68 (1972) 1060–1071. [V]
35. J. Ekkers, A. Bauder, H. H. Günthard, Chem. Phys. Lett. 22 (1973) 249–252. The value "≲ 5 cm⁻¹" [U]. [P]
36. Tarasov, Kochikov, Vogt et al., J. Mol. Struct. 872 (2008) 150–165, doi:10.1016/j.molstruc.2007.02.038. [V]
37. Alternative electron-diffraction study, J. Mol. Struct. (about 2009), 50–90 cm⁻¹. Authors [U].
38. C. C. Lin, J. D. Swalen, Rev. Mod. Phys. 31 (1959) 841–892. [P]
39. Dalagnol et al., J. Phys. Chem. A 127 (2023) 1445–1457, doi:10.1021/acs.jpca.2c08023. Contains the "6 kcal/mol" misprint. [V]

*Stochastic analysis*
40. P. Lévy, C. R. Acad. Sci. Paris 230 (1950) 432–435. [V]
41. P. Lévy, Proc. 2nd Berkeley Symp. (1951) 171–187. [V]
42. B. Gaveau, Acta Math. 139 (1977) 95–153. [V]
43. J.-M. Bismut, J. Funct. Anal. 57 (1984) 56–99. [V]
44. E. P. Hsu, *Stochastic Analysis on Manifolds*, AMS GSM 38 (2002). Sections [U]. [P]
45. D. V. Vassilevich, Phys. Rep. 388 (2003) 279–360. Eqs. 4.25, 4.28. [V]
46. M. Arnaudon, A. Thalmaier, Ann. Probab. 31 (2003) 769–790. [V]
47. B. K. Driver, A. Thalmaier, J. Funct. Anal. 183 (2001) 42–108. [V]
48. F. Baudoin, J. Wang, PTRF 169 (2017) 977–1005, arXiv:1602.06470. [V]
49. K. D. Elworthy, Y. Le Jan, X.-M. Li, arXiv:0810.2253, Ch. 7. Book edition [U]. [V]
50. A. Bernard, E. A. Campbell, A. M. Davie, Ann. Inst. Fourier 29 (1979) 207–228. A special case only. [V]
51. K. G. Wilson, Phys. Rev. D 10 (1974) 2445. [V]
52. C. Kipnis, S. R. S. Varadhan, Commun. Math. Phys. 104 (1986) 1–19. [V]
53. G. Papanicolaou, D. Stroock, S. R. S. Varadhan, Duke Turbulence Conf. (1977). [P]
54. O. Saporta Katz, E. Efrati, Phys. Rev. Lett. 122 (2019) 024102. [V]
55. A. Silva, E. Efrati, arXiv:2503.11278 (2025). [V]
56. P. Español, M. Thachuk, J. A. de la Torre, Eur. J. Mech. A/Solids 103 (2024) 105184. [V]
57. R. Golestanian, A. Ajdari, J. Phys.: Condens. Matter 21 (2009) 204104. [V]
58. E. Lauga, Phys. Rev. Lett. 106 (2011) 178101. [V]
59. M. M. G. Krishna, J. Samuel, S. Sinha, J. Phys. A 33 (2000) 5965–5971. [V]
60. Antoine, Comtet, Desbois, Ouvry, J. Phys. A 24 (1991) 2581–2586. [V]
61. J. Desbois, A. Comtet, J. Phys. A 25 (1992). First page [U]. [P]
62. N. A. Sinitsyn, I. Nemenman, EPL 77 (2007) 58001. [V]
63. J. Samuel, R. Bhandari, Phys. Rev. Lett. 60 (1988) 2339. [U]
64. P. Gilkey, *Invariance Theory, the Heat Equation, and the Atiyah–Singer Index Theorem*. [U]
65. F. Baudoin, N. Demni, J. Wang, *Stochastic areas, horizontal Brownian motions, and hypoelliptic heat kernels*, EMS, 2024. [U]

**Results derived in the analyses, not found in the literature** (proved above; a second reader is advisable):
- the Hopf description of X/U(1);
- the rotor Chern classes;
- A_LC and its curvature;
- the invariance locus Σ_m;
- the permutation obstruction to canonical sections;
- K_shape = 3J·I⁻¹J;
- E[Θ·IΘ] = t²s_M/18;
- the general D_rot rules;
- the unlabelled holonomy of 184.7°.