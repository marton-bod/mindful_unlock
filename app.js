const quotes = [
    "What is something better you could do now with your precious time?",
    "Are you aware why you're checking your phone now?",
    "Is it truly important to check things again now?",
    "Could you step outside and take a breath instead?",
    "What are you avoiding by reaching for your phone?",
    "Will this bring you closer to your goals today?",
    "Is this the most meaningful thing you could do right now?",
    "What would happen if you waited five more minutes?",
    "Are you in control, or is your phone controlling you?",
    "What emotion are you feeling right now?",
    "Could you be present in this moment instead?",
    "What if you chose connection over consumption?"
];

let countdown = 0;
let countdownInterval = null;

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
    displayRandomQuote();
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
    
    if (seconds < 60) return `${seconds} sec`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
}

// Display random quote
function displayRandomQuote() {
    const lastQuote = localStorage.getItem('lastQuote');
    let quote;
    
    do {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (quote === lastQuote && quotes.length > 1);
    
    localStorage.setItem('lastQuote', quote);
    quoteEl.textContent = `"${quote}"`;
}

// Start countdown
function startCountdown() {
    countdown = 15;
    unlockBtn.classList.add('hidden');
    cancelBtn.classList.remove('hidden');
    countdownDisplay.classList.remove('hidden');
    countdownDisplay.textContent = `Unlocking in ${countdown}...`;
    
    countdownInterval = setInterval(() => {
        countdown--;
        
        if (countdown > 0) {
            countdownDisplay.textContent = `Unlocking in ${countdown}...`;
        } else {
            clearInterval(countdownInterval);
            finishUnlock();
        }
    }, 1000);
}

// Cancel countdown
function cancelCountdown() {
    clearInterval(countdownInterval);
    countdown = 0;
    unlockBtn.classList.remove('hidden');
    cancelBtn.classList.add('hidden');
    countdownDisplay.classList.add('hidden');
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
    cancelBtn.classList.add('hidden');
    countdownDisplay.classList.add('hidden');
    
    // Show completion message briefly
    countdownDisplay.textContent = '✓ Unlocked';
    countdownDisplay.classList.remove('hidden');
    
    setTimeout(() => {
        countdownDisplay.classList.add('hidden');
    }, 2000);
}

// Event listeners
unlockBtn.addEventListener('click', startCountdown);
cancelBtn.addEventListener('click', cancelCountdown);

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