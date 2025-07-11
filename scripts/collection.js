import {
  createProductCard,
  initializeSliders,
  initializeModals,
  initializeBuyButtons,
  initializeOptionSelection
} from './productCard.js';

document.addEventListener('DOMContentLoaded', () => {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.classList.remove('hidden');

  const containers = Array.from(
    document.querySelectorAll('[id^="collection-"][id$="-grid"]')
  );
  if (containers.length === 0) {
    if (spinner) spinner.classList.add('hidden');
    return;
  }

  fetch('db.json')
    .then(res => res.json())
    .then(data => {
      containers.forEach(container => {
        const col = container.id
          .replace('collection-', '')
          .replace('-grid', '');

        data.products
          .filter(p => p.collection === col)
          .forEach(p => {
            const card = createProductCard(p);
            container.appendChild(card);
            initializeOptionSelection(card);
          });
      });

      initializeSliders();
      initializeModals();
      initializeBuyButtons();

      if (spinner) spinner.classList.add('hidden');
    })
    .catch(err => {
      console.error('Chyba při načítání db pro kolekce:', err);
      if (spinner) spinner.classList.add('hidden');
    });
});
