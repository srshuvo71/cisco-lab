/* Shared behaviour: navbar, demo auth (browser-only), smooth scrolling.
   NOTE: auth here is a front-end demo stored in localStorage. Swap the
   Auth object for real API calls before going to production. */

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const Auth = {
  current() { return store.get('cs_session', null); },
  async register(name, email, password) {
    email = email.trim().toLowerCase();
    const users = store.get('cs_users', {});
    if (users[email]) throw new Error('An account with this email already exists.');
    users[email] = { name: name.trim(), hash: await sha256(email + ':' + password) };
    store.set('cs_users', users);
    store.set('cs_session', { name: name.trim(), email });
  },
  async login(email, password) {
    email = email.trim().toLowerCase();
    const user = store.get('cs_users', {})[email];
    if (!user || user.hash !== await sha256(email + ':' + password)) throw new Error('Invalid email or password.');
    store.set('cs_session', { name: user.name, email });
  },
  logout() { store.remove('cs_session'); location.href = 'index.html'; },
};

/* ---------- Navbar ---------- */
(function nav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const toggle = nav.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Swap Login/Register for the student's name when signed in
  const slot = nav.querySelector('[data-auth-slot]');
  const user = Auth.current();
  if (slot && user) {
    slot.innerHTML = `
      <li><a class="nav-link" href="learn.html">My Learning</a></li>
      <li><button class="btn btn-sm btn-ghost" id="logoutBtn">Logout</button></li>`;
    slot.querySelector('#logoutBtn').addEventListener('click', () => Auth.logout());
  }
})();

/* ---------- Smooth scroll (Lenis) wired to GSAP ScrollTrigger ---------- */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) document.documentElement.classList.add('reduced');

window.lenis = null;
if (!reducedMotion && window.Lenis) {
  window.lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  if (window.gsap && window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}

// In-page anchor links go through Lenis for smooth travel
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (window.lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ---------- Cursor-follow glow on cards ---------- */
document.addEventListener('pointermove', e => {
  const card = e.target.closest && e.target.closest('.card');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
});
