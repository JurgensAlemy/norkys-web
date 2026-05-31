// ================= menu.js — Carta de Norky's =================

window.changeNorkysCategory = (categoryId, element) => {
  document.querySelectorAll('.sticky-container .category-pill').forEach(p => p.classList.remove('active'));
  element.classList.add('active');
};

document.addEventListener('DOMContentLoaded', async () => {
  const sections = ['pollos', 'parrillas', 'combos', 'hamburguesas', 'bebidas', 'postres', 'porciones'];

  // Cargar todos los productos desde la API
  const products = await getNorkysProducts();

  sections.forEach(cat => {
    const container = document.querySelector(`#${cat} .top-sellers-grid`);
    if (!container) return;
    container.innerHTML = '';

    const catProducts = products.filter(p => p.categoria === cat);

    if (catProducts.length === 0) {
      container.innerHTML = `<p style="color:#666;font-size:14px;grid-column:1/-1;">Próximamente más productos...</p>`;
      return;
    }

    catProducts.forEach(prod => {
      const article = document.createElement('article');
      article.className = 'product-card';
      article.innerHTML = `
              <div class="card-image-wrapper">
                <img src="${prod.img}" alt="${prod.nombre}"
                     style="width:100%;height:100%;object-fit:cover;"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div class="product-placeholder" style="display:none;">
                  <i class="fa-solid fa-bowl-food" style="font-size:50px;color:#ccc;"></i>
                </div>
              </div>
              <div class="card-info">
                <h3 class="product-name">${prod.nombre}</h3>
                <p style="font-weight:900;color:var(--norkys-red);font-size:18px;margin-bottom:15px;">S/ ${prod.precio.toFixed(2)}</p>
                <button class="btn-ver-detalle"
                  onclick="openNorkysModal('${prod.nombre.replace(/'/g, "\\'")}','${prod.descripcion ? prod.descripcion.replace(/'/g, "\\'") : ''}',${prod.precio},'${prod.img}')">
                  Agregar al pedido
                </button>
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

      // Buscar el producto en la lista para tener su id
      const prod = products.find(p => p.nombre === title);
      const cart = getNorkysCart();
      const existing = cart.find(i => i.nombre === title);

      if (existing) {
        existing.cantidad += qty;
      } else {
        cart.push({
          id: prod ? prod.id : null,   // ← id de la BD, necesario para crear pedidos
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