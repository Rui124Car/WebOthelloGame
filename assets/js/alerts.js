//  Classe que trata da gestão do aparecimento e desaparecimento dos alertas
class Alerts {
  alerts = [];

  wrapperElement;

  constructor() {
    this.wrapperElement = document.querySelector('[data-alerts]');
    if (!this.wrapperElement) {
      this.wrapperElement = document.createElement('div');
      this.wrapperElement.setAttribute('data-alerts', '');
      this.wrapperElement.classList.add('alerts-wrapper');
      document.body.appendChild(this.wrapperElement);
    }
  }

  //  Adiciona novo alerta
  add(message, title = '') {
    const alert = {
      title,
      message,
      element: this._getAlertElement(message, title),
    };
    this.alerts.push(alert);

    setTimeout(function() {
      alert.element.remove();
    }, 6000);

    alert.element.onclick = () => alert.element.remove();

    this.renderAlert(alert);
  }

  //  Obter elemento HTML com base na mensagem e título do alerta
  _getAlertElement(message, title) {
    const element = document.createElement('div');
    element.classList.add('alert');
    if (title) {
      const titleElement = document.createElement('h4');
      titleElement.textContent = title;
      element.appendChild(titleElement);
    }
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    element.appendChild(messageElement);
    return element;
  }

  //  Desenha o alerta na DOM
  renderAlert(alert) {
    this.wrapperElement.appendChild(alert.element);
  }
}
