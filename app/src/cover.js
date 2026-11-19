// cover.js — draws the whole cover onto a canvas 2D context at any size:
// black gutters, one photo per panel (cover-fit, draggable, zoomable),
// the grade's filter + colour wash + overlay + vignette, film grain, and
// the lettering (dedicated title band on band layouts, see lettering.js).
// v2: the per-panel wash is the grade unifier (LOCAL-JUDGE gap 1).
import { GRADES } from './grades.js';
import { drawLettering } from './lettering.js';

let noiseTile = null;
function getNoiseTile() {
  if (noiseTile) return noiseTile;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  const data = g.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 96 + Math.floor(Math.random() * 96);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  noiseTile = c;
  return c;
}

let dotTile = null;
function getDotTile() {
  if (dotTile) return dotTile;
  const c = document.createElement('canvas');
  // v5: coarser dot screen (10px -> 12px tile, dot r 1.9 -> 2.6) — the
  // #1 HEATWAVE comic-flat look needs dots you can actually see; the
  // v4 dots were too fine to read as halftone at cover scale.
  c.width = 12;
  c.height = 12;
  const g = c.getContext('2d');
  g.fillStyle = '#000000';
  g.beginPath();
  g.arc(6, 6, 2.6, 0, Math.PI * 2);
  g.fill();
  dotTile = c;
  return c;
}

/** Quantizes a panel's pixels to a few levels (the Poster Ink treatment).
 *  v4: level count comes from the grade (posterLevels) — 3 levels is the
 *  flat #1 HEATWAVE look, 4 is the noisier v2 look. */
function posterizeRegion(ctx, x, y, w, h, levels) {
  const img = ctx.getImageData(x, y, w, h);
  const d = img.data;
  const step = 256 / levels;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.floor(d[i] / step) * step + step / 2;
    d[i + 1] = Math.floor(d[i + 1] / step) * step + step / 2;
    d[i + 2] = Math.floor(d[i + 2] / step) * step + step / 2;
  }
  ctx.putImageData(img, x, y);
}

function photoFilter(grade, adjust) {
  const parts = [grade.filter];
  if (adjust.brightness) parts.push(`brightness(${1 + adjust.brightness})`);
  if (adjust.contrast) parts.push(`contrast(${1 + adjust.contrast})`);
  if (adjust.saturation) parts.push(`saturate(${1 + adjust.saturation})`);
  if (adjust.warmth) parts.push(`sepia(${adjust.warmth})`);
  return parts.join(' ');
}

/** Draws one photo cover-fitting a rect, with per-panel crop and zoom. */
function drawPhoto(ctx, img, rect, panel) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const zoom = panel.zoom || 1;
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const ox = Math.max(-1, Math.min(1, panel.ox || 0));
  const oy = Math.max(-1, Math.min(1, panel.oy || 0));
  const dx = rect.x + (rect.w - dw) / 2 - (ox * (dw - rect.w)) / 2;
  const dy = rect.y + (rect.h - dh) / 2 - (oy * (dh - rect.h)) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Draws the cover. `state` carries layoutRects, panels (per-panel photo,
 * ox, oy, zoom), grade, lettering and adjustments. `images` maps a photo id
 * (file name or upload id) to a loaded HTMLImageElement.
 */
export function drawCover(ctx, W, H, state, images) {
  const grade = GRADES[state.grade] || GRADES['golden-vice'];
  const adjust = state.adjust || {};
  const gutter = Math.max(4, Math.round(Math.min(W, H) * 0.008));
  ctx.save();
  ctx.fillStyle = '#0b0a0e';
  ctx.fillRect(0, 0, W, H);

  const rects = state.layoutRects || [];
  const panels = state.panels || [];
  rects.forEach((r, i) => {
    const panel = panels[i] || {};
    const img = images[panel.photo];
    const x = Math.round(r.x * W) + gutter / 2;
    const y = Math.round(r.y * H) + gutter / 2;
    const w = Math.round(r.w * W) - gutter;
    const h = Math.round(r.h * H) - gutter;
    if (w <= 2 || h <= 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    if (img) {
      ctx.filter = photoFilter(grade, adjust);
      drawPhoto(ctx, img, { x, y, w, h }, panel);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#241f33';
      ctx.fillRect(x, y, w, h);
    }
    // v2: one colour wash per panel ('color' keeps luminance, forces hue) —
    // this is what unifies five unrelated photos into a single graded cover.
    if (grade.wash && grade.washAlpha && img) {
      ctx.save();
      ctx.globalCompositeOperation = 'color';
      ctx.globalAlpha = grade.washAlpha;
      ctx.fillStyle = grade.wash;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
    // v3: a second warm pass ('soft-light') pushes daylight-blue panels
    // (the pier: blue sky, turquoise sea) further toward the sunset
    // palette without flattening the photo — the v2 wash alone left it blue.
    if (grade.wash && grade.washAlpha && img) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = grade.washAlpha * 0.9;
      ctx.fillStyle = grade.wash;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
    if (grade.posterize && img) posterizeRegion(ctx, Math.round(x), Math.round(y), Math.round(w), Math.round(h), grade.posterLevels || 4);
    if (grade.halftone) {
      ctx.globalAlpha = grade.halftoneAlpha || 0.1;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = ctx.createPattern(getDotTile(), 'repeat');
      ctx.fillRect(x, y, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // Ink outline around every panel.
    ctx.save();
    ctx.strokeStyle = grade.posterize ? '#0b0a0e' : 'rgba(11,10,14,0.9)';
    ctx.lineWidth = grade.posterize ? Math.max(3, gutter * 0.9) : Math.max(1, gutter * 0.35);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  });

  // Grade overlay gradient (top to bottom) + vignette.
  if (grade.overlay && grade.overlay.length) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, grade.overlay[0]);
    if (grade.overlay.length > 2) g.addColorStop(0.55, grade.overlay[1]);
    g.addColorStop(1, grade.overlay[grade.overlay.length - 1]);
    ctx.save();
    ctx.globalCompositeOperation = grade.overlayMode || 'overlay';
    ctx.globalAlpha = grade.overlayAlpha;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (grade.vignette) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, `rgba(0,0,0,${grade.vignette})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  // Film grain.
  // v4: on Poster Ink covers the grain is cut to a quarter — the flat
  // poster look must not be re-noised by the grain pass (v2's noise).
  const grain = (adjust.grain == null ? 0.3 : adjust.grain) * (grade.posterize ? 0.25 : 1);
  if (grain > 0.01) {
    ctx.save();
    ctx.globalAlpha = grain * 0.45;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(getNoiseTile(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  drawLettering(ctx, W, H, state);
  ctx.restore();
}
