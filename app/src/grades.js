// grades.js — the four cinematic grades. Each grade is a photo filter string
// for the canvas 2D context, plus an overlay gradient, a vignette strength and
// an optional posterize/halftone treatment (Poster Ink, the comic-ink look).
export const GRADES = {
  'golden-vice': {
    name: 'Golden Vice',
    blurb: 'Coral sunset, pastel pink, champagne gold, turquoise ocean.',
    filter: 'saturate(1.28) contrast(1.06) sepia(0.16) hue-rotate(-6deg) brightness(1.04)',
    overlay: ['#ffd166', '#ff8e6e', '#ff5da2'],
    overlayAlpha: 0.16,
    overlayMode: 'overlay',
    vignette: 0.32,
    posterize: false,
    halftone: false,
  },
  'neon-crime': {
    name: 'Neon Crime',
    blurb: 'Midnight blue, burgundy, muted magenta, neon reflections.',
    filter: 'saturate(1.38) contrast(1.14) brightness(0.92) hue-rotate(14deg)',
    overlay: ['#1b2a6b', '#7a1e5e', '#ff2ea6'],
    overlayAlpha: 0.26,
    overlayMode: 'soft-light',
    vignette: 0.5,
    posterize: false,
    halftone: false,
  },
  'classic-1997': {
    name: 'Classic 1997',
    blurb: 'Film faded, cream, dark green, vintage gold, analog grain.',
    filter: 'sepia(0.38) saturate(0.82) contrast(0.94) brightness(1.06)',
    overlay: ['#f3e5c3', '#8a9a7b', '#c9a227'],
    overlayAlpha: 0.16,
    overlayMode: 'soft-light',
    vignette: 0.3,
    posterize: false,
    halftone: false,
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
  },
};

export const GRADE_IDS = Object.keys(GRADES);
