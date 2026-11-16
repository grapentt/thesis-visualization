// Exact manufactured examples. All coordinates are dimensionless relative to
// a declared Euclidean reference. No molecular measurements are implied.
import { createRng } from '../../engine/random.js';
export const rng = createRng(271026);
export const samples = Array.from({ length: 550 }, () => [rng.gauss(), rng.gauss()]);
export const ribbonSamples = Array.from({ length: 700 }, () => [4.4 * (rng.uniform() - .5), .16 * rng.gauss()]);
export const bend = u => .48 * (u * u - 1.5);
export const bendPrime = u => .96 * u;
export const warp = ([u, v], amount = 1) => [u, v + amount * bend(u)];
// x=F(u,v)=(u,v+b(u)); J=[[1,0],[b',1]]. For latent C0=diag(1,s²):
export function ribbonCovariance(u, s = .16) {
  const a = bendPrime(u);
  return [[1, a], [a, a * a + s * s]];
}
export function inverse2(A) {
  const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
}
export function multiply2(A, B) {
  return A.map(row => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
}
export function quadratic(A, v) { return v[0] * (A[0][0] * v[0] + A[0][1] * v[1]) + v[1] * (A[1][0] * v[0] + A[1][1] * v[1]); }
export function metricWidths(ratio, exponent) {
  // Σ=diag(1,r^-2), G=Σ^exponent; display y=G^1/2 x.
  return [1, ratio ** (-(1 + exponent))];
}
export const flow = (t, metric = false, r = 5) => [1.8 * Math.exp(-t), .34 * Math.exp(-(metric ? 1 : r * r) * t)];
export function signalFraction(t, lambda, shaped = false) { return lambda / (lambda + t * (shaped ? lambda : 1)); }
// Warped product g=du²+f(u)² dv²: Gaussian curvature -f''/f.
export const hyperbolicScale = u => Math.exp(u);
export const hyperbolicCurvature = () => -1;
export const hyperbolicArea = (a, b, height) => height * (Math.exp(b) - Math.exp(a));
// Parallel transport in the oriented orthonormal frame (∂u,e^-u ∂v):
// dθ=-e^u dv. The displayed rectangle runs +u,+v,-u,-v.
export function loopState(progress, a = -.55, b = .55, h = .65) {
  const q = Math.max(0, Math.min(1, progress)) * 4;
  if (q <= 1) return { u: a + (b - a) * q, v: 0, theta: 0 };
  if (q <= 2) return { u: b, v: h * (q - 1), theta: -Math.exp(b) * h * (q - 1) };
  if (q <= 3) return { u: b - (b - a) * (q - 2), v: h, theta: -Math.exp(b) * h };
  return { u: a, v: h * (4 - q), theta: -Math.exp(b) * h + Math.exp(a) * h * (q - 3) };
}
// Conditional covariance of a unit circle with θ uniform on [-h,h], plus
// independent isotropic measurement variance epsilon²; in tangent/normal axes.
export function arcCovariance(h, epsilon = .035) {
  const sinc = x => Math.abs(x)<1e-8 ? 1-x*x/6 : Math.sin(x)/x;
  const meanRadius=sinc(h),secondCos=(1+sinc(2*h))/2;
  return { meanRadius, tangent:1-secondCos+epsilon*epsilon, normal:secondCos-meanRadius*meanRadius+epsilon*epsilon };
}

// Explicit embeddings used in the spherical examples.
export const capRadius=.8;
export function capEmbed([x,y]) {return[x,y,Math.sqrt(1-x*x-y*y)];}
export function capCovariance([x,y]) {return[[1-x*x,-x*y],[-x*y,1-y*y]];}
export function capMetric([x,y]) {const z2=1-x*x-y*y;return[[1+x*x/z2,x*y/z2],[x*y/z2,1+y*y/z2]];}
export function capDensity([x,y]) {return x*x+y*y<=.64?1/(.8*Math.PI*Math.sqrt(1-x*x-y*y)):0;}
export function categoricalCovariance([u,v]) {return[[u*(1-u),-u*v],[-u*v,v*(1-v)]];}
export function categoricalEmbed([u,v]) {return[2*Math.sqrt(u),2*Math.sqrt(v),2*Math.sqrt(1-u-v)];}

// Smooth weighted local covariance estimator used by the moving-window scene.
export function localEstimate(points,q,h=.38){
 const weights=points.map(p=>Math.exp(-((p[0]-q[0])**2+(p[1]-q[1])**2)/(2*h*h))),sum=weights.reduce((a,b)=>a+b,0);
 const mean=[0,1].map(j=>points.reduce((s,p,i)=>s+weights[i]*p[j],0)/sum);
 const C=[0,1].map(j=>[0,1].map(k=>points.reduce((s,p,i)=>s+weights[i]*(p[j]-mean[j])*(p[k]-mean[k]),0)/sum));
 return {weights,mean,C};
}

// Ellipsoidal cap: uniform by actual Euclidean surface area, not a stretched
// uniform spherical sample. Coordinates below are the projected x,y chart.
export const ellipsoid = Object.freeze({ a:1.5, b:.75, c:2, rmax:.8 });
export function ellipsoidEmbed([x,y]) {
  const {a,b,c}=ellipsoid;return [x,y,c*Math.sqrt(1-x*x/(a*a)-y*y/(b*b))];
}
export function ellipsoidSlope([x,y]) {
  const {a,b,c}=ellipsoid,s=Math.sqrt(1-x*x/(a*a)-y*y/(b*b));return[-c*x/(a*a*s),-c*y/(b*b*s)];
}
export function ellipsoidMetric(q) {const [u,v]=ellipsoidSlope(q);return[[1+u*u,u*v],[u*v,1+v*v]];}
export function ellipsoidCovariance(q) {const [u,v]=ellipsoidSlope(q),d=1+u*u+v*v;return[[1-u*u/d,-u*v/d],[-u*v/d,1-v*v/d]];}
export function ellipsoidAreaFactor(q) {const [u,v]=ellipsoidSlope(q);return Math.sqrt(1+u*u+v*v);}
export function ellipsoidCurvature([x,y]) {const{a,b,c}=ellipsoid,q=1-x*x/a**2-y*y/b**2;return c*c/(a*a*b*b*(q+c*c*(x*x/a**4+y*y/b**4))**2);}
export function ellipsoidSurfaceArea(nr=256,nt=256) {
 const{a,b,rmax}=ellipsoid;let total=0;
 for(let i=0;i<=nr;i++){const r=rmax*i/nr,weight=i===0||i===nr?1:i%2?4:2;let angular=0;
  for(let j=0;j<nt;j++){const theta=2*Math.PI*j/nt;angular+=ellipsoidAreaFactor([a*r*Math.cos(theta),b*r*Math.sin(theta)]);}
  total+=weight*a*b*r*angular*2*Math.PI/nt;
 }return total*rmax/(3*nr);
}
export const ELLIPSOID_AREA=ellipsoidSurfaceArea();
export function ellipsoidDensity(q) {const{a,b,rmax}=ellipsoid;return q[0]**2/a**2+q[1]**2/b**2<=rmax*rmax?ellipsoidAreaFactor(q)/ELLIPSOID_AREA:0;}
export function sqrt2(C){const s=Math.sqrt(C[0][0]*C[1][1]-C[0][1]*C[1][0]),d=Math.sqrt(C[0][0]+C[1][1]+2*s);return[[(C[0][0]+s)/d,C[0][1]/d],[C[1][0]/d,(C[1][1]+s)/d]];}
