
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const pvpBtn = document.getElementById('pvp-btn');
const pvcBtn = document.getElementById('pvc-btn');
const difficultySelect = document.getElementById('difficulty-select');

let gameMode = 'pvp'; // Default mode is Player vs Player
let difficulty = 'easy';
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]            // Diagonals
];

const messages = {
    xTurn: "It's X's turn",
    oTurn: "It's O's turn",
    xWon: "Player X has won!",
    oWon: "Player O has won!",
    draw: "Game ended in a draw!",
    computerTurn: "Computer's turn..."
};

// Functions
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusMessage.innerHTML = messages[`${currentPlayer.toLowerCase()}Won`];
        gameActive = false;
        return;
    }

    const roundDraw = !gameState.includes('');
    if (roundDraw) {
        statusMessage.innerHTML = messages.draw;
        gameActive = false;
        return;
    }

    changePlayer();
}

function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusMessage.innerHTML = currentPlayer === 'X' ? messages.xTurn : messages.oTurn;
    
    if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
        statusMessage.innerHTML = messages.computerTurn;
        setTimeout(handleComputerMove, 1000); // Delay for a more human-like turn
    }
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive || (gameMode === 'pvc' && currentPlayer === 'O')) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    statusMessage.innerHTML = messages.xTurn;
    
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('x', 'o');
    });
}

// Computer Player Logic
function handleComputerMove() {
    const availableCells = gameState.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    if (availableCells.length === 0) return;

    let computerMoveIndex;
    if (difficulty === 'easy') {
        // Random move
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        computerMoveIndex = availableCells[randomIndex];
    } else if (difficulty === 'medium') {
        // Block player if possible, else random
        computerMoveIndex = getBlockingMove('X') ?? availableCells[Math.floor(Math.random() * availableCells.length)];
    } else if (difficulty === 'hard') {
        // Minimax for best move
        computerMoveIndex = getBestMove('O');
    }
    const computerCell = cells[computerMoveIndex];
    handleCellPlayed(computerCell, computerMoveIndex);
    handleResultValidation();
}

// Medium: block player win
function getBlockingMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const line = [gameState[a], gameState[b], gameState[c]];
        if (line.filter(x => x === player).length === 2 && line.includes('')) {
            const emptyIndex = [a, b, c][line.indexOf('')];
            return emptyIndex;
        }
    }
    return null;
}

// Hard: Minimax
function getBestMove(player) {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            gameState[i] = player;
            let score = minimax(gameState, 0, false);
            gameState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(state, depth, isMaximizing) {
    const winner = checkWinner(state);
    if (winner !== null) {
        if (winner === 'O') return 10 - depth;
        else if (winner === 'X') return depth - 10;
        else return 0;
    }
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (state[i] === '') {
                state[i] = 'O';
                let score = minimax(state, depth + 1, false);
                state[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (state[i] === '') {
                state[i] = 'X';
                let score = minimax(state, depth + 1, true);
                state[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(state) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return state[a];
        }
    }
    if (!state.includes('')) return 'draw';
    return null;
}

function setGameMode(mode) {
    gameMode = mode;
    pvpBtn.classList.remove('active');
    pvcBtn.classList.remove('active');
    if (mode === 'pvp') {
        pvpBtn.classList.add('active');
    } else {
        pvcBtn.classList.add('active');
    }
    handleRestartGame();
}

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', handleRestartGame);
pvpBtn.addEventListener('click', () => setGameMode('pvp'));
pvcBtn.addEventListener('click', () => setGameMode('pvc'));
difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
});

// Show/hide difficulty selector based on mode
function updateDifficultyVisibility() {
    if (gameMode === 'pvc') {
        difficultySelect.style.display = '';
    } else {
        difficultySelect.style.display = 'none';
    }
}
// Update on mode change
const origSetGameMode = setGameMode;
setGameMode = function(mode) {
    origSetGameMode(mode);
    updateDifficultyVisibility();
};
updateDifficultyVisibility();

// Initial message
statusMessage.innerHTML = messages.xTurn;