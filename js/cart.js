// Espera a que todo el contenido del HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // =====================================================
    // ELEMENTOS PRINCIPALES DEL CARRITO
    // =====================================================
    const cartContainer = document.querySelector('.cart-items-section');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const btnCheckout = document.querySelector('.btn-checkout');

    // =====================================================
    // LÓGICA DE DIRECCIONES DE ENTREGA
    // =====================================================

    // Obtiene el usuario actualmente logueado
    const user = getCurrentUser(); // Función externa (db.js)

    // Elementos del módulo de direcciones
    const addressContainer = document.getElementById('current-delivery-address');
    const btnChangeAddress = document.getElementById('btnChangeAddress');
    const addressModal = document.getElementById('addressSelectionModal');
    const addressesList = document.getElementById('user-addresses-list');

    // Guarda la dirección seleccionada actualmente
    let selectedAddress = null;

    // =====================================================
    // FUNCIÓN: MOSTRAR DIRECCIÓN ACTIVA
    // =====================================================
    const renderActiveAddress = () => {

        // Si no hay usuario logueado
        if (!user) {
            addressContainer.innerHTML = `
                <strong>Invitado</strong>
                <p>Inicia sesión para usar tus direcciones.</p>
            `;
            btnChangeAddress.style.display = 'none';
            return;
        }

        // Obtiene la versión más actualizada del usuario
        const usersDB = JSON.parse(localStorage.getItem('norkys_users')) || [];
        const freshUser = usersDB.find(u => u.correo === user.correo) || user;

        // Si el usuario no tiene direcciones registradas
        if (!freshUser.direcciones || freshUser.direcciones.length === 0) {
            addressContainer.innerHTML = `
                <strong>Sin direcciones</strong>
                <p style="color:var(--norkys-red); font-weight:bold; cursor:pointer;"
                   onclick="window.location.href='profile.html'">
                   Haz clic aquí para agregar una
                </p>
            `;
            btnChangeAddress.style.display = 'none';
            return;
        }

        // Si no hay dirección seleccionada, toma la primera
        if (!selectedAddress) selectedAddress = freshUser.direcciones[0];

        // Renderiza la dirección actual
        addressContainer.innerHTML = `
            <strong>
                ${selectedAddress.alias}
                <span style="background:var(--norkys-red); color:white; font-size:9px; padding:2px 6px; border-radius:10px; margin-left:5px;">
                    ACTUAL
                </span>
            </strong>
            <p style="font-size:12px; color:#666; margin-top:2px;">
                ${selectedAddress.detalle}
            </p>
        `;

        btnChangeAddress.style.display = 'block';
    };

    // =====================================================
    // EVENTO: CAMBIAR DIRECCIÓN
    // =====================================================
    if (btnChangeAddress) {

        btnChangeAddress.addEventListener('click', () => {

            const usersDB = JSON.parse(localStorage.getItem('norkys_users')) || [];
            const freshUser = usersDB.find(u => u.correo === user.correo);

            // Limpia la lista antes de renderizar
            addressesList.innerHTML = '';

            // Recorre todas las direcciones del usuario
            freshUser.direcciones.forEach(dir => {

                const item = document.createElement('div');

                // Estilos dinámicos
                item.style.padding = '15px';
                item.style.border = '1px solid var(--border-color)';
                item.style.borderRadius = '10px';
                item.style.cursor = 'pointer';
                item.style.transition = 'all 0.2s';

                // Efectos hover
                item.onmouseover = () => item.style.borderColor = 'var(--norkys-red)';
                item.onmouseout = () => item.style.borderColor = 'var(--border-color)';

                // Contenido
                item.innerHTML = `
                    <strong style="display:block; margin-bottom:4px;">
                        <i class="fa-solid fa-location-dot" style="color:var(--text-muted); margin-right:5px;"></i>
                        ${dir.alias}
                    </strong>
                    <p style="font-size:12px; color:var(--text-muted);">
                        ${dir.detalle}
                    </p>
                `;

                // Seleccionar dirección
                item.addEventListener('click', () => {
                    selectedAddress = dir;
                    renderActiveAddress();

                    // Cierra modal
                    addressModal.classList.remove('active');

                    // Notificación
                    if(typeof showNorkysToast === 'function') {
                        showNorkysToast("Dirección de entrega actualizada", "success");
                    }
                });

                addressesList.appendChild(item);
            });

            // Abre modal
            addressModal.classList.add('active');
        });
    }

    // =====================================================
    // CERRAR MODAL DE DIRECCIONES
    // =====================================================
    const closeAddressSelModal = document.getElementById('closeAddressSelModal');

    if (closeAddressSelModal) {
        closeAddressSelModal.addEventListener('click', () => {
            addressModal.classList.remove('active');
        });
    }

    // Renderiza dirección al cargar
    renderActiveAddress();

    // =====================================================
    // FUNCIÓN: RENDERIZAR CARRITO
    // =====================================================
    const renderCart = () => {

        if(!cartContainer) return;

        const cart = JSON.parse(localStorage.getItem('norkys_cart')) || [];

        cartContainer.innerHTML = '';
        let subtotal = 0;

        // Si el carrito está vacío
        if (cart.length === 0) {

            cartContainer.innerHTML = `
                <div style="text-align:center; padding:50px 20px; background:white; border-radius:16px; border:1px dashed #ccc;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:50px; color:#ccc; margin-bottom:15px;"></i>
                    <h3 style="color:var(--text-main); margin-bottom:10px;">Tu pedido está vacío</h3>
                    <p style="color:var(--text-muted); font-size:14px;">
                        Anímate y pide algo delicioso de nuestra carta.
                    </p>
                </div>
            `;

            subtotalEl.textContent = 'S/ 0.00';
            totalEl.textContent = 'S/ 0.00';
            document.getElementById('summary-shipping').textContent = 'S/ 0.00';

            return;
        }

        // Costo fijo de envío
        document.getElementById('summary-shipping').textContent = 'S/ 5.00';

        // Renderiza productos
        cart.forEach((item, index) => {

            subtotal += item.precio * item.cantidad;

            const div = document.createElement('div');
            div.className = 'cart-item';

            div.innerHTML = `
                <div class="item-image">
                    <img src="${item.img}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" onerror="this.style.display='none'">
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
                        <button class="qty-btn" onclick="updateQty(${index}, -1)">
                            <i class="fa-solid fa-minus"></i>
                        </button>

                        <input type="number" class="qty-input" value="${item.cantidad}" readonly />

                        <button class="qty-btn" onclick="updateQty(${index}, 1)">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;

            cartContainer.appendChild(div);
        });

        // Actualiza totales
        subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
        totalEl.textContent = `S/ ${(subtotal + 5).toFixed(2)}`;
    };

    // =====================================================
    // ELIMINAR PRODUCTO
    // =====================================================
    window.removeItem = (index) => {

        const cart = JSON.parse(localStorage.getItem('norkys_cart'));

        cart.splice(index, 1);

        localStorage.setItem('norkys_cart', JSON.stringify(cart));

        renderCart();
        updateHeaderAndCart();

        if(typeof showNorkysToast === 'function') {
            showNorkysToast("Producto eliminado", "success");
        }
    };

    // =====================================================
    // ACTUALIZAR CANTIDAD
    // =====================================================
    window.updateQty = (index, delta) => {

        const cart = JSON.parse(localStorage.getItem('norkys_cart'));

        if (cart[index].cantidad + delta > 0) {
            cart[index].cantidad += delta;

            localStorage.setItem('norkys_cart', JSON.stringify(cart));

            renderCart();
            updateHeaderAndCart();
        }
    };

    // =====================================================
    // FINALIZAR PEDIDO
    // =====================================================
    if (btnCheckout) {

        btnCheckout.addEventListener('click', () => {

            const userCheck = getCurrentUser();
            const cartCheck = JSON.parse(localStorage.getItem('norkys_cart'));

            // Validación: usuario logueado
            if (!userCheck) {
                if(typeof showNorkysToast === 'function') {
                    showNorkysToast("Debes iniciar sesión para pedir", "error");
                }

                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }

            // Validación: carrito vacío
            if (cartCheck.length === 0) {
                if(typeof showNorkysToast === 'function') {
                    showNorkysToast('El carrito está vacío', "error");
                }
                return;
            }

            // Validación: dirección
            if (!selectedAddress) {
                if(typeof showNorkysToast === 'function') {
                    showNorkysToast('Por favor agrega una dirección en tu perfil', "error");
                }
                return;
            }

            // Obtiene pedidos existentes
            const orders = JSON.parse(localStorage.getItem('norkys_orders')) || [];

            // Calcula total
            const total = cartCheck.reduce((s, i) => s + (i.precio * i.cantidad), 0) + 5;

            // Crea nuevo pedido
            orders.push({
                id: 'NK-' + Math.floor(Math.random() * 10000),
                cliente: `${userCheck.nombres} ${userCheck.apellidos}`,
                fecha: new Date().toLocaleString(),
                total: total,
                direccion: selectedAddress.detalle,
                estado: 'Pendiente',
                items: cartCheck
            });

            // Guarda pedido y limpia carrito
            localStorage.setItem('norkys_orders', JSON.stringify(orders));
            localStorage.setItem('norkys_cart', JSON.stringify([]));

            // Notifica éxito
            if(typeof showNorkysToast === 'function') {
                showNorkysToast('¡Pedido procesado y enviado a la tienda!', "success");
            }

            // Redirige al perfil
            setTimeout(() => window.location.href = 'profile.html', 1500);
        });
    }

    // Render inicial
    renderCart();
});
