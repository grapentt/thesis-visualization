import numpy as np
np.set_printoptions(precision=5, suppress=True)
rng = np.random.default_rng(0)
d2r = np.pi/180
# nitromethane-like geometry; axis = x (C -> N)
rCN, rNO, aONO, rCH, aHCN = 1.489, 1.224, 125.3, 1.088, 107.2
C = np.zeros(3); N = np.array([rCN,0,0])
h = aONO/2*d2r
O1 = N + rNO*np.array([np.cos(h), np.sin(h), 0]); O2 = N + rNO*np.array([np.cos(h), -np.sin(h), 0])
Hs = [C + rCH*np.array([np.cos(aHCN*d2r), np.sin(aHCN*d2r)*np.cos(p), np.sin(aHCN*d2r)*np.sin(p)]) for p in (np.pi/2 + 2*np.pi/3*k for k in range(3))]
X = np.array([C, N, O1, O2] + Hs)
m = np.array([12., 14., 16., 16., 1., 1., 1.])
iC, iN, iO1, iO2 = 0, 1, 2, 3
def centre(X, m): return X - (m[:,None]*X).sum(0)/m.sum()
def inertia(X, m):
    return sum(mi*(xi@xi*np.eye(3) - np.outer(xi, xi)) for mi, xi in zip(m, X))
def Lmom(X, U, m): return sum(mi*np.cross(xi, ui) for mi, xi, ui in zip(m, X, U))
def A(X, U, m):
    Xc = centre(X, m); Uc = U - (m[:,None]*U).sum(0)/m.sum()
    return np.linalg.solve(inertia(Xc, m), Lmom(Xc, Uc, m))
def Rot(axis, th):
    a = axis/np.linalg.norm(axis); K = np.array([[0,-a[2],a[1]],[a[2],0,-a[0]],[-a[1],a[0],0]])
    return np.eye(3) + np.sin(th)*K + (1-np.cos(th))*K@K
Xc = centre(X, m)
I = inertia(Xc, m)
print("CoM-centred inertia tensor (amu A^2):\n", I)
print("principal moments:", np.linalg.eigvalsh(I))
# lips' inertia about N in frame (e, f, n)
r = np.array([O1-N, O2-N])
IL = inertia(r, np.array([16.,16.]))
print("NO2 lips inertia about N  I_e, I_f, I_n =", IL[0,0], IL[1,1], IL[2,2])
# axis moments
def axial(P, ms, base, e):
    return sum(mi*np.sum(np.cross(e, p-base)**2) for mi, p in zip(ms, P))
e = np.array([1.,0,0])
I_NO2 = axial([O1,O2],[16,16],N,e); I_CH3 = axial(Hs,[1,1,1],C,e)
print("I_NO2 about axis", I_NO2, " I_CH3 about axis", I_CH3,
      " predicted holonomy per 2pi torsion (deg):", 360*I_CH3/(I_CH3+I_NO2))
# integrate horizontal lift along torsion loop: NO2 rotates by phi relative to CH3
def shape(phi):
    Y = X.copy()
    R = Rot(e, phi)
    for i in (iO1, iO2): Y[i] = N + R@(X[i]-N)
    return Y
nstep = 20000
g = np.eye(3); phis = np.linspace(0, 2*np.pi, nstep+1)
for k in range(nstep):
    p0, p1 = phis[k], phis[k+1]
    Y0, Y1 = shape(p0), shape(p1)
    pm = 0.5*(p0+p1); Ym = shape(pm)
    U = (Y1-Y0)/(p1-p0)
    om = A(Ym, U, m)   # angular velocity of the shape curve in gauge sigma
    # horizontal lift x = g sigma: g^{-1} gdot = -A  (left action, body ang vel)
    g = g @ Rot(om, -np.linalg.norm(om)*(p1-p0)) if np.linalg.norm(om)>0 else g
ang = np.arccos(np.clip((np.trace(g)-1)/2, -1, 1))/d2r
w, v = np.linalg.eig(g); ax = np.real(v[:, np.argmin(abs(w-1))])
print("numerical holonomy of torsion loop: angle %.3f deg about axis" % ang, ax)

# Massive bead coupling: molecule horizontal + bead fixed in lab => total L about total CoM = 0
mu = 16.0; y = np.array([0.5, 3.0, -1.0])
Xt = centre(X, m)
# random horizontal molecule velocity
U = rng.normal(size=X.shape); U -= (m[:,None]*U).sum(0)/m.sum()
U -= np.array([np.cross(A(Xt, U, m), x) for x in Xt])
print("molecule L after projection:", Lmom(Xt, U, m))
Xall = np.vstack([Xt, y]); mall = np.append(m, mu); Uall = np.vstack([U, np.zeros(3)])
print("combined A-tilde on (horizontal molecule, bead at rest):", A(Xall, Uall, mall))
# combined connection vs molecule connection + first-order correction, for small mu and moving bead
for mu_ in (1e-1, 1e-2, 1e-3):
    wv = rng.normal(size=3)
    Uall = np.vstack([U + 0*U, wv]); mall = np.append(m, mu_)
    At = A(np.vstack([Xt, y]), Uall, mall)
    Om0 = A(Xt, U, m)
    corr = np.linalg.solve(inertia(Xt, m), mu_*np.cross(y, wv - np.cross(Om0, y)))
    print("mu=%g |Atilde - A| = %.3e  |Atilde - A - corr| = %.3e" % (mu_, np.linalg.norm(At-Om0), np.linalg.norm(At-Om0-corr)))

# Rotor action: rho_theta rotates lips about axis through N with direction e(x)=(xN-xC)/|.|
def rho(Xq, th):
    Y = Xq.copy(); ee = Xq[iN]-Xq[iC]; R = Rot(ee, th)
    for i in (iO1, iO2): Y[i] = Xq[iN] + R@(Xq[i]-Xq[iN])
    return Y
th = 1.0; eps = 1e-6
mm = m
iso_err = []
for trial in range(3):
    Ur = rng.normal(size=X.shape)
    dY = (rho(X+eps*Ur, th) - rho(X-eps*Ur, th))/(2*eps)
    iso_err.append(((mm[:,None]*dY**2).sum(), (mm[:,None]*Ur**2).sum()))
print("rotor action: |d rho u|^2 vs |u|^2 :", iso_err)
# tilt-only motion: rotate C-NO2 fragment rigidly about N with omega perpendicular to axis
def tilt_KE(Xq, om):
    Ut = np.zeros_like(Xq)
    for i in (iC, iO1, iO2): Ut[i] = np.cross(om, Xq[i]-Xq[iN])
    return 0.5*(mm[:,None]*Ut**2).sum()
om = np.array([0, 0, 1.0])   # tilt about the normal of the NO2 plane
print("KE of unit tilt about z, lips at theta=0 vs 90deg:", tilt_KE(X, om), tilt_KE(rho(X, np.pi/2), om))
# axial angular momentum J(x,u) = e . sum_O m (xO-xN) x (uO-uN): invariance under rotor action
def J(Xq, Uq):
    ee = (Xq[iN]-Xq[iC]); ee /= np.linalg.norm(ee)
    return ee @ sum(16*np.cross(Xq[i]-Xq[iN], Uq[i]-Uq[iN]) for i in (iO1, iO2))
for trial in range(3):
    Ur = rng.normal(size=X.shape); Ur[iO1] = Ur[iO2] = 0  # stator/axis motion only, lips carried? no: lips fixed in space
    dY = (rho(X+eps*Ur, th) - rho(X-eps*Ur, th))/(2*eps)
    print("J(x,u)=%.3e  J(rho x, d rho u)=%.3e" % (J(X, Ur), J(rho(X, th), dY)))
# symmetric lips: general u
for trial in range(2):
    Ur = rng.normal(size=X.shape)
    dY = (rho(X+eps*Ur, th) - rho(X-eps*Ur, th))/(2*eps)
    print("general u: J(x,u)=%.6f  J(rho x, d rho u)=%.6f" % (J(X, Ur), J(rho(X, th), dY)))
# asymmetric lip pair (break C2): move O2
Xa = X.copy(); Xa[iO2] = N + rNO*np.array([np.cos(0.8), -np.sin(0.8), 0])
for trial in range(2):
    Ur = rng.normal(size=X.shape)
    dY = (rho(Xa+eps*Ur, th) - rho(Xa-eps*Ur, th))/(2*eps)
    print("asym lips: J(x,u)=%.6f  J(rho x, d rho u)=%.6f" % (J(Xa, Ur), J(rho(Xa, th), dY)))

# Euler number of the 'dihedral reference' tangent field on S^2: s(e) = vH - (vH.e) e
vH = Hs[0]-C; vH /= np.linalg.norm(vH)
def field(eu):
    return vH - (vH@eu)*eu
def index_at(p, rad=0.05, n=4000):
    # local frame at p
    a = np.cross(p, [0.3, 0.5, 0.7]); a /= np.linalg.norm(a); b = np.cross(p, a)
    angs = []
    for t in np.linspace(0, 2*np.pi, n+1):
        q = np.cos(rad)*p + np.sin(rad)*(np.cos(t)*a + np.sin(t)*b)
        # parallel frame at q: project a,b onto T_q and orthonormalise
        aq = a - (a@q)*q; aq /= np.linalg.norm(aq); bq = np.cross(q, aq)
        s = field(q); angs.append(np.arctan2(s@bq, s@aq))
    return np.round(np.sum(np.diff(np.unwrap(angs)))/(2*np.pi), 3)
print("index of reference field at +vH, -vH:", index_at(vH), index_at(-vH))

print("\n--- rotor connection on shape space M (via SO(3)-horizontal lifts) ---")
def hor(Xq, Uq):
    Xc_ = centre(Xq, m); Uc_ = Uq - (m[:,None]*Uq).sum(0)/m.sum()
    Om = np.linalg.solve(inertia(Xc_, m), Lmom(Xc_, Uc_, m))
    return Uc_ - np.array([np.cross(Om, x) for x in Xc_])
def zeta(Xq):
    Z = np.zeros_like(Xq); ee = Xq[iN]-Xq[iC]; ee /= np.linalg.norm(ee)
    for i in (iO1, iO2): Z[i] = np.cross(ee, Xq[i]-Xq[iN])
    return Z
def ip(U, V): return (m[:,None]*U*V).sum()
def Arot(Xq, Uq):
    uh, zh = hor(Xq, Uq), hor(Xq, zeta(Xq))
    return ip(uh, zh)/ip(zh, zh)
def gM(Xq, Uq): uh = hor(Xq, Uq); return ip(uh, uh)
for Xq, name in ((X, "symmetric NO2"), (Xa, "asymmetric lips")):
    for trial in range(3):
        Ur = rng.normal(size=X.shape)
        dY = (rho(Xq+eps*Ur, th) - rho(Xq-eps*Ur, th))/(2*eps)
        print("%s: A_rot(x,u)=%.6f  A_rot(rho x, d rho u)=%.6f   g_M: %.4f vs %.4f" % (name, Arot(Xq, Ur), Arot(rho(Xq, th), dY), gM(Xq, Ur), gM(rho(Xq, th), dY)))
print("|zeta^h|^2 / |zeta|^2 =", gM(X, zeta(X))/ip(zeta(X), zeta(X)), " expected I_frame/I_total(axis) =", I_CH3/(I_CH3+I_NO2))

print("\n--- symmetric lips, distorted stator (H moved), and tilted axis ---")
Xs = X.copy(); Xs[4] = Xs[4] + np.array([0.1, 0.2, -0.15]); Xs[5] = Xs[5] + np.array([-0.05, 0.1, 0.1])
for trial in range(3):
    Ur = rng.normal(size=X.shape)
    dY = (rho(Xs+eps*Ur, th) - rho(Xs-eps*Ur, th))/(2*eps)
    print("distorted stator: A_rot=%.6f vs %.6f" % (Arot(Xs, Ur), Arot(rho(Xs, th), dY)))
# lips C2-symmetric about the axis but lips not coplanar with the axis plane? (C2 about e always maps r=(a e + p) -> (a e - p))
Xt2 = X.copy(); p = np.array([0, 0.7, 0.8]); Xt2[iO1] = N + 0.5*e + p; Xt2[iO2] = N + 0.5*e - p
for trial in range(2):
    Ur = rng.normal(size=X.shape)
    dY = (rho(Xt2+eps*Ur, th) - rho(Xt2-eps*Ur, th))/(2*eps)
    print("C2-symmetric lips (other geometry): A_rot=%.6f vs %.6f" % (Arot(Xt2, Ur), Arot(rho(Xt2, th), dY)))
# lips with axial components differing (a1 != a2) but p2 = -p1
Xt3 = X.copy(); Xt3[iO1] = N + 0.4*e + p; Xt3[iO2] = N + 0.7*e - p
for trial in range(2):
    Ur = rng.normal(size=X.shape)
    dY = (rho(Xt3+eps*Ur, th) - rho(Xt3-eps*Ur, th))/(2*eps)
    print("p2=-p1 but a1!=a2: A_rot=%.6f vs %.6f" % (Arot(Xt3, Ur), Arot(rho(Xt3, th), dY)))
