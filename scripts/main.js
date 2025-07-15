import './hamburger.js';
import './productCard.js';
import './about.js';
import './cart.js';
import './cartPage.js';
import './collection.js';

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
