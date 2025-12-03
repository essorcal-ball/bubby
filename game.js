// Get the canvas and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// --- Game Constants ---
const gravity = 0.6;
const INITIAL_OBSTACLE_SPEED = 5; // Fixed starting speed
const MAX_JUMPS = 2;              // Allows for one initial jump + one mid-air jump
const JUMP_STRENGTH = 15;         // Fixed jump power

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
    groundY: canvas.height - 50 // The floor level
};

// --- Game State ---
let obstacles = [];
let isGameOver = false;
let score = 0;
let obstacleSpeed = INITIAL_OBSTACLE_SPEED; // Active speed, now resettable
let jumpsRemaining = MAX_JUMPS;             // Jumps available in the current air phase

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

// Draw an Obstacle (spikes, gap, or flying spikes)
function drawObstacle(obstacle) {
    
    // Check if it's a solid obstacle (ground or flying)
    if (obstacle.type === 'box' || obstacle.type === 'flying') {
        
        ctx.fillStyle = (obstacle.type === 'box') ? 'red' : 'blue';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        const numSpikes = 3; 
        const spikeWidth = obstacle.width / numSpikes;
        const spikeHeight = obstacle.height;
        const startX = obstacle.x;
        const startY = obstacle.y;

        ctx.beginPath();
        
        if (obstacle.type === 'box') {
            // Ground Spikes: Draw upward from the base
            ctx.moveTo(startX, startY + spikeHeight); 
            for (let i = 0; i < numSpikes; i++) {
                ctx.lineTo(startX + (i * spikeWidth) + (spikeWidth / 2), startY);
                ctx.lineTo(startX + ((i + 1) * spikeWidth), startY + spikeHeight);
            }
        } else if (obstacle.type === 'flying') {
            // Flying Spikes: Draw downward from the top edge
            ctx.moveTo(startX, startY);
            for (let i = 0; i < numSpikes; i++) {
                ctx.lineTo(startX + (i * spikeWidth) + (spikeWidth / 2), startY + spikeHeight);
                ctx.lineTo(startX + ((i + 1) * spikeWidth), startY);
            }
        }

        ctx.fill();
        ctx.stroke(); 
        
    } else if (obstacle.type === 'gap') {
        // Gap/Pit drawing
        ctx.fillStyle = '#aaa'; 
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, canvas.height - obstacle.y);
    }
}

// --- Game Logic Functions ---

// Function executed when jump input is pressed (click or keydown)
function initiateJump() {
    
    // Check if the stickman has jumps remaining AND the game is not over
    if (jumpsRemaining > 0 && !isGameOver) { 
        
        // Apply fixed jump strength
        stickman.isJumping = true;
        stickman.dy = -JUMP_STRENGTH; 

        // Decrement the jump counter (allows for the double jump)
        jumpsRemaining--; 
    }
}


function updateStickman() {
    // Apply gravity and update position
    stickman.dy += gravity; 
    stickman.y += stickman.dy; 

    // Check if the stickman has landed
    if (stickman.y >= stickman.groundY) {
        stickman.y = stickman.groundY;
        stickman.dy = 0;
        stickman.isJumping = false;
        
        // Reset jumps when landing on the ground
        jumpsRemaining = MAX_JUMPS; 
    }
}

function updateObstacles() {
    // 1. Move existing obstacles
    obstacles.forEach(obstacle => {
        obstacle.x = obstacleSpeed;
    });

    // 2. Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    // 3. Spawning Logic
    const lastObstacle = obstacles.length > 0 ? obstacles[obstacles.length - 1] : null;

    // Only spawn a new obstacle if the previous one is far enough away
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

        } else if (hazardType < 0.65) {
            // B. Tall Obstacle (15% chance)
            obstacles.push({
                type: 'box',
                x: canvas.width,
                y: stickman.groundY + stickman.height - tallObstacleHeight + 10,
                width: 20,
                height: tallObstacleHeight
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
        
        // Collision for solid obstacles ('box' and 'flying' spikes)
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
        
        // Collision for 'gap' obstacles
        else if (obstacle.type === 'gap') {
            // Check if stickman is horizontally within the gap
            if (stickman.x + stickman.width > obstacle.x && stickman.x < obstacle.x + obstacle.width) {
                
                // Check if the stickman is on or below the normal ground level (i.e., failed the jump)
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
    
    // Reset jump state
    jumpsRemaining = MAX_JUMPS; 
    
    // Clear all obstacles
    obstacles = [];
    
    // RESET FIX: Reset the active speed to the initial value
    let obstacleSpeed = 5; 
    
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

// Mousedown/Click: Triggers jump immediately
canvas.addEventListener('mousedown', initiateJump);

// Keydown (Spacebar): Triggers jump immediately
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        // Prevent default browser action (scrolling) when space is pressed
        e.preventDefault(); 
        initiateJump();
    }
});

// Listen for the reset button click
resetButton.addEventListener('click', resetGame);

// Start the game loop!
gameLoop();
