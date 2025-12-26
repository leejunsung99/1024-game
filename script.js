class Game1024 {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore1024') || '0');
        this.gameOver = false;
        this.won = false;
        this.history = []; // 이전 상태를 저장하는 배열
        this.init();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.history = [];
        this.addRandomTile();
        this.addRandomTile();
        this.saveState(); // 초기 상태 저장
        this.updateDisplay();
        this.updateBestScore();
    }

    saveState() {
        // 현재 상태를 히스토리에 저장
        const state = {
            grid: this.grid.map(row => [...row]),
            score: this.score,
            gameOver: this.gameOver,
            won: this.won
        };
        this.history.push(state);
        // 히스토리가 너무 길어지지 않도록 최대 50개까지만 저장
        if (this.history.length > 50) {
            this.history.shift();
        }
        this.updateUndoButton();
    }

    undo() {
        if (this.history.length <= 1) return false; // 초기 상태만 있으면 되돌릴 수 없음
        
        // 마지막 상태 제거 (현재 상태)
        this.history.pop();
        
        // 이전 상태로 복원
        const previousState = this.history[this.history.length - 1];
        this.grid = previousState.grid.map(row => [...row]);
        this.score = previousState.score;
        this.gameOver = previousState.gameOver;
        this.won = previousState.won;
        
        this.updateDisplay();
        this.updateUndoButton();
        return true;
    }

    updateUndoButton() {
        const undoBtn = document.getElementById('undoBtn');
        if (this.history.length <= 1) {
            undoBtn.disabled = true;
        } else {
            undoBtn.disabled = false;
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        if (this.gameOver) return false;

        // 이동 전 상태 저장
        this.saveState();
        
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;

        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            this.checkGameOver();
            this.checkWin();
        } else {
            // 이동하지 않았으면 방금 저장한 상태 제거
            this.history.pop();
            this.updateUndoButton();
        }

        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++;
                    moved = true;
                } else {
                    newRow.push(row[j]);
                }
            }

            while (newRow.length < this.size) {
                newRow.push(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];
            
            for (let j = row.length - 1; j >= 0; j--) {
                if (j > 0 && row[j] === row[j - 1]) {
                    newRow.unshift(row[j] * 2);
                    this.score += row[j] * 2;
                    j--;
                    moved = true;
                } else {
                    newRow.unshift(row[j]);
                }
            }

            while (newRow.length < this.size) {
                newRow.unshift(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }

            const newColumn = [];
            for (let i = 0; i < column.length; i++) {
                if (i < column.length - 1 && column[i] === column[i + 1]) {
                    newColumn.push(column[i] * 2);
                    this.score += column[i] * 2;
                    i++;
                    moved = true;
                } else {
                    newColumn.push(column[i]);
                }
            }

            while (newColumn.length < this.size) {
                newColumn.push(0);
            }

            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }

            const newColumn = [];
            for (let i = column.length - 1; i >= 0; i--) {
                if (i > 0 && column[i] === column[i - 1]) {
                    newColumn.unshift(column[i] * 2);
                    this.score += column[i] * 2;
                    i--;
                    moved = true;
                } else {
                    newColumn.unshift(column[i]);
                }
            }

            while (newColumn.length < this.size) {
                newColumn.unshift(0);
            }

            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    checkGameOver() {
        // 빈 칸이 있는지 확인
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return;
                }
            }
        }

        // 인접한 타일이 같은지 확인
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (
                    (i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)
                ) {
                    return;
                }
            }
        }

        this.gameOver = true;
        this.showGameOver('게임 오버!');
    }

    checkWin() {
        if (this.won) return;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 1024) {
                    this.won = true;
                    this.showGameOver('축하합니다! 1024를 달성했습니다!');
                    return;
                }
            }
        }
    }

    showGameOver(message) {
        const gameOverDiv = document.getElementById('gameOver');
        const messageDiv = document.getElementById('gameOverMessage');
        messageDiv.textContent = message;
        gameOverDiv.classList.remove('hidden');
    }

    updateDisplay() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        gameBoard.className = `game-board grid-${this.size}`;

        // 그리드 배경 생성
        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('div');
            row.className = 'grid-row';
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                row.appendChild(cell);
            }
            gameBoard.appendChild(row);
        }

        // 타일 생성
        // 실제 그리드 셀의 크기와 위치를 읽어서 사용
        const firstRow = gameBoard.querySelector('.grid-row');
        if (!firstRow) return;
        
        const firstCell = firstRow.querySelector('.grid-cell');
        if (!firstCell) return;
        
        const cellRect = firstCell.getBoundingClientRect();
        const boardRect = gameBoard.getBoundingClientRect();
        const cellWidth = firstCell.offsetWidth;
        const cellHeight = firstCell.offsetHeight;
        
        // gap 계산 (첫 번째와 두 번째 셀 사이의 거리)
        const secondCell = firstRow.children[1];
        const gap = secondCell ? (secondCell.getBoundingClientRect().left - cellRect.right) : 10;
        
        // row의 margin-bottom 계산
        const allRows = gameBoard.querySelectorAll('.grid-row');
        const rowMarginBottom = allRows.length > 1 ? 
            (allRows[1].getBoundingClientRect().top - allRows[0].getBoundingClientRect().bottom) : 10;
        
        // 첫 번째 셀의 상대 위치 계산
        const firstCellLeft = firstCell.getBoundingClientRect().left - boardRect.left;
        const firstCellTop = firstCell.getBoundingClientRect().top - boardRect.top;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    
                    tile.style.width = cellWidth + 'px';
                    tile.style.height = cellHeight + 'px';
                    tile.style.left = (firstCellLeft + j * (cellWidth + gap)) + 'px';
                    tile.style.top = (firstCellTop + i * (cellHeight + rowMarginBottom)) + 'px';
                    
                    gameBoard.appendChild(tile);
                }
            }
        }

        // 점수 업데이트
        document.getElementById('score').textContent = this.score;
        this.updateBestScore();
    }

    updateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore1024', this.bestScore.toString());
        }
        document.getElementById('bestScore').textContent = this.bestScore;
    }

    changeSize(newSize) {
        this.size = newSize;
        this.init();
    }
}

// 게임 초기화
let game = new Game1024(4);

// 모드 선택 버튼
document.getElementById('mode4x4').addEventListener('click', () => {
    document.getElementById('mode4x4').classList.add('active');
    document.getElementById('mode5x5').classList.remove('active');
    game = new Game1024(4);
});

document.getElementById('mode5x5').addEventListener('click', () => {
    document.getElementById('mode5x5').classList.add('active');
    document.getElementById('mode4x4').classList.remove('active');
    game = new Game1024(5);
});

// 이전 단계 버튼
document.getElementById('undoBtn').addEventListener('click', () => {
    game.undo();
});

// 새 게임 버튼
document.getElementById('newGame').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    game.init();
});

// 재시작 버튼
document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    game.init();
});

// 드래그 제스처 (모바일)
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const minSwipeDistance = 30; // 최소 드래그 거리

const gameBoard = document.getElementById('gameBoard');

gameBoard.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

gameBoard.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // 최소 거리 이상 움직였는지 확인
    if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
        return;
    }
    
    // 더 많이 움직인 방향으로 판단
    if (absDeltaX > absDeltaY) {
        // 좌우 이동
        if (deltaX > 0) {
            game.move('right');
        } else {
            game.move('left');
        }
    } else {
        // 상하 이동
        if (deltaY > 0) {
            game.move('down');
        } else {
            game.move('up');
        }
    }
}, { passive: true });

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        game.move('up');
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        game.move('down');
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        game.move('left');
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        game.move('right');
    } else if (e.key === ' ') {
        e.preventDefault();
        game.undo();
    }
});

