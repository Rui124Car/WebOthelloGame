class API {
  // baseUrl = 'http://twserver.alunos.dcc.fc.up.pt:8008';
  baseUrl = 'http://twserver.alunos.dcc.fc.up.pt:8119/server';
  genericErrorMessage = 'Ocurreu um erro ao processar o pedido';
  updateUrl;
  eventSource;

  constructor() {}

  defineUrl(config){
    let queryString = '';
    const command = 'update';

    const queryParams = new URLSearchParams({nick: config.username, game: config.gameHash});
    
    queryString = `?${queryParams.toString()}`
    const url = `${this.baseUrl}/${command}${queryString}`;

    this.updateUrl = url;
  }

  
  startEvent(){
    this.eventSource = new EventSource(this.updateUrl);
  }

  closeEvent(){
    this.eventSource.close();
  }
  
  _post(command, data, successCallback, errorCallback = null) {
    const postUrl = `${this.baseUrl}/${command}`;

    fetch(postUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }).then(function(response){
      if(response.ok){
        console.log(response);
        if(command === 'register' || command === 'leave' || command === 'notify')
          successCallback();
        else {
          console.log(response);
          response.json().then(successCallback);
        }
      }
    }).catch(() => typeof errorCallback === 'function' ? errorCallback() : null);
  }

  register(data, successCallback, errorCallback = null) {
    this._post("register", data, successCallback, errorCallback);
  }

  join(data, successCallback, errorCallback = null) {
    this._post("join", data, successCallback, errorCallback);
  }
  
  ranking(successCallback, errorCallback = null) {
    this._post("ranking", {}, successCallback, errorCallback);
  }

  notify(data, successCallback, errorCallback = null){
    this._post("notify", data, successCallback, errorCallback);
  }

  leave(data, successCallback){
    this.eventSource.close();
    this._post("leave", data, successCallback);
  }
  
  update(successCallback, errorCallback = null){
    this.eventSource.onmessage = function(event) {
      const response = JSON.parse(event.data);
      successCallback(response);
    } 
  }
}
