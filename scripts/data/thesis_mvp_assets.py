"""Write the small JSON assets of the "Flipped Handle" probe (src/data/thesis/).

Plain numpy, read-only access to the riemannian-generative checkout (never imported):

    python3 -I scripts/data/thesis_mvp_assets.py --rg /path/to/riemannian-generative

Writes
  aldp5-modes.json  A1   ALDP5 backbone principal widths and directions (mdshare trajectory 1)
  bba-modes.json    A11  BBA collective (Cartesian Helmert) modes, library units, Rouse overlaps
  bba-charts.json   A12  first-order loudness and half-erasure levels per chart (run 2026-11-18b)
  bba-frames.json   A14  eight held-out BBA molecules, stratified by Rg
Every file carries a header {schema, id, created, script, script_sha256, inputs, notes, data}.
"""

import argparse
import hashlib
import json
from datetime import date
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve()
OUT = HERE.parents[2] / "src" / "data" / "thesis"
RUN = "runs/range-order-mechanisms-20261118b"
RG = None  # the riemannian-generative checkout, set from --rg
# the forbidden inputs of the programme (struck dummy placement, chignolin dummy frames)
FORBIDDEN = ("data/deshawresearch/bba-", "data/processed/bba_", "chignolin")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def header(asset_id, inputs, notes, data):
    for p in inputs:
        assert not any(bad in str(p) for bad in FORBIDDEN), p
    return {
        "schema": "thesis-asset-v1",
        "id": asset_id,
        "created": date.today().isoformat(),
        "script": "scripts/data/thesis_mvp_assets.py",
        "script_sha256": sha256(HERE),
        "inputs": [{"path": str(p.relative_to(RG)), "sha256": sha256(p)} for p in inputs],
        "notes": notes,
        "data": data,
    }


def write(name, obj):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(obj, separators=(",", ":")) + "\n")
    print(f"{name}: {(OUT / name).stat().st_size / 1024:.1f} kB")


def kabsch(x, ref):
    """Rotate centred clouds x (b, n, 3) onto the centred reference (n, 3), proper rotations only."""
    h = np.einsum("bni,nj->bij", x, ref)
    u, _, vt = np.linalg.svd(h)
    d = np.sign(np.linalg.det(np.einsum("bij,bjk->bik", u, vt)))
    u[:, :, -1] *= d[:, None]
    return np.einsum("bni,bij,bjk->bnk", x, u, vt)


def aldp5(rg):
    path = rg / "data/mdshare/alanine-dipeptide-3x250ns-heavy-atom-positions.npz"
    traj = np.load(path)["arr_1"].reshape(-1, 10, 3)[::12][:, [1, 3, 4, 6, 8]] * 10.0  # nm -> Å
    x = traj - traj.mean(1, keepdims=True)
    ref = x[0]
    for _ in range(8):  # iterated Kabsch to the running mean
        x = kabsch(x, ref)
        ref = x.mean(0)
    flat = x.reshape(len(x), 15)
    cov = np.cov(flat.T)
    w, v = np.linalg.eigh(cov)
    order = np.argsort(w)[::-1][:9][::-1]  # nine internal modes, stiffest first
    widths = np.sqrt(w[order])
    vectors = v[:, order].T
    for k in range(9):  # sign convention: largest component positive
        if vectors[k][np.argmax(np.abs(vectors[k]))] < 0:
            vectors[k] *= -1
    # express mean and directions in the principal axes of the mean backbone (x: longest), so a
    # thumbnail can draw them in the x-y plane
    _, _, vt = np.linalg.svd(ref - ref.mean(0))
    if np.linalg.det(vt) < 0:
        vt[2] *= -1
    ref = ref @ vt.T
    vectors = (vectors.reshape(9, 5, 3) @ vt.T).reshape(9, 15)
    logged = [0.0252, 0.0294, 0.0419, 0.0543, 0.0654, 0.1234, 0.1851, 0.3452, 0.6631]
    rel = np.abs(widths / np.array(logged) - 1)
    assert rel.max() < 0.02, (widths, rel)
    data = {
        "unit_A": 0.9418,
        "frames": int(len(x)),
        "widths_A": [round(float(s), 5) for s in widths],
        "logged_widths_A": logged,
        "vectors": [[round(float(c), 5) for c in vec] for vec in vectors],
        "mean_A": [[round(float(c), 4) for c in bead] for bead in ref],
    }
    notes = ("mdshare traj 1 (arr_1), every 12th frame, heavy atoms [1,3,4,6,8] (C, N, CA, C, N), nm->Å, iterated Kabsch; "
             "15x15 covariance; the 9 internal modes stiffest first; widths within 2% of evidence.json mode_std_A")
    write("aldp5-modes.json", header("A1", [path], notes, data))
    print("  widths", np.round(widths, 4), "max rel diff", rel.max().round(4))


def bba_modes(rg):
    path = rg / RUN / "collective_modes.json"
    charts = rg / RUN / "bba_charts.json"
    modes = json.loads(path.read_text())
    ch = json.loads(charts.read_text())
    ms = np.array(modes["mean_squares"])
    c0 = float(np.sqrt(27 / ms.sum()))
    assert abs(c0 - ch["c0"]) < 1e-9
    data = {
        "n_beads": 28,
        "c0": c0,
        "ms_A2": [float(v) for v in ms],
        "ms_lib": [float(c0**2 * v) for v in ms],
        "V": [[round(float(c), 7) for c in row] for row in modes["vectors"]],
        "rouse_overlap": ch["rouse_overlap"],
        "length_variance_lib": ch["length_conformational_variance"],
        "torsion_length_variance_lib": 2.0007018056527377,
    }
    notes = ("collective_modes.json (Helmert-basis PCA of 1,300,156 training frames); bead weights w_p = H V_p with "
             "H = centered_basis(28) are built in JS; library units c0^2 x mean square, sum 27")
    write("bba-modes.json", header("A11", [path, charts], notes, data))


def bba_charts(rg):
    path = rg / RUN / "bba_charts.json"
    ch = json.loads(path.read_text())
    data = {k: ch[k] for k in ("loudness", "t_half", "constraint_block_share", "additive_readout_r2", "c0", "kappa")}
    notes = ("first-order (linear-Gaussian) loudness and t_half per observable group and chart, 1,200 held-out "
             "frames; constraint shares stored as block shares (the internal block's share is 1 - x)")
    write("bba-charts.json", header("A12", [path], notes, data))


def bba_frames(rg):
    root = rg / "data/deshawresearch-bba-ca28"
    meta = json.loads((root / "data.json").read_text())
    path = root / "heldout.npy"
    assert sha256(path) == meta["heldout_sha256"]
    held = np.load(path, mmap_mode="r")
    rng = np.random.default_rng(20261119)
    idx = np.sort(rng.choice(len(held), 20000, replace=False))
    x = np.asarray(held[idx], np.float64)
    x -= x.mean(1, keepdims=True)
    rgy = np.sqrt((x**2).sum(-1).mean(1))
    qs = np.quantile(rgy, [0.06, 0.19, 0.31, 0.44, 0.56, 0.69, 0.81, 0.94])
    pick = [int(np.argmin(np.abs(rgy - q))) for q in qs]
    data = {
        "unit": "angstrom",
        "heldout_index": [int(idx[i]) for i in pick],
        "rg_A": [round(float(rgy[i]), 3) for i in pick],
        "mol": [[[round(float(c), 3) for c in bead] for bead in x[i]] for i in pick],
        "tags": [f"Rg quantile {q:.2f}" for q in (0.06, 0.19, 0.31, 0.44, 0.56, 0.69, 0.81, 0.94)],
    }
    notes = "eight held-out molecules (20,000-frame random subsample, seed 20261119) at Rg quantiles; centred"
    write("bba-frames.json", header("A14", [path], notes, data))


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--rg", type=Path, required=True, help="riemannian-generative checkout (read only)")
    a = ap.parse_args()
    RG = a.rg.resolve()
    aldp5(a.rg)
    bba_modes(a.rg)
    bba_charts(a.rg)
    bba_frames(a.rg)
