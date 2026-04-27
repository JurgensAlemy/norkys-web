document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.querySelector('.cart-items-section');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const btnCheckout = document.querySelector('.btn-checkout');

    // === LÓGICA DE DIRECCIONES EN EL CARRITO ===
    const user = getCurrentUser(); // Viene de db.js
    const addressContainer = document.getElementById('current-delivery-address');
    const btnChangeAddress = document.getElementById('btnChangeAddress');
    const addressModal = document.getElementById('addressSelectionModal');
    const addressesList = document.getElementById('user-addresses-list');
    
    let selectedAddress = null;

    const renderActiveAddress = () => {
        if (!user) {
            addressContainer.innerHTML = `<strong>Invitado</strong><p>Inicia sesión para usar tus direcciones.</p>`;
            btnChangeAddress.style.display = 'none';
            return;
        }

        // Leer los datos más frescos del localStorage
        const usersDB = JSON.parse(localStorage.getItem('norkys_users')) || [];
        const freshUser = usersDB.find(u => u.correo === user.correo) || user;

        if (!freshUser.direcciones || freshUser.direcciones.length === 0) {
            addressContainer.innerHTML = `<strong>Sin direcciones</strong><p style="color:var(--norkys-red); font-weight:bold; cursor:pointer;" onclick="window.location.href='profile.html'">Haz clic aquí para agregar una</p>`;
            btnChangeAddress.style.display = 'none';
            return;
        }

        // Si no hay una seleccionada, agarra la primera
        if (!selectedAddress) selectedAddress = freshUser.direcciones[0];

        addressContainer.innerHTML = `
            <strong>${selectedAddress.alias} <span style="background:var(--norkys-red); color:white; font-size:9px; padding:2px 6px; border-radius:10px; margin-left:5px;">ACTUAL</span></strong>
            <p style="font-size:12px; color:#666; margin-top:2px;">${selectedAddress.detalle}</p>
        `;
        btnChangeAddress.style.display = 'block';
    };

    // Al darle click en Cambiar
    if (btnChangeAddress) {
        btnChangeAddress.addEventListener('click', () => {
            const usersDB = JSON.parse(localStorage.getItem('norkys_users')) || [];
            const freshUser = usersDB.find(u => u.correo === user.correo);

            addressesList.innerHTML = '';
            freshUser.direcciones.forEach(dir => {
                const item = document.createElement('div');
                item.style.padding = '15px';
                item.style.border = '1px solid var(--border-color)';
                item.style.borderRadius = '10px';
                item.style.cursor = 'pointer';
                item.style.transition = 'all 0.2s';
                item.onmouseover = () => item.style.borderColor = 'var(--norkys-red)';
                item.onmouseout = () => item.style.borderColor = 'var(--border-color)';
                
                item.innerHTML = `<strong style="display:block; margin-bottom:4px;"><i class="fa-solid fa-location-dot" style="color:var(--text-muted); margin-right:5px;"></i> ${dir.alias}</strong><p style="font-size:12px; color:var(--text-muted);">${dir.detalle}</p>`;
                
                item.addEventListener('click', () => {
                    selectedAddress = dir;
                    renderActiveAddress();
                    addressModal.classList.remove('active');
                    if(typeof showNorkysToast === 'function') showNorkysToast("Dirección de entrega actualizada", "success");
                });
                addressesList.appendChild(item);
            });
            addressModal.classList.add('active');
        });
    }

    // Cerrar modal de direcciones
    const closeAddressSelModal = document.getElementById('closeAddressSelModal');
    if (closeAddressSelModal) {
        closeAddressSelModal.addEventListener('click', () => {
            addressModal.classList.remove('active');
        });
    }

    renderActiveAddress(); // Pintar la dirección apenas carga

    // === LÓGICA DE PINTAR PRODUCTOS DEL CARRITO ===
    const renderCart = () => {
        if(!cartContainer) return;
        const cart = JSON.parse(localStorage.getItem('norkys_cart')) || [];
        cartContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div style="text-align:center; padding: 50px 20px; background: white; border-radius: 16px; border: 1px dashed #ccc;">
                    <i class="fa-solid fa-basket-shopping" style="font-size: 50px; color: #ccc; margin-bottom: 15px;"></i>
                    <h3 style="color: var(--text-main); margin-bottom: 10px;">Tu pedido está vacío</h3>
                    <p style="color: var(--text-muted); font-size: 14px;">Anímate y pide algo delicioso de nuestra carta.</p>
                </div>`;
            subtotalEl.textContent = 'S/ 0.00';
            totalEl.textContent = 'S/ 0.00';
            document.getElementById('summary-shipping').textContent = 'S/ 0.00';
            return;
        }

        document.getElementById('summary-shipping').textContent = 'S/ 5.00'; // Costo fijo de envío

        cart.forEach((item, index) => {
            subtotal += item.precio * item.cantidad;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="item-image"><img src="${item.img}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" onerror="this.style.display='none'"></div>
                <div class="item-details">
                    <h3>${item.nombre}</h3>
                    <button class="btn-remove" onclick="removeItem(${index})"><i class="fa-regular fa-trash-can"></i> Eliminar</button>
                </div>
                <div class="item-actions">
                    <div class="item-price">S/ ${(item.precio * item.cantidad).toFixed(2)}</div>
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="qty-input" value="${item.cantidad}" readonly />
                        <button class="qty-btn" onclick="updateQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            `;
            cartContainer.appendChild(div);
        });

        subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
        totalEl.textContent = `S/ ${(subtotal + 5).toFixed(2)}`; // +5 de envío
    };

    window.removeItem = (index) => {
        const cart = JSON.parse(localStorage.getItem('norkys_cart'));
        cart.splice(index, 1);
        localStorage.setItem('norkys_cart', JSON.stringify(cart));
        renderCart();
        updateHeaderAndCart();
        if(typeof showNorkysToast === 'function') showNorkysToast("Producto eliminado", "success");
    };

    window.updateQty = (index, delta) => {
        const cart = JSON.parse(localStorage.getItem('norkys_cart'));
        if (cart[index].cantidad + delta > 0) {
            cart[index].cantidad += delta;
            localStorage.setItem('norkys_cart', JSON.stringify(cart));
            renderCart();
            updateHeaderAndCart();
        }
    };

    // Finalizar pedido
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            const userCheck = getCurrentUser();
            const cartCheck = JSON.parse(localStorage.getItem('norkys_cart'));
            
            if (!userCheck) {
                if(typeof showNorkysToast === 'function') showNorkysToast("Debes iniciar sesión para pedir", "error");
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }
            if (cartCheck.length === 0) {
                if(typeof showNorkysToast === 'function') showNorkysToast('El carrito está vacío', "error");
                return;
            }
            if (!selectedAddress) {
                if(typeof showNorkysToast === 'function') showNorkysToast('Por favor agrega una dirección en tu perfil', "error");
                return;
            }

            const orders = JSON.parse(localStorage.getItem('norkys_orders')) || [];
            const total = cartCheck.reduce((s, i) => s + (i.precio * i.cantidad), 0) + 5;
            
            // Crear pedido en la base de datos local
            orders.push({
                id: 'NK-' + Math.floor(Math.random() * 10000),
                cliente: `${userCheck.nombres} ${userCheck.apellidos}`,
                fecha: new Date().toLocaleString(),
                total: total,
                direccion: selectedAddress.detalle, // Guarda a dónde se enviará
                estado: 'Pendiente',
                items: cartCheck
            });

            localStorage.setItem('norkys_orders', JSON.stringify(orders));
            localStorage.setItem('norkys_cart', JSON.stringify([])); 
            
            if(typeof showNorkysToast === 'function') showNorkysToast('¡Pedido procesado y enviado a la tienda!', "success");
            setTimeout(() => window.location.href = 'profile.html', 1500);
        });
    }

    renderCart();
});