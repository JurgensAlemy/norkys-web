// ================= checkout.js — Checkout / Pago Norky's =================
document.addEventListener("DOMContentLoaded", async () => {
  const user = getCurrentUser();
  if (!user) {
    showNorkysToast("Debes iniciar sesión para continuar", "error");
    setTimeout(() => (window.location.href = "login.html"), 1200);
    return;
  }

  const cart = getNorkysCart();
  if (!cart || cart.length === 0) {
    showNorkysToast("Tu carrito está vacío", "error");
    setTimeout(() => (window.location.href = "cart.html"), 1200);
    return;
  }

  const addressRaw = sessionStorage.getItem("norkys_checkout_address");
  if (!addressRaw) {
    showNorkysToast("Selecciona una dirección de entrega primero", "error");
    setTimeout(() => (window.location.href = "cart.html"), 1200);
    return;
  }
  const selectedAddress = JSON.parse(addressRaw); // { alias, detalle }

  // ── RENDER DIRECCIÓN ───────────────────────────────────────
  const addressBox = document.getElementById("checkout-address-box");
  addressBox.innerHTML = `
        <div>
            <strong>${selectedAddress.alias}</strong>
            <p>${selectedAddress.detalle}</p>
        </div>
        <a href="cart.html">Cambiar</a>`;

  // ── RENDER RESUMEN DE PRODUCTOS ─────────────────────────────
  const itemsMini = document.getElementById("checkout-items-mini");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const totalEl = document.getElementById("checkout-total");

  let subtotal = 0;
  itemsMini.innerHTML = cart
    .map((item) => {
      subtotal += item.precio * item.cantidad;
      return `
            <div class="mini-item">
                <span class="mini-item-qty">${item.cantidad}x</span>
                <span class="mini-item-name" style="flex:1;">${item.nombre}</span>
                <span class="mini-item-price">S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>`;
    })
    .join("");

  const envio = 5.0;
  subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
  totalEl.textContent = `S/ ${(subtotal + envio).toFixed(2)}`;

  // ── SELECCIÓN DE MÉTODO DE PAGO ─────────────────────────────
  let metodoPago = "Efectivo";
  const opciones = document.querySelectorAll(".payment-option");
  const detalles = document.querySelectorAll(".payment-detail-box");

  opciones.forEach((opt) => {
    opt.addEventListener("click", () => {
      opciones.forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      metodoPago = opt.dataset.method;

      detalles.forEach((d) => {
        d.classList.toggle("hidden", d.dataset.detail !== metodoPago);
      });
    });
  });

  // ── CONFIRMAR PEDIDO ─────────────────────────────────────────
  const btnConfirm = document.getElementById("btnConfirmOrder");
  btnConfirm.addEventListener("click", async () => {
    // Validación simple si eligieron Tarjeta (solo simulación, sin pasarela real)
    if (metodoPago === "Tarjeta") {
      const num = document
        .getElementById("cardNumber")
        .value.replace(/\s/g, "");
      const name = document.getElementById("cardName").value.trim();
      const exp = document.getElementById("cardExpiry").value.trim();
      const cvv = document.getElementById("cardCvv").value.trim();
      if (num.length < 12 || !name || exp.length < 4 || cvv.length < 3) {
        showNorkysToast(
          "Completa correctamente los datos de tu tarjeta",
          "error",
        );
        return;
      }
    }

    btnConfirm.disabled = true;
    btnConfirm.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

    try {
      const pedido = await crearPedido(selectedAddress.detalle, metodoPago);
      sessionStorage.removeItem("norkys_checkout_address");
      if (typeof updateHeaderAndCart === "function") updateHeaderAndCart();
      window.location.href = `pedido-confirmado.html?codigo=${encodeURIComponent(pedido.codigo)}&metodo=${encodeURIComponent(metodoPago)}`;
    } catch (err) {
      showNorkysToast(err.message || "No se pudo procesar el pedido", "error");
      btnConfirm.disabled = false;
      btnConfirm.innerHTML =
        'Confirmar Pedido <i class="fa-solid fa-chevron-right"></i>';
    }
  });
});
