import test from 'node:test';
import assert from 'node:assert/strict';
import { ribbonCovariance, inverse2, multiply2, quadratic, metricWidths, loopState, hyperbolicArea, signalFraction, flow } from '../src/videos/covariance/math.js';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('pushed covariance and inverse metric exactly undo the curved coordinate map',()=>{
 for(const u of [-2,-.5,0,1,2]) {
  const C=ribbonCovariance(u),G=inverse2(C),a=.96*u;
  const product=multiply2(C,G);near(product[0][0],1);near(product[1][1],1);near(product[0][1],0);near(product[1][0],0);
  for(const [du,dv] of [[1,0],[0,1],[.2,-.4]]) near(quadratic(G,[du,a*du+dv]),du*du+dv*dv/.16**2);
 }
});
test('three metric views give standard-deviation ratios r, 1, r²',()=>{
 for(const r of [1,5,10])for(const [p,expected] of [[0,r],[-1,1],[1,r*r]]){const w=metricWidths(r,p);near(w[0]/w[1],expected);}
});
test('parallel transport closes the base loop but preserves its exact nonzero holonomy',()=>{
 const end=loopState(1);near(end.u,-.55);near(end.v,0);near(end.theta,-hyperbolicArea(-.55,.55,.65));
 // Integrate dθ=-exp(u)dv along the rectangle independently.
 let theta=0,prev=loopState(0);for(let i=1;i<=4000;i++){const next=loopState(i/4000);theta-=Math.exp((prev.u+next.u)/2)*(next.v-prev.v);prev=next;}
 near(theta,end.theta,1e-9);
});
test('metric noise synchronizes information while flat noise erases stiff signal first',()=>{
 for(const t of [.01,.2,1,3]){near(signalFraction(t,1,true),signalFraction(t,.04,true));assert.ok(signalFraction(t,.04)<signalFraction(t,1));}
});
test('preconditioned harmonic flow has equal relative relaxation',()=>{
 for(const t of [.01,.2,1]){const [x,y]=flow(t,true);near(x/1.8,y/.34);assert.ok(flow(t,false)[1]/.34<x/1.8);}
});

test('local ring covariance agrees with direct quadrature and global isotropy', async()=>{
 const {arcCovariance}=await import('../src/videos/covariance/math.js');
 for(const h of [.15,.32,1,Math.PI]){
  const n=20000;let c=0,c2=0,s2=0;
  for(let i=0;i<n;i++){const a=-h+(i+.5)*2*h/n;c+=Math.cos(a)/n;c2+=Math.cos(a)**2/n;s2+=Math.sin(a)**2/n;}
  const exact=arcCovariance(h);near(c,exact.meanRadius,1e-8);near(c2-c*c+.035**2,exact.normal,1e-8);near(s2+.035**2,exact.tangent,1e-8);
 }
 const global=arcCovariance(Math.PI);near(global.normal,global.tangent);assert.ok(arcCovariance(.32).tangent/arcCovariance(.32).normal>20);
});
test('shrinking fixed-base loops retain curvature while holonomy tends to zero quadratically',()=>{
 let previous=Infinity;
 for(const scale of [1,.5,.1,.01]){
  const a=-.55,b=a+1.1*scale,h=.65*scale,area=hyperbolicArea(a,b,h);
  const end=loopState(1,a,b,h);near(end.u,a);near(end.v,0);near(end.theta/area,-1);assert.ok(area<previous);previous=area;
 }
});
test('path integral penalizes the physical chord more than the flat-metric geodesic',()=>{
 const endpoint=1.7,n=20000;let length=0;
 for(let i=0;i<n;i++){const u=-endpoint+(i+.5)*2*endpoint/n;const G=inverse2(ribbonCovariance(u));length+=Math.sqrt(quadratic(G,[1,0]))*2*endpoint/n;}
 const exact=endpoint*Math.sqrt(1+36*endpoint**2)+Math.asinh(6*endpoint)/6;
 near(length,exact,1e-7);assert.ok(length>5*(2*endpoint));
});

test('spherical-cap pullback is exactly inverse local covariance, with curvature +1',async()=>{
 const {capEmbed,capCovariance,capMetric}=await import('../src/videos/covariance/math.js');
 for(const q of [[0,0],[.3,.2],[.6,.3],[-.7,.1]]){
  const G=capMetric(q),C=capCovariance(q),I=multiply2(G,C);near(I[0][0],1);near(I[1][1],1);near(I[0][1],0);near(I[1][0],0);
  const eps=1e-5,J=[0,1].map(k=>{const a=q.slice(),b=q.slice();a[k]+=eps;b[k]-=eps;return capEmbed(a).map((v,i)=>(v-capEmbed(b)[i])/(2*eps));});
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)near(J[i].reduce((s,v,k)=>s+v*J[j][k],0),G[i][j],2e-8);
  const [x,y,z]=capEmbed(q),hxx=-1/z-x*x/z**3,hyy=-1/z-y*y/z**3,hxy=-x*y/z**3;
  near((hxx*hyy-hxy*hxy)/(1+(x*x+y*y)/(z*z))**2,1);
 }
});
test('cap density normalizes and has the stated global covariance',async()=>{
 const {capDensity}=await import('../src/videos/covariance/math.js');const n=20000;let mass=0,varX=0;
 for(let i=0;i<n;i++){const r=(i+.5)*.8/n,p=capDensity([r,0]);mass+=2*Math.PI*r*p*.8/n;varX+=Math.PI*r**3*p*.8/n;}
 near(mass,1,1e-8);near(varX,13/75,1e-8);
});
test('categorical square-root embedding has the inverse observation covariance as its Gram matrix',async()=>{
 const {categoricalEmbed,categoricalCovariance}=await import('../src/videos/covariance/math.js');
 for(const q of [[1/3,1/3],[.1,.2],[.6,.3],[.02,.7]]){
  const F=categoricalEmbed(q);near(F.reduce((s,v)=>s+v*v,0),4);
  const inverse=inverse2(categoricalCovariance(q)),h=1e-6;
  const J=[0,1].map(k=>{const a=q.slice(),b=q.slice();a[k]+=h;b[k]-=h;const fa=categoricalEmbed(a),fb=categoricalEmbed(b);return fa.map((v,i)=>(v-fb[i])/(2*h));});
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)near(J[i].reduce((s,v,k)=>s+v*J[j][k],0),inverse[i][j],1e-6);
 }
});

test('moving local covariance centers on its weighted mean and is translation invariant',async()=>{
 const {localEstimate}=await import('../src/videos/covariance/math.js');
 const pts=[[1,1],[2,1],[4,3],[5,3]],q=[2.4,1.7],e=localEstimate(pts,q,1.3),shift=[7,-4];
 const moved=localEstimate(pts.map(p=>p.map((v,k)=>v+shift[k])),q.map((v,k)=>v+shift[k]),1.3);
 for(let i=0;i<2;i++){near(moved.mean[i],e.mean[i]+shift[i]);for(let j=0;j<2;j++)near(moved.C[i][j],e.C[i][j]);}
 assert.ok(Math.abs(e.mean[0]-q[0])>.01);assert.ok(e.C[0][0]>0&&e.C[1][1]>0);assert.ok(e.C[0][0]*e.C[1][1]-e.C[0][1]**2>0);
});

test('stretched ellipsoid keeps the exact inverse-covariance pullback and tangent isotropy',async()=>{
 const {ellipsoidEmbed:F,ellipsoidCovariance:C,ellipsoidMetric:G,ellipsoidCurvature:K,sqrt2}=await import('../src/videos/covariance/math.js');
 for(const q of [[0,0],[.5,.25],[.8,-.35],[-.4,.5]]){
  const cov=C(q),g=G(q),I=multiply2(cov,g),P=sqrt2(cov),PP=multiply2(P,P);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){near(I[i][j],i===j?1:0);near(PP[i][j],cov[i][j]);}
  const h=1e-6,J=[0,1].map(k=>{const a=q.slice(),b=q.slice();a[k]+=h;b[k]-=h;return F(a).map((v,i)=>(v-F(b)[i])/(2*h));});
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)near(J[i].reduce((s,v,k)=>s+v*J[j][k],0),g[i][j],1e-8);
  const B=[0,1].map(j=>[0,1,2].map(k=>J[0][k]*P[0][j]+J[1][k]*P[1][j]));
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)near(B[i].reduce((s,v,k)=>s+v*B[j][k],0),i===j?1:0,1e-8);
  assert.ok(K(q)>0);
 }
 assert.ok(Math.abs(K([0,0])-K([.5,.4]))>1);
});
test('ellipsoid surface-area normalization converges and projection changes density',async()=>{
 const {ELLIPSOID_AREA,ellipsoidSurfaceArea,ellipsoidDensity,ellipsoidAreaFactor}=await import('../src/videos/covariance/math.js');
 near(ELLIPSOID_AREA,ellipsoidSurfaceArea(512,512),1e-7);
 for(const q of [[0,0],[.6,.2],[0,.59]])near(ellipsoidDensity(q)/ellipsoidAreaFactor(q),1/ELLIPSOID_AREA);
 assert.ok(ellipsoidDensity([0,.59])>3*ellipsoidDensity([0,0]));
});
