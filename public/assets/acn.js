// Deterministic protocol explainer. No network calls or automatic execution.
const stages = [...document.querySelectorAll('[data-stage]')];
const panels = [...document.querySelectorAll('[data-stage-panel]')];
const next = document.getElementById('next-stage');
let active = 0;
function selectStage(index) {
  active = index;
  stages.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  panels.forEach((panel, i) => { panel.hidden = i !== index; });
  document.querySelector('.trace-progress').textContent = `${String(index + 1).padStart(2, '0')} — 05`;
  next.textContent = index === stages.length - 1 ? 'Replay lifecycle ↺' : 'Next transition →';
}
if (stages.length && panels.length && next) {
  stages.forEach((button, i) => button.addEventListener('click', () => selectStage(i)));
  next.hidden = false;
  next.addEventListener('click', () => selectStage((active + 1) % stages.length));
  selectStage(0);
}
document.querySelectorAll('[data-copy]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = 'Copy example'; }, 1800);
    } catch {
      button.textContent = 'Select code to copy';
    }
  });
});
