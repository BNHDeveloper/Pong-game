const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const leftScoreElement = document.getElementById("score-left");
const rightScoreElement = document.getElementById("score-right");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WINNING_SCORE = 5;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 95;
const PADDLE_SPEED = 7;
const BALL_RADIUS = 8;
const BALL_SPEED = 5;

const leftPaddle = {
  x: 28,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#a855f7"
};

const rightPaddle = {
  x: WIDTH - 28 - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#38e8ff"
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: BALL_RADIUS,
  vx: BALL_SPEED,
  vy: BALL_SPEED * 0.6
};

let leftScore = 0;
let rightScore = 0;
let gameRunning = false;
let gameOver = false;

const keys = {};

// Listen for keys being pressed.
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["w", "s", "arrowup", "arrowdown", " "].includes(key)) {
    event.preventDefault();
  }

  keys[key] = true;
});

// Listen for keys being released.
window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

function drawRect(x, y, width, height, color, glow = 0) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

function drawBall() {
  ctx.save();
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 22;
  ctx.fill();
  ctx.restore();
}

function drawArea() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw the center line.
  for (let y = 0; y < HEIGHT; y += 28) {
    drawRect(WIDTH / 2 - 1, y, 2, 14, "#ffffff30");
  }

  drawRect(
    leftPaddle.x,
    leftPaddle.y,
    leftPaddle.width,
    leftPaddle.height,
    leftPaddle.color,
    18
  );

  drawRect(
    rightPaddle.x,
    rightPaddle.y,
    rightPaddle.width,
    rightPaddle.height,
    rightPaddle.color,
    18
  );

  drawBall();
}

function movePaddles() {
  if (keys["w"]) {
    leftPaddle.y -= PADDLE_SPEED;
  }

  if (keys["s"]) {
    leftPaddle.y += PADDLE_SPEED;
  }

  if (keys["arrowup"]) {
    rightPaddle.y -= PADDLE_SPEED;
  }

  if (keys["arrowdown"]) {
    rightPaddle.y += PADDLE_SPEED;
  }

  // Keep paddles inside the arena.
  leftPaddle.y = Math.max(
    0,
    Math.min(HEIGHT - leftPaddle.height, leftPaddle.y)
  );

  rightPaddle.y = Math.max(
    0,
    Math.min(HEIGHT - rightPaddle.height, rightPaddle.y)
  );
}

function resetBall(direction) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;

  ball.vx = BALL_SPEED * direction;

  // Give each serve a slightly different vertical angle.
  ball.vy = (Math.random() * 2 - 1) * 3;
}

function ballHitsPaddle(paddle) {
  return (
    ball.x - ball.radius < paddle.x + paddle.width &&
    ball.x + ball.radius > paddle.x &&
    ball.y - ball.radius < paddle.y + paddle.height &&
    ball.y + ball.radius > paddle.y
  );
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Bounce off the top and bottom walls.
  if (
    ball.y - ball.radius <= 0 ||
    ball.y + ball.radius >= HEIGHT
  ) {
    ball.vy *= -1;
  }

  // Bounce off the left paddle.
  if (ball.vx < 0 && ballHitsPaddle(leftPaddle)) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.vx = Math.abs(ball.vx) * 1.05;

    changeBallAngle(leftPaddle);
  }

  // Bounce off the right paddle.
  if (ball.vx > 0 && ballHitsPaddle(rightPaddle)) {
    ball.x = rightPaddle.x - ball.radius;
    ball.vx = -Math.abs(ball.vx) * 1.05;

    changeBallAngle(rightPaddle);
  }

  // The ball passed the left side: Player 2 scores.
  if (ball.x + ball.radius < 0) {
    rightScore++;
    updateScore();

    if (checkWinner()) return;

    resetBall(-1);
  }

  // The ball passed the right side: Player 1 scores.
  if (ball.x - ball.radius > WIDTH) {
    leftScore++;
    updateScore();

    if (checkWinner()) return;

    resetBall(1);
  }
}

function changeBallAngle(paddle) {
  const paddleCenter = paddle.y + paddle.height / 2;
  const difference = ball.y - paddleCenter;

  // The impact position changes the bounce angle.
  ball.vy = difference * 0.12;

  // Limit the ball's maximum vertical speed.
  ball.vy = Math.max(-7, Math.min(7, ball.vy));
}

function updateScore() {
  leftScoreElement.textContent = leftScore;
  rightScoreElement.textContent = rightScore;
}

function checkWinner() {
  if (leftScore >= WINNING_SCORE || rightScore >= WINNING_SCORE) {
    gameRunning = false;
    gameOver = true;

    const winner = leftScore >= WINNING_SCORE ? "PLAYER 1" : "PLAYER 2";

    overlayTitle.textContent = `${winner} WINS!`;
    overlayMessage.textContent = `${leftScore} — ${rightScore}`;
    startBtn.textContent = "PLAY AGAIN";
    overlay.classList.remove("hidden");

    return true;
  }

  return false;
}

function gameLoop() {
  if (gameRunning) {
    movePaddles();
    updateBall();
  }

  drawArea();

  requestAnimationFrame(gameLoop);
}

function startGame() {
  if (gameRunning) return;

  if (gameOver) {
    leftScore = 0;
    rightScore = 0;
    updateScore();

    leftPaddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    rightPaddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;

    gameOver = false;
  }

  resetBall(Math.random() < 0.5 ? -1 : 1);

  gameRunning = true;
  overlay.classList.add("hidden");
}

function restartGame() {
  leftScore = 0;
  rightScore = 0;

  updateScore();

  leftPaddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  rightPaddle.y = HEIGHT / 2 - PADDLE_HEIGHT / 2;

  gameOver = false;
  gameRunning = false;

  resetBall(Math.random() < 0.5 ? -1 : 1);

  overlayTitle.textContent = "READY?";
  overlayMessage.textContent = "First player to 5 points wins.";
  startBtn.textContent = "START GAME";

  overlay.classList.remove("hidden");
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

// Draw the initial area and keep the animation loop running.
drawArea();
requestAnimationFrame(gameLoop);
