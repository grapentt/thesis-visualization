// Record the video in the browser by playing it once in real time.
// For frame-exact, dropped-frame-free output use `npm run export` instead.

const MIME_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];

export const canRecord = (canvas) =>
  typeof MediaRecorder !== 'undefined' && typeof canvas.captureStream === 'function';

/**
 * Play the whole video from the start and capture it.
 * Stops early if the viewer pauses. Resolves with a WebM blob.
 */
export async function recordWebm(player, { width = 1920, height = 1080, fps = 60, bitrate = 16e6 } = {}) {
  const stream = player.canvas.captureStream(fps);
  const mimeType = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
  const chunks = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise((resolve) => (recorder.onstop = resolve));

  const previousSpeed = player.speed;
  player.lockResolution(width, height);
  player.setSpeed(1);
  player.seek(0);
  recorder.start();
  player.play();

  await player.untilStopped();
  recorder.stop();
  await stopped;

  player.setSpeed(previousSpeed);
  player.unlockResolution();
  stream.getTracks().forEach((track) => track.stop());
  return new Blob(chunks, { type: 'video/webm' });
}
