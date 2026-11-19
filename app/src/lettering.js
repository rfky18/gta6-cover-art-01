// lettering.js — the cover's type: a giant gradient block title that
// overlaps the panels, a neon script subtitle, a location line, a starburst
// badge and a vintage date stamp. All type uses the bundled OFL fonts
// (Anton, Pacifico, Bebas Neue) — nothing from any game.
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

/** Draws the title block, subtitle, location, badge and stamp onto ctx. */
export function drawLettering(ctx, W, H, state) {
  const gutter = Math.max(6, Math.round(Math.min(W, H) * 0.008));
  const pad = Math.round(W * 0.03);
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const location = (state.location || '').trim().toUpperCase();
  const badge = (state.badge || '').trim();
  const stamp = (state.stamp || '').trim();

  // Title block: sits across the bottom of the cover, overlapping panels.
  const bandH = Math.round(H * 0.26);
  const bandY = H - bandH - Math.round(H * 0.02);
  const titleFace = state.titleFont === 'bebas' ? '"Bebas Neue"' : 'Anton';
  const titleSize = title ? fitFont(ctx, title, titleFace, W - pad * 2, Math.round(H * 0.15)) : 0;
  const titleY = bandY + bandH * 0.62;

  if (title) {
    const size = titleSize;
    const x = pad;
    const y = titleY;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${size}px ${titleFace}`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0b0a0e';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeText(title, x, y);
    ctx.fillStyle = titleGradient(ctx, x, y - size, ctx.measureText(title).width, TITLE_COLORS[state.titleColor] || TITLE_COLORS.gradient);
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.03;
    ctx.fillText(title, x, y);
    ctx.restore();
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
    const locY = title ? titleY - titleSize * 0.88 : bandY + Math.round(H * 0.055);
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
  void gutter;
}
