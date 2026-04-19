document.addEventListener("DOMContentLoaded", () => {
  cargarDatosPerfil();
});

function cargarDatosPerfil() {
  // Datos base
  let usuario = localStorage.getItem("usuarioNorkys") || "Usuario Invitado";
  let correo = localStorage.getItem("correoNorkys") || "correo@ejemplo.com";
  let distrito = localStorage.getItem("distritoNorkys") || "Lurigancho-Chosica";
  let direccion = localStorage.getItem("direccionNorkys") || "No especificada";

  // Mostrar en UI
  document.getElementById("nombre-display").innerText = usuario;
  document.getElementById("txt-correo").innerText = correo;
  document.getElementById("txt-distrito").innerText = distrito;
  document.getElementById("txt-direccion").innerText = direccion;

  // Llenar inputs ocultos por si editan
  document.getElementById("input-nombre").value = usuario;
  document.getElementById("input-correo").value = correo;
  document.getElementById("input-distrito").value = distrito;
  document.getElementById("input-direccion").value = direccion;
}

function toggleEdit() {
  const displayPanel = document.getElementById("panel-display");
  const editPanel = document.getElementById("panel-edit");
  const btnEdit = document.getElementById("btn-edit-toggle");

  if (displayPanel.classList.contains("hidden")) {
    // Cancelar / Cerrar edición
    displayPanel.classList.remove("hidden");
    editPanel.classList.add("hidden");
    btnEdit.innerText = "✏️ Editar Perfil";
    cargarDatosPerfil(); // Restaurar valores originales
  } else {
    // Abrir edición
    displayPanel.classList.add("hidden");
    editPanel.classList.remove("hidden");
    btnEdit.innerText = "❌ Cancelar Edición";
  }
}

function guardarPerfil() {
  let nuevoNombre = document.getElementById("input-nombre").value.trim();
  let nuevoCorreo = document.getElementById("input-correo").value.trim();
  let nuevoDistrito = document.getElementById("input-distrito").value.trim();
  let nuevaDireccion = document.getElementById("input-direccion").value.trim();

  if(!nuevoNombre || !nuevoCorreo) {
    alert("El nombre y correo son obligatorios.");
    return;
  }

  localStorage.setItem("usuarioNorkys", nuevoNombre);
  localStorage.setItem("correoNorkys", nuevoCorreo);
  localStorage.setItem("distritoNorkys", nuevoDistrito);
  localStorage.setItem("direccionNorkys", nuevaDireccion);

  toggleEdit(); // Cierra el form
  cargarDatosPerfil(); // Actualiza los textos
  
  // Pequeña notificación nativa (puedes usar el Toast aquí si lo linkeas)
  alert("¡Perfil actualizado con éxito!");
}

function logout() {
  localStorage.removeItem("usuarioNorkys");
  window.location.href = "login.html";
}

function verSeccion(seccion) {
  document.getElementById("panel-display").classList.add("hidden");
  document.getElementById("panel-edit").classList.add("hidden");
  document.getElementById("seccion-pedidos").classList.add("hidden");

  if(seccion === 'datos') document.getElementById("panel-display").classList.remove("hidden");
  if(seccion === 'pedidos') {
    document.getElementById("seccion-pedidos").classList.remove("hidden");
    cargarHistorialPedidos();
  }
}

function cargarHistorialPedidos() {
  const listaCont = document.getElementById("lista-pedidos");
  const correoUsuario = localStorage.getItem("correoNorkys");
  const historial = JSON.parse(localStorage.getItem("norkys_historial_pedidos")) || [];

  // Filtrar pedidos por el correo del usuario logueado
  const misPedidos = historial.filter(p => p.correo === correoUsuario).reverse();

  if(misPedidos.length === 0) {
    listaCont.innerHTML = `<p style="color:#999; text-align:center; padding:20px;">Aún no has realizado pedidos.</p>`;
    return;
  }

  listaCont.innerHTML = "";
  misPedidos.forEach(p => {
    listaCont.innerHTML += `
      <div style="background:#f9f9f9; border:1px solid #eee; border-radius:10px; padding:15px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div style="text-align:left;">
          <strong style="color:var(--primary);">${p.id}</strong><br>
          <small>${p.fecha}</small><br>
          <span style="font-weight:bold;">Total: S/ ${p.total.toFixed(2)}</span>
        </div>
        <button class="btn" style="padding:5px 10px; font-size:12px;" onclick='verComprobante(${JSON.stringify(p)})'>Ver Recibo</button>
      </div>
    `;
  });
}

function verComprobante(p) {
  document.getElementById("comp-titulo").innerText = p.tipoComprobante === "Boleta" ? "BOLETA DE VENTA ELECTRÓNICA" : "FACTURA ELECTRÓNICA";
  document.getElementById("comp-id").innerText = p.id;
  document.getElementById("comp-fecha").innerText = p.fecha;
  document.getElementById("comp-cliente").innerText = p.cliente.toUpperCase();
  document.getElementById("comp-doc").innerText = p.documento;
  document.getElementById("comp-direc").innerText = p.direccion.toUpperCase();

  const body = document.getElementById("comp-items-body");
  body.innerHTML = "";
  p.items.forEach(item => {
    body.innerHTML += `
      <tr>
        <td>${item.nombre}</td>
        <td align="center">${item.cant}</td>
        <td align="right">${(item.precio * item.cant).toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById("comp-subtotal").innerText = p.subtotal.toFixed(2);
  document.getElementById("comp-delivery").innerText = p.delivery.toFixed(2);
  document.getElementById("comp-total").innerText = p.total.toFixed(2);

  const modal = document.getElementById("modal-comprobante");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("show"), 10);
}

function cerrarComprobante() {
  const modal = document.getElementById("modal-comprobante");
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300);
}