import numpy as np
from scipy.linalg import expm
exec(open('nitro_curvature.py').read().split('X = X0 - com(X0)')[0])
X = X0 - com(X0)
def turn(X, phi):
    o = X[2]; u = (X[2]-X[1])/np.linalg.norm(X[2]-X[1]); Y = X.copy(); R = expm(hat(u*phi))
    for a in (3, 4): Y[a] = o + R @ (X[a]-o)
    return Y
def kabsch(P, Q):  # rotation R minimising sum m |R Q - P|^2 (both centred)
    Hm = (m[:, None]*Q).T @ P
    U, S, Vt = np.linalg.svd(Hm); d = np.sign(np.linalg.det(Vt.T @ U.T))
    return Vt.T @ np.diag([1, 1, d]) @ U.T
K = 20000; Y = X.copy()
for k in range(1, K+1):
    Z = turn(X, 2*np.pi*k/K); Z = Z - com(Z)
    # place Z in the lab with the rotation that best matches the previous lab configuration (zero angular momentum step)
    R = kabsch(Y, Z); Y = (R @ Z.T).T
Rfin = kabsch(Y, X).T   # Y = Rfin X
ang = np.degrees(np.arccos((np.trace(Rfin)-1)/2))
w = np.array([Rfin[2,1]-Rfin[1,2], Rfin[0,2]-Rfin[2,0], Rfin[1,0]-Rfin[0,1]]); w /= np.linalg.norm(w)
print("Kabsch-stepping holonomy: angle", ang, "axis", np.round(w, 4), " shape mismatch", np.abs(Y - (Rfin @ X.T).T).max())
# abelian estimate along u
u = (X[2]-X[1])/np.linalg.norm(X[2]-X[1]); tot = np.zeros(3); n=4000
for k in range(n):
    p = 2*np.pi*(k+0.5)/n; V = (turn(X, p+1e-6)-turn(X, p-1e-6))/2e-6*(2*np.pi/n)
    tot += -omega(turn(X, p), V)
print("abelian integral of body angular velocity:", np.degrees(tot), "deg; component along u:", np.degrees(tot @ u))
