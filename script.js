// -----------------------------
// Smooth Scrolling for Nav Links
// -----------------------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// -----------------------------
// Mobile Navigation Toggle
// -----------------------------
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');

function createMobileToggle() {
  const btn = document.createElement('button');
  btn.className = 'mobile-toggle';
  btn.innerHTML = '☰';
  header.appendChild(btn);

  btn.addEventListener('click', () => {
    nav.classList.toggle('nav-open');
  });
}

if (window.innerWidth < 800) {
  createMobileToggle();
}

// -----------------------------
// Fade-In Animation on Scroll
// -----------------------------
const fadeElements = document.querySelectorAll(
  '.section, .card, .gallery-item, .pricing-card'
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  },
  { threshold: 0.2 }
);

fadeElements.forEach(el => observer.observe(el));

// -----------------------------
// Simple Form Validation
// -----------------------------
const form = document.querySelector('.contact-form');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.querySelector('#name');
    const email = document.querySelector('#email');
    const phone = document.querySelector('#phone');
    const details = document.querySelector('#details');

    let errors = [];

    if (!name.value.trim()) errors.push('Name is required.');
    if (!email.value.trim() || !email.value.includes('@'))
      errors.push('Valid email is required.');
    if (!phone.value.trim()) errors.push('Phone number is required.');
    if (!details.value.trim())
      errors.push('Please describe your project.');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    alert(
      'Thank you! Your request has been submitted.\nWe will contact you shortly.'
    );

    form.reset();
  });
}

// -----------------------------
// Highlight Active Nav Section
// -----------------------------
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav a');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (scrollY >= top) current = section.getAttribute('id');
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});
