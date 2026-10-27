import numpy as np
from scipy.linalg import expm
exec(open('nitro_curvature.py').read().split('X = X0 - com(X0)')[0])
def turn(X, phi):
    o = X[2]; u = (X[2]-X[1])/np.linalg.norm(X[2]-X[1]); Y = X.copy(); R = expm(hat(u*phi))
    for a in (3, 4): Y[a] = o + R @ (X[a]-o)
    return Y
G = np.diag(np.repeat(m, 3))
x0 = X0.ravel()
for phi in [np.pi/2, np.pi]:
    J = np.zeros((15, 15)); h = 1e-6
    for k in range(15):
        e = np.zeros(15); e[k] = h
        J[:, k] = (turn((x0+e).reshape(5, 3), phi).ravel() - turn((x0-e).reshape(5, 3), phi).ravel())/(2*h)
    D = J.T @ G @ J - G
    print(f"phi={phi:.3f}: max |J^T G J - G| = {np.abs(D).max():.3f}  (G entries 14-16)")
    # also: is the orbit-orthogonal distribution invariant? compare dPhi(H_x) with H_{Phi x}
