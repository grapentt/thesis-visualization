import { defineScene, seg } from '../../kit.js';
import { createRng } from '../../engine/random.js';
import { camera } from '../../model/camera.js';
import { polyline3 } from '../../draw/surface.js';
import { samples } from './math.js';
import { text, color, line, arrow, dot, label, big, formula, para, panel, path, ellipse, axes, cloud, footer, seq, progress, purple, mint } from './draw.js';

function scene(name,title,narration,draw,duration=45){return defineScene({name,duration,narration,header:{eyebrow:'COVARIANCE / FOUNDATIONS',title},draw(ctx,t){draw(ctx,t);progress(ctx,t,duration);}});}
const rand=createRng(842);const D=12;
const highSamples=Array.from({length:320},()=>{const a=rand.gauss(),b=rand.gauss();return Array.from({length:D},(_,i)=>.75*Math.cos(i*.65)*a+.6*Math.sin(i*.65)*b+.3*rand.gauss());});
const mean=Array.from({length:D},(_,j)=>highSamples.reduce((s,x)=>s+x[j],0)/highSamples.length);
const centered=highSamples.map(x=>x.map((v,j)=>v-mean[j]));
const covariance=Array.from({length:D},(_,i)=>Array.from({length:D},(_,j)=>centered.reduce((s,x)=>s+x[i]*x[j],0)/centered.length));
// Whiten the displayed finite sample exactly, so the comparison to the ring
// really has equal empirical second moments (using the 1/n convention).
function standardized(points){const m=[0,1].map(j=>points.reduce((s,p)=>s+p[j],0)/points.length);const q=points.map(p=>p.map((v,j)=>v-m[j]));const a=Math.sqrt(q.reduce((s,p)=>s+p[0]**2,0)/q.length);const b=q.reduce((s,p)=>s+p[0]*p[1],0)/q.length/a;const c=Math.sqrt(q.reduce((s,p)=>s+p[1]**2,0)/q.length-b*b);return q.map(([x,y])=>[x/a,(y-b*x/a)/c]);}
const white=standardized(samples);
export const foundationScenes=[
 scene('One observation is one vector','Before the ellipse: what is a data point?',[
  [0,'One observation is a vector containing all the coordinates measured together. A molecule with capital N atoms has three N Cartesian coordinates. One complete configuration is one point in that high-dimensional space. Capital N counts atoms; lowercase n counts observed configurations.'],
  [15,'The rows here are different configurations. The columns are coordinates. Covariance compares columns across the ensemble: for example, whether moving one coordinate above its mean tends to accompany another coordinate moving above or below its mean.'],
  [30,'This is not the spatial covariance of the atoms inside one structure. We are measuring variation between whole structures. For shape alone, remove rigid motion; locally, a generic non-collinear molecule has three N minus six independent internal directions.']
 ],(ctx,t)=>{
  panel(ctx,80,195,850,510,'An ensemble · rows are observations, columns are coordinates');
  const headers=['x₁','y₁','z₁','x₂','y₂','z₂','…'];
  headers.forEach((s,j)=>label(ctx,s,292+j*83,290,color.gold,25,'center'));
  const n=Math.min(7,Math.floor(t*.5)+1);
  for(let i=0;i<n;i++){
   label(ctx,`sample ${i+1}`,112,350+i*43,color.muted,21);
   for(let j=0;j<6;j++)label(ctx,highSamples[i][j].toFixed(2),292+j*83,350+i*43,i===Math.floor(t/3)%7?color.gold:color.body,21,'center');
   label(ctx,'…',790,350+i*43,color.muted,23);
  }
  formula(ctx,'x⁽ᵃ⁾ ∈ ℝᵈ',985,290,color.gold,36);
  para(ctx,'One entire configuration = one vector.',985,350,485,color.body,30);
  formula(ctx,'d = 3N',985,465,color.soft,34);
  label(ctx,'N atoms; n observed configurations',985,505,color.muted,22);
  para(ctx,'Shape directions: locally 3N − 6, after rigid motions are removed.',985,555,485,color.body,25);
  footer(ctx,'Covariance describes variation across observations.','In a high-dimensional cloud, a direction means a coordinated change of many coordinates at once.');
 }),
 scene('Calculate covariance from samples','Center → multiply → average',[
  [0,'Let us calculate a covariance instead of assuming an ellipse. These four observations have coordinates one, one; two, one; four, three; and five, three. Their mean is three, two. First subtract that mean from every observation.'],
  [15,'The centered vectors are minus two, minus one; minus one, minus one; one, one; and two, one. A centered vector tells us how this observation differs from the typical configuration.'],
  [30,'For each observation, multiply the centered vector by its transpose. The diagonal entries are squared deviations. The off-diagonal entries multiply two different deviations, preserving whether their signs agree. Now average these four small matrices.'],
  [45,'The resulting covariance is two point five, one point five; one point five, one. We use one over n for the empirical distribution. One over n minus one gives the usual unbiased estimate of an unknown population covariance. The population definition is the expected outer product.']
 ],(ctx,t)=>{
  const raw=[[1,1],[2,1],[4,3],[5,3]],q=raw.map(([x,y])=>[x-3,y-2]);const a=seg(t,7,17);
  panel(ctx,80,195,720,510,'Four observations, one mean');
  const map=([x,y])=>[430+70*(x-3*(1-a)),450-70*(y-2*(1-a))];const origin=map([0,0]);
  ctx.save();ctx.beginPath();ctx.rect(110,290,660,370);ctx.clip();axes(ctx,...origin,260,180);ctx.restore();
  const pm=map([3*(1-a),2*(1-a)]);dot(ctx,...pm,7,color.gold);label(ctx,a<.8?'mean μ = (3, 2)':'mean becomes the origin',155,270,color.gold,22);
  raw.forEach(([x,y],i)=>{const p=map([x-3*a,y-2*a]);arrow(ctx,...pm,...p,{color:[color.soft,purple,mint,color.stiff][i],width:2});dot(ctx,...p,7,[color.soft,purple,mint,color.stiff][i]);label(ctx,`(${(x-3*a).toFixed(0)}, ${(y-2*a).toFixed(0)})`,p[0]+(i===0?-45:12),p[1]+(i===0?32:-14),color.body,21);});
  formula(ctx,'δx⁽ᵃ⁾ = x⁽ᵃ⁾ − μ',865,267,color.gold,28);
  const k=Math.min(3,Math.floor(Math.max(0,t-24)/5)),v=q[k];
  label(ctx,`Sample ${k+1}: (${v.join(', ')})`,865,330,color.muted,24);
  const values=[[v[0]*v[0],v[0]*v[1]],[v[1]*v[0],v[1]*v[1]]];
  formula(ctx,'δx δxᵀ =',865,412,color.ink,27);
  values.forEach((row,i)=>row.forEach((v,j)=>{big(ctx,String(v),1190+j*140,390+i*60,i===j?color.soft:purple,35,'center');}));
  path(ctx,[[1165,354],[1150,354],[1150,464],[1165,464]],color.muted,2);path(ctx,[[1360,354],[1375,354],[1375,464],[1360,464]],color.muted,2);
  if(t>=39){formula(ctx,'Σ̂ = ¼ Σₐ δx⁽ᵃ⁾δx⁽ᵃ⁾ᵀ',865,520,color.gold,26);formula(ctx,'[ 2.5   1.5 ]',1000,586,color.gold,30);formula(ctx,'[ 1.5   1.0 ]',1000,633,color.gold,30);}
  footer(ctx,'Population definition:  Σ = E[(X − μ)(X − μ)ᵀ],   μ = E[X].','Entry Σᵢⱼ = E[(Xᵢ−μᵢ)(Xⱼ−μⱼ)]. Centering prevents the location of the cloud from masquerading as spread.');
 },60),
 scene('Read the matrix entries','Diagonal: how much. Off-diagonal: together or opposite.',[
  [0,'Each diagonal entry is a variance. It records how much one coordinate fluctuates, without regard to the others. Each off-diagonal entry is a covariance. It records whether two centered coordinates fluctuate together or in opposite directions.'],
  [15,'Watch the tilt change while both coordinate variances stay equal to one. Positive covariance concentrates points in the same-sign quadrants. Negative covariance concentrates them in opposite-sign quadrants. Zero covariance removes linear correlation, but does not in general imply independence.'],
  [30,'Covariance carries the product of the coordinate units. Correlation divides by both standard deviations, giving a dimensionless number between minus one and one. The full matrix is symmetric because multiplying the two deviations commutes.']
 ],(ctx,t)=>{
  const r=.86*Math.cos(t*Math.PI/20),cx=440,cy=460;
  panel(ctx,80,195,760,510,'Both coordinate variances remain 1');
  ctx.save();ctx.globalAlpha=.07;ctx.fillStyle=color.soft;ctx.fillRect(cx,280,190,180);ctx.fillRect(cx-190,cy,190,180);ctx.fillStyle=color.stiff;ctx.fillRect(cx-190,280,190,180);ctx.fillRect(cx,cy,190,180);ctx.restore();
  axes(ctx,cx,cy,260,180);cloud(ctx,white,([u,v])=>[cx+78*u,cy-78*(r*u+Math.sqrt(1-r*r)*v)],color.soft,2.7,.6,[130,285,650,360]);
  label(ctx,'same signs: +',135,275,color.soft,22);label(ctx,'opposite signs: −',525,275,color.stiff,22);
  formula(ctx,'Σ =',900,340,color.gold,32);formula(ctx,`[ 1.00   ${r.toFixed(2).padStart(5)} ]`,1025,315,color.gold,31);formula(ctx,`[ ${r.toFixed(2).padStart(5)}  1.00 ]`,1025,370,color.gold,31);
  formula(ctx,'corrᵢⱼ = Σᵢⱼ / (σᵢσⱼ)',900,495,purple,27);
  para(ctx,'A matrix of joint fluctuations, not a list of independent error bars.',900,568,570,color.body,27);
  footer(ctx,'The tilt comes from cross-covariance.','The diagonal alone misses collective motion. Correlation removes units; covariance retains the actual fluctuation scales.');
 }),
 scene('Covariance in many dimensions','You do not need to draw ℝᵈ to measure spread in it',[
  [0,'For d coordinates, covariance is a d by d matrix. The color map shows an actual twelve-dimensional sample covariance. Every off-diagonal square measures a pair of coordinates, including pairs that are far apart in this matrix.'],
  [15,'Choose any unit direction v, which can combine many coordinates. Project every centered observation onto that direction using the dot product. The resulting one-dimensional spread has variance v transpose Sigma v. This is what the whole matrix means operationally.'],
  [30,'The histogram changes as our direction turns through the first two coordinates. The same formula works for any combination of all twelve, or all three N molecular coordinates. A direction can be a collective twist involving many atoms.'],
  [45,'Because every projected variance is nonnegative, covariance is positive semidefinite. A zero eigenvalue means no observed variance in one direction. With n observations, sample covariance has rank at most n minus one, so high-dimensional inversion requires enough samples or a justified regularization.']
 ],(ctx,t)=>{
  panel(ctx,80,195,610,510,'A 12 × 12 covariance matrix');
  const cell=30,ox=205,oy=290,max=.8;
  covariance.forEach((row,i)=>row.forEach((v,j)=>{ctx.fillStyle=v>=0?`rgba(108,196,232,${Math.min(1,Math.abs(v)/max)})`:`rgba(239,138,91,${Math.min(1,Math.abs(v)/max)})`;ctx.fillRect(ox+j*cell,oy+i*cell,cell-2,cell-2);}));
  for(let j=0;j<D;j++){label(ctx,String(j+1),ox+j*cell+14,oy-13,color.muted,15,'center');label(ctx,String(j+1),ox-18,oy+j*cell+20,color.muted,15,'right');}
  panel(ctx,740,195,780,510,'Project the same 12D observations onto one direction',color.gold);
  const a=t*.11,v=[Math.cos(a),Math.sin(a)],projected=centered.map(x=>x[0]*v[0]+x[1]*v[1]);
  const variance=v[0]**2*covariance[0][0]+2*v[0]*v[1]*covariance[0][1]+v[1]**2*covariance[1][1];
  const bins=Array(26).fill(0);projected.forEach(p=>{const j=Math.floor((p+2.6)/5.2*26);if(j>=0&&j<26)bins[j]++;});
  const x=805,y=576,bw=24;bins.forEach((n,i)=>{ctx.fillStyle=color.gold;ctx.fillRect(x+i*bw,y-n*4,bw-3,n*4);});line(ctx,x,y,x+624,y);
  label(ctx,'−2',x+70,y+35,color.muted,20);label(ctx,'0',x+312,y+35,color.muted,20);label(ctx,'2',x+552,y+35,color.muted,20);
  formula(ctx,'Var(vᵀδx) = vᵀΣv',805,278,color.gold,30);
  label(ctx,`v = (${v[0].toFixed(2)}, ${v[1].toFixed(2)}, 0, …, 0)`,805,328,color.body,24);
  label(ctx,`projected variance = ${variance.toFixed(3)}`,805,655,color.gold,25);
  footer(ctx,'A high-dimensional covariance is a variance calculator for every direction.','vᵀΣv = E[(vᵀδx)²] ≥ 0. The same object describes collective directions, not only coordinate axes.');
 },60),
 scene('Principal directions and ellipsoids','Eigenvectors find the collective modes',[
  [0,'The principal directions are eigenvectors of covariance. In this basis, cross-covariances vanish and each eigenvalue is the variance along one principal direction. Its square root is the standard deviation, a length.'],
  [15,'Here we can draw three dimensions: one broad direction, one intermediate direction, and one narrow direction. In higher dimensions there are simply more orthogonal principal directions. Each eigenvector still has one component for every original coordinate.'],
  [30,'The covariance ellipsoid has semiaxes proportional to those square roots. For a Gaussian, these are constant-density surfaces. For general data, an ellipsoid summarizes second moments only. The inverse-covariance metric measures a displacement by adding its squared components in standard-deviation units.']
 ],(ctx,t)=>{
  panel(ctx,80,195,850,510,'3D illustration · the same eigenvector algebra works in d dimensions');
  const cam=camera({yaw:.5+t*.055,pitch:.35,scale:125,center:[0,0,0],cx:500,cy:470});
  const radii=[2,.85,.3];
  for(let lat=-1.2;lat<=1.21;lat+=.3){const pts=seq(81,f=>{const a=f*Math.PI*2;return[radii[0]*Math.cos(lat)*Math.cos(a),radii[1]*Math.cos(lat)*Math.sin(a),radii[2]*Math.sin(lat)];});polyline3(ctx,cam,pts,{color:color.line,width:1.5});}
  for(let lon=0;lon<Math.PI*2;lon+=Math.PI/8){const pts=seq(61,f=>{const a=(f-.5)*Math.PI;return[radii[0]*Math.cos(a)*Math.cos(lon),radii[1]*Math.cos(a)*Math.sin(lon),radii[2]*Math.sin(a)];});polyline3(ctx,cam,pts,{color:color.soft,width:1,alpha:.65});}
  const origin=cam.project([0,0,0]);
  [color.soft,color.gold,color.stiff].forEach((tint,i)=>{const p=[0,0,0];p[i]=radii[i]*1.2;const q=cam.project(p);arrow(ctx,origin.x,origin.y,q.x,q.y,{color:tint,width:4});label(ctx,`σ${i+1}`,q.x+10,q.y,tint,25);});
  formula(ctx,'Σeᵢ = λᵢeᵢ',990,285,color.gold,33);formula(ctx,'Σ = QΛQᵀ',990,350,color.ink,32);
  para(ctx,'Principal width:  σᵢ = √λᵢ',990,415,490,color.body,28);
  formula(ctx,'δx = Σᵢ aᵢeᵢ',990,500,color.soft,29);
  formula(ctx,'δxᵀΣ⁻¹δx = Σᵢ aᵢ²/λᵢ',990,577,color.gold,25);
  footer(ctx,'One standard deviation in any principal direction has metric length one.','An ellipsoid is a second-moment summary. It becomes a probability contour only under additional distributional assumptions.');
 }),
 scene('What covariance cannot tell you','Two different clouds can have exactly the same covariance',[
  [0,'Covariance is a powerful summary, but it does not specify the whole distribution. These two displayed point sets have the same centered empirical covariance: the identity. One fills a region; the other lies on a circle.'],
  [15,'A global covariance ellipse is a circle for both. Whitening therefore cannot distinguish them. Their higher-order structure, density, and topology are different even though all directional variances agree.'],
  [30,'To discover the thin structure, we need local information. Around a small arc of the ring, variation is mostly tangential. Around the entire ring, those tangent directions cancel into an isotropic global covariance. Now we can ask how local rulers combine into geometry.']
 ],(ctx,t)=>{
  [0,1].forEach(i=>{const cx=420+760*i;panel(ctx,80+760*i,195,680,510,i?'Points on a circle':'A cloud filling a region',i?purple:color.soft);axes(ctx,cx,450,235,175);
   const points=i?seq(360,f=>[Math.SQRT2*Math.cos(2*Math.PI*f*359/360),Math.SQRT2*Math.sin(2*Math.PI*f*359/360)]):white;
   cloud(ctx,points,([u,v])=>[cx+95*u,450-95*v],i?purple:color.soft,3,.65,[110+760*i,275,620,330]);ellipse(ctx,cx,450,134.35,134.35,color.gold);
   formula(ctx,'Σ = I',cx-60,655,color.gold,30);
  });
  footer(ctx,'Global second moments do not identify a manifold.','These point sets have equal empirical covariance. Their geometry becomes different when we inspect local neighborhoods.');
 })
];
