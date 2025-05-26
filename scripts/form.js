  const selectBox = document.getElementById('motiv-dropdown');
  const selected = selectBox.querySelector('.selected-option');
  const optionsList = selectBox.querySelector('.options');
  const hiddenInput = document.getElementById('motiv-hidden');

  selected.addEventListener('click', () => {
    selectBox.classList.toggle('open');
  });

  optionsList.querySelectorAll('li').forEach(option => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value');
      const label = option.textContent.trim();

      selected.textContent = label;
      hiddenInput.value = value;
      selectBox.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!selectBox.contains(e.target)) {
      selectBox.classList.remove('open');
    }
  });