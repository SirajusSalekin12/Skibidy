const head = document.getElementById('head');
const meter = document.getElementById('meter');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const scoreboard = document.getElementById('scoreboard');
const finalTimeDisplay = document.getElementById('final-time');
const bestTimeDisplay = document.getElementById('best-time');
const bgSound = document.getElementById('bg-sound');
const splashSound = document.getElementById('splash-sound'); // splash sound
const flushSound = document.getElementById('flush-sound');   // flush sound
const screamSound = document.getElementById('scream-sound'); // defeat scream

const headDefaultSrc = 'head.png';           // normal head
const headDefeatedSrc = 'head-defeated.png'; // defeated head

let meterFill = 0;
let dragging = false;
let startY = 0;
let headY = 50;
let gameRunning = false;
let startTime = null;
let timer;
let bestTime = localStorage.getItem('bestTime') ? parseFloat(localStorage.getItem('bestTime')) : null;

let lastHeadY = headY;

// -------- DRAG CONTROL --------
document.addEventListener('mousedown', (e) => {
  if (!gameRunning) return;
  dragging = true;
  startY = e.clientY;
});

document.addEventListener('mouseup', () => {
  dragging = false;
});

document.addEventListener('mousemove', (e) => {
  if (!dragging || !gameRunning) return;

  const deltaY = e.clientY - startY;
  const move = Math.min(Math.max(deltaY, 0), 200); // clamp
  const percent = move / 1000; // 0 to 1

  headY = 50 + percent * 300; 
  head.style.top = `${headY}%`;

  // Play splash sound when dunk passes threshold
  if (headY > 75 && lastHeadY <= 75) {
    splashSound.currentTime = 0;
    splashSound.play();
  }

  lastHeadY = headY;

  // Increase meter
  meterFill = Math.min(100, meterFill + percent * 2);
});

// -------- MAIN LOOP --------
function updateMeter() {
  if (gameRunning) {
    if (!dragging) {
      headY = Math.max(50, headY - 0.5);
      head.style.top = `${headY}%`;
      meterFill = Math.max(0, meterFill - 0.2);
    }

    meter.style.setProperty('--fill', meterFill + '%');

    if (meterFill >= 100) {
      endGame();
    }
  }

  requestAnimationFrame(updateMeter);
}

// -------- START GAME --------
function startGame() {
  bgSound.currentTime = 0;
  bgSound.loop = true;
  bgSound.play();

  gameRunning = true;
  meterFill = 0;
  headY = 50;
  startTime = Date.now();
  scoreboard.classList.add('hidden');
  startBtn.classList.add('hidden');

  // Restore default head image
  head.src = headDefaultSrc;

  timerDisplay.textContent = 'Time: 0.00s';
  timer = setInterval(() => {
    const t = ((Date.now() - startTime) / 1000).toFixed(2);
    timerDisplay.textContent = `Time: ${t}s`;
  }, 100);
}

// -------- END GAME --------
function endGame() {
  gameRunning = false;
  clearInterval(timer);

  const finalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  finalTimeDisplay.textContent = `Your Time: ${finalTime}s`;

  if (!bestTime || finalTime < bestTime) {
    bestTime = finalTime;
    localStorage.setItem('bestTime', bestTime);
  }
  bestTimeDisplay.textContent = `Best Time: ${bestTime}s`;

  scoreboard.classList.remove('hidden');
  startBtn.classList.remove('hidden');

  // Reset meter
  meterFill = 0;
  meter.style.setProperty('--fill', '0%');

  // Swap head to defeated image
  head.src = headDefeatedSrc;

  // Stop background music
  if (bgSound) {
    bgSound.pause();
    bgSound.currentTime = 0;
  }

  // Play victory sounds
  if (flushSound) {
    flushSound.currentTime = 0;
    flushSound.play();
  }

  if (screamSound) {
    screamSound.currentTime = 0;
    screamSound.play();
  }
}

startBtn.addEventListener('click', startGame);
updateMeter();
