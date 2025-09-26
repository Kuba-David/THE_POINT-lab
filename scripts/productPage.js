import { showAddToCartModal, addToCart } from './cart.js';

/**
 * Initializes the selection logic for color and size options within a given container.
 * @param {HTMLElement} container The container element.
 */
function initializeOptionSelection(container) {
  const colorButtons = container.querySelectorAll(".color-dot");
  const sizeButtons = container.querySelectorAll(".size-option");

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

/**
 * Main function to initialize the product page.
 */
function initializeProductPage() {
    const mainContainer = document.querySelector('.product-page-main');
    const spinner = document.getElementById('product-page-spinner');

    if (!mainContainer || !spinner) {
        return; // Not on the product page
    }

    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'), 10);

    if (isNaN(productId)) {
        spinner.style.display = 'none';
        mainContainer.innerHTML = '<h2 class="product-not-found">Product not found.</h2>';
        return;
    }

    fetch('db.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            const product = data.products.find(p => p.id === productId); 
            
            if (product) {
                spinner.style.display = 'none';
                displayProductDetails(product, mainContainer);
            } else {
                spinner.style.display = 'none';
                mainContainer.innerHTML = `<h2 class="product-not-found">Product not found with ID: ${productId}</h2>`;
            }
        })
        .catch(err => {
            console.error("Error loading product data:", err);
            spinner.style.display = 'none';
            mainContainer.innerHTML = '<h2 class="product-not-found">Error loading product details. Please try again later.</h2>';
        });
}

/**
 * Creates and renders the full product details into the main container.
 * @param {object} p The product object from the database.
 * @param {HTMLElement} mainContainer The <main> element to inject content into.
 */
function displayProductDetails(p, mainContainer) {
    document.title = `${p.name} | THE POINT`;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'product-content-wrapper';

    const mainImageHTML = `<img src="${p.images[0]}" alt="${p.name}">`;
    const thumbnailsHTML = p.images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}">
             <img src="${img}" alt="Thumbnail ${index + 1}">
        </div>
    `).join('');

    const colorOptions = p.colors.map(color => `
        <button class="color-dot" 
                style="background-color: ${color.code}" 
                data-color="${color.name}" 
                aria-label="${color.name}">
        </button>
    `).join("");

    const sizeOptions = p.sizes.map(size => `
        <button class="size-option" 
                data-size="${size}">
            ${size}
        </button>
    `).join("");

    contentWrapper.innerHTML = `
        <section class="product-image-section">
            <div class="main-product-image">
                ${mainImageHTML}
            </div>
            <div class="product-gallery-thumbnails">
                ${thumbnailsHTML}
            </div>
        </section>
        <section class="product-details-section">
            <h2 class="product-page-title">${p.name}</h2>
            <p class="product-page-description">${p.description}</p>
            <div class="product-page-options">
                <div class="option-group">
                    <span class="option-label">Colors:</span>
                    <div class="colors">${colorOptions}</div>
                </div>
                <div class="option-group">
                    <span class="option-label">Sizes:</span>
                    <div class="sizes">${sizeOptions}</div>
                </div>
            </div>
            <section class="product-specifications">
                <div class="product-specifications-item">
                    <h4>Substance:</h4>
                    <p>Weight <strong>150g/m²</strong>. 100% Ringspun combed cotton.<br>2-layer collar with elastane. Shoulder-to-shoulder neck tape. Preshrunk. Double-stitched.</p>
                </div>
                <div class="product-specifications-item">
                    <h4>Care:</h4>
                    <p>Wash at 30°. Iron inside out.<br>Or... just give it to your mom.</p>
                </div>
            </section>
            <div class="product-page-price">${p.price} €</div>
            <button class="buy-button" id="product-page-buy-button">Make it real</button>
        </section>
    `;

    mainContainer.appendChild(contentWrapper);
    setupProductPageInteractivity(p, contentWrapper);
}

/**
 * Adds event listeners to the dynamically created product page elements.
 * @param {object} product The product object.
 * @param {HTMLElement} wrapper The .product-content-wrapper element.
 */
function setupProductPageInteractivity(product, wrapper) {
    const mainImageContainer = wrapper.querySelector('.main-product-image');
    const mainImage = mainImageContainer.querySelector('img');
    const thumbnails = wrapper.querySelectorAll('.thumbnail');
    const detailsSection = wrapper.querySelector('.product-details-section');

    // --- REVISED: Image Zoom Logic for Desktop and Mobile ---
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // State variables for mobile zoom/pan
    let scale = 1, lastScale = 1;
    let pointX = 0, pointY = 0;
    let start = { x: 0, y: 0 };
    let panning = false;
    let initialDistance = 0;
    let lastDoubleTap = 0;

    function resetZoom() {
        scale = 1;
        lastScale = 1;
        pointX = 0;
        pointY = 0;
        setTransform();
    }

    // Gallery thumbnail clicks
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            mainImage.src = thumb.querySelector('img').src;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            if (isTouchDevice) {
                resetZoom();
            }
        });
    });

    if (mainImageContainer && mainImage) {
        if (isTouchDevice) {
            // --- Mobile: Advanced pinch-to-zoom and pan ---
            function setTransform() {
                mainImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
            }

            mainImageContainer.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touches = e.touches;

                // Double tap to reset zoom
                const now = new Date().getTime();
                if (now - lastDoubleTap < 300) {
                    resetZoom();
                    return; // Prevent other actions on double tap
                }
                lastDoubleTap = now;

                if (touches.length === 1) {
                    panning = true;
                    start.x = touches[0].clientX - pointX;
                    start.y = touches[0].clientY - pointY;
                } else if (touches.length === 2) {
                    panning = false; 
                    initialDistance = Math.hypot(
                        touches[0].pageX - touches[1].pageX,
                        touches[0].pageY - touches[1].pageY
                    );
                }
            }, { passive: false });

            mainImageContainer.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touches = e.touches;

                if (panning && touches.length === 1 && scale > 1) {
                    pointX = touches[0].clientX - start.x;
                    pointY = touches[0].clientY - start.y;

                    // Constrain panning within boundaries
                    const rect = mainImageContainer.getBoundingClientRect();
                    const maxX = (rect.width * scale - rect.width) / 2;
                    const maxY = (rect.height * scale - rect.height) / 2;
                    pointX = Math.max(-maxX, Math.min(maxX, pointX));
                    pointY = Math.max(-maxY, Math.min(maxY, pointY));

                    setTransform();
                } else if (touches.length === 2) {
                    panning = false;
                    const newDistance = Math.hypot(
                        touches[0].pageX - touches[1].pageX,
                        touches[0].pageY - touches[1].pageY
                    );
                    const scaleRatio = newDistance / initialDistance;
                    scale = Math.min(Math.max(1, lastScale * scaleRatio), 4); // Clamp scale
                    setTransform();
                }
            }, { passive: false });

            mainImageContainer.addEventListener('touchend', () => {
                panning = false;
                lastScale = scale;
            });

        } else {
            // --- Desktop: Click-to-zoom logic ---
            let isZoomed = false;
            mainImageContainer.style.cursor = 'zoom-in';

            mainImageContainer.addEventListener('mousemove', (e) => {
                if (!isZoomed) return;
                const rect = mainImageContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPercent = (x / rect.width) * 100;
                const yPercent = (y / rect.height) * 100;
                mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            });

            mainImageContainer.addEventListener('click', () => {
                isZoomed = !isZoomed;
                if (isZoomed) {
                    mainImage.style.transform = 'scale(2)';
                    mainImageContainer.style.cursor = 'zoom-out';
                } else {
                    mainImage.style.transform = 'scale(1)';
                    mainImage.style.transformOrigin = 'center center';
                    mainImageContainer.style.cursor = 'zoom-in';
                }
            });
        }
    }
    // --- END: Image Zoom Logic ---

    // Initialize color/size selection
    initializeOptionSelection(detailsSection);
    
    // Add to cart button click
    detailsSection.querySelector('#product-page-buy-button').addEventListener('click', () => {
        const selectedColor = detailsSection.querySelector(".color-dot.selected")?.dataset.color;
        const selectedSize = detailsSection.querySelector(".size-option.selected")?.dataset.size;
        
        if (!selectedColor || !selectedSize) {
            alert("Please select a color and size."); // For now, simple feedback
            return;
        }

        const itemToAdd = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            color: selectedColor,
            size: selectedSize,
            quantity: 1,
        };

        addToCart(itemToAdd);
        showAddToCartModal(itemToAdd);
    });
}

// Run the initialization function when the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", initializeProductPage);

