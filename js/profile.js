document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (!user) return window.location.href = 'login.html';

    // 1. Rellenar Datos Personales
    const inputs = {
        nombres: document.getElementById('profNombres'),
        apellidos: document.getElementById('profApellidos'),
        correo: document.getElementById('profCorreo'),
        celular: document.getElementById('profCelular')
    };

    inputs.nombres.value = user.nombres;
    inputs.apellidos.value = user.apellidos || "";
    inputs.correo.value = user.correo;
    inputs.celular.value = user.celular || "";
    
    document.querySelector('.user-summary h3').textContent = user.nombres;

    // 2. Lógica Editar Perfil
    const btnEdit = document.querySelector('.btn-edit');
    let isEditing = false;

    btnEdit.addEventListener('click', () => {
        isEditing = !isEditing;
        Object.values(inputs).forEach(input => {
            if(input.id !== 'profCorreo') { // El correo no se cambia
                input.readOnly = !isEditing;
                if(isEditing) input.style.border = "1px solid var(--norkys-red)";
                else input.style.border = "";
            }
        });

        if (isEditing) {
            btnEdit.innerHTML = '<i class="fa-solid fa-save"></i> Guardar Cambios';
            btnEdit.style.backgroundColor = 'var(--norkys-yellow)';
            btnEdit.style.color = '#000';
        } else {
            const users = JSON.parse(localStorage.getItem('norkys_users'));
            const userIndex = users.findIndex(u => u.correo === user.correo);
            
            users[userIndex].nombres = inputs.nombres.value;
            users[userIndex].apellidos = inputs.apellidos.value;
            users[userIndex].celular = inputs.celular.value;
            
            localStorage.setItem('norkys_users', JSON.stringify(users));
            localStorage.setItem('norkys_currentUser', JSON.stringify(users[userIndex]));
            
            btnEdit.innerHTML = '<i class="fa-solid fa-pen"></i> Editar Datos';
            btnEdit.style.backgroundColor = 'var(--norkys-green-bright)';
            btnEdit.style.color = '#fff';
            
            if (typeof showNorkysToast === 'function') showNorkysToast("Datos actualizados correctamente", "success");
            updateHeaderAndCart(); 
        }
    });

    // 3. Renderizar Último Pedido y Direcciones
    const renderData = () => {
        // Pedidos
        const orders = JSON.parse(localStorage.getItem('norkys_orders')) || [];
        const userOrders = orders.filter(o => o.cliente === `${user.nombres} ${user.apellidos}`);
        const orderInfo = document.querySelector('.order-info');
        
        if (userOrders.length > 0) {
            const lastOrder = userOrders[userOrders.length - 1];
            orderInfo.innerHTML = `
                <strong>Pedido ${lastOrder.id}</strong>
                <p>${lastOrder.fecha} • S/ ${lastOrder.total.toFixed(2)}</p>
                <p style="font-size:12px; margin-top:5px; color:var(--norkys-red); font-weight:bold;">Estado: ${lastOrder.estado}</p>
            `;
        } else {
            orderInfo.innerHTML = `<p>Aún no tienes pedidos.</p>`;
            document.querySelector('.btn-reorder').style.display = 'none';
        }

        // Direcciones
        const updatedUser = getCurrentUser(); 
        const addressList = document.querySelector('.address-list');
        addressList.innerHTML = '';

        if (updatedUser.direcciones && updatedUser.direcciones.length > 0) {
            updatedUser.direcciones.forEach((dir, index) => {
                const box = document.createElement('div');
                box.className = `address-box ${index === 0 ? 'active-address' : ''}`;
                box.innerHTML = `
                    <div class="address-icon"><i class="fa-solid ${index===0 ? 'fa-house' : 'fa-building'}"></i></div>
                    <div class="address-text">
                        <strong>${dir.alias} ${index === 0 ? '<span class="tag-principal">Principal</span>' : ''}</strong>
                        <p>${dir.detalle}</p>
                    </div>
                    <div class="address-actions">
                        <button class="delete" onclick="deleteAddress(${index})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                `;
                addressList.appendChild(box);
            });
        } else {
            addressList.innerHTML = '<p style="color:#666; font-size:14px; padding:20px;">No tienes direcciones guardadas.</p>';
        }
    };

    // 4. Funciones globales de Dirección
    window.deleteAddress = (index) => {
        const users = JSON.parse(localStorage.getItem('norkys_users'));
        const activeUser = getCurrentUser();
        const userIndex = users.findIndex(u => u.correo === activeUser.correo);
        
        users[userIndex].direcciones.splice(index, 1);
        
        localStorage.setItem('norkys_users', JSON.stringify(users));
        localStorage.setItem('norkys_currentUser', JSON.stringify(users[userIndex]));
        renderData();
        if (typeof showNorkysToast === 'function') showNorkysToast("Dirección eliminada", "success");
    };

    // Lógica del Nuevo Modal de Dirección
    const addressModal = document.getElementById('addressModal');
    const btnOpenAddressModal = document.getElementById('btnOpenAddressModal');
    const closeAddressModal = document.getElementById('closeAddressModal');
    const btnSaveAddress = document.getElementById('btnSaveAddress');

    // Abrir modal
    btnOpenAddressModal.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('newAddressAlias').value = '';
        document.getElementById('newAddressDetail').value = '';
        addressModal.classList.add('active');
    });

    // Cerrar modal
    closeAddressModal.addEventListener('click', () => {
        addressModal.classList.remove('active');
    });

    // Guardar desde el modal
    btnSaveAddress.addEventListener('click', () => {
        const alias = document.getElementById('newAddressAlias').value.trim();
        const detalle = document.getElementById('newAddressDetail').value.trim();

        if(!alias || !detalle) {
            if (typeof showNorkysToast === 'function') showNorkysToast("Completa todos los campos", "error");
            return;
        }

        const users = JSON.parse(localStorage.getItem('norkys_users'));
        const activeUser = getCurrentUser();
        const userIndex = users.findIndex(u => u.correo === activeUser.correo);
        
        if(!users[userIndex].direcciones) users[userIndex].direcciones = [];
        users[userIndex].direcciones.push({ id: Date.now(), alias, detalle });
        
        localStorage.setItem('norkys_users', JSON.stringify(users));
        localStorage.setItem('norkys_currentUser', JSON.stringify(users[userIndex]));
        
        renderData();
        addressModal.classList.remove('active');
        if (typeof showNorkysToast === 'function') showNorkysToast("Dirección agregada", "success");
    });

    renderData();

    // 5. Logout
    document.querySelector('.logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        logNorkysOut();
    });
});
