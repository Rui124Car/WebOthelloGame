//  Associar valores obtidos do form de login
document.querySelector('[data-login-form]').addEventListener('submit', (event) => {
  event.preventDefault();

  const username = event.currentTarget.querySelector('input[name="username"]').value;
  const password = event.currentTarget.querySelector('input[name="password"]').value;

  const success_callback = () => {
    localStorage.setItem("username", username);
    localStorage.setItem(`password_${username}`, password);
    
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('configModal').classList.add('show');
    
    document.querySelector('[data-user-login]').classList.remove('show');
    document.querySelector('[data-user-name]').textContent = username;
    document.querySelector('[data-user-info]').classList.add('show');
  };
  const error_callback = (response) => {
    alerts.add(response.error)
  };

  api.register({ "nick": username, "pass": password }, success_callback, error_callback);
});

//  Associar valores obtidos do form da configuração do jogo
document.querySelector('[data-config-form]').addEventListener('submit', (event) => {
  event.preventDefault();

  const range = event.currentTarget.querySelector('input[name="ia_level"]').value;
  const againstInputs = event.currentTarget.querySelectorAll('input[name="against"]');
  const colorInputs = event.currentTarget.querySelectorAll('input[name="color"]');

  let against;
  for (let i=0; i<againstInputs.length; i++) {
    if (againstInputs[i].checked) {
      against = againstInputs[i].value;
      break;
    }
  }
  let color;
  for (let i=0; i<colorInputs.length; i++) {
    if (colorInputs[i].checked) {
      color = colorInputs[i].value;
      break;
    }
  }

  if (against && range && color) {
    document.getElementById('configModal').classList.remove('show');
    document.getElementById('game')?.classList?.add('show-flex');
    const username = document.querySelector('[data-user-name]').textContent;
    if (against === 'computer') {
      beginGame({against, range, color, username});
    } else {
      beginApiGame({against, username});
    }
  }
});

document.querySelectorAll('input[name="against"][value="player"]').onchange = () => {
  console.log('player');
};

//  Botão de desistir --> click
document.querySelector('[data-give-up]').addEventListener('click', () => {
  if(game) {
    game.giveUp();
  } 
  else if(apiGame) {
    apiGame.giveUp();
    api.closeEvent();
  }

  alerts.add('Como desistiu, perdeu');

  document.querySelector('[data-logout]').removeAttribute('disabled');
  document.querySelector('[data-open-modal="#configModal"]').removeAttribute('disabled');
  if(game) {
    var answer = window.confirm("Começar novo jogo?");
    if (answer) {
      game.startGame();
    }
    else {
      document.querySelector('[data-user-login]').classList.add('show');
      document.querySelector('[data-user-name]').textContent = '';
      document.querySelector('[data-user-info]').classList.remove('show');
      document.getElementById('game')?.classList?.remove('show-flex');
      cleanup();
  }  
}
});
//  Botão de logout --> click
document.querySelector('[data-logout]').addEventListener('click', () => {
  document.querySelector('[data-user-login]').classList.add('show');
  document.querySelector('[data-user-name]').textContent = '';
  document.querySelector('[data-user-info]').classList.remove('show');
  document.getElementById('game')?.classList?.remove('show-flex');
  cleanup();
  if(apiGame) {
    api.closeEvent();
  }
});
