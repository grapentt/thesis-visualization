exec(open('bead.py').read().split('# rotor holonomy')[0].replace('for s in range(200)','for s in range(0)'))
exec('def turn'+open('bead.py').read().split('def turn')[1].split('# integrate')[0])
# quaternion integration q' = 1/2 q * (0, w_b)
def qmul(a,b):
    return np.array([a[0]*b[0]-a[1:]@b[1:], *(a[0]*b[1:]+b[0]*a[1:]+np.cross(a[1:],b[1:]))])
K=20000; h=2*np.pi/K; q=np.array([1.,0,0,0])
u=(X[2]-X[1])/np.linalg.norm(X[2]-X[1]); cum=0
for k in range(K):
    w=wb((k+0.5)*h)*h; cum+=w@u
    a=np.linalg.norm(w); dq=np.array([np.cos(a/2),*(np.sin(a/2)*w/a)])
    q=qmul(q,dq); q/=np.linalg.norm(q)
ang=2*np.arccos(np.clip(q[0],-1,1)); n=q[1:]/np.linalg.norm(q[1:])
print("SU(2) lift q_end",q," => angle in [0,720):",np.degrees(ang),"about",n)
print("equivalently",np.degrees(ang)-360,"deg about same axis (mod 720 representative)")
print("abelian integral of w_b . u over turn (deg):",np.degrees(cum))
