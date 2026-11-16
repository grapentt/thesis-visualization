import { defineScene, seg } from '../../kit.js';
import { color, line, arrow, dot, label, big, formula, para, panel, path, footer, progress, purple, mint } from './draw.js';

function scene(name, title, narration, draw, duration = 45) {
  return defineScene({name, duration, narration, header: {eyebrow:'COVARIANCE / FIRST PRINCIPLES', title},
    draw(ctx,t) {draw(ctx,t); progress(ctx,t,duration);}});
}
const raw = [[1,1],[2,1],[4,3],[5,3],[2,2],[4,2],[3,1],[3,3],[1,2],[5,2],[2,0],[4,4]];
function empirical(points) {
  const mean=[0,1].map(j=>points.reduce((s,p)=>s+p[j],0)/points.length);
  const C=[0,1].map(i=>[0,1].map(j=>points.reduce((s,p)=>s+(p[i]-mean[i])*(p[j]-mean[j]),0)/points.length));
  return {mean,C};
}
function brackets(ctx,x,y,w,h) {
  path(ctx,[[x+10,y],[x,y],[x,y+h],[x+10,y+h]],color.muted,2);
  path(ctx,[[x+w-10,y],[x+w,y],[x+w,y+h],[x+w-10,y+h]],color.muted,2);
}

export const varianceScene=scene('Start with variance','Variance: one number that measures squared spread',[
 [0,'Before covariance, start with one measured variable. Here are four observations: one, two, four, and five. Their mean is three. The mean locates the center; it does not tell us how widely the observations are spread.'],
 [15,'Subtract the mean. The deviations are minus two, minus one, one, and two. Their signed average is zero, even though the observations differ. Squaring makes both sides contribute positively and gives greater weight to larger deviations.'],
 [30,'The squared deviations are four, one, one, and four. Their average is two point five: the variance of the empirical distribution that assigns probability one quarter to each observation. The squares here literally show those squared distances.'],
 [45,'Standard deviation is the square root of variance, about one point five eight. It has the original measurement units; variance has squared units. For a population, replace the sample average by expectation. Covariance extends this idea to several jointly measured variables.']
],(ctx,t)=>{
 panel(ctx,80,195,865,510,'One variable · four equally weighted observations');
 const xs=[1,2,4,5],cx=510,unit=110,y=350;
 line(ctx,180,y,840,y,{color:color.line,width:2});
 for(let x=0;x<=6;x++){const px=cx+(x-3)*unit;line(ctx,px,y-6,px,y+6,{color:color.muted});label(ctx,String(x),px,y+35,color.muted,21,'center');}
 line(ctx,cx,280,cx,640,{color:color.gold,dash:[5,6],alpha:.65});label(ctx,'mean = 3',cx,270,color.gold,24,'center');
 const tint=[color.soft,purple,mint,color.stiff];
 xs.forEach((x,i)=>{
   const px=cx+(x-3)*unit;dot(ctx,px,y,8,tint[i]);
   if(t>=12){const yy=415+i*30;arrow(ctx,cx,yy,px,yy,{color:tint[i],width:2});label(ctx,`${x-3>0?'+':''}${x-3}`,px+(x<3?-20:20),yy+7,tint[i],21,x<3?'right':'left');}
   if(t>=27){const side=Math.abs(x-3)*35,xx=215+i*180,yy=650;
     ctx.save();ctx.globalAlpha=seg(t,27,32);ctx.fillStyle=tint[i]+'55';ctx.strokeStyle=tint[i];ctx.fillRect(xx,yy-side,side,side);ctx.strokeRect(xx,yy-side,side,side);label(ctx,String((x-3)**2),xx+side/2,yy-side/2+8,tint[i],24,'center');ctx.restore();}
 });
 label(ctx,'distance → square area',110,682,color.muted,20);
 formula(ctx,'μ = E[X]',995,275,color.gold,30);
 formula(ctx,'Var(X) = E[(X−μ)²]',995,345,color.soft,25);
 para(ctx,'Mean: where is the center?\nVariance: how much squared spread?',995,400,475,color.body,25);
 if(t>=27){formula(ctx,'(4 + 1 + 1 + 4) / 4',995,520,color.soft,25);formula(ctx,'variance = 2.5',995,567,color.soft,28);}
 if(t>=42)formula(ctx,'standard deviation ≈ 1.58',995,645,color.gold,23);
 footer(ctx,'Variance is a squared scale; standard deviation is a length scale.','For an empirical law, each sample has weight 1/n. For independent identically distributed samples, 1/(n−1) gives the unbiased estimate.');
},60);

export const countScene=scene('Sample count is not dimension','n counts observations. d counts coordinates per observation.',[
 [0,'Keep two counts separate. Lowercase n is the number of observations. Lowercase d is the number of coordinates measured together in each observation. Here each row contains one two-dimensional observation, so d is two.'],
 [15,'We add more observations: four become eight. The table gets taller, but each observation still has two coordinates. The covariance matrix stays two by two because it compares coordinates, not individual samples. Its estimated entries can change.'],
 [30,'With twelve observations the table has twelve rows and two columns. After centering each column, transpose times the centered table gives a two-by-two matrix. More independent samples help estimate the same population object; they do not create more principal directions.']
],(ctx,t)=>{
 const n=t<15?4:t<30?8:12,points=raw.slice(0,n),{C}=empirical(points);
 panel(ctx,80,195,650,510,'Data table A · one observed vector in each row');
 label(ctx,'sample a',170,280,color.muted,22,'center');label(ctx,'coordinate 1',385,280,color.soft,22,'center');label(ctx,'coordinate 2',565,280,color.soft,22,'center');
 for(let i=0;i<n;i++){
   const y=318+i*28,highlight=i===n-1;
   if(highlight){ctx.fillStyle='#f2cf6315';ctx.fillRect(112,y-22,580,27);}
   label(ctx,String(i+1),170,y,highlight?color.gold:color.muted,21,'center');
   points[i].forEach((v,j)=>label(ctx,String(v),385+180*j,y,highlight?color.gold:color.body,23,'center'));
 }
 label(ctx,`A has ${n} rows × 2 columns`,405,686,color.gold,24,'center');
 panel(ctx,780,195,740,510,'Covariance compares the d coordinates with each other',color.gold);
 formula(ctx,`n = ${n} samples     d = 2`,825,288,color.gold,29);
 formula(ctx,'Σ̂ = A_centeredᵀ A_centered / n',825,350,color.body,24);
 brackets(ctx,1000,400,310,140);
 C.forEach((r,i)=>r.forEach((v,j)=>big(ctx,v.toFixed(2),1080+j*150,447+i*65,i===j?color.soft:purple,35,'center')));
 formula(ctx,'(2 × n)(n × 2) → 2 × 2',865,592,color.gold,27);
 label(ctx,'The number of entries is d², not n².',825,660,color.body,25);
 footer(ctx,'More samples change the estimate. More coordinates change its dimension.','For centered data, rank(Σ̂) ≤ min(d, n−1). Even many samples need not supply variation in every direction.');
});

export const objectsScene=scene('Vectors, matrices, and eigenvalues','Different objects have different jobs — and different sizes',[
 [0,'Now distinguish the objects themselves. Suppose each observation contains three coordinates. An observation vector has three numbers. A covariance matrix has three rows and three columns, regardless of how many observations we collected.'],
 [15,'An eigenvector is also a vector with three components, but its job is different. It specifies a direction of collective change, not an additional observation. Multiplying it by covariance scales it by one number: its eigenvalue.'],
 [30,'For three coordinates there are three eigenvalues, counted with multiplicity, and an orthonormal basis of three eigenvectors. Eigenvalues are variances along unit eigenvectors. They are neither sample counts nor lengths; their square roots give standard deviations.']
],(ctx,t)=>{
 const positions=[80,570,1060];
 panel(ctx,positions[0],195,460,510,'Observation x⁽ᵃ⁾ · a vector',color.soft);
 panel(ctx,positions[1],195,460,510,'Covariance Σ · a matrix',color.gold);
 panel(ctx,positions[2],195,460,510,'Principal direction v₁ · a vector',purple);
 brackets(ctx,240,300,120,168);[1,-2,.5].forEach((v,i)=>big(ctx,String(v),300,340+51*i,color.soft,35,'center'));
 label(ctx,'3 × 1 components',310,520,color.soft,26,'center');
 para(ctx,'One measured configuration. The superscript a selects one of n observations.',110,575,395,color.body,25);
 brackets(ctx,645,300,310,168);[[2,1,0],[1,2,0],[0,0,.25]].forEach((r,i)=>r.forEach((v,j)=>big(ctx,String(v),700+j*100,340+i*51,i===j?color.gold:color.body,32,'center')));
 label(ctx,'3 × 3 pairwise covariances',800,520,color.gold,25,'center');
 para(ctx,'Σ acts on a direction. Its columns are not generally its eigenvectors.',600,575,395,color.body,25);
 formula(ctx,'v₁ = (1, 1, 0) / √2',1095,330,purple,25);
 formula(ctx,'Σv₁ = 3v₁',1095,407,color.gold,31);
 formula(ctx,'λ₁ = 3',1095,480,mint,31);
 label(ctx,'one scalar · projected variance',1095,520,mint,23);
 para(ctx,'Here λ = (3, 1, 0.25). These are three numbers, not three samples.',1095,575,395,color.body,25);
 footer(ctx,'d coordinates → d eigenvalues and d orthonormal principal directions.','Eigenvalues may repeat or be zero. A zero eigenvalue means zero variance in that direction; a repeated value permits multiple choices of basis.');
});
