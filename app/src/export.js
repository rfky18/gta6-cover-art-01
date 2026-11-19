// export.js — renders the cover at an exact post size and downloads it
// as a PNG. Rendering is deterministic: same state, same bytes.
// v2: rejects non-finite sizes instead of rendering a broken canvas.
// v3: unchanged contract — the v3 cover (6 panels, sunset band backdrop)
// exports through the same deterministic path, all three sizes.
import { drawCover } from './cover.js';

export const EXPORT_SIZES = [
  { id: '1920x1080', w: 1920, h: 1080, label: '1920 × 1080' },
  { id: '1080x1080', w: 1080, h: 1080, label: '1080 × 1080' },
  { id: '1080x1350', w: 1080, h: 1350, label: '1080 × 1350' },
];

/** Renders the cover at W x H and returns the canvas. */
export function renderCoverAt(w, h, state, images) {
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
    throw new Error(`bad export size ${w}x${h}`);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas.getContext('2d'), w, h, state, images);
  return canvas;
}

/** Renders at W x H and triggers a PNG download. Resolves with the file name. */
export function exportCover(w, h, state, images) {
  return new Promise((resolve, reject) => {
    const canvas = renderCoverAt(w, h, state, images);
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG export failed'));
        return;
      }
      const name = `grand-vice-city-${w}x${h}.png`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(name);
    }, 'image/png');
  });
}
