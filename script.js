let boardArr = [];
let rows = 3;
let columns = 3;
let reseted = true;
let win = false;
let mouseDown = false;
let startX = 0;
let startY = 0;
let moveSensitivity = 50;
let swipeThreshold = (101 - moveSensitivity) * 3;
let isPaused = true;
let isShuffling = false;
// const solvedBoard = Array.from({ length: rows * columns }, (_, i) => i + 1);

shuffleMoves = (rows*columns)*10;

let rvPrevSMove = "right";


class stopWatch {
    constructor(display) {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.display = display;
    }
    start() {
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.display.textContent = this.formatTime(this.elapsedTime);
        }, 10);
    }
    stop() {
        clearInterval(this.timerInterval);
    }
    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.display.textContent = this.formatTime(this.elapsedTime);
    }
    formatTime(time) {
        const centiseconds = Math.floor(time / 10) % 100;
        const seconds = Math.floor(time / 1000) % 60;
        const minutes = Math.floor(time / 60000) % 60;
        if (time < 3600000) {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
        }
        const hours = Math.floor(time / 3600000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
}


const watch = new stopWatch(document.querySelector(".time"));

const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const movementSensitivity = document.getElementById("movementSensitivity");

// Initialize input values
rowsInput.value = rows;
colsInput.value = columns;
movementSensitivity.value = moveSensitivity;

rowsInput.addEventListener("change", (e) => {
    if(e.target.value < 2) {
        e.target.value = 2;
        rows = 2;
        alert("Minimum rows is 2");
        return;
    }
    if(e.target.value > 40) {
        e.target.value = 40;
        rows = 40;
        alert("Maximum rows is 40. You may experience performance and display issues with larger boards.");
        return;
    }
    rows = parseInt(e.target.value);
    document.documentElement.style.setProperty("--rows", rows);
    shuffleMoves = (rows*columns)*10;
    console.log("rows:", rows);
    createBoard();
});

colsInput.addEventListener("change", (e) => {
    if(e.target.value < 2) {
        e.target.value = 2;
        columns = 2;
        alert("Minimum columns is 2");
        return;
    }
    if(e.target.value > 40) {
        e.target.value = 40;
        columns = 40;
        alert("Maximum columns is 40. You may experience performance and display issues with larger boards.");
        return;
    }
    columns = parseInt(e.target.value);
    document.documentElement.style.setProperty("--cols", columns);
  shuffleMoves = (rows*columns)*10;
  console.log("columns:", columns);
  createBoard();
});

movementSensitivity.addEventListener("change", (e) => {
    moveSensitivity = parseInt(e.target.value);
    swipeThreshold = Math.max(20, (101 - moveSensitivity) * 3);
    console.log("sensitivity:", moveSensitivity, "threshold:", swipeThreshold);
});

function createBoard() {
    watch.reset();
    !isPaused && togglePause();
    reseted = true;
    win = false;
    boardArr = [];
    for (let i = 1; i <= rows * columns; i++) {
        boardArr.push(i);
    }
    renderBoard();
}

function renderBoard() {
    board.innerHTML = "";
    document.documentElement.style.setProperty("--rows", rows);
    document.documentElement.style.setProperty("--cols", columns);
    let prevTexture = 0;
    boardArr.forEach((num) => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.textContent = num === rows*columns ? "" : num;

        if (num !== rows * columns) {
            let texture;
            if(columns % 2 === 0) {
                if (num%columns==0 ? (Math.floor(num/(columns)) - 1)%2 === 0 : Math.floor(num/(columns))%2 === 0) {
                    texture = num % 2 === 0 ? "texture2" : "texture1";
                } else {
                    texture = num % 2 === 0 ? "texture1" : "texture2";
                }
            } else {
                texture = num % 2 === 0 ? "texture2" : "texture1";
            }
            cell.classList.add(texture);
            if(rows*columns > 99 && rows*columns < 1000){
                cell.classList.add("small");
            } 
            else if(rows*columns > 999){
                cell.classList.add("xtraSmall");
            }
            else {
                cell.classList.remove("small");
                cell.classList.remove("xtraSmall");
            }
        }
        board.appendChild(cell);
    });
    if (checkWin()) {
        win = true;
        statusFace.textContent = "😎";
        setTimeout(() => {
            alert("Congratulations! You solved the puzzle!");
        }, 100);
    } else {
        win = false;
        statusFace.textContent = "🙂";
    }

}

function isBoardSolved() {
    for (let i = 0; i < boardArr.length - 1; i++) {
        if (boardArr[i] !== i + 1) {
            return false;
        }
    }
    return true;
}

function moveTile(direction, skipRender = false) {
    const emptyIndex = boardArr.indexOf(rows * columns);
    let tileIndex, targetIndex;
    switch (direction) {
        case "up":
            tileIndex = emptyIndex + columns;
            targetIndex = tileIndex - columns;
            break;
        case "down":
            tileIndex = emptyIndex - columns;
            targetIndex = tileIndex + columns;
            break;
        case "left":
            tileIndex = emptyIndex + 1;
            targetIndex = tileIndex - 1;
            break;
        case "right":
            tileIndex = emptyIndex - 1;
            targetIndex = tileIndex + 1;
            break;
    }

    let validMove = false;
    if (direction === "up" || direction === "down") {
        validMove = tileIndex >= 0 && tileIndex < rows * columns;
    } else {
        validMove = tileIndex >= 0 && tileIndex < rows * columns && Math.floor(tileIndex / columns) === Math.floor(emptyIndex / columns);
    }
    if (validMove) {
        [boardArr[tileIndex], boardArr[emptyIndex]] = [boardArr[emptyIndex], boardArr[tileIndex]];
        if (!skipRender) {
            renderBoard();
        }
    } else {
        console.log("Invalid move");
    }
}

document.addEventListener("keydown", (e) => {
    const target = e.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
    }

    switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
            e.preventDefault();
            break;
    }
    
    if (win || (isPaused && !reseted)) return;
    switch (e.key) {
        case "ArrowUp":
            moveTile("up");
            break;
        case "ArrowDown":
            moveTile("down");
            break;
        case "ArrowLeft":
            moveTile("left");
            break;
        case "ArrowRight":
            moveTile("right");
            break;
    }
});

function handlePointerStart(clientX, clientY) {
    if (win || (isPaused && !reseted)) return;
    mouseDown = true;
    startX = clientX;
    startY = clientY;

    console.log("Pointer start at:", startX, startY);
}

function handlePointerMove(clientX, clientY) {
    if (!mouseDown) return;

    const diffX = clientX - startX;
    const diffY = clientY - startY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);

    if (absDiffX > swipeThreshold || absDiffY > swipeThreshold) {
        let direction;

        if (absDiffX > absDiffY) {
            direction = diffX > 0 ? "right" : "left";
        } else {
            direction = diffY > 0 ? "down" : "up";
        }

        moveTile(direction);
        mouseDown = false;
    }
    console.log("Pointer move diff:", diffX, diffY);
}

function handlePointerEnd() {
    mouseDown = false;
}

board.addEventListener("mousedown", (e) => {
    e.preventDefault();
    handlePointerStart(e.clientX, e.clientY);
});

board.addEventListener("mousemove", (e) => {
    e.preventDefault();
    handlePointerMove(e.clientX, e.clientY);
});

board.addEventListener("mouseup", handlePointerEnd);

board.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerStart(touch.clientX, touch.clientY);
});

board.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
});

board.addEventListener("touchend", (e) => {
    e.preventDefault();
    handlePointerEnd();
});



function shuffleBoard() {
    watch.reset();
    isShuffling = true;
    win = false;
    for (let i = 0; i < shuffleMoves; i++) {
        const directions = ["up", "down", "left", "right"];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        if (randomDirection !== rvPrevSMove) {
            moveTile(randomDirection, true);
        }
        rvPrevSMove = randomDirection;
    }

    if (isBoardSolved()) {
        const emptyIndex = boardArr.indexOf(rows * columns);
        const extraMoves = [];
        if (emptyIndex + columns < rows * columns) extraMoves.push("up");
        if (emptyIndex - columns >= 0) extraMoves.push("down");
        if (emptyIndex + 1 < rows * columns && Math.floor((emptyIndex + 1) / columns) === Math.floor(emptyIndex / columns)) extraMoves.push("left");
        if (emptyIndex - 1 >= 0 && Math.floor((emptyIndex - 1) / columns) === Math.floor(emptyIndex / columns)) extraMoves.push("right");
        if (extraMoves.length > 0) {
            moveTile(extraMoves[Math.floor(Math.random() * extraMoves.length)], true);
        }
    }

    isShuffling = false;
    reseted = false;
    renderBoard();
    !isPaused && togglePause();
}

function checkWin() {
    if(reseted || isShuffling) return false;
    for (let i = 0; i < boardArr.length - 1; i++) {
        if (boardArr[i] !== i + 1) {
            return false;
        }
    }
    togglePause();
    win = true;
    return true;
}

function togglePause() {
    if (win) return;
    if (reseted) return;
    if (isPaused) {
        watch.start();
        statusFace.textContent = "🙂";
        pauseBtn.textContent = "Pause";
    }
    else {
        watch.stop();
        statusFace.textContent = "😐";
        pauseBtn.textContent = "Play";
    }
    isPaused = !isPaused;
}


createBoard();
