// Inline browser script injected into page-shell: live search fetch, sidebar width/scroll prefs, copy link, theme toggle.
export function renderClientScript(): string {
  return `
const searchInput = document.getElementById("lws-search-input");
const resultBox = document.getElementById("lws-search-results");
const copyButton = document.getElementById("lws-copy-link");
const themeToggleButton = document.getElementById("lws-theme-toggle");
const app = document.getElementById("lws-app");
const sidebar = document.getElementById("lws-sidebar");
const resizer = document.getElementById("lws-resizer");
const SIDEBAR_KEY = "lws-sidebar-width";
const SIDEBAR_SCROLL_KEY = "lws-sidebar-scroll";
const THEME_KEY = "lws-theme-mode";
const MIN_WIDTH = 220;
const MAX_WIDTH = 980;

if (app) {
  const applyAutoWidth = () => {
    const labels = Array.from(
      document.querySelectorAll(".lws-tree .lws-tree-item, .lws-favorite-link, .lws-scope-path")
    );
    const maxTextWidth = labels.reduce((max, el) => Math.max(max, el.scrollWidth), 0);
    const measured = Math.max(
      320,
      Math.min(Math.ceil(maxTextWidth + 130), Math.min(MAX_WIDTH, Math.floor(window.innerWidth * 0.62)))
    );
    app.style.setProperty("--lws-sidebar-width", measured + "px");
    window.localStorage.setItem(SIDEBAR_KEY, String(measured));
  };

  const savedWidth = window.localStorage.getItem(SIDEBAR_KEY);
  const parsed = Number(savedWidth);
  if (Number.isFinite(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
    app.style.setProperty("--lws-sidebar-width", parsed + "px");
  } else {
    applyAutoWidth();
    requestAnimationFrame(applyAutoWidth);
    setTimeout(applyAutoWidth, 80);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => applyAutoWidth());
    }
  }
}

if (app && resizer) {
  let dragging = false;
  const stopDrag = () => {
    dragging = false;
    document.body.classList.remove("lws-resizing");
  };
  const onMove = (event) => {
    if (!dragging) return;
    const width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, event.clientX));
    app.style.setProperty("--lws-sidebar-width", width + "px");
    window.localStorage.setItem(SIDEBAR_KEY, String(width));
  };
  resizer.addEventListener("pointerdown", (event) => {
    dragging = true;
    document.body.classList.add("lws-resizing");
    resizer.setPointerCapture(event.pointerId);
  });
  resizer.addEventListener("pointermove", onMove);
  resizer.addEventListener("pointerup", stopDrag);
  resizer.addEventListener("pointercancel", stopDrag);
}

if (sidebar) {
  let allowSave = false;
  const restoreScroll = () => {
    const savedScroll = Number(window.sessionStorage.getItem(SIDEBAR_SCROLL_KEY));
    if (Number.isFinite(savedScroll) && savedScroll >= 0) {
      sidebar.scrollTop = savedScroll;
    }
  };

  // Restore multiple times to survive layout shifts (expanded branches/fonts).
  restoreScroll();
  requestAnimationFrame(restoreScroll);
  setTimeout(restoreScroll, 60);
  setTimeout(restoreScroll, 120);
  setTimeout(restoreScroll, 220);
  setTimeout(() => {
    allowSave = true;
  }, 260);
  const saveScroll = () => {
    if (!allowSave) return;
    window.sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(sidebar.scrollTop));
  };
  sidebar.addEventListener("scroll", saveScroll, { passive: true });
  sidebar.querySelectorAll("a").forEach((anchor) => {
    anchor.addEventListener("pointerdown", () => {
      window.sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(sidebar.scrollTop));
    });
    anchor.addEventListener("click", () => {
      window.sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(sidebar.scrollTop));
    });
  });
  window.addEventListener("beforeunload", () => {
    window.sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(sidebar.scrollTop));
  });
}

const applyTheme = (mode) => {
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(mode === "light" ? "theme-light" : "theme-dark");
  if (themeToggleButton) {
    themeToggleButton.textContent = mode === "dark" ? "☀ Light mode" : "🌙 Dark mode";
  }
};

const savedTheme = window.localStorage.getItem(THEME_KEY);
const initialTheme = savedTheme === "light" ? "light" : "dark";
applyTheme(initialTheme);

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", () => {
    const current = document.body.classList.contains("theme-dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
  });
}

if (copyButton) {
  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(window.location.href);
    copyButton.textContent = "Copied";
    setTimeout(() => (copyButton.textContent = "Copy link"), 1200);
  });
}
if (searchInput && resultBox) {
  const render = (items) => {
    if (!items.length) {
      resultBox.innerHTML = "<div class='lws-empty'>No results.</div>";
      return;
    }
    resultBox.innerHTML = items
      .map((item) => {
        const href = "/" + encodeURIComponent(item.path.replace(/\\\\/g, "/").replace(/\\.(md|markdown)$/i, "")).replace(/%2F/g, "/");
        return "<div><a href='" + href + "'>" + item.title + "</a><div class='lws-empty'>" + item.snippet + "</div></div>";
      })
      .join("");
  };
  searchInput.addEventListener("input", async () => {
    const q = searchInput.value.trim();
    if (!q) {
      resultBox.innerHTML = "";
      return;
    }
    const response = await fetch("/_search?q=" + encodeURIComponent(q));
    const json = await response.json();
    render(Array.isArray(json.results) ? json.results : []);
  });
}
`;
}
