// EL DOBLE DE PRODUCTOS AÑADIDOS
const bdProductos = [
  // Pollos
  { id: 1, cat: "Pollos", nombre: "1/4 de Pollo Clásico", precio: 20.50, desc: "Pierna o pecho, papas crujientes y ensalada fresca.", img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092" },
  { id: 2, cat: "Pollos", nombre: "1/2 Pollo Jugoso", precio: 35.00, desc: "Ideal para compartir. Incluye porción grande de papas.", img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },
  { id: 3, cat: "Pollos", nombre: "Pollo Entero Norkys", precio: 68.00, desc: "Para toda la familia. Viene con papas familiares y cremas.", img: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4" },
  { id: 4, cat: "Pollos", nombre: "1/8 de Pollo Kids", precio: 14.00, desc: "Perfecto para los más pequeños. Papas y un jugo en cajita.", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d" },

  // Combos
  { id: 5, cat: "Combos", nombre: "Combo Universitario", precio: 25.00, desc: "1/4 de pollo + Papas + Gaseosa personal 500ml.", img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58" },
  { id: 6, cat: "Combos", nombre: "Combo Pareja", precio: 45.00, desc: "1/2 Pollo + Porción de Tequeños + 2 Gaseosas.", img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91" },
  { id: 7, cat: "Combos", nombre: "Mega Combo Parrillero", precio: 85.00, desc: "1 Pollo Entero + Chuleta + Chorizos + Papas XXL.", img: "https://images.unsplash.com/photo-1544025162-d76694265947" },

  // Parrillas
  { id: 8, cat: "Parrillas", nombre: "Bife Angosto", precio: 38.00, desc: "Corte fino a la parrilla con papas doradas y chimichurri.", img: "https://images.unsplash.com/photo-1558030006-450675393462" },
  { id: 9, cat: "Parrillas", nombre: "Anticuchos de Corazón", precio: 22.00, desc: "3 palitos clásicos con papa sancochada y choclo.", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" },

  // Snacks
  { id: 10, cat: "Snacks", nombre: "Porción de Tequeños", precio: 15.00, desc: "6 tequeños rellenos de queso con salsa de palta.", img: "https://images.unsplash.com/photo-1541529086526-db283c563270" },
  { id: 11, cat: "Snacks", nombre: "Salchipapa Clásica", precio: 18.00, desc: "Harta papa y hot dog frankfurt seleccionado.", img: "https://images.unsplash.com/photo-1633504581786-316c8002b1b9" },
  { id: 12, cat: "Snacks", nombre: "Alitas BBQ (6 und)", precio: 20.00, desc: "Alitas bañadas en salsa BBQ dulce y ahumada.", img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2" },
  { id: 13, cat: "Snacks", nombre: "Empanadas de Carne", precio: 12.00, desc: "2 empanadas fritas crujientes con limón.", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e" },

  // Bebidas
  { id: 14, cat: "Bebidas", nombre: "Inca Kola 1.5L", precio: 10.00, desc: "La bebida de sabor nacional bien heladita.", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97" },
  { id: 15, cat: "Bebidas", nombre: "Chicha Morada Jarra", precio: 12.00, desc: "Chicha casera con limón y manzanita picada.", img: "https://images.unsplash.com/photo-1556881286-fc6915169721" },
  { id: 16, cat: "Bebidas", nombre: "Limonada Frozen Jarra", precio: 14.00, desc: "Refrescante limonada licuada con hielo.", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd" },

  // Postres
  { id: 17, cat: "Postres", nombre: "Torta de Chocolate", precio: 12.00, desc: "Porción generosa bañada en fudge casero.", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587" },
  { id: 18, cat: "Postres", nombre: "Crema Volteada", precio: 10.00, desc: "Postre tradicional suave bañado en caramelo.", img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf" }
];

let carrito = [];
let modalProducto = null;
let modalCantidad = 1;

document.addEventListener("DOMContentLoaded", () => {
  limpiarCarritoNaN(); // Ejecuta la limpieza de errores
  renderProductos(bdProductos);
  actualizarUI_Carrito();
  iniciarCarrusel();
  actualizarEstadoLogin(); // Verifica si hay usuario logueado
});

// -- FIX PARA EL ERROR NaN --
function limpiarCarritoNaN() {
  let guardado = localStorage.getItem("carrito");
  if (guardado) {
    let parseado = JSON.parse(guardado);
    // Filtrar solo los productos que tengan precio y cantidad válidos (números)
    carrito = parseado.filter(p => !isNaN(p.precio) && !isNaN(p.cant) && p.cant > 0);
    // Si hubo basura eliminada, guardamos el carrito limpio
    if (carrito.length !== parseado.length) {
      localStorage.setItem("carrito", JSON.stringify(carrito));
      console.log("Se limpiaron datos corruptos del carrito.");
    }
  }
}

// -- ESTADO DE LOGIN EN HEADER --
function actualizarEstadoLogin() {
  const usuario = localStorage.getItem("usuarioNorkys");
  const btnLogin = document.getElementById("btn-login-header");
  if (btnLogin) {
    if (usuario) {
      // Si hay usuario, mostrar su nombre corto
      let nombreCorto = usuario.split(" ")[0]; // Toma solo el primer nombre
      btnLogin.innerHTML = `👤 Hola, ${nombreCorto}`;
      btnLogin.classList.add("btn-success");
      btnLogin.classList.remove("btn"); // Quita estilo rojo, pone verde
    } else {
      btnLogin.innerHTML = `👤 Mi Cuenta`;
      btnLogin.classList.add("btn");
      btnLogin.classList.remove("btn-success");
    }
  }
}

function verificarLogin() {
  if (localStorage.getItem("usuarioNorkys")) window.location.href = "profile.html";
  else window.location.href = "login.html";
}

// -- TOAST --
function showToast(mensaje, tipo = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `<span>${tipo === 'success' ? '✅' : '❌'}</span> ${mensaje}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = "fadeOut 0.4s forwards"; setTimeout(() => toast.remove(), 400); }, 3000);
}

// -- RENDERIZADO Y FILTROS --
function renderProductos(lista) {
  const cont = document.getElementById("productos");
  if (!cont) return;
  cont.innerHTML = "";
  if (lista.length === 0) { cont.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>No se encontraron productos.</p>"; return; }

  lista.forEach(p => {
    cont.innerHTML += `
      <div class="card">
        <span class="badge-cat">${p.cat}</span>
        <img src="${p.img}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p class="desc">${p.desc}</p>
        <p class="precio">S/ ${p.precio.toFixed(2)}</p>
        <button class="btn btn-full" onclick='abrirModal(${JSON.stringify(p)})'>Agregar al pedido</button>
      </div>
    `;
  });
}

function filtrarMenu(categoria, btnElement) {
  document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');
  if (categoria === 'Todos') renderProductos(bdProductos);
  else renderProductos(bdProductos.filter(p => p.cat === categoria));
}

// -- BUSCADOR --
function buscarProductos() {
  const query = document.getElementById("busqueda").value.toLowerCase();
  const dropdown = document.getElementById("search-results");
  dropdown.innerHTML = "";
  if (query.length === 0) { dropdown.classList.add("hidden"); return; }

  const coincidencias = bdProductos.filter(p => p.nombre.toLowerCase().includes(query) || p.cat.toLowerCase().includes(query));

  if (coincidencias.length > 0) {
    dropdown.classList.remove("hidden");
    coincidencias.forEach(p => {
      dropdown.innerHTML += `
        <div class="search-item" onclick='seleccionarDesdeBuscador(${JSON.stringify(p)})'>
          <img src="${p.img}">
          <div><strong>${p.nombre}</strong><br><span style="color:var(--primary); font-weight:bold;">S/ ${p.precio.toFixed(2)}</span></div>
        </div>
      `;
    });
  } else { dropdown.classList.add("hidden"); }
}

function seleccionarDesdeBuscador(p) {
  document.getElementById("busqueda").value = "";
  document.getElementById("search-results").classList.add("hidden");
  abrirModal(p);
}

// -- MODAL --
function abrirModal(p) {
  modalProducto = p;
  modalCantidad = 1;
  document.getElementById("modal-img").src = p.img;
  document.getElementById("modal-nombre").innerText = p.nombre;
  document.getElementById("modal-desc").innerText = p.desc;
  document.getElementById("modal-precio").innerText = `S/ ${p.precio.toFixed(2)}`;
  document.getElementById("cantidad").innerText = modalCantidad;

  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");
  // Pequeño delay para la animación fluida
  setTimeout(() => modal.classList.add("show"), 10);
}

function cerrarModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function cambiarCantidadModal(v) {
  modalCantidad += v;
  if (modalCantidad < 1) modalCantidad = 1;
  document.getElementById("cantidad").innerText = modalCantidad;
}

// -- CARRITO --
function agregarDesdeModal() {
  let item = carrito.find(x => x.id === modalProducto.id);
  if (item) { item.cant += modalCantidad; }
  else { carrito.push({ ...modalProducto, cant: modalCantidad }); }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarUI_Carrito();
  cerrarModal();
  showToast(`${modalProducto.nombre} agregado al carrito`);
  toggleCart();
}

function modificarCantCarrito(index, delta) {
  carrito[index].cant += delta;
  if (carrito[index].cant <= 0) {
    carrito.splice(index, 1);
    showToast("Producto eliminado", "error");
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarUI_Carrito();
}

function actualizarUI_Carrito() {
  const cont = document.getElementById("cart-items");
  const badge = document.getElementById("cart-badge");
  if (!cont) return;
  cont.innerHTML = "";

  let totalDinero = 0;
  let totalItems = 0;

  carrito.forEach((p, i) => {
    // Validar por si acaso se cuela un NaN
    const precio = Number(p.precio) || 0;
    const cant = Number(p.cant) || 0;

    totalDinero += precio * cant;
    totalItems += cant;
    cont.innerHTML += `
      <div class="cart-item-row">
        <div style="flex-grow:1; padding-right:10px;">
          <strong style="color:#2c3e50;">${p.nombre}</strong><br>
          <span style="color:#7f8c8d; font-size:14px;">S/ ${precio.toFixed(2)} c/u</span>
        </div>
        <div class="cart-controls">
          <button class="btn-circle" style="width:28px; height:28px;" onclick="modificarCantCarrito(${i}, -1)">-</button>
          <span style="font-weight:bold; min-width:15px; text-align:center;">${cant}</span>
          <button class="btn-circle" style="width:28px; height:28px;" onclick="modificarCantCarrito(${i}, 1)">+</button>
        </div>
      </div>
    `;
  });

  document.getElementById("total").innerText = `Total: S/ ${totalDinero.toFixed(2)}`;
  badge.innerText = totalItems;

  badge.style.transform = "scale(1.4)";
  setTimeout(() => badge.style.transform = "scale(1)", 200);
}

function vaciarCarrito() {
  if (carrito.length === 0) return;
  carrito = [];
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarUI_Carrito();
  showToast("Carrito vaciado", "error");
}

// --- LÓGICA DE UPSELL Y CHECKOUT ---
let productoUpsell = null;

function procesarPago() {
  if (carrito.length === 0) { showToast("Tu carrito está vacío", "error"); return; }
  cerrarCart(); // Ocultamos el carrito lateral

  // Buscar un producto que sea Snack o Postre para sugerir
  const sugerencias = bdProductos.filter(p => p.cat === 'Snacks' || p.cat === 'Postres');
  // Elegir uno al azar
  productoUpsell = sugerencias[Math.floor(Math.random() * sugerencias.length)];

  // Llenar datos del modal
  document.getElementById("upsell-img").src = productoUpsell.img;
  document.getElementById("upsell-nombre").innerText = productoUpsell.nombre;
  document.getElementById("upsell-precio").innerText = `S/ ${productoUpsell.precio.toFixed(2)}`;

  // Mostrar modal de Upsell
  const modal = document.getElementById("upsell-modal");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("show"), 10);
}

function rechazarUpsell() {
  const modal = document.getElementById("upsell-modal");
  modal.classList.remove("show");
  setTimeout(() => { modal.classList.add("hidden"); abrirCheckout(); }, 300);
}

function aceptarUpsell() {
  // Agregar el antojo al carrito con cantidad 1
  let item = carrito.find(x => x.id === productoUpsell.id);
  if (item) { item.cant += 1; } else { carrito.push({ ...productoUpsell, cant: 1 }); }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarUI_Carrito();
  showToast(`¡Excelente elección! Agregado.`);
  rechazarUpsell(); // Cierra el modal y abre el checkout
}

function abrirCheckout() {
  const overlay = document.getElementById("checkout-overlay");
  overlay.classList.remove("hidden");
  setTimeout(() => overlay.classList.add("show"), 10);

  // Autocompletar datos si el usuario está logueado
  const nombreGuardado = localStorage.getItem("usuarioNorkys");
  const direccionGuardada = localStorage.getItem("direccionNorkys");
  if (nombreGuardado) document.getElementById("chk-nombre").value = nombreGuardado;
  if (direccionGuardada) document.getElementById("chk-direccion").value = direccionGuardada;

  pintarResumenCheckout();
}

function cerrarCheckout() {
  const overlay = document.getElementById("checkout-overlay");
  overlay.classList.remove("show");
  setTimeout(() => overlay.classList.add("hidden"), 400);
}

function pintarResumenCheckout() {
  const cont = document.getElementById("checkout-items-list");
  cont.innerHTML = "";
  let subtotal = 0;

  carrito.forEach(p => {
    subtotal += p.precio * p.cant;
    cont.innerHTML += `
      <div class="chk-item">
        <img src="${p.img}" alt="${p.nombre}">
        <div class="chk-item-info">
          <h4>${p.nombre}</h4>
          <span style="color:#7f8c8d; font-size:13px;">Cant: ${p.cant}</span>
        </div>
        <div class="chk-item-precio">S/ ${(p.precio * p.cant).toFixed(2)}</div>
      </div>
    `;
  });

  // Lógica del Delivery: Gratis si pasa de S/ 40
  let costoDelivery = subtotal >= 40 ? 0 : 5;
  let totalFinal = subtotal + costoDelivery;

  document.getElementById("chk-subtotal").innerText = `S/ ${subtotal.toFixed(2)}`;

  if (costoDelivery === 0) {
    document.getElementById("chk-delivery").innerHTML = `<span style="color:var(--primary); font-weight:bold;">¡GRATIS!</span>`;
  } else {
    document.getElementById("chk-delivery").innerText = `S/ ${costoDelivery.toFixed(2)}`;
  }

  document.getElementById("chk-total-final").innerText = `S/ ${totalFinal.toFixed(2)}`;
}

function cambiarMetodoPago() {
  // Ocultar todos los paneles
  document.getElementById("panel-yape").classList.add("hidden");
  document.getElementById("panel-tarjeta").classList.add("hidden");
  document.getElementById("panel-efectivo").classList.add("hidden");

  // Saber cuál está seleccionado
  const seleccionado = document.querySelector('input[name="metodoPago"]:checked').value;

  // Mostrar el panel correspondiente
  document.getElementById(`panel-${seleccionado}`).classList.remove("hidden");
}

function cambiarTipoDoc() {
  const tipo = document.querySelector('input[name="tipoDoc"]:checked').value;
  const inputDoc = document.getElementById("chk-documento");
  inputDoc.placeholder = tipo === "Boleta" ? "Número de DNI" : "Número de RUC";
}

function confirmarPedidoFinal() {
  const nombre = document.getElementById("chk-nombre").value.trim();
  const direccion = document.getElementById("chk-direccion").value.trim();
  const nroDoc = document.getElementById("chk-documento").value.trim();
  const tipoDoc = document.querySelector('input[name="tipoDoc"]:checked').value;
  const correoActivo = localStorage.getItem("correoNorkys");

  // Validaciones
  if (!nombre || !direccion || !nroDoc) {
    showToast("Completa los datos de envío y documento", "error");
    return;
  }
  if (tipoDoc === "Boleta" && nroDoc.length !== 8) { showToast("DNI debe tener 8 dígitos", "error"); return; }
  if (tipoDoc === "Factura" && nroDoc.length !== 11) { showToast("RUC debe tener 11 dígitos", "error"); return; }

  showToast("⏳ Generando comprobante...", "success");

  setTimeout(() => {
    // 1. Crear el objeto del pedido
    const nuevoPedido = {
      id: "PED-" + Math.floor(Math.random() * 900000 + 100000),
      fecha: new Date().toLocaleString(),
      cliente: nombre,
      correo: correoActivo || "invitado@norkys.com",
      direccion: direccion,
      documento: nroDoc,
      tipoComprobante: tipoDoc,
      items: [...carrito],
      subtotal: parseFloat(document.getElementById("chk-subtotal").innerText.replace("S/ ", "")),
      delivery: document.getElementById("chk-delivery").innerText.includes("GRATIS") ? 0 : 5,
      total: parseFloat(document.getElementById("chk-total-final").innerText.replace("S/ ", ""))
    };

    // 2. Guardar en el historial (norkys_historial_pedidos)
    let historial = JSON.parse(localStorage.getItem("norkys_historial_pedidos")) || [];
    historial.push(nuevoPedido);
    localStorage.setItem("norkys_historial_pedidos", JSON.stringify(historial));

    // 3. Limpiar y cerrar
    vaciarCarrito();
    cerrarCheckout();

    alert(`🎉 ¡Gracias por tu compra!\nTu ${tipoDoc} ha sido generada.\nPuedes verla en "Mi Perfil > Mis Pedidos".`);
  }, 2000);
}

function toggleCart() { document.getElementById("cart").classList.toggle("open"); }
function cerrarCart() { document.getElementById("cart").classList.remove("open"); }

// -- SLIDER CON DOTS --
let slideIdx = 0;
let timer;
function iniciarCarrusel() {
  const slides = document.querySelector('.carousel-inner');
  const dots = document.querySelectorAll('.dot');
  if (!slides || dots.length === 0) return;

  const count = document.querySelectorAll('.slide').length;

  const actualizar = () => {
    slides.style.transform = `translateX(-${slideIdx * 100}%)`;
    dots.forEach(d => d.classList.remove('active'));
    dots[slideIdx].classList.add('active');
  };

  document.querySelector('.next').onclick = () => { slideIdx = (slideIdx + 1) % count; actualizar(); resetTimer(); };
  document.querySelector('.prev').onclick = () => { slideIdx = (slideIdx - 1 + count) % count; actualizar(); resetTimer(); };

  dots.forEach((dot, idx) => {
    dot.onclick = () => { slideIdx = idx; actualizar(); resetTimer(); };
  });

  const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => { slideIdx = (slideIdx + 1) % count; actualizar(); }, 5000);
  };
  resetTimer();
}