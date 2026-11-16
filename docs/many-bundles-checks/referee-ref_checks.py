import numpy as np
np.set_printoptions(precision=6, suppress=True)
rng = np.random.default_rng(1)

# atoms: C, N, O1, O2, H1, H2, H3
mC, mN, mO, mH = 12., 14., 16., 1.
masses = np.array([mC, mN, mO, mO, mH, mH, mH])
iC, iN, iO1, iO2 = 0, 1, 2, 3
LIPS = [iO1, iO2]

def geom(tors=0.0, rCN=1.489, rNO=1.224, ONO=125.3, rCH=1.088, HCN=107.2,
         lip_az=(0.0, np.pi), lip_half=None, h_az=(0, 2*np.pi/3, 4*np.pi/3)):
    h = np.radians(ONO/2) if lip_half is None else lip_half
    X = np.zeros((7, 3))
    X[iN] = [0, 0, rCN]
    for k, az in enumerate(lip_az):
        hh = h if np.isscalar(h) else h[k]
        X[LIPS[k]] = X[iN] + rNO*np.array([np.sin(hh)*np.cos(az+tors), np.sin(hh)*np.sin(az+tors), np.cos(hh)])
    t = np.radians(HCN)
    for k, az in enumerate(h_az):
        X[4+k] = rCH*np.array([np.sin(t)*np.cos(az), np.sin(t)*np.sin(az), np.cos(t)])
    return X

def com(X, m=masses):
    return (m[:, None]*X).sum(0)/m.sum()

def inertia(X, m=masses):
    Y = X - com(X, m)
    I = np.zeros((3, 3))
    for mi, y in zip(m, Y):
        I += mi*(y@y*np.eye(3) - np.outer(y, y))
    return I

def angmom(X, U, m=masses):
    Y = X - com(X, m)
    return (m[:, None]*np.cross(Y, U)).sum(0)

def mech_A(X, U, m=masses):
    U = U - (m[:, None]*U).sum(0)/m.sum()  # remove CM velocity
    return np.linalg.solve(inertia(X, m), angmom(X, U, m))

def horiz(X, U, m=masses):
    # mass-orthogonal projection removing translations and rotations
    U = U - (m[:, None]*U).sum(0)/m.sum()
    w = mech_A(X, U, m)
    return U - np.cross(w, X - com(X, m))

def ip(U, V, m=masses):
    return float((m[:, None]*U*V).sum())

def skew(w):
    return np.array([[0, -w[2], w[1]], [w[2], 0, -w[0]], [-w[1], w[0], 0]])

def expso3(w):
    th = np.linalg.norm(w)
    if th < 1e-15:
        return np.eye(3)
    K = skew(w/th)
    return np.eye(3) + np.sin(th)*K + (1-np.cos(th))*K@K

def rotangle(R):
    return np.degrees(np.arccos(np.clip((np.trace(R)-1)/2, -1, 1)))

# ---- 1. inertia numbers
X0 = geom()
I0 = inertia(X0)
ev, evec = np.linalg.eigh(I0)
print("principal moments", ev)
ez = np.array([0, 0, 1.])
Y = X0 - com(X0)
Iax = lambda idx: sum(masses[i]*(Y[i, 0]**2+Y[i, 1]**2) for i in idx)
I_NO2, I_CH3 = Iax(LIPS), Iax([4, 5, 6])
print("I_NO2, I_CH3, sum", I_NO2, I_CH3, I_NO2+I_CH3)
print("closed form holonomy deg", 360*I_CH3/(I_CH3+I_NO2))
print("rotational consts MHz (505379/I):", 505379.0/ev)

# ---- 2. torsion holonomy by integrating mechanical connection along shape loop
def holonomy(curve, n=4000):
    g = np.eye(3)
    ds = 1.0/n
    for k in range(n):
        s = (k+0.5)*ds
        X = curve(s)
        U = (curve(s+1e-6)-curve(s-1e-6))/2e-6
        a = mech_A(X, U)  # body-gauge connection
        g = g@expso3(-a*ds)   # g^{-1} gdot = -a  (left-action convention)
    return g

h = holonomy(lambda s: geom(tors=2*np.pi*s))
print("torsion holonomy angle deg", rotangle(h), "axis", np.round(h - h.T, 6)[[2, 0, 1], [1, 2, 0]])

# ---- 3. rotor action, rotor mechanical connection, invariance tests
def Rax(e, th):
    return expso3(e*th)

def rho(X, th):
    Xn = X.copy()
    e = (X[iN]-X[iC]); e /= np.linalg.norm(e)
    R = Rax(e, th)
    for i in LIPS:
        Xn[i] = X[iN] + R@(X[i]-X[iN])
    return Xn

def zeta(X):
    e = (X[iN]-X[iC]); e /= np.linalg.norm(e)
    Z = np.zeros_like(X)
    for i in LIPS:
        Z[i] = np.cross(e, X[i]-X[iN])
    return Z

def A_rot(X, U):
    Z = zeta(X)
    Zh = horiz(X, Z)
    return ip(horiz(X, U), Z)/ip(Zh, Z)

def drho(X, U, th, eps=1e-6):
    return (rho(X+eps*U, th)-rho(X-eps*U, th))/(2*eps)

def inv_test(X, th=1.1, trials=5):
    errs = []
    for _ in range(trials):
        U = rng.normal(size=X.shape)
        a0 = A_rot(X, U)
        a1 = A_rot(rho(X, th), drho(X, U, th))
        errs.append((a0, a1))
    return errs

print("\n-- rotor connection invariance at symmetric locus")
for a0, a1 in inv_test(X0):
    print(f"  {a0: .8f} {a1: .8f}  diff {a1-a0: .2e}")
print("-- with lips C2-broken (asymmetric azimuths)")
Xb = geom(lip_az=(0.0, np.pi-0.4))
for a0, a1 in inv_test(Xb, trials=3):
    print(f"  {a0: .6f} {a1: .6f}  diff {a1-a0: .2e}")
print("-- with lips C2-symmetric but stator broken (one H moved)")
Xs = geom(h_az=(0, 2*np.pi/3+0.5, 4*np.pi/3))
for a0, a1 in inv_test(Xs, trials=3):
    print(f"  {a0: .6f} {a1: .6f}  diff {a1-a0: .2e}")
print("-- stator C3 but whole CM off axis? (C3 stator => CM on axis). Use H masses unequal")
m_save = masses.copy()
masses[4] = 2.0
for a0, a1 in inv_test(X0, trials=3):
    print(f"  {a0: .6f} {a1: .6f}  diff {a1-a0: .2e}")
masses[:] = m_save

# reduced-metric isometry test at symmetric locus
print("\n-- reduced metric |u^h|^2 vs |(drho u)^h|^2 at symmetric locus")
for _ in range(3):
    U = rng.normal(size=X0.shape)
    print("  ", ip(horiz(X0, U), horiz(X0, U)), ip(horiz(rho(X0, 1.1), drho(X0, U, 1.1)), horiz(rho(X0, 1.1), drho(X0, U, 1.1))))

Z = zeta(X0); Zh = horiz(X0, Z)
print("|zeta^h|^2/|zeta|^2", ip(Zh, Z)/ip(Z, Z), " I_CH3/I_par", I_CH3/(I_CH3+I_NO2))

# ---- 4. Prop 5.4 uniqueness coefficient: E(zeta) = sum m <J p, nabla_zeta p>
def p_proj(X, i):
    e = (X[iN]-X[iC]); e /= np.linalg.norm(e)
    r = X[i]-X[iN]
    return r - (r@e)*e, e
Uh = horiz(X0, Z)
eps = 1e-6
Ezeta = 0.0
for i in LIPS:
    p0, e = p_proj(X0, i)
    p1, _ = p_proj(X0+eps*Uh, i)
    p_1, _ = p_proj(X0-eps*Uh, i)
    dp = (p1-p_1)/(2*eps)
    Ezeta += masses[i]*np.cross(e, p0)@dp
print("\nE(zeta) =", Ezeta, " sum m|p|^2 =", sum(masses[i]*p_proj(X0, i)[0]@p_proj(X0, i)[0] for i in LIPS),
      " |zeta^h|^2 =", ip(Zh, Z))

# ---- 5. tilt kinetic energies
def tiltKE(X, w):
    U = np.zeros_like(X)
    for i in [iC] + LIPS:
        U[i] = np.cross(w, X[i]-X[iN])
    return 0.5*ip(U, U)
print("\ntilt KE about N, axis normal to NO2 plane:", tiltKE(X0, np.array([0, 1., 0])),
      " in-plane:", tiltKE(X0, np.array([1., 0, 0])))

# ---- 6. Theorem 2.4(c) first-order test at a FIXED point and vector
def A_total(X, Y, U, W, mus):
    Xall = np.vstack([X, Y]); Uall = np.vstack([U, W]); mall = np.concatenate([masses, mus])
    return mech_A(Xall, Uall, mall)
Xc = X0 - com(X0)
U = horiz(Xc, rng.normal(size=Xc.shape)) + 0.3*rng.normal(size=Xc.shape)
U = U - (masses[:, None]*U).sum(0)/masses.sum()
Yb = rng.normal(size=(2, 3))*2; Wb = rng.normal(size=(2, 3))
Om0 = mech_A(Xc, U)
print("\nmu   err(first order)   ratio")
prev = None
for mu in [1e-1, 1e-2, 1e-3, 1e-4]:
    mus = np.array([mu, mu])
    ex = A_total(Xc, Yb, U, Wb, mus)
    fo = Om0 + np.linalg.solve(inertia(Xc), sum(mus[a]*np.cross(Yb[a], Wb[a]-np.cross(Om0, Yb[a])) for a in range(2)))
    err = np.linalg.norm(ex-fo)
    print(mu, err, (prev/err if prev else None))
    prev = err

# ---- 7. cone holonomy via Levi-Civita transport on S^2
def cone(alpha, n=20000):
    f = None
    for k in range(n+1):
        t = 2*np.pi*k/n
        e = np.array([np.sin(alpha)*np.cos(t), np.sin(alpha)*np.sin(t), np.cos(alpha)])
        if f is None:
            f0 = np.array([np.cos(alpha)*np.cos(t), np.cos(alpha)*np.sin(t), -np.sin(alpha)])
            f = f0.copy()
        else:
            f = f - (f@e)*e; f /= np.linalg.norm(f)
    # angle from f0 to f measured about e (=e at t=0)
    e0 = np.array([np.sin(alpha), 0, np.cos(alpha)])
    return np.degrees(np.arctan2(np.cross(f0, f)@e0, f0@f))
for a in [30, 60]:
    print("cone", a, cone(np.radians(a)), "expected", 360*(1-np.cos(np.radians(a))))

# ---- 8. 6.03 cal/mol conversions
E = 6.03*4.184
print("\nJ/mol", E, "cm-1", E/11.9627, "meV", E/96.485*1000, "kT300", E/(8.314462*300))
