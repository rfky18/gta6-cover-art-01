// shots.js — fixed scenes for screenshots: ?shot=cover shows the cover
// alone, ?shot=editor shows the editor with photos loaded. ?preset= picks
// a preset, ?size= picks the preview size. window.__shotReady is set by
// main.js once the scene has painted.
// v2: ?grade= overrides the preset's grade (A/B a grade on the same cover),
// and editor shots add body.shot-editor so the preview fills the frame.
export async function runShot(shot, query, api) {
  const preset = query.get('preset');
  if (preset) api.applyPresetById(preset);
  const grade = query.get('grade');
  if (grade && api.applyGrade) api.applyGrade(grade);
  const size = query.get('size');
  if (size) api.setSize(size);
  if (shot === 'cover' || shot === 'cover-square' || shot === 'cover-story') {
    document.body.classList.add('shot-cover');
  }
  if (shot === 'editor') {
    document.body.classList.add('shot-editor');
  }
  api.render();
}
