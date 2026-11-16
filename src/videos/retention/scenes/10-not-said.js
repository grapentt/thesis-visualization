import { defineScene, seg, fade, lin, lerpLog, text, wrap, type, font, color, rgba, tex, line, dashedLine, dot } from '../../../kit.js';
import { header, frame, axes, drawPath, drawCurve, panel, pill, readout, track, caption, INFO, KL, MODEL, DATA } from '../shared.js';
import { circleKernel, circleFisher } from '../math.js';

const CLAIMS = [
  { claim: 'F_τ ⪰ Jᵀ C⁻¹ J', verdict: 'exact', colour: MODEL, note: 'an orthogonal projection; the residual characterises equality' },
  { claim: 'its gap is O(τ³) in general', verdict: 'unproven here', colour: color.gold, note: 'first-order expansions do not give the remainder' },
  { claim: 'reversible dynamics = Gaussian denoising with prior √π', verdict: 'short-time only', colour: color.gold, note: 'not exact even for an Ornstein–Uhlenbeck process' },
  { claim: 'g_τ = τ F_τ follows a modified Ricci flow', verdict: 'false', colour: KL, note: 'the circle: flat, uniform, and still contracting' },
  { claim: 'long-lag Fisher geometry emphasises slow modes', verdict: 'leading order', colour: color.gold, note: 'under reversibility and a discrete spectrum; no Gaussian reverse steps' },
  { claim: 'a Stein kernel is “the optimal metric”', verdict: 'needs its objective', colour: color.gold, note: 'optimal for a stated objective and normalisation, not for learning' },
];
const KERNEL = tex(String.raw`k_\tau(\theta) = \frac{1}{2\pi}\Big(1 + 2\sum_{n\ge1} e^{-n^2\tau/2}\cos n\theta\Big)`, 'k_τ(θ) = (1/2π)(1 + 2 Σ e^(−n²τ/2) cos nθ)');
const ASYMPTOTIC = tex(String.raw`F_\tau \sim 2e^{-\tau},\qquad \tau F_\tau \to 0`, 'F_τ ~ 2 e^(−τ),   τ F_τ → 0');

const TAUS = Array.from({ length: 81 }, (_, i) => 0.02 + (8 * i) / 80);
const G = TAUS.map((tau) => tau * circleFisher(tau));
const RING = { cx: 1230, cy: 400, r: 95 };
const GPLOT = frame({ x: 960, y: 590, w: 540, h: 190, u: [0, 8], v: [0, 1.1] });

export default defineScene({
  name: 'What this does not say',
  duration: 85,
  narration: [
    [0, 'Several bolder claims should stay separate from the method. The projection inequality, F at least J transpose C inverse J, is exact. That its gap is of third order in tau is unproven here. Reversible dynamics is only approximately Gaussian denoising, even for an Ornstein–Uhlenbeck process.'],
    [26, 'The claim that tau times F tau follows a modified Ricci flow fails. Brownian motion on a circle has a flat, uniform stationary state, so the proposed flow would keep the metric fixed. Yet F tau decays like 2 e to the minus tau, and tau F tau goes to zero.'],
    [52, 'Long-lag Fisher geometry does emphasise slow modes, under reversibility and a discrete spectrum, but it does not make reverse steps Gaussian. And a Stein kernel is optimal only for its stated objective and normalisation; a Langevin process that preserves the data cannot be a forward process to a Gaussian prior.'],
  ],
  header: header(10, 'BOUNDARIES', 'What this does not say'),

  draw(ctx, t) {
    const reveal = [3, 9, 16, 27, 53, 64];
    CLAIMS.forEach((c, i) => {
      const y = 232 + 104 * i;
      const a = seg(t, reveal[i], reveal[i] + 1.2);
      const hot = i === 3 ? fade(t, 27, 28, 51, 52) : 0;
      panel(ctx, 80, y, 800, 90, { alpha: a, stroke: rgba(c.colour, 0.35 + 0.65 * hot) });
      text(ctx, c.claim, 104, y + 36, { ...type.body, size: 20, color: color.ink, alpha: a });
      pill(ctx, c.verdict.toUpperCase(), 104, y + 66, c.colour, a);
      text(ctx, c.note, 860, y + 70, { font: font.mono, size: 13, color: color.muted, align: 'right', alpha: a * seg(t, reveal[i] + 1.5, reveal[i] + 2.5) });
    });

    // Brownian motion on the circle: the kernel spreads out, τ F_τ falls to zero
    const show = seg(t, 27, 28.5);
    const tau = track(t, [[30, 0.05], [50, 8]], (x) => x);
    const logTau = lerpLog(0.05, 8, lin(t, 30, 50));
    const current = t < 30 ? 0.05 : t > 50 ? 8 : logTau;
    ctx.save();
    ctx.globalAlpha = show;
    ctx.strokeStyle = color.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(RING.cx, RING.cy, RING.r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = INFO;
    ctx.fillStyle = rgba(INFO, 0.22);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const theta = -Math.PI + (2 * Math.PI * i) / 240;
      const height = 22 * Math.min(2 * Math.PI * circleKernel(theta, current), 5);
      const rr = RING.r + height;
      const x = RING.cx + rr * Math.sin(theta);
      const y = RING.cy - rr * Math.cos(theta);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    dot(ctx, RING.cx, RING.cy - RING.r, 5, color.gold, show);
    text(ctx, 'θ₀', RING.cx + 12, RING.cy - RING.r - 6, { ...type.math, size: 20, color: color.gold, alpha: show });
    text(ctx, `k_τ(θ) on the circle, τ = ${current.toFixed(2)}`, RING.cx, RING.cy + RING.r + 60, { font: font.mono, size: 14, color: INFO, align: 'center', alpha: show });
    KERNEL.draw(ctx, 960, 212, { size: 17, alpha: show });

    axes(ctx, GPLOT, { xTicks: [0, 2, 4, 6, 8], yTicks: [0, 0.5, 1], xLabel: 'τ', yLabel: 'τ F_τ', alpha: show });
    dashedLine(ctx, GPLOT.x, GPLOT.Y(1), GPLOT.x + GPLOT.w, GPLOT.Y(1), { color: color.gold, alpha: show });
    text(ctx, 'the proposed flow: Ricci = 0, uniform density, so g_τ would stay constant', GPLOT.x + 10, GPLOT.Y(1) - 10, { font: font.mono, size: 12, color: color.gold, alpha: show });
    drawPath(ctx, GPLOT, TAUS.map((s, i) => [s, G[i]]), { colour: INFO, alpha: show, width: 3, progress: Math.max(0.01, (current - 0.02) / 8) });
    const gNow = current * circleFisher(current);
    dot(ctx, GPLOT.X(current), GPLOT.Y(gNow), 6, INFO, show);
    readout(ctx, 'τ F_τ =', gNow.toFixed(3), GPLOT.x + GPLOT.w - 12, GPLOT.y + GPLOT.h - 16, { colour: INFO, size: 15, alpha: show, align: 'right' });
    ASYMPTOTIC.draw(ctx, 960, 820, { size: 21, alpha: seg(t, 44, 45.2) });
    text(ctx, 'a time change cannot turn a stationary flow into a contracting family', 1500, 862, { font: font.mono, size: 13, color: color.muted, align: 'right', alpha: seg(t, 47, 48.5) });
  },
});
