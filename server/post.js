EMPTY = 'empty';
BLACK = 'dark';
WHITE = 'light';

class User {
  constructor() { }
}

const fs = require('fs');
const crypto = require('crypto');

const utils = require('./utils');
const game = require('./game.js');
const groupNumber = '19';

doPostRequest = function (parsedUrl, request, response, state) {
  let data = '';
  let query = '';

  request.on('data', chunk => {
    data += chunk;
  });
  request.on('end', () => {
    query = data ? JSON.parse(data) : {};

    // console.log('************************ ');
    // console.log(query);
    // console.log('************************');
    // console.log(parsedUrl.pathname);
    response.setHeader('Access-Control-Allow-Origin', '*');

    switch (parsedUrl.pathname) {
      case '/register':
        register(request, response, query);
        break;

      case '/ranking':
        ranking(request, response, query);
        break;

      case '/join':
        join(request, response, query, state);
        break;

      case '/leave':
        leave(request, response, query, state);
        break;

      case '/notify':
        notify(request, response, query, state);
        break;

      default:
        response.writeHead(404);
        response.end(`Caminho inválido [POST] '${parsedUrl.pathname}'\n`);
        break;
    }
  });

  request.on('error', (err) => {
    response.writeHead(400);
    response.end();
  });
}

// ranking
async function ranking(request, response, data) {
  const path = utils.createFile('ranking.json');

  const content = fs.readFileSync(path);
  const rankingData = JSON.parse(content);
  const ranking = [];
  Object.keys(rankingData).forEach((nick) => {
    ranking.push({
      ...rankingData[nick],
      nick,
    });
  });
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(`${JSON.stringify({"ranking": ranking})}\n\n`);
}

// register
async function register(request, response, query) {
  const path = utils.createFile('register', []);

  // criptografar a passe

  const password = crypto
    .createHash('md5')
    .update(query.pass)
    .digest('hex');

  let user = { "nick": query.nick, "pass": password };

  console.warn(user);

  fs.readFile(path, function (err, data) {
    if (!err) {
      let dados = JSON.parse(data.toString());
      let flag = 1;

      for (let x of dados) {
        // já existe um user com o nome pedido
        if (x.nick === query.nick) {
          flag = 0;

          if (x.pass === password) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(`${{}.toString()}\n\n`);
            return;
          }
          else {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(`${{ error: 'Usuário registado com outra password.' }.toString()}\n\n`);
            return;
          }
        }
      }
      // se o user ainda não está na base de dados
      if (flag === 1) {
        dados.push(user);

        fs.writeFile(path, JSON.stringify(dados), function (err) {
          if (!err) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(`${{}.toString()}\n\n`);
            return;
          }
        });
      }
    }
    else {
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      response.end('Não conseguimos processar o seu pedido de momento.\n');
      return;
    }
  });
}

// notify 
async function notify(request, response, query, state) {
  
  // login correto?
  let validPassword = false;
  try {
    validPassword = await nickPassVerification(response, query);
  } catch (error) { }
  if (!validPassword) {
    response.statusCode = 401;
    response.end(`${JSON.stringify({ error: 'Password errada\n' })}\n\n`);
    return;
  }

  const gameHash = query.game;

  // vez correta?
  if(!(state.games[gameHash]?.turn === query.nick)){
    response.writeHead(401, {'Content-Type': 'text/plain'});
    response.end('Não é a tua vez.\n');
    return;
  }

  // gameHash correta?
  if (gameHash !== state.games[gameHash]?.gamehash) {
    response.writeHead(401, { 'Content-Type': 'text/plain' });
    response.end('Não é este o teu jogo.\n');
    return -1;
  }

  const color = state.games[gameHash].game.turn;

  if (query.move)
    state.games[gameHash].game.processMove(color, query.move.row, query.move.column);

  if (color === BLACK)
    state.games[gameHash].game.turn = WHITE;
  else
    state.games[gameHash].game.turn = BLACK;

  state.games[gameHash].turn = decideTurn(state, gameHash);
  state.games[gameHash].winner = getWinner(state, gameHash);

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(`${{}.toString()}\n\n`);

  if (state.games[gameHash].winner === 'empate') {
    state.games[gameHash].winner = null;
    send(state, gameHash);
  }

  else if (state.games[gameHash].winner) {
    send(state, gameHash);
  }
  else {
    sendNoWinner(state, gameHash);
  }
}


function sendNoWinner(state, gameHash) {
  // Aqui usa o sse do update para responder ao player 
  state.games[gameHash].players.forEach(player => {
    player.response.write(`data: ${JSON.stringify({
      board: state.games[gameHash].game.board,
      count: state.games[gameHash].game.countPieces(),
      // error: '',
      skip: !state.games[gameHash].game.checkAnyValid(state.games[gameHash].game.turn),
      turn: state.games[gameHash].turn
    })}\n\n`);
  });
}

function send(state, gameHash) {
  // Aqui usa o sse do update para responder ao player 
  state.games[gameHash].players.forEach(player => {
    const responseData = {
      board: state.games[gameHash].game.board,
      count: state.games[gameHash].game.countPieces(),
      // error: '',
      skip: !state.games[gameHash].game.checkAnyValid(state.games[gameHash].game.turn),
      turn: state.games[gameHash].turn,
      winner: state.games[gameHash].winner
    };

    const path = utils.createFile('ranking.json');
    const rankingData = JSON.parse(fs.readFileSync(path));
    if (!Object.keys(rankingData).includes(player.nick)) {
        rankingData[player.nick] = {
            games: 0,
            victories: 0,
        };
    }
    rankingData[player.nick].games = rankingData[player.nick].games + 1;
    if (state.games[gameHash].winner && state.games[gameHash].winner === player.nick) {
      rankingData[player.nick].victories = rankingData[player.nick].victories + 1;
    }
    fs.writeFileSync(path, `${JSON.stringify(rankingData)}\n`);

    // console.log('===========================================');
    // console.log(responseData);
    // console.log('===========================================');
    player.response.write(`data: ${JSON.stringify(responseData)}\n\n`);
  });
}

// JOIN
async function join(request, response, query, state) {
  if (query?.group !== groupNumber) {
    response.statusCode = 404;
    response.end(`${JSON.stringify({ error: 'Grupo errado, logo servidor errado' })}\n\n`);
    return;
  }

  let validPassword = false;
  try {
    validPassword = await nickPassVerification(response, query);
  } catch (error) { }
  if (!validPassword) {
    response.statusCode = 401;
    response.end(`${JSON.stringify({ error: 'Password errada\n' })}\n\n`);
    return;
  }

  // Vai buscar um jogo livre (i.e. falta um jogador) ou cria um novo jogo.
  let gameHash = state.freeGames.pop();
  let color = 'light';
  if (!gameHash) {
    gameHash = utils.createHash();
    state.freeGames.push(gameHash);
    color = 'dark';
  }

  if (!state.games[gameHash]?.players) {
    state.games[gameHash] = {
      players: [],
      game: new game.Game(),
      gamehash: gameHash,
      turn: query.nick
    };
  }
  state.games[gameHash].players.push({
    nick: query.nick,
    color
  });

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(`${JSON.stringify({ game: gameHash, color })}\n\n`);
}

// leave
function leave(request, response, query, state) {

  if (nickPassVerification(response, query) === -1)
    return;

  const gameHash = query.game;

  if (!state.games[gameHash]) {
    let game = state.freeGames.pop();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(`${{}.toString()}\n\n`);
    return;
  } else {
    if (query.nick === state.games[gameHash].players[0].nick) {
      state.games[gameHash].winner = state.games[gameHash].players[1].nick;
    } else {
      state.games[gameHash].winner = state.games[gameHash].players[0].nick;
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(`${{}.toString()}\n\n`);

    send(state, gameHash);
  }
}

function nickPassVerification(response, query) {
  const path = utils.createFile('register');

  // criptografar para fazer a comparação de passwords
  const password = crypto
    .createHash('md5')
    .update(query.pass)
    .digest('hex');

  return new Promise((resolve, reject) => {
    // verificar se está no server certo
    fs.readFile(path, function (err, data) {
      if (err) {
        reject(false);
      } else {
        let dados = JSON.parse(data.toString());

        for (let x of dados) {
          // já existe um user com o nome pedido
          if (x.nick === query.nick) {
            if (x.pass === password) {
              resolve(true);
            }
            else {

              resolve(false);
            }
          }
        }
        resolve(false);
      }
    });
  });
}

function decideTurn(state, gameHash) {
  // console.log("jogador 0: " + state.games[gameHash].players[0].nick);
  // console.log("jogador 1: " + state.games[gameHash].players[1].nick);
  // console.log("vez: " + state.games[gameHash].turn);

  if (state.games[gameHash].players[0].nick === state.games[gameHash].turn)
    return state.games[gameHash].players[1].nick;
  else
    return state.games[gameHash].players[0].nick;
}

function getWinner(state, gameHash) {
  const pieces = state.games[gameHash].game.countPieces();

  if (!state.games[gameHash].game.checkAnyValid(WHITE) && !state.games[gameHash].game.checkAnyValid(BLACK)) {
    if (pieces.light > pieces.dark) {
      return state.games[gameHash].players[1].nick;
    }
    else if (pieces.dark > pieces.light) {
      return state.games[gameHash].players[0].nick;
    }
    else
      return 'empate';
  }

  // preto ganhou
  if (pieces.light === 0) {
    return state.games[gameHash].players[0].nick;
  }
  // branco ganhou
  else if (pieces.dark === 0) {
    return state.games[gameHash].players[1].nick;
  }

  else if (pieces.empty === 0) {

    // branca ganha
    if (pieces.light > pieces.dark) {
      return state.games[gameHash].players[1].nick;
    }
    // preto
    else if (pieces.dark > pieces.light) {
      return state.games[gameHash].players[0].nick;
    }
    else if (pieces.dark === pieces.empty)
      return 'empate';
  }
  else
    return null;
} 
