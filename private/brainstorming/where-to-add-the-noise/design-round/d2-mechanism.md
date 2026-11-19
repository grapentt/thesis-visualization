# d2 · Mechanism engineer — "The Bench": exact worlds behind the riemannian-generative project

Designer d2, 2026-11-19. Angle: every idea of the project gets one exactly computable small world (a **rig**) that
runs live in the browser; five playable videos and one explorable wrap the rigs into a programme that covers all
eras. Sources: `SP/understand/*` (r1–r8, g1–g4, a1–a3, 00-critic), primary files in `SP/rg-main` and
`LOCAL = /Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative`. Values marked **(checked d2)**
were recomputed for this proposal (inline numpy, nothing written to disk).

**Tags.** [D] derived or exact (closed form, or an exact model evaluated numerically), [M] measured (system, data,
budget and source named), [H] hypothesis, [I] illustrative (toy constants), [S] cited from a paper (the repo's own
label). Source shorthands: n20 = theory note 20 (and so on); #NNN = ML-repo PR or issue; r1…g4 = the reader reports.

---

## 1. Organizing idea

Every idea this project produced has a small world in which it is exact. A Gaussian mode under the VP clock is
half erased at t½(λ) = (−0.1 + √(0.01 + 39.8 ln(1+λ)))/19.9 and nothing else matters; a five-point cloud flattening
toward a plane runs its wδ distance up to 17 while it moves one Euclidean unit; one bond under the spring metric is a
cone with curvature 0.0293 per squared thermal width; a 28-bead chain with independent torsions has readabilities
that a 9×9 transfer matrix gives to four digits; dropping a volume term turns a Rayleigh law into a half-normal one.
The programme is a **bench of such rigs** (seventeen small DOM-free JavaScript models with Node tests). Every scene
puts a rig on stage, turns the one dial the project turned, and sets the measured number from the real molecule
beside the rig's answer ("toy says / molecule says", each with its badge). This fits the project because its history
is a chain of mechanisms found by exact reasoning before training (notes 20–30) and of corrections found by exact
checks (a transposed tensor, a sign, a clock, a volume term). It fits the audience (the author, supervisors and
examiners: fluent and sceptical) because every claim can be stress-tested on the spot: move the dial, the readout
must follow the formula, and the formula must land near the logged measurement or the scene says why not. Honesty is
structural: the rig stamp says what is exact and under which assumption; the molecule badge says what was measured,
on which data and at which budget. The eras then read as a sequence of rigs: the thin cloud and the banana (Jul–Oct),
the nine-mode noise clock (Oct 23), the cone and the orange peel (Oct 25), the 27-mode spectrum and the anti-order
chain (Nov 12–18), the radial volume toy (Nov 16).

---

## 2. Programme map

| # | id · display title | kind | length | era, dates | rigs (§5) | purpose | builds on |
|---|---|---|---|---|---|---|---|
| P | `straightening` · **Prologue · Infinitely far** | playable video, 6 scenes | ≈ 9 min | pitch + Era 1 (Jun → 2026-10-22) | C5 thin cloud, C6 projected chord, C7 scale clock, C8 banana | why the Euclidean metric is arbitrary; the wδ idea; why it broke; what became of "straightening" | Part 0 (orbits, degenerate shapes); Covariance 23–28 |
| 2 | `noise-clock` · **Part 2 · The noise clock** (**MVP**) | playable, 7 | ≈ 10.5 min | Era 2 (2026-10-23 →) | C1 clock, C2 meter, C3 nine-mode ALDP5, C4 bowl, blur dial | when flat noise erases what; the floor; the loss; forces; thermal units | Part 1 (Problems 1–3, "G = K"); Retention 05–06; Covariance 14–16; Interactions 02, 12 |
| 3 | `spring-metric` · **Part 3 · Embed, don't flatten** | playable, 7 | ≈ 10.5 min | Era 3 (2026-10-23 → 11-16) | C9 cone and peel, C10 bond dynamics, spring pullback | the spring metric as a pullback; why it is curved; embedding; forces that pass; the ALDP5 verdict | Part 1's card "next: the spring metric"; Covariance 32; Atlas; Retention 03 |
| 4 | `range-order` · **Part 4 · Range and order** | playable, 7 | ≈ 11 min | Era 4–5 (2026-11-01 → 11-18) | C11 spectrum and dials, C12 chain, C13 seesaw, C14 KL ledger | why whitening killed order; anti-order; two loud vectors; results | Retention 06, 09; Part 2's raster |
| 5 | `force-readout` · **Part 5 · Reading a force** | playable, 6 | ≈ 8 min | now (2026-11-14 → 19) | C12 lever arm, C15 radial volume, C16 two-description rebuild | blur against wall; the phantom spring; the rebuild; drift; what is open | Part 2's blur dial; the Prologue's barrier |
| B | `explorables/bench.html` · **The bench** | explorable | — | all | all rigs, with calibration lamps | free play; self-test; provenance drawer | everything |

**Viewing order.** Part 0 → Part 1 → Prologue → Part 2 → (Retention) → (Covariance, optional foundations) → Part 3 →
Part 4 → Part 5; the bench at any time. Part 1's last card ("Next video: the spring metric") should be retargeted
to "Next: the noise clock, then the spring metric" (one string). The spring metric arrives in Part 3 as promised.

**The arc in three moves.** (1) *Nine clocks become one* (Part 2's climax): thermal units put all nine ALDP5 modes on
one erasure clock. This was the goal of the stiffness programme. (2) *One clock is not enough* (Part 4): on BBA the
same synchronization erases the fold together with the detail; the pivotal correction of 2026-11-12. (3) *Order
with range* (Parts 4–5): thermal-width internal coordinates give range, two loud vectors give order, and what this
chart still cannot read (contacts) has to be supplied.

**Lever arcs** (u1-force rule: at most five levers per piece, one gesture each, a handover after the narrator has
performed it). The **gold playhead t** is the one handle reused in every piece.
- Prologue: flatness e (P.3), squeeze A₁₁ (P.6).
- Part 2: variance λ (2.2), noise shape flat/thermal (2.3), floor t_min (2.4), read-out level t\* (2.6).
- Part 3: w and γ (3.2), cap size θ (3.3), step h (3.5).
- Part 4: γ (4.2), playhead t (4.3, 4.5), loudness L² (4.5).
- Part 5: read-out level t\* (5.1), volume-term lens (5.3), drag the loud vector (5.4).

**Recurring devices** (§4): noise clock and floor curtain, Gaussian meter, destruction raster, ghost bundles,
toy/molecule badge pairs, rig stamp, epistemic badges, ledger strip.

---

## 3. Piece-by-piece storyboards

Per scene: **title · duration**; Screen; Computed; Numbers; Beat; Controls; → transition. Every number comes from a
rig (§5.1) or a provenance-carrying data file (§5.2); scene files hold no numeric literals beyond layout and timing.

### Prologue · Infinitely far (`straightening`, ≈ 9 min)

**Title, 15 s.** The ledger lights "Jun–Jul 2026 · pitch". A grid with columns "has a generator" and "has
geometry": ScoreMD (flat, Fokker–Planck consistent, its small-t energy a force field, an iid–simulation dilemma [S])
and Diepeveen's wδ shape space (geometry, no generator); the empty cell is the thesis.

**P.1 Labels, lengths and chords · 80 s**
- Screen: left, Part 1's five-atom toy molecule; right, three rulers (Euclidean Å, pair-distance change, energy kT).
  Beat 1: the molecule turns 30°; its Euclidean distance to its old copy rises while every pair distance stays put
  (Part 0's orbit returns as a dashed fibre). Beat 2: a 0.1 Å stretch of bond 1–2 against a 1.0 Å torsion arc of H5.
  Beat 3: the straight Cartesian line between the two H5 rotamers.
- Computed: Kabsch RMSD; `springEnergy` of `src/model/energy.js`; linear interpolation of coordinates.
- Numbers: Euclid 0.11 vs 0.95 Å, energy 0.105 vs 0.044 eV (4 vs 1.7 kT): "8.5× closer", "2.4× costlier"; on the
  rotamer chord, O–H shrinks 0.96 → 0.40 Å at the midpoint, U = 3.27 eV ≈ 126 kT, against 0.10 eV along the torsion
  path [I, toy network, computed in a1 §6.1].
- Beat: a Cartesian distance measures labels and lengths, not shapes or costs, and a straight Cartesian line can cut
  through the molecule.
- Controls: lens "ruler"; drag lens to rotate.
- → The energy ruler's ticks bend into logarithmic spacing.

**P.2 Straight lines in log-distance space · 85 s**
- Screen: the wδ features F(X) = ((log r_ij)_{i<j}, √δ log det G_X) built term by term on the ALDP5 backbone. A
  dimer closes a contact from 10 to 4 Å. Then two ALDP5 frames joined by the Cartesian chord and by wδ's "geodesic":
  the straight feature chord (each distance interpolated geometrically, r^{1−t}r′^t) projected back onto the nearest
  realizable molecule. Live readout: the shortest bond along each path.
- Computed: F and its 11×15 Jacobian; a Gauss–Newton projection argmin_Z ‖F(Z) − [(1−t)F(X) + tF(Y)]‖² at 41 values
  of t, precomputed at load. The exact identity is shown on screen: (1−t)‖a−y‖² + t‖a−w‖² = ‖a−[(1−t)y+tw]‖² +
  t(1−t)‖y−w‖² [D g2 M2].
- Numbers: dimer midpoint 6.325 Å (wδ) vs 7.0 Å (Cartesian) [D g2 E1]; +0.1 Å costs 0.004165 on a 1.5 Å pair and
  0.000392 on a 5 Å pair; changing Å to nm leaves wδ unchanged (difference below 10⁻¹²) [D r1 E5, checked d2].
  Measured (#513, ALDP5, 18 points): Cartesian chord RMSD to the MD frames 0.224 vs wδ 0.247 Å, but local-distance
  RMSE 0.052 vs 0.032 Å; adenylate kinase 1.76 vs 2.03 Å, adjacent Cα 0.144 vs 0.077 Å [M #513]. Diepeveen's rank-1
  result on adenylate kinase is reproduced by plain Cartesian PCA (variance 0.8934 vs 0.8927; RMSD 0.747 vs 0.748 Å)
  [D g2 §4.3, unofficial].
- Beat: wδ's straight lines live in log-distance space; they protect short distances, not the path. The
  straightness of the adenylate kinase figure came from the data, not from the metric.
- Controls: lever t along the chord (the gold handle); lens "show Cartesian chord".
- → One pair distance shrinks toward zero and its log runs to −∞.

**P.3 Infinitely far · 95 s · CLIMAX** ("the wall you never reach")
- Screen: the flattening family X_e = ((±1,0,e), (0,±1,−e), (0,0,0)) in 3D (painter's algorithm, authored orbit).
  Two odometers side by side: Euclidean ‖X_e − X_{0.5}‖ and wδ. The metric's horizontal unit ball is drawn as an
  ellipsoid that stretches like e⁻² in thickness and flattens like e² in bending. A log–log inset shows λ_min, λ_max
  and the condition number against e (slopes +2, −2, −4). A marker labelled "ALDP5 backbone" sits next to the wall.
- Computed: wδ features with δ = 1; H = JᵀJ = A + δB (B of rank one, n01); the horizontal projector from the six
  rigid generators; a Jacobi eigensolve of the 9×9 horizontal block.
- Numbers: at e = 0.1/0.01/0.001/10⁻⁴ the Euclidean odometer reads 0.8/0.98/0.998/0.9998 while wδ
  reads 3.2489/7.8377/12.4378/17.0407; horizontal condition number 42.1/501/6,437/9.8×10⁴/
  3.8×10⁶/6.0×10⁷ at e = 0.5/0.2/0.1/0.05/0.02/0.01 [D r1 E1, checked d2]. The bounds on screen are
  |Δ log r_ij| ≤ d_g and |Δ log det G| ≤ d_g/√δ [D n01]. Real data: worst condition 1.55×10⁶ for the five backbone
  beads (n = 5) against 4.2×10³ with a Cβ (n = 6); λ_min 1.6×10⁻⁴ vs 0.10 [M Sprint 7]. The phantom bead restores the
  rank but changes the geometry: the dilation cost √46 becomes √51 [D r1 E6].
- Beat: the barrier that puts collisions infinitely far also puts every flat cloud infinitely far, and the ALDP5
  backbone is almost flat.
- Controls: lever e, handed over at 70 s: the viewer pushes the cloud toward the plane and watches the wδ odometer
  outrun the Euclidean one.
- → The ellipsoid's long axis becomes the step direction of an integrator.

**P.4 No closed form · 85 s**
- Screen: two code panes (llm-soc's `codeBlock`, promoted to `src/draw`). Flat noising is one line,
  `x_t = α x0 + σ ε`; wδ noising needs a frame eigendecomposition and S = clip(⌈8r²⌉, 8, 1024) Verlet sub-steps, each
  with a dense horizontal solve, for every walk step and every one of 500 reverse steps. A cost bar on a log axis.
  Then the one place where the forward law can be checked exactly: wδ splits into a flat log-scale coordinate z and a
  shape factor, and on z the one-kick forward has the mean multiplier A(t) = 1 − ½β(t)τ(t), τ = c²(1 − e^{−B}),
  c² = 1/9, drawn against a(t) = e^{−B/2}. A "bug onion" peels on the right, one layer per real bug.
- Numbers: per sample 0.74 s flat vs ≈ 253 s (≈ 340×) vs ≈ 445 s (≈ 600×) [M Sprint 7, small cold benchmark];
  A(0.10) = 0.988, A(0.55) = 0.415, A(0.91) = −0.011, A(1) = −0.111 against a(1) = 0.00657: the multiplier crosses
  zero, which no Ornstein–Uhlenbeck transition can do [D r1 E3, checked d2]. Chord-bound violations 38.3% with 8
  sub-steps vs 2.34% with 128 [M r1 E14]. Onion layers: transposed 3×3 blocks (rigid residual 1.3×10⁻¹⁴ vs 5.97)
  [D r1 M5]; the score sign; τ = 2; an eigh NaN; TF32; clamps; a clock mismatch; the covector-ISM divergence sign
  [D r1 E9].
- Beat: with no closed-form kernel, every coherence condition (clock, label, prior, reverse rate) had to be matched by
  hand, and each mismatch was a real bug.
- Controls: none (narrated).
- → The zero crossing of A(t) becomes a timeline.

**P.5 Finite is not correct · 60 s**
- Screen: a scoreboard over time (August → October) on one log JS axis, with the data-floor band and the bug fixes as
  vertical events. Inset: the Sprint 7 Ramachandran plane with the αL box.
- Numbers (logged; indicative only, since n, N and conventions differ between rows): Sprint 1 wδ·GRW+OU 0.117 ± 0.007
  vs identity 0.479 ± 0.005 [M]; Sprint 7 finite fraction 0.9996
  but JS 0.325 and αL box 25.2% vs 0.60% (the raw box is reflection-confounded) [M]; Sprint 8 flat 0.2846/0.2618 →
  0.1012 after the vp_mean fix; ScoreMD-native flat 0.0151 vs floor 0.0114 [M head-to-head]; 2026-10-22 (Sprint 10):
  flat Cartesian stays the default [M].
- Beat: the early win was the baseline's bug; once both arms were correct, wδ's advantage was gone.
- Controls: none.
- → The question card: "Then what should a metric do?"

**P.6 Straightening, made exact · 100 s**
- Screen: Diepeveen 2025's banana as an exact world, p(x) = N(φ(x); 0, A) with φ(x) = (x₁ − x₂²/9, x₂) and
  det Dφ = 1. A straight segment between two likely points is drawn against the valley geodesic
  φ⁻¹((1−s)φ(x) + sφ(y)). The coordinate grid is pushed through φ and unbends (attention/06 idiom). In the latent
  chart the score field is linear and stays linear under VP noise, −(α²A + σ²I)⁻¹y; in raw coordinates it is cubic.
- Numbers: ψ along the straight line peaks at 2.000 (A = diag(¼, 4)) and 40.5 (squeezed, A = diag(1/81, 4)), against
  1.125 along the geodesic; KL(raw ‖ best Gaussian) = ½ ln(1 + 2A₂₂²/(81A₁₁)) = 0.474/1.748 nats; for the river
  1.301 [D g2 E2; closed form checked d2, g2's sample estimate 1.747]. ALDP5 (CPU pilots, 2026-11-05): a warp fitted on
  100 ps steps Gaussianizes the slow modes, total KL to Gaussian 0.14 vs 0.96 (flat) and JS after 100 updates 0.027
  vs 0.117 [M]. The price: its unimodal latent fills the rare αL saddle, 30 vs 4–6 per 10⁴ in MD [M g2 §4.5]. wδ's
  own afterlife as a flat feature map on BBA (190,350 updates): the best size error, 0.062/0.072 Å, and 0% clashes, but
  bonds 0.027/0.034 Å, 86× worse than ordered internal coordinates [M real-budget study].
- Beat: "straightened coordinates make the score linear" came true, but as Gaussianization by a learned map, not
  through wδ's geodesics. wδ survived as a feature map with a contact barrier (Part 5 returns to it).
- Controls: lever "squeeze" A₁₁ from ¼ to 1/81: the straight line's likelihood dip deepens and the KL grows.
- End card, 10 s: "What should a metric do to the noise?" (note 20, 2026-10-23) → Part 2.

### Part 2 · The noise clock (`noise-clock`, MVP, ≈ 10.5 min)

**Title, 15 s.** The ledger lights 2026-10-23 (PR #745, notes 20–21). The ALDP5 backbone vibrates in its nine
measured modes.

**2.1 What the network sees at the floor · 55 s**
- Screen: the ALDP5 backbone (mean structure, asset A1) with a ghost bundle of 24 posterior completions given one
  noisy observation at t = 0.01. The noise is flat, at the pilots' production scale (0.042 Å per coordinate).
  Torsion ghosts coincide; bond ghosts fan out. Nine small meters r_k beside the molecule.
- Computed: per mode x_k | y ~ N(r_k y/α, λ_k(1 − r_k)) in noise units; ghost_i = mean + √var·z_i, fixed z_i.
- Numbers: r(0.01) = 0.264, 0.328, 0.498, 0.625, 0.707, 0.896, 0.951, 0.985, 0.996 for the nine principal widths
  0.0252 … 0.6631 Å [D, from widths M: mdshare trajectory 1, #768 evidence; checked d2].
- Beat: at the lowest noise level the network is ever trained on, the stiffest modes are still mostly undecided.
- Controls: none.
- → The ghosts collapse onto one mode, and the camera zooms into its meter.

**2.2 One mode, one meter · 80 s**
- Screen: one shared axis, never rescaled: 400 seeded samples of Z ~ N(0, λ) pour in, then their noised images
  Y = αZ + σε, then the exact curves (samples before curves, per the user's feedback). Below: the noise clock and the
  meter r(t) with its half point and a decision bracket (R = 0.8 → 0.2).
- Computed: α, σ of the VP schedule (β 0.1 → 20); r(t) = α²λ/(α²λ + σ²); t½(λ); the decision window
  SNR ∈ [0.25/λ, 4/λ]; the width probe r²; information −½ ln(1 − r).
- Numbers: t½(1) = 0.259; the decision window spans a factor 16 in SNR (1.2 decades, 2.77 nats); at R = ½ at least
  0.35 nats survive; a width keeps r², a quarter at R = ½ [D n26, n27, g3 C2].
- Beat: for a Gaussian feature, only its variance in noise units decides when it is erased.
- Controls: lever λ (handover at 65 s). The viewer discovers that 100× more variance moves t½ only from 0.093 to
  0.486 (λ = 0.1 → 10) [D r4 E1].
- Link card: "Retention generalizes this to any observable: I_t = Cov(E[u | X_t])."
- → The single meter is copied nine times, one per ALDP5 mode.

**2.3 Nine rulers on one clock · 90 s · CLIMAX** ("nine clocks become one")
- Screen: the destruction raster: one row per mode, labelled by its eigenvector as atom arrows on a backbone
  thumbnail; bars span decision windows, dots mark t½; the trained band [0.01, 1] above the floor curtain; the gold
  playhead sweeps. Then the noise shape switches to thermal units and all nine bars slide to one column at
  t½ = 0.259, above the curtain.
- Computed: λ_k = (w_k/0.9418)² under flat noise, λ_k = 1 in thermal units; the share of uniform training draws on
  [t_min, 1] with t < t½.
- Numbers: flat t½ = 0.0048, 0.0061, 0.0099, 0.014, 0.018, 0.037, 0.057, 0.11, 0.20; the three stiffest modes are
  half erased below the floor. Readable share of training draws: 0, 0, 0, 0.4, 0.8, 2.7, 4.7, 9.9, 18.8%, against 25%
  for every thermal-unit channel [D, checked d2]. A bond length, the difference of two atoms, is half erased at
  t ≈ 0.003–0.004 [D]. Part 1's "×20 in noise level" is ×10–14 within one real basin and ×30 across all data
  (√κ with κ = 97–192 and ≈ 920) [M n20/n21, g4 §3.5].
- Beat: flat noise spreads the erasure of one molecule over two decades of t; thermal units put every mode on one
  clock. This is the stiffness programme's goal in one picture.
- Controls: lever "noise shape" (flat / thermal; a choice made a lever with `leverSim`); lever "noise unit"
  (production 0.9418 Å / own scale 0.267 Å with floor 10⁻⁵). With the own scale every mode rises above its floor
  (t½ 0.025 … 0.44) [D r3 E19].
- → The curtain lifts on the bond's row.

**2.4 Below the floor · 80 s**
- Screen: one bond length: the data histogram (width w), the leftover noise s at the floor, and the Tweedie image of
  every sample (arrows contracting toward the mean). Inset: the flat production model's bond width ratio against
  training updates (logged).
- Computed: bond SNR at t = 0.01 in three unit conventions; the Tweedie ratio w/√(w² + s²) with s = √2 × 0.042 Å.
- Numbers: bond SNR at the floor stays below 1 in every convention: 0.30–0.46 (manifold route), 0.34–0.52 (pilot
  scale), 0.16–0.18 (window mode) [D n21 Prop 5, g4 §3.6]. Tweedie predicts 0.39–0.46 of the width [D]; measured
  0.44–0.53 at 200k updates (mdshare), while the same model's bonds were 1.8–2.8× too broad at 1k [M #765]; the
  network is not an exact posterior, so the measurement lies between the one- and two-atom idealizations [r4 E5].
- Beat: a floor wider than a bond means bonds are never trained; the last denoising step then shrinks them, and more
  training makes this worse.
- Controls: lever t_min: the Tweedie ratio and the readable share of training update live.
- → Question card: "If the loss never sees the bonds, why did Part 1 say it over-charges them?"

**2.5 The target and the loss · 100 s**
- Screen, part a (45 s): the stretched bowl, a quadratic loss whose curvature is input variance times loss weight;
  gradient descent zigzags in the Riemannian pairing and takes a few Newton-like steps in thermal units. Part b (55 s):
  Part 1's Problem 3 bars return beside each mode's per-level loss weight drawn against its readable window; the
  product, integrated, is the stiff over-charge.
- Computed: gradient descent on a 2-D quadratic with Hessian eigenvalues c_j·m_i (iterations counted live); the
  likelihood-weighted bound integrand per mode; the loss-blindness excess
  σ²(α²w² + σ²)(1/(α²r²w² + σ²) − 1/(α²w² + σ²))² averaged over t ~ U[10⁻⁵, 1].
- Numbers: on the ALDP5 window the training curvature is 1.9×10⁴ for the Riemannian score with raw inputs (24,319
  gradient-descent steps) against 8.1 for the whitened score with thermal inputs (31 steps) [M/D n21 §4.3]. Per level the Euclidean score loss charges a 5% stiff error κ times more (Part 1, κ = 400 [I]);
  integrated with likelihood weighting the over-charge is ≈ 1.5× on ALDP5 (17.5 vs 11.4) [D n21 §6, §8]. In
  noise-prediction units a bond width 23% too broad costs an excess loss of 0.0098, against minibatch scatter
  0.02–0.07 [D, d2 recomputation with assumed geometric widths; the source gives 0.0093]. Whatever the preconditioner,
  a constant score error δ shifts the samples by Σδ at KL ½δᵀΣδ, so equal relative errors cost the same, ½·0.05², in
  soft and stiff modes [D n21 Prop 8].
- Beat: "the loss over-charges stiff errors" and "the loss does not see the bonds" are one fact seen from two sides:
  a huge weight on a window that the noise almost never opens. Only thermal units at input and output make the bowl
  round.
- Controls: lens "pairing" (Riemannian / covector / whitened-raw / whitened-thermal): the bowl reshapes and the step
  count changes.
- → The score at small noise is a force.

**2.6 The blur dial · 100 s**
- Screen: the nine meters become a curve r(t\*) over the modes with a read-out-level dial; measured equipartition
  (Stein) ratios drop onto it, one colour per arm. Right: a seeded Brownian-dynamics simulation of the nine-mode
  Gaussian under the blurred force, with histograms of modes 1 and 9 against the true widths.
- Computed: F_t(x) = α s_t(αx) = r(t)·F₀(x); the Stein ratio −E[(g·e)(e·(u−ū))] equals r(t); the stationary width is
  √(λ/r) = √(λ + τ²) with τ = σ/α [D g1 §2.11]; Euler–Maruyama, 500 walkers per mode, fixed seed.
- Numbers: ideal ratios at t = 0.01: 0.264 … 0.996 (width inflation 1.95 … 1.00). Measured, flat production floor,
  seed 0: 0.198, 0.252, 0.293, 0.485, 0.459, 0.418, 0.694, 0.727, 0.369 [M #768]. Flat low floor read at 0.003:
  0.91–1.04 on the eight stiffer directions [M], but its simulations drift to 83% αR (MD 35%) or to 16% φ > 0 (MD 1.7%) [M #768]. Spring read at
  0.03: 0.95–1.01 on the eight stiffer directions; the softest, torsional and multimodal, gives 0.52, outside the
  Gaussian model [M #768]. ScoreMD's two horns: read early and one level carries soft-force information ∝ σ² (error
  ∝ 1/σ) [D n30 §7]; read late and stiff modes soften to r(t) [D]. Paper: Two-For-One's simulated C–N bond 23.51×
  worse on ALDP; FP + MoE repairs simulation (BBA 0.254) while iid rises 0.034 → 0.234 [S ScoreMD].
- Beat: a force read at noise level t is the force of the blurred molecule; in flat units the best read-out levels for
  stiff and soft modes lie far apart.
- Controls: lever t\* (handover at 80 s): the viewer finds no flat level at which all nine points sit near 1.
- → Switching to thermal units flattens the curve to r(0.03) = 0.988 for every mode.

**2.7 The ruler that must turn · 75 s**
- Screen: in thermal units one read-out level serves all nine modes. Then a bond rotates: a constant ellipse is stiff
  along the wrong axis after 90°; an ellipse attached to the bond stays right.
- Numbers: r(0.03) = 0.988 and r(0.05) = 0.971 (width inflation 1.006 and 1.015) [D]. By Schur's lemma a constant
  metric commuting with all rotations is A⊗I₃, which weights every direction of a bond vector equally [D n20 Lemma 2].
  A fixed global whitening is worse than no metric on ALDP5: residual stiffness 273 vs 192 (β/C7eq) and 477 vs 112
  (αR) [M n20 §5.3]. A rotating bond turns its stiff direction by σ_w/d per soft width: ε_rot = 0.90 at γ = 30
  [D/M n21 §7.2].
- Beat: stiffness has a direction that turns with the molecule, so a stiffness metric must depend on the
  configuration, and is therefore curved.
- Controls: drag the bond (lens).
- End card: "Next: a ruler that turns with every bond" → Part 3.

### Part 3 · Embed, don't flatten (`spring-metric`, ≈ 10.5 min)

**Title, 15 s.** The ledger lights 2026-10-25 (notes 22–23) and Sprint 11 (#769, 2026-10-27).

**3.1 The spring metric is a pullback · 85 s**
- Screen: the ALDP5 backbone with springs on its 4 bonds and 3 one–three pairs, drawn with width ∝ √w. Part 1's
  formula-flight idiom: J_d (7×15), W = diag(w) and J_dᵀ fly into G = J_dᵀWJ_d + γI, shown as a 15×15 matrix heat
  map; then F(x) = (W^{1/2}d(x), √γ x) with G = DFᵀDF.
- Computed: the rigidity matrix at a β-basin structure built by NeRF from note 20's bond lengths and one–three
  distances, φ = −142°, ψ = 171°; G and its eigenvectors drawn on the molecule (lens). Stamp: "constants: bgmol
  (note 20); trained results in 3.5–3.6: mdshare".
- Numbers: w = βk = 1,650/1,159/1,108/1,659 Å⁻² (bonds) and 459/302/411 Å⁻² (one–three pairs), γ = 30 Å⁻²
  [M n20 §1.4, bgmol]. Residual stiffness cond(G^{1/2}ΣG^{1/2}) in ±45° windows: flat 192/112/97 → spring 9.6/
  7.6/13.4 (β/C7eq, αR, αL; constants fitted in-sample) [M n20 §5.3]. For an unstrained harmonic pair network
  K = JᵀWJ exactly at rest [D a1 §6.6].
- Beat: the spring metric is the flat metric of a bigger space seen through the molecule's pair distances. This is
  Part 1's "G ≈ K", delivered.
- Controls: lens "show eigenvector k of G".
- → One spring is isolated.

**3.2 One bond is a cone · 90 s**
- Screen: two beads. The plane of bond vectors b ∈ ℝ² is lifted by F(b) = (√w|b|, √(γ/2)b) onto an ice-cream cone in
  ℝ³ (painter's 3D, authored orbit). A wiggle circle of feature noise on the cone pulls back to a thin ellipse at the
  bond tip (attention/07 idiom). Then the 3-D picture: the sphere of bond directions at fixed length, whose radius
  R = r₀/σ⊥ is measured in thermal widths.
- Computed: G = (γ/2 + w)dr² + (γ/2)r²dΩ²; σ_r = √(2/(γ + 2w)); σ⊥ = √(2/γ); c = √(γ/(γ + 2w));
  K_tan = 4w/(γ(γ + 2w)r²).
- Numbers (w = 1,400 Å⁻², γ = 30 Å⁻², r = 1.5 Å; ALDP-like constants [I]): σ_r = 0.0266 Å, σ⊥ = 0.258 Å,
  c = 0.103, cone half-opening 5.9°, R = 5.81 thermal widths, K_tan = 0.0293 per squared thermal width
  [D n22 Prop 4, checked d2]. Flatness would need (d√B/dr)² = A: an angular width shrinking 9% per 1% of
  stretch when κ_b ≈ 100 [D n22 Prop 6]. The true one-bond Hessian has K_tan = −0.684, 23× larger and of opposite sign,
  and turns indefinite beyond 0.016 Å of compression; this is why the spring metric uses the Gauss–Newton part
  [D n22 Prop 5].
- Beat: stiff along, soft across: that combination is curvature.
- Controls: levers w and γ: the cone narrows, the ellipse thins, and K_tan updates.
- → The sphere of directions detaches and is pressed toward a plane.

**3.3 You cannot flatten an orange peel · 95 s · CLIMAX**
- Screen: the bond-direction cap (radius R = 5.81) as a glossy orange-peel surface (painter's 3D, about 2,000 quads).
  It is pressed flat while circles of constant tilt θ are drawn on it; on the flattened sheet the circles must stretch,
  coloured by circumferential stretch. Readouts: the circumference deficit and the four-point bound. Then the theorem
  card.
- Computed: the circle deficit 1 − sin θ/θ (thermal circumference 2πR sin θ against the flat 2πRθ);
  ρ = √(2ρ₀²(1 − cos cθ)) with ρ₀ = √(γ/2 + w)·r₀; the bound Kρ²/12 [D n22 Thm 4]; note 22's exact four-point values
  plotted as points.
- Numbers: at θ = 0.5 the deficit is 4.1% [D, checked d2]; ρ = 2.90, Kρ² = 0.25, bound 0.021, note 22's exact
  four-point ε 0.022 [D n22 §5.2]. Any equivariant flat map of one bond errs by at least 0.14/0.26/0.44/0.56 on
  shells ±0.5/1/2/3 σ_r, against 0.018/0.035/0.071/0.11 for the curved target S²×ℝ [D n22 §5.3]. ALDP5
  within a basin (K ≈ 0.02): lower bound 0.2–1.5% at ρ = 1–3 widths; over the populated torsion landscape,
  heuristically 3–20% [D/H n22 §5.4, n23]. The bound concerns distances and holds for maps into any dimension; a
  higher-dimensional embedding can still reproduce the metric itself exactly [D n22 §5.1].
- Beat: an equal-dimension flat chart must distort a curved metric by at least Kρ²/12, so don't flatten: embed.
  (Atlas made a related point about topology.)
- Controls: lever θ (cap size), handed over at 75 s: the deficit and the bound grow as θ².
- → The peel springs back onto its cone, and noise is added in the cone's space.

**3.4 Lift, noise, project · 90 s**
- Screen: the planar cone again. Seeded feature-space noise y = αF(b₀) + σε scatters off the surface as a cloud; each
  point drops to its nearest image point along a thin leader line; in the plane the shadows form the thermal ellipse.
  A bar splits the noise variance into tangent and normal parts; α/σ is read out at the playhead.
- Computed: y_t is exactly Gaussian; the nearest image point is x₀ + (DFᵀDF)⁻¹DFᵀσε + O(σ²), so its covariance is
  σ²G⁻¹ [D n23 §4.3]; the normal stiffness is α/σ.
- Numbers: α/σ = 22.4 at t = 0.01 and 999.5 at 10⁻⁵ (1/σ² rises from 502 to 332,342 at 3×10⁻⁵) [D n28 §4]. On BBA
  the invariant whitening map had 3,303 features for 78 shape directions: 3,225 normal directions and a tangent share
  of the untrained low-noise loss of 0.06 [M #1025].
- Beat: in feature space noising is one line of code, and the molecule feels only its shadow; redundancy turns finite
  stiffness into a normal stiffness that diverges at low noise.
- Controls: lever t (playhead).
- → The shadow's restoring arrows become a force.

**3.5 Forces that pass the check · 95 s**
- Screen: per-direction Stein needles for ALDP5 (target 1) for three arms. Then a one-bond Brownian-dynamics
  simulation (2,000 seeded walkers) with a step-size lever, its histogram against the exact width. Finally the
  iid-against-simulation diagonal (logged).
- Computed: Euler–Maruyama for a two-bead bond, δ ← (1 − 2hk)δ + √(4h)ζ, with stationary inflation 1/√(1 − hk) and
  stability for h < 1/k [D g1 §3.9]; the force read-out with its volume term, ∇log p₀ = DFᵀ∇^S log q + ½∇log det G
  [D n29].
- Numbers: Stein ratios at 200k updates (directions 1–3 | 4–7): spring 0.97–1.03 | 0.91–0.99, learned 0.96–1.00 |
  0.93–1.01, flat production 0.20–0.29 | 0.42–0.69 [M #768]. Inflation 6–9% at h = 10⁻⁴ Å² (measured 8–11%);
  stability limit 6.0–9.1×10⁻⁴ Å² (walkers blew up at 4×10⁻⁴) [D/M]. The diagonal, iid against simulated bond width
  over MD: aligned Cartesian 1.006–1.090 vs 2.328–2.778; spring 0.966–1.022 vs 0.993–1.066 [M #886]. Omitting the
  volume term shortens ALDP5 bonds by 0.30–0.36 widths [D/M n20 §8].
- Beat: in thermal units one read-out level gives forces that are right for bonds and torsions at once: one model,
  two uses.
- Controls: lever h (handover): beyond h = 1/k the walkers explode.
- → Learning curves fade in behind the diagonal.

**3.6 What the maps bought · 80 s**
- Screen: a learning-curve race on a log-updates axis for bond W1/width, angle W1/width and φ/ψ JS (logged, five
  arms). Inset: the rare αL basin with a barcode of its 37 visits.
- Numbers: bond W1/width at 1k / 5k / 20k / 200k updates: spring 0.018/0.013/0.012/0.013; learned 0.020/
  0.016/0.016/0.015; flat low floor 0.186/0.068/0.046/0.015; flat production 0.981/0.173/0.291/0.422;
  floors 0.010–0.017 [M #765, three seeds]. So bonds arrive ≈ 100× sooner and angles 10–20× sooner, with no gain on
  torsions. A warp fitted only to 1 ps steps cuts the local step anisotropy from 184 to 2.99 (floor 1.55)
  [M learned-warp, mdshare; a different κ from 3.1's, never on one arrow]. The rare αL basin has 37 visits but only
  96–139 effectively independent samples per 250 ns, so one trajectory pins its weight to about ±50% (95% interval
  0.4–7.0% around 3.2%) [M #779, g4 §4.3]. No metric changes a visit count.
- Beat: stiffness removal won the stiff modes and nothing else; the soft problems were counting and learning
  problems.
- Controls: none.
- → Five beads become twenty-eight.

**3.7 Right balance, wrong scale · 60 s**
- Screen: BBA's 28 Cα beads appear. The spring map's channels shrink by one global RMS divisor; Part 2's meter, with
  λ = 0.037², slides under the floor curtain. The 2×2 of the first chunk: local good and global bad, against global
  good and local bad.
- Numbers: the global RMS divisor is 27.1 on BBA (1.31 on ALDP5), which leaves spring channels at sd 0.037 below
  σ(t_min) = 0.045, half erased at t ≈ 0.0077, below the floor [D/M #1025, r3 E22]. First chunk (190,350 updates):
  internal coordinates, bond 0.000274 Å but Rg W1 0.521 Å; Cartesian, bond 0.415 Å but Rg 0.072 Å; springs and
  whitening failed outright [M Sprint 12].
- Beat: the condition number is scale-free, but resolution is not; and on 28 beads every chart got only one half
  right.
- End card → Part 4.

### Part 4 · Range and order (`range-order`, ≈ 11 min)

**Title, 15 s.** The ledger lights 2026-11-11 → 11-18 (#1025, notes 27 and 30).

**4.1 Decided backward · 75 s**
- Screen: a real BBA frame (asset A2) noised along the clock with one noise draw reused at all levels, as note 27's
  probe does. Then the clock runs right to left as generation, and feature glyphs freeze (hollow to filled) when R
  crosses ½.
- Computed: R_h(t) = Var(E[h | Y_t])/Var(h); the bound I ≥ −½ ln(1 − R) for Gaussian observables.
- Numbers: only t½(1) = 0.259. The claim on screen: the exact reverse process has the forward joint law of (X, Y_t),
  so R_h(t) is the fraction of the final value already decided at t [D n27 §1]. Range and order are defined.
- Beat: when noise erases a feature going forward is when generation decides it going backward.
- Controls: lens "direction" (forward / generation).
- → The glyphs line up as a raster: Part 2's raster returns with 27 rows.

**4.2 One spectrum, two pulls · 95 s**
- Screen: BBA's 27 collective-mode variances as log bars, their r_k(t) curves fanning out on the clock; the γ dial
  compresses the fan into one curve, and an inset plots the trained size error at four γ (logged). Beside it, the lag
  dial on ALDP5's four-mode basin.
- Computed: effective variances λ_k^{1−γ} renormalized to unit mean; t½ per mode; under the lag dial the half
  erasure 1/(1 − e^{−2τ/t_k}) with t_k = 1/(D₀λ_k).
- Numbers: BBA Cartesian modes (units Å/6.252): 15.6, 6.2, 3.0, 1.3, …, 0.011, a variance ratio ≈ 1.4×10³ [M
  `collective_modes.json`, 1,300,156 frames; note 27 quotes 1,423]. t½ runs from 0.53 to 0.028 while bond lengths are
  erased at 0.0004 [D/M]. γ = 0/0.25/0.5/0.75/1: ratio 1,423/232/38/6.1/1, first t½ 0.53/0.50/
  0.45/0.37/0.26, last 0.028/0.065/0.13/0.20/0.26 [D n27 §3, checked d2]. Trained Rg W1 0.51/0.19/
  0.12/0.08 Å at γ = 1/0.5/0.25/0, with bonds at the floor throughout [M #1057, 50k updates, one seed per γ
  except γ = 1]. Lag dial: λ = 1,600/400/25/4 Å⁻² and D₀ = 0.08 Å²/ps give, at τ = 1 ps, half erasure at
  σ²/α² = 1, 1, 1.02, 2.12, against a spread of 400 under flat noise [D n25 Prop 2]. Literature: Ahamed, EDM
  and EqualSNR flatten; coarse-to-fine work keeps it steep [S g3].
- Beat: removing stiffness wants a flat spectrum, ordering wants a steep one; whitening serves the first by destroying
  the second. This is the pivotal correction of 2026-11-12.
- Controls: lever γ (handover at 75 s): the fan collapses and the dose–response dot climbs.
- → The internal-coordinate chart enters: "range without order, and worse: anti-order".

**4.3 The fold dissolves before its joints · 100 s**
- Screen: a 28-bead chain (3.8 Å, 110°, 25 independent uniform torsions). A 27×27 heat map of the readability of
  b_k·b_l fades off the diagonal first as the playhead moves; a ghost bundle of 24 completions shows the torsions
  still largely agreed when the overall shape has dissolved; one torsion tilted by its blur swings the far beads.
- Computed: single-torsion readability r(t) = E[(I₁(k)/I₀(k))²] with k = ακ|y|/σ² and |y| Rice-distributed with
  parameters (ακ, σ), κ = √2, by 400-point quadrature. Transfer matrix T(r) = a⊗a + (r/2)(b⊗b + c⊗c) (9×9), with a, b,
  c the frame-transfer parts of `chain_model.py`; R(b_k·b_{k+m}) = [(u⊗u)T(r)^{m−1}(e₀⊗e₀) − μ²]/[the same at r = 1],
  u = first row of a, μ = u a^{m−1} e₀. End-to-end² and Rg² come from a two-copy transfer automaton with Rg weights
  (k+1)(N−1−l)/N² [D, new in d2: it reproduces note 30's Monte Carlo]. Ghosts: a von Mises posterior per torsion, sampled
  by inverse CDF with fixed uniforms, then a NeRF rebuild.
- Numbers: at t = 0.1/0.2/0.26: one torsion 0.940/0.716/0.530; b·b(+4) 0.868/0.470/0.245; b·b(+12)
  0.625/0.083/0.010; b·b(+26) 0.352/0.004/0.000; end-to-end² 0.711/0.253/0.125; Rg² 0.835/0.439/
  0.255 [D, exact; note 30's 20,000-query table, 0.72/0.25/0.12 and 0.84/0.44/0.25, agrees within its sampling
  error]. Effective degree ≈ ⅔(m − 1) [D n30]. Lever arm: a torsion blurred by s/κ = 6.6° at t = 0.05 moves beads
  5–10 Å away by 0.58–1.16 Å [D r7 E8]. Measured on BBA (lower bounds): internal coordinates (C3) erase bonds at 0.26,
  torsions at 0.35, Rg at 0.27–0.28, long-range distances at 0.24 and end-to-end at 0.18, against Cartesian 0.0004/
  0.08/0.47/0.44/0.45 [M n27 §5]. C3 stays swollen at every budget: Rg W1 0.455 Å at 190,350 and at 1,903,500
  updates [M #1088; #1104 open, one seed].
- Beat: long-range geometry is a product of many torsion phases, so internal coordinates erase the fold before the
  turns that build it.
- Controls: lever t (playhead); lens "separation m" highlights one diagonal band and its curve r^{⅔(m−1)}.
- → Two arrows appear through the chain: its two slowest collective modes.

**4.4 Two loud vectors · 90 s**
- Screen: the loudness ruler (vertical log axis; t½ as a second scale; log-SNR = −ln ℓ) with markers sliding in; the
  two mode arrows on a real BBA frame with Rouse cosines overlaid; size-response bars; a logged block-size sweep with
  channel and constraint counts.
- Computed: t½(ℓ); λ_p²/Σλ_q² and λ_p/Σλ_q from the 27-mode spectrum; Rouse cosines √(2/N) cos(πq(i + ½)/N); derived
  input channels K(K+1)/2 + C(K,3); constraint directions 3K − 3.
- Numbers: first-order loudness → t½: closest non-neighbour 0.003 → 0.013, end-to-end 0.2 → 0.13–0.14, pairs ≥ 11
  apart 0.3 → 0.16, a unit channel 1 → 0.26, torsion 2.0 → 0.33, mode 2 (6.0) → 0.44, mode 1 (15.0) → 0.52 [D/M n30,
  lab range-order-mechanisms]. Variances of the mode lengths are 6.9, 2.5, 0.9 and 0.6: only two lie above the torsion
  line at 2.0 [M n30 §5]. Size response: 83% in mode 1 and 96% in modes 1–2 [D n30 §5; checked d2, 0.830 and 0.962].
  Rouse overlaps 0.99 and 0.99 [M #1129]. Block size 0/1/2/4/8/16/27 vectors: Rg W1 0.477/0.161/
  0.105/0.136/0.152/0.325/0.399 Å [M #1057/#1069, 50k updates]; channels 0/1/3/14/92/696/3,303;
  constraints 0/1/3/9/21/45/78 [D]. Caveat on screen: the decision windows of two linear features separate
  only when their loudnesses differ by more than 16×; here the ratios are 3.5 and 1.25, so the order is partial
  [D g3 C2].
- Beat: only two collective modes are louder than a torsion, and they carry 96% of the size response.
- Controls: lens "measure" (mean square / length variance / size response).
- → The two arrows become a second description of the same molecule.

**4.5 Size first · 100 s · CLIMAX** ("two halos")
- Screen, part a (40 s): the constraint seesaw. In an (A, B) plane the joint image is y_B = g(y_A) with slope L; a
  noisy point and its normal correction are decomposed onto the A and B axes, with bars L²/(1+L²) and 1/(1+L²).
  Part b (60 s): two ghost bundles side by side at the same playhead, chart A (internal only) and chart B (internal
  plus the natural loud block), both in the chain model under the collapsed law P. At t = 0.26 A's completions have
  their torsions half decided but scatter in size: a fuzzy halo of chains of all sizes. B's completions disagree on
  torsions yet all sit inside one Rg ring. Then the measured reverse path: the chain's |a₁| locks onto the block's at
  t = 0.13.
- Computed: exact shares. Ghost bundles: 512 proposals from the factorized von Mises posterior given y_A (fixed
  uniforms), importance weights e^{−ηRg²} × [block likelihood L_B(|y_B| given |a₁|), orientation-averaged] for chart B,
  24 ghosts drawn with alpha ∝ weight, effective sample size read out; parameters η = 0.008095, κ = 1.4148 and
  c = 0.16494 from the lab's signal JSON [D, exact model, Monte Carlo].
- Numbers: L² ≈ 1 (whitened) / 16 (natural) / 63 (twice natural) → internal share 0.50/0.94/0.98 [D n30 Prop 2];
  chain-model internal gains 0.43–0.55/0.85–1.03/0.90–1.09 [D numeric, n30]; on BBA the constraint directions lie
  74/87/96% in the internal block (whitened 27/44/68%) [M lab]. Readability of Rg² at t = 0.26: 0.18 in chart
  A against 0.84 in chart B; at 0.35: 0.07 against 0.67 [D, chain-model signal JSON]. In the trained BBA model, R² of
  the chain's |a₁| on the block's is 0.43 at t = 0.26, 0.63/0.60 at 0.13 and 0.97 at 0.01; the predicted takeover was
  0.26–0.1 [M #1133]. Hypothesis badge: a whitened block keeps about half the gain (#1137, declared, not run) [H].
- Beat: the louder block leaves the correction to the quieter one, so a size decided early in the block is imposed on
  the chain. Order acts through who gets corrected.
- Controls: lever L² (part a, with handover); lever t (part b).
- → "But nothing was added; the information only moved."

**4.6 Information moves · 80 s**
- Screen: two density profiles on a linear t axis (0–0.8): chart A's collapse signal bumps at 0.1–0.26; chart B's
  splits into internal and block channels, the block bump at 0.35–0.6. Shaded areas, live area readouts, the KL as a
  target line.
- Computed: the density ½β(t)/σ_t² · S(t) from asset A3, trapezoid areas; equivalently ½S per unit log-SNR (the I-MMSE
  form).
- Numbers: the KL of the collapse (mean Rg lowered by 0.9 Å) is 0.0766 nats; the areas are 0.0778 (A) and 0.0784 (B)
  [D, Monte Carlo of the exact model; d2 recomputation]. Block channels carry 0.88 of B's area (unit block 0.48, twice
  natural 0.91) [D]. Per example, learning the collapse is worth 0.0005 at t = 0.01 and at most 0.049 near 0.2;
  learning the constraint is worth 0.92/0.80/0.38 at 0.01/0.1/0.2 [D]. Note 30: no chart buys statistical
  efficiency; the gains are in optimization at a fixed budget [D]. The share-of-reducible-loss criterion is a
  hypothesis [H n27 §6].
- Beat: a chart cannot add information; it moves where in noise the training signal lives and how large a share of the
  loss it is.
- Controls: lens "chart" (A / B natural / B unit / B twice).
- → The profiles fold into a map of models.

**4.7 Both halves at once · 85 s**
- Screen: a log–log map of bond W1 against Rg W1, one dot per seed (190,350 updates, 100,000 molecules), an arrow
  from C3 to ordered internal coordinates; a budget clock (2.6%, 10%, 20%, 100% of the 1,903,500-update cosine); the
  paper's PMF on its sample-count floor line.
- Numbers: ordered internal coordinates bond 0.00038/0.00033 Å, Rg 0.117/0.091 Å; C3 0.00032/0.00034, 0.455/0.418;
  Cartesian + distances 0.0078/0.0093, 0.071/0.077; covariance-matched base 0.0053/0.0065, 0.073/0.077; native
  ScoreMD 0.042/0.042, 0.157/0.532; wδ 0.027/0.034, 0.062/0.072 [M real-budget study]. Full schedule: ordered 0.111
  vs C3 0.455 Å [M #1104 open, one seed]. PMF: 0.097 (ordered) vs 0.096 (covariance base) vs ScoreMD 0.202/0.315,
  floor 0.080 at 100,000 molecules (count × floor ≈ 8,000) [M #1138 open]. The lesson of the skeleton-and-arrows map:
  its torsion error was 7.9° despite a torsion window of 0.20, so a feature is learned when it is a coordinate of its
  own [M #1068].
- Beat: ordered internal coordinates are the first chart that gets local and global structure right together, and ten
  times more training does not change where it ends.
- Controls: lens "budget stop".
- End card: four open boxes (wall, handedness, kinematics, soft forces) → Part 5.

### Part 5 · Reading a force (`force-readout`, ≈ 8 min)

**Title, 15 s.** The ledger lights 2026-11-14 → 11-19.

**5.1 The squeeze · 90 s**
- Screen: Part 2's blur dial returns on the 28-bead chain: one torsion's blur cone and the swing of its far beads; a
  contact-distance histogram convolved with the blur, against the 3.5 Å line; a readout of the soft-force signal
  ∝ σ².
- Computed: torsion blur s/κ with κ = 1.504; the NeRF lever arm (rotation of the downstream beads about the bond
  axis); a Gaussian convolution of the contact distribution.
- Numbers: torsion blur 1.70° at t = 0.01 and 6.63° at 0.05 [D, checked d2]; far beads move 0.58–1.16 Å at 0.05
  [D]; contacts would need about 1° (t ≈ 0.005) [D]. Linearized contact blur at 0.01: 0.37/0.22/0.15 Å with
  K = 0/2/8 loud vectors [M lab low-noise continuation], against the margin between the data's 1% closest-contact
  point (3.9 Å) and the 3.5 Å test [M]. Soft-force information at one level ∝ σ², error ∝ 1/σ [D n30 §7].
- Beat: read late and the torsions' lever arm blurs the wall; read early and the soft forces lose their signal. No
  single level gives both.
- Controls: lever t\* (handover).
- → The clock's lanes appear: whose blind spot is where.

**5.2 Every chart has a blind spot · 75 s**
- Screen: the noise clock with three lanes (Cartesian, internal, wδ) and one glyph per feature; each lane's blind spot
  (the feature erased at or below the floor) is circled.
- Numbers: Cartesian bonds 0.0004 [M]. Internal closest contact 0.013 (loudness 0.003), just above t_min = 0.01: "it
  is to internal coordinates what bond lengths are to Cartesian ones" [D/M n30 §7]. Training lower (t_min = 0.003)
  does not create the wall (wall z unchanged) [M #1101]. wδ, first order on BBA: its closest contact is readable to
  0.120 (ℓ = 0.168) while its bonds are erased at 0.014 (ℓ = 0.0032) [D g2 §4.8, unofficial], which matches its
  registered-budget profile (best size, 0% clashes, bonds 86× worse) [M]. Hypothesis badge: "the barrier that killed
  (planarity) may be the barrier that saves (collisions)" [H].
- Beat: every chart has one property it cannot read at the floor. Internal coordinates cannot see contacts, so the
  wall must be supplied.
- Controls: lens "lane".
- → A wall can be added to a force, and so can a force nobody asked for.

**5.3 A phantom spring · 95 s · CLIMAX**
- Screen: the radial volume toy: 2,000 seeded walkers of a 2-D standard Gaussian in polar coordinates under the
  radial force 1/r − r. A lens removes the 1/r (the volume term) and the cloud contracts into a dense core; a histogram
  of r against the exact Rayleigh and half-normal laws. Then the BBA analogue: data reweighted by the ratio of the
  wrong and right volume factors slides the mean Rg from 10.66 to 9.58 Å.
- Computed: Euler–Maruyama for r with reflection at 0; exact densities r e^{−r²/2} and e^{−r²/2}; a 3-D variant
  (r² e^{−r²/2}).
- Numbers: mean radius 1.253 (Rayleigh) → 0.798 (half-normal), −36%; in 3D 1.596 → 0.798, −50% [D g1 §3.6, checked
  d2]. The loud-mode map keeps orientation (an immersion), but the read-out used the rotation-invariant formula. The
  extra term, ≈ −½ log det(inertia), is an inward force of ≈ 0.6 kT/Å on Rg; reweighting predicts a stationary mean
  Rg of 9.58 vs 10.66 Å, and the simulations ended at 9.6–9.7 Å [M #1100]. A brute-force pushforward on a 5-bead chain
  gives log-volumes 17.808/16.924 against 17.815/16.934 from ½ log det(J_cᵀJ_c), while the invariant formula predicts
  +1.87 instead of −0.88 between the shapes [D numeric, PR #1103]. With the immersion term the 100 ps size error fell
  from 0.98 to 0.24 Å [M #1100].
- Beat: a missing or wrong volume term is indistinguishable from an attraction; three quarters of the loud-mode
  compaction was one formula.
- Controls: lens "volume term" (correct / missing / wrong-formula analogue); lever "dimension" (2/3).
- → The corrected force field still needs a wall, and the block can help the rebuild.

**5.4 Use the six discarded numbers · 75 s**
- Screen: a small planar chain described twice, by its bend angles (the quiet block) and by one loud end-to-end vector.
  The viewer drags the vector; a least-squares rebuild, with or without a hard core, moves the chain; a constraint
  residual is read out. Then the BBA result bars.
- Computed: Levenberg–Marquardt on 8 beads (16 unknowns) minimizing ‖w ⊙ (φ(x) − y)‖² + λ Σ relu(r_c − d_ij)²,
  warm-started each frame [D toy].
- Numbers: the joint rebuild is the small-noise posterior mode, a projection onto the image in the chart's metric
  [D n30 §7]. On BBA: internal-only decode 14.5/15.3% overlaps, Rg W1 0.117/0.091 Å; joint 19.3/20.1%, 0.077/0.064;
  joint + 3.6 Å core 0.0/0.0%, 0.083/0.070 Å, local accuracy unchanged [M #1107]; full schedule 0% and 0.105 Å
  [M #1104].
- Beat: the generated block knows the size; a rebuild that listens to all 109 numbers uses it, and a hard core
  supplies the wall the chart cannot read.
- Controls: drag lens (the vector); lens "core" on/off.
- → From rebuild to simulation.

**5.5 Two errors and a drift · 80 s**
- Screen: three Rg decile strips (uncorrected / wall only / wall + size term) with a linear-response arrow; then the
  size error against simulated time (0–300 ps) for the loud-mode force fields, with panel-floor bands.
- Numbers: a wall fitted against simulations removed the overlaps but released a swelling; one size term (−0.16 kT
  per Å of Rg) cancels it: in linear response 0.16 × 4.8 Å² ≈ 0.8 Å [D estimate, lab]. Overlaps 21.3% → 0.0%, size
  error 0.267 → 0.263 Å [M #1109]. Every loud-mode force field still compacts between 100 and 300 ps (mean Rg −0.21 to
  −0.41 Å) [M #1130]. Full schedule: 0.118 Å at 100 ps [M #1104 open]. Panel floor (256 + 256 paths): 0.167 Å [M].
- Beat: the best force field of the line is still not stationary; the fixes lower the curve but have not yet
  flattened it.
- Controls: lens "model".
- → The ledger.

**5.6 The ledger · 60 s**
- Screen: every rig redrawn small by its own functions (u1-force/11 device), each with its one law and its date on
  the evolution strip. Open tests (#1137 whitened block, #1136/#1113 drift, a third vector for
  handedness) appear as dashed [H] nodes. The four things two loud vectors cannot supply: the wall; handedness
  (χ = a₁·(a₂×a₃)/(|a₁||a₂||a₃|) needs three vectors [D]); kinematics; soft forces.
- Beat: each remaining defect sits exactly where the theory says this chart cannot help. That is the reason for
  optimism, and it is also the list of next tests.

### Explorable · The bench (`explorables/bench.html`)

A standalone, theme-aware page (like `torus-flow.html`), one panel per rig with free controls: Clock (t ↔ σ in four
unit systems ↔ log-SNR; t½ from a variance or a loudness); Nine modes (flat / thermal, floor, read-out level,
Tweedie, Stein ratio); Thin cloud (e, δ); Cone and peel (w, γ, θ); Banana (A, squeeze); Spectrum (γ on 27 modes; lag
τ on the four-mode basin); Chain (t, κ, separation m; exact transfer matrices; lever arm); Seesaw (L²); KL ledger
(chart toggle); Radial volume (walkers, term on/off). Two new devices: **calibration lamps** (on load every rig
re-runs its unit-test values from §5 and lights green or red, so the page is its own test) and a **provenance drawer**
(every number with its tag, source file or PR, data set and budget). Unseeded live play is allowed here; nothing in
the page is exported as video.

---

## 4. Recurring visual devices and conventions

**Palette** (house palette extended; declared once in `src/videos/common/bench-palette.js`, one meaning per colour
across all five pieces): stiff orange `#ef8a5b` = bonds and stiff modes (angles in the tint `#f3b58d`); soft blue
`#6cc4e8` = torsions and soft modes; gold `#f2cf63` = attention only (playhead, the dial being turned, the current
noise level); lavender `#c39bf5` = information (meters, readability fills, KL densities, ghost tint), as in Retention
and the side videos; rose `#e47bb0` = global shape (Rg ring, end-to-end, long-range distances) and the loud block
that carries it; teal `#4fc3a1` = contacts and excluded volume; neutrals as in `theme.js`. (Retention used rose for
KL; here KL is lavender.)

**Glyphs** (on clocks, rasters and lanes): bond = short thick bar; angle = wedge; torsion = circular arrow; contact =
two kissing circles; size = ring; loud mode = double-headed arrow; constraint = seesaw.

**The noise clock.** A horizontal log-t axis (10⁻⁵ … 1) with log-SNR ticks above (13.8 … −10.1). The trained band is
shaded ([0.01, 1] for internal-family lanes, [10⁻⁵, 1] for Cartesian lanes). Below t_min hangs the **floor curtain**:
dark ground with a 45° hatch in the line colour and the label "never trained". The gold playhead carries a live σ
in the lane's own unit ("σ = 0.042 Å per coordinate, ALDP5 pilot scale").

**The Gaussian meter.** A vertical gauge per feature filled to R in lavender, with a tick at ½ and a bracket for the
decision window (0.8 → 0.2). **"Decided"**: a glyph is hollow while R < ½ and fills as R grows (a pie fill); when
generation runs backward and R crosses ½, a 0.3 s gold ring marks the moment of decision.

**The destruction raster.** Rows are modes or features, bars span the decision windows, dots mark t½; it is built in
Part 2 (9 rows) and returns in Part 4 (27 rows), so "nine clocks become one" and "one clock is not enough" are seen
on the same device.

**Ghost bundles.** 24 posterior completions drawn at 12% alpha around the sample: agreement among ghosts means
"decided", spread means "still open". They are reparametrized from fixed base draws (Gaussian z, inverse-CDF
uniforms), so they move smoothly with t and are frame-exact for export. Importance-weighted bundles show their
effective sample size.

**Toy / molecule badge pair.** Two capsules on one baseline joined by a thin rule: left "toy = 0.264 [D]", right
"molecule 0.198 [M #768]". Every readout gets a comparison target (u1-force rule).

**The rig stamp.** A dim mono line at (1572, 890), right-aligned, naming the exact model, its assumption and its
data: "exact · 9 independent Gaussian modes · widths mdshare traj 1 (#768) · VP β 0.1→20 · unit 0.9418 Å".

**Epistemic badges.** Small mono capsules after numbers. [D]: ink outline, and derived curves are solid lines. [M]:
filled panel colour with a micro source tag, and measured points are filled circles with error bars where they exist.
[H]: dashed outline, and hypothesis arrows are dashed. [I]: grey italic "illustrative". [S]: square corner.
Open-PR numbers carry "open PR" in the tag.

**Number typography.** IBM Plex Mono; "=" for exact values computed live, "≈" for rounded ones; never more digits than
the source; a unit on every dimensional number; a real minus sign (`formatNumber`). Narration cues are template
strings filled from rig outputs or `results.json`, so a narrated number cannot drift from the screen (tests assert
it).

**The ledger strip.** A thin dated timeline (Jun 2026 → Nov 19) on every title card and in 5.6, with era bands under
one convention (the brief's) and rig icons at the dates their idea entered the project.

---

## 5. Computation and data catalogue

All rigs live in `src/model/bench/` (DOM-free, importable by Node); tests in `tests/bench.test.mjs` with thresholds
fixed before the first run. Costs assume modern laptop JavaScript at 60 fps.

### 5.1 Rigs

**C1 VP clock** (`vp.js`). α_t = e^{−B/2}, B = 0.1t + 9.95t², σ_t = √(1 − α²), s = σ/α, ℓ = ln(α²/σ²),
t½(λ) = (−0.1 + √(0.01 + 39.8 ln(1+λ)))/19.9, and its inverse λ = e^{B} − 1. Units: ×1 Å (manifold route),
×0.9418 Å (ALDP5 pilots), ×0.267 Å (pilot own scale), ×6.252 Å (BBA Cartesian). Cost O(1). Tests: α(0.01) = 0.999003,
σ(0.01) = 0.044643, s(0.05) = 0.174143, α(1) = 0.006572; σ(0.01)·0.9418 = 0.0420 Å, σ(0.01)·6.252 = 0.279 Å,
σ(10⁻⁵)·0.267 = 0.00027 Å; ℓ(0.259) = 0.00 ± 0.01; t½(1) = 0.2590, t½(15.5) = 0.526, t½(0.011) = 0.0285,
t½(0.003) = 0.0130, t½(0.168) = 0.120, t½(0.0032) = 0.0136 [g4 §3.3, g2 E3, checked d2].

**C2 Gaussian meter** (`meter.js`). r = α²λ/(α²λ + σ²), width r², product r_i r_j, information −½ ln(1 − r), decision
window SNR ∈ [0.25/λ, 4/λ]. Tests: t½(0.01/0.1/10/100) = 0.0270/0.0930/0.486/0.676 [r4 E1]; the window
ratio = 16.

**C3 Nine-mode ALDP5 basin** (`aldp5.js`). w from A1; λ_k = (w_k/0.9418)²; ghosts x_k | y ~ N(r_k y/α, λ_k(1 − r_k));
blurred force F_t = r(t)F₀; Stein ratio = r(t); stationary width √(λ + τ²); Tweedie ratio w/√(w² + s²); BD by seeded
Euler–Maruyama (500 walkers × 9 modes per tick, snapshots every 0.5 s, < 0.2 ms per tick). Tests: t½ = 0.00483,
0.00607, 0.00994, 0.0139, 0.0175, 0.0366, 0.0569, 0.108, 0.196; r(0.01) = 0.264, 0.328, 0.498, 0.625, 0.707, 0.896,
0.951, 0.985, 0.996; inflation 1.95, 1.75, 1.42, 1.27, 1.19, 1.06, 1.03, 1.01, 1.00 [g1 §3.1, checked d2]; readable
training share 0, 0, 0, 0.40, 0.76, 2.69, 4.74, 9.86, 18.81%; Tweedie 0.388/0.463 (w = 0.025/0.031 Å,
s = 0.0594 Å); low-floor ratio at 0.003 = 0.958 for mode 1; thermal r(0.03) = 0.9881, r(0.05) = 0.9706.

**C4 Bowl and loss** (`loss.js`). GD on a quadratic with curvatures c_j·m_i, steps counted to a 10⁻⁴ relative excess;
loss-blindness integral over t ~ U[10⁻⁵, 1] with seven geometric widths 0.07–0.24 (precomputed, 2,000 nodes). Tests:
excess 0.0098/0.0015/0.00055/0.000023 at width ratios 1.23/1.085/1.05/1.01, within 10% of the source's
0.0093/0.0014/0.0005/0.00002; share of t with σ within ×3 of 0.07 = 5.9% (source "about 6%").

**C5 Thin cloud (wδ)** (`wdelta.js`). F = ((log r_ij), √δ log det G); H = A + δB analytically
(A_ij = −(x_i−x_j)(x_i−x_j)ᵀ/r_ij⁴, B_ij = 4y_iy_jᵀ, y_i = G⁻¹x_{c,i}); horizontal projector from the six rigid
generators; Jacobi eigensolve (about 50k flops per frame). Tests: odometer 3.2489/7.8377/12.4378/17.0407;
condition 42.14/500.7/6,437/97,680/3.760×10⁶/6.004×10⁷ [r1 E1, checked d2]; rigid residual of H < 10⁻¹⁰;
relative deformation 0.004165/0.000675/0.000392/0.000099 for r = 1.5/3.8/5/10 Å; equality under Å → nm to
10⁻¹².

**C6 Projected feature chord** (`chord.js`). Gauss–Newton (11×15 Jacobian, gauge fixed, 20 iterations) at 41 values
of t, precomputed at load (≈ 20 ms). Tests: dimer midpoint 6.3246 Å; the chord identity holds to 10⁻¹².

**C7 Scale clock** (`scaleclock.js`). A(t) = 1 − ½β(t)τ(t), τ = c²(1 − e^{−B}), c² = 1/9; a(t) = e^{−B/2}. Tests:
A(0.10/0.37/0.55/0.73/0.91/1.0) = 0.9880/0.6877/0.4150/0.1912/−0.0114/−0.1111; a(1) = 0.006572
[r1 E3, checked d2].

**C8 Banana** (`banana.js`). φ(x) = (x₁ − x₂²/9, x₂) (river: x₁ − sin 2x₂); ψ(y) = ½yᵀA⁻¹y; KL to the best Gaussian
= ½ ln(det C_X / det A) with C_X in closed form; the noised latent score −(α²A + σ²I)⁻¹y; segment maximum by a
200-point scan. Tests: KL 0.4739/1.7483/1.3013 (banana / squeezed / river); ψ at the segment midpoint 2.000/40.5; at the endpoints 1.125 [g2 E2; closed form checked d2].

**C9 Cone and peel** (`cone.js`). σ_r, σ⊥, c, K_tan, R = r₀/σ⊥; ρ = √(2ρ₀²(1 − cos cθ)); deficit 1 − sin θ/θ; bound
Kρ²/12; cap mesh about 2,000 quads with a typed-array painter (atlas `torusViews.js` style, about 1 ms). Tests:
K_tan = 0.029316, σ_r = 0.026584 Å, σ⊥ = 0.258199 Å, c = 0.102960, half-opening 5.91°, R = 5.8095; at θ = 0.5:
ρ = 2.904, Kρ² = 0.2473, Kρ²/12 = 0.0206, deficit 0.0411 [n22, r3 E1/E5, checked d2].

**C10 Bond Brownian dynamics** (`bondsim.js`). δ ← (1 − 2hk)δ + √(4h)ζ with 2,000 seeded walkers. Tests: stationary
inflation 1/√(1 − hk) = 1.060/1.095 for k = 1,100/1,660 Å⁻², h = 10⁻⁴ Å²; divergence for h > 1/k (9.1×10⁻⁴/
6.0×10⁻⁴); simulated spread within 2% of the formula after 20/hk steps.

**C11 Spectrum and dials** (`spectrum.js`). Spectrum from A2; library units c₀²λ with c₀ = √((n−1)/tr C); γ dial
λ^{1−γ}/mean; lag dial λ/(1 − e^{−τ/t_k}), half erasure 1/(1 − e^{−2τ/t_k}). Tests: library units 15.031, 5.995,
2.903, 1.281, 0.486, …, 0.011 summing to 27; c₀ = 0.15706 Å⁻¹; RMS Rg 10.829 Å; size response 0.8296 (mode 1), 0.9615
(modes 1–2); mean-square shares 0.557/0.779/0.934 (1/2/4 modes); γ table ratios 1,428/232/37.8/6.1/1
(note 27 prints 1,423/232/38/6.1/1); lag dial (1, 1, 1.0187, 2.1155) [n25; checked d2 from the local JSON].

**C12 Chain** (`chain.js`). (i) r(t): 400-point quadrature of the Rice law of |y| with the Bessel ratio I₁/I₀ (scaled
polynomial approximations), tabulated at 200 values of t on load (≈ 5 ms). (ii) Readability of b_k·b_{k+m} from
9×9 matrix powers of T(r) = a⊗a + (r/2)(b⊗b + c⊗c), with a, b, c from `chain_model.py` (angle 110°); all m for one t
cost ≈ 0.2 Mflop. (iii) End-to-end² and Rg²: a two-copy transfer automaton over 27 positions (states pre / active
3-vector / post per copy; E[S⊗S] = T(r), E[S] = a, first step a + b fixed) with weights f(k)g(l) (1 and 1, or
(k+1)(N−1−l)), ≈ 50k flops. (iv) Ghosts: von Mises posteriors (concentration ακ|y|/σ², mean arg y), inverse-CDF
sampling, NeRF with 28 beads. (v) Chart-B ghosts: 512 proposals, NeRF, Rouse-1 vector, importance weights (≈ 2 ms per
frame). (vi) Lever arm: Rodrigues rotation of the downstream beads. Tests (κ = √2): r = 0.9847/0.9401/0.8523/0.7159/0.5297/0.2932 at t = 0.05/0.1/0.15/0.2/0.26/0.35 (κ = 1.504: 0.947/0.746/0.565 at
0.1/0.2/0.26); at t = 0.1/0.2/0.26: b·b(+4) 0.8676/0.4701/0.2452, b·b(+12) 0.6246/0.0828/0.0098,
b·b(+26) 0.3520/0.0040/0.0000, end-to-end² 0.7111/0.2530/0.1251, Rg² 0.8346/0.4385/0.2551; every value
within 0.01 of the lab's Monte Carlo `exact-uniform.json`; R(b·b(+2)) = r exactly; torsion blur s/1.504 = 1.70°/6.63° at t = 0.01/0.05 [checked d2 against the lab JSON].

**C13 Seesaw** (`seesaw.js`). n ∝ (−L, 1); shares L²/(1+L²) and 1/(1+L²); seeded noisy points. Tests:
0.500/0.9412/0.9844 at L² = 1/16/63; the two shares sum to 1.

**C14 KL ledger** (`ledger.js`). From A3: density ½β/σ² · S on the 14 levels, trapezoid areas. Tests: areas
0.0778 (A) and 0.0784 (B, natural) against info_A = 0.0779 and info_B = 0.0784; KL 0.0766; block shares 0.878/0.476/0.914 (natural / unit / twice); basins prior KL 0.0883.

**C15 Radial volume toy** (`radial.js`). Euler–Maruyama for r with force (d−1)/r − r (correct) or −r (missing term),
reflecting at 0, 2,000 walkers. Tests: exact means √(π/2) = 1.2533, √(2/π) = 0.7979, 2√(2/π) = 1.5958; simulated
means within 2% after burn-in.

**C16 Two-description rebuild** (`rebuild.js`). An 8-bead planar chain; features = bend angles plus a loud
end-to-end vector; Levenberg–Marquardt with an optional hard core. Tests: residual → 0 for consistent inputs; with
λ = 100 the minimum pair distance is ≥ r_c − 0.05.

**C17 Handedness** (`chirality.js`). χ = a₁·(a₂×a₃)/(|a₁||a₂||a₃|). Tests: the sign flips under a mirror; |a₁|, |a₂|
and a₁·a₂ are unchanged.

### 5.2 Data assets (precomputed; committed under `src/videos/<id>/data/`, each with source path, SHA-256, script and date)

Scripts live in `scripts/data/*.py` (numpy only, run with `python -I`, reading `LOCAL` read-only).

| id | file | source | script outline | JSON shape | size |
|---|---|---|---|---|---|
| A1 | `aldp5-modes.json` | `rg-main/docs/investigations/force-field-simulation/evidence.json` (`equipartition_200k_ratio_by_seed_stiff_to_soft`, `step_size_seed0`); `LOCAL/data/mdshare/alanine-dipeptide-3x250ns-heavy-atom-positions.npz` (`arr_1`) | copy widths, ratios and force times per arm and seed; for drawing, take 20,000 frames of trajectory 1, `.reshape(250000,10,3)[:, [1,3,4,6,8]]*10`, iterate a Kabsch alignment to the mean, eigendecompose the 15×15 covariance, keep 9 modes and assert the widths match `mode_std_A` within 2% | `{widths[9], arms:{name:{seed:{t, ratio[9]}}}, step:{arm:{h:ratio}}, mean[5][3], vectors[9][15], beads:[C,N,CA,C,N]}` | ≈ 4 KB |
| A2 | `bba-modes.json` + `bba-frames.json` | `LOCAL/runs/range-order-mechanisms-20261118b/collective_modes.json`; `LOCAL/data/deshawresearch-bba-ca28/train.npy` | copy `mean_squares` (27, Å²) and `vectors` (27×27 in the Helmert basis); pick 32 frames at Rg quantiles (folded and unfolded) and store them to 0.01 Å | `{n:28, mean_squares[27], vectors[27][27], c0}`; `{frames[32][28][3], rg[32]}` | 16 KB + 12 KB |
| A3 | `chain-signal.json` | the same run directory: `signal-{uniform-natural,uniform-unit,uniform-x2,basins-natural}.json`, `exact-uniform.json`, `chain_spec.json` | copy the per-level fields (collapse_A, collapse_B_internal, collapse_B_block, constraint_internal/block, R_rg2_A/B, R_len_A/B, ess_B) and the summaries; keep η, κ, c | `{arms:{name:{levels:{t:{…}}, summary:{…}, eta, kappa, c}}, exact:{t:{…}}}` | ≈ 30 KB |
| A4 | `bba-windows.json` | note 27 §5 table; `lab/2026-11-16-readable-windows-noise-precedents` table; `bba_charts.json` (same run directory); g2 §4.8 (wδ column, unofficial) | hand-curated, one record per value, with the estimator named (best envelope / first order / calibration) | `[{process, feature, t_half, estimator, bound:"lower"|"screen", source, tag}]` | ≈ 8 KB |
| A5 | `results.json` | `.local/leaderboard/cache/main/{runs,metrics}.parquet` (registered budget, full schedule, longer training) where present, else evidence JSONs (`feature-space-evaluation/evidence.json`, `joint-distribution-metrics`) and lab READMEs; open PR bodies #1104, #1138 | parquet query by run tag; curated fallback with per-entry pointers; a test cross-checks every entry against the g4 canon list | `[{id, value, unit, system, data, budget, seeds, molecules, source, date, tag, open_pr?}]` | ≈ 20 KB |
| A6 | `wdelta-era.json` | archive sprint summaries 1/5/7/8, `headtohead.md`, `investigations/metric-qualification-513.md` | curated scoreboard, costs and conditioning | `[{sprint, date, arm, n, js, sd, note, source}]` | ≈ 4 KB |
| A7 | `aldp5-window.json` (optional) | `LOCAL/data/mdshare/…npz`, trajectory 1 | 2,000 frames × 5 beads, int16 at 0.001 Å, for the vibrating backbone of title cards | `{dt_ps:1, scale:0.001, xyz:int16[2000][15]}` | ≈ 60 KB |

Total data under 200 KB. Everything else is computed at load or per frame.

---

## 6. Risks

1. **Toy is not molecule.** Each rig is exact only under its assumption (Gaussian modes; independent uniform
   torsions; one bond; a unimodal banana); BBA torsions are correlated and multi-basin. The stamp states the
   assumption, and rig-to-molecule comparisons are badge pairs, never one curve.
2. **Exact against Monte Carlo.** Note 30's chain table is a 20,000-query Monte Carlo; the transfer matrices are
   exact. At two decimals they differ at t = 0.26 (end-to-end² 0.13 vs 0.12; Rg² 0.26 vs 0.25). Show three decimals
   with a footnote; the test asserts agreement within 0.01; never type the note's rounded values.
3. **Spectrum ratio.** The local fit gives 1,428, note 27 prints 1,423: display "≈ 1.4×10³" and ask the author which
   to canonize.
4. **Windows and κs.** First-order and best-envelope windows never share a lane unmarked; the C3 Rg window is
   0.27–0.28 (lower bound), not 0.19, 0.23 or 0.30. Only three κs appear, each stamped and never on one arrow:
   192/112/97 → 9.6/7.6/13.4 (bgmol windows), 184 → 2.99 (mdshare 1 ps steps), ≈ 1,423 (BBA variances); Part 1's 400
   is [I].
5. **Data sets and units.** Spring constants and residual stiffness are bgmol; widths, Stein ratios, learning curves
   and αL are mdshare. σ is dimensionless: the ALDP5 rig uses the pilots' 0.9418 Å (floor 0.042 Å), BBA Cartesian
   0.279 Å at t = 0.01. Panels carry data and unit stamps.
6. **Ghost paths and importance weights.** Ghosts use one noise draw scaled along the clock (a valid marginal at
   each t, not a diffusion path; say so once, as note 27's probe does). Chart B's importance sampler loses ESS at low
   t: show the ESS and below t = 0.05 state Prop 2's limit instead.
7. **Superseded or fragile numbers.** Note 25's αL "Cramér–Rao" 0.90/1.27/0.79 never appears. Loud-mode force numbers
   from before 2026-11-16 carry the wrong volume term and are labelled. Open-PR numbers (#1104, #1138: one seed,
   amended selection) are flagged and refreshed before export. The Chignolin Rouse transfer used ScoreMD's generated
   dummy data; the Sprint 7 αL box is reflection-confounded.
8. **Hypotheses stay dashed.** The share-of-loss criterion; a whitened block keeping half the gain; "the barrier that
   may save"; soft forces inherited across t; anti-order growing with chain length; g2's unofficial wδ windows.
9. **Analogies are labelled.** The radial toy shows the mechanism; the BBA formula and numbers come from #1100/#1103.
10. **Part 1 consistency.** Part 2 restates κ = 400 as illustrative and reconciles Problem 3 (2.5); Part 1's last
    card needs a one-line retarget.
11. **Length.** About 50 minutes in five standalone pieces; if cuts are needed, drop P.5 and 3.7 first (bridges, not
    mechanisms).

---

## 7. Build order

0. **Groundwork, 4 days.** Bring in PR #3's `src/app.js` export changes (narration in `window.video.scenes`, JPEG
   frames) so that narrated MP4 export works. Promote, without importing `private/other`, `frame / axes / drawCurve /
   readout / pill / legend / track` from `retention/shared.js` into `src/draw/plot2d.js`; `leverSim / clock / paced`
   into `src/engine/levers.js`; u1-force's `space.js` painter into `src/draw/space.js`; llm-soc's `codeBlock` into
   `src/draw/diagram.js`; `interactions/linalg.js` into `src/model/linalg.js`. New `src/draw/bench/` devices (clock,
   curtain, meter, raster, ghosts, badges, stamp, ledger) and rigs C1–C3 with their tests.
1. **MVP: Part 2 · The noise clock, 6 days** (plus 0.5 day for the A1 script). Why first: it needs the smallest data
   (A1, 4 KB); its rigs (clock, meter, ghosts, raster, blur dial) are reused by every later piece; it continues
   Part 1 directly and resolves Part 1's two consistency traps. Gate: the u1-force review (maths, visual, pacing
   reviewers; `review-frames.mjs` at ≤ 2.2 words per second) before Part 4 starts.
2. **Part 4 · Range and order, 9 days.** C11–C14 and assets A2–A4 (1 day), the chart-B sampler (1 day). Highest
   value: it is the current account of the project.
3. **Part 3 · Embed, don't flatten, 7 days.** C9 and C10, the 3D cone and peel (needs `space.js`), A5 subsets.
4. **Prologue · Infinitely far, 6 days.** C5–C8, A6.
5. **Part 5 · Reading a force, 5 days.** C15 and C16, the lever arm (C12), the remaining A5 entries.
6. **The bench explorable, 4 days.** It reuses the rigs, adds the calibration lamps and the provenance drawer.

Total ≈ 42 working days plus 1–2 review days per piece.

**Dependencies.** PR #3: the export API, Retention as a link target, `review-frames.mjs`. PR #2: `space.js`. a1's
consistency facts. Read access to `LOCAL` for the data scripts (once; the JSON files are committed). The open ML PRs
#1104, #1137, #1138, #1136 and #1113, whose numbers enter through `results.json` flags; refresh them before each
export.
