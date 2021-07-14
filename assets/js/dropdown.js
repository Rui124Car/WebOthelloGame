//  Tratamento da abertura e fecho dos menus dropdown
document.querySelectorAll('[data-toggle-dropdown]').forEach((element) => {
  element.addEventListener('click', (event) => {
    event.stopImmediatePropagation();

    const contentElement = element.parentElement.querySelector('.dropdown-content');
    if (contentElement.classList.contains('show')) {
      contentElement.classList.remove('show');
    } else {
      contentElement.classList.add('show');
    }

    contentElement.addEventListener('click', () => {

    });
  });
});
