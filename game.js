class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameRunning = false;
        this.gamePaused = false;

        // UI elements
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.overlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.startButton = document.getElementById('startButton');

        this.initializeGame();
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    }

    initializeGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.updateScore();
        this.showOverlay('Welcome to Snake!', 'Use arrow keys or WASD to move', 'Start Game');
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && e.code === 'Space') {
                this.startGame();
                return;
            }

            if (this.gameRunning) {
                switch (e.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        if (this.dy === 0) {
                            this.dx = 0;
                            this.dy = -1;
                        }
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        if (this.dy === 0) {
                            this.dx = 0;
                            this.dy = 1;
                        }
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        if (this.dx === 0) {
                            this.dx = -1;
                            this.dy = 0;
                        }
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        if (this.dx === 0) {
                            this.dx = 1;
                            this.dy = 0;
                        }
                        break;
                    case 'Space':
                        this.togglePause();
                        break;
                }
            }
            e.preventDefault();
        });

        // Start button
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });

        // Mobile controls
        document.getElementById('upBtn').addEventListener('click', () => {
            if (this.gameRunning && this.dy === 0) {
                this.dx = 0;
                this.dy = -1;
            }
        });

        document.getElementById('downBtn').addEventListener('click', () => {
            if (this.gameRunning && this.dy === 0) {
                this.dx = 0;
                this.dy = 1;
            }
        });

        document.getElementById('leftBtn').addEventListener('click', () => {
            if (this.gameRunning && this.dx === 0) {
                this.dx = -1;
                this.dy = 0;
            }
        });

        document.getElementById('rightBtn').addEventListener('click', () => {
            if (this.gameRunning && this.dx === 0) {
                this.dx = 1;
                this.dy = 0;
            }
        });
    }

    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.hideOverlay();
        this.gameLoop();
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        if (this.gamePaused) {
            this.showOverlay('Game Paused', 'Press SPACE to continue', 'Resume');
        } else {
            this.hideOverlay();
            this.gameLoop();
        }
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;

        setTimeout(() => {
            this.clearCanvas();
            this.moveSnake();
            this.drawFood();
            this.drawSnake();

            if (this.checkCollision()) {
                this.gameOver();
                return;
            }

            if (this.checkFoodCollision()) {
                this.eatFood();
            }

            this.gameLoop();
        }, 100);
    }

    clearCanvas() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    moveSnake() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        this.snake.unshift(head);

        if (!this.checkFoodCollision()) {
            this.snake.pop();
        }
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );

            // Add snake head eyes
            if (index === 0) {
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 5,
                    segment.y * this.gridSize + 5,
                    3, 3
                );
                this.ctx.fillRect(
                    segment.x * this.gridSize + 12,
                    segment.y * this.gridSize + 5,
                    3, 3
                );
            }
        });
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }

    drawFood() {
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );

        // Add food highlight
        this.ctx.fillStyle = '#fca5a5';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            6, 6
        );
    }

    checkCollision() {
        const head = this.snake[0];

        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }

        return false;
    }

    checkFoodCollision() {
        const head = this.snake[0];
        return head.x === this.food.x && head.y === this.food.y;
    }

    eatFood() {
        this.score += 10;
        this.updateScore();
        this.food = this.generateFood();

        // Check for new high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
            this.updateHighScoreDisplay();
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }

    gameOver() {
        this.gameRunning = false;
        this.showOverlay(
            'Game Over!',
            `Final Score: ${this.score}${this.score === this.highScore ? ' (New High Score!)' : ''}`,
            'Play Again'
        );
    }

    showOverlay(title, message, buttonText) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.startButton.textContent = buttonText;
        this.overlay.style.display = 'flex';

        // Reset game state for new game
        if (title === 'Game Over!') {
            setTimeout(() => {
                this.initializeGame();
            }, 100);
        }
    }

    hideOverlay() {
        this.overlay.style.display = 'none';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});