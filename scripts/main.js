import './hamburger.js';
import './productCard.js';
import './about.js';
import './cart.js';
import './cartPage.js';
import './collection.js';

// scripts/main.js
window.addEventListener("load", () => {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      // Timeout pomůže, když se obsah ještě načítá (např. dynamicky přes JS)
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }
});
