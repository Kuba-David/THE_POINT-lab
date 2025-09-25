import { showAddToCartModal, addToCart } from './cart.js';

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-grid");
  if (!container) return;

  fetch("db.json")
    .then((res) => res.json())
    .then((data) => {
      const prods = data.products.filter((p) => p.featured);
      prods.forEach((p) => {
        const card = createProductCard(p);
        container.appendChild(card);
        initializeOptionSelection(card);
      });

      initializeSliders();
      initializeBuyButtons();
    })
    .catch((err) => console.error("Error loading db.json:", err));
});

export function createProductCard(p) {
  const card = document.createElement("div");
  card.className = "product-card";
  const colorOptions = p.colors
    .map(
      (color) => `
    <button class="color-dot" 
            style="background-color: ${color.code}" 
            data-color="${color.name}" 
            aria-label="${color.name}">
    </button>`
    )
    .join("");

  const sizeOptions = p.sizes
    .map(
      (size) => `
    <button class="size-option" 
            data-size="${size}">
      ${size}
    </button>`
    )
    .join("");

  card.innerHTML = `
    <a href="product.html?id=${p.id}" class="product-link">
      <div class="product-image">
        <div class="slider">
          ${p.images
            .map(
              (img, idx) => `
            <div class="slide${idx === 0 ? " active" : ""}" data-index="${idx}">
              <img src="${img}" alt="${p.name} ${idx + 1}">
            </div>
          `
            )
            .join("")}
        </div>
        <div class="slider-dots">
          ${p.images
            .map(
              (_, idx) => `
            <span class="dot${
              idx === 0 ? " active" : ""
            }" data-index="${idx}"></span>
          `
            )
            .join("")}
        </div>
      </div>
    </a>
    <div class="product-info">
      <div class="product-price">${p.price} €</div>
      
      <a href="product.html?id=${p.id}" class="product-link">
        <div class="product-title">${p.name}</div>
      </a>

      <div class="product-description"><p>${p.description}</p></div>

      <div class="product-options">
        <div class="colors">${colorOptions}</div>
        <span class="divider"></span>
        <div class="sizes">${sizeOptions}</div>
      </div>

      <button class="buy-button" data-id="${p.id}">Make it real</button>
    </div>
  `;
  return card;
}

export function initializeSliders() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const slides = card.querySelectorAll(".slide");
    const dots = card.querySelectorAll(".dot");
    let currentIndex = 0;

    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation(); // Stop click from bubbling to the <a> tag
        const idx = parseInt(dot.dataset.index);
        goToSlide(slides, dots, idx);
        currentIndex = idx;
      });
    });

    let startX, startY, endX, endY;
    const slider = card.querySelector(".slider");
    slider.addEventListener("touchstart", (e) => {
      e.stopPropagation();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    slider.addEventListener("touchend", (e) => {
      e.stopPropagation();
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      handleSwipe();
    });
    slider.addEventListener("mousedown", (e) => {
       e.stopPropagation();
       startX = e.clientX;
       startY = e.clientY;
    });
    slider.addEventListener("mouseup", (e) => {
       e.stopPropagation();
       endX = e.clientX;
       endY = e.clientY;
       handleSwipe();
    });

    function handleSwipe() {
      const diffX = startX - endX;
      const diffY = startY - endY;
      if (Math.abs(diffX) < 30 || Math.abs(diffX) < Math.abs(diffY)) return;
      currentIndex =
        diffX > 0
          ? (currentIndex + 1) % slides.length
          : (currentIndex - 1 + slides.length) % slides.length;
      goToSlide(slides, dots, currentIndex);
    }
  });
}

function goToSlide(slides, dots, idx) {
  slides.forEach((s, i) => s.classList.toggle("active", i === idx));
  dots.forEach((d, i) => d.classList.toggle("active", i === idx));
}

export function initializeBuyButtons() {
  document.querySelectorAll(".buy-button").forEach((btn) => {
 
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = newBtn.closest(".product-card");
      const id = parseInt(newBtn.dataset.id, 10);

      const selectedColor = card.querySelector(".color-dot.selected")?.dataset
        .color;
      const selectedSize = card.querySelector(".size-option.selected")?.dataset
        .size;

      if (!selectedColor || !selectedSize) {
        alert("Please select a color and size.");
        return;
      }

      const name = card.querySelector(".product-title").textContent;
      const price = parseFloat(
        card.querySelector(".product-price").textContent
      );
      const image = card.querySelector(".slide.active img")?.src;

      const product = {
        id,
        name,
        price,
        image,
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
      };

      addToCart(product);
      showAddToCartModal(product);
    });
  });
}

export function initializeOptionSelection(card) {
  const colorButtons = card.querySelectorAll(".color-dot");
  const sizeButtons = card.querySelectorAll(".size-option");

  colorButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      colorButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      sizeButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}