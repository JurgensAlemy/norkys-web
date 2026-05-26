/**
 * components.js
 * Carga header y footer, luego llama a updateHeaderAndCart de main.js
 *
 * ORDEN DE SCRIPTS obligatorio en cada HTML:
 *   <script src="js/db.js"></script>
 *   <script src="js/components.js"></script>
 *   <script src="js/main.js"></script>      ← solo donde se use
 *   <script src="js/menu.js"></script>       ← solo menu.html
 *   <script src="js/cart.js"></script>       ← solo cart.html
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

/* ── INIT ─────────────────────────────────────────────────────────────── */
async function initComponents() {
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

    // 3. Countdown del flash offer
    startCountdown();
}

document.addEventListener('DOMContentLoaded', initComponents);