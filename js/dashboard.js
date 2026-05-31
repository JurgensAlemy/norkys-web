// ================= dashboard.js — Panel Admin Norky's =================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const estadoClass = (e) => ({
    'Completado': 'status-completed', 'Entregado': 'status-completed',
    'Pendiente': 'status-pending', 'En Cocina': 'status-cooking',
    'EnCocina': 'status-cooking', 'En Camino': 'status-onway',
    'EnCamino': 'status-onway', 'Cancelado': 'status-cancelled',
}[e] || 'status-pending');

const formatFecha = (s) => {
    if (!s) return '—';
    return new Date(s).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

window.logout = () => {
    localStorage.removeItem('norkys_currentUser');
    window.location.href = 'login.html';
};

// ── NAVEGACIÓN ────────────────────────────────────────────────
const SECCIONES = {
    dashboard: renderDashboard,
    productos: renderProductos,
    pedidos: renderPedidos,
    clientes: renderClientes,
    reportes: renderReportes,
    editor: renderEditor,
    ajustes: renderAjustes,
};

function setActiveSection(nombre) {
    $$('.menu-item').forEach(el => el.classList.remove('active'));
    [...$$('.menu-item')].find(el => el.dataset.section === nombre)?.classList.add('active');
    const labels = {
        dashboard: 'Dashboard', productos: 'Productos', pedidos: 'Pedidos',
        clientes: 'Clientes', reportes: 'Reportes', editor: 'Editor de Inicio', ajustes: 'Ajustes'
    };
    const gt = document.getElementById('greetingTitle');
    if (gt) gt.textContent = labels[nombre] || nombre;
    $('#mainContent').innerHTML = `<div class="loading-state"><i class="fa-solid fa-spinner fa-spin"></i><span>Cargando…</span></div>`;
    SECCIONES[nombre]?.();
}

// ══════════════════════════════════════════════════════════════
// GRÁFICOS — Canvas helpers puros (sin librerías)
// ══════════════════════════════════════════════════════════════
function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}

function drawLineChart(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = options.height || 220;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 20, bottom: 40, left: 58 };
    const iw = W - pad.left - pad.right;
    const ih = H - pad.top - pad.bottom;
    const allValues = datasets.flatMap(d => d.data);
    const maxV = Math.max(...allValues) * 1.15 || 10;
    const dark = isDarkMode();
    const gridColor = dark ? 'rgba(255,180,100,0.08)' : 'rgba(226,90,18,0.08)';
    const textColor = dark ? '#7a5040' : '#b08070';
    const bgColor = dark ? '#1e1008' : '#ffffff';

    ctx.clearRect(0, 0, W, H);

    // Grid lines + Y labels
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + ih - (i / 4) * ih;
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iw, y); ctx.stroke();
        ctx.fillStyle = textColor;
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'right';
        const val = Math.round((i / 4) * maxV);
        ctx.fillText(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val, pad.left - 6, y + 4);
    }

    // X labels
    labels.forEach((lbl, i) => {
        const x = pad.left + (i / (labels.length - 1 || 1)) * iw;
        ctx.fillStyle = textColor;
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, x, H - 8);
    });

    // Datasets
    datasets.forEach(ds => {
        const pts = ds.data.map((v, i) => ({
            x: pad.left + (i / (labels.length - 1 || 1)) * iw,
            y: pad.top + ih - (v / maxV) * ih
        }));

        // Area gradient
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pad.top + ih);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, pad.top + ih);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ih);
        grad.addColorStop(0, ds.color + '40');
        grad.addColorStop(1, ds.color + '00');
        ctx.fillStyle = grad;
        ctx.fill();

        // Smooth line
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
            const cpx = (pts[i - 1].x + pts[i].x) / 2;
            ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Dots
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = ds.color;
            ctx.fill();
            ctx.strokeStyle = bgColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    });
}

function drawDonutChart(canvasId, segments) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const size = 160;
    canvas.width = size * (window.devicePixelRatio || 1);
    canvas.height = size * (window.devicePixelRatio || 1);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.style.display = 'block';
    canvas.style.flexShrink = '0';
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    const cx = size / 2, cy = size / 2, R = 56, r = 36;
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    let angle = -Math.PI / 2;

    segments.forEach(seg => {
        if (!seg.value) return;
        const sweep = (seg.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, angle, angle + sweep);
        ctx.arc(cx, cy, r, angle + sweep, angle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        angle += sweep;
    });

    // Center
    const dark = isDarkMode();
    ctx.fillStyle = dark ? '#f5e6d8' : '#1a0a00';
    ctx.font = `bold 18px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(segments.reduce((s, x) => s + x.value, 0), cx, cy + 5);
    ctx.fillStyle = dark ? '#7a5040' : '#b08070';
    ctx.font = `700 9px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText('TOTAL', cx, cy + 18);
}

function drawBarChart(canvasId, labels, data, color, H = 180) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pad = { top: 16, right: 12, bottom: 32, left: 55 };
    const iw = W - pad.left - pad.right;
    const ih = H - pad.top - pad.bottom;
    const maxV = Math.max(...data) * 1.15 || 10;
    const dark = isDarkMode();
    const gridColor = dark ? 'rgba(255,180,100,0.08)' : 'rgba(226,90,18,0.08)';
    const textColor = dark ? '#7a5040' : '#b08070';

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i <= 3; i++) {
        const y = pad.top + ih - (i / 3) * ih;
        ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iw, y); ctx.stroke();
        ctx.fillStyle = textColor;
        ctx.font = '9px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'right';
        const val = Math.round((i / 3) * maxV);
        ctx.fillText(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val, pad.left - 4, y + 3);
    }

    const bw = (iw / data.length) * 0.55;
    const gap = (iw / data.length) * 0.45;
    data.forEach((v, i) => {
        const bh = (v / maxV) * ih;
        const x = pad.left + i * (iw / data.length) + gap / 2;
        const y = pad.top + ih - bh;
        const grad = ctx.createLinearGradient(0, y, 0, y + bh);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + '88');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, [4, 4, 0, 0]);
        ctx.fill();
        ctx.fillStyle = textColor;
        ctx.font = '9px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + bw / 2, H - 8);
    });
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD PRINCIPAL
// ══════════════════════════════════════════════════════════════
async function renderDashboard() {
    const [pedidos, productos] = await Promise.all([
        fetch(`${API_URL}/pedidos`).then(r => r.json()).catch(() => []),
        fetch(`${API_URL}/productos`).then(r => r.json()).catch(() => []),
    ]);

    const totalIngresos = pedidos.reduce((s, p) => s + (p.total || 0), 0);
    const pendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
    const entregados = pedidos.filter(p => p.estado === 'Entregado' || p.estado === 'Completado').length;
    const ticketProm = pedidos.length ? totalIngresos / pedidos.length : 0;

    const badge = document.getElementById('badgePedidos');
    if (badge) badge.textContent = pendientes || '';

    // Últimos 7 días
    const hoy = new Date();
    const dias7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoy); d.setDate(hoy.getDate() - 6 + i); return d;
    });
    const labels7 = dias7.map(d => d.toLocaleDateString('es-PE', { weekday: 'short' }));
    const ingresos7 = dias7.map(d => {
        const key = d.toISOString().slice(0, 10);
        return pedidos.filter(p => p.fechaCreacion?.slice(0, 10) === key).reduce((s, p) => s + (p.total || 0), 0);
    });
    const pedidos7 = dias7.map(d => {
        const key = d.toISOString().slice(0, 10);
        return pedidos.filter(p => p.fechaCreacion?.slice(0, 10) === key).length;
    });

    // Donut estados
    const estadosCfg = [
        { label: 'Pendiente', color: '#c8ab00' },
        { label: 'En Cocina', color: '#0369a1' },
        { label: 'En Camino', color: '#7c3aed' },
        { label: 'Entregado', color: '#0b9b4b' },
        { label: 'Cancelado', color: '#ef4444' },
    ];
    const donutSegs = estadosCfg.map(e => ({
        ...e,
        value: pedidos.filter(p => p.estado === e.label).length
    }));

    // Categorías bar
    const catStats = {};
    pedidos.forEach(p => {
        (p.detalles || []).forEach(d => {
            const cat = d.producto?.categoria || 'otros';
            catStats[cat] = (catStats[cat] || 0) + (d.subtotal || 0);
        });
    });
    const catLabels = Object.keys(catStats).length
        ? Object.keys(catStats)
        : ['Pollos', 'Combos', 'Parrillas', 'Bebidas', 'Postres'];
    const catValues = Object.keys(catStats).length
        ? Object.values(catStats)
        : [0, 0, 0, 0, 0];

    $('#mainContent').innerHTML = `
    <div class="stats-grid">
        ${statCard('INGRESOS TOTALES', `S/ ${totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 'fa-sack-dollar', 'bg-brand-light', 'up', 'Acumulado total')}
        ${statCard('PEDIDOS TOTALES', pedidos.length, 'fa-cart-flatbed', 'bg-blue-light', 'up', 'En base de datos')}
        ${statCard('ENTREGADOS', entregados, 'fa-circle-check', 'bg-green-light', 'up', 'Completados')}
        ${statCard('TICKET PROMEDIO', `S/ ${ticketProm.toFixed(2)}`, 'fa-receipt', 'bg-yellow-light', 'up', 'Por pedido')}
    </div>

    <!-- FILA DE GRÁFICOS -->
    <div class="charts-row">
        <div class="chart-card">
            <div class="chart-header">
                <div>
                    <div class="chart-title">Ingresos esta semana</div>
                    <div class="chart-subtitle">Últimos 7 días</div>
                </div>
                <div class="chart-tabs">
                    <button class="chart-tab active" id="tabIngresos" onclick="switchChart('ingresos')">S/ Ingresos</button>
                    <button class="chart-tab" id="tabPedidosChart" onclick="switchChart('pedidos')">Pedidos</button>
                </div>
            </div>
            <canvas id="lineChart" style="width:100%;"></canvas>
        </div>
        <div class="chart-card">
            <div class="chart-header">
                <div>
                    <div class="chart-title">Estado de pedidos</div>
                    <div class="chart-subtitle">Distribución actual</div>
                </div>
            </div>
            <div id="estadoBars" style="display:flex;flex-direction:column;gap:10px;margin-top:4px;"></div>
        </div>
    </div>

    <!-- PEDIDOS RECIENTES -->
    <div class="panel-card">
        <div class="panel-header">
            <h3 class="panel-title">Pedidos Recientes</h3>
            <div class="panel-filters">
                <button class="btn-filter" onclick="setActiveSection('pedidos')">Ver todos</button>
                <button class="btn-filter" onclick="exportCSV()"><i class="fa-solid fa-download"></i> CSV</button>
            </div>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead><tr><th>Código</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Cambiar</th></tr></thead>
                <tbody>${renderFilasPedidos(pedidos.slice(0, 8))}</tbody>
            </table>
        </div>
    </div>`;

    // Guardar para switcher
    window._chart7Labels = labels7;
    window._chart7Ingresos = ingresos7;
    window._chart7Pedidos = pedidos7;

    requestAnimationFrame(() => {
        drawLineChart('lineChart', labels7, [{ data: ingresos7, color: '#e25a12' }]);

        const totalPeds = donutSegs.reduce((s, x) => s + x.value, 0) || 1;
        const bars = document.getElementById('estadoBars');
        if (bars) bars.innerHTML = donutSegs.map(s => `
            <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                    <span style="font-size:12px;font-weight:700;color:var(--text-2);display:flex;align-items:center;gap:6px;">
                        <span style="width:8px;height:8px;border-radius:50%;background:${s.color};display:inline-block;flex-shrink:0;"></span>
                        ${s.label}
                    </span>
                    <span style="font-size:12px;font-weight:800;color:var(--text-1);">${s.value}</span>
                </div>
                <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${Math.round(s.value / totalPeds * 100)}%;background:${s.color};border-radius:4px;transition:width .6s ease;"></div>
                </div>
            </div>`).join('');
    });
}

window.switchChart = (tipo) => {
    document.getElementById('tabIngresos')?.classList.toggle('active', tipo === 'ingresos');
    document.getElementById('tabPedidosChart')?.classList.toggle('active', tipo === 'pedidos');
    if (tipo === 'ingresos') {
        drawLineChart('lineChart', window._chart7Labels, [{ data: window._chart7Ingresos, color: '#e25a12' }]);
    } else {
        drawLineChart('lineChart', window._chart7Labels, [{ data: window._chart7Pedidos, color: '#0b9b4b' }]);
    }
};

function statCard(titulo, valor, icon, bg, trend, sub) {
    return `<div class="stat-card">
        <div class="stat-header">
            <span class="stat-desc">${titulo}</span>
            <div class="stat-icon ${bg}"><i class="fa-solid ${icon}"></i></div>
        </div>
        <div class="stat-value">${valor}</div>
        <div class="trend ${trend}"><i class="fa-solid fa-arrow-trend-${trend}"></i> ${sub}</div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// PRODUCTOS
// ══════════════════════════════════════════════════════════════
let _productos = [];

async function renderProductos() {
    if (_productos.length === 0)
        _productos = await fetch(`${API_URL}/productos`).then(r => r.json()).catch(() => []);

    $('#mainContent').innerHTML = `
    <div class="panel-card">
        <div class="panel-header">
            <h3 class="panel-title">Gestión de Productos</h3>
            <button class="btn-primary" onclick="abrirModalProducto()"><i class="fa-solid fa-plus"></i> Nuevo Producto</button>
        </div>
        <div class="filter-bar">
            <span class="filter-label"><i class="fa-solid fa-filter"></i> Filtrar:</span>
            <select class="filter-select" id="filtroCat" onchange="filtrarProductos()">
                <option value="">Todas las categorías</option>
                <option value="pollos">🍗 Pollos a la Brasa</option>
                <option value="parrillas">🔥 Parrillas</option>
                <option value="combos">👥 Combos</option>
                <option value="hamburguesas">🍔 Hamburguesas</option>
                <option value="bebidas">🥤 Bebidas</option>
                <option value="postres">🍰 Postres</option>
                <option value="porciones">🍟 Porciones</option>
            </select>
            <input class="filter-input" id="filtroNombre" type="text" placeholder="Buscar producto…" oninput="filtrarProductos()" style="width:200px;">
            <select class="filter-select" id="filtroEstado" onchange="filtrarProductos()">
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
            </select>
            <span class="results-count" id="countProductos">${_productos.length} producto(s)</span>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead><tr><th>ID</th><th>Imagen</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody id="tbodyProductos">${renderFilasProductos(_productos)}</tbody>
            </table>
        </div>
    </div>
    ${modalProductoHTML()}`;
}

function renderFilasProductos(lista) {
    if (!lista.length) return '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-3);">Sin resultados</td></tr>';
    return lista.map(p => `
        <tr>
            <td style="color:var(--text-3);font-size:12px;">#${p.id}</td>
            <td><img src="${p.imgUrl || ''}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;background:var(--surface-2);" onerror="this.style.display='none'"></td>
            <td>
                <strong style="font-size:13px;">${p.nombre}</strong>
                <div style="font-size:11px;color:var(--text-3);margin-top:2px;">${(p.descripcion || '').substring(0, 50)}${(p.descripcion || '').length > 50 ? '…' : ''}</div>
            </td>
            <td><span class="status-pill status-cooking" style="text-transform:capitalize;">${p.categoria}</span></td>
            <td><strong>S/ ${p.precio.toFixed(2)}</strong></td>
            <td><span class="status-pill ${p.activo ? 'status-completed' : 'status-cancelled'}">${p.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td><div style="display:flex;gap:6px;">
                <button onclick="abrirModalProducto(${p.id})" style="background:var(--blue-bg);color:var(--blue);border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:12px;font-weight:700;" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button onclick="eliminarProducto(${p.id},'${p.nombre.replace(/'/g, "\\'")}')" style="background:#fee2e2;color:#b91c1c;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:12px;font-weight:700;" title="Desactivar"><i class="fa-solid fa-trash"></i></button>
            </div></td>
        </tr>`).join('');
}

window.filtrarProductos = () => {
    const cat = document.getElementById('filtroCat')?.value || '';
    const nombre = document.getElementById('filtroNombre')?.value || '';
    const estado = document.getElementById('filtroEstado')?.value || '';
    let lista = _productos;
    if (cat) lista = lista.filter(p => p.categoria === cat);
    if (nombre) lista = lista.filter(p => p.nombre.toLowerCase().includes(nombre.toLowerCase()));
    if (estado === 'activo') lista = lista.filter(p => p.activo);
    if (estado === 'inactivo') lista = lista.filter(p => !p.activo);
    document.getElementById('tbodyProductos').innerHTML = renderFilasProductos(lista);
    document.getElementById('countProductos').textContent = `${lista.length} producto(s)`;
};

// ══════════════════════════════════════════════════════════════
// PEDIDOS
// ══════════════════════════════════════════════════════════════
let _pedidos = [];

async function renderPedidos() {
    _pedidos = await fetch(`${API_URL}/pedidos`).then(r => r.json()).catch(() => []);
    $('#mainContent').innerHTML = `
    <div class="panel-card">
        <div class="panel-header">
            <h3 class="panel-title">Todos los Pedidos</h3>
            <button class="btn-filter" onclick="exportCSV()"><i class="fa-solid fa-download"></i> Exportar CSV</button>
        </div>
        <div class="filter-bar">
            <select class="filter-select" id="filtroEstadoPedido" onchange="filtrarPedidos()">
                <option value="">Todos los estados</option>
                <option value="Pendiente">⏳ Pendiente</option>
                <option value="En Cocina">🔥 En Cocina</option>
                <option value="En Camino">🛵 En Camino</option>
                <option value="Entregado">✅ Entregado</option>
                <option value="Cancelado">❌ Cancelado</option>
            </select>
            <span class="filter-label">Desde:</span>
            <input class="filter-input" id="filtroFechaDesde" type="date" onchange="filtrarPedidos()">
            <span class="filter-label">Hasta:</span>
            <input class="filter-input" id="filtroFechaHasta" type="date" onchange="filtrarPedidos()">
            <input class="filter-input" id="filtroCliente" type="text" placeholder="Buscar cliente…" oninput="filtrarPedidos()" style="width:170px;">
            <button class="btn-filter" onclick="limpiarFiltrosPedidos()"><i class="fa-solid fa-xmark"></i> Limpiar</button>
            <span class="results-count" id="countPedidos">${_pedidos.length} pedido(s)</span>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead><tr><th>Código</th><th>Cliente</th><th>Dirección</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Cambiar Estado</th></tr></thead>
                <tbody id="tbodyPedidos">${renderFilasPedidos(_pedidos)}</tbody>
            </table>
        </div>
    </div>`;
}

function renderFilasPedidos(lista) {
    if (!lista.length) return '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-3);">No hay pedidos</td></tr>';
    return lista.map(o => `
        <tr>
            <td><strong style="color:var(--brand);font-size:13px;">${o.codigo || '#' + o.id}</strong></td>
            <td><div class="user-cell">
                <div style="width:28px;height:28px;border-radius:8px;background:var(--red-dim);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--brand);flex-shrink:0;">
                    ${o.usuario ? (o.usuario.nombres[0] + (o.usuario.apellidos?.[0] || '')).toUpperCase() : '?'}
                </div>
                ${o.usuario ? `${o.usuario.nombres} ${o.usuario.apellidos}` : '—'}
            </div></td>
            <td style="font-size:11.5px;color:var(--text-3);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${o.direccionEntrega || '—'}</td>
            <td style="font-size:12px;white-space:nowrap;">${formatFecha(o.fechaCreacion)}</td>
            <td><strong>S/ ${(o.total || 0).toFixed(2)}</strong></td>
            <td><span class="status-pill ${estadoClass(o.estado)}">${o.estado}</span></td>
            <td>
                <select class="filter-select" style="font-size:12px;padding:5px 8px;" onchange="cambiarEstado(${o.id},this.value)">
                    <option value="">— cambiar —</option>
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="En Cocina">🔥 En Cocina</option>
                    <option value="En Camino">🛵 En Camino</option>
                    <option value="Entregado">✅ Entregado</option>
                    <option value="Cancelado">❌ Cancelado</option>
                </select>
            </td>
        </tr>`).join('');
}

window.filtrarPedidos = () => {
    const estado = document.getElementById('filtroEstadoPedido')?.value || '';
    const desde = document.getElementById('filtroFechaDesde')?.value;
    const hasta = document.getElementById('filtroFechaHasta')?.value;
    const cliente = document.getElementById('filtroCliente')?.value.toLowerCase() || '';
    let lista = _pedidos;
    if (estado) lista = lista.filter(p => p.estado === estado);
    if (desde) lista = lista.filter(p => new Date(p.fechaCreacion) >= new Date(desde));
    if (hasta) lista = lista.filter(p => new Date(p.fechaCreacion) <= new Date(hasta + 'T23:59:59'));
    if (cliente) lista = lista.filter(p => {
        const n = p.usuario ? `${p.usuario.nombres} ${p.usuario.apellidos}`.toLowerCase() : '';
        return n.includes(cliente);
    });
    document.getElementById('tbodyPedidos').innerHTML = renderFilasPedidos(lista);
    document.getElementById('countPedidos').textContent = `${lista.length} pedido(s)`;
};

window.limpiarFiltrosPedidos = () => {
    ['filtroEstadoPedido', 'filtroFechaDesde', 'filtroFechaHasta', 'filtroCliente'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    filtrarPedidos();
};

window.cambiarEstado = async (id, estado) => {
    if (!estado) return;
    const res = await fetch(`${API_URL}/pedidos/${id}/estado`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
    });
    if (res.ok) {
        showAdminToast(`Estado → "${estado}"`, 'success');
        const idx = _pedidos.findIndex(p => p.id === id);
        if (idx !== -1) { _pedidos[idx].estado = estado; filtrarPedidos(); }
    } else showAdminToast('Error al cambiar estado', 'error');
};

// ══════════════════════════════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════════════════════════════
async function renderClientes() {
    const res = await fetch(`${API_URL}/usuarios`).catch(() => null);
    if (!res || !res.ok) {
        $('#mainContent').innerHTML = `<div class="panel-card" style="text-align:center;padding:50px;">
            <i class="fa-solid fa-users" style="font-size:40px;color:var(--text-3);margin-bottom:12px;display:block;"></i>
            <p style="color:var(--text-2);">No se pudo cargar la lista de clientes.</p></div>`;
        return;
    }
    const usuarios = await res.json();
    $('#mainContent').innerHTML = `
    <div class="panel-card">
        <div class="panel-header">
            <h3 class="panel-title">Clientes Registrados</h3>
            <span style="font-size:12px;color:var(--text-3);font-weight:700;">${usuarios.length} usuario(s)</span>
        </div>
        <div class="filter-bar">
            <input class="filter-input" id="filtroUsuario" type="text" placeholder="Buscar por nombre o correo…" oninput="filtrarUsuarios()" style="width:260px;">
            <select class="filter-select" id="filtroRol" onchange="filtrarUsuarios()">
                <option value="">Todos los roles</option>
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
            </select>
            <span class="results-count" id="countUsuarios">${usuarios.length} resultado(s)</span>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Celular</th><th>Rol</th><th>Estado</th></tr></thead>
                <tbody id="tbodyUsuarios">${renderFilasUsuarios(usuarios)}</tbody>
            </table>
        </div>
    </div>`;
    window._usuarios = usuarios;
}

function renderFilasUsuarios(lista) {
    return lista.map(u => `
        <tr>
            <td style="color:var(--text-3);font-size:12px;">#${u.id}</td>
            <td><div class="user-cell">
                <div style="width:28px;height:28px;border-radius:8px;background:var(--red-dim);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--brand);">
                    ${(u.nombres[0] + (u.apellidos?.[0] || '')).toUpperCase()}
                </div>
                <strong>${u.nombres} ${u.apellidos}</strong>
            </div></td>
            <td style="color:var(--text-2);">${u.correo}</td>
            <td style="color:var(--text-2);">${u.celular || '—'}</td>
            <td><span class="status-pill ${u.rol === 'admin' ? 'status-onway' : 'status-completed'}">${u.rol}</span></td>
            <td><span class="status-pill ${u.activo ? 'status-completed' : 'status-cancelled'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
        </tr>`).join('');
}

window.filtrarUsuarios = () => {
    const q = document.getElementById('filtroUsuario')?.value.toLowerCase() || '';
    const rol = document.getElementById('filtroRol')?.value || '';
    let lista = window._usuarios || [];
    if (q) lista = lista.filter(u => `${u.nombres} ${u.apellidos} ${u.correo}`.toLowerCase().includes(q));
    if (rol) lista = lista.filter(u => u.rol === rol);
    document.getElementById('tbodyUsuarios').innerHTML = renderFilasUsuarios(lista);
    document.getElementById('countUsuarios').textContent = `${lista.length} resultado(s)`;
};

// ══════════════════════════════════════════════════════════════
// REPORTES con gráficos
// ══════════════════════════════════════════════════════════════
async function renderReportes() {
    const pedidos = await fetch(`${API_URL}/pedidos`).then(r => r.json()).catch(() => []);
    const total = pedidos.reduce((s, p) => s + (p.total || 0), 0);
    const completados = pedidos.filter(p => p.estado === 'Entregado' || p.estado === 'Completado').length;
    const cancelados = pedidos.filter(p => p.estado === 'Cancelado').length;

    // Últimas 4 semanas
    const hoy = new Date();
    const semanas = ['Sem 4', 'Sem 3', 'Sem 2', 'Sem 1'];
    const ingSemanas = semanas.map((_, i) => {
        const desde = new Date(hoy); desde.setDate(hoy.getDate() - (i + 1) * 7);
        const hasta = new Date(hoy); hasta.setDate(hoy.getDate() - i * 7);
        return pedidos.filter(p => {
            const f = new Date(p.fechaCreacion);
            return f >= desde && f < hasta;
        }).reduce((s, p) => s + (p.total || 0), 0);
    }).reverse();

    const estadosCfg = [
        { label: 'Pendiente', color: '#c8ab00' },
        { label: 'En Cocina', color: '#0369a1' },
        { label: 'En Camino', color: '#7c3aed' },
        { label: 'Entregado', color: '#0b9b4b' },
        { label: 'Cancelado', color: '#ef4444' },
    ];
    const donutSegs = estadosCfg.map(e => ({
        ...e, value: pedidos.filter(p => p.estado === e.label).length
    }));

    $('#mainContent').innerHTML = `
    <div class="stats-grid">
        ${statCard('INGRESOS TOTALES', `S/ ${total.toFixed(2)}`, 'fa-sack-dollar', 'bg-brand-light', 'up', 'Todos los pedidos')}
        ${statCard('COMPLETADOS', completados, 'fa-circle-check', 'bg-green-light', 'up', 'Entregados')}
        ${statCard('CANCELADOS', cancelados, 'fa-circle-xmark', 'bg-yellow-light', 'down', 'Cancelados')}
        ${statCard('TICKET PROMEDIO', pedidos.length ? `S/ ${(total / pedidos.length).toFixed(2)}` : 'S/ 0', 'fa-receipt', 'bg-blue-light', 'up', 'Por pedido')}
    </div>

    <div class="charts-row">
        <div class="chart-card">
            <div class="chart-header">
                <div>
                    <div class="chart-title">Ingresos por semana</div>
                    <div class="chart-subtitle">Últimas 4 semanas</div>
                </div>
            </div>
            <canvas id="reportBarChart" style="width:100%;"></canvas>
        </div>
        <div class="chart-card">
            <div class="chart-header">
                <div>
                    <div class="chart-title">Estados de pedidos</div>
                    <div class="chart-subtitle">Distribución completa</div>
                </div>
            </div>
            <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
                <canvas id="reportDonut"></canvas>
                <div class="donut-legend" id="reportDonutLeg"></div>
            </div>
        </div>
    </div>

    <div class="panel-card">
        <div class="panel-header"><h3 class="panel-title">Distribución por Estado</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-top:4px;">
            ${estadosCfg.map(e => {
        const n = pedidos.filter(p => p.estado === e.label).length;
        const pct = pedidos.length ? Math.round(n / pedidos.length * 100) : 0;
        return `<div style="background:var(--surface-2);border-radius:12px;padding:16px;border:2px solid var(--border);">
                    <div style="font-size:10px;font-weight:800;color:var(--text-3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">${e.label}</div>
                    <div style="font-family:Outfit,sans-serif;font-size:28px;font-weight:900;color:var(--text-1);">${n}</div>
                    <div style="margin-top:10px;height:6px;background:var(--border);border-radius:3px;">
                        <div style="width:${pct}%;height:100%;background:${e.color};border-radius:3px;transition:width .6s;"></div>
                    </div>
                    <div style="font-size:10.5px;color:var(--text-3);margin-top:5px;">${pct}% del total</div>
                </div>`;
    }).join('')}
        </div>
    </div>`;

    requestAnimationFrame(() => {
        drawBarChart('reportBarChart', semanas, ingSemanas, '#e25a12');
        drawDonutChart('reportDonut', donutSegs);
        const leg = document.getElementById('reportDonutLeg');
        if (leg) leg.innerHTML = donutSegs.map(s => `
            <div class="donut-legend-item">
                <span class="donut-dot" style="background:${s.color}"></span>
                <span>${s.label}: <strong>${s.value}</strong></span>
            </div>`).join('');
    });
}

// ══════════════════════════════════════════════════════════════
// EDITOR DE INICIO
// ══════════════════════════════════════════════════════════════
function renderEditor() {
    const cfg = JSON.parse(localStorage.getItem('norkys_site_config') || '{}');
    const categorias = cfg.categorias || [
        { emoji: '🍗', nombre: 'Pollo a la Brasa', slug: 'pollos' },
        { emoji: '🔥', nombre: 'Parrillas', slug: 'parrillas' },
        { emoji: '👥', nombre: 'Combos Especiales', slug: 'combos' },
        { emoji: '🥤', nombre: 'Bebidas', slug: 'bebidas' },
        { emoji: '🍔', nombre: 'Hamburguesas', slug: 'hamburguesas' },
        { emoji: '🍟', nombre: 'Porciones', slug: 'porciones' },
        { emoji: '🍰', nombre: 'Postres', slug: 'postres' },
    ];

    $('#mainContent').innerHTML = `
    <div class="editor-grid">

        <div class="editor-card">
            <div class="editor-card-header">
                <h3 class="editor-card-title"><i class="fa-solid fa-image" style="color:var(--brand);margin-right:8px;"></i>Banner Principal</h3>
                <span style="font-size:10px;color:var(--text-3);font-weight:700;">VISTA PREVIA EN VIVO</span>
            </div>
            <div class="banner-preview">
                <div class="banner-preview-badge">🛵 SOLO POR DELIVERY</div>
                <div class="banner-preview-title" id="prevBannerTitle">${cfg.bannerTitulo || 'Mega Combo Familiar'}</div>
                <div class="banner-preview-sub" id="prevBannerSub">${cfg.bannerSub || 'Solo por delivery'}</div>
            </div>
            <div class="editor-form">
                <div><label class="editor-label">Título del banner</label>
                    <input class="editor-input" id="eBannerTitulo" value="${cfg.bannerTitulo || 'Mega Combo Familiar'}" oninput="document.getElementById('prevBannerTitle').textContent=this.value"></div>
                <div><label class="editor-label">Subtítulo</label>
                    <input class="editor-input" id="eBannerSub" value="${cfg.bannerSub || 'Solo por delivery'}" oninput="document.getElementById('prevBannerSub').textContent=this.value"></div>
                <div><label class="editor-label">Texto del botón CTA</label>
                    <input class="editor-input" id="eBannerCTA" value="${cfg.bannerCTA || 'Pedir ahora'}"></div>
                <div><label class="editor-label">Enlace del botón</label>
                    <input class="editor-input" id="eBannerLink" value="${cfg.bannerLink || 'menu.html#combos'}"></div>
                <div><label class="editor-label">Texto contador</label>
                    <input class="editor-input" id="eBannerContador" value="${cfg.bannerContador || '+2,400 pedidos hoy'}"></div>
            </div>
        </div>

        <div class="editor-card">
            <div class="editor-card-header">
                <h3 class="editor-card-title"><i class="fa-solid fa-rectangle-ad" style="color:var(--purple);margin-right:8px;"></i>Banners Secundarios</h3>
            </div>
            <div class="editor-form">
                <div class="editor-group">
                    <div class="editor-group-label"><span style="background:var(--red-dim);color:var(--brand);padding:2px 8px;border-radius:20px;font-size:9px;">BANNER ROSA</span></div>
                    <div class="editor-group-fields">
                        <div><label class="editor-label">Etiqueta</label><input class="editor-input" id="eBanner2Tag" value="${cfg.banner2Tag || '✦ NUEVO'}"></div>
                        <div><label class="editor-label">Título</label><input class="editor-input" id="eBanner2Titulo" value="${cfg.banner2Titulo || 'Causa Rellena'}"></div>
                        <div><label class="editor-label">Enlace</label><input class="editor-input" id="eBanner2Link" value="${cfg.banner2Link || 'menu.html#porciones'}"></div>
                    </div>
                </div>
                <div class="editor-group">
                    <div class="editor-group-label"><span style="background:var(--green-bg);color:var(--green);padding:2px 8px;border-radius:20px;font-size:9px;">BANNER VERDE</span></div>
                    <div class="editor-group-fields">
                        <div><label class="editor-label">Etiqueta</label><input class="editor-input" id="eBanner3Tag" value="${cfg.banner3Tag || '✦ REFRESCANTE'}"></div>
                        <div><label class="editor-label">Título</label><input class="editor-input" id="eBanner3Titulo" value="${cfg.banner3Titulo || 'Chicha Morada'}"></div>
                        <div><label class="editor-label">Enlace</label><input class="editor-input" id="eBanner3Link" value="${cfg.banner3Link || 'menu.html#bebidas'}"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="editor-card">
            <div class="editor-card-header">
                <h3 class="editor-card-title"><i class="fa-solid fa-tags" style="color:var(--green);margin-right:8px;"></i>Categorías del Menú</h3>
                <button class="btn-primary" style="font-size:11px;padding:7px 12px;" onclick="abrirModalCategoria()"><i class="fa-solid fa-plus"></i> Agregar</button>
            </div>
            <div class="categoria-list" id="categoriaList">
                ${categorias.map((c, i) => categoriaItemHTML(c, i)).join('')}
            </div>
        </div>

        <div class="editor-card">
            <div class="editor-card-header">
                <h3 class="editor-card-title"><i class="fa-solid fa-align-left" style="color:var(--accent-yellow-dark);margin-right:8px;"></i>Textos del Sitio</h3>
            </div>
            <div class="editor-form">
                <div class="editor-group">
                    <div class="editor-group-label"><span style="background:var(--yellow-bg);color:var(--yellow);padding:2px 8px;border-radius:20px;font-size:9px;">SECCIÓN FAVORITOS</span></div>
                    <div class="editor-group-fields">
                        <div><label class="editor-label">Título de sección</label><input class="editor-input" id="eSeccionFavTitulo" value="${cfg.seccionFavTitulo || "Lo más pedido en Norky's"}"></div>
                        <div><label class="editor-label">Tag de sección</label><input class="editor-input" id="eSeccionFavTag" value="${cfg.seccionFavTag || '⭐ LOS FAVORITOS'}"></div>
                    </div>
                </div>
                <div class="editor-group">
                    <div class="editor-group-label"><span style="background:var(--blue-bg);color:var(--blue);padding:2px 8px;border-radius:20px;font-size:9px;">CONTACTO Y FOOTER</span></div>
                    <div class="editor-group-fields">
                        <div><label class="editor-label">Teléfono</label><input class="editor-input" id="eTelefono" value="${cfg.telefono || '(01) 234-5678'}"></div>
                        <div><label class="editor-label">Horario de atención</label><input class="editor-input" id="eHorario" value="${cfg.horario || 'Lun - Dom: 11:00 am - 11:00 pm'}"></div>
                        <div><label class="editor-label">Mensaje del footer</label><input class="editor-input" id="eFooterMsg" value="${cfg.footerMsg || "© 2026 Norky's. Todos los derechos reservados."}"></div>
                    </div>
                </div>
            </div>
            <button class="btn-save-settings" onclick="guardarConfigSitio()">
                <i class="fa-solid fa-floppy-disk"></i> Guardar todos los cambios
            </button>
        </div>

    </div>

    <div id="modalCategoria" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center;backdrop-filter:blur(4px);">
        <div style="background:var(--surface);border-radius:16px;padding:28px;width:380px;max-width:92vw;box-shadow:var(--shadow-lg);border:2px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="font-family:Outfit,sans-serif;font-size:16px;font-weight:800;color:var(--text-1);">Nueva Categoría</h3>
                <button onclick="document.getElementById('modalCategoria').style.display='none'" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-3);">×</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:13px;">
                <div><label class="editor-label">Emoji</label><input class="editor-input" id="catEmoji" placeholder="🍗" maxlength="2" style="width:80px;font-size:22px;text-align:center;"></div>
                <div><label class="editor-label">Nombre visible</label><input class="editor-input" id="catNombre" placeholder="Ej: Pollo a la Brasa"></div>
                <div><label class="editor-label">Slug (sin espacios)</label><input class="editor-input" id="catSlug" placeholder="pollos" oninput="this.value=this.value.toLowerCase().replace(/\s+/g,'-')"></div>
            </div>
            <button onclick="agregarCategoria()" class="btn-save-settings" style="margin-top:16px;"><i class="fa-solid fa-plus"></i> Agregar Categoría</button>
        </div>
    </div>`;
}

function categoriaItemHTML(c, i) {
    return `<div class="categoria-item" id="catItem${i}">
        <div class="categoria-emoji">${c.emoji}</div>
        <div style="flex:1;">
            <div class="categoria-nombre">${c.nombre}</div>
            <div class="categoria-slug">menu.html#${c.slug}</div>
        </div>
        <button class="btn-icon-sm delete" onclick="eliminarCategoria(${i})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
    </div>`;
}

window.abrirModalCategoria = () => {
    document.getElementById('modalCategoria').style.display = 'flex';
    ['catEmoji', 'catNombre', 'catSlug'].forEach(id => document.getElementById(id).value = '');
};

window.agregarCategoria = () => {
    const emoji = document.getElementById('catEmoji').value.trim();
    const nombre = document.getElementById('catNombre').value.trim();
    const slug = document.getElementById('catSlug').value.trim();
    if (!emoji || !nombre || !slug) return showAdminToast('Completa todos los campos', 'error');
    const cfg = JSON.parse(localStorage.getItem('norkys_site_config') || '{}');
    if (!cfg.categorias) cfg.categorias = [
        { emoji: '🍗', nombre: 'Pollo a la Brasa', slug: 'pollos' },
        { emoji: '🔥', nombre: 'Parrillas', slug: 'parrillas' },
        { emoji: '👥', nombre: 'Combos Especiales', slug: 'combos' },
        { emoji: '🥤', nombre: 'Bebidas', slug: 'bebidas' },
        { emoji: '🍔', nombre: 'Hamburguesas', slug: 'hamburguesas' },
        { emoji: '🍟', nombre: 'Porciones', slug: 'porciones' },
        { emoji: '🍰', nombre: 'Postres', slug: 'postres' },
    ];
    cfg.categorias.push({ emoji, nombre, slug });
    localStorage.setItem('norkys_site_config', JSON.stringify(cfg));
    document.getElementById('modalCategoria').style.display = 'none';
    showAdminToast('Categoría agregada', 'success');
    renderEditor();
};

window.eliminarCategoria = (i) => {
    const cfg = JSON.parse(localStorage.getItem('norkys_site_config') || '{}');
    if (!cfg.categorias) return;
    cfg.categorias.splice(i, 1);
    localStorage.setItem('norkys_site_config', JSON.stringify(cfg));
    renderEditor();
    showAdminToast('Categoría eliminada', 'success');
};

window.guardarConfigSitio = () => {
    const cfg = JSON.parse(localStorage.getItem('norkys_site_config') || '{}');
    ['eBannerTitulo', 'eBannerSub', 'eBannerCTA', 'eBannerLink', 'eBannerContador',
        'eBanner2Tag', 'eBanner2Titulo', 'eBanner2Link',
        'eBanner3Tag', 'eBanner3Titulo', 'eBanner3Link',
        'eSeccionFavTitulo', 'eSeccionFavTag', 'eTelefono', 'eHorario', 'eFooterMsg'
    ].forEach(id => {
        const key = id.charAt(1).toLowerCase() + id.slice(2);
        const el = document.getElementById(id);
        if (el) cfg[key] = el.value;
    });
    localStorage.setItem('norkys_site_config', JSON.stringify(cfg));
    showAdminToast('¡Configuración guardada! Recarga el index para ver los cambios.', 'success');
};

// ══════════════════════════════════════════════════════════════
// AJUSTES
// ══════════════════════════════════════════════════════════════
function renderAjustes() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    $('#mainContent').innerHTML = `
    <div class="settings-grid">
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="settings-card-icon bg-purple-light"><i class="fa-solid fa-palette"></i></div>
                <div><div class="settings-card-title">Apariencia</div><div class="settings-card-sub">Personaliza el aspecto del panel</div></div>
            </div>
            <div class="setting-row">
                <div><div class="setting-label">Modo de color</div><div class="setting-sub">Claro u oscuro según tu preferencia</div></div>
                <div class="theme-selector">
                    <button class="theme-btn light ${theme === 'light' ? 'active' : ''}" onclick="aplicarTema('light')"><i class="fa-solid fa-sun"></i> Claro</button>
                    <button class="theme-btn dark ${theme === 'dark' ? 'active' : ''}" onclick="aplicarTema('dark')"><i class="fa-solid fa-moon"></i> Oscuro</button>
                </div>
            </div>
            <div class="setting-row">
                <div><div class="setting-label">Sidebar compacto</div><div class="setting-sub">Solo iconos en el menú lateral</div></div>
                <label class="toggle-switch"><input type="checkbox" id="toggleCompact" ${localStorage.getItem('norkys_compact') === 'true' ? 'checked' : ''} onchange="toggleCompactSidebar(this.checked)"><span class="toggle-slider"></span></label>
            </div>
        </div>
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="settings-card-icon bg-yellow-light"><i class="fa-solid fa-bell"></i></div>
                <div><div class="settings-card-title">Notificaciones</div><div class="settings-card-sub">Configura las alertas del sistema</div></div>
            </div>
            <div class="setting-row"><div><div class="setting-label">Nuevos pedidos</div><div class="setting-sub">Alerta cuando llega un pedido nuevo</div></div><label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
            <div class="setting-row"><div><div class="setting-label">Pedidos pendientes</div><div class="setting-sub">Recordatorio si hay pedidos sin atender</div></div><label class="toggle-switch"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
            <div class="setting-row"><div><div class="setting-label">Nuevos registros</div><div class="setting-sub">Cuando un usuario se registra</div></div><label class="toggle-switch"><input type="checkbox"><span class="toggle-slider"></span></label></div>
        </div>
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="settings-card-icon bg-green-light"><i class="fa-solid fa-store"></i></div>
                <div><div class="settings-card-title">Datos de la Tienda</div><div class="settings-card-sub">Información general del negocio</div></div>
            </div>
            <div class="setting-row"><div class="setting-label">Nombre del negocio</div><input class="setting-input" value="Norky's" id="sNombre"></div>
            <div class="setting-row"><div class="setting-label">Costo de envío (S/)</div><input class="setting-input" type="number" value="${localStorage.getItem('norkys_shipping') || '5'}" id="sEnvio" style="width:90px;"></div>
            <div class="setting-row"><div class="setting-label">Pedido mínimo (S/)</div><input class="setting-input" type="number" value="${localStorage.getItem('norkys_minorder') || '0'}" id="sMinimo" style="width:90px;"></div>
            <div class="setting-row">
                <div><div class="setting-label">Tienda abierta</div><div class="setting-sub">Activa o pausa los pedidos</div></div>
                <label class="toggle-switch"><input type="checkbox" ${localStorage.getItem('norkys_open') !== 'false' ? 'checked' : ''} id="sTiendaAbierta"><span class="toggle-slider"></span></label>
            </div>
            <button class="btn-save-settings" onclick="guardarAjustes()"><i class="fa-solid fa-floppy-disk"></i> Guardar ajustes</button>
        </div>
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="settings-card-icon bg-brand-light"><i class="fa-solid fa-shield-halved"></i></div>
                <div><div class="settings-card-title">Cuenta de Admin</div><div class="settings-card-sub">Seguridad y acceso</div></div>
            </div>
            <div class="setting-row">
                <div><div class="setting-label">Sesión activa</div><div class="setting-sub" id="sesionInfo" style="color:var(--green);">Conectado</div></div>
                <span class="status-pill status-completed">Activo</span>
            </div>
            <div class="setting-row">
                <div><div class="setting-label">Ir al perfil</div><div class="setting-sub">Edita tus datos personales</div></div>
                <a href="profile.html" style="font-size:12px;font-weight:700;color:var(--brand);text-decoration:none;">Abrir <i class="fa-solid fa-arrow-right"></i></a>
            </div>
            <div class="setting-row">
                <div><div class="setting-label">Cerrar sesión</div><div class="setting-sub">Salir del panel</div></div>
                <button onclick="logout()" style="background:var(--red-dim);color:var(--brand);border:2px solid var(--border);border-radius:8px;padding:6px 13px;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit;transition:all .2s;" onmouseover="this.style.background='var(--brand)';this.style.color='white'" onmouseout="this.style.background='var(--red-dim)';this.style.color='var(--brand)'">
                    <i class="fa-solid fa-right-from-bracket"></i> Salir
                </button>
            </div>
        </div>
    </div>`;
    const user = getCurrentUser();
    const si = document.getElementById('sesionInfo');
    if (si && user) si.textContent = user.correo;
}

window.aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('norkys_theme', tema);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = tema === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    document.querySelectorAll('.theme-btn').forEach(b => {
        b.classList.toggle('active', b.classList.contains(tema));
    });
};

window.toggleCompactSidebar = (on) => {
    localStorage.setItem('norkys_compact', on);
    showAdminToast(on ? 'Sidebar compacto activado' : 'Sidebar expandido', 'success');
};

window.guardarAjustes = () => {
    localStorage.setItem('norkys_shipping', document.getElementById('sEnvio')?.value || '5');
    localStorage.setItem('norkys_minorder', document.getElementById('sMinimo')?.value || '0');
    localStorage.setItem('norkys_open', document.getElementById('sTiendaAbierta')?.checked ? 'true' : 'false');
    showAdminToast('Ajustes guardados', 'success');
};

// ══════════════════════════════════════════════════════════════
// MODAL PRODUCTO
// ══════════════════════════════════════════════════════════════
function modalProductoHTML() {
    return `<div id="modalProducto" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center;backdrop-filter:blur(4px);">
        <div style="background:var(--surface);border-radius:16px;padding:28px;width:500px;max-width:92vw;max-height:90vh;overflow-y:auto;box-shadow:var(--shadow-lg);border:2px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2 style="font-family:Outfit,sans-serif;font-size:17px;font-weight:800;color:var(--text-1);" id="modalProdTitulo">Nuevo Producto</h2>
                <button onclick="cerrarModalProducto()" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-3);">×</button>
            </div>
            <input type="hidden" id="prodId">
            <div style="display:flex;flex-direction:column;gap:13px;">
                <div><label class="editor-label">NOMBRE *</label><input id="prodNombre" type="text" class="editor-input" placeholder="Ej. 1 Pollo a la Brasa"></div>
                <div><label class="editor-label">DESCRIPCIÓN</label><textarea id="prodDesc" rows="2" class="editor-textarea" placeholder="Descripción del producto…"></textarea></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div><label class="editor-label">PRECIO (S/) *</label><input id="prodPrecio" type="number" step="0.10" min="0.10" class="editor-input" placeholder="0.00"></div>
                    <div><label class="editor-label">CATEGORÍA *</label>
                        <select id="prodCategoria" class="editor-select">
                            <option value="pollos">🍗 Pollos a la Brasa</option>
                            <option value="parrillas">🔥 Parrillas</option>
                            <option value="combos">👥 Combos</option>
                            <option value="hamburguesas">🍔 Hamburguesas</option>
                            <option value="bebidas">🥤 Bebidas</option>
                            <option value="postres">🍰 Postres</option>
                            <option value="porciones">🍟 Porciones</option>
                        </select>
                    </div>
                </div>
                <div><label class="editor-label">URL DE IMAGEN</label><input id="prodImg" type="text" class="editor-input" placeholder="imgs/producto.webp"></div>
                <div style="display:flex;align-items:center;gap:9px;padding:11px;background:var(--surface-2);border-radius:9px;border:2px solid var(--border);">
                    <label class="toggle-switch"><input id="prodActivo" type="checkbox" checked><span class="toggle-slider"></span></label>
                    <label style="font-size:13px;font-weight:600;color:var(--text-1);cursor:pointer;">Producto activo (visible en el menú)</label>
                </div>
            </div>
            <div style="display:flex;gap:10px;margin-top:22px;justify-content:flex-end;">
                <button onclick="cerrarModalProducto()" style="padding:9px 18px;border:2px solid var(--border);border-radius:9px;background:var(--surface-2);cursor:pointer;font-weight:700;font-size:12.5px;color:var(--text-2);font-family:inherit;">Cancelar</button>
                <button onclick="guardarProducto()" class="btn-primary">Guardar Producto</button>
            </div>
        </div>
    </div>`;
}

window.abrirModalProducto = async (id = null) => {
    if (!document.getElementById('modalProducto')) await renderProductos();
    document.getElementById('modalProducto').style.display = 'flex';
    ['prodId', 'prodNombre', 'prodDesc', 'prodPrecio', 'prodImg'].forEach(i => document.getElementById(i).value = '');
    document.getElementById('prodActivo').checked = true;
    document.getElementById('modalProdTitulo').textContent = id ? 'Editar Producto' : 'Nuevo Producto';
    if (id) {
        const p = await fetch(`${API_URL}/productos/${id}`).then(r => r.json());
        document.getElementById('prodId').value = p.id;
        document.getElementById('prodNombre').value = p.nombre;
        document.getElementById('prodDesc').value = p.descripcion || '';
        document.getElementById('prodPrecio').value = p.precio;
        document.getElementById('prodCategoria').value = p.categoria;
        document.getElementById('prodImg').value = p.imgUrl || '';
        document.getElementById('prodActivo').checked = p.activo;
    }
};
window.cerrarModalProducto = () => { document.getElementById('modalProducto').style.display = 'none'; };

window.guardarProducto = async () => {
    const id = document.getElementById('prodId').value;
    const body = {
        nombre: document.getElementById('prodNombre').value.trim(),
        descripcion: document.getElementById('prodDesc').value.trim(),
        precio: parseFloat(document.getElementById('prodPrecio').value),
        categoria: document.getElementById('prodCategoria').value,
        imgUrl: document.getElementById('prodImg').value.trim(),
        activo: document.getElementById('prodActivo').checked,
    };
    if (!body.nombre || !body.precio || !body.categoria) return showAdminToast('Nombre, precio y categoría son obligatorios', 'error');
    const res = await fetch(id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`, {
        method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (res.ok) {
        cerrarModalProducto(); _productos = []; renderProductos();
        showAdminToast(id ? 'Producto actualizado' : 'Producto creado', 'success');
    } else showAdminToast('Error al guardar el producto', 'error');
};

window.eliminarProducto = async (id, nombre) => {
    if (!confirm(`¿Desactivar "${nombre}"?`)) return;
    const res = await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
    if (res.ok) { _productos = []; renderProductos(); showAdminToast('Producto desactivado', 'success'); }
    else showAdminToast('Error al eliminar', 'error');
};

// CSV
window.exportCSV = async () => {
    const pedidos = _pedidos.length ? _pedidos : await fetch(`${API_URL}/pedidos`).then(r => r.json()).catch(() => []);
    const rows = [['Código', 'Cliente', 'Correo', 'Fecha', 'Total', 'Estado', 'Dirección']];
    pedidos.forEach(p => rows.push([
        p.codigo || p.id,
        p.usuario ? `${p.usuario.nombres} ${p.usuario.apellidos}` : '—',
        p.usuario?.correo || '—',
        formatFecha(p.fechaCreacion),
        p.total?.toFixed(2),
        p.estado,
        `"${p.direccionEntrega || ''}"`
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pedidos_norkys_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
};

// TOAST
function showAdminToast(msg, type = 'success') {
    const color = type === 'success' ? 'var(--green)' : 'var(--brand)';
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:24px;right:24px;background:var(--surface);padding:13px 18px;border-radius:12px;box-shadow:var(--shadow-lg);border-left:4px solid ${color};font-weight:700;font-size:13px;z-index:9999;display:flex;align-items:center;gap:10px;color:var(--text-1);font-family:'Plus Jakarta Sans',sans-serif;animation:slideUp .25s ease;`;
    t.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}" style="color:${color};font-size:16px;"></i>${msg}`;
    if (!document.getElementById('toastAnim')) {
        const s = document.createElement('style'); s.id = 'toastAnim';
        s.textContent = '@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}';
        document.head.appendChild(s);
    }
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (!user || user.rol !== 'admin') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = 'login.html';
        return;
    }

    const el = (id) => document.getElementById(id);
    const initials = (user.nombres[0] + (user.apellidos?.[0] || '')).toUpperCase();
    if (el('adminNombre')) el('adminNombre').textContent = `${user.nombres} ${user.apellidos}`;
    if (el('adminCorreo')) el('adminCorreo').textContent = user.correo;
    if (el('adminAvatar')) el('adminAvatar').textContent = initials;
    if (el('headerAvatar')) el('headerAvatar').textContent = initials;

    const hora = new Date().getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
    if (el('greetingTitle')) el('greetingTitle').textContent = `${saludo}, ${user.nombres.split(' ')[0]} 👋`;
    if (el('greetingDate')) el('greetingDate').textContent =
        new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const savedTheme = localStorage.getItem('norkys_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = el('themeIcon');
    if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

    $$('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sec = item.dataset.section;
            if (sec && SECCIONES[sec]) setActiveSection(sec);
        });
    });

    // Sidebar toggle móvil
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    renderDashboard();
});