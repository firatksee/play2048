//elements
const game_board_html = document.querySelector(".game-board");
const first_block_html = game_board_html.firstElementChild;
const high_score_html = document.querySelector(".high-score");
const current_score_html = document.querySelector(".current-score");

//game logic
set_default_localStorage("game_board", JSON.stringify(create_board(0)));
set_default_localStorage("high_score", 0);
set_default_localStorage("score", 0);

var grid_size = 4;
var game_board = JSON.parse(localStorage.getItem("game_board"));

var high_score = JSON.parse(localStorage.getItem("high_score"));
var score = JSON.parse(localStorage.getItem("score"));

var colors = {
  0: "#656c75",
  2: "#ffba08",
  4: "#f48c06",
  8: "#e85d04",
  16: "#dc2f02",
  32: "#d00000",
  64: "#9d0208",
  128: "#0466c8",
  256: "#0353a4",
  512: "#023e7d",
  1024: "#002855",
  2048: "#001845",
  4096: "#98bd6f",
  8192: "#7d8f69",
  16384: "#557153",
  32768: "#4e6c50",
  65536: "#395144",
  131072: "#61481C",
  262144: "#3c2317",
};

function draw() {
  let game_board_values = [];
  for (let row in game_board) {
    for (let block_value of game_board[row]) {
      game_board_values.push(block_value);
    }
  }

  let current_block_html = first_block_html;
  for (let i = 0; i < grid_size ** 2; i++) {
    current_block_html.firstElementChild.textContent =
      game_board_values[i] === 0 ? "" : game_board_values[i];
    current_block_html.style.background = colors[game_board_values[i]];
    current_block_html = current_block_html.nextElementSibling;
  }
  current_score_html.textContent = score;
}

function update() {
  draw();
  set_game_state(game_board, score);
  if (game_over()) {
    if (score > high_score) localStorage.setItem("high_score", score);
    game_board_html.classList.add("game-over-show");
    set_game_state(create_board(0), 0);
  }
}

function game_over() {
  if (is_game_board_full()) {
    for (let y = 0; y < grid_size; y++) {
      for (let x = 0; x < grid_size; x++) {
        try {
          if (game_board[y][x] == game_board[y + 1][x]) return false;
          if (game_board[y][x] == game_board[y][x + 1]) return false;
        } catch (e) {
          try {
            if (game_board[y][x] == game_board[y][x + 1]) return false;
          } catch (e) {
            continue;
          }
        }
      }
    }
    return true;
  }
  return false;
}

function restart() {
  game_board = create_board(0);
  if (score > high_score) {
    localStorage.setItem("high_score", score);
    high_score = score;
    high_score_html.textContent = high_score;
  }
  score = 0;
  game_board_html.classList.remove("game-over-show");
  place_2();
  draw();
  set_game_state(game_board, score);
}

function move(ax, ay, x_range, y_range) {
  let move = false;
  let mergable_board = create_board(1);
  for (let i = 0; i < grid_size - 1; i++) {
    for (let y = y_range[0]; y != y_range[1]; y += y_range[2]) {
      for (let x = x_range[0]; x != x_range[1]; x += x_range[2]) {
        if (game_board[y][x] == 0 && game_board[y + ay][x + ax] != 0) {
          game_board[y][x] = game_board[y + ay][x + ax];
          game_board[y + ay][x + ax] = 0;
          move = true;
        }
        if (
          game_board[y][x] != 0 &&
          game_board[y][x] == game_board[y + ay][x + ax] &&
          mergable_board[y][x] == 1 &&
          mergable_board[y + ay][x + ax] == 1
        ) {
          game_board[y][x] *= 2;
          score += game_board[y][x];
          game_board[y + ay][x + ax] = 0;
          mergable_board[y][x] = 0;
          move = true;
        }
      }
    }
  }
  if (move) place_2();
}

function place_2() {
  if (!is_game_board_full()) {
    while (true) {
      let y = Math.floor(Math.random() * grid_size);
      let x = Math.floor(Math.random() * grid_size);

      if (game_board[y][x] === 0) {
        game_board[y][x] = 2;
        return;
      }
    }
  }
}

function is_game_board_full() {
  for (let y in game_board) {
    for (let x of game_board[y]) {
      if (x === 0) return false;
    }
  }
  return true;
}

function is_game_board_empty() {
  for (let y in game_board) {
    for (let x of game_board[y]) {
      if (x !== 0) return false;
    }
  }
  return true;
}

function set_default_localStorage(key, value) {
  if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
}

function set_game_state(game_board_, score_) {
  localStorage.setItem("game_board", JSON.stringify(game_board_));
  localStorage.setItem("score", score_);
}

function create_board(n) {
  return [
    [n, n, n, n],
    [n, n, n, n],
    [n, n, n, n],
    [n, n, n, n],
  ];
}

//initiate the game
if (is_game_board_empty()) place_2();
draw();
high_score_html.textContent = high_score;

document.onkeydown = function (e) {
  switch (e.keyCode) {
    case 37: //left
      e.preventDefault();
      move(1, 0, [0, grid_size - 1, 1], [0, grid_size, 1]);
      update();
      break;
    case 38: //up
      e.preventDefault();
      move(0, 1, [0, grid_size, 1], [0, grid_size - 1, 1]);
      update();
      break;
    case 39: //right
      e.preventDefault();
      move(-1, 0, [grid_size - 1, 0, -1], [0, grid_size, 1]);
      update();
      break;
    case 40: //down
      e.preventDefault();
      move(0, -1, [0, grid_size, 1], [grid_size - 1, 0, -1]);
      update();
      break;
    case 82:
      restart();
      break;
  }
};

//mobile
let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;

function checkDirection() {
  let dX = touchendX - touchstartX;
  let dY = touchendY - touchstartY;
  if (Math.abs(dX) > Math.abs(dY)) {
    if (dX < 0) {
      move(1, 0, [0, grid_size - 1, 1], [0, grid_size, 1]);
      update();
    }
    if (dX > 0) {
      move(-1, 0, [grid_size - 1, 0, -1], [0, grid_size, 1]);
      update();
    }
  } else {
    if (dY < 0) {
      move(0, 1, [0, grid_size, 1], [0, grid_size - 1, 1]);
      update();
    }
    if (dY > 0) {
      move(0, -1, [0, grid_size, 1], [grid_size - 1, 0, -1]);
      update();
    }
  }
}

document.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
  touchstartY = e.changedTouches[0].screenY;
});

document.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  touchendY = e.changedTouches[0].screenY;

  checkDirection();
});
