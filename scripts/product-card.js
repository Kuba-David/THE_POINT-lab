const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close");
const arrowLeft = document.querySelector(".modal-arrow.left");
const arrowRight = document.querySelector(".modal-arrow.right");

let currentModalImages = [];
let currentModalIndex = 0;

// Pro každou kartu
document.querySelectorAll('.product-card').forEach(card => {
  const slides = card.querySelectorAll('.slide');
  const dots = card.querySelectorAll('.dot');
  const slider = card.querySelector('.slider');
  let currentIndex = 0;

  function goToSlide(idx) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === idx);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
    currentIndex = idx;
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
    });
  });

  slider.addEventListener('click', () => {
    const activeSlide = card.querySelector('.slide.active');
    const images = [...card.querySelectorAll('.slide img')];

    currentModalImages = images.map(img => img.src);
    currentModalIndex = images.indexOf(activeSlide.querySelector('img'));

    modalImg.src = currentModalImages[currentModalIndex];
    modal.style.display = "flex";
  });

  // Swipe (touch + mouse)
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  slider.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  slider.addEventListener('touchend', e => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    handleSwipe();
  });

  slider.addEventListener('mousedown', e => {
    startX = e.clientX;
    startY = e.clientY;
  });

  slider.addEventListener('mouseup', e => {
    endX = e.clientX;
    endY = e.clientY;
    handleSwipe();
  });

  function handleSwipe() {
    const diffX = startX - endX;
    const diffY = startY - endY;

    // Vyžaduje převážně horizontální swipe a aspoň 30px pohyb
    if (Math.abs(diffX) < 30 || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      goToSlide((currentIndex + 1) % slides.length);
    } else {
      goToSlide((currentIndex - 1 + slides.length) % slides.length);
    }
  }
});

// Modal šipky
arrowLeft.addEventListener('click', () => {
  currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
  modalImg.src = currentModalImages[currentModalIndex];
});

arrowRight.addEventListener('click', () => {
  currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
  modalImg.src = currentModalImages[currentModalIndex];
});

// Zavření
closeBtn.addEventListener('click', () => {
  modal.style.display = "none";
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// SWIPE v modalu
let modalStartX = 0;
let modalEndX = 0;

modal.addEventListener('touchstart', (e) => {
  modalStartX = e.touches[0].clientX;
});

modal.addEventListener('touchend', (e) => {
  modalEndX = e.changedTouches[0].clientX;
  handleModalSwipe();
});

function handleModalSwipe() {
  const diff = modalStartX - modalEndX;
  if (Math.abs(diff) < 30) return; // ignoruj malé pohyby

  if (diff > 0) {
    // swipe doleva → další
    currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
  } else {
    // swipe doprava → předchozí
    currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
  }
  modalImg.src = currentModalImages[currentModalIndex];
}

// přeskakování klávesou
document.addEventListener('keydown', (e) => {
  if (modal.style.display === "flex") {
    if (e.key === 'ArrowRight') {
      currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
      modalImg.src = currentModalImages[currentModalIndex];
    } else if (e.key === 'ArrowLeft') {
      currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
      modalImg.src = currentModalImages[currentModalIndex];
    } else if (e.key === 'Escape') {
      modal.style.display = "none";
    }
  }
});

// Přidání události pro tlačítko "make an order"
document.querySelectorAll('.buy-button').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });
});