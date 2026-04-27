document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (!user || user.rol !== 'admin') {
        alert("Acceso denegado. Solo administradores.");
        window.location.href = 'login.html';
        return;
    }

    const orders = JSON.parse(localStorage.getItem('norkys_orders')) || [];
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay pedidos aún</td></tr>';
    } else {
        orders.reverse().forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--norkys-red);">${order.id}</strong></td>
                <td><div class="user-cell"><i class="fa-solid fa-circle-user" style="font-size:24px; color:#ccc;"></i> ${order.cliente}</div></td>
                <td>${order.fecha}</td>
                <td><strong>S/ ${order.total.toFixed(2)}</strong></td>
                <td><span class="status-pill ${order.estado === 'Completado' ? 'status-completed' : 'status-pending'}">${order.estado}</span></td>
                <td><button class="btn-action"><i class="fa-solid fa-check" onclick="showToast('Pedido marcado como completado', 'success')"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    }
});