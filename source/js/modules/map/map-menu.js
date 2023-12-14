export const initMapMenu = function () {
  const map = document.querySelector('.map');
  const btnMap = document.querySelector('.map__title');

  btnMap.addEventListener('click', (evt) => {
    evt.preventDefault();
    map.classList.toggle('is-open-menu');
  });
};
