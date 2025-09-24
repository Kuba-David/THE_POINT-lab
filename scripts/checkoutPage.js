import { getCart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeCheckoutPage();
});

function initializeCheckoutPage() {
    if (!document.body.classList.contains('checkout-page')) {
        return;
    }

    // --- GEOAPIFY AUTOCOMPLETE using manual fetch ---
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    const zipInput = document.getElementById('zip');
    const countryInput = document.getElementById('country');
    const suggestionsContainer = document.getElementById('address-suggestions');

    // Debounce function to limit API calls
    let debounceTimeout;
    const debounce = (func, delay) => {
        return function(...args) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    if (addressInput) {
        const geoapifyApiKey = '9db140c54ab94776a25345e857a004b5';

        const handleAddressInput = async (event) => {
            const text = event.target.value;
            if (text.length < 3) {
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';
                return;
            }

            const requestOptions = { method: 'GET' };
            try {
                const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${geoapifyApiKey}`, requestOptions);
                const result = await response.json();
                
                suggestionsContainer.innerHTML = '';
                if (result.features && result.features.length > 0) {
                    suggestionsContainer.style.display = 'block';
                    result.features.forEach(feature => {
                        const item = document.createElement('div');
                        item.className = 'suggestion-item';
                        item.textContent = feature.properties.formatted;
                        item.addEventListener('click', () => {
                            selectAddress(feature.properties);
                            suggestionsContainer.style.display = 'none';
                        });
                        suggestionsContainer.appendChild(item);
                    });
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            } catch (error) {
                console.log('error', error);
                suggestionsContainer.style.display = 'none';
            }
        };

        const selectAddress = (props) => {
            const street = props.street || '';
            const housenumber = props.housenumber || '';
            addressInput.value = `${street} ${housenumber}`.trim();
            cityInput.value = props.city || '';
            zipInput.value = props.postcode || '';
            countryInput.value = props.country || '';
        };

        addressInput.addEventListener('input', debounce(handleAddressInput, 300));

        // Hide suggestions when clicking outside
        document.addEventListener('click', function(event) {
            if (!addressInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    const steps = document.querySelectorAll('.step-content');
    const progressSteps = document.querySelectorAll('.progress-bar .step');
    let formData = {};

    const addressForm = document.getElementById('address-form');
    
    const goToStep = (stepNumber) => {
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        
        progressSteps.forEach(pStep => {
            pStep.classList.toggle('active', parseInt(pStep.dataset.step, 10) <= stepNumber);
        });
        window.scrollTo(0, 0);
    };

    document.querySelectorAll('a[data-step-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            goToStep(parseInt(link.dataset.stepTarget, 10));
        });
    });
    document.getElementById('back-to-address')?.addEventListener('click', (e) => {
        e.preventDefault();
        goToStep(1);
    });
    const backToCartBtn = document.getElementById('back-to-cart');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    const renderSummary = () => {
        const cart = getCart();
        const summaryContainer = document.getElementById('summary-items');
        const subtotalEl = document.getElementById('summary-subtotal');
        const totalEl = document.getElementById('summary-total');
        const shippingEl = document.getElementById('summary-shipping');
        if (!summaryContainer || !subtotalEl || !totalEl || !shippingEl) return;
        
        summaryContainer.innerHTML = '';
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <p>${item.name}</p>
                    <small>${item.color} / ${item.size} x ${item.quantity}</small>
                </div>
                <span class="item-price">${(item.price * item.quantity).toFixed(2)} €</span>
            `;
            summaryContainer.appendChild(itemEl);
        });
        
        const shippingCost = parseFloat(formData.shipping?.price || 0);
        subtotalEl.textContent = `${subtotal.toFixed(2)} €`;
        shippingEl.textContent = `${shippingCost.toFixed(2)} €`;
        totalEl.textContent = `${(subtotal + shippingCost).toFixed(2)} €`;
    };
    
    const renderShipping = () => {
        const shippingOptions = [
            { id: 'packeta', name: 'Packeta (Zásilkovna)', price: 3.00 },
            { id: 'dpd', name: 'DPD Courier', price: 5.00 }
        ];
        const container = document.getElementById('shipping-options');
        if(!container) return;
        container.innerHTML = '<h4>Shipping method</h4>';
        
        shippingOptions.forEach(opt => {
            const el = document.createElement('div');
            el.className = 'shipping-option';
            el.dataset.shippingId = opt.id;
            el.innerHTML = `
                <span>${opt.name}</span>
                <strong>${opt.price.toFixed(2)} €</strong>
            `;
            el.addEventListener('click', () => {
                document.querySelectorAll('.shipping-option').forEach(o => o.classList.remove('selected'));
                el.classList.add('selected');
                formData.shipping = opt;
                renderSummary();
            });
            container.appendChild(el);
        });
    };
    
    if (addressForm) {
        addressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!formData.shipping) {
                alert('Please select a shipping method.');
                return;
            }
            const form = new FormData(addressForm);
            formData.customer = Object.fromEntries(form.entries());
            
            document.getElementById('summary-email-display').textContent = formData.customer.email;
            document.getElementById('summary-address-display').textContent = `${formData.customer.address}, ${formData.customer.city}`;
            
            goToStep(2);
        });
    }

    const gopayButton = document.getElementById('gopay-button');
    if (gopayButton) {
        gopayButton.addEventListener('click', async () => {
            const cart = getCart();
            const payload = { customer: formData.customer, shipping: formData.shipping, cart: cart };
            try {
                const response = await fetch('php/create_payment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.status === 'success' && result.gatewayUrl) {
                    GoPay.inline({ gatewayUrl: result.gatewayUrl });
                } else {
                    alert(`Error creating payment: ${result.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    renderSummary();
    renderShipping();
}

document.addEventListener('DOMContentLoaded', () => {
    const point = document.querySelector('.moving-point-wrapper');
    if (!point) return;
    function movePoint() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const pointSize = point.offsetWidth;
        const newX = Math.random() * (screenWidth - pointSize);
        const newY = Math.random() * (screenHeight - pointSize);
        point.style.transform = `translate(${newX}px, ${newY}px)`;
    }
    movePoint();
    setInterval(movePoint, 8000);
});