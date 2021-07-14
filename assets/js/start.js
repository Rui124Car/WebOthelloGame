let game;
let ranking;
alerts = new Alerts();
ranking = new Ranking();
let api = new API();
let apiGame;

function beginGame(config) {
  ranking.renderRanking();
  game = new Game(config);
  game.startGame();
}

function beginApiGame(config) {
  api.join({
    group: '19',
    nick: config.username,
    pass: localStorage.getItem(`password_${config.username}`)
  }, (response) => {
    document.querySelector('[data-render-ranking]').onclick = () => {
      ranking.renderRanking(false);
    };
    config.color = response.color
    config.gameHash = response.game
    api.defineUrl(config);
    api.startEvent();
    apiGame = new ApiGame(config);
    apiGame.inGame = 1;
    apiGame.startGame();
    document.querySelector('[data-logout]').removeAttribute('disabled');
    document.querySelector('[data-open-modal="#configModal"]').removeAttribute('disabled');
  }, (response) => {
    alerts.add(response.error);
  });
}

function registerHumanPlay(line, column) {
  if (game) {
    game.playerMove(line, column);
  } else if (apiGame) {
    apiGame.playerMove(line, column);
  } else {
    alerts.add('Ocorreu um erro');
  }
}

function reset() {
  if (game) {
    game.resetGame();
  }
}

function cleanup() {
  if (game) {
    game.cleanup();
  }
}

function configAgainstPlayer() {
  document.getElementById('configModal').querySelectorAll('input[name="color"]').forEach((element) => {
    element.setAttribute('disabled', 'disabled');
  });

  document.getElementById('configModal').querySelector('input[name="ia_level"]').setAttribute('disabled', 'disabled');
}

function configAgainstComputer() {
  document.getElementById('configModal').querySelectorAll('input[name="color"]').forEach((element) => {
    element.removeAttribute('disabled');
  });
  
  document.getElementById('configModal').querySelector('input[name="ia_level"]').removeAttribute('disabled');
}

class ApiGame extends Game {
  loaderDataAttribute = 'data-waiting-game';
  inGame = 0;

  renderWaitingForGameSpinner() {
    // document.querySelectorAll('[data-waiting-game]').forEach((elem) => elem.remove());
    // const loaderWrapperElement = document.createElement('div');
    // loaderWrapperElement.setAttribute('data-waiting-game', '');
    
    // const loaderElement = document.createElement('div');
    // loaderElement.classList.add('spinner');
    
    // const loaderTextElement = document.createElement('div');
    // loaderTextElement.textContent = 'A aguardar adversário.';

    // loaderWrapperElement.appendChild(loaderElement);
    // loaderWrapperElement.appendChild(loaderTextElement);
    // document.querySelector(this.boardSelector).appendChild(loaderWrapperElement);

    document.querySelectorAll(`[${this.loaderDataAttribute}]`).forEach((element) => element.remove());
    const canvas = document.createElement('canvas');
    canvas.setAttribute(this.loaderDataAttribute, '');
    document.querySelector(this.boardSelector).appendChild(canvas);
    new Spinner(canvas, 'A aguardar adversário');
  }

  startGame() {
    this.renderWaitingForGameSpinner();
    api.update(
      (response) => {
        apiGame.successCallback(response);
      }
    );
  }

  playCurrentPlayer() {
    this.renderButtons();
    this.checkAnyValid(HUMAN_PLAYER, this.config.color);
  }

  activateSkip() {
    const skipButton = document.querySelector('[data-skip-play]');
    this.clickableElements.push(skipButton);
    skipButton.onclick = () => {
      this.notifyPlay();
    };
    skipButton.removeAttribute('disabled');
  }

  notifyPlay(move = null) {
    this.playCoordinates = move;

    api.notify(
      {
        nick: this.config.username,
        pass: localStorage.getItem(`password_${this.config.username}`),
        game: this.config.gameHash,
        move
      }
    );
  }

  playerMove(line, column) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const square = document.getElementById(this.getSquareId(x, y));
        square.onclick = null;
        square.classList.remove('possible-play', `possible-play-${this.getPlayerColor(HUMAN_PLAYER)}`);
      }
    }
    this.board[line][column] = this.config.color;
    this.processMove(this.config.color, line, column);
    this.notifyPlay({
      row: line,
      column
    });
  }


  pontuationTable() {
    let white = 0;
    let black = 0;
    let remaining = 0;
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (this.board[x][y] === WHITE) {
                white++;
            } else if (this.board[x][y] === BLACK) {
                black++;
            } else {
                remaining++;
            }
        }
    }
    this.renderTable(white,black,remaining);
  }

  successCallback(response) {
    console.log(response);
    document.querySelector('[data-give-up]').removeAttribute('disabled');
    this.pontuationTable();
    document.querySelector('[data-logout]').setAttribute('disabled', 'disabled');
    document.querySelector('[data-open-modal="#configModal"]').setAttribute('disabled', 'disabled');
    if ((response.board || []).length) {
      this.board = response.board;
      if (this.playCoordinates) {
        this.renderBoard(this.playCoordinates.row, this.playCoordinates.column);
      } else {
        this.renderBoard();
      }
      this.playCoordinates = null;
    }
    if (response.winner) {
      alerts.add(response.winner === this.config.username ? 'Ganhaste!' : 'Perdeste!');
      this.endGame()
    } else if (response.winner === null) { 
      alerts.add('Empataste!');
      this.endGame()
    } else {
      this.renderButtons();
      if (response.turn === this.config.username) {
        this.renderGameTurn('É a sua vez de jogar.');
        if (response?.skip) {
          this.activateSkip();
        } else {
          this.playCurrentPlayer();
        }
      } else {
        this.renderGameTurn(`É a vez de ${response.turn} jogar`)
      }
    }
  }

  endGame() {
    document.querySelector('[data-logout]').removeAttribute('disabled');
    document.querySelector('[data-open-modal="#configModal"]').removeAttribute('disabled');
    document.querySelector('[data-give-up]').setAttribute('disabled', 'disabled');
    api.closeEvent();
    document.querySelector(this.boardSelector).innerHTML = '';
    this.cleanup();
    this.board = [];
    this.inGame = 0;
  }

  giveUp(){
    this.unpair();
    ranking.addNewPontuation(this.config.username);
    ranking.renderRanking();
    this.endGame();
  }

  unpair() {
    api.leave(
      {
        game: this.config.gameHash,
        nick: this.config.username,
        pass: localStorage.getItem(`password_${this.config.username}`)
      }, 
      () => {}
    )
  }
}

