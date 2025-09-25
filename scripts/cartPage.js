import { getCart, saveCart, updateBadge } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cart-container');
  // If this container doesn't exist, we're not on the cart page, so do nothing.
  if (!container) {
    return;
  }

  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-button');
  const backToCollectionBtn = document.getElementById('back-button');
  const summarySpan = totalEl ? totalEl.parentElement : null;

  // This check is now more of a safeguard in case of partial HTML.
  if (!totalEl || !checkoutBtn || !summarySpan) {
    console.error("Some cart elements might be missing from the cart.html page.");
    return;
  }

  function renderCartItem(item, container) {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-options">
          <span class="tag">${item.color}</span> &nbsp;/&nbsp;
          <span class="tag">${item.size}</span>
        </p>
        <p class="cart-item-paragraph">${item.price} € × 
          <button class="qty-decrease" aria-label="Decrease quantity">−</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-increase" aria-label="Increase quantity">+</button>
        </p>
        <button class="remove-item">Remove</button>
      </div>
    `;

    el.querySelector('.qty-decrease').addEventListener('click', () => updateQty(item, item.quantity - 1));
    el.querySelector('.qty-increase').addEventListener('click', () => updateQty(item, item.quantity + 1));
    el.querySelector('.remove-item').addEventListener('click', () => updateQty(item, 0));

    container.appendChild(el);
  }

  function updateQty(targetItem, newQty) {
    let cart = getCart();
    if (newQty <= 0) {
      cart = cart.filter(item =>
        !(item.id === targetItem.id && item.color === targetItem.color && item.size === targetItem.size)
      );
    } else {
      cart = cart.map(item =>
        (item.id === targetItem.id && item.color === targetItem.color && item.size === targetItem.size)
          ? { ...item, quantity: newQty }
          : item
      );
    }
    saveCart(cart);
    renderCart();
  }

  function renderCart() {
    const cart = getCart();
    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = '<p class="cart-empty">No point at all. 😭</p>';
      summarySpan.style.display = 'none'; // Hide total
      checkoutBtn.disabled = true; // Disable checkout button
    } else {
      summarySpan.style.display = 'block'; // Show total
      checkoutBtn.disabled = false; // Enable checkout button
      let sum = 0;
      cart.forEach(item => {
        renderCartItem(item, container);
        sum += item.price * item.quantity;
      });
      totalEl.textContent = `${sum} €`;
    }
    updateBadge();
  }

  // Initial Render
  renderCart();

  // Button Event Listeners
  if (backToCollectionBtn) {
    backToCollectionBtn.addEventListener('click', () => {
      window.location.href = 'collections.html';
    });
  }
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      window.location.href = 'checkout.html';
    });
  }
});

