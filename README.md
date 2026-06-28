# PROcréal — Site vitrine

Site vitrine bilingue (FR/EN) du centre de formation PROcréal (Abidjan, Cocody Faya) : ArchiCAD, AutoCAD, dessin d'architecture et métiers du BTP.

Stack : [Astro](https://astro.build) 7 + Tailwind CSS v4 + GSAP/ScrollTrigger + [Lenis](https://lenis.darkroom.engineering/) (smooth scroll) + Content Collections.

## Installation

```sh
npm install
cp .env.example .env.local   # puis renseigner les vraies valeurs
npm run dev
```

Le site est servi sur `http://localhost:4321`.

## Scripts

| Commande          | Action                                      |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Serveur de développement                     |
| `npm run build`    | Build de production dans `./dist/`           |
| `npm run preview`  | Prévisualise le build de production en local |

## Structure du projet

```
src/
├── components/        Composants réutilisables (Header, Footer, cartes, formulaires...)
├── content/            Contenu (formations, blog, témoignages) — Content Collections
├── content.config.js   Schémas des collections
├── i18n/               Dictionnaires FR/EN + helpers de routage
├── layouts/            BaseLayout, PageLayout, BlogLayout
├── lib/                animations.js (GSAP/Lenis), seo.js (JSON-LD), form.js
├── pages/              Routes FR (racine) + routes EN sous /en
└── styles/             global.css (tokens Tailwind v4), fonts.css
```

### i18n

- FR est la langue par défaut, sans préfixe (`/formations`).
- EN est servi sous `/en/...` (`/en/formations`), même arborescence de slugs.
- Les chaînes d'interface (nav, footer, boutons, labels) viennent de `src/i18n/fr.json` et `src/i18n/en.json`.
- Les formations ont des champs bilingues directement dans leur frontmatter (`title` / `title_en`, etc.).
- Les articles de blog n'ont qu'un corps en français pour l'instant ; la version EN affiche le résumé traduit (`excerpt_en`) avec un bandeau « English version coming soon » et un lien vers la version FR complète.

## Contenu à remplacer avant la mise en ligne

| Élément | Emplacement | Remplacer par |
| --- | --- | --- |
| Photo de Landry (hero, à propos) | `https://placehold.co/...` dans `src/pages/index.astro`, `src/pages/a-propos.astro` (+ `en/`) | Vraie photo, à déposer dans `public/img/landry-hero.jpg` |
| Photos galerie | `src/pages/galerie.astro` (+ `en/`) | Vraies photos de promotions/événements |
| `og-default.jpg` | référencé par défaut dans `BaseLayout.astro` (`/img/og-default.jpg`) | Déposer une image 1200×630 dans `public/img/og-default.jpg` |
| Webhook formulaires | `.env.local` → `PUBLIC_FORM_WEBHOOK_URL` | URL Google Apps Script réelle |
| Numéro WhatsApp | `.env.local` → `PUBLIC_WHATSAPP_NUMBER` | Numéro confirmé si différent |
| Numéros Wave / Orange Money | Sidebar fiche formation, page Inscription | À fournir par Landry (actuellement juste des badges sans numéro) |
| Réseaux sociaux | `src/components/Footer.astro` | Vraies URLs Facebook/Instagram/LinkedIn |
| Formateurs de l'équipe | `src/pages/a-propos.astro` (section "Notre équipe") | Remplacer le placeholder dès qu'un formateur est annoncé |

## Formulaires

Les formulaires Contact et Inscription envoient un `POST` JSON vers `PUBLIC_FORM_WEBHOOK_URL` (Google Apps Script). Si l'appel échoue (webhook pas encore configuré), le formulaire d'inscription bascule quand même sur WhatsApp avec un message pré-rempli.

## Déploiement sur Cloudflare Pages

1. Pousser le repo sur GitHub.
2. Dans Cloudflare Pages : **Create a project → Connect to Git**, sélectionner le repo.
3. Preset de framework : **Astro**.
4. Build command : `npm run build`
5. Output directory : `dist`
6. Variables d'environnement : copier le contenu de `.env.example` (avec les vraies valeurs) dans **Settings → Environment variables**.
7. Une fois déployé, lier le domaine personnalisé `procreal.ci` dans **Custom domains**.

## Notes techniques

- **Animations** : `src/lib/animations.js` centralise Lenis + GSAP/ScrollTrigger (reveal au scroll, compteurs, tilt des cartes, marquee, header transparent → opaque). Tout est désactivé/instantané si `prefers-reduced-motion: reduce`.
- **Astro View Transitions** (`ClientRouter`) sont actives ; `astro:page-load` réinitialise les animations à chaque navigation.
- **SEO** : JSON-LD `Organization` sur toutes les pages, `Course` sur les fiches formation, `LocalBusiness` sur Contact, `Person` sur À propos, `BlogPosting` sur les articles, `BreadcrumbList` partout où un fil d'Ariane existe. Sitemap généré automatiquement par `@astrojs/sitemap`.
