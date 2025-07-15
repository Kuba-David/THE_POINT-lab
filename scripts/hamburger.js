const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('nav');

hamburger.addEventListener('click', () => {
  nav.classList.toggle('show');
});

const navLinks = nav.querySelectorAll('a');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('show');
  });
});
