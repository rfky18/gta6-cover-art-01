// main.js — wires Grand Vice City Cover Studio: state, undo/redo history,
// layout/grade/preset controls, photo upload + filmstrip, per-panel drag,
// crop and zoom, gutter-line panel resizing, adjustments, and PNG export.
// v3: boot applies PRESETS[0], which is now the One Subject preset
// (poster-band-six, six panels of the same heroine) — the studio opens on
// its strongest cover.
import { drawCover } from './cover.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { LAYOUTS, LAYOUT_IDS, freshRects } from './layouts.js';
import { PRESETS, SAMPLE_FILES } from './presets.js';
import { EXPORT_SIZES, exportCover } from './export.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const ctx = canvas.getContext('2d');
const statusEl = $('status');

const DEFAULT_ADJUST = { brightness: 0, contrast: 0, saturation: 0, warmth: 0, grain: 0.3 };

function defaultState() {
  return {
    layout: 'hero-five',
    grade: 'golden-vice',
    title: 'GRAND VICE CITY',
    subtitle: 'The Lost Generation',
    location: 'Ocean Drive • Vice City',
    badge: 'EST. 1997',
    stamp: 'SUMMER 1997',
    titleFont: 'anton',
    titleColor: 'gradient',
    exportSize: '1920x1080',
    layoutRects: freshRects('hero-five'),
    panels: [],
    photos: SAMPLE_FILES.map((f) => ({ id: f, name: f, src: `samples/${f}` })),
    adjust: { ...DEFAULT_ADJUST },
    selected: 0,
  };
}

let state = defaultState();
const images = new Map();
let uploadCount = 0;

// --- history (undo / redo) -----------------------------------------------
const undoStack = [];
const redoStack = [];
function snapshot() {
  return JSON.stringify({
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
    location: state.location,
    badge: state.badge,
    stamp: state.stamp,
    titleFont: state.titleFont,
    titleColor: state.titleColor,
    exportSize: state.exportSize,
    layoutRects: state.layoutRects,
    panels: state.panels,
    photos: state.photos,
    adjust: state.adjust,
    selected: state.selected,
  });
}
function restore(json) {
  const s = JSON.parse(json);
  state = { ...defaultState(), ...s };
  syncControls();
  render();
}
function commit() {
  undoStack.push(snapshot());
  if (undoStack.length > 50) undoStack.shift();
  redoStack.length = 0;
  updateHistoryButtons();
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
  updateHistoryButtons();
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
  updateHistoryButtons();
}
function updateHistoryButtons() {
  $('undo').disabled = !undoStack.length;
  $('redo').disabled = !redoStack.length;
}

// For continuous edits (typing, sliders, drags) the snapshot must be taken
// BEFORE the first mutation, and pushed only when the edit finishes.
let editSnapshot = null;
function beginEdit() {
  if (editSnapshot === null) editSnapshot = snapshot();
}
function endEdit() {
  if (editSnapshot === null) return;
  undoStack.push(editSnapshot);
  if (undoStack.length > 50) undoStack.shift();
  redoStack.length = 0;
  editSnapshot = null;
  updateHistoryButtons();
}

// --- images ---------------------------------------------------------------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${src}`));
    img.src = src;
  });
}
async function ensureImages() {
  for (const p of state.photos) {
    if (!images.has(p.id)) {
      try {
        images.set(p.id, await loadImage(p.src));
      } catch (e) {
        console.warn(e.message);
      }
    }
  }
}
function imageMap() {
  const map = {};
  for (const [id, img] of images) map[id] = img;
  return map;
}

// --- rendering ------------------------------------------------------------
function previewSize() {
  const size = EXPORT_SIZES.find((s) => s.id === state.exportSize) || EXPORT_SIZES[0];
  // v2: a bigger preview canvas (was 960) fills the editor stage better and
  // leaves less black void around the cover in editor screenshots.
  const max = 1120;
  if (size.w >= size.h) return { w: max, h: Math.round((max * size.h) / size.w) };
  return { w: Math.round((max * size.w) / size.h), h: max };
}
function render() {
  const { w, h } = previewSize();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(ctx, w, h, state, imageMap());
  highlightSelected();
}
function highlightSelected() {
  const box = $('panel-hint');
  const r = state.layoutRects[state.selected];
  if (!r || !box) return;
  if (document.body.classList.contains('shot-cover')) {
    box.style.display = 'none';
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const stage = $('stage');
  const stageRect = stage.getBoundingClientRect();
  box.style.display = 'block';
  box.style.left = `${rect.left - stageRect.left + (r.x * rect.width) - 2}px`;
  box.style.top = `${rect.top - stageRect.top + (r.y * rect.height) - 2}px`;
  box.style.width = `${r.w * rect.width + 4}px`;
  box.style.height = `${r.h * rect.height + 4}px`;
  const label = $('panel-label');
  if (label) {
    const panel = state.panels[state.selected] || {};
    label.textContent = `Panel ${state.selected + 1} of ${state.layoutRects.length} — ${panel.photo || 'empty'} — drag to move the photo, scroll to zoom, drag a black gutter line to resize`;
  }
}
function setStatus(text) {
  statusEl.textContent = text;
}

// --- presets / layouts / grades -------------------------------------------
function applyPreset(preset, record = true) {
  if (record) commit();
  state.layout = preset.layout;
  state.grade = preset.grade;
  state.title = preset.title;
  state.subtitle = preset.subtitle;
  state.location = preset.location;
  state.badge = preset.badge;
  state.stamp = preset.stamp;
  state.layoutRects = freshRects(preset.layout);
  // v2: a photo entry may be a file name or { photo, ox, oy, zoom } — the
  // hero's oy keeps her face in frame on the wide hero panel.
  state.panels = state.layoutRects.map((_, i) => {
    const spec = preset.photos[i % preset.photos.length];
    const photo = typeof spec === 'string' ? spec : spec.photo;
    return {
      photo,
      ox: (spec && spec.ox) || 0,
      oy: (spec && spec.oy) || 0,
      zoom: (spec && spec.zoom) || 1,
    };
  });
  state.selected = 0;
  syncControls();
  render();
  setStatus(`Preset ${preset.name} applied.`);
}
function applyLayout(id, record = true) {
  if (record) commit();
  state.layout = id;
  state.layoutRects = freshRects(id);
  const photos = state.panels.map((p) => p.photo);
  state.panels = state.layoutRects.map((_, i) => (
    photos[i] ? { ...state.panels[i] } : { photo: state.photos[i % state.photos.length].id, ox: 0, oy: 0, zoom: 1 }
  ));
  state.selected = Math.min(state.selected, state.layoutRects.length - 1);
  syncControls();
  render();
}
function applyGrade(id, record = true) {
  if (record) commit();
  state.grade = id;
  syncControls();
  render();
}
function autoCompose(record = true) {
  if (record) commit();
  state.panels = state.layoutRects.map((_, i) => ({
    photo: state.photos[i % state.photos.length].id,
    ox: 0,
    oy: 0,
    zoom: 1,
  }));
  state.selected = 0;
  render();
  setStatus('Photos composed across the panels.');
}

// --- controls --------------------------------------------------------------
function buildButtons(containerId, items, activeId, onPick) {
  const box = $(containerId);
  box.innerHTML = '';
  items.forEach((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick';
    b.dataset.id = item.id;
    b.textContent = item.name;
    if (item.blurb) b.title = item.blurb;
    b.addEventListener('click', () => onPick(item.id));
    box.appendChild(b);
  });
  markActive(containerId, activeId);
}
function markActive(containerId, activeId) {
  const box = $(containerId);
  if (!box) return;
  box.querySelectorAll('.pick').forEach((b) => {
    b.classList.toggle('active', b.dataset.id === activeId);
    b.setAttribute('aria-pressed', b.dataset.id === activeId ? 'true' : 'false');
  });
}
function syncControls() {
  $('title').value = state.title;
  $('subtitle').value = state.subtitle;
  $('location').value = state.location;
  $('badge').value = state.badge;
  $('stamp').value = state.stamp;
  $('title-font').value = state.titleFont;
  $('title-color').value = state.titleColor;
  $('brightness').value = state.adjust.brightness;
  $('contrast').value = state.adjust.contrast;
  $('saturation').value = state.adjust.saturation;
  $('warmth').value = state.adjust.warmth;
  $('grain').value = state.adjust.grain;
  markActive('layout-picks', state.layout);
  markActive('grade-picks', state.grade);
  markActive('preset-picks', state.activePreset || '');
  markActive('size-picks', state.exportSize);
  renderFilmstrip();
  updateHistoryButtons();
}
function renderFilmstrip() {
  const strip = $('filmstrip');
  strip.innerHTML = '';
  state.photos.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = `Use ${p.name} in the selected panel (double-click fills every panel)`;
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.name;
    b.appendChild(img);
    b.addEventListener('click', () => {
      commit();
      const panel = state.panels[state.selected];
      if (panel) {
        panel.photo = p.id;
        panel.ox = 0;
        panel.oy = 0;
        panel.zoom = 1;
      }
      render();
      setStatus(`${p.name} placed in panel ${state.selected + 1}.`);
    });
    b.addEventListener('dblclick', () => {
      commit();
      state.panels.forEach((panel) => {
        panel.photo = p.id;
        panel.ox = 0;
        panel.oy = 0;
        panel.zoom = 1;
      });
      render();
      setStatus(`Every panel now uses ${p.name}.`);
    });
    strip.appendChild(b);
  });
}

// --- upload -----------------------------------------------------------------
async function addUploads(files) {
  const list = [...files].filter((f) => f.type.startsWith('image/'));
  if (!list.length) {
    setStatus('No image files in that drop.');
    return;
  }
  commit();
  for (const file of list) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    uploadCount += 1;
    const id = `upload-${uploadCount}`;
    state.photos.push({ id, name: file.name, src: dataUrl });
    try {
      images.set(id, await loadImage(dataUrl));
    } catch (e) {
      console.warn(e.message);
    }
    const panel = state.panels[state.selected];
    if (panel) {
      panel.photo = id;
      panel.ox = 0;
      panel.oy = 0;
      panel.zoom = 1;
    }
  }
  syncControls();
  render();
  setStatus(`${list.length} photo${list.length > 1 ? 's' : ''} added and placed in the selected panel.`);
}

// --- pointer: select, drag photo, zoom, resize gutters ----------------------
function coverPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    rect,
  };
}
function panelAt(px, py) {
  for (let i = state.layoutRects.length - 1; i >= 0; i -= 1) {
    const r = state.layoutRects[i];
    if (px >= r.x * canvas.width && px <= (r.x + r.w) * canvas.width
      && py >= r.y * canvas.height && py <= (r.y + r.h) * canvas.height) return i;
  }
  return -1;
}
function sharedEdges() {
  const edges = [];
  const rects = state.layoutRects;
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = 0; j < rects.length; j += 1) {
      if (i === j) continue;
      const a = rects[i];
      const b = rects[j];
      const yOverlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (Math.abs(a.x + a.w - b.x) < 0.004 && yOverlap > 0.08) {
        edges.push({ kind: 'v', at: a.x + a.w, left: i, right: j, y0: Math.max(a.y, b.y), y1: Math.min(a.y + a.h, b.y + b.h) });
      }
      const xOverlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      if (Math.abs(a.y + a.h - b.y) < 0.004 && xOverlap > 0.08) {
        edges.push({ kind: 'h', at: a.y + a.h, top: i, bottom: j, x0: Math.max(a.x, b.x), x1: Math.min(a.x + a.w, b.x + b.w) });
      }
    }
  }
  return edges;
}
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const p = coverPoint(e);
  const fx = p.x / canvas.width;
  const fy = p.y / canvas.height;
  const scale = canvas.width / p.rect.width;
  for (const edge of sharedEdges()) {
    if (edge.kind === 'v' && Math.abs(fx - edge.at) * canvas.width < 10 * scale && fy >= edge.y0 && fy <= edge.y1) {
      drag = { kind: 'resize-v', edge, snapshot: snapshot() };
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    if (edge.kind === 'h' && Math.abs(fy - edge.at) * canvas.height < 10 * scale && fx >= edge.x0 && fx <= edge.x1) {
      drag = { kind: 'resize-h', edge, snapshot: snapshot() };
      canvas.setPointerCapture(e.pointerId);
      return;
    }
  }
  const idx = panelAt(p.x, p.y);
  if (idx < 0) return;
  state.selected = idx;
  render();
  drag = { kind: 'move', idx, lastX: p.x, lastY: p.y, moved: false, snapshot: snapshot() };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = coverPoint(e);
  if (drag.kind === 'move') {
    const panel = state.panels[drag.idx];
    const img = images.get(panel.photo);
    if (!img) return;
    const r = state.layoutRects[drag.idx];
    const rw = r.w * canvas.width;
    const rh = r.h * canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(rw / iw, rh / ih) * (panel.zoom || 1);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = p.x - drag.lastX;
    const dy = p.y - drag.lastY;
    if (dw > rw) panel.ox = Math.max(-1, Math.min(1, panel.ox + (2 * dx) / (dw - rw)));
    if (dh > rh) panel.oy = Math.max(-1, Math.min(1, panel.oy + (2 * dy) / (dh - rh)));
    drag.lastX = p.x;
    drag.lastY = p.y;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) drag.moved = true;
    render();
  } else if (drag.kind === 'resize-v') {
    const { left, right } = drag.edge;
    const a = state.layoutRects[left];
    const b = state.layoutRects[right];
    const bRight = b.x + b.w;
    const fx = Math.max(a.x + 0.12, Math.min(bRight - 0.12, p.x / canvas.width));
    a.w = fx - a.x;
    b.x = fx;
    b.w = bRight - fx;
    render();
  } else if (drag.kind === 'resize-h') {
    const { top, bottom } = drag.edge;
    const a = state.layoutRects[top];
    const b = state.layoutRects[bottom];
    const bBottom = b.y + b.h;
    const fy = Math.max(a.y + 0.12, Math.min(bBottom - 0.12, p.y / canvas.height));
    a.h = fy - a.y;
    b.y = fy;
    b.h = bBottom - fy;
    render();
  }
});
canvas.addEventListener('pointerup', () => {
  if (drag && (drag.kind.startsWith('resize') || drag.moved)) {
    undoStack.push(drag.snapshot);
    if (undoStack.length > 50) undoStack.shift();
    redoStack.length = 0;
    updateHistoryButtons();
  }
  drag = null;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[state.selected];
  if (!panel) return;
  const before = panel.zoom || 1;
  panel.zoom = Math.max(1, Math.min(4, before * (e.deltaY < 0 ? 1.12 : 0.89)));
  if (panel.zoom !== before) {
    render();
    if (!canvas._wheelSnapshot) canvas._wheelSnapshot = snapshot();
    if (!canvas._wheelTimer) {
      canvas._wheelTimer = setTimeout(() => {
        undoStack.push(canvas._wheelSnapshot);
        if (undoStack.length > 50) undoStack.shift();
        redoStack.length = 0;
        canvas._wheelSnapshot = null;
        canvas._wheelTimer = null;
        updateHistoryButtons();
      }, 400);
    }
  }
}, { passive: false });

// --- static wiring ----------------------------------------------------------
function wire() {
  buildButtons('layout-picks', LAYOUT_IDS.map((id) => ({ id, name: LAYOUTS[id].name })), state.layout, (id) => { applyLayout(id); setStatus(`Layout ${LAYOUTS[id].name}.`); });
  buildButtons('grade-picks', GRADE_IDS.map((id) => ({ id, name: GRADES[id].name, blurb: GRADES[id].blurb })), state.grade, (id) => { applyGrade(id); setStatus(`Grade ${GRADES[id].name}.`); });
  buildButtons('preset-picks', PRESETS.map((p) => ({ id: p.id, name: p.name })), '', (id) => {
    const preset = PRESETS.find((p) => p.id === id);
    state.activePreset = id;
    applyPreset(preset);
    markActive('preset-picks', id);
  });
  buildButtons('size-picks', EXPORT_SIZES.map((s) => ({ id: s.id, name: s.label })), state.exportSize, (id) => {
    state.exportSize = id;
    syncControls();
    render();
    setStatus(`Preview size ${id}.`);
  });

  $('upload').addEventListener('change', (e) => {
    addUploads(e.target.files);
    e.target.value = '';
  });
  $('compose').addEventListener('click', () => autoCompose());
  $('fill-selected').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    if (!panel) return;
    commit();
    state.panels.forEach((p) => {
      p.photo = panel.photo;
      p.ox = 0;
      p.oy = 0;
      p.zoom = 1;
    });
    render();
    setStatus('Every panel now uses the selected photo.');
  });
  canvas.addEventListener('dragover', (e) => e.preventDefault());
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    addUploads(e.dataTransfer.files);
  });

  const textInputs = [['title', 'title'], ['subtitle', 'subtitle'], ['location', 'location'], ['badge', 'badge'], ['stamp', 'stamp']];
  textInputs.forEach(([id, key]) => {
    $(id).addEventListener('focus', beginEdit);
    $(id).addEventListener('input', (e) => {
      state[key] = e.target.value;
      render();
    });
    $(id).addEventListener('change', endEdit);
  });
  $('title-font').addEventListener('focus', beginEdit);
  $('title-font').addEventListener('change', (e) => {
    state.titleFont = e.target.value;
    render();
    endEdit();
  });
  $('title-color').addEventListener('focus', beginEdit);
  $('title-color').addEventListener('change', (e) => {
    state.titleColor = e.target.value;
    render();
    endEdit();
  });
  const sliders = [['brightness', 'brightness'], ['contrast', 'contrast'], ['saturation', 'saturation'], ['warmth', 'warmth'], ['grain', 'grain']];
  sliders.forEach(([id, key]) => {
    $(id).addEventListener('focus', beginEdit);
    $(id).addEventListener('pointerdown', beginEdit);
    $(id).addEventListener('input', (e) => {
      state.adjust[key] = Number(e.target.value);
      render();
    });
    $(id).addEventListener('change', endEdit);
  });

  $('undo').addEventListener('click', undo);
  $('redo').addEventListener('click', redo);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  });

  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', async () => {
      const w = Number(b.dataset.w);
      const h = Number(b.dataset.h);
      setStatus(`Exporting ${w} × ${h}…`);
      try {
        const name = await exportCover(w, h, state, imageMap());
        window.__lastExport = { w, h, name };
        setStatus(`Saved ${name}.`);
      } catch (err) {
        setStatus(`Export failed: ${err.message}`);
      }
    });
  });

  window.addEventListener('resize', highlightSelected);
}

// --- boot -------------------------------------------------------------------
async function boot() {
  wire();
  try {
    await Promise.all([
      document.fonts.load('80px Anton'),
      document.fonts.load('80px "Bebas Neue"'),
      document.fonts.load('60px Pacifico'),
      document.fonts.ready,
    ]);
  } catch (e) {
    console.warn('font load:', e.message);
  }
  await ensureImages();
  applyPreset(PRESETS[0], false);
  undoStack.length = 0;
  redoStack.length = 0;
  updateHistoryButtons();
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), {
      applyPresetById: (id) => {
        const preset = PRESETS.find((p) => p.id === id);
        if (preset) applyPreset(preset, false);
      },
      // v2: shots may override the grade (?grade=poster-ink) to A/B a grade.
      applyGrade: (id) => { if (GRADES[id]) applyGrade(id, false); },
      setSize: (id) => {
        state.exportSize = id;
        syncControls();
        render();
      },
      render,
      state: () => state,
    });
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    highlightSelected();
    window.__shotReady = true;
  }));
  // rAF can stall in a backgrounded headed window, so a timer sets the
  // same flag as a backstop.
  setTimeout(() => { window.__shotReady = true; }, 600);
}

window.__app = {
  get state() { return state; },
  applyPresetById: (id) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) applyPreset(preset);
  },
  applyLayout,
  applyGrade,
  undo,
  redo,
  render,
  addUploads,
};

boot();
