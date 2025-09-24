import { showAddToCartModal, addToCart } from './cart.js';

/**
 * Initializes the selection logic for color and size options within a given container.
 * This function is self-contained to avoid cross-script dependencies.
 * @param {HTMLElement} container The container element (e.g., product card or details section).
 */
function initializeOptionSelection(container) {
  const colorButtons = container.querySelectorAll(".color-dot");
  const sizeButtons = container.querySelectorAll(".size-option");

  colorButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Prevent the click from bubbling up to the parent link
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
 * It checks if we are on the product page by looking for a specific element.
 */
function initializeProductPage() {
    const mainContainer = document.querySelector('.product-page-main');
    // If this container doesn't exist, we're not on the product page, so do nothing.
    if (!mainContainer) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'), 10);

    // If no valid ID is found in the URL, show an error.
    if (isNaN(productId)) {
        console.error('Product ID is missing or invalid');
        mainContainer.innerHTML = '<h2 class="product-not-found">Product not found.</h2>';
        return;
    }

    // Fetch the product database
    fetch('db.json')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            const product = data.products.find(p => p.id === productId); 
            
            if (product) {
                displayProductDetails(product);
            } else {
                console.error('Product not found with ID:', productId);
                mainContainer.innerHTML = '<h2 class="product-not-found">Product not found.</h2>';
            }
        })
        .catch(err => {
            console.error("Error loading product data:", err);
            mainContainer.innerHTML = '<h2>Error loading product details. Please try again later.</h2>';
        });
}

/**
 * Renders the product details into the page's placeholder elements.
 * @param {object} p The product object from the database.
 */
function displayProductDetails(p) {
    document.title = `${p.name} | THE POINT`;

    const mainImageContainer = document.getElementById('main-product-image');
    const galleryContainer = document.getElementById('product-gallery-thumbnails');
    const detailsContainer = document.getElementById('product-details-content');

    // Check if all required containers exist
    if (!mainImageContainer || !galleryContainer || !detailsContainer) {
        console.error('One or more product page elements are missing from the HTML.');
        return;
    }
    
    // Render Main Image
    mainImageContainer.innerHTML = `<img src="${p.images[0]}" alt="${p.name}">`;

    // Render Gallery Thumbnails
    galleryContainer.innerHTML = p.images.map((img, index) => `
        <img src="${img}" alt="Thumbnail ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}">
    `).join('');

    // Prepare Color and Size options HTML
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

    // Render Product Details
    detailsContainer.innerHTML = `
        <h2 class="product-page-title">${p.name}</h2>
        <p class="product-page-description">${p.description}</p>
        <div class="product-page-price">${p.price} €</div>
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
            <h4>Substance:</h4>
            <p>Weight <strong>150g/m²</strong>. 100% Ringspun combed cotton.</p>
            <p>2-layer collar with elastane. Shoulder-to-shoulder neck tape. Preshrunk. Double-stitched.</p>
            <h4>Care:</h4>
            <p>Wash at 30°. Iron inside out.<br>Or... just give it to your mom.</p>
        </section>
        <button class="buy-button" id="product-page-buy-button">Make it real</button>
    `;

    // Activate all interactive elements now that they exist in the DOM
    setupProductPageInteractivity(p);
}

/**
 * Adds event listeners to the dynamically created product page elements.
 * @param {object} product The product object.
 */
function setupProductPageInteractivity(product) {
    const mainImage = document.querySelector('#main-product-image img');
    const thumbnails = document.querySelectorAll('.thumbnail');

    // Gallery thumbnail clicks
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            mainImage.src = thumb.src;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    const optionsContainer = document.getElementById('product-details-content');
    initializeOptionSelection(optionsContainer);
    
    // Add to cart button click
    document.getElementById('product-page-buy-button').addEventListener('click', () => {
        const selectedColor = optionsContainer.querySelector(".color-dot.selected")?.dataset.color;
        const selectedSize = optionsContainer.querySelector(".size-option.selected")?.dataset.size;
        
        if (!selectedColor || !selectedSize) {
            alert("Please select a color and size."); // Simple alert for now
            return;
        }

        const itemToAdd = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0], // Always use the first image for the cart
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

