// ================= LÓGICA DE LA CARTA NORKY'S =================

// Cambia el color de la categoría activa en la barra superior al hacer clic
window.changeNorkysCategory = (categoryId, element) => {
  const allPills = document.querySelectorAll('.sticky-container .category-pill');
  allPills.forEach(pill => pill.classList.remove('active'));
  element.classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
  // Llama a la base de datos local
  const products = getNorkysProducts() || [];
  const sections = ['pollos', 'parrillas', 'combos', 'hamburguesas', 'bebidas', 'postres', 'porciones'];

  // Llenar TODAS las secciones con TODOS los productos correspondientes (más de 100)
  sections.forEach(cat => {
    const container = document.querySelector(`#${cat} .top-sellers-grid`);
    if (container) {
      container.innerHTML = ''; // Se asegura de que esté vacío
      const catProducts = products.filter(p => p.categoria === cat);
      
      if (catProducts.length === 0) {
        container.innerHTML = '<p style="color:#666; font-size:14px; grid-column: 1 / -1;">Próximamente más productos...</p>';
        return;
      }

      catProducts.forEach(prod => {
        const article = document.createElement('article');
        article.className = 'product-card';
        article.innerHTML = `
          <div class="card-image-wrapper">
            <img src="${prod.img}" alt="${prod.nombre}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="product-placeholder" style="display:none;"><i class="fa-solid fa-bowl-food" style="font-size: 50px; color: #ccc;"></i></div>
          </div>
          <div class="card-info">
            <h3 class="product-name">${prod.nombre}</h3>
            <p style="font-weight:900; color:var(--norkys-red); font-size:18px; margin-bottom:15px;">S/ ${prod.precio.toFixed(2)}</p>
            
            <button class="btn-ver-detalle" onclick="openNorkysModal('${prod.nombre}', '${prod.desc}', ${prod.precio}, '${prod.img}')">
                Agregar al pedido
            </button>
          </div>
        `;
        container.appendChild(article);
      });
    }
  });

  // Lógica de Agregar al Carrito desde el Modal
  const btnAddCart = document.querySelector('.btn-add-cart');
  if (btnAddCart) {
    const newBtn = btnAddCart.cloneNode(true); 
    btnAddCart.parentNode.replaceChild(newBtn, btnAddCart);
    
    newBtn.addEventListener('click', () => {
      const qty = parseInt(document.getElementById('qtyInput').value);
      const title = document.getElementById('modalTitle').textContent;
      const price = currentModalBasePrice; 
      const img = document.getElementById('modalImg').src;
      
      const cart = getNorkysCart() || [];
      const existingItem = cart.find(item => item.nombre === title);

      if (existingItem) {
        existingItem.cantidad += qty;
      } else {
        cart.push({ nombre: title, precio: price, cantidad: qty, img: img });
      }

      localStorage.setItem('norkys_cart', JSON.stringify(cart));
      document.getElementById('productModal').classList.remove('active');
      
      if (typeof updateHeaderAndCart === 'function') updateHeaderAndCart(); 
      if (typeof showNorkysToast === 'function') showNorkysToast(`Se agregaron ${qty}x ${title} al pedido.`, "success");
    });
  }
});