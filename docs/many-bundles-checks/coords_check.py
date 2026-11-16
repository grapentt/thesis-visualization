import numpy as np
exec(open('rotor_checks.py').read().split('# ---------- test molecule')[0])
m = np.array([12, 14, 16, 16.0])
def config(q):
    vt, vp, pa, beta, ra, rb, za, zb, L = q
    u = np.array([np.sin(vt)*np.cos(vp), np.sin(vt)*np.sin(vp), np.cos(vt)])
    e = np.array([np.cos(vt)*np.cos(vp), np.cos(vt)*np.sin(vp), -np.sin(vt)])  # e_theta
    f = np.cross(u, e)  # e_phi
    X = np.zeros((4, 3)); X[0] = np.array([0.3, -0.2, 0.5]); X[1] = X[0] + L*u
    for k, (r, z, ph) in enumerate([(ra, za, pa), (rb, zb, pa + beta)]):
        X[2+k] = X[1] + z*u + r*(np.cos(ph)*e + np.sin(ph)*f)
    return X
q = np.array([1.1, 0.4, 0.7, 2.3, 1.0, 0.6, 0.5, -0.3, 1.47])
names = ['theta', 'phi', 'phi_a', 'beta', 'rho_a', 'rho_b', 'z_a', 'z_b', 'L']
X = config(q); wb = m[3]*q[5]**2/(m[2]*q[4]**2 + m[3]*q[5]**2)
pred = {'theta': 0, 'phi': np.cos(q[0]), 'phi_a': 1, 'beta': wb, 'rho_a': 0, 'rho_b': 0, 'z_a': 0, 'z_b': 0, 'L': 0}
for k, nm in enumerate(names):
    h = 1e-6; dq = np.zeros(9); dq[k] = h
    V = (config(q + dq) - config(q - dq))/(2*h)
    print(f'A_LC(d/d{nm:6s}) = {A_LC(X, V, m, 0, 1, [2, 3]): .6f}   predicted {pred[nm]: .6f}')
