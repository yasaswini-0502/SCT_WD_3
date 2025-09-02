const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const timerEl = document.getElementById("timer");
const winLine = document.getElementById("win-line");

let currentPlayer = "X"; 
let board = ["", "", "", "", "", "", "", "", ""];
let running = true;
let vsComputer = true;
let timer, timeLeft = 10;

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Load leaderboard or create default
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {
  X: { wins:0, losses:0, draws:0 },
  O: { wins:0, losses:0, draws:0 }
};

cells.forEach(cell => cell.addEventListener("click", cellClicked));
resetBtn.addEventListener("click", restartGame);

startTimer();

function cellClicked() {
  const index = this.getAttribute("data-index");
  if(board[index] !== "" || !running || (currentPlayer === "O" && vsComputer)) return;

  updateCell(this, index);
  checkWinner();

  if(vsComputer && running) {
    setTimeout(computerMove, 500);
  }
}

function updateCell(cell, index) {
  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer === "X" ? "player-x" : "player-o");
}

function changePlayer() {
  currentPlayer = (currentPlayer === "X") ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
  resetTimer();
}

function checkWinner() {
  let roundWon = false;
  let winningCombo = [];

  for(let i = 0; i < winConditions.length; i++) {
    const [a, b, c] = winConditions[i];
    if(board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      winningCombo = [a, b, c];
      break;
    }
  }

  if(roundWon) {
    statusText.textContent = `🎉 Player ${currentPlayer} Wins!`;
    statusText.className = "status-win";
    drawWinLine(winningCombo);
    saveResult(currentPlayer);
    running = false;
    clearInterval(timer);
  } else if(!board.includes("")) {
    statusText.textContent = "😲 It's a Draw!";
    statusText.className = "status-draw";
    saveResult("Draw");
    running = false;
    clearInterval(timer);
  } else {
    changePlayer();
  }
}

function drawWinLine(combo) {
  const rects = combo.map(i => cells[i].getBoundingClientRect());
  const boardRect = document.querySelector(".board").getBoundingClientRect();

  const x1 = rects[0].left + rects[0].width/2 - boardRect.left;
  const y1 = rects[0].top + rects[0].height/2 - boardRect.top;
  const x2 = rects[2].left + rects[2].width/2 - boardRect.left;
  const y2 = rects[2].top + rects[2].height/2 - boardRect.top;

  const length = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
  const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;

  winLine.style.width = `${length}px`;
  winLine.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
}

function computerMove() {
  let availableCells = [];
  board.forEach((cell, index) => {
    if(cell === "") availableCells.push(index);
  });
  if(availableCells.length === 0) return;

  const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
  const cell = document.querySelector(`.cell[data-index='${randomIndex}']`);

  updateCell(cell, randomIndex);
  checkWinner();
}

function restartGame() {
  currentPlayer = "X";
  board = ["", "", "", "", "", "", "", "", ""];
  running = true;
  statusText.textContent = `Player X's Turn`;
  statusText.className = "status-x";
  winLine.style.width = "0";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.className = "cell";
  });
  resetTimer();
}

/* ========== TIMER ========== */
function startTimer() {
  timeLeft = 10;
  timerEl.textContent = `Time Left :⏳ ${timeLeft}`;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time Left :⏳ ${timeLeft}`;
    if(timeLeft <= 0) {
      clearInterval(timer);
      changePlayer();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  startTimer();
}

/* ========== LEADERBOARD SAVE ========== */
function saveResult(result) {
  if(result === "X") {
    leaderboard.X.wins += 1;
    leaderboard.O.losses += 1;
  } else if(result === "O") {
    leaderboard.O.wins += 1;
    leaderboard.X.losses += 1;
  } else if(result === "Draw") {
    leaderboard.X.draws += 1;
    leaderboard.O.draws += 1;
  }

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}
