// import Swiper JS
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
// import Swiper styles
// import 'swiper/css';

export const initSlider = () => {
  const swiperSlider = function () {

    new Swiper('.slider__swiper', {
      modules: [Navigation, Pagination],
      slidesPerView: 1,
      navigation: {
        nextEl: '.slider__arrow--next',
        prevEl: '.slider__arrow--prev',
      },
      // pagination: {
      //   el: '.slider__pagination',
      //   bulletActiveClass: 'is-active',
      //   bulletClass: 'slider__bullet',
      //   renderBullet(index, className) {
      //     return `<button class="${className}" type="button" aria-label="Переключить на слайд №${index}></button>`;
      //   },
      //   clickable: true,
      // },
      pagination: {
        el: '.slider__pagination',
        bulletActiveClass: 'is-active',
        bulletClass: 'slider__bullet',
        renderBullet(index, className) {
          return `<button class="${className}" type="button" aria-label="Слайд №${index}"></button>`;
        },
        clickable: true,
      },
    });
  };

  swiperSlider();
};
