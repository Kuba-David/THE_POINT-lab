document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // spustí se jen jednou
      }
    });
  }, {
    threshold: 1.0 // spustí se, když je celý element viditelný
  });

  document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
});

