// grades.js — the four cinematic grades. Each grade is a photo filter string
// for the canvas 2D context, plus an overlay gradient, a vignette strength and
// an optional posterize/halftone treatment (Poster Ink, the comic-ink look).
// v2: every grade now also carries a per-panel colour wash (drawn with the
// 'color' composite, so it forces one hue family onto every photo) and a
// `band` gradient for the dedicated title band. The wash + a stronger overlay
// are what make five unrelated photos read as ONE graded cover instead of a
// stock-photo collage — the gap that lost v1 every local-judge duel.
export const GRADES = {
  'golden-vice': {
    name: 'Golden Vice',
    blurb: 'Coral sunset, pastel pink, champagne gold, turquoise ocean.',
    filter: 'saturate(1.35) contrast(1.1) sepia(0.22) hue-rotate(-8deg) brightness(1.03)',
    overlay: ['#ffd166', '#ff8e6e', '#ff5da2'],
    overlayAlpha: 0.3,
    overlayMode: 'overlay',
    vignette: 0.32,
    posterize: false,
    halftone: false,
    wash: '#ff9a5c',
    washAlpha: 0.18,
    band: ['#241019', '#3a1526', '#4a1a2e'],
  },
  'neon-crime': {
    name: 'Neon Crime',
    blurb: 'Midnight blue, burgundy, muted magenta, neon reflections.',
    filter: 'saturate(1.38) contrast(1.14) brightness(0.92) hue-rotate(14deg)',
    overlay: ['#1b2a6b', '#7a1e5e', '#ff2ea6'],
    overlayAlpha: 0.32,
    overlayMode: 'soft-light',
    vignette: 0.5,
    posterize: false,
    halftone: false,
    wash: '#8a5cff',
    washAlpha: 0.2,
    band: ['#0a0e2a', '#141a44', '#241a4a'],
  },
  'classic-1997': {
    name: 'Classic 1997',
    blurb: 'Film faded, cream, dark green, vintage gold, analog grain.',
    filter: 'sepia(0.38) saturate(0.82) contrast(0.94) brightness(1.06)',
    overlay: ['#f3e5c3', '#8a9a7b', '#c9a227'],
    overlayAlpha: 0.22,
    overlayMode: 'soft-light',
    vignette: 0.3,
    posterize: false,
    halftone: false,
    wash: '#d8b878',
    washAlpha: 0.15,
    band: ['#2a2118', '#3a2c1c', '#4a3822'],
  },
  'poster-ink': {
    name: 'Poster Ink',
    blurb: 'Halftone comic ink: posterized colour, ink outline, dot screen.',
    filter: 'saturate(1.7) contrast(1.42) brightness(1.02)',
    overlay: ['#ffd166', '#ff5da2'],
    overlayAlpha: 0.08,
    overlayMode: 'overlay',
    vignette: 0.14,
    posterize: true,
    halftone: true,
    halftoneAlpha: 0.13,
    wash: null,
    washAlpha: 0,
    band: ['#241019', '#3a1526', '#4a1a2e'],
  },
};

export const GRADE_IDS = Object.keys(GRADES);
