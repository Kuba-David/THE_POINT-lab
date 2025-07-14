// ===== Featured produkty na index.html =====
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-grid");
  if (!container) return; // ← pokud #product-grid neexistuje, dál nic neproběhne

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
      initializeModals();
      initializeBuyButtons();
    })
    .catch((err) => console.error("Chyba při načítání db:", err));
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
    <div class="product-info">
      <div class="product-price">${p.price} €</div>
      <div class="product-title">${p.name}</div>
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

// ===== Iniciace sliderů =====
export function initializeSliders() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const slides = card.querySelectorAll(".slide");
    const dots = card.querySelectorAll(".dot");
    let currentIndex = 0;

    // Klik na tečku
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const idx = parseInt(dot.dataset.index);
        goToSlide(slides, dots, idx);
        currentIndex = idx;
      });
    });

    // Swipe support
    let startX, startY, endX, endY;
    const slider = card.querySelector(".slider");
    slider.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    slider.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      handleSwipe();
    });
    slider.addEventListener("mousedown", (e) => {
      startX = e.clientX;
      startY = e.clientY;
    });
    slider.addEventListener("mouseup", (e) => {
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

// ===== Iniciace modalů =====
export function initializeModals() {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const closeBtn = document.querySelector(".close");
  const arrowLeft = document.querySelector(".modal-arrow.left");
  const arrowRight = document.querySelector(".modal-arrow.right");
  let currentModalImages = [];
  let currentModalIndex = 0;

  document.querySelectorAll(".product-card").forEach((card) => {
    const slides = card.querySelectorAll(".slide");
    const imgs = [...card.querySelectorAll(".slide img")];
    const slider = card.querySelector(".slider");

    slider.addEventListener("click", () => {
      currentModalImages = imgs.map((img) => img.src);
      currentModalIndex = imgs.indexOf(card.querySelector(".slide.active img"));
      modalImg.src = currentModalImages[currentModalIndex];
      modal.style.display = "flex";
    });
  });

  // Šipky v modal
  arrowLeft.addEventListener("click", () => {
    currentModalIndex =
      (currentModalIndex - 1 + currentModalImages.length) %
      currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex];
  });
  arrowRight.addEventListener("click", () => {
    currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex];
  });

  // Zavření modal
  closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Swipe v modal
  let mStartX, mEndX;
  modal.addEventListener("touchstart", (e) => {
    mStartX = e.touches[0].clientX;
  });
  modal.addEventListener("touchend", (e) => {
    mEndX = e.changedTouches[0].clientX;
    if (Math.abs(mStartX - mEndX) < 30) return;
    currentModalIndex =
      mStartX - mEndX > 0
        ? (currentModalIndex + 1) % currentModalImages.length
        : (currentModalIndex - 1 + currentModalImages.length) %
          currentModalImages.length;
    modalImg.src = currentModalImages[currentModalIndex];
  });

  // Keyboard navigace
  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "flex") {
      if (e.key === "ArrowRight") arrowRight.click();
      else if (e.key === "ArrowLeft") arrowLeft.click();
      else if (e.key === "Escape") modal.style.display = "none";
    }
  });
}

import { addToCart } from "./cart.js";

export function showAddToCartModal(product) {
  const modal = document.getElementById("addToCartModal");
  if (!modal) return;

  modal.querySelector("#modal-product-img").src = product.image;
  modal.querySelector("#modal-product-name").textContent = product.name;
  modal.querySelector("#modal-product-color").textContent = product.color;
  modal.querySelector("#modal-product-size").textContent = product.size;
  modal.querySelector("#modal-product-price").textContent = `${product.price} €`;

  modal.classList.remove("hidden");

  // zavření modalu
  modal.querySelector("#continue-shopping").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // přesměrování do košíku
  modal.querySelector("#modal-to-cart").addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  // klik mimo modal-content zavře modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

// ===== Iniciace tlačítek buy-button =====
export function initializeBuyButtons() {
  document.querySelectorAll(".buy-button").forEach((btn) => {
    // Odstranit předchozí click handler, pokud nějaký existuje
    const newBtn = btn.cloneNode(true);
    btn.replaceWith(newBtn);

    newBtn.addEventListener("click", () => {
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
    btn.addEventListener("click", () => {
      colorButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}
