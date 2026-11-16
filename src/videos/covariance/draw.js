import { text, wrap, color, font, line, arrow, dot, roundRect } from '../../kit.js';
export { text, wrap, color, font, line, arrow, dot };
export const purple = '#bd9af7';
export const mint = '#8ed8b0';
export function label(ctx, s, x, y, tint = color.muted, size = 19, align = 'left') { text(ctx, s, x, y, { size, color: tint, font: font.sans, align }); }
export function big(ctx, s, x, y, tint = color.ink, size = 32, align = 'left') { text(ctx, s, x, y, { size, color: tint, font: font.display, align }); }
export function formula(ctx, s, x, y, tint = color.gold, size = 28) { text(ctx, s, x, y, { size, color: tint, font: font.mono }); }
export function para(ctx, s, x, y, w, tint = color.body, size = 24) { return wrap(ctx, s, x, y, w, size * 1.42, { size, color: tint, font: font.sans }); }
export function panel(ctx, x, y, w, h, title, tint = color.soft) {
  ctx.save();ctx.fillStyle = '#111c2b';ctx.strokeStyle = '#2c3a56';ctx.lineWidth=1;
  roundRect(ctx,x,y,w,h,16);ctx.fill();ctx.stroke();ctx.restore();
  label(ctx,title,x+24,y+36,tint,21);
}
export function path(ctx, pts, tint = color.soft, width = 2, alpha = 1, dash = []) {
  ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle=tint;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();
  pts.forEach(([x,y],i)=> i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));ctx.stroke();ctx.restore();
}
export function ellipse(ctx, cx, cy, rx, ry, tint = color.gold, angle = 0, fill = false) {
  ctx.save();ctx.strokeStyle=tint;ctx.lineWidth=2;ctx.fillStyle=tint+'12';ctx.beginPath();ctx.ellipse(cx,cy,Math.max(.1,rx),Math.max(.1,ry),angle,0,2*Math.PI);if(fill)ctx.fill();ctx.stroke();ctx.restore();
}
export function axes(ctx,cx,cy,w=230,h=160) { line(ctx,cx-w,cy,cx+w,cy,{color:color.line});line(ctx,cx,cy-h,cx,cy+h,{color:color.line}); }
export function cloud(ctx, points, map, tint = color.soft, radius = 2.6, alpha = .55, bounds = [80,270,1440,380]) {
  // Clip marks, not the underlying samples: Gaussian outliers must not cover labels.
  ctx.save();ctx.beginPath();ctx.rect(...bounds);ctx.clip();
  for (const p of points) { const [x,y]=map(p);dot(ctx,x,y,radius,tint,alpha); }
  ctx.restore();
}
export function footer(ctx, headline, detail = '', tint = color.gold) {
  line(ctx,80,732,1520,732,{color:color.line});
  big(ctx,headline,80,775,tint,29);
  if(detail) para(ctx,detail,80,812,1430,color.body,22);
}
export function badge(ctx,s,x,y,tint=color.gold) { label(ctx,s,x,y,tint,19,'center'); }
export const seq = (n, f) => Array.from({length:n},(_,i)=>f(i/(n-1),i));
export function progress(ctx,t,duration) { line(ctx,80,880,1520,880,{color:color.line});line(ctx,80,880,80+1440*Math.min(1,t/duration),880,{color:color.gold,width:2}); }
