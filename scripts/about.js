// document.addEventListener("DOMContentLoaded", () => {
//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add("visible");
//       } else {
//         entry.target.classList.remove("visible");
//       }
//     });
//   }, {
//     threshold: 1.0
//   });

//   document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
// });

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: "-30% 0px -30% 0px"
  });

  document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));
});


