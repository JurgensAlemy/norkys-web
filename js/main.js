// ================= BASE GLOBAL DEL INDEX, BUSCADOR Y SISTEMA GENERAL NORKY'S =================


// ==========================================================
// SISTEMA GLOBAL DE NOTIFICACIONES (TOASTS)
// Muestra mensajes flotantes de éxito o error
// ==========================================================
const showNorkysToast = (message, type = 'success') => {

  // Si los estilos aún no existen, los crea dinámicamente
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';

    style.innerHTML = `
      .custom-toast { position: fixed; bottom: 30px; right: 30px; padding: 15px 25px; border-radius: 10px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 14px; z-index: 9999; transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); border-left: 5px solid; }
      .custom-toast.show { transform: translateY(0); opacity: 1; }
      .custom-toast.success { border-color: #00c853; color: #212121; }
      .custom-toast.error { border-color: #da291c; color: #212121; }
      .custom-toast i.success-icon { color: #00c853; font-size: 20px; }
      .custom-toast i.error-icon { color: #da291c; font-size: 20px; }
    `;

    document.head.appendChild(style);
  }

  // Crear notificación
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;

  // Ícono según el tipo de mensaje
  const icon = type === 'success'
    ? '<i class="fa-solid fa-circle-check success-icon"></i>'
    : '<i class="fa-solid fa-circle-exclamation error-icon"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;

  document.body.appendChild(toast);

  // Mostrar animación
  setTimeout(() => toast.classList.add('show'), 10);

  // Ocultar automáticamente después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};


// ==========================================================
// ACTUALIZAR HEADER Y CARRITO
// Muestra usuario logueado y resumen del carrito
// ==========================================================
const updateHeaderAndCart = () => {
  const user = getCurrentUser();
  const userActions = document.querySelector('.user-actions');

  // Si hay usuario logueado
  if (user && userActions) {
    const actionItem = userActions.querySelector('.action-item');

    if (actionItem) {

      // Redirige según rol
      actionItem.href = user.rol === 'admin'
        ? 'dashboard.html'
        : 'profile.html';

      // Cambia visualmente el header
      actionItem.innerHTML = `
        <i class="fa-solid fa-user-check" style="color: var(--norkys-red); font-size: 20px;"></i>
        <div class="action-text">
          <span>Hola, ${user.nombres.split(' ')[0]}</span>
          <strong>Mi cuenta <i class="fa-solid fa-chevron-down" style="font-size: 10px"></i></strong>
        </div>
      `;
    }
  }

  // Obtener carrito
  const cart = getNorkysCart() || [];

  const badges = document.querySelectorAll('.cart-badge');
  const totalEls = document.querySelectorAll('.cart-button strong');

  // Calcular cantidad total de productos
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  // Calcular precio total
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.precio * item.cantidad), 0
  );

  // Actualizar badge
  badges.forEach(b => {
    b.textContent = totalItems;
    b.style.display = totalItems > 0 ? 'flex' : 'none';
  });

  // Actualizar total visual
  totalEls.forEach(t => t.textContent = `S/ ${totalPrice.toFixed(2)}`);
};


// ==========================================================
// MODAL GLOBAL DE PRODUCTOS
// Muestra información detallada del producto
// ==========================================================
let currentModalBasePrice = 0;

window.openNorkysModal = function(title, desc, price, imgUrl) {

  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDesc').textContent = desc;

  currentModalBasePrice = parseFloat(price);

  document.getElementById('qtyInput').value = 1;
  document.getElementById('modalPrice').textContent =
    `S/ ${currentModalBasePrice.toFixed(2)}`;

  const modalImg = document.getElementById('modalImg');
  const fallback = document.getElementById('modalIconFallback');

  // Si hay imagen
  if (imgUrl && imgUrl !== 'undefined') {
    modalImg.src = imgUrl;
    modalImg.style.display = 'block';
    fallback.style.display = 'none';
  } else {
    // Mostrar ícono de respaldo
    modalImg.style.display = 'none';
    fallback.style.display = 'block';
  }

  // Mostrar modal
  document.getElementById('productModal').classList.add('active');
};


// ==========================================================
// BUSCADOR DINÁMICO
// Busca productos mientras el usuario escribe
// ==========================================================
const setupFunctionalSearch = () => {

  const searchInputs = document.querySelectorAll('.search-input');

  searchInputs.forEach(searchInput => {

    const searchContainer = searchInput.closest('.search-container');
    if (!searchContainer) return;

    let resultsDrop = searchContainer.querySelector('.search-results-container');

    // Crear contenedor si no existe
    if (!resultsDrop) {
      resultsDrop = document.createElement('div');
      resultsDrop.className = 'search-results-container';
      resultsDrop.innerHTML = `<div class="search-results-list"></div>`;
      searchContainer.appendChild(resultsDrop);
    }

    const resultsList = resultsDrop.querySelector('.search-results-list');

    // Detectar escritura
    searchInput.addEventListener('input', (e) => {

      const query = e.target.value.toLowerCase().trim();
      resultsList.innerHTML = '';

      // Ocultar si escribe menos de 2 letras
      if (query.length < 2) {
        resultsDrop.style.display = 'none';
        return;
      }

      const products = getNorkysProducts() || [];

      // Filtrar coincidencias
      const filteredProducts = products.filter(
        p => p.nombre.toLowerCase().includes(query)
      );

      // Si no hay resultados
      if (filteredProducts.length === 0) {
        resultsList.innerHTML = `
          <div style="padding:20px; text-align:center;">
            No se encontraron productos para "${query}"
          </div>
        `;
      } else {

        // Mostrar resultados
        filteredProducts.forEach(prod => {
          const item = document.createElement('div');
          item.className = 'search-result-item';

          item.innerHTML = `
            <img src="${prod.img}" class="search-result-img">
            <div class="search-result-info">
              <div class="search-result-name">${prod.nombre}</div>
              <div class="search-result-price">S/ ${prod.precio.toFixed(2)}</div>
            </div>
          `;

          // Redirigir al menú
          item.addEventListener('click', () => {
            resultsDrop.style.display = 'none';
            searchInput.value = '';
            window.location.href = `menu.html#${prod.categoria}`;
          });

          resultsList.appendChild(item);
        });
      }

      resultsDrop.style.display = 'block';
    });

    // Cerrar si hace click afuera
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        resultsDrop.style.display = 'none';
      }
    });
  });
};


// ==========================================================
// VITRINA DE FAVORITOS DEL INDEX
// Filtra productos destacados
// ==========================================================
const setupIndexFilters = () => {

  const filterBtns = document.querySelectorAll('.filter-btn');
  const favoritesGrid = document.getElementById('index-favorites-grid');

  if (!filterBtns.length || !favoritesGrid) return;

  const products = getNorkysProducts() || [];

  const renderFavorites = (category) => {

    favoritesGrid.innerHTML = '';
    let filteredProducts = [];

    // Mostrar favoritos principales
    if (category === 'todos') {
      filteredProducts = [
        products.find(p => p.id === 1),
        products.find(p => p.id === 4),
        products.find(p => p.id === 3),
        products.find(p => p.id === 5)
      ].filter(Boolean);

    } else {
      // Mostrar máximo 4 por categoría
      filteredProducts = products
        .filter(p => p.categoria === category)
        .slice(0, 4);
    }

    if (filteredProducts.length === 0) {
      favoritesGrid.innerHTML = '<p>Próximamente más productos.</p>';
      return;
    }

    // Pintar tarjetas
    filteredProducts.forEach(prod => {

      const article = document.createElement('article');
      article.className = 'product-card seller-card';

      article.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${prod.img}" alt="${prod.nombre}">
        </div>
        <br>
        <div class="card-info">
          <h3>${prod.nombre}</h3>
          <p>S/ ${prod.precio.toFixed(2)}</p>
          <br>
          <button class="btn-ver-detalle"
            onclick="window.location.href='menu.html#${prod.categoria}'">
            Ver en la carta
          </button>
        </div>
      `;

      favoritesGrid.appendChild(article);
    });
  };

  // Activar filtros
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderFavorites(btn.getAttribute('data-filter'));
    });
  });

  renderFavorites('todos');
};


// ==========================================================
// INICIALIZACIÓN GENERAL
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {

  // Cargar header
  updateHeaderAndCart();

  // Activar buscador
  setupFunctionalSearch();

  // Activar filtros
  setupIndexFilters();

  // Cerrar modal
  const closeModalBtn = document.querySelector('.close-modal');

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('productModal')
        .classList.remove('active');
    });
  }

  // Botones cantidad
  const btnMinus = document.getElementById('btnMinus');
  const btnPlus = document.getElementById('btnPlus');
  const qtyInput = document.getElementById('qtyInput');
  const modalPrice = document.getElementById('modalPrice');

  if (btnMinus && btnPlus) {

    // Disminuir cantidad
    btnMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);

      if (val > 1) {
        qtyInput.value = val - 1;
        modalPrice.textContent =
          `S/ ${(currentModalBasePrice * (val - 1)).toFixed(2)}`;
      }
    });

    // Aumentar cantidad
    btnPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);

      qtyInput.value = val + 1;

      modalPrice.textContent =
        `S/ ${(currentModalBasePrice * (val + 1)).toFixed(2)}`;
    });
  }
});
