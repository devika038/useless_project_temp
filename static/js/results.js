// results.js — Results rendering, share, download, compare
import { showPage, showToast, state } from './main.js';
import { runAnalysis } from './analysis.js';
import { initUpload } from './upload.js';

// Category color map
const CAT_COLORS = {
  stronghold: { bar: '#10b981', text: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  early_retreat: { bar: '#06b6d4', text: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
  temple_negotiations: { bar: '#f59e0b', text: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  strategic_withdrawal: { bar: '#f43f5e', text: '#f43f5e', glow: 'rgba(244,63,94,0.3)' },
  chrome_dome: { bar: '#a855f7', text: '#c084fc', glow: 'rgba(168,85,247,0.4)' }
};

export function renderResults(result, demoMode) {
  const container = document.getElementById('resultsMain');
  if (!container) return;

  const cat = result.category;
  const catId = cat.id || 'stronghold';
  const colors = CAT_COLORS[catId] || CAT_COLORS.stronghold;

  container.innerHTML = `
    <!-- Hero -->
    <div class="result-hero" id="resultHeroCard">
      ${demoMode ? '<div class="result-demo-badge">🎬 Demo Mode — try uploading your own photo!</div>' : ''}
      <div class="result-category-badge">
        <span>${cat.emoji}</span>
        <span>${cat.name}</span>
        <span style="opacity:0.6; font-weight:400">${cat.subtitle}</span>
      </div>
      ${result.already_bald
        ? `<div class="result-headline">Baldness Status</div>
           <div class="result-forecast" style="font-size:clamp(1.8rem,5vw,2.8rem)">Chrome Dome<br/>Achieved! ✨</div>
           <div class="result-forecast-sub">The forecast is: already there. Congratulations, pioneer.</div>`
        : (result.years_low === 0 && result.years_high <= 2
          ? `<div class="result-headline">Estimated Time Remaining</div>
             <div class="result-forecast">${result.years_high === 0 ? 'Any day now' : `0–${result.years_high} years`}</div>
             <div class="result-forecast-sub">the hairline has filed the paperwork. it's just waiting for approval.</div>`
          : `<div class="result-headline">Estimated Baldness Deadline</div>
             <div class="result-forecast">${result.years_low}–${result.years_high} years</div>
             <div class="result-forecast-sub">from now (give or take a few existential crises)</div>`
        )
      }
      <div class="result-comment">"${result.comment}"</div>
    </div>

    <!-- Scores -->
    <div class="scores-row">
      <div class="score-card">
        <div class="score-label">Apparent Density</div>
        <div class="score-value" style="color:${colors.text}">
          ${result.density_score}<span class="score-unit">/100</span>
        </div>
        <div class="score-bar-wrap">
          <div class="score-bar" id="densityBar"
               style="width:0%; background: linear-gradient(90deg, ${colors.bar}, ${colors.bar}99)"></div>
        </div>
      </div>
      <div class="score-card">
        <div class="score-label">Recession Score</div>
        <div class="score-value" style="color:${colors.text}">
          ${result.recession_score}<span class="score-unit">/10</span>
        </div>
        <div class="score-bar-wrap">
          <div class="score-bar" id="recessionBar"
               style="width:0%; background: linear-gradient(90deg, #10b981, #f59e0b, #f43f5e)"></div>
        </div>
      </div>
    </div>

    <!-- Confidence -->
    <div class="confidence-card">
      <div class="confidence-header">
        <span class="confidence-label">🔬 Scientific-ish Confidence</span>
        <span class="confidence-value">${result.confidence}%</span>
      </div>
      <div class="confidence-meter">
        <div class="confidence-fill" id="confidenceFill" style="width:0%"></div>
      </div>
      <div class="confidence-note">
        Based entirely on visible image patterns. For entertainment only. Your doctor knows nothing of this.
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline-card">
      <div class="timeline-title">📅 Your Hairline Journey</div>
      <div class="timeline-track">
        <div class="timeline-thumb" id="timelineThumb" style="left: 0%"></div>
      </div>
      <div class="timeline-labels">
        <span class="tl-now">Now</span>
        <span>Questionable</span>
        <span>Polishing<br/>Required</span>
        <span class="tl-end">Chrome<br/>Dome</span>
      </div>
    </div>

    <!-- Follicle fun fact -->
    <div class="score-card" style="text-align:center; padding: 20px;">
      <div class="score-label">Your Follicle Squad</div>
      <div style="font-family:'Space Grotesk',sans-serif; font-size:1.4rem; font-weight:700; margin-top:6px; color: var(--purple-light)">
        ${result.follicle_name}
      </div>
    </div>

    <!-- Actions -->
    <div class="result-actions">
      <button class="btn btn-primary" id="tryAnotherBtn">
        <span class="btn-icon">📸</span> Try Another Photo
      </button>
      <button class="btn btn-amber" id="downloadBtn">
        <span class="btn-icon">💾</span> Download Result Card
      </button>
      <button class="btn btn-outline" id="compareBtn">
        <span class="btn-icon">⚖️</span> Compare Two
      </button>
    </div>

    <!-- Disclaimer -->
    <div class="result-disclaimer">
      🎭 <strong>For entertainment purposes only.</strong> This analysis is based solely on visible image patterns
      using made-up heuristics. It cannot diagnose hair loss, predict baldness, or replace medical advice.
      Consult a dermatologist for actual hair health concerns. Your photos were deleted immediately after analysis.
    </div>
  `;

  // Animate bars after a tick
  requestAnimationFrame(() => {
    setTimeout(() => {
      const densityBar = document.getElementById('densityBar');
      const recessionBar = document.getElementById('recessionBar');
      const confidenceFill = document.getElementById('confidenceFill');
      const timelineThumb = document.getElementById('timelineThumb');

      if (densityBar) densityBar.style.width = result.density_score + '%';
      if (recessionBar) recessionBar.style.width = (result.recession_score * 10) + '%';
      if (confidenceFill) confidenceFill.style.width = result.confidence + '%';
      if (timelineThumb) {
        // timeline_pos 0-6 -> 0-100%
        const pos = Math.min(100, (result.timeline_pos / 6) * 100);
        timelineThumb.style.left = pos + '%';
      }
    }, 150);
  });

  // Bind action buttons
  document.getElementById('tryAnotherBtn')?.addEventListener('click', resetToLanding);
  document.getElementById('downloadBtn')?.addEventListener('click', () => downloadCard(result, demoMode));
  document.getElementById('compareBtn')?.addEventListener('click', () => openCompare(result));
}

function resetToLanding() {
  state.files = [];
  state.sessionId = null;
  state.result = null;
  state.compareResult = null;
  // Reset upload form
  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.value = '';
  const previewGrid = document.getElementById('previewGrid');
  if (previewGrid) { previewGrid.innerHTML = ''; previewGrid.hidden = true; }
  const uploadActions = document.getElementById('uploadActions');
  if (uploadActions) uploadActions.hidden = true;
  showPage('pageLanding');
}

// ---------- Download result card ----------
function downloadCard(result, demoMode) {
  const canvas = document.getElementById('exportCanvas');
  canvas.hidden = false;
  canvas.width = 800; canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 800, 500);
  bg.addColorStop(0, '#0f0a1e');
  bg.addColorStop(0.5, '#130d24');
  bg.addColorStop(1, '#0f0f20');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 800, 500);

  // Purple glow blob
  const glow = ctx.createRadialGradient(400, 0, 0, 400, 0, 400);
  glow.addColorStop(0, 'rgba(124,58,237,0.2)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 800, 500);

  // Border
  ctx.strokeStyle = 'rgba(124,58,237,0.4)'; ctx.lineWidth = 2;
  roundRect(ctx, 10, 10, 780, 480, 20); ctx.stroke();

  // App name
  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🦱 കഷണ്ടി Meter', 400, 60);

  // Category
  ctx.fillStyle = 'rgba(124,58,237,0.3)';
  roundRect(ctx, 280, 75, 240, 36, 18); ctx.fill();
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 15px "Space Grotesk", sans-serif';
  ctx.fillText(`${result.category.emoji}  ${result.category.name}`, 400, 98);

  // Forecast
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText('ESTIMATED BALDNESS DEADLINE', 400, 145);

  ctx.font = 'bold 64px "Space Grotesk", sans-serif';
  const grad = ctx.createLinearGradient(200, 160, 600, 230);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#a855f7');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillText(`${result.years_low}–${result.years_high} years`, 400, 220);

  // Comment
  ctx.fillStyle = 'rgba(148,163,184,0.9)';
  ctx.font = 'italic 15px Inter, sans-serif';
  wrapText(ctx, `"${result.comment}"`, 400, 265, 660, 24);

  // Scores
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, 60, 340, 320, 90, 12); ctx.fill();
  roundRect(ctx, 420, 340, 320, 90, 12); ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('APPARENT DENSITY', 220, 365);
  ctx.fillText('RECESSION SCORE', 580, 365);

  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`${result.density_score}/100`, 220, 410);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`${result.recession_score}/10`, 580, 410);

  // Footer
  ctx.fillStyle = 'rgba(100,116,139,0.7)';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('For entertainment only · Not medical advice · kashandi-meter.app', 400, 475);

  // Export
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kashandi-meter-result.png';
    a.click(); URL.revokeObjectURL(url);
    canvas.hidden = true;
    showToast('Result card downloaded! 🎉', 'success');
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line, x, y); line = words[i] + ' '; y += lineHeight;
    } else { line = test; }
  }
  ctx.fillText(line, x, y);
}

// ---------- Compare mode ----------
export function renderCompare(result1, result2) {
  const container = document.getElementById('comparePanels');
  if (!container) return;
  container.innerHTML = [
    renderComparePanel('Photo Set A', result1),
    renderComparePanel('Photo Set B', result2)
  ].join('');
}

function renderComparePanel(label, result) {
  const cat = result.category;
  const catId = cat.id || 'stronghold';
  const colors = CAT_COLORS[catId] || CAT_COLORS.stronghold;
  return `
    <div class="compare-panel">
      <div class="compare-panel-title">${label}</div>
      <div class="result-category-badge" style="margin-bottom:16px">
        ${cat.emoji} ${cat.name}
      </div>
      <div style="font-family:'Space Grotesk',sans-serif; font-size:2rem; font-weight:800; margin-bottom:8px; color:${colors.text}">
        ${result.years_low}–${result.years_high} yrs
      </div>
      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px">${result.years_low < 10 ? '⚠️ Sooner than expected!' : '✅ Comfortable runway'}</div>
      <div style="font-size:0.82rem; color:var(--text-dim)">
        Density: <strong style="color:var(--text)">${result.density_score}/100</strong> &nbsp;|&nbsp;
        Recession: <strong style="color:var(--text)">${result.recession_score}/10</strong>
      </div>
    </div>
  `;
}

async function openCompare(currentResult) {
  showPage('pageCompare');
  const comparePanels = document.getElementById('comparePanels');

  if (state.compareResult) {
    renderCompare(currentResult, state.compareResult);
    return;
  }

  comparePanels.innerHTML = `
    <div class="compare-panel" style="text-align:center;">
      <div style="font-size:1rem; color:var(--text-muted); margin-bottom:20px;">
        Upload a second photo set to compare
      </div>
      <input type="file" id="compareFileInput" accept="image/*" multiple style="display:none" />
      <button class="btn btn-primary" id="compareBrowseBtn" style="margin:0 auto;">
        📸 Upload Second Photo Set
      </button>
    </div>
    <div class="compare-panel" style="display:flex; align-items:center; justify-content:center; opacity:0.4;">
      Result B will appear here
    </div>
  `;

  document.getElementById('compareBrowseBtn')?.addEventListener('click', () => {
    document.getElementById('compareFileInput')?.click();
  });

  document.getElementById('compareFileInput')?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    comparePanels.innerHTML = `
      <div class="compare-panel" style="text-align:center; grid-column:1/-1;">
        <div style="font-size:1rem; color:var(--text-muted)">🔍 Analysing second set...</div>
      </div>`;

    try {
      const fd = new FormData();
      files.slice(0, 3).forEach(f => fd.append('files', f));
      const upRes = await fetch('/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: upData.session_id })
      });
      const data = await res.json();
      state.compareResult = data.result;
      renderCompare(currentResult, data.result);
    } catch {
      showToast('Compare upload failed', 'error');
      comparePanels.innerHTML = '<div class="compare-panel" style="grid-column:1/-1; text-align:center; color:var(--rose)">Upload failed — try again.</div>';
    }
  });
}
