import numpy as np
lam = 0.5
print("Part 0 model, lambda=0.5, standard BM (E dx^2 = dt)")
print(" t   bridge E[th^2]  rms(deg)   E[cos th]   | free(sym gauge) E[th^2] rms(deg) E[cos] | Landau E[th^2]")
for t in [0.5, 1, 2, 4, 8, 12]:
    u = lam*t/2
    b2 = lam**2*t**2/12; f2 = lam**2*t**2/4
    print(f"{t:4} {b2:10.4f} {np.degrees(np.sqrt(b2)):9.2f} {u/np.sinh(u):10.4f}   | {f2:8.4f} {np.degrees(np.sqrt(f2)):8.2f} {1/np.cosh(u):8.4f} | {lam**2*t**2/2:8.4f}")
# OU examples
rng = np.random.default_rng(3)
for (k, D) in [(2.0, 1.0), (1.0, 0.5)]:
    s2 = D/k; Drot = lam**2*D**2/(2*k)
    print(f"\nOU k={k}, D={D}: sigma^2={s2}, sigma={np.sqrt(s2):.3f}, corr time 1/k={1/k}, D_rot = lam^2 D^2/(2k) = {Drot}")
    for t in [5, 10, 20, 40, 80]:
        V = 2*Drot*t
        g = np.sqrt(k**2 + lam**2*D**2)
        cf = np.exp(k*t)/(np.cosh(g*t) + k/g*np.sinh(g*t))
        exact_var = lam**2*D**2/k*(t - (1-np.exp(-2*k*t))/(2*k))
        print(f"   t={t:3}: Var(theta) from 0 = {exact_var:.4f} (2 D_rot t = {V:.4f}), rms = {np.degrees(np.sqrt(exact_var)):.1f} deg, E[cos theta] = {cf:.4f} (Gaussian approx {np.exp(-exact_var/2):.4f})")
    # MC check (stationary start)
    T, n, M = 200.0, 20000, 3000
    dt = T/n; a = np.exp(-k*dt); sd = np.sqrt(s2*(1-a*a))
    x = rng.standard_normal(M)*np.sqrt(s2); y = rng.standard_normal(M)*np.sqrt(s2); A = np.zeros(M)
    for _ in range(n):
        xn = a*x + sd*rng.standard_normal(M); yn = a*y + sd*rng.standard_normal(M)
        A += 0.5*(x*yn - y*xn); x, y = xn, yn
    print(f"   MC (stationary start, T={T}): Var(theta)/(2T) = {np.var(lam*A)/(2*T):.5f}  vs D_rot = {Drot}")
