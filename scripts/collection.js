import {
  createProductCard,
  initializeSliders,
  initializeModals,
  initializeBuyButtons,
  initializeOptionSelection
} from './productCard.js';

document.addEventListener('DOMContentLoaded', () => {
  // najde všechny kontejnery s patternem collection-<name>-grid
  const containers = Array.from(
    document.querySelectorAll('[id^="collection-"][id$="-grid"]')
  );
  if (containers.length === 0) return;  // ← pokud žádné nesedí, končíme

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

        // A opět inicializace ui prvků
        initializeSliders();
        initializeModals();
        initializeBuyButtons();
      });
    })
    .catch(err => console.error('Chyba při načítání db pro kolekce:', err));
});