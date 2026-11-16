import numpy as np
from scipy.linalg import expm, logm, null_space
LIP=1.22; HM=np.radians(62.5)
X0=np.array([[-0.52,1.2,0.78],[0,0,0],[1.47,0,0],[1.47+LIP*np.cos(HM),LIP*np.sin(HM),0],[1.47+LIP*np.cos(HM),-LIP*np.sin(HM),0]])
m=np.array([15,14,14,16,16.]); N=5
def com(X): return (m[:,None]*X).sum(0)/m.sum()
def Iner(X):
    r=X-com(X); return sum(mi*(r_@r_*np.eye(3)-np.outer(r_,r_)) for mi,r_ in zip(m,r))
def hat(w): return np.array([[0,-w[2],w[1]],[w[2],0,-w[0]],[-w[1],w[0],0]])
X=X0-com(X0); I=Iner(X)
print("principal moments",np.linalg.eigvalsh(I))
# vertical (translations+rotations) in mass-weighted coords q=sqrt(m)x
sq=np.sqrt(m)
Vs=[]
for k in range(3):
    e=np.zeros((N,3)); e[:,k]=1; Vs.append((sq[:,None]*e).ravel())
    xi=np.zeros(3); xi[k]=1; Vs.append((sq[:,None]*np.cross(xi,X)).ravel())
H=null_space(np.array(Vs))   # 15x9 orthonormal horizontal (q coords)
n=H.shape[1]; print("dim horizontal",n)
Om=np.zeros((3,n,n))
for i in range(n):
  for j in range(n):
    u=H[:,i].reshape(N,3)/sq[:,None]; v=H[:,j].reshape(N,3)/sq[:,None]
    J=(m[:,None]*np.cross(u,v)).sum(0); Om[:,i,j]=2*np.linalg.solve(I,J)
YMe=sum(Om[:,i,j]@Om[:,i,j] for i in range(n) for j in range(i+1,n))
YMI=sum(Om[:,i,j]@I@Om[:,i,j] for i in range(n) for j in range(i+1,n))
print("sum|Om|^2 eucl",YMe,"sum Om.I.Om",YMI,"s_M=1.5*",1.5*YMI)
print("rms rot per unit t (deg):",np.degrees(np.sqrt(YMe/12)))
# max sectional curvature over ALL planes: K=3 J.I^-1.J ; maximize via random search + local optimization
from scipy.optimize import minimize
def negK(p):
    a=p[:n]; b=p[n:]; a=a/np.linalg.norm(a); b=b-(b@a)*a; b=b/np.linalg.norm(b)
    w=np.einsum('kij,i,j->k',Om,a,b); return -0.75*w@I@w
best=0
rng=np.random.default_rng(0)
for s in range(20):
    r=minimize(negK,rng.normal(size=2*n)); best=max(best,-r.fun)
print("max sectional curvature over all horizontal planes",best)
# rotor holonomy, RK4 on body-frame ODE R' = R hat(w_b(phi))
def turn(X,phi):
    o=X[2]; u=(X[2]-X[1])/np.linalg.norm(X[2]-X[1]); Y=X.copy(); R=expm(hat(u*phi))
    for a in (3,4): Y[a]=o+R@(X[a]-o)
    return Y
def dturn(X,phi):  # analytic derivative wrt phi
    o=X[2]; u=(X[2]-X[1])/np.linalg.norm(X[2]-X[1]); Y=np.zeros_like(X); R=expm(hat(u*phi))
    for a in (3,4): Y[a]=np.cross(u,R@(X[a]-o))
    return Y
def wb(phi):
    Y=turn(X,phi); V=dturn(X,phi); r=Y-com(Y)
    L=(m[:,None]*np.cross(r,V)).sum(0); return -np.linalg.solve(Iner(Y),L)
# integrate quaternion-free: use Magnus-like midpoint exp steps with RK-consistent ordering
K=1000; h=2*np.pi/K; R=np.eye(3)
for k in range(K):
    p=k*h
    # 4th order Magnus (Gauss points)
    c1=0.5-np.sqrt(3)/6; c2=0.5+np.sqrt(3)/6
    A1=hat(wb(p+c1*h)); A2=hat(wb(p+c2*h))
    Om4=h/2*(A1+A2)+np.sqrt(3)/12*h*h*(A2@A1-A1@A2)
    R=R@expm(Om4)
w=logm(R).real; w=np.array([w[2,1],w[0,2],w[1,0]]); ang=np.linalg.norm(w)
u=(X[2]-X[1])/np.linalg.norm(X[2]-X[1])
print("rotor holonomy angle",np.degrees(ang),"axis",w/ang,"angle to C2->N",np.degrees(np.arccos(abs(w@u)/ang)), "sign along u", np.sign(w@u))
print("orthogonality check R",np.abs(R@R.T-np.eye(3)).max())
# components: what does Rbody(phi) look like - total rotation angle path
