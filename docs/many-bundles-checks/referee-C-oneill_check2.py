# Independent check of K_M = 3 J.I^-1.J (O'Neill + Omega = 2 I^-1 J) for N=4 bodies,
# computing the curvature of the quotient metric directly in pairwise-distance coordinates.
import numpy as np, itertools
rng=np.random.default_rng(3)
m=np.array([12.,14.,16.,1.]); N=4
pairs=list(itertools.combinations(range(N),2))
X0=rng.normal(size=(N,3))
def dists(X): return np.array([np.linalg.norm(X[i]-X[j]) for i,j in pairs])
def dd_dx(X):
    J=np.zeros((6,3*N))
    for a,(i,j) in enumerate(pairs):
        e=(X[i]-X[j])/np.linalg.norm(X[i]-X[j]); J[a,3*i:3*i+3]=e; J[a,3*j:3*j+3]=-e
    return J
Ginv=np.diag(1/np.repeat(m,3))
def embed(d):  # MDS reconstruction (any isometric embedding)
    D2=np.zeros((N,N))
    for a,(i,j) in enumerate(pairs): D2[i,j]=D2[j,i]=d[a]**2
    Gr=-0.5*(D2-D2[:,[0]]-D2[[0],:])
    w,V=np.linalg.eigh(Gr); idx=np.argsort(w)[::-1][:3]
    return V[:,idx]*np.sqrt(np.maximum(w[idx],0))
def g(d):
    X=embed(d); J=dd_dx(X); return np.linalg.inv(J@Ginv@J.T)
import time; t0=time.time()
d0=dists(X0); n=6; h=2e-3
def dg(d,a):
    e=np.zeros(n); e[a]=h; return (g(d+e)-g(d-e))/(2*h)
def ddg(d,a,b):
    ea=np.zeros(n); ea[a]=h; eb=np.zeros(n); eb[b]=h
    return (g(d+ea+eb)-g(d+ea-eb)-g(d-ea+eb)+g(d-ea-eb))/(4*h*h)
G0=g(d0); Gi=np.linalg.inv(G0)
D1=np.array([dg(d0,a) for a in range(n)])          # D1[c,a,b]=d_c g_ab
D2=np.array([[ddg(d0,a,b) for b in range(n)] for a in range(n)])  # D2[c,e,a,b]
# Christoffel: Gamma^k_ij = 1/2 g^kl (d_i g_lj + d_j g_li - d_l g_ij)
Gam=np.zeros((n,n,n))
for k in range(n):
  for i in range(n):
    for j in range(n):
      Gam[k,i,j]=0.5*sum(Gi[k,l]*(D1[i,l,j]+D1[j,l,i]-D1[l,i,j]) for l in range(n))
# R_abcd (all lower), convention R(X,Y,Y,X)=K>0 on sphere
def Rlow(a,b,c,d):
    t=0.5*(D2[b,c,a,d]+D2[a,d,b,c]-D2[a,c,b,d]-D2[b,d,a,c])
    t+=sum(G0[e,f]*(Gam[e,b,c]*Gam[f,a,d]-Gam[e,b,d]*Gam[f,a,c]) for e in range(n) for f in range(n))
    return t
# vectorized: D2[c,e,a,b] = d_c d_e g_ab
T1=0.5*(np.einsum('bcad->abcd',D2)+np.einsum('adbc->abcd',D2)-np.einsum('acbd->abcd',D2)-np.einsum('bdac->abcd',D2))
T2=np.einsum('ef,ebc,fad->abcd',G0,Gam,Gam)-np.einsum('ef,ebd,fac->abcd',G0,Gam,Gam)
R=T1+T2
print('R antisym check',np.abs(R+R.transpose(1,0,2,3)).max(),np.abs(R-R.transpose(2,3,0,1)).max(),flush=True)
# horizontal orthonormal pair at X = embed(d0)
X=embed(d0); c=(m[:,None]*X).sum(0)/m.sum(); r=X-c
sq=np.sqrt(m)
V=[]
for k in range(3):
    e=np.zeros((N,3)); e[:,k]=1; V.append((sq[:,None]*e).ravel())
    xi=np.zeros(3); xi[k]=1; V.append((sq[:,None]*np.cross(xi,r)).ravel())
from scipy.linalg import null_space
H=null_space(np.array(V))  # q-coords
I=sum(mi*(ri@ri*np.eye(3)-np.outer(ri,ri)) for mi,ri in zip(m,r))
Jd=dd_dx(X)
for trial in range(4):
    a=rng.normal(size=6); b=rng.normal(size=6)
    q1=H@a; q1/=np.linalg.norm(q1); q2=H@b; q2-=(q2@q1)*q1; q2/=np.linalg.norm(q2)
    u=(q1.reshape(N,3)/sq[:,None]); v=(q2.reshape(N,3)/sq[:,None])
    Xv=Jd@u.ravel(); Yv=Jd@v.ravel()   # pushforwards in d-coords
    num=np.einsum('abcd,a,b,c,d',R,Xv,Yv,Yv,Xv)
    den=(Xv@G0@Xv)*(Yv@G0@Yv)-(Xv@G0@Yv)**2
    Jv=(m[:,None]*np.cross(u,v)).sum(0)
    print(f"|X|^2={Xv@G0@Xv:.6f}  K_direct={num/den:.6f}   3 J.I^-1.J={3*Jv@np.linalg.solve(I,Jv):.6f}")
