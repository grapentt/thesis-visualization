# R4 — Era 4: scaling to BBA and trying to *learn* embeddings

Reader report for the visualization project. Scope: the period from the learned
stiffness-removing warp (2026-10-24) to the Sprint 12 first chunks, the BBA failure
diagnosis of PR #1025 and the consolidation of 2026-11-14, with pointers to the
range-and-order turn that followed. All paths below are relative to the
`rg-main` snapshot (`origin/main`, 2026-11-19) unless absolute.

**Conventions used throughout.** "Updates" are optimizer updates (not wall time).
W1 = one-dimensional Wasserstein-1 distance between generated and reference
distributions (bonds/Rg in Å, angles in degrees, or "in thermal widths" when divided
by the reference standard deviation). JS = Jensen–Shannon divergence in nats (ALDP5:
(φ, ψ) histograms; BBA: histogram on the two leading TICA coordinates, "TIC JS").
Rg = radius of gyration. "Floor" = the value a second, equally valid reference
sample scores; nothing is better than its floor. VP schedule used everywhere:
$\beta(t)=0.1+19.9t$, $\alpha_t=\exp[-\tfrac12(0.1t+9.95t^2)]$, $\sigma_t^2=1-\alpha_t^2$.
"[M]" = measured, "[D]" = derived (in the source unless marked "(derived here)", which means
derived or recomputed by me for this report), "[H]" = hypothesis stated in the source,
"[C]" = later correction. The numeric checks behind "(derived here)" are scripts in the
scratchpad folder `/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/r4checks/`.

---

## 1. Narrative

### 1.0 What Era 4 inherited (late October 2026)

Sprint 11 (tracker [#769](https://github.com/grapentt/riemannian-generative/issues/769))
asked whether a metric approximating the molecule's thermal stiffness, with noise
shaped by it, helps diffusion models learn molecules and forces. Most candidates
are maps φ into a Euclidean feature space whose *pullback metric* $G=D\varphi^\top D\varphi$
removes the stiffness; flat Gaussian noise in φ's coordinates is then the pullback
process, with known closed-form transitions and no geodesic integration
(`docs/status.md`, "Sprint 11"). On the five-bead dipeptide ALDP5 hand-built maps
(spring-force features, wδ features, invariant whitening) already worked for the
*stiff* coordinates: bonds reached the data floor ~100× sooner (≈2k vs 200k steps),
angles 10–20× sooner, with no clear torsion advantage
(`investigations/feature-space-evaluation.md`, summarized in `status.md`). Theory note
21 (merged 2026-10-24, #745) had stated why: flat noise resolves a mode only below its
own width (its "Proposition 5"), so Cartesian diffusion sees bonds only at the very
smallest noise levels.

Era 4 asks two things on top of that: **(i) can the stiffness-removing map be learned
from data instead of written down**, and **(ii) does the approach carry over to a
protein**, the 28-bead C-alpha model of the mini-protein BBA (milestones M2
[#283](https://github.com/grapentt/riemannian-generative/issues/283) / M4
[#284](https://github.com/grapentt/riemannian-generative/issues/284))?

### 1.1 A learned stiffness-removing warp (2026-10-24 → 10-27; #753, #754, #765, #773)

**Idea.** Fit a smooth invertible map W so that 1 ps molecular-dynamics steps have the
same width c in every aligned shape direction of z = W(x). Construction: align every
cloud to a fixed reference (Kabsch), take the (3n−6)-dimensional linear slice of
aligned shapes, and apply an affine coupling flow φ on slice coordinates; fit φ by the
exact likelihood of an isotropic Gaussian random walk in φ on consecutive-frame pairs
(`design/learned-stiffness-warp.md`, evidence date 2026-10-24; PR #753 merged
2026-10-27). Nothing chemical enters: no force field, graph or internal coordinates.
Finite steps (mapping both endpoints through φ) were needed because neighbourhood-
averaged or Jacobian-linearized steps left bonds ≈2× under-magnified in an unrecorded
prototype: a bond direction turns by 7.5–16° within 1 ps, and the second-order radial
term is as large as the bond's own 1 ps width.

**Why it looked promising.** On held-out mdshare trajectory 1 the warp removed most of
the local stiffness: median local condition number κ of actual 1 ps steps 2.99/3.04
(ALDP5, two fitting seeds) against an isotropic-sample floor of 1.55, versus 184/185
for flat Cartesian, 24.6 for constant whitening and 3.88/3.95 for scaled internal
coordinates; ALDP10 (24-D) 3.62/3.68 against 1780 for flat. Flat noise in z displaced
bonds, angles and torsions by one 1 ps step width at the same noise level (noise
"spread" 1.00–1.14 against 7.8–9.0 in Cartesian). A "flag test" showed the map had
rediscovered chemistry: its four most magnified directions overlap the bond gradients
at 0.973/0.972 (chance 0.444), the bottom two the (φ, ψ) motions at 0.995 (chance 0.222).

**Caveats found immediately.** The single alignment chart has a cut locus where two
alignments tie; W jumps there by 4.7–6.6 Å for input changes down to 2×10⁻⁷ Å, only
0.09–0.16 Å from real ALDP5 frames (ALDP5 is nearly planar). The latent Gaussian also
places mass where the inverse has no preimage: at noise 3c, 3.6–7.8% (ALDP5) and
18.4–21.8% (ALDP10) of 500 decodes fail or blow up. "Equal displacement is not equal
information": in z the held-out data spread ≈1c along most directions but 2.0–2.4c and
3.2–3.3c along two, so basin information still survives to larger noise.

**The first diffusion pilot (#754, 2026-10-24 → 26; CPU, 4×256 MLP, ALDP5).**
With the repository's *production* noise floor (t ≥ 0.01, σ_min = 0.042 Å, larger than
a bond's 0.025–0.031 Å width) flat diffusion generated bonds only 0.49–0.58 as broad as
the data (angles 0.67–0.76), because the final Tweedie step returns a conditional mean;
in the learned coordinates bonds were right (0.99–1.03), and the flat bond PMF error
(1.2 k_BT) *grew* with training (a noise-floor bias, not overfitting). Against the
stronger low-floor flat baseline (t ≥ 10⁻⁵) the learned coordinates reached the bond and
angle floor within 1,000 steps versus 100,000–200,000 — but **torsions were learned
faster in flat coordinates** (≈5,000 steps to the training-trajectory floor versus
100k–200k for the learned arm). A dimensionality test (shrinking the seven stiff
directions of z by 0.1) made torsion learning *slower*, rejecting the explanation that
flat coordinates are "effectively 2-D"; the hypothesis left standing is that the warp
bends and stretches the basins [H]. Data-size runs (2–50 ns segments, warp refitted) gave
no data-efficiency gain for torsions; at 2,000 frames the learned arm memorized sooner
(23% near-copies at 100k steps vs 6.6% flat). The pilot also explained why a flat loss
curve hides stiff-mode progress (Section 3, E4). #765 (2026-10-26, merged 10-27)
re-evaluated under a pre-declared protocol: learned coordinates match spring features on
bonds and stiff–soft coupling, are slower than springs on torsions; GPU numbers of the
earlier feature-space pilot were superseded because XLA miscompiled the final denoising
step. #773 (2026-10-27) placed 13 of the 18 broken learned-arm molecules just inside the
alignment-chart boundary and 5 beyond it.

### 1.2 What a thermal metric hides (2026-10-25; #761, `design/thermal-submanifold.md`)

A gauge-free analysis (pairwise alignment, no reference chart) asked at which scale ALDP5
shapes look low-dimensional. In raw Euclidean shape distance the local dimension falls to
**2.0 at 0.4 Å** and plateaus (1.9–2.0 up to 1.6 Å): a thin (φ, ψ) sheet. Measured in
1 ps step widths (the thermal metric) there is **no plateau** — whitening removes the
scale separation that makes the sheet visible. Lesson recorded then: "use different
rulers for different jobs"; the thermal metric is the right ruler *across* the sheet
(stiff directions), not for finding the sheet. This is an early statement of what
returns at BBA scale: equalizing everything destroys the separation of local from global.

### 1.3 Learning embeddings from moments, densities and covariances (2026-10-29 → 11-10)

Several learned-map recipes ran in parallel on ALDP5, mostly with invariant features
(Gram products and signed volumes, 14 numbers for ALDP5):

- **Local-moment loss** (theory note 24, #883, 2026-10-30): fit a metric $g$ to the local
  second moment Σ by minimizing $[\mathrm{tr}(g\Sigma)-\log\det g]/d$, minimized at
  $g=\Sigma^{-1}$ — "stiffness removal in its purest form".
- **Local-moment refinement** (#889/#893, merged 2026-11-04,
  `design/local-moment-refinement.md`): a calibrated nonlinear correction of whitening
  improved held-out geometric balance (scale-free imbalance 0.5653–0.5705 against
  0.6731–0.6732 for full linear mixing and 0.6743 for unchanged whitening) and
  force consistency (force RMS 0.1789 vs 0.2320 whitening) but its 5k-update generator had
  *worse* bond/angle widths (5.92% vs 2.25% whitening, 1.55% full linear mixing).
- **Covariance-aware prediction** (#890, fits 2026-10-30, component comparison approved
  and completed 2026-11-10): an analytic Gaussian skip $\sigma V^{-1}(z-\alpha\mu)$ lowered
  noise loss in all six geometries (0.38–3.98%) yet worsened torsion JS in five; the
  *analytic predictor alone* already gave graph-map widths of 1.09%/0.50% versus
  1.11%/0.40% with the network.
- **Static population density** (#908/#910 → recorded negative in #946, 2026-11-06,
  `design/static-population-density.md`): a normalized coupling-flow likelihood fitted
  directly to static conformations, sampled by the analytic inverse. Both seeds on ALDP5
  and BBA lost to both flat diffusion controls on all five primary errors even after
  200k updates (ALDP5 bond W1 0.21 Å vs 0.0016 Å isotropic flat). Retired.
- **Intrinsic spring noising / retraction** (#915/#921 → #947, 2026-11-06,
  `investigations/retraction-downstream-857.md`): a curvature-corrected retraction was
  2.4× cheaper than geodesics (0.497 s vs 1.210 s per 64 paths) but intrinsic ISM
  generation had 10.8× spring DSM's angle error at ≈2.3× the cost. Retired.
- **Rao–Blackwell DSM** (#931, 2026-11-05): posterior-averaged targets cut gradient
  variance 3.5×/9.1×/88× at t = 0.1/0.2/0.4 but by nothing at t ≤ 0.02, where the
  posterior's effective number of source frames is one.
- **Learned retention maps** (#933, 2026-11-05, `investigations/information-retention.md`):
  a map fitted so that physical probes stay predictable under noise made an identical
  ALDP5 generator learn much faster early (bond error at 100 updates 0.04–0.06 vs 0.146
  invariant and 2.74 flat); "given enough updates all good representations converge".
- **Bead-energy backbone** (#892, merged 2026-11-03; preference recorded 2026-11-05 in
  #932): one attention token per bead, scalar energy differentiated w.r.t. the noisy
  feature vector; 1.59×/1.68× faster per update than feature-token energies.

The common thread already visible: *each recipe improved the quantity it fitted*
(conditioning, likelihood, noise loss, gradient variance) without a matching improvement
in generated molecules.

### 1.4 First contact with BBA (2026-11-01 → 11-05; #895, #899, #911, #944, #951–#953)

**PR #895 (created 2026-11-01)** trained six conservative pullback maps on real DESRES
BBA (28 C-alpha beads; 1,300,156 training / 325,039 held-out frames) with a width-64
"grouped-feature" transformer (122,561 parameters), 200k updates at batch 128, two seeds,
100,000 iid draws per model (`investigations/sprint11-pullback-campaign-closeout.md`).
Bonds improved a lot — springs 0.0122 Å vs flat 0.637 Å (52×) — but **no map improved
populations and free energies together**: TIC JS flat 0.0529, springs 0.0479, wδ 0.0889,
invariant whitening 0.250 (PMF 4.83 vs 0.56). The high-dimensional maps (whitening 3,303
features, endpoint φ, transferred graph φ 3,785) were worst globally and failed most
decodes; their first network layer had rank at most 1,792, so 1,511–1,993 feature
directions got no learned correction. A sample-count lesson came out of it: at 2,000
molecules the reference itself has PMF error ≈5, so the 2k spring PMF advantage reversed
at 100k. **#899** (2026-11-02, width 160) removed the rank bottleneck: whitening improved
(JS 0.250 → 0.164) but still lost every global comparison (0/12) while winning bonds.

**Forces.** The saved-path diagnosis (#944, merged 11-10) found that whitening's learned
force loses to its own noise-only control (MD-start TIC JS 0.330 vs 0.290) while keeping
much better bonds; #951 decomposed the whitening force at t = 0.05: Gaussian reference
term RMS 163.10 Å⁻¹ per bead, learned term 112.18, opposing only 4.95% of the reference.
The literature assessment (#952) and the empirical-kernel diagnostic (#953, merged 11-10)
showed the exact finite-bank Gaussian-mixture score is not an oracle: 373 of 384
comparisons had posterior effective frame count below two — it is a nearest-frame force.
Quantum springs on BBA (#911) failed before producing a map: vacuum GFN2-xTB moved
protons across salt bridges.

### 1.5 The lag lever and what it really is (2026-11-04 → 11-05; #925, #936, #938, #941 → #950)

Theory note 25 (#925, 2026-11-04) showed that the *lag* τ of the steps a stiffness
metric is fitted to is a dial: the half-step variance of a basin mode is
$w_k^2(1-e^{-\tau/t_k})$, so the inverse step covariance runs from flat (τ → 0) through
the within-basin thermal metric to global whitening (τ beyond hopping times), and noise
shaped by it erases modes in order of relaxation time. Measured on ALDP5, the 1 ps metric
weighs ψ ≈19× and φ ≈2.3× stiffer than their equilibrium spreads.

The **lag sweep** (#936, evidence 2026-11-05) refitted the warp on 1, 10 and 100 ps
steps. The 100 ps warp learned the whole alanine-dipeptide distribution within **100
updates** (Ramachandran JS 0.027 vs 0.117 flat and 0.127 for the 1 ps warp; floors
0.019–0.023; 97% valid molecules vs 10% for flat), but plateaued: from ≈2,000 updates
flat overtook and ended best (0.0203 vs 0.0227–0.0236), and the 100 ps arm kept a
6× surplus in the rare saddle toward αL. The sweep first attributed the speed-up to
synchronized erasure. **Same-day correction:** the soft-scale sweep of the spring feature
space (#938) moved a pure rescaling to the same point of the dial (γ = 30, 8, 2) and got
*slower* early torsion learning (JS 0.133, 0.149, 0.163 at 100 updates). A direct
measurement explained the warp instead: in its coordinates the training data are nearly
Gaussian (total KL to a Gaussian 0.14 vs 0.96 flat and 1ps warp; Sarle bimodality ≤0.37):
**the long-lag warp is in part a Gaussianizing flow for the slow modes**, a different lever
from stiffness removal. The controlled test (#941) Gaussianized the two torsion marginals
inside a square internal map: JS at 100 updates 0.042–0.043 vs 0.255 for a linearly scaled
control, with 1-D profiles, populations and ψ-barrier occupancy at their floors — but the
joint (φ, ψ) structure was learned slowly and the Gaussianized arms finished *behind* every
comparator (0.029 vs 0.020–0.023). Two separable levers emerged: stiffness removal (local,
robust) and Gaussianization (slow modes, fast start, late cost). Consolidated in #950
(merged 2026-11-12).

### 1.6 Lag-fitted warps with the bead transformer, on ALDP5 and BBA (2026-11-05 → 11-12; #954, #957, #971, #955, #960)

The **bead-matched campaign** (#954, evidence 2026-11-06,
`investigations/bead-matched-campaign.md`) ran the flat slice, trajectory/chain springs
and the 1- and 100-frame warps with the conservative bead-energy transformer at 200,000
updates, two seeds, on both systems. On ALDP5 the lag lever survived but shrank (100 ps
warp JS 0.026 at 100 updates vs 0.058 flat; all arms at the floor by 1,000 updates; flat
and springs best at 200k; the 100 ps saddle surplus persisted, 21 per 10,000 at 200k vs
MD 4–6). **On BBA the first attempt did not learn at all** (anchored clouds in Å; RMS radius
10.8 Å vs 1.6 Å on ALDP5 and a 15× larger feature-to-cloud sensitivity); scaling the anchor
by the training RMS radius fixed it. Then the maps separated by *what* they learned:
the two lag-fitted warps learned the **slow TIC coordinates fastest and best** (TIC JS
0.053–0.056 at 200k, 20k molecules, floor 0.038, vs 0.074 flat and 0.080 springs), the
chain springs the **local geometry** fastest (bond W1 0.11 Å by 5,000 updates, angles 3.0°
at 200k), and the 100-frame warp had the worst bonds (0.59 Å). BBA's frame spacing is
200 ps, so lag 1 = 200 ps and lag 100 = 20 ns; the BBA warp's κ was only 7.6–8.6 (floor 4.9)
and its noise-damage spread 8.9 (1 frame) and 29 (100 frames) — on BBA the warp did *not*
equalize noise damage. Re-evaluated under the candidate-overview protocols (#971,
2026-11-08) the warps were the overview's best BBA candidates on slow coordinates (TIC JS
0.0246/0.0272 at the 100k prefix vs 0.0457 bead flat, 0.0479 old springs, 0.0529 old flat).

**But not as force fields** (#957, `investigations/bead-force-field-simulation.md`): on
BBA no map gave an accurate force (26–43% of the 53 stiffest directions within ±10% of the
Stein check for the best arms) and after 10,000 Brownian steps all four maps drifted to the
same TIC JS (0.105–0.120), so the warps' direct-sampling advantage did not carry into
simulation; the springs' force kept bonds at 0.015 Å. On ALDP5, springs and the 100 ps warp
gave usable force fields, the flat slice and one 1 ps-warp seed a wrong torsion landscape,
and the warps' forces blew up in a few regions (1–15% of walkers lost depending on
checkpoint). Learned retention maps with the bead model (#955) helped only whitening early
and hurt every BBA bead representation; the durable side-result was that **internal
coordinates were by far the best BBA representation** with this model (bond 0.0016 Å, angle
1.8°, TIC JS 0.069 vs flat 1.00 Å, 14.7°, 0.151 at 20k updates).

### 1.7 Sprint 12's matched first chunks (2026-11-08 → 11-10; #972–#978, #983, #986, #987/#990, #996)

Sprint 12 ([#855](https://github.com/grapentt/riemannian-generative/issues/855)) compared
the candidates properly: one shared conservative invariant transformer (ScoreMD-sized:
BBA width 128/3 layers, ALDP5 96/2), batch 1,024, AdamW, the same VP schedule; full data
(50,000 bgmol ALDP5 frames, 1,300,156 BBA frames), seed 0, and the first 10% of the
optimizer horizons (48,000 / 190,350 updates). Final streams of 50,000 / 100,000 molecules;
four short Langevin panels (16 walkers × 2 ps). Results snapshot 2026-11-09 09:47 UTC;
final report #983 (merged 11-10) (`sprints/sprint12/matched-results.md`).

- **ALDP5:** internal coordinates, springs and whitening all strongly improved bonds and
  angles over Cartesian (bond W1 ≈0.0002 Å vs 0.0046 Å), with populations near each other.
- **BBA — the split that defines this era's ending:** internal coordinates gave
  near-exact local geometry (bond 0.000274 Å, angle 0.166°, best population JS 0.0124)
  **but swollen molecules** (Rg W1 0.521 Å); Cartesian had the right size (0.072 Å) but
  poor local geometry (0.415 Å, 5.24°); **springs and whitening failed outright** (springs
  bond 0.320 Å, angle 8.85°, 2,887 failed decodes; whitening bond 0.705 Å, angle 24.4°,
  Rg 0.497 Å, population JS 0.344, 3,729 failed decodes). The short- and long-lag warps
  were not leaders here (Rg 0.249 Å, bonds 0.48/0.64 Å), and on ALDP5 their simulations
  were unstable (40 and 3 of 640 records).
- A side experiment swapped the ordered chain for **automatic, maximum-sine reference
  selection** (#986, decided 2026-11-10): BBA size improved ≈3× (Rg 0.533 → 0.174 Å) but
  angle error grew ≈33× (0.17° → 5.79°) — nonlocal angle references mix collective bending
  into coordinates that are then whitened. The generic constructor was changed to prefer
  **chemical-local references** (#996, 2026-11-10), which recover the chain exactly on
  ALDP5 and BBA (numerical parity, no new training). The factorized density with nonlocal
  references showed the same trade (size 0.867 → 0.228 Å, physical angle error ×32.5).

### 1.8 Learning the embedding objective (2026-11-10 → 11-13; #988–#1021 → #1081)

Thirteen PRs asked which *fitting objective* gives invariant coordinates in which
diffusion generates better molecules: a global density fit, an endpoint (next-frame)
contrastive fit, the local second-moment fit, mixtures, centered covariance, bond-corrected
covariance, covariance scored after diffusion normalization, and an equilibrium-conditioned
objective (`investigations/learned-embedding-objectives.md`, consolidated 2026-11-14).
Short answer: **better local conditioning of the map does not translate into better
generated molecules.** Global + endpoint was the best simple recipe on ALDP5; on BBA no
learned embedding approached Cartesian on size and fold, and every local variant moved
along one trade-off line (better size/population, worse bonds/angles/collisions). The
mechanisms were measured: the local target was contaminated by a **bond-turning artifact**
(a turning bond looks like a compressed one in straight chords; on BBA linearized bond
changes were ≈10× the actual ones — RMS 0.83 vs 0.081 Å — and the "1 ps" pairs turned out to
be ≈200 ps apart, which "makes this worse");
first-order conditioning disagrees with the nonlinear finite response; diffusion's single
scalar RMS normalization **reverses** a local fit's score; and with 3,303 features for 78
shape directions most noise lies off the molecule, the network improved the 3,225 normal
directions while its tangent error got *worse* by 17–29%.

### 1.9 The objective search: "prediction is not generation" (#780; 2026-11-05 → 11-13; synthesis #1037 → #1075)

In about thirty matched two-system comparisons of analytic references, time sampling,
denoising targets, head optimization and auxiliary losses, none improved generated
molecules on both ALDP5 and BBA, although most improved their own target quantity
(prediction risk, gradient variance, angle reconstruction, starting distribution)
(`investigations/objective-search-synthesis.md`). Reasons recorded: raw risk contains an
irreducible floor; theorems concern estimators or ideal optima, not finite nonlinear
networks through 1,000 reverse steps and a decoder; and BBA's generation error is in
collective shape, which depends on long-range combinations of torsions
($R_g^2$ decomposition, Section 2.16). Execution noise matters: two bitwise-identical
native BBA runs differed by 0.046 Å in size W1.

### 1.10 Factorized densities (#956 → #1018; consolidated #1077)

A parallel line learned the soft coordinates with a masked autoregressive density (MADE)
and completed stiff coordinates with a conditional Gaussian
(`investigations/autoregressive-density-and-thermal-completion.md`). Bond completion was a
safe simplification on BBA (bond error −15.5% vs a neural length model, 430,800 fewer
parameters); completing **angles** too destroyed BBA structure (angle errors accumulate
along the chain: nonadjacent-distance RMS change 2.86 Å vs 0.162 Å) although the
likelihood improved by 9.99 nats/frame — "likelihood is not a structural readout".
Generating torsions first improved BBA size by 17.6% and contacts by 12.5% but raised
angle error 54.8% (exposure bias); all density generators stayed far from the data on
global shape (0.69–0.87 Å vs 0.062 Å reference variation).

### 1.11 Diagnosing BBA, map by map (2026-11-11 → 11-14; #1025, #1026, #1023, #1048, #985, #998, #1033)

**PR #1025** (created 2026-11-11, closed 2026-11-14 and consolidated into
`investigations/bba-local-geometry-preconditioning.md`, #1078) built a training-free
**resolution test** — the feature noise $\sigma^*(q)$ at which a physical observable stops
being determined by the noisy features — and found a separate, measurable cause for each
Sprint 12 failure:

1. **Springs: right balance, wrong scale.** One global RMS divisor over spring channels
   and the 81 Cartesian background channels was 27.1 on BBA (1.31 on ALDP5), leaving each
   spring channel a population s.d. 0.037, below the smallest training noise 0.045: bond
   resolution 0.84× σ(t_min) — never resolved during training.
2. **Whitening: the noise lives off the molecule.** 3,225 of 3,303 directions are normal
   to the 78-dimensional molecular image; the tangent share of the untrained loss below
   t = 0.1 was 0.06, and training loss barely moved (911 untrained, 904 after 100 updates,
   759 after 190,350).
3. **Internal coordinates: Rg is the least resolved observable** (3.0× σ(t_min) vs 22× for
   bonds). (#1025 explained this as small errors adding up along the chain; #1055 later
   corrected this: the error is a missing collective coupling, not accumulation.)
4. **Cartesian: invisible distances.** Bonds are resolvable only for t < 4×10⁻⁴ (0.04% of
   training examples), and the invariant encoder must extract distances from cancelling
   Gram entries.

Five design conditions followed (resolution above the floor, balance including collective
motion, a placement law, prior matching, readable inputs). Matched training rounds
showed: **pair-distance inputs** (#985) are the largest single gain for Cartesian BBA (bond
0.76 → 0.013 Å, 60-fold); an analytic **spring score base** gives correct bonds from the
first update but **collapses the untrained chain** to Rg 4.9 Å (data 10.6 Å) — freezing bonds
and angles removes the volume that balanced the isotropic Gaussian's pull — whereas a
Gaussian with the data's rotation-averaged covariance keeps the size (Monte Carlo 10.7 Å;
built as the covariance-matched base of #1033). The Sprint 12 force panel at t = 0.05
measures **blur** (≈1 Å for Cartesian BBA), not force quality. #1026 measured *readable
windows* and defined **C3** (internal coordinates whose chain-rebuilt distance inputs use
normalized phase pairs): bond lengths readable *through the rebuilt distance inputs* up to
t ≈ 0.11 instead of 3.4×10⁻⁴ (the whitened bond channels themselves stay readable to
t ≈ 0.26), size error −19%, but still ≈5× Cartesian's. Whitened two-block candidates (Rouse vectors, bond warps)
reached local targets but failed globally — "in hindsight the *range without order*
failure".

### 1.12 The turn to range and order (2026-11-12 → 11-16; pointer only)

#1055 located C3's size error in the learned field at intermediate noise, exactly where
the readable windows of global and local features coincide; #1064 turned this into theory
note 27 (range: every property readable inside the trained noise levels; order:
large-scale shape erased last); #1057/#1069 appended two *loud* (unwhitened) collective
modes to C3 and cut BBA size error from 0.48 to 0.11 Å at 50,000 updates with C3-level
local geometry. The status page recorded the new working hypothesis on **2026-11-14**:
"Stiffness removal is kept for the stiff coordinates and dropped as a goal for the whole
molecule." Twelve research-line consolidation PRs (#1075–#1086) merged 2026-11-16. At the
registered budget (190,350 updates, 2026-11-15) internal + two loud modes beat native
ScoreMD on every generation measure; force fields still drift in size (later eras).

---

## 2. Core mathematics

Each item: formula, symbols, intuition, source (file § section).

### 2.1 Noising, denoising and the Gaussian-residual model

- **VP forward law** (all Era-4 models): $Y=\alpha_t Z+\sigma_t\epsilon$, $\epsilon\sim N(0,I_M)$,
  $\alpha_t=\exp[-B(t)/2]$, $B(t)=0.1t+9.95t^2$, $\alpha_t^2+\sigma_t^2=1$. $Z=\Phi(X)$ is the
  complete normalized feature vector; one draw corrupts *every* coordinate, including
  directions transverse to the image of the map — it is not Brownian motion on the
  molecular image. (`theory/28-score-ease-and-thermal-preconditioning.md` §1.)
- **Bayes target and score**: $\epsilon^*(y,t)=E[\epsilon\mid Y=y]=\big(y-\alpha_tE[Z\mid y]\big)/\sigma_t$,
  $s_t(y)=\nabla_y\log p_t(y)=-\epsilon^*/\sigma_t$ (Vincent 2011; note 28 §1;
  `sprints/sprint12/candidates/theory-and-evidence.md`).
- **Gaussian-residual (conservative) model**: $\hat\epsilon_\theta=\sigma_t y+\alpha_t\nabla_yH_\theta(y,t)$,
  $H_\theta=0$ at initialization, so the untrained model asserts "features are standard
  normal" (*prior matching*: a direction whose clean law already is $N(0,1)$ costs nothing).
  Loss $L=E[\alpha_t^2\|\nabla_yH_\theta-(\alpha_t\epsilon-\sigma_tZ)\|^2]$: the residual regresses a
  velocity-like target, not a clean spring force (note 28 §1).
- **Irreducible floor** (orthogonality): $E\|f_\theta(Y_t)-\epsilon\|^2=E\,\mathrm{tr}\,\mathrm{Cov}(\epsilon\mid Y_t)+E\|f_\theta-m_t\|^2$,
  $m_t=E[\epsilon\mid Y_t]=-\sigma_t\nabla\log p_t$. Only the second term is model error; changing
  map or corruption changes both, so raw losses are not comparable across maps
  (`investigations/objective-search-synthesis.md`; note 28 §2 gives the equivalent
  $E\|\epsilon_\theta-\epsilon\|^2=E\|\epsilon_\theta-\epsilon^*\|^2+\frac{\alpha_t^2}{\sigma_t^2}E\,\mathrm{tr}\,\mathrm{Cov}(Z\mid Y)$).
- **Posterior-covariance identities** (note 28 §2):
  $\nabla_yE[Z\mid y]=\frac{\alpha_t}{\sigma_t^2}\mathrm{Cov}(Z\mid y)$,
  $\nabla_ys_t=-\frac{I}{\sigma_t^2}+\frac{\alpha_t^2}{\sigma_t^4}\mathrm{Cov}(Z\mid y)$.
  Note 25 §4 turns this into one diagnostic, the whitened posterior covariance
  $\Lambda_t=N^{1/2}\mathrm{Cov}[\alpha_tx_0\mid x_t]N^{1/2}/\sigma_t^2=I+\sigma_t^2N^{-1/2}\nabla^2\log p_t\,N^{-1/2}$
  (Jacobian of the whitened denoiser; "synchronized erasure" E4 holds iff $\Lambda_t\propto I$).
- **Gaussian clean law** $N(\mu,C)$: affine score $s_t(y)=-(\alpha_t^2C+\sigma_t^2I)^{-1}(y-\alpha_t\mu)$ (note 28 §2).

### 2.2 Pullback metrics and the learned warp

- **Pullback metric** of a feature map: $G(u)=D\varphi(u)^\top D\varphi(u)$; positive definite iff
  $D\varphi$ is injective on the allowed tangent space, since $v^\top Gv=\|D\varphi v\|^2$; a retained
  block $a\,u$ gives $G\succeq a^2I$ (`candidates/theory-and-evidence.md`, "Pullback geometry").
  Flat noise in φ-coordinates is the pullback process of the configuration coordinates
  (note 20, Design B / Prop. 3, cited in `investigations/learned-stiffness-diffusion-pilot.md`).
- **Learned warp** (`design/learned-stiffness-warp.md` §Construction): decompose
  $x=\bar c+sR^\top$ (centroid, proper Kabsch rotation onto a fixed reference, aligned shape);
  aligned shapes lie in a $(3n-6)$-dimensional slice $s=m+Vu$; a coupling flow φ acts on $u$:
  $$W(x)=\bar c+\big(m+V\varphi(u)\big)R^\top .$$
  φ = (affine coupling layers with log-scales $B\tanh(s/B)$, $B=1$) ∘ L, with L the constant
  whitening of the average local step covariance (so φ = L at initialization). On slice
  directions $G=DW^\top DW\approx c^2\Sigma(x)^{-1}$ ($\Sigma(x)$ = local covariance of thermal steps).
- **Closed-form log-determinant**: $\log|\det DW(x)|=\log|\det D\varphi(u)|+\log\rho(s')-\log\rho(s)$,
  $\rho(s)=|\det[V,\text{rotation columns of }s]|$, $s'=m+V\varphi(u)$.
- **Fit objective** (exact likelihood of an isotropic Gaussian random walk in φ, on frame
  pairs one lag apart):
  $$\mathbb E\Big[\tfrac{|\varphi(u_1)-\varphi(u_0)|^2}{4c^2}-\log|\det D\varphi(u_1)|\Big],$$
  c = median largest local step width (0.25 Å for ALDP5 at 1 ps). "Equilibrium samples alone
  cannot identify φ: the lag defines what counts as a local fluctuation."
- **Uniqueness domain / cut locus**: for $M=s^\top\!\cdot\text{reference}$ with eigenvalues
  $\lambda_1\ge\lambda_2\ge\lambda_3$, the identity is the unique best proper rotation iff
  $\lambda_2+\lambda_3>0$; W is generally discontinuous across the cut (§Construction, §Limits).

### 2.3 Measuring stiffness and noise damage

- **1 ps step width** of a coordinate q: $\sqrt{\tfrac12E[\Delta q^2]}$ over steps one frame apart;
  equals the equilibrium width for bonds, is much smaller for torsions (warp doc §Purpose).
- **Step isotropy κ**: condition number of the covariance of the 512 nearest actual 1 ps
  steps around each of 2000 held-out anchors, mapped into the coordinates under test, no
  linearization; isotropic steps give κ ≈ 1.55 (9-D) / 2.24 (24-D) at this sample size
  (the *floor*) (§Evaluation).
- **Noise spread**: ratio of the noise levels at which the most and least fragile groups
  deviate by one 1 ps step width (deviation measured as $1.4826\cdot\mathrm{median}|\Delta q|$);
  1 = all groups erased together (§Evaluation).
- **Flag test**: median overlap of the most magnified directions of Dφ with the span of
  gradients of stiff internal coordinates (nested bonds → angles → stiff dihedrals), and of
  the least magnified with the (φ, ψ) motions (§Evaluation).
- **Force (Stein) check** (`investigations/bead-force-field-simulation.md`): for the exact
  force $g=\nabla\log p$ and any fixed direction e, $-E[(g\cdot e)(e\cdot(u-\bar u))]=1$
  (Stein's identity with $f=e\cdot(u-\bar u)$). Values <1: force too soft along e. Necessary,
  not sufficient.

### 2.4 The lag dictionary (theory note 25, 2026-11-04)

Basin model: $U=\tfrac12(x-x^*)^\top H(x-x^*)$, $D=D_0I$, stiffnesses $\lambda_k$, widths
$w_k^2=1/\lambda_k$, relaxation times $t_k=1/(D_0\lambda_k)$ (`theory/25-...` §2).

- **Lemma 1 (saturation)**: $\Sigma_\tau=H^{-1}(I-e^{-2D_0H\tau})$ (conditional covariance) and the
  project's unconditional half-step covariance $\Sigma^{\rm step}_\tau=H^{-1}(I-e^{-D_0H\tau})=\Sigma_{\tau/2}$,
  per mode $\Sigma^{\rm step}_{\tau,k}=w_k^2(1-e^{-\tau/t_k})$.
- **The dial**: $G_\tau=(\Sigma^{\rm step}_\tau)^{-1}$ has eigenvalues $\lambda_k/(1-e^{-\tau/t_k})\approx\max(\lambda_k,1/(D_0\tau))$:
  τ ≪ all $t_k$ → $\approx I/(D_0\tau)$ (flat); $t_{\rm fast}\ll\tau\ll t_{\rm slow}$ → within-basin
  thermal metric with soft scale $\gamma=1/(D_0\tau)$; τ ≫ all $t_k$ → $H=\Sigma_\pi^{-1}$ (global
  whitening). "The soft scale γ of the spring metric is the lag in disguise."
- **Proposition 2 (erasure order)**: VP noise with metric $N=\Sigma_\tau^{-1}$,
  $x_t=\alpha_tx_0+\sigma_tN^{-1/2}\varepsilon$, gives per mode
  $$\mathrm{SNR}_k=\frac{\alpha_t^2}{\sigma_t^2(1-e^{-2\tau/t_k})},\qquad\text{half erasure at}\quad \frac{\sigma_t^2}{\alpha_t^2}=\frac{1}{1-e^{-2\tau/t_k}}\ \ (\ge1),$$
  ≈ 1 for $t_k\ll\tau$ and ≈ $t_k/(2\tau)$ for $t_k\gg\tau$; for the step metric replace 2τ by τ.
  Flat noise half-erases at $\sigma_t^2=w_k^2$ (spread κ(H)); thermal noise $N=\beta H$ at 1 for every mode.
- **Measured saturation fraction** (§3): $f_k(\tau)=\tfrac12\mathrm{Var}(q_{t+\tau}-q_t)/\mathrm{Var}_{\rm eq}(q)$;
  $1/f_k$ is mode k's half-erasure level under $G_\tau$-shaped noise.
- **Predictability Fisher metric** (§0, item 1): $F_\tau=J_\tau^\top\Sigma_\tau^{-1}J_\tau$+remainder,
  eigenvalues $\lambda_k/(e^{2\tau/t_k}-1)$ in a linear basin — it *forgets* stiff modes.
- **What no metric buys** (§6.1): Cramér–Rao for a basin weight from position data,
  $\mathrm{Var}(\hat w)\ge w(1-w)/n_{\rm visits}$; each 250 ns ALDP trajectory holds 37 independent
  αL visits.

### 2.5 Spring feature space and its soft scale

$F(u)=\big(\sqrt{w_e}(d_e-d^0_e),\ \sqrt\gamma\,u\big)$: variance-weighted distances (bonds and
1–3 pairs, each divided by its thermal width) plus γ-scaled aligned slice
(`investigations/spring-soft-scale-sweep.md` §Purpose). Sprint 12 form (BBA Helmert
background, `candidates/trajectory-springs.md`): $\varphi(u)=(D^{-1}d(u),\sqrt\gamma\,u)/c$ with
$D=\mathrm{diag}(\sqrt{v_e})$, scalar RMS divisor c, and
$$G=c^{-2}\big(J_d^\top D^{-2}J_d+\gamma I\big)\succeq\gamma c^{-2}I .$$
The torsions' across-basin swing of ≈0.7 Å is $0.7\sqrt\gamma$ bond widths long: 3.8 (γ = 30),
2.0 (γ = 8), 1.0 (γ = 2).

### 2.6 Gaussianizing maps and Gaussianity diagnostics

- **Marginal Gaussianization of a torsion** (`investigations/torsion-gaussianization.md`):
  cut the circle at its least-populated angle, smooth the histogram (5° kernel), build a
  720-knot CDF $F$, mix with a uniform share $\epsilon$ (1% or 0.1%), clip to $[10^{-5},1-10^{-5}]$,
  apply $\Phi^{-1}$: $\theta\mapsto\Phi^{-1}\big((1-\epsilon)F(\theta)+\epsilon\,U(\theta)\big)$. The control
  is the linear map $(\theta-\bar\theta)/\mathrm{sd}(\theta)$. Inverse by table lookup; bond angles
  from distances by the law of cosines.
- **Diagnostics** (spring sweep §"What the 100 ps warp does"): per principal axis, KL of the
  1-D histogram from a fitted Gaussian; **Sarle's bimodality coefficient** $(\text{skew}^2+1)/\text{kurtosis}$
  (0.33 for a Gaussian, >0.555 suggests two modes).

### 2.7 Forces from feature-space models; finite-noise smoothing

- **Force extraction from the bead model** (`bead-force-field-simulation.md` §Purpose): score in
  physical y units $s_y=\alpha(t)(-\hat\epsilon/\sigma(t))/\text{scale}$; force on slice coordinates
  $g=s_y$ (flat slice), $g=D\varphi^\top s_y+\nabla\log|\det D\varphi|$ (warps),
  $g=DF^\top s_y+\tfrac12\nabla\log\det(DF^\top DF)$ (spring immersion). Extraction time chosen by
  minimizing the mean |log ratio| of the Stein check on training frames.
- **Executed BBA force scalar** (`investigations/bba-simulation-diagnosis.md`):
  $\ell_t(x)=-\tfrac12\|\alpha(t)y(x)\|^2-\frac{\alpha(t)}{\sigma(t)}H_\theta(\alpha(t)y(x),t)+\log J_\phi(x)$,
  $F_t=\nabla_x\ell_t$; equivalently (`bba-force-learning-assessment.md`)
  $F_{\theta,t}=-\frac{\alpha_t}{\sigma_t}B^\top\epsilon_\theta(\alpha_ty,t)+\nabla_x\log J_\phi$, $B=Dy$; error
  $\delta F=-\frac{\alpha_t}{\sigma_t}B^\top\delta\epsilon$ (normal errors annihilated, tangent errors
  weighted by $(\alpha/\sigma)S_i$).
- **Finite-noise smoothing** (assessment §"Even a perfect ambient score has a finite-noise
  bias"): with $\tau=\sigma/\alpha$,
  $\ell_t(x)=\log\int\rho(x')\exp\!\big[-\|y(x)-y(x')\|^2/(2\tau^2)\big]d\mu(x')+\log J_\phi(x)$ — smoothing
  by feature-space chords; Laplace on an injective regular patch gives
  $q_t(\alpha_ty(x))J_\phi(x)\sim\alpha_t^{-d}(2\pi\sigma_t^2)^{-(M-d)/2}\rho(x)$ as τ → 0.
- **Empirical-kernel teacher** (`bba-kernel-force-diagnostic.md`): weights
  $w_i\propto\exp[-\|y(x)-y_i\|^2/(2\tau^2)]$, $\epsilon_{\rm bank}=(y(x)-\sum_iw_iy_i)/\tau$,
  $F_{\rm bank}=-\tau^{-1}B^\top\epsilon_{\rm bank}+\nabla_x\log J_\phi$, $N_{\rm eff}=(\sum_iw_i^2)^{-1}$.
- **Rotation-quotient volume** (same file): $d\mu\propto\sqrt{\det I_x}\,dV_h$,
  $J_\phi=dV_g/d\mu\propto\sqrt{\det(h^{-1}g)}/\sqrt{\det I_x}$ on the 78 directions perpendicular to rigid
  motions; the full Cartesian log-determinant (three zero directions) gave gradients of order
  $10^{13}$ (`sprint11-pullback-campaign-closeout.md`).

### 2.8 Learned-embedding objectives and their failure modes

(`investigations/learned-embedding-objectives.md`; theory note 24.)

- **Local-moment loss**: $\ell(g;\Sigma)=[\mathrm{tr}(g\Sigma)-\log\det g]/d$, unrestricted optimum
  $g=\Sigma^{-1}$ (note 24; $\mathrm{tr}(guu^\top)=u^\top gu=\|g^{1/2}u\|^2$). Embedding version:
  $\mathrm{tr}(HS)/(4c^2)-\tfrac12\log\det H$ (H the pullback metric, S the local second moment).
- **Bond-turning artifact** (line 6): bond vector b, length L, finite displacement δb, true
  length change d:
  $$d=r+t,\qquad r=(b/L)\cdot\delta b\ \ (\text{linear radial}),\qquad t=\frac{\|\delta b\|^2-d^2}{2L}\ge0 .$$
  A pure turn by θ has d = 0 but $r=L(\cos\theta-1)<0$: linearized chords show false compression.
  (Derived here: from $|b+\delta b|^2=(L+d)^2$.)
- **Bond correction** (#1002): transport donor displacement v to the anchor, then
  $v_c=v+A^+(\Delta\ell-Av)$, $A=D\ell(x)Q_x$, then center. Correct-before-transport leaves
  2.4–2.9× inflation; correct-after-transport gives exact bond-change variances.
- **Normalization reversal** (line 8, #1011): with mean score $T+V$,
  $T=E[\mathrm{tr}(HC)]/(4c^2)$, $V=-E[\log\det H]/2$ and 78 shape directions, dividing features by
  the diffusion RMS r gives $T/r^2+V+78\log r$; best uniform rescale $s^2=39/T$ (derived here:
  $\partial_r(T/r^2+78\log r)=0\Rightarrow r^2=T/39$).
- **Equilibrium-conditioned objective** (#1016): in an affine harmonic basin it identifies
  $H=c^2(B+\tau^{-2}I-R^{-2}I)$ (equilibrium stiffness plus a known corruption offset); not
  identifiable beyond that case.
- **Denoiser bottleneck** (#999): a linear output layer from 256 hidden units to 3,303
  outputs can predict at most 256 noise directions ⇒ expected loss ≥ 3,303 − 256 = 3,047
  (observed ≈3,083).

### 2.9 Covariance-aware prediction (`investigations/covariance-aware-prediction.md`)

$z_t=\alpha_tz_0+\sigma_t\epsilon$, $V_t=\alpha_t^2C+\sigma_t^2I$; inputs $u_t=V_t^{-1/2}(z_t-\alpha_t\mu)$;
predictor $\hat\epsilon_\theta=\sigma_tV_t^{-1}(z_t-\alpha_t\mu)+r_\theta(u_t,t)$ (the affine term is the
optimal linear-plus-offset noise predictor; the conditional mean for Gaussian features). Residual
covariance $b=\sigma V^{-1}(z-\alpha\mu)$, $e=\epsilon-b$, $\mathrm{Cov}(e)=I-\sigma^2V^{-1}=\alpha^2CV^{-1}=:R$;
output-scaled variant $b+R^{1/2}r_\theta$. For $C=I$ the analytic term is $\sigma z$ (flat limit).

### 2.10 Estimator-level identities of the objective search

(`objective-search-synthesis.md`; `diffusion-time-sampling.md`; `rao-blackwell-dsm-857.md`.)

- **Gradient covariance is reference-independent**: with $f=b+u_\theta$, $g=2J^\top(f-\epsilon)$,
  $\mathrm{Cov}(g\mid V)=4J^\top\mathrm{Cov}(\epsilon\mid V)J$, independent of b.
- **Rao–Blackwell (posterior-averaged) target**, finite source $z_i$:
  $p_t(y)=\frac1N\sum_iN(y;\alpha_tz_i,\sigma_t^2I)$, $w_i\propto\exp[-\|y-\alpha_tz_i\|^2/(2\sigma_t^2)]$,
  $\bar\epsilon(y,t)=\sum_iw_i(y-\alpha_tz_i)/\sigma_t$, $\nabla_y\log p_t=-\bar\epsilon/\sigma_t$; replacing
  ε by $\bar\epsilon$ removes gradient covariance $4A^\top\mathrm{Cov}(\epsilon\mid y,t)A$ without changing
  the expected objective.
- **Clean-dependent weights move the optimum**: input-only weights $W(Y,t)$ keep $m_t$; a weight
  depending on the clean molecule gives $E[W\mid y]^{-1}E[W\epsilon\mid y]$ (scalar two-state example:
  $-\alpha/(3\sigma)$ instead of 0 at y = 0).
- **Lower variance ≠ faster learning**: quadratic loss with Hessian H, update $-\eta A\hat g$:
  $$E\,F(\theta-\eta A\hat g)=F(\theta)-\eta\mu^\top A\mu+\tfrac{\eta^2}{2}\mu^\top AHA\mu+\tfrac{\eta^2}{2}\mathrm{tr}(AHA\,C);$$
  what matters is curvature-weighted covariance (2-D example in PR1037: trace 4.25 → 2 while the
  expected next loss rises by $36\eta^2$).
- **Likelihood weighting** samples t with density ∝ $\beta(t)/\sigma(t)^2$ (≈25% of times below
  t = 0.1 instead of 9%); **stratification** gains $B_N/N$ (covariance of conditional mean
  gradients across N strata; zero at a Bayes denoiser); **importance sampling** optimum
  $r^*(t)\propto p(t)\sqrt{M(t)}$, $M(t)=E[\|g\|^2\mid t]$; after unit clipping $\mathrm{tr}\,\mathrm{Cov}=1-\|E\,C\|^2$.
- **Reverse-KL bound** (Song et al. 2021, under unverified global assumptions):
  $\mathrm{KL}(p_d\|p_{\theta,d})\le\mathrm{KL}(p_T\|\pi)+\tfrac12\int_d^T\frac{\beta(t)}{\sigma(t)^2}E\|f_\theta-m_t\|^2dt$.

### 2.11 Energy-head identities (`energy-head-and-auxiliary-objectives.md`)

- Frozen backbone: $f_w(y,t)=\sigma_ty+B(y,t)w$, $B=\alpha_t(D_yh)^\top$ (exact, stays conservative).
- Regularized spectral step $\Delta=-\sum_j\frac{u_j^\top g}{\lambda_j+\tau}u_j$ with descent certificate
  $L(w_0+\Delta)-L(w_0)=-\sum_j\frac{\lambda_j+2\tau}{(\lambda_j+\tau)^2}(u_j^\top g)^2\le0$.
- Held-out change $R_{\rm new}-R_{\rm old}=2\,\mathrm{mean}(r^\top d)+\mathrm{mean}(\|d\|^2)$ (good direction,
  overshooting step). Calibrated step $s^*=\mathrm{clip}(-b/A,0,1)$ for $Q(s)=C+2bs+As^2$.
- Potential-difference loss $L_P=E[(\delta(Y)-\delta(Y'))^2]=2\mathrm{Var}(\delta)$, $\delta=U_\theta-U^*$,
  teacher $U^*=-\sigma_t\log p_{\rm emp,t}$ (added Hessian $4\mathrm{Cov}(f)$ for affine potentials).
- Conditional phase NCE Bayes log-odds
  $G_*=\log p_t(y)-\log p_t(v)+\log q_{j,t}(v_j)-\log q_{j,t}(y_j)$; curvature weight $s(G)s(-G)$ →
  four-state example $e(1-e)/2$ for intermediate mass e.

### 2.12 Internal coordinates (machinery inherited from Sprint 10 and used by Sprint 12)

- **Open-chain coordinates** (`design/internal-chain-noising.md`, #529, Sprint 10):
  $a_i=\log(r_i/\ell)$, $b_j=\log\tan(\theta_j/2)$, $u=(a,b,\phi)\in\mathbb R^{2N-3}\times\mathbb T^{N-3}$ (ℓ = 1 Å);
  N−1 lengths + N−2 angles + N−3 torsions = 3N−6.
- **Physical volume**: $d\mu\propto(\prod_ir_i^2)(\prod_j\sin\theta_j)\,dr\,d\theta\,d\phi$, hence
  $m(u)=d\mu/du\propto\prod_ir_i^3\prod_j\sin^2\theta_j$, $d\log m=(3\mathbf 1,\,2\cos\theta,\,0)$. Coordinate
  score $\beta=\alpha+d\log m$ (α = physical covector); covector/force conversion
  $\alpha_u=(BB^\top)^{-1}Bf$, $f=B^\top\alpha_u$ with $B=du/dX$.
- **OU law** (`design/internal-chain-ou.md`): $dq_i=-\kappa_i(q_i-c_i)dt+\sqrt{2\kappa_iv_i}dW_i$,
  $d\phi_j=\sqrt{d_j}dW_j$ (mod 2π); $q_{t,i}\mid q_{0,i}\sim N(c_i+A_i(q_{0,i}-c_i),v_i(1-A_i^2))$, $A_i=e^{-\kappa_it}$;
  $\phi_{t,j}\sim\mathrm{WN}(\phi_{0,j},d_jt)$. Terminal bound
  $\mathrm{KL}(p_T\|\pi)\le\tfrac12\sum_i[r_i(M_i-1)-\log(1-r_i)]+\sum_j\log(1+2\sum_{n\ge1}e^{-n^2d_jT})$,
  $r_i=A_i^2$, $M_i=E[(q_{0i}-c_i)^2/v_i]$.
- **Force-target variances** (one stationary Gaussian coordinate):
  $\mathrm{Var}(T_F\mid Y)=\frac{1-A^2}{A^2v}$, $\mathrm{Var}(T_N\mid Y)=\frac{A^2}{(1-A^2)v}$, $\mathrm{Cov}=-1/v$; the blend
  $A^2T_F+(1-A^2)T_N$ has zero conditional variance. Harmonic bond near $r_0$: $v_a=1/(\beta_{th}kr_0^2)$,
  center $a_0+3v_a$; angle precision $\sin^2\theta_0(\beta_{th}k_\theta+2)$.
- **Sprint 12 `internal` map** (`candidates/internal.md`): 2N−3 stiff coordinates (log lengths,
  log-tan-half angles) jointly whitened $L^{-1}(q-\bar q)$ with $C=LL^\top$; torsions as
  (cos, sin) pairs with one phase scale; $4N-9$ channels (11 ALDP5, 103 BBA).
- **Smooth chain continuation for distance inputs** (`global-geometry-study.md`): $C=-\tanh b$,
  $S=\mathrm{sech}\,b$ (derived here: from $\tan(\theta/2)=e^b$), noisy phases (c, s) unnormalized;
  frame recursion by
  $$M(C,S,c,s)=\begin{pmatrix}-C&-S&0\\ Sc&-Cc&-s\\ Ss&-Cs&c\end{pmatrix}.$$
  C3's fix: normalize each noisy phase pair as $p/\max(|p|,0.05)$ before rebuilding
  (`bba-local-geometry-preconditioning.md` §4).
- **Automatic references** (`design/automatic-internal-coordinates.md`): historical maximum-sine
  rule vs `chemical_local` default (bonded parent/grandparent/great-grandparent path first, then
  other bonded paths, bonded angle + geometric torsion, then any regular pair; within a tier
  maximize the smaller defining sine).

### 2.13 Factorized densities and conditional completion

- **Factorization** (note 28 §6): assume $p_q(s,r)=p_s(s)\,N(r;\mu(s),L(s)L(s)^\top)$; with
  $z=L(s)^{-1}(r-\mu(s))$ the law is $p_s(s)N(z;0,I)$, so VP noise keeps $z$ standard normal and the
  score is $-z$ at every time: the network only learns the soft density.
- **Score transport** under an invertible map T:
  $s_T(T(q))=DT(q)^{-\top}[s_q(q)-\nabla_q\log|\det DT(q)|]$.
- **Thermal Cartesian lift** (#956): stiff coordinates replaced by $a+cL(s)^{-1}[r-\mu(s)]$, c = 0.3.

### 2.14 Readability, resolution and the five conditions (#1025, #1026; notes 27–28)

- **Recoverable fraction of a Gaussian mode** (`candidates/theory-and-evidence.md`):
  $E[Z\mid Y]=\alpha C(\alpha^2C+\sigma^2I)^{-1}Y$; per eigenmode of variance λ,
  $$r(\lambda,t)=\frac{\alpha_t^2\lambda}{\alpha_t^2\lambda+\sigma_t^2}.$$
- **Half-erasure time** of a linear mode under the project's schedule (range-and-order §3,
  note 27): $t_{\rm half}(\lambda)=\big(-0.1+\sqrt{0.01+39.8\log(1+\lambda)}\big)/19.9$, $t_{\rm half}(1)=0.259$
  (derived here: $r=\tfrac12\iff\alpha^2=1/(1+\lambda)\iff B(t)=\log(1+\lambda)$).
- **Predictable fraction of the label** (note 28 §2): $\mathrm{Var}(\epsilon^*)=\tau^2/(\lambda+\tau^2)$,
  $\tau=\sigma/\alpha$; required residual slope with the Gaussian skip $\nabla H^*(y)=\tau(1-\lambda)y/(\lambda+\tau^2)$,
  peaking at $\tau=\sqrt\lambda$ with coefficient $(1-\lambda)/(2\sqrt\lambda)$.
- **Resolution noise** (#1025): small isotropic feature noise σ produces uncertainty $\sigma c_q$ in
  observable q with $c_q=\sqrt{\nabla q^\top G^+\nabla q}$; $\sigma^*(q)=\mathrm{sd}(q)/c_q$. Report
  $\sigma^*/\sigma(t_{\min})$ (≤1: never resolved in training). Note 28 §7 writes the local noise
  scale as $(\sigma/\alpha)\sqrt{\nabla q^\top g^+\nabla q}$; a scalar rescaling changes resolution without
  changing the condition number of g.
- **Placement law** (#1025): for an equal-dimension map normalized to unit mean channel variance,
  the least-resolved mode has $\min_ks_k\le1/\sqrt{\langle R^2\rangle}$, $R_k$ = population-to-thermal
  width ratio. (Derived here: if mode k has thermal width $s_k$ in feature units, its population
  variance is $s_k^2R_k^2$; unit mean variance ⇒ $\frac1d\sum_ks_k^2R_k^2=1\ge\min_ks_k^2\langle R^2\rangle$.)
- **Redundant coordinates** (note 28 §4): clean law standard Gaussian on a flat d-subspace of
  $\mathbb R^M$, zero normal variance, $y=y_T+y_N$:
  $$\epsilon^*=\sigma_ty_T+y_N/\sigma_t,\qquad\nabla H^*=\frac{\alpha_t}{\sigma_t}y_N,$$
  normal score Hessian $-I_N/\sigma_t^2$; the Gaussian skip alone has excess loss $\alpha_t^4(M-d)$
  (derived check: $\sigma y_N-y_N/\sigma=-\alpha^2y_N/\sigma$ and $E|y_N|^2=\sigma^2(M-d)$). "Redundancy does not
  remove stiffness, it converts finite tangent stiffness into diverging normal stiffness."
- **Five conditions** (`bba-local-geometry-preconditioning.md` §2): resolution above the floor
  (σ*_thermal ≫ σ(t_min), ×10 as working margin); balance including collective motion; placement
  law; prior matching; readable inputs (redundant physical features belong in the *input*, not the
  noised state).

### 2.15 Analytic score bases

- **Reference-spring base** (#1025, §3): $H_{\rm ref}=(\sigma/\alpha)\sum_b\tfrac12c_b(\delta_b-\alpha m_b)^2$,
  $c_b=\max\big(1/(\alpha^2v_b+2\sigma^2)-\tfrac12,0\big)$ over 27 bonds (thermal variance $v_b$) and 26 one–three
  pairs (population variance). Interpretation (derived here): under the unit-Gaussian base a pair
  difference of noisy features has variance 2; the data's has $\alpha^2v_b+2\sigma^2$; $c_b$ is the missing
  precision, and the $(\sigma/\alpha)$ prefactor converts a score term into the residual energy of
  $\hat\epsilon=\sigma y+\alpha\nabla H$.
- **Covariance-matched Gaussian base** (#1033, `candidates/cartesian-covariance-base.md`):
  $K=\langle xx^\top\rangle/3$ (per-frame centered bead second moment, averaged over frames and x, y, z),
  $K_f=H^\top KH/s^2$, $S_t=\alpha^2K_f\otimes I_3+\sigma^2I$,
  $$H_{\rm gauss}=\frac{\sigma}{2\alpha}\,y^\top(S_t^{-1}-I)\,y\ \Rightarrow\ \hat\epsilon_{\rm untrained}=\sigma S_t^{-1}y ,$$
  the exact posterior-mean noise for Gaussian data with that covariance at every noise level; in
  eigenmodes $\tfrac12\sum\sigma\alpha(1-\kappa)/(\alpha^2\kappa+\sigma^2)|z|^2$, vanishing for $K_f=I$ and at α = 0.

### 2.16 Global shape is a long-range sum

For N equal beads with bond vectors $b_a$ (`objective-search-synthesis.md`):
$$R_g^2=\frac1{N^2}\sum_{i<j}\|x_i-x_j\|^2=\sum_{a,b=1}^{N-1}\frac{\min(a,b)\,[N-\max(a,b)]}{N^2}\;b_a\cdot b_b .$$
(Verified numerically here on a random 28-bead chain: all three forms agree to 10⁻¹³.) The
Sprint 12 diagnostic protocol uses weights $W_{ij}=(\min(i,j)+1)(N-1-\max(i,j))/N^2$ with 0-based
bond indices, summed in separation groups 0, 1, 2–4, 5–9, 10–N−2, so that the group sum equals
the difference in mean $R_g^2$ (`global-geometry-study.md`). Size is set by cross terms between
distant bond directions, which local marginals do not constrain.

---

## 3. Worked analytical examples

Each example is self-contained enough to be computed exactly for an animation. Numbers
marked "(derived here)" were computed by me with numpy/scipy (scripts in the scratchpad
folder `r4checks/`); all others are quoted from the named source.

**E1. One Gaussian mode under the project's VP schedule (the "readable window").**
Setup: clean feature $Z\sim N(0,\lambda)$, $Y=\alpha_tZ+\sigma_t\epsilon$, $B(t)=0.1t+9.95t^2$.
Closed form: recoverable variance fraction $r(\lambda,t)=\alpha^2\lambda/(\alpha^2\lambda+\sigma^2)$; half erased at
$t_{\rm half}(\lambda)=(-0.1+\sqrt{0.01+39.8\log(1+\lambda)})/19.9$ (range-and-order §3; note 27).
Schedule values (derived here):

| t | $\alpha_t$ | $\sigma_t$ | $\sigma_t/\alpha_t$ | $1/\sigma_t^2$ |
|---|---:|---:|---:|---:|
| 10⁻⁵ | 0.999999 | 0.001000 | 0.001000 | 999,006 |
| 3×10⁻⁵ | 0.999998 | 0.001735 | 0.001735 | 332,342 |
| 10⁻⁴ | 0.999995 | 0.003178 | 0.003178 | 99,015 (α/σ = 314.7) |
| 10⁻³ | 0.999945 | 0.010485 | 0.010486 | 9,096 |
| 0.01 | 0.999003 | 0.044643 | 0.044688 | 501.8 |
| 0.05 | 0.985174 | 0.171561 | 0.174143 | 34.0 |
| 0.1 | 0.946722 | 0.322053 | 0.340177 | 9.6 |
| 0.3 | 0.629550 | 0.776960 | 1.234151 | 1.7 |
| 1 | 0.006572 | 0.999978 | 152.2 | 1.0 |

$t_{\rm half}$ (derived here): λ = 0.01 → 0.0270; λ = 0.1 → 0.0930; λ = 1 → **0.259** (source value);
λ = 10 → 0.486; λ = 100 → 0.676. Source: on BBA the mode variances span a factor 1,423, half
erased between t = 0.53 and 0.028; whitening collapses all to 0.26. Training covers t ∈ [0.01, 1]
for maps (Cartesian [10⁻⁵, 1]). The source's matching σ values: σ(t_min = 0.01) = 0.045 (#1025);
note 28 quotes 1/σ² ≈ 502 at t = 0.01 and 332,342 at 3×10⁻⁵.

**E2. The lag dial in a four-mode basin (note 25 §2) and on ALDP5 (§3).**
Setup: λ = (1600, 400, 25, 4) Å⁻², $D_0$ = 0.08 Å²/ps ⇒ $t_k=1/(D_0\lambda_k)$ = (0.0078, 0.031, 0.5, 3.1) ps.
At τ = 1 ps half-erasure levels $1/(1-e^{-2\tau/t_k})$ = (1, 1, 1.02, 2.12): spread 2.1 against 400 under flat
noise (derived check: 1, 1, 1.0187, 2.1155; with the step metric's τ instead of 2τ: 1, 1, 1.157, 3.652).
ALDP5 measured saturation fractions $f(\tau)$ and implied half-erasure levels 1/f (derived here):

| τ | bonds | angles | φ (start φ<0) | ψ (global) | 1/f for φ | 1/f for ψ |
|---|---|---|---|---|---:|---:|
| 1 ps | 0.91–1.03 | 0.89–0.98 | 0.43 | 0.052 | 2.33 | 19.2 |
| 10 ps | 1.00 | 0.93–0.99 | 0.97 | 0.16 | 1.03 | 6.25 |
| 100 ps | 1.00 | 0.97–0.99 | 1.03 | 0.66 | ≈1 | 1.52 |

These are the lag sweep's pre-registered predictions (ψ ≈ 19 / 6 / 1.5; φ ≈ 2.3 / 1.06 / 1.0). Step
widths at the fit lag (`learned-warp-lag-sweep.md`): bonds 0.024–0.031 Å at every lag; φ 20.3° →
30.7° → 31.8°; ψ 17.9° → 31.7° → 63.4° (equilibrium ψ: 50–52° within αR or β, 78° overall).

**E3. Bond turning masquerades as compression (learned-embedding objectives, line 6).**
Setup: bond of length L turns by θ without stretching. Linear radial chord component
$r=L(\cos\theta-1)$ while the true length change is 0 (exact: $d=r+t$, $t=(\|\delta b\|^2-d^2)/(2L)$).
Numbers (derived here, L = 1.45 Å as a typical ALDP5 backbone bond — an assumption): θ = 7.5°
→ r = −0.0124 Å; 10° → −0.0220 Å; 16° → −0.0562 Å, against 1 ps bond step widths of 0.024–0.031 Å
(the source's measured per-bond RMS turning is 7.5–16° within 1 ps). For BBA C-alpha "bonds"
(L = 3.83 Å): 10° → −0.058 Å; 20° → −0.231 Å; 38° → −0.812 Å (bond s.d. 0.05759 Å). Measured: on BBA,
held-out linearized bond changes average 7.57 reference units versus 1.01 actual (#1006); RMS
0.83 vs 0.081 Å (#999); the turning term cancels the radial term with correlation −0.984; ALDP5
end-bond variances were 8.1× and 7.4× too large before correction; BBA pooled bond fluctuation
0.546 Å uncorrected vs 0.080 Å actual (6.8×).

**E4. Why the training loss hides stiff-mode progress (`learned-stiffness-diffusion-pilot.md`).**
Setup: stiff direction modeled as Gaussian of normalized width w; a model that learned width
$rw$ pays the excess loss
$$\sigma^2(\alpha^2w^2+\sigma^2)\Big(\frac{1}{\alpha^2r^2w^2+\sigma^2}-\frac{1}{\alpha^2w^2+\sigma^2}\Big)^2,$$
which vanishes for σ ≫ w and σ ≪ w. With t ~ U[10⁻⁵, 1] and seven stiff widths 0.07–0.24 (source
table): r = 1.23 → 0.0093; 1.085 → 0.0014; 1.05 → 0.0005; 1.01 → 0.00002, on a total loss ≈1.0 with
minibatch scatter 0.02–0.07. Reproduction check (derived here, assuming seven geometrically
spaced widths 0.07–0.24): 0.0098 / 0.0015 / 0.00055 / 0.000023; share of training times with σ
within a factor 3 of 0.07: 5.9% (source "about 6%"); share with σ/α < 0.07: 1.8% (source: bonds
resolved "in about 1.7% of its training times").

**E5. The production noise floor narrows bonds (same pilot).** Measured: σ_min = 0.042 Å (above
the 0.025–0.031 Å bond widths) ⇒ flat bond widths 0.49–0.58 of the reference; σ_min = 0.012 Å ⇒
0.85–0.90; learned coordinates (floor 0.074c) 0.99–1.03. Idealized explanation (derived here, use
qualitatively only): if the last step returns the exact posterior mean of a Gaussian bond of
width w seen through noise of size $\sqrt{k}\,\sigma_{\min}$, the generated/true width ratio is
$w/\sqrt{w^2+k\sigma_{\min}^2}$. With k = 1: 0.51–0.59 (0.042 Å) and 0.90–0.93 (0.012 Å); with k = 2 (a bond is a
difference of two atoms): 0.39–0.46 and 0.83–0.88. The measurement lies between; the trained model
does not apply exact posterior shrinkage, so do not present this formula as a fit.

**E6. Spring channels below the floor (#1025; note 28 §2).** One global RMS divisor 27.12 on BBA
(1.31 on ALDP5) gives each spring channel variance $\lambda=1/27.12^2$, s.d. 0.037 < σ(t_min) = 0.045.
Required residual slope peaks at $\tau=\sqrt\lambda=0.0369$ with coefficient $(1-\lambda)/(2\sqrt\lambda)\approx13.5$
(derived: 13.54). The channel's half-erasure time is $t_{\rm half}(0.00136)=0.0077<0.01$ (derived here):
the bond channel is erased below the lowest trained noise level.

**E7. Redundant coordinates create diverging normal stiffness (note 28 §4).** Flat
d-dimensional image in $\mathbb R^M$, standard Gaussian on it, zero normal variance:
$\nabla H^*=(\alpha/\sigma)y_N$; the normal stiffness α/σ is 22.4 at t = 0.01 and 999.5 at t = 10⁻⁵
(derived here); 1/σ² rises from ≈502 to 332,342 when the floor is lowered from 0.01 to 3×10⁻⁵.
Skip-only excess loss $\alpha^4(M-d)$. BBA whitening: M = 3,303, d = 78 ⇒ 3,225 normal directions;
measured tangent share of the untrained loss below t = 0.1: 0.06 (Cartesian 1.00, internal 0.75).

**E8. Equal metric, different denoising: line vs helix (note 28 §3).** $x\sim N(0,1)$;
$\Phi_0(x)=(x,0,0)$ versus $\Phi_\omega(x)=(\frac{\sqrt{1-b^2}}{\omega}\cos\omega x,\frac{\sqrt{1-b^2}}{\omega}\sin\omega x,bx)$, all with
$\|\Phi'\|=1$ (same pullback metric, same rank). With b = 0.1, ω = 4 or 16, σ = 0.1: posterior
variance of x is 0.01 for the line and ≈0.50 for the helices. Reproduced here (grid posterior,
400 draws): 0.0099 (line), 0.496 (ω = 4), 0.500 (ω = 16).

**E9. Short-lag increments whiten diffusion, not stiffness (note 28 §5).**
$dx_i=-\kappa_ix_i\,dt+\sqrt2\,dW_i$: $\mathrm{Var}(x_i)=1/\kappa_i$, but $\tfrac12E[(x_i(t+\Delta)-x_i(t))^2]=(1-e^{-\kappa_i\Delta})/\kappa_i\to\Delta$.
Stiffnesses 1 and 100 at Δ = 10⁻⁴: increment covariance condition 1.005, equilibrium-variance
condition (after increment whitening) 99.5 (derived check: increment ratio 1.00496; 100/1.005 = 99.5).

**E10. Chain collapse under an isotropic Gaussian base (#1025).** 28-bead chain, bonds and angles
frozen at their means, torsions free, weighted by the unit-Gaussian base on Helmert features
(per-coordinate s.d. s). Source Monte Carlo: training data Rg 10.59 ± 2.20 Å; free torsions
10.34 ± 2.26; isotropic Gaussian as used 5.41 ± 0.51; Gaussian with rotation-averaged covariance
$K\otimes I_3$ 10.71 ± 1.92. Toy reproduction (derived here: bond 3.8 Å, all angles 105°, s = 6.25 Å,
Metropolis on the 25 torsions, 60,000 steps): free torsions 10.0 ± 2.2 Å; isotropic Gaussian weight
5.35 ± 0.50 Å. A free isotropic cloud with the same s has $E[R_g^2]=3s^2(N-1)/N$ ⇒ 10.63 Å (MC 10.58 ±
0.83): the base matched the size of a *free* cloud, and once 53 of its 81 directions are frozen the
25 torsions cannot resist its pull to the centre. Untrained spring-base model: bonds 3.85 ± 0.07 Å
(data 3.83) but mean Rg 4.9 Å (data 10.6).

**E11. Size lives in long-range bond-pair terms (§2.16).** Identity verified here. Measured
shares: bead pairs ≥ 11 apart carry 92% of internal-coordinate excess mean squared Rg (#1015);
pairs ≥ 6 apart carry 89–99% in the cylinder models (#1023); 72–78% of the angular-tree
references' added extension came from pairs ≥ 11 apart (#1061); ≈90% of C3's excess is the distance
between the N-terminal hairpin (beads 0–12) and the rest (#1055).

**E12. What the force panel at t = 0.05 measures (bba-simulation-diagnosis; #1025).**
σ/α = 0.174143 at t = 0.05 (derived; source 0.17414). Smoothing per orthonormal centered coordinate =
(σ/α) × scale: 0.7205 Å for the PR895-era Cartesian scale 4.13724 Å (relative bond component
1.019 Å vs bond s.d. 0.05759 Å); 1.088 Å for the Sprint 12 scale 6.25 Å (source "1.09 Å"); 0.164 Å for
the ALDP5 scale 0.9418 Å (source "0.16 Å"), but ≈0.01 Å along a BBA bond in internal coordinates. At
t = 10⁻⁴, α/σ ≈ 315 (source "≈316") multiplies the network's output while only 0.01% of training
examples have t ≤ 10⁻⁴. Cartesian BBA bonds are readable only below t ≈ 4.1×10⁻⁴ (derived here:
(σ/α)·6.25·√2 = 0.0576 Å; source "t < 4×10⁻⁴").

**E13. Perfect predictor, near-zero gain (bba-force-learning-assessment).** Standard-normal X,
VP channel: perfect predictor σz, MSE per coordinate α², score −z. At α = 0.99: optimal MSE 0.9801,
close to the zero-prediction loss 1.

**E14. Large cancellation is not an error (same file).** y = aX, X standard normal; exactly smoothed
restricted force $-\alpha^2a^2x/(\alpha^2a^2+\sigma^2)$. α = 0.99, a = 100, x = 0.7: fixed Gaussian term −6860.7,
exact residual +6860.0000014, total −0.6999986.

**E15. Clean-dependent weights bias the optimum (same file).** X, ε independent standard normal,
Z = X + ε: E[X | Z = 0] = 0, but weighting by $e^{cX}$ shifts the regression optimum to c/2 (derived
check: posterior N(0, ½) tilted by $e^{cx}$ has mean c/2).

**E16. Normal components cannot be discarded (configuration-vector pilot).** F(q) = (q, 0), q
standard Gaussian: exact ambient marginal score $(-y_1,-y_2/\sigma^2)$; a tangent-only field cannot
represent the second component.

**E17. Local dimension of a two-soft-direction cloud (thermal submanifold).** Two directions of
spread L, seven of spread s: $PR=(2L^2+7s^2)^2/(2L^4+7s^4)$ = 9.0 (s = L), 3.4 (0.3L), 2.1 (0.1L), 2.0 (0.05L);
isotropic 9-D samples give median PR ≈ $9n/(n+9)$ (6.0 at n = 20, 8.2 at 100, 8.8 at 500).

**E18. Headroom under any linear map (placement law, #1025).** ⟨R²⟩ = 2.8 (ALDP5) vs 10.6 (BBA;
slowest modes R = 16.5, 8.1, 7.5): best least-resolved thermal width $1/\sqrt{\langle R^2\rangle}$ = 0.60 vs 0.31
(derived here) — "BBA has half ALDP5's headroom".

**E19. A uniform floor leaks mass into a rare saddle (torsion Gaussianization).** Mixing share ε
into the torsion CDF puts ε × 60°/360° of an exactly Gaussian feature into |φ| < 30°: 16.7 per 10,000
at 1% (source "17") and 1.7 at 0.1%, against 4–6 in MD; the training-data density in the
Gaussianized feature dips to 24% (1%) or 76% (0.1%) of the Gaussian value in that interval, and the
network smooths the dip. Measured: 21–28 (1% arm) vs 7–11 per 10,000 (0.1% arm).

**E20. No metric can fix a rare basin weight (note 25 §6.1).** Cramér–Rao
$\mathrm{Var}(\hat w)\ge w(1-w)/n_{\rm visits}$. For αL with w = 0.032 and 37 independent visits: s.d. ≥ 0.029,
relative error ≥ 0.90 (derived here). The three trajectories indeed give 3.2%, 1.7%, 4.1%.

**E21. Empirical kernels memorize at small noise (#953, #1058; derived illustration).** Two
training frames at normalized feature distance d = 0.3 have Gaussian weight ratio
$\exp(-d^2/(2\tau^2))=1.6\times10^{-10}$ at t = 0.01 (τ = 0.0447): the posterior sits on one frame,
$N_{\rm eff}\approx1$. Measured: 356 of 384 BBA kernel queries put > 99% weight on one frame; median
whitening kernel force 23,543.84 Å⁻¹ vs network 243.95 at t = 0.01; 1/Σw² < 1.01 for all 780 sampled
BBA training queries below t = 0.2 (#1058).

**E22. Exposure bias in torsions-first generation (#1009).** BBA torsions-first angle error 0.01335
with reference prefixes vs 0.02456 with generated prefixes; conditional-mean variation over
prefixes explains ≈66% of marginal angle variance (angles-first 16%).

**E23. A sphere-pole counterexample to "circle smoothness suffices" (angular-tree-transport,
Sprint 10).** Lift $f(\phi)=\phi+a\sin\phi$, |a| < 1, applied to an azimuth near a pole: scaled
derivative-linearity defect 0.501798 at displacements 10⁻³, 10⁻⁵, 10⁻⁷ for a = 0.6; it does not
vanish toward the pole. Fix: taper $\phi'=\phi+w(c)(f(\phi)-\phi)$, w = 1 for |cos θ| ≤ 0.90, 0 for ≥ 0.99.

---

## 4. Key empirical results

Numbers are quoted as in the sources. "s0/s1" = seeds 0/1. Lower is better unless stated.

### 4.1 The learned warp as a metric (ALDP5/ALDP10, held-out mdshare trajectory 1, two fitting seeds; `design/learned-stiffness-warp.md`, 2026-10-24)

| | ALDP5 (9-D) | ALDP10 (24-D) |
|---|---|---|
| κ flat Cartesian | 184 / 185 | 1780 / 1780 |
| κ constant whitening | 24.6 / 24.6 | 34.9 / 35.4 |
| κ scaled internal coordinates | 3.88 / 3.95 | 6.46 / 6.54 |
| κ learned | 2.99 / 3.04 | 3.62 / 3.68 |
| κ floor (isotropic steps) | 1.55 | 2.24 |
| κ internal / learned in φ > 0 (30/34 anchors) | 15.8–16.5 / 2.15–2.18 | 30.9–33.9 / 2.97–3.09 |
| noise spread flat / whitening / learned | 8.61–8.70 / 3.43–3.69 / 1.00–1.13 | 7.79–8.98 / 4.36–4.55 / 1.09–1.14 |
| blow-ups at noise 3c | 3.6% / 7.8% | 18.4% / 21.8% |
| fit time (CPU) | 35–36 s | 152 s |

Caveats: explicit-solvent mdshare data (the benchmark uses implicit-solvent bgmol); one lag (1 ps);
one molecule; the 2000 anchors are shared between systems; "flat noise reaches one step width at
about 0.020 Å per slice coordinate for bonds and 0.17 Å for (φ, ψ)" (ratio ≈8).

### 4.2 ALDP5 diffusion in learned vs flat coordinates (4×256 MLP, CPU, two seeds, 20,000 molecules per checkpoint; `learned-stiffness-diffusion-pilot.md`, 2026-10-24 → 26)

| Setting | Bond width / reference | Angle width / reference | Bond PMF (k_BT) |
|---|---|---|---|
| flat, production floor 0.042 Å, 40k steps | 0.49–0.58 | 0.67–0.76 | 1.21 / 1.18 (1.44 with pseudocount 0.001) |
| flat, own scale (floor 0.012 Å) | 0.85–0.90 | 0.93–0.97 | 0.218 |
| learned coordinates (t ≥ 0.01) | 0.99–1.03 | 0.99–1.02 | 0.062 |
| second reference trajectory (floor) | 0.99–1.00 | 0.97–1.04 | 0.066 |

200k-step curves (seed means): bond W1 at 1k steps — learned 0.00077 Å, low-floor flat 0.0052 Å,
production flat 0.027 Å; bond PMF at 200k — 0.065 / 0.065 / 1.51 k_BT. ScoreMD JS at 2k steps: low-floor
flat 0.022, learned 0.027, production flat 0.031; at 200k all 0.020. Memorization (2,000 frames,
100k steps): near-copies 23% learned vs 6.6% low-floor flat. Data-size (2–50 ns segments): best
ScoreMD PMF equal within 0.01 between arms at every size.

### 4.3 Lag sweep, soft-scale sweep, torsion Gaussianization (ALDP5, 4×256 MLP, 20,000 updates, two seeds, CPU, 20,000 molecules; 2026-11-05; floors JS 0.0185 two halves / 0.0226 second MD)

| Arm | JS at 100 updates | JS at 20,000 | molecules / 10,000 in \|φ\| < 30° at 20,000 (MD 4–6) |
|---|---:|---:|---:|
| flat, low floor | 0.117 | 0.0203 | 11 |
| warp 1 ps | 0.127 | 0.0236 | 6 |
| warp 10 ps | 0.049 | 0.0227 | 10 |
| warp 100 ps | **0.027** | 0.0230 | 30 |
| spring γ = 30 / 8 / 2 | 0.133 / 0.149 / 0.163 | 0.0212 / 0.0216 / 0.0212 | 10 / 10 / 8 |
| internal, Gaussianized torsions (floor 0.1% / 1%) | 0.042 / 0.043 | 0.029 / 0.029 | 7.8 / 21.5 |
| internal, linearly scaled torsions (control) | 0.255 | 0.022 | 11.0 |

At 100 updates: valid molecules 10% (flat) vs 96–97% (warps); bond PMF 0.587 (flat) vs 0.064–0.080 k_BT
(warps). Gaussianity of training data in each coordinate system (total KL to Gaussian over principal
axes / largest Sarle bimodality): flat slice 0.96 / 0.80; warp 1 ps 0.96 / 0.73; warp 10 ps 0.20 / 0.44;
warp 100 ps **0.14 / 0.37**; spring γ = 30 1.41 / 0.81; spring γ = 2 0.98 / 0.55. In the Gaussianization
test the torsion features themselves: control φ 0.31, ψ 0.69 nats from Gaussian; Gaussianized ≤ 0.008.
Caveats: exploratory CPU pilots, one molecule, one warp seed per lag, no forces; αL readouts
limited by 37 independent visits per trajectory.

### 4.4 Bead-energy matched campaign (200,000 updates, batch 128, two seeds; `bead-matched-campaign.md`, 2026-11-06)

**BBA warp fits** (lag in saved frames; 1 frame = 200 ps): κ (floor 4.9) flat slice 770 / 1,983,
constant whitening 27 / 23, scaled internal 19 / 11, learned warp **7.6 / 8.6** (lag 1 / lag 100);
noise-damage spread warp 8.9 / 29 vs flat slice 11 / 26; c = 3.7 Å / 12.6 Å; inverse converged 499 /
498 of 500; flag-test overlaps 0.54–0.59 (bonds), 0.81–0.83 (bonds + angles); internal step widths:
bonds 0.057 Å (both lags), angles 6.5° → 10.4°, pseudo-torsions 16° → 43°.

| BBA arm at 200,000 updates | TIC JS (20k mol., floor 0.038) | bond W1 (Å) | angle W1 (°) | TIC JS at 100 updates (2k, floor 0.183) |
|---|---:|---:|---:|---:|
| flat slice | 0.074 | 0.151 | 5.4 | 0.537 |
| chain springs | 0.080 | 0.105 | 3.0 | 0.397 |
| warp, 1 frame | **0.053** | 0.121 | 7.5 | 0.315 |
| warp, 100 frames | 0.056 | 0.589 | 9.4 | **0.272** |

ALDP5 (20,000 molecules): JS at 100 updates flat 0.058, springs 0.062, warp 1 ps 0.041, warp
100 ps 0.026; at 200,000: 0.0206 / 0.0204 / 0.0216 / 0.0225; flat-slice bonds reach the 0.0005 Å
floor only near 200,000 updates (0.0010 Å). Attempt 1 on BBA (raw Å anchor): flat and warp arms never
left initialization (bond W1 5–9 Å / 1.1 Å, TIC JS 0.41–0.60 to 100,000 updates).

### 4.5 Force fields from the bead campaign (`bead-force-field-simulation.md`, 2026-11-06)

| At 200,000 updates | flat | springs | warp short lag | warp long lag |
|---|---:|---:|---:|---:|
| ALDP5 sim. Ramachandran JS (direct) | 0.175 (0.021) | 0.026 (0.020) | 0.184 [0.332, 0.036] (0.022) | 0.027 (0.023) |
| ALDP5 ΔF(φ > 0) sim. (MD 3.4 k_BT) | 2.26 | 3.26 | 0.77 | 4.03 |
| BBA sim. TIC JS (direct; floor 0.038) | 0.116 (0.074) | 0.106 (0.080) | 0.105 (0.053) | 0.120 (0.056) |
| BBA sim. bond W1 Å (direct) | 0.239 (0.151) | **0.015** (0.104) | 0.113 (0.121) | 0.553 (0.592) |
| BBA stiff directions within 0.9–1.1 (Stein) | 11–21% | 26–30% | 0–15% | 17–43% |

ALDP5 long-lag warp lost 42 and 13 of 1,000 walkers; at the training floor t = 10⁻⁵ every force failed
the Stein check by factors 20–200. BBA: 10,000 Brownian steps (1 Å² total diffusion per coordinate)
from training frames; no walker lost.

### 4.6 Bead models under the candidate-overview protocols (`bead-candidates-comparable.md`, 2026-11-08), BBA, 100,000-molecule prefix TIC JS

warp 1 frame **0.0246**, warp 100 frames 0.0272, bead flat 0.0457, old springs 0.0479, bead springs
0.0514, old flat 0.0529, wδ 0.0889, source-graph map 0.1740, invariant whitening 0.2499, endpoint map
0.2515. In the overview simulation every arm drifts to TIC JS 0.34–0.39 (iid-vs-simulation 0.41–0.49).

### 4.7 First BBA comparison, Sprint 11 grouped-feature transformer (`sprint11-pullback-campaign-closeout.md`; PR #895 from 2026-11-01, #899)

| 100k iid, two-seed means | TIC JS | PMF (k_BT)² | Bond W1 (Å) | Angle W1 (°) | Returned / 200,000 |
|---|---:|---:|---:|---:|---:|
| Cartesian (w64) | 0.0529 | 0.560 | 0.6371 | 11.910 | 200,000 |
| Trajectory springs | 0.0479 | 0.582 | 0.0122 | 11.902 | 199,897 |
| wδ | 0.0889 | 1.116 | 0.1688 | 4.574 | 198,879 |
| Invariant whitening | 0.2499 | 4.832 | 0.1170 | 19.893 | 189,993 |
| Endpoint φ (learned) | 0.2515 | 4.888 | 0.0599 | 19.468 | 186,805 |
| Source graph φ (transferred) | 0.1740 | 5.403 | 0.0965 | 6.102 | 198,089 |
| Whitening, width 160 (#899) | 0.16353 | 2.5163 | 0.1136 | 19.22 | — |
| Flat, width 160 (#899) | 0.05540 | 0.6029 | 0.4227 | 9.85 | — |

Reference floors at 2k / 20k / 50k / 100k: JS 0.184 / 0.037 / 0.017 / 0.008, PMF 5.09 / 0.53 / 0.16 / 0.07.
Retention maps with the bead model, BBA 20k updates (#955): internal coordinates bond 0.0016 Å,
angle 1.8°, TIC JS 0.069 vs aligned Cartesian 1.00 Å, 14.7°, 0.151; the learned map worsened every
representation (e.g. springs TIC JS 0.166 → 0.198).

### 4.8 Sprint 12 first chunks (seed 0, 10% of horizon; `sprints/sprint12/matched-results.md`, snapshot 2026-11-09)

| System | Candidate | Bond W1 Å | Angle W1 ° | Rg W1 Å | Pop. JS | Decoded / requested | Sim. records / 640 |
|---|---|---:|---:|---:|---:|---:|---:|
| ALDP5 | Cartesian | 0.004558 | 0.7242 | 0.001953 | 0.01408 | 50,000 / 50,000 | 640 |
| ALDP5 | Internal | 0.000225 | 0.0215 | 0.000757 | 0.00799 | 50,000 / 50,000 | 640 |
| ALDP5 | Trajectory springs | 0.000190 | 0.0229 | 0.000518 | 0.00812 | 50,000 / 50,000 | 640 |
| ALDP5 | Invariant whitening | 0.000195 | 0.0273 | 0.000541 | 0.00762 | 50,000 / 50,000 | 640 |
| ALDP5 | Short lag / long lag | 0.009819 / 0.016640 | 0.7688 / 1.3601 | 0.003759 / 0.006718 | 0.01744 / 0.03311 | 50,000 / 50,000 | 40 / 3 |
| BBA | Cartesian | 0.415335 | 5.2430 | 0.071874 | 0.02670 | 100,000 / 100,000 | 640 |
| BBA | Internal | **0.000274** | **0.1664** | 0.520774 | **0.01236** | 100,000 / 100,000 | 640 |
| BBA | Trajectory springs | 0.320216 | 8.8544 | 0.077730 | 0.04570 | 97,113 / 100,000 | 600 |
| BBA | Invariant whitening | 0.704777 | 24.4406 | 0.497316 | 0.34350 | 96,271 / 100,000 | 620 |
| BBA | Shared quantum-trained | 0.553607 | 9.2710 | 1.705276 | 0.27589 | 99,377 / 100,000 | 620 |
| BBA | Short lag / long lag | 0.480480 / 0.639693 | 7.1120 / 8.5952 | 0.249232 / 0.249267 | 0.01824 / 0.02379 | 100,000 / 100,000 | 640 |
| BBA | wδ | 0.113073 | 3.2382 | 0.085286 | 0.03185 | 99,346 / 100,000 | 640 |
| BBA | Factorized density | 0.000489 | 0.0957 | 0.734526 | 0.01459 | 100,000 / 100,000 | 640 |

Population-JS reference resampling: 0.00326–0.00375 (ALDP5, 50k) and 0.00868–0.00910 (BBA, 100k).
Severe-collision flags (BBA, per 100,000): Cartesian 682, internal 1,186, springs 995, whitening 3,482,
wδ 0. Learning-curve monitors (1,000 draws; Rg W1 at 100 / 1,000 / 5,000 / 10,000 / 190,350
updates): internal 0.5629 / 1.043 / 0.9453 / 0.8164 / 0.5364 Å with bond W1 ≈0.0023–0.0052 Å;
Cartesian 0.6538 / 0.617 / 0.4029 / 0.2721 / 0.04511 Å with bond W1 4.556 → 0.4036 Å.

### 4.9 Diagnosing BBA (#1025, #1026, #1033; `bba-local-geometry-preconditioning.md`, `sprint12-network-inputs-and-baselines.md`)

**Resolution noise relative to the smallest training noise** (σ*/σ(t_min); ≤1 = never resolved):

| BBA map | σ(t_min) | bond | angle | torsion | Rg | TIC |
|---|---:|---:|---:|---:|---:|---:|
| Cartesian | 0.0010 | 6.4 | 32 | 68 | 351 | 47 |
| Internal | 0.045 | 22 | 9.2 | 9.0 | **3.0** | 5.2 |
| Trajectory springs | 0.045 | **0.84** | **1.2** | 2.1 | 11 | 1.9 |
| Invariant whitening | 0.045 | 7.7 | 39 | 85 | 38 | 44 |
| wδ | 0.045 | **1.25** | 4.1 | 7.2 | 52 | 5.8 |

ALDP5: the same recipes resolve every observable at 11–31 σ(t_min).

**Round 2 (50,000 updates, two seeds, 20,000 molecules per seed, means):**

| BBA arm | bond W1 (Å) | angle W1 (°) | Rg W1 (Å) | TIC JS | severe clashes (‰) |
|---|---:|---:|---:|---:|---:|
| Cartesian | 0.760 | 10.8 | 0.063 | 0.096 | 13.6 |
| + distance inputs | 0.013 | 2.28 | 0.091 | 0.046 | 5.8 |
| + reference-spring base | 0.017 | 4.83 | 0.087 | 0.072 | 22.2 |
| + springs + distances | 0.016 | 2.25 | 0.079 | 0.047 | 6.8 |
| Internal coordinates | 0.0007 | 0.21 | 0.591 | 0.044 | 13.5 |
| C3 (internal + unit-phase distances, #1026) | 0.0007 | 0.23 | 0.477 | 0.045 | 7.0 |
| Candidate 1 (whitened springs + Rouse vectors) | 0.0008 | 1.63 | 0.507 | 0.106 | 35.8 |
| Candidate 2 (bond warp) | 0.0080 | 1.92 | 0.329 | 0.106 | 37.4 |
| Covariance-matched base (#1033) | 0.0091 ± 0.0002 | 1.88 ± 0.11 | 0.083 ± 0.015 | 0.0443 | 4.7 |
| Resampled reference | 0.0005–0.0006 | 0.11–0.14 | 0.010–0.037 | 0.037–0.039 | 0 |

Round 1 (10,000 updates, seed 0, BBA): prior-matched springs bond W1 0.0024 Å vs Sprint 12 springs
0.772 Å, but Rg 0.877 vs 0.647 Å; lag-whitened internal Rg 0.622 vs 0.769 Å. Distance inputs at the
full first chunk (#985, 190,350 updates, seed 0): Cartesian bond 0.4207 → 0.0078 Å, angle 5.35 →
1.58°, population JS 0.0267 → 0.0130; no help for internal, springs or whitening (whitening size
0.42 → 0.67 Å, collisions 3,378 → 10,921 per 100,000). Native ScoreMD (#998): bond 0.0423 vs 0.415 Å
but size 0.157 vs 0.072 Å. Force panels: at t = 0.05 every Cartesian-family BBA model shows bond
1.03–1.09 Å against a blur floor of 1.19 Å; at t = 10⁻⁴ the covariance base reaches 0.0087 Å (floor
0.005) vs 0.065 Å for the standard base.

**Readable windows** (#1026; R² ≥ 0.5 of rebuilt pair distances vs clean): bonds readable up to
t = 1.8×10⁻⁴ (0.02% of training) for Sprint 12 Cartesian, 3.4×10⁻⁴ (0%) for internal + #985 inputs,
0.11 (10%) for C3; long-range shape (≥ 11 apart) up to 0.17 (17%), 0.038 (2.9%), 0.11 (9.7%).

### 4.10 Learned embedding objectives (`learned-embedding-objectives.md`, consolidated 2026-11-14)

ALDP5 (4×256 MLP, 10,000 updates, two seeds, 16,384 molecules; bond/angle errors in thermal widths):

| Coordinates | Bond error at 100 updates | Final bond | Final angle | Final torsion JS |
|---|---:|---:|---:|---:|
| Flat (aligned Cartesian) | 3.372 | 0.0714 | 0.0422 | 0.00925 |
| Fixed invariant whitening | 0.257 | 0.0240 | 0.0231 | 0.00929 |
| Global + endpoint | 0.0736 | 0.0199 | 0.0226 | 0.00834 |
| + 0.01 bond-corrected local | 0.0717 | 0.0198 | 0.0220 | 0.00807 |

BBA (Sprint 12 transformer, 10,000 updates, two seeds, 1,024 requested per checkpoint and seed):

| Coordinates | Returned / 2,048 | Bond W1 (Å) | Angle W1 (°) | Rg W1 (Å) | Torsion JS | TIC JS | Severe collisions |
|---|---:|---:|---:|---:|---:|---:|---:|
| Cartesian (81) | 2,048 | 1.604 | 22.14 | **0.186** | **0.066** | **0.485** | 5.4% |
| Frame whitening | 2,004 | 0.977 | **14.77** | 2.292 | 0.119 | 0.641 | 1.9% |
| Global + endpoint | 2,008 | **0.678** | 16.40 | 1.471 | 0.156 | 0.630 | **1.8%** |
| … + 0.01 local (uncorrected) | 1,995 | 1.134 | 30.94 | 0.675 | 0.128 | 0.496 | — |
| … + 0.01 bond-corrected local | 1,988 | 1.146 | 30.48 | 0.836 | 0.124 | 0.516 | 10.1% |
| … normalization-aware | 1,999 | 0.769 | 17.00 | 1.497 | 0.137 | 0.619 | 3.1% |
| Held-out MD (floor) | — | 0.0026 | 0.55 | 0.072 | 0.0087 | 0.288 | 0% |

Map probes (ALDP5): local-moment-only map has by far the best local condition number (4.6 vs 30–31)
and *worse* bond response (0.317 vs 0.183 for global + endpoint). Cartesian here uses t_min 10⁻⁵ vs
0.01 for the invariant maps (not a coordinate-only attribution); 10,000 updates is early.

### 4.11 Other Sprint 11/12 lines in scope (one line each; sources in Section 8)

- **Local-moment refinement** (ALDP5, 5k updates, two seeds): generated width error flat 6.91%,
  whitening 2.25%, linear mixing 1.55%, nonlinear 5.92%; held-out force RMS 0.2535 / 0.2320 / 0.2135 /
  0.1789; MD split-panel JS 0.23613 nats exceeds every model difference.
- **Covariance-aware prediction** (ALDP5, 20k): graph map original vs combined: bond widths 1.70% →
  1.11%, torsion JS 0.133 → 0.144; analytic-only 1.09% / 0.50% widths, JS 0.236; output scaling did not
  beat the original network (0.1400 vs 0.1326).
- **Static density flow** (two seeds, 100k draws): ALDP5 JS 0.15225 vs 0.01140 isotropic flat; BBA bond
  W1 0.81646 vs 0.03373 Å; 27.80/28.78% of ALDP5 flow samples have all bonds and angles within MD
  0.1–99.9% bands vs 98.32/98.09% for flat. 1.21 H200 GPU-hours.
- **Intrinsic spring noising** (ALDP5, 10k, seed 0, 2,000 requests): bond / angle / JS / seconds — flat
  DSM 0.1884 / 0.0758 / 0.1236 / 30.43; spring DSM 0.0369 / 0.0361 / 0.1186 / 37.88; spring intrinsic ISM
  0.0586 / 0.3887 / 0.1624 / 86.04.
- **Rao–Blackwell targets** (frozen spring model, 10k updates): posterior/ordinary gradient-variance
  ratio 1.0000 at t = 0.01–0.02, 0.8005 at 0.05, 0.2843 at 0.1, 0.1102 at 0.2, 0.0113 at 0.4.
- **Time sampling** (10k, two seeds): likelihood weighting BBA size 0.780/0.785 → 0.933/0.884 Å; importance
  sampling raw gradient-trace −52–66% but −12–35% after clipping; every batch gradient exceeded the
  clip threshold 1; phase-radius error fell in all eight fits but the atan2 decoder discards it.
- **Energy head / auxiliary losses**: head refit lowered fitting loss and raised held-out risk in 4/4;
  ordinary training reduced BBA risk 41–105× more than head fitting; potential supervision worsened BBA
  size by 0.245/0.244 Å; identical-initialization native reruns differ by 0.046 Å in size W1.
- **Automatic (maximum-sine) references in Sprint 12** (one seed): BBA Rg W1 0.5331 → 0.1743 Å, angle
  0.1737° → 5.788°, contacts 0.009652 → 0.02157, population JS 0.01280 → 0.02956, collisions 1,327 →
  2,285 per 100,000; changes 18 of 26 angle and 21 of 25 torsion references.
- **Factorized densities** (three seeds × 10,000): BBA Gaussian vs neural bond completion 0.01829 vs
  0.02166; completing angles: angle error 0.155, 1,569/90,000 collisions; torsions-first size 0.865 → 0.713 Å
  (interleaved 0.691), angle 0.01673 → 0.02583; all ≫ 0.062 Å reference variation.
- **BBA force diagnostics**: width-160 whitening force at t = 0.05 — Gaussian term 163.10, learned
  112.18, volume 1.96, total 187.69 Å⁻¹ RMS per bead (Cartesian 0.457 / 0.834 / 0 / 0.769); kernel teacher
  median N_eff = 1; full-bank → 500k bank changed the nearest frame for 35/64 (Cartesian) and 40/64
  (whitening) queries.

### 4.12 Caveats that apply across Section 4

- **Budgets**: most BBA results stop at 10,000 or 50,000 updates (≤26% of the 190,350-update first
  stop, ≤2.6% of the 1,903,500 horizon); Sprint 12 first chunks are 10% of the horizon. On ALDP5 early
  gaps between coordinate systems closed with longer training.
- **Seeds**: Sprint 12 first chunks and many diagnostics are single-seed; two-seed means are
  descriptive. Identical-initialization BBA reruns differ by 0.046 Å in size W1.
- **Noise floors differ**: Cartesian trains to t = 10⁻⁵, other maps to 0.01 — equal t is not equal
  physical corruption.
- **Sample-count floors**: BBA population JS floor ≈0.18 at 2,000 molecules, 0.037 at 20,000, 0.008 at
  100,000; 1,000-draw Rg monitors have a resampling floor of 0.05–0.10 Å.
- **BBA time labels**: the HDF5 time column is a frame index; frames are ≈200 ps apart, so "1 ps"
  BBA pairs are 200 ps chords and a 100-frame lag ≈20 ns.
- **Simulations**: short (2 ps panels, or 10,000 Brownian steps without physical time), correlated
  records, MD-start runs mostly preserve the starting set; the t = 0.05 force is a finite-noise
  surrogate whose blur dominates Cartesian BBA.
- **Architectures differ across lines** (4×256 MLP pilots, width-64 grouped-feature transformer,
  bead-energy transformer, Sprint 12 symmetry transformer, MADE densities); compare within tables.

---

## 5. Why it was promising, why it failed, what was learned

Labels: **[M]** measured, **[D]** derived (in the source or here), **[H]** hypothesis stated in the
source, **[C]** a later correction of an earlier interpretation (with date).

### 5.1 Why each idea looked promising

- **Learning the metric from dynamics** [M/D]. The stiffness that hurts diffusion is visible
  in short trajectory steps; a coupling flow fitted to make 1 ps steps isotropic removed most of it
  without any chemistry (κ 2.99 vs 184; flag test recovers bonds and torsions), with exact inverse
  and closed-form log-determinant, so the forward process stays a flat Gaussian and transitions stay
  closed-form. It is also *molecule-agnostic in principle* (any system with trajectories).
- **It gave the predicted stiff-mode benefit** [M]. Bonds and angles reached the data floor within
  ≈1,000 updates instead of 100k–200k, and the production-floor narrowing disappeared; with the
  bead transformer the springs and 100 ps warp gave the best ALDP5 force fields.
- **The lag dial promised control over the erasure order** [D]. Note 25 showed the lag sets how
  far the basin decision precedes the stiff structure in the reverse process; the 100 ps warp then
  learned the whole ALDP5 distribution in 100 updates.
- **On BBA the warps were the best slow-coordinate learners** [M] in the bead campaign (TIC JS
  0.0246/0.0272 at the 100k prefix vs ≥0.0457 for every other arm), and springs gave 52× better
  bonds in the first BBA comparison. "Bonds improved significantly" held on BBA for every
  stiffness-removing map.
- **Learned invariant embeddings** promised the advantages of whitening plus a data-fitted
  nonlinearity, with rotation invariance and no alignment chart; on ALDP5 global + endpoint fits
  cut the bond error at 100 updates 13–47× vs flat [M].
- **Objective-level fixes** each came with a theorem [D] (variance reduction, KL bound,
  conditional optimum, analytic skip), so they looked like free improvements on top of good maps.

### 5.2 Why each line failed or stalled

**Learned stiffness warp.**
- [M] Torsions were learned *more slowly* than in flat coordinates (≈5k vs 100k–200k steps on
  ALDP5); freezing the stiff directions did not help, so the effective-2-D explanation is refuted
  [M]; the remaining explanation, that the warp bends and stretches the basins, is [H].
- [M] A single alignment chart: W jumps by 4.7–6.6 Å across the cut; 13 of 18 broken generated
  molecules sit at the boundary and 5 beyond; on BBA 8.9–11.9% of *training* frames already lie
  across the cut (Jacobian sign), and early BBA warp simulations drifted across it (25.6% and 57.8%
  minority-sign clouds at 1,000 updates).
- [M] Off-data inverse: at noise 3c, 3.6–21.8% decodes fail or blow up; on ALDP5 the warps' forces
  have blow-up regions (1–15% of walkers lost depending on checkpoint).
- [M] On BBA it barely removed stiffness: κ 7.6–8.6 against a floor of 4.9, noise-damage spread
  8.9 (1 frame) and 29 (100 frames) — not the ≈1 of ALDP5 — and flag-test bond overlap only
  0.54–0.59. The BBA "lag 1" is 200 ps, so the fitted "steps" are long chords [M].
- [M] The lag lever trades local for global: the 100-frame warp has the worst BBA bonds (0.59 Å),
  the 1-frame warp is mediocre on bonds (0.12 Å); neither gives a usable BBA force field; in the
  Sprint 12 matched first chunk the lag warps were neither locally nor globally competitive (bonds
  0.48–0.64 Å, Rg 0.249 Å) and their ALDP5 simulations were unstable (40 and 3 of 640 records).
- [M] The 100 ps warp's early win is a **Gaussianization** of the slow modes, not stiffness removal
  ([C] 2026-11-05, same day as the lag sweep's synchronized-erasure reading). Gaussianization buys
  the first 100 updates and costs late accuracy on the joint (φ, ψ) density and on the rare barrier
  (warp surplus 6× MD at 20k updates, 21 per 10,000 still at 200k with the bead model).

**Learned invariant embeddings** (`learned-embedding-objectives.md`, "Mechanistic insights"):
1. [M] *The target was not thermal stiffness.* Finite chord displacements mix bond turning
   into apparent bond compression (8.1×/7.4× variance on ALDP5 end bonds; ≈10× on BBA, where the
   "1 ps" pairs are ≈200 ps chords); centering removes almost nothing (the BBA neighbourhood mean
   holds 1.6% of displacement energy). Correcting it after transport restores exact bond variances,
   but on BBA then trades bonds (+69%) and angles (+86%) and collisions (≈6×) for size (−43%).
2. [M/D] *First-order vs nonlinear response.* The local loss sees only $DF(x)\xi$; the network and
   decoder see the nonlinear map at finite noise. Replacing the nonlinear response by its
   linearization reverses the endpoint ranking (0.302 vs 0.410 linearized, 0.471 vs 0.279 actual).
   At 10% ambient noise the local map's covariance condition is *worse* (12.7 vs 5.9).
3. [M/D] *Normalization mismatch.* Diffusion divides all features by one RMS; a local fit that
   grows global spread 3.47× makes stiff directions relatively noisier after normalization, so the
   raw-noise bond response 1.17 (better than whitening's 3.05) becomes 4.06 after normalization
   (worse). Scoring the objective after normalization (#1021) "moves the map back towards the global
   + endpoint trade-off instead of escaping it."
4. [M/D] *Ambient dimension and decoding.* 3,303 features for 78 shape directions: the network
   reduces total noise error by only 2–4% relative to the analytic predictor, improving the 3,225
   normal directions while the tangent error worsens by 17–29% (Cartesian improves tangent error by
   40%); the decoder converges numerically while moving generated features 21–23× further than for
   held-out corrupted structures; size, torsion and population scores of local variants are nearly
   fixed at update 0 (map and decoder, not learning).
5. [D] *Noise erases order.* Whitening-type coordinates give every motion similar spread, so noise
   erases local and global structure in one band ("range without order"); a local objective can only
   act on range. Cartesian, which keeps large-scale shape loud, has the best size in every BBA
   comparison of this line.

**Learned / fitted maps in general.** Retention maps help early and fade (ALDP5) and hurt every BBA
bead representation [M]; local-moment refinement improves conditioning and force consistency but
worsens generated widths [M]; a directly fitted static density flow is far worse than diffusion
(ALDP5 JS 0.15 vs 0.011) [M]; automatic (maximum-sine) references improve BBA size but destroy
angles [M], and the mechanism "nonlocal angles mix collective bending into whitened coordinates" is
[H] ("a plausible mechanism, not a controlled isolation", `chemical-local-references.md`).

**Hand-built stiffness-removing maps on BBA** (#1025) [M]: springs — right balance, wrong scale
(global divisor 27.1 puts spring channels at s.d. 0.037 < σ(t_min) = 0.045); whitening — noise off the
molecule (tangent share 0.06; loss 911 → 759 over 190,350 updates) plus an unbalanced reference force
(Gaussian term RMS 163 Å⁻¹ only 4.95% opposed); internal coordinates — Rg least resolved
(σ*/σ_min = 3.0); Cartesian — distances unreadable for the encoder (bonds readable only below
t ≈ 4×10⁻⁴, 0.04% of training examples).

**Objective changes** [M/D] (`objective-search-synthesis.md`): the theorems concern estimators,
starting predictors or ideal optima, not finite networks under clipping/AdamW through 1,000 reverse
steps and a decoder; average prediction error is dominated by irreducible label noise and local
channels; BBA's error is in collective shape; all comparisons kept the coordinates fixed, hence
the erasure order fixed. Specific mechanisms: likelihood weighting moves effort to small t where the
model learns the decoder-discarded phase radius [M]; clipping absorbs variance gains (every batch
gradient > 1) [M]; empirical-density value targets memorize single frames (1/Σw² < 1.01) [M].

### 5.3 Precisely why learned embeddings were not successful (synthesis for the video)

1. **They optimized the wrong object.** Every learned map was fitted to a local statistic
   (1 ps steps, chord second moments, endpoint plausibility, density of static frames). What
   decides generation is how the *noisy marginal* behaves at every noise level after the scalar
   normalization and through the decoder — a different object (note 28: "a locally well-scaled map
   need not give a simple noisy marginal density"; helix example E8: equal metrics, different
   denoising).
2. **The local statistic itself was biased** at the lags available (bond turning, BBA 200 ps
   frames), so "good conditioning" often measured the wrong thing (#1004: the corrected local-only
   map fits its corrected target at condition 2.1 and the old biased target badly, 28.6).
3. **Normalization and redundancy undo the fit**: one global RMS divisor rescales every block
   together (springs below the floor, local fits reversed); redundant invariant embeddings turn
   finite tangent stiffness into diverging normal stiffness and spend the network on directions
   that leave the molecule.
4. **Equalizing everything destroys order.** The more a map equalizes all motions (whitening,
   Rouse-whitened collective modes, long-lag warps), the more it erases the fold in the same noise
   band as the detail. On BBA, where global shape is a long-range sum of bond-direction products
   (89–99% of excess size from distant pairs), this is the dominant failure; on ALDP5 it was
   invisible because ALDP5 has no separation of local and global structure.
5. **Their benefits are early and local**, and given enough updates good representations converge
   on ALDP5 (retention maps, warps, springs all reach the floor); the early win rarely survives to a
   matched budget or into simulation.
6. **Charts and inverses add failure modes** that hand-built internal coordinates do not have
   (alignment cut, off-data inverse, projection decoders with failures counted against the request).

### 5.4 What was learned (durable)

- **Stiffness removal is a local lever, and it is real**: every map that amplifies stiff distances
  improves bonds (and wδ angles) on BBA too; keep it *for the stiff coordinates* (status 2026-11-14).
- **Gaussianizing the slow modes is a separate lever** (fast start, late cost, rare-barrier
  fidelity at risk); it connects to Boltzmann-generator flows.
- **What the network can read matters more than how the noise is shaped** (distance inputs: 60×
  BBA bond gain for Cartesian), and **prior matching decides what is free** — locally *and*
  collectively (spring base collapses the chain; covariance-matched base keeps it).
- **Resolution, not condition number**: report σ*/σ(t_min) per observable before training; normalize
  per block; do not noise redundant ambient maps without an analytic normal term.
- **Complete what is local, learn what is global**: conditional Gaussian bond completion is as good
  as a network on BBA; angles are not local on a 28-bead chain.
- **Prediction is not generation**: judge every change by decoded molecules on both systems, with
  size, long-range distances, contacts, collisions and all-requested denominators; report untrained
  step-0 panels for maps with decoders.
- **When noise destroys what** is the missing design variable: *range* (every property readable
  inside the trained noise levels) and *order* (large-scale shape erased last). Cartesian has order
  without range; unit-spread coordinates have range without order. This is the bridge to the
  current approach (internal coordinates scaled to thermal width + a small block of loud
  collective modes).
- **Forces need matched blur**: compare force fields at the same physical smoothing, not at a common
  t = 0.05; every BBA model still drifts in size in simulation.

---

## 6. Visualization opportunities

Each entry: **insight** · on screen · what is computed (A = analytic toy, live-computable; P =
precomputable from saved data/figures; L = logged numbers only) · numbers/figures to use ·
pitfalls. Existing figures in the snapshot: `docs/investigations/learned-stiffness-warp/stiffness_aldp.png`
(κ histograms + ALDP10 group-deviation curves), `learned-stiffness-diffusion-pilot/*.png` (budget
curve, bond histograms over training, Ramachandran grids, dimensionality test, memorization),
`bead-matched-campaign/{aldp5,bba}_learning_curves.png`, `bba_tic_maps_step200000.png`,
`bead-force-field-simulation/{force_checks,simulations}.png`,
`bead-candidates-comparable/{bba_prefix_js,*_overview_comparison}.png`; lag/spring/Gaussianization
figures are linked at commit `2eb1e5cb` on GitHub.

### Act I — learning a stiffness-removing map

**V1. "The lens that makes every step round."** Insight: a learned flow can make thermal steps
isotropic without chemistry. Screen: ALDP5 9-D steps projected to 2-D as ellipses (needle-thin
along bonds, fat along torsions) morphing into near-circles as W is applied; κ histogram slides
from 184 → 24.6 (constant whitening) → 3.9 (scaled internal) → 3.0 (learned) next to the
isotropic-sample floor 1.55. Compute: P (κ table / histogram figure) + A (2-D bent-valley toy: a
stiff direction rotating by up to 56° along a curved valley, straightened by a 2-D coupling flow;
the unit test reports κ within 1.5× of its floor). Pitfall: κ is *local 1 ps step* anisotropy, not
the equilibrium (thermal) metric; even perfectly isotropic finite samples give κ = 1.55; do not
call the residual "curvature" (cause open).

**V2. "Noise damage race."** Insight: under flat Cartesian noise bonds are destroyed 8–9× earlier
than torsions; under the learned warp all groups are destroyed together. Screen: four lines
(bonds, angles, stiff dihedrals, soft dihedrals) of deviation/step-width vs noise level, crossing
the "one step width" line at very different (Cartesian) or identical (learned) noise levels
(spread 7.79 vs 1.09 for ALDP10). Compute: P (curves in `stiffness_aldp.png`) or A (Gaussian modes
with widths 0.020 Å vs 0.17 Å). Pitfall: "equal displacement is not equal information" — in z the
data still spread 2.0–3.3c along two directions, so basin information survives longer.

**V3. "A seam in the map."** Insight: a single alignment chart creates a cut where the learned map
jumps; generated failures live there. Screen: a shape path approaching the cut; the warped image
jumps by 4.7–6.6 Å for a 2×10⁻⁷ Å step; overlay the 18 broken molecules (13 just inside, 5 beyond).
Compute: A (2-D toy: aligning a planar triangle to a reference, where the best rotation flips by
≈180° when λ₂ + λ₃ crosses 0) + L. Pitfall: specific to the single-chart construction; invariant
(Gram-feature) maps have no such cut but have other problems (V17).

**V4. "The floor that narrows bonds."** Insight: if the smallest trained noise is larger than a
bond's width, the final denoising returns a conditional mean and generated bonds come out half as
wide; training longer makes it worse. Screen: N–CA bond histograms over training for production-
floor flat (narrowing to 0.49–0.58 of reference width; bond PMF error 0.3 → 1.51 k_BT from 3k to
200k steps) vs learned (0.99–1.03 throughout). Compute: P (`bond_histograms_over_training.png`,
`budget_curve.png`) + A (Gaussian shrinkage $w/\sqrt{w^2+k\sigma_{\min}^2}$, E5). Pitfall: the idealized
formula brackets but does not fit the measurement (0.39–0.59 predicted vs 0.49–0.58 measured); the
low-floor flat model does *not* narrow (it is the fair baseline).

**V5. "The loss is flat but the bonds still improve."** Insight: noise-prediction loss weights noise
levels by sampling frequency; the stiff band σ ≈ w is ~6% of training times, so a 23% → 5% width
error changes the loss by <0.01. Screen: loss trace with ±0.02–0.07 scatter next to a bond-width
gauge; overlay the excess-loss curve vs σ for one stiff mode (peaks at σ ≈ w). Compute: A (E4 formula;
reproduces 0.0093 / 0.0014 / 0.0005 / 0.00002). Pitfall: idealized independent Gaussian modes.

**V6. "Torsions are slower in the warped space."** Insight: making stiff modes easy did not make
torsions easy; freezing the stiff directions made torsions slower (ScoreMD PMF 1.10 vs 0.85 at 500
steps). Screen: Ramachandran maps at 100/200/500/1k/2k/5k steps for flat low floor vs learned (the
αR→αL "bridge" disappears ≈5k vs ≈10k steps). Compute: P (`early_ramachandran.png`,
`dimtest_ramachandran.png`). Pitfall: low-floor flat is the right comparator; the production-floor
flat is slower than both.

### Act II — the lag dial and the Gaussianization lever

**V7. "Turning the lag knob."** Insight: the lag of the fitted steps decides which modes count as
"stiff": at 1 ps ψ is weighed 19× stiffer than its equilibrium spread; at 100 ps every mode is near
its equilibrium width. Screen: slider τ ∈ {1, 10, 100} ps; bars of step widths (bonds 0.025 Å
constant; φ 20° → 31° → 32°; ψ 18° → 32° → 63°) and implied half-erasure levels (ψ 19 → 6.25 → 1.52;
φ 2.33 → 1.03 → ≈1); a stacked "erasure timeline" showing the basin decision moving from far before
the stiff structure to synchronous with it. Compute: A (lag dictionary $w^2(1-e^{-\tau/t})$ with the
four-mode example of E2) + L (ALDP5 saturation table). Pitfall: the half-erasure algebra is for a
harmonic basin; hops (αR↔β 100–200 ps, αL 5–20 ns) are not harmonic.

**V8. "Rescaling is not the trick" (two-panel race).** Insight: the 100 ps warp's 100-update win is
reproduced neither by spring rescaling (γ = 30/8/2: JS 0.133/0.149/0.163) but is by Gaussianizing
the torsions (0.042). Screen: four Ramachandran maps after 100 updates (flat 0.117, spring γ = 2
0.163, Gaussianized 0.042, warp 0.027, floor 0.019–0.023) with "valid molecule" counters (10% flat vs
97% warp). Compute: P (figures at commit 2eb1e5cb) + L. Pitfall: ALDP5-only, 4×256 MLP, CPU; at
20,000 updates flat is best (0.0203) and the Gaussianized arms worst (0.029).

**V9. "Pressing a two-humped landscape into a bell."** Insight: in near-Gaussian coordinates the
score is near-linear, which a network learns in a few dozen updates; the inverse map restores the
basins. Screen: the ψ marginal (two humps) passed through its smoothed CDF then $\Phi^{-1}$ into a bell;
a 1-D diffusion model's score is drawn before (curvy) and after (a straight line); then the inverse
CDF re-inflates the humps. Compute: A (any bimodal 1-D mixture; E19 for the uniform floor). Numbers:
total KL to Gaussian 0.96 → 0.14 (flat → 100 ps warp), bimodality 0.80 → 0.37. Pitfall: marginal
Gaussianization compresses low-density stretches into narrow feature intervals, so *joint* basin
boundaries become steep features [H]; it does not by itself smooth rare barriers.

**V10. "The two levers map."** Insight: stiffness removal and Gaussianization are separable. Screen: a
2-D plane (x: bond error at 100 updates; y: torsion JS at 100 updates) with points for flat (2.79
thermal widths, 0.117), springs γ (0.037–0.062, 0.133–0.163), 1/10/100 ps warps, Gaussianized and
linear internal maps (bond 0.028 thermal widths; JS 0.042 vs 0.255), animated along training to
20,000 updates where all collapse to the floor. Compute: L. Pitfall: ALDP5 only; on BBA the levers
behave differently (V12).

**V11. "The rare saddle."** Insight: the long-lag warp keeps a surplus at the rarely crossed barrier
to αL. Screen: counter of molecules per 10,000 in |φ| < 30° over training (warp 100 ps 77 → 30, flat
184 → 11, MD 4–6); a 1-D φ free-energy profile with the barrier at ≈5 k_BT instead of 8–9. Compute: L.
Pitfall: counts rest on 20–60 molecules (±2 per 10,000 Poisson); αL has only 37 independent visits
per 250 ns trajectory (E20) — no model can be ranked on αL population.

### Act III — from 5 beads to 28

**V12. "Same maps, new molecule."** Insight: on BBA the warps learn slow coordinates best and the
springs local geometry best; nobody gets both. Screen: the 8-panel learning-curve figure
(`bba_learning_curves.png`) re-animated: TIC JS (warps lead from 100 updates) vs bond W1 (springs
lead; 100-frame warp hardly improves, 0.59 Å). Compute: P/L. Pitfall: BBA lags are frames (1 frame =
200 ps); bead-energy model with RMS-scaled anchor (the Å attempt failed entirely).

**V13. "The 2×2 of failure" (Sprint 12 first chunk).** Insight: on BBA local and global quality split
across maps. Screen: log–log scatter of bond W1 vs Rg W1, ALDP5 points all near the floor; BBA points
in quadrants: internal (0.000274 Å, 0.521 Å: local good, global bad), Cartesian (0.415, 0.072: global
good, local bad), springs/whitening/shared-quantum/lag warps (both bad), with decoder-failure
halos (whitening 3,729 failures). Compute: L (matched-results table). Pitfall: one seed, 10% of
horizon, Cartesian t_min 10⁻⁵ vs 0.01 for maps, invariant Cartesian control (not upstream ScoreMD);
reference resampling floors 0.00868–0.00910 for population JS.

**V14. "Rg gets worse before it gets better."** Insight: in internal coordinates the local geometry
is free from step 0, while global size is barely learned (Rg W1 0.56 → 1.04 → 0.54 Å from 100 to 1,000
to 190,350 updates); Cartesian learns size steadily (0.65 → 0.045 Å). Screen: twin learning curves
with molecule thumbnails (swollen vs compact). Compute: L (dossier monitor tables). Pitfall:
1,000-draw monitors have a 0.05–0.10 Å resampling floor; step-0 quality is the prior, not learning.

**V15. "Global shape is a sum over distant pairs."** Insight: Rg² is a weighted sum of bond-vector dot
products with triangular weights $\min(a,b)(N-\max(a,b))/N^2$; the excess size of internal-coordinate
models lives in pairs ≥11 apart (92%) — local marginals cannot fix it. Screen: 27×27 heat map of
weights; overlay generated-minus-reference $b_a\cdot b_b$; animate bands from the diagonal outward
accumulating the excess. Compute: A (identity, verified) + P (needs saved samples). Pitfall: #1055
corrected the "errors add up along the chain" reading for C3 — the error is a missing collective
coupling, so do not animate it as random error accumulation for C3 (it *is* accumulation for the
angle-completion experiment #969: 2.86 Å vs 0.162 Å).

**V16. "Springs under water."** Insight: one global RMS divisor (27.1 on BBA vs 1.31 on ALDP5)
pushes each spring channel's spread (0.037) below the smallest training noise (0.045), so bonds are
never resolved during training. Screen: bar chart of channel spreads with a horizontal "noise floor"
waterline; dividing by 1.31 keeps the bars above water, by 27.1 sinks them; then the resolution table
(σ*/σ(t_min): springs bond 0.84, angle 1.2; internal Rg 3.0; Cartesian bond 6.4, Rg 351). Compute: A
(divisors, t_half = 0.0077 < 0.01) + L. Pitfall: σ* uses 1 ps (=200 ps on BBA) thermal widths and a
linearization.

**V17. "Noise that leaves the molecule."** Insight: with 3,303 invariant features for 78 shape
directions, almost all Gaussian noise is normal to the molecular image; the network must learn a
normal stiffness α/σ that diverges as noise vanishes (22 at t = 0.01, ≈1,000 at 10⁻⁵), and the loss
barely moves (911 → 904 → 759). Screen: a 1-D curve in 3-D with noise spheres; tangent vs normal
arrows; a pie of the untrained low-noise loss (6% tangent). Compute: A (flat-subspace formulas of
note 28 §4; helix example for curvature). Pitfall: the flat-subspace formula illustrates, it does not
quantify, the curved 78-D image.

**V18. "The chain that collapses."** Insight: a score base that is right locally can be wrong
collectively — freezing bonds and angles under an isotropic Gaussian pull halves the chain (Rg 5.4 vs
10.6 Å); the covariance-matched Gaussian keeps it (10.7 Å). Screen: three live Monte Carlo chains
(free torsions, isotropic weight, covariance-matched weight) with Rg readouts. Compute: A (toy MC
reproduced here: 10.0 ± 2.2 vs 5.35 ± 0.50 Å with bond 3.8 Å, angle 105°, s = 6.25 Å). Pitfall: ignores
excluded volume and the network; the toy angle is not BBA's per-position mean.

**V19. "Reading glasses for the network."** Insight: giving the Cartesian network noisy pair
distances is the single largest gain (bond W1 0.76 → 0.013 Å, 60×); the Gram entries it saw before
encode bonds only through nearly cancelling differences. Screen: two network "views" of the same
noisy molecule: a Gram matrix (bond hidden in a difference of large numbers) vs a distance map (bond
on the first off-diagonal). Compute: A + L. Pitfall: distance inputs did not help internal, springs or
whitening (redundant or misleading continuations).

**V20. "Force panels measure blur."** Insight: reading the force at t = 0.05 smooths Cartesian BBA by
≈1.09 Å per coordinate but an internal-coordinate bond by ≈0.01 Å, so every Cartesian model scores
≈1.1 Å bonds regardless of quality. Screen: a bond-length histogram convolved with the blur kernel for
each map; slider in t showing blur floor vs training density (only 0.01% of examples at t ≤ 10⁻⁴,
where α/σ ≈ 315 amplifies network error). Compute: A (E12) + L (blur floor 1.19 Å; t = 10⁻⁴: 0.065 vs
0.0087 Å). Pitfall: matched-blur comparisons need each model's trained range (internal maps only to
t = 0.01).

### Act IV — learning the embedding

**V21. "A turning bond looks compressed."** Insight: straight chords of a rotating bond have a radial
component $L(\cos\theta-1)$; a local covariance built from chords sees false bond softness. Screen: a
bond sweeping 0–40° with its chord and the projected "fake compression" growing quadratically; numbers
for ALDP5 (7.5–16° per 1 ps → 0.012–0.056 Å vs 0.025–0.031 Å widths) and BBA (≈200 ps chords: RMS
linearized 0.83 vs actual 0.081 Å). Compute: A (E3). Pitfall: L = 1.45 Å is an assumed typical bond.

**V22. "Good conditioning, bad molecules."** Insight: the map with the best local conditioning moves
bonds the most. Screen: scatter of local condition number (whitening 31.3, global + endpoint 30.4,
local-only 4.6) vs decoded bond response (0.281, 0.183, 0.317), plus a second panel after diffusion
normalization where the local score flips sign (raw −7.6/−7.8 vs +12.6/+14.7). Compute: L (+ the A curve
$T/r^2+V+78\log r$). Pitfall: T and V values are not published; draw the reversal schematically.

**V23. "The trade-off line."** Insight: every local variant of the learned BBA embedding moves along
one line: better size/population, worse bonds/angles/collisions; repairing normalization slides back
along it. Screen: 2-D plot of Rg W1 vs angle W1 for global + endpoint (1.471, 16.40), + local (0.675,
30.94), + bond-corrected (0.836, 30.48), normalization-aware (1.497, 17.00), with Cartesian (0.186, 22.14)
and the floor. Compute: L. Pitfall: 10,000 updates; Cartesian uses a lower noise floor.

**V24. "Prediction is not generation."** Insight: ~30 matched objective changes improved their own
target but not molecules on both systems. Screen: a "slot machine" or scatter: x = improvement of the
line's own objective (e.g. gradient-variance −52–66%, risk −11%, potential error −39%), y = change of BBA
size W1 (e.g. +0.153/+0.099 Å likelihood weighting; +0.245 Å potential supervision; −0.12/−0.18 Å
physical-sensitivity loss) with a gray band of ±0.046 Å identical-initialization spread. Compute: L.
Pitfall: different budgets/metrics; the synthesis says no objective change at 10,000 updates improved
size by more than 0.18 Å.

**V25. "The kernel teacher points at one frame."** Insight: the exact empirical score at small noise is
a nearest-frame force (N_eff ≈ 1), so it memorizes rather than teaches. Screen: point cloud with a
query; Gaussian weights shrinking onto one point as τ decreases; force arrows of network (244 Å⁻¹) vs
kernel (23,544 Å⁻¹) for whitening at t = 0.01. Compute: A (E21) + L. Pitfall: the kernel is exact for the
finite source, not the population.

**V26. "Complete local, learn global" (factorized densities).** Insight: bonds can be filled in by a
conditional Gaussian (better than a network), angles cannot on a 28-bead chain. Screen: a chain where
bonds snap into place from a Gaussian; then completing angles too makes the far end swing (2.86 Å vs
0.162 Å nonadjacent RMS change), while the likelihood score *improves* by 9.99 nats/frame. Compute: A
(lever-arm toy) + L. Pitfall: different model family (MADE density) from diffusion.

**V27. "Order matters for autoregression too."** Insight: deciding torsions first improves BBA size
(0.865 → 0.713 Å) but worsens angles (+54.8%) through exposure bias. Screen: generation order animation
(angles-first vs torsions-first vs interleaved) with three gauges. Compute: L. Pitfall: global shape
stays far off (0.69 Å vs 0.062 Å variation) in every order.

### Act V — the payoff

**V28. "Readable windows" (the bridge to range and order).** Insight: what matters is *when* noise
erases *what*. Screen: horizontal bars of $t_{\rm half}$ for bonds/angles/torsions/Rg/long-range
distances per map (Cartesian 0.0004/0.05/0.08/0.47/0.44; C3 0.26/0.35/0.35/0.27–0.28/0.24; whitened
0.26/0.33/0.29/0.35/0.33) against the trained range [0.01, 1]; Cartesian = order without range, C3 =
range without order. Compute: A ($t_{\rm half}(\lambda)$ formula; BBA spectrum spans 1,423×) + L (Table 4 of
range-and-order). Pitfall: values are lower bounds from one predictor; this belongs mainly to the
next era's report.

**V29. "Whiten the stiff, leave the fold loud."** Insight: un-whitening the collective modes restores
order: Rg W1 0.51 → 0.19 → 0.12 → 0.08 Å as the whitening exponent γ goes 1 → 0.5 → 0.25 → 0; two loud
modes appended to C3 give 0.11 Å with C3-level bonds. Compute: L. Pitfall: next-era result (#1057/#1069);
populations, torsions and overlaps did not follow the dial.

**V30. "The map zoo grows with the molecule."** Insight: dimensions and decode failures explode with
redundant maps. Screen: feature dimension per map for ALDP5/BBA (Cartesian 12/81, internal 11/103,
springs 16/134, whitening 14/3,303, wδ 16/379) as growing bars, with decode-failure counts. Compute: L.
Pitfall: Sprint 11 springs had 108 BBA channels (27 distances + √30 × 81), Sprint 12 has 134.

**V31. "Different rulers for different jobs."** Insight: the low-dimensional (φ, ψ) sheet is visible in
raw Å (local dimension 2.0 at 0.4 Å) but not in thermal units (no plateau). Screen: local-dimension vs
scale curves for both rulers, with the participation-ratio formula (E17). Compute: L + A. Pitfall:
smallest-scale values are sampling-limited (median PR 6.0 with 20 points for isotropic 9-D data).

---

## 7. Open questions, caveats, contradictions and superseded interpretations

### 7.1 Superseded interpretations (with dates)

1. **Lag sweep: "synchronized erasure" → "Gaussianization" (2026-11-05, same day).** The lag sweep
   attributed the 100 ps warp's 100-update win to synchronized erasure (note 20 E4); the soft-scale
   sweep refuted that as a rescaling effect (γ = 2 is slower, not faster) and measured near-Gaussian
   training data in the 100 ps coordinates. The lag-sweep document keeps its measurements and adds
   a correction pointer; its main finding, §3 last paragraph, verdict item 3 and practical meaning
   "should be read with that correction". Note 25's lag dictionary stays correct as a statement of
   what the step covariance measures.
2. **#1025's lever-arm explanation of the internal-coordinate size error (2026-11-11) → missing
   collective coupling (#1055, 2026-11-12/13; consolidated 2026-11-14).** #1025 said Rg depends on
   dozens of torsion channels whose small independent errors add up along the chain; #1055 found
   that noise of the size C3's torsion distributions allow gives at most 0.14 Å Rg W1, not 0.49 Å:
   "Not error accumulation along the chain … This corrects the explanation given in #1025."
3. **#1025's Cartesian "invisible distances" claim was refined by #1026**: on clean molecules bonds
   are exactly linear in the Gram inputs; above t ≈ 0.01 they are unreadable because of the noise,
   not the encoder.
4. **Whitening's apparent torsion advantage (#995) was a histogram-bin artifact** (bins following
   each candidate's range); on a fixed grid it disappears (#999, 2026-11-10).
5. **PR #895's 2,000-sample spring PMF advantage reversed at 100,000 samples** (6.18 vs 6.57 at 2k;
   0.582 vs 0.560 at 100k) → workflow rule on generation counts (2026-11-14 closeout).
6. **BBA "1 ps" pairs are 200 ps chords.** Documented as 200 ps per frame already in the bead
   campaign (2026-11-06: "lag 100 = 20 ns"), but the invariant-embedding line built "1 ps" local
   targets from adjacent frames until #999 (2026-11-10) found all 162 segment boundaries imply
   200 ps; status records it 2026-11-14. "Every lag-based result on BBA must be read with that"
   (whitening of PR #895 used "adjacent-frame increments"; Sprint 12 whitening "authenticated
   one-frame displacement pairs").
7. **Learned-warp design doc: bgmol source "too coarsely saved" was a misreading** (re-derived
   2026-10-27): after alignment the consecutive-frame gaps are 0.18 Å (bgmol) vs 0.155 Å (mdshare).
8. **Diffusion pilot: inverse amplification "1.7–143" → "1.2–6.5 / 2.4–15.8"** (earlier values used the
   full inverse after realignment, adding the alignment flip).
9. **Feature-space pilot GPU numbers superseded** (XLA miscompiled the final denoising step; #765,
   2026-10-26/27).
10. **Bead campaign BBA prediction "springs cut bonds ≥10× vs flat" refuted** (1.4×, because the bead
    flat arm learned bonds far better than the grouped flat arm) — not a contradiction of the 52×
    of PR #895, which compared against a much weaker flat model.
11. **Retention-map optimism (ALDP5, 2026-11-05) did not transfer**: the same objective with the bead
    model hurt every BBA representation (#955).
12. **The theory note numbering changed in consolidation**: the score-ease note was "27" on PR #1023's
    branch and is note 28 on main; note 27 on main is readable windows (#1064).

### 7.2 Apparent contradictions to keep visible

- **"Warps are best on BBA slow coordinates" (bead campaign, #971) vs "lag warps are not competitive"
  (Sprint 12 first chunk).** Different networks (width-64 bead transformer, batch 128, 200k updates,
  t_min 10⁻⁵ vs ScoreMD-sized invariant transformer, batch 1,024, 190,350 updates) and readouts; the
  historical dossier keeps the lag warps as core candidates for a fair rerun. Neither result is a
  coordinate-only ranking.
- **"Springs: best ALDP5 force field" vs "springs: failed on BBA".** On ALDP5 the global RMS divisor
  is 1.31; on BBA 27.1 (§5.2). The construction, not the idea, failed on BBA; prior-matched springs
  gave floor-level bonds (0.0024 Å) — but no global gain.
- **"Internal coordinates have the best BBA population JS" (0.0124) yet the worst size** — a low
  projected TIC score does not certify whole-chain packing (dossier). Pooled Rg W1 can also hide
  compensating errors (untrained model has the data's mean size through self-overlapping chains).
- **"Higher retained information predicts faster learning" (ALDP5 retention study) vs "readable
  windows did not predict how fast global structure is learned" (#1026)**: the first concerns stiff
  modes on ALDP5, the second BBA global shape.
- **Status (2026-11-14) "Cartesian with pair-distance inputs: overlap 4%" vs Sprint 12 "BBA
  severe-collision 682 / 100,000"**: different overlap definitions (3.5 Å "overlap" vs 1 Å "severe
  collision").

### 7.3 Open questions (as of the sources)

- Do the coordinate gaps persist at full schedule (1,903,500 updates)? On ALDP5 early gaps closed;
  on BBA they held from 50,000 to 190,350 updates (status 2026-11-14).
- Is the 100 ps warp's plateau a defect of fitting a Gaussian step model to hopping steps, or intrinsic
  to Gaussianization? (Rare-barrier surplus is "the warp's own"; a heavy-tailed/mixture step
  likelihood was never tested.) Would joint (φ, ψ) Gaussianization reach 0.027 at 100 updates without
  the late plateau? (Not run.)
- Cause of the learned warp's residual κ above the floor (curvature, capacity, non-Gaussian steps,
  lag) — open; a chart-free E(n)-equivariant flow (#771) was proposed, not built.
- Why do redundant invariant maps lose populations even at full rank — off-image noise, projection
  decoder, or rotation removal? (A matched test is proposed in the Sprint 11 closeout.)
- Whether truly short-lag BBA data would change local targets — no such data exist in the project.
- Force quality of internal-coordinate models at small t (trained only to t = 0.01); a matched-blur
  protocol is needed. All BBA force fields still drift in size over 100–500 ps (later eras).
- Whether objective changes (e.g. physical-sensitivity weighting, the only loss with a clear BBA size
  gain) help once the coordinates have order — explicitly deferred.
- Equilibrium populations: BBA folds on microsecond time scales; no simulation run so far is long enough.
- Novelty: per-coordinate noise levels and readable windows exist in the literature (images; Pan et al.
  2026 closest per note 27); the combination with explicit stiff coordinates and force extraction is
  what remains to be shown (status).

### 7.4 Caveats for anyone animating these results

- Never show an ALDP5 learning-speed factor as a BBA factor; never show updates as wall time (map
  fitting, decoding by projection and compilation differ by map; e.g. whitening BBA final decode
  1,649.89 s vs internal 7.86 s).
- Untrained (step-0) quality is the map's prior, not learning (100 ps warp bonds at the floor
  untrained; internal-coordinate bonds at the floor at step 0; BBA spring-base bonds right from step 0).
- Population scores need matched sample counts and floors; 2,000-molecule BBA panels cannot rank.
- Simulation readouts from MD starts mostly preserve the starting set; compare to noise-only controls.
- "Decoded" means numerically reconstructed, not chemically valid; failures stay in the denominator.

---

## 8. Sources read

**Repository snapshot** (`/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/rg-main/docs`):

- `status.md` (full).
- Design (full): `design/learned-stiffness-warp.md`, `design/local-moment-refinement.md`,
  `design/internal-chain-noising.md`, `design/internal-chain-ou.md`,
  `design/internal-chain-reverse-flow.md`, `design/automatic-internal-coordinates.md`,
  `design/angular-tree-transport.md`, `design/static-population-density.md`,
  `design/weighted-endpoint-evolution.md`, `design/thermal-submanifold.md`,
  `design/driver-recommendations.md`.
- Investigations (full): `learned-warp-lag-sweep.md`, `spring-soft-scale-sweep.md`,
  `torsion-gaussianization.md`, `bead-matched-campaign.md`, `bead-force-field-simulation.md`,
  `bead-candidates-comparable.md`, `learned-embedding-objectives.md`,
  `learned-stiffness-diffusion-pilot.md`, `covariance-aware-prediction.md`,
  `automatic-chart-sprint12.md`, `automatic-coordinate-conservative.md`,
  `automatic-thermal-density.md`, `autoregressive-density-and-thermal-completion.md`,
  `chemical-local-references.md`, `objective-search-synthesis.md`, `bba-leaderboard-study.md`,
  `bba-simulation-diagnosis.md`, `bba-force-learning-assessment.md`, `bba-kernel-force-diagnostic.md`,
  `retraction-downstream-857.md`, `rao-blackwell-dsm-857.md`, `diffusion-time-sampling.md`,
  `energy-head-and-auxiliary-objectives.md`, `configuration-vector-pilot.md`,
  `bba-local-geometry-preconditioning.md` (consolidated #1025/#1026/#1023/#1048/#951),
  `sprint11-pullback-campaign-closeout.md` (#895/#899/#911/#955/#960).
- Investigations (partly): `bba-range-and-order.md` (top, §§1–4), `sprint12-network-inputs-and-baselines.md`
  (main outcomes, distance edges, native ScoreMD), `invariant-feature-selection.md` (main outcomes),
  `information-retention.md` (learned coordinate maps section).
- Sprint 12 (full): `sprints/sprint12/README.md`, `protocol.md`, `matched-results.md`,
  `global-geometry-study.md`, `production-selection.md`, `candidates/README.md`,
  `candidates/theory-and-evidence.md`, `candidates/internal.md`, `candidates/cartesian.md`,
  `candidates/trajectory-springs.md`, `candidates/invariant-whitening.md`, `candidates/wdelta.md`,
  `candidates/historical-candidates.md`, `candidates/cartesian-covariance-base.md`; skimmed results
  sections of `candidates/cartesian-linear.md`, `springs-linear.md`, `whitening-linear.md`,
  `analytic-quantum-springs.md`.
- Theory: `theory/28-score-ease-and-thermal-preconditioning.md` (full), `theory/25-information-geometry-lag-noise-posterior.md`
  (§§0, 2, 3), `theory/24-local-moment-metric-loss.md` (setting and trace derivation).
- Figures viewed: `investigations/bead-matched-campaign/bba_learning_curves.png`,
  `investigations/learned-stiffness-warp/stiffness_aldp.png`.

**Archive** (`.../scratchpad/rg-archive/docs`): `status.md` and `roadmap.md` grepped for BBA
milestones (M2 #283, M4 #284); the archive ends 2026-10-22, before this era.

**GitHub (read-only)**: PR #1025 body (`gh pr view 1025`; state CLOSED 2026-11-14, not merged;
consolidated by #1078); dates/states of PRs #753–#1100 from `gh pr list` / `gh pr view` (e.g. #753, #754,
#765 merged 2026-10-27; #895 created 2026-11-01; #936/#938/#941 created 2026-11-05, consolidated in
#950 merged 2026-11-12; #954 merged 2026-11-12; #983 merged 2026-11-10; #1075–#1086 merged
2026-11-16).

**Checks run** (scratchpad `r4checks/`): `checks1.py` (VP schedule, $t_{\rm half}$, Rg² identity, lag
dictionary, participation ratio, note-28 peak slope, OU increments), `checks2.py` (excess-loss table),
`chain_mc.py` (chain-collapse toy Monte Carlo), `helix.py` (line vs helix posterior variance).
