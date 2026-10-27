import numpy as np
from scipy.linalg import expm, logm

LIP = 1.22; HM = np.radians(52)
X0 = np.array([[-0.52, 1.2, 0.78], [0, 0, 0], [1.47, 0, 0],
               [1.47 + LIP*np.cos(HM),  LIP*np.sin(HM), 0],
               [1.47 + LIP*np.cos(HM), -LIP*np.sin(HM), 0]])
m = np.array([15, 14, 14, 16, 16.0])
N = len(m)

def hat(w): return np.array([[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]])
def com(X): return (m[:, None]*X).sum(0)/m.sum()
def inertia(X):
    r = X - com(X)
    return sum(mi*(np.dot(ri, ri)*np.eye(3) - np.outer(ri, ri)) for mi, ri in zip(m, r))
def angmom(X, V):
    r = X - com(X)
    return sum(mi*np.cross(ri, vi) for mi, ri, vi in zip(m, r, V))
def omega(X, V):  # mechanical connection: angular velocity of the 'rigid part'
    return np.linalg.solve(inertia(X), angmom(X, V))

def horizontal_basis(X):
    r = X - com(X); sq = np.sqrt(m)[:, None]
    vert = []
    for k in range(3):
        e = np.zeros((N, 3)); e[:, k] = 1; vert.append((sq*e).ravel())
        xi = np.zeros(3); xi[k] = 1; vert.append((sq*np.cross(xi, r)).ravel())
    Vt = np.array(vert).T                      # 15 x 6 in mass-weighted coords q = sqrt(m) x
    Q, _ = np.linalg.qr(np.hstack([Vt, np.eye(3*N)]))
    H = Q[:, 6:3*N]                            # 15 x 9 orthonormal horizontal basis (q-coords)
    return H

X = X0 - com(X0)
I = inertia(X)
H = horizontal_basis(X)
n = H.shape[1]
Om = {}
for i in range(n):
    for j in range(i+1, n):
        hi = H[:, i].reshape(N, 3); hj = H[:, j].reshape(N, 3)
        J = np.cross(hi, hj).sum(0)            # sum m u x v with u = h/sqrt(m)
        Om[(i, j)] = 2*np.linalg.solve(I, J)
YM_e = sum(np.dot(w, w) for w in Om.values())
YM_I = sum(w @ I @ w for w in Om.values())
print("principal moments (amu A^2):", np.round(np.linalg.eigvalsh(I), 2))
print("sum_{i<j} |Omega_ij|^2 (Euclidean)  =", YM_e, " [rad^2 / (amu A^2)^2]")
print("sum_{i<j} Omega.I.Omega            =", YM_I, " [1/(amu A^2)]")
print("scalar curvature of shape space s_M = 1.5*sum Omega.I.Omega =", 1.5*YM_I)
# largest-curvature 2-plane: maximise |Omega(X,Y)| over orthonormal pairs -> top singular values of the 3 x C(9,2) map
# Omega as a 3 x (9x9 antisymmetric) tensor
T = np.zeros((3, n, n))
for (i, j), w in Om.items(): T[:, i, j] = w; T[:, j, i] = -w
# check with finite loop holonomy in plane (0,1)
eps = 1e-3; K = 4000
s = np.linspace(0, 2*np.pi, K+1)
acc = np.zeros(3)
h0 = H[:, 0].reshape(N, 3)/np.sqrt(m)[:, None]; h1 = H[:, 1].reshape(N, 3)/np.sqrt(m)[:, None]
for k in range(K):
    sm = 0.5*(s[k]+s[k+1])
    Xs = X + eps*(np.cos(sm)*h0 + np.sin(sm)*h1)
    V = eps*(-np.sin(sm)*h0 + np.cos(sm)*h1)*(s[k+1]-s[k])
    acc += omega(Xs, V)
print("check: loop integral of omega / (pi eps^2) =", acc/(np.pi*eps**2), "  vs Omega_01 =", Om[(0, 1)])

# Sectional curvatures: K(X,Y) = 3/4 Omega.I.Omega for orthonormal horizontal X,Y; max over coordinate planes
Ks = {k: 0.75*w @ I @ w for k, w in Om.items()}
print("max sectional curvature over basis planes:", max(Ks.values()))

# Brownian bridge prediction (generator 1/2 Delta_M, time t in (sqrt(amu) A)^2)
for t in [0.1, 0.5, 1.0]:
    print(f"t={t} (amu A^2): E|Theta|^2 ~ t^2/12*sum|Om|^2 = {t**2/12*YM_e:.3e} rad^2,  rms = {np.degrees(np.sqrt(t**2/12*YM_e)):.3f} deg")

# ---- full rotor loop: turn the two O by 2 pi about the C2-N axis, with L = 0
def turn(X, phi):
    o = X[2]; u = (X[2]-X[1])/np.linalg.norm(X[2]-X[1])
    Y = X.copy()
    R = expm(hat(u*phi))
    for a in (3, 4): Y[a] = o + R @ (X[a]-o)
    return Y
Kp = 20000
phis = np.linspace(0, 2*np.pi, Kp+1)
Rb = np.eye(3)
for k in range(Kp):
    pm = 0.5*(phis[k]+phis[k+1]); dphi = phis[k+1]-phis[k]
    Xp = turn(X, pm); V = (turn(X, pm+1e-6)-turn(X, pm-1e-6))/2e-6*dphi
    Ob = -omega(Xp, V)             # body angular velocity increment (L = 0)
    Rb = Rb @ expm(hat(Ob))
w = logm(Rb).real; w = np.array([w[2, 1], w[0, 2], w[1, 0]])
ang = np.linalg.norm(w)
print("rotor full turn: com shift =", np.linalg.norm(com(turn(X, 1.0)) - com(X)))
print("holonomy of one full rotor turn: angle =", np.degrees(ang), "deg about axis", np.round(w/ang, 4))
u = (X[2]-X[1])/np.linalg.norm(X[2]-X[1])
r = X[3]-X[2]; rperp = r - np.dot(r, u)*u
Irot = 2*16*np.dot(rperp, rperp)
Iax = u @ I @ u
print("I_rotor about C-N axis =", Irot, " I_molecule about that direction (through COM) =", Iax, " naive 2pi*Irot/Iax =", np.degrees(2*np.pi*Irot/Iax), "deg")
