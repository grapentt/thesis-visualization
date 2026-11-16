import numpy as np
rng = np.random.default_rng(1)

def bm_paths(M, n, t):
    dt = t / n
    dW = rng.standard_normal((M, n, 2)) * np.sqrt(dt)
    X = np.concatenate([np.zeros((M, 1, 2)), np.cumsum(dW, axis=1)], axis=1)
    return X

def area(X):
    x, y = X[..., 0], X[..., 1]
    # Stratonovich (midpoint) = 1/2 sum (x_k y_{k+1} - y_k x_{k+1})
    return 0.5 * np.sum(x[:, :-1] * y[:, 1:] - y[:, :-1] * x[:, 1:], axis=1)

M, n, t = 40000, 400, 1.0
X = bm_paths(M, n, t)
A = area(X)
print("free: E[A^2] =", np.mean(A**2), " theory t^2/4 =", t**2 / 4)
# Landau gauge: int x dy
x, y = X[..., 0], X[..., 1]
AL = np.sum(0.5 * (x[:, :-1] + x[:, 1:]) * np.diff(y, axis=1), axis=1)
print("free, Landau gauge: E[(int x dy)^2] =", np.mean(AL**2), " theory t^2/2 =", t**2 / 2)
for mu in [1.0, 3.0]:
    print(f"free char fn mu={mu}:", np.mean(np.cos(mu * A)), " 1/cosh(mu t/2) =", 1 / np.cosh(mu * t / 2))
# bridge: B_s - (s/t) B_t
s = np.linspace(0, t, n + 1)
Xb = X - (s / t)[None, :, None] * X[:, -1:, :]
Ab = area(Xb)
print("bridge: E[A^2] =", np.mean(Ab**2), " theory t^2/12 =", t**2 / 12)
for mu in [1.0, 3.0, 6.0]:
    u = mu * t / 2
    print(f"bridge char fn mu={mu}:", np.mean(np.cos(mu * Ab)), " u/sinh u =", u / np.sinh(u))
print("bridge mean A:", np.mean(Ab), "+-", np.std(Ab) / np.sqrt(M))

# OU isotropic and anisotropic
def ou_area(k1, k2, D, T, n, M, start_stationary=True):
    dt = T / n
    x = rng.standard_normal(M) * np.sqrt(D / k1) if start_stationary else np.zeros(M)
    y = rng.standard_normal(M) * np.sqrt(D / k2) if start_stationary else np.zeros(M)
    A = np.zeros(M)
    # exact OU transition
    a1, a2 = np.exp(-k1 * dt), np.exp(-k2 * dt)
    s1 = np.sqrt(D / k1 * (1 - a1**2)); s2 = np.sqrt(D / k2 * (1 - a2**2))
    for _ in range(n):
        xn = a1 * x + s1 * rng.standard_normal(M)
        yn = a2 * y + s2 * rng.standard_normal(M)
        A += 0.5 * (x * yn - y * xn)
        x, y = xn, yn
    return A

D = 0.5
for (k1, k2) in [(0.5, 0.5), (1.0, 1.0), (0.5, 2.0)]:
    T = 200.0
    A = ou_area(k1, k2, D, T, 20000, 4000)
    print(f"OU k=({k1},{k2}) D={D}: Var(A)/T =", np.var(A) / T, " theory 2D^2/(k1+k2) =", 2 * D**2 / (k1 + k2))

# OU char function from 0, isotropic: e^{kt}/(cosh(g t)+(k/g) sinh(g t)), g = sqrt(k^2+mu^2 D^2)
k, D, T = 1.0, 0.5, 3.0
A = ou_area(k, k, D, T, 3000, 40000, start_stationary=False)
for mu in [1.0, 2.0, 4.0]:
    g = np.sqrt(k**2 + mu**2 * D**2)
    th = np.exp(k * T) / (np.cosh(g * T) + (k / g) * np.sinh(g * T))
    print(f"OU from 0 char fn mu={mu}:", np.mean(np.cos(mu * A)), " formula =", th)
print("OU from 0 Var(A) =", np.var(A), " theory (D^2/k)(T-(1-e^{-2kT})/(2k)) =", D**2 / k * (T - (1 - np.exp(-2 * k * T)) / (2 * k)))
