# Have A Nice Day · London — Shopify Theme

A bold Online Store 2.0 Shopify theme for the independent London streetwear brand
**Have A Nice Day London** — born from 90s rave nostalgia, organic cotton, and a
multi-brand house (Sam The Man, Shurl The Girl, Dready, Vortex, Funky Dog, etc.).

> Streetwear-luxury × underground rave culture. Designed to convert.

---

## ✨ Highlights

- **Online Store 2.0 compatible** — JSON templates, sectioned everything
- **Fully editable** in the Shopify Theme Editor (drag-and-drop sections)
- **Brand-aware design system** — exposed colors & typography in `config/settings_schema.json`
- **High-conversion homepage** — hero, featured products, brand house showcase,
  heritage story, "why us", incubator block, newsletter, gallery
- **Extras included** — sticky add-to-cart bar, cart drawer, search overlay,
  mobile menu, product modal, micro-animations, reveal-on-scroll
- **Mobile-first** responsive CSS, no external CSS frameworks

---

## 🗂 Folder structure

```
hand-shopify-theme/
├── layout/
│   └── theme.liquid               ← the required entry point
├── templates/                     ← OS 2.0 JSON templates
│   ├── index.json
│   ├── product.json
│   ├── collection.json
│   ├── cart.json
│   ├── page.json
│   ├── search.json
│   ├── 404.json
│   ├── blog.json
│   ├── article.json
│   ├── list-collections.json
│   └── customers/                 ← login, register, account, etc.
├── sections/                      ← every section has {% schema %}
│   ├── header.liquid / footer.liquid / announcement.liquid
│   ├── hero.liquid
│   ├── featured-products.liquid
│   ├── brands.liquid
│   ├── heritage.liquid
│   ├── why.liquid
│   ├── incubator.liquid
│   ├── newsletter.liquid
│   ├── gallery.liquid
│   ├── trust-strip.liquid / types-strip.liquid
│   ├── main-product.liquid / main-collection.liquid / main-cart.liquid / …
│   └── header-group.json / footer-group.json
├── snippets/
│   ├── product-card.liquid
│   ├── cart-drawer.liquid
│   ├── search-overlay.liquid
│   ├── mobile-menu.liquid
│   ├── product-modal.liquid
│   └── meta-tags.liquid
├── assets/
│   ├── styles.css
│   └── script.js
├── config/
│   ├── settings_schema.json
│   └── settings_data.json
└── locales/
    └── en.default.json
```

---

## 🚀 Upload to Shopify

### Option A — Upload as ZIP (simplest)

1. From the repo root, run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File ..\repack-shopify-theme.ps1
   ```
   (Or download the latest release zip from the **Releases** tab.)
2. Shopify Admin → **Online Store → Themes** → **Add theme → Upload zip file**
3. Select the resulting `hand-shopify-theme.zip`
4. Click **Customize** to start editing

> ⚠️ The ZIP **must** use forward-slashes in entry paths and have no UTF-8 BOM.
> The repacker script handles both.

### Option B — Live development with Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
shopify theme dev --store=your-store.myshopify.com
```

Then edit any file — changes hot-reload in your dev preview.

### Option C — Push commits → auto-deploy via GitHub integration

In Shopify Admin → Online Store → Themes → **Add theme → Connect from GitHub**,
pick this repo + branch. Every push to `main` will sync to that theme.

---

## 🎨 Customising

All brand colors, fonts and layout decisions live in:

- `config/settings_schema.json` → exposed in **Theme settings**
- `templates/index.json` → homepage section order (drag/drop in editor)
- Each section's `{% schema %}` → editable copy, blocks, links

The CSS uses CSS variables tied to `settings.color_*`, so changing colors in the
Shopify Theme Editor updates the live storefront instantly.

---

## 🧱 Versioning

```bash
git checkout -b feature/my-change
# ... edit ...
git commit -am "feat: tweak hero copy"
git push origin feature/my-change
```

Open a PR, merge to `main`, done.

---

## 📜 License

Private — for **Have A Nice Day London** only. © 2026.
