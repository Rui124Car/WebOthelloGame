EMPTY = 'empty';
BLACK = 'dark';
WHITE = 'light';

const utils = require('./utils');

class Game {

  constructor() {
    this.turn = BLACK;
    this.board = this.getCleanBoard();
    this.gameHash = utils.createHash();
  }

  getCleanBoard() {
    const board = [];
    for (let i = 0; i < 8; i++) {
      board[i] = [];
      for (let j = 0; j < 8; j++) {
        board[i][j] = EMPTY;
      }
    }

    board[3][3] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    board[4][4] = WHITE;
    return board;
  }

  processMove(colour, x, y) {
    let board = this.board;

    board[x][y] = colour;

    let flag = 0;
    for (let i = x - 1; i >= 0; i--) {
      if (board[i][y] !== colour && board[i][y] !== EMPTY) {
        flag = 1;
      } else if (board[i][y] === EMPTY) {
        break;
      } else if (board[i][y] === colour) {
        if (flag === 1) {
          for (let j = x - 1; j > i; j--) {
            board[j][y] = board[j][y] === WHITE ? BLACK : WHITE;
          }
        }
        break;
      }
    }

    flag = 0;
    for (let i = x + 1; i < 8; i++) {
      if (board[i][y] !== colour && board[i][y] !== EMPTY) {
        flag = 1;
      } else if (board[i][y] === EMPTY) {
        break;
      } else if (board[i][y] === colour) {
        if (flag === 1) {
          for (let j = x + 1; j < i; j++) {
            board[j][y] = board[j][y] === WHITE ? BLACK : WHITE;
          }
        }
        break;
      }
    }

    flag = 0;
    for (let i = y - 1; i >= 0; i--) {
      if (board[x][i] !== colour && board[x][i] !== EMPTY) {
        flag = 1;
      } else if (board[x][i] === EMPTY) {
        break;
      } else if (board[x][i] === colour) {
        if (flag === 1) {
          for (let j = y - 1; j > i; j--) {
            board[x][j] = board[x][j] === WHITE ? BLACK : WHITE;
          }
        }
        break;
      }
    }

    flag = 0;
    for (let i = y + 1; i < 8; i++) {
      if (board[x][i] !== colour && board[x][i] !== EMPTY) {
        flag = 1;
      } else if (board[x][i] === EMPTY) {
        break;
      } else if (board[x][i] === colour) {
        if (flag === 1) {
          for (let j = y + 1; j < i; j++) {
            board[x][j] = board[x][j] === WHITE ? BLACK : WHITE;
          }
        }
        break;
      }
    }

    flag = 0;
    let k = y - 1;
    if (k >= 0) {
      for (let i = x - 1; i >= 0; i--) {
        if (board[i][k] !== colour && board[i][k] !== EMPTY) {
          flag = 1;
        } else if (board[i][k] === EMPTY) {
          break;
        } else if (board[i][k] === colour) {
          if (flag === 1) {
            let l = y - 1;
            if (l >= 0) {
              for (let j = x - 1; j > i; j--) {
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
    k = y + 1;
    if (k <= 7) {
      for (let i = x + 1; i < 8; i++) {
        if (board[i][k] !== colour && board[i][k] !== EMPTY) {
          flag = 1;
        } else if (board[i][k] === EMPTY) {
          break;
        } else if (board[i][k] === colour) {
          if (flag === 1) {
            let l = y + 1;
            if (l >= 0) {
              for (let j = x + 1; j < i; j++) {
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
    k = y - 1;
    if (k >= 0) {
      for (let i = x + 1; i < 8; i++) {
        if (board[i][k] !== colour && board[i][k] !== EMPTY) {
          flag = 1;
        } else if (board[i][k] === EMPTY) {
          break;
        } else if (board[i][k] === colour) {
          if (flag === 1) {
            let l = y - 1;
            if (l >= 0) {
              for (let j = x + 1; j < i; j++) {
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
    k = y + 1;
    if (k <= 7) {
      for (let i = x - 1; i >= 0; i--) {
        if (board[i][k] !== colour && board[i][k] !== EMPTY) {
          flag = 1;
        } else if (board[i][k] === EMPTY) {
          break;
        } else if (board[i][k] === colour) {
          if (flag === 1) {
            let l = y + 1;
            if (l >= 0) {
              for (let j = x - 1; j > i; j--) {
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
   
  countPieces() {
    let light = 0;
    let dark = 0;
    let emptyCount = 0;
    for (let i=0; i<8; i++) {
      for (let j=0; j<8; j++) {
        if(this.board[i][j] == EMPTY) {
          emptyCount++;
        } else if(this.board[i][j] == BLACK) {
          dark++;
        } else if(this.board[i][j] == WHITE) {
          light++;
        }
      }
    }
    return { light, dark, empty: emptyCount }
  }

  checkAnyValid (color){
    const playerColor = color;
    let anyValid = false;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let valid = this.getPossiblePlays(x, y, playerColor, false);
        if(valid) {
          anyValid = true;
        }
      }
    }
    return anyValid;
  }

  //  Obter as jogadas possiveis para um jogador (posições em que pode jogar)
  getPossiblePlays(x, y, colour, changePossible) {
    let board = this.board;
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
}

module.exports = {
  Game
};
