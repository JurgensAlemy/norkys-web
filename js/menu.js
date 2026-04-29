// ================= LÓGICA PRINCIPAL DE LA CARTA NORKY'S =================


// ==========================================================
// CAMBIAR CATEGORÍA ACTIVA EN LA BARRA SUPERIOR
// Resalta visualmente la categoría seleccionada
// ==========================================================
window.changeNorkysCategory = (categoryId, element) => {

  // Obtener todas las categorías
  const allPills = document.querySelectorAll('.sticky-container .category-pill');

  // Quitar clase activa a todas
  allPills.forEach(pill => pill.classList.remove('active'));

  // Activar solo la seleccionada
  element.classList.add('active');
};



// ==========================================================
// CUANDO LA PÁGINA TERMINA DE CARGAR
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {

  // Obtener productos desde la base de datos local
  const products = getNorkysProducts() || [];

  // Categorías que se mostrarán en la carta
  const sections = [
    'pollos',
    'parrillas',
    'combos',
    'hamburguesas',
    'bebidas',
    'postres',
    'porciones'
  ];



  // ==========================================================
  // RENDERIZAR PRODUCTOS EN CADA SECCIÓN
  // Llena dinámicamente cada categoría con sus productos
  // ==========================================================
  sections.forEach(cat => {

    // Buscar el contenedor correspondiente
    const container = document.querySelector(`#${cat} .top-sellers-grid`);

    if (container) {

      // Limpiar contenido previo
      container.innerHTML = '';

      // Filtrar productos según categoría
      const catProducts = products.filter(p => p.categoria === cat);


      // Si no hay productos
      if (catProducts.length === 0) {
        container.innerHTML = `
          <p style="color:#666; font-size:14px; grid-column: 1 / -1;">
            Próximamente más productos...
          </p>
        `;
        return;
      }


      // Crear tarjeta para cada producto
      catProducts.forEach(prod => {

        const article = document.createElement('article');
        article.className = 'product-card';

        article.innerHTML = `
          <div class="card-image-wrapper">

            <!-- Imagen del producto -->
            <img src="${prod.img}" 
                 alt="${prod.nombre}" 
                 style="width:100%; height:100%; object-fit:cover;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">

            <!-- Ícono de respaldo si falla la imagen -->
            <div class="product-placeholder" style="display:none;">
              <i class="fa-solid fa-bowl-food"
                 style="font-size:50px; color:#ccc;"></i>
            </div>

          </div>

          <div class="card-info">

            <!-- Nombre del producto -->
            <h3 class="product-name">${prod.nombre}</h3>

            <!-- Precio -->
            <p style="font-weight:900; color:var(--norkys-red); font-size:18px; margin-bottom:15px;">
              S/ ${prod.precio.toFixed(2)}
            </p>

            <!-- Botón para abrir modal -->
            <button class="btn-ver-detalle"
              onclick="openNorkysModal('${prod.nombre}', '${prod.desc}', ${prod.precio}, '${prod.img}')">

              Agregar al pedido

            </button>

          </div>
        `;

        // Insertar tarjeta
        container.appendChild(article);
      });
    }
  });



  // ==========================================================
  // AGREGAR PRODUCTO AL CARRITO DESDE EL MODAL
  // ==========================================================
  const btnAddCart = document.querySelector('.btn-add-cart');

  if (btnAddCart) {

    // Clonar botón para evitar múltiples listeners
    const newBtn = btnAddCart.cloneNode(true);

    btnAddCart.parentNode.replaceChild(newBtn, btnAddCart);



    // Evento click
    newBtn.addEventListener('click', () => {

      // Obtener cantidad seleccionada
      const qty = parseInt(document.getElementById('qtyInput').value);

      // Obtener nombre del producto
      const title = document.getElementById('modalTitle').textContent;

      // Obtener precio base
      const price = currentModalBasePrice;

      // Obtener imagen
      const img = document.getElementById('modalImg').src;


      // Obtener carrito actual
      const cart = getNorkysCart() || [];


      // Buscar si ya existe
      const existingItem = cart.find(item => item.nombre === title);


      if (existingItem) {

        // Si existe, sumar cantidad
        existingItem.cantidad += qty;

      } else {

        // Si no existe, agregar nuevo producto
        cart.push({
          nombre: title,
          precio: price,
          cantidad: qty,
          img: img
        });
      }


      // Guardar carrito actualizado
      localStorage.setItem('norkys_cart', JSON.stringify(cart));


      // Cerrar modal
      document.getElementById('productModal').classList.remove('active');


      // Actualizar header y contador del carrito
      if (typeof updateHeaderAndCart === 'function') {
        updateHeaderAndCart();
      }


      // Mostrar notificación
      if (typeof showNorkysToast === 'function') {
        showNorkysToast(
          `Se agregaron ${qty}x ${title} al pedido.`,
          "success"
        );
      }

    });
  }

});
