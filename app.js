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

let countdown = 0;
let countdownInterval = null;
let glowInterval = null;

// DOM elements
const unlockBtn = document.getElementById('unlock-btn');
const cancelBtn = document.getElementById('cancel-btn');
const countdownDisplay = document.getElementById('countdown-display');
const unlockCountEl = document.getElementById('unlock-count');
const lastUnlockText = document.getElementById('last-unlock-text');
const quoteEl = document.getElementById('quote');

// Initialize on load
function init() {
  checkAndResetDaily();
  updateDisplay();
  displayRandomQuote(true);
  startGlowCycle(); // start periodic glow
}

// Check if we need to reset daily counter
function checkAndResetDaily() {
  const today = new Date().toDateString();
  const lastReset = localStorage.getItem('lastResetDate');

  if (lastReset !== today) {
    localStorage.setItem('unlockCount', '0');
    localStorage.setItem('lastResetDate', today);
  }
}

// Update display with current data
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

// Calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) 
    return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) 
    return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) 
    return `${hours} hr`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}

// Display random quote with crossfade + pop
function displayRandomQuote(isInitial = false) {
  const lastQuote = localStorage.getItem('lastQuote');
  let quote;

  do {
    quote = quotes[Math.floor(Math.random() * quotes.length)];
  } while (quote === lastQuote && quotes.length > 1);

  localStorage.setItem('lastQuote', quote);

  // If there's already a span, fade it out first (for non-initial)
  const existing = quoteEl.querySelector('.quote-text');

  // Create new span ahead of time for better crossfade
  const newSpan = document.createElement('span');
  newSpan.className = 'quote-text';
  newSpan.textContent = `"${quote}"`;

  // Give the new span the float behavior
  newSpan.classList.add('float');

  if (!existing || isInitial) {
    // first load or no existing: just insert
    quoteEl.innerHTML = '';
    quoteEl.appendChild(newSpan);
    if (!isInitial) {
      // small pop for non-initial replacements
      forcePop(newSpan);
    }
    return;
  }

  // fade out existing, then swap
  existing.classList.add('fading');

  // after fade duration, swap content
  setTimeout(() => {
    // remove existing and add new span (initially transparent because of transition)
    quoteEl.removeChild(existing);
    quoteEl.appendChild(newSpan);

    // trigger pop
    forcePop(newSpan);
  }, 360); // match CSS transition duration
}

// helper to trigger pop animation safely
function forcePop(span) {
  // ensure reflow then add pop
  void span.offsetWidth;
  span.classList.add('pop');

  // remove pop after animation
  setTimeout(() => span.classList.remove('pop'), 450);
}

// Start periodic glow effect (soft) every ~12s
function startGlowCycle() {
  // do nothing for users who prefer reduced motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) return;

  // initial scheduled glow after a few seconds
  glowInterval = setInterval(() => {
    // briefly add glow class
    quoteEl.classList.add('glow');
    setTimeout(() => quoteEl.classList.remove('glow'), 900);
  }, 12000);

  // fire first glow after small delay to draw attention on entry
  setTimeout(() => {
    quoteEl.classList.add('glow');
    setTimeout(() => quoteEl.classList.remove('glow'), 900);
  }, 1600);
}

// Start countdown — robust, uses target time
function startCountdown() {
  const DURATION_SECONDS = 20;
  // clear any previous interval just in case
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  // compute target timestamp
  countdownTarget = Date.now() + DURATION_SECONDS * 1000;

  // UI: show/hide proper elements
  unlockBtn.classList.add('hidden');
  unlockBtn.setAttribute('aria-hidden', 'true');

  cancelBtn.classList.remove('hidden');
  cancelBtn.removeAttribute('aria-hidden');

  countdownDisplay.classList.remove('hidden');
  countdownDisplay.removeAttribute('aria-hidden');

  // initial render
  updateCountdownDisplay();

  // add breathing to quote while counting down
  quoteEl.classList.add('breathing');

  // run a fairly responsive interval; using 250ms keeps UI smooth and accurate
  countdownInterval = setInterval(() => {
    updateCountdownDisplay();
  }, 250);
}

// helper that computes remaining seconds and updates UI
function updateCountdownDisplay() {
  const remainingMs = countdownTarget - Date.now();
  const remainingSec = Math.ceil(remainingMs / 1000);

  if (remainingSec > 0) {
    countdownDisplay.textContent = `Unlocking in ${remainingSec}...`;
  } else {
    // stop interval and finish
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    // call finishUnlock to handle completion flow
    finishUnlock();
  }
}

// Cancel countdown
function cancelCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  // reset target
  countdownTarget = 0;

  // restore UI
  unlockBtn.classList.remove('hidden');
  unlockBtn.removeAttribute('aria-hidden');

  cancelBtn.classList.add('hidden');
  cancelBtn.setAttribute('aria-hidden', 'true');

  countdownDisplay.classList.add('hidden');
  countdownDisplay.setAttribute('aria-hidden', 'true');

  // remove breathing
  quoteEl.classList.remove('breathing');
}

// Finish unlock
function finishUnlock() {
  const newCount = parseInt(localStorage.getItem('unlockCount') || '0') + 1;
  const now = new Date();

  localStorage.setItem('unlockCount', newCount.toString());
  localStorage.setItem('lastUnlock', now.toISOString());

  updateDisplay();
  displayRandomQuote();

  // Reset UI
  unlockBtn.classList.remove('hidden');
  unlockBtn.removeAttribute('aria-hidden');

  cancelBtn.classList.add('hidden');
  cancelBtn.setAttribute('aria-hidden', 'true');

  // remove breathing when finished
  quoteEl.classList.remove('breathing');

  // Show completion message briefly
  countdownDisplay.textContent = '✓ Unlocked';
  countdownDisplay.classList.remove('hidden');
  countdownDisplay.removeAttribute('aria-hidden');

  setTimeout(() => {
    countdownDisplay.classList.add('hidden');
    countdownDisplay.setAttribute('aria-hidden', 'true');
  }, 2000);
}

// Event listeners
unlockBtn.addEventListener('click', startCountdown);
cancelBtn.addEventListener('click', cancelCountdown);

// when the PWA is foregrounded, update the last unlock variable
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateDisplay();
  }
});

// Clean up on unload
window.addEventListener('beforeunload', () => {
  if (glowInterval) clearInterval(glowInterval);
  if (countdownInterval) clearInterval(countdownInterval);
});

// Initialize app
init();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => console.log('SW registered'))
      .catch(err => console.log('SW registration failed'));
  });
}
