# CyberShield Academy — website

A cybersecurity learning site where students register, learn through comic chapters with quizzes, and earn a downloadable certificate.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Landing page: hero with glowing planet arc, pinned rotating "core" circle, services, comics, courses, stats, certificate, CTA |
| `auth.html` | Login / Register (animated tab switch). `auth.html#register` opens the register tab |
| `learn.html` | Comic reader: 4 chapters, scenario quiz per chapter, progress bar, certificate unlock + PNG download |

## Run locally

It's a static site, so any static server works:

```bash
cd website
python3 -m http.server 8000
# open http://localhost:8000
```

## Design

Colours were sampled from the reference recording and live as CSS variables in `css/style.css`:

- background `#07040f`, navbar `#201034`
- primary button `#6614d8`
- hover gradient `#b57dec → #701fd3 → #520ea3`
- arc highlight `#e7b3ff`, glow `#520ea3`

Animations use GSAP + ScrollTrigger with Lenis smooth scrolling (loaded from jsDelivr):

- Hero: word-by-word intro. On scroll the text drifts up and fades while the planet rises and its ring rotates (parallax)
- Core section: pinned. Scrolling spins the centre circle, its rings (at different speeds) and six orbiting skill badges, which stay upright
- Service cards move at different parallax speeds and tilt in 3D on hover
- Comic panels pop in, course covers parallax, the certificate flips up in 3D, and counters animate
- Buttons and nav links get a gradient sweep, a shine and a lift on hover

`prefers-reduced-motion` turns the animations off.

> **Note on hover effects:** they use the individual CSS `translate` / `rotate` / `scale` properties instead of `transform`. A CSS `transition: transform` on an element that GSAP also animates makes GSAP record mid-transition values, which leaves the element frozen.

## Auth is a demo

Accounts and progress are stored in the browser's `localStorage`, with passwords SHA-256 hashed. This is fine for a demo but **not secure for production**. Replace the `Auth` object in `js/app.js` with calls to a real backend (for example Firebase Auth, Supabase or your own API) before launch.
