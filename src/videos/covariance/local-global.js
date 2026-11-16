import { defineScene, seg } from '../../kit.js';
import { createRng } from '../../engine/random.js';
import { arcCovariance, bend, hyperbolicArea, loopState } from './math.js';
import { color, line, arrow, dot, label, big, formula, para, panel, path, ellipse, axes, cloud, footer, seq, progress, purple, mint } from './draw.js';
function scene(name,title,narration,draw,duration=45){return defineScene({name,duration,narration,header:{eyebrow:'COVARIANCE / LOCAL TO GLOBAL',title},draw(ctx,t){draw(ctx,t);progress(ctx,t,duration);}});}
const rand=createRng(719);const ring=Array.from({length:1000},()=>{const theta=rand.uniform()*Math.PI*2;return{theta,p:[Math.cos(theta)+.035*rand.gauss(),Math.sin(theta)+.035*rand.gauss()]};});
const mix=Array.from({length:600},(_,i)=>{const j=i%12,a=j*Math.PI/6,r=.12*rand.gauss(),s=.5*rand.gauss();const residual=[r*Math.cos(a)-s*Math.sin(a),r*Math.sin(a)+s*Math.cos(a)];return{j,mean:[2*Math.cos(a),2*Math.sin(a)],residual,p:[2*Math.cos(a)+residual[0],2*Math.sin(a)+residual[1]]};});
export const localScenes=[
 scene('Zoom from global to local','A global circle hides a field of thin local ellipses',[
  [0,'Take points near a circle, with small isotropic measurement noise. The global covariance is almost one half times the identity. It tells us the overall diameter, but completely misses the thin one-dimensional structure.'],
  [15,'Select an angular neighborhood and gradually shrink it. The highlighted samples have much more spread along the tangent than across it. The enlarged view uses equal scaling on both axes, so the changing aspect ratio is real, not a plotting trick.'],
  [30,'Local covariance depends on neighborhood size. Large neighborhoods mix bending into normal variance. Extremely small neighborhoods are dominated by the noise floor. At an intermediate scale, the leading eigenspace reveals a candidate tangent. This is a local measurement, not yet a global geometry.']
 ],(ctx,t)=>{
  const h=Math.PI*(1-seg(t,4,26))+.32*seg(t,4,26),a=.5+t*.035,c=arcCovariance(h),center=[Math.cos(a)*c.meanRadius,Math.sin(a)*c.meanRadius];
  const local=ring.filter(p=>Math.abs(Math.atan2(Math.sin(p.theta-a),Math.cos(p.theta-a)))<=h);
  panel(ctx,80,195,700,510,'Select a neighborhood on the original cloud');
  const map=p=>[430+172*p[0],455-172*p[1]];
  cloud(ctx,ring.map(x=>x.p),map,color.dim,2,.38,[130,270,600,370]);cloud(ctx,local.map(x=>x.p),map,color.gold,3,.8,[130,270,600,370]);
  const pc=map(center);dot(ctx,...pc,6,color.stiff);
  const ellipsePoints=seq(81,f=>{const z=f*2*Math.PI,dt=2*Math.sqrt(c.tangent)*Math.cos(z),dn=2*Math.sqrt(c.normal)*Math.sin(z);return map([center[0]-Math.sin(a)*dt+Math.cos(a)*dn,center[1]+Math.cos(a)*dt+Math.sin(a)*dn]);});path(ctx,ellipsePoints,color.stiff,3);
  label(ctx,`angular half-window: ${(h*180/Math.PI).toFixed(0)}°`,430,661,color.gold,23,'center');
  panel(ctx,820,195,700,510,'The same selected points, in local tangent / normal axes',color.gold);
  const zoom=130/(2*Math.sqrt(c.tangent));
  const localMap=p=>{const dx=p[0]-center[0],dy=p[1]-center[1];return[1170+zoom*(-Math.sin(a)*dx+Math.cos(a)*dy),460-zoom*(Math.cos(a)*dx+Math.sin(a)*dy)];};
  axes(ctx,1170,460,240,150);cloud(ctx,local.map(x=>x.p),localMap,color.gold,3,.7,[850,285,640,315]);ellipse(ctx,1170,460,130,130*Math.sqrt(c.normal/c.tangent),color.stiff);
  label(ctx,'tangent',1400,490,color.soft,20,'right');label(ctx,'normal',1185,303,color.stiff,20);
  label(ctx,`variance ratio = ${(c.tangent/c.normal).toFixed(1)}`,1170,615,color.gold,23,'center');label(ctx,'isotropic zoom · aspect ratio preserved',1170,658,color.muted,20,'center');
  footer(ctx,'A local covariance answers a scale-dependent question.','The circle is extrinsically bent; a one-dimensional manifold has no intrinsic Riemann curvature. Do not confuse these.');
 }),
 scene('Why local and global covariance differ','Global spread = within-neighborhood spread + moving means',[
  [0,'Here is an exact decomposition. Imagine choosing one of twelve local ensembles around a ring, then drawing a sample from that ensemble. Each local ensemble has its own mean and a covariance aligned with its tangent.'],
  [15,'Subtract each sample’s own local mean. The middle panel shows only fluctuations within the ensembles. The last panel shows the means themselves. The global covariance is the average within-ensemble covariance plus the covariance of those means.'],
  [30,'Most global variance here comes from the means moving around the ring, not from the local thermal width. That is why one global inverse covariance cannot replace a metric field that follows local stiffness. A field assigns a different quadratic ruler to each position.']
 ],(ctx,t)=>{
  const colors=[color.soft,color.gold,purple];
  [0,1,2].forEach(i=>{const cx=320+480*i;panel(ctx,cx-215,195,430,510,['Whole mixture','Within each local ensemble','The local means'][i],colors[i]);axes(ctx,cx,450,175,160);
   if(i<2)cloud(ctx,mix,x=>{const p=i?x.residual:x.p;return[cx+65*p[0],450-65*p[1]];},colors[i],2.5,.6,[cx-190,280,380,320]);
   else for(let j=0;j<12;j++){const a=j*Math.PI/6;dot(ctx,cx+130*Math.cos(a),450-130*Math.sin(a),7,purple);}
   if(i===0&&t<18)for(let j=0;j<12;j++){const a=j*Math.PI/6;path(ctx,seq(60,f=>{const z=f*Math.PI*2,dr=.24*Math.cos(z),dt=1*Math.sin(z);return[cx+65*((2+dr)*Math.cos(a)-dt*Math.sin(a)),450-65*((2+dr)*Math.sin(a)+dt*Math.cos(a))];}),color.dim,1);}
   formula(ctx,['2.1322 I','0.1322 I','2.0000 I'][i],cx-100,635,colors[i],27);
  });
  footer(ctx,'Cov(X) = E[Cov(X | Z)] + Cov(E[X | Z]).','Z labels the generating ensemble; the numbers are population covariances. Local fluctuation and moving means contribute separately.');
 })
];

localScenes.push(scene('Long distances from local rulers','A metric measures a journey one small step at a time',[
 [0,'A covariance field is a different ruler at each location. To measure a long path, split it into tiny steps, measure each step with the local metric, then add the lengths. This becomes a path integral.'],
 [15,'In this manufactured valley, a straight line is short in the original picture, but it repeatedly crosses the expensive local normal direction. The curved route follows the soft direction. Its accumulated thermal length is much smaller.'],
 [30,'Metric distance is the smallest path length among routes connecting the endpoints. It is not obtained by inserting their difference into one global covariance matrix. Here the curved route is a geodesic, even though the metric itself is flat, as the next coordinate transformation will show.']
],(ctx,t)=>{
 panel(ctx,80,195,850,510,'Two paths between the same configurations');
 const endpoint=1.7,top=bend(endpoint),map=(u,v)=>[505+205*u,525-135*v];
 for(let u=-1.5;u<=1.51;u+=.5)path(ctx,seq(61,f=>{const a=f*Math.PI*2,du=.22*Math.cos(a),dv=.045*Math.sin(a);return map(u+du,bend(u)+.96*u*du+dv);}),color.line,1.5);
 path(ctx,seq(120,f=>{const u=(f-.5)*2*endpoint;return map(u,bend(u));}),color.gold,4);
 path(ctx,[map(-endpoint,top),map(endpoint,top)],color.stiff,4);
 const u=-endpoint+2*endpoint*((t%18)/18);dot(ctx,...map(u,bend(u)),8,color.gold);dot(ctx,...map(u,top),8,color.stiff);
 for(const u of [-endpoint,endpoint])dot(ctx,...map(u,top),7,color.ink);
 label(ctx,'straight in the picture',505,390,color.stiff,23,'center');label(ctx,'along the soft valley',505,680,color.gold,23,'center');
 formula(ctx,'L(γ) = ∫ √(γ̇ᵀG(γ)γ̇) dt',980,285,color.gold,24);
 para(ctx,'The ruler is evaluated along the whole path.',980,340,500,color.body,28);
 const length=endpoint*Math.sqrt(1+36*endpoint*endpoint)+Math.asinh(6*endpoint)/6;
 formula(ctx,`straight: L = ${length.toFixed(2)}`,980,455,color.stiff,28);
 formula(ctx,'valley:   L = 3.40',980,520,color.gold,28);
 formula(ctx,'dG(p,q) = infγ L(γ)',980,625,color.ink,27);
 footer(ctx,'Local quadratic rulers define global path lengths; shortest paths define distance.','In this example, G is defined throughout the domain. Estimating ellipses only on a sampled centerline would not yet define these path costs.');
}));

export const curvatureScenes=[
 scene('Three meanings of curvature','Bending, changing ellipses, and intrinsic curvature',[
  [0,'We need three distinctions. A centerline can bend in the ambient picture. That is extrinsic curvature. It says how a chosen submanifold sits inside a surrounding space, not whether its own metric can be flattened.'],
  [15,'Second, covariance ellipses can change shape and direction from point to point. The bent-coordinate example does exactly that, yet its inverse-covariance metric is flat because one explicit coordinate map undoes the distortion.'],
  [30,'Third, intrinsic metric curvature measures a failure of compatibility between neighboring rulers. It affects parallel transport, geodesic separation, and finite-distance volume. It cannot be diagnosed from one covariance matrix, or merely from the fact that the matrices change.']
 ],(ctx,t)=>{
  [0,1,2].forEach(i=>panel(ctx,80+i*480,195,440,510,['1 · A bending centerline','2 · Changing local ellipses','3 · Intrinsic metric curvature'][i],[color.soft,color.gold,purple][i]));
  path(ctx,seq(100,f=>{const u=(f-.5)*3;return[300+105*u,480-70*bend(u)];}),color.soft,5);
  const u=1.2*Math.sin(t*.12),p=[300+105*u,480-70*bend(u)];dot(ctx,...p,8,color.soft);arrow(ctx,...p,p[0]+65,p[1]-65*(70/105)*.96*u,{color:color.gold,width:3});
  label(ctx,'A curve may be intrinsically flat.',300,635,color.soft,20,'center');
  for(let u=-1.2;u<=1.21;u+=.6){const slope=.96*u;path(ctx,seq(70,f=>{const a=f*Math.PI*2,du=.3*Math.cos(a),dv=.1*Math.sin(a);return[780+105*(u+du),480-70*(bend(u)+slope*du+dv)];}),color.gold,2);}
  label(ctx,'This entire ruler field is flat.',780,635,color.gold,20,'center');
  const s=loopState(seg(t,2,25)),x=1260+140*s.u,y=540-190*s.v;
  path(ctx,[[1183,540],[1337,540],[1337,416.5],[1183,416.5],[1183,540]],color.line,3);
  arrow(ctx,x,y,x+65*Math.cos(s.theta),y-65*Math.sin(s.theta),{color:purple,width:4});
  label(ctx,'Loop rotation survives whitening.',1260,635,purple,20,'center');
  footer(ctx,'Curvature belongs to a metric field on a domain, not to a covariance at one point.','A constant positive-definite covariance defines a flat ambient metric. Curvature needs a field and its spatial derivatives.');
 }),
 scene('From local units to global coordinates','Why a field of square roots is not automatically a map',[
  [0,'At each point, the metric square root turns a tiny physical step into a step measured in local units. For our curved example, those increments are d u and exponential of u times d v. Can we integrate them into coordinates z one and z two?'],
  [15,'Take the same rectangle. Moving upward on the right contributes exponential of b times h to z two. Moving downward on the left subtracts only exponential of a times h. The coordinate loop closes, but the accumulated local-unit increments do not.'],
  [30,'This proves that this particular square-root frame is not the derivative of a coordinate map. In general, another rotated frame might work. To prove that no frame can flatten a metric, we need the intrinsic curvature test, which the next transport experiment supplies.']
 ],(ctx,t)=>{
  const p=seg(t,3,29),s=loopState(p),a=-.55,b=.55,h=.65;
  panel(ctx,80,195,700,510,'Closed path in the original coordinate chart');
  const map=(u,v)=>[430+280*u,565-300*v];path(ctx,[map(a,0),map(b,0),map(b,h),map(a,h),map(a,0)],color.soft,3);dot(ctx,...map(s.u,s.v),8,color.gold);
  formula(ctx,'ω₁ = du',130,286,color.soft,28);formula(ctx,'ω₂ = eᵘ dv',410,286,color.gold,28);
  panel(ctx,820,195,700,510,'Add up the local-unit increments',color.gold);
  const pts=[[980,625],[1288,625],[1288,625-240*Math.exp(b)*h],[980,625-240*Math.exp(b)*h],[980,625-240*hyperbolicArea(a,b,h)]];
  const n=p*4,done=pts.slice(0,Math.floor(n)+1);if(n<4){const j=Math.floor(n),f=n-j;done.push([pts[j][0]+f*(pts[j+1][0]-pts[j][0]),pts[j][1]+f*(pts[j+1][1]-pts[j][1])]);}
  path(ctx,done,color.gold,4);if(done.length)dot(ctx,...done.at(-1),8,color.gold);
  if(p>.95){line(ctx,...pts[0],...pts[4],{color:color.stiff,width:3,dash:[6,6]});label(ctx,'gap',910,535,color.stiff,25);}
  label(ctx,'Up and down have different local scales.',860,287,color.gold,22);
  footer(ctx,'Pointwise whitening gives local units. A coordinate map also needs integrability.','A nonclosing chosen frame alone is not a curvature proof. Intrinsic holonomy decides whether every choice must fail.');
 }),
 scene('Zoom into curvature itself','Shrink the loop: the angle vanishes, the curvature does not',[
  [0,'A large-loop rotation mixes information from an entire region. Curvature is the local limit. Shrink our loop while measuring its metric area and the resulting transport angle. Both become smaller.'],
  [15,'The angle goes to zero in proportion to area. Their ratio stays minus one for this constant-curvature example. That ratio is the local curvature seen by this oriented two-dimensional tangent plane. In higher dimensions, different planes can have different sectional curvatures.'],
  [30,'This explains why every smooth metric looks Euclidean under a sufficiently close zoom, even if it is curved. The mismatch is a second-order effect. Knowing the ruler at one point removes leading anisotropy; knowing how nearby rulers fit together reveals curvature.']
 ],(ctx,t)=>{
  const scale=1-.84*seg(t,3,31),a=-.55,b=a+1.1*scale,h=.65*scale,area=hyperbolicArea(a,b,h),s=loopState(1,a,b,h);
  panel(ctx,80,195,790,510,'Same base point · progressively smaller loops');
  const cx=300,cy=580;
  for(const z of [1,.7,.4])path(ctx,[[cx,cy],[cx+360*z,cy],[cx+360*z,cy-230*z],[cx,cy-230*z],[cx,cy]],color.line,1);
  path(ctx,[[cx,cy],[cx+360*scale,cy],[cx+360*scale,cy-230*scale],[cx,cy-230*scale],[cx,cy]],color.gold,3);
  arrow(ctx,cx,cy,cx+100,cy,{color:color.dim,width:3});arrow(ctx,cx,cy,cx+100*Math.cos(s.theta),cy-100*Math.sin(s.theta),{color:purple,width:5});
  label(ctx,'Returned direction, shown in the starting orthonormal frame',120,660,color.muted,20);
  formula(ctx,`area = ${area.toFixed(4)}`,930,285,color.gold,31);
  formula(ctx,`angle = ${(-area).toFixed(4)} rad`,930,370,purple,29);
  formula(ctx,'angle / area = −1',930,485,purple,33);
  para(ctx,'Local curvature is a second-order failure to return, per unit area.',930,565,550,color.body,28);
  footer(ctx,'Round at a point does not mean flat on a neighborhood.','In normal coordinates: G(0) = I and ∂G(0) = 0; curvature enters the quadratic variation of G.');
 })
];
