// layouts.js — seven multi-panel layouts. Every rect is a fraction of the
// cover (x, y, width, height). The editor copies a layout's rects into the
// live state, so dragging a gutter line can resize panels without touching
// the layout definition itself.
// v2: `poster-band` reserves the bottom 34% of the cover for the dedicated
// title band (lettering.js draws the band + title there), so the giant title
// never covers a face or a hero's body — the layout the default preset uses.
// v3: `poster-band-six` adds a sixth panel (a wide sunset strip under the
// four small panels) so the cover reads denser, ala #1's 9-panel HEATWAVE,
// without crowding: the hero keeps its 0.56 width and the band stays 34%.
// v5: `titleOverlap` 0.30 — the giant gradient title's caps rise 30% of
// their height above the band into the panels (ala #2 SUN HEIST), so the
// title reads as part of the cover, not a caption strip below it. The
// overlap is capped so the caps stay clear of every face (hero face ends
// ~0.35H, the wide-strip face's mouth ~0.56H, caps top ~0.61H).
export const LAYOUTS = {
  'poster-band-six': {
    name: 'Poster band six',
    band: 0.34,
    titleOverlap: 0.3,
    panels: [
      { x: 0, y: 0, w: 0.56, h: 0.66 },
      { x: 0.56, y: 0, w: 0.22, h: 0.22 },
      { x: 0.78, y: 0, w: 0.22, h: 0.22 },
      { x: 0.56, y: 0.22, w: 0.22, h: 0.22 },
      { x: 0.78, y: 0.22, w: 0.22, h: 0.22 },
      { x: 0.56, y: 0.44, w: 0.44, h: 0.22 },
    ],
  },
  'poster-band': {
    name: 'Poster band',
    band: 0.34,
    panels: [
      { x: 0, y: 0, w: 0.56, h: 0.66 },
      { x: 0.56, y: 0, w: 0.22, h: 0.33 },
      { x: 0.78, y: 0, w: 0.22, h: 0.33 },
      { x: 0.56, y: 0.33, w: 0.22, h: 0.33 },
      { x: 0.78, y: 0.33, w: 0.22, h: 0.33 },
    ],
  },
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
