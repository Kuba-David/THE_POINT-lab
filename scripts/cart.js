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
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateBadge();
}

export function showAddToCartModal(product) {
  const modal = document.getElementById("addToCartModal");
  if (!modal) return;

  modal.querySelector("#modal-product-img").src = product.image;
  modal.querySelector("#modal-product-name").textContent = product.name;
  modal.querySelector("#modal-product-color").textContent = product.color;
  modal.querySelector("#modal-product-size").textContent = product.size;
  modal.querySelector("#modal-product-price").textContent = `${product.price} €`;

  modal.classList.remove("hidden");
  modal.classList.add("visible");

  const continueShoppingBtn = modal.querySelector("#continue-shopping");
  const modalToCartBtn = modal.querySelector("#modal-to-cart");

  const closeModal = () => {
    modal.classList.remove("visible");
    modal.classList.add("closing");
    setTimeout(() => {
      modal.classList.remove("closing");
      modal.classList.add("hidden");
    }, 200);
  };

  continueShoppingBtn.onclick = closeModal;
  modalToCartBtn.onclick = () => { window.location.href = "cart.html"; };
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
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
