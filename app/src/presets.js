// presets.js — six original covers. A preset is a layout + grade + title
// set + photo assignment, so one click rebuilds the whole cover.
// v2: the photographic hero is boulevard.jpg (the woman + red classic car —
// the same hero the top-10 covers use), NOT the doll-like woman.jpg. Photo
// entries may be a file name or { photo, ox, oy, zoom }: the hero's oy
// keeps her face in frame when the wide hero panel crops a portrait photo.
// summer-1997 is fixed (title is GRAND VICE CITY in the band, no more
// giant date covering mouths); neon-nights and pier-lights now put a real
// night photo in the hero panel, so the neon grade matches the hero.
export const PRESETS = [
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
];
