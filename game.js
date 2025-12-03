// Get the canvas and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// --- Game Constants ---
const gravity = 0.6;
const jumpStrength = 15;
const obstacleSpeed = 5;

// Obstacle Complexity Constants
const minGapWidth = 100;
const maxGapWidth = 150;
const tallObstacleHeight = 80;
const flyingObstacleY = 150; 

// --- Player (Stickman) Object ---
let stickman = {
    x: 50,
    y: canvas.height - 50,
    width: 20,
    height: 40,
    dy: 0,
    isJumping: false,
    groundY: canvas.height - 50
};

// --- Game State ---
let obstacles = [];
let isGameOver = false;
let score = 0;

// --- Drawing Functions ---

// Draw the Ground
function drawGround() {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
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

    // Arms
    ctx.moveTo(stickman.x, stickman.y + stickman.height * 0.3);
    ctx.lineTo(stickman.x + stickman.width, stickman.y + stickman.height * 0.3);

    // Legs
    ctx.moveTo(stickman.x + stickman.width / 2, stickman.y + stickman.height * 0.7);
    ctx.lineTo(stickman.x, stickman.y + stickman.height);
    ctx.moveTo(stickman.x + stickman.width / 2, stickman.y + stickman.height * 0.7);
    ctx.lineTo(stickman.x + stickman.width, stickman.y + stickman.height);

    ctx.stroke();
}

// Draw an Obstacle (box, gap, or flying box)
function drawObstacle(obstacle) {
    if (obstacle.type === 'box') {
        // Ground obstacle
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
    } else if (obstacle.type === 'gap') {
        // Gap/Pit
        ctx.fillStyle = '#aaa'; 
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, canvas.height - obstacle.y);
        
    } else if (obstacle.type === 'flying') { 
        // Flying obstacle
        ctx.fillStyle = 'blue';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

// --- Game Logic Functions ---

function jump() {
    if (!stickman.isJumping && !isGameOver) {
        stickman.isJumping = true;
        stickman.dy = -jumpStrength;
    }
}

function updateStickman() {
    stickman.dy += gravity; 
    stickman.y += stickman.dy; 

    if (stickman.y >= stickman.groundY) {
        stickman.y = stickman.groundY;
        stickman.dy = 0;
        stickman.isJumping = false;
    }
}

function updateObstacles() {
    // 1. Move existing obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;
    });

    // 2. Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    // 3. Spawning Logic
    const lastObstacle = obstacles.length > 0 ? obstacles[obstacles.length - 1] : null;

    if (!lastObstacle || lastObstacle.x < canvas.width - 250) { 
        
        const hazardType = Math.random(); 

        if (hazardType < 0.40) {
            // A. Normal/Small Obstacle (40% chance)
            const height = 20 + Math.random() * 30;
            obstacles.push({
                type: 'box',
                x: canvas.width,
                y: stickman.groundY + stickman.height - height + 10,
                width: 20,
                height: height
            });

        } else if (hazardType < 0.55) {
            // B. Tall Obstacle (15% chance)
            obstacles.push({
                type: 'box',
                x: canvas.width,
                y: stickman.groundY + stickman.height - tallObstacleHeight + 10,
                width: 20,
                height: tallObstacleHeight
            });

        } else if (hazardType < 0.70) {
            // C. Gap in the Ground (15% chance)
            const gapWidth = minGapWidth + Math.random() * (maxGapWidth - minGapWidth);
            obstacles.push({
                type: 'gap',
                x: canvas.width,
                y: stickman.groundY + 10,
                width: gapWidth,
                height: 10
            });

        } else if (hazardType < 0.85) {
            // D. Flying Obstacle (15% chance)
            obstacles.push({
                type: 'flying',
                x: canvas.width,
                y: flyingObstacleY,
                width: 40,
                height: 20
            });
        }
    }
}

// Check for collision
function checkCollision() {
    obstacles.forEach(obstacle => {
        
        // Check for collision with solid 'box' or 'flying' obstacles
        if (obstacle.type === 'box' || obstacle.type === 'flying') {
             if (
                stickman.x < obstacle.x + obstacle.width &&
                stickman.x + stickman.width > obstacle.x &&
                stickman.y < obstacle.y + obstacle.height &&
                stickman.y + stickman.height > obstacle.y
            ) {
                isGameOver = true;
            }
        } 
        
        // Check for collision (falling) with 'gap' obstacles
        else if (obstacle.type === 'gap') {
            // Check if stickman is horizontally within the gap
            if (stickman.x + stickman.width > obstacle.x && stickman.x < obstacle.x + obstacle.width) {
                
                // Check if the stickman is on or below the normal ground level
                if (stickman.y + stickman.height >= stickman.groundY + 10) { 
                    isGameOver = true;
                }
            }
        }
    });
}

// Reset Game Function
function resetGame() {
    // Reset player position
    stickman.y = stickman.groundY;
    stickman.dy = 0;
    stickman.isJumping = false;
    
    // Clear all obstacles
    obstacles = [];
    
    // Reset game state and score
    isGameOver = false;
    score = 0; 
    scoreDisplay.textContent = `Score: 0`;
    
    // Hide the button
    resetButton.style.display = 'none';
    
    // Restart the game loop
    gameLoop();
}

// --- Main Game Loop ---
function gameLoop() {
    // Clear the canvas on every frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
        updateStickman();
        updateObstacles();
        checkCollision();
        
        // Update and display the score while playing
        score += 0.1; 
        scoreDisplay.textContent = `Score: ${Math.floor(score)}`;
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
        
        // Show the button when the game is over
        resetButton.style.display = 'block'; 

    } else {
        // Ensure the button is hidden while playing
        resetButton.style.display = 'none';
    }

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

// Listen for the reset button click
resetButton.addEventListener('click', resetGame);

// Start the game loop!
gameLoop();
