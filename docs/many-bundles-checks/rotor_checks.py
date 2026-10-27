import numpy as np
from scipy.integrate import solve_ivp
from scipy.spatial.transform import Rotation as Rot

rng = np.random.default_rng(1)

def skew(w):
    return np.array([[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]])

def Ru(u, th):
    K = skew(u)
    return np.eye(3) + np.sin(th) * K + (1 - np.cos(th)) * K @ K

class Mol:
    def __init__(self, X, m, c, n, lips):
        self.X = np.array(X, float).reshape(-1, 3); self.m = np.array(m, float)
        self.c, self.n, self.lips = c, n, list(lips)
        self.frame = [i for i in range(len(m)) if i not in self.lips]

def axis(X, c, n):
    d = X[n] - X[c]; return d / np.linalg.norm(d)

def rotor(X, th, c, n, lips):
    u = axis(X, c, n); R = Ru(u, th); Y = X.copy()
    for i in lips: Y[i] = X[n] + R @ (X[i] - X[n])
    return Y

def dPhi(X, V, th, c, n, lips, h=1e-6):
    return (rotor(X + h * V, th, c, n, lips) - rotor(X - h * V, th, c, n, lips)) / (2 * h)

def xi(X, c, n, lips):
    u = axis(X, c, n); V = np.zeros_like(X)
    for i in lips: V[i] = np.cross(u, X[i] - X[n])
    return V

def Iu(X, m, c, n, lips):
    u = axis(X, c, n)
    return sum(m[i] * np.linalg.norm(np.cross(u, X[i] - X[n]))**2 for i in lips)

def A_orth(X, V, m, c, n, lips):
    u = axis(X, c, n)
    return sum(m[i] * u @ np.cross(X[i] - X[n], V[i]) for i in lips) / Iu(X, m, c, n, lips)

def A_naive(X, V, m, c, n, lips):
    u = axis(X, c, n)
    return sum(m[i] * u @ np.cross(X[i] - X[n], V[i] - V[n]) for i in lips) / Iu(X, m, c, n, lips)

def udot(X, V, c, n):
    d = X[n] - X[c]; dd = V[n] - V[c]; L = np.linalg.norm(d); u = d / L
    return (dd - u * (u @ dd)) / L

def A_LC(X, V, m, c, n, lips):
    u = axis(X, c, n); w = np.cross(u, udot(X, V, c, n))
    tot = 0
    for i in lips:
        r = X[i] - X[n]; rd = V[i] - V[n]
        tot += m[i] * u @ np.cross(r, rd - np.cross(w, r))
    return tot / Iu(X, m, c, n, lips)

def A_frame(X, V, m, c, n, frame):
    # same construction for frame atoms (excluding c, n which are on axis)
    u = axis(X, c, n); w = np.cross(u, udot(X, V, c, n))
    tot = 0; I = 0
    for j in frame:
        if j in (c, n): continue
        r = X[j] - X[n]; rd = V[j] - V[n]
        tot += m[j] * u @ np.cross(r, rd - np.cross(w, r))
        I += m[j] * np.linalg.norm(np.cross(u, r))**2
    return tot / I

def com(X, m): return (m[:, None] * X).sum(0) / m.sum()

def inertia(X, m):
    Y = X - com(X, m)
    return sum(mi * ((y @ y) * np.eye(3) - np.outer(y, y)) for mi, y in zip(m, Y))

def angmom(X, V, m):
    Y = X - com(X, m); Vc = V - (m[:, None] * V).sum(0) / m.sum()
    return sum(mi * np.cross(y, v) for mi, y, v in zip(m, Y, Vc))

def A_mech_so3(X, V, m):
    return np.linalg.solve(inertia(X, m), angmom(X, V, m))

# ---------- test molecule: random generic config, 6 atoms: 0 = C, 1 = N, 2,3 lips, 4,5 frame ----------
m = np.array([12, 14, 16, 16, 1, 1.0])
c, n, lips = 0, 1, [2, 3]
X = rng.normal(size=(6, 3))
th = 0.83
print('== group law, commutation ==')
print('group law err', np.abs(rotor(rotor(X, 0.4, c, n, lips), 0.7, c, n, lips) - rotor(X, 1.1, c, n, lips)).max())
Q = Rot.random(random_state=3).as_matrix(); t = rng.normal(size=3)
gX = X @ Q.T + t
print('SE3 commute err', np.abs(rotor(gX, th, c, n, lips) - (rotor(X, th, c, n, lips) @ Q.T + t)).max())
P = np.diag([1, 1, -1.0])  # reflection
print('reflection: R_Pu(th) P = P R_u(-th)?', np.abs(rotor(X @ P.T, th, c, n, lips) - rotor(X, -th, c, n, lips) @ P.T).max())
print('COM moves under rotor (generic):', np.linalg.norm(com(rotor(X, th, c, n, lips), m) - com(X, m)))

# isometry test
V = rng.normal(size=X.shape)
print('== isometry ==')
dV = dPhi(X, V, th, c, n, lips)
print('|v|_M^2 =', (m * (V**2).sum(1)).sum(), ' |dPhi v|_M^2 =', (m * (dV**2).sum(1)).sum())

print('== invariance of candidate connections under rotor (A(Phi x)(dPhi v) - A(x)(v)) ==')
Y = rotor(X, th, c, n, lips)
for name, A in [('A_orth', A_orth), ('A_naive', A_naive), ('A_LC', A_LC)]:
    print(name, A(Y, dV, m, c, n, lips) - A(X, V, m, c, n, lips), '  A(xi)=', A(X, xi(X, c, n, lips), m, c, n, lips))
print('A_M = A_LC - A_frame invariance:', (A_LC(Y, dV, m, c, n, lips) - A_frame(Y, dV, m, c, n, [0, 1, 4, 5])) - (A_LC(X, V, m, c, n, lips) - A_frame(X, V, m, c, n, [0, 1, 4, 5])))
eta = rng.normal(size=3); Veta = np.cross(eta, X)
u = axis(X, c, n)
print('A_LC(eta x X) =', A_LC(X, Veta, m, c, n, lips), ' u.eta =', u @ eta, '  A_M(eta x X)=', A_LC(X, Veta, m, c, n, lips) - A_frame(X, Veta, m, c, n, [0, 1, 4, 5]))
# SO(3) mechanical connection invariance under the rotor
print('SO3 mech conn rotor-invariance err:', np.abs(A_mech_so3(Y, dV, m) - A_mech_so3(X, V, m)).max(), ' scale', np.abs(A_mech_so3(X, V, m)).max())

# on the C2-symmetric locus Sigma: lips r_b = R_u(pi) r_a, equal masses
Xs = X.copy(); u = axis(Xs, c, n); Xs[3] = Xs[n] + Ru(u, np.pi) @ (Xs[2] - Xs[n])
Ys = rotor(Xs, th, c, n, lips); dVs = dPhi(Xs, V, th, c, n, lips)
print('== on Sigma ==')
for name, A in [('A_orth', A_orth), ('A_naive', A_naive), ('A_LC', A_LC)]:
    print(name, 'value', A(Xs, V, m, c, n, lips), ' invariance err', A(Ys, dVs, m, c, n, lips) - A(Xs, V, m, c, n, lips))
# angular momentum of the rotor generator
J = angmom(Xs, xi(Xs, c, n, lips), m)
print('J(xi) on Sigma =', J, ' I_u^lips u =', Iu(Xs, m, c, n, lips) * u)

print('== SO3 mech connection rotor invariance on Sigma ==')
for k in range(3):
    Vr = rng.normal(size=X.shape)
    print(np.abs(A_mech_so3(Ys, dPhi(Xs, Vr, th, c, n, lips), m) - A_mech_so3(Xs, Vr, m)).max())

# ---------- cone holonomy for A_LC ----------
print('== cone holonomy (lab frame, A_LC) ==')
def cone_holonomy(theta0, mol_r=((0.75, 0.96, 0.0), (0.75, -0.96, 0.0)), steps=4000):
    # C at origin, N = u(t) * 1.47; lips rigid relative to axis with zero spin: horizontal lift by solving A_LC = 0
    r_body = [np.array(r) for r in mol_r]  # in frame where u = e_x
    def u_of(t):
        return np.array([np.cos(theta0), np.sin(theta0) * np.cos(t), np.sin(theta0) * np.sin(t)])
    # build configuration given u and a frame angle psi about u, using a gauge frame e(u)
    def config(t, psi):
        u = u_of(t)
        e = np.array([0, 0, 0.0]); a = np.array([0, -np.sin(t), np.cos(t)]); e = a - u * (u @ a); e /= np.linalg.norm(e)
        f = np.cross(u, e)
        Xc = np.zeros((4, 3)); Xc[1] = 1.47 * u
        for k, r in enumerate(r_body):
            z, s1, s2 = r  # z along u, s in plane
            sv = s1 * (np.cos(psi) * e + np.sin(psi) * f) + s2 * (-np.sin(psi) * e + np.cos(psi) * f)
            Xc[2 + k] = Xc[1] + z * u + sv
        return Xc
    mm = np.array([12, 14, 16, 16.0])
    def rhs(t, y):
        psi = y[0]; h = 1e-6
        Xc = config(t, psi)
        Vt = (config(t + h, psi) - config(t - h, psi)) / (2 * h)
        Vp = (config(t, psi + h) - config(t, psi - h)) / (2 * h)
        a_t = A_LC(Xc, Vt, mm, 0, 1, [2, 3]); a_p = A_LC(Xc, Vp, mm, 0, 1, [2, 3])
        return [-a_t / a_p]
    sol = solve_ivp(rhs, [0, 2 * np.pi], [0.0], rtol=1e-10, atol=1e-12)
    X0c = config(0, 0); X1c = config(2 * np.pi, sol.y[0, -1])
    # angle by which lips rotated about u
    u = u_of(0); a0 = X0c[2] - X0c[1]; a1 = X1c[2] - X1c[1]
    a0 -= u * (u @ a0); a1 -= u * (u @ a1)
    ang = np.arctan2(u @ np.cross(a0, a1), a0 @ a1)
    return ang
for th0 in [np.radians(30), np.arccos(0.75), np.radians(60), np.radians(75)]:
    h = cone_holonomy(th0)
    print(f'cone half-angle {np.degrees(th0):6.2f} deg: holonomy {np.degrees(h):8.3f} deg,  solid angle 2pi(1-cos) = {np.degrees(2*np.pi*(1-np.cos(th0))) % 360:8.3f} deg')
