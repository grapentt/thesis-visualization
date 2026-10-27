"""Numerical checks for docs/bundle-generative-models.md.

1. Forgetting the extra beads B is a Riemannian submersion from the shape space of
   A ∪ B onto the shape space of A (mass metrics), for any masses of B. Its horizontal
   vectors are "A moves with zero linear and angular momentum, B is at rest in the
   lab": the parallel transport of the associated bundle P_A ×_SO(3) ℝ^{3k}.
2. A small torsion step followed by Kabsch alignment to the previous conformation is,
   to first order, the horizontal lift of the mechanical connection (error O(ε²)).

Run: python3 coupling_checks.py
"""
import numpy as np

rng = np.random.default_rng(7)


def cross_matrix(p):
    """Rows: the linear maps η ↦ η × p, stacked for all points p (shape (3n, 3))."""
    out = []
    for x, y, z in p:
        out.append(np.array([[0, z, -y], [-z, 0, x], [y, -x, 0]], dtype=float))
    return np.vstack(out)


def rigid_basis(z):
    """Columns span the infinitesimal rigid motions at configuration z (n × 3): a + η × (z_i − c)."""
    n = len(z)
    c = z.mean(0)
    trans = np.tile(np.eye(3), (n, 1))
    rot = cross_matrix(z - c)  # η × p = −p × η, and cross_matrix gives exactly η ↦ η × p
    return np.hstack([trans, rot])


def quotient_inner(z, m, u, v):
    """Inner product of the shape-space (quotient) mass metric: remove the rigid part orthogonally."""
    W = np.repeat(m, 3)
    B = rigid_basis(z)
    G = B.T @ (W[:, None] * B)
    def horizontal(w):
        coeff = np.linalg.solve(G, B.T @ (W * w))
        return w - B @ coeff
    hu, hv = horizontal(u.ravel()), horizontal(v.ravel())
    return float(hu @ (W * hv)), hu, hv


def check_submersion(trials=200):
    worst_orth, worst_norm = 0.0, 0.0
    for _ in range(trials):
        nA, k = 5, 2
        mA = rng.uniform(1, 16, nA)
        mB = rng.uniform(0.5, 20, k)  # massive beads, not test particles
        sA = rng.normal(size=(nA, 3))
        yB = rng.normal(size=(k, 3)) * 1.5
        z = np.vstack([sA, yB])
        m = np.concatenate([mA, mB])
        # horizontal-type vector: A moves horizontally for A alone, B is at rest in the lab
        _, sdot_h, _ = quotient_inner(sA, mA, rng.normal(size=(nA, 3)), np.zeros((nA, 3)))
        Vh = np.vstack([sdot_h.reshape(nA, 3), np.zeros((k, 3))])
        # vertical-type vector: A's shape fixed (A moves rigidly), B moves arbitrarily
        rigidA = rigid_basis(sA) @ rng.normal(size=6)
        Vv = np.vstack([rigidA.reshape(nA, 3), rng.normal(size=(k, 3))])
        g_hv, _, _ = quotient_inner(z, m, Vh, Vv)
        g_hh, _, _ = quotient_inner(z, m, Vh, Vh)
        g_vv, _, _ = quotient_inner(z, m, Vv, Vv)
        normA = float(sdot_h @ (np.repeat(mA, 3) * sdot_h))
        worst_orth = max(worst_orth, abs(g_hv) / np.sqrt(g_hh * g_vv))
        worst_norm = max(worst_norm, abs(g_hh - normA) / normA)
    print(f'submersion: max |cos angle(horizontal, vertical)| = {worst_orth:.2e}')
    print(f'submersion: max relative |  |V_h|²_whole − |ḃ|²_A  | = {worst_norm:.2e}')
    # contrast: B carried along rigidly with A's naive frame (not at rest in the lab)
    nA, k = 5, 2
    mA, mB = rng.uniform(1, 16, nA), rng.uniform(0.5, 20, k)
    sA, yB = rng.normal(size=(nA, 3)), rng.normal(size=(k, 3)) * 1.5
    z, m = np.vstack([sA, yB]), np.concatenate([mA, mB])
    raw = rng.normal(size=(nA, 3))
    eta = rng.normal(size=3)
    VA = raw + np.cross(eta, sA - sA.mean(0))  # A's shape change plus some rotation
    Vh_wrong = np.vstack([VA, np.cross(eta, yB - sA.mean(0))])  # B co-rotates with that rotation
    Vv = np.vstack([np.zeros((nA, 3)), rng.normal(size=(k, 3))])
    g_hv, _, _ = quotient_inner(z, m, Vh_wrong, Vv)
    print(f'contrast (B co-rotating with an arbitrary frame): <V, vertical> = {g_hv:.3f}  (not 0)')


def rotate_about(p, origin, axis, angle):
    axis = axis / np.linalg.norm(axis)
    v = p - origin
    c, s = np.cos(angle), np.sin(angle)
    return origin + v * c + np.cross(axis, v) * s + np.outer(v @ axis, axis) * (1 - c)


def kabsch_align(moving, target, w):
    """Rotate and translate `moving` onto `target` (weights w), minimising the weighted RMSD."""
    cm, ct = np.average(moving, 0, w), np.average(target, 0, w)
    H = ((moving - cm) * w[:, None]).T @ (target - ct)
    U, _, Vt = np.linalg.svd(H)
    d = np.sign(np.linalg.det(Vt.T @ U.T))
    R = Vt.T @ np.diag([1, 1, d]) @ U.T
    return (moving - cm) @ R.T + ct


def check_kabsch():
    # nitroethane-like beads: 1 C, 2 C, 3 N, 4 O, 5 O; the rotor turns 4, 5 about 2 → 3
    half = np.radians(62.65)
    x = np.array([[-0.52, 1.2, 0.78], [0, 0, 0], [1.47, 0, 0],
                  [1.47 + 1.22 * np.cos(half), 1.22 * np.sin(half), 0],
                  [1.47 + 1.22 * np.cos(half), -1.22 * np.sin(half), 0]])
    m = np.array([15, 14, 14, 16, 16.0])
    for eps in [1e-1, 1e-2, 1e-3]:
        y = x.copy()
        y[3:] = rotate_about(x[3:], x[2], x[2] - x[1], eps)
        aligned = kabsch_align(y, x, m)
        dK = (aligned - x).ravel()
        _, dH, _ = quotient_inner(x, m, (y - x), np.zeros_like(x))
        err = np.linalg.norm(dK - dH) / np.linalg.norm(dH)
        print(f'kabsch vs horizontal lift, step {eps:g} rad: relative difference {err:.2e}')


def check_kaluza_klein(trials=200):
    """|V|²_whole = |ḃ|²_A + h(Dỹ), with Dỹ = ỹ̇ − A(ḃ) × ỹ and
    h(w) = min over (ω, c) of ω·I_A ω + M_A |c|² + Σ μ_a |c + w_a + ω × ỹ_a|²."""
    worst = 0.0
    for _ in range(trials):
        nA, k = 5, 3
        mA, mB = rng.uniform(1, 16, nA), rng.uniform(0.5, 20, k)
        xA, yB = rng.normal(size=(nA, 3)), rng.normal(size=(k, 3)) * 1.5
        vA, vB = rng.normal(size=(nA, 3)), rng.normal(size=(k, 3))
        z, m = np.vstack([xA, yB]), np.concatenate([mA, mB])
        whole, _, _ = quotient_inner(z, m, np.vstack([vA, vB]), np.vstack([vA, vB]))
        # gauge at this instant: R = I, A's centre of mass c_A, A's velocity relative to it
        MA = mA.sum()
        cA, cAdot = (mA[:, None] * xA).sum(0) / MA, (mA[:, None] * vA).sum(0) / MA
        s, sdot = xA - cA, vA - cAdot
        I_A = sum(mi * (p @ p * np.eye(3) - np.outer(p, p)) for mi, p in zip(mA, s))
        J_A = sum(mi * np.cross(p, v) for mi, p, v in zip(mA, s, sdot))
        gauge = np.linalg.solve(I_A, J_A)  # A(ḃ): the mechanical connection in this gauge
        sdot_h = sdot - np.cross(gauge, s)
        base = float(((mA[:, None] * sdot_h) * sdot_h).sum())
        ytil, ytil_dot = yB - cA, vB - cAdot
        D = ytil_dot - np.cross(gauge, ytil)
        # h(D): least squares in (ω, c)
        rows, rhs = [], []
        Lc = np.linalg.cholesky(I_A)
        rows.append(np.hstack([Lc.T, np.zeros((3, 3))]))
        rhs.append(np.zeros(3))
        rows.append(np.hstack([np.zeros((3, 3)), np.sqrt(MA) * np.eye(3)]))
        rhs.append(np.zeros(3))
        for mu, p, d in zip(mB, ytil, D):
            rows.append(np.sqrt(mu) * np.hstack([cross_matrix(p[None, :]), np.eye(3)]))
            rhs.append(-np.sqrt(mu) * d)
        Amat, bvec = np.vstack(rows), np.concatenate(rhs)
        sol, *_ = np.linalg.lstsq(Amat, bvec, rcond=None)
        h = float(np.sum((Amat @ sol - bvec) ** 2))
        worst = max(worst, abs(whole - (base + h)) / whole)
    print(f'kaluza-klein form: max relative | |V|²_whole − (|ḃ|²_A + h(Dỹ)) | = {worst:.2e}')


def check_fibre_volume(trials=200):
    """det h = (Π μ_a³)(M_A/M_tot)³ · det I_A / det I_whole (inertia of the whole about its centre of mass).
    So the fibre volume density, ∝ (det I_A / det I_whole)^½, depends on where B is: the fibres are not
    minimal, and Brownian motion of the whole does not project to Brownian motion of A's shape."""
    worst = 0.0
    for _ in range(trials):
        nA, k = 5, 3
        mA, mB = rng.uniform(1, 16, nA), rng.uniform(0.5, 20, k)
        xA, yB = rng.normal(size=(nA, 3)), rng.normal(size=(k, 3)) * 1.5
        MA = mA.sum()
        cA = (mA[:, None] * xA).sum(0) / MA
        s, ytil = xA - cA, yB - cA
        I_A = sum(mi * (p @ p * np.eye(3) - np.outer(p, p)) for mi, p in zip(mA, s))
        # h as a quadratic form in w: Schur complement after minimising over u = (ω, c)
        Aww = np.kron(np.diag(mB), np.eye(3))
        Bu = np.vstack([np.hstack([cross_matrix(p[None, :]), np.eye(3)]) for p in ytil])
        Awu = Aww @ Bu
        Auu = Bu.T @ Aww @ Bu + np.block([[I_A, np.zeros((3, 3))], [np.zeros((3, 3)), MA * np.eye(3)]])
        H = Aww - Awu @ np.linalg.solve(Auu, Awu.T)
        m, z = np.concatenate([mA, mB]), np.vstack([xA, yB])
        C = (m[:, None] * z).sum(0) / m.sum()
        I_w = sum(mi * ((p - C) @ (p - C) * np.eye(3) - np.outer(p - C, p - C)) for mi, p in zip(m, z))
        predicted = np.prod(mB) ** 3 * (MA / m.sum()) ** 3 * np.linalg.det(I_A) / np.linalg.det(I_w)
        worst = max(worst, abs(np.linalg.det(H) / predicted - 1))
    print(f'fibre volume: max relative error of det h = (Πμ³)(M_A/M)³ det I_A / det I_whole: {worst:.2e}')


def laplacian(n, edges):
    L = np.zeros((n, n))
    for i, j, k in edges:
        L[i, i] += k
        L[j, j] += k
        L[i, j] -= k
        L[j, i] -= k
    return L


def noised_score_matrix(L, sigma):
    """Score of the Gaussian ∝ exp(−½ tr zᵀLz) (translation-invariant, β = 1) after adding N(0, σ²) to every
    coordinate: s(z) = −S z with S = (L⁺ + σ²P)⁺ P, P the projector orthogonal to translations."""
    n = len(L)
    P = np.eye(n) - np.ones((n, n)) / n
    return np.linalg.pinv(np.linalg.pinv(L) + sigma ** 2 * P) @ P


def check_interaction_score():
    """Two 'molecules' made of zero-rest-length springs (a Gaussian network model, SE(3)-invariant and exactly
    solvable). Joint score = monomer scores + interaction score, where
      - the monomer scores exert no net force on either molecule,
      - the interaction score's net forces on A and B cancel (Newton's third law),
      - at small noise the interaction score is −∇U_int, but at finite noise it is not −∇U_int(z_t)."""
    nA, nB = 5, 4
    eA = [(i, j, rng.uniform(0.5, 3)) for i in range(nA) for j in range(i + 1, nA) if rng.uniform() < 0.7] + [(i, i + 1, 2.0) for i in range(nA - 1)]
    eB = [(i, j, rng.uniform(0.5, 3)) for i in range(nB) for j in range(i + 1, nB) if rng.uniform() < 0.7] + [(i, i + 1, 2.0) for i in range(nB - 1)]
    eI = [(rng.integers(nA), nA + rng.integers(nB), rng.uniform(0.2, 1.0)) for _ in range(4)]
    LA, LB = laplacian(nA, eA), laplacian(nB, eB)
    L = np.zeros((nA + nB, nA + nB))
    L[:nA, :nA], L[nA:, nA:] = LA, LB
    Lint = laplacian(nA + nB, eI)
    L += Lint
    print('interaction score (two spring molecules, exact):')
    for sigma in [1e-3, 0.3, 1.0, 3.0]:
        S_joint = noised_score_matrix(L, sigma)
        S_ref = np.zeros_like(L)
        S_ref[:nA, :nA], S_ref[nA:, nA:] = noised_score_matrix(LA, sigma), noised_score_matrix(LB, sigma)
        S_int = S_joint - S_ref  # s_int(z) = −S_int z, the same 3 × 3 block for every spatial direction
        # sample z_t from the noised joint (one spatial direction suffices: everything is ⊗ I₃)
        Cz = np.linalg.pinv(L) + sigma ** 2 * (np.eye(nA + nB) - 1 / (nA + nB))
        w, V = np.linalg.eigh(Cz)
        zt = V @ (np.sqrt(np.clip(w, 0, None))[:, None] * rng.normal(size=(nA + nB, 2000)))
        s_int = -(S_int @ zt)
        s_ref = -(S_ref @ zt)
        plug_in = -(Lint @ zt)  # −∇U_int evaluated at the noisy state
        net_ref = max(abs(s_ref[:nA].sum(0)).max(), abs(s_ref[nA:].sum(0)).max())
        newton = abs(s_int[:nA].sum(0) + s_int[nA:].sum(0)).max()
        on_A = np.sqrt((s_int[:nA].sum(0) ** 2).mean())
        err = np.linalg.norm(s_int - plug_in) / np.linalg.norm(s_int)
        print(f'  σ = {sigma:<5g}: net force of monomer scores {net_ref:.1e};  F_A + F_B of interaction {newton:.1e} '
              f'(rms |F_A| {on_A:.2f});  plug-in −∇U_int(z_t) off by {100 * err:.1f}%')


def check_relative_pose_submersion(trials=200):
    """Forgetting the relative pose of two molecules, M_AB → M_A × M_B, is a Riemannian submersion: motions in
    which each molecule moves with zero momentum and angular momentum of its own are orthogonal to the relative
    rigid motions, and their length is √(|ḃ_A|² + |ḃ_B|²)."""
    worst_orth, worst_norm = 0.0, 0.0
    for _ in range(trials):
        nA, nB = 5, 4
        mA, mB = rng.uniform(1, 16, nA), rng.uniform(1, 16, nB)
        xA, xB = rng.normal(size=(nA, 3)), rng.normal(size=(nB, 3)) + 3.0
        z, m = np.vstack([xA, xB]), np.concatenate([mA, mB])
        _, hA, _ = quotient_inner(xA, mA, rng.normal(size=(nA, 3)), np.zeros((nA, 3)))
        _, hB, _ = quotient_inner(xB, mB, rng.normal(size=(nB, 3)), np.zeros((nB, 3)))
        Vh = np.vstack([hA.reshape(nA, 3), hB.reshape(nB, 3)])
        Vv = np.vstack([(rigid_basis(xA) @ rng.normal(size=6)).reshape(nA, 3), (rigid_basis(xB) @ rng.normal(size=6)).reshape(nB, 3)])
        g_hv, _, _ = quotient_inner(z, m, Vh, Vv)
        g_hh, _, _ = quotient_inner(z, m, Vh, Vh)
        g_vv, _, _ = quotient_inner(z, m, Vv, Vv)
        base = float(hA @ (np.repeat(mA, 3) * hA) + hB @ (np.repeat(mB, 3) * hB))
        worst_orth = max(worst_orth, abs(g_hv) / np.sqrt(g_hh * g_vv))
        worst_norm = max(worst_norm, abs(g_hh - base) / base)
    print(f'relative-pose submersion: max |cos| = {worst_orth:.1e}, max norm error = {worst_norm:.1e}')


if __name__ == '__main__':
    check_submersion()
    check_kabsch()
    check_kaluza_klein()
    check_fibre_volume()
    check_interaction_score()
    check_relative_pose_submersion()
