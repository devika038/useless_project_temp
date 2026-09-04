// main.js — App state management & routing
import { initUpload } from './upload.js';
import { runAnalysis } from './analysis.js';
import { renderResults, renderCompare } from './results.js';

// ---------- State ----------
export const state = {
  page: 'landing',
  files: [],
  sessionId: null,
  result: null,
  compareResult: null,
  demoMode: false
};

// ---------- Navigation ----------
export function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
  state.page = id;
}

// ---------- Particles ----------
function initParticles() {
  const container = document.getElementById('bgParticles');
  const colors = ['#7c3aed', '#a855f7', '#f59e0b', '#06b6d4', '#10b981'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 12}s;
      animation-delay: ${Math.random() * -20}s;
      filter: blur(${Math.random() > 0.5 ? 1 : 0}px);
    `;
    container.appendChild(p);
  }
}

// ---------- Toast ----------
export function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---------- Demo mode ----------
async function startDemo() {
  state.demoMode = true;
  showPage('pageAnalysis');
  try {
    const result = await runAnalysis(null, true);
    state.result = result;
    renderResults(result, true);
    showPage('pageResults');
  } catch (e) {
    showToast('Demo failed — please try again.', 'error');
    showPage('pageLanding');
  }
}

// ---------- Back button (compare) ----------
document.getElementById('compareBackBtn')?.addEventListener('click', () => {
  showPage('pageResults');
});

// ---------- Boot ----------
window.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initUpload();

  document.getElementById('demoBtn')?.addEventListener('click', startDemo);
});

export { startDemo };
