// Get the canvas and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Constants ---
const gravity = 0.6;
const jumpStrength = 15;
const obstacleSpeed = 5;

// --- Player (Stickman) Object ---
let stickman = {
    x: 50,
    y: canvas.height - 50, // Start just above the ground
    width: 20,
    height: 40,
    dy: 0, // Vertical velocity
    isJumping: false,
    groundY: canvas.height - 50 // The floor level
};

// --- Obstacles Array ---
let obstacles = [];

// --- Game State ---
let isGameOver = false;

// --- Drawing Functions ---

// Draw the Ground
function drawGround() {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Draw a line a little below the stickman's starting point
    ctx.moveTo(0, stickman.groundY + 10); 
    ctx.lineTo(canvas.width, stickman.groundY + 10);
    ctx.stroke();
}

// Draw the Stickman
function drawStickman() {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Body (vertical line)
    ctx.moveTo(stickman.x + stickman.width / 2, stickman.y);
    ctx.lineTo(stickman.x + stickman.width / 2, stickman.y + stickman.height * 0.7);

    // Head (circle)
    ctx.arc(stickman.x + stickman.width / 2, stickman.y, 8, 0, Math.PI * 2);

    // Arms (just two lines for simplicity)
    ctx.moveTo(stickman.x, stickman.y + stickman.height * 0.3);
    ctx.lineTo(stickman.x + stickman.width, stickman.y + stickman.height * 0.3);

    // Legs (two diagonal lines)
    ctx.moveTo(stickman.x + stickman.width / 2, stickman.y + stickman.height * 0.7);
    ctx.lineTo(stickman.x, stickman.y + stickman.height);
    ctx.moveTo(stickman.x + stickman.width / 2, stickman.y + stickman.height * 0.7);
    ctx.lineTo(stickman.x + stickman.width, stickman.y + stickman.height);

    ctx.stroke();
}

// Draw an Obstacle (simple box)
function drawObstacle(obstacle) {
    ctx.fillStyle = 'red';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

// --- Game Logic Functions ---

function jump() {
    if (!stickman.isJumping && !isGameOver) {
        stickman.isJumping = true;
        stickman.dy = -jumpStrength; // Apply upward velocity
    }
}

function updateStickman() {
    // Apply gravity to vertical velocity
    stickman.dy += gravity; 
    // Update vertical position
    stickman.y += stickman.dy; 

    // Check if the stickman has landed
    if (stickman.y >= stickman.groundY) {
        stickman.y = stickman.groundY; // Keep on the ground
        stickman.dy = 0; // Stop falling
        stickman.isJumping = false;
    }
}

function updateObstacles() {
    // Move existing obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
    });

    // Remove obstacles that have moved off-screen
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    // Randomly spawn new obstacles (adjust the spawning rate for difficulty)
    if (Math.random() < 0.015) { // Spawn chance (1.5% per frame)
        const height = 20 + Math.random() * 30;
        obstacles.push({
            x: canvas.width,
            y: stickman.groundY + stickman.height - height + 10, // Align with ground
            width: 20,
            height: height
        });
    }
}

// Check for collision between stickman and any obstacle
function checkCollision() {
    obstacles.forEach(obstacle => {
        // Simple AABB (Axis-Aligned Bounding Box) collision detection
        if (
            stickman.x < obstacle.x + obstacle.width &&
            stickman.x + stickman.width > obstacle.x &&
            stickman.y < obstacle.y + obstacle.height &&
            stickman.y + stickman.height > obstacle.y
        ) {
            isGameOver = true;
        }
    });
}

// --- Main Game Loop ---

function gameLoop() {
    // Clear the canvas on every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
        updateStickman();
        updateObstacles();
        checkCollision();
    }

    // Drawing phase
    drawGround();
    drawStickman();
    obstacles.forEach(drawObstacle);
    
    // Check for Game Over and draw the screen
    if (isGameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
    }

    // Request the next animation frame (around 60 times per second)
    requestAnimationFrame(gameLoop);
}

// --- Event Listeners ---

// Handle click/touch input
canvas.addEventListener('click', jump);

// Handle keyboard input (Spacebar)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
});

// Start the game loop!
gameLoop();
