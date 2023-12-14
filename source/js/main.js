import { initAccordions } from './modules/accordion/init-accordion';
import { initMap } from './modules/map/map';
import { initSlider } from './modules/slider';
import { iosVhFix } from './utils/ios-vh-fix';


// ---------------------------------

window.addEventListener('DOMContentLoaded', () => {

  // Utils
  // ---------------------------------

  iosVhFix();

  // Modules
  // ---------------------------------

  // все скрипты должны быть в обработчике 'DOMContentLoaded', но не все в 'load'
  // в load следует добавить скрипты, не участвующие в работе первого экрана
  window.addEventListener('load', () => {
    initMap();
    initSlider();
    initAccordions();
  });
});

// ---------------------------------
