/* ============================================================
   Stickman Jumper Game Logic
   ============================================================ */

let player, obstacles = [], coins = [], score = 0, isGameOver = false;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function createPlayer() {
  return { x: 50, y: canvas.height - 120, w: 25, h: 60, vy: 0 };
}

function startGame() {
  player = createPlayer();
  obstacles = []; coins = []; score = 0; isGameOver = false;
  requestAnimationFrame(loop);
}

function loop() {
  if (isGameOver) return;
  update(); draw();
  requestAnimationFrame(loop);
}

function update() {
  score++;
  player.vy += 0.5; player.y += player.vy;
  if (player.y > canvas.height - 120) { player.y = canvas.height - 120; player.vy = 0; }

  if (Math.random() < 0.02) obstacles.push({ x: canvas.width, y: canvas.height - 120, w: 30, h: 40 });
  obstacles.forEach(o => o.x -= 4);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  obstacles.forEach(o => {
    if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
      gameOver();
    }
  });

  if (Math.random() < 0.01) coins.push({ x: canvas.width, y: canvas.height - 160, size: 15 });
  coins.forEach(c => c.x -= 4);
  coins = coins.filter(c => c.x + c.size > 0);

  coins.forEach((c, i) => {
    if (player.x < c.x + c.size && player.x + player.w > c.x && player.y < c.y + c.size && player.y + player.h > c.y) {
      collectCoin(i);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2d3748";
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

  ctx.fillStyle = "yellow";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "red";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

  ctx.fillStyle = "gold";
  coins.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  document.getElementById("score").textContent = Math.floor(score / 10);
}

function collectCoin(index) {
  coins.splice(index, 1);
  const u = getCurrentUser();
  if (u) {
    const data = getUserData(u);
    data.coins = (data.coins || 0) + 1;
    saveUserData(u, data);
    document.getElementById("user-info").textContent = `Logged in as ${u} | Coins: ${data.coins} | High Score: ${data.highScoreStickman}`;
  }
}

function gameOver() {
  isGameOver = true;
  const u = getCurrentUser();
  if (u) {
    const data = getUserData(u);
    const finalScore = Math.floor(score / 10);
    if (finalScore > data.highScoreStickman) data.highScoreStickman = finalScore;
    saveUserData(u, data);
    alert("Game Over! Score: " + finalScore);
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") player.vy = -10;
});

function initGame() {
  const u = getCurrentUser();
  if (u) {
    const data = getUserData(u);
    document.getElementById("user-info").textContent = `Logged in as ${u} | Coins: ${data.coins} | High Score: ${data.highScoreStickman}`;
  } else {
    document.getElementById("user-info").textContent = "Not logged in. Go back to hub.";
  }
  startGame();
}
