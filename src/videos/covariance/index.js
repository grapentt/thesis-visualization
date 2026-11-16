import meta from './meta.json' with { type: 'json' };
import { foundationScenes } from './foundations.js';
import { varianceScene, countScene, objectsScene } from './basics.js';
import { distributionScenes } from './distributions.js';
import { localScenes, curvatureScenes } from './local-global.js';
import { embeddingScenes } from './embedding.js';
import { columnScene, eigenScene, fieldScene } from './clarity.js';
import { defineScene, seg, slider } from '../../kit.js';
import { samples, ribbonSamples, bend, warp, metricWidths, flow, signalFraction, loopState, hyperbolicArea } from './math.js';
import { text, color, font, line, arrow, dot, label, big, formula, para, panel, path, ellipse, axes, cloud, footer, badge, seq, progress, purple, mint } from './draw.js';

const scenes = [];
function chapter(name, title, narration, draw, extra = {}) {
  const number=String(scenes.length).padStart(2,'0');
  const duration=extra.duration ?? 45;
  scenes.push(defineScene({name,duration,narration,header:{eyebrow:`COVARIANCE / ${number} / THE GEOMETRY OF FLUCTUATIONS`,title},
    ...extra,draw(ctx,t,live){draw(ctx,t,live);progress(ctx,t,duration);}}));
}
const lerp=(a,b,t)=>a+(b-a)*t;

chapter('A cloud, three geometries','Which ruler makes the structure clear?',[
 [0,'A molecular configuration is a point. An ensemble is a cloud. Some directions fluctuate freely; others barely move. The question is not just where the points are, but how we measure the distance between them.'],
 [15,'We will compare three rulers on exactly the same data: ordinary Euclidean distance, inverse covariance, and covariance itself. They answer different questions and can produce opposite visual effects.'],
 [30,'Then we will follow these rulers through a curved cloud. We will separate stiffness, bending, and intrinsic curvature, and see precisely what a metric can undo.']
],(ctx,t)=>{
 const titles=['Physical coordinates','Thermal coordinates','Covariance-weighted'];
 const colors=[color.soft,color.gold,purple];
 const r=5;
 [0,-1,1].forEach((p,i)=>{
  const cx=320+480*i; panel(ctx,cx-215,204,430,470,titles[i],colors[i]);
  const exponent=p*seg(t,3,12);const widths=metricWidths(r,exponent);
  axes(ctx,cx,433,180,153);cloud(ctx,samples,([a,b])=>[cx+a*65,433-b*65*widths[1]],colors[i],2.6,.55,[cx-195,270,390,300]);
  ellipse(ctx,cx,433,130,130*widths[1],colors[i]);
  formula(ctx,['G = I','G = Σ⁻¹','G = Σ'][i],cx-90,620,colors[i],27);
 });
 footer(ctx,'Same points. Different notions of length.','Inverse covariance makes a local cloud round. Covariance accentuates its thinness.');
});

chapter('What a covariance measures','A covariance ellipse is a map of fluctuations',[
 [0,'First choose internal coordinates, after removing rigid translation and rotation. Within one local ensemble, subtract the mean. Covariance averages the outer products of these centered fluctuations.'],
 [15,'Its eigenvectors are the principal directions of variation. Its eigenvalues are variances: the square of the typical displacement in each direction. Here the standard deviations are one and one fifth.'],
 [30,'A one-standard-deviation displacement is equally typical in either direction. Yet its ordinary length differs by five. The inverse-covariance ruler assigns both displacements length one.']
],(ctx,t)=>{
 panel(ctx,80,195,790,510,'A local ensemble in two internal directions');
 const cx=465,cy=445,theta=-.24;
 const map=([a,b])=>[cx+120*(a*Math.cos(theta)-b*.2*Math.sin(theta)),cy+120*(a*Math.sin(theta)+b*.2*Math.cos(theta))];
 axes(ctx,cx,cy,320,180);cloud(ctx,samples,map);
 ellipse(ctx,cx,cy,240,48,color.gold,theta,true);
 const p=map([1,0]),q=map([0,1]);
 arrow(ctx,cx,cy,...p,{color:color.soft,width:4});arrow(ctx,cx,cy,...q,{color:color.stiff,width:4});
 label(ctx,'soft: σ₁ = 1',p[0]+14,p[1]-12,color.soft,22);
 label(ctx,'stiff: σ₂ = 0.2',q[0]-15,q[1]+40,color.stiff,22);
 formula(ctx,'Σ = E[(x−μ)(x−μ)ᵀ]',920,260,color.gold,26);
 formula(ctx,'Σeᵢ = λᵢeᵢ',920,326,color.ink,30);
 para(ctx,'Eigenvalue λᵢ = variance\n',920,376,565,color.body,24);
 formula(ctx,'σᵢ = √λᵢ',920,424,color.soft,32);
 if(t>14){formula(ctx,'‖σᵢeᵢ‖²Σ⁻¹ = 1',920,526,color.gold,30);para(ctx,'Measure a step in units of the fluctuations available along that direction.',920,574,540);}
 footer(ctx,'Typical displacement, not just physical displacement.','Σ here is configuration fluctuation covariance, not the 3 × 3 spatial covariance of atoms in one molecule.');
});

chapter('Why covariance knows stiffness','Narrow fluctuations reveal a steep energy well',[
 [0,'Near a stable minimum, approximate the energy by a quadratic form with positive stiffness matrix K. At thermal equilibrium, probability is proportional to the exponential of minus energy divided by thermal energy.'],
 [15,'This gives a Gaussian with covariance equal to thermal energy times the inverse stiffness. A mode that is twenty-five times stiffer has twenty-five times less variance, or five times less standard deviation.'],
 [30,'The dimensionless thermal metric is therefore inverse covariance, or stiffness divided by thermal energy. This relation is exact for the harmonic Gaussian model. Across barriers or curved basins, one global covariance does not determine local stiffness.']
],(ctx,t)=>{
 const k=[1,25];
 k.forEach((kk,i)=>{
  const cx=360+i*590,cy=610;
  panel(ctx,cx-270,195,540,490,i?'Stiff mode · bond-like':'Soft mode · torsion-like',i?color.stiff:color.soft);
  const tint=i?color.stiff:color.soft;
  const pts=seq(121,f=>{const x=(f-.5)*4.8;return[cx+80*x,cy-65*.5*kk*x*x]}).filter(p=>p[1]>260);
  line(ctx,cx-220,cy,cx+220,cy,{color:color.line});path(ctx,pts,tint,3);
  const thermalY=cy-65*.5;
  line(ctx,cx-180,thermalY,cx+180,thermalY,{color:color.gold,dash:[5,5]});
  const x=Math.cos(t*.9)*1/Math.sqrt(kk);dot(ctx,cx+80*x,cy-65*.5*kk*x*x,8,tint);
  arrow(ctx,cx-80/Math.sqrt(kk),cy+35,cx+80/Math.sqrt(kk),cy+35,{color:tint,width:3});
  label(ctx,`k = ${kk}     σ = ${1/Math.sqrt(kk)}`,cx,660,tint,22,'center');
 });
 formula(ctx,'U ≈ ½ δxᵀKδx',1225,295,color.ink,23);
 formula(ctx,'p ∝ e⁻ᵁ/ᵏᴮᵀ',1225,355,color.ink,23);
 formula(ctx,'Σ = kBT K⁻¹',1225,450,color.gold,23);
 formula(ctx,'G = Σ⁻¹',1225,520,color.gold,26);
 footer(ctx,'Stiffness is inverse thermal variance.','Throughout the numerical toys: kBT = 1, Σ = diag(1, 1/25), and K = diag(1, 25).');
});

chapter('Whitening is a change of units','Watch the same samples change coordinates',[
 [0,'A constant metric becomes visible by changing coordinates. Multiply a displacement by the square root of the metric. Ordinary distances in the new coordinates then equal metric distances in the old coordinates.'],
 [15,'For inverse covariance this is whitening. Each component is divided by its own standard deviation. The narrow direction expands; the broad direction stays at its chosen unit scale. The covariance becomes the identity.'],
 [30,'We have not moved physical atoms or changed the data law. We have changed its representation. A thermal unit step is small in a stiff physical direction and large in a soft direction.']
],(ctx,t)=>{
 const a=seg(t,8,25),cx=1050,cy=445;
 panel(ctx,80,195,570,510,'Physical view · x');panel(ctx,730,195,790,510,'Thermal view · z = Σ⁻¹ᐟ²(x − μ)',color.gold);
 cloud(ctx,samples,([u,v])=>[365+72*u,445-72*.2*v]);axes(ctx,365,445,225,175);ellipse(ctx,365,445,144,28.8,color.soft);
 const stretch=lerp(.2,1,a);
 for(let j=-2;j<=2;j++){line(ctx,800,cy+72*j*stretch,1430,cy+72*j*stretch,{color:color.grid});line(ctx,cx+72*j,250,cx+72*j,640,{color:color.grid});}
 cloud(ctx,samples,([u,v])=>[cx+72*u,cy-72*stretch*v],color.gold);ellipse(ctx,cx,cy,144,144*stretch,color.gold);
 arrow(ctx,665,445,715,445,{color:color.gold});
 formula(ctx,'Cov(z) = I',930,661,color.gold,28);
 footer(ctx,'A sphere in thermal units is an ellipse in physical units.','G¹ᐟ² Σ G¹ᐟ² = I   when G = Σ⁻¹. This is a local statement for a varying metric.');
});

chapter('Undoing numerical stiffness','The same energy, with balanced relaxation',[
 [0,'Stiffness also appears in motion down an energy landscape. In ordinary gradient flow, the stiff coordinate relaxes twenty-five times faster than the soft one. The path snaps across the valley, then slowly crawls along it.'],
 [15,'The metric converts the energy differential into a gradient vector by multiplying by inverse G. With G equal to K in our thermal units, the resulting flow is simply minus x: every mode relaxes at the same rate.'],
 [30,'This removes the separation of numerical time scales in the harmonic model. It deliberately changes the relaxation dynamics. It does not claim that a real molecule has lost its stiff bonds or that physical time has been preserved.']
],(ctx,t)=>{
 const time=4*((t%14)/14);
 [false,true].forEach((m,i)=>{
  const cx=420+i*760,cy=480,tint=m?color.gold:color.soft;
  panel(ctx,80+i*760,195,680,510,m?'Metric gradient flow':'Euclidean gradient flow',tint);
  for(let j=1;j<=4;j++)ellipse(ctx,cx,cy,j*65,j*26,color.line);
  const points=seq(120,f=>flow(f*4,m)).map(([u,v])=>[cx+u*130,cy-v*260]);path(ctx,points,tint,3);
  const p=flow(time,m);dot(ctx,cx+p[0]*130,cy-p[1]*260,8,tint);
  formula(ctx,m?'ẋ = −G⁻¹Kx = −x':'ẋ = −Kx',cx-215,295,tint,28);
  label(ctx,m?'rates: 1 and 1':'rates: 1 and 25',cx,640,tint,24,'center');
 });
 footer(ctx,'Preconditioning balances rates; it does not soften the potential.','For the Gaussian score: d log p = −Kx, while gradG log p = G⁻¹ d log p = −x.');
});

chapter('Noise, scores, and loss','Three uses of one ruler — three separate choices',[
 [0,'A metric can shape the noise, raise the score into a vector, and measure prediction errors. These are separate choices. Merely changing the loss cannot repair information that the forward noise has already erased.'],
 [15,'Here we add Gaussian noise with variance t. With equal noise in physical coordinates, the stiff mode loses its signal first. With noise covariance t times Sigma, the noise-to-signal ratio is identical in both modes.'],
 [30,'For this constant Gaussian example, the noisy score raised with inverse G has equal gains in every direction. A matching metric loss also balances errors in thermal units. A varying metric requires additional drift and volume terms; we return to those shortly.']
],(ctx,t)=>{
 const tau=2.5*seg(t,2,35);
 [false,true].forEach((shaped,i)=>{
  const x=80+i*740;panel(ctx,x,195,700,380,shaped?'Noise covariance tΣ':'Noise covariance tI',shaped?color.gold:color.soft);
  [1,.04].forEach((lam,j)=>{
   const y=327+j*105;label(ctx,j?'stiff signal':'soft signal',x+25,y-20,j?color.stiff:color.soft,22);
   const f=signalFraction(tau,lam,shaped);
   line(ctx,x+25,y+8,x+560,y+8,{color:color.line,width:18});line(ctx,x+25,y+8,x+25+535*f,y+8,{color:j?color.stiff:color.soft,width:18});
   label(ctx,`${(100*f).toFixed(0)}%`,x+610,y+15,color.ink,23);
  });
 });
 label(ctx,`Signal fraction = λ / (λ + noise variance)          t = ${tau.toFixed(2)}`,85,615,color.muted,22);
 formula(ctx,'v = G⁻¹s',85,679,color.gold,28);formula(ctx,'‖δv‖²G = δsᵀG⁻¹δs',555,679,color.gold,28);
 footer(ctx,'Match the noise, target representation, and error norm deliberately.','Constant example: xₜ = x₀ + √t Σ¹ᐟ²ε gives vₜ = −xₜ/(1+t), in every mode.');
});

chapter('Local, not global','A bending valley needs rulers that turn with it',[
 [0,'Now the cloud bends. At each location, nearby fluctuations have their own soft direction and narrow direction. A single covariance over the whole cloud mixes the curvature of its centerline with its local thickness.'],
 [15,'The moving ellipse shows a local covariance field generated by a known curved coordinate map. Its long direction follows the valley. A fixed global ellipse cannot follow that changing direction.'],
 [30,'Local covariance must come from a declared ensemble: a neighborhood, a conditional equilibrium, or short trajectory increments. These are not interchangeable. At very short times, overdamped increments measure diffusion or mobility, not equilibrium stiffness.']
],(ctx,t)=>{
 panel(ctx,80,195,900,510,'A manufactured curved cloud · fixed samples');
 const map=([u,v])=>[530+175*u,475-110*v];
 cloud(ctx,ribbonSamples,p=>map(warp(p)));
 path(ctx,seq(100,f=>map(warp([(f-.5)*4.5,0]))),color.gold,3);
 const u=1.7*Math.sin(t*.17),c=map(warp([u,0]));
 const pts=seq(81,f=>{const a=f*2*Math.PI,du=.34*Math.cos(a),dv=.085*Math.sin(a);return map([u+du,bend(u)+.96*u*du+dv]);});
 path(ctx,pts,color.stiff,3);dot(ctx,...c,5,color.stiff);
 ellipse(ctx,530,450,320,170,color.dim,0);
 label(ctx,'global spread',150,310,color.dim,21);label(ctx,'local fluctuation',c[0]-55,c[1]+58,color.stiff,21);
 formula(ctx,'Σ = Σ(x)',1030,280,color.gold,38);
 para(ctx,'The metric must follow the local directions, not the overall silhouette.',1030,345,450,color.body,28);
 para(ctx,'Align / quotient symmetries. Choose a sampling scale. Separate motion along the valley from noise across it.',1030,525,450,color.muted,23);
 footer(ctx,'A covariance is only meaningful together with its sampling rule.','A thin bent cloud does not, by itself, prove that its intrinsic metric is curved.');
});

chapter('A bent cloud that is flat','Bending in the picture can be completely removable',[
 [0,'Here is an exact example. Start with flat latent coordinates u and v. Bend them into x equals u and y equals v plus b of u. The vertical spread is small, so the resulting cloud looks like a curved ribbon.'],
 [15,'The local covariance is the pushed-forward latent covariance. Its inverse defines a metric whose squared length is d x squared plus d y minus b prime d x, squared and divided by the narrow variance.'],
 [30,'Undo the bend and divide by the narrow standard deviation. The metric becomes Euclidean everywhere. This works because the metric was flat all along. Position-dependent coefficients and rotating covariance ellipses do not, by themselves, imply intrinsic curvature.']
],(ctx,t)=>{
 const a=seg(t,10,30);
 panel(ctx,80,195,850,510,'An exact, invertible coordinate change',color.gold);
 const map=([u,v])=>[500+160*u,445-90*v];
 for(let v=-2;v<=2;v+=.5)path(ctx,seq(100,f=>{const u=(f-.5)*4.6;return map([u,v+ (1-a)*bend(u)]);}),color.grid,1.3);
 for(let u=-2;u<=2;u+=.4)path(ctx,seq(40,f=>map([u,(f-.5)*4.5+(1-a)*bend(u)])),color.grid,1.3);
 cloud(ctx,ribbonSamples,([u,v])=>map([u,lerp(v,v/.16,a)+(1-a)*bend(u)]),color.gold);
 formula(ctx,'F(u,v) = (u, v+b(u))',985,265,color.ink,24);
 formula(ctx,'z₁ = x',985,355,color.gold,28);
 formula(ctx,'z₂ = (y−b(x))/σ',985,405,color.gold,28);
 para(ctx,'ds² = dx² + (dy − b′(x)dx)²/σ²',985,480,490,color.body,27);
 big(ctx,'Riemann curvature = 0',985,615,mint,29);
 footer(ctx,'A curved centerline can live in a flat metric.','This example has a global whitening map. General local covariance fields need not have one.');
});

chapter('What metric curvature means','Can the local rulers fit into one flat chart?',[
 [0,'Intrinsic curvature is a compatibility condition across locations. It asks whether the local rulers can all be assembled into one Euclidean coordinate system that preserves lengths. A metric can look round at every point and still fail this test.'],
 [15,'Consider this exact metric: d u squared plus exponential of two u times d v squared. A metric-unit step in the v direction shrinks in coordinate length as u increases. Its covariance field is the inverse diagonal matrix.'],
 [30,'For a metric of the form d u squared plus f of u squared d v squared, Gaussian curvature is minus f double prime divided by f. Here f is exponential of u, so curvature is minus one everywhere. No same-dimensional coordinate change can flatten this metric.']
],(ctx,t)=>{
 panel(ctx,80,195,850,510,'Coordinate chart · unit tangent ellipses');
 for(let u=-1.4;u<=1.41;u+=.4)for(let v=-.8;v<=.81;v+=.4){
  const cx=505+210*u,cy=465-150*v;
  ellipse(ctx,cx,cy,24,24*(150/210)*Math.exp(-u),color.soft,0,true);
 }
 const u=lerp(-1.2,1.2,seg(t,4,27));dot(ctx,505+210*u,450,6,color.gold);
 label(ctx,'u',840,675,color.muted,23);label(ctx,'v',110,280,color.muted,23);
 formula(ctx,'G = diag(1, e²ᵘ)',985,270,color.gold,29);
 formula(ctx,'Σ = diag(1, e⁻²ᵘ)',985,325,color.soft,27);
 formula(ctx,'KGauss = −f″/f',985,440,color.ink,27);
 formula(ctx,'f(u) = eᵘ  ⇒  K = −1',985,500,purple,25);
 para(ctx,'This toy has global coordinates on a plane, but no Euclidean chart preserving its metric.',985,595,480,color.muted,22);
 footer(ctx,'Curvature is the obstruction to compatible Euclidean rulers.','The full Riemann tensor must vanish for local flatness; in two dimensions Gaussian curvature determines it.');
});

chapter('Curvature you can see','Carry an arrow around a loop',[
 [0,'Parallel transport carries an arrow without locally turning it according to the metric. The metric determines this rule through its Levi-Civita connection, built from its first derivatives. Follow the rectangle, starting with the arrow pointing right.'],
 [15,'The inset shows the arrow in a local orthonormal frame, where every ruler is already whitened. The arrow still rotates as we move. Making each local metric matrix the identity has not removed the connection between neighboring frames.'],
 [30,'At the starting point the transported arrow returns rotated by about forty-three degrees. The signed rotation equals minus the metric area enclosed for this negative-curvature example. This is intrinsic holonomy: the memory of traveling around a loop.']
],(ctx,t)=>{
 const p=seg(t,3,32),s=loopState(p),a=-.55,b=.55,h=.65;
 const map=(u,v)=>[470+370*u,570-360*v];
 panel(ctx,80,195,820,510,'Exact parallel transport in G = diag(1, e²ᵘ)');
 for(let u=-.8;u<=.81;u+=.2)for(let v=-.15;v<=.86;v+=.2){const c=map(u,v);ellipse(ctx,...c,15,15*(360/370)*Math.exp(-u),color.line);}
 path(ctx,[map(a,0),map(b,0),map(b,h),map(a,h),map(a,0)],color.gold,3);
 const pos=map(s.u,s.v);dot(ctx,...pos,7,color.gold);
 arrow(ctx,...pos,pos[0]+68*Math.cos(s.theta),pos[1]-68*(360/370)*Math.exp(-s.u)*Math.sin(s.theta),{color:purple,width:5});
 const start=map(a,0);arrow(ctx,...start,start[0]+68,start[1],{color:color.dim,width:3,dash:[5,5]});
 formula(ctx,'dθ = −eᵘ dv',130,674,purple,25);
 panel(ctx,950,195,570,510,'The moving orthonormal frame',purple);
 ellipse(ctx,1230,440,108,108,color.line);arrow(ctx,1230,440,1338,440,{color:color.dim,width:3});
 arrow(ctx,1230,440,1230+108*Math.cos(s.theta),440-108*Math.sin(s.theta),{color:purple,width:5});
 formula(ctx,`rotation ${(s.theta*180/Math.PI).toFixed(1)}°`,1050,625,purple,30);
 const area=hyperbolicArea(a,b,h);
 footer(ctx,'Round local rulers can still accumulate a nonzero loop rotation.',`Exact result: Δθ = −0.65(e^0.55 − e^−0.55) = −${area.toFixed(3)} rad = −${(area*180/Math.PI).toFixed(1)}°. This is Levi-Civita curvature.`);
});

chapter('What the correction removes','Equalize fluctuations; keep the geometry honest',[
 [0,'There are three different operations. Choosing the inverse-covariance metric standardizes local fluctuation lengths. Changing coordinates only rewrites that same geometry. Replacing the metric with a different one changes the geometry itself.'],
 [15,'Local whitening removes anisotropy at one point. In normal coordinates, first derivatives of the metric vanish there too. Curvature remains in second-order terms. It changes how nearby geodesics separate and how diffusion spreads over finite distances.'],
 [30,'The curves show separation of nearby geodesics per unit initial angle: sine of distance for positive unit curvature, distance for flat space, and hyperbolic sine for negative unit curvature. Stiffness correction can succeed while these curvature effects remain.']
],(ctx,t)=>{
 panel(ctx,80,195,850,510,'Geodesic separation · exact constant-curvature models');
 const ox=170,oy=630,sx=330,sy=110;line(ctx,ox,oy,860,oy);line(ctx,ox,oy,ox,270);
 const rmax=1.8*seg(t,1,18);
 [[Math.sin,color.stiff,'positive curvature'],[x=>x,color.gold,'flat'],[Math.sinh,purple,'negative curvature']].forEach(([fn,tint,name],i)=>{
  path(ctx,seq(100,f=>[ox+sx*f*rmax,oy-sy*fn(f*rmax)]),tint,3);
  label(ctx,name,205+225*i,260,tint,20);
 });label(ctx,'geodesic distance r',570,678,color.muted,21);label(ctx,'separation / initial angle',145,306,color.muted,19);
 big(ctx,'Local standardization',985,270,color.gold,31);para(ctx,'G¹ᐟ² Σ G¹ᐟ² = I',985,315,500,color.body,27);
 big(ctx,'Global flattening',985,420,purple,31);para(ctx,'Requires vanishing Riemann curvature locally, plus global compatibility and topology.',985,465,480,color.body,25);
 footer(ctx,'Removing stiffness is not a promise to remove curvature.','A learned invertible Euclidean warp must distort a genuinely curved target metric somewhere.');
});

chapter('Covariance itself as the metric','Now reverse the ruler: G = Σ',[
 [0,'What if we use covariance itself as the metric? Work in fixed, dimensionless Euclidean coordinates. Then a metric display multiplies the points by the square root of Sigma, instead of its inverse square root.'],
 [15,'The broad direction is weighted more, and the narrow direction less. The standard-deviation ratio changes from five to twenty-five. The transformed covariance is Sigma squared. So yes: locally, the cloud looks much thinner around its dominant direction.'],
 [30,'But the inverse metric controls gradient motion and metric Brownian noise. With G equal to Sigma, those operations amplify the narrow, stiff direction. For the harmonic energy, the rate ratio becomes twenty-five squared. This is the opposite of stiffness preconditioning.']
],(ctx,t,live)=>{
 const r=live.input.ratio;
 [0,-1,1].forEach((p,i)=>{
  const cx=320+480*i,tint=[color.soft,color.gold,purple][i],widths=metricWidths(r,p);
  panel(ctx,cx-215,195,430,510,['Euclidean','Inverse covariance','Covariance itself'][i],tint);
  axes(ctx,cx,440,180,170);cloud(ctx,samples,([u,v])=>[cx+63*u,440-63*widths[1]*v],tint,2.6,.55,[cx-195,320,390,250]);
  ellipse(ctx,cx,440,126,126*widths[1],tint);
  formula(ctx,['G = I','G = Σ⁻¹','G = Σ'][i],cx-95,290,tint,28);
  big(ctx,`${[r,1,r*r][i].toFixed(1)} : 1`,cx,610,tint,37,'center');
  label(ctx,'displayed standard-deviation ratio',cx,655,color.muted,19,'center');
 });
 footer(ctx,'Covariance sharpens the silhouette; inverse covariance balances fluctuations.',`At the current ratio: κ(K) = ${(r*r).toFixed(0)}. With G = Σ, κ(G⁻¹K) = ${(r**4).toFixed(0)}.`);
},{controls:{ratio:slider('Original width ratio',{min:1,max:10,step:.1,value:[[0,5],[32,5],[41,8]],lens:true,digits:1})},beats:[[0,'Compare the three metrics'],[32,'Increase the anisotropy']]});

chapter('Does the manifold become visible?','A thinner ribbon is not automatically a better manifold',[
 [0,'Suppose local covariance has large eigenvalues along a candidate manifold, and small eigenvalues across it. Using covariance as a length metric suppresses transverse distances. In local metric units, the ribbon becomes thinner and its centerline more prominent.'],
 [15,'This picture is a collection of local tangent views placed along the original centerline. It is not a claimed global isometric embedding. A changing field of square roots cannot generally be integrated into a coordinate map.'],
 [30,'There is a tradeoff. Small transverse distances can make separate nearby branches look artificially close. Covariance weighting may reveal a visual skeleton, but it does not recover topology or project samples onto a manifold. The eigenspaces and the spectral gap provide more direct evidence.']
],(ctx,t)=>{
 const a=seg(t,8,22);
 [0,1].forEach((p,i)=>{
  const x=80+i*740,cx=x+350,tint=p?purple:color.soft;
  panel(ctx,x,195,700,510,p?'Local covariance-weighted ribbon':'Original local tangent ribbon',tint);
  const map=(u,v)=>[cx+133*u,455-93*v];
  const pts=ribbonSamples.map(([u,v])=>{
   const slope=.96*u,len=Math.hypot(1,slope),n=[-slope/len,1/len];
   const width=p?lerp(1,.16,a):1;
   return map(u+n[0]*v*width,bend(u)+n[1]*v*width);
  });cloud(ctx,pts,p=>p,tint,2.5,.6);
  path(ctx,seq(100,f=>map((f-.5)*4.4,bend((f-.5)*4.4))),color.gold,2);
  label(ctx,p?'normal offsets × 0.16 · tangent scale held fixed':'normal standard deviation = 0.16',cx,660,tint,20,'center');
 });
 footer(ctx,'Yes, local metric views can make a candidate manifold stand out.','The original point set is unchanged. This illustration assumes the local tangent / normal directions are already known.');
});

chapter('Avoiding the wrong conclusion','Geometry needs a scale, a reference, and a process',[
 [0,'There are practical limits. A neighborhood that is too small is dominated by measurement noise; one that is too large mixes bending and multiple branches. A finite sample covariance may be singular. Regularization and symmetry reduction are part of the definition.'],
 [15,'Covariance naturally maps covectors to vectors. Its inverse is a metric. To use covariance itself as a metric invariantly, supply a background Euclidean metric on both sides. Otherwise the prescription silently depends on your coordinate units.'],
 [30,'Finally, position-dependent noise needs a compatible drift. Brownian motion for a metric is defined by the Laplace–Beltrami operator, and densities depend on the volume measure. You cannot simply insert a varying square root into a flat sampler and assume the same distribution.']
],(ctx,t)=>{
 panel(ctx,80,195,675,510,'Inference from a cloud',color.soft);
 const x=410,ys=[340,490];
 ys.forEach((y,j)=>{path(ctx,seq(100,f=>[160+510*f,y+12*Math.sin(f*5)]),j?purple:color.soft,5);});
 for(let i=0;i<9;i++){ellipse(ctx,180+i*59,345+12*Math.sin(i*.6),22,60,color.line);}
 arrow(ctx,x,360,x,470,{color:color.stiff,width:4});
 label(ctx,'cheap transverse shortcut?',x+35,425,color.stiff,21);
 para(ctx,'Small normal eigenvalues can collapse distances between different branches.',115,590,590,color.body,23);
 panel(ctx,805,195,715,510,'A consistent geometric construction',color.gold);
 formula(ctx,'Gcov = E Σ E',840,285,purple,28);
 label(ctx,'E = declared background metric',840,325,color.muted,22);
 formula(ctx,'ΔG f = |G|⁻½ ∂ᵢ(|G|½ Gⁱʲ ∂ⱼf)',840,420,color.gold,23);
 para(ctx,'For generator ½ΔG, the Itô drift contains derivatives of G. The diffusion covariance alone is not the full process.',840,468,630,color.body,23);
 formula(ctx,'ρG = ρdx / √det G',840,620,color.ink,25);
 footer(ctx,'Choose the geometry for the task, then preserve its mathematical contract.','On molecular shape space: work in genuine internal directions; do not invert rigid-body zero modes.');
});

chapter('The three takeaways','Three questions. Three different answers.',[
 [0,'To remove local stiffness, measure displacements in thermal units with inverse covariance. Pair that choice with the intended noise, score representation, and error norm. The harmonic model gives an exact demonstration.'],
 [15,'To understand curvature, test whether neighboring rulers are compatible. Loop transport and geodesic separation reveal what pointwise whitening cannot erase. A curved metric cannot become Euclidean through a mere change of coordinates.'],
 [30,'To emphasize a candidate manifold visually, covariance weighting can suppress normal thickness. That can help the eye, but it worsens stiffness conditioning and can destroy useful transverse distances. Visibility, numerical conditioning, and intrinsic flatness are different goals.']
],(ctx,t)=>{
 const rows=[
  [color.gold,'Balance thermal fluctuations','G = Σ⁻¹','A local cloud becomes round. Harmonic rates balance.'],
  [purple,'Diagnose intrinsic curvature','R[G]','Rulers may be round locally and incompatible globally.'],
  [color.soft,'Emphasize a local skeleton','G = EΣE','The ribbon gets thinner; topology is not guaranteed.']
 ];
 rows.forEach(([tint,title,eq,desc],i)=>{
  const y=210+i*157;ctx.save();ctx.globalAlpha=seg(t,i*3,i*3+1);
  panel(ctx,80,y,1440,132,title,tint);formula(ctx,eq,1170,y+49,tint,29);para(ctx,desc,105,y+91,1230,color.body,25);ctx.restore();
 });
 footer(ctx,'A good metric changes what “equal” means.','It need not erase the manifold, straighten every chart, or preserve physical dynamics.');
});

// Start with the statistical object, then construct the geometric interpretation.
// In particular, do not open with metric comparisons before defining covariance.
const ordered = [
  varianceScene, foundationScenes[0], countScene, objectsScene,
  ...foundationScenes.slice(1, 3), columnScene,
  foundationScenes[3], eigenScene, foundationScenes[4],
  ...distributionScenes,
  ...scenes.slice(2, 6),
  foundationScenes[5], ...localScenes.slice(0, 2),
  fieldScene, scenes[6], localScenes[2], scenes[7], curvatureScenes[0], scenes[8],
  curvatureScenes[1], scenes[9], curvatureScenes[2], ...embeddingScenes,
  ...scenes.slice(10),
].map((s, i) => Object.freeze({ ...s, header: { ...s.header, eyebrow: `COVARIANCE / ${String(i + 1).padStart(2, '0')} / FROM FLUCTUATIONS TO GEOMETRY` } }));

export default { ...meta, scenes: ordered, posterTime: 8 };
