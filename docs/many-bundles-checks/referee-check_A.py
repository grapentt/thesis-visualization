import numpy as np
from scipy.integrate import solve_ivp
from scipy.spatial.transform import Rotation as Rot

def Ru(u, th):
    u = u/np.linalg.norm(u); K = np.array([[0,-u[2],u[1]],[u[2],0,-u[0]],[-u[1],u[0],0]])
    return np.eye(3) + np.sin(th)*K + (1-np.cos(th))*K@K
def skew(w): return np.array([[0,-w[2],w[1]],[w[2],0,-w[0]],[-w[1],w[0],0]])

def rotor(X, phi, c, n, lips):
    X = X.copy(); u = X[n]-X[c]; R = Ru(u, phi)
    for i in lips: X[i] = X[n] + R@(X[i]-X[n])
    return X
def com(X, m): return (m[:,None]*X).sum(0)/m.sum()
def inertia(X, m):
    Y = X-com(X,m); return sum(mi*(y@y*np.eye(3)-np.outer(y,y)) for mi,y in zip(m,Y))
def angmom(X, V, m):
    Y = X-com(X,m); Vc = V - (m[:,None]*V).sum(0)/m.sum()
    return sum(mi*np.cross(y,v) for mi,y,v in zip(m,Y,Vc))

def torsion_holonomy(X0, m, c, n, lips):
    def rhs(t, y):
        Q = y.reshape(3,3); Y = rotor(X0, t, c, n, lips); h=1e-6
        Yd = (rotor(X0,t+h,c,n,lips)-rotor(X0,t-h,c,n,lips))/(2*h)
        Om = -np.linalg.solve(inertia(Y,m), angmom(Y,Yd,m))
        return (Q@skew(Om)).ravel()
    s = solve_ivp(rhs,[0,2*np.pi],np.eye(3).ravel(),rtol=1e-11,atol=1e-12)
    Q = s.y[:,-1].reshape(3,3); rv = Rot.from_matrix(Q).as_rotvec(); return Q, rv

# animation molecule
LIP=1.22; HM=np.radians(52)
X = np.array([-0.52,1.2,0.78, 0,0,0, 1.47,0,0, 1.47+LIP*np.cos(HM),LIP*np.sin(HM),0, 1.47+LIP*np.cos(HM),-LIP*np.sin(HM),0]).reshape(-1,3)
m = np.array([15,14,14,16,16.])
u = (X[2]-X[1])/np.linalg.norm(X[2]-X[1])
rho = np.linalg.norm(np.cross(u, X[3]-X[2])); IuL = 32*rho**2
rhoC = np.linalg.norm(np.cross(u, X[0]-X[2])); IuF = 15*rhoC**2
print('anim: rho', rho, 'I_u lips', IuL, 'rho_C1', rhoC, 'I_u^F', IuF, 'naive deg', np.degrees(2*np.pi*IuF/(IuL+IuF)))
Q, rv = torsion_holonomy(X, m, 1, 2, [3,4])
ang = np.linalg.norm(rv); ax = rv/ang
print('anim true holonomy deg', np.degrees(ang), 'axis.u', ax@u, 'tilt deg', np.degrees(np.arccos(abs(ax@u))))
# C-C-N angle
v1 = X[0]-X[1]; v2 = X[2]-X[1]; print('CCN angle', np.degrees(np.arccos(v1@v2/np.linalg.norm(v1)/np.linalg.norm(v2))), '|CC|', np.linalg.norm(v1))
# J(xi)
xi = np.zeros_like(X); 
for i in [3,4]: xi[i] = np.cross(u, X[i]-X[2])
print('J(xi)', angmom(X, xi, m), 'I_u', IuL)

# nitromethane
rCN,rNO,ONO,rCH,HCN = 1.489,1.224,np.radians(125.3),1.088,np.radians(107.2)
C=np.zeros(3); N=np.array([rCN,0,0]); g=np.pi-ONO/2
O1=N+rNO*np.array([-np.cos(g),np.sin(g),0]); O2=N+rNO*np.array([-np.cos(g),-np.sin(g),0])
Hs=[C+rCH*np.array([np.cos(HCN),np.sin(HCN)*np.cos(a),np.sin(HCN)*np.sin(a)]) for a in (np.pi/2,np.pi/2+2*np.pi/3,np.pi/2+4*np.pi/3)]
Xn=np.array([C,N,O1,O2,*Hs]); mn=np.array([12,14,16,16,1,1,1.])
IO = 32*(rNO*np.sin(ONO/2))**2; IH = 3*(rCH*np.sin(HCN))**2
print('NM: I_O2', IO, 'I_H3', IH, 'ratio', IO/(IO+IH), 'formula deg', np.degrees(2*np.pi*IH/(IO+IH)))
Q, rv = torsion_holonomy(Xn, mn, 0, 1, [2,3]); print('NM numeric deg', np.degrees(np.linalg.norm(rv)), rv/np.linalg.norm(rv))

# dPhi exception: lip on axis, vary x_c only
def Phi(X, th): return rotor(X, th, 1, 2, [3,4])
Y = X.copy(); Y[3] = X[2] + 0.9*u   # lip a on axis (z=0.9), lip b off axis
d = np.zeros_like(Y); d[1] = [0,0.3,0.2]
h=1e-6; th=0.7
D = (Phi(Y+h*d,th)-Phi(Y-h*d,th))/(2*h)
print('lip-on-axis lip a component of dPhi(delta x_c):', D[3], ' predicted z(I-R)du')

# J(xi)=0 off Sigma: COM at lip a, lip b on N
