import {
  createProductCard,
  initializeSliders,
  initializeBuyButtons,
  initializeOptionSelection
} from './productCard.js';

document.addEventListener('DOMContentLoaded', () => {
  const spinner = document.getElementById('loading-spinner');
  const wrapper = document.getElementById('collections-wrapper');

  if (spinner) spinner.classList.remove('hidden');
  if (wrapper) wrapper.classList.add('collections-hidden');

  const containers = Array.from(
    document.querySelectorAll('[id^="collection-"][id$="-grid"]')
  );
  if (containers.length === 0) {
    if (spinner) spinner.classList.add('hidden');
    if (wrapper) wrapper.classList.remove('collections-hidden');
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
      initializeBuyButtons();

      if (spinner) spinner.classList.add('hidden');
      if (wrapper) wrapper.classList.remove('collections-hidden');
    })
    .catch(err => {
      console.error('Error loading db.json for collections:', err);
      if (spinner) spinner.classList.add('hidden');
      if (wrapper) wrapper.classList.remove('collections-hidden');
    });
});
