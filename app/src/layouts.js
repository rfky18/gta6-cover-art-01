// layouts.js — six multi-panel layouts. Every rect is a fraction of the
// cover (x, y, width, height). The editor copies a layout's rects into the
// live state, so dragging a gutter line can resize panels without touching
// the layout definition itself.
export const LAYOUTS = {
  'hero-five': {
    name: 'Hero and four',
    panels: [
      { x: 0, y: 0, w: 0.56, h: 1 },
      { x: 0.56, y: 0, w: 0.22, h: 0.5 },
      { x: 0.78, y: 0, w: 0.22, h: 0.5 },
      { x: 0.56, y: 0.5, w: 0.22, h: 0.5 },
      { x: 0.78, y: 0.5, w: 0.22, h: 0.5 },
    ],
  },
  'hero-right': {
    name: 'Hero right',
    panels: [
      { x: 0, y: 0, w: 0.22, h: 0.5 },
      { x: 0.22, y: 0, w: 0.22, h: 0.5 },
      { x: 0, y: 0.5, w: 0.22, h: 0.5 },
      { x: 0.22, y: 0.5, w: 0.22, h: 0.5 },
      { x: 0.44, y: 0, w: 0.56, h: 1 },
    ],
  },
  'hero-top': {
    name: 'Hero top',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.6 },
      { x: 0, y: 0.6, w: 0.34, h: 0.4 },
      { x: 0.34, y: 0.6, w: 0.33, h: 0.4 },
      { x: 0.67, y: 0.6, w: 0.33, h: 0.4 },
    ],
  },
  'grid-six': {
    name: 'Grid six',
    panels: [
      { x: 0, y: 0, w: 0.333, h: 0.5 },
      { x: 0.333, y: 0, w: 0.334, h: 0.5 },
      { x: 0.667, y: 0, w: 0.333, h: 0.5 },
      { x: 0, y: 0.5, w: 0.333, h: 0.5 },
      { x: 0.333, y: 0.5, w: 0.334, h: 0.5 },
      { x: 0.667, y: 0.5, w: 0.333, h: 0.5 },
    ],
  },
  'trio-band': {
    name: 'Trio band',
    panels: [
      { x: 0, y: 0, w: 0.34, h: 1 },
      { x: 0.34, y: 0, w: 0.33, h: 1 },
      { x: 0.67, y: 0, w: 0.33, h: 0.5 },
      { x: 0.67, y: 0.5, w: 0.33, h: 0.5 },
    ],
  },
  'center-stage': {
    name: 'Centre stage',
    panels: [
      { x: 0, y: 0, w: 0.3, h: 0.5 },
      { x: 0, y: 0.5, w: 0.3, h: 0.5 },
      { x: 0.3, y: 0, w: 0.4, h: 1 },
      { x: 0.7, y: 0, w: 0.3, h: 0.5 },
      { x: 0.7, y: 0.5, w: 0.3, h: 0.5 },
    ],
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

/** A fresh, editable copy of a layout's panel rects. */
export function freshRects(layoutId) {
  return LAYOUTS[layoutId].panels.map((p) => ({ ...p }));
}
