class Spinner {
  startDegree = 0.0;
  offsetX = 0.0;
  offsetY = 0.0;
  radius = 50;
  arcSize = 1.75 * Math.PI;
  color = '#fff';
  lineWidth = 10;

  constructor(element, message = 'A carregar') {
    this.canvas = element;  
    this.message = message;
    this.offsetX = this.canvas.width / 2;
    this.offsetY = (this.canvas.height / 2) - (this.radius / 2) + (this.lineWidth / 2);
    setInterval(this.draw.bind(this), 30);
  }

  draw() {
    const context = this.canvas.getContext('2d');
    context.lineWidth = this.lineWidth;
    context.strokeStyle = this.color;

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.startDegree += 0.10;

    context.beginPath();
    context.arc(this.offsetX, this.offsetY, this.radius, this.startDegree, this.startDegree + this.arcSize);
    context.stroke();

    context.textAlign = 'center';
    context.font = '20px Roboto';
    let message = this.message;
    for (let index = 0; index < this.startDegree % 6; index++) {
      if (index % 2 === 0) {
        message += '.';
      }
    }
    context.fillText(message, this.canvas.width / 2, this.radius * 2 + this.lineWidth * 2 + 20);
  }
}
