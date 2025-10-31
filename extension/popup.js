const phrasesEl = document.getElementById('phrases');
const labelEl = document.getElementById('label');
const scoreEl = document.getElementById('score');

function renderPhrases(list) {
  phrasesEl.innerHTML = '';
  list.forEach(t => {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = t;
    phrasesEl.appendChild(span);
  });
}

// default demo state
renderPhrases(['verify account', 'urgent', 'click here']);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'scanResult') {
    labelEl.textContent = msg.label;
    scoreEl.textContent = `${Math.round(msg.confidence * 100)}%`;
    renderPhrases(msg.highlights || []);
  }
});

document.getElementById('rescan').addEventListener('click', async () => {
  // Ask the active tab (content_script) to send a simulated scan
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: 'simulateScan' });
});

document.getElementById('report').addEventListener('click', () => {
  window.close(); // demo behavior
});