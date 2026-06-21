/**
 * components.js
 * Carga header y footer, luego llama a updateHeaderAndCart de main.js
 * También activa el modo oscuro global del sitio (ver css/dark-mode.css)
 *
 * ORDEN DE SCRIPTS obligatorio en cada HTML:
 *   <script src="js/db.js"></script>
 *   <script src="js/components.js"></script>
 *   <script src="js/main.js"></script>      ← solo donde se use
 *   <script src="js/menu.js"></script>       ← solo menu.html
 *   <script src="js/cart.js"></script>       ← solo cart.html
 *   <script src="js/checkout.js"></script>   ← solo checkout.html
 *   <script src="js/profile.js"></script>    ← solo profile.html
 */

/* ── CARGA DE COMPONENTES ─────────────────────────────────────────────── */
async function loadComponent(placeholderId, filePath) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;
    try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`No se pudo cargar: ${filePath}`);
        const html = await res.text();
        placeholder.outerHTML = html;
    } catch (err) {
        console.error(`[components.js] Error cargando ${filePath}:`, err);
    }
}

/* ── COUNTDOWN ────────────────────────────────────────────────────────── */
function startCountdown() {
    const el = document.getElementById('header-countdown');
    if (!el) return;
    const KEY = 'norkys_countdown_end';
    let end = parseInt(sessionStorage.getItem(KEY));
    if (!end || end < Date.now()) {
        end = Date.now() + 2.5 * 60 * 60 * 1000;
        sessionStorage.setItem(KEY, end);
    }
    function tick() {
        const diff = end - Date.now();
        if (diff <= 0) { el.textContent = '00:00:00'; return; }
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        el.textContent = `${h}:${m}:${s}`;
    }
    tick();
    setInterval(tick, 1000);
}

/* ── MODO OSCURO GLOBAL (sitio público) ─────────────────────────────────
   Funciona igual que el de dashboard.html: guarda la preferencia en
   localStorage bajo la misma llave 'norkys_theme' y usa el atributo
   data-theme en <html>. El CSS de las reglas oscuras vive en
   css/dark-mode.css, que se inyecta dinámicamente para no tener que
   agregar el <link> a mano en cada página.                              */
function injectDarkModeCSS() {
    if (document.getElementById('dark-mode-css')) return;
    const link = document.createElement('link');
    link.id = 'dark-mode-css';
    link.rel = 'stylesheet';
    link.href = 'css/dark-mode.css';
    document.head.appendChild(link);
}

function applySavedTheme() {
    const saved = localStorage.getItem('norkys_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
}

function wireDarkModeToggle() {
    const btn = document.getElementById('siteThemeToggle');
    if (!btn) return;

    const setIcon = (theme) => {
        btn.innerHTML = `<i class="fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
    };
    setIcon(document.documentElement.getAttribute('data-theme') || 'light');

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('norkys_theme', next);
        setIcon(next);
    });
}

/* ── INIT ─────────────────────────────────────────────────────────────── */
async function initComponents() {
    // 0. Aplicar el tema guardado y cargar su hoja de estilos lo antes
    //    posible, para evitar parpadeos de claro→oscuro al cargar.
    injectDarkModeCSS();
    applySavedTheme();

    // 1. Inyectar header y footer en paralelo
    await Promise.all([
        loadComponent('header-placeholder', 'components/header.html'),
        loadComponent('footer-placeholder', 'components/footer.html'),
    ]);

    // 2. Ahora que el header está en el DOM, llamar updateHeaderAndCart
    //    que ya existe en main.js y hace todo: usuario + carrito
    if (typeof updateHeaderAndCart === 'function') {
        updateHeaderAndCart();
    }

    // 3. Conectar el botón de modo oscuro recién insertado en el header
    wireDarkModeToggle();

    // 4. Countdown del flash offer
    startCountdown();
}

document.addEventListener('DOMContentLoaded', initComponents);
