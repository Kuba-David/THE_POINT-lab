const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('nav');

// přepínání při kliknutí na hamburger
hamburger.addEventListener('click', () => {
  nav.classList.toggle('show');
});

// zavření menu po kliknutí na libovolný odkaz
const navLinks = nav.querySelectorAll('a');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('show');
  });
});
