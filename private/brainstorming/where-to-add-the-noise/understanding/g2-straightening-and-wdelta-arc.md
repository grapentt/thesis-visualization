# G2: "straightening" with wδ, and how the wδ arc ends

Reader key: `g2-straightening-and-wdelta-arc`. Read on 2026-11-19. This report adds to `r1-wdelta-era.md`, which covers the Era 1 mathematics and the intrinsic-diffusion failures. Here I cover four things: what Diepeveen 2024 actually shows at the level of its figures, how the project re-examined that evidence, Diepeveen 2025 as the published form of the Gaussianization lever, and wδ's second life as a BBA feature map, including the readable windows nobody has measured yet.

**Conventions.**
- Paths are relative to the `rg-main` snapshot (`origin/main`, 2026-11-19) unless marked otherwise. `archive:` means `rg-archive/docs`.
- Numbers are quoted as the source prints them.
- **(derived here)** marks my own computations. They are small CPU checks on read-only data. The scripts are in `/private/tmp/claude-501/-Users-I745505-private-thesis-animation--claude-worktrees-fiber-bundles-em-video-0ada80/402246d0-9633-4c38-9be1-0f5513333808/scratchpad/g2/checks/`. They are not project measurements.
- **(read from figure)** marks values estimated from published plots. They are approximate.
- **[H]** marks a hypothesis.

---

## 0. Headline

Diepeveen et al. (arXiv 2308.07818v2, Oct 2023) is a data-analysis paper. It reports two pieces of evidence:
1. On a 102-frame closed→open adenylate kinase (AK) transition, the "wδ-geodesic" between the two end frames stays within the 3.85 Å Cα spacing for most residues. Its RMSD to the frames peaks near 2.5 Å at mid-path (read from figure).
2. Tangent PCA at the wδ-barycentre reconstructs AK from a single component (about 85% of variance, about 1 Å error). nsp13 needs 7 components.

The project took these as the empirical justification for the whole approach (exposé §3.4, 2026-07-02). Its slides (Oct–Nov 2026) turned them into a "straightening" picture: geodesics ≈ MD, normal coordinates ≈ flat, score ≈ linear.

Read precisely, the paper's "wδ-geodesic" is a separation interpolation, not a geodesic. By an exact identity it is the realizable molecule nearest to the straight chord in the flat feature space of log pair distances and log gyration volume.

In that sense wδ "straightens" only by declaring log-distance chords to be the natural paths. The Sprint 10 re-examination (2026-10-19, #513/#522) showed three things:
- The AK input is a DIMS directed transition, and no theorem links wδ to physical paths.
- A plain aligned Cartesian chord is closer to the MD frames: 1.76–1.78 Å versus 2.03–2.05 Å on AK, and 0.224 versus 0.247 Å on ALDP5.
- wδ's real advantage is local: adjacent-Cα RMSE 0.077 versus 0.144 Å on AK, and no collapsed neighbours.

Low-rank checks were left open. My own checks fill that gap (derived here). On the same AK data, plain aligned Cartesian PCA gives 0.8934 of the variance in PC1 and a 0.747 Å mean rank-1 RMSD. The ProteinAtlas wδ tangent-PCA reproduction gives 0.8927 and 0.748 Å. nsp13 shows the same match at rank 7. So the dramatic compression is a property of the directed transition, not of the metric. In wδ feature space the path is not straighter than in Cartesian space either (PC1 share 0.861 versus 0.893).

The "straightening → near-linear score" idea did come true later, in a different form. A learned flow refitted on 100 ps steps made the ALDP5 data nearly Gaussian (total KL to a Gaussian 0.14 versus 0.96) and learned the torsions in 100 updates (JS 0.027 versus 0.117). Diepeveen 2025 is exactly this construction: a learned anisotropic flow with closed-form geodesics, limited to unimodal densities, which matches the warp's rare-barrier surplus.

wδ itself lived on as a BBA feature map:
- **Strengths:** at the registered budget it has the best size error (0.062/0.072 Å), the lowest seed-mean contact error and zero severe clashes in every panel. Its PMF of 0.161/0.198 beats native ScoreMD (open PR #1138).
- **Weaknesses:** bonds are 86× and angles 9.8× worse than ordered internal coordinates, and its force fields drift to 17–18° angle errors.

wδ's readable windows were never measured. A first-order screen (derived here) explains the profile. Closest-contact distances stay readable up to t½ ≈ 0.12, against 0.013 in internal coordinates. Bonds sit at t½ ≈ 0.014, at the 0.01 floor.

wδ and ordered internal coordinates are therefore mirror images at the two shortest length scales. [H] wδ's log-distance barrier, which puts collisions at infinite distance, is a ready-made form of the excluded-volume channel that note 30 says must be "supplied".

---

## 1. Narrative (chronological)

### 1.1 The source: Diepeveen, Esteve-Yagüe, Lellmann, Öktem, Schönlieb (arXiv 2308.07818v2, 26 Oct 2023)

**Goal (§1).**
- Build (i) a smooth manifold of conformations, (ii) a Riemannian structure "modelled after the energy landscape", and (iii) computationally feasible maps.
- The ideal is stated in §1: "length-minimising curves … are energy-minimising and the distance between two conformations corresponds to the energy needed for the transition".
- The paper is explicitly not a generative model.

**Construction (§§3–5).**
- A *separation* $w$ (Def. 3.1) approximates the Riemannian distance locally (Thm 3.2).
- It yields a closed-form log (Cor. 3.2.1), a variational "w-geodesic" (Eq. 5) and an extrapolation-based exponential (Eqs. 6–7).
- The state space is the quotient $\mathcal P(d,n)/E(d)$, reflections included (Thm 4.2), with a reverse-engineered metric (Thm 4.3).
- The metric is wδ (Eq. 17), motivated in §5 by excluded volume. A quadratic Hookean potential "stipulates that the distance … to transition into a state $Z$ with $z_i=z_j$ is finite and small … In reality it would take infinite energy to move two atoms to the same location, which means that these states should be infinitely far away." The log metric is "truly more in line with … the famous Lennard-Jones potential".
- The log-det term is added only to make the metric complete. Without it, affine rank loss would be "finite and small" away.

**Evidence (§7; δ = 1; PyTorch on a 2 GHz quad-core laptop).**
- *Data.* AK: 214 Cα, 102 frames, "a (famously) ordered and medium-size closed-to-open transition [6]", where [6] is Beckstein, Seyler & Kumar 2018, "Simulated trajectory ensembles for the closed-to-open transition of adenylate kinase from DIMS MD and FRODA". nsp13: 590 Cα, 200 frames ("more disordered and large-deformation"; DE Shaw 2020). Manifold dimensions are 636 and 1764.
- *§7.1, AK interpolation* (Fig. 1 middle row, Fig. 3 top row).
  - The midpoint converges in 4 iterations and takes 245 ms ± 11.4 ms.
  - Text: "the error increases the further away we are from either end point, but is much smaller than the distance between Cα atoms – which is approximately 3.85 Å".
  - The largest errors are in "the lower part of the protein – indicated by the yellow and green atoms", which are the atoms with the largest total displacement.
  - The authors' explanation: "potentials like Lennard Jones are stronger at short-range than for example wδ(…), but weaker at long-range".
  - Fig. 3a RMSD progression (read from figure): 0 at both ends, about 1.1 Å at t = 0.1, about 1.6 at 0.25, peak about 2.5 Å near t ≈ 0.55, about 2.0 at 0.75.
  - Fig. 3c per-residue deviation versus total displacement at t = 0.5 (read from figure): about 21 of 214 residues lie above 3.85 Å. The maximum is about 7.7 Å, for residues with 15–18 Å total displacement.
- *§7.1, nsp13.* The midpoint takes 14 iterations and 10.1 s ± 43.3 ms. "We are unable to approximate this protein's trajectory with just one wδ-geodesic." The error sits in the dark-blue lobe (Fig. 4: RMSD about 3.5–6.5 Å, read from figure). Conclusion: "we just cannot only use geodesics in such cases."
- *§7.2, low rank.*
  - The barycentre (Eq. 22) is computed by Riemannian gradient descent: AK takes 3 iterations and 425 ms ± 13.8 ms; nsp13 takes 4 iterations and 7.08 s ± 289 ms.
  - The tangent vectors $\log^{w}_{\bar X}X_k$ go into an **ℓ² Gram matrix on the horizontal space** (Eq. 24). This choice is deliberate: the paper wants "the lowest error in the Euclidean distance … more in line with … RMSD".
  - AK: "a rank 1 approximation covers about 85 % of the variance". Exp of the rank-1 projection of $X_{102}$ takes 657 ms ± 19.6 ms. "The error is about 1 Å." Fig. 3a bottom (read from figure): RMSD 0.48–1.15 Å along the path. "The barycentre does not go through the data … but is close to it."
  - nsp13: by the same 85% threshold, "at least a rank 7". Exp takes 25.2 s ± 164 ms, with a "near-perfect reconstruction".
  - Conclusion: "broke down 636-dimensional conformations to just a non-linear 1-dimensional space and … 1764-dimensional conformations to a non-linear 7-dimensional space".
- *Appendix D.1.*
  - Adjacent Cα distances at the AK midpoint and barycentre are "more or less preserved" (Remark 5.2). This is the wδ-specific property.
  - The barycentre shows a small dip just after atom 50 (to about 3.55 Å, read from figure).
  - A sharp dip at about residue 85, down to about 3.1 Å, appears at t = 0, 0.5 and 1 alike. It is in the data: it is the Phe86–Pro87 pair, mean 3.043 Å, minimum 2.799 Å, i.e. a cis-proline peptide (derived here from the PSF/DCD).
- *Appendix D.2.* Curvature tests (Eqs. 116–118) give relative discrepancies from zero-curvature baselines within roughly ±0.05 for AK (read from Fig. 7) and up to about +0.12 for the nsp13 rank-7 curve (Fig. 8). The authors call them "negligible".

### 1.2 Adoption by the project (July–October 2026)

- **Exposé §3.4 (PDF dated 2026-07-02).**
  - "These two results are the empirical justification for our approach."
  - Result 1: "If geodesics are energy-minimizing MD paths, then a generative model whose forward process follows geodesics is trained on physically meaningful interpolants — not arbitrary linear paths through ambient space."
  - Result 2: "This reveals the intrinsic low dimensionality of protein conformational ensembles under the $g_{w^\delta}$ geometry."
  - The exposé calls AK "open-to-closed". The paper says closed (t = 0) → open (t = 1).
- **README "What makes the manifold trustworthy"** (still in the 2026-11-19 README). It repeats both results but qualifies them: "data-analysis evidence on the reported systems, not validation of our diffusion pipeline"; the rank-1 result "motivates, but does not prove, low-dimensional modelling on other ensembles".
- **Related_Work §D.**
  - Diepeveen 2024 is "not a generative model"; the project "inherit[s] their quotient and wδ metric wholesale" and goes log-free (GRW+ISM) "past the injectivity radius / cut locus they themselves flag as unstable".
  - Diepeveen 2025 is a "methodological cousin" that learns the metric from the density: "even the author of our own wδ metric took the learned-from-density route in his generative follow-up".
- **Slides.**
  - `ThesisDiscussion2.pptx` (file dated 2026-10-19), slides 2–3: compare configurations "by how their internal geometry changes, rather than by arbitrary displacements of Cartesian coordinates"; "Geodesics approximate real dynamics"; "Normal coordinate chart (analogue of 'flat') approximate dynamics well".
  - `ThesisDiscussionFrank2.pptx` (file dated 2026-11-17), slide 4 "Diepeveen's Insight": "Real MD trajectories are well approximated by geodesics"; "All MD happens in low dimensional submanifold 'spanned' by geodesics".
  - Slide 5: "Diffusion process favors real trajectories … Unphysical configurations are far apart → never sampled … In normal coordinates: Most of the distribution in linear subspace".
  - Slide 6 is the **straightening cartoon**: a "curved valley" in Euclidean coordinates next to a "straightened valley" in geometry-aligned coordinates. Its claims: "By construction geodesics ≈ molecular trajectories"; "Score field is almost constant along geodesics"; "Higher-order terms ≈ 0"; "→ much easier function class".
  - Slides 30–31 propose using "the dimensionality reduction from Diepeveen" and asking whether a better metric can be found ("follow up work from diepeveen; metric learning").
- **Atlas extension.**
  - `ThesisDiscussion2` slides 12–23 and `/Users/I745505/private/thesis_extension/ProteinAtlas`. Slide 14 reads "Diepeveen result: Reconstruction error (RMSD) about 1 Angstrom using one PGA chart", which led to multi-chart atlases.
  - ProteinAtlas reproduces the single wδ PGA chart: AK rank 1 has variance 0.8927 and mean RMSD 0.748 Å; nsp13 rank 7 has 0.8408 and 1.232 Å. These are "reported by earlier runs … not reproduced by this bootstrap" (README, evidence date 2026-10-06).
- **Era 1 (Sprints 0–10, July–October)** used the metric intrinsically; see r1. The Diepeveen evidence was never re-tested in that period.

### 1.3 Re-examination (Sprint 10, 2026-10-19 → 10-22)

- **#513** (opened and reported 2026-10-19; closed 2026-10-24), `docs/investigations/metric-qualification-513.md`.
  - It authenticated ALDP via the bgmol `AImplicitUnconstrained` archive (1,000,000 × 22 × 3, 1 ps) and the upstream AK data at pinned commit `d7dec930…`. The AK input "is a DIMS directed transition, not an unbiased equilibrium trajectory".
  - Verdict: "**neither curved metric beats Cartesian interpolation on average trajectory RMSD in this panel**". The geometry "helps preserve local distances; it does not reconstruct every stochastic motion. 'Good MD geodesics' is therefore insufficient justification for the original metric."
  - The optional "barycentre, low-rank, endpoint-sensitivity and broader trajectory panels were not run".
- **#522** (opened and closed 2026-10-19), `wdelta-qualification-522.md`.
  - It separates five objects: separation, intrinsic distance, separation interpolation, exponential and separation logarithm.
  - On the evidence: "Its geometric energy is a proxy deformation cost, not the molecular potential. A lower Cartesian coordinate error in a later experiment therefore does not contradict a theorem of physical superiority: no such theorem is provided."
  - Verdict: retain wδ "as a geometric reference and a restricted-domain candidate"; "its planar exclusion is mathematical".
- **Numerics assessment** (2026-10-19), section "What the MD comparison in Diepeveen actually establishes": "empirical support in a measured regime, **not a theorem that geodesics reproduce MD**, its time parametrization, forces or kinetics for arbitrary molecules. No artificial bead is part of those reported representations." Remark 5.2 "is not an exact bond-constraint theorem".
- **ALDP/reference evaluation** (2026-10-19), `aldp-reference-metric-evaluation.md`. ADK means at frames 25/50/75 are 2.05287 Å (original), 2.04998 (localized) and 1.78400 (Cartesian). "**Cartesian has lower mean time-aligned coordinate error in all three panels**". Even the route-matched secondary analysis gives 1.47641/1.47532/1.45566 Å.
- **Authentic chignolin/BBA MD** (archive, 2026-10-19). Cartesian has lower mean coordinate error in five of six groups, but collapses adjacent Cα spacing to 0.294 Å (chignolin) and 0.087 Å (BBA). The geometric methods keep 3.2–4.4 Å.
- **Closeout #520** (2026-10-22): "The favorable theorem does not show that molecular dynamics follows these geodesics or that learning improves."

### 1.4 The straightening idea's second life: learned flows (Sprint 11, 2026-10-24 → 11-08)

- **#753** (2026-10-24 → 27) is a learned stiffness warp $W$, a coupling flow on aligned shape coordinates fitted so that 1 ps steps are isotropic. **Theory note 23 §4.1** (2026-10-25) places it in the literature: "score-based pullback geometry learns a flat pullback weighted by inverse variance and is limited to single-basin densities (Diepeveen et al. 2024). #753 is the molecular instance, fitted by the likelihood of 1 ps steps." Note 23 dates the paper 2024; elsewhere it is 2025.
- **Lag sweep** (#936, 2026-11-05).
  - Refitting on 100 ps steps gives torsion JS 0.027 at 100 updates, against 0.117 for flat. The report first attributed this to "synchronized erasure".
  - **Same-day correction:** the soft-scale sweep refuted that reading. Rescaling the spring space slowed learning instead (0.133/0.149/0.163). Direct measurement showed the 100 ps warp makes the data nearly Gaussian: total KL 0.14 against 0.96, bimodality 0.37 against 0.80. "In part a Gaussianizing flow for the slow modes."
  - The **controlled test** (torsion Gaussianization, 2026-11-05) confirmed the lever. Marginal Gaussianization gives JS 0.042–0.043 at 100 updates against 0.255 for the control, but plateaus at 0.029 by 20,000 updates.
- **Bead campaign** (#954, 2026-11-05; re-read 2026-11-08). On BBA with the bead-energy transformer, the two warps were "the best candidates of the overview on the slow coordinates" (TIC JS 0.025–0.027 against 0.046 for the bead flat slice).

### 1.5 wδ's afterlife as a feature map (2026-10-25 → 11-18)

- **ALDP5** (#757, 2026-10-25; evaluation 2026-10-26). wδ features (with the virtual bead) are "good on torsions and bonds, worse on angles (they weight distances by inverse length rather than stiffness)". At 200k updates, JS is 0.0199.
- **BBA Sprint 11** (#895, opened 2026-11-01). wδ gives bond W1 0.1688 Å against 0.6371 for flat, and angle 4.574° against 11.910°. TIC JS is 0.0889, worse than flat's 0.0529. "Stiffness removal is local (bonds; angles for wδ)."
- **Sprint 12 first chunk** (2026-11-09). BBA wδ: bond 0.1131 Å, angle 3.238°, Rg 0.08529 Å, JS 0.03185, 654/100,000 failed decodes, **0 severe collisions** (Cartesian 682, internal 1,186).
- **#985 distance inputs** (2026-11-09). wδ improved on "all six primary errors": bond 0.1108 → 0.02692 Å, size 0.07759 → 0.06150 Å, failures 654 → 131.
- **#1000** (2026-11-10). Physical-only ALDP5 wδ works under the feature route (49,980/50,000 decoded). It is worse than with the virtual bead.
- **#1025** (2026-11-11). Resolution test: wδ bonds are resolved at only 1.25 σ(t_min).
- **Registered-budget study.** The plan (#1072, 2026-11-13/14) lists five outcomes. One of them is "**Another candidate leads.** wδ with distance inputs is the one with evidence for this on seed 0."
  - The candidates table notes for wδ: "Windows not yet measured."
  - The results (2026-11-15; #1088 merged 2026-11-16) did not take that branch: the loud-mode internal candidate beats wδ ×86 on bonds, ×9.8 on angles and ×1.5 on populations. wδ keeps the best size and contacts, with 0% clashes.
  - Q4 (do windows predict outcomes?) was "not tested in this wave".
- **PR #1138** (open, 2026-11-18): wδ PMF 0.161/0.198 kT², against native ScoreMD 0.202/0.315.
- **Excluded-volume story** (lab entries 2026-11-16/17/18; note 30, 2026-11-18). Internal-family force fields have "no excluded-volume wall, in any model at any level". The closest contact is a range failure: loudness 0.003, t½ 0.013.

---

## 2. Core mathematics

**M1. Separation and its maps** (Diepeveen 2024 §3).
- $w$ is a separation if (i) it is a metric, (ii) $w(p,\cdot)^2$ is locally smooth, and (iii) $\nabla_{\Xi_p}\operatorname{grad}w(p,\cdot)^2=2\Xi_p$.
- **Thm 3.2.** $w(p,q)^2=d_{\mathcal M}(p,q)^2+O(d_{\mathcal M}^3)$, exact iff $\operatorname{grad}w(p,\cdot)^2|_r=-2\log_rp$ along the geodesic.
- **Cor. 3.2.1.** $\log^w_p q:=-\tfrac12\operatorname{grad}w(q,\cdot)^2|_p$ satisfies $\|\log^w_pq-\log_pq\|_p=O(d^2)$.
- **w-geodesic (Eq. 5):** $\gamma^w_{p,q}(t)\in\arg\min_r\tfrac{1-t}2w(p,r)^2+\tfrac t2w(r,q)^2$. A minimizer exists if $w$ is complete, and the problem is locally strongly geodesically convex (Thm 3.3).
- **w-exponential (Eqs. 6–7):** $p_k=\gamma^w_{p_{k-2},p_{k-1}}(2)$ with $p_1=\operatorname{retr}_p(\Xi/M)$ and $M$ the smallest integer above $\|\Xi\|/4$ (§7). That is, repeated **extrapolation to $t=2$** (Thm 3.4).

**M2. The separation geodesic is a projected feature chord (exact; algebra derived here, also stated in #522).**
For wδ, $w^\delta(X,Y)=\|F(X)-F(Y)\|$ with $F(X)=((\log r_{ij})_{i<j},\sqrt\delta\log\det G_X)$. For any $a,y,w$:
$$(1-t)\|a-y\|^2+t\|a-w\|^2=\|a-[(1-t)y+tw]\|^2+t(1-t)\|y-w\|^2 .$$
So Eq. 5 equals $\min_Z\tfrac12\|F(Z)-[(1-t)F(X)+tF(Y)]\|^2$ plus a constant. **The w-geodesic is the molecule whose features are closest to the straight feature chord**: each pair distance is interpolated geometrically, $r_{ij}(X)^{1-t}r_{ij}(Y)^t$, the gyration volume likewise, and the result is projected back onto realizable molecules.

At $t=2$ the same identity gives $\tfrac12\|F(Z)-[2F(Y)-F(X)]\|^2$ minus a constant: **extrapolation projects the reflected feature point**. #522: "the objective is a squared distance to the affine feature target plus a constant, including t=2."

This is the same nearest-image projection the Sprint 11–12 feature-space decoders use. In hindsight, Diepeveen's "geodesic" is the feature-space recipe applied to interpolation. It is **not** the intrinsic geodesic: $w^\delta\le d_g\le L_g$, with chord and arc agreeing to fourth order locally (`theory/01-metric.md`; r1 M6).

**M3. wδ, its metric, and its two barriers** (Eq. 17, Thm 5.3, Cor. 5.2.1; `theory/01-metric.md`).
$$w^\delta([X],[Y])^2=\sum_{i<j}\Big(\log\tfrac{r_{ij}(X)}{r_{ij}(Y)}\Big)^2+\delta\Big(\log\tfrac{\det G_X}{\det G_Y}\Big)^2,\quad H=A+\delta B .$$
Here $H$ is the pullback $J^\top J$ of the flat feature space. Integrating the per-feature bound $|d\log r_{ij}[V]|\le\|V\|_g$ gives
$$\Big|\log\tfrac{r_{ij}(Y)}{r_{ij}(X)}\Big|\le d_g(X,Y),\qquad |\varphi(Y)-\varphi(X)|\le d_g/\sqrt\delta\ (\varphi=\log\det G).$$
- **Barrier 1 (collisions):** $r_{ij}\to0$ needs infinite length. This is the excluded-volume motivation of §5.
- **Barrier 2 (affine rank):** $L_g(\gamma)\ge\sqrt\delta|\log\det G_{\rm end}-\log\det G_{\rm start}|$, so a non-collinear plane is infinitely far (#522). Barrier 2 killed Era 1 on near-planar ALDP5 (r1).
- **Remark 5.2:** small invariant distances (bonds) should be approximately preserved along w-geodesics and barycentres. App. D.1 checks this.

**M4. Barycentre and tangent PCA** (Eqs. 22–26).
- $[\bar X]\in\arg\min\frac1{2N}\sum_kw^\delta([X],[X_k])^2$.
- $\Gamma_{kl}=((\log^{w}_{\bar X}X_k)^\diamond,(\log^w_{\bar X}X_l)^\diamond)_2$ is an **ℓ² inner product on the horizontal space**, by design.
- With $\Gamma=U\Lambda U^\top$, the rank-$r$ approximation is $\Xi^r_k=\sum_{k'\le r}(u_{k'},\log_k)u_{k'}$.
- RMSD rationale (Eq. 26): $\mathrm{RMSD}([X_k],\exp(\Xi^r_k))\approx n^{-1/2}\|\log_k-\Xi^r_k\|_2$ to first order.
- Remarks 6.1/6.2 warn that curvature can destabilize this (negative curvature for low rank, positive curvature at endpoints). App. D.2 tests it.
- The pinned upstream notebook (`git show d7dec930:experiments/protein_conformation_processing.ipynb`) computes `Gramm_mat = einsum("Nia,Mia->NM", log, log)`. The rank is the first $r$ with cumulative eigenvalue fraction > 0.85.

**M5. "Normal coordinate chart (analogue of 'flat')"** (slides 2–3).
- Riemannian normal coordinates at $p$ ($\operatorname{Exp}_p$ of a tangent basis) make $g_{ij}=\delta_{ij}+O(r^2)$. Lines through the origin are geodesics through $p$.
- Tangent PCA at the barycentre linearizes principal geodesic analysis: if the data lie near a $k$-plane in normal coordinates, they lie near a $k$-dimensional geodesic subspace through $\bar X$.
- That is the precise content of "rank-1 at the barycentre": the AK frames lie near one geodesic through $\bar X$.
- The slides' "flat analogue" is the right word: when curvature corrections are small (D.2: about 5%), the chart is nearly flat on the data. (Derived here: on AK this is literally true. The Euclidean quotient chart gives the same numbers; §4.3.)

**M6. Kinetics cannot come from equilibrium geometry** (`theory/19-analytical-molecular-geometry.md` §9, 2026-10-20). For $dx=-(k/\gamma)x\,dt+\sqrt{2\theta/\gamma}\,dW$: $\operatorname{Var}=\theta/k$ and $\operatorname{Corr}=e^{-kt/\gamma}$. Multiplying friction by 100 keeps the equilibrium and slows relaxation 100×. A two-state toy with equal rates $a$ has equal populations but kinetic distance $d_\tau^2=4e^{-4a\tau}$. A configuration-space metric therefore cannot fix MD time parametrization. The "time-aligned" comparisons (paper Figs. 3–4; #513) compare frame index to curve parameter. That only makes sense for a directed path.

**M7. Score-based pullback geometry** (Diepeveen, Batzolis, Shumaylov, Schönlieb, arXiv 2410.01950v2, 22 May 2025).
- Density $p(x)\propto e^{-\psi(\varphi(x))}$ with $\psi$ strongly convex and $\varphi$ a diffeomorphism.
- Metric (3): $(\Xi,\Phi)^{\nabla\psi\circ\varphi}_x=(D_x\nabla\psi\circ\varphi[\Xi],D_x\nabla\psi\circ\varphi[\Phi])_2$.
- With $\psi(y)=\tfrac12y^\top A^{-1}y$ ($A$ symmetric positive definite, in practice diagonal and learned), **Prop. 1** gives:
  - $d(x,y)=\|A^{-1}(\varphi(x)-\varphi(y))\|_2$
  - $\gamma_{x,y}(t)=\varphi^{-1}((1-t)\varphi(x)+t\varphi(y))$
  - $\exp_x\Xi=\varphi^{-1}(\varphi(x)+D_x\varphi[\Xi])$
  - $\log_xy=D_{\varphi(x)}\varphi^{-1}[\varphi(y)-\varphi(x)]$
  - The metric tensor is $D\varphi^\top A^{-2}D\varphi$. **Geodesics do not depend on $A$**; $A$ only weights distances, by inverse variance.
- **Thm 1:** $t\mapsto\psi(\varphi(\gamma(t)))$ is strongly convex, so geodesics pass through higher-likelihood regions than their endpoints.
- **Eq. 10:** if $D\varphi$ is approximately orthogonal on the data, the metric ≈ $(D_x\nabla\log p[\cdot],D_x\nabla\log p[\cdot])$. Hence the name "score-based".
- **RAE (Eqs. 11–14):**
  - Order the $a_u$ in decreasing size.
  - $d_\varepsilon$ is the smallest $d'$ whose tail $\sum_{w>d'}a_{u_w}$ is at most $\varepsilon\sum a_u$.
  - Encoder $E_\varepsilon(x)_w=(\varphi(x),e^{u_w})$; decoder $D_\varepsilon(p)=\varphi^{-1}(\sum p_we^{u_w})$.
  - **Thm 2:** $\mathbb E\|D_\varepsilon E_\varepsilon X-X\|^2\le\varepsilon C_\varphi\operatorname{tr}A+o(\varepsilon)$, with $C_\varphi$ set by the deviation from isometry (Eqs. 16–19).
- **Learning (Eqs. 20–22):** the normalizing-flow NLL with learned diagonal $A_{\theta_1}$, plus $\lambda_{\rm vol}\mathbb E\log|\det D\varphi|^2$, plus $\lambda_{\rm iso}\mathbb E\|D\varphi^\top D\varphi-I\|_F^2$. The flow uses affine couplings, chosen for regularity. A Hessian-vector regularizer (Eq. 23) is added for images.
- The scope is explicitly **unimodal**. Project caveat (theory/19 §8): "$e^{-\psi(\varphi(x))}$ is not automatically the pushforward of a latent Gaussian: the latter also has a Jacobian factor. Their assumptions do not establish the periodic, multibasin or molecular claims."

**M8. The project's learned stiffness warp** (`docs/design/learned-stiffness-warp.md`, fits 2026-10-24).
- $W(x)=\bar c+(m+V\varphi(u))R^\top$, with $u$ the aligned-slice coordinates and $\varphi$ = affine couplings ∘ $L$, where $L$ is a constant whitening of the mean step covariance.
- It is fitted on lag-$\tau$ pairs by the exact likelihood of an isotropic Gaussian random walk: $\mathbb E[|\varphi(u_1)-\varphi(u_0)|^2/(4c^2)-\log|\det D\varphi(u_1)|]$.
- The pullback is $G=DW^\top DW\approx c^2\Sigma(x)^{-1}$, the inverse local step covariance.
- **Lag dictionary** (note 25 as used in the lag sweep):
  - The half-step variance of a mode is $w^2(1-e^{-\tau/t})$, where $w$ is its equilibrium width and $t$ its relaxation time.
  - Under lag-shaped noise a mode is half erased at $\sigma^2/\alpha^2=1/(1-e^{-2\tau/t})$.

**M9. Readable windows** (`theory/27-readable-windows-and-noise-order.md`; `theory/30-loud-blocks-in-redundant-charts.md` §1).
- Model input: $Y_t=\alpha_t\phi(X)+\sigma_t\varepsilon$.
- Readability: $R_h(t)=\operatorname{Var}(\mathbb E[h\mid Y_t])/\operatorname{Var}h$. Half-erasure level $t_{1/2}$.
- **First-order loudness:** $\ell_h=\operatorname{Var}(h)/\mathbb E[\nabla h^\top G^+\nabla h]$ with $G=J^\top J$. It is the $s^2=(\sigma/\alpha)^2$ at half erasure under the linear-Gaussian rule.
- With $-\log\alpha_t^2=0.1t+9.95t^2$: $t_{1/2}(\ell)=\big(-0.1+\sqrt{0.01+39.8\log(1+\ell)}\big)/19.9$, so $t_{1/2}(1)=0.259$.
- #1025's **resolution noise** $\sigma^*(q)=\operatorname{sd}(q)/\sqrt{\nabla q^\top G^+\nabla q}$ is the same object: $\ell\approx(\sigma^*)^2$ (derived link).
- **Range:** every needed feature has $t_{1/2}\gg t_{\min}$. **Order:** coarse features are erased last.
- Note 30 §7: a missing smooth energy term $U$ costs only $\sigma^2\mathbb E|\nabla U|^2$ of excess loss at level $\sigma$ (small at the floor). "Excluded volume is a range failure … it is to internal coordinates what bond lengths are to Cartesian ones."

**M10. The wδ chart used for diffusion** (`src/riemanniangenerativemd/geometry/prepared_coordinates.py`, `normalization_statistics`).
- $Z=(F(x)-\mu)/c$, with per-channel centering and **one** scalar $c=\sqrt{\operatorname{mean}_k\operatorname{Var}F_k}$ over the selected frames. BBA has 379 channels for 78 shape dimensions.
- (Derived here.) Isotropic feature noise has only $78/379=20.6\%$ of its variance tangent to the image. The decoder (a nearest-image projection) must remove the rest.
- (Derived here.) A redundant-coordinate observable that is itself a feature, $h=F_k$, has $\nabla h^\top G^+\nabla h=c^2|P_Te_k|^2\le c^2$. Its loudness is at least its own normalized variance.

**M11. KL of a volume-preserving deformation of a Gaussian to its best Gaussian (derived here).**
If $\varphi$ has $|\det D\varphi|=1$ and $\varphi(X)\sim N(0,A)$, then $H(p_X)=H(N(0,A))$. The moment-matched Gaussian therefore gives
$$\mathrm{KL}(p_X\,\|\,N(\mu_X,C_X))=\tfrac12\log\frac{\det C_X}{\det A}.$$
In $\varphi$ coordinates this is 0. The project's "KL to a Gaussian" is different: it sums one-dimensional histogram KLs along principal axes.

---

## 3. Worked analytical examples

**E1. Projected-chord geodesic on a dimer (derived here).**
- One pair: the wδ chord interpolates $\log r$ linearly, $r(t)=r_0^{1-t}r_1^t$. The aligned Cartesian chord interpolates $r$ linearly.
- Contact formation from 10 to 4 Å: the wδ midpoint is $\sqrt{40}=6.325$ Å, the Cartesian midpoint 7.0 Å.
- A preserved bond (3.8 → 3.8) stays at 3.8 in both.
- With many pairs the geometric targets are mutually inconsistent, so the projection (M2) decides. That is where wδ keeps short distances and Cartesian collapses neighbours (E7, §4.2).

**E2. The banana and river of Diepeveen 2025 (App. F.1; exact; derived here with `banana_toys.py`, 2×10⁶ latent samples for the covariances).**
- Banana: $\varphi(x)=(x_1-x_2^2/9,\,x_2)$ with $A=\operatorname{diag}(1/4,4)$. Squeezed banana: same $\varphi$, $A=\operatorname{diag}(1/81,4)$. River: $\varphi(x)=(x_1-\sin 2x_2,\,x_2)$ with $A=\operatorname{diag}(1/25,3)$.
- Each map has $\det D\varphi=1$, so $p(x)=N(\varphi(x);0,A)$ exactly.
- Raw score: $s(x)=-D\varphi(x)^\top A^{-1}\varphi(x)$, which is cubic in $x_2$ for the banana. Latent score: $-A^{-1}y$, which is linear. Under VP noising in $y$ the latent score stays exactly linear: $-(\alpha_t^2A+\sigma_t^2I)^{-1}y$.
- Endpoints are $\varphi^{-1}(0,\mp3)$. The geodesic is $x(t)=(y_2^2/9,\,y_2)$ (banana) or $(\sin 2y_2,\,y_2)$ (river) with $y_2=-3+6t$.

| toy | raw PC1 share | latent PC1 share | KL(raw ‖ best Gaussian) | max ψ along geodesic | max ψ along straight line | pullback / Euclidean distance |
|---|---:|---:|---:|---:|---:|---|
| single banana | 0.861 | 0.941 | 0.474 nats | 1.125 (endpoints) | 2.000 (midpoint) | 1.500 / 6.000 |
| squeezed banana | 0.908 | 0.997 | 1.747 | 1.125 | **40.500** | 1.500 / 6.000 |
| river | 0.847 | 0.987 | 1.301 | 1.500 | 14.490 | 2.000 / 6.026 |

This is the exact analytic form of the Frank2 slide-6 cartoon. In the Gaussianizing chart the valley is straight, the data are Gaussian (KL 0) and the score is linear. In raw coordinates the straight line between two likely points cuts through a region 40.5 nats less likely (squeezed banana).

**E3. Loudness → window conversions (derived here from M9).**
- $\sigma/\alpha$ at the BBA floor $t=0.01$ is $s=\sqrt{e^{0.001995}-1}=0.0447$. This matches "σ(t_min) = 0.045" in #1025.
- ℓ = 0.003 → $t_{1/2}=0.0130$ (internal-chart closest contact; note 30).
- ℓ = 0.168 → 0.120 (wδ closest contact, §4.8).
- ℓ = 0.0032 → 0.014 (wδ bonds).
- ℓ = 1 → 0.259; ℓ = 2 → 0.327.
- If $t$ were uniform on $[0.01,1]$, the readable share of training levels would be about 0.4% for wδ bonds, 11% for wδ contacts, 0.3% for internal contacts and 25% for internal bonds. This is an illustration only; Sprint 12's $t$ law may differ.

**E4. The contact margin in two charts (derived here).**
- Data: the 1% point of the closest non-neighbour distance is 3.9 Å (lab 2026-11-17 wall fit). The overlap test is 3.5 Å; a severe clash is 1 Å.
- In wδ's chart the overlap margin is $\ln(3.9/3.5)/c=0.108/0.314=0.345$ normalized units, i.e. **7.7 floor noise widths**. The severe-clash margin is $\ln 3.9/c=4.34$ units, i.e. 97 widths.
- In the internal chart the first-order floor blur of the closest contact is 0.36 Å. Noise plus decode gives 0.32 Å rms and **2.3% overlaps** (lab 2026-11-18). That is about the whole 0.4 Å margin.
- wδ's first-order floor blur is 0.049 Å (§4.8).

**E5. Lag-dictionary numbers** (lag sweep, ALDP5).
- Saturation fractions of the 1/10/100 ps steps (note 25 §3, as quoted in the lag sweep): φ 0.43/0.97/1.0; ψ 0.05/0.16/0.66. The measured ψ step at 100 ps is 0.81 of its global width.
- The 1 ps warp "weighs ψ about 19 times and φ about 2.3 times stiffer than their equilibrium spreads".
- Predicted ψ half-erasure above the stiff modes: σ²/α² ≈ 19 / 6 / 1.5 for 1/10/100 ps; φ: ≈ 2.3 / 1.06 / 1.0.
- Step widths: bonds 0.024–0.031 Å at every lag. ψ step 17.9° / 31.7° / 63.4° (equilibrium 50–52° within a basin, 78° overall).

**E6. Gaussianization floor arithmetic** (torsion Gaussianization). A uniform share mixed into the torsion CDF puts $0.01\times60°/360°=17$ molecules per 10,000 into the |φ| < 30° saddle (1.7 for a 0.1% share). It makes the Gaussianized density dip to 24% (1%) or 76% (0.1%) of the Gaussian value there. The measured surplus of the 1% arm over the 0.1% arm (10–19 per 10,000) matches.

**E7. The AK data themselves (derived here, `ak_cartesian_pca.py`, pinned upstream DCD/PSF read with numpy).**
- 102 frames, 3,341 atoms, 214 Cα.
- Adjacent Cα 2.799–4.056 Å, identical to the range stated in `aldp-reference-metric-evaluation.md`. The per-frame mean is 3.825–3.847 Å.
- Rg goes from 16.46 Å (closed, frame 0) to 19.43 Å (open, frame 101). The aligned end-to-end RMSD is 6.822 Å.
- Per-residue total displacement: median 4.25 Å, maximum 18.02 Å.

**E8. Two-state kinetics toy** (theory/19 §9; exact). $P_\tau$ has off-diagonal $\tfrac12(1-e^{-2a\tau})$ and $d_\tau^2(0,1)=4e^{-4a\tau}$. The equilibrium is (½, ½) for every rate $a$.

---

## 4. Key empirical results

### 4.1 Diepeveen 2024 (paper)

| Item | AK (214 Cα, 102 frames) | nsp13 (590 Cα, 200 frames) |
|---|---|---|
| End-to-end w-geodesic | "much smaller than" 3.85 Å on average; RMSD peak ≈ 2.5 Å at t ≈ 0.55 (read from figure); about 21/214 residues above 3.85 Å at t = 0.5, maximum ≈ 7.7 Å (read from figure) | fails: one geodesic "clearly unable"; RMSD ≈ 3.5–6.5 Å (read from figure) |
| Midpoint cost | 4 iterations, 245 ms ± 11.4 ms | 14 iterations, 10.1 s ± 43.3 ms |
| Barycentre | 3 iterations, 425 ms ± 13.8 ms | 4 iterations, 7.08 s ± 289 ms |
| Low rank (85% rule) | rank 1, "about 85 %"; error "about 1 Å" | rank 7 ("at least"); "near-perfect" |
| exp of the reconstruction | 657 ms ± 19.6 ms | 25.2 s ± 164 ms |
| Curvature (App. D.2) | within about ±0.05 relative (read from figure) | up to about +0.12 at t = 1 for rank 7 (read from figure) |

### 4.2 The project's re-examination (all dated 2026-10-19)

| Panel | Cartesian chord | original wδ | localized wδ | Source |
|---|---:|---:|---:|---|
| ALDP5, 18 points, mean RMSD Å | **0.22398** | 0.24721 | 0.24318 | #513 |
| ALDP5 local-distance RMSE Å | 0.05168 | **0.03244** | 0.03525 | #513 |
| ALDP5 torsion error ° | **27.414** | 31.056 | 30.650 | #513 |
| AK, 3 points, RMSD Å | **1.76319** | 2.02770 | 2.02481 | #513 |
| AK local-distance RMSE Å | 0.14412 | 0.07676 | **0.07674** | #513 |
| AK RMSD Å (frames 25/50/75 at 25/101, 50/101, 75/101) | **1.78400** | 2.05287 | 2.04998 | aldp-reference |
| AK adjacent RMSE Å | 0.14446 | 0.07671 | 0.07669 | aldp-reference |
| AK route RMSD (monotone matched) Å | 1.45566 | 1.47641 | 1.47532 | aldp-reference |
| ALDP5 64 ps φ/ψ error ° | **19.23/54.70** | 29.71/66.61 | 27.95/66.35 | aldp-reference |
| ALDP5 64 ps shortest bond Å | 0.9152 | 1.3000 | 1.2857 | aldp-reference |

- **Optimizer ambiguity.** Competing starts differ by up to 0.742 Å within one metric (aldp-reference) and up to 3.00 Å on chignolin/BBA (archive authentic-MD).
- **Real chignolin/BBA panels.** Cartesian is better in five of six groups (e.g. BBA 12.8 ns: wδ 5.356 Å against Cartesian 4.971 Å), but its nearest-neighbour spacing collapses to 0.294/0.087 Å.
- **Conditioning.** Original wδ condition numbers on ALDP5 (512 frames): p50/p99/max 646.71/54,801.73/281,577.57. Localized: 319.88/657.59/695.66.

### 4.3 Missing baselines, computed here (derived here; unofficial)

| Check | Result | Comparison |
|---|---|---|
| AK aligned Cartesian PCA (generalized Procrustes, 214 Cα) | cumulative variance r=1: **0.8934**, r=2: 0.9531, r=3: 0.9673, r=5: 0.9763, r=7: 0.9808 | ProteinAtlas wδ tangent PCA: 0.8927 / 0.9530 / – / 0.9763; paper: "about 85 %" |
| AK rank-r reconstruction RMSD (mean/median/max Å) | r=1: **0.747**/0.743/1.223; r=2: 0.501/0.496/0.903; r=5: 0.360/0.365/0.462 | ProteinAtlas wδ: 0.748/0.742/1.216; 0.502/0.495/0.902; 0.360/0.366/0.462; paper "about 1 Å" |
| nsp13 aligned Cartesian PCA (590 Cα; NMA cap carbon excluded) | r=1: 0.3946, RMSD 2.298 Å; r=7: **0.841**, 1.231 Å; r=8: 0.8562, 1.175 Å; first rank > 0.85 is 8 | ProteinAtlas wδ: 0.3943/2.298; 0.8408/1.232; 0.8560/1.175; paper: rank 7 |
| AK Cartesian chord vs frames (proper Kabsch) | frames 25/50/75: 1.488/2.113/1.751 Å (mean **1.784**, reproducing aldp-reference's 1.78400); full progression maximum 2.188 Å at frame 53, interior mean 1.499 Å | paper wδ curve peak ≈ 2.5 Å (read from figure) |
| AK chord per-residue deviation at frame 50 | median 1.37, 95th percentile 4.26, maximum 6.40 Å; 16/214 above 3.85 Å | paper wδ ≈ 21/214, maximum ≈ 7.7 Å (read from figure) |
| AK chord adjacent-Cα RMSE (25/50/75) | 0.130/0.164/0.139 Å (mean 0.1445); chord minimum adjacent 3.02–3.04 Å | wδ 0.0767 Å (#513) |
| Straightness of the AK path (`ak_feature_straightness.py`) | Cartesian: PC1 0.8931, maximum time-aligned chord deviation 0.321 of chord length, mean 0.215, path/chord 5.66. wδ feature space: PC1 **0.861**, maximum 0.339, mean 0.237, path/chord 7.63 | the log det G term changes nothing at n = 214 |

Reading: the "rank-1 straightening" is reproduced by plain Euclidean shape PCA to within 0.001 in variance fraction and 0.001 Å in RMSD. The flat log-distance feature space does not make the AK path straighter. All of wδ's advantage is in local distances.

### 4.4 Diepeveen 2025 (paper)

Table 1 reports mean (std) for: our method / NF / anisotropic NF / isometric NF.

| Dataset | Geodesic error | Variation error |
|---|---|---|
| Banana | 0.0315 / 0.0406 / 0.0431 / 0.0817 | 0.0625 / 0.0638 / 0.0639 / 0.0639 |
| Squeezed banana | 0.0180 / 0.0524 / 0.0505 / 0.1967 | 0.0631 / 0.0663 / 0.0661 / 0.0669 |
| River | 0.1691 / 0.2369 / 0.2561 / 0.3859 | 0.0763 / 0.1064 / 0.1113 / **0.0636** (isometric NF lower) |

- "Anisotropy … without enforcing isometry … offers no significant improvement"; "isometric without anisotropy … underfitting".
- RAE results:
  - Hemisphere(5,20): five dimensions found. Sinusoid(5,20): about 97% of variance in 6 dimensions and over 99% with 7.
  - Gaussian blobs, d′ = 20/50/100: over 99% of variance in 22/51/101 dimensions.
  - MNIST: ε = 0.1 → 176 dimensions (ID-DIFF local intrinsic dimension 152); ε = 0.05 → 208; ε = 0.01 → 271.

### 4.5 The Gaussianization lever (ALDP5, CPU pilots, 2026-11-05; two seeds, 20,000 updates, 4 × 256 MLP)

| Coordinates | spread ratio | total KL to Gaussian | max bimodality | JS @100 | JS @20,000 | αL-saddle per 10⁴ @20,000 (MD 4–6) |
|---|---:|---:|---:|---:|---:|---:|
| flat slice | 26 | 0.96 | 0.80 | 0.117 | **0.0203** | 11 |
| warp 1 ps | 3.4 | 0.96 | 0.73 | 0.127 | 0.0236 | 6 |
| warp 10 ps | 1.8 | 0.20 | 0.44 | 0.049 | 0.0227 | 10 |
| warp 100 ps | 1.3 | **0.14** | **0.37** | **0.027** | 0.0230 | 30 |
| spring γ = 30 / 2 | 312 / 460 | 1.41 / 0.98 | 0.81 / 0.55 | 0.133 / 0.163 | 0.0212 / 0.0212 | 10 / 8 |
| internal + Gaussianized torsions (floor 0.1% / 1%) | – | torsion features 0.005, 0.003 / 0.008, 0.004 | – | 0.042 / 0.043 | 0.029 / 0.029 | 7.8 / 21.5 |
| internal, scaled torsions (control) | – | φ 0.31, ψ 0.69 | – | 0.255 | 0.022 | 11.0 |

Floors: 0.019/0.023 (two halves / second MD). At 100 updates the 100 ps warp is at 97% validity against 10% for flat.

- **BBA, bead model** (2026-11-08): warps lead on slow coordinates (TIC JS 0.025–0.027 against 0.046).
- **BBA, Sprint 12 network** at 190,350 updates, no distance inputs, one seed:
  - 1-frame lag: bond 0.48 Å, size 0.249 Å, clashes 1.7%.
  - 100-frame lag: bond 0.64 Å, size 0.249 Å, clashes 2.5%.
  - Their force fields are the worst in the study (the 100-frame warp "diverged" at 10⁻⁴).

### 4.6 wδ as a Euclidean feature map

| Date | System, budget | wδ result | Context | Source |
|---|---|---|---|---|
| 2026-10-26 | ALDP5 (virtual bead), 3 seeds, 200k | JS 0.0388/0.0207/0.0205/**0.0199** at 1k/5k/20k/200k; bond W1/width 0.042→0.018; angle 0.070→0.032 (about 2× floor) | flat low floor 0.0207 | feature-space-evaluation |
| PR #886 (2026-10-30→11-03) | ALDP5, conservative transformer, 200k | iid bond width/MD 0.954–1.002; simulated 1.187–1.328 | flat simulated 2.33–2.86 | supervisor-metric-comparison |
| #895 (2026-11-01→14) | BBA, 200k × 128, 2 seeds, 100k | TIC JS 0.0889, PMF 1.116, bond 0.1688 Å, angle 4.574°, 198,879/200,000 returned | flat 0.0529/0.560/0.6371/11.910 | S11 closeout |
| 2026-11-09 | ALDP5 first chunk 48k | bond 0.000434, angle 0.1119, Rg 0.000702, JS 0.007627; simulation excluded (free virtual bead) | Cartesian 0.004558 | matched-results |
| 2026-11-09 | BBA first chunk 190,350 | bond 0.113073, angle 3.2382, **Rg 0.085286**, JS 0.03185, 99,346/100,000, **0 severe collisions** | Cartesian 682, internal 1,186, springs 995, whitening 3,482 per 10⁵ | matched-results; candidate dossiers |
| 2026-11-09 | BBA first chunk simulation (16 walkers × 2 ps) | sim–MD bond 0.1031–0.1177 Å; Rg 0.8279–1.967 Å | – | candidates/wdelta.md |
| 2026-11-09 | #985 + distance inputs | bond 0.1108→0.02692, angle 3.191→1.727, size 0.07759→0.06150, failures 654→131 | generated-start sim JS 0.4617→0.4815 | PR #985 |
| 2026-11-10 | ALDP5 physical only (no bead) | bond 0.001984, angle 0.3213, size 0.001027, JS 0.01152; 49,980/50,000 | 4.57× worse bonds than virtual | physical-wdelta |
| 2026-11-11 | BBA resolution test | bond 1.25, angle 4.1, torsion 7.2, Rg 52, TIC 5.8 (× σ(t_min)) | internal: bond 22, Rg 3.0 | bba-local-geometry-preconditioning |

### 4.7 Registered budget (190,350 updates; 100,000 molecules; real-budget-study, 2026-11-15)

| Model | Bond Å | Angle ° | Size Å | Contacts | Population | Clashes (<1 Å, ≥3 apart) |
|---|---|---|---|---|---|---|
| **wδ** s0/s1 | 0.027/0.034 | 1.73/2.12 | **0.062/0.072** | **0.0054**/0.0067 | 0.0171/0.0206 | **0%/0%** |
| Internal + 2 loud modes | 0.00038/0.00033 | 0.20/0.19 | 0.117/0.091 | 0.0081/0.0071 | 0.0125/0.0130 | 0.60%/0.66% |
| Cartesian + distances | 0.0078/0.0093 | 1.58/1.49 | 0.071/0.077 | 0.0061/0.0067 | 0.0129/0.0127 | 0.30%/0.23% |
| Covariance-matched base | 0.0053/0.0065 | 1.36/1.30 | 0.073/0.077 | 0.0060/0.0064 | 0.0123/0.0126 | 0.35%/0.18% |
| Native ScoreMD | 0.042/0.042 | 1.58/1.74 | 0.157/0.532 | 0.0116/0.0221 | 0.0209/0.0290 | 0.06%/0.04% |

- **Decoded:** wδ 99,869/99,874.
- **Effect rule (loud vs wδ):** bond ×86, angle ×9.8, population ×1.5 favour loud; size (0.104 versus 0.067 Å) and contacts favour wδ. The seed-mean contact error is wδ 0.0061, covariance base 0.0062, Cartesian 0.0064 (derived here; within seed spread).
- **Force fields** (256 + 256 walkers, 100 ps, 325 K, pooled 50–100 ps): wδ at t = 0.02/0.01 has bond **0.21/0.72 Å**, angle **17.0/18.0°**, size 1.77/1.99 Å, with 512/512 walkers kept. Internal models: bond 0.003–0.004 Å, angle 1.9–2.9°, size 0.78–1.14 Å. The data panel scores 0.0046 Å, 1.0° and 0.14 Å.
- **PMF on the ScoreMD paper metric** (open PR #1138, 100,000 molecules, kT²):

  | Model | PMF (kT²) |
  |---|---|
  | wδ | **0.161/0.198** |
  | native ScoreMD | 0.202/0.315 |
  | Cartesian | 0.116/0.113 |
  | ordered internal coordinates (full schedule) | 0.097 |
  | data–data floor | 0.080 ± 0.001 |

  The floor scales roughly as count × floor ≈ 8,000.

### 4.8 Readable windows: published values and the missing wδ column

First-order $t_{1/2}$ on BBA (linear-Gaussian rule). The Cartesian, internal and loud columns come from `lab/2026-11-18-range-order-mechanisms/README.md`. The wδ column and my Cartesian recomputation are derived here (`wdelta_windows_v2.py`):
- same definitions as `bba_charts.py`;
- 1,200 held-out and 50,000 training frames from `data/deshawresearch-bba-ca28`, read-only;
- $c=0.3138$ (0.3129 when fitted on 4,096 frames);
- tangent rank 78 on every frame.

My Cartesian recomputation reproduces the lab column to rounding.

| BBA observable | Cartesian (lab / mine) | Internal | +2 loud | +8 at loudness 15 | **wδ (derived)** |
|---|---|---:|---:|---:|---:|
| Bond lengths | 0.000 / 0.000 | 0.26 | 0.26 | 0.26 | **0.014** (ℓ = 0.0032) |
| Bond angles | – / 0.019 | – | – | – | 0.115 |
| 1–3 distances | – / 0.015 | – | – | – | 0.130 |
| **Closest non-neighbour** | 0.012 / 0.012 | **0.013** (ℓ = 0.003) | 0.025 | 0.068 | **0.120** (ℓ = 0.168) |
| Torsions (cos, sin) | 0.06 / 0.064 | 0.33 | 0.34 | 0.39 | 0.233 |
| Pairs 3 apart | 0.05 / 0.053 | 0.30 | 0.31 | 0.37 | 0.305 |
| Pairs 4–6 apart | – / 0.088 | – | – | – | 0.389 |
| Pairs 7–10 apart | 0.14 / 0.139 | 0.22 | 0.27 | 0.41 | 0.465 |
| Pairs ≥ 11 apart | 0.22 / 0.224 | 0.16 | 0.29 | 0.46 | 0.543 |
| End-to-end | 0.29 / 0.286 | 0.14 | 0.24 | 0.47 | 0.537 |
| Radius of gyration | 0.38 / 0.385 | 0.19 | 0.44 | 0.48 | **0.689** |

- **First-order floor blur at t = 0.01:** closest contact 0.049 Å for wδ, 0.36 Å for internal (lab), 0.395 Å for Cartesian (mine). wδ bonds blur by 0.046 Å, against a bond thermal width of about 0.057 Å (log-bond standard deviation 0.0150).
- **Consistency check:** my wδ bond loudness 0.0032 equals (σ\*)² = (1.25 × 0.045)² = 0.0032 from #1025.

---

## 5. Why it looked promising, why it failed, what was learned

**Why "straightening" looked promising.**
- Diepeveen's AK figure is visually striking, and the paper's framing ("geodesics … approximately recover corresponding molecular dynamics trajectories") invites the reading "geometry ≈ dynamics".
- The exposé built the thesis on it: a forward process along geodesics would use "physically meaningful interpolants".
- The rank-1 result suggested that MD lives on a low-dimensional "submanifold spanned by geodesics" (Frank2 slide 4). That in turn suggested that in normal coordinates the score is nearly linear (slide 6).

**What the evidence actually supports (derived facts).**
1. **"wδ-geodesic" means projected log-distance chord** (M2), not an intrinsic geodesic, and certainly not an energy-minimizing path. There is no theorem connecting it to MD (#522; numerics assessment). Equilibrium geometry cannot fix kinetics (M6).
2. **The test case is easy by construction.** DIMS drives the system toward the target along a progress variable, so the path is directed and nearly one-dimensional. Cartesian PCA already puts 89.3% of the variance in PC1 (derived here). On unbiased chignolin/BBA windows and on ALDP5, interpolation errors are large and Cartesian is better on average (#513; archive authentic-MD).
3. **wδ's genuine, reproducible advantage is local.** Short distances are preserved: adjacent-Cα RMSE is halved on AK (0.077 versus 0.144 Å), and there are no collapsed neighbours (Cartesian reaches 0.087 Å on BBA). This is Remark 5.2 and §5's excluded-volume motivation, i.e. the log barrier. It is *not* better global path fidelity.
4. **The low-rank result is a property of the data,** not of the metric (derived here, §4.3). By design, the paper's PCA uses ℓ² inner products of log vectors (Eq. 24). On AK those logs are almost Euclidean displacements: curvature effects are about 5% (D.2).

**What the straightening intuition got right, later.**
- The slide-6 mechanism ("in geometry-aligned coordinates the score is nearly linear → much easier function class") is exactly what the 100 ps warp delivered on ALDP5: KL 0.14, JS 0.027 at 100 updates. The marginal-Gaussianization control isolated it: JS 0.042 against 0.255.
- Diepeveen 2025 is the published version: a learned diffeomorphism to a Gaussian, closed-form straight-line geodesics, likelihood convex along geodesics (Thm 1).
- So the lever is *Gaussianization by a learned flow*, not a hand-designed physical metric.

**Why the learned lever is not the answer either (measured).**
- The 100 ps warp plateaus, and flat overtakes after about 2,000 updates (0.0203 versus 0.0230).
- It over-populates the rare αL saddle (30 versus 4–6 per 10⁴). This is the unimodality limit Diepeveen 2025 states, here caused by fitting a Gaussian step model to hopping steps. Marginal Gaussianization alone does not smooth the barrier (0.1% arm: 7.8).
- Marginal Gaussianization learns the joint (φ, ψ) slowly and finishes at 0.029.
- On BBA the warps help slow coordinates in the bead model but lose bonds (0.48–0.64 Å) and produce the worst force fields on the Sprint 12 network.

**Mapping Diepeveen 2025 onto the range-and-order language** (my reading, [H]). With an isometric $\varphi$, noise in $y=\varphi(x)$ keeps Cartesian-like scales: order, but no range for bonds. Whitening, $A^{-1/2}\varphi$, gives range without order. Diepeveen's distance $\|A^{-1}\Delta\varphi\|$ shrinks high-variance directions, which as a noising chart would be anti-order. The 100 ps warp is an isotropic-latent flow (equilibrium spreads 1.0–1.2c), i.e. range without order plus Gaussianization. Nobody has tried "Gaussianize the slow modes, keep them loud, scale stiff modes to thermal width".

**wδ's afterlife: what the measurements say.**
- **Strengths.** Every BBA panel has zero severe clashes. At the registered budget wδ has the best size and the lowest seed-mean contact error. Its PMF beats native ScoreMD.
- **Weaknesses.** Local geometry: bonds 86× and angles 9.8× worse than ordered internal coordinates, and worse than Cartesian with distance inputs. Population error is 1.5× worse. The force fields fail: angles 17–18°, bonds 0.21–0.72 Å.
- The "Another candidate leads" branch was therefore not taken (2026-11-15).

**[H] Why: the windows explain most of the profile.**
- With one global RMS scale, log-bond fluctuations (std 0.015) are 21× smaller than the RMS (0.314). Bonds are half erased at t ≈ 0.014, essentially at the 0.01 floor. #1025 measured the same thing: bonds resolved at 1.25 σ(t_min).
- Log distances preserve Cartesian's fine-to-coarse order but lift everything else into range: Rg is last at 0.689, contacts sit at 0.120.
- So wδ has *order with marginal range*. Ordered internal coordinates have range plus a two-mode loud block. The closest-contact window is where they differ most: 0.120 versus 0.013.
- Windows do not explain everything (note 27 §6: readability is necessary, not sufficient). wδ's angle window (0.115) is far above Cartesian's (0.019), yet its generated angles are worse (1.73–2.12° against 1.49–1.58°). Distance inputs, the decoder and the 379→78 redundancy (79% of injected noise is off-image) also matter.

**[H] The two walls.**
- Note 30 §7 lists three ways to supply the missing excluded-volume wall: "by the hard-core joint rebuild …, by an analytic base energy, or by a channel whose own window covers contacts".
- wδ provides both a barrier (collisions are at infinite feature distance, so neither Gaussian feature noise nor the nearest-image decoder can produce one at finite cost) and a channel (log contact distances with first-order t½ ≈ 0.12).
- That is consistent with its 0/100,000 severe clashes at every budget, compared with 682–3,482 per 10⁵ for the other first-chunk BBA maps.
- Era 1's two barriers (M3) thus split cleanly. The planarity barrier killed intrinsic wδ on ALDP5. The collision barrier is exactly the physics that ordered internal coordinates cannot learn.
- **Caveats.** The barrier lives partly in the *decoder*, which a force field does not use. wδ's own force fields drift badly. Its simulated overlap share is not reported.

**Durable lessons.**
- Distinguish separation interpolation, geodesic and MD path.
- Always draw the Cartesian baseline: the paper never showed it, and it wins on RMSD.
- Directed transitions flatter interpolation and low-rank claims.
- Low rank ≠ metric quality.
- Gaussianization and stiffness removal are separate levers.
- For diffusion, *when* each property is erased (range and order) matters more than how "physical" the metric looks.
- Log-distance channels are the natural carrier of contact information.

---

## 6. Visualization opportunities

1. **"The famous figure, with its missing baseline."**
   - *On screen:* AK closed→open (closed Rg 16.46 Å → open 19.43 Å); three rows (MD, wδ separation interpolation, Cartesian chord) at t = 0.25/0.5/0.75; RMSD progressions overlaid.
   - *Data:* wδ curve read from Fig. 3a (peak ≈ 2.5 Å), or #513/aldp-reference 3-point means 2.03–2.05; Cartesian full curve computed here (maximum 2.188 Å at frame 53, interior mean 1.499; `ak_cartesian_chord_rmsd.npy`).
   - *Computed:* Cartesian is precomputable (pinned DCD); wδ needs the Eq. 5 solver (upstream `s_geodesic`) or the published three points.
   - *Pitfalls:* the curve parameter is not time (DIMS); 3 dependent points; never call the wδ curve a geodesic.
2. **"Per-residue deviation scatter, both methods."**
   - *On screen:* Fig. 3c-style scatter of deviation against total displacement at t = 0.5, with the 3.85 Å line. wδ (read from figure: ≈21/214 above, maximum ≈7.7 Å) against the Cartesian chord (16/214 above, maximum 6.40 Å, median 1.37).
   - *Pitfall:* figure-read counts are approximate (±2).
3. **"Straight in which space?"**
   - *On screen:* a curved surface $F(\mathcal M)$ in a flat feature space; the chord between two image points; perpendicular drops back to the surface (M2 identity); the Cartesian chord drawn alongside in shape space. Then the AK numbers: PC1 0.893 (Cartesian) against 0.861 (features); maximum chord deviation 0.321 against 0.339.
   - *Computed:* analytic toy plus precomputed AK statistics.
   - *Pitfall:* the real image is 636-dimensional in a 22,792-dimensional space; the drawing is a cartoon.
4. **"Rank-1 is the data, not the metric."** Overlaid scree curves for AK and nsp13: Cartesian PCA (derived here) against wδ tangent PCA (ProteinAtlas) against the paper's 85% line. The curves coincide (0.8934/0.8927; nsp13 rank 7: 0.841/0.8408). *Pitfall:* the ProteinAtlas numbers are not reproduced by its bootstrap; mine are unofficial; the paper reports ≈85%.
5. **"Directed vs free."** Interpolation error against window length for unbiased MD: chignolin/BBA 0.8/3.2/12.8 ns (BBA wδ 2.312/2.854/5.356 against Cartesian 2.257/2.867/4.971 Å; archive) next to the DIMS AK result. A schematic of DIMS ratcheting toward the target.
6. **"What wδ really buys: local distances."**
   - *On screen:* adjacent-Cα distance traces along interpolants (Cartesian chord minimum 3.02 Å on AK; collapses to 0.087 Å on BBA and 0.294 Å on chignolin; ALDP5 bond to 0.9152 Å) against wδ (3.2–4.4 Å). Bar chart of adjacent RMSE 0.144 against 0.077 Å.
   - *Pitfall:* the dip at Phe86–Pro87 (cis peptide, 2.80–3.18 Å) is in the data, not an artefact.
7. **"Linear in log-distance."** Dimer slider: geometric against linear interpolation of a forming contact (10 → 4 Å; midpoints 6.325 against 7.0); then a triangle, where three geometric targets conflict and the projection resolves them.
8. **"The straightening cartoon, made exact."** Recreate Frank2 slide 6 with Diepeveen 2025's banana and river (E2):
   - curved valley against straightened valley;
   - raw cubic score field against linear latent score;
   - ψ along straight line (2.0 / 40.5 / 14.49) against geodesic (≤1.125 / 1.125 / 1.5);
   - KL 0.474 / 1.747 / 1.301 against 0.
   An interactive version lets the viewer drag endpoints. Fully analytic.
9. **"Gaussianize the slow modes."** ALDP5 torsion histograms in flat / 1 ps / 100 ps / Gaussianized coordinates, with KL bars (0.96, 0.96, 0.14, ≈0.005), next to the 100-update JS race (0.117, 0.127, 0.027, 0.042; control 0.255). *Pitfall:* the sweep KL sums 1-D principal-axis KLs; it is not joint.
10. **"A Gaussian has a linear score."** 1-D animation: a bimodal ψ density and its score against the Gaussianized version and its straight-line score. A tiny regressor fits the second in a few steps and the first slowly. Analytic; use the monotone CDF map.
11. **"Unimodal assumption meets a rare barrier."** Counts in the αL saddle per 10,000 over training: MD 4–6; flat 184 → 11; 100 ps warp 77 → 30; Gaussianized 0.1% floor 7–11; 1% floor 21–28 (construction share 17). This illustrates Diepeveen 2025's stated scope.
12. **"Erasure ladders."** Per-chart vertical ladders of $t_{1/2}$ for each observable (table §4.8): Cartesian, internal, +2 loud, +8 loud, wδ. Highlight bonds and closest contact. wδ's ladder resembles Cartesian's order lifted into range, except bonds (0.014). *Computed:* the wδ column was precomputed here (first-order); posterior-measured windows are still missing. *Pitfall:* first-order can err in both directions (note 27 §3).
13. **"Mirror images."** Two charts, two blind spots. Internal coordinates see bonds (0.26) but not contacts (0.013); wδ sees contacts (0.120) but not bonds (0.014). Overlay the outcomes: bond ×86, contacts and clashes in wδ's favour (0% against 0.60–0.66%).
14. **"Two walls."** The closest-contact margin (3.9 → 3.5 Å) against the floor blur: internal 0.36 Å (2.3% overlaps after noise and decode) against wδ 0.049 Å. Then wδ's log barrier: the feature coordinate runs to −∞ as r → 0, 97 noise widths to a 1 Å clash. Then generation clash counts (0 against 682–3,482 per 10⁵). *Pitfall:* this does not carry over to simulation; wδ force fields have 17–18° angles.
15. **"The barrier that killed, the barrier that may save."** Narrative split of Diepeveen §5's two barriers. Planarity (ALDP5 near-planar; Era 1 failure; ε⁻⁴ conditioning, r1) against collisions (excluded volume missing from ordered internal coordinates).
16. **"wδ's afterlife scoreboard."** Timeline or radar of BBA wδ across #895, first chunk, #985 and the registered budget, against ordered internal coordinates and ScoreMD. Axes: bond, angle, size, contacts, population, clashes, PMF (0.161/0.198 against 0.202/0.315), simulated angle (17–18° against 2–3°). *Pitfall:* different budgets, inputs, readouts and floors.
17. **"Equilibrium cannot know time."** Two harmonic particles, one with 100× friction: identical histograms, different motion. Plus the two-state kinetic distance $4e^{-4a\tau}$. Exact toy (M6).
18. **"Normal coordinates as the flat analogue."** Sphere toy: log map at the barycentre, tangent-plane PCA, curvature sag. Then AK: the tangent cloud is a line in both the wδ and the Euclidean chart, because the curvature correction is about 5% (D.2).

---

## 7. Open questions, caveats, contradictions, superseded readings

- **Direction of the AK transition.** The paper, aldp-reference and the dataset title say closed→open; the exposé (2026-07-02) and README say "open-to-closed".
- **"Geodesic."** The paper's "wδ-geodesic" is the Eq. 5 separation interpolation. The project (#513/#522, 2026-10-19) insists on calling it a separation interpolation, distinct from geodesic shooting.
- **Rank-1 variance.** Paper "about 85 %"; ProteinAtlas 0.8927; Cartesian PCA 0.8934 (derived here); flat feature-space PC1 0.861 (derived here). nsp13 at rank 7: 0.8408 (ProteinAtlas), 0.841 (mine). By the strict > 0.85 rule both need rank 8; the paper says 7.
- **Same-day AK disagreement** (2026-10-19). #513 reports 2.02770/1.76319 Å; aldp-reference reports 2.05287/1.78400. My chord reproduces 1.78400 exactly, so #513 used a slightly different readout.
- **nsp13 bead count.** The topology has 591 "CA" atoms including the C-terminal NMA cap carbon; the paper and ProteinAtlas use 590. Including it changes nothing material.
- **Diepeveen 2025 Table 1 caption** claims "best in all metrics", but the river variation error favours the isometric NF (0.0636 against 0.0763). Theory/23 cites the paper as "Diepeveen et al. 2024"; REFERENCES and Related_Work say 2025 (arXiv v1 Oct 2024, v2 May 2025).
- **Superseded readings.**
  - Lag sweep's "synchronized erasure" → Gaussianization (same day, 2026-11-05).
  - Exposé's "intrinsic low dimensionality … under the gwδ geometry" → the rank-1 result is data-, not metric-specific (derived here, unofficial).
  - README's "Tangent-space PCA gives dramatic dimensionality reduction" stays as motivation but should carry that qualification.
- **wδ first-chunk size.** 0.085286 (matched-results) and 0.07759 (#985 control) describe the same 654-failure model under different readouts.
- **PMF 0.161/0.198** comes from an *open* PR (#1138). It is count-dependent (floor 0.080 at 100,000) and not comparable with the paper's 0.034/0.234 at 1,300,156 samples.
- **Never measured.**
  - wδ readable windows (posterior/best-estimator), which Q4 needs. My column is a first-order screen.
  - wδ simulated overlap share.
  - Whether wδ's zero clashes come from the decoder's barrier or from learned contact windows. Test: noise real molecules at t = 0.01 in wδ's chart and decode. Prediction [H]: rms contact blur ≈ 0.05 Å and ≈ 0% overlaps, against 0.32 Å and 2.3% for internal.
  - Low-rank and barycentre checks on unbiased ensembles (#513 extension).
  - A Cartesian-PCA baseline in the project's own pipeline.
- **Unexplained.** Why are wδ's generated angles worse than Cartesian+distances despite a larger window? Why do wδ force fields reach 17–18° angle errors? Is the redundant-chart force contract (stage-0 item 5) involved, or the near-floor bond window?
- **[H] Design questions.**
  - Would a block of log non-neighbour distances (wδ-style contact channels), appended to ordered internal coordinates, supply the wall? Note 30 §4 warns that each redundant channel adds constraint directions; Sprint 11 found "redundant embeddings cost globally".
  - Would an anisotropic-base, near-isometric flow on the slow modes (Diepeveen 2025 design) combine Gaussianization with order?
  - Joint (φ, ψ) Gaussianization is the project's own stated next test (status).
- **Provenance limits.**
  - The ProteinAtlas reports were not reproduced by its bootstrap (README 2026-10-06).
  - The local upstream checkout has modified notebook and `pointcloud.py` files; I read only the pinned committed notebook (`git show HEAD:`) and the unmodified data files.
  - Earlier "authentic" chignolin/BBA files were ScoreMD's model-generated dummy release (2026-10-19 correction). The real-MD panel above is the later authenticated one.

---

## 8. Sources read

- **Papers.**
  - Diepeveen et al. 2024: `/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative/papers/2023/riemannian_geometry_for_efficient_analysis_of_protein_dynamics_data.pdf`. Full text, §§1–8 and App. A–D; Figs 1–10 viewed.
  - Diepeveen et al. 2025: `.../papers/2025/diepeveen2025_score_based_pullback_riemannian_geometry.pdf`. §§1–7, App. A, E, F.1.
- **Slides.** `rg-main/docs/expose.pdf` (§1, §3.1–3.4). `ThesisDiscussion2.pptx`, slides 2–3 and 12–23, and `ThesisDiscussionFrank2.pptx`, slides 4–6 and 30–31, rendered from copies in the scratchpad.
- **Project front matter.** `README.md` (idea, history, positioning, "What makes the manifold trustworthy"). `docs/Related_Work.md` (intro, §C neighbours, §D). `docs/status.md` (range and order; metric/noising; Sprint 11). `docs/sprints/sprint10/closeout-520.md`.
- **Investigations.**
  - Full: `wdelta-qualification-522.md`, `metric-qualification-513.md`, `aldp-reference-metric-evaluation.md`, `learned-warp-lag-sweep.md`, `spring-soft-scale-sweep.md`, `torsion-gaussianization.md`.
  - Partial: `metric-numerics-scaling-assessment.md` (through "What went wrong"); `feature-space-evaluation.md` (summary and tables); `sprint11-pullback-campaign-closeout.md`; `bba-local-geometry-preconditioning.md` §1; `bead-candidates-comparable.md` (summary); `supervisor-metric-comparison.md` (width table).
  - Archive: `investigations/authentic-md-metric-evaluation.md`.
- **Sprint 12.** `candidates/wdelta.md`, `physical-wdelta.md`, `matched-results.md`, `real-budget-study.md` (all full). `candidates/theory-and-evidence.md` (protocol); severe-collision lines of every candidate dossier.
- **Theory.**
  - `01-metric.md` (full), `30-loud-blocks-in-redundant-charts.md` (full).
  - `27-readable-windows-and-noise-order.md` §§1–3 and 5; `22-flat-pullback-obstruction.md` §0; `23-curved-pullback-targets.md` (header and §4.1); `19-analytical-molecular-geometry.md` §§8–9; `docs/design/learned-stiffness-warp.md`.
- **Lab.**
  - `2026-11-17-loud-mode-joint-rebuild-excluded-volume/README.md`, `2026-11-18-range-order-mechanisms/README.md` and `bba_charts.py`.
  - `2026-11-16-bba-force-field-diagnosis`, `2026-11-17-bba-simulation-fitted-wall`, `2026-11-17-bba-wall-fit-size-term` (results).
  - Source: `src/riemanniangenerativemd/geometry/prepared_coordinates.py` (wδ map and normalization).
- **Extension.** `/Users/I745505/private/thesis_extension/README.md`, `ProteinAtlas/README.md`, `ProteinAtlas/results/{adenylate-kinase,nsp13}/c-alpha/pga-single-chart/report.md`, `atlas/src/atlasgeo/manifolds/shape_space.py` (header).
- **Upstream checkout (read-only).** `/Users/I745505/private/thesis/pocs/manifold-scoremd/diepeveen2024` at HEAD `d7dec930…`: AK `dims0001_fit-core.dcd` and `adk4ake.psf`; nsp13 `MDtraj_sarscov_2.dcd` and PDB; notebook via `git show HEAD:`.
- **Data for the window screen (read-only, mmap).** `/Users/I745505/private/thesis/pocs/manifold-scoremd/riemannian-generative/data/deshawresearch-bba-ca28/{train,heldout}.npy`.
- **GitHub.**
  - Issues #513 (body), #520, #522, #523.
  - PRs #753, #757, #895, #936, #985 (body), #1000, #1025, #1064, #1071, #1072, #1088, #1104, #1105, #1107, #1138 (body).
- **My checks** (scratchpad `g2/checks/`): `wdelta_windows.py`, `wdelta_windows_v2.py`, `ak_cartesian_pca.py` (+ `_lib`), `nsp13_cartesian_pca{,_590}.py`, `ak_feature_straightness.py`, `banana_toys.py`, `ak_cartesian_chord_rmsd.npy`.
