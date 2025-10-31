const player = document.getElementById("player");
const road = document.getElementById("road");
const startBtn = document.getElementById("startBtn");
const bgMusic = document.getElementById("bgMusic");
const crashSound = document.getElementById("crashSound");
const scoreDisplay = document.getElementById("score");
const speedDisplay = document.getElementById("speed");

let speed = 0;
let baseSpeed = 3;         // idle speed (~20 km/h)
let maxSpeed = 10;         // top speed (~60 km/h)
let accelRate = 0.02;      // acceleration rate
let decelRate = 0.01;      // normal deceleration
let brakeRate = 0.08;      // braking rate (strong deceleration)
let roadPosition = 0;
let keys = {};
let score = 0;
let gameRunning = false;
let enemies = [];
let spawnCounter = 0;

// 🎵 Sounds
const idleSound = new Audio("assets/engine_idle.mp3");
idleSound.loop = true;
idleSound.volume = 0.9;

const revSound = new Audio("assets/engine_rev.mp3");
revSound.loop = true;
revSound.volume = 1.0;

// 🎶 Background (soft)
bgMusic.volume = 0.05;
crashSound.volume = 0.8;

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  // accelerate sound
  if (e.key === "ArrowUp" && gameRunning) {
    if (revSound.paused) {
      revSound.currentTime = 0;
      revSound.play();
    }
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;

  // stop accelerate sound
  if (e.key === "ArrowUp") {
    revSound.pause();
  }
});

startBtn.addEventListener("click", startGame);

function startGame() {
  startBtn.style.display = "none";
  bgMusic.play();
  idleSound.play();
  gameRunning = true;
  speed = baseSpeed;
  score = 0;
  spawnCounter = 0;
  enemies = [];
  gameLoop();
}

function gameLoop() {
  if (!gameRunning) return;

  updateSpeed();
  updateRoad();
  movePlayer();
  handleEnemies();
  checkCollision();
  updateScore();

  requestAnimationFrame(gameLoop);
}

function updateSpeed() {
  if (keys["ArrowUp"]) {
    // accelerating
    if (speed < maxSpeed) speed += accelRate;
  } else if (keys["ArrowDown"]) {
    // braking
    if (speed > baseSpeed) speed -= brakeRate;
  } else {
    // normal deceleration
    if (speed > baseSpeed) speed -= decelRate;
  }

  // clamp speed
  speed = Math.max(baseSpeed, Math.min(speed, maxSpeed));

  // engine pitch changes with speed
  idleSound.playbackRate = 0.8 + (speed / maxSpeed) * 0.4;

  speedDisplay.textContent = Math.floor(speed * 10);
}

function updateRoad() {
  roadPosition += speed * 1.8;
  road.style.backgroundPositionY = roadPosition + "px";
}

function movePlayer() {
  let left = parseInt(window.getComputedStyle(player).left);

  // 🕹️ More sensitive turning
  const turnSpeed = 8;

  if (keys["ArrowLeft"] && left > 10) player.style.left = left - turnSpeed + "px";
  if (keys["ArrowRight"] && left < 330) player.style.left = left + turnSpeed + "px";
}

function createEnemy() {
  const enemy = document.createElement("div");
  enemy.classList.add("enemyCar");
  enemy.style.backgroundImage = `url('assets/enemyCar${Math.floor(Math.random() * 2) + 1}.png')`;
  enemy.style.left = Math.floor(Math.random() * 3) * 120 + 50 + "px";
  enemy.style.top = "-150px";
  document.querySelector(".road").appendChild(enemy);
  enemies.push(enemy);
}

function handleEnemies() {
  spawnCounter++;
  if (spawnCounter > 180 - speed * 5) {
    createEnemy();
    spawnCounter = 0;
  }

  enemies.forEach((enemy, i) => {
    let top = parseInt(enemy.style.top);
    enemy.style.top = top + speed * 1.3 + "px";
    if (top > 650) {
      enemy.remove();
      enemies.splice(i, 1);
    }
  });
}

function checkCollision() {
  const playerRect = player.getBoundingClientRect();
  enemies.forEach(enemy => {
    const eRect = enemy.getBoundingClientRect();
    if (
      playerRect.left < eRect.right &&
      playerRect.right > eRect.left &&
      playerRect.top < eRect.bottom &&
      playerRect.bottom > eRect.top
    ) {
      endGame();
    }
  });
}

function updateScore() {
  score += speed * 0.1;
  scoreDisplay.textContent = Math.floor(score);
}

function endGame() {
  gameRunning = false;
  crashSound.play();
  bgMusic.pause();
  idleSound.pause();
  revSound.pause();
  alert("💥 Crash! Game Over\nScore: " + Math.floor(score));
  window.location.reload();
}
