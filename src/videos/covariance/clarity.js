import { defineScene, seg } from '../../kit.js';
import { samples, ribbonSamples, warp, localEstimate } from './math.js';
import { color, line, arrow, dot, label, big, formula, para, panel, path, ellipse, cloud, footer, seq, progress, purple, mint } from './draw.js';
function scene(name,title,narration,draw){return defineScene({name,duration:45,narration,header:{eyebrow:'COVARIANCE / READING THE OBJECT',title},draw(ctx,t){draw(ctx,t);progress(ctx,t,45);}});}
export const columnScene=scene('What every column means','Read one column as a pattern of co-fluctuation',[
 [0,'Read column j by holding its coordinate fixed as the reference. Each row then asks how that row’s coordinate co-varies with coordinate j. The diagonal entry is the reference coordinate’s own variance. The other entries describe its co-fluctuation with every other coordinate.'],
 [15,'Watch the highlighted column change. Positive entries mean the two centered deviations have a positive product on average. Negative entries mean the average product is negative. The bars show exactly that column, with one component per row coordinate.'],
 [30,'Multiplying Sigma by the j-th coordinate basis vector selects precisely that column. But a column is not generally a principal direction. Eigenvectors are special directions that the matrix only stretches, without turning them. We will find those next.']
],(ctx,t)=>{
 const C=[[1,.8,-.5],[.8,1,-.1],[-.5,-.1,1]],j=Math.min(2,Math.floor(t/15));
 panel(ctx,80,195,760,510,'Row i and column j identify the pair Cov(Xᵢ, Xⱼ)');
 const ox=335,oy=365,w=135,h=95;
 ctx.save();ctx.fillStyle='#f2cf6318';ctx.fillRect(ox-55+j*w,oy-55,110,290);ctx.restore();
 for(let k=0;k<3;k++){label(ctx,`X${k+1}`,ox+k*w,290,k===j?color.gold:color.muted,29,'center');label(ctx,`X${k+1}`,230,oy+k*h,color.muted,29,'center');}
 C.forEach((r,i)=>r.forEach((v,k)=>big(ctx,v.toFixed(1),ox+k*w,oy+i*h,k===j?color.gold:color.body,36,'center')));
 label(ctx,`Column ${j+1}: compare everything with X${j+1}`,460,658,color.gold,24,'center');
 panel(ctx,890,195,630,510,'The selected column, drawn as signed components',color.gold);
 C.forEach((r,i)=>{const y=350+i*95,v=r[j];label(ctx,`X${i+1}`,935,y+8,color.body,25);line(ctx,1040,y,1440,y,{color:color.line,width:2});line(ctx,1210,y-22,1210,y+22,{color:color.muted,width:1});line(ctx,1210,y,1210+170*v,y,{color:v>=0?color.soft:color.stiff,width:16});label(ctx,`${v>0?'+':''}${v.toFixed(1)}`,1455,y+8,color.gold,22);});
 formula(ctx,`Σe${j+1} = column ${j+1}`,960,657,color.gold,28);
 footer(ctx,'Each column is one coordinate’s covariance with all the coordinates.','Rows carry the same pairwise information because Σ is symmetric. Columns need not be orthogonal or point along the cloud’s principal axes.');
});

export const eigenScene=scene('What an eigenvector actually is','Find a direction that the covariance matrix does not turn',[
 [0,'Think of the covariance matrix as a linear map. Feed it a unit vector v. Usually the output Sigma v points in a different direction. The coordinate axes are not special unless the matrix is already diagonal.'],
 [15,'Turn the input toward the cloud’s long axis. Here the output becomes exactly three times the input, with no change of direction. This is an eigenvector, and three is its eigenvalue: the variance of the data projected onto that unit direction.'],
 [30,'The perpendicular principal direction has eigenvalue one. In the orthonormal eigenvector basis the covariance is diagonal, with zero cross-covariances. A direction in higher dimensions works the same way: its components specify a coordinated change of all the original variables.']
],(ctx,t)=>{
 const a=t<15?Math.PI/4*seg(t,1,12):Math.PI/4+Math.PI/2*seg(t,23,34),v=[Math.cos(a),Math.sin(a)],Cv=[2*v[0]+v[1],v[0]+2*v[1]],variance=v[0]*Cv[0]+v[1]*Cv[1];
 panel(ctx,80,195,780,510,'2D example · Σ = [2, 1; 1, 2]');
 const cx=450,cy=480,map=([u,w])=>[cx+76*u,cy-76*w];
 cloud(ctx,samples,([z1,z2])=>map([(Math.sqrt(3)*z1-z2)/Math.SQRT2,(Math.sqrt(3)*z1+z2)/Math.SQRT2]),color.dim,2.6,.65,[120,285,700,360]);
 line(ctx,cx-195,cy+195,cx+195,cy-195,{color:color.line,dash:[6,6]});line(ctx,cx-130,cy-130,cx+130,cy+130,{color:color.line,dash:[6,6]});
 arrow(ctx,cx,cy,cx+80*Cv[0],cy-80*Cv[1],{color:color.soft,width:6});arrow(ctx,cx,cy,cx+80*v[0],cy-80*v[1],{color:color.gold,width:3});
 label(ctx,'v · input direction',145,275,color.gold,23);label(ctx,'Σv · output',540,275,color.soft,23);
 const aligned=Math.abs(v[0]*Cv[1]-v[1]*Cv[0])<.01;
 label(ctx,aligned?'Aligned: this is an eigenvector.':'The output turns away from the input.',450,665,aligned?color.gold:color.muted,24,'center');
 formula(ctx,'Σv = λv',935,285,color.gold,40);
 para(ctx,'An eigenvector gives a direction. Its eigenvalue gives the variance along that direction.',935,345,550,color.body,28);
 formula(ctx,`vᵀΣv = ${variance.toFixed(2)}`,935,500,color.soft,32);
 formula(ctx,'QᵀΣQ = diag(3, 1)',935,598,color.gold,27);
 footer(ctx,'Eigenvectors describe collective modes, not separate coordinates.','For symmetric covariance matrices, principal directions can be chosen orthonormal. Repeated eigenvalues allow non-unique directions within an eigenspace.');
});

const points=ribbonSamples.map(p=>warp(p));
export const fieldScene=scene('Build the local covariance field','Move the neighborhood. Recompute the matrix.',[
 [0,'A local covariance field is a function: give it a location q, and it returns a covariance matrix Sigma of q. Here we build that function directly from the displayed samples, using a smooth neighborhood around the moving query point.'],
 [15,'Nearby samples get high weights and distant samples get low weights. First compute their weighted local mean. Then average their centered outer products with the same weights. The displayed ellipse and every matrix entry are recalculated from those samples.'],
 [30,'The query point and the local mean need not coincide. As the query moves, a different neighborhood produces a different matrix. Keeping all these matrices as a function of location gives a field. Averaging the whole dataset once would give only one global covariance.']
],(ctx,t)=>{
 const u=-1.55+3.1*seg(t,2,36),q=warp([u,0]),estimate=localEstimate(points,q),map=([u,v])=>[505+165*u,460-100*v];
 panel(ctx,80,195,850,510,'The same fixed data, with smoothly weighted neighborhoods');
 cloud(ctx,points,map,color.dim,2.4,.45,[110,275,790,350]);
 ctx.save();ctx.beginPath();ctx.rect(110,275,790,350);ctx.clip();points.forEach((p,i)=>{if(estimate.weights[i]>.02)dot(ctx,...map(p),3.1,color.gold,estimate.weights[i]);});ctx.restore();
  const p=map(q),m=map(estimate.mean);ellipse(ctx,...p,.38*165,.38*100,color.gold);dot(ctx,...p,6,color.gold);dot(ctx,...m,6,color.stiff);label(ctx,'query q',p[0]-60,p[1]-65,color.gold,21);label(ctx,'local mean μ(q)',m[0]-65,m[1]+65,color.stiff,21);
  const l00=Math.sqrt(estimate.C[0][0]),l10=estimate.C[1][0]/l00,l11=Math.sqrt(estimate.C[1][1]-l10*l10);
  path(ctx,seq(65,f=>{const a=f*2*Math.PI;return map([estimate.mean[0]+2*l00*Math.cos(a),estimate.mean[1]+2*(l10*Math.cos(a)+l11*Math.sin(a))]);}),color.stiff,2.8);
 for(const u0 of [-1.3,0,1.3]){const e=localEstimate(points,warp([u0,0])),l00=Math.sqrt(e.C[0][0]),l10=e.C[1][0]/l00,l11=Math.sqrt(e.C[1][1]-l10*l10);path(ctx,seq(65,f=>{const a=f*2*Math.PI;return map([e.mean[0]+2*l00*Math.cos(a),e.mean[1]+2*(l10*Math.cos(a)+l11*Math.sin(a))]);}),color.soft,1.8,.55);}
  label(ctx,'Gold: neighborhood · orange: covariance · blue: other locations',110,666,color.soft,20);
 formula(ctx,'q ↦ Σ̂(q)',985,283,color.gold,38);
 label(ctx,`q = (${q[0].toFixed(2)}, ${q[1].toFixed(2)})`,985,343,color.muted,25);
 formula(ctx,`[ ${estimate.C[0][0].toFixed(3)}  ${estimate.C[0][1].toFixed(3)} ]`,985,430,color.gold,29);
 formula(ctx,`[ ${estimate.C[1][0].toFixed(3)}  ${estimate.C[1][1].toFixed(3)} ]`,985,485,color.gold,29);
 para(ctx,'One location → one local mean → one matrix → one local ruler.',985,556,490,color.body,27);
 footer(ctx,'Σ̂(q) = Σₐ wₐ(q)[x⁽ᵃ⁾−μ(q)][x⁽ᵃ⁾−μ(q)]ᵀ / Σₐ wₐ(q).','Here wₐ(q) = exp(−‖x⁽ᵃ⁾−q‖²/(2h²)), with h = 0.38. Neighborhood scale, smoothness, and regularization define the field.');
});
