# g3 — Literature positioning: stiffness/preconditioning and noise order/readable windows

Reader: g3-literature-positioning. Written 2026-11-19 from the rg-main snapshot (origin/main of
2026-11-19), the local paper library (`papers/`), the archive tag, archived PR branches (read with
`git show`) and GitHub PR metadata. Nothing was trained or modified. Numbers are quoted from the
named source; anything I computed myself is marked **(derived here)**; anything I infer is marked
**(inference here)**.

**One-paragraph verdict.** The two halves of the project's story map onto two literatures that pull
the data's variance spectrum in *opposite* directions. The stiffness/preconditioning literature
(Ahamed et al. 2026, EDM input scaling, Everaert's covariance realignment, Falck's EqualSNR,
Wang & Pehlevan's spectral bias) says: *flatten the spectrum*, otherwise narrow directions are
learned slowly, weighted weakly by the loss and erased below the trained noise range. The
noise-order literature (Rissanen, Wang & Vastola, Biroli et al., Li & Chen, Sclocchi et al.,
Pan et al., Dieleman, EigenFold) says: *a steep spectrum creates a coarse-to-fine order*, and
generation decides high-variance structure first. Full whitening is optimal for the first and
destroys the second; Cartesian coordinates are the reverse. The project's current design
(internal coordinates at thermal width plus two loud collective modes) is a deliberate split:
equalize the stiff/local block (range), keep a tiny global block loud (order). Each ingredient has
precedent; the explicit range/order decomposition for molecules, the training-free per-observable
probe on nonlinear molecular observables, the constraint-split analysis of a redundant chart and
the immersion-volume force read-out are what remain new. Two gaps in the maintained docs matter
for a thesis: Ahamed et al. (direct prior art for the conditioning theorem and the learned warp)
is cited nowhere in `docs/`, and `Related_Work.md` still carries the wδ-era novelty claims.

---

## 1. Narrative (chronological)

### 1.1 The wδ-era positioning (before mid-October 2026, still the text of `Related_Work.md`)

`docs/Related_Work.md` and the "Core method papers" table of `docs/REFERENCES.md` position the
project as diffusion on the quotient shape manifold $\mathrm P(d,n)/\mathrm E(d)$ with Diepeveen's
training-free $w^\delta$ metric. Novelty is "a compound, not any single ingredient": (1) a
training-free, force-field-free energy-aware shape metric, (2) the full E(3) reflection-inclusive
quotient, (3) ensemble sampling from a samplable confining-OU prior, (4) log-free training (GRW +
ISM) valid past the injectivity radius. The closest prior art is **R-DM** (Woo et al. 2024), a
pullback metric $g=J_\Phi^\top J_\Phi$ of a chemistry-parameterised pair-distance map;
**QSD** (Xu et al. 2026) is the quotient-axis neighbour (flat metric, SE(3), no reflections);
RSGM/RDM/RFM supply the manifold machinery; EDM is listed as the sampler/preconditioning
design-space reference with the caveat "Euclidean, not Riemannian".

None of the current approach (internal coordinates, loud modes, readable windows) appears in
`Related_Work.md` on 2026-11-19. The four pillars belong to the abandoned wδ route, and pillar (2)
no longer applies: the papers index states that "current invariant-embedding experiments identify
translations and proper rotations (SO(3)), preserving chirality", and C3 encodes signed torsions
(cos, sin), which is the same symmetry convention as QSD.

### 1.2 Stiffness as a conditioning problem (19 Oct – 10 Nov 2026)

- **2026-10-19 — R-DM re-read** (`papers/2024/woo2024_..._v2-notes.md`). The note confirms R-DM as
  "genuine prior art" for "custom molecular geometry, metric-isotropic corruption and manifold
  denoising", says R-DM is a *refinement* method, not an equilibrium sampler, and flags three claims
  in the REFERENCES row as unsupported: that R-DM stays inside the injectivity radius, that it has
  "no reflections" (its pair-distance map is O(3)-invariant), and that its metric approximates the
  Fukui metric $\partial E\otimes\partial E$ ("rank at most one ... cannot itself be a positive-definite
  metric"). The REFERENCES row and the `Related_Work.md` master table still contain these claims
  (see §7). The note also records R-DM's ablation (Supplementary Table 5, median RMSD: E-DM 0.091,
  Euclidean noise with Riemannian loss 0.087, full R-DM 0.031 Å), read as "changing the corruption
  distribution matters beyond changing the loss". The project later reached the same conclusion for
  itself (§1.3, "prediction is not generation").
- **2026-10-20 — an EigenFold-type process already tried** (#617, Sprint 10, archived
  `docs/investigations/prior-mobility-617.md`). On ten-bead minipeptides, a harmonic graph prior
  $S=(\kappa L)^+$ with exact Gaussian forward conditionals "improves held-out bond distributions in
  every matched seed"; "no alternative consistently improves torsion populations over the fresh flat
  control"; "equalizing all graph-mode relaxation rates is mathematically exact but does not give the
  best learned generator". The design doc `docs/design/transferable-noising.md` already cites
  EigenFold §3.1 and Chroma Fig. 1 as "relevant precedents". Ten beads cannot test order.
- **2026-10-24 — theory note 21** (`docs/theory/21-target-loss-noise.md`). This is the project's own
  version of the conditioning argument: training curvature equals input spread times loss-metric
  spread (Theorem 1), each score target has one natural pairing (Theorem 2), only thermal inputs
  give curvature 1, and "thermal units are built-in Newton steps" (Proposition 3). It states
  "Criterion C is the matrix form of EDM's input scaling (Karras et al. 2022, not checked)". It also
  derives that information loss is synchronized across modes iff the noise metric is proportional to
  the stiffness (Proposition 4). That is Falck's EqualSNR condition, and at the time it was an
  aim. Proposition 5: at the trusted floor $t=0.01$ the flat noise is σ = 0.045 Å, above the
  ALDP5 bond width, so "no trained level resolves a bond".
- **2026-10-24 → 27 — learned stiffness warp** (#753). A coupling flow fitted to 1 ps steps so local
  fluctuations are isotropic in $z=W(x)$. This is *transform, train, invert*, with a **local**
  thermal objective.
- **2026-10-29 → 11-12 — learned and Gaussianizing maps.** Trace/endpoint fitting (#871, #876, #882;
  consolidated #943), global-likelihood equivariant flows as standalone generators (#908, #910;
  retired in #946 on 2026-11-06), marginal torsion Gaussianization (#941; consolidated #950). The
  Ahamed v4 review lists their numbers (§4.2).
- **2026-11-10 — Ahamed et al. reviewed** (`papers/2026/ahamed2026_*-notes.md`). v1 was posted on
  2 March 2026 (*Preconditioned Score and Flow Matching*); v4 on 6 November 2026 (*Preconditioned
  Flow Matching*, NeurIPS 2026 footer). The reviews call it "direct prior art for an invertible
  change of coordinates followed by Euclidean generative modelling and inverse decoding" and say
  "the general transform–train–invert construction should not be claimed as novel". The useful
  conceptual result (v1 review): "narrow directions can learn slowly even when a model has enough
  capacity", "compatible with the current local ALDP5 comparison ... stiff widths improve earlier with
  metric-aware coordinates, but a flat MLP can catch up". The most useful new finding in v4 is
  negative: "the best-conditioned representation can give worse samples because inverse decoding
  can amplify error" (G.9: partial whitening beats full whitening). A grep of the whole rg-main
  snapshot and the archive docs finds **no mention of Ahamed** outside the ignored library.

### 1.3 BBA and the turn to order (11 – 14 Nov 2026)

- **2026-11-11 — stiffness removal fails on BBA** (#1025, #1026; consolidated in
  `docs/investigations/bba-local-geometry-preconditioning.md`, #1078). "Springs put bond fluctuations
  below the smallest training noise; whitening spent 94% of its low-noise loss on directions that
  leave the molecule; internal coordinates make overall size the least resolved quantity." C3
  (internal coordinates + unit-phase distances) had near-floor local geometry but Rg W1 0.477 Å.
- **2026-11-12 — #1055 mechanism and literature sweep** (archived branch
  `bba-internal-global-structure-mechanism`, §4: "170 findings; 80 were checked against the paper
  text"). The sweep imported the first noise-order literature: isotropic noise drowns low-variance
  modes first (Rissanen [V]; Falck [PV]); per-direction SNR is invariant under any invertible linear
  map applied to signal and noise (Everaert [PV]), so "C3's whitened features therefore have equal
  signal-to-noise in every feature direction"; "re-weighting noise levels is not the lever"
  ("image-tuned weightings move weight the wrong way", Kingma & Gao [PV], Choi [PV]). It also
  found molecular precedents for C3's failure mode: "On BBA itself, a likelihood-trained
  internal-coordinate flow reproduced the folding free energy within about 1 kT, while 33–36% of its
  raw samples contained a non-neighbour clash (Köhler et al. 2023 [PV])"; "Chroma's published
  ablation found that models trained with Cartesian-space losses refolded better than models trained
  only on chain-whitened coordinates". The same PR measured the readable windows and ran two
  protocols that are exactly those of the literature, without naming them so: noise a held-out
  molecule to $t_s$ and regenerate (the forward–backward protocol of Ho / Sclocchi / Li & Chen), and
  branch reverse trajectories into independent continuations (Biroli's cloning protocol).
- **2026-11-12 / 13 — theory note 27 and its library.** Note 27
  (`docs/theory/27-readable-windows-and-noise-order.md`, research note dated 2026-11-12; PR #1064)
  defines readability, range and order and states three training-signal identities. On 2026-11-13
  ten originals were acquired into `papers/noise-order-feature-readability/` (Guo, Pan, Li & Chen,
  Sclocchi, Biroli, Wang & Vastola, Rissanen, Falck, Choi, Kong), each with an explicit
  "Checked:" boundary. The note insists "This is not a new method."
- **2026-11-12 → 14 — order restored by a loud block** (#1057 γ dial, #1069 block size). Size error
  falls 0.51 → 0.08 Å as the collective block goes from whitened (γ = 1) to natural (γ = 0); two
  loud vectors appended to C3 give C3-level local geometry and near-Cartesian size on two seeds.
- **2026-11-13 / 14 — skeleton-and-arrows map with its own literature section** (#1068, closed
  2026-11-15; `docs/investigations/bba-coarse-to-fine-chain-chart.md` on branch
  `coarse-to-fine-chain-chart`). It cites GUD (Gerdes, Welling, Cheng: "a basis, a prior, and a
  separate noise schedule per component"), Dieleman's spectral autoregression, Falck (as a
  counterpoint), Pan, wavelet conditional factorizations (Guth et al. ×2, Kadkhodaie et al.,
  Lempereur & Mallat), inverse renormalization group (Cotler & Rezchikov; Masuki & Ashida),
  multilevel path-integral Monte Carlo (Ceperley), polymer back-mapping (Zhang, Stuehn, Daoulas,
  Kremer), PAR scale-by-scale protein generation, Equivariant Blurring Diffusion, GenZProt, the
  backrub motion and Kim et al.'s internal-coordinate flows. Its three lessons: "Order can be set
  inside one diffusion model by per-coordinate loudness"; "The gain comes from conditionals that are
  simple given the coarser level"; "No source we found combines three things: an order along the
  sequence, explicit stiff coordinates, and one description without redundancy." The map itself
  was refuted (torsion error 7.9° against a 6.5° limit).
- **2026-11-14 — direction change in `docs/status.md`.** The status page now says "Stiffness removal
  is kept for the stiff coordinates and dropped as a goal for the whole molecule." Its novelty
  bullet reads: "Per-coordinate noise levels and readable windows exist in the literature cited in
  #1064 and #1068; the combination with explicit stiff coordinates and force extraction is what
  remains to be shown."

### 1.4 Placing the published processes (16 – 18 Nov 2026)

- **2026-11-16 — lab entry `2026-11-16-readable-windows-noise-precedents` (#1099).** A
  training-free screen of EigenFold and Chroma-style noising on BBA. The result: "No correlated
  Gaussian noise on Cartesian coordinates gives BBA's bond lengths a usable window"; EigenFold has
  "even more order than Cartesian noise (five decades from bond to size erasure, against three)";
  Chroma-style covariances "trade most of the order for three to eight times wider local windows";
  "Only internal coordinates with two loud collective modes have both properties".
- **2026-11-18 — theory note 30 and a 14-reference verification pass** (the "Order and constraints in
  redundant charts" table of REFERENCES: Masuki & Ashida, EigenFold, Chroma, NeuralPLexer,
  La-Proteina, Arts/Frellsen/Boomsma 2024, FoldingDiff, Singh et al., Matryoshka, Wang & Pehlevan,
  Refinetti et al., Bardone & Goldt, Ben Arous et al., CGnet; "none of these PDFs is in the local
  library yet"). Note 30's novelty sentence: "A literature search on 2026-11-18 found no generative
  model that noises internal coordinates together with redundant collective channels in one process.
  This is an absence of evidence, not a proof."
- **2026-11-18 — #1137 declared, not run:** a test of note 30's prediction that a whitened two-vector
  block keeps about half the size gain (the constraint split).

### 1.5 Where the positioning stands (2026-11-19)

The theory notes carry careful, dated source boundaries. The two thesis-facing documents
(`REFERENCES.md` "Core method papers" and `Related_Work.md`) are still in the wδ era. Ahamed
appears only in the ignored library. The novelty claims for the current approach are scattered
across `status.md`, note 27 §8, note 30 §8 and the #1068 doc, all phrased as absence of evidence.

---

## 2. Core mathematics

Clock conventions differ between sources and must not be mixed on screen. The project's VP clock:
$\alpha_t^2+\sigma_t^2=1$, $-\log\alpha_t^2=B(t)=0.1t+9.95t^2$, so $\beta(t)=0.1+19.9t$, with $t=0$
clean and $t=1$ noise. Ahamed's flow-matching clock runs the other way ($t=0$ noise, $t=1$ data).
Biroli uses the OU clock $\alpha_t=e^{-t}$. Guo, Pan and Kong use SNR $\gamma=\alpha_t^2/\sigma_t^2$.

### 2A. Stiffness and preconditioning

**A1. Gaussian flow-matching regression geometry** (Ahamed v4, Prop. 3.1 and Lemma 3.2, pp. 4–5).
With $x_0\sim N(0,I)$, $x_1\sim N(0,H)$ independent and $x_t=(1-t)x_0+tx_1$:
$\Sigma_t=(1-t)^2I+t^2H$; the conditional target is $g_t^\star(x_t)=A^\star(t)x_t$ with
$A^\star(t)=[tH-(1-t)I]\Sigma_t^{-1}$; and for any linear predictor
$L_t(A)=L_t(A^\star)+\operatorname{Tr}[(A-A^\star)\Sigma_t(A-A^\star)^\top]$.
In words, the excess risk is weighted by the intermediate covariance, so errors along low-variance
directions barely cost anything. Directional consequence (Eq. 24):
$\|(A-A^\star)u_i\|^2\le\varepsilon/\sigma_i(t)$ with $\sigma_i(t)=(1-t)^2+t^2\lambda_i$, so "a small
fixed-time FM excess loss may still be consistent with large velocity error in the corresponding
low-variance direction."

**A2. Gradient descent is condition-number limited** (Ahamed v4, Theorem 3.3; Appendix D.4).
$E_{k+1}=E_k(I-2\eta\Sigma_t)$; converges iff $0<\eta<1/\sigma_{\max}$; at
$\eta^\star=1/(\sigma_{\max}+\sigma_{\min})$ the worst factor is $(\kappa-1)/(\kappa+1)$ and
$k=O(\kappa(\Sigma_t)\log(1/\varepsilon))$, with $\kappa(\Sigma_t)=\frac{(1-t)^2+t^2\lambda_{\max}}{(1-t)^2+t^2\lambda_{\min}}$.
Library qualification (v4 notes): at the optimal step the extreme eigenvalues contract equally, so
"low-eigenvalue slowness is the useful small-step interpretation". SGD (Prop. 3.5): only the
*mean* error contracts mode-wise; there is no universal inverse-eigenvalue stationary variance.

**A3. Preconditioning reshapes the path** (Ahamed v4, Theorem 4.1, p. 7). With $\tilde x_1=Px_1$,
$\tilde x_t=(1-t)x_0+t\tilde x_1$: $\tilde\Sigma_t=(1-t)^2I+t^2PHP^\top$. For $P=H^{-1/2}$,
$\tilde\Sigma_t=[(1-t)^2+t^2]I$ and $\kappa=1$ for all $t$; if $mI\preceq PHP^\top\preceq MI$ then
$\kappa(\tilde\Sigma_t)\le\frac{(1-t)^2+t^2M}{(1-t)^2+t^2m}$. Scalar time weights (F.3) multiply the
Hessian by $\alpha(t)$ and leave the directional condition number unchanged.

**A4. Inverse amplification** (Ahamed v4, G.9, Eq. 186):
$P^{-1}(z+\delta z)-P^{-1}(z)=J_{P^{-1}}(z)\,\delta z+O(\|\delta z\|^2)$. The worst-case gain is
$\|J_{P^{-1}}\|_2$, not its condition number.

**A5. Transform, train, invert as geometry** (Ahamed notes; note 28 §6). For an equal-dimensional
diffeomorphism $P$, $G=DP^\top DP$, and isotropic latent noise has physical covariance
$\propto G^{-1}$. Densities and scores transform as $p_x=p_z(P(x))|\det DP|$ and
$\nabla_x\log p_x=DP^\top\nabla_z\log p_z+\nabla_x\log|\det DP|$.

**A6. The project's curvature theorem** (note 21, Theorem 1, §4.2). Input $z$ centred with
covariance $C$, target $y=W^\star z$, loss metric $M$:
$L(W)=\operatorname{vec}(W-W^\star)^\top(C\otimes M)\operatorname{vec}(W-W^\star)$, with Hessian eigenvalues
$2c_jm_i$, condition number $\operatorname{cond}(C)\operatorname{cond}(M)$, GD factor $1-2\eta c_jm_i$,
stable iff $\eta<1/(c_{\max}m_{\max})$. This is A1/A2 with a general loss metric, derived
independently on 2026-10-24, after Ahamed v1 (2026-03-02) and without citing it.

**A7. Pairings and thermal Newton steps** (note 21, Theorem 2 and Proposition 3). In the commuting
one-basin model, the targets $y=G_t^{-a}s$ with inputs $\tau=G_t^{1-a}$ and loss $M=G_t^{2a-1}$ have
training curvature $\kappa_t^{2|1-2a|}$. $a=1$ is the Riemannian score with raw inputs, $a=\tfrac12$ the
whitened score with thermal inputs, $a=0$ the covector with precision-weighted inputs; only
$a=\tfrac12$ makes the inputs even ("criterion C"). The map $W'=G^{1/2}WG^{-1/2}$ turns a whitened GD
step into $W\leftarrow W-\eta G^{-1}(\nabla_WL)G$, Newton's step at $\eta=\tfrac12$ when $C^{-1}=M=G$.

**A8. Noise-level metric** (note 21 §2.4): $G_t=(\alpha_t^2G^{-1}+\sigma_t^2N^{-1})^{-1}$; under flat
noise its eigenvalues are $\lambda/(\alpha_t^2+\sigma_t^2\lambda)$, equal to $G$ at low noise and
$I/\sigma_t^2$ at high noise.

**A9. Information per mode and the EqualSNR condition** (note 21, Proposition 4):
$I(x_0;x_t)=\sum_k\tfrac12\log(1+\mathrm{SNR}_k)$ with $\mathrm{SNR}_k=\alpha_t^2\theta_k/\sigma_t^2$, where
$\theta_k$ are the eigenvalues of $N^{1/2}\Sigma N^{1/2}$. The signal fractions are equal across modes
at every $t$ iff $N\propto\beta H$ (noise shaped like the stiffness). Proposition 5: under flat noise
mode $k$ is resolved iff $\sigma_t^2\le\alpha_t^2/\lambda_k$.

**A10. EDM preconditioning** (Karras et al. 2022, Eq. 7 and Table 1, checked in the local PDF
`papers/2022/karras2022_elucidating_design_space_diffusion_edm.pdf`):
$D_\theta(x;\sigma)=c_{\mathrm{skip}}(\sigma)x+c_{\mathrm{out}}(\sigma)F_\theta(c_{\mathrm{in}}(\sigma)x;c_{\mathrm{noise}}(\sigma))$
with $c_{\mathrm{skip}}=\sigma_{\mathrm{data}}^2/(\sigma^2+\sigma_{\mathrm{data}}^2)$,
$c_{\mathrm{out}}=\sigma\sigma_{\mathrm{data}}/\sqrt{\sigma^2+\sigma_{\mathrm{data}}^2}$,
$c_{\mathrm{in}}=1/\sqrt{\sigma^2+\sigma_{\mathrm{data}}^2}$, $c_{\mathrm{noise}}=\tfrac14\ln\sigma$. These are
chosen "by requiring network inputs and training targets to have unit variance (cin, cout), and
amplifying errors in Fθ as little as possible (cskip)". $\sigma_{\mathrm{data}}$ is **one scalar**,
and the scaling acts on the network, not on the forward process.

**A11. Matrix generalization in the project** (`docs/investigations/covariance-aware-prediction.md`,
PR890/891): with $V_t=\alpha_t^2C+\sigma_t^2I$,
$u_t=V_t^{-1/2}(z_t-\alpha_t\mu)$ and
$\hat\epsilon_\theta=\sigma_tV_t^{-1}(z_t-\alpha_t\mu)+r_\theta(u_t,t)$, optionally
$b+R^{1/2}r_\theta$ with $R=\operatorname{Cov}(\epsilon-b)=\alpha^2CV^{-1}$. This is the matrix-valued
analogue of $c_{\mathrm{in}}$, $c_{\mathrm{skip}}$ and $c_{\mathrm{out}}$ (the doc derives it "for the
matrix-valued VP noise target" and cites EDM §5 Eq. 7 and App. B.6 Eqs. 118–131). Verdict there:
"Lower noise-prediction loss does not give a consistent molecular-quality improvement."

**A12. Why a locally well-scaled map need not make the score easy** (note 28):
- the predictable label fraction for one Gaussian feature of variance $\lambda$ is
  $\operatorname{Var}(\epsilon^\*)=\tau^2/(\lambda+\tau^2)$ with $\tau=\sigma/\alpha$;
- with a Gaussian skip the residual slope is $\nabla H^\*=\tau(1-\lambda)y/(\lambda+\tau^2)$, peaking at
  $\tau=\sqrt\lambda$ with coefficient $(1-\lambda)/(2\sqrt\lambda)$;
- for a flat $d$-dimensional image in $\mathbb R^M$: $\epsilon^\*=\sigma_ty_T+y_N/\sigma_t$ and
  $\nabla H^\*=(\alpha_t/\sigma_t)y_N$ ("redundancy does not remove stiffness, it converts finite
  tangent stiffness into diverging normal stiffness");
- the sufficient condition $p_q(s,r)=p_s(s)N(r;\mu(s),L(s)L(s)^\top)$ makes
  $z=L(s)^{-1}(r-\mu(s))$ exactly standard normal at every noise level;
- score transport is $s_T(T(q))=DT^{-T}[s_q-\nabla_q\log|\det DT|]$.

**A13. R-DM's pullback** (Woo et al., §4.1 Eqs. 4–8, as quoted in the library note):
$s_{ij}=\|x_i-x_j\|/(R_i+R_j)$, $q_{ij}=e^{-\alpha(s_{ij}-1)}+\beta/s_{ij}$, $g^{\mathrm R}=Dq^\top Dq$, with
$\alpha=1.7$ and $\beta=0.01$. Tangent noise is metric-isotropic ($E[\xi\xi^\top]=g^{-1}$, Eqs. 11–12),
the forward process is the wrapped Gaussian $\tilde x=\exp_x(\sigma\xi)$, and the target is
$\exp^{-1}(x_0)/\sigma^2$ (Eq. 18). Compare $w^\delta$: $F(X)=((\log r_{ij}),\sqrt\delta\log\det G_X)$,
also of the form $J^\top J$.

**A14. QSD horizontal lift** (Xu et al. 2026, Theorem 2/4, Eqs. 8–11, checked in the local PDF):
$d\tilde x_t=[P_{\tilde x_t}(f_t)-\tfrac{\sigma_t^2}{2}\tilde h]dt+\sigma_tP_{\tilde x_t}dw_t$, with
$P_x(v)^{(n)}=v^{(n)}-K(x)^{-1}\big(\sum_{n'}x^{(n')}\times v^{(n')}\big)\times x^{(n)}$,
$\tilde h(x)^{(n)}=K^{-1}x^{(n)}-\operatorname{tr}(K^{-1})x^{(n)}$ and
$K(x)=\sum_n(\|x^{(n)}\|^2I-x^{(n)}x^{(n)\top})$. The loss $E\|P_{x_t}(D_\theta-x_1)\|^2$ frees the model
from predicting anything vertical. The term $\tilde h$ is "the reflection of the spatial change rate
of equivalence-class volume", the quotient analogue of the project's orbit-volume factor.

**A15. Force read-out through a feature map** (note 29 §§2–4):
$\hat F(x)=k_BT\big[D\varphi(x)^\top s_{t_\*}(\varphi(x))+\tfrac12\nabla_x\log\det G(x)\big]$. For
rotation-invariant maps $G$ is replaced by the horizontal $G_Q$ and $+\nabla_x\log\rho$ is added (the
orbit factor). The normal part of $s_t$ ($O(\sigma_t^{-2})$) is annihilated by $D\varphi^\top$; a sample
off the image is decoded first and the force is read at $\varphi(\pi(y))$.

### 2B. Noise order, readability and the training signal

**B1. Channel and readability** (note 27 §1). $Y_t=\alpha_t\phi(X)+\sigma_t\varepsilon$;
$R_h(t)=\operatorname{Var}(E[h(X)\mid Y_t])/\operatorname{Var}(h(X))
=1-E[(h-E[h\mid Y_t])^2]/\operatorname{Var}(h)\in[0,1]$. Three facts: any predictor gives a floor,
$R^2_f\le R_h$; $R_h$ is non-increasing in $t$ (VP is Markov); "the channel is the representation
together with the noise law". **Destroyed going forward means decided going backward**: under the
exact reverse process $R_h(t)$ is the fraction of the final value's variance already fixed at $t$.

**B2. Readability and mutual information** (note 27 §1):
$I(h;Y_t)\ge\mathsf h(h)-\tfrac12\log(2\pi e(1-R_h)\operatorname{Var}h)$; for Gaussian $h$ the bound is
$-\tfrac12\log(1-R_h)$, so $R_h=\tfrac12$ means at least $\tfrac12\log2\approx0.35$ nats.

**B3. Summaries** (note 27 §2): $t_{1/2}(h)=\sup\{t:R_h(t)\ge\tfrac12\}$; decision window between
$R_h=0.8$ and $0.2$; **range** means every required feature has $t_{1/2}$ well above $t_{\min}$ with
$R_h(t_{\min})\approx1$; **order** means feature classes are erased at clearly different levels,
coarse above fine.

**B4. Linear closed form** (note 27 §3):
$r(t)=\alpha_t^2\lambda/(\alpha_t^2\lambda+\sigma_t^2)$, half erasure at $\alpha_t^2\lambda=\sigma_t^2$, so
$t_{1/2}(\lambda)=\frac{-0.1+\sqrt{0.01+39.8\log(1+\lambda)}}{19.9}$ and $t_{1/2}(1)=0.259$. Rescaling
mode $k$ by $\lambda_k^{-\gamma/2}$ and renormalizing leaves effective variances $\propto\lambda_k^{1-\gamma}$.

**B5. I-MMSE** (Guo, Shamai, Verdú 2005, Theorems 1–2, Eqs. 15 and 22, p. 3; checked in the original):
$\frac{d}{d\,\mathrm{snr}}I(X;\sqrt{\mathrm{snr}}X+N)=\tfrac12\mathrm{mmse}(\mathrm{snr})$ in nats, for any
input with $E X^2<\infty$; vector form with a fixed channel matrix $H$. Gaussian input:
$I=\tfrac12\log(1+\mathrm{snr})$ and $\mathrm{mmse}=1/(1+\mathrm{snr})$ (Eqs. 11, 13). Equiprobable ±1
input: $\mathrm{mmse}=1-\int\frac{e^{-y^2/2}}{\sqrt{2\pi}}\tanh(\mathrm{snr}-\sqrt{\mathrm{snr}}\,y)\,dy$ (Eq. 17).

**B6. Feature information density** (Pan et al. 2026, Eqs. 11, 13, 17; Prop. 1, App. A):
$D_Y(\gamma)=\frac{d}{d\gamma}I(Y;X_\gamma)=\tfrac12[m_\varnothing(\gamma)-m_Y(\gamma)]$;
on the log-SNR axis $D_Y^{(\log\gamma)}=\tfrac12\gamma[m_\varnothing-m_Y]$; chained
$D^{(\log\gamma)}_{k|k-1}=\tfrac12\gamma[m_{k-1}-m_k]$. Equivalent forms: the denoiser gap
$\tfrac12E\|\hat x^\star(X_\gamma,\gamma,Y)-\hat x^\star(X_\gamma,\gamma)\|^2$, the score gap
($\times1/\gamma$), the Fisher-information gap and the likelihood score
$\frac1{2\gamma}E\|\nabla\log p(Y\mid X_\gamma)\|^2$.

**B7. Training signal of a missing structure** (note 27 §6(c), derived there; attributed in
signal-to-noise form to Verdú 2010, not checked):
$D_{\mathrm{KL}}(P\Vert Q)-D_{\mathrm{KL}}(P_T\Vert Q_T)=\tfrac12\int_0^T\frac{\beta(t)}{\sigma_t^2}S_Q(t)\,dt$ with
$S_Q(t)=E_{P_t}\|\hat\varepsilon_P-\hat\varepsilon_Q\|^2$. The total is chart-invariant; the profile is not.

**B8. Kong et al. 2023** (Eqs. 4, 8–10): pointwise
$\frac{d}{d\gamma}D_{\mathrm{KL}}[p(z_\gamma|x)\Vert p(z_\gamma)]=\tfrac12\mathrm{mmse}(x,\gamma)$;
$-\log p(x)=-\log p_G(x)-\tfrac12\int_0^\infty(\mathrm{mmse}_G(x,\gamma)-\mathrm{mmse}(x,\gamma))\,d\gamma$;
and $h(p)=\tfrac d2\log2\pi e-\tfrac12\int_0^\infty(\tfrac d{1+\gamma}-\mathrm{mmse}(\gamma))\,d\gamma$.

**B9. Speciation and collapse** (Biroli et al. 2024, Eqs. 1–8). For the OU process
$dx=-x\,dt+dB$ (with $dB$ equal to $\sqrt2$ times a Wiener increment) and $\Delta_t=1-e^{-2t}$:
speciation occurs at $\Lambda e^{-2t_S}=1$, with $\Lambda$ the principal eigenvalue of the data
covariance; collapse at $s(t_C)=s_{\mathrm{sep}}(t_C)$. For two Gaussian clusters with
$|m|^2=d\tilde\mu^2$, $t_S=\tfrac12\log d$, and the backward overlap $q$ feels the potential
$V(q,t)=\tfrac12q^2-2\tilde\mu^2\log\cosh(qe^{-t}\sqrt d)$, which develops a double well for
$t\ll t_S$.

**B10. Outline first, details later** (Wang & Vastola 2023, Eqs. 9, 13, 14). For a Gaussian mode
the endpoint estimate is $\hat x_0(x_t)=\mu+\sum_k\xi(t,\lambda_k)c_k(T)u_k$ with
$\xi(t,\lambda)=\alpha_t\lambda/\sqrt{(\alpha_t^2\lambda+\sigma_t^2)(\alpha_T^2\lambda+\sigma_T^2)}$; a
direction appears "around when $\sigma_t=\alpha_t\sqrt\lambda$", i.e. the half-erasure condition of
B4, "image manifold features appear in order of descending variance". A perturbation at $t'$ is
amplified by $\sqrt{\lambda_k/(\sigma_{t'}^2+\lambda_k\alpha_{t'}^2)}$.

**B11. Isotropic noise drowns low-power modes** (Rissanen et al. 2023, App. A.5, Eqs. 52–57):
$E_\varepsilon[\mathrm{PSD}(u+\varepsilon)_i]=\mathrm{PSD}(u)_i+\gamma^2$. IHDM forward (Eq. 2):
$\tilde u(t)=e^{\Lambda t}\tilde u(0)$ in the DCT basis, $\Lambda_{nm}=-\pi^2(n^2/W^2+m^2/H^2)$, plus
small noise σ.

**B12. EqualSNR** (Falck et al. 2025, Eq. 6, Def. 2, Prop. 1):
$s^{\mathrm{DDPM}}_t(i)=\bar\alpha_tC_i/(1-\bar\alpha_t)$; general $s_t(i)=\bar\alpha_tC_i/((1-\bar\alpha_t)\Sigma_{ii})$;
EqualSNR iff $\Sigma_{ii}=cC_i$; footnote 2: "If we require that Σ = c Cov(y0), the equal SNR property
holds across all bases". Prop. 1 (informal): for $D_0=\tfrac12N(-1,\delta^2)+\tfrac12N(1,\delta^2)$
and $x_t=x_{t-1}+\varepsilon$ with $\varepsilon\sim N(0,4)$, the reverse $q(x_{t-1}|x_t)$ stays "at
least a constant away in total variation distance from any Gaussian".

**B13. Covariance mismatch** (Everaert et al. 2024, §§3–4):
$\mathrm{SNR}^{\mathrm{in}}_t(e)=\operatorname{Var}[s_t\cdot e]/\operatorname{Var}[n_t\cdot e]$. Whitening the data
($W=U\Lambda^{-1/2}U^\top$) and coloring the noise ($\epsilon^{\mathrm{colored}}=W^{-1}\epsilon$) have the
same optimum, $\epsilon^\*_{\mathrm{whitened}}(x,t)=W\epsilon^\*_{\mathrm{colored}}(W^{-1}x,t)$. The losses
differ: whitening "puts the same importance on all components", coloring "greater importance to
high-variance components".

**B14. Critical windows** (Li & Chen 2024, Theorems 1–2). For mixtures of strongly log-concave
components, forward-then-reverse from $S_{\mathrm{init}}$ lands close in TV to the target
sub-mixture for $t\in[T_{\mathrm{lower}},T_{\mathrm{upper}}]$. $T_{\mathrm{lower}}$ is "dominated by
$\ln\max\|\mu_i-\mu_j\|$" within the target and $T_{\mathrm{upper}}$ by $\ln\min\|\mu_i-\mu_j\|$
between target and rest, given separation $\gtrsim\sigma\sqrt d$. The window length is logarithmic in
the separation ratio.

**B15. Hierarchy phase transition** (Sclocchi et al. 2025): in the forward–backward protocol the
class "suddenly drops" at a threshold noise (ImageNet logits' cosine similarity drops near
$t\approx T/2$), while low-level features "evolve smoothly". The paper disagrees with the second half
of Ho et al.'s "when it is large, only large scale features are preserved".

**B16. Perception-prioritized weighting** (Choi et al. 2022, Eqs. 4, 8): $\mathrm{SNR}(t)=\alpha_t/(1-\alpha_t)$
(DDPM ᾱ notation); stages coarse ($0$–$10^{-2}$), content ($10^{-2}$–$10^0$), clean-up ($10^0$–$10^4$);
$\lambda'_t=\lambda_t/(k+\mathrm{SNR}(t))^\gamma$.

**B17. Lag-shaped noise orders modes by relaxation time** (note 25, Proposition 2): for
$N=\Sigma_\tau^{-1}$, $\mathrm{SNR}_k=\alpha_t^2/(\sigma_t^2(1-e^{-2\tau/t_k}))$, half erased at
$\sigma_t^2/\alpha_t^2=1/(1-e^{-2\tau/t_k})$: 1 for $t_k\ll\tau$, about $t_k/(2\tau)$ for $t_k\gg\tau$.

**B18. EigenFold harmonic diffusion** (as implemented in lab #1099 from EigenFold Eq. 2):
$dx=-\tfrac12Hx\,dt+dw$, $H=\alpha L$ on the path graph, $\alpha=3/3.8^2$ Å⁻². Per mode the signal
factor is $e^{-\frac12\alpha\lambda_kt}$ and the noise variance $(1-e^{-\alpha\lambda_kt})/(\alpha\lambda_k)$
(as in `run.py`'s `Process.factors`).

**B19. Redundant charts** (note 30, Propositions 1–2; §1):
- first-order loudness $\ell_h=\operatorname{Var}(h)/E[\nabla h^\top G^+\nabla h]$;
- **degree attenuation**: for independent uniform torsions observed through noisy phase pairs and
  $h$ multilinear in phases, $R_h(t)=\sum_jc_jr(t)^j/\sum_jc_j$ with $c_j=\operatorname{Var}(h_j)$;
- **constraint directions**: $\dim\mathcal C=d_A+d_B-d$ ($3K-3$ for BBA with $K\ge2$ vectors);
- **constraint split**: the small-noise excess loss of reading block A alone is $\sum_c|P_An_c|^2$; for
  one constraint the shares are $L^2/(1+L^2)$ (block A) and $1/(1+L^2)$ (block B) with $L=|\nabla g|$:
  "The louder block leaves the correction to the quieter one";
- a missing smooth energy $U$ costs excess noise-prediction loss $\sigma^2E|\nabla U|^2$ at leading
  order, and a tilt $\theta h$ carries information $\propto\sigma^2$ per example, so a soft force read
  at one small level has error $\propto1/\sigma$.

### 2C. Bridges between the two literatures and the project (derived here)

- **C1. Pan's density is half of the project's readability for linear Gaussian features
  (derived here).** For $X\sim N(0,\operatorname{diag}\lambda)$ and $Y=X_1$:
  $m_\varnothing-m_Y=\lambda_1/(1+\lambda_1\gamma)$, so
  $D_Y^{(\log\gamma)}=\tfrac12\lambda_1\gamma/(1+\lambda_1\gamma)=\tfrac12R_{X_1}$ (checked numerically
  to $10^{-7}$). For a noiseless continuous feature this is a sigmoid in log-SNR, not a bump; Pan's
  bumps arise for discrete features or features observed with finite precision (their App. A
  "continuous features and divergence" adds noise $\alpha>0$). The project's bounded $R_h$ avoids
  Pan's infinite MI for deterministic continuous observables (inference here).
- **C2. Width of a decision window (derived here).** With $s=\lambda\,\mathrm{SNR}$, $R=s/(1+s)$ and
  $dR/d\log s=R(1-R)$, which peaks at $R=\tfrac12$. $R\in[0.2,0.8]$ corresponds to
  $\mathrm{SNR}\in[0.25/\lambda,4/\lambda]$: a factor 16, 2.77 nats, 1.2 decades. Two linear features
  have disjoint decision windows only if their loudnesses differ by more than 16. On BBA, note 30
  compares the conformational variances of the two loud mode *lengths* (6.9 and 2.5; the mean squares
  15.0 and 6.0 include orientation) with a first-order torsion loudness of 2.0: ratios of about 3.5
  and 1.25. By this linear criterion the loud-mode order is partial; the first-order half-erasure
  levels (Rg 0.44 with the block, torsions 0.34; lab 2026-11-18) have overlapping decision windows.
  Even a partial order sufficed in training.
- **C3. Biroli versus note 27 (derived here).** In Biroli's OU clock ($\alpha_t^2=e^{-2t}$), note 27's
  condition $\alpha_t^2\lambda=\sigma_t^2$ gives $t=\tfrac12\log(1+\Lambda)$, Biroli's
  $t_S=\tfrac12\log\Lambda$. For $\Lambda=15.5$ the two are 1.402 and 1.370; they coincide for
  $\Lambda\gg1$. "The same calculation" is true asymptotically.
- **C4. Kong Eq. 8 is a mismatched-estimation identity (derived here).** $\mathrm{mmse}_G(x,\gamma)$ is the
  error of the Gaussian-optimal denoiser applied to data. Averaging Eq. 8 over $p$ gives
  $D_{\mathrm{KL}}(p\Vert N(0,I))=\tfrac12\int_0^\infty(E_p\mathrm{mmse}_G(x,\gamma)-\mathrm{mmse}(\gamma))d\gamma$,
  the $Q=N(0,I)$ case of the identity note 27 attributes to Verdú (2010). The library's remark that
  Kong "does not state the mismatched-estimation identity" holds for general $Q$ only.
- **C5. Loudness is a schedule shift (derived here; GUD's dial).** Scaling a channel by $c$ multiplies
  its SNR by $c^2$, shifting its readable window by $2\log c$ in log-SNR. Natural mode-1 loudness 15
  means a shift of 2.71 nats ($t_{1/2}$ moves from 0.259 to 0.523).
- **C6. Ahamed's inverse gains follow $\lambda_{\max}^{\gamma/2}$ (derived here).** Table 6's
  bimodal gains 2.18, 4.76, 10.39 and 22.66 at γ = 0.25, 0.5, 0.75, 1 equal
  $513.5^{\gamma/2}$ exactly, so their affine $P_\gamma=H^{-\gamma/2}$ acts on a target with top
  eigenvalue ≈ 513.

---

## 3. Worked analytical examples

**E1. Linear readable windows under the project's schedule** (B4, C2; derived here, matching note
27's quoted values). $t_{1/2}$ and decision window $[t(R{=}0.8),t(R{=}0.2)]$:

| Variance λ (feature units) | $t_{1/2}$ | Decision window | Where it appears |
|---|---:|---|---|
| 15.5 (BBA Cartesian mode 1, note 27) | 0.526 | [0.394, 0.640] | note 27: 0.53 |
| 15.0 (loud mode 1 mean square, note 30) | 0.523 | [0.391, 0.638] | |
| 6.9 (mode-1 length, conformational variance, note 30) | 0.451 | (linear rule) | |
| 6.2 / 6.0 (mode 2) | 0.440 / 0.437 | [0.302, 0.567] / [0.299, 0.564] | note 27: 0.44 |
| 3.0 (mode 3) | 0.368 | [0.232, 0.503] | note 27: 0.37 |
| 2.0 (first-order torsion loudness, note 30) | 0.327 | [0.197, 0.465] | note 30 table: 0.33 |
| 1.3 (mode 4) | 0.284 | [0.163, 0.423] | note 27: 0.29 |
| 1.0 (any unit-variance channel, C3/C1) | 0.259 | [0.145, 0.397] | note 27: 0.259 |
| 0.011 (smallest Cartesian mode) | 0.0285 | [0.012, 0.061] | note 27: 0.028 |

SNR at the floors: $t=0.01$ has $\alpha^2/\sigma^2=501$ (log-SNR 6.22), $t=1$ has $4.3\times10^{-5}$
(log-SNR −10.05).

**E2. The whitening exponent dial on BBA's spectrum** (note 27 §3 table): γ = 0, 0.25, 0.5, 0.75, 1
give largest/smallest variance 1,423, 232, 38, 6.1 and 1; first mode half-erased at 0.53, 0.50, 0.45,
0.37, 0.26; last mode at 0.028, 0.065, 0.13, 0.20, 0.26. "Whitening erases the order by
construction." Ratios check as $1423^{1-\gamma}$ (derived here).

**E3. Share of training draws in which a bond is readable** (derived here from note 27 values,
uniform $t$). Cartesian on $[10^{-5},1]$ with bond $t_{1/2}=0.0004$: 0.039% of draws. C3 on
$[0.01,1]$ with $t_{1/2}=0.26$: 25%. Note 21 Prop. 5 (ALDP5, flat, $t\in[0.01,0.99]$): "0% of trained
times and 0% of the likelihood weight".

**E4. ALDP5 bonds against the floor** (note 21, Proposition 5 table). At $t=0.01$, σ = 0.045 Å,
bond SNR 0.30–0.46, one–three 1.1–1.7, softest 20–125, metric-shaped noise 501. At $t=0.001$
(σ = 0.0105 Å), bond SNR 5.5–8.4. Check (derived here): bond widths $1/\sqrt{w_e}$ with
$w_e=1{,}110$–$1{,}660$ Å⁻² are 0.030–0.025 Å, and $0.998\cdot w^2/0.001993$ gives 0.30–0.45.

**E5. Training curvature on ALDP5 window statistics** (note 21 §4.3 table, linear layer,
spring metric):

| Configuration | Curvature | GD steps from zero | Adam steps |
|---|---:|---:|---:|
| covector, Euclidean loss, raw inputs | 146 | 589 | 795 |
| Riemannian, metric loss, raw inputs | $1.9\times10^4$ | 24,319 | 3,941 |
| whitened, Euclidean loss, raw inputs | 146 | 504 | 1,023 |
| whitened, Euclidean loss, thermal inputs | **8.1** | **31** | **226** |

"Adam narrows the gap to about 17× but does not close it." The Ahamed analogue (derived here):
$\kappa=1000$ gives optimal contraction $0.998$ and about 3,454 iterations for a $10^{-3}$ error
reduction.

**E6. The noise-level metric keeps conditioning bounded** (note 21, Theorem 3 table; ALDP5 window,
$c\in[0.398,3.290]$, bound 8.27). At $\sigma_t^2=10^{-4}$, 0.002, 0.01, 0.1, 0.5 Å²: $G_t$ gives
6.7, 3.0, 2.2, 1.3, 1.0; a fixed $G$ gives 8.1, 13.5, 40.5, 109, 129; no metric gives 146, 27.4,
6.9, 1.6, 1.1.

**E7. Ahamed's Gaussian path** (A1–A3; derived here). For $\kappa(H)=1000$, $\kappa(\Sigma_t)$ rises
from 1 at $t=0$ to 500.5 at $t=0.5$ and 1000 at $t=1$. Partial whitening $P=H^{-\gamma/2}$ gives
peak $\kappa=1000^{1-\gamma}$: 1000, 177.8, 31.6, 5.6, 1.0 for γ = 0, 0.25, 0.5, 0.75, 1, at inverse
gain $1000^{\gamma/2}$: 1, 2.37, 5.62, 13.3, 31.6. The authors' measured bimodal values are in §4.1.

**E8. Equal metric, unequal denoising** (note 28 §3). $x\sim N(0,1)$ embedded as the line
$(x,0,0)$ or the helices
$\Phi_\omega(x)=(\tfrac{\sqrt{1-b^2}}\omega\cos\omega x,\tfrac{\sqrt{1-b^2}}\omega\sin\omega x,bx)$.
All have $\|\Phi'\|=1$. With $b=0.1$, $\omega=4,16$ and $\sigma=0.1$ the posterior variance of $x$ is
0.01 for the line and about 0.50 for either helix.

**E9. Normal stiffness of a redundant embedding** (note 28 §4). $1/\sigma_t^2$ is about 502 at
$t=0.01$ and 332,342 at $t=3\times10^{-5}$ (both checked, derived here). BBA's Gram/triple map has
$M=3303$ features for 78 shape degrees of freedom (3,225 normal directions). For BBA spring
channels $\lambda=1/27.12^2$, the residual-slope peak $(1-\lambda)/(2\sqrt\lambda)$ is about 13.5.

**E10. Lag-shaped noise in a basin** (note 25, Prop. 2). $\lambda=(1600,400,25,4)$ Å⁻² and
$D_0=0.08$ Å²/ps give $t_k=(0.008,0.03,0.5,3.1)$ ps; at τ = 1 ps the half-erasure levels are
(1, 1, 1.02, 2.12), "a spread of 2.1 against 400 under flat noise".

**E11. EigenFold's chain spectrum** (B18; derived here). The path-graph Laplacian for $N=28$ has
eigenvalues $4\sin^2(\pi k/56)$: 0.01258, 0.05014, 0.11223, ..., 3.94986, 3.98742. With
$\alpha=0.2078$ Å⁻² and data equal to the harmonic chain itself, mode $k$ is half erased at
$t=\ln2/(\alpha\lambda_k)$: 265 for the slowest, 66.5 for the second and 0.837 for the fastest, a
ratio of 317. The harmonic prior's slowest mode has rms 19.6 Å per component, a zero-rest-length
ideal chain. Measured on BBA (#1099, own clock): bond 0.0016, angle 0.27, torsion 0.84, Rg 215,
long-range distances 142, contacts 79.

**E12. Chroma-style chain covariances** (#1099 `run.py`). Ideal chain (random walk), or
$x_i=bx_{i-1}+ae_i$ with $b=0.992$ chosen so that $R_g=2.2N^{0.38}$ Å at 3.8 Å neighbour distance
("assumed constants; Chroma's exact R is not reproduced"). If the data were the ideal chain, a VP
process with ideal-chain noise would be exactly EqualSNR (B12; inference here). BBA is more compact
than ideal, which leaves a weak order.

**E13. Anti-order in a 28-bead chain** (note 30, Prop. 1; lab 2026-11-18; 3.8 Å bonds, fixed angle,
uniform torsions, exact posteriors):

| t | one torsion | $b_k\cdot b_{k+4}$ | $b_k\cdot b_{k+12}$ | $b_k\cdot b_{k+26}$ | end-to-end² | $R_g^2$ |
|---|---:|---:|---:|---:|---:|---:|
| 0.1 | 0.94 | 0.87 | 0.62 | 0.36 | 0.72 | 0.84 |
| 0.2 | 0.72 | 0.47 | 0.08 | 0.004 | 0.25 | 0.44 |
| 0.26 | 0.53 | 0.25 | 0.01 | 0.000 | 0.12 | 0.25 |

The effective degree is "about two thirds of its m−1 torsions".

**E14. Constraint split in the chain model** (note 30 §4). Gains at $t\le0.05$ for the internal and
the block side respectively: whitened block 0.43–0.55 and 0.43–0.56; natural 0.85–1.03 and
0.06–0.09; twice the amplitude 0.90–1.09 and 0.02–0.03. Learning the collapse inside the internal
chart is worth 0.0005 per example at $t=0.01$ and at most 0.049 near $t=0.2$; learning the constraint
is worth 0.92, 0.80 and 0.38 at $t=$ 0.01, 0.1, 0.2. The integrated signal recovers the collapse KL
(0.0766 nats) to within 3% in every arm.

**E15. Which modes carry size** (note 30 §5). For independent isotropic Gaussian modes, a tilt
$e^{-\eta R_g^2}$ changes $\langle|X_p|^2\rangle$ by $-6\eta\lambda_p^2/N$, so mode $p$ carries
$\lambda_p^2/\sum_q\lambda_q^2$. With BBA's 15.0, 6.0, 2.9, 1.3, 0.49, ... the first mode carries 83%
and the first two 96%. The conformational variances of the first four mode lengths are 6.9, 2.5, 0.9
and 0.6, against a first-order torsion loudness of 2.0: "only two modes are louder than a torsion".

**E16. Pairwise sensitivity of three geometries** (A13; derived here). Squared feature sensitivity
per unit scaled distance, R-DM $(dq/ds)^2$ against wδ's $(d\log s/ds)^2$: at $s=0.8$, 5.78 and 1.56;
$s=1$, 2.92 and 1.00; $s=1.5$, 0.534 and 0.444; $s=2$, 0.098 and 0.25; $s=2.5$, 0.018 and 0.16;
$s=3$, 0.0033 and 0.111. Between $s=1$ and $s=2.5$, R-DM weights a bonded-scale change 162× more
than a distant pair, wδ 6.25×. These are geometry choices, not measured stiffness.

**E17. Guo's two inputs** (B5). Gaussian: $I(\mathrm{snr})=\tfrac12\log(1+\mathrm{snr})$,
$\mathrm{mmse}=1/(1+\mathrm{snr})$. Binary: the tanh integral of B5. Their Fig. 1 plots both for
snr ∈ [0, 10].

**E18. Biroli's two-cluster speciation** (B9). $t_S=\tfrac12\log d$; finite-d curves of the
same-class probability φ(t) cross at about $\phi(t_S)=0.775$ (Fig. 2, $\tilde\mu=1$, σ = 1).

**E19. Choi's stages on the project's clock** (derived here, unit data variance). SNR $10^4$ ↔
$t=0.0009$; SNR 100 ↔ 0.027; SNR 1 ↔ 0.259; SNR $10^{-2}$ ↔ 0.676; SNR $10^{-4}$ ↔ 0.957. Choi's
"content" stage (SNR $10^{-2}$–1) is $t\in[0.26,0.68]$, where Cartesian BBA decides its fold
(mode windows in E1) and close to where C3's swelling is created (0.11–0.5, #1055).

---

## 4. Key empirical results

### 4.1 Literature, author-reported (none reproduced by the project)

- **Ahamed v4, Table 1 (MNIST, 64-d VAE latent; FID / MMD×1,000 / precision / recall).** Baseline
  2.32M: 5.97 / 77.10 / .5774 / .2856. Enlarged 3.37M: 5.42 / 75.46 / .5869 / .2618. ZCA: 4.20 / 6.25 /
  .6022 / .3107. ZCA + enlarged: 4.02 / 7.02 / .6117 / .2885. NF preconditioner: 2.74 / 2.95 / .7271 /
  .3561. Flow preconditioner: 3.98 / 3.02 / .8440 / .5486. Parameter-matched, not FLOP-matched.
- **Ahamed v4, Table 2 FID, baseline → flow preconditioner:** Churches 19.53 → 14.47; Flowers
  23.82 → 22.64; Cats 7.11 → 4.86; CIFAR-10 4.15 → 4.02; ImageNet-1k 8.66 → 4.98. No seed
  uncertainty.
- **Ahamed v4, Table 6 (three seeds; peak path κ / $\|J_{P^{-1}}\|_2$ / MMD×10⁻³).** Bimodal, γ = 0:
  849.75±11.14 / 1.00 / 114.69±4.26; 0.25: 160.02±2.05 / 2.18 / 202.96±10.04; 0.5: 30.14±0.37 / 4.76 /
  55.74±17.32; 0.75: 5.70±0.06 / 10.39 / 66.88±17.59; 1: 1.21±0.02 / 22.66 / 324.64±5.02.
  Anisotropic ring MMD: 20.46, 14.01, 20.26, 24.48, 53.78 for γ = 0 ... 1. Not monotone (bimodal
  γ = 0.25 is worse than none). The library notes quote only the γ = 0, 0.5, 1 rows. Table 7 (learned
  MNIST inverse): $\|J\|_2$ median 2.41 (real) / 2.32 (generated) with condition numbers 275 / 273.
- **Ahamed v1 (historical):** MNIST FID 13.83 → 2.62 (NF) / 6.95 (flow); Swiss-roll sliced distance
  0.111 → 0.058 / 0.072. Do not mix with v4.
- **Falck et al., Table 1 (Clean-FID at T = 50, 100, 200, 1000).** CIFAR-10: DDPM 18.63, 18.01, 17.68,
  17.7; EqualSNR (calibrated) 16.00, 15.91, 15.76, 15.73; DDPM (calibrated) 16.64, 14.69, 14.07,
  13.85; EqualSNR 15.44, 14.56, 14.13, 13.63. CelebA: 10.10, 8.72, 8.30, 8.62 / 9.45, 8.79, 8.62, 8.56 /
  12.65, 7.88, 6.54, 6.59 / 12.99, 11.64, 10.96, 10.37. LSUN Church: 29.36, 25.36, 24.03, 23.22 / 19.42,
  19.75, 19.90, 19.80 / 40.31, 26.4, 22.05, 20.09 / 27.13, 25.68, 24.81, 24.05. High-frequency
  classifier (Table 2): DDPM accuracy 0.624–0.654 with 99–100% true positives; EqualSNR 0.516–0.521
  with 10–16% at significance 0.05. "On LSUN Church ... EqualSNR (calibrated) outperforms all DDPM
  variants."
- **Pan et al.:** FID after matched recipes: pixel 78.51, SDVAE 30.83, VAVAE 21.16, RAE 8.39 (epoch
  180). Only RAE gives a strict class → mask → Canny ordering (Table 1 peak log-SNRs −3.75, −2.75,
  −1.75 for RAE/DiTDH-XL). "We therefore observe a correlation ... without claiming that this ordering
  causes faster convergence"; "the reported densities are therefore single-seed trajectories".
- **Everaert et al.:** colored-noise Stable Diffusion FID 207 against 194 unaligned at normal
  inference, but more robust to late start (+9% against +36%). Gains in editing and in training on a
  narrow noise range.
- **R-DM:** QM9 mean/median energy error 0.806/0.177 kcal/mol against 1.560/0.816 (E-DM); QM7-X median
  0.277 against MoreRed-JT 0.269; geometry ablation as in §1.2. A refinement task.
- **Sclocchi et al.:** ImageNet class flips sharply near $t\approx T/2$; early-layer features change
  smoothly. **Choi et al.:** stage boundaries from LPIPS on 200 CelebA-HQ triplets.
- **Semantic-first diffusion and latent forcing** (found in Pan's bibliography; abstracts read by
  this reader on 2026-11-19, not in the project's library). Pan et al. 2025 (arXiv 2512.04926, SFD):
  semantic latents from a pretrained encoder lead the texture latent by a temporal offset; FID 1.06 /
  1.04 on ImageNet-256 and "up to 100x faster convergence". Baade et al. 2026 (arXiv 2602.11401,
  latent forcing): latents and pixels in one denoising process with separately tuned schedules; "the
  order of conditioning signals is critical".

### 4.2 Project measurements the literature is compared against

- **Readable windows on BBA** (note 27 §5, PR #1055, floors; training $t\in[0.01,1]$):

| Observable | Cartesian | C3 internal | C1 (whitened springs + Rouse) |
|---|---:|---:|---:|
| bond lengths | 0.0004 | 0.26 | 0.26 |
| bond angles | 0.05 | 0.35 | 0.33 |
| torsions | 0.08 | 0.35 | 0.29 |
| radius of gyration | 0.47 | 0.27–0.28 | 0.35 |
| long-range pair distances | 0.44 | 0.24 | 0.33 |
| long-range contact count | 0.38 | 0.23 | 0.31 |
| end-to-end distance | 0.45 | 0.18 | 0.31 |
| slowest TIC | 0.36 | 0.49 | 0.46 |

- **Published processes on BBA** (#1099; $t_{1/2}$ for bond / angle / torsion / Rg / long-range /
  contacts): Cartesian VP calibration 0.0004 / 0.022 / 0.048 / 0.47 / 0.42 / 0.35; Chroma-style
  ideal 0.0032 / 0.077 / 0.16 / 0.24 / 0.23 / 0.090; globular 0.0029 / 0.073 / 0.16 / 0.24 / 0.22 /
  0.095; fully data-matched covariance (EqualSNR/whitening) 0.0049 / 0.11 / 0.23 / 0.21 / 0.23 /
  0.092; C3 0.26 / 0.35 / 0.35 / 0.27–0.28 / 0.24 / 0.23; internal + 2 loud (block alone, floor)
  0.26* / 0.35* / 0.35* / ≥0.42 / ≥0.37 / ≥0.33; EigenFold own clock 0.0016 / 0.27 / 0.84 / 215 /
  142 / 79. At $t=10^{-3}$ the two-mode block alone explains 96% of Rg's spread.
- **The γ dial** (#1057, one seed per row except γ = 1): Rg W1 0.499/0.514 (γ = 1, C1, two seeds),
  0.187 (0.5), 0.120 (0.25), 0.081 (0); bonds at the floor throughout; populations ≈ 0.08 at every
  exponent (Cartesian 0.046); torsion error 9.7/10.4, 6.5, 7.1, 9.1°. Half whitening plain
  Cartesian raised its size error from 0.09 to 0.28 Å.
- **Block size** (Table 3 of the range-and-order record; K = 0, 1, 2, 4, 8, 16, 27): angle W1 0.23,
  0.26, 0.27, 0.36, 0.42, 0.57, 1.25°; torsion 0.90, 0.86, 0.94, 1.18, 1.54, 4.15, 11.0°; Rg W1 0.477,
  0.161, 0.105, 0.136, 0.152, 0.325, 0.399 Å; overlaps 14, 19, 21, 27, 23, 28, 29%.
- **Registered budget** (190,350 updates, 100,000 molecules; #1071/#1088). Internal + 2 loud: bond
  0.00038/0.00033 Å, angle 0.20/0.19°, size 0.117/0.091 Å. Cartesian, covariance-matched base:
  0.0053/0.0065, 1.36/1.30, 0.073/0.077. Native ScoreMD: 0.042/0.042, 1.58/1.74, 0.157/0.532. C3:
  0.00032/0.00034, 0.21/0.18, 0.455/0.418. Force fields after 100 ps: size error 0.84 Å (C3), 1.14
  (loud), 1.85 (covariance-matched Cartesian), 3.2 (ScoreMD), 4.7 (Cartesian + distances); all
  compact.
- **ALDP5, the stiffness half** (status, Sprint 11): spring features reach the data floor "about 100
  times sooner for bond lengths (about 2k against 200k training steps), about 10–20 times sooner for
  bond angles"; no clear torsion advantage; "given enough updates all good representations converge".
  Flat MLP iid bond widths 1.115–1.291 × MD at 20k, 0.994–1.049 at 200k (Ahamed v1 notes).
- **Ahamed-type experiments** (as quoted in the v4 notes; consistent with the design docs).
  #946: global-likelihood equivariant flow as a standalone generator, ALDP5 at 200k torsion JS
  0.15225 against 0.01140 (isotropic flat diffusion), bond W1 0.21037 against 0.001636 Å, "rejects
  this complete-generator recipe, not its use as an imperfect preconditioner". #882: endpoint-fitted
  map torsion JS 0.03430 against 0.03383 for whitening at 20k. #941: torsion Gaussianization 0.042
  against 0.255 at 100 updates, 0.029 against 0.022 at 20k. The proposed "frozen likelihood flow +
  downstream diffusion" pilot (Ahamed's actual recipe) was **not run**.

### 4.3 Caveats

All BBA comparisons except §7 of the range-and-order record stop at 50,000 updates (26% of the
registered budget). The γ dial has one seed per exponent. The population floor at 20,000 molecules
(0.037) is close to every good model. Readable windows are lower bounds whose values move with the
estimator: C3 Rg 0.23 → 0.27–0.28 with a stronger read-out; Cartesian angle 0.022 against 0.05
depending on whether a quadratic ridge read-out is included. BBA uses a frame-level split with
temporal-neighbour leakage. #1099 is training-free; no EigenFold or Chroma model was trained on BBA.
All literature numbers are author-reported.

---

## 5. Why it was promising, why it failed, what was learned, and the positioning verdict

### 5.1 The spine: two literatures pull one spectrum in opposite directions

| | Equalize the spectrum (stiffness half) | Keep the spectrum steep (order half) |
|---|---|---|
| Claim | Narrow directions are learned slowly (A2, A6), weakly weighted by the loss (A1), erased below the trained range (A9, E3–E4) | High-variance structure is decided first (B9–B11); generation becomes approximately autoregressive (Dieleman, GUD) |
| Literature | Ahamed; EDM $c_{\mathrm{in}}$ (scalar); Everaert (realign); Falck EqualSNR (better high frequencies); Wang & Pehlevan (a mode emerges at a training time set by its variance) | Rissanen; Wang & Vastola; Biroli; Li & Chen; Sclocchi; Pan; EigenFold; SFD and latent forcing |
| Project instance | Sprint 11 stiffness removal; note 21; learned warp; C1, C3 at unit variance | Cartesian (accidental order); #1057 γ dial; loud modes |
| Measured cost | BBA size swelling (C3 0.46–0.49 Å; C1 0.50–0.51 Å) | Cartesian local geometry (bond 0.013 Å against 0.0005 floor) |
| Literature's own hint at the tension | Ahamed G.9: partial beats full whitening | Falck: equal-SNR roughly on par for images |

The project's design takes each side where it is right. Stiff, local coordinates are put at thermal
width so they are readable inside the trained range (Ahamed/EDM side). Two global coordinates stay
loud so they are erased last (Biroli/Wang & Vastola side). Note 21 (2026-10-24) had listed
synchronized information loss as an aim ("only metric-shaped noise removes it"); note 27
(2026-11-12) showed that synchronized loss is exactly what erases the order. This is the pivotal
correction.

### 5.2 What is precedent

| Ingredient | Precedent | How close |
|---|---|---|
| Transform, train, invert to fix conditioning | Ahamed v1/v4 (NF and flow preconditioners; whitening theorem) | Direct (library notes: "should not be claimed as novel"); Ahamed targets global Gaussianization, the project local thermal steps |
| Pullback metric of a chemistry map with metric-white noise | R-DM | Direct for the mechanism; R-DM refines single minima |
| Input/output scaling to unit variance | EDM Table 1 (scalar); project's matrix version (PR890/891) | Scalar precedent; the matrix form is a routine generalization |
| Linear whitening, or coloring the noise, equalizes SNR | Everaert; Falck (Σ ∝ Cov) | Exact (B12, B13) |
| Scalar time weighting cannot fix directional stiffness | Ahamed F.3 | Matches #780 ("about thirty comparisons", no generation gain) and #1055 ("re-weighting noise levels is not the lever") |
| Isotropic noise gives coarse-to-fine | Rissanen, Wang & Vastola, Falck, Dieleman | Exact for linear modes (B4 = B10 condition) |
| When a class is decided ∝ top covariance eigenvalue | Biroli | Same calculation, asymptotically (C3) |
| Narrow decision windows; noise-then-denoise probing | Li & Chen; Sclocchi; Ho et al. | #1055 ran forward–backward and cloning without naming them |
| Per-feature information along the schedule | Pan (I-MMSE density); Kong (MMSE integral) | Closest relative; equal to ½R for linear Gaussian features (C1) |
| Model-free localization of where content is decided | Choi (LPIPS on noised copies) | The project's "needs no trained denoiser" is not unique |
| Ordered noising of proteins | EigenFold, Chroma, Masuki & Ashida, NeuralPLexer, La-Proteina | "Ordered noising is not new for proteins" (REFERENCES) |
| Per-component schedules / loudness | GUD; Matryoshka; SFD; latent forcing | Loudness = schedule shift (C5); SFD and latent forcing are the image twins of an appended block with a leading schedule |
| Internal-coordinate lever arms and clashes | FoldingDiff; Arts et al. 2024; torsion GANs; Köhler et al. 2023 on BBA (33–36% clashes) | C3's failure mode is known |
| Excluded volume must be supplied | CGnet prior energy | Matches note 30 §7 and the late repulsion |
| Quotient removes redundant directions | QSD (horizontal projection + mean-curvature term) | Measure term ≈ the project's orbit factor |
| Score → force at low noise | ScoreMD; Arts et al. 2023 | Euclidean precedent |

### 5.3 What is counter-evidence (or a caution)

- **Falck: images do not need the hierarchy.** EqualSNR is "on par" at the headline; the calibrated
  DDPM is better at T = 1000 on CIFAR-10 (13.85 vs 15.73) and CelebA (6.59 vs 8.56) but not LSUN
  (20.09 vs 19.80); EqualSNR improves high-frequency fidelity. BBA disagrees for global size:
  whitening the collective block (γ = 1) is the worst arm (Rg W1 0.51 vs 0.08), and half-whitening
  Cartesian raised its size error 0.09 → 0.28 Å. Honest reading: FID tolerates losing the hierarchy;
  a molecule's packing does not. The metrics differ, and C1 differs in other ways too.
- **Order without range fails.** The Cartesian channel has the cleanest order and poor local
  geometry; EigenFold has five decades of order and bonds at 0.0016 on its clock.
- **Readable ≠ learnable.** The skeleton map's torsions are readable to 0.20 against Cartesian 0.08,
  yet the error is 7.9–10.6° against 7.1°; #1026 found windows did not predict learning speed; the
  windows "ranked the models correctly by size error but understated the differences" (γ 0 → 0.5:
  window −10%, error ×2).
- **Pan is correlational and single-seed;** its "ordered generation could be beneficial" is
  untested in that paper (SFD and latent forcing are better evidence, but image-domain and
  unchecked by the project).
- **Order costs correction.** Everaert: when components are split across noise levels, "small
  timesteps cannot correct potential mispredictions from previous/larger timesteps"; the project's
  analogue is that a size decided early in the block is imposed on the chain (note 30 §4).
- **Sclocchi:** the coarse-first picture is incomplete for hierarchical data, since low-level
  features can persist while the class flips.
- **Ahamed G.9 offers a rival mechanism for "full whitening is bad"** (inverse amplification),
  distinct from the project's order account. On BBA the linear whitening gain is modest (about
  $\sqrt{\lambda_{\max}/\bar\lambda}\approx4$; inference here), so order is the more plausible
  explanation there.
- **Efficiency is not bought by charts.** "The time-integrated objective is asymptotically
  efficient ... no chart buys statistical efficiency" (note 30 §3). On ALDP5 early gaps closed with
  training. Any claim is learning speed at a fixed budget.
- **The variance-matched base for the block did not help** (Rg W1 0.34 against 0.20/0.11), and
  **overlaps are not explained by range or order** (17–29% in every stiff/internal model stopping
  at 0.01; 21.0% even when trained to 0.001).

### 5.4 What is genuinely new, and how to phrase it safely

1. **Range and order as two separable requirements for molecular noising, each with its own
   dial.** Thermal-width stiff channels set when bonds and angles are erased (channel variance
   $v_k$); the collective-block exponent or loudness sets when global shape is erased. The
   training-free screen confirms they are independent (bonds keep $t_{1/2}=0.26$ at every γ, Rg
   follows γ: 0.48, 0.46, 0.43, 0.20). The molecular finding that **no linear correlated noise
   gives bonds a usable window** (best 0.0049; collective rescaling at most 0.005) explains why
   EigenFold and Chroma, despite their order, cannot be the answer for Boltzmann-level local
   geometry. Phrase: "a decomposition and its measurement", not "ordered noising".
2. **A training-free, per-observable readability probe for nonlinear molecular observables.** It uses
   an exact empirical posterior over 1.3M frames with temporal exclusion, a lower-bound envelope and
   a bootstrap. Pan needs trained conditional denoisers; Choi measures perceptual distance; neither
   compares internal against Cartesian noising for molecules. Note 27: "A brief search found no
   earlier per-observable comparison ... That is not evidence that none exists."
3. **Anti-order of internal coordinates** (Prop. 1, $R=\sum c_jr^j/\sum c_j$). An exact statement
   that composed chain geometry is erased before the torsions it is built from. I found no
   counterpart in the cited literature. The closest analogue is Sclocchi's hierarchy, where the root
   is fragile while the leaves persist (inference here).
4. **The constraint split in redundant charts** (Prop. 2, $L^2/(1+L^2)$ against $1/(1+L^2)$): a
   redundant loud block acts not only through *when* it is erased but through *which block gets
   corrected*. It turns a weakly rewarded high-degree collapse function into a strongly rewarded
   kinematic relation. This is the sharpest new mechanism and the one under test (#1137). It
   inverts QSD's lesson (remove redundancy) into a constructive use of redundancy, with a measured
   cost: each extra vector adds three constraint directions and local error from K = 4 on.
5. **Force read-out through a redundant chart with the immersion volume term and orbit factor**
   (note 29), with a measured consequence: without any volume term "the chain shrinks by 1.7–1.8 Å";
   with it the stationary mean Rg shifts by at most 0.01 Å up to $t=0.1$. Ahamed, R-DM, QSD, SFD
   and the image literature make no force claims.
6. **The empirical combination on BBA:** bonds 15–25× and angles about 7× better than the
   Cartesian baselines, near-Cartesian size, better than native ScoreMD on every measure at the
   registered budget. Phrase as a result on one protein at 190,350 updates, two seeds.

What should **not** be claimed: transform–train–invert (Ahamed), pullback-metric noising (R-DM),
ordered noising of proteins (EigenFold, Chroma), per-component schedules (GUD), appended global
latents with leading schedules (SFD and latent forcing in images), and the information identities
(Guo, Pan, Kong, Verdú).

### 5.5 Image-domain analogies: which are honest to borrow for visuals

| Analogy | Honest? | Condition / pitfall |
|---|---|---|
| Rissanen/Dieleman spectrum with a rising flat noise floor | Yes, for Cartesian linear modes | Use ensemble **variance** per mode, not per-sample power (Rissanen's own limit). A bond's mean is huge; its spread (≈ 0.02 Å) is what drowns. The linear picture understates bonds (0.0004 measured against 0.028 for the smallest linear mode) |
| Wang & Vastola "outline first" endpoint estimates | Yes for Cartesian BBA | Gaussian model only; it cannot hold bond lengths fixed |
| Falck EqualSNR ↔ whitening ↔ Everaert coloring | Yes, mathematically identical (Σ ∝ Cov) | Not "the same result": FID vs Rg, and C1 has other differences |
| Heat dissipation (IHDM) ↔ EigenFold harmonic diffusion ↔ lag-shaped noise | Yes; EigenFold is the heat equation on the chain graph | EigenFold's prior has zero rest length; its clock differs |
| Sclocchi forward–backward; Biroli cloning | Yes; #1055 ran both on C3 | Biroli's sharpness is a $d\to\infty$ result |
| Pan's information-density ribbons | Yes as a display form (C1 bridge) | The probe measures levels, not rates; differentiate the envelope |
| Ahamed's stretched-bowl GD | Yes for the stiffness half | Linear regression; Adam reduces the gap |
| P2 stages as a lens on log-SNR | Yes as a lens | **Do not** borrow P2 weights (PR #1055: "move weight the wrong way") |
| SFD / latent forcing ↔ loud block | Yes, structurally (redundant global channel, leading schedule) | Abstract-level only; their latents come from a learned encoder, the project's block is a fixed linear map with an exact constraint |
| Matryoshka multi-resolution ↔ redundant chart | Loose | Reading Matryoshka as a redundant chart is note 30's |
| "Images are generated coarse-to-fine, so molecules should be too" | **No** | Internal coordinates are anti-ordered; images have linear Fourier modes, molecules nonlinear observables; Falck shows images do not need the order |

### 5.6 Derived facts, hypotheses and later corrections

- **Derived (exact under stated assumptions):** A1–A7, A9, A12, A15, B4, B7, B17, B19 Props. 1–2,
  C1–C6.
- **Hypotheses in the docs:** a structure is learned within budget only if its signal is a
  non-negligible share of the reducible loss at some level (note 27 §6); networks learn low-order
  statistics first, making high-degree collapse the slowest structure (note 30 §2, inferred from
  Refinetti, Bardone & Goldt, Ben Arous); the soft part of a low-noise force is inherited from
  higher levels (note 30 §7); internal models overlap because they never see contacts sharply
  (#1068, "supported only in part").
- **Later corrections:** synchronized information loss as an aim (note 21, 2026-10-24) became the
  cause of lost order (note 27, 2026-11-12). C3's swelling was first explained as error accumulation
  along the chain (#1025) and corrected to a missing collective coupling (#1055, "This corrects the
  explanation given in #1025"). The R-DM contrasts ("no reflections", injectivity, Fukui metric) were
  corrected in the library on 2026-10-19 but not in REFERENCES or Related_Work. The "readable windows
  predict learning" hope was weakened by #1026 and #1068.

---

## 6. Visualization opportunities

Each item: insight / on screen / computed from / numbers / pitfalls.

**V1. One spectrum, two pulls (the thesis's organising picture).** *Insight:* stiffness removal and
noise order want opposite spectra; the design splits the difference. *On screen:* BBA's 27-mode
variance spectrum (15.5 ... 0.011, log scale) as bars with a horizontal noise floor sweeping up;
left caption cites Ahamed/EDM ("flatten"), right cites Biroli/Wang & Vastola ("keep steep"); then
the γ dial morphs the bars to $\lambda^{1-\gamma}$ and the per-mode $t_{1/2}$ ticks collapse from
[0.028, 0.53] to 0.26; finally the design: a flat block at 1 (stiff channels) plus two tall bars
(15.0, 6.0). *Computed:* analytic, B4 plus the spectrum endpoints in note 27 (top four and the
smallest; full spectrum from `bba-rouse_cholesky_spring.npz` if available). *Pitfall:* bonds are
not linear modes; add an asterisk "bond length measured: 0.0004".

**V2. The stretched bowl.** *Insight:* gradient descent crawls along narrow directions (A2, A6); in
thermal units it takes one Newton-like step (A7). *On screen:* a 2D quadratic with κ = 1000; GD
zig-zag with the per-mode error $(1-2\eta\lambda)^k$ as two decaying bars; switch to whitened inputs
and the path is straight. Counter: 3,454 iterations against 1. Then the real ALDP5 table (24,319
against 31 GD steps; 3,941 against 226 Adam). *Computed:* analytic plus note 21's table.
*Pitfall:* linear layer only.

**V3. The loss cannot see the narrow direction.** *Insight:* excess risk
$\operatorname{Tr}[E\Sigma_tE^\top]$ (A1); a small loss can hide a large stiff-direction error.
*On screen:* the error ellipse of equal loss in a 2D Gaussian; the same loss contour allows a
31.6× larger error along the narrow axis for κ = 1000. *Computed:* analytic. *Pitfall:* the
diffusion objective integrates over noise levels with weights; this is one level.

**V4. Partial whitening is a sweet spot, for two different reasons.** *Insight:* both Ahamed and the
project find full whitening worse. *On screen:* small multiples. Left: Ahamed Table 6 bimodal MMD
(114.69, 202.96, 55.74, 66.88, 324.64) and inverse gain (1 → 22.66) against γ. Right: BBA Rg W1
(0.081, 0.120, 0.187, 0.51) against γ, mechanism labels "inverse amplification" and "order". *Data:*
logged numbers. *Pitfall:* one seed per γ on BBA; different metrics; bimodal curve not monotone.

**V5. Ruler against bond (range).** *Insight:* the flat schedule's floor is wider than a bond.
*On screen:* a bond with a ±0.025 Å thermal wobble next to a noise blob of σ = 0.045 Å at
$t=0.01$; SNR 0.30–0.46 on screen; then in internal coordinates the bond channel at unit variance,
readable to $t=0.26$ (25% of training draws against 0.039% for Cartesian). *Computed:* analytic
(E3, E4). *Pitfall:* ALDP5 numbers for the ruler, BBA numbers for the windows; label both.

**V6. Readable-window lane chart for every process.** *Insight:* Cartesian has order without
range, C3 range without order, EigenFold even more order, Chroma partial, the loud block both.
*On screen:* log-t axis from $10^{-5}$ to 1; one lane per process; colored bars from $t_{\min}$
to $t_{1/2}$ for bond, angle, torsion, Rg, long-range, contacts; trained range shaded per lane;
EigenFold on its own clock with a ratio axis. *Data:* note 27 §5 and #1099. *Pitfall:* floors;
estimator differences (Cartesian angle 0.022 against 0.05); the loud row's global values are
block-only floors.

**V7. Decision windows as information bumps (Pan's picture made exact).** *Insight:* each linear
feature has a 1.2-decade decision window centred at SNR = 1/λ; order needs loudness ratios
above 16 (C2). *On screen:* bumps $R(1-R)$ on a log-SNR axis for λ = 15, 6, 2, 1, 0.011 with
matching $t$ windows (mode 1 [0.39, 0.64], torsion-loudness 2 [0.20, 0.46], unit [0.145, 0.397]);
overlay Pan's $D^{(\log\gamma)}=\tfrac12R$. *Computed:* analytic. *Pitfall:* nonlinear features
have different shapes; Pan's measured bumps are for discrete or regularized features. For size, use
the mode-length conformational variances (6.9, 2.5) against torsion loudness 2.0, not the mean
squares, as note 30 does. The resulting order is partial.

**V8. Outline first for a protein.** *Insight:* under Cartesian noise the denoised estimate shows
the fold before local detail; in C3 everything sharpens together. *On screen:* Wang & Vastola's
$\hat x_0(t)$ for a Gaussian model of BBA Cartesian coordinates at $t$ = 0.6, 0.45, 0.3, 0.15,
0.05 next to the same frames through a unit-variance whitened model. *Computed:* precomputable from
the BBA covariance (B10). *Pitfall:* the Gaussian model blurs bond lengths; show the trace, not
bonds.

**V9. Heat equation on images, on chains, in time.** *Insight:* IHDM blur, EigenFold harmonic
diffusion and lag-shaped noise are one idea: fast-relaxing modes are erased first. *On screen:*
three synchronized panels: an image under $e^{\Lambda t}$ blur; a 28-bead chain under
$dx=-\tfrac12\alpha Lx\,dt+dw$ (mode amplitudes $e^{-\frac12\alpha\lambda_kt}$, $\lambda_k$ from
0.01258 to 3.98742); note 25's lag table (half-erasure 1, 1, 1.02, 2.12). *Computed:* analytic
(E10, E11). *Pitfall:* EigenFold's zero-rest-length chain has no bond lengths (bond window 0.0016 on
its clock).

**V10. Equal SNR: images forgive, proteins don't.** *Insight:* Falck's equal-SNR processes are on par
for FID; whitening BBA's collective modes swells the molecule. *On screen:* left, Falck Table 1
bars at T = 1000 for the four schedules on three datasets; right, BBA Rg W1 for γ = 1 against 0 and
the half-whitened Cartesian (0.09 → 0.28 Å). *Data:* logged. *Pitfall:* do not put FID and Å on one
axis; call it "contrast", not "replication".

**V11. Whitening the data is coloring the noise.** *Insight:* the channel is representation plus
noise; per-direction SNR is invariant under an invertible linear map applied to both (Everaert,
note 27 fact 3). *On screen:* a 2D anisotropic Gaussian with white noise (low-variance axis drowns
first) morphing into whitened data with white noise and into original data with colored noise, the
last two having identical per-direction SNR traces. *Computed:* analytic. *Pitfall:* the losses
weight components differently (Everaert §4.1).

**V12. Noise, then regenerate (forward–backward) on a molecule.** *Insight:* where a model decides
global shape. *On screen:* a held-out BBA chain noised to $t_s$ = 0.1, 0.2, 0.3, 0.5 and regenerated
by C3 and by the Cartesian model; Rg change annotated (C3: none for $t_s\le0.1$, 94 ± 25% of the
excess from 0.3; Cartesian unbiased from 0.3 and 0.5). Cite Sclocchi and Li & Chen as the image
analogues. *Data:* saved checkpoints (#1026 C3) and #1055 numbers. *Pitfall:* needs trained models;
one panel per seed.

**V13. Cloning trajectories (speciation).** *Insight:* commitment of the global variable along
generation. *On screen:* a reverse trajectory that splits into clones at $t$, with the spread of
final Rg shrinking: C3 has fixed 40% of final Rg variance by $t=0.3$, 57–59% by 0.2 and 83–91% by
0.1. Inset: Biroli's φ(t) curve with $\phi(t_S)\approx0.775$. *Data:* #1055. *Pitfall:* Biroli's
sharp threshold is a high-dimensional limit.

**V14. Anti-order (why internal coordinates erase the fold first).** *Insight:* a product of $j$
torsion phases keeps $r^j$ (Prop. 1). *On screen:* the E13 table as a heat map (columns: torsion,
$b_k\cdot b_{k+4}$, $b_k\cdot b_{k+12}$, $b_k\cdot b_{k+26}$, $R_g^2$; rows $t$ = 0.1, 0.2, 0.26),
or a chain whose distal segment fades faster than its joints. *Computed:* analytic or the lab
chain model. *Pitfall:* independent uniform torsions; BBA's real torsions correlate (helix order
parameter loudness 8.8).

**V15. Two loud vectors are enough.** *Insight:* only two modes are louder than a torsion; they
carry 96% of the size response. *On screen:* mode loudness bars (6.9, 2.5, 0.9, 0.6 against a
torsion line at 2.0) and the share $\lambda_p^2/\sum\lambda_q^2$ (83%, 96%); then the block-size
trade-off from Table 3 (Rg W1 and torsion error against K). *Data:* note 30, range-and-order
Table 3. *Pitfall:* K = 1, 16, 27 are single seeds.

**V16. The constraint seesaw.** *Insight:* in a redundant chart, the quieter block is corrected.
*On screen:* a seesaw with weights $L^2/(1+L^2)$ and $1/(1+L^2)$ driven by a loudness slider;
markers for whitened (0.43–0.55 / 0.43–0.56), natural (0.85–1.03 / 0.06–0.09) and twice
(0.90–1.09 / 0.02–0.03); the prediction "a whitened block keeps about half the gain", labelled as
pending (#1137, declared 2026-11-18). *Computed:* analytic plus lab numbers. *Pitfall:* chain
model, not BBA.

**V17. Same information, different profile.** *Insight:* no chart changes the total signal (B7);
it moves where it sits. *On screen:* two curves of the collapse signal against $t$ with equal
shaded area (KL 0.0766 nats recovered within 3%): internal chart weak and spread (0.0005 per
example at 0.01, ≤ 0.049 near 0.2), loud block concentrated at 0.35–0.6 (88% learned in the
block). *Data:* lab 2026-11-18. *Pitfall:* chain model.

**V18. Remove redundancy or add it?** *Insight:* QSD projects out rotation directions to make
learning easier; the loud block adds constraint directions that carry a useful relation, at a local
cost. *On screen:* split frame, QSD's $P_x$ removing angular momentum against $3K-3$ constraint
normals for K = 2, 4, 8, 27 (3, 9, 21, 78) next to the torsion-error curve. *Pitfall:* conceptual
contrast (synthesis here).

**V19. Semantic-first in images, loud-first in proteins.** *Insight:* an appended global channel with
a leading schedule is a known image design (SFD, latent forcing) and the molecular block is its
twin. *On screen:* two-row schematic (texture + semantic latent with offset schedules; internal
features + two mode vectors). *Pitfall:* abstract-level only; mark "not checked by the project".

**V20. The metric zoo.** *Insight:* what each geometry calls "small" is a choice. *On screen:* a
three-bead toy where one bond stretch and one distant-pair change are drawn as unit balls under
Euclidean, wδ (log-distance) and R-DM ($q$-map) metrics, with weights 162× (R-DM) and 6.25× (wδ)
between $s=1$ and $s=2.5$ (E16), and finally the thermal metric (inverse covariance, ALDP5 κ ≈ 356
at low noise). *Pitfall:* the sensitivity weights are not physical stiffness.

**V21. Same metric, different denoising (the helix trap).** *Insight:* a pullback metric does not
determine how hard denoising is (note 28 §3). *On screen:* a line and two helices with unit-speed
parametrization under the same noise σ = 0.1; posterior variance 0.01 against about 0.50.
*Computed:* analytic or quadrature.

**V22. Redundancy breeds normal stiffness.** *Insight:* embedding into more dimensions converts
finite tangent stiffness into normal stiffness $\alpha_t/\sigma_t$. *On screen:* a curve in 2D with
a noise cloud and arrows, normal arrows growing as $t$ shrinks ($1/\sigma^2$ = 502 at 0.01, 332,342
at $3\times10^{-5}$); the force read-out $D\varphi^\top$ kills the normal part (A15). *Pitfall:*
flat-image formulas; curved images differ.

**V23. Readable is not learnable.** *Insight:* windows are necessary, not sufficient. *On screen:* a
scatter of torsion $t_{1/2}$ against torsion error (Cartesian 0.08/7.1°, skeleton 0.20–0.26/7.9–10.6°,
C3 0.35/0.85–0.95°, loud 0.35/0.9–1.1°), with the skeleton point breaking the trend. *Data:* note 27,
#1068. *Pitfall:* the skeleton's first-order and measured windows differ; one seed.

**V24. Choi's stages as a molecular lens.** *Insight:* the image "content" stage (SNR 10⁻²–1) sits at
$t\in[0.26,0.68]$, the fold-decision band of Cartesian BBA; bond lengths live in the "clean-up"
stage. *On screen:* a log-SNR ribbon with Choi's stage boundaries and BBA windows overlaid.
*Pitfall:* do not suggest P2 weighting.

**V25. The positioning map.** *Insight:* where each work sits. *On screen:* x axis "what is
reshaped" (network inputs: EDM, covariance-aware prediction → forward process: Ahamed, whitening,
Chroma, EigenFold, internal coordinates); y axis "equalize spectrum (range) ↔ keep it steep
(order)"; glyphs for task (images, proteins, molecules), force claims, redundancy; the project's
loud-block point is alone in "process, both". *Pitfall:* a synthesis, not a measurement.

**V26. Faster, not better (the ALDP5 learning curves).** *Insight:* stiffness removal buys learning
speed (Ahamed's mechanism); a flat model catches up. *On screen:* bond W1 against updates for
spring features (floor at about 2k) and flat low-floor (floor at about 200k). *Data:* the
feature-space evaluation logs. *Pitfall:* this is speed at fixed capacity, not data efficiency.

---

## 7. Open questions, caveats, contradictions and superseded interpretations

1. **`Related_Work.md` is stale (wδ era).** Its four-way "compound" novelty concerns the abandoned
   wδ route; the E(3)-with-reflections pillar does not apply to the current SO(3)/chirality-preserving
   internal coordinates, which share QSD's convention. Nothing on readable windows, loud modes or
   Ahamed. Status on 2026-11-19: unreconciled.
2. **R-DM claims in REFERENCES and Related_Work contradict the 2026-10-19 library note** ("no
   reflections"; staying inside the injectivity radius; approximating the Fukui metric
   $\partial E\otimes\partial E$, which the note shows has rank at most one). The library note
   asked for a correction PR; none appears in rg-main.
3. **Ahamed et al. is uncited in maintained docs.** Note 21's Theorem 1 and Proposition 3 (2026-10-24)
   overlap Ahamed's Lemma 3.2 and Theorem 3.3 (v1 of 2026-03-02). The library review (2026-11-10)
   calls it direct prior art for the learned warp. A thesis must cite it and present note 21 as a
   generalization to loss metrics, pairings and the noise-level metric.
4. **Falck phrasing.** Note 27 says the same study "found a calibrated standard schedule clearly
   better at 1,000 steps". That holds for CIFAR-10 and CelebA; on LSUN Church the calibrated
   EqualSNR is better (19.80 against 20.09), and Falck writes it "outperforms all DDPM variants".
5. **Pan's "untested" ordering claim** is correct about Pan, but SFD (2512.04926) and latent forcing
   (2602.11401), both cited by Pan, train ordered models with appended global latents. Note 30's
   "no generative model that noises internal coordinates together with redundant collective
   channels" should be read as molecular-specific.
6. **Biroli "the same calculation"** is exact only for large Λ (C3).
7. **Kong vs Verdú:** Kong Eq. 8 is the Gaussian-reference case of the mismatched-estimation identity
   (C4); the library's statement is too strong.
8. **Count of long-range pairs.** Note 27 §4 says "the 136 distances between beads at least 11 apart";
   for 28 beads there are 153 pairs with $|i-j|\ge11$ (136 is $|i-j|\ge12$). #1099 uses 153 (also
   flagged by reader r6).
9. **P2 "moves weight the wrong way"** (#1055) is asserted without the argument; Choi's content stage
   is near C3's error band (E19). Open.
10. **Rissanen's per-sample power vs ensemble variance:** any spectrum visual must use variance.
11. **EigenFold/Chroma are screened, not trained.** Chroma's exact covariance "was not readable in
    the accessed version"; neither PDF is in the library.
12. **A possible link between the probe's effective-sample-size collapse and Biroli's collapse
    (inference here).** In 103-d internal features "the posterior weight collapses onto one frame
    (median effective sample size 1)", against about 700 in Cartesian features. Biroli's collapse
    regime predicts exactly this when many directions are simultaneously informative. Equal
    loudness (no order) puts all ~78 directions in play at once. If true, "range without order" also
    makes empirical posteriors memorize at intermediate noise. Untested.
13. **Order versus correction** (Everaert): an early global decision cannot be corrected later; the
    loud block imposes its size on the chain. Whether errors in the block's early decision drive the
    remaining size gap to Cartesian (0.104 against 0.074 Å) is open.
14. **The constraint-split test (#1137) is declared, not run.** Its decision rule: retained share f
    between 0.2 and 0.8 on both seeds supports the split.
15. **Pending scaling questions:** full schedule (1,903,500 updates); other proteins (Chignolin is
    next); note 30 predicts the anti-order worsens with chain length and more loud modes may be
    needed. ALDP5 cannot test order.
16. **Forces:** no cited work offers a remedy for the BBA force-field compaction. Note 30 §7 derives
    that one small-noise level carries information about a soft tilt only ∝ σ², so soft forces are
    inherited from higher levels (hypothesis).
17. **Superseded:** "metric-shaped noise removes uneven information loss" as a design aim (note 21,
    2026-10-24) became "unit variance in every direction is what erases the order" (note 27,
    2026-11-12; range-and-order "Mechanistic insights" 2).

---

## 8. Sources read

Repository snapshot (paths under
`/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/rg-main/`):
- `docs/REFERENCES.md` (all sections, in full)
- `docs/Related_Work.md` (in full)
- `docs/status.md` (in full)
- `docs/theory/27-readable-windows-and-noise-order.md` (in full)
- `docs/theory/30-loud-blocks-in-redundant-charts.md` (in full)
- `docs/theory/28-score-ease-and-thermal-preconditioning.md` (in full)
- `docs/theory/29-score-to-force-pullback.md` (in full)
- `docs/theory/21-target-loss-noise.md` (§§0–5)
- `docs/theory/25-information-geometry-lag-noise-posterior.md` (§2)
- `docs/investigations/bba-range-and-order.md` (in full)
- `docs/investigations/bba-local-geometry-preconditioning.md` (head and main outcomes)
- `docs/investigations/covariance-aware-prediction.md` (key sections)
- `docs/investigations/bba-force-learning-assessment.md` (EDM passage)
- `docs/design/learned-stiffness-warp.md` (head)
- `docs/design/transferable-noising.md` (EigenFold/Chroma passage)
- `lab/2026-11-16-readable-windows-noise-precedents/README.md` and `run.py`
- `lab/2026-11-18-range-order-mechanisms/README.md`

Archive: `/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/rg-archive/docs/investigations/prior-mobility-617.md`.

Archived PR branches (via `git -C /Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative show`):
- `origin/coarse-to-fine-chain-chart:docs/investigations/bba-coarse-to-fine-chain-chart.md` (summary and §§1–3)
- `origin/bba-internal-global-structure-mechanism:docs/investigations/bba-internal-global-structure.md` (§§3.3–3.6, §4)

Local library (`/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative/papers/`):
- `INDEX.md`
- `2026/ahamed2026_preconditioned_flow_matching_v4-notes.md` and `..._v1-notes.md` (in full), plus the
  v4 PDF text (Prop. 3.1, Lemma 3.2, Theorem 3.3, Theorem 4.1, G.8–G.9, Tables 6–7)
- `noise-order-feature-readability/INDEX.md`, `acquisition.json`, and the text extracts:
  - `pan2026.txt` (main text and App. A)
  - `guo2005.txt` (Theorems 1–2)
  - `biroli2024.txt` (pp. 1–5)
  - `li2024.txt` (pp. 1–5)
  - `sclocchi2025.txt` (pp. 1–3 and threshold passages)
  - `wang2023.txt` (pp. 1–6)
  - `rissanen2023.txt` (§2, §2.2, App. A.5)
  - `falck2025.txt` (§§1–4)
  - `choi2022.txt` (§3)
  - `kong2023.txt` (§§2–3)
- `information-geometry-diffusion/everaert2024.txt` (§§1–4)
- `2024/woo2024_riemannian_denoising_model_molecular_structure_optimization_v2-notes.md` (in full)
- `2026/quotient_space_diffusion_models.pdf` (Table 1, Theorems 2–4, §3.3)
- `2022/karras2022_elucidating_design_space_diffusion_edm.pdf` (§5, Table 1)

GitHub (read-only):
- PR bodies: #1068 (in full), #1055 (head), #1137
- PR dates/titles: #753, #871, #876, #882, #908, #910, #941, #943, #946, #950, #985, #1010, #1023,
  #1025, #1026, #1033, #1037, #1055, #1057, #1064, #1065, #1068, #1069, #1071, #1073, #1074, #1075,
  #1078, #1079, #1088, #1089, #1090, #1091, #1099, #1100, #1109, #1115, #1137
- Open PR list: #1092, #1104, #1113, #1127, #1136, #1137, #1138

Web (abstract pages only, 2026-11-19): arXiv 2602.11401 (latent forcing) and 2512.04926 (SFD), found
through Pan et al.'s bibliography.

Numeric checks (scripts in
`/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/g3tmp/`):
- `checks.py`: $t_{1/2}$, decision windows, floors, training-draw shares
- `checks2.py`: EigenFold spectrum, R-DM sensitivities, Ahamed toy, EDM coefficients
- `checks3.py`: SNR ↔ t map, Pan–R bridge, Biroli vs note 27, Ahamed λ_max fit
