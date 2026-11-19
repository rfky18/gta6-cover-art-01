// presets.js — six original covers. A preset is a layout + grade + title
// set + photo assignment, so one click rebuilds the whole cover.
// v2: the photographic hero is boulevard.jpg (the woman + red classic car —
// the same hero the top-10 covers use), NOT the doll-like woman.jpg. Photo
// entries may be a file name or { photo, ox, oy, zoom }: the hero's oy
// keeps her face in frame when the wide hero panel crops a portrait photo.
// summer-1997 is fixed (title is GRAND VICE CITY in the band, no more
// giant date covering mouths); neon-nights and pier-lights now put a real
// night photo in the hero panel, so the neon grade matches the hero.
// v5: One Subject's grade stays POSTER INK and the band stays, but two
// panels are now TRULY different scenes, not boulevard.jpg crops (the gap
// that lost v4 vs #2): panel 2 is boulevard-back.jpg — the same heroine
// from behind, walking down the boulevard at sunset (Pollinations, same
// character description: curly brown hair, sunglasses, white shirt); panel
// 3 is boulevard-hood.jpg — the same heroine sitting on the hood of the
// red classic convertible. Both are AI-made with the heroine's exact
// outfit/hair/sunglasses, then posterized + halftone-unified with the rest
// of the cover, so the identity holds at cover scale. The existing repo
// samples could NOT be used here: heroine-neon is a visibly different
// woman, rooftop/pierman are men, neon is two different women — putting
// any of them in a one-subject preset would break the narrative.
export const PRESETS = [
  {
    id: 'one-subject',
    name: 'One Subject',
    layout: 'poster-band-six',
    grade: 'poster-ink',
    title: 'GRAND VICE CITY',
    subtitle: 'The Lost Generation',
    location: 'Ocean Drive • Vice City',
    badge: 'EST. 1997',
    stamp: 'SUMMER 1997',
    photos: [
      { photo: 'boulevard.jpg', oy: -0.65 },
      { photo: 'boulevard-back.jpg', zoom: 1.15, oy: -0.55 },
      { photo: 'boulevard-hood.jpg', zoom: 1.1, oy: -0.5 },
      { photo: 'boulevard.jpg', zoom: 1.05, ox: 0.5, oy: -0.7 },
      { photo: 'boulevard.jpg', zoom: 1.0, ox: -0.5, oy: 0.35 },
      // v5 fix: the wide strip used to be a face close-up whose mouth sat
      // at ~0.61H — exactly where the overlapping title's caps top lands
      // (0.607H), so the title hid her mouth. The strip is now the bottom
      // slice of the same photo (red classic car + street, no face), so the
      // overlap reads as #2-style title-over-street, never title-over-face.
      { photo: 'boulevard.jpg', zoom: 1.0, ox: 0, oy: 0.9 },
    ],
  },
  {
    id: 'golden-boulevard',
    name: 'Golden Boulevard',
    layout: 'poster-band',
    grade: 'golden-vice',
    title: 'GRAND VICE CITY',
    subtitle: 'The Lost Generation',
    location: 'Ocean Drive • Vice City',
    badge: 'EST. 1997',
    stamp: 'SUMMER 1997',
    photos: [{ photo: 'boulevard.jpg', oy: -0.65 }, 'neon.jpg', 'rooftop.jpg', 'pierman.jpg', 'pier.jpg'],
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    layout: 'hero-right',
    grade: 'neon-crime',
    title: 'NEON NIGHTS',
    subtitle: 'Vice After Dark',
    location: 'Ocean Drive • After Midnight',
    badge: 'EST. 1997',
    stamp: 'SUMMER 1997',
    photos: ['woman.jpg', 'rooftop.jpg', 'boulevard.jpg', 'pierman.jpg', 'heroine-neon.jpg'],
  },
  {
    id: 'summer-1997',
    name: 'Summer 1997',
    layout: 'poster-band',
    grade: 'classic-1997',
    title: 'GRAND VICE CITY',
    subtitle: 'The Lost Generation',
    location: 'Vice City • Florida',
    badge: 'SUMMER 1997',
    stamp: 'EST. 1997',
    photos: [{ photo: 'boulevard.jpg', oy: -0.65 }, 'rooftop.jpg', 'neon.jpg', 'pierman.jpg', 'pier.jpg'],
  },
  {
    id: 'vice-ink',
    name: 'Vice Ink',
    layout: 'poster-band',
    grade: 'poster-ink',
    title: 'VICE INK',
    subtitle: 'A 1997 Story',
    location: 'Ocean Drive • Vice City',
    badge: 'EST. 1997',
    stamp: 'SUMMER 1997',
    photos: [{ photo: 'boulevard.jpg', oy: -0.65 }, 'heroine-neon.jpg', 'rooftop.jpg', 'pierman.jpg', 'neon.jpg'],
  },
  {
    id: 'ocean-drive',
    name: 'Ocean Drive',
    layout: 'trio-band',
    grade: 'golden-vice',
    title: 'OCEAN DRIVE',
    subtitle: 'Coastline Nights',
    location: 'Vice City • Florida',
    badge: 'EST. 1997',
    stamp: 'SUMMER 1997',
    photos: ['boulevard.jpg', 'woman.jpg', 'neon.jpg', 'pier.jpg'],
  },
  {
    id: 'pier-lights',
    name: 'Pier Lights',
    layout: 'center-stage',
    grade: 'neon-crime',
    title: 'PIER LIGHTS',
    subtitle: 'Last Cast at Dusk',
    location: 'Vice City Pier',
    badge: 'EST. 1997',
    stamp: 'SUMMER 1997',
    photos: ['pierman.jpg', 'rooftop.jpg', 'heroine-neon.jpg', 'boulevard.jpg', 'woman.jpg'],
  },
];

export const SAMPLE_FILES = [
  'woman.jpg',
  'rooftop.jpg',
  'neon.jpg',
  'heroine-neon.jpg',
  'pierman.jpg',
  'boulevard.jpg',
  'pier.jpg',
  // v5: the two new One Subject scenes (same heroine, different moments).
  'boulevard-back.jpg',
  'boulevard-hood.jpg',
];
