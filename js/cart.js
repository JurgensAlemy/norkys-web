// ================= cart.js — Carrito Norky's =================
document.addEventListener('DOMContentLoaded', async () => {
    const cartContainer = document.querySelector('.cart-items-section');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const btnCheckout = document.querySelector('.btn-checkout');

    // ── DIRECCIÓN ──────────────────────────────────────────────
    const user = getCurrentUser();
    const addressContainer = document.getElementById('current-delivery-address');
    const btnChangeAddress = document.getElementById('btnChangeAddress');
    const addressModal = document.getElementById('addressSelectionModal');
    const addressesList = document.getElementById('user-addresses-list');
    let selectedAddress = null;

    // ===== NUEVO: estado de carga inicial =====
    addressContainer.innerHTML = `
        <div class="norkys-loading" style="padding:10px 0;flex-direction:row;gap:8px;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:14px;"></i>
            <span>Cargando dirección...</span>
        </div>`;

    // Parsear "alias|detalle" que guarda el backend
    const parseDireccion = (str) => {
        const [alias, ...resto] = (str || '').split('|');
        return { alias: alias || '', detalle: resto.join('|') || '' };
    };

    // Cargar direcciones del usuario desde la API
    const cargarDirecciones = async () => {
        if (!user) return [];
        try {
            const res = await fetchConManejo(`${API_URL}/usuarios/${user.id}`);
            const datos = await res.json();
            return (datos.direcciones || []).map(parseDireccion);
        } catch {
            return [];
        }
    };

    const renderActiveAddress = (dirs) => {
        if (!user) {
            addressContainer.innerHTML = '<strong>Invitado</strong><p>Inicia sesión para usar tus direcciones.</p>';
            btnChangeAddress.style.display = 'none';
            return;
        }

        if (!dirs || dirs.length === 0) {
            addressContainer.innerHTML = `
                <strong>Sin direcciones</strong>
                <p style="color:var(--norkys-red);font-weight:bold;cursor:pointer;"
                   onclick="window.location.href='profile.html'">
                   Haz clic aquí para agregar una
                </p>`;
            btnChangeAddress.style.display = 'none';
            return;
        }

        if (!selectedAddress) selectedAddress = dirs[0];

        addressContainer.innerHTML = `
            <strong>${selectedAddress.alias}
                <span style="background:var(--norkys-red);color:white;font-size:9px;padding:2px 6px;border-radius:10px;margin-left:5px;">ACTUAL</span>
            </strong>
            <p style="font-size:12px;color:#666;margin-top:2px;">${selectedAddress.detalle}</p>`;
        btnChangeAddress.style.display = 'block';
    };

    // Cargar y mostrar dirección al iniciar
    const dirs = await cargarDirecciones();
    renderActiveAddress(dirs);

    // Botón cambiar dirección
    if (btnChangeAddress) {
        btnChangeAddress.addEventListener('click', async () => {
            const dirsActuales = await cargarDirecciones();
            addressesList.innerHTML = '';

            if (dirsActuales.length === 0) {
                addressesList.innerHTML = '<p style="color:#aaa;text-align:center;">No tienes direcciones guardadas.</p>';
            } else {
                dirsActuales.forEach(dir => {
                    const item = document.createElement('div');
                    item.style.cssText = 'padding:15px;border:1px solid var(--border-color);border-radius:10px;cursor:pointer;transition:all .2s;';
                    item.onmouseover = () => item.style.borderColor = 'var(--norkys-red)';
                    item.onmouseout = () => item.style.borderColor = 'var(--border-color)';
                    item.innerHTML = `
                        <strong style="display:block;margin-bottom:4px;">
                            <i class="fa-solid fa-location-dot" style="color:var(--text-muted);margin-right:5px;"></i>${dir.alias}
                        </strong>
                        <p style="font-size:12px;color:var(--text-muted);">${dir.detalle}</p>`;
                    item.addEventListener('click', () => {
                        selectedAddress = dir;
                        renderActiveAddress(dirsActuales);
                        addressModal.classList.remove('active');
                        if (typeof showNorkysToast === 'function') showNorkysToast('Dirección actualizada', 'success');
                    });
                    addressesList.appendChild(item);
                });
            }

            addressModal.classList.add('active');
        });
    }

    document.getElementById('closeAddressSelModal')?.addEventListener('click', () => addressModal.classList.remove('active'));

    // ── RENDERIZAR CARRITO ─────────────────────────────────────
    const renderCart = () => {
        if (!cartContainer) return;
        const cart = getNorkysCart();
        cartContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div style="text-align:center;padding:50px 20px;background:white;border-radius:16px;border:1px dashed #ccc;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:50px;color:#ccc;margin-bottom:15px;"></i>
                    <h3 style="color:var(--text-main);margin-bottom:10px;">Tu pedido está vacío</h3>
                    <p style="color:var(--text-muted);font-size:14px;">Anímate y pide algo delicioso de nuestra carta.</p>
                </div>`;
            subtotalEl.textContent = 'S/ 0.00';
            totalEl.textContent = 'S/ 0.00';
            document.getElementById('summary-shipping').textContent = 'S/ 0.00';
            return;
        }

        document.getElementById('summary-shipping').textContent = 'S/ 5.00';

        cart.forEach((item, index) => {
            subtotal += item.precio * item.cantidad;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="item-image">
                    <img src="${item.img}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" onerror="this.style.display='none'">
                </div>
                <div class="item-details">
                    <h3>${item.nombre}</h3>
                    <button class="btn-remove" onclick="removeItem(${index})">
                        <i class="fa-regular fa-trash-can"></i> Eliminar
                    </button>
                </div>
                <div class="item-actions">
                    <div class="item-price">S/ ${(item.precio * item.cantidad).toFixed(2)}</div>
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateQty(${index},-1)"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="qty-input" value="${item.cantidad}" readonly/>
                        <button class="qty-btn" onclick="updateQty(${index},1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>`;
            cartContainer.appendChild(div);
        });

        subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
        totalEl.textContent = `S/ ${(subtotal + 5).toFixed(2)}`;
    };

    window.removeItem = (index) => {
        const cart = getNorkysCart();
        cart.splice(index, 1);
        localStorage.setItem('norkys_cart', JSON.stringify(cart));
        renderCart();
        if (typeof updateHeaderAndCart === 'function') updateHeaderAndCart();
        if (typeof showNorkysToast === 'function') showNorkysToast('Producto eliminado', 'success');
    };

    window.updateQty = (index, delta) => {
        const cart = getNorkysCart();
        if (cart[index].cantidad + delta > 0) {
            cart[index].cantidad += delta;
            localStorage.setItem('norkys_cart', JSON.stringify(cart));
            renderCart();
            if (typeof updateHeaderAndCart === 'function') updateHeaderAndCart();
        }
    };

    // ── IR AL CHECKOUT (antes creaba el pedido directo, ahora pasa por checkout.html) ──
    if (btnCheckout) {
        btnCheckout.addEventListener('click', async () => {
            if (!getCurrentUser()) {
                showNorkysToast('Debes iniciar sesión para pedir', 'error');
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }
            const cart = getNorkysCart();
            if (cart.length === 0) return showNorkysToast('El carrito está vacío', 'error');
            if (!selectedAddress) return showNorkysToast('Agrega una dirección en tu perfil', 'error');

            // ===== NUEVO: validar stock antes de pasar al checkout =====
            btnCheckout.disabled = true;
            const textoOriginal = btnCheckout.innerHTML;
            btnCheckout.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando stock...';

            try {
                const productosActuales = await getNorkysProducts();
                let hayProblema = false;
                let cartActualizado = [...cart];

                for (const item of cart) {
                    const prod = productosActuales.find(p => p.id === item.id);

                    if (!prod || !prod.activo) {
                        showNorkysToast(`"${item.nombre}" ya no está disponible y fue quitado del carrito`, 'error');
                        cartActualizado = cartActualizado.filter(i => i.id !== item.id);
                        hayProblema = true;
                        continue;
                    }

                    if ((prod.stock ?? 0) <= 0) {
                        showNorkysToast(`"${item.nombre}" está agotado y fue quitado del carrito`, 'error');
                        cartActualizado = cartActualizado.filter(i => i.id !== item.id);
                        hayProblema = true;
                        continue;
                    }

                    if (item.cantidad > prod.stock) {
                        showNorkysToast(`Solo quedan ${prod.stock} de "${item.nombre}", se ajustó la cantidad`, 'error');
                        const idx = cartActualizado.findIndex(i => i.id === item.id);
                        if (idx !== -1) cartActualizado[idx].cantidad = prod.stock;
                        hayProblema = true;
                    }
                }

                if (hayProblema) {
                    localStorage.setItem('norkys_cart', JSON.stringify(cartActualizado));
                    renderCart();
                    if (typeof updateHeaderAndCart === 'function') updateHeaderAndCart();
                    btnCheckout.disabled = false;
                    btnCheckout.innerHTML = textoOriginal;
                    return; // no avanza al checkout, deja que revise el carrito actualizado
                }

                // Todo OK: avanza al checkout
                sessionStorage.setItem('norkys_checkout_address', JSON.stringify(selectedAddress));
                window.location.href = 'checkout.html';

            } catch (err) {
                showNorkysToast('No se pudo verificar el stock, intenta de nuevo', 'error');
                btnCheckout.disabled = false;
                btnCheckout.innerHTML = textoOriginal;
            }
        });
    }

    renderCart();
});
