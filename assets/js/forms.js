 // Adicionar o valor selecionado no range slider à label do campo
 document.querySelectorAll('[data-range-input]').forEach((element) => {
  element.querySelector('input[type="range"]').addEventListener('change', (event) => {
    let span = element.querySelector('label > span');
    if (!span) {
      span = document.createElement('span');
      element.querySelector('label').appendChild(span);
    }
    span.textContent = ` (${event.currentTarget.value})`;
  });
});
