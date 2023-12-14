import { Burger } from './burger';
import { StickyHeader } from './sticky-header';

const header = document.querySelector('[data-header]');
const overlay = document.querySelector('[data-overlay]');
const burger = new Burger();

const onOverlayClose = (evt) => {
  evt.preventDefault();

  let target = evt.target;
  if (target === overlay) {
    burger._closeMenu();
  }
};

export const initBurger = function () {
  if (!header) {
    return;
  }

  burger.init();
  burger.setHeight();
  const stickyHeader = new StickyHeader();
  stickyHeader.init();

  if (overlay) {
    overlay.addEventListener('click', onOverlayClose);
  }
}
