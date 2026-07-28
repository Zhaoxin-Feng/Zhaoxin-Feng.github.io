/* Shared nav + theme toggle + Tweaks panel */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "forest",
  "font": "classic",
  "density": "normal",
  "theme": "light"
}/*EDITMODE-END*/;

// Apply theme ASAP to avoid flash
(function applyInitialState() {
  const saved = JSON.parse(localStorage.getItem('zf-tweaks') || '{}');
  const t = { ...TWEAK_DEFAULTS, ...saved };
  document.documentElement.dataset.theme = t.theme;
  window.__zfTweaks = t;
})();

document.addEventListener('DOMContentLoaded', () => {
  const t = window.__zfTweaks;
  document.body.dataset.accent = t.accent;
  document.body.dataset.font = t.font;
  document.body.dataset.density = t.density;

  const navMount = document.querySelector('[data-nav]');
  if (navMount) {
    const page = navMount.dataset.nav;
    const link = (href, label, key) =>
      `<a href="${href}" class="${page === key ? 'active' : ''}">${label}</a>`;
    navMount.innerHTML = `
      <nav class="nav">
        <div class="wrap nav-inner">
          <a href="index.html" class="nav-brand">Zhaoxin <em>Feng</em></a>
          <div class="nav-right">
            <div class="nav-links">
              ${link('index.html', 'About', 'about')}
              ${link('publications.html', 'Publications', 'pubs')}
              ${link('cv.html', 'CV', 'cv')}
              ${link('misc.html', 'Misc', 'misc')}
            </div>
            <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme" title="Toggle light/dark">
              <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
              <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            </button>
          </div>
        </div>
      </nav>
    `;
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const now = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTweak('theme', now);
      document.documentElement.dataset.theme = now;
    });
  }

  buildTweaksPanel();

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || !d.type) return;
    if (d.type === '__activate_edit_mode') {
      document.getElementById('tweaks-panel')?.classList.add('on');
    } else if (d.type === '__deactivate_edit_mode') {
      document.getElementById('tweaks-panel')?.classList.remove('on');
    }
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});

function buildTweaksPanel() {
  const panel = document.createElement('div');
  panel.id = 'tweaks-panel';
  panel.innerHTML = `
    <h3>Tweaks <small>live</small></h3>
    <div class="tweak-row">
      <label>Accent</label>
      <div class="tweak-swatches" data-key="accent">
        <button class="tweak-swatch" data-val="navy" style="background:oklch(35% 0.09 265)"></button>
        <button class="tweak-swatch" data-val="oxblood" style="background:oklch(38% 0.11 20)"></button>
        <button class="tweak-swatch" data-val="forest" style="background:oklch(42% 0.09 155)"></button>
        <button class="tweak-swatch" data-val="violet" style="background:oklch(42% 0.09 300)"></button>
        <button class="tweak-swatch" data-val="ochre" style="background:oklch(55% 0.09 70)"></button>
      </div>
    </div>
    <div class="tweak-row">
      <label>Font</label>
      <select class="tweak-select" data-key="font">
        <option value="classic">Lato (original)</option>
        <option value="mixed">Lato + mono</option>
        <option value="serif">Source Serif</option>
        <option value="mono">JetBrains Mono</option>
      </select>
    </div>
    <div class="tweak-row">
      <label>Density</label>
      <select class="tweak-select" data-key="density">
        <option value="tight">Tight</option>
        <option value="normal">Normal</option>
        <option value="airy">Airy</option>
      </select>
    </div>
  `;
  document.body.appendChild(panel);

  const t = window.__zfTweaks;
  panel.querySelectorAll('.tweak-swatches').forEach(group => {
    const key = group.dataset.key;
    group.querySelectorAll('.tweak-swatch').forEach(b => {
      if (b.dataset.val === t[key]) b.classList.add('active');
      b.addEventListener('click', () => {
        group.querySelectorAll('.tweak-swatch').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        setTweak(key, b.dataset.val);
      });
    });
  });
  panel.querySelectorAll('select.tweak-select').forEach(sel => {
    const key = sel.dataset.key;
    sel.value = t[key];
    sel.addEventListener('change', () => setTweak(key, sel.value));
  });
}

function setTweak(key, val) {
  if (key === 'theme') {
    document.documentElement.dataset.theme = val;
  } else {
    document.body.dataset[key] = val;
  }
  const saved = JSON.parse(localStorage.getItem('zf-tweaks') || '{}');
  saved[key] = val;
  localStorage.setItem('zf-tweaks', JSON.stringify(saved));
  window.__zfTweaks[key] = val;
  try {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
  } catch (_) {}
}
