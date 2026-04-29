document.addEventListener('DOMContentLoaded', () => {

    // Obtener el usuario actualmente logueado
    const user = getCurrentUser();

    // Validar acceso: solo los administradores pueden entrar al dashboard
    if (!user || user.rol !== 'admin') {
        alert("Acceso denegado. Solo administradores.");
        window.location.href = 'login.html';
        return;
    }

    // Obtener todos los pedidos almacenados en localStorage
    const orders = JSON.parse(localStorage.getItem('norkys_orders')) || [];

    // Seleccionar el cuerpo de la tabla donde se mostrarán los pedidos
    const tbody = document.getElementById('ordersTableBody');
    
    // Si no existen pedidos registrados
    if (orders.length === 0) {

        // Mostrar mensaje informativo en la tabla
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay pedidos aún</td></tr>';

    } else {

        // Invertir el arreglo para mostrar primero los pedidos más recientes
        orders.reverse().forEach(order => {

            // Crear una nueva fila para cada pedido
            const tr = document.createElement('tr');

            // Insertar los datos del pedido en la tabla
            tr.innerHTML = `
                <!-- ID del pedido -->
                <td><strong style="color: var(--norkys-red);">${order.id}</strong></td>

                <!-- Cliente que realizó el pedido -->
                <td>
                    <div class="user-cell">
                        <i class="fa-solid fa-circle-user" style="font-size:24px; color:#ccc;"></i> 
                        ${order.cliente}
                    </div>
                </td>

                <!-- Fecha y hora del pedido -->
                <td>${order.fecha}</td>

                <!-- Total pagado -->
                <td><strong>S/ ${order.total.toFixed(2)}</strong></td>

                <!-- Estado del pedido -->
                <td>
                    <span class="status-pill ${order.estado === 'Completado' ? 'status-completed' : 'status-pending'}">
                        ${order.estado}
                    </span>
                </td>

                <!-- Botón de acción para marcar pedido como completado -->
                <td>
                    <button class="btn-action">
                        <i class="fa-solid fa-check" onclick="showToast('Pedido marcado como completado', 'success')"></i>
                    </button>
                </td>
            `;

            // Agregar la fila al cuerpo de la tabla
            tbody.appendChild(tr);
        });
    }
});
