# Molecules from parts: associated bundles for generative models

A research note that follows scene 09 ("Coupling") of the video *One space, many
bundles* and the notes in [many-bundles.md](many-bundles.md).

**The question.** Can the coupling be used to model several molecules, or one
molecule hierarchically, with parts that can be reused? By the coupling we mean
that the shape space of a whole is a bundle over the shape space of a part.

**How this note was checked.**
- An independent referee re-derived every result, constructed counterexamples
  and recomputed the numbers. All of the referee's corrections are adopted
  below.
- The cited literature was checked against the papers.

**Status of each statement:**
- **[P]** proved here, with the proof or a proof sketch given;
- **[N]** also checked numerically, in
  [many-bundles-checks/coupling_checks.py](many-bundles-checks/coupling_checks.py)
  (for §15:
  [many_molecule_checks.py](many-bundles-checks/many_molecule_checks.py));
- **[S]** standard, with a reference;
- **[I]** an idea or conjecture, not proved.

## 0. The answer in brief

1. **Yes, as a structure.**
   - For any part A that is not collinear, the shape space of a system
     containing A is a bundle over the shape space of A.
   - A hierarchy of parts, or of coarse-grainings, is a tower of such bundles.
   - Probability distributions factor along the tower into an invariant model
     of the part and, at each level, an equivariant conditional model on the
     fibres (R1–R3).
2. **The target distribution needs equivariance, not the connection.** Scene 09
   shows parallel transport, but parallel transport is not what couples the
   distributions. An equivariant conditional does that (R2). The connection
   enters in three other places:
   - the geometry of the whole: forgetting a subsystem is a Riemannian
     submersion whose horizontal directions are exactly the transport of
     scene 09 (R6);
   - samplers that split a part's motion into a rotation and a change of shape
     (R8): docking models already use such a split, with unit masses;
   - path-dependent constructions, which carry holonomy (R7).
3. **Reuse is exact only under screening.** A conditional model of a part given
   its interface can be reused exactly in another context when the part
   interacts with the rest only through that interface. A marginal needs a
   correction: a free energy that is a fibre integral, or, without an energy
   function, a density ratio (R5).
4. **Keep the noise ambient and isotropic.**
   - With independent isotropic noise on the atoms, the noised marginal of a part
     evolves on its own. That is what makes reusing a part model possible.
   - Brownian motion in the true metric of the whole couples the part to the
     rest, through a term that depends on where the rest is (R6). So reusing a
     part model and "intrinsic" metric diffusion of the whole are in tension.
5. **Topology and symmetry decide what needs an equivariant network** (R9, R10):
   - there is no continuous global body frame for parts of four or more atoms;
   - there is no continuous labelling of identical molecules;
   - rings and multi-body assemblies must satisfy flatness of a discrete SE(3)
     gauge field on the fragment graph;
   - O(3)-equivariant networks cannot place a chiral arrangement relative to a
     planar interface.

**Two interacting molecules (§13).**
- *The answer.* Yes, in a clean form: keep both single-molecule diffusion models
  frozen, add their scores, and train only an interaction score. This is exact.
- *What drives binding.* The single-molecule scores exert no net force or torque
  on either molecule, so only the interaction term moves the molecules relative
  to each other.
- *What it learns.* At small noise the interaction term is the intermolecular
  force field. Over the bundle it splits into the binding pose, the induced
  change of shapes, and the affinity.

**More than two molecules (§15).**
- *The structure.* Give every molecule its own bundle (R1′) rather than
  attaching all others to one root molecule. A root is a gauge: it breaks the
  permutation symmetry of identical molecules and cannot be an ion or a linear
  molecule.
- *The score.* The sum of the monomer scores plus one SE(3)- and S_n-invariant
  interaction energy over the whole cluster.
- *The catch.* Noise turns pairwise physics into many-body interaction terms
  (up to about 80% of the interaction score in a toy model), so dimer-trained
  interaction models compose exactly only at small noise.

**Literature, in short.**
- The building blocks exist separately. Examples are conditional generation in a
  fixed context (DiffLinker), pose and torsion diffusion (DiffDock, torsional
  diffusion), frame diffusion (FrameDiff) and rigid-body assembly (AssembleFlow,
  MOFFlow).
- A recent paper treats ℝ^{3N} → shape space as a principal bundle and lifts the
  diffusion horizontally (Quotient-Space Diffusion Models, ICLR 2026).
- We found no work that composes separately trained, learned single-molecule
  generators through an explicit bundle factorisation. The search was not
  exhaustive; see §12.

---

## 1. Setting

- **System and parts.** A system S of atoms with positive masses, and parts
  A, B, … ⊂ S. The configuration space ℝ^{3|S|} carries the diagonal action of
  SE(3). Atoms are labelled unless stated otherwise (see R10).
- **Translations.** Remove them by centring on the centre of mass of a chosen
  part.
- **Part bundles.** For a part A with N_A ≥ 3 atoms: P_A = centred,
  non-collinear configurations of A; M_A = P_A/SO(3); and π_A: P_A → M_A, a
  principal SO(3)-bundle with the mechanical connection (zero angular
  momentum).
- **Associated bundles.** E = P_A ×_{SO(3)} F, with (x, f) ~ (Rx, Rf).
- **Known facts used below** ([many-bundles.md](many-bundles.md)):
  - P_A → M_A has no global section for N_A ≥ 4, and has one for N_A = 3
    (§3);
  - parallel transport in P_A ×_{SO(3)} ℝ^{3k} keeps extra beads at rest in
    the lab while A moves with zero angular momentum (§5);
  - commuting rotors are characterised in Result 1.5.

## 2. Structure: the whole over its parts

**R1 (the whole over a part) [P; many-bundles.md §5].**
- **The bundle.** Let B be k further beads. On the set where A is not
  collinear, the shape space of A ∪ B is the associated vector bundle
  E = P_A ×_{SO(3)} ℝ^{3k} over M_A, and forgetting B is the projection.
- **Collinear parts.**
  - Over configurations where A is collinear the stabiliser is SO(2) and the
    fibre is ℝ^{3k}/SO(2). Over a stratum with constant stabiliser the
    forgetful map is still a fibre bundle, with that fibre.
  - What fails there: the vector-bundle description, frame-based models, and
    R6–R7, because I_A⁻¹ blows up.
  - R2 does not fail. It holds for any measurable action, so an equivariant
    conditional model may use a collinear or nearly collinear part as its base;
    equivariance then forces the kernel to be SO(2)-invariant there.
  - For a flexible linear molecule, the collinear set has codimension 2. The
    practical problem is ill-conditioning near it, not invalidity.

**R1′ (several molecules) [P].**
- **The fibration.** For molecules A₁, …, A_n that are not collinear, the shape
  space of the complex fibres over M₁ × ⋯ × M_n.
- **The fibre** over (b₁, …, b_n) is
  (π₁⁻¹(b₁) × ⋯ × π_n⁻¹(b_n) × ℝ^{3(n−1)}) / SO(3).
  - The orbits π_i⁻¹(b_i) are SO(3)-torsors: they have no identity element.
  - ℝ^{3(n−1)} holds the relative centres of mass.
- **Coordinates.** One representative per molecule identifies the fibre with
  SO(3)^{n−1} × ℝ^{3(n−1)}. Another choice changes the relative orientations by
  left and right multiplications and rotates the relative positions.
- *Proof.* The diagonal action is free because it is free on every factor;
  fixing the shapes leaves exactly these orbits. ∎

**R1″ (coarse-graining is a vector bundle) [P].**
- **Setup.** Let W be a K × N matrix of rank K with rows summing to 1, so that
  bead i = Σⱼ W_ij x_j, and Φ = W ⊗ I₃.
- **Kernel.** Φ is equivariant and surjective, with ker Φ = ker W ⊗ ℝ³, which is
  N − K copies of the standard representation.
- **Splitting, with translations handled.** Use an affine right inverse S with
  S(1_K ⊗ a) = 1_N ⊗ a, so that translations correspond.
  - Example: S = M⁻¹Wᵀ(WM⁻¹Wᵀ)⁻¹ ⊗ I₃, valid when the mass vector lies in the
    row space of W, as for centre-of-mass beads of a partition.
  - The pseudo-inverse W⁺ ⊗ I₃ is SO(3)-equivariant, but it respects
    translations only if 1_N lies in the row space of W.
- **Conclusion.** Where the coarse-grained configuration is not collinear
  (K ≥ 3), the all-atom shape space is the associated vector bundle
  P_K ×_{SO(3)} ker Φ over M_K.
  - The zero section, atoms at S(beads), is then canonical, so details are
    globally defined vectors.
  - What fails globally, for K ≥ 4, is writing those vectors in a frame.
- **Towers.** Coarse-grainings W_L ⋯ W₁ give a tower of such bundles. It
  suffices that the coarsest level is non-collinear, since affine images of
  collinear sets are collinear.
- **Example.** The video's united-atom nitroethane is a coarse level, and the
  hydrogens form a fibre over it: R1 with A = heavy atoms. Inside that fibre the
  methyl hydrogens carry another rotor U(1).

## 3. Distributions factor along the bundle

**R2 (disintegration) [P].**
- **Statement.** Let μ be an SO(3)-invariant probability measure on
  P_A × ℝ^{3k}, with A centred and B relative to A's centre of mass. Then
  μ = μ_A ⊗ κ, where:
  - μ_A is invariant;
  - κ: P_A → Prob(ℝ^{3k}) can be chosen equivariant everywhere,
    κ(Rx) = R_# κ(x).
- **Converse.** Every such pair defines an invariant μ.
- **Bundle reading.** An equivariant κ is the same as a family of probability
  measures on the fibres of E: κ(x) pushed forward by v ↦ [x, v] does not
  depend on the representative.
- **Densities.** p(x, y) = p_A(x) q(y | x), with q(Ry | Rx) = q(y | x).
- *Proof.*
  1. Disintegrate (Polish spaces); κ is unique μ_A-almost everywhere.
  2. For each R, κ_R(x) = (R⁻¹)_# κ(Rx) also disintegrates μ, by invariance,
     so κ_R = κ almost everywhere.
  3. By Fubini, the Haar average κ̄(x) = ∫ (R⁻¹)_# κ(Rx) dR equals κ almost
     everywhere.
  4. κ̄ is equivariant at every x, by right invariance of Haar measure.
  5. Freeness of the action is never used. ∎

**R3 (diffusion models of composites) [P].**
- **Hypothesis.** The forward noise acts on A and on B independently and
  equivariantly.
  - With A centred, this needs the centring to match the noise: either the
    centre of mass with noise variance ∝ 1/mᵢ, or the plain centroid with equal
    variances.
  - Isotropic unweighted noise with mass-weighted centring correlates the noise
    on A and on B. For example, with masses 12, 1, 1, 16 the correlations are up
    to 0.41.
- **Marginals.** Under this hypothesis the noised A-marginal is the A-marginal
  of the noised joint distribution.
- **Sequential sampling is exact.**
  1. Sample x from μ_A.
  2. Then sample y with a conditional diffusion model that noises only y and is
     conditioned on the *clean* x.

  This samples μ up to model error, and it is how a part model is reused.
- **Simultaneous denoising needs a cross term.** The A-update needs
  ∇ₓ log p_t(x, y) = ∇ₓ log p_t^A(x) + ∇ₓ log p_t(y | x).
  - In a Gaussian example, using A's own score instead keeps Var x correct but
    gives Cov(x, y) = 0.909 and Var y = 0.868, against targets 1 and 1.01
    (referee's check).
- **Adding scores** is exact for independent parts on disjoint coordinates. It
  fails for products on shared coordinates or with interaction factors, at
  intermediate noise levels. Corrections such as annealed MCMC exist
  (Du et al. 2023) [S].
- **No frame is needed.** With isotropic noise (an SO(3)-equivariant kernel) and
  an equivariant score network, the conditional reverse process commutes with
  rotations of (x, y). So it defines a process on the fibres of E and never
  needs a frame of A.

## 4. Reference measures for assembling parts

**R4 [P].** Let molecules A₁, …, A_n have invariant densities p̄_i on centred
configurations.

- **The assembly measure.** ν = ∏ p̄_i dx̄_i ⊗ ∏_{j≥2} dr_j is invariant. Over
  ∏ M_i it disintegrates into:
  - the shape marginals of the p̄_i;
  - Haar measure on each relative-orientation torsor;
  - Lebesgue measure on the relative positions.
- **Frame-free kernels.** A diffusion on a relative orientation is well defined
  on the torsor if its kernel is bi-invariant, as IGSO(3) is. This is
  sufficient, not necessary:
  - kernels built from the bodies' own geometry, such as the inertia metric
    ⟨Ω, I(b)Ω⟩, are also frame-free;
  - isotropic noise on the atoms of a rigid part induces this inertia-weighted
    rotational noise, not IGSO(3).
- **Boltzmann.** If U = Σ U_i + U_inter, then exactly
  p_Boltzmann ∝ ν · e^{−βU_inter}.
- **Caveats.**
  - (a) *Normalisability.* Normalisable only under confinement: free
    molecules have infinite translational entropy. Condition on a bound region,
    or use a box, but a periodic box breaks SO(3) (R10).
  - (b) *Marginals change.* A molecule's marginal inside a complex is
    p̄_i e^{−βF_i}/Z, not p̄_i (R5).
  - (c) *Densities on M_i carry orbit-volume factors.* The factor is
    8π² √det I relative to the quotient-metric volume. In internal coordinates,
    use the usual ∏ r² sin θ Jacobian.
  - (d) *Torsion torsors.* Haar measure is the right reference only when bonds
    and angles are flexible: the Cartesian-to-internal Jacobian does not depend
    on the torsions. With rigid bonds and angles, the induced volume varies with
    the torsions (by a factor of about 2 in the referee's 5-atom test).

## 5. When a part model can be reused

**R5 [P].** Split the system into an interface A, a part B and the rest C.

- **Screening.** Suppose the energy splits as
  U = U_AB(x_A, x_B) + U_AC(x_A, x_C). Then:
  - x_B and x_C are independent given x_A;
  - p(x_B | x_A, x_C) ∝ e^{−βU_AB}, the conditional of the isolated system
    A ∪ B.

  So conditionals of a part given its interface are exactly reusable under
  screening; otherwise reweight by e^{−βU_BC}. Marginals are reusable exactly
  when the correction below is constant.
- **Marginals.** p_ctx(x_A) = p_iso(x_A) Z(x_A)/Z, where
  Z(x_A) = ∫ e^{−β(U_B + U_AB)} dx_B is a fibre integral, an invariant function
  on M_A (a free energy). It diverges for an unbound partner (R4a).
- **Estimating the correction with an energy.**
  Z(x_A) = E_{x_B∼q}[e^{−β(U_B+U_AB)}/q(x_B | x_A)].
  - This is unbiased only with the exact density of the distribution actually
    sampled. Use probability-flow ODE sampling with exact divergences. A
    Hutchinson estimate of log q makes 1/q biased (Jensen), and SDE samples with
    ODE densities are inconsistent.
  - If the models are inexact, weight joint draws by
    e^{−βU}/(p_A^model q), which is asymptotically exact. Resampling by Z and
    then drawing B from q is exact only if both models are.
- **Estimating the correction without an energy.** A model trained only on data
  has no U. The data-only analogue of Z is the density ratio p_ctx/p_iso on A's
  shapes. It can be estimated by an SO(3)-invariant classifier that tells
  in-context A-configurations from isolated ones.
- **Naturality.** An equivariant kernel for a part type lives on the universal
  associated bundle of that type and applies to every occurrence by pullback
  (weight sharing). It must also be equivariant under the part type's own
  automorphisms (R10b).
- **[I] Binding free energies.** The fibre integrals give binding free
  energies, up to the standard-state convention that R4(a) forces.

## 6. The geometry of the whole, and what it means for noise

**R6 (forgetting a subsystem is a Riemannian submersion) [P, N].**
- **Statement.** With the quotient mass metrics, on the set where A is not
  collinear, π: M_{A∪B} → M_A is a Riemannian submersion for any positive
  masses of B.
- **Its horizontal space** consists of the motions in which A moves with zero
  momentum and angular momentum of its own and B is at rest in the lab: the
  parallel transport of E, as in scene 09.
- *Proof.*
  1. Such a motion V_h gives the whole zero momentum and zero angular
     momentum. So it is horizontal for the whole, and its norm there is A's
     shape speed.
  2. A fibre direction moves A rigidly and B arbitrarily. Its mass inner
     product with V_h is ⟨ṡ^h, rigid motion of A⟩ = 0.
  3. Since V_h is horizontal for the whole, this is the shape-space inner
     product. ∎
- **Numerical check.** Cosine 9 × 10⁻¹⁶, norm error 3 × 10⁻¹⁶.
- **Generalisation.** The same holds for any SE(3)-invariant metric without A–B
  cross terms whose A-block depends only on A. It fails, for example, for a
  spring metric with springs between A and B.
- **Not a contradiction.** The test-particle theorem (many-bundles.md §5)
  concerns how the whole rotates; R6 concerns its shape.

**Kaluza–Klein form [P, N].**
- **Coordinates.** Write x = c + R s(b) and y = c + R ỹ, relative to A's centre
  of mass c, with a local gauge s on M_A.
- **The metric.**

  ds²_whole = g_A(db) + h_{b,ỹ}(Dỹ),  Dỹ = dỹ − A(db) × ỹ,

  where A(db) = I_A⁻¹ Σ m s × ds is the mechanical connection in the gauge, and

  h_{b,ỹ}(w) = min over ω, c ∈ ℝ³ of
  ω·I_A ω + M_A|c|² + Σ_a μ_a |c + w_a + ω × ỹ_a|².
- *Proof.*
  - The lab velocities are ċ + R(ṡ + Ω × s) and ċ + R(ỹ̇ + Ω × ỹ).
  - Split ṡ = ṡ^h + A(db) × s. Since Σ m ṡ^h = 0 and Σ m s × ṡ^h = 0, A's
    kinetic term is |db|²_A + ω·I_A ω, with ω = Ω + A(db).
  - B's term is Σ μ |ċ + R(Dỹ + ω × ỹ)|².
  - Minimising over the global motion (ω, ċ) gives the formula. ∎
- **Numerical check.** Error 5 × 10⁻¹⁶.
- **Reading.** B's velocity enters only through the covariant derivative D: B is
  minimally coupled to A's connection.
  - The analogy is Kaluza–Klein reduction and Wong's equations (Montgomery
    1984), where the fibre metric is bi-invariant. Here h is only
    SO(3)-invariant, so this is an analogy, not that theorem.
- **Test-particle limit.** With μ_a = μ ν_a and μ → 0, h/μ tends to Σ ν_a |w_a|²,
  which does not depend on b. To leading order this is Vilms' connection metric,
  whose fibres are totally geodesic (J. Vilms 1970) [S].

**Fibre volume [P, N].**
- det h = (∏ μ_a³) (M_A/M_tot)³ det I_A / det I_whole, where I_whole is taken
  about the centre of mass of the whole (error 2 × 10⁻¹⁴).
- So the fibres are not minimal for finite masses.
- By the criterion of Elworthy, Le Jan and Li [S], Brownian motion of the whole
  then does *not* project to Brownian motion on M_A. A's shape picks up the
  drift ¼ ∇ log(det I_A / det I_whole). Because that drift depends on B's
  position, A's shape process is not even Markov on its own. The drift vanishes
  as B's masses go to 0.

**What this means for the noise in a diffusion model.**
- **Ambient isotropic noise** on the atoms (with matching centring, R3) leaves
  A's noisy marginal autonomous. That is exactly the property that lets a part
  model be reused (R3, R5).
- **Intrinsic Brownian motion** in the metric of the whole couples A to B through
  the drift above. It is the right object for a metric-aware treatment of the
  whole, but it breaks reuse.
- **Body-frame noise.** Expressing B in a frame of A turns isotropic noise into a
  correlated process: A's rotational noise and A's shape changes, through A(db),
  rotate B. Equivariant models in ambient coordinates avoid this.

**R7 (transporting a placement depends on the path) [P].**
- **The defect.** Extending a conditional of B from one shape b₀ of A to others
  by parallel transport gives answers that differ along two paths by the
  holonomy h_γ of the loop γ they form: κ_γ(b) = (h_γ)_# κ_{γ′}(b).
- **When it is consistent.** It is consistent only if κ(x₀) is invariant under
  the holonomy group, or if the holonomy is trivial on the region explored.
- **Size.** For small loops, h_γ ≈ exp(Ω · area).
- **Conclusion.** Transport defines path-dependent processes, such as a passive
  particle following a trajectory of A. It does not define static conditionals.

**R8 (torsions, torsors and docking-style updates) [P, N, and S where cited].**
- **Torsions form a torsor.** For a tree-shaped molecule the torsions commute
  (many-bundles.md Result 1.5). Where the action is free, the torsions with bond
  lengths and angles fixed form a T^m-torsor.
  - Freeness fails if a moving group lies on its axis, or if the rest is
    collinear with the axis.
  - A translation-invariant kernel, such as the wrapped normal, is well defined
    on the torsor. Because it is even, it is also invariant under re-rooting.
  - Torsional diffusion (Jing et al. 2022) makes the same point. The value of a
    torsion depends on the choice of reference neighbours, but the change Δτ
    does not (their Proposition 1). The method applies only changes, with an
    SE(3)-invariant score.
- **Kabsch alignment is a horizontal lift, if mass-weighted.** A small torsion
  change followed by *mass-weighted* Kabsch alignment to the previous
  conformation is the horizontal lift of the mechanical connection to first
  order: the relative difference is 0.098ε.
  - *Proof.* The optimal rotation is I + [η]× with
    η = −I⁻¹ Σ m x × δ + O(|δ|²). So the aligned displacement is δ minus its
    vertical part.
  - Unweighted alignment gives the connection for unit masses instead. Against
    the true masses its error does not shrink: 4.9 × 10⁻² for nitroethane,
    0.76 with one light atom.
- **DiffDock in this language** (Corso et al. 2023).
  - It aligns unweighted.
  - Its Proposition 1, zero linear and angular momentum of the torsion update
    at t = 0, is exactly horizontality for the unit-mass connection.
  - Its exact procedure aligns every step to the fixed seed conformer. That is a
    gauge, the unweighted Eckart frame, valid where the alignment is unique.
  - Its practical procedure aligns to the previous pose. That is the connection.
  - The authors note that their torsion "action" is only approximately a group
    action. Part of this defect is curvature: applying aligned updates of two
    different torsions in either order differs by a rotation of about
    Ω(Δθ₁, Δθ₂).
- **Eckart.** The Eckart conditions are the stationarity conditions of the
  mass-weighted squared deviation from the reference. The Eckart frame is the
  global minimiser (Kudin and Dymarsky 2005; Krasnoshchekov et al. 2014) [S].

## 7. Topology: what cannot be done continuously

**R9 [P, and S where cited].**

**(a) No global body frame.**
- For N ≥ 4 there is no continuous SO(3)-equivariant map from all non-collinear
  configurations to SO(3) (π₁ argument, many-bundles.md §3).
- Dym, Lawrence and Siegel (2024) prove a related result: there is no continuous
  canonicalisation for SO(3) on all of ℝ^{3×n} for n ≥ 3. They also construct
  continuous weighted frames.
- On the set where three anchor atoms are not collinear, the Gram–Schmidt anchor
  frame is a section. For rigid anchors (a ring, the backbone N–Cα–C) that set
  contains every physical conformation. Triangles (N = 3) have a global frame on
  the non-collinear set, which is why residue frames work (AlphaFold 2,
  FrameDiff).

**(b) No continuous labelling of identical molecules.**
- Labelled configurations of n ≥ 2 identical molecules with distinct centres
  form a connected space, on which S_n acts freely.
- A continuous labelling would be a section of a connected covering of degree
  n! > 1, which cannot exist: its image would be open, closed and not
  everything. No simple connectivity is needed.
- Where a permutation equals a rotation (symmetric complexes), the quotient is an
  orbifold.
- Dym et al. (2024) prove the corresponding statement for S_n frames.

**(c) Rings and multi-body assemblies are a flatness condition.**
- **Setup.** Let the fragments be rigid, with lab poses F_i ∈ SE(3) on a
  connected fragment graph. Relative poses on edges are g_ij = F_i⁻¹ F_j.
  - A gauge change F_i ↦ F_i h_i sends g_ij ↦ h_i⁻¹ g_ij h_j.
  - A global motion leaves g unchanged.
- **Lemma.** Configurations modulo global motion correspond one to one to flat
  edge assignments, those whose product around every cycle is the identity.
  - *Proof.* Choose a spanning tree and define the F_i along it; flatness makes
    the remaining edges agree. ∎
- **Consequences.**
  - On a tree, edge poses are independent.
  - Each independent cycle (E − V + 1 of them) imposes one SE(3)-valued
    equation. This is ring closure, the same problem as kinematic loop
    closure.
  - The dimension count is 6E − 6(E − V + 1) = 6(V − 1).
- **Measuring the closure error.**
  - The rotation angle θ of the holonomy H around a cycle, and its translation
    along the rotation axis, are gauge invariants. But no continuous class
    function on SE(3) detects a pure translation: a pure translation is a limit
    of conjugates of rotations tending to the identity. So a trace ("Wilson
    loop") penalty cannot enforce translational closure.
  - Use instead the fragment's own atoms: Σ_a m_a |H x_a − x_a|², which is gauge
    independent.
- **Several molecules.** Consistency of pairwise relative poses around every
  triangle is the same condition. Recovering absolute poses from noisy relative
  ones is synchronisation: Singer (2011) for angles, with general groups in
  its §7; SE-Sync (Rosen et al. 2019) for SE(3) [S].

**R10 (symmetries that are easy to forget) [P].**
- **(a) Chirality.**
  - An O(3)-equivariant conditional, for example one built from distances only,
    is forced to be mirror-symmetric whenever the interface is planar: any
    three-atom anchor, an aromatic ring, the backbone N–Cα–C. It cannot place a
    stereocentre relative to such an interface.
  - An O(3)-invariant model of a chiral molecule produces a racemic mixture.
  - So use SO(3)-equivariant networks with parity-odd features. DiffLinker, for
    example, is O(3)-equivariant.
- **(b) Identical atoms inside a part** (methyl hydrogens, the two oxygens of
  NO₂).
  - Reusable kernels must be equivariant under the part type's automorphisms.
  - Anchor frames built from symmetry-equivalent atoms are not canonical
    (many-bundles.md §3).
  - R9(b) applies inside a molecule, and symmetric conformations are orbifold
    points.
- **(c) Periodic systems.** Translations become a torus, there is no canonical
  centring, and SO(3) is broken to the lattice symmetries. The SO(3)-bundle
  picture does not apply as it is.

## 8. A framework: fibred generative models [I]

**Components.**
- Part types, each an interface plus a part.
- Fibre types:
  - ℝ^{3k} for positions;
  - SO(3)-torsors for relative orientations;
  - T^m-torsors for torsions;
  - ker Φ for coarse-grained details.
- Symmetry groups: SO(3) (not O(3), R10a), torsion tori, and S_n and the part
  automorphisms for identical atoms or molecules.

**A model consists of:**
1. a rooted tree of parts, or a tower of coarse-grainings;
2. an invariant model on the root's shape space;
3. at each edge or level, an equivariant kernel on the fibre type, shared
   across occurrences of the same type;
4. corrections:
   - free-energy or density-ratio weights for marginals;
   - energy weights where screening fails;
   - atom-based closure constraints for cycles.

**Sampling and training.**
- *Sampling* is ancestral with clean conditioning, using ambient isotropic noise
  with matching centring (R3, R6).
- *Training:* each kernel is trained on its part in context, or in isolation
  where screening holds.

**What the bundle language guarantees.**
- Frame-free well-definedness.
- The right reference measures, with their Jacobian caveats.
- The exactness condition for reuse.
- A map of the obstructions.

**What it does not provide.**
- Accuracy where screening fails.
- Normalisable ensembles of free molecules.
- Ring closure for free.

**Where the connection enters.**
- Not in the target distribution.
- In any sampler that splits a part's motion into rotation and change of shape:
  that split *is* a choice of connection (R8). The mass-weighted mechanical one
  is the natural choice, and docking models use the unit-mass version.
- In the geometry of the whole (R6).
- In path-dependent constructions (R7).

**Three algorithm sketches.**
- *(A) A bound complex, reusing the single-molecule model.*
  1. Sample A from the existing model.
  2. Optionally reweight it by a density ratio or free energy (R5).
  3. Sample B relative to the clean A with an equivariant conditional diffusion.
     If B's shape is fixed, its relative orientation can diffuse with IGSO(3) on
     the torsor. If B's shape also diffuses, splitting B's noise into rotation
     and shape needs a connection or a local frame, because P_B is not
     M_B × SO(3) for N_B ≥ 4. Simplest: noise B's atoms isotropically and let an
     equivariant network handle the rest.
- *(B) Hierarchy within one molecule.* Heavy atoms (or united atoms, as in the
  video) first, then hydrogens from shared equivariant kernels.
  - Reuse is only approximately exact. Hydrogens interact directly with each
    other (H···H contacts, hydrogen bonds), so the per-environment kernels are
    not conditionally independent.
  - Sample hydrogens jointly given the heavy atoms, with shared weights.
- *(C) Fragment assembly.*
  1. Fragment shapes from per-fragment models.
  2. Torsions on the torsors along a spanning tree.
  3. Ring closure by projection onto flat assignments, or by an atom-based
     closure penalty (R9c).

## 9. Experiments with the current single-molecule diffusion model

1. **Reuse.** For a dimer or a ligand–pocket system, compare:
   - (i) a joint model;
   - (ii) A from the existing model plus a conditional model of B (clean
     conditioning);
   - (iii) (ii) with density-ratio weights for A.

   Measure how far A's marginal shifts in context (R3, R5).
2. **Hydrogen fibre.** A heavy-atom model plus a joint hydrogen kernel, against
   the all-atom model. This measures how far screening fails.
3. **Frames against equivariance.** Canonicalise B in an anchor frame of A,
   against an equivariant conditional. Measure the error near anchor
   degeneracies (R9a).
4. **Chirality.** An O(3)-equivariant against an SO(3)-equivariant conditional,
   for a stereocentre next to a planar interface (R10a).
5. **Noise.** Ambient isotropic noise against noise built from the metric of the
   whole (R6). Test which one keeps a part model reusable, and which gives
   better-conditioned scores (Part 1 of the thesis).
6. **Holonomy diagnostic.** Transport a placement of B around conformational
   loops of A and compare the inconsistency with curvature × area (R7).

## 10. Easy mistakes

1. "Parallel transport couples the distributions." No: equivariance does (R2).
   Transport is path dependent (R7).
2. "Reuse the part's model as its marginal in context." Only with a free-energy
   or density-ratio correction (R5).
3. "Add the scores of part models." Not at intermediate noise levels, except for
   independent parts on disjoint coordinates (R3).
4. "Denoise A with its own score while denoising B conditionally." Only with
   clean conditioning (R3).
5. "Isotropic noise, mass-weighted centring." That makes the noise on A and on B
   correlated. Match the centring to the noise (R3).
6. "Intrinsic Brownian motion in the metric of the whole is the natural noise."
   It couples A to B and breaks reuse (R6).
7. "Unweighted Kabsch is the mechanical connection." Only for unit masses (R8).
8. "Express everything in the part's body frame." There is no continuous global
   frame for four or more atoms (R9a), and the noise in that frame is correlated
   (R6).
9. "Two free molecules have a joint distribution." Not a normalisable one
   without confinement (R4).
10. "Collinear parts are forbidden as bases." Only for bundle and frame
    descriptions; equivariant conditionals are fine (R1).
11. "Label identical molecules canonically." Not continuously (R9b).
12. "Predict relative poses edge by edge." Consistent only on trees (R9c).
13. "A trace or Wilson-loop penalty closes rings." It cannot see translational
    errors (R9c).
14. "O(3)-equivariance is enough." Not for chirality next to planar interfaces
    (R10a).
15. "Densities on shape space need no Jacobian." They carry orbit volume and
    internal-coordinate factors (R4c, d).
16. "There is an energy to reweight with." Not for a model trained only on data;
    use density ratios (R5).

## 11. Related work (checked against the papers)

**Pieces of the framework that exist.**
- DiffDock (Corso, Stärk, Jing, Barzilay, Jaakkola, ICLR 2023, arXiv:2210.01776).
  - Diffusion on ℝ³ × SO(3) × T^m for ligand pose and torsions.
  - Torsion updates are followed by unweighted RMSD alignment, and Proposition 1
    gives zero momentum and angular momentum.
  - Appendix B: the torsion action is only approximately a group action.
- Torsional diffusion (Jing, Corso, Chang, Barzilay, Jaakkola, NeurIPS 2022,
  arXiv:2206.01729). Diffusion on T^m with fixed local structure, and the
  reference-choice argument in Proposition 1.
- FrameDiff (Yim et al., ICML 2023, arXiv:2302.02277).
  - Diffusion on SE(3)^N residue frames built by Gram–Schmidt, with IGSO(3).
  - The bi-invariant metric on SO(3).
  - Invariance obtained by disintegration (Proposition 3.5), because no
    SE(3)-invariant probability measure exists on SE(3)^N.
- AlphaFold 2 (Jumper et al., Nature 2021). Residue frames from N, Cα, C;
  side chains from frames and torsions predicted as unit 2-vectors; the FAPE
  loss is computed in local frames and is not reflection-invariant.
- DiffLinker (Igashov et al., Nature Machine Intelligence 2024,
  arXiv:2210.05274). An O(3)-equivariant diffusion generates linkers in a fixed
  context of fragments: a conditional on a fibre, in this note's terms.
- Rigid-body assembly:
  - AssembleFlow (Guo, Bengio, Liu, ICLR 2025);
  - MOFFlow (Kim et al., ICLR 2025, arXiv:2410.17270);
  - MOFDiff (Fu et al., ICLR 2024, arXiv:2310.10732);
  - MolCrystalFlow (arXiv:2602.16020, a 2026 preprint).
- Hierarchical diffusion: HierDiff (Qiang et al., ICML 2023, arXiv:2305.13266)
  and DecompDiff (Guan et al., ICML 2023).
- Composition: Du et al., "Reduce, Reuse, Recycle", ICML 2023,
  arXiv:2302.11552. Summed scores fail for t > 0; annealed MCMC fixes this.
- Canonicalisation: Dym, Lawrence, Siegel, ICML 2024, arXiv:2402.16077.
- Synchronisation:
  - Singer, Appl. Comput. Harmon. Anal. 30 (2011);
  - Wang and Singer, Information and Inference 2 (2013);
  - Rosen et al., SE-Sync, International Journal of Robotics Research 2019.

**Explicit bundle language.**
- Quotient-Space Diffusion Models (Xu et al., ICLR 2026, arXiv:2604.21809),
  Appendix C. It treats ℝ^{3N} → shape space as a principal bundle and a
  Riemannian submersion with the orthogonal connection, and lifts the diffusion
  horizontally. This is the closest work to the thesis thread.
- Background:
  - Littlejohn and Reinsch, Rev. Mod. Phys. 69 (1997): gauge fields as Coriolis
    effects, and the Eckart frame;
  - Tanimura and Iwai, J. Math. Phys. 41 (2000), arXiv:math-ph/9907005;
  - Montgomery, Lett. Math. Phys. 8 (1984): Wong's equations;
  - J. Vilms, J. Differential Geom. 4 (1970);
  - Kudin and Dymarsky, J. Chem. Phys. 122 (2005);
  - Krasnoshchekov et al., J. Chem. Phys. 140 (2014).

**Not found.** No paper that composes separately trained, learned
single-molecule generators through an explicit bundle (disintegration)
factorisation, with screening-based reuse. The search was not exhaustive.

## 12. Open questions [I]

- **Statistical efficiency of the tower.** The conditional mutual information
  I(B; C | A) vanishes under exact screening and measures what reuse loses.
- **Metric-aware diffusion of composites.** Intrinsic diffusion in the metric of
  the whole (R6) is geometrically natural but breaks reuse. Is there a noise that
  is both well conditioned and keeps marginals autonomous? Candidates are block
  metrics without A–B cross terms, as in the generalisation of R6.
- **Rings.** Diffusion on flat discrete connections, the constraint varieties of
  ring closure, with atom-based closure errors.
- **Learned connections.**
  - A learned connection whose holonomy is trivial on all of M_A would be a
    global frame, which is impossible for N ≥ 4 (R9a).
  - Curvature-aware reuse must therefore either accept path dependence (R7) or
    use kernels invariant under the holonomy group.

## 13. Learning how two molecules interact

**Setting.**
- Two molecules A and B.
- A diffusion model for each isolated molecule, both with the same forward
  process (noise schedule and parametrisation), trained in the same
  environment: solvent, temperature and protonation.
- Joint configurations of the pair from a well-defined ensemble (I6).

**The idea.** Keep both single-molecule scores frozen, add them, and learn only
an *interaction score*. The bundle structure says exactly what that term must
do, and what it learns.

**I1 (exact decomposition) [S, P].**
- **Reference and target.** Let ν = μ_A ⊗ μ_B be the isolated molecules, placed
  independently. Each is invariant under its own rigid motions, so the relative
  pose of the pair is uniform: Haar measure on the relative orientation and
  Lebesgue measure on the relative position (R4). Write the target as μ = w ν,
  where w = dμ/dν; for Boltzmann data, w ∝ e^{−βU_int}.
- **The noised reference factorises.** With independent isotropic noise on all
  atoms (and each molecule centred to match the noise, R3), the noised reference
  is μ_{A,t} ⊗ μ_{B,t}. Its score is exactly the sum of the two single-molecule
  scores, because they act on disjoint coordinates.
- **The noised target.** p_t = ν_t · W_t, with W_t(z) = E_ν[w(Z₀) | Z_t = z].
  This is the form Lu et al. (2023) prove for any target "reference × weight".
  It is the same fact that makes classifier guidance exact when the
  classifier is noise-conditioned (p_t(y | x_t) = E[p(y | x₀) | x_t]; Song et
  al. 2021, Dhariwal and Nichol 2021).
  Hence

  ∇ log p_t(z) = s_A(x_A, t) ⊕ s_B(x_B, t) + ∇ log W_t(z).
- **Training.** Use denoising score matching on joint data, with the
  single-molecule scores frozen and added, and train only the interaction term.
  Its optimum is ∇ log W_t if the single-molecule scores are exact. Otherwise
  it also absorbs their errors on the support of the data.

**I2 (where binding comes from) [P, N].**
- Each single-molecule score is the gradient of a function that is invariant
  under that molecule's own rigid motions. It therefore exerts no net force and
  no net torque on either molecule.
- So in the reverse process, the relative position and orientation of the two
  molecules move *only* through the interaction term.
- That term is invariant only under global rigid motions. Its net forces on A
  and on B cancel, and so do its torques: Newton's third law for scores.
- In an exactly solvable model (two networks of springs):
  - the net force of the single-molecule scores is below 10⁻¹⁴;
  - F_A + F_B of the interaction term is below 3 × 10⁻¹⁴, while |F_A| ≈ 1.

**I3 (what the interaction term learns) [P, N, S].**
- **At small noise it is the force field.** ∇ log W_t → ∇ log w = −β∇U_int.
  If the restraint of I6 is kept in the target rather than put into the
  reference, add the restraint force. That is the intermolecular force field: a potential
  of mean force if the solvent is implicit in the data. In the spring model the
  agreement is exact.
- **At finite noise it is not.** It is not −β∇U_int evaluated at the noisy point.
  In the spring model that shortcut is off by 73% at σ = 0.3, by 370% at σ = 1
  and by 2200% at σ = 3. Lu et al. show that earlier energy-guided samplers fail
  for exactly this reason.
- **Parametrise it as an energy.** Write the term as the gradient of an
  invariant scalar network φ_θ(z, t). Then:
  - it is automatically conservative;
  - it automatically has zero total force and torque;
  - it is permutation-invariant for identical partners;
  - at small t, φ_θ ≈ −βU_int + constant, a learned interaction potential;
  - it gives log W_t, which MCMC corrections and reweighting need (Du et al.
    2023).
- Arts et al. (2023) show that diffusion scores at small noise are usable force
  fields for molecular dynamics, and that a conservative parametrisation is
  what keeps simulations stable.

**I4 (the interaction in bundle terms) [P].** Over M_A × M_B, where both
molecules are non-collinear, the joint distribution splits into three parts:
- **Pose (docking).** On the relative-pose torsor, the density is
  ∝ w(b_A, b_B, pose) with respect to Haar ⊗ Lebesgue: where and how the
  molecules bind, given their shapes.
- **Shapes (induced change).** The shape marginal is
  p̄_A(b_A) p̄_B(b_B) Z_pose(b_A, b_B)/Z, with Z_pose = ∫ w d(Haar ⊗ Lebesgue).
  This is how binding reweights the shapes: at equilibrium it always selects
  states of the isolated ensembles, amplified by Z_pose.
- **Affinity.** The ratio of partition functions, up to the standard-state and
  restraint convention.

One model therefore gives poses, induced shape changes and, with likelihoods,
free energies, and the bundle structure says which factor is which.

**I5 (training without complex data) [S, I].**
- If U_int is known (from a force field or quantum chemistry), the interaction
  term can be trained from the two single-molecule models and the energy alone.
  E_t = −log W_t is learned by contrastive energy prediction (CEP, Lu et al.
  2023) on reference samples: the two single-molecule models plus a uniform
  relative pose inside the restraint.
- **Caveat.** Binding occupies a tiny part of the reference, because random
  relative poses rarely bind. So the estimates have high variance. Anneal β or
  the restraint, or combine the energy with complex data.

**I6 (choosing the ensemble) [P].**
- **Two free molecules have no normalisable joint distribution** (R4). Use a
  radial restraint on the distance between their centres of mass, for example a
  harmonic U_r = ½κ|r|² in the MD that generates the data. It keeps SO(3)
  invariance and makes the ensemble normalisable.
- **Put the restraint into the reference.**
  - The relative-position factor of the reference is then N(0, (βκ)⁻¹ I), and
    its noised score is analytic.
  - w ∝ e^{−βU_int} exactly, and w → 1 at large separation. So at low noise the
    interaction term vanishes for well-separated molecules: a useful inductive
    bias.
  - The restraint's effect on binding free energies is analytic, the usual
    standard-state correction.
- **Bound-only data**, such as crystal structures, give the bound-state
  conditional distribution. Its small-noise interaction term is a force field
  only inside the bound region.
- **Periodic boxes** break SO(3) (R10c).

**I7 (requirements and pitfalls).**
- *Same forward process* for the single-molecule models and the joint model,
  with per-molecule centring matched to the noise (R3).
- *Same environment* for the single-molecule data and the complex data;
  otherwise the interaction term absorbs the differences.
- *Interpretation.* Conformations that are rare in isolation but common in the
  complex expose errors of the single-molecule models. The interaction term
  absorbs those errors: fine for sampling, misleading for interpretation.
- *Symmetry.* Use SO(3)-equivariance, not O(3)-equivariance, so that chiral
  recognition is possible (R10a). For identical partners (homodimers), use
  permutation symmetry (R9b).
- *Long range.* A cutoff interaction network misses long-range electrostatics.
- *Kinetics.* The model learns the equilibrium distribution. At t → 0 the full
  score is a force field (Arts et al.), so Langevin dynamics on it gives
  dynamics, but only in the overdamped model, and only if the data are
  Boltzmann.

**I8 (a first experiment) [I].**
- **System.** A small dimer: water, formic acid, or benzene (stacked versus
  T-shaped).
- **Data.** MD of the pair with a harmonic restraint between the centres of
  mass, and MD of the single molecules under the same conditions.
- **Training.**
  1. The existing single-molecule model, trained on each monomer.
  2. φ_θ, trained on the dimers with the monomer scores frozen.
- **Evaluation.**
  1. Dimer poses against MD.
  2. φ_θ at small t against βU_int from the force field. U_int is known
     exactly, so this is a direct test.
  3. How the monomer shapes shift inside the dimer.
  4. The dimerisation free energy against MD counts.
  5. Data efficiency against a joint model trained from scratch.

**References for this section.**
- C. Lu, H. Chen, J. Chen, H. Su, C. Li, J. Zhu, "Contrastive Energy
  Prediction for Exact Energy-Guided Diffusion Sampling in Offline Reinforcement
  Learning", ICML 2023, PMLR 202:22825–22855, arXiv:2304.12824. Proves
  p_t ∝ q_t e^{−E_t} with E_t(x_t) = −log E[e^{−βE(x₀)} | x_t].
- M. Arts, V. Garcia Satorras, C.-W. Huang, D. Zügner, M. Federici,
  C. Clementi, F. Noé, R. Pinsler, R. van den Berg, "Two for One: Diffusion
  Models and Force Fields for Coarse-Grained Molecular Dynamics", J. Chem. Theory
  Comput. 19, 6151–6159 (2023), doi:10.1021/acs.jctc.3c00702,
  arXiv:2302.00600.
- Du et al. 2023 (§11), for MCMC corrections with energy-parametrised terms.

## 14. The connection, and the covariant exterior derivative

**Short answer.**
- In the design of §13 (ambient coordinates, an equivariant energy network,
  isotropic noise), the connection plays no role in the target distribution or in
  training. No covariant exterior derivative is needed.
- The connection enters only through the noise metric.
- It becomes essential as soon as atoms are moved along bundle coordinates: rigid
  poses, torsions, or shape-only noise.

**C0 (the connection in the bundle formulation of the pair) [P].**

*Setup.*
- The state of the pair is a point of E = P_A ×_{SO(3)} ℝ^{3N_B} over M_A:
  B's atoms as seen from A. Its total space is the shape space of the pair
  (R1).
- In a local gauge s on M_A, write e = [s(b), ỹ]: b is A's shape, ỹ is B's
  coordinates in A's gauge frame. Let 𝒜 = s*ω be the mechanical connection in
  that gauge, so 𝒜(ḃ) is an angular velocity.
- **Horizontal lift.** The induced connection on E has horizontal lift
  (ḃ, 𝒜(ḃ) × ỹ): A changes shape with zero angular momentum of its own, and B
  stays at rest in the lab. This is scene 09.
- **Covariant derivative.** Dỹ = dỹ − 𝒜(db) × ỹ.

*1. The score splits into an A-part and a B-part through D.* For a function f
on E, here log p_t or the interaction log w:

  df = D_H f(db) + ∂_ỹ f · Dỹ,  where  D_H f(ḃ) = ∂_b f · ḃ + ∂_ỹ f · (𝒜(ḃ) × ỹ).

- D_H f is the covariant exterior derivative of f: its derivative along A's
  shape with B parallel-transported. It is gauge independent.
- ∂_ỹ f is the fibre score, B's score relative to A.
- **Applied to the two-molecule design of §13:**
  - D_H log ν = d log p_A and ∂_ỹ log ν = B's own score. The cross term
    vanishes because p_B is invariant under B's rigid motions, and 𝒜(ḃ) × ỹ is
    such a motion.
  - For the interaction, D_H log w is the induced-fit force on A's shape.
  - ∂_ỹ log w is the force on B relative to A. Its restriction to B's rigid
    motions is the binding force and torque.

*2. The reverse process moves B by the connection when A's shape changes.*
- With the noise metric's quotient, the Kaluza–Klein metric
  g = g_A(db) + h(Dỹ) of R6, the drift g⁻¹ d log p_t is

  ḃ = g_A⁻¹ D_H log p_t,  ỹ̇ = 𝒜(ḃ) × ỹ + h⁻¹ ∂_ỹ log p_t,

  up to the usual orbit-volume drift of the quotient.
- **The term 𝒜(ḃ) × ỹ** is how B must move in A's frame while A's shape is
  denoised. It is not small: it is the same gauge field that produces the
  81° rotation of scene 07 and the 43° of scene 09.

*3. The connection makes the bundle-coordinate process well defined.*
- A process written as "b diffuses, ỹ diffuses independently" is not gauge
  covariant. Under a change of gauge s′ = s·g, it picks up a term
  −(g⁻¹dg) × ỹ, so it depends on the chosen frame.
- Frames exist only locally for N_A ≥ 4 (R9a), so such a process is defined
  only on the domain of one gauge.
- With D, the extra term is absorbed by the transformation law of 𝒜, and the
  process is global and frame independent. This is the familiar role of
  d → D = d + 𝒜 in gauge theory.

*4. Curvature appears when updates are composed.*
- Horizontal lifts of two commuting shape directions X and Y do not commute:
  their commutator is the vertical vector ±(F(X, Y) × ỹ)·∂_ỹ (the sign is a
  convention), with F = D𝒜 the curvature.
- So updates of A's shape applied in different orders leave B at different
  places relative to A, by holonomy × area. In discretised reverse steps the
  transport must be integrated consistently, otherwise the error is
  O(step²) × curvature.

*5. Likelihoods in bundle coordinates need the fibre volume.*
- The probability-flow ODE needs the divergence for the volume of the
  Kaluza–Klein metric. That volume contains √det h, with
  det h ∝ det I_A / det I_whole (R6), which depends on b and ỹ.

*6. The ambient implementation does all of this automatically.*
- In Cartesian coordinates with isotropic noise, A's single-molecule score has
  zero net force and torque on A, so it moves A horizontally (for unit masses)
  and leaves B at rest in the lab. That is exactly the horizontal lift of item 2.
- B's scores move B in the fibre.
- So the ambient algorithm realises the induced connection of the noise metric
  without ever computing 𝒜 or D.
- It also keeps Gaussian transition kernels, so denoising score matching stays
  exact. In bundle coordinates the forward kernel is no longer Gaussian.
- **Hence: train in ambient coordinates.** Use the bundle formulation, with 𝒜
  and D written out, to interpret the score (binding versus induced fit), to
  build reduced-coordinate samplers, and for curvature diagnostics.

**C1 (scores are basic forms, so D = d) [P].**
- **Definitions.** For a connection with horizontal projection h, the covariant
  exterior derivative is (Dα)(v₀, …, v_k) = dα(hv₀, …, hv_k). A form is
  *basic* if it is invariant and vanishes on vertical vectors.
- **The key fact.** Basic forms are exactly the pullbacks of forms on the base,
  and d maps basic forms to basic forms. So Dα = dα for every basic α, whatever
  the connection.
- **Scores are basic.** The score of an invariant density is d log p, the
  differential of an invariant function, so it is basic. The connection
  therefore never enters the score, the factorisations of §3 and §13, or
  denoising score matching.
- **For the pair.**
  - The single-molecule scores are basic for SE(3) × SE(3), the rigid motions of
    each molecule separately.
  - The interaction score dφ is basic only for the diagonal SE(3).

**C2 (scores are covectors; updates are vectors) [P].**
- **A covector needs no connection.** Evaluating d log p on any motion gives a
  canonical number.
  - Example: the torsion score d log p(ξ_tor) does not depend on which side of
    the bond rotates. The two choices differ by a global rotation, on which
    d log p vanishes. Torsional diffusion (Appendix F.2) says the same.
- **A vector does.** The reverse SDE moves atoms by G⁻¹ d log p_t, where G is the
  noise metric (noise covariance G⁻¹). Since d log p_t vanishes on vertical
  vectors, this drift is G-orthogonal to the orbits. So it is horizontal for the
  connection whose horizontal space is the G-orthogonal complement of the orbits:
  the mechanical connection of the noise metric.
  - Isotropic unit noise gives the unit-mass connection, the one that DiffDock's
    alignment uses (R8).
  - Noise with covariance M⁻¹ gives the mass-weighted mechanical connection.
  - A metric that vanishes on rigid motions, such as an unregularised stiffness
    metric, defines no connection. A pseudo-inverse then silently picks the
    Euclidean one.
- **So choosing the noise metric is choosing the connection.** Only the reverse
  noise has vertical components: random global rotations, harmless for an
  invariant target.

**C3 (which parts of the interaction are canonical) [P, N].**
- **Canonical, with no connection needed:**
  - the interaction score itself;
  - its pose part, i.e. the net force and torque on each molecule, which is its
    restriction to rigid motions;
  - the pose conditional and the shape reweighting Z_pose of I4.
- **Not canonical:** splitting the interaction force *vector* into a part that
  moves the pose and a part that deforms the molecules. That split needs a
  horizontal complement, i.e. a connection, naturally the one of the noise
  metric.
- **The relative-pose bundle.** M_AB → M_A × M_B is itself a Riemannian
  submersion. Its horizontal motions are those in which each molecule moves with
  zero momentum and angular momentum of its own (numerical check: cosine
  4 × 10⁻¹⁶). The proof is that of R6, applied to both molecules.
- **Its curvature** combines the mechanical curvatures of both molecules: a loop
  of either molecule's shape turns their relative orientation by that molecule's
  holonomy. This is scene 09 with both molecules moving.

**C4 (where the covariant exterior derivative does appear) [P].**
- The curvature of the connection, Ω = Dω: the holonomy and Brownian-holonomy
  scenes 11–14.
- The Kaluza–Klein metric of R6. There Dỹ = dỹ − A(db) × ỹ is D of the
  tautological section, B's position viewed as an equivariant ℝ^{3k}-valued
  function.
- The cross term ∇ₓ log q(y | x) of §3 and §13, written in bundle coordinates.
  It is a horizontal covariant derivative along A's shape (B transported by the
  connection) plus a vertical term fixed by equivariance (the torque of the
  y-score). In ambient coordinates, automatic differentiation computes the total
  directly. The split needs a connection; the total does not.

**C5 (should we use it?)**
- **Not in the current design.** Ambient coordinates with an energy
  parametrisation make everything basic by construction. There is no
  connection to choose, so it cannot be chosen inconsistently.
- **Yes, in these cases:**
  1. *Moving atoms along bundle coordinates* (rigid poses of each molecule,
     torsions, coarse-grained frames). The connection decides how a step in a
     coordinate moves the atoms.
     - Use the horizontal lift for the connection of the noise metric:
       mass-weighted Kabsch for M⁻¹ noise, unweighted for isotropic noise.
     - Steps then compose only up to curvature; this is DiffDock's "approximate
       group action". D gives the gauge-covariant formulas and the curvature
       correction.
  2. *Shape-only (horizontal) diffusion*, as in quotient-space diffusion
     (Xu et al. 2026), where the noise is projected by h. Even then the molecule
     turns in the lab through curvature, the Brownian holonomy of scenes 12–14.
     That is harmless for an invariant target, but it is why the horizontal
     process is not a product of shape and orientation.
  3. *Metric-aware diffusion* (Part 1 of the thesis). G picks the connection
     (C2). Say which one, especially if G is degenerate on rigid motions.
  4. *Dynamics.* L = 0 is a physical constraint, and horizontal transport is the
     motion of a free molecule.
  5. *Diagnostics.* The curvature of the relative-pose bundle measures how much a
     learned pose field depends on conformational paths.
- **The one rule.** If a connection is used anywhere (updates, horizontal noise),
  use the same one everywhere: the connection of the noise metric. Mixing them,
  for example unweighted alignment with mass-weighted noise, silently breaks
  exactness.

## 15. More than two molecules

**The question.** Does the interaction framework of §13 extend to n > 2
molecules? Can one molecule (a "reference particle") carry the SO(3) bundle,
with all other molecules attached as one associated bundle
P_A ×_{SO(3)} (ℝ^{3N_B} × ℝ^{3N_C} × ⋯)? Or is there a construction that uses
the symmetries better?

**M1 (a root molecule works, but it is a gauge) [P].**
- **It is valid.** Over the non-collinear part of M_A, the shape space of the
  cluster is the associated bundle P_A ×_{SO(3)} ℝ^{3(N−N_A)}: every other
  atom, relative to A's centre of mass, viewed in A's frame. This is R1 with
  the rest of the cluster as one big "B". R6 (Kaluza–Klein metric, horizontal
  = transport of scene 09) applies unchanged.
- **The root must be a molecule, not a particle.** One point fixes a position,
  not an orientation (scene 10). The root needs three non-collinear atoms. Ions,
  noble-gas atoms and linear molecules (CO₂, N₂) can never be the root.
- **It breaks a symmetry the physics has.** For identical molecules (a water
  cluster), the distribution is S_n-symmetric. Picking a root splits the
  molecules into "the root" and "the others", and exchanging them is not a map
  of this bundle. The model must then learn, rather than be given, that every
  choice of root gives the same distribution.
- **It does not match the interaction graph.** In a chain A–B–C, molecule C
  touches only B, but the root coordinates place C relative to A. An error in
  the predicted relative orientation of A is multiplied by the distance to C (a
  lever arm).
- **It is not global.** The root's frame exists only where its anchors are not
  collinear, and for N_A ≥ 4 not globally (R9a). This does not matter in
  ambient coordinates, but it does if the fibre is written in the root's frame.

**M2 (the symmetric construction: every molecule is its own bundle) [P, N].**
- **Structure.** This is R1′: the shape space of the cluster fibres over
  M₁ × ⋯ × M_n. The fibre holds the relative poses: n SO(3)-torsors (one per
  molecule) and the n centres of mass, modulo one global rigid motion. As a set
  it needs no root. Choosing a root is choosing a trivialisation, so M1 is M2
  written in a gauge.
- **The connection.** The horizontal motions are those in which *each* molecule
  moves with zero momentum and zero angular momentum of its own. Forgetting all
  relative poses, M_{1…n} → M₁ × ⋯ × M_n, is a Riemannian submersion
  (numerical check for four molecules with 5, 4, 3 and 6 atoms: cosine
  2 × 10⁻¹⁶, norm error 3 × 10⁻¹⁶). The proof is that of R6, applied to every
  molecule.
- **Curvature.** A loop of one molecule's shape turns that molecule, and only
  that molecule, by its own mechanical holonomy. The curvature of the whole is
  the sum of the molecules' curvatures, each acting on its own torsor.
- **Symmetries.** S_n permutes the factors of identical molecules, and the
  bundle is S_n-equivariant. There is still no continuous labelling (R9b), so
  the model must be S_n-equivariant rather than work on a quotient.
- **Small molecules need no special role.** An ion contributes only its
  centre of mass; a linear molecule contributes its axis (its stabiliser is
  SO(2)). The fibration is then no longer that of a free action (R1′ assumes
  non-collinear molecules), so the fibre loses those directions. But nothing
  has to be a root, and the ambient implementation is unaffected.

**M3 (the score for n molecules) [P].**
- **Decomposition.** Exactly as I1: ν = ⊗ᵢ μᵢ times a restraint, p_t = ν_t W_t
  and

  ∇ log p_t = s₁(x₁, t) ⊕ ⋯ ⊕ s_n(x_n, t) + ∇ log W_t.

  Identical molecules share one monomer model.
- **Forces.** Each monomer score exerts no net force or torque on any molecule
  (I2). The interaction score exerts zero total force and torque on the
  cluster: Newton's third law for the whole, not for each pair separately.
- **Restraint.** Use a symmetric one, for example a harmonic restraint of every
  molecule's centre towards the cluster's centre. Use the centres that match
  the noise (R3): plain centroids for equal isotropic noise on every atom,
  centres of mass for mass-weighted noise. It keeps SO(3) and S_n
  and is Gaussian, so its noised score is analytic. A restraint towards a root
  molecule breaks S_n again. Periodic boxes break SO(3) (R10c), but every
  molecule keeps its own bundle, so the monomer scores remain exact.
- **The network.** One scalar φ_θ(z, t), invariant under SE(3) and S_n,
  over all atoms of the cluster. Its gradient is conservative and satisfies the
  third law automatically.

**M4 (noise turns pair interactions into many-body interactions) [P, N].**
This is the easy mistake for n > 2.
- **The claim one would like.** If the physics is pairwise,
  U_int = Σ_{i<j} u_ij, then w = ∏ w_ij. One might hope that the interaction
  term is a sum of pair terms learned on dimers: log W_t = Σ log W_t^{ij}.
- **It is false at finite noise.** W_t(z) = E[∏ w_ij | z], and the posterior
  of molecule i given its noisy coordinates is shared by all pairs that contain
  i. So the expectation of the product is not the product of the pair
  expectations. A three-body term appears. It vanishes as t → 0, where W_t → w.
- **How large it is.** Three point molecules on a line, attracted to distance 1
  by a well of width 0.15, with reference N(0, 1) and variance-preserving
  noise. Ratio of the three-body part of the interaction score to the whole
  interaction score, on 300 noised trimer samples, integrated on a fine grid
  in the difference coordinates (unchanged at half the grid step;
  [many_molecule_checks.py](many-bundles-checks/many_molecule_checks.py)):

  | noise σ | 0.02 | 0.05 | 0.1 | 0.2 | 0.3 | 0.4 | 0.7 |
  |---|---|---|---|---|---|---|---|
  | three-body part | 3% | 13% | 27% | 68% | 84% | 79% | 39% |

  (bootstrap standard errors at most 3 points.) It peaks near 80% when the
  noise is about twice the width of the well. Hydrogen-bond wells are a few
  tenths of an ångström wide, and the noise schedule runs to several
  ångströms, so this covers most of the schedule. An earlier version of this
  table used a Gauss–Hermite rule that is too coarse for σ ≥ 0.4.
- **Consequences.**
  - A dimer interaction model does *not* compose into an exact trimer model by
    summing over pairs, except at small noise. φ_θ must be many-body at t > 0
    even when the physics is pairwise.
  - Real interactions also have many-body terms of their own (polarisation).
    In small water clusters the three-body term is of the order of 10–20% of
    the binding energy (Xantheas, J. Chem. Phys. 100, 7523 (1994); the exact
    value is still to be checked against the paper).
  - At small noise, composition is exact: summing dimer-learned small-t terms
    gives a pairwise force field, usable for MD or for a Langevin/MCMC
    corrector at t ≈ 0 (Arts et al. 2023).
- **What can be reused [I].**
  - Pretrain the pair part of φ_θ on dimers, then train a t-dependent many-body
    correction on cluster data. For pairwise physics the correction should
    vanish as t → 0, which can be built in (for example a factor of σ_t).
  - Or train −log W_t for the cluster from the pair energy alone by contrastive
    energy prediction (I5). The identity W_t = E[∏ w_ij | z] is exact, but the
    reference rarely forms clusters, so the variance is even higher than for
    dimers.

**M5 (consistency) [P].**
- Relative poses predicted pair by pair must close around every triangle of
  molecules: a flatness condition, solved by synchronisation (R9c). A single
  scalar φ_θ in ambient coordinates gives consistent poses by construction. A
  model with one pose head per pair does not.
- Use SO(3), not O(3), for chiral recognition (R10a).

**M6 (hierarchy) [I].** The construction iterates. Atoms → molecules → clusters
→ clusters of clusters is a tower of Riemannian submersions, where at each
level "horizontal" means that every unit moves with zero momentum and angular
momentum of its own. Each level adds its relative poses as a fibre and its own
interaction term. Coarse-grained units fit in through R1″.

**M7 (recommendation).**
- Use M2, implemented ambiently:
  - all atoms of all molecules;
  - frozen monomer scores, shared between identical molecules;
  - one SE(3)- and S_n-invariant interaction energy over the whole cluster;
  - a harmonic restraint of each molecule's centre towards the cluster's
    centre (centroids or centres of mass, matching the noise, R3).
- There is no root and no connection in the implementation. The bundle
  structure is in the guarantees (zero net force of the monomer scores, the
  third law, consistent poses), not in the coordinates.
- **What to expect.** On the water dimer, the decomposition gave no
  data-efficiency gain over a joint model
  ([grapentt/riemannian-generative#762](https://github.com/grapentt/riemannian-generative/pull/762)).
  For clusters the hoped-for gain is transfer from pairs to clusters, and M4
  limits that transfer to small noise. The test that decides it: train on
  dimers plus a few trimers, and evaluate on trimers and tetramers against a
  joint model trained on the same data.
