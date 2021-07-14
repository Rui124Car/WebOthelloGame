// Abrir/Fechar Modals
document.querySelectorAll("[data-open-modal]").forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault();

    const modalSelector = event.currentTarget.getAttribute("data-open-modal");
    document.querySelector(modalSelector).classList.toggle("show");
  });
});

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", (event) => {
    const modalSelector = event.currentTarget.getAttribute("data-close-modal");
    document.querySelector(modalSelector).classList.remove("show");
  });
});
