const http = require('http');
const url  = require('url');
const fs  = require('fs');

const post = require('./server/post.js');
const get = require('./server/get.js');
const utils = require('./server/utils.js');

handleRequest = () => {
  throw 'Error message';
};

const state = {
  freeGames: [],
  games: {
    // 'gamehash': [
    //   players: [
    //     {
    //       nick: 'player_nick',
    //       color: 'player_color'
    //     }
    //   ]
    //   game: new Game(),
    //   turn: 'player_nick',
    //   skip: false,
    //   winner: null
    // ]
  }
};

const apiBaseUrl = '/server'

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const date = new Date();

  if (request.url.startsWith('/server/')) {
    parsedUrl.pathname = parsedUrl.pathname.replace(apiBaseUrl, '');
    
    switch (request.method) {
      case 'POST':
        // console.log('#################### POST #################');
        doPostRequest(parsedUrl, request, response, state);
        break;
  
      case 'GET':
        // console.log('#################### GET #################');
        doGetRequest(parsedUrl, request, response, state);
        break;
  
      default:
        response.writeHead(400, {'Content-Type': 'text/plain'});
        response.end('Não conseguimos processar o seu pedido de momento.\n');
        break;
    }
  } else {
    fs.readFile(__dirname + (request.url === '/' ? '/index.html' : request.url), function (error, data) {
      if (error) {
        response.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        response.end("Caminho não encontrado");
        return;
      }
      const headers = {};
      if (request.url.endsWith('.css')) {
        headers['Content-Type'] = 'text/css';
      } else if (request.url.endsWith('.js')) {
        headers['Content-Type'] = 'text/javascript';
      } else if (request.url.endsWith('.png')) {
        headers['Content-Type'] = 'image/png';
      }
      response.writeHead(200, headers);
      response.end(data);
    });
  }

  response.on('finish', () => {
    console.log(`[${utils.getFormatedDateTime(date)}] - [${request.method}] [${response.statusCode}] ${parsedUrl.pathname}`);
  });
});

server.listen(8119);
