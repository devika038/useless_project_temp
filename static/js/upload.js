// upload.js — Drag-drop upload + preview management
import { state, showPage, showToast } from './main.js';
import { runAnalysis } from './analysis.js';
import { renderResults } from './results.js';

const MAX_FILES = 3;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function initUpload() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const previewGrid = document.getElementById('previewGrid');
  const uploadActions = document.getElementById('uploadActions');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Browse click
  browseBtn?.addEventListener('click', () => fileInput.click());
  dropZone?.addEventListener('click', (e) => {
    if (e.target === browseBtn) return;
    fileInput.click();
  });

  // File input change
  fileInput?.addEventListener('change', () => addFiles(Array.from(fileInput.files)));

  // Drag events
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault(); dropZone.classList.add('drop-active');
  });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drop-active'));
  dropZone?.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('drop-active');
    addFiles(Array.from(e.dataTransfer.files));
  });

  // Analyze button
  analyzeBtn?.addEventListener('click', async () => {
    if (state.files.length === 0) { showToast('Please add at least one photo', 'error'); return; }
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span class="btn-icon">⏳</span> Uploading...';
    try {
      // Upload files
      const sessionId = await uploadFiles(state.files);
      state.sessionId = sessionId;
      showPage('pageAnalysis');
      // Run analysis
      const result = await runAnalysis(sessionId, false);
      state.result = result;
      renderResults(result, false);
      showPage('pageResults');
    } catch (err) {
      showToast(err.message || 'Upload failed. Please try again.', 'error');
      showPage('pageLanding');
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span><span>Analyse My Hairline</span>';
    }
  });

  // Clear button
  clearBtn?.addEventListener('click', () => {
    state.files = [];
    fileInput.value = '';
    previewGrid.innerHTML = '';
    previewGrid.hidden = true;
    uploadActions.hidden = true;
  });

  function addFiles(newFiles) {
    const errors = [];
    for (const f of newFiles) {
      if (state.files.length >= MAX_FILES) { errors.push(`Max ${MAX_FILES} images allowed`); break; }
      if (!ALLOWED.includes(f.type)) { errors.push(`${f.name}: unsupported format`); continue; }
      if (f.size > MAX_SIZE) { errors.push(`${f.name}: exceeds 10MB limit`); continue; }
      if (state.files.some(ex => ex.name === f.name && ex.size === f.size)) continue;
      state.files.push(f);
    }
    if (errors.length) showToast(errors[0], 'error');
    renderPreviews();
  }

  function renderPreviews() {
    previewGrid.innerHTML = '';
    if (state.files.length === 0) {
      previewGrid.hidden = true; uploadActions.hidden = true; return;
    }
    previewGrid.hidden = false; uploadActions.hidden = false;

    state.files.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = `Photo ${idx + 1}`;
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '✕';
      removeBtn.title = 'Remove photo';
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        state.files.splice(idx, 1);
        renderPreviews();
      });
      item.appendChild(img); item.appendChild(removeBtn);
      previewGrid.appendChild(item);
    });
  }
}

async function uploadFiles(files) {
  const fd = new FormData();
  files.forEach(f => fd.append('files', f));
  const res = await fetch('/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  const data = await res.json();
  return data.session_id;
}
