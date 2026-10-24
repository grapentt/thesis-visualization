// Interactive playback: animation loop, transport controls, chapter list,
// narration and keyboard shortcuts, plus the controls of live scenes and
// explore mode. The player owns no drawing logic; it asks the timeline for a
// frame whenever something changed.

import { clamp } from './timing.js';
import { STAGE, narrationAt } from './timeline.js';
import { LiveView, warmUp } from './live.js';
import { formatNumber } from '../draw/text.js';

const formatTime = (s) => {
  s = Math.max(0, s);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
const pad2 = (n) => String(n).padStart(2, '0');
/** A new element with properties and children. */
const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

/** How long a hand-over prompt stays up while the video plays on. */
const HANDOVER_SHOWN = 8;
/** Time per frame for simulating, in ms: normally, and while catching up after a far jump. */
const FRAME_BUDGET = 10;
const CATCH_UP_BUDGET = 14;
/** How long a control stays highlighted after the video moved it, in ms. */
const MOVING_SHOWN = 900;

export class Player {
  /**
   * @param {import('./timeline.js').Timeline} timeline
   * @param {object} ui  DOM elements; every control except `canvas` is optional.
   * @param {{ posterTime?: number }} [options]  Frame shown before the first play.
   */
  constructor(timeline, ui, { posterTime = 0 } = {}) {
    this.timeline = timeline;
    this.ui = ui;
    /** What this player shows of live scenes: its own cursors, lens settings and explore mode. */
    this.view = new LiveView({ budgetMs: FRAME_BUDGET });
    this.canvas = ui.canvas;
    this.ctx = ui.canvas.getContext('2d');
    this.time = posterTime;
    this.playing = false;
    this.waiting = false; // a live scene is still computing the current moment
    this.speed = 1;
    this.fixedSize = null;
    this.dirty = true;
    this.shownScene = -1;
    this.shownNarration = '';
    this.live = null;
    this.drag = null;
    this.stopWarmUp = null;
    this.endListeners = new Set();

    this.#bindControls();
    this.#bindCanvas();
    this.#buildChapters();
    new ResizeObserver(() => this.#resize()).observe(this.canvas);
    // in fullscreen the canvas leaves room for the control strip, however tall it is
    if (ui.strip && ui.screen) new ResizeObserver(() => ui.screen.style.setProperty('--strip', `${ui.strip.offsetHeight}px`)).observe(ui.strip);
    this.#resize();
    requestAnimationFrame((now) => this.#loop(now, now));
  }

  // ---- public API --------------------------------------------------------

  play() {
    this.#leaveExplore();
    if (this.time >= this.timeline.duration - 0.01) this.time = 0;
    this.playing = true;
    this.#hidePoster();
    this.#startWarmUp();
    this.#syncPlayButton();
  }

  pause() {
    this.playing = false;
    this.#syncPlayButton();
    this.endListeners.forEach((fn) => fn());
  }

  toggle() {
    this.playing ? this.pause() : this.play();
  }

  seek(T) {
    this.#leaveExplore();
    this.time = clamp(T, 0, this.timeline.duration - 0.001);
    this.#hidePoster();
    this.#startWarmUp();
    this.invalidate();
  }

  seekScene(index) {
    const scene = this.timeline.scenes[clamp(index, 0, this.timeline.scenes.length - 1)];
    this.seek(scene.start + 0.001);
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  /** Request a redraw on the next animation frame. */
  invalidate() {
    this.dirty = true;
  }

  /** Render at a fixed pixel size (for recording) instead of following the layout. */
  lockResolution(width, height) {
    this.fixedSize = { width, height };
    this.#resize();
  }

  unlockResolution() {
    this.fixedSize = null;
    this.#resize();
  }

  /** Resolves the next time playback stops (end reached or paused). */
  untilStopped() {
    return new Promise((resolve) => {
      const done = () => {
        this.endListeners.delete(done);
        resolve();
      };
      this.endListeners.add(done);
    });
  }

  /** Pause the narration and let the viewer run the current live scene with their own settings. */
  explore() {
    const scene = this.#scene();
    if (!scene.live || this.view.explore) return;
    this.pause();
    const t0 = Math.max(this.time - scene.start, scene.exploreFrom);
    this.time = scene.start + t0;
    this.view.startExplore(scene, t0);
    this.#syncExplore();
    this.invalidate();
  }

  /** Leave explore mode and play the narrated version on from the moment where exploring began. */
  resumeVideo() {
    this.play();
  }

  /** Forget everything computed or set for live scenes (used by window.video.reset). */
  resetLive() {
    this.#leaveExplore();
    this.stopWarmUp?.();
    this.stopWarmUp = null;
    this.view.clear();
    this.invalidate();
  }

  // ---- internals ---------------------------------------------------------

  /** Back to the narrated version at the moment where exploring began (without playing). */
  #leaveExplore() {
    if (!this.view.explore) return;
    this.view.stopExplore();
    this.#syncExplore();
    this.invalidate();
  }

  #scene() {
    return this.timeline.sceneAt(this.time);
  }

  #loop(now, last) {
    requestAnimationFrame((next) => this.#loop(next, now)); // first, so an error below cannot stop the loop
    const dt = Math.min(0.1, (now - last) / 1000);
    if (this.view.explore) {
      if (this.view.stepExplore(dt)) this.dirty = true;
    } else if (this.playing) {
      if (!this.waiting) this.time += dt * this.speed;
      if (this.time >= this.timeline.duration) {
        this.time = this.timeline.duration - 0.001;
        this.pause();
      }
      this.dirty = true;
    }
    if (this.dirty || this.waiting) {
      this.dirty = false;
      this.#render();
    }
  }

  #render() {
    const { ctx, canvas } = this;
    ctx.setTransform(canvas.width / STAGE.width, 0, 0, canvas.height / STAGE.height, 0, 0);
    this.view.budgetMs = this.waiting ? CATCH_UP_BUDGET : FRAME_BUDGET;
    this.live = this.timeline.render(ctx, this.time, this.view);
    this.waiting = this.live.pending;
    this.#syncUi();
  }

  #resize() {
    const { canvas } = this;
    let width;
    let height;
    if (this.fixedSize) {
      ({ width, height } = this.fixedSize);
    } else {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(rect.width * dpr);
      height = Math.round((width * STAGE.height) / STAGE.width);
    }
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    this.invalidate();
  }

  #syncUi() {
    const { ui, timeline } = this;
    const index = timeline.indexAt(this.time);
    const scene = timeline.scenes[index];
    const t = this.time - scene.start;
    if (index !== this.shownScene) {
      this.shownScene = index;
      // a viewer's view settings hold until the scene ends
      for (const other of timeline.scenes) if (other !== scene) this.view.resetLenses(other);
      if (ui.narrationLabel) ui.narrationLabel.textContent = `Narration · ${pad2(index)} ${scene.name}`;
      this.chapterButtons?.forEach((b, k) => b.classList.toggle('on', k === index));
      this.#buildControls(scene);
    }
    const line = this.view.explore
      ? 'You are exploring: the narration is paused here. Space pauses the simulation; Esc or “Resume the video” plays the narration on from here.'
      : narrationAt(scene, t).text;
    if (ui.narration && line !== this.shownNarration) {
      this.shownNarration = line;
      ui.narration.textContent = line;
    }
    this.beatButtons?.forEach(({ button, scene: k, from, to }) => button.classList.toggle('on', k === index && t >= from && t < to));
    this.#syncControls();
    this.#syncHandover(scene, t);
    if (ui.scrub) ui.scrub.value = this.time.toFixed(2);
    if (ui.time) ui.time.textContent = `${formatTime(this.time)} / ${formatTime(timeline.duration)}`;
  }

  #syncPlayButton() {
    const { play } = this.ui;
    if (!play) return;
    play.textContent = this.playing ? 'Pause' : 'Play';
    play.setAttribute('aria-label', this.playing ? 'Pause' : 'Play');
  }

  #hidePoster() {
    if (this.ui.poster) this.ui.poster.hidden = true;
  }

  #startWarmUp() {
    this.stopWarmUp ??= warmUp(this.timeline.scenes, { busy: () => this.waiting });
  }

  #buildChapters() {
    const list = this.ui.chapters;
    if (!list) return;
    this.chapterButtons = [];
    this.beatButtons = [];
    this.timeline.scenes.forEach((scene, i) => {
      const button = el('button', { type: 'button' }, el('b', { textContent: pad2(i) }), scene.name);
      button.addEventListener('click', () => this.seekScene(i));
      list.append(el('li', {}, button));
      this.chapterButtons.push(button);
      scene.beats.forEach(([from, name], k) => {
        const beat = el('button', { type: 'button', className: 'beat', textContent: name });
        beat.addEventListener('click', () => this.seek(scene.start + from));
        list.append(el('li', {}, beat));
        this.beatButtons.push({ button: beat, scene: i, from, to: scene.beats[k + 1]?.[0] ?? scene.duration });
      });
    });
  }

  // ---- live scenes: control strip, canvas dragging, explore mode, hand-overs

  #buildControls(scene) {
    const { strip, controls } = this.ui;
    if (!controls) return;
    controls.replaceChildren();
    this.controlInputs = new Map();
    this.canvas.style.touchAction = Object.values(scene.controls ?? {}).some((c) => c.kind === 'drag') ? 'none' : '';
    if (strip) strip.hidden = !scene.live;
    if (!scene.controls) return;

    // two groups, so viewers can tell which controls pause the video
    const physics = el('div', { className: 'control-group', role: 'group', ariaLabel: 'Physics' }, el('span', { className: 'group-label', textContent: 'Physics · pauses the video' }));
    const view = el('div', { className: 'control-group', role: 'group', ariaLabel: 'View' }, el('span', { className: 'group-label', textContent: 'View' }));
    for (const [name, c] of Object.entries(scene.controls)) {
      const group = c.lens ? view : physics;
      if (c.kind === 'slider') {
        const input = el('input', { type: 'range', min: c.min, max: c.max, step: c.step, id: `control-${name}` });
        const output = el('output', { htmlFor: input.id });
        input.addEventListener('input', () => this.#onControl(name, parseFloat(input.value)));
        const row = el('label', { className: 'control' }, `${c.label} `, input, output);
        group.append(row);
        this.controlInputs.set(name, { c, row, input, output });
      } else if (c.kind === 'choice') {
        const buttons = Object.entries(c.options).map(([key, label]) => {
          const button = el('button', { type: 'button', textContent: label });
          button.addEventListener('click', () => this.#onControl(name, key));
          return [key, button];
        });
        const row = el('div', { className: 'control' }, `${c.label} `, el('span', { className: 'segmented', role: 'group', ariaLabel: c.label }, ...buttons.map(([, b]) => b)));
        group.append(row);
        this.controlInputs.set(name, { c, row, buttons });
      } else {
        group.append(el('span', { className: 'control hint-inline', textContent: c.label }));
      }
    }
    if (Object.values(scene.controls).some((c) => c.lens)) {
      const reset = el('button', { type: 'button', className: 'reset-view', textContent: 'Reset view' });
      reset.addEventListener('click', () => {
        this.view.resetLenses(scene);
        this.invalidate();
      });
      view.append(reset);
    }
    for (const group of [physics, view]) if (group.childElementCount > 1) controls.append(group);
  }

  /**
   * Show the current values (authored, or the viewer's) on the controls, and highlight a control
   * while the video itself is moving it, so viewers see what each control does.
   */
  #syncControls() {
    if (!this.controlInputs?.size || !this.live) return;
    const scene = this.#scene();
    const now = performance.now();
    for (const [name, entry] of this.controlInputs) {
      const { c, row, input, output, buttons } = entry;
      const value = this.live.input[name];
      if (input) {
        if (document.activeElement !== input || !this.view.explore) input.value = value;
        output.value = formatNumber(value, c.digits);
      } else {
        for (const [key, button] of buttons) button.setAttribute('aria-pressed', String(key === value));
      }
      const byVideo = !this.view.explore && this.view.lens(scene, name) === undefined;
      if (value !== entry.shown && entry.shown !== undefined && byVideo) entry.movedAt = now;
      entry.shown = value;
      row.classList.toggle('moving', now - (entry.movedAt ?? -Infinity) < MOVING_SHOWN);
    }
  }

  #onControl(name, value) {
    const scene = this.#scene();
    const c = scene.controls?.[name];
    if (!c) return;
    if (c.lens) this.view.setLens(scene, name, value);
    else {
      this.explore();
      this.view.setLever(name, value);
    }
    this.invalidate();
  }

  #syncExplore() {
    const { exploreBar, explorePause, exploreStatus } = this.ui;
    const ex = this.view.explore;
    if (exploreBar) exploreBar.hidden = !ex;
    if (exploreStatus && ex) exploreStatus.textContent = `Exploring from ${formatTime(ex.scene.start + ex.t0)}: the narration waits here.`;
    if (explorePause) explorePause.textContent = ex?.paused ? 'Resume simulation' : 'Pause simulation';
    this.shownNarration = '';
  }

  #toggleExplorePause() {
    const ex = this.view.explore;
    if (!ex) return;
    ex.paused = !ex.paused;
    this.#syncExplore();
  }

  #syncHandover(scene, t) {
    const { handover, handoverText } = this.ui;
    if (!handover) return;
    const h = this.view.explore ? null : scene.handovers.find(({ at }) => t >= at && t < at + HANDOVER_SHOWN);
    handover.hidden = !h;
    if (h && handoverText.textContent !== h.prompt) handoverText.textContent = h.prompt;
  }

  /** Stage coordinates of a pointer event. */
  #stagePoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    return [((e.clientX - rect.left) * STAGE.width) / rect.width, ((e.clientY - rect.top) * STAGE.height) / rect.height];
  }

  /** The drag control whose region contains stage point p, as [name, control]. */
  #dragAt(p) {
    const controls = this.#scene().controls ?? {};
    return Object.entries(controls).find(([, c]) => c.kind === 'drag' && p[0] >= c.region[0] && p[0] <= c.region[2] && p[1] >= c.region[1] && p[1] <= c.region[3]);
  }

  #bindCanvas() {
    const { canvas } = this;
    canvas.addEventListener('pointerdown', (e) => {
      const p = this.#stagePoint(e);
      const hit = this.#dragAt(p);
      if (!hit) return;
      const [name] = hit;
      const scene = this.#scene();
      this.drag = { scene, name, from: p, base: this.view.lens(scene, name) ?? this.live?.input[name] ?? [0, 0] };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', (e) => {
      const p = this.#stagePoint(e);
      if (!this.drag) {
        canvas.style.cursor = this.#dragAt(p) ? 'grab' : '';
        return;
      }
      const { scene, name, from, base } = this.drag;
      this.view.setLens(scene, name, [base[0] + p[0] - from[0], base[1] + p[1] - from[1]]);
      this.invalidate();
    });
    const end = () => {
      this.drag = null;
      canvas.style.cursor = '';
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  #bindControls() {
    const { ui } = this;
    if (ui.scrub) {
      ui.scrub.max = this.timeline.duration.toFixed(2);
      ui.scrub.addEventListener('input', () => this.seek(parseFloat(ui.scrub.value)));
    }
    ui.play?.addEventListener('click', () => this.toggle());
    ui.poster?.addEventListener('click', () => {
      this.time = 0;
      this.play();
    });
    ui.prev?.addEventListener('click', () => this.#previousChapter());
    ui.next?.addEventListener('click', () => this.seekScene(this.timeline.indexAt(this.time) + 1));
    ui.speed?.addEventListener('change', () => this.setSpeed(parseFloat(ui.speed.value)));
    ui.fullscreen?.addEventListener('click', () => this.#toggleFullscreen());
    ui.handoverTry?.addEventListener('click', () => this.explore());
    ui.explorePause?.addEventListener('click', () => this.#toggleExplorePause());
    ui.exploreBack?.addEventListener('click', () => this.resumeVideo());

    // the button last pressed with the pointer, while it keeps the focus (Chrome would report it as
    // :focus-visible as soon as a key is pressed, so that cannot tell)
    let clicked = null;
    document.addEventListener('pointerdown', (e) => (clicked = e.target.closest?.('button') ?? null), true);
    document.addEventListener('focusin', (e) => {
      if (e.target !== clicked) clicked = null;
    });

    document.addEventListener('keydown', (e) => {
      const tag = e.target?.tagName;
      if (tag === 'SELECT') return;
      // Enter and arrows belong to a focused live control; Space only to a button focused from the
      // keyboard (sliders have no use for Space, and a mouse-clicked button keeps the focus)
      const inLive = ui.strip?.contains(e.target) || ui.handover?.contains(e.target);
      const ownsSpace = tag === 'BUTTON' && e.target !== clicked;
      if (inLive && (e.key === 'Enter' || e.key.startsWith('Arrow') || (e.code === 'Space' && ownsSpace))) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.view.explore) this.#toggleExplorePause();
        else {
          if (!this.playing && ui.poster && !ui.poster.hidden) this.time = 0;
          this.toggle();
        }
      } else if (e.key === 'Escape' && this.view.explore) this.resumeVideo();
      else if (e.key === 'ArrowRight' && tag !== 'INPUT') this.seek(this.time + 5);
      else if (e.key === 'ArrowLeft' && tag !== 'INPUT') this.seek(this.time - 5);
      else if (e.key === ']') this.seekScene(this.timeline.indexAt(this.time) + 1);
      else if (e.key === '[') this.#previousChapter();
      else if (e.key === 'f' || e.key === 'F') this.#toggleFullscreen();
    });
  }

  /** Back to the start of this chapter, or to the previous one if we are near its start. */
  #previousChapter() {
    const i = this.timeline.indexAt(this.time);
    const intoScene = this.time - this.timeline.scenes[i].start;
    this.seekScene(intoScene > 1.5 || i === 0 ? i : i - 1);
  }

  #toggleFullscreen() {
    const screen = this.ui.screen ?? this.ui.stage;
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else screen?.requestFullscreen?.().catch(() => {});
    } catch {
      /* fullscreen is optional */
    }
  }
}
