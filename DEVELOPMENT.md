# 🛠️ Development & Maintenance Guide

This document contains everything you need to know about developing, building, and maintaining \*The Vtuber's Website\*\*.

---

## ⚡ Getting Started

### 📦 Prerequisites

- **Node.js**: v18 or later (v20+ recommended)
- **Git**: For version control and deployment

### 🏗️ Installation & Setup

1. **Clone the Repo**:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Launch local Workspace**:
   ```bash
   npm run dev
   ```

---

## 📜 Available Commands

| Command               | Description                                                                      |
| :-------------------- | :------------------------------------------------------------------------------- |
| `npm run dev`         | Spins up the **Vite dev server** with Hot Module Replacement (HMR).              |
| `npm run build`       | Compiles TypeScript and builds the project for production.                       |
| `npm run preview`     | Run the local **Production Preview** to test final assets.                       |
| `npm run deploy:prod` | Automated pipeline: Switches CNAME, pushes to Production Repo & reverts to Test. |

---

## 🧩 Maintenance & Updates

### 🌍 Adding/Editing Translations

The project uses a custom i18n system. `en.ts` is the reference language: every other language must contain exactly its keys.

**Adding a new language** (e.g. French, `fr`):

1. Copy `src/lang/de.ts` to `src/lang/fr.ts`, rename the export to `fr` and translate every value. Keep the type `CompleteTranslation` – the build then fails if a key is missing or misspelled.
2. Add one entry to the `languages` registry in `src/lang/index.ts`:
   `{ code: "fr", name: "Français", strings: fr }` (the name in the language itself).
3. Add the flag as `public/images/flags/fr.svg`.
4. Run `npm run audit:i18n` – it checks every language against `en.ts`, the registry and the flags.

Everything else follows automatically: the language menu is built from the registry, and visitors whose browser prefers the new language get it on their first visit. The imprint and privacy texts (`imprint_full_text`, `privacy_full_text`) are legal texts – have a translation of those reviewed.

**Adding/changing a text:** add the key to `en.ts` first, then to every other language (the build points out where it is missing), and reference it in HTML via `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria-label`, `data-i18n-title` or `data-i18n-alt` (image descriptions). Purely decorative images (emotes, logos inside an already labelled link) get `alt=""` instead.

### 🔍 SEO & Sitemap

Each page has a dedicated `<title>` and `<meta description>` in the root HTML files. 

**Automatisierung:**
- **Entry Points:** Das System erkennt neue HTML-Dateien im Hauptverzeichnis automatisch. Du musst die `vite.config.ts` **nicht** mehr manuell anpassen.
- **Sitemap:** Die **`sitemap.xml`** wird bei jedem Build automatisch generiert und enthält alle gefundenen Seiten.

---

## ⚙️ Deployment

The project uses a two-stage deployment process via GitHub Pages:

### Test / Staging (`test.nhywyll.com`)

Changes to the `main` branch are automatically pushed to the test subdomain.

```bash
git push origin main
```

### Production (`nhywyll.com`)

To push the current state to the main domain, use the integrated script:

```bash
npm run deploy:prod
```

_This automatically toggles the CNAME configuration and pushes to the production repository._

---

## 🏗️ Project Structure

```text
test_website/
├── scripts/                # Deployment Automation
├── public/                 # Static assets (images, logos, icons, fonts)
│   ├── images/
│   │   ├── Emotes/           # Live stream emotes
│   │   ├── media/            # Social media icons
│   │   └── artwork-library/  # Curated artist showcase and commissions
│   ├── fonts/              # Local typography (Outfit)
│   ├── sitemap.xml         # SEO engine optimization
│   └── robots.txt          # Crawler instructions
├── src/                    # Source files for build
│   ├── main.ts               # Core logic: i18n, Transitions, Effects & UI
│   ├── styles.css            # Global style themes and variables
│   └── lang/                 # Translations (en.ts = reference, de.ts) + registry in index.ts
├── index.html              # Hero, About & FAQ
├── links.html              # Social hub
├── contact.html            # Business center
├── credits.html            # Artist Showcase
├── imprint.html            # Legal framework
└── 404.html                # Custom error page
```

---

## 🎨 Design System & Style Guidelines

To keep the website looking cohesive and aligned with Nhywyll's VTuber identity, all styles should adhere to the following logo-matched color system and visual guidelines:

### 1. Logo-Matched Color Palette
All color values are defined as CSS variables in `src/styles.css`.

| Theme | Element | Variable | Color | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Dark Theme** | Primary Background | `--bg-primary` | `#0f101b` | Deep dark slate/indigo |
| | Secondary Background | `--bg-secondary` | `#17192c` | Slightly lighter dark indigo |
| | Cards & Containers | `--bg-card` | `rgba(30, 33, 58, 0.65)` | Dark indigo glass panel |
| | Primary Accent | `--accent-primary` | `#7d88c4` | Dusty lavender from logo text |
| | Secondary Accent | `--accent-secondary` | `#4db6ac` | Soft mint-teal from logo stars |
| **Light Theme**| Primary Background | `--bg-primary` | `#f6f7fb` | Soft lavender cool-white |
| | Card Background | `--bg-card` | `rgba(235, 238, 248, 0.85)`| Soft lavender-gray |
| | Primary Typography | `--text-primary` | `#2d314e` | Deep dark slate-navy |
| | Primary Accent | `--accent-primary` | `#5c6494` | Darker dusty lavender |
| | Secondary Accent | `--accent-secondary` | `#0f766e` | Deep teal (dark enough for light text on the button gradient, 5.1:1) |

### 2. Typography
* **Primary Font**: `Outfit` (loaded locally in `public/fonts/`). Used for headings, body, and navigation.
* **Secondary / Fallbacks**: `Segoe UI`, `Tahoma`, `Geneva`, `Verdana`, `sans-serif`.

### 3. Visual Guidelines (Cozy, Not "Tech-RGB")
* **Soft & Organic**: Avoid pure black/white backdrops and harsh neon/cyber-RGB scrolling lines. The design should feel cozy, warm, and integrated with the character illustration.
* **Glassmorphic Panels**: Cards should use subtle blur (`backdrop-filter: blur(20px)`) and thin, tinted borders (`--glass-border`) matching the primary accent color.
* **Gradients**: Text gradients and link underlines must transition smoothly between the primary (lavender) and secondary (teal) accents.

