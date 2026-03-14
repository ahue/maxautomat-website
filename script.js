// =============================================
// MAXAUTOMAT – Band Website JS
// =============================================

// ---- Navbar: scroll shrink + mobile toggle ----
const navbar = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---- Active nav link highlight on scroll ----
const sections = document.querySelectorAll('section[id], header[id]');
const navItems = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => observer.observe(s));

// ---- Termine aus YAML laden ----
const MONATE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

async function ladeTermine() {
  const grid = document.getElementById('shows-grid');
  if (!grid) return;

  let termine;
  try {
    const res = await fetch('termine.yaml');
    if (!res.ok) throw new Error(res.statusText);
    const text = await res.text();
    ({ termine } = jsyaml.load(text));
  } catch (err) {
    grid.innerHTML = '<p class="shows-note">Termine konnten nicht geladen werden.</p>';
    console.error('termine.yaml:', err);
    return;
  }

  // Vergangene Termine ausblenden, nach Datum sortieren
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const kommende = termine
    .map(t => ({ ...t, _date: new Date(t.datum) }))
    .filter(t => t._date >= heute)
    .sort((a, b) => a._date - b._date);

  if (kommende.length === 0) {
    grid.innerHTML = '<p class="shows-note">Aktuell keine Termine geplant. <a href="#kontakt">Schreib uns!</a></p>';
    return;
  }

  grid.innerHTML = kommende.map(t => {
    const tag   = t._date.getDate().toString().padStart(2, '0');
    const monat = MONATE[t._date.getMonth()];
    const jahr  = t._date.getFullYear();

    const zeiten = [t.einlass && `Einlass: ${t.einlass}`, t.start && `Start: ${t.start}`]
      .filter(Boolean).join(' · ');

    const ticketBtn = t.privat
      ? `<span class="btn-ticket private">Privat</span>`
      : t.tickets
        ? `<a href="${t.tickets}" target="_blank" rel="noopener" class="btn-ticket">Tickets</a>`
        : '';

    return `
      <div class="show-card">
        <div class="show-date">
          <span class="day">${tag}</span>
          <span class="month">${monat}</span>
          <span class="year">${jahr}</span>
        </div>
        <div class="show-info">
          <h3>${t.titel}</h3>
          <p class="show-venue">${t.venue}</p>
          ${zeiten ? `<p class="show-time">${zeiten}</p>` : ''}
        </div>
        ${ticketBtn}
      </div>`;
  }).join('');
}

ladeTermine();

// ---- Contact form (client-side placeholder) ----
const form = document.querySelector('.kontakt-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Gesendet! ✔';
    btn.disabled = true;
    btn.style.background = '#2a7a2a';
    btn.style.borderColor = '#2a7a2a';
    // In a real setup: replace this with fetch() to a backend or form service
  });
}
