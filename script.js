/**
 * ==========================================================================
 * ROMANTIC BIRTHDAY SURPRISE - JAVASCRIPT ENGINE
 * Pure Vanilla JavaScript - No dependencies, 100% GitHub Pages Ready
 * ==========================================================================
 */

/* ==========================================================================
   EASY CONFIGURATION - EDIT YOUR CONTENT HERE
   ========================================================================== */
const CONFIG = {
  // Personal Names
  girlfriendName: "Puja",
  fullName: "Puja Sutra Dhar",
  nickname: "Birthday Girl",
  myName: "Arnob",

  // Audio settings
  musicFile: "birthday-song.mp3", // Path to optional mp3 file in root

  // Photo paths
  photos: {
    chapter1: "photo1.jpeg",
    chapter2: "photo2.jpeg",
    chapter3: "photo3.jpeg",
    chapter4: "photo4.jpeg"
  },

  // Secret Easter Egg
  easterEggClicks: 7,
  easterEggMessage: "Okay, you found the secret. 😌\nI love you more than this website can possibly explain. ❤️"
};

/* ==========================================================================
   GLOBAL STATE & DOM REFERENCES
   ========================================================================== */
let audioContext = null;
let isAudioPlaying = false;
let customAudioEl = null;
let musicBoxInterval = null;
let heartsCaught = 0;
const totalHeartsToCatch = 5;
let activeGameHearts = [];
let gameAnimationFrame = null;
let isGameWon = false;
let secretClickCount = 0;

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initParticleBackground();
  initSecretEntry();
  initScrollAnimations();
  initMiniGame();
  initLoveEnvelope();
  initCelebrationModal();
  initEasterEgg();
  initAudioPlayer();
  initPhotoManager();
});

/* ==========================================================================
   1. PARTICLES & FLOATING STARS BACKGROUND
   ========================================================================== */
function initParticleBackground() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particle instances with Frosted Glass glowing palette
  const particles = [];
  const particleCount = window.innerWidth < 768 ? 40 : 75;
  const glassColors = ["#fbcfe8", "#f472b6", "#e9d5ff", "#ffffff", "#fde047", "#c084fc"];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 0.6 + 0.2,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      isHeart: Math.random() > 0.65,
      color: glassColors[Math.floor(Math.random() * glassColors.length)]
    });
  }

  function drawHeart(x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.scale(size / 10, size / 10);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-5, -5, -10, 2, 0, 10);
    ctx.bezierCurveTo(10, 2, 5, -5, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.y -= p.speedY;
      p.x += p.speedX;

      // Wrap around screen
      if (p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      if (p.isHeart) {
        drawHeart(p.x, p.y, p.size * 2.2, p.color, p.opacity);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. SCREEN 1: SECRET ENTRY
   ========================================================================== */
function initSecretEntry() {
  const secretEntry = document.getElementById("secret-entry");
  const openSurpriseBtn = document.getElementById("open-surprise-btn");

  if (!secretEntry || !openSurpriseBtn) return;

  openSurpriseBtn.addEventListener("click", (e) => {
    // Create button heart burst
    createHeartBurst(e.clientX, e.clientY, 35);
    playChimeSound();

    // Start background music or melody on first interaction
    startAudio();

    // Fade out overlay
    secretEntry.classList.add("hidden-entry");

    setTimeout(() => {
      secretEntry.style.display = "none";
      // Smooth scroll to hero
      const hero = document.getElementById("hero-section");
      if (hero) hero.scrollIntoView({ behavior: "smooth" });
    }, 800);
  });
}

/* ==========================================================================
   3. SCREEN 3: SCROLL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
  const chapterCards = document.querySelectorAll(".chapter-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.15 }
  );

  chapterCards.forEach((card) => observer.observe(card));
}

/* ==========================================================================
   4. SCREEN 4: PLAYFUL MINI GAME ("CATCH THE HEARTS")
   ========================================================================== */
function initMiniGame() {
  const arena = document.getElementById("game-arena");
  const counterEl = document.getElementById("game-counter");
  const successScreen = document.getElementById("game-success-screen");
  const openLetterFromGameBtn = document.getElementById("open-letter-from-game-btn");

  if (!arena || !counterEl) return;

  const heartIcons = ["❤️", "💖", "🌸", "✨", "💕", "💘"];

  function spawnGameHeart() {
    if (isGameWon || activeGameHearts.length >= 6) return;

    const heart = document.createElement("div");
    heart.className = "floating-target-heart";
    heart.innerText = heartIcons[Math.floor(Math.random() * heartIcons.length)];

    const rect = arena.getBoundingClientRect();
    const size = 44;
    let x = Math.random() * (rect.width - size - 20) + 10;
    let y = Math.random() * (rect.height - size - 20) + 10;
    let vx = (Math.random() - 0.5) * 2.5;
    let vy = (Math.random() - 0.5) * 2.5;

    // Ensure movement isn't static
    if (Math.abs(vx) < 0.6) vx = vx < 0 ? -1 : 1;
    if (Math.abs(vy) < 0.6) vy = vy < 0 ? -1 : 1;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    const heartObj = { el: heart, x, y, vx, vy, size };

    // Catch handler (works for both touch & click)
    const catchHeart = (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (heart.dataset.popped) return;
      heart.dataset.popped = "true";

      const heartRect = heart.getBoundingClientRect();
      createHeartBurst(heartRect.left + heartRect.width / 2, heartRect.top + heartRect.height / 2, 16);
      playPopSound();

      // Remove from active list
      const idx = activeGameHearts.indexOf(heartObj);
      if (idx !== -1) activeGameHearts.splice(idx, 1);
      heart.remove();

      heartsCaught++;
      counterEl.innerText = `❤️ ${heartsCaught} / ${totalHeartsToCatch}`;

      if (heartsCaught >= totalHeartsToCatch) {
        winMiniGame();
      }
    };

    heart.addEventListener("mousedown", catchHeart);
    heart.addEventListener("touchstart", catchHeart, { passive: false });

    arena.appendChild(heart);
    activeGameHearts.push(heartObj);
  }

  function updateGamePhysics() {
    if (isGameWon) return;

    const rect = arena.getBoundingClientRect();

    for (let h of activeGameHearts) {
      h.x += h.vx;
      h.y += h.vy;

      // Bounce on arena boundaries
      if (h.x <= 5) {
        h.x = 5;
        h.vx *= -1;
      } else if (h.x >= rect.width - h.size - 5) {
        h.x = rect.width - h.size - 5;
        h.vx *= -1;
      }

      if (h.y <= 5) {
        h.y = 5;
        h.vy *= -1;
      } else if (h.y >= rect.height - h.size - 5) {
        h.y = rect.height - h.size - 5;
        h.vy *= -1;
      }

      h.el.style.left = `${h.x}px`;
      h.el.style.top = `${h.y}px`;
    }

    gameAnimationFrame = requestAnimationFrame(updateGamePhysics);
  }

  function winMiniGame() {
    isGameWon = true;
    cancelAnimationFrame(gameAnimationFrame);

    // Clear remaining hearts
    activeGameHearts.forEach((h) => h.el.remove());
    activeGameHearts = [];

    // Trigger celebration confetti
    triggerConfetti(60);
    playVictoryFanfare();

    if (successScreen) {
      successScreen.classList.add("active");
    }
  }

  // Spawn loop
  setInterval(() => {
    if (!isGameWon && activeGameHearts.length < 5) {
      spawnGameHeart();
    }
  }, 900);

  // Initial spawn
  for (let i = 0; i < 4; i++) {
    spawnGameHeart();
  }
  updateGamePhysics();

  if (openLetterFromGameBtn) {
    openLetterFromGameBtn.addEventListener("click", () => {
      const letterSection = document.getElementById("love-letter-section");
      if (letterSection) {
        letterSection.scrollIntoView({ behavior: "smooth" });
        // Automatically trigger envelope open after scrolling
        setTimeout(() => {
          const envelope = document.getElementById("envelope");
          if (envelope && !envelope.classList.contains("open")) {
            envelope.click();
          }
        }, 600);
      }
    });
  }
}

/* ==========================================================================
   5. SCREEN 5: THE LOVE LETTER (3D INTERACTIVE ENVELOPE)
   ========================================================================== */
function initLoveEnvelope() {
  const envelope = document.getElementById("envelope");
  const expandedLetterCard = document.getElementById("expanded-letter-card");

  if (!envelope || !expandedLetterCard) return;

  envelope.addEventListener("click", () => {
    if (!envelope.classList.contains("open")) {
      envelope.classList.add("open");
      playChimeSound();
      createHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 25);

      // Reveal full letter card smoothly
      setTimeout(() => {
        expandedLetterCard.classList.add("visible");
        expandedLetterCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 700);
    }
  });
}

/* ==========================================================================
   6. SCREEN 6: ONE LAST SURPRISE & GRAND CELEBRATION
   ========================================================================== */
function initCelebrationModal() {
  const triggerBtn = document.getElementById("open-celebration-btn");
  const modal = document.getElementById("celebration-modal");
  const closeBtn = document.getElementById("close-celebration-btn");
  const celebrateAgainBtn = document.getElementById("celebrate-again-btn");
  const candleFlame = document.getElementById("candle-flame");
  const cakeContainer = document.getElementById("cake-container");
  const cakeInstruction = document.getElementById("cake-instruction");
  const shareLoveBtn = document.getElementById("share-love-btn");

  if (!triggerBtn || !modal) return;

  function openCelebration() {
    modal.classList.add("active");
    triggerConfetti(100);
    spawnBalloons(15);
    playVictoryFanfare();
  }

  function closeCelebration() {
    modal.classList.remove("active");
  }

  triggerBtn.addEventListener("click", openCelebration);
  if (closeBtn) closeBtn.addEventListener("click", closeCelebration);

  if (celebrateAgainBtn) {
    celebrateAgainBtn.addEventListener("click", () => {
      triggerConfetti(80);
      spawnBalloons(8);
      playPopSound();
    });
  }

  // Interactive Candle Blow Out
  if (cakeContainer && candleFlame) {
    cakeContainer.addEventListener("click", () => {
      if (!candleFlame.classList.contains("blown-out")) {
        candleFlame.classList.add("blown-out");
        playChimeSound();
        triggerConfetti(50);
        if (cakeInstruction) {
          cakeInstruction.innerText = "✨ Wish made! Happy Birthday, gorgeous! ❤️";
          cakeInstruction.style.color = "#fde047";
          cakeInstruction.style.fontWeight = "700";
        }
      } else {
        // Relight candle on tap
        candleFlame.classList.remove("blown-out");
        if (cakeInstruction) {
          cakeInstruction.innerText = "🎂 Tap the cake to blow out the candle & make a wish!";
          cakeInstruction.style.color = "#fbcfe8";
          cakeInstruction.style.fontWeight = "normal";
        }
      }
    });
  }

  // Share / Copy Love Note
  if (shareLoveBtn) {
    shareLoveBtn.addEventListener("click", () => {
      const textToCopy = `Happy Birthday ${CONFIG.girlfriendName}! ❤️ Love, ${CONFIG.myName}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          shareLoveBtn.innerText = "💌 Copied Love Note!";
          setTimeout(() => {
            shareLoveBtn.innerText = "💌 Send a Love Note";
          }, 2500);
        });
      }
    });
  }
}

function spawnBalloons(count) {
  const container = document.getElementById("balloon-layer");
  if (!container) return;

  const colors = ["#f472b6", "#fb7185", "#c084fc", "#fbbf24", "#fda4af", "#e879f9"];

  for (let i = 0; i < count; i++) {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.left = `${Math.random() * 90 + 5}%`;
    balloon.style.animationDuration = `${Math.random() * 4 + 6}s`;
    balloon.style.animationDelay = `${Math.random() * 2}s`;
    container.appendChild(balloon);

    setTimeout(() => {
      balloon.remove();
    }, 10000);
  }
}

/* ==========================================================================
   7. SECRET EASTER EGG (7 CLICKS ON HEART BADGE)
   ========================================================================== */
function initEasterEgg() {
  const trigger = document.getElementById("secret-easter-egg-btn");
  const modal = document.getElementById("easter-egg-modal");
  const closeBtn = document.getElementById("close-easter-egg-btn");

  if (!trigger || !modal) return;

  trigger.addEventListener("click", (e) => {
    secretClickCount++;
    createHeartBurst(e.clientX, e.clientY, 8);
    playPopSound();

    if (secretClickCount >= CONFIG.easterEggClicks) {
      secretClickCount = 0;
      modal.classList.add("active");
      triggerConfetti(60);
      playChimeSound();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }
}

/* ==========================================================================
   8. AUDIO SYSTEM & SYNTHESIZED MUSIC-BOX FALLBACK
   ========================================================================== */
function initAudioPlayer() {
  const toggleBtn = document.getElementById("music-toggle");
  if (!toggleBtn) return;

  // Try loading real MP3
  customAudioEl = new Audio();
  customAudioEl.src = CONFIG.musicFile;
  customAudioEl.loop = true;

  toggleBtn.addEventListener("click", () => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      startAudio();
    }
  });
}

function startAudio() {
  const toggleBtn = document.getElementById("music-toggle");
  if (isAudioPlaying) return;

  if (customAudioEl && customAudioEl.src) {
    customAudioEl
      .play()
      .then(() => {
        isAudioPlaying = true;
        if (toggleBtn) toggleBtn.classList.add("playing");
      })
      .catch(() => {
        // Fallback to Web Audio synthesized melody
        startWebAudioMusicBox();
        isAudioPlaying = true;
        if (toggleBtn) toggleBtn.classList.add("playing");
      });
  } else {
    startWebAudioMusicBox();
    isAudioPlaying = true;
    if (toggleBtn) toggleBtn.classList.add("playing");
  }
}

function pauseAudio() {
  const toggleBtn = document.getElementById("music-toggle");
  isAudioPlaying = false;
  if (toggleBtn) toggleBtn.classList.remove("playing");

  if (customAudioEl) {
    customAudioEl.pause();
  }
  if (musicBoxInterval) {
    clearInterval(musicBoxInterval);
    musicBoxInterval = null;
  }
}

// Gentle Web Audio API Synthesizer (Lofi Music Box)
function startWebAudioMusicBox() {
  if (musicBoxInterval) return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();

    // Soft Romantic Happy Birthday / Lullaby Arpeggio Notes in Hz
    const notes = [
      261.63, 261.63, 293.66, 261.63, 349.23, 329.63, // Happy birthday to you
      261.63, 261.63, 293.66, 261.63, 392.00, 349.23, // Happy birthday to you
      261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66, // Happy birthday dear Puja
      466.16, 466.16, 440.00, 349.23, 392.00, 349.23  // Happy birthday to you
    ];

    let noteIndex = 0;
    musicBoxInterval = setInterval(() => {
      if (!isAudioPlaying) return;
      playMusicBoxNote(notes[noteIndex]);
      noteIndex = (noteIndex + 1) % notes.length;
    }, 450);
  } catch (e) {
    // Audio context not supported
  }
}

function playMusicBoxNote(freq) {
  if (!audioContext) return;
  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 1.2);
  } catch (e) {}
}

function playPopSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(450, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
  } catch (e) {}
}

function playChimeSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();

    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      setTimeout(() => {
        playMusicBoxNote(f);
      }, idx * 100);
    });
  } catch (e) {}
}

function playVictoryFanfare() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();

    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, idx) => {
      setTimeout(() => {
        playMusicBoxNote(f);
      }, idx * 120);
    });
  } catch (e) {}
}

/* ==========================================================================
   9. VISUAL FX: CONFETTI & HEART BURST CANNONS
   ========================================================================== */
function createHeartBurst(x, y, count = 20) {
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.innerText = ["❤️", "💖", "✨", "🌸", "💕"][Math.floor(Math.random() * 5)];
    heart.style.position = "fixed";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.fontSize = `${Math.random() * 16 + 14}px`;
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "99999";
    heart.style.transition = "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease";

    document.body.appendChild(heart);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 140 + 40;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - 30;

    requestAnimationFrame(() => {
      heart.style.transform = `translate(${destX}px, ${destY}px) scale(${Math.random() * 0.5 + 0.8}) rotate(${Math.random() * 90 - 45}deg)`;
      heart.style.opacity = "0";
    });

    setTimeout(() => heart.remove(), 850);
  }
}

function triggerConfetti(count = 50) {
  const colors = ["#f472b6", "#fb7185", "#fbbf24", "#c084fc", "#38bdf8", "#4ade80"];

  for (let i = 0; i < count; i++) {
    const conf = document.createElement("div");
    conf.style.position = "fixed";
    conf.style.width = `${Math.random() * 8 + 6}px`;
    conf.style.height = `${Math.random() * 12 + 8}px`;
    conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    conf.style.left = `${Math.random() * 100}vw`;
    conf.style.top = "-20px";
    conf.style.borderRadius = "2px";
    conf.style.pointerEvents = "none";
    conf.style.zIndex = "99999";
    conf.style.transition = `transform ${Math.random() * 2 + 2}s cubic-bezier(0.25, 1, 0.5, 1), opacity 2.5s ease`;

    document.body.appendChild(conf);

    const destY = window.innerHeight + 50;
    const destX = (Math.random() - 0.5) * 200;
    const rot = Math.random() * 720;

    requestAnimationFrame(() => {
      conf.style.transform = `translate(${destX}px, ${destY}px) rotate(${rot}deg)`;
      conf.style.opacity = "0.2";
    });

    setTimeout(() => conf.remove(), 3500);
  }
}

/* ==========================================================================
   10. PHOTO MANAGER (DIRECT JPEG DISPLAY)
   ========================================================================== */
function initPhotoManager() {
  const PHOTOS = {
    1: "photo1.jpeg",
    2: "photo2.jpeg",
    3: "photo3.jpeg",
    4: "photo4.jpeg"
  };

  for (let i = 1; i <= 4; i++) {
    const imgEl = document.getElementById(`chapter-img-${i}`);
    const polaroidFrame = document.querySelector(`.polaroid-frame[data-chapter="${i}"]`);
    
    if (imgEl) {
      imgEl.src = PHOTOS[i];
    }

    if (polaroidFrame) {
      polaroidFrame.style.cursor = "pointer";
      polaroidFrame.addEventListener("click", (e) => {
        createHeartBurst(e.clientX, e.clientY, 15);
        playPopSound();
      });
    }
  }
}
