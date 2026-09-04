// analysis.js — Animated analysis sequence + API call
const MESSAGES = [
  '🔭 Searching for hairline...',
  '💪 Counting brave follicles...',
  '🧬 Detecting generational baldness...',
  '👴 Contacting your ancestors...',
  '📊 Compiling the damning evidence...'
];

export async function runAnalysis(sessionId, demoMode) {
  const progressBar = document.getElementById('progressBar');
  const msgEls = document.querySelectorAll('.analysis-msg');

  // Reset
  msgEls.forEach(m => m.classList.remove('active'));
  if (progressBar) progressBar.style.width = '0%';

  // Animate messages in sequence while API call runs
  let msgIdx = 0;
  function nextMessage() {
    msgEls.forEach(m => m.classList.remove('active'));
    if (msgIdx < msgEls.length) {
      msgEls[msgIdx].classList.add('active');
      msgIdx++;
    }
    if (progressBar) {
      const pct = Math.min(95, (msgIdx / MESSAGES.length) * 100);
      progressBar.style.width = pct + '%';
    }
  }

  nextMessage();
  const msgInterval = setInterval(nextMessage, 1500);

  try {
    // Minimum animation time of 7s for drama
    const [result] = await Promise.all([
      callAnalyzeAPI(sessionId, demoMode),
      delay(7500)
    ]);

    clearInterval(msgInterval);
    if (progressBar) progressBar.style.width = '100%';
    await delay(400);
    return result;
  } catch (err) {
    clearInterval(msgInterval);
    throw err;
  }
}

async function callAnalyzeAPI(sessionId, demoMode) {
  const body = demoMode
    ? { demo_mode: true }
    : { session_id: sessionId };

  const res = await fetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Analysis failed');
  }
  const data = await res.json();
  return data.result;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
