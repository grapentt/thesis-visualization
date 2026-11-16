// Development entry: http://localhost:5173/?video=part-0 (default: the first video).
// The build creates one self-contained page per video instead (dist/<id>.html).

import { mountVideo } from './app.js';
import part0 from './videos/part-0/index.js';
import part1 from './videos/part-1/index.js';
import atlas from './videos/atlas/index.js';
import bundles from './videos/bundles/index.js';
import covariance from './videos/covariance/index.js';
import retention from './videos/retention/index.js';
import interactionsMeta from './videos/interactions/meta.json' with { type: 'json' };

// computes all its data at import (about 3 s): loaded only when it is the requested video
const interactions = { ...interactionsMeta, load: () => import('./videos/interactions/index.js') };

const videos = [part0, part1, atlas, bundles, interactions, covariance, retention];
const requested = new URLSearchParams(location.search).get('video');
const video = videos.find((v) => v.id === requested) ?? videos[0];
mountVideo(video.load ? (await video.load()).default : video);

// small switcher for development
const nav = document.getElementById('video-nav');
if (nav) {
  for (const v of videos) {
    const link = document.createElement('a');
    link.href = `?video=${v.id}`;
    link.textContent = v.label;
    if (v === video) link.setAttribute('aria-current', 'page');
    nav.append(link);
  }
  nav.hidden = false;
}
