import { defineScene, seg } from '../../kit.js';
import { camera } from '../../model/camera.js';
import { polyline3, polygon3 } from '../../draw/surface.js';
import { createRng } from '../../engine/random.js';
import { color, line, arrow, dot, label, big, formula, para, panel, path, ellipse, cloud, footer, seq, progress, purple } from './draw.js';
import { samples, categoricalEmbed, ellipsoid as E, ellipsoidEmbed, ellipsoidMetric, ellipsoidCovariance, ellipsoidSlope, ellipsoidAreaFactor, ellipsoidCurvature, ELLIPSOID_AREA, sqrt2 } from './math.js';
function scene(name,title,narration,draw,duration=45){return defineScene({name,duration,narration,header:{eyebrow:'COVARIANCE / AN EXACT EMBEDDING',title},draw(ctx,t){draw(ctx,t);progress(ctx,t,duration);}});}
const random=createRng(3317),capPoints=[];
const maxFactor=Math.sqrt(1+E.c**2*E.rmax**2/(Math.min(E.a,E.b)**2*(1-E.rmax**2)));
while(capPoints.length<20000){const r=E.rmax*Math.sqrt(random.uniform()),a=2*Math.PI*random.uniform(),q=[E.a*r*Math.cos(a),E.b*r*Math.sin(a)];if(random.uniform()*maxFactor<=ellipsoidAreaFactor(q))capPoints.push(ellipsoidEmbed(q));}
const display=([x,y,z])=>[x,z,y];
const camAt=(t,cx=1170,cy=440)=>camera({cx,cy,yaw:.35+t*.012,pitch:.5,scale:165,center:[0,1,0]});
function drawCap(ctx,cam,lift=1){
 for(let r=.1;r<=.801;r+=.1)polyline3(ctx,cam,seq(81,f=>{const a=f*Math.PI*2;return[E.a*r*Math.cos(a),lift*E.c*Math.sqrt(1-r*r),E.b*r*Math.sin(a)];}),{color:color.line,width:1.4});
 for(let a=0;a<Math.PI*2;a+=Math.PI/8)polyline3(ctx,cam,seq(50,f=>{const r=E.rmax*f;return[E.a*r*Math.cos(a),lift*E.c*Math.sqrt(1-r*r),E.b*r*Math.sin(a)];}),{color:color.line,width:1.4});
}
function points3(ctx,cam,pts,tint=color.soft,alpha=.6){const pp=pts.map(p=>cam.project(display(p))).sort((a,b)=>b.z-a.z);for(const p of pp)dot(ctx,p.x,p.y,2.6,tint,alpha);}
const nx=24,ny=12,dx=.1,dy=.1,xmin=-1.2,ymin=-.6;
const bins=Array.from({length:nx*ny},(_,k)=>({i:k%nx,j:Math.floor(k/nx),count:0,flatArea:0,surfaceArea:0}));
for(const p of capPoints){const i=Math.floor((p[0]-xmin)/dx),j=Math.floor((p[1]-ymin)/dy);if(i>=0&&i<nx&&j>=0&&j<ny)bins[j*nx+i].count++;}
for(const b of bins)for(let i=0;i<20;i++)for(let j=0;j<20;j++){const q=[xmin+(b.i+(i+.5)/20)*dx,ymin+(b.j+(j+.5)/20)*dy];if(q[0]**2/E.a**2+q[1]**2/E.b**2<=E.rmax**2){b.flatArea+=dx*dy/400;b.surfaceArea+=dx*dy/400*ellipsoidAreaFactor(q);}}
function heatColor(value){const f=Math.max(0,Math.min(1,(value-0.6)/(maxFactor-.6)));return `rgb(${Math.round(35+210*f)},${Math.round(90+110*f)},${Math.round(145-65*f)})`;}
// Each histogram column keeps the part of its rectangular bin that lies inside
// the ellipse. This avoids dropping the narrow boundary bins or drawing bars
// outside the support. A fine inscribed polygon gives a stable bin area.
function clipHalfPlane(poly,axis,value,keepGreater){
 const out=[],inside=p=>keepGreater?p[axis]>=value:p[axis]<=value;
 for(let k=0;k<poly.length;k++){const p=poly[k],q=poly[(k+1)%poly.length],pin=inside(p),qin=inside(q);if(pin)out.push(p);if(pin!==qin){const f=(value-p[axis])/(q[axis]-p[axis]);out.push(p.map((v,i)=>v+f*(q[i]-v)));}}
 return out;
}
const footprint=Array.from({length:1024},(_,i)=>{const a=i*2*Math.PI/1024;return[E.a*E.rmax*Math.cos(a),E.b*E.rmax*Math.sin(a)];});
for(const b of bins){
 let poly=footprint;for(const [axis,bound,greater] of [[0,xmin+b.i*dx,true],[0,xmin+(b.i+1)*dx,false],[1,ymin+b.j*dy,true],[1,ymin+(b.j+1)*dy,false]])poly=clipHalfPlane(poly,axis,bound,greater);
 b.footprint=poly;b.histArea=Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-p[1]*q[0];},0))/2;
 b.density=b.histArea>0?b.count/(capPoints.length*b.histArea):0;
}
const densityHeight=1.3;
function drawHistogram(ctx,cam,growth=1){
 // Sort all faces together: the complete footprint remains visible while the
 // high boundary bins naturally occlude parts of the interior from this angle.
 const faces=[];
 for(const b of bins){if(!b.count||!b.histArea)continue;const h=b.density*densityHeight*growth;
  const top=b.footprint.map(([x,y])=>[x,h,y]),tint=heatColor(b.density*ELLIPSOID_AREA);
  faces.push({pts:top,tint,shade:1});
  for(let k=0;k<top.length;k++){const p=top[k],q=top[(k+1)%top.length];if(cam.rotate([q[2]-p[2],0,p[0]-q[0]])[2]>=0)continue;faces.push({pts:[[p[0],0,p[2]],[q[0],0,q[2]],q,p],tint,shade:.55});}
 }
 for(const f of faces)f.depth=f.pts.reduce((s,p)=>s+cam.project(p).z,0)/f.pts.length;
 faces.sort((a,b)=>b.depth-a.depth);
 for(const f of faces){polygon3(ctx,cam,f.pts,{fill:f.tint,stroke:f.shade===1?'#233346':undefined,width:.7});if(f.shade<1)polygon3(ctx,cam,f.pts,{fill:'#06111f',alpha:1-f.shade});}
 polyline3(ctx,cam,[...footprint,footprint[0]].map(([x,y])=>[x,0,y]),{color:color.soft,width:1.4});
}

export const embeddingScenes=[
 scene('A 2D distribution lifted into 3D','Stretch the cap: uniform on a surface, uneven in its projection',[
  [0,'Start with a tall ellipsoidal cap, stretched twice as far along one horizontal axis as the other. These points are sampled uniformly by actual surface area. Simply stretching points sampled on a sphere would not preserve that uniformity.'],
  [15,'Project the surface vertically down to the plane. The footprint is an ellipse. Steep regions squeeze a larger piece of surface into a smaller patch of the plane, so equal projected areas receive different numbers of points.'],
  [30,'The height function is two times square root of one minus x squared over one point five squared minus y squared over zero point seven five squared. Its graph is an explicit embedding of the two-dimensional footprint back into three dimensions.'],
  [45,'The next histogram quantifies the density change. Then we project tiny isotropic surface fluctuations to see the metric transformation. Global sample density and local increment covariance answer different questions, so we will keep both visible.']
 ],(ctx,t)=>{
  panel(ctx,80,195,700,510,'2D data · vertical projection of the surface samples');panel(ctx,820,195,700,510,'Uniform surface-area samples on the stretched cap',color.gold);
  const map=([x,y])=>[430+225*x,475-225*y];ellipse(ctx,430,475,270,135,color.line);
  cloud(ctx,capPoints.slice(0,1000),map,color.soft,2.7,.6,[115,320,630,310]);
  const cam=camAt(t);drawCap(ctx,cam);points3(ctx,cam,capPoints.slice(0,1000),color.gold);
  polyline3(ctx,cam,seq(81,f=>[E.a*E.rmax*Math.cos(f*2*Math.PI),0,E.b*E.rmax*Math.sin(f*2*Math.PI)]),{color:color.soft,width:1.5,alpha:.6});
  const a=seg(t,8,27);for(let i=0;i<5;i++){const q=capPoints[i*53],p=cam.project(display(q)),f=cam.project(display([q[0],q[1],0]));line(ctx,p.x,p.y,p.x+(f.x-p.x)*a,p.y+(f.y-p.y)*a,{color:color.dim,dash:[4,6],alpha:.7});}
  formula(ctx,'F(x,y) = (x,y,h(x,y))',115,278,color.soft,27);
  formula(ctx,'h = 2√(1−x²/1.5²−y²/0.75²)',850,278,color.gold,22);
  label(ctx,'Same physical scale on the two projected axes',430,660,color.muted,21,'center');label(ctx,'Semi-axes: 1.5, 0.75, 2',1170,690,color.gold,22,'center');
  footer(ctx,'Projection changes area. Uniform surface density does not stay uniform in 2D.','Let w = ∇h and J = dF. The local surface-area factor is √det(JᵀJ) = √(1 + ‖w‖²).');
 },60),
 scene('The full projected histogram','A full histogram over the elliptical projection',[
  [0,'The surface points are uniform per unit surface area. On the right, their projected locations fill a two-dimensional histogram. Every rectangular bin is drawn, including its intersection with the curved boundary. These are the same twenty thousand samples.'],
  [15,'The horizontal axes are the projected coordinates x and y. The vertical axis is probability density: the count in a bin divided by the total sample count and its projected area. The total volume of the histogram bars is one.'],
  [30,'Notice the raised rim and lower center. Steep surface regions compress more area into the plane, so their bins stand taller. Histogram height represents probability density; it is not the original height of the cap.'],
  [45,'The gold reference line marks one over the cap area, the constant surface density. Projected density grows above it by the surface-area factor. Next, divide the same counts by surface area instead, and the histogram becomes nearly level.']
 ],(ctx,t)=>{
  panel(ctx,80,195,560,510,'Uniform samples on the 3D cap',color.gold);
  panel(ctx,680,195,840,510,'Full 2D histogram · bar height = projected density');
  const capCam=camera({cx:360,cy:465,yaw:.4+.05*Math.sin(t*.05),pitch:-.35,scale:145,center:[0,1,0],focal:20});
  drawCap(ctx,capCam);points3(ctx,capCam,capPoints.slice(0,750),color.gold,.65);
  const rim=seq(81,f=>[E.a*E.rmax*Math.cos(f*2*Math.PI),0,E.b*E.rmax*Math.sin(f*2*Math.PI)]);
  polyline3(ctx,capCam,rim,{color:color.soft,width:1.5,alpha:.65});
  for(let k=0;k<4;k++){const q=capPoints[k*53],p=capCam.project(display(q)),f=capCam.project(display([q[0],q[1],0]));line(ctx,p.x,p.y,f.x,f.y,{color:color.dim,dash:[4,6],alpha:.6});}
  label(ctx,'Uniform in surface area',360,655,color.gold,23,'center');
  const histCam=camera({cx:1110,cy:435,yaw:.42+.07*Math.sin(t*.07),pitch:-.64,scale:155,center:[0,.7,0],focal:30});
  const growth=seg(t,2,9);
  drawHistogram(ctx,histCam,growth);
  // Density axis and ticks use the same height conversion as every bar.
  const axis=[-1.4,0,-.78],axisTop=[axis[0],1.2*densityHeight,axis[2]];
  polyline3(ctx,histCam,[axis,axisTop],{color:color.body,width:1.5});
  for(const d of [0,.4,.8,1.2]){const p=histCam.project([axis[0],d*densityHeight,axis[2]]);line(ctx,p.x-5,p.y,p.x+5,p.y,{color:color.body});label(ctx,d.toFixed(1),p.x-11,p.y+5,color.body,17,'right');}
  const densityTop=histCam.project(axisTop);label(ctx,'density',densityTop.x-12,densityTop.y-18,color.soft,19,'center');
  const ref=1/ELLIPSOID_AREA,ref0=histCam.project([axis[0],ref*densityHeight,axis[2]]),ref1=histCam.project([1.25,ref*densityHeight,axis[2]]);
  line(ctx,ref0.x,ref0.y,ref1.x,ref1.y,{color:color.gold,width:1.5,dash:[5,5],alpha:.8});
  polyline3(ctx,histCam,[[-1.2,0,-.76],[1.3,0,-.76]],{color:color.muted,width:1.3});
  polyline3(ctx,histCam,[[1.3,0,-.6],[1.3,0,.7]],{color:color.muted,width:1.3});
  const xp=histCam.project([1.38,0,-.76]),yp=histCam.project([1.3,0,.82]);label(ctx,'x',xp.x+10,xp.y+5,color.soft,22);label(ctx,'y',yp.x+8,yp.y,color.soft,22);
  formula(ctx,'p̂_b = count_b / (20,000 × area_b)',720,276,color.soft,22);
  label(ctx,'Gold reference: 1 / A ≈ 0.244',1110,681,color.gold,21,'center');
  footer(ctx,'A tall histogram bar means high probability density, not high surface elevation.','All 20,000 samples contribute. Heights use the area of each bin inside the ellipse; bar volumes sum to one.');
 },60),
 scene('A histogram of the projection','Count the same samples using two different area measures',[
  [0,'These are histograms of the same twenty thousand surface-uniform samples. Each cell identifies the same projected patch in both panels. On the left we divide its count by its area in the two-dimensional plane.'],
  [15,'On the right we divide that same count by the corresponding surface area, which is larger on steeper patches. The right-hand density is nearly constant; the left-hand density increases where projection compresses area. Small irregularities are finite-sample noise.'],
  [30,'This is the Jacobian in a visible form. Projected density equals surface density times square root of determinant G. The surface ruler is still Euclidean along each tangent plane; its coordinate matrix in the projection is the varying metric G.']
 ],(ctx,t)=>{
  for(let k=0;k<2;k++){const cx=430+740*k;panel(ctx,80+740*k,195,700,510,k?'2D histogram · count / surface area':'2D histogram · count / projected area',k?color.gold:color.soft);
   ctx.save();ctx.beginPath();ctx.ellipse(cx,485,270,135,0,0,2*Math.PI);ctx.clip();
   for(const b of bins){if(b.flatArea<.0025)continue;const measure=k?b.surfaceArea:b.flatArea,value=b.count/(capPoints.length*measure)*ELLIPSOID_AREA;ctx.fillStyle=heatColor(value);ctx.fillRect(cx+225*(xmin+b.i*dx),485-225*(ymin+(b.j+1)*dy),22,22);}
   ctx.restore();ellipse(ctx,cx,485,270,135,color.line);label(ctx,k?'Uniform, up to sampling noise':'Denser where the surface is steeper',cx,660,k?color.gold:color.soft,23,'center');
  }
  for(let i=0;i<180;i++){ctx.fillStyle=heatColor(.6+(maxFactor-.6)*i/179);ctx.fillRect(620+2*i,286,2,18);}
  label(ctx,'low',600,302,color.muted,18,'right');label(ctx,'high',995,302,color.muted,18);
  footer(ctx,'p₂D(x) = √det G(x) / A;     p_surface = 1 / A.',`A ≈ ${ELLIPSOID_AREA.toFixed(3)} is the cap’s surface area. Both histograms use the same color scale; boundary-bin areas are accounted for.`);
 }),
 scene('The pullback equals inverse covariance','Project the fluctuations and the ruler together',[
  [0,'On a surface tangent plane, choose an orthonormal basis. Euclidean length is ordinary length in that basis, and isotropic infinitesimal fluctuations have identity covariance. Projection maps those tangent coordinates into two dimensions by a matrix P.'],
  [15,'The projected fluctuations have covariance C equals P P transpose. To recover the original length of a projected step, undo P before measuring. This gives the metric P inverse transpose times P inverse, exactly C inverse.'],
  [30,'For our graph surface, G is I plus gradient h times its transpose. The displayed ellipses and lifted tangent fluctuations obey this identity at the moving point. The ellipsoid remains intrinsically curved; the inverse-covariance metric records that curved surface geometry in two-dimensional coordinates.']
 ],(ctx,t)=>{
  panel(ctx,80,195,700,510,'Projected covariance · magnified infinitesimal steps');panel(ctx,820,195,700,510,'Euclidean tangent plane in 3D · isotropic fluctuations',color.gold);
  const r=.15+.6*seg(t,3,30),a=-.8+.15*Math.sin(t*.08),q=[E.a*r*Math.cos(a),E.b*r*Math.sin(a)],cam=camAt(t),C=ellipsoidCovariance(q),P=sqrt2(C),w=ellipsoidSlope(q),point=ellipsoidEmbed(q);
  const map=([x,y])=>[430+225*x,475-225*y];ellipse(ctx,430,475,270,135,color.line);
  for(let rad of [.2,.45,.7])for(let angle=0;angle<6.28;angle+=Math.PI/4){const p=[E.a*rad*Math.cos(angle),E.b*rad*Math.sin(angle)],S=sqrt2(ellipsoidCovariance(p));path(ctx,seq(41,f=>{const u=Math.cos(f*2*Math.PI),v=Math.sin(f*2*Math.PI);return map([p[0]+.075*(S[0][0]*u+S[0][1]*v),p[1]+.075*(S[1][0]*u+S[1][1]*v)]);}),color.dim,1);}
  const delta=([u,v])=>{const x=.13*(P[0][0]*u+P[0][1]*v),y=.13*(P[1][0]*u+P[1][1]*v);return[x,y,w[0]*x+w[1]*y];};
  cloud(ctx,samples.slice(0,230).map(s=>{const d=delta(s);return[q[0]+d[0],q[1]+d[1]];}),map,color.gold,2.7,.7,[115,320,630,310]);
  drawCap(ctx,cam);points3(ctx,cam,samples.slice(0,230).map(s=>{const d=delta(s);return point.map((x,i)=>x+d[i]);}),color.gold,.75);
  const circ=seq(81,f=>delta([Math.cos(f*2*Math.PI),Math.sin(f*2*Math.PI)]));path(ctx,circ.map(d=>map([q[0]+d[0],q[1]+d[1]])),color.stiff,3);polyline3(ctx,cam,circ.map(d=>display(point.map((x,i)=>x+d[i]))),{color:color.stiff,width:3});
  formula(ctx,'C = PPᵀ',115,278,color.soft,30);formula(ctx,'G = JᵀJ = I + wwᵀ',850,278,color.gold,27);
  arrow(ctx,835,450,765,450,{color:color.stiff,width:3});label(ctx,'P',800,425,color.stiff,25,'center');
  formula(ctx,'G = P⁻ᵀP⁻¹ = C⁻¹',150,660,color.gold,28);label(ctx,`Gaussian curvature here: ${ellipsoidCurvature(q).toFixed(3)} > 0`,1170,660,color.gold,22,'center');
  footer(ctx,'A projected step δx has original surface length² = δxᵀ C⁻¹ δx.','C is the conditional infinitesimal covariance rate of isotropic surface motion. The histogram’s density alone does not determine C.');
 }),
 scene('A distribution family with the same property','A statistical example: three outcomes, two free probabilities',[
  [0,'Consider a family of distributions in two dimensions. An observation is one zero, zero one, or zero zero, with probabilities u, v, and one minus u minus v. Its mean is u, v, a point inside this triangle.'],
  [15,'Its covariance has diagonal entries u times one minus u, and v times one minus v, with off-diagonal entry minus u v. As the mean changes, this defines a covariance field over the interior of the triangle. The field belongs to a family of distributions.'],
  [30,'Take twice the square roots of all three probabilities. The embedded points lie on a sphere of radius two. Differentiating this map gives a pullback metric exactly equal to inverse covariance.'],
  [45,'This is the categorical Fisher metric, with Gaussian curvature one quarter. For averages of n observations, covariance becomes C over n, so multiply the embedding by square root n. The surface represents distributions, not the three individual outcomes.']
 ],(ctx,t)=>{
  panel(ctx,80,195,700,510,'Mean parameters (u,v) · one distribution at each point');panel(ctx,820,195,700,510,'The probability triangle embedded as a spherical patch',color.gold);
  const map=([u,v])=>[175+275*u,575-275*v];path(ctx,[map([0,0]),map([1,0]),map([0,1]),map([0,0])],color.soft,3);
  label(ctx,'(0,0)',150,610,color.muted,21);label(ctx,'(1,0)',430,610,color.muted,21);label(ctx,'(0,1)',140,283,color.muted,21);
  formula(ctx,'C₁₁ = u(1−u)',490,340,color.soft,21);formula(ctx,'C₂₂ = v(1−v)',490,390,color.soft,21);formula(ctx,'C₁₂ = −uv',490,440,purple,21);
  const cam=camera({cx:1170,cy:480,scale:140,yaw:3*Math.PI/4+.08*Math.sin(t*.03),pitch:-Math.atan(1/Math.SQRT2),center:[.85,.85,.85]});
  for(const edge of [0,1,2])polyline3(ctx,cam,seq(81,f=>categoricalEmbed(edge===0?[.0001,.9998*f]:edge===1?[.9998*f,.0001]:[.9998*f,.9998*(1-f)])),{color:color.gold,width:2});
  for(let k=1;k<=8;k++){const u=k/10;path(ctx,seq(61,f=>map([u,(1-u)*f])),color.line,1);path(ctx,seq(61,f=>map([(1-u)*f,u])),color.line,1);
   polyline3(ctx,cam,seq(61,f=>categoricalEmbed([u,(1-u)*f*.999])),{color:color.line,width:1.5});polyline3(ctx,cam,seq(61,f=>categoricalEmbed([(1-u)*f*.999,u])),{color:color.soft,width:1.5});}
  const q=[.28+.12*Math.sin(t*.12),.28+.1*Math.cos(t*.12)],p=map(q);dot(ctx,...p,8,color.gold);const lifted=cam.project(categoricalEmbed(q));dot(ctx,lifted.x,lifted.y,9,color.gold);
  label(ctx,`u = ${q[0].toFixed(2)}, v = ${q[1].toFixed(2)}`,420,658,color.gold,23,'center');
  formula(ctx,'F = 2(√u, √v, √(1−u−v))',850,277,color.gold,24);
  formula(ctx,'JᵀJ = Cov(X | u,v)⁻¹',870,660,color.gold,27);
  footer(ctx,'Exact inverse covariance, an explicit 3D embedding, and nonzero intrinsic curvature.','Here the surface parametrizes a family of 2D categorical distributions. Radius 2 gives Gaussian curvature 1/4.');
 },60)
];
