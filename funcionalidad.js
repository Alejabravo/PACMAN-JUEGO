let poweredUp = false;
let powerTimer = null;
let score = 0;
let lives = 3;

const game = document.getElementById('game');
const scoreDisplay = document.createElement('div');
scoreDisplay.style.color = 'white';
scoreDisplay.style.marginTop = '10px';
document.body.appendChild(scoreDisplay);

const layout = [
  1,1,1,1,1,1,1,1,1,1,
  1,6,0,0,0,1,0,0,6,1,
  1,0,1,1,0,1,0,1,0,1,
  1,0,1,0,0,0,0,1,0,1,
  1,0,1,0,1,1,0,1,0,1,
  1,0,1,0,0,0,0,1,0,1,
  1,0,1,1,1,1,1,1,0,1,
  1,0,0,0,0,0,0,0,0,1,
  1,2,1,1,3,4,7,1,0,1,
  1,1,1,1,1,1,1,1,1,1
];

const width = 10;
let ghostPositions = [layout.indexOf(3), layout.indexOf(4)];
const ghostStartPositions = [...ghostPositions];

function draw() {
  game.innerHTML = '';
  layout.forEach((cell, i) => {
    const div = document.createElement('div');
    div.classList.add('cell');
    if (cell === 1) div.classList.add('wall');
    else if (cell === 0) div.classList.add('pellet');
    else if (cell === 6) div.classList.add('power-pellet');
    else if (cell === 2) div.classList.add('pacman');
    else if (cell === 3) div.classList.add('ghost', 'red');
    else if (cell === 4) div.classList.add('ghost', 'pink');
    else if (cell === 7) div.classList.add('cherry');
    else div.classList.add('empty');
    game.appendChild(div);
  });

  updateGhostVulnerability();
  scoreDisplay.textContent = `Puntuación: ${score} — Vidas: ${lives}`;
}

function updateGhostVulnerability() {
  const ghostDivs = document.querySelectorAll('.ghost');
  ghostDivs.forEach(ghost => {
    if (poweredUp) {
      ghost.classList.add('vulnerable');
    } else {
      ghost.classList.remove('vulnerable');
    }
  });
}

function moveGhosts() {
  const pacIndex = layout.indexOf(2);
  const pacRow = Math.floor(pacIndex / width);
  const pacCol = pacIndex % width;

  ghostPositions.forEach((pos, index) => {
    const ghostId = layout[pos];
    const ghostRow = Math.floor(pos / width);
    const ghostCol = pos % width;

    const directions = [
      { dir: -width, row: -1, col: 0 },
      { dir: width, row: 1, col: 0 },
      { dir: -1, row: 0, col: -1 },
      { dir: 1, row: 0, col: 1 }
    ];

    directions.sort((a, b) => {
      const distA = Math.abs((ghostRow + a.row) - pacRow) + Math.abs((ghostCol + a.col) - pacCol);
      const distB = Math.abs((ghostRow + b.row) - pacRow) + Math.abs((ghostCol + b.col) - pacCol);
      return distA - distB;
    });

    for (let d of directions) {
      const newIndex = pos + d.dir;

      if (layout[newIndex] === 2) {
        if (poweredUp) {
          score += 200;
          ghostPositions[index] = ghostStartPositions[index];
          layout[pos] = 5;
          layout[ghostStartPositions[index]] = ghostId;
        } else {
          loseLife();
          return;
        }
        break;
      }

      if (![1, 3, 4].includes(layout[newIndex])) {
        layout[pos] = 5;
        layout[newIndex] = ghostId;
        ghostPositions[index] = newIndex;
        break;
      }
    }
  });

  draw();
}

function handleKey(e) {
  const pacIndex = layout.indexOf(2);
  let newIndex = pacIndex;

  switch(e.key) {
    case 'ArrowUp':    newIndex -= width; break;
    case 'ArrowDown':  newIndex += width; break;
    case 'ArrowLeft':  newIndex -= 1;     break;
    case 'ArrowRight': newIndex += 1;     break;
    default: return;
  }

  if (layout[newIndex] === 1) return;

  if (layout[newIndex] === 0) score += 10;
  if (layout[newIndex] === 6 || layout[newIndex] === 7) {
    poweredUp = true;
    score += (layout[newIndex] === 6) ? 50 : 100;
    clearTimeout(powerTimer);
    powerTimer = setTimeout(() => {
      poweredUp = false;
      draw();
    }, 8000);
  }

  if ([3, 4].includes(layout[newIndex])) {
    const ghostId = layout[newIndex];
    const ghostIndex = ghostPositions.indexOf(newIndex);

    if (poweredUp) {
      score += 200;
      ghostPositions[ghostIndex] = ghostStartPositions[ghostIndex];
      layout[newIndex] = 2;
      layout[ghostStartPositions[ghostIndex]] = ghostId;
    } else {
      loseLife();
      return;
    }
  } else {
    layout[newIndex] = 2;
  }

  layout[pacIndex] = 5;
  draw();
}

function loseLife() {
  lives--;
  if (lives <= 0) {
    endGame();
  } else {
    // Reset Pac-Man position
    const currentPac = layout.indexOf(2);
    layout[currentPac] = 5;
    layout[11] = 2; // posición de reinicio
    draw();
  }
}

function endGame() {
  document.removeEventListener('keydown', handleKey);
  clearInterval(ghostInterval);

  const msg = document.createElement('div');
  msg.textContent = `🟥 Game Over — Puntuación: ${score}`;
  msg.style.color = 'white';
  msg.style.fontSize = '24px';
  msg.style.marginTop = '20px';
  document.body.appendChild(msg);
}

document.addEventListener('keydown', handleKey);

draw();
const ghostInterval = setInterval(moveGhosts, 1000);
