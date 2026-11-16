import numpy as np
rng = np.random.default_rng(1)
# 1. J(xi)=0 off Sigma: lip b at N, COM placed at lip a
mC,mN,mA,mB,mJ = 12.,14.,16.,16.,20.
xC=np.array([0,0,0.]); xN=np.array([1.5,0,0]); xA=np.array([2.0,1.0,0.3]); xB=xN.copy()
# choose x_J so that COM = xA
M = mC+mN+mA+mB+mJ
xJ = (M*xA - (mC*xC+mN*xN+mA*xA+mB*xB))/mJ
X = np.array([xC,xN,xA,xB,xJ]); m=np.array([mC,mN,mA,mB,mJ])
u=(xN-xC)/np.linalg.norm(xN-xC)
xi=np.zeros_like(X); xi[2]=np.cross(u,xA-xN); xi[3]=np.cross(u,xB-xN)
cm=(m[:,None]*X).sum(0)/M
J=sum(mi*np.cross(x-cm,v) for mi,x,v in zip(m,X,xi)); print('J(xi) with COM at lip a, lip b on N:', J, ' lip a off axis:', np.linalg.norm(np.cross(u,xA-xN)))
# 2. Foucault: non-spinning transport of a perpendicular vector around a cone
for th0 in [30,41.41,60,75]:
    t0=np.radians(th0); n=200000; ph=np.linspace(0,2*np.pi,n+1)
    U=np.stack([np.sin(t0)*np.cos(ph),np.sin(t0)*np.sin(ph),np.cos(t0)*np.ones_like(ph)],1)
    s=np.array([np.cos(t0),0,-np.sin(t0)])  # e_theta at phi=0
    for k in range(n):
        du=U[k+1]-U[k]; s=s-(du@s)*U[k+1]; s-= (s@U[k+1])*U[k+1]; s/=np.linalg.norm(s)
    e=np.array([np.cos(t0),0,-np.sin(t0)]); f=np.cross(U[0],e)
    ang=np.degrees(np.arctan2(s@f,s@e))%360
    print(f'cone {th0}: transported vector turned by {ang:.3f} deg; 2pi(1-cos)={360*(1-np.cos(t0)):.3f}')
# 3. Levy area variance, standard 2D BM, A=1/2 int(x dy - y dx), t=1
N=2000; paths=20000; dt=1.0/N
A=np.zeros(paths); x=np.zeros(paths); y=np.zeros(paths)
for k in range(N):
    dx=rng.normal(0,np.sqrt(dt),paths); dy=rng.normal(0,np.sqrt(dt),paths)
    A+=0.5*((x+dx/2)*dy-(y+dy/2)*dx); x+=dx; y+=dy
print('Levy area var (t=1):', A.var(), ' theory 1/4')
