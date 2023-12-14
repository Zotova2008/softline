import { initMapMenu } from './map-menu';
import { initScrollMap } from './map-scroll';

export const initMap = function () {
  const mapContainer = document.querySelector('[data-map]');
  const mapBtn = mapContainer.querySelectorAll('[data-btn]');
  const mapBodyText = document.querySelector('[data-map-cities]');
  const dataCities = '../data/data-map.json';

  let dataMap;
  let nameCity;
  let positionX;
  let positionY;
  let size;
  let citiesList;

  const getData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
    }
    return await response.json();
  };

  const templateMapText = function (box, map, city, x, y, z) {
    const span = document.createElement('span');
    span.className = `map__city map__city--${z} is-active`;
    span.setAttribute('data-city', map);
    span.innerText = city;
    span.setAttribute('style', `left: ${x}%; top: ${y}%`);
    box.append(span);
  };

  getData(dataCities).then((data) => {
    data.forEach((element) => {
      dataMap = element['dataMap'];

      element['city'].forEach((item) => {
        nameCity = item['nameCity'];
        positionX = item['positionX'];
        positionY = item['positionY'];
        size = item['size'];
        templateMapText(mapBodyText, dataMap, nameCity, positionX, positionY, size);
      });

    });
  });


  mapBtn.forEach((item) => {
    item.addEventListener('click', () => {

      // Обработка самой кнопки
      mapBtn.forEach((element) => element.classList.remove('is-active'));

      if (!(item.classList.contains('is-active'))) {
        item.classList.add('is-active');
      }

      const dataBtnMap = item.dataset.btn;

      // Обработка городов
      citiesList = mapContainer.querySelectorAll('[data-city]');

      citiesList.forEach((element) => element.classList.remove('is-active'));

      if (dataBtnMap === 'all') {
        citiesList.forEach((element) => element.classList.add('is-active'));
      } else {
        citiesList.forEach((elm) => {
          const cityData = elm.dataset.city;
          if (cityData === dataBtnMap) {
            elm.classList.add('is-active');
          }
        });
      }
    });
  });


  initMapMenu();
  initScrollMap();
};
