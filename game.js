// Get the canvas and its drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// --- Game Constants ---
const gravity = 0.6;
const INITIAL_OBSTACLE_SPEED = 5; // Fixed running speed
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
let obstacleSpeed = INITIAL_OBSTACLE_SPEED; // Active speed, fixed at 5
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

// Draw an Obstacle (single spike or gap)
function drawObstacle(obstacle) {
    
    // Check if it's a solid obstacle (ground or flying)
    if (obstacle.type === 'box' || obstacle.type === 'flying') {
        
        ctx.fillStyle = (obstacle.type === 'box') ? 'red' : 'blue';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        // Uses a single spike that takes up the full width/height of the obstacle's bounding box
        const spikeWidth = obstacle.width;
        const spikeHeight = obstacle.height;
        const startX = obstacle.x;
        const startY = obstacle.y;

        ctx.beginPath();
        
        if (obstacle.type === 'box') {
            // Ground Spikes: Draw a single upward-pointing triangle
            ctx.moveTo(startX, startY + spikeHeight); // Bottom-left corner
            ctx.lineTo(startX + (spikeWidth / 2), startY); // Top peak
            ctx.lineTo(startX + spikeWidth, startY + spikeHeight); // Bottom-right corner
        } else if (obstacle.type === 'flying') {
            // Flying Spikes: Draw a single downward-pointing triangle
            ctx.moveTo(startX, startY); // Top-left corner
            ctx.lineTo(startX + (spikeWidth / 2), startY + spikeHeight); // Bottom peak
            ctx.lineTo(startX + spikeWidth, startY); // Top-right corner
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
