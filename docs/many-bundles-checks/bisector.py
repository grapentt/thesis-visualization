import numpy as np
exec(open('rotor_checks.py').read().split('# ---------- test molecule')[0])
rng = np.random.default_rng(5)
def bis_rotor(X, th, n, lips):
    ea = X[lips[0]] - X[n]; eb = X[lips[1]] - X[n]
    w = ea/np.linalg.norm(ea) + eb/np.linalg.norm(eb); w /= np.linalg.norm(w)
    R = Ru(w, th); Y = X.copy()
    for i in lips: Y[i] = X[n] + R @ (X[i] - X[n])
    return Y
X = rng.normal(size=(6, 3)); c, n, lips = 0, 1, [2, 3]
print('bisector group law', np.abs(bis_rotor(bis_rotor(X, .3, n, lips), .5, n, lips) - bis_rotor(X, .8, n, lips)).max())
print('bisector o CN = CN o bisector', np.abs(bis_rotor(rotor(X, .7, c, n, lips), .4, n, lips) - rotor(bis_rotor(X, .4, n, lips), .7, c, n, lips)).max())
# torsion torus check in a chain A-B-C-D-E: rotor1 moves {D,E} about BC, rotor2 moves {E} about CD
Xc = rng.normal(size=(5, 3))
r1 = lambda Z, t: rotor(Z, t, 1, 2, [3, 4]); r2 = lambda Z, t: rotor(Z, t, 2, 3, [4])
print('chain torsions commute', np.abs(r1(r2(Xc, .6), 1.1) - r2(r1(Xc, 1.1), .6)).max())
# non-commuting example: rotor1 moves {D,E} about BC, rotor3 moves {D} about C-E axis (moving set overlaps axis atoms)
r3 = lambda Z, t: rotor(Z, t, 2, 4, [3])
print('overlapping rotors commute?', np.abs(r1(r3(Xc, .6), 1.1) - r3(r1(Xc, 1.1), .6)).max())
r4 = lambda Z, t: rotor(Z, t, 0, 4, [3])
print('r1 (moves D,E about BC) vs r4 (moves D about A-E):', np.abs(r1(r4(Xc, .6), 1.1) - r4(r1(Xc, 1.1), .6)).max())
r5 = lambda Z, t: rotor(Z, t, 1, 2, [3])  # moves only D about BC
r6 = lambda Z, t: rotor(Z, t, 3, 2, [4, 1])  # moves E and B about D-C axis
print('r5 vs r6:', np.abs(r5(r6(Xc, .6), 1.1) - r6(r5(Xc, 1.1), .6)).max())
