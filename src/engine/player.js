// Interactive playback: animation loop, transport controls, chapter list,
// narration and keyboard shortcuts. The player owns no drawing logic; it asks
// the timeline for a frame whenever something changed.

import { clamp } from './timing.js';
import { STAGE } from './timeline.js';

const formatTime = (s) => {
  s = Math.max(0, s);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};
const pad2 = (n) => String(n).padStart(2, '0');

export class Player {
  /**
   * @param {import('./timeline.js').Timeline} timeline
   * @param {object} ui  DOM elements; every control except `canvas` is optional.
   * @param {{ posterTime?: number }} [options]  Frame shown before the first play.
   */
  constructor(timeline, ui, { posterTime = 0 } = {}) {
    this.timeline = timeline;
    this.ui = ui;
    this.canvas = ui.canvas;
    this.ctx = ui.canvas.getContext('2d');
    this.time = posterTime;
    this.playing = false;
    this.speed = 1;
    this.fixedSize = null;
    this.dirty = true;
    this.shownScene = -1;
    this.endListeners = new Set();

    this.#bindControls();
    this.#buildChapters();
    new ResizeObserver(() => this.#resize()).observe(this.canvas);
    this.#resize();
    requestAnimationFrame((now) => this.#loop(now, now));
  }

  // ---- public API --------------------------------------------------------

  play() {
    if (this.time >= this.timeline.duration - 0.01) this.time = 0;
    this.playing = true;
    this.#hidePoster();
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
    this.time = clamp(T, 0, this.timeline.duration - 0.001);
    this.#hidePoster();
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

  // ---- internals ---------------------------------------------------------

  #loop(now, last) {
    const dt = Math.min(0.1, (now - last) / 1000);
    if (this.playing) {
      this.time += dt * this.speed;
      if (this.time >= this.timeline.duration) {
        this.time = this.timeline.duration - 0.001;
        this.pause();
      }
      this.dirty = true;
    }
    if (this.dirty) {
      this.dirty = false;
      this.#render();
    }
    requestAnimationFrame((next) => this.#loop(next, now));
  }

  #render() {
    const { ctx, canvas } = this;
    ctx.setTransform(canvas.width / STAGE.width, 0, 0, canvas.height / STAGE.height, 0, 0);
    this.timeline.render(ctx, this.time);
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
    if (index !== this.shownScene) {
      this.shownScene = index;
      const scene = timeline.scenes[index];
      if (ui.narration) ui.narration.textContent = scene.narration;
      if (ui.narrationLabel) ui.narrationLabel.textContent = `Narration · ${pad2(index)} ${scene.name}`;
      this.chapterButtons?.forEach((b, k) => b.classList.toggle('on', k === index));
    }
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

  #buildChapters() {
    const list = this.ui.chapters;
    if (!list) return;
    this.chapterButtons = this.timeline.scenes.map((scene, i) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      const number = document.createElement('b');
      number.textContent = pad2(i);
      button.append(number, scene.name);
      button.addEventListener('click', () => this.seekScene(i));
      item.append(button);
      list.append(item);
      return button;
    });
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

    document.addEventListener('keydown', (e) => {
      const tag = e.target?.tagName;
      if (tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!this.playing && ui.poster && !ui.poster.hidden) this.time = 0;
        this.toggle();
      } else if (e.key === 'ArrowRight' && tag !== 'INPUT') this.seek(this.time + 5);
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
    const stage = this.ui.stage;
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else stage?.requestFullscreen?.().catch(() => {});
    } catch {
      /* fullscreen is optional */
    }
  }
}
