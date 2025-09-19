document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    // Cílíme na celý kontejner, abychom ho mohli nahradit zprávou
    const formContainer = document.querySelector('.form-container'); 
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Zabráníme klasickému odeslání a znovunačtení stránky
            e.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'SENDING...';
            submitButton.disabled = true;

            const formData = new FormData(form);

            // Pomocí Fetch API pošleme data na server
            fetch('send-email.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json()) // Očekáváme odpověď ve formátu JSON
            .then(data => {
                if (data.status === 'success') {
                    // Úspěch: Nahradíme formulář děkovací zprávou
                    formContainer.innerHTML = `
                        <div class="form-success" style="text-align: center;">
                            <h2>Got it. Thanks!</h2>
                            <p>We'll get back to you if needed.</p>
                        </div>`;
                } else {
                    // Chyba: Zobrazíme chybovou hlášku
                    displayError(data.message || 'Please try again later.');
                    submitButton.textContent = 'MAKE THE POINT';
                    submitButton.disabled = false;
                }
            })
            .catch(error => {
                // Chyba sítě nebo serveru
                console.error('Submission error:', error);
                displayError('Oops! A network error occurred.');
                submitButton.textContent = 'MAKE THE POINT';
                submitButton.disabled = false;
            });
        });
    }

    function displayError(message) {
        // Vytvoříme a zobrazíme chybovou zprávu nad tlačítkem
        let errorElement = formContainer.querySelector('.form-error-message');
        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.className = 'form-error-message';
            // Přidej si styl pro .form-error-message, např. barvu textu
            errorElement.style.color = 'red'; 
            errorElement.style.marginTop = '15px';
            const submitButton = formContainer.querySelector('button');
            submitButton.parentNode.insertBefore(errorElement, submitButton);
        }
        errorElement.textContent = message;
    }
});
