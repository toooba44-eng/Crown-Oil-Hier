# Crown Hair Oil — v1.2 (Cinematic Landing Page)

A standalone, cinematic single-page rebuild of Crown Hair Oil, built with the
"Organic Tech × Vapor Clinic" aesthetic: botanical product photography and a
lab/data layer (monospace type, plasma-violet glow accents, live telemetry
micro-UIs) layered on top of it.

This is a separate concept build living alongside the original Arabic
PHP e-commerce site (`index.php`, `store.php`) at the repo root — it does not
replace it.

## Stack
React 19 · Vite · Tailwind CSS 3 · GSAP 3 (ScrollTrigger) · lucide-react

## Sections
- **Navbar** — floating pill, morphs from transparent to blurred on scroll.
- **Hero** — full-bleed product photo, bottom-left copy block, GSAP entrance.
- **Features** — three interactive cards: a shuffling ingredient stack, a
  live "telemetry" typewriter feed, and an animated weekly-ritual scheduler.
- **Philosophy** — dark manifesto section with a scroll-revealed contrast
  statement.
- **Protocol** — three full-screen sticky-stacking steps (Extraction /
  Absorption / Regeneration), each with a unique SVG animation (rotating
  rings, a scanning grid, an EKG-style waveform).
- **Get Started** — single CTA panel (this is a one-product brand, so this
  replaces a pricing-tier grid per the brief).
- **Footer** — dark rounded footer with a pulsing "System Operational"
  status indicator.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build
```

Product imagery is reused from the existing site's `assets/` folder
(`public/assets/`) rather than external stock photography, since it's
already on-brand, real product photography.
