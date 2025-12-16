const quotes = [
  "What is something better you could do now?",
  "Are you aware why you're checking your phone?",
  "Is it truly important to check things again?",
  "Could you step outside and take a breath instead?",
  "What are you avoiding by reaching for your phone?",
  "Will this bring you closer to your goals today?",
  "Is this the most meaningful thing you could do right now?",
  "What would happen if you waited five more minutes?",
  "What emotion are you feeling right now?",
  "Could you be present in this moment instead?",
  "What if you chose presence over mindless consumption?"
];

// --- interval / timer handles ---
let quoteInterval = null;
let glowInterval = null;
let countdownInterval = null;
let countdownTarget = 0;

// --- controlled quote rotation (start/stop) ---
const QUOTE_ROTATE_MS = 10000;

// DOM elements (guarded)
const unlockBtn = document.getElementById('unlock-btn');
const cancelBtn = document.getElementById('cancel-btn');
const countdownDisplay = document.getElementById('countdown-display');
const unlockCountEl = document.getElementById('unlock-count');
const lastUnlockText = document.getElementById('last-unlock-text');
const quoteEl = document.getElementById('quote');

function init() {
  checkAndResetDaily();
  updateDisplay();
  // show an initial quote immediately (no pop on first load)
  displayRandomQuote(true);

  // start background behaviors only if visible
  if (document.visibilityState === 'visible') {
    startQuoteRotation(true); // immediate + periodic
    startGlowCycle();
  }

  // set up visibility handling
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // cleanup on unload
  window.addEventListener('beforeunload', cleanupAll);
}

function checkAndResetDaily() {
  const today = new Date().toDateString();
  const lastReset = localStorage.getItem('lastResetDate');

  if (lastReset !== today) {
    localStorage.setItem('unlockCount', '0');
    localStorage.setItem('lastResetDate', today);
  }
}

function updateDisplay() {
  const count = parseInt(localStorage.getItem('unlockCount') || '0');
  const lastUnlockStr = localStorage.getItem('lastUnlock');

  unlockCountEl.textContent = count;

  if (lastUnlockStr) {
    const lastUnlock = new Date(lastUnlockStr);
    const timeAgo = getTimeAgo(lastUnlock);
    lastUnlockText.textContent = `Last opened: ${timeAgo} ago`;
  } else {
    lastUnlockText.textContent = 'No unlocks yet today';
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}

// --- Quote rotation & animations ---
function displayRandomQuote(isInitial = false) {
  if (!quoteEl) return;
  const lastQuote = localStorage.getItem('lastQuote');
  let quote;
  do {
    quote = quotes[Math.floor(Math.random() * quotes.length)];
  } while (quote === lastQuote && quotes.length > 1);

  localStorage.setItem('lastQuote', quote);

  const existing = quoteEl.querySelector('.quote-text');

  const newSpan = document.createElement('span');
  newSpan.className = 'quote-text';
  newSpan.textContent = `"${quote}"`;
  newSpan.classList.add('float'); // idle float

  if (!existing || isInitial) {
    quoteEl.innerHTML = '';
    quoteEl.appendChild(newSpan);
    if (!isInitial) forcePop(newSpan);
    return;
  }

  // crossfade: fade out existing, then replace
  existing.classList.add('fading');

  setTimeout(() => {
    // remove old and insert new
    if (quoteEl.contains(existing)) quoteEl.removeChild(existing);
    quoteEl.appendChild(newSpan);
    forcePop(newSpan);
  }, 380); // matches CSS transition (360ms + buffer)
}

function forcePop(span) {
  // reflow then add pop for animation
  void span.offsetWidth;
  span.classList.add('pop');
  setTimeout(() => span.classList.remove('pop'), 500);
}

function startQuoteRotation(immediate = true) {
  if (!quoteEl) return;
  if (quoteInterval !== null) {
    // already running
    return;
  }
  console.log('startQuoteRotation');
  if (immediate) displayRandomQuote(false);
  quoteInterval = setInterval(() => {
    displayRandomQuote();
  }, QUOTE_ROTATE_MS);
}

function stopQuoteRotation() {
  if (quoteInterval !== null) {
    console.log('stopQuoteRotation');
    clearInterval(quoteInterval);
    quoteInterval = null;
  }
}

// --- glow cycle (soft box-shadow) ---
function startGlowCycle() {
  if (!quoteEl) return;
  if (glowInterval !== null) return;
  // respect reduced motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) return;

  console.log('startGlowCycle');
  // first delayed glow to draw attention shortly after load
  setTimeout(() => {
    quoteEl.classList.add('glow');
    setTimeout(() => quoteEl.classList.remove('glow'), 900);
  }, 1200);

  glowInterval = setInterval(() => {
    quoteEl.classList.add('glow');
    setTimeout(() => quoteEl.classList.remove('glow'), 900);
  }, 12000);
}

function stopGlowCycle() {
  if (glowInterval !== null) {
    console.log('stopGlowCycle');
    clearInterval(glowInterval);
    glowInterval = null;
    quoteEl && quoteEl.classList.remove('glow');
  }
}

// --- countdown (robust: use target time) ---
function startCountdown() {
  const DURATION_SECONDS = 20;
  // clear any prior count
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  countdownTarget = Date.now() + DURATION_SECONDS * 1000;

  // UI toggles
  unlockBtn.classList.add('hidden');
  unlockBtn.setAttribute('aria-hidden', 'true');

  cancelBtn.classList.remove('hidden');
  cancelBtn.removeAttribute('aria-hidden');

  countdownDisplay.classList.remove('hidden');
  countdownDisplay.removeAttribute('aria-hidden');

  // add breathing to quote only while counting
  quoteEl && quoteEl.classList.add('breathing');

  // fast-enough tick for accuracy, not too wasteful
  countdownInterval = setInterval(() => updateCountdownDisplay(), 250);

  // immediate update
  updateCountdownDisplay();
}

function updateCountdownDisplay() {
  const remainingMs = countdownTarget - Date.now();
  const remainingSec = Math.ceil(remainingMs / 1000);

  if (remainingSec > 0) {
    countdownDisplay.textContent = `${remainingSec}...`;
  } else {
    // finish
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    finishUnlock();
  }
}

function cancelCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  countdownTarget = 0;

  unlockBtn.classList.remove('hidden');
  unlockBtn.removeAttribute('aria-hidden');

  cancelBtn.classList.add('hidden');
  cancelBtn.setAttribute('aria-hidden', 'true');

  countdownDisplay.classList.add('hidden');
  countdownDisplay.setAttribute('aria-hidden', 'true');

  // remove breathing
  quoteEl && quoteEl.classList.remove('breathing');
}

// finishUnlock updates counts, shows a brief message, and resets UI
function finishUnlock() {
  const newCount = parseInt(localStorage.getItem('unlockCount') || '0') + 1;
  const now = new Date();

  localStorage.setItem('unlockCount', newCount.toString());
  localStorage.setItem('lastUnlock', now.toISOString());

  updateDisplay();

  // swap to a new quote on finish
  displayRandomQuote();

  // reset UI
  unlockBtn.classList.remove('hidden');
  unlockBtn.removeAttribute('aria-hidden');

  cancelBtn.classList.add('hidden');
  cancelBtn.setAttribute('aria-hidden', 'true');

  // remove breathing
  quoteEl && quoteEl.classList.remove('breathing');

  // show completion
  countdownDisplay.textContent = '✓ Unlocked';
  countdownDisplay.classList.remove('hidden');
  countdownDisplay.removeAttribute('aria-hidden');

  setTimeout(() => {
    countdownDisplay.classList.add('hidden');
    countdownDisplay.setAttribute('aria-hidden', 'true');
  }, 2000);
}

// --- visibility handling ---
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    console.log('visibility: visible');
    updateDisplay();
    startQuoteRotation(true);
    startGlowCycle();
  } else {
    console.log('visibility: hidden');
    cleanupAll()
  }
}

// --- cleanup helpers ---
function cleanupAll() {
  if (quoteInterval) { clearInterval(quoteInterval); quoteInterval = null; }
  if (glowInterval) { clearInterval(glowInterval); glowInterval = null; }
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
  // remove breathing/glow classes defensively
  quoteEl && quoteEl.classList.remove('breathing', 'glow');
}

// --- event listeners ---
unlockBtn && unlockBtn.addEventListener('click', startCountdown);
cancelBtn && cancelBtn.addEventListener('click', cancelCountdown);

// update last opened info when the PWA becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') 
    updateDisplay();
});

// initialize
init();
