// ====== ZÁKLADNÍ FUNKCE LOCAL STORAGE ======

export function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ====== AKTUALIZACE BADGE ======

export function updateBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  badge.textContent = totalItems;
  if (totalItems > 0) badge.classList.add('visible');
  else badge.classList.remove('visible');
}

// ====== PŘIDÁNÍ PRODUKTU DO KOŠÍKU ======

export function addToCart(product) {
  const cart = getCart();

  // hledání podle id + barva + velikost
  const existing = cart.find(item =>
    item.id === product.id &&
    item.color === product.color &&
    item.size === product.size
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product });
  }

  saveCart(cart);
  updateBadge();
}

// ====== INIT BADGE NAČTENÍ ======

document.addEventListener('DOMContentLoaded', () => {
  updateBadge();
});
