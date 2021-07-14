REMAINING = 60; 
NUMBER_OF_BLACK = 2; 
NUMBER_OF_WHITE = 2; 

//  Classe para facilitar a gestão dos pontos
class Point {
  x = -1;
  y = -1;

  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  
  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setPoint(x, y){
    this.x = x;
    this.y = y;
  }

  print(){
    console.log("("+this.x+";"+this.y+")");
  }

  inRange(){
    if(this.x >= 0 && this.y >=0)
      return true;
    else 
      return false;
  }
}


//  Classe para gerir o jogo
class Game {
  boardSelector = '[data-game-board]';
  boardClassName = 'game-board';
  boardRowClassName = 'game-board-row';
  boardColumnClassName = 'game-board-column';
  pieceClassName = 'game-piece';
  blackPieceClassName = `game-piece-${BLACK}`;
  whitePieceClassName = `game-piece-${WHITE}`;
  gameHash = '0';

  board = [];
  config = {
    computerColor: BLACK,
    playerColor: WHITE,
    level: 1,
    against: COMPUTER_PLAYER,
    username: '',
  };

  turn = HUMAN_PLAYER;

  clickableElements = [];

  
  constructor(config) {
    this.board = this.getCleanBoard();
    this.config = Object.assign({}, config, {
      against: config.against,
      computerColor: config.color === WHITE ? BLACK : WHITE,
      playerColor: config.color,
    });
    this.turn = this.config.playerColor === BLACK ? HUMAN_PLAYER : COMPUTER_PLAYER;
  }

  //  Obter um tabuleiro limpo, com as peças nas 4 posições iniciais
  getCleanBoard() {
    document.querySelector('[data-logout]').setAttribute('disabled', 'disabled');
    document.querySelector('[data-open-modal="#configModal"]').setAttribute('disabled', 'disabled');
    const board = [];
    for (let i=0; i<8; i++) {
      board[i] = [];
      for (let j=0; j<8; j++) {
        board[i][j] = EMPTY;
      }
    }
    board[3][3] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    board[4][4] = WHITE;
    return board;
  }

  //  Renderizar tabuleiro e começar o jogo
  startGame() {
    this.board = this.getCleanBoard();
    this.renderButtons();
    this.renderBoard();
    document.querySelector('[data-give-up]').removeAttribute('disabled');
    this.play();
  }

  //  Renderizar o botão para passar a vez
  renderButtons() {
    if (!document.querySelector(`${this.boardSelector} > button[data-skip-play]`)) {
      const skipButton = document.createElement('button');
      skipButton.setAttribute('data-skip-play', '');
      skipButton.setAttribute('disabled', 'disabled');
      skipButton.textContent = 'Passar a jogada';
      document.querySelector(this.boardSelector).appendChild(skipButton);
    }
  }

  renderGameTurn(text = null) {
    if (!text) {
      document.querySelector('[data-game-turn]').remove();
    } else {
      const boardElement = document.querySelector(`${this.boardSelector} > div#game-board`);
      if (boardElement) {
        const gameTurnElement = document.querySelector('[data-game-turn]') || document.createElement('span');
        gameTurnElement.setAttribute('data-game-turn', '');
        gameTurnElement.classList.add('game-turn');
        document.querySelector(this.boardSelector).appendChild(gameTurnElement);
        document.querySelector(this.boardSelector).insertBefore(gameTurnElement, boardElement);
        document.querySelector('[data-game-turn]').textContent = text;
      }
    }
  }

  //  Desenhar o tabuleiro conforme a informação que está dentro da classe
  renderBoard(line = -1, column = -1) {
    const boardHtml = document.createElement('div');
    boardHtml.id = 'game-board';
    boardHtml.className = this.boardClassName;
    this.board.forEach((boardRow, l) => {
      const rowHtml = document.createElement('div');
      rowHtml.className = this.boardRowClassName;
      boardRow.forEach((boardColumn, c) => {
        const columnHtml = document.createElement('div');
        columnHtml.className = this.boardColumnClassName;
        columnHtml.id = this.getSquareId(l, c);
        if (boardColumn !== EMPTY) {
          const pieceHtml = document.createElement('div');
          pieceHtml.className = this.pieceClassName;
          if (boardColumn === BLACK) {
            pieceHtml.className = `${pieceHtml.className} ${this.blackPieceClassName}`;
          }
          if (boardColumn === WHITE) {
            pieceHtml.className = `${pieceHtml.className} ${this.whitePieceClassName}`;
          }
          if (line >= 0 && column >= 0 && line === l && column === c) {
            pieceHtml.className = `${pieceHtml.className} game-piece-dropped`;
          }
          columnHtml.appendChild(pieceHtml);
        }
        rowHtml.appendChild(columnHtml);
      });
      boardHtml.appendChild(rowHtml);
    });
    const child = document.querySelector(`${this.boardSelector} > div#game-board`);
    const loaderElement = document.querySelector('[data-waiting-game]');
    if (loaderElement) {
      loaderElement.remove();
    }
    if (child) {
      document.querySelector(this.boardSelector).replaceChild(boardHtml, child);
    } else {
      document.querySelector(this.boardSelector).appendChild(boardHtml);
    }
  }

  //  Criar/atualizar a tabela que diz quantas peças de cada cor faltam
  renderTable(white, black, remaining) {
    const tableHtml = document.createElement('div');
    tableHtml.id = 'game-table';

    tableHtml.appendChild(this.getTableRow('Peças pretas', black, "DimGray"));
    tableHtml.appendChild(this.getTableRow('Peças brancas', white, "white"));
    tableHtml.appendChild(this.getTableRow('Peças restantes', remaining, "lightgray"));

    const child = document.querySelector(`${this.boardSelector} > div#game-table`);
    if (child) {
      document.querySelector(this.boardSelector).replaceChild(tableHtml, child);
    } else {
      document.querySelector(this.boardSelector).appendChild(tableHtml);
    }
  }

  //  Obter uma linha da tabela das peças restantes
  getTableRow(label, value, backgroundColor) {
    const row = document.createElement('div');
    const rowLabel = document.createElement('div');
    rowLabel.innerText = label;
    const rowValue = document.createElement('div');

    rowValue.innerText = value;
    row.style.backgroundColor = backgroundColor;

    row.appendChild(rowLabel);
    row.appendChild(rowValue);
    return row;
  }

  //  Processamento da jogada
  play() {
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

    if (white + black + remaining !== 64) {
      alerts.add('Impossible!!!');
    }
    if (remaining === 0) {
      this.declareVictory(white, black);
      return;
    } 
    let playerPlays = false;
    let computerPlays = false;
    if (this.turn === HUMAN_PLAYER) {
      //  Vez do jogador humano. Se não tiver jogada, habilitar o botão para passar a vez
      if(!(playerPlays = this.playerTurn()) && this.checkAnyValid(COMPUTER_PLAYER)) {
        const skipButton = document.querySelector('[data-skip-play]');
        this.clickableElements.push(skipButton);
        skipButton.onclick = () => {
          this.turn = COMPUTER_PLAYER;
          this.play();
        };
        skipButton.removeAttribute('disabled');
      } 
    } 
    
    //  Vez do computadpr
    else if (this.turn === COMPUTER_PLAYER) {
      computerPlays = this.computerTurn();
    }
    if (!playerPlays && !computerPlays) {
      this.declareVictory(white, black);
      return;
    } 
  }

  //  Método auxiliar para processar uma jogada humana
  playerTurn() {
    const possiblePlays = this.checkAnyValid(HUMAN_PLAYER);
    return possiblePlays;
  }

  //  Método auxiliar para processar uma jogada IA
  computerTurn() {
    const possiblePlays = this.checkAnyValid(COMPUTER_PLAYER);
    if (possiblePlays) {
      this.iaMove();
      this.renderBoard();
    }
    this.turn = HUMAN_PLAYER
    this.play();
    return true;
  }

  //  Verificar se há ou não posições válidas no tabuleiro para o jogador atual
  checkAnyValid (player, color = null){
    const playerColor = color || this.getPlayerColor(player);
    let anyValid = false;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let valid = this.getPossiblePlays(x, y, playerColor, false);
        if(valid) {
          anyValid = true;
          if (player === HUMAN_PLAYER) {
            const square = document.getElementById(this.getSquareId(x, y));
            this.clickableElements.push(square);
            square.onclick = () => registerHumanPlay(x, y);
            square.classList.add('possible-play', `possible-play-${this.config.playerColor}`);
          }
        }
      }
    }
    return anyValid;
  }

  //  Obter as jogadas possiveis para um jogador (posições em que pode jogar)
  getPossiblePlays(x, y, colour, changePossible, board=null) {
    board = board || this.board;
    let minX = x > 0 ? x - 1 : 0;
    let minY = y > 0 ? y - 1 : 0;
    let maxX = x < 7 ? x + 1 : 7;
    let maxY = y < 7 ? y + 1 : 7;
    let opposite = false;
    if (board[x][y] !== EMPTY)  {
      return false;
    }
    for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
            if (i === x && j === y)
                continue;
            let neighborColour = board[i][j];
            if (neighborColour !== EMPTY && neighborColour != colour) {
                let xOffset = i - x;
                let yOffset = j - y;
                for (let k = 1; ; k++) {
                  let scanX = x + k * xOffset;
                  let scanY = y + k * yOffset;
                  if (scanX < 0 || scanY < 0 || scanX > 7 || scanY > 7)
                    break;
                  if (board[scanX][scanY] === EMPTY) break;
                  if (board[scanX][scanY] === colour) {
                    opposite = true;
                    let s;
                    if (changePossible) {
                      for (l = 1; l < k; l++) {
                        let changeX = x + l * xOffset;
                        let changeY = y + l * yOffset;
                        board[changeX][changeY] = colour;
                      }
                    }
                    break;
                  }
                }
            }
        }
    }
    return opposite;
  }

  //  Declarar vitória, derrota ou empate
  declareVictory(white, black){
    const skipButton = document.querySelector('[data-skip-play]');
    skipButton.setAttribute('disabled', 'disabled');
    let colour = this.getPlayerColor(HUMAN_PLAYER);

    if(colour === WHITE) {
      if(white > black) {
        alerts.add('Ganhaste!');
        ranking.addNewPontuation(this.config.username);
      } else if(black > white) {
        alerts.add('Perdeste!');
      } else {
        alerts.add('Empataste!');
      }
    } else {
      if(black > white) {
        alerts.add('Ganhaste!');
        ranking.addNewPontuation(this.config.username);
      } else if(white > black) {
        alerts.add('Perdeste!');
      } else {
        alerts.add('Empataste!');
      }
    }
    document.querySelector('[data-logout]').removeAttribute('disabled');
    document.querySelector('[data-open-modal="#configModal"]').removeAttribute('disabled');
    ranking.addNewPontuation(this.config.username);
    ranking.renderRanking();
  }
  
  //  Obter os pontos do jogador humano
  getPoints(player, computer) {
    return player - computer;
  }

  //  Obter o Id da div que corresponde ao quadrado do tabuleiro da linha e coluna passados como argumento
  getSquareId(line, column) {
    return `square_${line}_${column}`;
  }

  //  Obter a cor correspondente a um jogador
  getPlayerColor(player) {
    return player === HUMAN_PLAYER ? this.config.playerColor : this.config.computerColor;
  }

  //  Faz trasnformação do tabuleiro segundo a jogada atual (do jogador humano)
  playerMove(line, column) {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const square = document.getElementById(this.getSquareId(x, y));
        square.onclick = null;
        square.classList.remove('possible-play', `possible-play-${this.getPlayerColor(HUMAN_PLAYER)}`);
      }
    }
    this.board[line][column] = this.config.playerColor;
    this.processMove(this.config.playerColor,line,column);
    this.renderBoard(line, column);
    this.turn = COMPUTER_PLAYER;
    this.play();
  }

  //  Auxiliar para a transformação do tabuleiro
  processMove(colour, x, y, board = null){ 
    board = board || this.board;

    let flag = 0;
    for(let i = x-1; i >= 0; i--) {
      if(board[i][y] !== colour && board[i][y] !== EMPTY) {
        flag = 1;
      } else if(board[i][y] === EMPTY) {
        break;
      } else if(board[i][y] === colour) {
        if (flag === 1) {
          for(let j= x-1; j > i; j--) {
            board[j][y] = board[j][y] === WHITE ? BLACK : WHITE;
          }
        }
        break;
      }
    }

    flag = 0;
    for(let i=x+1; i < 8; i++) {
      if(board[i][y] !== colour && board[i][y] !== EMPTY) {
        flag = 1;
      } else if(board[i][y] === EMPTY) {
        break;
      } else if(board[i][y] === colour) {
        if (flag === 1) {
          for(let j= x+1; j < i; j++) {
            board[j][y] = board[j][y] === WHITE ? BLACK : WHITE;
          }
        }
        break;
      }  
    }  
    
    flag = 0;
    for(let i=y-1; i >= 0; i--) {
      if(board[x][i] !== colour && board[x][i] !== EMPTY) {
        flag = 1;
      } else if(board[x][i] === EMPTY) {
        break;
      } else if(board[x][i] === colour) {
        if (flag === 1) {
          for(let j= y-1; j > i; j--) {
            board[x][j] = board[x][j] === WHITE ? BLACK : WHITE;
          }
        }
        break;
      }
    }

    flag = 0;
    for(let i=y+1; i < 8; i++) {
      if(board[x][i] !== colour && board[x][i] !== EMPTY) {
        flag = 1;
      } else if(board[x][i] === EMPTY) {
        break;
      } else if(board[x][i] === colour) {
        if (flag === 1) {
          for(let j= y+1; j < i; j++) {
            board[x][j] = board[x][j] === WHITE ? BLACK : WHITE;
          }
        }
        break;
      }
    }

    flag = 0;
    let k = y-1;
    if (k >= 0) {
      for(let i = x-1; i >= 0; i--) {
        if(board[i][k] !== colour && board[i][k] !== EMPTY) {
          flag = 1;
        } else if(board[i][k] === EMPTY) {
          break;
        } else if(board[i][k] === colour) {
          if(flag === 1) {
            let l = y-1;
            if (l >= 0) {
              for(let j = x-1; j > i; j--) {
                if (l > k) {
                  board[j][l] = board[j][l] === WHITE ? BLACK : WHITE;
                  l--;
                } else {
                  break;
                }
                if (l < 0) {
                  break;
                }
              }
            }
          }
          break;
        }
        k--;
        if (k < 0) {
          break;
        }
      }
    }

    flag = 0;
    k = y+1;
    if (k <= 7) {
      for(let i = x+1; i < 8; i++) {
        if(board[i][k] !== colour && board[i][k] !== EMPTY) {
          flag = 1;
        } else if(board[i][k] === EMPTY) {
          break;
        } else if(board[i][k] === colour) {
          if(flag === 1) {
            let l = y+1;
            if (l >= 0) {
              for(let j = x+1; j < i; j++) {
                if (l < k) {
                  board[j][l] = board[j][l] === WHITE ? BLACK : WHITE;
                  l++;
                } else {
                  break;
                }
                if (l > 7) {
                  break;
                }
              }
            }
          }
          break;
        }
        k++;
        if (k > 7) {
          break;
        }
      }
    }

    flag = 0;
    k = y-1;
    if (k >= 0) {
      for(let i = x+1; i < 8; i++) {
        if(board[i][k] !== colour && board[i][k] !== EMPTY) {
          flag = 1;
        } else if(board[i][k] === EMPTY) {
          break;
        } else if(board[i][k] === colour) {
          if(flag === 1) {
            let l = y-1;
            if (l >= 0) {
              for(let j = x+1; j < i; j++) {
                if (l > k) {
                  board[j][l] = board[j][l] === WHITE ? BLACK : WHITE;
                  l--;
                } else {
                  break;
                }
                if (l < 0) {
                  break;
                }
              }
            }
          }
          break;
        }
        k--;
        if (k < 0) {
          break;
        }
      }
    }

    flag = 0;
    k = y+1;
    if (k <= 7) {
      for(let i = x-1; i >= 0; i--) {
        if(board[i][k] !== colour && board[i][k] !== EMPTY) {
          flag = 1;
        } else if(board[i][k] === EMPTY) {
          break;
        } else if(board[i][k] === colour) {
          if(flag === 1) {
            let l = y+1;
            if (l >= 0) {
              for(let j = x-1; j > i; j--) {
                if (l < k) {
                  board[j][l] = board[j][l] === WHITE ? BLACK : WHITE;
                  l++;
                } else {
                  break;
                }
                if (l > 7) {
                  break;
                }
              }
            }
          }
          break;
        }
        k++;
        if (k > 7) {
          break;
        }
      }
    }

    return board;
  }

  //  Jogada da IA
  iaMove() {
    const newBoard = [];
    for(let x=0; x<8; x++) {
      newBoard.push([]);
      for(let y=0; y<8; y++) {
        newBoard[x].push(this.board[x][y]);
      }
    }
    let depth = parseInt(this.config.range, 10);

    let value = this.minMax(newBoard, this.config.computerColor, depth*2);

    let x = value[1].x;
    let y = value[1].y;
  
    this.board[x][y] = this.config.computerColor;
    this.processMove(this.config.computerColor, x, y);
  }

  //  Calcular o valor dos nós no minimax
  evaluateBoard(board){
    let numberOfBlacks = 0;
    let numberOfWhites = 0;
    for(let i = 0; i<8; i++){
      for(let j = 0; j<8; j++){
        if(board[i][j] === BLACK){
          numberOfBlacks++;
        }
        if(board[i][j] === WHITE){
          numberOfWhites++;
        }
      }
    }
    let result = 0;
    if (this.getPlayerColor(COMPUTER_PLAYER) === BLACK) {
      result = numberOfBlacks-numberOfWhites;
    } else {
      result = numberOfWhites-numberOfBlacks;
    }
    return result;
  }

  minMax(newBoard, color, depth){
    let bestValue = 0;

    let bestTemp = 0;
  
    let possibleMoves = this.getMoves(newBoard, color);
  
    let bestMove = new Point(-1, -1);
  
    if(depth == 0 || possibleMoves.length == 0){
      let a = this.evaluateBoard(newBoard);
      return [a, bestMove];
    }
  
    //maximize --> BLACK
    if(color === BLACK){

      bestValue = -100000;

      for(let i = 0; i<possibleMoves.length; i++){
        let move = new Point(possibleMoves[i].x, possibleMoves[i].y);
  
        let x = move.x;
        let y = move.y;

        newBoard[x][y] = BLACK;
        newBoard = this.processMove(BLACK, x, y, newBoard); 

        bestTemp = this.evaluateBoard(newBoard);

        let values = this.minMax(newBoard, WHITE, depth-1); 

        let v = values[0] - bestTemp;

        if(v > bestValue){
          bestValue = v;
          bestMove.setPoint(x, y);
        }
      }
    }
    //minimize --> WHITE
    else{

      bestValue = 100000;

      for(let i = 0; i<possibleMoves.length; i++){
        let move = new Point(possibleMoves[i].x, possibleMoves[i].y);
  
        let x = move.x;
        let y = move.y;

        newBoard[x][y] = WHITE;
        newBoard = this.processMove(WHITE, x, y, newBoard); 

        bestTemp = this.evaluateBoard(newBoard);

        let values = this.minMax(newBoard, BLACK, depth-1);

        let v = values[0] - bestTemp;

        if(v < bestValue){
          bestValue = v;
          bestMove.setPoint(x, y);
        }
      }
    } 
    return [bestValue, bestMove];
  }
 
 // Obter array com jogadas válidas (usado apenas no minimax)
  getMoves(board, color){
    let isValid = false;

    let moves = [];
    for(let i = 0; i<8; i++){
      for(let j = 0; j<8; j++){

        isValid = this.getPossiblePlays(i, j, color, false, board); 

        if (isValid){
          let p = new Point(i, j);
          moves.push(p);
        }
      }
    }
    return moves;
  }

  //  Repor o estado inicial da classe
  resetGame() {
    this.cleanup();
    this.board = this.getCleanBoard();
    this.startGame();
  }
  
  //  Remove os eventListeners dos botões
  cleanup() {
    this.clickableElements.forEach((element) => {
      element.onclick = null;
    });
  }

  //  Desistir do jogo
  giveUp() {
    ranking.addNewPontuation(this.config.username);
    ranking.renderRanking();
    document.querySelector('[data-logout]').removeAttribute('disabled');
    document.querySelector('[data-open-modal="#configModal"]').removeAttribute('disabled');
    document.querySelector('[data-give-up]').setAttribute('disabled', 'disabled');
    this.cleanup();
    this.board = [];
  }
}
