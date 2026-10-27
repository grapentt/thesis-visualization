import numpy as np
rng = np.random.default_rng(7)

def hat(w):
    w = np.asarray(w, float)
    return np.array([[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]])

def expso3(W):  # W: (M,3) rotation vectors -> (M,3,3)
    th = np.linalg.norm(W, axis=1)[:, None, None]
    K = np.zeros((W.shape[0], 3, 3))
    K[:, 0, 1], K[:, 0, 2], K[:, 1, 2] = -W[:, 2], W[:, 1], -W[:, 0]
    K[:, 1, 0], K[:, 2, 0], K[:, 2, 1] = W[:, 2], -W[:, 1], W[:, 0]
    th_safe = np.where(th < 1e-12, 1.0, th)
    s = np.where(th < 1e-12, 1.0, np.sin(th) / th_safe)
    c = np.where(th < 1e-12, 0.5, (1 - np.cos(th)) / th_safe**2)
    return np.eye(3)[None] + s * K + c * K @ K

def logso3(R):
    cos = np.clip((np.trace(R, axis1=1, axis2=2) - 1) / 2, -1, 1)
    th = np.arccos(cos)
    v = np.stack([R[:, 2, 1] - R[:, 1, 2], R[:, 0, 2] - R[:, 2, 0], R[:, 1, 0] - R[:, 0, 1]], axis=1)
    f = np.where(th < 1e-9, 0.5, th / (2 * np.sin(np.where(th < 1e-9, 1, th))))
    return v * f[:, None]

# curvature components as angular-velocity vectors omega_ij in R^3 (so(3)), base R^3
om = {(0, 1): np.array([1.0, 0.3, 0.0]), (0, 2): np.array([0.0, 1.2, -0.5]), (1, 2): np.array([0.4, 0.0, 0.9])}
Fvec = np.zeros((3, 3, 3))  # Fvec[i,j] = omega_ij, antisymmetric in i,j
for (i, j), w in om.items():
    Fvec[i, j] = w; Fvec[j, i] = -w
YM = sum(np.dot(w, w) for w in om.values())

def run(t, M=20000, n=300):
    dt = t / n
    dW = rng.standard_normal((M, n, 3)) * np.sqrt(dt)
    X = np.concatenate([np.zeros((M, 1, 3)), np.cumsum(dW, axis=1)], axis=1)
    s = np.linspace(0, t, n + 1)
    X = X - (s / t)[None, :, None] * X[:, -1:, :]   # Brownian bridge in R^3
    g = np.tile(np.eye(3), (M, 1, 1))
    for k in range(n):
        xm = 0.5 * (X[:, k] + X[:, k + 1]); dx = X[:, k + 1] - X[:, k]
        # A(dx) = 1/2 x^j F_ji dx^i  (as rotation vector)
        Avec = 0.5 * np.einsum('mj,jia,mi->ma', xm, Fvec, dx)
        g = expso3(-Avec) @ g
    Th = logso3(g)
    return g, Th

for t in [0.05, 0.1, 0.2]:
    g, Th = run(t)
    print(f"t={t}: E[Theta]={Th.mean(0).round(5)}  E|Theta|^2={np.mean(np.sum(Th**2,1)):.3e}  theory t^2/12*|Omega|^2={t**2/12*YM:.3e}")
    Eg = g.mean(0)
    pred = np.eye(3) + t**2 / 24 * sum(hat(w) @ hat(w) for w in om.values())
    print("   E[hol]-I       :", np.round((Eg - np.eye(3)).ravel(), 6))
    print("   pred t^2/24 sum Om^2:", np.round((pred - np.eye(3)).ravel(), 6))
