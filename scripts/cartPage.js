import { getCart, saveCart, updateBadge } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the cart page
    if (!document.body.classList.contains('cartPage')) {
        return;
    }

    const container = document.getElementById('cart-container');
    const totalEl = document.getElementById('cart-total');
    if (!container || !totalEl) return;

    function renderCartItem(item, container) {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-options">
          <span class="tag">${item.color}</span> &nbsp;/&nbsp;
          <span class="tag">${item.size}</span>
        </p>
        <p class="cart-item-paragraph">${item.price} € × 
          <button class="qty-decrease">−</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-increase">+</button>
        </p>
        <button class="remove-item">Remove</button>
      </div>
    `;

        el.querySelector('.qty-decrease').addEventListener('click', () => {
            updateQty(item, item.quantity - 1);
        });

        el.querySelector('.qty-increase').addEventListener('click', () => {
            updateQty(item, item.quantity + 1);
        });

        el.querySelector('.remove-item').addEventListener('click', () => {
            updateQty(item, 0);
        });

        container.appendChild(el);
    }

    function updateQty(targetItem, newQty) {
        let cart = getCart();
        if (newQty <= 0) {
            cart = cart.filter(item =>
                !(item.id === targetItem.id &&
                    item.color === targetItem.color &&
                    item.size === targetItem.size)
            );
        } else {
            cart = cart.map(item =>
            (item.id === targetItem.id &&
                item.color === targetItem.color &&
                item.size === targetItem.size)
                ? { ...item, quantity: newQty }
                : item
            );
        }

        saveCart(cart);
        updateBadge();
        renderCart();
    }

    function renderCart() {
        const cart = getCart();
        const container = document.getElementById('cart-container');
        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = '<p class="cart-empty">No point at all. 😭</p>';
            document.getElementById('cart-total').textContent = '0 €';
            updateBadge();
            return;
        }

        let sum = 0;
        cart.forEach(item => {
            renderCartItem(item, container);
            sum += item.price * item.quantity;
        });

        document.getElementById('cart-total').textContent = `${sum.toFixed(2)} €`;
        updateBadge();
    }

    renderCart();
});

const backToCollectionBtn = document.getElementById('back-button');
if (backToCollectionBtn) {
    backToCollectionBtn.addEventListener('click', () => {
        window.location.href = 'collections.html';
    });
}

const checkoutButton = document.getElementById('checkout-button');
if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
}