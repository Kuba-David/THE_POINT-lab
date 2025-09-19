import './hamburger.js';
import './productCard.js';
import './about.js';
import './contactForm.js';
import './cart.js';
import './cartPage.js';
import './collection.js';

window.addEventListener('DOMContentLoaded', (event) => {

  window.addEventListener("load", () => {
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  });

  function handleScrollBadgeVisibility() {
    const header = document.querySelector('header');
    const floatingCart = document.getElementById('floating-cart');
    if (!header || !floatingCart) return;

    const headerBottom = header.getBoundingClientRect().bottom;

    if (headerBottom < 0) {
      floatingCart.classList.remove('hidden');
    } else {
      floatingCart.classList.add('hidden');
    }
  }

  window.addEventListener('scroll', handleScrollBadgeVisibility);
  document.addEventListener('DOMContentLoaded', handleScrollBadgeVisibility);



  const point = document.querySelector('.moving-point-wrapper');
  if (!point) return;
  function movePoint() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const pointSize = point.offsetWidth;
      const newX = Math.random() * (screenWidth - pointSize);
      const newY = Math.random() * (screenHeight - pointSize);
      point.style.transform = `translate(${newX}px, ${newY}px)`;
  }
  movePoint();
  setInterval(movePoint, 8000); 
});