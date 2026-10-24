// Mount one video on the player page: timeline, player, page heading,
// in-browser recording, and the export API used by scripts/export-frames.mjs.

import { Timeline, STAGE } from './engine/timeline.js';
import { Player } from './engine/player.js';
import { LiveView } from './engine/live.js';
import { canRecord, recordWebm } from './engine/recorder.js';
import { dotGridBackground } from './draw/background.js';
import { loadFonts } from './draw/theme.js';
import { onTexReady, texSettled } from './draw/tex.js';

const $ = (id) => document.getElementById(id);

/**
 * @param {{ id: string, title: string, heading: [string, string], label: string,
 *           scenes: object[], posterTime?: number }} video
 */
export function mountVideo(video) {
  const timeline = new Timeline(video.scenes, { background: dotGridBackground(STAGE.width, STAGE.height) });
  setHeading(video);

  const player = new Player(
    timeline,
    {
      canvas: $('stage-canvas'),
      stage: $('stage'),
      poster: $('poster-play'),
      play: $('play'),
      prev: $('prev'),
      next: $('next'),
      scrub: $('scrub'),
      time: $('time'),
      speed: $('speed'),
      fullscreen: $('fullscreen'),
      narration: $('narration'),
      narrationLabel: $('narration-label'),
      chapters: $('chapters'),
      screen: $('screen'),
      strip: $('live-strip'),
      controls: $('live-controls'),
      exploreBar: $('explore-bar'),
      exploreStatus: $('explore-status'),
      explorePause: $('explore-pause'),
      exploreBack: $('explore-back'),
      handover: $('handover'),
      handoverText: $('handover-text'),
      handoverTry: $('handover-try'),
    },
    { posterTime: video.posterTime ?? 0 },
  );

  const fontsLoaded = loadFonts();
  fontsLoaded.then(() => player.invalidate());
  onTexReady(() => player.invalidate());

  setUpRecording(player, video.id);

  // frame-exact rendering for scripts/export-frames.mjs and the smoke test
  const exportCanvas = document.createElement('canvas');
  const exportView = new LiveView();
  const otherViews = new Map(); // other input histories, keyed by their JSON; only the last few are kept
  const viewKey = ({ levers = {}, lenses = {} }) => JSON.stringify([Object.entries(levers).sort(), Object.entries(lenses).sort()]);
  window.video = {
    id: video.id,
    duration: timeline.duration,
    scenes: timeline.scenes.map(({ name, start, duration, live, levers, controls, beats }) => ({
      name,
      start,
      duration,
      live,
      levers,
      beats,
      controls: Object.entries(controls ?? {}).map(([key, c]) => ({ key, kind: c.kind, lens: c.lens, min: c.min, max: c.max, options: c.options && Object.keys(c.options) })),
    })),
    /** Resolves when fonts and formulas are ready (or after 10 s without MathJax). */
    ready: Promise.all([fontsLoaded, Promise.race([texSettled, new Promise((r) => setTimeout(r, 10_000))])]),
    /**
     * PNG data URL of the frame at time T, always fully computed. Live scenes show the authored
     * version, or with `view: { levers, lenses }` fixed control values from the start of every live
     * scene. A number as third argument is the height (the earlier signature).
     */
    frame(T, width = 1920, options = {}) {
      const { height = Math.round((width * STAGE.height) / STAGE.width), view } = typeof options === 'number' ? { height: options } : options;
      let live = exportView;
      if (view) {
        const key = viewKey(view);
        if (!otherViews.has(key)) {
          if (otherViews.size >= 4) otherViews.delete(otherViews.keys().next().value); // each holds its own snapshots
          otherViews.set(key, new LiveView(view));
        }
        live = otherViews.get(key);
      }
      exportCanvas.width = width;
      exportCanvas.height = height;
      const ctx = exportCanvas.getContext('2d');
      ctx.setTransform(width / STAGE.width, 0, 0, height / STAGE.height, 0, 0);
      timeline.render(ctx, T, live);
      return exportCanvas.toDataURL('image/png');
    },
    /** Forget every computed simulation state, so the next frame starts cold. */
    reset() {
      player.resetLive();
      for (const scene of timeline.scenes) scene.track?.clear();
      exportView.clear();
      otherViews.clear();
    },
  };
  return player;
}

function setHeading({ title, heading, label }) {
  document.title = title;
  const h1 = $('video-heading');
  if (h1) {
    const emphasis = document.createElement('em');
    emphasis.textContent = heading[1];
    h1.replaceChildren(`${heading[0]} `, emphasis);
  }
  if ($('video-label')) $('video-label').textContent = label;
}

/** The "Record WebM" button: plays the video once in real time and downloads it. */
function setUpRecording(player, name) {
  const button = $('record');
  if (!button || !canRecord(player.canvas)) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Recording… (pause to stop)';
    try {
      const blob = await recordWebm(player);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${name}.webm`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
    } finally {
      button.disabled = false;
      button.textContent = 'Record WebM';
    }
  });
}
