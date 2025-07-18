export function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}


export function updateBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = totalItems;
    badge.classList.toggle('visible', totalItems > 0);
  }

  const floatingBadge = document.getElementById('floating-cart-badge');
  if (floatingBadge) {
    floatingBadge.textContent = totalItems;
    floatingBadge.classList.toggle('visible', totalItems > 0);
  }
}


export function addToCart(product) {
  const cart = getCart();

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


function handleFloatingCartVisibility() {
  const header = document.querySelector('header');
  const floatingCart = document.getElementById('floating-cart');
  if (!header || !floatingCart) return;

  const headerBottom = header.getBoundingClientRect().bottom;
  if (headerBottom < 45) {
    floatingCart.classList.remove('hidden');
  } else {
    floatingCart.classList.add('hidden');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  updateBadge();
  handleFloatingCartVisibility();
  window.addEventListener('scroll', handleFloatingCartVisibility);
});
