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

The project uses a custom i18n system. To add a new language:

1. Create a `src/lang/[lang-code].ts` file based on `en.ts`.
2. Register the new language module in `src/lang/index.ts`.
3. The UI will automatically pick up the new keys via `data-i18n` attributes.

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
│   └── lang/                 # Translation modules (de.ts, en.ts)
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
| | Secondary Accent | `--accent-secondary` | `#0d9488` | Saturated teal/cyan |

### 2. Typography
* **Primary Font**: `Outfit` (loaded locally in `public/fonts/`). Used for headings, body, and navigation.
* **Secondary / Fallbacks**: `Segoe UI`, `Tahoma`, `Geneva`, `Verdana`, `sans-serif`.

### 3. Visual Guidelines (Cozy, Not "Tech-RGB")
* **Soft & Organic**: Avoid pure black/white backdrops and harsh neon/cyber-RGB scrolling lines. The design should feel cozy, warm, and integrated with the character illustration.
* **Glassmorphic Panels**: Cards should use subtle blur (`backdrop-filter: blur(20px)`) and thin, tinted borders (`--glass-border`) matching the primary accent color.
* **Gradients**: Text gradients and link underlines must transition smoothly between the primary (lavender) and secondary (teal) accents.

