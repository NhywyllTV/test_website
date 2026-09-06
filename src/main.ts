import "./styles.css";
import { translations } from "./lang/index";

// Sprache festlegen: Wir prüfen erst localStorage, dann die Browser-Sprache (Standard ist English)
const getInitialLanguage = (): string => {
  const saved = localStorage.getItem("language");
  if (saved) return saved;

  const browserLang = navigator.language.split("-")[0]; // z.B. 'de' oder 'en'
  return browserLang === "de" ? "de" : "en";
};

let currentLanguage = getInitialLanguage();

// Die Funktion zum Texte austauschen
function updateTexts() {
  console.log("updateTexts läuft für:", currentLanguage);
  const strings = translations[currentLanguage];
  if (!strings) {
    console.error("Keine Texte für Sprache gefunden:", currentLanguage);
    return;
  }

  const elements = document.querySelectorAll(
    "[data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-aria-label], [data-i18n-title]",
  );

  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    
    // Check for standard text content
    const textKey = htmlEl.getAttribute("data-i18n");
    if (textKey && strings[textKey]) {
      htmlEl.textContent = strings[textKey];
    }

    // Check for HTML content
    const htmlKey = htmlEl.getAttribute("data-i18n-html");
    if (htmlKey && strings[htmlKey]) {
      htmlEl.innerHTML = strings[htmlKey];
    }

    // Check for placeholder
    const placeholderKey = htmlEl.getAttribute("data-i18n-placeholder");
    if (placeholderKey && strings[placeholderKey]) {
      (htmlEl as HTMLInputElement).placeholder = strings[placeholderKey];
    }

    // Check for aria-label
    const ariaKey = htmlEl.getAttribute("data-i18n-aria-label");
    if (ariaKey && strings[ariaKey]) {
      htmlEl.setAttribute("aria-label", strings[ariaKey]);
    }

    // Check for title
    const titleKey = htmlEl.getAttribute("data-i18n-title");
    if (titleKey && strings[titleKey]) {
      htmlEl.setAttribute("title", strings[titleKey]);
    }
  });

  document.documentElement.lang = currentLanguage;
  updateLanguageUI();
}

function updateLanguageUI() {
  const activeLangSpan = document.querySelector(".active-lang");
  if (activeLangSpan) {
    // Hier wird NUR die Flagge gesetzt, der Pfeil ist ein Geschwister-Element in header.html
    activeLangSpan.innerHTML = `<img src="images/flags/${currentLanguage}.svg" alt="${currentLanguage}" class="flag-icon">`;
  }

  const options = document.querySelectorAll(".lang-opt");
  options.forEach((opt) => {
    const htmlOpt = opt as HTMLElement;
    const lang = htmlOpt.dataset.lang;

    // Update selection state
    if (lang === currentLanguage) {
      htmlOpt.classList.add("active");
    } else {
      htmlOpt.classList.remove("active");
    }

    // Add flag icon to option if not already present
    if (lang && !htmlOpt.querySelector(".flag-icon")) {
      const flagImg = document.createElement("img");
      flagImg.src = `images/flags/${lang}.svg`;
      flagImg.className = "flag-icon";
      flagImg.alt = lang;
      htmlOpt.prepend(flagImg);
    }
  });
}

// 4. Sprachaustausch-Logik & Dropdown
function setupLanguageSwitcher() {
  const switcher = document.querySelector(".language-switcher");
  const currentBtn = document.querySelector(".current-lang");
  const options = document.querySelectorAll(".lang-opt");

  if (!switcher || !currentBtn) return;

  // Dropdown öffnen/schließen
  currentBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    switcher.classList.toggle("open");
  });

  // Sprache wählen
  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      const lang = (opt as HTMLElement).dataset.lang;
      if (lang && lang !== currentLanguage) {
        currentLanguage = lang;
        localStorage.setItem("language", lang);
        updateTexts();
      }
      switcher.classList.remove("open");
    });
  });

  // Schließen wenn man außerhalb klickt
  document.addEventListener("click", () => {
    switcher.classList.remove("open");
  });
}
// 6. Mobile Menü Logik
function setupNavigation() {
  const menuToggle = document.getElementById("menu-toggle");
  const navUl = document.querySelector("nav ul");

  if (menuToggle && navUl) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", (!isExpanded).toString());
      menuToggle.classList.toggle("open");
      navUl.classList.toggle("open");
    });
  }
}

// Theme Toggle (Dark/Light Mode)
function setupTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    // Initiales Icon setzen basierend auf dem aktuellen Theme (wurde im Head-Script gesetzt)
    const isLight = document.documentElement.classList.contains("light-theme");
    themeToggle.textContent = isLight ? "☀️" : "🌙";

    themeToggle.addEventListener("click", () => {
      const isLightNow =
        document.documentElement.classList.toggle("light-theme");
      const newTheme = isLightNow ? "light" : "dark";
      document.documentElement.dataset.theme = newTheme;
      localStorage.setItem("theme", newTheme);
      themeToggle.textContent = isLightNow ? "☀️" : "🌙";
    });
  }
}

// --- Initialization ---
let isFirstLoad = true;

function init() {
  if (isFirstLoad) {
    setupPageTransitions();
    setupEffects();
    setupNavigation();
    setupTheme();
    setupCookieBanner();
    setupLanguageSwitcher();
    setupScrollEffects();
    isFirstLoad = false;
  }

  // Page-specific initializations
  updateTexts();
  setupActiveNavHighlight();
  setupFAQ();
  setupEasterEgg();
  setupContactForm();
  checkTwitchLiveStatus();

  // Smooth entrance for first load or SPA load
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.classList.remove("page-exit");
    mainContent.classList.add("page-enter");

    const cleanup = (e: AnimationEvent) => {
      if (e.animationName === "pageEnterAnim") {
        mainContent.classList.remove("page-enter");
        mainContent.removeEventListener("animationend", cleanup);
      }
    };
    mainContent.addEventListener("animationend", cleanup);
  }
}

// Ensure the DOM is ready before running scripts
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Global verfügbar machen für Notfälle
(window as any).setLanguage = (lang: string) => {
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  updateTexts();
};

// --- Scroll Effects (Progress Bar & Back-to-Top) ---
function setupScrollEffects() {
  // Progress Bar Element erstellen
  let progressBar = document.querySelector(".scroll-progress") as HTMLElement;
  if (!progressBar) {
    progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    document.body.appendChild(progressBar);
  }

  const backToTop = document.querySelector(".back-to-top") as HTMLElement;

  window.addEventListener("scroll", () => {
    // Fortschritt berechnen
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;

    if (progressBar) progressBar.style.width = scrolled + "%";

    // Back-to-Top Button ein/ausblenden
    if (backToTop) {
      if (winScroll > 300) {
        backToTop.classList.add("show");
      } else {
        backToTop.classList.remove("show");
      }
    }
  });

  // Klick-Event für sanftes Scrollen nach oben
  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// --- Active Nav Highlight ---
function setupActiveNavHighlight() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("nav ul li a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    // Prüfen ob der Link zur aktuellen Seite passt
    const isHome =
      (currentPath === "/" || currentPath.endsWith("index.html")) &&
      href === "index.html";
    const isExactMatch = currentPath.endsWith(href);

    if (isHome || isExactMatch) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// --- Smooth Page Transitions (SPA) ---
const pageCache = new Map<string, string>();

function setupPageTransitions() {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  const prefetchPage = async (url: string) => {
    if (pageCache.has(url)) return;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const html = await response.text();
        pageCache.set(url, html);
      }
    } catch (err) {
      console.warn("Prefetch failed for:", url);
    }
  };

  const loadPage = async (url: string, pushState = true) => {
    // Starte den Fetch sofort parallel zur Animation
    const fetchPromise = (async () => {
      let html = pageCache.get(url);
      if (!html) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        html = await response.text();
        pageCache.set(url, html);
      }
      return html;
    })();

    try {
      // Animation starten
      mainContent.classList.add("page-exit");

      // Warten bis sowohl Animation (300ms) als auch Fetch fertig sind
      const [html] = await Promise.all([
        fetchPromise,
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newContent = doc.getElementById("main-content");
      const newTitle = doc.title;

      if (newContent) {
        if (pushState) {
          history.pushState({ url }, "", url);
        }
        
        // Update <title> data-i18n attribute to ensure the correct translation key is used
        const newTitleEl = doc.querySelector("title");
        const currentTitleEl = document.querySelector("title");
        if (newTitleEl && currentTitleEl) {
          const i18nKey = newTitleEl.getAttribute("data-i18n");
          if (i18nKey) {
            currentTitleEl.setAttribute("data-i18n", i18nKey);
          } else {
            currentTitleEl.removeAttribute("data-i18n");
          }
        }
        document.title = newTitle;

        // Content tauschen
        mainContent.innerHTML = newContent.innerHTML;
        
        // Fokus setzen für Barrierefreiheit (Screenreader-Unterstützung)
        mainContent.focus();

        // Re-run initializations
        init();
        
        // Scroll to top or anchor if hash is present
        try {
          const parsedUrl = new URL(url);
          if (parsedUrl.hash) {
            const targetEl = document.querySelector(parsedUrl.hash);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: "instant" as ScrollBehavior });
              // Set focus for accessibility
              if (targetEl instanceof HTMLElement) {
                targetEl.focus();
              }
            } else {
              window.scrollTo(0, 0);
            }
          } else {
            window.scrollTo(0, 0);
          }
        } catch (e) {
          window.scrollTo(0, 0);
        }
      }
    } catch (error) {
      console.error("Failed to load page via SPA:", error);
      window.location.href = url; // Fallback
    }
  };

  window.addEventListener("popstate", (e) => {
    const url = e.state && e.state.url ? e.state.url : window.location.href;
    loadPage(url, false);
  });

  // Prefetching bei Mouseover und Touchstart für Mobilgeräte
  const handlePrefetch = (e: Event) => {
    const link = (e.target as HTMLElement).closest("a");
    if (link && link.href) {
      const url = new URL(link.href);
      if (url.origin === window.location.origin) {
        prefetchPage(link.href);
      }
    }
  };

  document.addEventListener("mouseover", handlePrefetch);
  document.addEventListener("touchstart", handlePrefetch, { passive: true });

  // Alle internen Links abfangen
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");

    if (!link || !link.href) return;

    const targetAttr = link.getAttribute("target");

    try {
      const url = new URL(link.href);

      if (url.origin === window.location.origin && targetAttr !== "_blank") {
        // Anker-Links auf der gleichen Seite ignorieren
        if (url.pathname === window.location.pathname && url.hash) {
          return;
        }

        // Klick auf die aktuelle Seite -> nach oben scrollen
        if (url.pathname === window.location.pathname && !url.hash) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        if (link.getAttribute("href")?.startsWith("mailto:")) return;
        if (link.getAttribute("href")?.startsWith("tel:")) return;

        e.preventDefault();
        loadPage(link.href);
      }
    } catch (err) {
      // Ignorieren falls URL ungültig
    }
  });
}

// --- Background Effects & Bird Tracks ---
function setupEffects() {
  // 1. Feather Particles Background
  const particlesContainer = document.createElement("div");
  particlesContainer.id = "particles-container";
  document.body.prepend(particlesContainer); // Ganz nach hinten

  const createFeather = () => {
    const feather = document.createElement("div");
    feather.className = "feather-particle";

    // Zufällige Startposition, Größe und Animationsdauer
    const startPosX = Math.random() * 100; // 0 bis 100vw
    const size = Math.random() * 0.5 + 0.5; // 0.5 bis 1
    const duration = Math.random() * 10 + 10; // 10s bis 20s
    const delay = Math.random() * 5; // 0s bis 5s

    feather.style.left = `${startPosX}vw`;
    feather.style.transform = `scale(${size})`;
    feather.style.animationDuration = `${duration}s`;
    feather.style.animationDelay = `${delay}s`;

    particlesContainer.appendChild(feather);

    // Entfernen, wenn die Animation durch ist, um DOM-Müll zu vermeiden
    setTimeout(
      () => {
        feather.remove();
      },
      (duration + delay) * 1000,
    );
  };

  // Erzeuge periodisch neue Federn
  setInterval(createFeather, 1500); // Seltener neue Federn für bessere Performance

  // Initial weniger Federn spawnen
  for (let i = 0; i < 8; i++) {
    createFeather();
  }

  // 2. Bird Track Click Effect
  document.addEventListener("click", (e) => {
    const track = document.createElement("div");
    track.className = "bird-track";

    // Position genau unter der Maus
    track.style.left = `${e.clientX}px`;
    track.style.top = `${e.clientY}px`;

    // Leichte, zufällige Rotation für organischen Look
    const rotation = Math.random() * 40 - 20; // -20deg bis +20deg
    track.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;

    // Die Animation überschreibt transform, also nutzen wir ein Wrapper-Element für die Rotation
    // Das bedeutet, der Wrapper rotiert, das Kind pulsiert/fadet
    // -> Um das in CSS beizubehalten, habe ich das scale() direkt hier in TS entfernt und belasse es im CSS

    // Besserer Fix: CSS-Variablen für die Rotation
    track.style.setProperty("--track-rot", `${rotation}deg`);

    document.body.appendChild(track);

    // Element nach der Animation entfernen (0.8s)
    setTimeout(() => {
      track.remove();
    }, 800);
  });
}

// --- Cookie Banner & Analytics ---
function setupCookieBanner(forceShow = false) {
  const consent = localStorage.getItem("cookieConsent");

  if (!forceShow) {
    if (consent === "all") {
      initAnalytics();
      return;
    } else if (consent === "essential") {
      return; // Nur essenziell, kein Analytics laden
    }
  }

  if (document.getElementById("cookie-banner")) return;

  // Banner in den DOM einfügen, falls noch keine Auswahl getroffen wurde oder forceShow true ist
  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.className = "cookie-banner glass-card entrance-animate";
  banner.innerHTML = `
        <div class="cookie-content">
            <h3 data-i18n="cookie_title">cookie_title</h3>
            <p data-i18n="cookie_text">cookie_text</p>
            <div class="cookie-links">
                <a href="imprint.html#imprint" data-i18n="imprint_link">Impressum</a> |
                <a href="imprint.html#privacy" data-i18n="privacy_link">Datenschutz</a>
            </div>
        </div>
        <div class="cookie-buttons">
            <button id="cookie-reject" class="btn btn-secondary" data-i18n="cookie_reject">Nur essenzielle</button>
            <button id="cookie-accept" class="btn" data-i18n="cookie_accept">Alle akzeptieren</button>
        </div>
    `;

  document.body.appendChild(banner);
  updateTexts(); // Update texts for the dynamically created banner

  const closeBanner = (status: "all" | "essential") => {
    localStorage.setItem("cookieConsent", status);
    banner.style.opacity = "0";
    banner.style.transform = "translateY(90%)";
    setTimeout(() => banner.remove(), 400);
    if (status === "all") initAnalytics();
  };

  document
    .getElementById("cookie-accept")
    ?.addEventListener("click", () => closeBanner("all"));
  document
    .getElementById("cookie-reject")
    ?.addEventListener("click", () => closeBanner("essential"));
}

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (
    target.id === "open-cookie-banner" ||
    target.closest("#open-cookie-banner")
  ) {
    e.preventDefault();
    setupCookieBanner(true);
  }
});

function initAnalytics() {
  console.log("Analytics initialized (Consent granted).");

  // Google Analytics (GA4) Skript dynamisch einfügen
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = "https://www.googletagmanager.com/gtag/js?id=G-R18WRP31XQ";
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-R18WRP31XQ');
    `;
  document.head.appendChild(script2);

  // Metricool Tracker (Website-Statistik) dynamisch einfuegen
  const metricool = document.createElement("script");
  metricool.async = true;
  metricool.src = "https://tracker.metricool.com/resources/be.js";
  metricool.onload = () => {
    (window as unknown as {
      beTracker?: { t: (o: { hash: string }) => void };
    }).beTracker?.t({ hash: "8d9a03967f7bdb8481d6ec6f0c9bd793" });
  };
  document.head.appendChild(metricool);
}

// --- FAQ Accordion ---
function setupFAQ() {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".faq-header");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const contentId = btn.getAttribute("aria-controls");
      const content = contentId ? document.getElementById(contentId) : null;

      // Close all others first
      buttons.forEach((other) => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          const otherId = other.getAttribute("aria-controls");
          const otherContent = otherId
            ? document.getElementById(otherId)
            : null;
          if (otherContent) {
            otherContent.style.maxHeight = "0px";
            otherContent.style.opacity = "0";
          }
        }
      });

      // Toggle current
      btn.setAttribute("aria-expanded", (!expanded).toString());
      if (content) {
        if (expanded) {
          content.style.maxHeight = "0px";
          content.style.opacity = "0";
        } else {
          content.style.maxHeight = "300px";
          content.style.opacity = "1";
        }
      }
    });
  });
}

// --- Easter Egg Logic ---
function setupEasterEgg() {
  const chickenEmojis = ["🐔", "🐣", "🐥", "🐤", "🦆", "🐧", "🐓", "🦅"];
  const triggerEasterEgg = () => {
    const emoji = document.createElement("span");
    emoji.className = "easter-chicken";
    emoji.textContent =
      chickenEmojis[Math.floor(Math.random() * chickenEmojis.length)];
    emoji.style.fontSize = Math.floor(Math.random() * 24) + 28 + "px";
    emoji.style.top = Math.floor(Math.random() * 70) + 5 + "%";
    if (Math.random() > 0.5) {
      emoji.style.left = "-80px";
      emoji.style.animationName = "chicken-run";
    } else {
      emoji.style.right = "-80px";
      emoji.style.animationName = "chicken-run-rtl";
    }
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 9000);
  };
  document.querySelectorAll(".easter-hint-container").forEach((el) => {
    el.addEventListener("click", () => {
      for (let i = 0; i < 10; i++) setTimeout(triggerEasterEgg, i * 200);
    });
    (el as HTMLElement).style.cursor = "pointer";
  });
}

// --- Contact Form Logic ---
function setupContactForm() {
  const form = document.getElementById("contact-form") as HTMLFormElement;
  if (!form) return;
  let successMsg = document.querySelector(
    ".contact-success-msg",
  ) as HTMLElement;
  if (!successMsg) {
    successMsg = document.createElement("p");
    successMsg.className = "contact-success-msg";
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn?.insertAdjacentElement("afterend", successMsg);
  }
  const toggleBtns = form.querySelectorAll<HTMLButtonElement>(".toggle-btn");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const strings = translations[currentLanguage];
    const name = (form.querySelector("#name") as HTMLInputElement).value.trim();
    const message = (
      form.querySelector("#message") as HTMLTextAreaElement
    ).value.trim();
    const inquiryType =
      form.querySelector<HTMLButtonElement>(".toggle-btn.active")?.dataset
        .value ?? "business";
    const recipient =
      inquiryType === "fan" ? "fan@nhywyll.com" : "contact@nhywyll.com";
    const subject = encodeURIComponent(
      `${strings?.["contact_subject_prefix"] ?? "Message from"} ${name}`,
    );
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    successMsg.textContent =
      strings?.["contact_success"] ?? "Your mail program has been opened!";
    successMsg.style.display = "block";
    form.reset();
    toggleBtns.forEach((b, i) => b.classList.toggle("active", i === 0));
    setTimeout(() => {
      successMsg.style.display = "none";
    }, 7000);
  });
}

// --- Twitch Live Status Indicator ---
async function checkTwitchLiveStatus() {
  const indicator = document.getElementById("live-indicator");
  if (!indicator) return;

  try {
    const response = await fetch("https://decapi.me/twitch/uptime/nhywyll");
    if (response.ok) {
      const text = await response.text();
      // If the response is not "Channel is offline" (or translated versions), they are live!
      const isOffline = text.toLowerCase().includes("offline");
      if (!isOffline) {
        indicator.classList.remove("hidden");
      } else {
        indicator.classList.add("hidden");
      }
    }
  } catch (error) {
    console.error("Error checking Twitch live status:", error);
  }
}
