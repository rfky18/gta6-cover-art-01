// lettering.js — the cover's type: a giant gradient block title, a neon
// script subtitle, a location line, a starburst badge and a vintage date
// stamp. All type uses the bundled OFL fonts (Anton, Pacifico, Bebas Neue) —
// nothing from any game.
// v2: two title modes. Band layouts (layout.band, e.g. poster-band) get a
// dedicated title band across the bottom of the cover — opaque gradient,
// gold rule, location + stamp on its top row, the title stretched to fill
// ~the full cover width on one line, neon script under it — so the title
// never covers a face or a hero's body. Full-bleed layouts keep the title
// overlapping the panels, but it now grows to fill the width (up to a
// taller cap) instead of sitting small in the bottom-left corner.
import { GRADES } from './grades.js';
import { LAYOUTS } from './layouts.js';

const TITLE_COLORS = {
  gradient: ['#ffd166', '#ff8e6e', '#ff5da2'],
  gold: ['#ffd166', '#f2c14e'],
  white: ['#ffffff', '#f5efe6'],
  pink: ['#ff9ecf', '#ff5da2'],
};

export function titleGradient(ctx, x, y, w, colors) {
  const g = ctx.createLinearGradient(x, y, x + w, y);
  const stops = colors.length === 2 ? [0, 1] : [0, 0.5, 1];
  colors.forEach((c, i) => g.addColorStop(stops[i], c));
  return g;
}

function fitFont(ctx, text, fontFace, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px ${fontFace}`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px ${fontFace}`;
  }
  return size;
}

/** Grows the font until the text fills maxWidth (or hits capSize) — the
 *  v2 title is sized by the width it has to span, not by a fixed cap. */
function fitFontFill(ctx, text, fontFace, maxWidth, capSize) {
  let size = 12;
  ctx.font = `${size}px ${fontFace}`;
  while (size < capSize) {
    const next = size + 2;
    ctx.font = `${next}px ${fontFace}`;
    if (ctx.measureText(text).width > maxWidth) break;
    size = next;
  }
  ctx.font = `${size}px ${fontFace}`;
  return size;
}

function starburst(ctx, cx, cy, rOuter, rInner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawTitle(ctx, title, titleFace, size, x, y, maxWidth, colors) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${size}px ${titleFace}`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0b0a0e';
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.strokeText(title, x, y);
  ctx.fillStyle = titleGradient(ctx, x, y - size, Math.min(maxWidth, ctx.measureText(title).width), colors);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = size * 0.12;
  ctx.shadowOffsetY = size * 0.03;
  ctx.fillText(title, x, y);
  ctx.restore();
}

/** Draws the title block, subtitle, location, badge and stamp onto ctx. */
export function drawLettering(ctx, W, H, state) {
  const gutter = Math.max(6, Math.round(Math.min(W, H) * 0.008));
  const pad = Math.round(W * 0.03);
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const location = (state.location || '').trim().toUpperCase();
  const badge = (state.badge || '').trim();
  const stamp = (state.stamp || '').trim();
  const grade = GRADES[state.grade] || GRADES['golden-vice'];
  const layout = LAYOUTS[state.layout] || {};
  const titleFace = state.titleFont === 'bebas' ? '"Bebas Neue"' : 'Anton';
  const titleColors = TITLE_COLORS[state.titleColor] || TITLE_COLORS.gradient;

  if (layout.band) {
    // --- dedicated title band: panels end above it, type lives inside it.
    const bandH = Math.round(H * layout.band);
    const bandY = H - bandH;
    const bandColors = grade.band || ['#241019', '#3a1526', '#4a1a2e'];
    const bg = ctx.createLinearGradient(0, bandY, 0, H);
    bandColors.forEach((c, i) => bg.addColorStop(bandColors.length === 1 ? 0 : i / (bandColors.length - 1), c));
    ctx.save();
    ctx.fillStyle = bg;
    ctx.fillRect(0, bandY, W, bandH);
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(0, bandY, W, Math.max(2, Math.round(H * 0.004)));
    ctx.restore();

    // Block: location row, giant one-line title, neon script — centred in the band.
    // Anton's real cap height is ~0.88em (measured: 144px ascent at 163px),
    // NOT 0.72 — using 0.72 hid the location line behind the title in v2.
    const locSize = Math.max(12, Math.round(H * 0.024));
    const scriptSize = subtitle ? fitFont(ctx, subtitle, 'Pacifico', W * 0.55, Math.round(H * 0.058)) : 0;
    const titleCap = Math.round(bandH * 0.76);
    const titleSize = title ? fitFontFill(ctx, title, titleFace, W - pad * 2, titleCap) : 0;
    const capsH = titleSize * 0.88;
    const gap = Math.round(H * 0.012);
    const blockH = locSize + gap + capsH + gap + scriptSize * 0.75;
    let top = bandY + Math.max(0, (bandH - blockH) / 2);

    if (location) {
      ctx.save();
      ctx.font = `${locSize}px "Bebas Neue"`;
      try { ctx.letterSpacing = `${Math.round(locSize * 0.32)}px`; } catch (e) { /* older canvas: plain */ }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = locSize * 0.3;
      ctx.fillText(location, pad, top + locSize);
      try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
      ctx.restore();
    }
    // Vintage date stamp, bottom right of the band — clear of the title
    // (the top-right row belongs to the location line; the title's last
    // letter used to swallow the stamp there) and of the script (bottom left).
    if (stamp) {
      ctx.save();
      const size = Math.max(12, Math.round(H * 0.024));
      ctx.font = `${size}px "Bebas Neue"`;
      try { ctx.letterSpacing = `${Math.round(size * 0.22)}px`; } catch (e) { /* ignore */ }
      const tw = ctx.measureText(stamp).width + size * 0.9;
      const th = size * 1.7;
      const x = W - pad - tw;
      const y = bandY + bandH - th - Math.round(H * 0.012);
      ctx.translate(x + tw / 2, y + th / 2);
      ctx.rotate(-0.08);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = Math.max(1.5, size * 0.07);
      ctx.strokeRect(-tw / 2, -th / 2, tw, th);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stamp, 0, size * 0.06);
      ctx.restore();
    }

    if (title) {
      const titleY = top + locSize + gap + capsH;
      drawTitle(ctx, title, titleFace, titleSize, pad, titleY, W - pad * 2, titleColors);
    }
    if (subtitle) {
      ctx.save();
      ctx.font = `${scriptSize}px Pacifico`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ff8fd6';
      ctx.shadowColor = '#ff2ea6';
      ctx.shadowBlur = scriptSize * 0.55;
      ctx.fillText(subtitle, pad, top + locSize + gap + capsH + gap + scriptSize * 0.75);
      ctx.restore();
    }
  } else {
    // --- overlap mode (full-bleed layouts): title over the panels, bigger.
    const bandH = Math.round(H * 0.26);
    const bandY = H - bandH - Math.round(H * 0.02);
    const titleSize = title ? fitFontFill(ctx, title, titleFace, W - pad * 2, Math.round(H * 0.17)) : 0;
    const titleY = bandY + bandH * 0.62;

    if (title) {
      drawTitle(ctx, title, titleFace, titleSize, pad, titleY, W - pad * 2, titleColors);
    }

    // Location line just above the title caps, clear of the lettering.
    if (location) {
      ctx.save();
      const size = Math.max(13, Math.round(H * 0.028));
      ctx.font = `${size}px "Bebas Neue"`;
      try { ctx.letterSpacing = `${Math.round(size * 0.32)}px`; } catch (e) { /* older canvas: plain */ }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = size * 0.3;
      const locY = title ? titleY - titleSize * 0.98 : bandY + Math.round(H * 0.055);
      ctx.fillText(location, pad, locY);
      try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
      ctx.restore();
    }

    // Neon script subtitle under the title.
    if (subtitle) {
      ctx.save();
      const size = fitFont(ctx, subtitle, 'Pacifico', W * 0.62, Math.round(H * 0.062));
      ctx.font = `${size}px Pacifico`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ff8fd6';
      ctx.shadowColor = '#ff2ea6';
      ctx.shadowBlur = size * 0.55;
      ctx.fillText(subtitle, pad, bandY + bandH * 0.86);
      ctx.restore();
    }

    // Vintage date stamp, bottom right, tilted, bordered.
    if (stamp) {
      ctx.save();
      const size = Math.max(12, Math.round(H * 0.026));
      ctx.font = `${size}px "Bebas Neue"`;
      try { ctx.letterSpacing = `${Math.round(size * 0.22)}px`; } catch (e) { /* ignore */ }
      const tw = ctx.measureText(stamp).width + size * 0.9;
      const th = size * 1.7;
      const x = W - pad - tw;
      const y = H - pad - th;
      ctx.translate(x + tw / 2, y + th / 2);
      ctx.rotate(-0.1);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = Math.max(1.5, size * 0.07);
      ctx.strokeRect(-tw / 2, -th / 2, tw, th);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stamp, 0, size * 0.06);
      ctx.restore();
    }
  }

  // Starburst badge, top left over the hero sky, clear of faces.
  if (badge) {
    ctx.save();
    const r = Math.round(Math.min(W, H) * 0.055);
    const cx = pad + r;
    const cy = pad + r;
    ctx.translate(cx, cy);
    ctx.rotate(-0.2);
    starburst(ctx, 0, 0, r, r * 0.72, 12);
    ctx.fillStyle = '#f2c14e';
    ctx.strokeStyle = '#0b0a0e';
    ctx.lineWidth = Math.max(2, r * 0.06);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0b0a0e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const size = fitFont(ctx, badge, '"Bebas Neue"', r * 1.5, Math.round(r * 0.42));
    ctx.font = `${size}px "Bebas Neue"`;
    ctx.fillText(badge, 0, size * 0.05);
    ctx.restore();
  }
  void gutter;
}
