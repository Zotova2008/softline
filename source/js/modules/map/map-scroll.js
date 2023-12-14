export const initScrollMap = function () {
  const tabsBtn = document.querySelectorAll('[data-btn]');
  const tabsNav = document.querySelector('[data-btn-container]');

  tabsBtn.forEach((item) => {
    item.addEventListener('click', () => {
      const railsWidth = tabsNav.clientWidth;
      const railsWidthLeft = tabsNav.getBoundingClientRect().left;
      const tabWidth = item.offsetWidth;

      const tabLeftOffset = item.getBoundingClientRect().left;
      const scrollLeftTab = Number(tabLeftOffset - (railsWidth / 2) + (tabWidth / 2) - railsWidthLeft);

      tabsNav.scrollBy({
        left: scrollLeftTab,
        behavior: 'smooth',
      });

    });
  });
};
