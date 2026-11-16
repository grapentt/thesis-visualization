import numpy as np
from scipy.integrate import solve_ivp
exec(open('rotor_checks.py').read().split('# ---------- test molecule')[0])

def torsion_holonomy(X0, m, c, n, lips, total=2*np.pi):
    def shape(phi): return rotor(X0, phi, c, n, lips)
    def rhs(t, y):
        Q = y.reshape(3, 3); Y = shape(t); h = 1e-6
        Yd = (shape(t + h) - shape(t - h)) / (2 * h)
        Om = -np.linalg.solve(inertia(Y, m), angmom(Y, Yd, m))
        return (Q @ skew(Om)).ravel()
    sol = solve_ivp(rhs, [0, total], np.eye(3).ravel(), rtol=1e-11, atol=1e-12)
    Q = sol.y[:, -1].reshape(3, 3)
    rv = Rot.from_matrix(Q).as_rotvec(); ang = np.linalg.norm(rv)
    return Q, ang, rv / ang if ang > 0 else rv

def report(name, X0, m, c, n, lips):
    X0 = np.array(X0, float).reshape(-1, 3); m = np.array(m, float)
    u = axis(X0, c, n)
    Il = Iu(X0, m, c, n, lips)
    frame = [i for i in range(len(m)) if i not in lips]
    If = sum(m[i] * np.linalg.norm(np.cross(u, X0[i] - X0[n]))**2 for i in frame)
    Q, ang, ax = torsion_holonomy(X0, m, c, n, lips)
    sgn = np.sign(ax @ u)
    print(f'{name}: I_lips={Il:.3f} I_frame(axis)={If:.3f} ratio lips/tot={Il/(Il+If):.4f}')
    print(f'   predicted (symmetric formula) holonomy R_u(2pi I_frame/I_tot) = {np.degrees(2*np.pi*If/(Il+If)):.3f} deg about u')
    print(f'   numerical: angle {np.degrees(ang)*sgn:.3f} deg, axis.u = {ax@u*sgn:.6f}')
    # also u eigenvector check and J
    J = angmom(X0, xi(X0, c, n, lips), m); I = inertia(X0, m)
    print('   J(xi)=', np.round(J, 4), ' I u =', np.round(I @ u, 4), ' I_uu =', round(u @ I @ u, 4))

# nitromethane all-atom, approx gas-phase geometry
rCN, rNO, ONO, rCH, HCN = 1.489, 1.224, np.radians(125.3), 1.088, np.radians(107.2)
C = np.zeros(3); N = np.array([rCN, 0, 0])
g = np.pi - ONO/2  # angle C-N-O
O1 = N + rNO * np.array([-np.cos(g), np.sin(g), 0]); O2 = N + rNO * np.array([-np.cos(g), -np.sin(g), 0])
Hs = [C + rCH * np.array([np.cos(HCN), np.sin(HCN) * np.cos(a), np.sin(HCN) * np.sin(a)]) for a in (np.pi/2, np.pi/2 + 2*np.pi/3, np.pi/2 + 4*np.pi/3)]
Xnm = np.array([C, N, O1, O2, *Hs]); mnm = [12, 14, 16, 16, 1, 1, 1]
report('nitromethane (C12 N14 O16 H1)', Xnm, mnm, 0, 1, [2, 3])
# same with exact isotopic masses
report('nitromethane (exact masses)', Xnm, [12.0, 14.003, 15.995, 15.995, 1.008, 1.008, 1.008], 0, 1, [2, 3])

# animation's united-atom nitroethane
LIP = 1.22; HM = np.radians(52)
Xan = [-0.52, 1.2, 0.78, 0, 0, 0, 1.47, 0, 0, 1.47 + LIP*np.cos(HM), LIP*np.sin(HM), 0, 1.47 + LIP*np.cos(HM), -LIP*np.sin(HM), 0]
report('animation nitroethane UA', Xan, [15, 14, 14, 16, 16], 1, 2, [3, 4])
