"""Checks for more than two molecules (docs/bundle-generative-models.md, §15).

1. Forgetting all relative poses, M_{1…n} → M_1 × … × M_n, is a Riemannian submersion for n = 4: the per-molecule
   zero-momentum motions are orthogonal to the relative rigid motions, and their length is the sum over molecules.
2. A pairwise energy does not give a pairwise noisy interaction score. With w = Π_{i<j} w_ij, the interaction
   W_t = E[w | z_t] has a three-body part that vanishes at small noise, peaks at a few well widths and then
   falls again.
"""
import os
import sys

import numpy as np

# appended, not prepended: this folder's numbers.py must not shadow the standard library (run with python3 -I)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from coupling_checks import quotient_inner, rigid_basis  # noqa: E402

rng = np.random.default_rng(3)


def check_many_body_submersion(trials=200, sizes=(5, 4, 3, 6)):
    worst_orth, worst_norm = 0.0, 0.0
    for _ in range(trials):
        xs = [rng.normal(size=(n, 3)) + 4.0 * rng.normal(size=3) for n in sizes]
        ms = [rng.uniform(1, 16, n) for n in sizes]
        z, m = np.vstack(xs), np.concatenate(ms)
        hs = [quotient_inner(x, mm, rng.normal(size=x.shape), np.zeros(x.shape))[1] for x, mm in zip(xs, ms)]
        Vh = np.vstack([h.reshape(-1, 3) for h in hs])
        Vv = np.vstack([(rigid_basis(x) @ rng.normal(size=6)).reshape(-1, 3) for x in xs])
        g_hv, _, _ = quotient_inner(z, m, Vh, Vv)
        g_hh, _, _ = quotient_inner(z, m, Vh, Vh)
        g_vv, _, _ = quotient_inner(z, m, Vv, Vv)
        base = sum(float(h @ (np.repeat(mm, 3) * h)) for h, mm in zip(hs, ms))
        worst_orth = max(worst_orth, abs(g_hv) / np.sqrt(g_hh * g_vv))
        worst_norm = max(worst_norm, abs(g_hh - base) / base)
    print(f'{len(sizes)}-molecule submersion: max |cos| = {worst_orth:.1e}, max norm error = {worst_norm:.1e}')


# three point "molecules" on a line, reference ν = N(0, 1) each, attracted to distance 1 from each other.
# Under VP noise the posterior is x_i | z_i = N(a z_i, σ²) independently, and every weight depends only on
# differences, so the expectations are integrals over d12 = x1 − x2 and d13 = x1 − x3 on a fine grid.
EPS, WIDTH = 3.0, 0.15
log_w = lambda r: EPS * np.exp(-((np.abs(r) - 1.0) ** 2) / (2 * WIDTH**2))


def grid(mean, sd, h):
    half = 7 * sd
    return mean + np.arange(-half, half + h / 2, h)


def log_W_three(z, s, a, h):
    """log E[w12 w13 w23 | z]: (d12, d13) is Gaussian with mean a(z1 − z2, z1 − z3) and covariance s²[[2, 1], [1, 2]]."""
    m12, m13 = a * (z[0] - z[1]), a * (z[0] - z[2])
    d12, d13 = grid(m12, np.sqrt(2) * s, h), grid(m13, np.sqrt(2) * s, h)
    D12, D13 = np.meshgrid(d12, d13, indexing='ij')
    u, v = D12 - m12, D13 - m13
    log_g = -(2 * u * u - 2 * u * v + 2 * v * v) / (6 * s * s)  # inverse of [[2, 1], [1, 2]] is [[2, −1], [−1, 2]] / 3
    lw = log_w(D12) + log_w(D13) + log_w(D13 - D12)
    e = log_g + lw
    top = e.max()
    return np.log(np.exp(e - top).sum() / np.exp(log_g - log_g.max()).sum()) + top - log_g.max()


def log_W_pair(zi, zj, s, a, h):
    """log E[w_ij | z_i, z_j]: d = x_i − x_j is N(a(z_i − z_j), 2s²)."""
    m = a * (zi - zj)
    d = grid(m, np.sqrt(2) * s, h)
    log_g = -((d - m) ** 2) / (4 * s * s)
    e = log_g + log_w(d)
    top = e.max()
    return np.log(np.exp(e - top).sum() / np.exp(log_g - log_g.max()).sum()) + top - log_g.max()


def grad(f, z, h=1e-5):
    return np.array([(f(z + h * e) - f(z - h * e)) / (2 * h) for e in np.eye(len(z))])


def three_body_share(sigma, trimer, rng, h):
    a = np.sqrt(1 - sigma**2)
    num, den = [], []
    for x0 in trimer:
        z = a * x0 + sigma * rng.normal(size=3)
        full = grad(lambda q: log_W_three(q, sigma, a, h), z)
        pairs = grad(lambda q: sum(log_W_pair(q[i], q[j], sigma, a, h) for i, j in [(0, 1), (0, 2), (1, 2)]), z)
        num.append(np.sum((full - pairs) ** 2))
        den.append(np.sum(full**2))
    num, den = np.array(num), np.array(den)
    boot = [np.sqrt(num[k].sum() / den[k].sum()) for k in (rng.integers(0, len(num), len(num)) for _ in range(200))]
    return np.sqrt(num.sum() / den.sum()), np.std(boot)


def check_noise_induced_three_body(samples=300):
    # samples of the interacting trimer by importance resampling from the reference
    x = rng.normal(size=(400_000, 3))
    lw = log_w(x[:, 0] - x[:, 1]) + log_w(x[:, 0] - x[:, 2]) + log_w(x[:, 1] - x[:, 2])
    p = np.exp(lw - lw.max())
    trimer = x[rng.choice(len(x), samples, p=p / p.sum())]
    print('noise σ   three-body part / |∇ log W_t|   (± bootstrap s.e.; grid h and h/2)')
    for sigma in [0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.7]:
        h = min(0.01, sigma / 6)
        share, se = three_body_share(sigma, trimer, np.random.default_rng(11), h)
        share2, _ = three_body_share(sigma, trimer[:60], np.random.default_rng(11), h / 2)
        share1, _ = three_body_share(sigma, trimer[:60], np.random.default_rng(11), h)
        print(f'  {sigma:4.2f}      {share:6.1%} ± {se:4.1%}      (60 trimers: h {share1:6.1%}, h/2 {share2:6.1%})')


if __name__ == '__main__':
    check_many_body_submersion()
    check_noise_induced_three_body()
