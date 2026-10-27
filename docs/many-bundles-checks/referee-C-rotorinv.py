import numpy as np
from scipy.linalg import expm, null_space
LIP=1.22; HM=np.radians(52)
X0=np.array([[-0.52,1.2,0.78],[0,0,0],[1.47,0,0],[1.47+LIP*np.cos(HM),LIP*np.sin(HM),0],[1.47+LIP*np.cos(HM),-LIP*np.sin(HM),0]])
m=np.array([15,14,14,16,16.]); G=np.diag(np.repeat(m,3))
def hat(w): return np.array([[0,-w[2],w[1]],[w[2],0,-w[0]],[-w[1],w[0],0]])
def turn(x,phi):
    X=x.reshape(5,3); o=X[2]; u=(X[2]-X[1])/np.linalg.norm(X[2]-X[1]); Y=X.copy(); R=expm(hat(u*phi))
    for a in (3,4): Y[a]=o+R@(X[a]-o)
    return Y.ravel()
def gen(x): h=1e-6; return (turn(x,h)-turn(x,-h))/(2*h)
def jac(x,phi):
    J=np.zeros((15,15)); h=1e-6
    for k in range(15):
        e=np.zeros(15); e[k]=h; J[:,k]=(turn(x+e,phi)-turn(x-e,phi))/(2*h)
    return J
def defect(x,phi):
    V=gen(x); Hx=null_space((G@V)[None,:])   # G-orthogonal complement of rotor orbit (14-dim)
    J=jac(x,phi); Vp=gen(turn(x,phi))
    vals=(J@Hx).T@G@Vp
    return np.abs(vals).max()/np.linalg.norm(np.sqrt(np.diag(G))*Vp), np.abs(J.T@G@J-G).max()
x0=X0.ravel()
rng=np.random.default_rng(1)
xg=x0+0.15*rng.normal(size=15)
for name,x in [("drawn pose (C2v-symmetric NO2)",x0),("generic perturbed shape",xg)]:
    for phi in [np.pi/2,np.pi]:
        d,iso=defect(x,phi)
        print(f"{name}, phi={phi:.2f}: max |G(dPhi w, V(Phi x))|/|V| over unit w in H_x = {d:.2e};  max|J^T G J - G| = {iso:.1f}")
