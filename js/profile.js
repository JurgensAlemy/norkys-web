// ================= profile.js — Perfil de Usuario Norky's =================

document.addEventListener('DOMContentLoaded', async () => {

    // ── VALIDAR SESIÓN ─────────────────────────────────────────
    const user = getCurrentUser();
    if (!user) return window.location.href = 'login.html';

    // ── RELLENAR DATOS PERSONALES ──────────────────────────────
    const inputs = {
        nombres: document.getElementById('profNombres'),
        apellidos: document.getElementById('profApellidos'),
        correo: document.getElementById('profCorreo'),
        celular: document.getElementById('profCelular')
    };

    const cargarDatosUsuario = async () => {
        // Siempre leer datos frescos del backend
        const res = await fetch(`${API_URL}/usuarios/${user.id}`);
        if (!res.ok) return;
        const datos = await res.json();

        inputs.nombres.value = datos.nombres || '';
        inputs.apellidos.value = datos.apellidos || '';
        inputs.correo.value = datos.correo || '';
        inputs.celular.value = datos.celular || '';

        document.querySelector('.user-summary h3').textContent = datos.nombres;

        // Actualizar sesión local
        const sesion = getCurrentUser();
        localStorage.setItem('norkys_currentUser', JSON.stringify({ ...sesion, ...datos }));

        return datos;
    };

    let datosActuales = await cargarDatosUsuario();

    // ── EDITAR PERFIL ──────────────────────────────────────────
    const btnEdit = document.querySelector('.btn-edit');
    let isEditing = false;

    btnEdit.addEventListener('click', async () => {
        isEditing = !isEditing;

        Object.values(inputs).forEach(input => {
            if (input.id !== 'profCorreo') {
                input.readOnly = !isEditing;
                input.style.border = isEditing ? '1px solid var(--norkys-red)' : '';
            }
        });

        if (isEditing) {
            btnEdit.innerHTML = '<i class="fa-solid fa-save"></i> Guardar Cambios';
            btnEdit.style.backgroundColor = 'var(--norkys-yellow)';
            btnEdit.style.color = '#000';
        } else {
            btnEdit.disabled = true;
            btnEdit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

            try {
                const res = await fetch(`${API_URL}/usuarios/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombres: inputs.nombres.value.trim(),
                        apellidos: inputs.apellidos.value.trim(),
                        celular: inputs.celular.value.trim(),
                    })
                });

                if (!res.ok) throw new Error('Error al guardar');

                const actualizado = await res.json();
                const sesion = getCurrentUser();
                localStorage.setItem('norkys_currentUser', JSON.stringify({ ...sesion, ...actualizado }));
                document.querySelector('.user-summary h3').textContent = actualizado.nombres;

                if (typeof showNorkysToast === 'function') showNorkysToast('Datos actualizados', 'success');
                if (typeof updateHeaderAndCart === 'function') updateHeaderAndCart();

            } catch (err) {
                console.error('[profile.js] guardar perfil:', err);
                if (typeof showNorkysToast === 'function') showNorkysToast('Error al guardar cambios', 'error');
            }

            btnEdit.disabled = false;
            btnEdit.innerHTML = '<i class="fa-solid fa-pen"></i> Editar Datos';
            btnEdit.style.backgroundColor = 'var(--norkys-green-bright)';
            btnEdit.style.color = '#fff';
        }
    });

    // ── PEDIDOS DESDE LA API ───────────────────────────────────
    async function renderPedidos() {
        const orderInfo = document.querySelector('.order-info');
        const btnReorder = document.querySelector('.btn-reorder');

        orderInfo.innerHTML = `<p style="color:#aaa;font-size:13px;">Cargando pedidos...</p>`;

        try {
            const pedidos = await getPedidosUsuario();

            if (!pedidos || pedidos.length === 0) {
                orderInfo.innerHTML = `<p style="color:#aaa;font-size:14px;">Aún no tienes pedidos.</p>`;
                if (btnReorder) btnReorder.style.display = 'none';
                return;
            }

            if (btnReorder) btnReorder.style.display = 'block';

            const last = pedidos[0];

            const estadoColor = {
                'Pendiente': '#f59e0b',
                'En Cocina': '#3b82f6',
                'En Camino': '#8b5cf6',
                'Entregado': '#16a34a',
                'Completado': '#16a34a',
                'Cancelado': '#ef4444',
            }[last.estado] || '#aaa';

            const fecha = last.fechaCreacion
                ? new Date(last.fechaCreacion).toLocaleString('es-PE', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                })
                : '';

            orderInfo.innerHTML = `
                <strong style="font-size:15px;">${last.codigo || '#' + last.id}</strong>
                <p style="color:#666;font-size:13px;margin-top:4px;">${fecha} · S/ ${(last.total || 0).toFixed(2)}</p>
                <p style="margin-top:8px;">
                    <span style="background:${estadoColor}20;color:${estadoColor};font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">
                        ${last.estado}
                    </span>
                </p>
                ${last.direccionEntrega
                    ? `<p style="font-size:12px;color:#888;margin-top:6px;"><i class="fa-solid fa-location-dot"></i> ${last.direccionEntrega}</p>`
                    : ''}`;

            const historialContainer = document.getElementById('historial-pedidos');
            if (historialContainer && pedidos.length > 1) {
                historialContainer.innerHTML = pedidos.map(p => {
                    const fc = p.fechaCreacion
                        ? new Date(p.fechaCreacion).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '';
                    const color = {
                        'Pendiente': '#f59e0b', 'En Cocina': '#3b82f6', 'En Camino': '#8b5cf6',
                        'Entregado': '#16a34a', 'Completado': '#16a34a', 'Cancelado': '#ef4444'
                    }[p.estado] || '#aaa';
                    return `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-color);">
                            <div>
                                <strong style="font-size:13px;">${p.codigo || '#' + p.id}</strong>
                                <p style="font-size:12px;color:#888;margin-top:2px;">${fc} · S/ ${(p.total || 0).toFixed(2)}</p>
                            </div>
                            <span style="background:${color}20;color:${color};font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;">${p.estado}</span>
                        </div>`;
                }).join('');
            }

        } catch (err) {
            console.error('[profile.js] renderPedidos:', err);
            orderInfo.innerHTML = `<p style="color:#f87171;font-size:13px;">Error al cargar pedidos.</p>`;
        }
    }

    // ── DIRECCIONES DESDE LA API ───────────────────────────────
    // El backend guarda direcciones como "alias|detalle"
    const parseDireccion = (str) => {
        const [alias, ...resto] = (str || '').split('|');
        return { alias: alias || '', detalle: resto.join('|') || '' };
    };

    async function renderDirecciones() {
        const addressList = document.querySelector('.address-list');
        if (!addressList) return;

        addressList.innerHTML = `<p style="color:#aaa;font-size:13px;">Cargando...</p>`;

        try {
            const res = await fetch(`${API_URL}/usuarios/${user.id}`);
            const datos = await res.json();
            const dirs = datos.direcciones || [];

            addressList.innerHTML = '';

            if (dirs.length === 0) {
                addressList.innerHTML = `<p style="color:#aaa;font-size:14px;padding:16px 0;">No tienes direcciones guardadas.</p>`;
                return;
            }

            dirs.forEach((dirStr, index) => {
                const { alias, detalle } = parseDireccion(dirStr);
                const box = document.createElement('div');
                box.className = `address-box ${index === 0 ? 'active-address' : ''}`;
                box.innerHTML = `
                    <div class="address-icon">
                        <i class="fa-solid ${index === 0 ? 'fa-house' : 'fa-building'}"></i>
                    </div>
                    <div class="address-text">
                        <strong>${alias}${index === 0 ? ' <span class="tag-principal">Principal</span>' : ''}</strong>
                        <p>${detalle}</p>
                    </div>
                    <div class="address-actions">
                        <button class="delete" onclick="deleteAddress(${index})">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>`;
                addressList.appendChild(box);
            });

        } catch (err) {
            console.error('[profile.js] renderDirecciones:', err);
            addressList.innerHTML = `<p style="color:#f87171;font-size:13px;">Error al cargar direcciones.</p>`;
        }
    }

    // ── ELIMINAR DIRECCIÓN ─────────────────────────────────────
    window.deleteAddress = async (index) => {
        try {
            const res = await fetch(`${API_URL}/usuarios/${user.id}/direcciones/${index}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error();
            await renderDirecciones();
            if (typeof showNorkysToast === 'function') showNorkysToast('Dirección eliminada', 'success');
        } catch {
            if (typeof showNorkysToast === 'function') showNorkysToast('Error al eliminar dirección', 'error');
        }
    };

    // ── MODAL NUEVA DIRECCIÓN ──────────────────────────────────
    const addressModal = document.getElementById('addressModal');
    const btnOpenModal = document.getElementById('btnOpenAddressModal');
    const closeAddressModal = document.getElementById('closeAddressModal');
    const btnSaveAddress = document.getElementById('btnSaveAddress');

    btnOpenModal?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('newAddressAlias').value = '';
        document.getElementById('newAddressDetail').value = '';
        addressModal.classList.add('active');
    });

    closeAddressModal?.addEventListener('click', () => addressModal.classList.remove('active'));

    btnSaveAddress?.addEventListener('click', async () => {
        const alias = document.getElementById('newAddressAlias').value.trim();
        const detalle = document.getElementById('newAddressDetail').value.trim();

        if (!alias || !detalle) {
            if (typeof showNorkysToast === 'function') showNorkysToast('Completa todos los campos', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/usuarios/${user.id}/direcciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alias, detalle })
            });
            if (!res.ok) throw new Error();
            await renderDirecciones();
            addressModal.classList.remove('active');
            if (typeof showNorkysToast === 'function') showNorkysToast('Dirección agregada', 'success');
        } catch {
            if (typeof showNorkysToast === 'function') showNorkysToast('Error al agregar dirección', 'error');
        }
    });

    // ── CERRAR SESIÓN ──────────────────────────────────────────
    document.querySelector('.logout-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        logNorkysOut();
    });

    // ── INIT ───────────────────────────────────────────────────
    await renderPedidos();
    await renderDirecciones();
});