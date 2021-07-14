doGetRequest = (parsedUrl, request, response, state) => {
  switch (parsedUrl.pathname) {
    case '/update':
      handleUpdate(parsedUrl, request, response, state)
      break;
  
    default:
      response.writeHead(404); 
      response.end(`Caminho inválido [GET] '${parsedUrl.pathname}'`);
      break;
  }
}

// const gameState = {};
handleUpdate = (parsedUrl, request, response, state) => {

  // {
  //   board: [],
  //   count: {
  //     dark: 4,
  //     light: 4,
  //     empty: 56,
  //   },
  //   error: '',
  //   skip: false,
  //   turn: 'playerName',
  //   winner: 'winner playerName',
  // }


  const params = new URLSearchParams(parsedUrl.search);
  let gameHash;
  if (params.has('game') && params.has('nick')) {
    gameHash = params.get('game');
    if (!Object.keys(state.games).includes(gameHash)) {
      state.games[gameHash] = {
        players: []
      };
    }
    
    const player = state.games[gameHash].players.find(p => p.nick === params.get('nick'));
    if (player) {
      player.response = response;
    }
  }

  if (state.games[gameHash].players.length === 2) {
    state.games[gameHash].players.forEach(player => {
      const headers = {    
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
      };
    
      player.response.writeHead(200, headers);
      player.response.write(`data: ${JSON.stringify({
        board: state.games[gameHash].game.board,
        count: state.games[gameHash].game.countPieces(),
        skip: state.games[gameHash].game.checkAnyValid(state.games[gameHash].turn),
        turn: state.games[gameHash].turn,
      })}\n\n`);
    });
  }
  
  request.on('close', () => {
    console.warn(`Closing game '${gameHash}'`)
    response.end();
  });
};
