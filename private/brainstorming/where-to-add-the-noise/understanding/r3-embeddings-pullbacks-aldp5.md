# R3 · Era 3 — Embeddings, pullbacks and the ALDP5 successes

Reader `r3-embeddings-pullbacks-aldp5`, written 2026-11-19. Sources: the origin/main
snapshot (`rg-main`), the archive tag `archive/pre-cleanup-2026-10-23` (`rg-archive`),
GitHub PR/issue metadata (read-only `gh`), historical blobs reachable in the local checkout
(`git show 92aecbd6:…`) and, for one figure-ready data set, the local ignored run store
`runs/theory-curved-pullback-2026-10-25/` (read-only). Paths below are relative to
`rg-main/` unless stated. "[derived here]" marks small calculations I added; everything
else is quoted from the named source.

## 0. The era in one paragraph

From 2026-10-23 to about 2026-11-06 (Sprint 11, tracker #769) the project stopped
integrating geodesics of a metric on configuration space and instead looked for a **map
φ into a flat (Euclidean) feature space** whose pullback metric $G=D\varphi^\top D\varphi$
measures every molecular direction in its own thermal width. Diffusion then runs as an
ordinary variance-preserving Gaussian process *in the feature space* (closed-form kernel,
no geodesic ODE), and generated feature vectors are projected back onto valid molecules.
Theory (notes 22–23, 2026-10-25) showed that a flat map of *equal* dimension can never
reproduce the curved thermal metric exactly (with quantified, mostly small, errors on
ALDP5), but that a map into a flat space of *higher* dimension can: the spring-force metric
and wδ are already exact pullbacks of such feature spaces. On the five-bead dipeptide ALDP5
this worked very well for the stiff degrees of freedom: spring features put bond errors at
the data floor about 100× sooner than the best flat model (≈2k vs 200k steps), angles
10–20× sooner, forces read from the same models passed a stiff-direction force check and
gave the best bonds/angles in Brownian dynamics, and the same stiff-mode benefit was
reproduced by trajectory-fitted springs, data-free quantum springs, a shared
quantum-trained map, an invariant (alignment-free) embedding, global whitening of invariant
features and source-trained graph metrics. What it never did: make torsions,
rare-basin (αL) populations or equilibrium sampling better, or transfer reliably to unseen
molecules (AC, BBA). On the 28-bead protein BBA the same maps improved bonds (springs 52×
in #895) but not global structure, and in Sprint 12 they failed for diagnosable reasons
(scale, redundancy), which led to the range-and-order picture of the next era.

---

## 1. Narrative (chronological)

### 1.1 Starting point (before 2026-10-23)

- **wδ was always a chord in a flat feature space.** `docs/theory/01-metric.md` defines
  $F(X)=((\log r_{ij})_{i<j},\sqrt\delta\log\det G_X)$ and
  $w^\delta(X,Y)=\|F(X)-F(Y)\|$ (`s_distance` returns this *feature chord*); the
  Riemannian metric is the pullback $H_X=J_X^\top J_X$. The earlier eras (other readers)
  used the *intrinsic* geometry of that curved image (Exp/Log, geodesic noising), with the
  numerical trouble described elsewhere. The key reinterpretation of this era is that one
  can diffuse in the ambient feature space itself.
- **Sprint 10 (#520, closed 2026-10-22)** qualified metrics and kept flat Cartesian as the
  default: "no candidate established a reproducible joint advantage in generation,
  physical forces, density/populations and cross-molecule transfer" (archived
  `status.md`, 2026-10-22). Relevant pullback precursors (archived status):
  - `local_chemical_v1` (#524): positive Euclidean base plus fixed graph features with
    weights (4,1,1) (`docs/design/chemical-feature-metric.md`); it has a uniform
    conditioning bound and therefore *cannot* remove stiffness ratios much larger than
    $1+144D$ (§2.10).
  - Exact chemical pullback admission #624 (2026-10-20) and learned exact chemical
    deformations #629 (2026-10-20): "Linear/nonlinear maps improve bond W1 22.2%/28.4%
    against fresh flat controls in all three seeds, but neither passes the declared joint
    population rule".
  - Near-neighbour pair pullback #655 (2026-10-21).

### 1.2 The reframing that set up the era: note 20 (2026-10-23; PR #745 merged 2026-10-24)

`docs/theory/20-thermal-metric-foundations.md` (covered in depth by reader r2) asked what a
metric should do and made five points that this era built on:
1. **E4, synchronized noise** — only the *forward noise* can make every mode lose its
   information at the same rate; a target or loss cannot (§4.6).
2. **The spring-force metric** $G=J_d^\top WJ_d+\gamma I$ is the primary candidate,
   residual stiffness 8–13 against 97–192 flat on ALDP5 windows (§5.3); it is curved
   ("a cone", §5.2), which "matters only if it also shapes the noise".
3. **Pullbacks** (§6): an explicit equivariant diffeomorphism Φ to a space with a natural
   metric transfers metric *and* process; Proposition 3 gives the exact pullback OU kernel.
   The converse: "Exact Gaussian denoising targets with metric-shaped noise therefore
   require a flat pullback metric."
4. **Internal coordinates were demoted to an ablation** (§6.2) because they "are not
   available for every molecule". (Irony noted in §7: by 2026-11-14 internal coordinates
   plus loud modes became the working hypothesis.)
5. Force-field argument (§8): in a linear ALDP5 test, "soft forces about 4.4× more accurate
   with stretched (pullback) noise; 500 frames match flat fits on 10,000, a 19× gain";
   omitting the pullback Jacobian term "shortens ALDP5 bonds by 0.30–0.36 thermal widths".

### 1.3 First pullback: the learned stiffness warp (#753, #754; 2026-10-24 → merged 10-27)

`docs/design/learned-stiffness-warp.md`. An invertible coupling flow φ on the 9
Kabsch-aligned slice coordinates, $W(x)=\bar c+(m+V\varphi(u))R^\top$, fitted so that
1 ps trajectory steps are isotropic Gaussian in $z=W(x)$ — i.e. an *equal-dimension flat
pullback*. Held-out median step anisotropy κ: flat 184/185, constant whitening 24.6,
scaled internal coordinates 3.88/3.95, learned 2.99/3.04, isotropy floor 1.55 (ALDP10:
1780 → 3.62/3.68, floor 2.24). Under flat noise, Cartesian bonds deviate by one 1 ps width
at 7.8–9.0× less noise than (φ, ψ); through the warp the spread is 1.00–1.14. Costs: the
inverse has no preimage for 3.6–7.8% (ALDP5) of decodes at noise 3c, and a discontinuous
**alignment cut** (jumps of 4.7–6.6 Å within ~0.1 Å of data). #754 (CPU pilot): bonds and
angles learned within ~1,000 steps vs 100k–200k for low-floor flat; production-floor flat
bond PMF error 1.2 kBT vs 0.06; no torsion or data-size gain (`status.md`, Sprint 11).
Later (#773, 2026-10-27): 13 of #754's 18 broken molecules lie just inside the chart
boundary and 5 beyond it.

### 1.4 Theory catches up: notes 22 and 23 (#755; written 2026-10-25, merged 2026-10-27)

- **Note 22** (`docs/theory/22-flat-pullback-obstruction.md`): "The idea under test is to
  learn a map φ into a flat space of the same dimension … Such a φ is a change of
  coordinates", so it can only reproduce flat metrics; every metric of interest (Euclidean
  shape metric, spring metric, anharmonic Hessians, inverse-covariance metrics with
  bond-length-independent angular widths) is curved. It quantifies the unavoidable error
  (Theorem 4: ≥ $K\rho^2/12$, achievable ≈ $K\rho^2/3$) and evaluates it on ALDP5: a few
  percent within a basin, heuristically 3–20% over the populated torsion landscape, order
  one for a whole bond-orientation sphere (equivariant maps) or the whole torsion torus.
- **Note 23** (`docs/theory/23-curved-pullback-targets.md`): measures how curved ALDP5's
  spring metric is (typical $7\times10^{-3}$ per squared thermal width, radius ≈12
  widths), separates three roles of a target space (curvature, topology, tractability),
  and — the decisive design insight — §4.3 "the Nash route": with extra dimensions the
  image is a curved surface in flat space, and "the spring-force and $w^\delta$ metrics are
  of this kind". Flat noise there is metric-shaped to first order with an exact Gaussian
  kernel, at the price of projecting back.
- **#756 (2026-10-25, closed)** tried a *learned* curved embedding $F=(\varphi,h)$ with
  m extra coordinates and a bending cap: held-out NLL ≈0.45 nats per step pair better than
  the flat warp (capped m = 3: −11.78/−11.65 vs warp −11.33/−11.21), but κ rose ~5% and
  the uncapped fits were not normalized. Closed because the invertible first block forces
  φ to be injective; follow-up #780 (PR #756 body; #769 table).

### 1.5 Feature-space pilots and the GPU bug (#757, #760, #763 → #765; 2026-10-25 → 10-27)

#757 (2026-10-25) diffused in the 16-dimensional spring and wδ feature spaces (two seeds,
200k steps, 20,000 molecules per checkpoint); #760 tested projection during the last 100
reverse steps; #763 dense early checkpoints. All three reported a "late-training
degradation" of the feature-space arms. On 2026-10-26 #765 traced it to the GPU: "XLA
miscompiled the final denoising step x₀ = (x − σ·ε̂)/α: with JAX x64 on and t a
compile-time constant, it subtracted the network's final-layer bias b instead of σ·b"
(`docs/investigations/feature-space-diffusion-pilot.md`). Every GPU molecule was shifted by
the same 0.018 Å (flat arm, 5k steps). Fix: the final step became a separate compiled call
with runtime t; CPU and GPU then agree to a median 1.4×10⁻⁷ Å. The earlier explanation
by float32 round-off of σ was wrong (#764 fix is correct but moves atoms by 1–6×10⁻⁷ Å).
#765 (merged 2026-10-27) re-ran everything under a pre-declared protocol with three seeds
(`docs/investigations/feature-space-evaluation.md`): the headline results of §4.1.

### 1.6 Forces, simulation and joint metrics (#768, #781; 2026-10-27)

#768 read forces out of #765's models and ran Euler–Maruyama Brownian dynamics
(`docs/investigations/force-field-simulation.md`): metric-shaped models pass the
stiff-direction force check, give the best simulated bonds/angles, and resolve the "flat
dilemma" (§4.3). #781 (`joint-distribution-metrics.md`) confirmed the stiff result
jointly (classifier AUC 0.502/0.504 for spring/learned after 1,000 steps), found no
handedness errors, and showed that torsion/rare-basin metrics cannot rank the arms because
the reference trajectories themselves differ.

### 1.7 Sprint 11 registered (#769, opened 2026-10-27) and three parallel lines

The tracker posed four questions: can a flat map reproduce the stiffness metric (theory);
can it be learned (warp) or written down (spring/wδ feature spaces); does metric-shaped
noise beat a strong flat baseline; what is the soft structure. New issues on 2026-10-27:
#771 (alignment-free warp), #778 (data-free springs), #780 (higher-dimensional embedding
without an invertible block), #782 (direct tensor learning). Twenty-nine PRs (#783–#811)
were opened on 27–28 October in four stacks.

**(a) Data-free springs from quantum curvature (#778; consolidated #786, #797, #866,
merged 2026-11-03).** #788 (evidence 2026-10-28): one GFN2-xTB calculation on the complete
22-atom ALDP structure gives the harmonic covariance, propagated to bead features
(historical report `energy-curvature-spring-features.md` at `92aecbd6`); predicted bond
SDs 0.0246–0.0336 Å vs measured 0.0252–0.0307 Å; but its pre-declared qualification gate
failed (worst-anchor projection energy 95.05%/92.88% < 98%). #789 showed with exact controls
that the finite-lag readouts were themselves insufficient tests. #790 balanced torsional
curvature across nine references and passed (median/worst residual ratio 6.75/12.58 vs
Cartesian 159.27/1030.50). #791 trained diffusion with the frozen 26-feature map: bond
errors 32–46× smaller than an MLP Cartesian baseline; #793 (rotation-equivariant
denoisers) narrowed that to 1.7–2.4×. #794 corrected a source error: protein inputs in the
original graph screen were ScoreMD-generated dummy conformations (2026-10-28). The general
construction (#797–#853) and the shared quantum-trained predictor (#866/#875/#881/#885)
followed; #911 (2026-11-03) failed to build a BBA reference (proton transfer in vacuum).

**(b) Alignment-free invariant thermal embedding (#780; #784 → #810, plus #815, #826,
#864, #865, #873, #877, #883, #884; 2026-10-27 → 10-31).** #784: 10 Gram products + 4
signed volumes of five beads, an ambient coupling flow, fitted with a wrapped
internal-coordinate Gaussian step likelihood (the first, tangent-projection objective
failed normalization). #787/#792: generation and forces at 20k and 200k. #796/#800:
comparisons with main's evaluators and training curves. #808/#810 (2026-10-28 → 10-30):
the important ablation — *global whitening* of the invariants already gives most of the
benefit. #815/#826: chemistry-only and chemistry+torsion variants (inadequate overall).
#864: three general graph feature maps failed a conditioning gate. #865/#873/#877/#884:
source-trained graph-motif weights, competitive on ALDP5 without target metric fitting,
poor on the unseen minipeptide AC.

**(c) Force-history and graph-energy coordinates (#785/#795/#804/#806; consolidated #785,
merged 2026-11-04).** UFF-typed explicit features cut ALDP5 1 ps anisotropy 132.44 → 3.15
and improved early learning, but flat caught up and extracted-force simulations were
unstable or wrong.

A rotation-treatment study of flat itself (#823, 2026-10-28 → 11-02) strengthened the
baseline: alignment and exact equivariance both improved iid generation over a
rotation-augmented energy MLP, and the exactly equivariant model's bond error was "about
2.65 times smaller than augmentation's" (.03624/.03426 vs .09211/.09456 thermal widths);
none of the three flat recipes gave reliable force-driven sampling.

### 1.8 The 34-model comparison (#886; 2026-10-30 → merged 2026-11-03)

Seven frozen maps (trajectory spring, wδ, invariant whitening, aligned flat, centred
Cartesian, endpoint φ #882, transferred graph φ #877) × {MLP, conservative feature
transformer} × 2 seeds = 28, plus a six-model extension (analytic quantum springs, shared
quantum φ and a fixed-scale Cartesian control): 34 denoisers, 200k updates each, 748
stage readouts (`docs/investigations/supervisor-metric-comparison*.md`). Result: earlier
stiff-mode learning and simulated widths near MD for every stiffness-aware map; no
torsion or equilibrium winner (§4.4).

### 1.9 Late Sprint 11 on ALDP5 (2026-11-05/06)

- Soft-scale sweep of the spring space (γ = 30, 8, 2): bonds/angles at the floor from 100
  updates at every γ; synchronizing the torsions with the bonds by lowering γ *slowed*
  early torsion learning (JS after 100 updates 0.133/0.149/0.163 vs flat 0.117)
  (`spring-soft-scale-sweep.md`).
- Intrinsic spring noising (#947, merged 2026-11-06): following the embedded image with a
  retraction instead of ambient Gaussian noise was cheaper than geodesics but gave worse
  molecules (angle error 10.8× spring DSM) at ~2.3× the cost; decision: "retain ordinary
  Gaussian spring-feature denoising" (`retraction-downstream-857.md`).

### 1.10 Scaling to BBA and the hand-off (2026-11-01 → 2026-11-16)

#895 (2026-11-01): six maps on real BBA, conservative grouped-feature transformer, 200k
updates: springs 52× better bond W1 (0.0122 vs 0.6371 Å) with slightly better TIC JS
(0.0479 vs 0.0529), but high-dimensional maps (whitening 3,303 features) worst globally,
partly due to a rank-1,792 input bottleneck (#899). Retention maps and chemical warps
(#955/#960, 2026-11-06) gave early local gains that faded. Consolidated closeout
(2026-11-14, `sprint11-pullback-campaign-closeout.md`): "Stiffness removal transfers to BBA
as a *local* effect". Sprint 12 first chunks (2026-11-09) found BBA springs and whitening
failing outright; #1025/#1026 (2026-11-11) diagnosed why (springs: "right balance, wrong
scale"; whitening: noise mostly off the molecular image), and the range-and-order decision
followed (2026-11-14, `status.md`).

---

## 2. Core mathematics

### 2.1 Spaces and "thermal units"

- Centred configurations $V=\{x:\sum_ix_i=0\}\cong\mathbb R^{3N-3}$, shape space
  $\mathcal M=V_{\rm reg}/\mathrm{SO}(3)$, $\dim\mathcal M=3N-6$ (9 for ALDP5: 4 bonds,
  3 angles, 2 torsions). Reflections are not quotiented (chirality kept) (note 20 §1.1).
- A metric in Å⁻² (e.g. $W=\beta k$) makes lengths dimensionless: a length of 1 is one
  **thermal width**. Curvatures are quoted "per squared thermal width"; the radius of
  curvature is $1/\sqrt K$ thermal widths (note 22 Labels).
- ALDP5 rulers (note 20 §1.4, 200,000 frames): bonds 0.025–0.030 Å (βk 1,100–1,660 Å⁻²),
  one–three distances 0.047–0.058 Å (300–460 Å⁻²), torsional displacement ≈0.2 Å in one
  basin (≈25 Å⁻²), ≈0.7 Å across all data (≈2 Å⁻²); aligned covariance condition number
  ≈920. Principal-direction widths of held-out ALDP5 (force-field evidence JSON,
  `mode_std_A`): 0.0252, 0.0294, 0.0419, 0.0543, 0.0654, 0.1234, 0.1851, 0.3452,
  0.6631 Å.

### 2.2 Pullback metric, feature chord and geodesic distance

- Pullback of $h$ on $N$ by $\varphi$: $(\varphi^*h)_x(u,v)=h(D\varphi\,u,D\varphi\,v)$; for
  Euclidean $h$, $G_\varphi=D\varphi^\top D\varphi$ (note 23 §1). With normalized diffusion
  coordinates $\varphi(x)=(F(x)-b)/a$: $J_\varphi=DF/a$ and
  $\|\varphi(x+\Delta x)-\varphi(x)\|^2=\Delta x^\top G_\varphi(x)\Delta x+O(\|\Delta x\|^3)$
  (supervisor-metric-comparison-mathematics §1). Full column rank is required; invariant
  maps have six rigid null directions, so $G$ is positive only on the 9 shape directions.
- **Chord ≤ geodesic.** $w_\varphi(x,y)=\|\varphi(y)-\varphi(x)\|$,
  $d_g(x,y)=\inf_\gamma\int_0^1\sqrt{\dot\gamma^\top G_\varphi\dot\gamma}\,dt=\inf_\gamma\mathrm{Length}(\varphi\circ\gamma)$,
  hence $w_\varphi\le d_g$; for a unit circle, chord $2\sin(|\Delta\vartheta|/2)$ vs arc
  $|\Delta\vartheta|$ (ibid. §2). For wδ:
  $w^\delta(x,\mathrm{Exp}_x(ru))^2=r^2-\tfrac1{12}\|\mathrm{II}_x(u,u)\|^2r^4+O(r^5)$, $\|u\|_g=1$,
  with II the second fundamental form of the feature embedding (`01-metric.md`).
- **wδ explicitly** (`01-metric.md`):
  $$w^\delta([X],[Y])^2=\sum_{i<j}\Big(\log\frac{r_{ij}(X)}{r_{ij}(Y)}\Big)^2+\delta\Big(\log\frac{\det G_X}{\det G_Y}\Big)^2,\qquad
  \|V\|_g^2=\sum_{i<j}\frac{((x_i-x_j)\cdot(v_i-v_j))^2}{r_{ij}^4}+\delta\,(d\varphi_X[V])^2 ,$$
  i.e. relative (log) deformations of every pair distance, so wδ weights distances by
  inverse length, not stiffness (feature-space evaluation §5 item 3).

### 2.3 Why embed: the exact pullback OU process and its converse (note 20 §6.1)

**Proposition 3 [D/N].** If $y=\Phi(x)$ (equal dimension, diffeomorphism) follows an OU
process:
- exact kernel $p_t(x\mid x_0)=\mathcal N(\Phi(x);\alpha_t\Phi(x_0),\sigma_t^2I)\,|\det D\Phi(x)|$;
- score conversion $\nabla_x\log p_t=D\Phi^\top s_y+\nabla_x\log|\det D\Phi|$;
- $x_t$ is reversible preconditioned Langevin dynamics with diffusion matrix $G_\Phi^{-1}$
  and stationary density $\mathcal N(\Phi(x);0,I)|\det D\Phi(x)|$ (checked to $10^{-10}$);
- the Euclidean score of $y$ is the Riemannian score of $G_\Phi$ in an orthonormal frame.

**Converse [S/D].** A metric is locally a Euclidean pullback iff it is flat (Wendl Thm.
27.3); by Varadhan's formula Gaussian kernels in some coordinates force
$d_G(x,x_0)\propto\|\Phi(x)-\Phi(x_0)\|$, i.e. flatness. So exact Gaussian denoising
targets with metric-shaped noise need a flat pullback — which is exactly what notes 22–23
then test.

**What metric-shaped noise buys (E4).** With noise covariance $\sigma_t^2N^{-1}$, per mode
$I(x_{0,k};x_{t,k})=\tfrac12\log(1+\mathrm{SNR}_k)$, $\mathrm{SNR}_k=\alpha_t^2/(\sigma_t^2\tilde\lambda_k)$,
$\tilde\lambda_k$ the eigenvalues of $N^{-1/2}\beta HN^{-1/2}$; all modes lose information
at the same rate iff $N\propto\beta H$. Under flat noise the signal fraction is
$r_k=\alpha_t^2\sigma_k^2/(\alpha_t^2\sigma_k^2+\sigma_t^2)$ and a mode is half-erased at
$\sigma_t=\alpha_t\sigma_k$: "about 0.025 Å for a bond, 0.5 Å for a torsion" (note 20
§4.6).

### 2.4 Higher-dimensional flat targets: spring and wδ feature spaces (note 23 §4.3)

- **Spring-force metric** (note 20 §5.1):
  $$G(x)=J_d(x)^\top WJ_d(x)+\gamma I,\qquad \|u\|_G^2=\sum_{(i,j)}w_{ij}\big(\hat r_{ij}\cdot(u_i-u_j)\big)^2+\gamma\|u\|^2,$$
  $J_d$ the rigidity matrix of the selected pair distances, $w_{ij}=\beta k_{ij}$ (bonds,
  one–three pairs), $\gamma\approx1/\sigma_{\rm soft}^2$ ("about 25–40 Å⁻²" within an
  ALDP5 basin). $J_d^\top WJ_d$ is the Gauss–Newton part of a pair-potential Hessian
  (no prestress term), so $G$ is positive definite everywhere.
- **It is an exact pullback of a flat space of higher dimension [D]:**
  $F(x)=(W^{1/2}d(x),\sqrt\gamma\,x)\in\mathbb R^{P+3N-3}$,
  $DF=\begin{pmatrix}W^{1/2}J_d\\\sqrt\gamma I\end{pmatrix}$, so $F^*\delta=DF^\top DF=J_d^\top WJ_d+\gamma I=G$.
  The wδ metric is likewise the pullback of its invariant embedding.
- **Why such a pullback can be curved [S/N]: the Gauss equation.** With
  $\mathrm{II}(u,v)$ the normal part of $D^2F[u,v]$,
  $$K(u,v)=\frac{\langle\mathrm{II}(u,u),\mathrm{II}(v,v)\rangle-\|\mathrm{II}(u,v)\|^2}{\|u\|^2\|v\|^2-\langle u,v\rangle^2};$$
  in equal dimension there is no normal direction, so $K=0$.
- **Noise in feature space [D/H].** For $y=F(x_0)+\sigma\varepsilon$, the nearest image
  point is $x_0+(DF^\top DF)^{-1}DF^\top\sigma\varepsilon+O(\sigma^2)$, with covariance
  $\sigma^2G^{-1}$: metric-shaped noise to first order with an exact ambient Gaussian
  kernel. Prices: noisy points leave the surface; dimension grows (7 + 12 = 19 instead of
  12, or 16 instead of 9 with the aligned slice of the pilots); the score is large normal
  to the surface at small noise; samples need a projection, e.g.
  $\arg\min_x\|W^{1/2}d(x)-y_d\|^2+\|\sqrt\gamma x-y_x\|^2$; chordal distances still differ
  from geodesic ones by at least order $K\rho^2$, so curvature reappears at noise levels
  comparable to the curvature radius.

### 2.5 The flat-pullback obstruction (note 22)

- **Proposition 1 [S/D].** If $\varphi:U^n\to\mathbb R^n$ and $\varphi^*\delta=g$ on an
  open set, the Riemann tensor of $g$ vanishes there; conversely $R_g\equiv0$ implies
  $g=\varphi^*\delta$ locally.
- **Counting [D].** A metric has $n(n+1)/2$ component functions; a pullback for fixed
  target is determined by $n$ functions: 45 vs 9 for $\dim\mathcal M=9$; modulo
  coordinate changes a general metric keeps $n(n-1)/2=36$ functions, a flat one none.
- **Proposition 2 (lower target dimension).** For $k<n$ at most a Riemannian submersion;
  transverse metric constant along level sets and, by O'Neill,
  $K_g(\bar X,\bar Y)=-\tfrac34|[\bar X,\bar Y]^{\mathcal V}|^2\le0$ on horizontal planes;
  $k=1$ has no obstruction. A compact torsion torus cannot be immersed into
  $\mathbb R^2$ (open-and-closed argument) — soft targets must be periodic or cut.
- **Proposition 3 [D/N]: the Euclidean shape metric is nowhere flat.** O'Neill with a flat
  top space gives $K\ge0$, and some plane has $K>0$ (falling-cat rotation from
  non-commuting zero-angular-momentum deformations). Check: $N=3$, $K=3/t^2$
  ($t^2=\sum|x_i|^2$); autodiff 0.90059911 vs formula 0.90059911.
- **Proposition 4 [D/N]: one spring is a cone.** For two beads with bond vector $b$,
  $r=|b|$:
  $$G=\big(\tfrac\gamma2+w\big)dr^2+\tfrac\gamma2r^2d\Omega^2=d\rho^2+c^2\rho^2d\Omega^2,\quad \rho=\sqrt{\tfrac\gamma2+w}\,r,\quad c^2=\frac{\gamma}{\gamma+2w}<1,$$
  $$K_{\rm rad}=0,\qquad K_{\rm tan}=\frac{1-c^2}{c^2\rho^2}=\frac{4w}{\gamma(\gamma+2w)r^2};$$
  a rotation-invariant $A(r)dr^2+B(r)d\Omega^2$ is flat iff $(d\sqrt B/dr)^2=A$. With
  $w=1400$, $\gamma=30$, $r=1.5$: $K_{\rm tan}=0.029316$. One spring makes $V$ curved for
  every $N\ge2$ (product of the cone with flat $\mathbb R^{3N-6}$).
- **Proposition 5 [D/N]: Hessian metrics.** For $g_{ij}=U_{ij}$ in affine coordinates,
  $R_{ijkl}=\tfrac14g^{pq}(U_{ilp}U_{jkq}-U_{ikp}U_{jlq})$: quadratic $U$ gives a flat metric
  "whatever its stiffness spread"; curvature is the square of the anharmonicity; flatness
  is $n^2(n^2-1)/12$ equations (540 for $n=9$) on one function. The *true* one-bond
  Hessian (with prestress) has $K_{\rm tan}=-2w^2/(\gamma^2(\gamma+2w)r_0^2)=-0.684$, 23×
  the Gauss–Newton cone and of opposite sign, and is indefinite once the bond is compressed
  by more than $\gamma r/(2w)=0.016$ Å $=0.60\sigma_r$.
- **Proposition 6 [D]: inverse-covariance metrics.** For an SO(3)-invariant
  $A\,dr^2+B\,d\Omega^2$ with radial width $\sigma_r$ ($A=1/\sigma_r^2$) and
  bond-length-independent transverse width $\sigma_\perp$ ($B=r^2/\sigma_\perp^2$):
  $K_{\rm tan}=(\sigma_\perp^2-\sigma_r^2)/r^2$ (per squared thermal width); flat iff
  $\sigma_\perp=\sigma_r$, i.e. no stiffness contrast. Flatness would need
  $d\ln\sigma_\perp/d\ln r=1-\sqrt{\kappa_b}$: for $\kappa_b\approx100$ "the angular width
  would have to shrink by 9% per 1% of bond stretch". Anisotropic angular widths:
  $K_{\rm tan}=(\sigma_b^2-\sigma_r^2)/r^2$ — the bond-direction sphere's curvature is set by
  its **stiffer** (bend) width.
- **Theorem 1 [D].** Nonzero curvature at $p$ ⇒ no $\varphi$ into $\mathbb R^n$ with
  $\varphi^*\delta=g$ on any neighbourhood; by real-analyticity the spring metric's
  curvature vanishes on no open set.
- **Theorem 2 [S/D] (curved targets).** A local isometry carries $R$ and all $\nabla^kR$;
  locally symmetric targets (spheres, tori, hyperbolic, symmetric spaces) have $\nabla R=0$.
  The spring metric has $\|\nabla R\|/\|R\|^{3/2}$ of 1.9–2.0 on $V$ and 2.5–2.8 on the
  ALDP5 quotient (controls $<10^{-13}$), so no locally symmetric target reproduces it.
  A freely chosen target $N=\mathcal M$, $\varphi=\mathrm{id}$, "solves" the problem
  trivially and inherits all its difficulty.
- **Theorem 3 [D/N] (equivariant flat maps).** The quotient of any SO(3)-invariant flat
  metric has all sectional curvatures ≥ 0; the spring quotient has negative planes
  ($-2\times10^{-4}$ on an $N=4$ chain; $-0.012$, $-5.6\times10^{-4}$, $-4.8\times10^{-4}$ at
  ALDP5 β, αR, αL frames), so no equivariant flat map reproduces even its internal part.
- **Theorem 4 [D/N] (size of the forced error).** For four points
  $\exp_p(\pm\rho u),\exp_p(\pm\rho v)$ mapped into a Euclidean space of *any* dimension
  with distance distortion ε:
  $$\varepsilon\ge\frac{K\rho^2}{12}+O(\rho^3)\ (K>0),\qquad \varepsilon\ge\frac{|K|\rho^2}{36}+O(\rho^3)\ (K<0);$$
  normal coordinates achieve metric error $\le\tfrac13\max_\Pi|K(\Pi)|\rho^2+O(\rho^3)$.
  Proof via Euler's quadrilateral identity
  $\sum_{\rm sides}|z_i-z_{i+1}|^2=|z_1-z_3|^2+|z_2-z_4|^2+4|m_{13}-m_{24}|^2$ and
  $d(q_1,q_2)^2=2\rho^2-\tfrac13K\rho^4+O(\rho^5)$.
- **Single-point conditioning cannot see curvature (§5.5).** At one point any
  positive-definite matrix is the value of a flat metric; a metric error ε changes a
  condition number by at most $(1+\varepsilon)/(1-\varepsilon)$.

### 2.6 Curved, periodic and atlas targets (note 23 §3–§5)

- A target plays three roles: **curvature** (how evenly one chart whitens all regions),
  **topology** (whether every target point decodes to a molecule; periodic soft modes),
  **tractability** (known kernel, cheap sampler). On ALDP5 "the second and third probably
  matter more than the first [H]".
- Flat torus factor $T^2\times\mathbb R^7$ keeps the wrapped-Gaussian kernel and fixes soft
  topology without curvature.
- Soft space alone: the effective metric $h=g_{ss}-g_{s\sigma}g_{\sigma\sigma}^{-1}g_{\sigma s}$
  on $(\phi,\psi)$ is clearly curved (∫|K| dA 1–2 rad over the populated region).
  Uniformization: $h=e^{2u}f^*h_\Lambda$; in $f$-coordinates Laplace–Beltrami is
  $e^{-2u}\Delta_{h_\Lambda}$, so Brownian motion of $h$ is flat-torus Brownian motion with
  the clock $d\tau=e^{-2u(X_t)}dt$ [D].
- Learned atlas with flat noising per chart: piecewise flat, "the curvature sits at the
  seams" (angle deficits sum to ∫K dA by Gauss–Bonnet); smaller charts always fit better,
  so a complexity criterion is required; diffusion either as one glued process (non-Gaussian
  after seam crossings) or as a **mixture of charts** (each an exact flat diffusion).
- Local PGA is not needed if the metric is defined by finite steps mapped through φ at
  both ends (#753): linearized steps under-magnified bonds ≈2× because bond directions
  turn 7.5–16° within 1 ps.

### 2.7 The candidate maps (formulas, dimensions, data used)

| Map (code/display name) | Formula | ALDP5 dim | Fitted from |
|---|---|---:|---|
| Aligned flat | $u=S^\top\mathrm{vec}((x-\bar x)R(x)-m)$, $G=I_9$ | 9 | reference alignment |
| Centred Cartesian | $B^\top\mathrm{vec}(x)$, $G=I_{12}$ | 12 | nothing |
| Trajectory spring (#757) | $(W^{1/2}(d(u)-d_0),\sqrt\gamma u)$, $w_e=\mathrm{Var}_{\rm train}(d_e)^{-1}$, γ = 30 Å⁻², 4 bonds + 3 one–three pairs | 16 | target trajectory |
| wδ | 15 log pair distances (5 beads + virtual Cβ at 1.5 Å) + $\sqrt\delta\log\det C$, δ = 1 | 16 | nothing (virtual bead is construction) |
| Learned warp (#753, "old learned φ") | invertible flow on aligned slice | 9 | 1 ps steps |
| Raw invariants (#784 block) | $e(x)=((y_i\cdot y_j)_{i\le j},(\det[y_i,y_j,y_k])_{i<j<k})$, $y_i=(x_i-x_5)/\ell$ | 14 | nothing |
| Invariant whitening | $A_0(e(x)-b_0)$, $A_0$ = inverse sqrt of uncentred 1 ps feature-step second moment | 14 | target trajectory |
| Learned invariant φ (#784, "new learned φ") | coupling flow on whitened $e$, fitted with chain-coordinate step likelihood | 14 | target trajectory + hand-specified chain coords in the loss |
| Endpoint φ (#876/#882) | flow on $e$, CNCE endpoint loss, calibration $A=c_fC_F^{-1/2}$ | 14 | 1 ps pairs, no prescribed coordinates |
| Transferred graph φ (#877) | $(\kappa e_{\rm complete},a_b\odot b,a_a\odot c,a_t\odot t)$, κ = 0.01 | 36 | source minipeptides only |
| Analytic quantum springs (PR885 map) | $(K(q-q_0),a_\tau\odot t_\epsilon,\sqrt\gamma\,\mathrm{vec}(Px))$, γ = 1 | 26 | GFN2-xTB Hessians at 9 references |
| Shared quantum φ (#866) | $((s_{ij}(x))_{i<j},\sqrt\gamma\,\mathrm{vec}(Px))-b_Q$, $s_{ij}=e^{\lambda_{ij}/2}\sqrt{\|x_i-x_j\|^2+\epsilon^2}$ | 25 | quantum covariances of many small molecules |
| Chemistry-only (#815) | $(\varepsilon e,h_b,h_a)$, ε = 0.1, AMBER ff14SB constants | 21 | force-field table |
| Chemistry + torsions (#826) | chemistry-only + regularized cos/sin torsion signals | 25 | force-field table |
| UFF graph-energy (#804) | $(\sqrt\gamma q,f_{\rm bond},f_{\rm angle},f_{\rm torsion},f_{\rm LJ})$ | 26 | UFF typing |

Sources: supervisor-metric-comparison-mathematics §4–§10; methods table;
`design/invariant-thermal-embedding.md`; `design/chemical-invariant-initializer.md`;
`design/invariant-feature-alternatives.md`; `relaxation-metric-feasibility.md`.
On BBA the complete invariant block grows cubically: 378 Gram entries + 2,925 signed
triples = 3,303 features for 78 shape directions (closeout §#895).

Quantum construction details (historical #788/#790 reports at `92aecbd6`):
$C=k_BT\,U(U^\top HU)^{-1}U^\top$ (rigid motions removed), feature covariance
$C_q=D(q\circ M)\,C\,D(q\circ M)^\top$, whitening $L$ with $LC_qL^\top=I$ on the retained
range, map $F(x)=(L(q(x)-q(x_*)),\sqrt\gamma\,\mathrm{center}(x))$. Soft scale from the
omitted shape directions: γ = 12.1875 Å⁻² (single reference, no torsion features); the
deployed periodic map uses γ = 1 with explicit torsion features. Balanced phase strength
over references: $a_j=(\min_iv_{ij}\max_iv_{ij})^{-1/4}$ (minimax of log-variance
distortion), changing the two ALDP5 strengths from 1.4155 and 3.5077 to 2.9191 and 4.1378.

### 2.8 Fitting objectives

- **Warp step likelihood (#753):** $\mathbb E\big[|\varphi(u_1)-\varphi(u_0)|^2/(4c^2)-\log|\det D\varphi(u_1)|\big]$,
  isotropic Gaussian random walk in φ, c = median largest 1 ps step width (0.25 Å ALDP5).
- **Wrapped internal-coordinate likelihood (#784):**
  $\ell_\theta(a,b)=\tfrac92\log(4\pi c^2)-\tfrac12\log\det G_\theta(a)-\log\sum_k\exp(-d_k^\top G_\theta(a)d_k/(4c^2))$,
  $d_k=b-a+(0_7,2\pi k)$ (domain $\mathbb R^7\times T^2$).
- **Local second-moment loss (note 24, #865/#877):**
  $\ell(g;\Sigma)=[\mathrm{tr}(g\Sigma)-\log\det g]/d$ with $\mathrm{tr}(g\Sigma)=\mathbb E\|g^{1/2}u\|^2$;
  unique optimum $g_*=\Sigma^{-1}$ (proof via $H=\Sigma^{1/2}g\Sigma^{1/2}$ and
  $\mu-\log\mu-1\ge0$); per eigen-direction $s_i\lambda_i-\log s_i$ minimized at
  $s_i=1/\lambda_i$.
- **Endpoint CNCE (#882):** $E_\eta(x,y)=\|F_\eta(y)-F_\eta(x)\|^2/(4c_f^2)+\|y_c\|^2/(2R^2)$,
  $\mathcal L=\mathbb E\,\mathrm{softplus}(E_\eta(x,y)-E_\eta(x,z))$, $c_f=0.25$ Å, $R=3$ Å.
- **Global whitening (#808):** a fixed inverse-square-root of the uncentred second moment of
  1 ps feature displacements — "It whitens feature *displacement second moments*, not the
  equilibrium covariance of feature positions."

### 2.9 Training, sampling and force read-out in feature space

- VP schedule (supervisor methods): $\beta(t)=0.1+19.9t$, $\alpha(t)=e^{-0.05t-4.975t^2}$,
  $\sigma(t)^2=1-\alpha(t)^2$, $z_t=\alpha z_0+\sigma\varepsilon$,
  $\mathcal L_{\rm DSM}=\mathbb E\|\varepsilon_\theta(z_t,t)-\varepsilon\|^2$; $t$ uniform on
  $[t_{\min},1]$ ($10^{-5}$ for flat, 0.01 for feature maps); prior $\mathcal N(0,I_D)$ with
  $\alpha(1)\approx0.00657$; features normalized $z=(F(x)-\mu)/c$ by one scalar.
- Conservative transformer: $\varepsilon_\theta=\sigma z+\alpha\nabla_zH_\theta$, score
  $s_\theta=-z-(\alpha/\sigma)\nabla_zH_\theta$ (starts at the standard-Gaussian score).
- Decoding: $\hat x\approx\arg\min_{x\ \rm valid}\|F(x)-(a\hat z+b)\|^2$ (damped
  Gauss–Newton / Levenberg–Marquardt; failures kept as NaN, never refilled).
- **Force read-out** (note 29; mathematics §11):
  $$\nabla_x\log p_0=D\varphi^\top\nabla^S\log q\big(\varphi(x)\big)+\tfrac12\nabla_x\log\det G(x)\ \ (+\nabla_x\log\rho\ \text{orbit factor for invariant maps}),$$
  read at $y=\varphi(x)$, never at an off-surface sample; the normal part of the learned
  score ($\sim\sigma_t^{-2}$) is discarded by $D\varphi^\top$; for invariant maps the
  determinant must be the rotation-quotient one (the full one gave gradient noise of
  order $10^{13}$ and lost every walker, #955). Finite-time surrogate:
  $f_t(u)\approx\alpha J_\varphi^\top s_\theta(\alpha\varphi(u),t)+\tfrac12\nabla\log\det G_\varphi-\nabla\log m$.
- **Stein force check** (#768): for the exact force $g=\nabla\log p$ and fixed direction $e$,
  $-\mathbb E[(g\cdot e)(e\cdot(u-\bar u))]=1$; general identity $\mathbb E[g\cdot v+\mathrm{div}\,v]=0$.
  Necessary, not sufficient.
- **Brownian dynamics:** $u\leftarrow u+h\,g(u)+\sqrt{2h}\,\xi$ (h in Å²). The source
  (#768 §5): "For a harmonic bond, Euler–Maruyama inflates the spread by about 1 + kh/4,
  where k is the bond's stiffness." [derived here: $1+kh/4$ is exact to first order for a
  single unit-mobility coordinate; a bond length is the difference of two unit-mobility
  atoms, which doubles its effective mobility and gives $\approx1+kh/2$ with
  $k=1/\sigma_{\rm bond}^2\approx1{,}000$–1,600 Å⁻², i.e. ≈1.05–1.08 at $h=10^{-4}$ —
  close to the measured 1.08 (spring) and 1.09 (learned).]
- **Strain proxy:** $E=\sum\tfrac12((q-\mu)/\sigma)^2$ over 4 bonds + 3 angles; outlier
  if $E>10$ kBT (MD median 3.2 kBT, 0.70% outliers).

### 2.10 Bounds and obstructions that explain later failures

- Fixed bounded metrics cannot whiten large stiffness ratios:
  $\kappa(G^{-1/2}SG^{-1/2})\ge\kappa(S)/\kappa(G)$, and `local_chemical_v1` has
  $\kappa(g)\le1+36Dw_{\max}=1+144D$ (`design/chemical-feature-metric.md`).
- Harmonic control: noise covariance $tG^{-1}$ gives $\Sigma_t=S^{-1}+tG^{-1}$; with
  $G=cS$ every mode's fractional variance grows by $t/c$ (ibid.).
- Force–loss tradeoff: $\lambda_{\min}(G)L_g\le e^\top e\le\lambda_{\max}(G)L_g$, so a
  better metric-weighted loss does not imply better Cartesian forces (ibid.).
- **Redundancy converts stiffness** (note 28 §4): for data on a $d$-flat in
  $\mathbb R^M$, $\epsilon^*=\sigma_ty_T+y_N/\sigma_t$; the normal stiffness
  $\alpha_t/\sigma_t$ diverges as noise vanishes ($1/\sigma_t^2$ from about 502 to 332,342
  when the floor drops from $t=0.01$ to $3\times10^{-5}$).
- Resolution noise (#1025): $c_q=\sqrt{\nabla q^\top G^+\nabla q}$,
  $\sigma^*(q)=\mathrm{sd}(q)/c_q$; placement law for an equal-dimension map with unit mean
  channel variance: $\min_ks_k\le1/\sqrt{\langle R^2\rangle}$, with $\langle R^2\rangle=2.8$
  (ALDP5) vs 10.6 (BBA) (`bba-local-geometry-preconditioning.md` §1–§2).
- Lag dial (note 25 §2): $G_\tau$ eigenvalues $\lambda_k/(1-e^{-\tau/t_k})\approx\max(\lambda_k,1/(D_0\tau))$;
  "the soft scale γ of the spring metric is the lag in disguise".

---

## 3. Worked analytical examples

**E1. One spring = a cone (note 22 Prop. 4; note 23 §4.3).** $w=1400$ Å⁻², γ = 30 Å⁻²,
$r=1.5$ Å: $K_{\rm tan}=0.0293156$ by intrinsic autodiff, Gauss equation and formula
(run log `50_pullback_higher_dim.log`: 0.029315534615887862 / …797 / …973); radial planes 0;
an equal-dimension control map gives exactly 0. [derived here] $c=\sqrt{\gamma/(\gamma+2w)}=0.10296$;
thermal widths $\sigma_r=\sqrt{2/(\gamma+2w)}=0.02658$ Å, $\sigma_\perp=\sqrt{2/\gamma}=0.2582$ Å
(note 22 quotes 0.027 and 0.26 Å); $(\sigma_\perp^2-\sigma_r^2)/r^2=0.02932$ reproduces
$K_{\rm tan}$; the bond-direction sphere has radius $r_0/\sigma_\perp=5.81$ thermal widths
(note 22: "≈6").

**E2. The embedding of E1 made visible [derived here].** $F(b)=(\sqrt w|b|,\sqrt{\gamma/2}\,b)$
maps $\mathbb R^3\to\mathbb R^4$ (image: a 3-D cone). Its planar analogue $b\in\mathbb R^2\to\mathbb R^3$
is an ice-cream-cone surface $z=\sqrt w\,r$ over horizontal radius $\sqrt{\gamma/2}\,r$,
half-opening angle $\arcsin c=5.9°$ for ALDP numbers. Isotropic feature noise projected
onto it has radial/tangential standard-deviation ratio $c=0.103=\sigma_r/\sigma_\perp$:
exactly the thermal aspect ratio. Caveat: a 2-D cone is intrinsically flat; curvature
needs the 3-D bond vector (sphere of directions).

**E3. Chord vs arc (mathematics §2).** Unit circle: chord $2\sin(|\Delta\vartheta|/2)$ vs
arc $|\Delta\vartheta|$; wδ chord vs geodesic $r^2-\tfrac1{12}\|\mathrm{II}\|^2r^4$.

**E4. Flat pullbacks have no curvature; sphere in $\mathbb R^3$ does.** Inclusion of $S^2$
pulls back the flat metric to the round metric, $K=1$ (note 23 §4.3). Fisher metric of
the normal family as a Hessian metric: $K=-1/2$ (note 22 §3.3 check).

**E5. Four-point bound on a bond-direction cone (note 22 §5.2).** Rotating a bond by θ is
a thermal distance $\rho\approx(r_0/\sigma_\perp)\theta$, and $K\rho^2\approx\theta^2$:

| θ (rad) | ρ | $K\rho^2$ | exact four-point ε | $K\rho^2/12$ | $K\rho^2/3$ |
|---|---|---|---|---|---|
| 0.1 | 0.58 | 0.010 | 0.0008 | 0.0008 | 0.0033 |
| 0.3 | 1.74 | 0.089 | 0.0076 | 0.0074 | 0.030 |
| 0.5 | 2.90 | 0.25 | 0.022 | 0.021 | 0.082 |
| 0.8 | 4.65 | 0.63 | 0.061 | 0.053 | 0.21 |
| 1.2 | 6.97 | 1.42 | 0.16 | 0.12 | 0.47 |
| 1.6 | 9.29 | 2.53 | 0.35 | 0.21 | 0.84 |

**E6. Equivariant flat maps of one bond (note 22 §5.3).** Every equivariant
$\varphi(b)=F(r)\hat b$ is a flat cone; on a shell $r_0\pm n\sigma_r$ ($\sigma_r=0.027$,
$\sigma_\perp=0.26$, $r_0=1.5$ Å) the minimal metric error is 0.14/0.26/0.44/0.56 for
$n=0.5/1/2/3$, against 0.018/0.035/0.071/0.11 for $b\mapsto(\hat b,F(r))$ into
$S^2\times\mathbb R$. Consistent with note 20 §6.3's "about ±35% at ±3σ" angular-scale
coupling of the internal-coordinate stretch.

**E7. Which planes are curved (note 22 §3.2).** $N=4$ chain (torsion 60°): most positive
plane mixes torsion with both bends; most negative mixes torsion with bonds; bend–torsion
coordinate plane $K=0.0016$ vs anisotropic model 0.0031 vs isotropic cone 0.029.

**E8. Curvature table (note 22 §3.2, per squared thermal width).**

| Metric / configuration | $K_{\min}$ | $K_{\max}$ | $\|\nabla R\|/\|R\|^{3/2}$ |
|---|---|---|---|
| $G$ on $V$, $N=3$ planar | −0.0084 | 0.0103 | 2.0 |
| $G$ on $V$, $N=4$, torsion 60° | −0.0042 | 0.0111 | 1.9 |
| $\bar g_G$ on $\mathcal M$, $N=4$, 60°/180° | −0.00020/−0.00020 | 0.0026/0.024 | 6.0/1.1 |
| ALDP5 β/C7eq (φ −142°, ψ 171°) | −0.0122 | 0.0198 | 2.8 |
| ALDP5 αR (−55°, −42°) | −0.00056 | 0.0152 | 2.8 |
| ALDP5 αL (44°, 48°) | −0.00048 | 0.0173 | 2.5 |
| flat control | $|R|\le1.8\times10^{-15}$ | | |

Curvature radii 7–10 thermal widths at the most curved planes.

**E9. ALDP5 within a basin (note 22 §5.4).** $K=0.02$: lower bound $K\rho^2/12$ =
0.002/0.007/0.015 at ρ = 1/2/3 thermal widths; normal-coordinate upper bound
$K_{\max}\rho^2/3$ ($K_{\max}=0.026$) = 0.009/0.035/0.08. Over 400 frames the largest
coordinate-plane curvature has median 0.008, 95th percentile 0.023, maximum 0.045.

**E10. The torsion torus (note 22 §5.4; note 23 §2.2; local arrays).** Effective soft metric,
stiff coordinates at their mean. Whole torus: area 460 thermal units² (≈21.4 widths
around, [derived here] $\sqrt{460}$), ∫|K| dA 8.8, ∫K dA ≈ 0 (Gauss–Bonnet). Note 23
(72×72 grid, 800,000 frames): populated 99.7% → area 135, ∫|K| 1.83; 97.3% → 83, 0.90;
β/C7eq ±45° → 32, 0.22, ∫K −0.03; αR → 27, 0.49, +0.39; αL → 26, 0.77, +0.76. Note 22
(16×16, independent code): core 0.75 → 33, ∫K −0.001, ∫|K| 0.31; 0.97 → 88, −0.20, 1.06;
0.997 → 149, +0.08, 2.10; windows −0.05/+0.16/+0.95 with ∫|K| 0.27/0.39/0.95. Heuristic
smallest flat error over the populated landscape: between $\Theta/(12\pi)$ and
$\Theta/(3\pi)$ with Θ ≈ 1–2 → 3–6% to 10–20%; αL window alone 2.5–10%. [derived here
from the saved 72×72 grid `40_torus_curvature.npz`: K ∈ [−0.110, +0.120]; ∫K dA over the
99.7%-mass bins = −0.16 and over the 97.3% bins = −0.20; maximum K at (φ, ψ) ≈ (−2.5°,
−2.5°) and minimum at ≈ (−177.5°, 2.5°), both in sparsely populated regions.]

**E11. Single-point conditioning vs curvature (note 22 §5.5).** Within-window flat-chart
error 3–8% changes condition numbers by ≤1.06–1.2×; measured spring vs internal-stretch
ratios 1.5–1.8 (17.5/9.6, 11.4/7.6, 22.3/13.4) therefore reflect the restricted map family,
not flatness.

**E12. Indefinite true Hessian (note 22 §1.3).** One bond with $\tfrac\gamma2I$ added:
transverse eigenvalue $\tfrac\gamma2+w(r-r_0)/r$, negative beyond 0.016 Å compression
($0.60\sigma_r$); −10.3 Å⁻² at $1\sigma_r$. Gauss–Newton fixes definiteness.

**E13. The angular-width flatness condition (note 22 Prop. 6).** For $\kappa_b\approx100$,
$d\ln\sigma_\perp/d\ln r=1-10=-9$: 9% angular shrinkage per 1% bond stretch would be
needed for flatness.

**E14. Equal displacement vs equal information (#753).** In warp coordinates held-out data
spread about 1c along most directions but 2.0–2.4c and 3.2–3.3c along two, "so
information about which basin a structure is in survives to larger noise".

**E15. Why finite steps (#753; #873) [partly derived here].** A fixed-length bond rotated by
α has linearized length change $D|b|[b'-b]=-\|b'-b\|^2/(2r)$, i.e. $\approx-r\alpha^2/2$.
With 1 ps turning 7.5–16° and $r=1.5$ Å: 0.013–0.058 Å, comparable to the 0.025–0.031 Å
bond width — which is why Jacobian-linearized steps under-magnified bonds ≈2× and why
#873's local-moment labels inflate apparent stretching (linearized/actual bond-change
second moment 2.44/4.95/10.11 at 64/128/256 neighbours).

**E16. Trace minus log-det in one line (note 24).** Second moments 0.01 and 1 give
optimal weights 100 and 1; at the optimum the whitened second moment is $I$ and
$\mathrm{tr}(g_*\Sigma)=d$.

**E17. Noise-floor narrowing (feature-space evaluation §4).** Production flat floor
σ(0.01)·0.94 Å = 0.042 Å per coordinate, 0.060 Å on a bond; Tweedie denoising shrinks a
coordinate of width w to $w/\sqrt{w^2+s^2}$: predicted 0.39–0.46 for bonds, 0.53–0.66 for
angles; observed at 200k 0.44–0.53 and 0.69–0.78. [derived here: $0.025/\sqrt{0.025^2+0.060^2}=0.385$,
$0.031/\ldots=0.459$; $\sigma(0.01)=0.04464$, $\sigma(10^{-5})\cdot0.27$ Å $=0.00027$ Å,
$\alpha(1)=0.00657$, all matching the docs.]

**E18. Effective stiffness under noise (note 20 §3).** $(\alpha_t^2/\lambda_k+\sigma_t^2)^{-1}$:
at σ = 0.1 Å a bond drops from ≈1,600 to 94 Å⁻² [derived: torsion 25 → 20 Å⁻²].

**E19. When does noise erase each ALDP5 mode? [derived here].** Half-erasure (SNR = 1,
equivalently $R^2=r_k=0.5$, the "readable" criterion of #1026) for the nine principal widths
listed in §2.1 under the VP schedule of §2.9, with flat noise of per-coordinate size
$\sigma_t\times$scale:
- flat, production scale 0.9418 Å: t = 0.0048, 0.0061, 0.0099, 0.0139, 0.0175, 0.0366,
  0.0569, 0.1076, 0.1962 — the three stiffest modes are erased *below* t_min = 0.01;
- flat, low-floor scale 0.27 Å: t = 0.0249 … 0.4377;
- per bond length (two atoms, noise ×√2), width 0.025 Å: t ≈ 0.0028 (production) and
  ≈0.016 (low floor) — with t uniform on [t_min, 1], bonds are readable in ≈0% and ≈1.6%
  of training examples respectively;
- information at t_min: 0.15–2.76 nats per mode (production, t = 0.01) vs 4.5–7.8 nats
  (low floor, t = 10⁻⁵).

**E20. The spring soft scale γ as a synchronizing dial.** Doc: the across-basin torsion
swing of ≈0.7 Å is $0.7\sqrt\gamma$ bond widths: 3.8 (γ = 30), 2.0 (γ = 8), 1.0 (γ = 2)
(`spring-soft-scale-sweep.md`). [derived here, using a total aligned-slice variance of
0.682 Å² back-calculated from the documented ALDP5 divisor 1.31:] after the scalar
normalization, bond channels are half-erased at t ≈ 0.21/0.28/0.32 and the torsion swing
at t ≈ 0.47/0.42/0.32 for γ = 30/8/2 (ratio 3.83/1.98/0.99). Measured: lowering γ made
early torsion learning *worse*.

**E21. Note 25's lag-dial numbers.** λ = (1600, 400, 25, 4) Å⁻², $D_0=0.08$ Å²/ps: $t_k$ =
(0.008, 0.03, 0.5, 3.1) ps; at τ = 1 ps the half-erasure levels are (1, 1, 1.02, 2.12), a
spread of 2.1 against 400 under flat noise.

**E22. The BBA scale problem (#1025).** Springs divided by one global RMS: divisor 27.1 on
BBA vs 1.31 on ALDP5; each spring channel ends with population SD 0.037 < σ(t_min) = 0.045.
[derived here: a 0.037 channel is half-erased at t ≈ 0.0077 < 0.01, so BBA spring bonds are
never readable in training; on ALDP5 the 0.76 channel is readable to t ≈ 0.2.] On ALDP5
the same recipes resolve every observable at 11–31 σ(t_min).

**E23. Redundant whitening on BBA (#1025, note 28).** 3,303 features, 78 shape directions,
3,225 normal directions with zero data variance; tangent share of the untrained loss below
t = 0.1 is 0.06 (Cartesian 1.00, internal 0.75); training loss 911 untrained, 904 after
100 updates, 759 after 190,350.

**E24. Single-point counterexample to geometry-only rules (#788 report).** Two harmonic
energies with the same minimum and graph but force constants differing by 100× have
reciprocal thermal variances; a geometry-only rule sees identical inputs and cannot whiten
both.

**E25. The harmonic preconditioning control (`chemical-feature-metric.md`).** Planar
four-bead path (0,0,0),(1,0,0),(1,1,0),(2,1,z) Å: volume feature $z/[2\sqrt{2+z^2}]$,
derivative $1/(2\sqrt2)$ at z = 0, while edge and angle features have zero derivative —
signed features see normal motion that reflection-invariant scalars miss.

**E26. Four-atom chain move (note 20 §2, background).** Euclidean step vs Riemannian move
of equal length 0.21 Å, in thermal widths: stick 3–4 −10.3 vs −1.0; other sticks +1.5,
+3.7 vs 0.0; angle −0.8 vs −1.0; twist −0.1 vs −1.0.

---

## 4. Key empirical results

All ALDP5 results are exploratory (outside the benchmark pipeline, not M1); mdshare
explicit-solvent trajectories, trajectory 0 for training, 1 held out, 2 as a second
reference, five backbone beads.

### 4.1 Feature-space evaluation (#765; evidence 2026-10-26, 3 seeds, 200k steps, 20,000 molecules per checkpoint)

Floors: disjoint held-out / training trajectory / trajectory 2.

| Metric (floors) | Arm | 1k | 5k | 20k | 200k |
|---|---|---|---|---|---|
| φ/ψ JS (0.0185/0.0214/0.0226) | flat low floor | 0.0256 | 0.0210 | 0.0206 | 0.0207 |
| | flat production | 0.0531 | 0.0250 | 0.0222 | 0.0209 |
| | learned | 0.0329 | 0.0248 | 0.0227 | 0.0208 |
| | spring | 0.0312 | 0.0214 | 0.0205 | 0.0201 |
| | wδ | 0.0388 | 0.0207 | 0.0205 | 0.0199 |
| Bond W1/width (0.010/0.017/0.011) | flat low floor | 0.186 | 0.068 | 0.046 | 0.015 |
| | flat production | 0.981 | 0.173 | 0.291 | 0.422 |
| | learned | 0.020 | 0.016 | 0.016 | 0.015 |
| | spring | 0.018 | 0.013 | 0.012 | 0.013 |
| | wδ | 0.042 | 0.018 | 0.014 | 0.018 |
| Angle W1/width (0.013/0.015/0.019) | flat low floor | 0.089 | 0.030 | 0.024 | 0.016 |
| | learned | 0.024 | 0.022 | 0.019 | 0.017 |
| | spring | 0.038 | 0.019 | 0.019 | 0.018 |
| | wδ | 0.070 | 0.044 | 0.030 | 0.032 |
| Stiff–soft coupling (0.046/0.051/0.050) | flat low floor | 0.142 | 0.067 | 0.056 | 0.051 |
| | spring | 0.077 | 0.054 | 0.051 | 0.051 |

Summary: spring reaches the floor ~100× sooner for bonds (≈2k vs 200k), 10–20× for angles
(5k vs 50k–100k), ~10× for coupling (20k vs 200k); bond W1 ratio flat/spring 10× at 1k,
5× at 5k, 3.7× at 20k. Torsions: flat low floor best to ~2k steps; spring/wδ match from
~5k; tiny late leads (spring PMF 0.332 vs 0.355 kBT², ≈2 SD) are within panel effects.
Rare φ > 0 basin: flat learns the population faster (ΔF error 0.016 vs 0.077 kBT for spring
at 20k) and keeps the lowest in-basin surface error (0.101 vs 0.124–0.125 at 200k); spring
in-basin bond geometry much better (0.031 at 5k vs flat 0.037 at 200k). Independent
trajectories disagree on the basin's free energy: 3.40 (training), 4.09 (held-out), 3.15
kBT. Sanity checkpoints (CPU): at step 100 learned/spring are within 1.2–2.4× of the bond
and angle PMF floors; untrained spring/wδ decode only 232 and ≈25 of 20,000.

### 4.2 Joint metrics (#781)

Classifier AUC on 7 stiff coordinates: spring 0.502, learned 0.504 after 1,000 steps (floor
0.500–0.506); best flat needs 100k–200k; production flat worsens (0.66 at 5k, 0.91 at 200k).
Each 250 ns trajectory holds only ≈100–140 independent αL samples.

### 4.3 Force fields and Brownian dynamics (#768; 3 seeds; h = 10⁻⁴ Å², 40,000 steps, 1,000 walkers)

| Model | Rama JS sim / diffusion | PMF sim / diff (kBT²) | Bond W1/width sim / diff | Angle W1/width sim / diff | Valid (sim) |
|---|---|---|---|---|---|
| flat low floor | 0.142 / 0.021 | 2.14 / 0.36 | 0.109 / 0.015 | 0.180 / 0.016 | 0.961 |
| flat production | 0.026 / 0.021 | 0.46 / 0.37 | 1.105 / 0.422 | 0.443 / 0.231 | 0.372 |
| learned | 0.021 / 0.021 | 0.37 / 0.34 | 0.072 / 0.015 | 0.044 / 0.017 | 0.970 |
| spring | 0.024 / 0.020 | 0.42 / 0.33 | 0.064 / 0.013 | 0.042 / 0.018 | 0.973 |
| wδ | 0.049 / 0.020 | 0.93 / 0.35 | 0.117 / 0.018 | 0.126 / 0.032 | 0.947 |
| floors (training / half held-out) | 0.021 / 0.019 | 0.39 / 0.32 | 0.017 / 0.010 | 0.015 / 0.013 | 0.986 / 0.987 |

Force check (Stein ratio, target 1) at 200k: learned 0.96–1.00 / 0.93–1.01 (directions
1–3 / 4–7), spring 0.97–1.03 / 0.91–0.99, flat production 0.20–0.29 / 0.42–0.69, flat
low floor 0.91–1.00 / 0.60–1.04 at a per-seed time. Mean |log ratio| over stiff
directions reaches 0.12–0.13 at 1,000 steps for learned/spring vs 0.14 at 20,000 for low
floor: 10–20× sooner. Per-seed flat-low-floor simulations drift to 83% αR (MD 35%) or
16% φ > 0 (MD 1.7%). Strain outliers in direct sampling: spring 2.1% at step 100, 0.6% at
1k (MD 0.70%); low-floor flat 92%/6.5%. Step size: walkers blow up at h = 4×10⁻⁴ for
74% (learned), 99% (spring), 100% (wδ); extrapolated bond spread at h → 0 is 1.00–1.01
for learned/spring. "No flat model is good at both tasks" — low floor: good iid, wrong
torsion landscape in simulation; production: usable torsions, bonds 2.4× too wide. β
relaxation after 60,000 steps: 16–29% αR, still rising toward 35%: not equilibrated.
At 50,000 samples the iid models reach JS 0.010 / PMF 0.11–0.12, the same as the training
trajectory against held-out MD (0.010, 0.11) (ScoreMD Table 11: 0.008, 0.095–0.098 on a
different data set).

### 4.4 The 34-model comparison (#886; evidence 2026-10-30, 2 seeds, 200k updates, 2,000 molecules per checkpoint)

Conservative-transformer bond-width ratios (four bonds × two seeds; 1 = MD):

| Map | iid width/MD | Simulated width/MD |
|---|---:|---:|
| Aligned Cartesian | 1.006–1.090 | 2.328–2.778 |
| Centred Cartesian | 1.033–1.095 | 2.422–2.863 |
| Trajectory spring | 0.966–1.022 | 0.993–1.066 |
| wδ | 0.954–1.002 | 1.187–1.328 |
| Invariant whitening | 0.956–1.016 | 1.036–1.100 |
| Endpoint φ | 0.963–1.027 | 1.017–1.069 |
| Transferred graph φ | 0.962–1.020 | 1.024–1.169 |
| Cartesian, fixed units (ext.) | 1.170 (mean) | 8.750 |
| Quantum springs (ext.) | 0.995 | 1.023 |
| Shared quantum φ (ext.) | 0.996 | 1.032 |

Extension JS (50k training reference, iid / simulation): Cartesian 0.07862 / 0.18808,
quantum springs 0.07957 / 0.11659, shared 0.07832 / 0.11427. "The flat MLP catches up on
iid bond widths by 200k (0.994–1.049 versus 1.115–1.291 at 20k), supporting faster
learning rather than an inability of flat diffusion to learn stiff fluctuations."
Per-row CSV: `docs/investigations/supervisor-metric-comparison/final-200k.csv` (28 rows,
e.g. relative CN-bond W1 to same-family Cartesian: spring 0.298 iid / 0.036 simulation,
whitening 1.035 / 0.043 for the transformer). Caveat: common force time 0.05 is not
common physical smoothing.

### 4.5 Data-free quantum springs (#788–#794; evidence 2026-10-28)

- Single reference (#788): 7 whitened equilibrium eigenvalues 0.59–1.22; step anisotropy
  flat 174.72/176.42, projected 6.02/6.04, tangent 88.99/75.45, internal 2.60/2.49; gate
  failed; γ = 1 control 66.45/1005.64; graph-wide torsion features worsened (8.37).
- Multireference (#790): median/worst residual ratio 6.75/12.58 vs single 15.11/37.35 vs
  Cartesian 159.27/1030.50 on eight fresh starts; decoder converged 4,096/4,096 at σ =
  0.01 and 0.1 (covariance error ≈ sampling RMS 0.099), 3,917/4,096 at σ = 1.
- Diffusion (#791, MLP, 200k, 2 seeds, 20,000 molecules): bond W1/width 0.00935/0.01346 vs
  Cartesian 0.4334/0.4281 (32–46×); angles 7–10× better; torsion JS 0.02001/0.02089 vs
  0.02895/0.02734; all 80,000 final decodes; extracted bond ratios 0.979–1.047 vs
  0.296–0.434; simulated bond 0.0858/0.0808 vs 0.624/0.687; torsions no advantage.
  Positive-φ population: springs 3.04%/3.21% vs training 3.24%, held-out 1.65%.
- Rotation-equivariant follow-up (#793): Cartesian bonds 0.02426/0.02289 vs springs
  0.01021/0.01376 (advantage 1.7–2.4×); at 1,000 updates 0.994/1.049 vs 0.0447/0.0609.
- Shared predictor (#866/#875/#881/#885): coverage improved all 27 fresh targets; none of
  nine mappings passed every bound; ALDP5 median/worst 101.16/101.18 → 19.01/19.01 with
  expanded coverage (geometry-only 19.00/19.01); at 1M updates iid bond/angle errors
  0.0381–0.0438/0.0396–0.0461 (floors 0.0591/0.0501); small-noise force failures persist
  (59/42 of 64 walkers at t = 0.001).
- General construction (#797): acetamide residual ≈600 → 1.002 after branch repair; all 32
  small-molecule mappings pass, all three ALDP mappings fail; prospective physical-five
  ALDP 2.29/4.93 and 1.89/5.34 (#824). BBA (#911): max forces 0.0501/0.0423 eV/Å vs
  10⁻⁶ required; two proton transfers; 379 reserved CPU-hours.

### 4.6 Invariant thermal embedding (#784–#810; evidence 2026-10-28)

- Pilot NLL per held-out pair (nats): Euclidean 1.512/1.414, warp −10.253/−10.221, capped
  embedding −9.145/−9.022, initializer −8.109, fitted invariant −11.499/−11.501.
- 2k updates (#787): JS invariant 0.0350 vs flat 0.0381; bond 0.0252 vs 0.1105; angle
  0.0201 vs 0.0532 (calibration 0.0331/0.0193/0.0197). 200k (#792): JS 0.0349 vs 0.0351;
  bond 0.0241 vs 0.0219; angle 0.0167 vs 0.0214 — no final advantage. Stein residual
  0.038/0.049 vs flat 0.206/0.192; short simulation bond 0.0415–0.0595 vs 0.0926–0.1519.
  Long runs: final positive-φ counts equal initial counts in every run.
- Initializer ablation (#808, 20k): JS raw 0.03591, whitening 0.03383, learned 0.03418,
  spring 0.03478, wδ 0.03433, flat low 0.03557 (MD 0.03306); widths whitening
  0.989–1.010, raw 0.676–0.907, flat low 1.010–1.097.
- Forces (#810, 20k, N = 2,400): simulated width ranges raw 3.404–7.293, whitening
  1.035–1.106, learned 1.002–1.080; held-out force RMS 0.648 / 0.132 / 0.077; whitening
  lowest simulation JS (0.14201).
- Chemistry-only (#815): iid widths 0.990–1.012, sim 1.003–1.057, but JS 0.04436 and sim
  JS 0.24113 (worst); chemistry+torsions (#826, 2k): iid JS 0.1494 vs whitening 0.1241.
- General graph features (#864): median 1 ps conditioning flat 216.48/205.36, internal
  chemistry 449.46/533.46, radial 448.02/525.22, moments 446.48/516.32 (all fail);
  saved controls: warp 45.54/46.14, spring 55.01/67.27, wδ 270.15/241.92, raw invariants
  4074.02/3875.36, whitened 28.33/31.62, learned invariant 72.46–73.52/66.82–70.55
  (isotropic estimator calibration ≈1.87).
- Graph motif weights (#865/#873, ten-bead minipeptides): flat 3,667, unit weights 2,004,
  three gains ~1,078, chemical 560/598, source-average 474/390, residue-blind 563/554.
- Transfer (#877, 20k): ALDP5 JS 0.103–0.114 (MD 0.091–0.110), widths 0.978–1.048; AC JS
  0.516–0.556, widths up to 8.7; AC all 14,400 requests failed at 2k. 200k (#884): ALDP5
  comparable to flat/spring; AC JS 0.530–0.585 vs flat 0.103–0.113.

### 4.7 BBA (#895, #899, Sprint 12 first chunk)

- #895 (100k iid, 2 seeds): TIC JS / PMF / bond W1 / angle W1: Cartesian 0.0529 / 0.560 /
  0.6371 Å / 11.910°; springs 0.0479 / 0.582 / 0.0122 / 11.902; wδ 0.0889 / 1.116 / 0.1688 /
  4.574; whitening 0.2499 / 4.832 / 0.1170 / 19.893. JS/PMF floors at 2k/20k/50k/100k:
  0.184/0.037/0.017/0.008 and 5.09/0.53/0.16/0.07.
- #899: width 160 helps whitening (JS 0.250 → 0.164) but it still loses everywhere globally.
- Sprint 12 first chunk (2026-11-09, conservative invariant transformer, 190,350 updates):
  BBA Cartesian bond 0.415 Å / angle 5.24° / Rg 0.072 Å / JS 0.0267; internal 0.000274 /
  0.166 / 0.521 / 0.0124; springs 0.320 / 8.85 / 0.078 / 0.0457; whitening 0.705 / 24.4 /
  0.497 / 0.344 (decoded 96,271/100,000). ALDP5 in the same snapshot: springs bond 0.000190
  vs Cartesian 0.004558 Å (`docs/sprints/sprint12/matched-results.md`).

---

## 5. Why it was promising, why it failed, what was learned

### 5.1 Derived facts (proved or exactly checked)

1. Running OU/VP noise in a Euclidean feature space gives exact Gaussian kernels with no
   geodesic integration; for a diffeomorphism the pulled-back process is exact
   (Prop. 3); for an embedding it is metric-shaped to first order ($\sigma^2G^{-1}$).
2. Equal-dimension flat maps cannot reproduce curved thermal metrics; the error is
   bounded below by $K\rho^2/12$ and achievable at about $K\rho^2/3$ (note 22).
3. The spring and wδ metrics are exact pullbacks of higher-dimensional flat spaces;
   curvature = bending of the image (Gauss equation), numerically checked on one bond.
4. Under flat Cartesian noise with the production floor, bonds are erased before the
   smallest trained noise level and the Tweedie denoiser then narrows them by the
   predictable factor $w/\sqrt{w^2+s^2}$ — the cause of "too rigid" production-flat
   bonds, not overfitting (E17, E19).
5. A force is a covector independent of the metric; pullback forces need the volume term
   (and quotient determinant for invariant maps) (note 29).
6. Redundant embeddings turn tangent stiffness into diverging normal stiffness (note 28).

### 5.2 Why the approach looked (and was) promising on ALDP5

- Each map makes every ALDP5 direction readable inside the trained noise range: on ALDP5
  every observable is resolved at 11–31 σ(t_min) (#1025), so a single noise floor serves
  bonds and torsions — the stated cause of the force-field result ("In metric-shaped
  coordinates every direction has a similar thermal width, so one noise level serves
  both", #768).
- The benefit is robust to how the map was obtained (trajectory variances, quantum
  Hessians, a shared quantum-trained predictor, global whitening, source-trained graph
  weights), suggesting the active ingredient is the stiff-direction scaling, not a
  particular fit — and #808 showed global whitening supplies most of it.
- The force read-out was consistent: stiff Stein ratios ≈1 at one extraction time, best
  simulated bonds/angles, the ScoreMD-like flat dilemma resolved without a Fokker–Planck
  regularizer (#768) — a parallel, not a head-to-head, comparison.

### 5.3 Why it did not deliver more (with the status of each explanation)

- **Torsions/populations [measured + hypothesis].** Stiffness removal does not change the
  multimodal torsion problem; note 20 §4.7 states as a theorem that barrier curvature
  relative to basin curvature is unchanged by every constant metric. Measured: no early
  torsion advantage, flat learns the αL population faster (#765); synchronizing via γ
  slowed torsions (γ sweep); the 100 ps warp's early torsion gain came from
  *Gaussianizing* the slow modes, a different lever (`spring-soft-scale-sweep.md`).
- **Reference data cannot rank soft modes [measured].** Trajectories disagree on αL
  (3.40/4.09/3.15 kBT); 37 independent αL visits per 250 ns (note 25 via status); 2,000-sample
  panels have JS floor 0.139 and PMF 5.43 (#886 methods).
- **Final-quality gaps close with training [measured].** Flat MLP catches up on iid widths
  by 200k; ALDP5 first-chunk gaps closed with longer training (status "Not established").
- **Architecture confounds [measured].** Rotation-equivariant Cartesian narrowed the
  quantum-spring advantage from 32–46× to 1.7–2.4× (#793); exact equivariance gives
  ≈2.65× lower flat bond error than rotation augmentation (#823); BBA rank-1,792
  bottleneck (#895).
- **Transfer [measured].** Graph metrics fine on ALDP5 but AC fails; quantum construction
  needs atoms and electronic state, rediscovers evaluation shapes, fails on BBA in vacuum;
  chemistry-only scaling gets widths but not torsions; conditioning gains do not imply
  generation gains (#864 worsened κ; #808's whitening best κ yet failed on BBA).
- **Scaling to BBA [measured diagnosis, 2026-11-11].** Springs: "right balance, wrong scale"
  (global RMS divisor 27.1). Whitening: "the noise lives off the molecule" (3,225 normal
  directions). wδ: bond resolution 1.25 σ(t_min). Internal coordinates: the collective
  lever arm makes Rg the least resolved observable. "Stiffness removal is local" (closeout).
- **Later reinterpretation [2026-11-14].** "Range and order": every property must be
  readable inside the trained noise levels (range) and large-scale shape should be erased
  last (order). Unit-spread coordinates (the goal of this era) have range without order;
  ALDP5 "has no separation between local and global structure and cannot test order"
  (status), which is why this era's ALDP5 successes did not predict BBA.

### 5.4 Durable lessons stated in the sources

- Read bonds and angles *with* width ratios; validity/range screens reward narrow
  distributions (closeout; #765).
- Report iid and simulation separately; simulations from training frames mostly preserve
  the starting set (noise-only controls match learned-force global scores, #895).
- Sample counts dominate small panels (2k BBA panels cannot rank populations).
- Check GPU sampling against CPU (the XLA bug); never trust an unexplained trend.
- Every number needs its own definition of κ (see §7).

---

## 6. Visualization opportunities

Each item: insight · on screen · computed from · sources · pitfalls. These continue the
existing Part 1 video, which ends with "Next: the spring metric", and connect to the Atlas
prototype ("one chart is not enough").

**V1. Lift, noise, project (the core idea).** Insight: diffusing in a flat feature space
gives metric-shaped noise on molecules with an exact Gaussian kernel. Screen: a planar
two-bead molecule; its bond vector b in a plane; the feature map lifts the plane onto a
steep cone in 3-D ($z=\sqrt w|b|$); a data cloud on the cone; a translucent isotropic
noise ball around one point; the nearest-point projection back onto the cone and down to
the plane gives a thin ellipse (radial std ≪ tangential). Side panel: flat noise in the
plane as a circle that wrecks the bond length. Slider w/(γ/2) from 1 (no stiffness) to the
ALDP value 93.3 ($c$ from 0.71 to 0.103). Computed: exact analytic (E2). Sources: note 23
§4.3, note 22 Prop. 4. Pitfalls: the 2-D cone is intrinsically flat (state it); show the
real 5.9° half-angle only after an exaggerated version; the projection is first-order
exact only for small σ (decoder failures at σ = 1: 82–179 of 4,096).

**V2. Chord versus arc.** Insight: wδ and every feature-space "distance" is a straight
chord in feature space, not the length along valid molecules. Screen: unit circle with two
points, chord and arc growing with Δθ; then a curved 2-D surface with the expansion
$r^2-\tfrac1{12}\|\mathrm{II}\|^2r^4$. Computed: analytic. Sources:
supervisor-metric-comparison-mathematics §2, `01-metric.md`. Pitfall: the chord is a
legitimate metric distance; do not call it "wrong", only "not the geodesic".

**V3. You cannot flatten an orange peel (equal-dimension obstruction).** Insight: a flat
chart of equal dimension must distort a curved metric, by at least $K\rho^2/12$. Screen:
four points on a spherical cap at distance ρ from a centre; try to place them in the plane
with all six distances; the best compromise distortion as ρ grows; overlay the E5 table
(bond-direction cone, θ = 0.1…1.6 rad) and the two curves $K\rho^2/12$ and $K\rho^2/3$.
Computed: analytic + note 22 table. Pitfall: ε here is distance distortion; the bounds
hold for maps into any dimension only for distances, not for metric error (higher
dimension can have zero metric error).

**V4. The curvature landscape of the ALDP5 torsion torus.** Insight: the soft space is
mildly but genuinely curved, with both signs; total curvature zero (Gauss–Bonnet); a single
flat chart of the populated region must err by a few to ~20%. Screen: a 72×72 heatmap of
K(φ, ψ) (diverging palette, ±0.12) with the data density as contours and the three basin
windows boxed; numbers: area 460, ∫|K| 8.8; populated 99.7% area 135, ∫|K| 1.83; windows
β −0.03 / αR +0.39 / αL +0.76; then wrap it onto a torus. Computed: **directly from the
saved arrays** `runs/theory-curved-pullback-2026-10-25/40_torus_curvature.npz` (K, dA, H,
grid; corrected run; manifest SHA-256 listed) — no recomputation needed. Pitfalls: this is
the spring metric with stiff coordinates held at their mean (a model of the soft
geometry); note 22's independent 16×16 code gives different window integrals (−0.05/+0.16/
+0.95) and the populated signed totals are not robust (§7); a first version had the sign
reversed; the extremes (|K| ≈ 0.11–0.12) lie in unpopulated regions.

**V5. A football sewn from flat panels (atlas).** Insight: a piecewise-flat atlas puts the
curvature at the seams; angle deficits add up to ∫K dA. Screen: tile the torsion-torus
heatmap of V4 with flat patches; at each vertex show the angle deficit; sum vs ∫K dA;
compare "one glued process" and "mixture of charts". Computed: discrete Gauss–Bonnet on
the V4 grid. Sources: note 23 §4.5; ties to the existing Atlas video and torus explorable.
Pitfall: on ALDP5 the curvature is small; the atlas argument there is driven more by
topology (periodic torsions) than by curvature (note 23 §3).

**V6. When noise erases what: nine rulers.** Insight: under flat noise the nine ALDP5
directions are erased over a decade-plus of noise times; under metric-shaped noise they
fall together. Screen: nine vertical bars with widths 0.025–0.66 Å (principal directions);
a noise-time slider; each bar fades as its signal fraction $r_k$ drops; mark t_min = 0.01
(production) and 10⁻⁵ (low floor); then switch to spring features (bonds and torsion swing
within ~4×) and to γ = 2 (synchronized). Computed: exact Gaussian per-mode formulas (E19,
E20). Sources: note 20 §4.6; force-field evidence `mode_std_A`; VP schedule.
Pitfalls: Gaussian marginal approximation (torsions are multimodal); E20 uses a
back-calculated normalization; synchronizing everything is not the goal (γ sweep, and the
later "order" requirement) — show the measured torsion JS at 100 updates (0.133/0.149/0.163
vs flat 0.117 vs 100 ps warp 0.027) as a twist ending.

**V7. Why the production-floor flat model makes bonds too rigid.** Insight: if the
smallest noise is wider than a bond, the ideal denoiser averages and narrows the bond
distribution by $w/\sqrt{w^2+s^2}$. Screen: a bond-length histogram (width 0.025–0.031 Å),
convolved with leftover noise 0.060 Å, then Tweedie-shrunk; predicted 0.39–0.46 vs
observed 0.44–0.53; and the learning curve that gets worse with training (0.981 → 0.422).
Computed: analytic + #765 numbers. Pitfall: this is a noise-floor bias, not overfitting.

**V8. The learning-curve race.** Insight: stiff modes learned 10–100× sooner, torsions
not. Screen: animated log–log curves (bond, angle, coupling, torsion JS) for five arms with
three floors as grey bands; callouts "≈2k vs 200k". Computed: logged results —
`feature-space-evaluation/evidence.json` holds key checkpoints; the full curves are in
`protocol.png` and the local MLflow store. Pitfalls: three seeds; panel choice moves PMF
by ≈0.06 kBT²; do not imply a final-quality win; production-floor curve rises.

**V9. One model, two uses (iid vs simulation).** Insight: flat diffusion cannot get
bonds and torsions right at one noise level; metric-shaped coordinates can. Screen: the
four-panel scatter of `force-field-simulation/iid_vs_simulation.png` rebuilt as an
animation: points move from iid (x) to simulation (y); diagonal = equal quality; then the
"error plane" (torsion error vs stiff error). Computed: `force-field-simulation/evidence.json`
(`distribution_200k_by_seed`). Pitfalls: extraction time differs per model (0.001–0.03);
simulations start from training frames and are not equilibrated; part of the stiff gap is
integrator bias (extrapolates to 1.00–1.01).

**V10. A force check without reference forces.** Insight: Stein's identity tests each
direction's restoring strength. Screen: nine bars per model (target 1); flat production
0.20–0.29 on bonds (too soft), spring/learned ≈1; animate over training checkpoints.
Computed: evidence JSON `equipartition_200k_ratio_by_seed_stiff_to_soft` and
`…_by_step`. Pitfall: necessary, not sufficient; torsion directions are weakly tested.

**V11. The bond-orientation sphere: equivariance makes the region global.** Insight: an
equivariant flat map must handle every bond orientation at once — a whole sphere of
radius ≈6 thermal widths with $K\rho^2\approx\pi^2$ — forcing 14–56% metric error, while
$S^2\times\mathbb R$ gets 2–11%. Screen: a thin spherical shell (thickness ~1 width,
radius ~6), attempts to flatten it, the E6 table. Computed: analytic. Pitfall: for two
beads this penalty is purely rotational; whether an internal analogue exists is open.

**V12. The conditioning ladder (one protocol per ladder).** Insight: maps differ by orders
of magnitude in how evenly they scale local fluctuations. Screen: log-scale ladder from the
#864 table (raw invariants 4,074 → wδ 270 → flat 216 → chemistry maps ≈450 → learned
invariant 72 → spring 55 → warp 45.5 → whitening 28.3 → isotropic floor ≈1.87); a second
ladder from #753 (184 → 24.6 → 3.88 → 2.99, floor 1.55); a third from note 20 windows.
Pitfalls: never mix κ definitions (equilibrium window vs 1 ps step vs quantum harmonic vs
neighbour moment; the same spring map is 9.6 in one and 55 in another); better κ did not
mean better generation (whitening best κ, failed on BBA; chemistry maps worse than flat).

**V13. Quantum springs: stiffness from one calculation.** Insight: a single electronic
structure Hessian predicts bead-level thermal widths without MD. Screen: pipeline
(22-atom ALDP → GFN2-xTB Hessian → $C=k_BT\,U(U^\top HU)^{-1}U^\top$ → bead features →
whitening L → map); then a bar chart predicted 0.0246–0.0336 Å vs measured 0.0252–0.0307
Å; then the residual-ratio drop 159/1030 → 15.1/37.4 → 6.75/12.58. Computed: logged.
Pitfalls: gas-phase harmonic, needs atoms and electronic state; earlier family selection
saw MD (not blind); fails for BBA in vacuum.

**V14. A rotating stick looks like a stretching stick.** Insight: finite rotations leak
into apparent stretching at second order, $-r\alpha^2/2$, comparable to a bond width at
1 ps turning angles. Screen: a stick turning by 7.5–16°, the projection of the endpoint
displacement on the old direction, a bar for the bond width. Computed: analytic (E15).
Sources: #753, #873. Pitfall: the effect is in the *estimator*, not the molecule.

**V15. Trace minus log-det: how a metric learns to whiten.** Screen: a data
second-moment ellipse and a metric unit ball; the loss surface over the ball's axes; at
the optimum the whitened cloud is a unit circle. Computed: analytic (note 24). Pitfall:
the optimum whitens second moments, not physical stiffness; neighbourhood labels are
biased (V14).

**V16. Constant whitening in feature space is a curved Cartesian metric.** Insight: global
whitening of invariant features (one matrix) already removes most stiffness because the
features are nonlinear in positions. Screen: five beads → 10 Gram + 4 signed volumes → one
linear map; widths raw 0.676–0.907 (iid) and 3.40–7.29× (simulated) vs whitened
0.989–1.010 and 1.035–1.106. Computed: logged (#808/#810). Pitfall: whitening uses target
trajectory data; it is not data-free.

**V17. Redundancy converts stiffness.** Insight: extra feature dimensions move the
stiffness into the normal directions: the network must learn a restoring score $\alpha/\sigma$
that diverges. Screen: data on a line in a plane, noise in the plane, the normal score
arrows growing as σ → 0; then BBA whitening's 3,303 features / 78 shape directions and the
0.06 tangent share. Computed: analytic (note 28 §4) + logged (#1025).

**V18. Why springs worked on ALDP5 but not on BBA: the scale bar.** Screen: two molecules
side by side; one global normalization divisor (1.31 vs 27.1); resulting spring-channel
spread 0.76 vs 0.037 next to the smallest training noise 0.045. Computed: logged + E22.
Pitfall: #895 (different network/normalization) did get 52× better BBA bonds; say which
recipe failed.

**V19. A zoo of maps (explorable).** Cards for every candidate in §2.7 with formula,
dimension, data used (target trajectory / quantum / source molecules / none),
alignment-free?, conservative-transformer results (iid and simulated width ratios from
#886), and failure modes. Computed: tables in this report. Pitfall: results come from
different recipes and dates; label each.

**V20. Sample counts and floors.** Insight: rankings made on small panels flip. Screen:
JS/PMF floors vs sample count for BBA (2k: 0.184 / 5.09 → 100k: 0.008 / 0.07) and ALDP5
(2k: JS 0.139, PMF 5.43 → 50k: 0.0087, 0.100); the spring PMF "advantage" at 2k
vanishing at 100k. Computed: logged.

**V21. The alignment cut.** Insight: one aligned chart is discontinuous; a smooth warp
built on it jumps 4.7–6.6 Å within 0.1 Å of data, and generated molecules break there (13
of 18 at the boundary). Screen: a nearly planar five-bead molecule, its two tied Kabsch
alignments, the flip by 139–177°. Computed: analytic toy + #753/#773 numbers. Motivates
the invariant (Gram + signed volume) encoder.

**V22. Hessian curvature is anharmonicity squared.** Screen: a quadratic potential gives
a flat metric; add a cubic term and watch K appear ($K\sim\tfrac14|U'''|^2$); then the
one-bond true Hessian: eigenvalue $\gamma/2+w(r-r_0)/r$ crossing zero at 0.60σ_r
compression. Computed: analytic. Pitfall: spring (Gauss–Newton) and true Hessians differ
in sign of curvature.

**V23. Early speed-ups fade.** Screen: paired curves (map vs flat) for several lines —
graph-energy (20k: 42%/53% better bonds/angles; 100k: flat wins bonds), flat MLP widths
(1.115–1.291 at 20k → 0.994–1.049 at 200k), retention maps (BBA whitening JS 0.582 →
0.384 at 100 updates, 0.372 → 0.358 at 20k). Computed: logged. Message: compare several
checkpoints.

**V24. Two scales of the same molecule (bridge to the next era).** Screen: ALDP5 vs BBA:
local (bond W1) bars shrink with every map; global (Rg, TIC JS) bars do not (#895, Sprint
12 first chunk); finish with "range and order". Computed: logged. Pitfall: different
networks and budgets across the two systems.

**V25. Uniformization of the soft torus (optional, advanced).** Screen: a curved torus
metric mapped to a flat lattice torus by isothermal coordinates; Brownian motion running
with the clock $e^{-2u}$. Computed: needs solving a Beltrami equation for $h$; only
conceptual unless implemented. Source: note 23 §4.4.

**V26. A map that never saw chemistry finds the bonds.** Insight: the learned warp is
fitted to 1 ps steps only, yet its most-magnified directions are the bond and angle
gradients and its least-magnified the (φ, ψ) motions. Screen: the five-bead chain with the
warp's top-4 magnified directions drawn as arrows next to the four bond-stretch gradients;
overlap gauges against chance: top 4 vs bonds 0.973/0.972 (chance 0.444), top 7 vs bonds +
angles 0.999 (0.778), bottom 2 vs soft motions 0.995 (0.222); ALDP10 top 22 vs bonds +
angles + stiff dihedrals 0.997 (0.917). Computed: logged (`design/learned-stiffness-warp.md`
flag test). Pitfall: this warp has an alignment cut and fails to decode 3.6–7.8% of points
at noise 3c.

**V27. Whitening fattens the soft sheet.** Insight: in raw coordinates ALDP5 lives in a
thin tube around the 2-D (φ, ψ) torsion sheet (2.1% of held-out variance off the sheet);
after the learned (whitening-like) map 31–34% lies off it, because whitening magnifies every
small direction, including noise. Screen: a thin curved ribbon in 3-D that inflates into a
fat tube as a "whitening" slider moves. Computed: logged (#756 PR body; #761 gauge-free scan:
local dimension 2.0 from 0.4 Å raw, no plateau in the 1 ps metric). Message: find soft
structure in raw coordinates, apply the thermal metric afterwards — the stiff/soft split of
the next era. Pitfall: #756's tube analyses were later "judged misleading" for #780's
purpose (#780 issue); present as a diagnostic, not a result about generation.

---

## 7. Open questions, caveats, contradictions and superseded interpretations

1. **Note 20 vs note 22 on flatness (2026-10-23 vs 10-25).** Note 20 originally said only
   flatness on $V$ matters; note 22 Theorem 3 corrected this (an equivariant flat metric
   cannot match the spring metric's *internal* geometry). Note 20 now carries the
   refinement.
2. **Note 20's conditioning gap (spring 8–13 vs internal stretch 11–22).** Note 22 §5.5:
   single-structure conditioning cannot detect curvature; the gap reflects the restricted
   map family.
3. **Two curvature codes (both 2026-10-25).** Window integrals differ (note 22: −0.05/
   +0.16/+0.95; note 23: −0.03/+0.39/+0.76; ∫|K| 0.27/0.39/0.95 vs 0.22/0.49/0.77). Note 22
   gives ∫K dA = +0.08 for its 0.997 region; recomputing from the saved 72×72 grid gives
   −0.16 for the 99.7%-mass bins [derived here]: the sign of the populated total is not
   robust to grid and region definition. A first note-23 probe had reversed signs
   (superseded, preserved).
4. **Superseded GPU results (2026-10-25/26).** #757/#760/#763: "late-training
   degradation", drift off the surface, wδ's growing errors, all low-floor results and
   the σ round-off explanation were withdrawn in #765 (2026-10-26). Retained from the
   pilot: CPU flat/learned rows, the projection comparison (≤0.003 kBT), flat/spring bond
   PMF ratios 3.3×/1.8×/1.4× (CPU 3.35×/1.82×/1.44×).
5. **#756's curved embedding (2026-10-25).** 0.45 nats per step pair better, but κ rose 5%
   and the cap bound; "What the gain means is open" (metric curvature vs curved finite
   steps). Closed; not resolved.
6. **Architecture dependence of the quantum-spring win (2026-10-28).** 32–46× (MLP) vs
   1.7–2.4× (rotation-equivariant Cartesian); "must not be presented as an
   architecture-independent metric gain".
7. **Which ingredient helped (2026-10-28).** The learned invariant φ used hand-specified
   chain coordinates in its loss; global whitening gave most of the benefit (#808).
   Chemical attention gave no advantage over source-average weights (#865/#873/#877).
8. **The κ zoo.** Equilibrium-window κ (note 20: spring 9.6/7.6/13.4, implicit-solvent
   benchmark frames), 1 ps step κ (#753: flat 184; #864: spring 55, flat 216), quantum
   harmonic residual ratio (#790), neighbour second moment (#865: flat 3,667 on ten-bead
   minipeptides). Different data (explicit vs implicit solvent), lags and estimators; do
   not plot on one axis.
9. **Data-free is not blind.** Quantum coefficients used no MD, but family selection had
   inspected MD (#790); the original protein screen used generated dummy conformations
   (corrected 2026-10-28, #794).
10. **Rare basin and equilibrium.** Models converge to the training trajectory's αL
    population (≈3.2%) not the held-out one (1.6%); held-out ΔF error 0.68–0.72 kBT for
    every arm; no simulation equilibrated basins (β-start runs still rising; long invariant
    runs keep their initial counts).
11. **Force-time choices.** #768 selected per-model times on training Stein residuals; #886
    used t = 0.05 for all, which blurs flat Cartesian forces most — part of flat's 2.3–2.9×
    simulated widths is this choice, not the map.
12. **BBA springs: two results.** #895 (2026-11-01): 52× better bonds. Sprint 12 first chunk
    (2026-11-09): springs bond 0.320 vs Cartesian 0.415 Å, angles worse; #1025
    (2026-11-11) attributes it to one global RMS normalization (divisor 27.1). Whether
    #895 normalized differently is not documented in the files read here [open].
13. **Irony of internal coordinates.** Note 20 (2026-10-23) kept them only as an ablation
    (not transferable); 2026-11-14 internal coordinates plus two loud modes became the
    working hypothesis. Transferability remains open for that approach too.
14. **Intrinsic vs ambient noising.** #947 rejects one intrinsic recipe "not intrinsic
    diffusion generally"; the note 23 §6 pilot (A0–A3: capacity, per-basin warps,
    $T^2\times\mathbb R^7$) was never run.
15. **Large-noise decoding.** Feature-space noise is metric-shaped only to first order; at
    σ = 1 decoded covariances err by 1.03–2.05 (multireference) or 6.61–21.99 (single
    reference) and some solves fail; whitening/endpoint maps lost 5–6.6% of BBA decodes.
16. **Open theory items (note 22 §7).** Quantitative version of Theorem 3; best
    product-of-spheres approximation; internal analogue of the equivariant penalty;
    curvature of data-estimated (PGA) thermal metrics.

---

## 8. Sources read

Theory (`docs/theory/`): `22-flat-pullback-obstruction.md` (full), `23-curved-pullback-targets.md`
(full), `20-thermal-metric-foundations.md` (full), `README.md`, `01-metric.md` (§1–§3),
`24-local-moment-metric-loss.md` (first half), `25-information-geometry-lag-noise-posterior.md`
(§0, §2–§3 excerpts), `28-score-ease-and-thermal-preconditioning.md` §4,
`29-score-to-force-pullback.md` (full).

Design (`docs/design/`): `chemical-feature-metric.md`, `invariant-thermal-embedding.md`,
`chemical-invariant-initializer.md`, `invariant-feature-alternatives.md`,
`general-invariant-feature-comparison.md`, `graph-metric-generation.md`,
`graph-metric-learning-curves.md`, `graph-metric-target-controls.md`,
`reference-metric-pairs.md`, `shared-chemical-energy.md`, `chemical-graph-embedding.md`,
`feature-space-driver.md`, `learned-stiffness-warp.md`, `invariant-generation-forces.md`.

Investigations (`docs/investigations/`): `sprint11-pullback-campaign-closeout.md`,
`feature-space-diffusion-pilot.md`, `feature-space-evaluation.md` (+ `evidence.json`,
`protocol.png`), `force-field-simulation.md` (+ `evidence.json`, `iid_vs_simulation.png`),
`data-free-spring-features.md`, `general-quantum-construction.md`,
`shared-chemical-spring-model.md`, `energy-curvature-spring-features.md`,
`multireference-curvature-springs.md`, `data-free-quantum-diffusion.md`,
`rotation-quantum-diffusion.md` (stubs; historical full reports read via
`git show 92aecbd655d1be68f6b1de41ef665817a51aabc6:docs/investigations/…`),
`supervisor-metric-comparison.md`, `-mathematics.md`, `-methods.md` (+ `final-200k.csv`,
`pr885-final-200k.csv`), `invariant-thermal-embedding.md`, `invariant-generation-forces.md`,
`invariant-full-training.md`, `invariant-main-comparison.md`, `invariant-training-curves.md`,
`invariant-initializer-ablation.md`, `invariant-initializer-forces.md`,
`chemical-invariant-initializer.md`, `relaxation-metric-feasibility.md`, `flat-symmetry.md`,
`joint-distribution-metrics.md` (summary), `spring-soft-scale-sweep.md` (results),
`retraction-downstream-857.md`, `bba-local-geometry-preconditioning.md` (§0–§3),
`bba-range-and-order.md` (§0–Table 3).

Status and registries: `docs/status.md` (full), `docs/sprints/README.md`,
`docs/sprints/sprint12/matched-results.md` (first table); archive
`rg-archive/docs/status.md` (2026-10-20 → 10-22 entries).

GitHub (read-only): PR list #740–#900 with dates; PR bodies #756, #770, #895; issues #769,
#778, #780; dates of #895, #899, #911, #945, #947, #949, #951, #955, #960, #1025, #1026,
#1057, #1069, #1078, #1079. Git log of origin/main for the key documents.

Local run store (read-only): `runs/theory-curved-pullback-2026-10-25/` (`MANIFEST.txt`,
`40_aldp5_curvature_probe.log`, `41_curvature_followup.log`, `50_pullback_higher_dim.log`,
`40_torus_curvature.npz`, `10_torus_regions.npz`).

Animation repo context: `README.md` (Part 0, Part 1, Atlas prototype, torus explorable).
