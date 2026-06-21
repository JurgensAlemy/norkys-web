// ================= menu.js — Carta de Norky's =================

window.changeNorkysCategory = (categoryId, element) => {
  document.querySelectorAll('.sticky-container .category-pill').forEach(p => p.classList.remove('active'));
  element.classList.add('active');
};

document.addEventListener('DOMContentLoaded', async () => {
  const sections = ['pollos', 'parrillas', 'combos', 'hamburguesas', 'bebidas', 'postres', 'porciones'];

  // ===== NUEVO: mostrar skeleton en todas las secciones mientras carga =====
  sections.forEach(cat => {
    const container = document.querySelector(`#${cat} .top-sellers-grid`);
    if (!container) return;
    container.innerHTML = Array.from({ length: 3 }).map(() => `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>`).join('');
  });

  const products = await getNorkysProducts();

  sections.forEach(cat => {
    const container = document.querySelector(`#${cat} .top-sellers-grid`);
    if (!container) return;
    container.innerHTML = ''; // ← limpia el skeleton antes de pintar lo real

    const catProducts = products.filter(p => p.categoria === cat);

    if (catProducts.length === 0) {
      container.innerHTML = `<p style="color:#666;font-size:14px;grid-column:1/-1;">Próximamente más productos...</p>`;
      return;
    }

    catProducts.forEach(prod => {
      const sinStock = (prod.stock ?? 0) <= 0; // ===== NUEVO: considerar sin stock si stock es 0 o negativo =====

      const article = document.createElement('article');
      article.className = 'product-card' + (sinStock ? ' sin-stock' : '');
      article.innerHTML = `
              <div class="card-image-wrapper">
                <img src="${prod.img}" alt="${prod.nombre}"
                     style="width:100%;height:100%;object-fit:cover;${sinStock ? 'filter:grayscale(1);opacity:.55;' : ''}"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div class="product-placeholder" style="display:none;">
                  <i class="fa-solid fa-bowl-food" style="font-size:50px;color:#ccc;"></i>
                </div>
                ${sinStock ? `<span style="position:absolute;top:10px;left:10px;background:#444;color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;">AGOTADO</span>` : ''}
              </div>
              <div class="card-info">
                <h3 class="product-name">${prod.nombre}</h3>
                <p style="font-weight:900;color:var(--norkys-red);font-size:18px;margin-bottom:15px;">S/ ${prod.precio.toFixed(2)}</p>
                ${sinStock
          ? `<button class="btn-ver-detalle" disabled style="opacity:.5;cursor:not-allowed;background:#999;">Agotado</button>`
          : `<button class="btn-ver-detalle"
                  onclick="openNorkysModal('${prod.nombre.replace(/'/g, "\\'")}','${prod.descripcion ? prod.descripcion.replace(/'/g, "\\'") : ''}',${prod.precio},'${prod.img}')">
                  Agregar al pedido
                </button>`}
              </div>`;
      container.appendChild(article);
    });
  });

  // Agregar al carrito desde el modal
  const btnAddCart = document.querySelector('.btn-add-cart');
  if (btnAddCart) {
    const newBtn = btnAddCart.cloneNode(true);
    btnAddCart.parentNode.replaceChild(newBtn, btnAddCart);

    newBtn.addEventListener('click', () => {
      const qty = parseInt(document.getElementById('qtyInput').value);
      const title = document.getElementById('modalTitle').textContent;
      const price = currentModalBasePrice;
      const img = document.getElementById('modalImg').src;

      const prod = products.find(p => p.nombre === title);

      // ===== NUEVO: no permitir agregar más de lo disponible =====
      if (prod && qty > (prod.stock ?? 0)) {
        if (typeof showNorkysToast === 'function')
          showNorkysToast(`Solo quedan ${prod.stock} unidades de ${title}`, 'error');
        return;
      }

      const cart = getNorkysCart();
      const existing = cart.find(i => i.nombre === title);

      if (existing) {
        // ===== NUEVO: validar también la suma total contra stock =====
        if (prod && (existing.cantidad + qty) > (prod.stock ?? 0)) {
          if (typeof showNorkysToast === 'function')
            showNorkysToast(`Ya tienes el máximo disponible de ${title} en tu carrito`, 'error');
          return;
        }
        existing.cantidad += qty;
      } else {
        cart.push({
          id: prod ? prod.id : null,
          nombre: title,
          precio: price,
          cantidad: qty,
          img: img
        });
      }

      localStorage.setItem('norkys_cart', JSON.stringify(cart));
      document.getElementById('productModal').classList.remove('active');
      if (typeof updateHeaderAndCart === 'function') updateHeaderAndCart();
      if (typeof showNorkysToast === 'function') showNorkysToast(`${qty}x ${title} agregado al pedido`, 'success');
    });
  }
});