// ================= BASE GLOBAL DEL INDEX, BUSCADOR Y SISTEMA GENERAL NORKY'S =================


// ==========================================================
// SISTEMA GLOBAL DE NOTIFICACIONES (TOASTS)
// ==========================================================
const showNorkysToast = (message, type = 'success') => {
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
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  const icon = type === 'success'
    ? '<i class="fa-solid fa-circle-check success-icon"></i>'
    : '<i class="fa-solid fa-circle-exclamation error-icon"></i>';
  toast.innerHTML = `${icon} <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};


// ==========================================================
// ACTUALIZAR HEADER Y CARRITO
// ⚠️ Esta función la llama components.js DESPUÉS de inyectar
//    el header, no al DOMContentLoaded directamente.
// ==========================================================
const updateHeaderAndCart = () => {
  const user = getCurrentUser(); // norkys_currentUser via db.js

  // ── USUARIO ──
  const actionItem = document.querySelector('.user-actions .action-item');

  if (actionItem) {
    if (user) {
      // Redirige según rol
      actionItem.href = user.rol === 'admin' ? 'dashboard.html' : 'profile.html';

      // Actualiza el HTML del botón
      actionItem.innerHTML = `
        <i class="fa-solid fa-user-check" style="color: var(--norkys-red); font-size: 20px;"></i>
        <div class="action-text">
          <span>Hola, ${user.nombres.split(' ')[0]}</span>
          <strong>Mi cuenta <i class="fa-solid fa-chevron-down" style="font-size: 10px"></i></strong>
        </div>
      `;
    }
    // Si no hay user, el HTML del header.html ya tiene "Hola, ingresa / Mi cuenta"
  }

  // ── CARRITO ──
  const cart = getNorkysCart() || [];

  const badges = document.querySelectorAll('.cart-badge');
  const totalEls = document.querySelectorAll('.cart-button strong');

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  badges.forEach(b => {
    b.textContent = totalItems;
    b.style.display = totalItems > 0 ? 'flex' : 'none';
  });

  totalEls.forEach(t => t.textContent = `S/ ${totalPrice.toFixed(2)}`);
};


// ==========================================================
// MODAL GLOBAL DE PRODUCTOS
// ==========================================================
let currentModalBasePrice = 0;

window.openNorkysModal = function (title, desc, price, imgUrl) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDesc').textContent = desc;
  currentModalBasePrice = parseFloat(price);
  document.getElementById('qtyInput').value = 1;
  document.getElementById('modalPrice').textContent = `S/ ${currentModalBasePrice.toFixed(2)}`;
  const modalImg = document.getElementById('modalImg');
  const fallback = document.getElementById('modalIconFallback');
  if (imgUrl && imgUrl !== 'undefined') {
    modalImg.src = imgUrl;
    modalImg.style.display = 'block';
    fallback.style.display = 'none';
  } else {
    modalImg.style.display = 'none';
    fallback.style.display = 'block';
  }
  document.getElementById('productModal').classList.add('active');
};


// ==========================================================
// BUSCADOR DINÁMICO
// ==========================================================
const setupFunctionalSearch = () => {
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(searchInput => {
    const searchContainer = searchInput.closest('.search-container');
    if (!searchContainer) return;
    let resultsDrop = searchContainer.querySelector('.search-results-container');
    if (!resultsDrop) {
      resultsDrop = document.createElement('div');
      resultsDrop.className = 'search-results-container';
      resultsDrop.innerHTML = `<div class="search-results-list"></div>`;
      searchContainer.appendChild(resultsDrop);
    }
    const resultsList = resultsDrop.querySelector('.search-results-list');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      resultsList.innerHTML = '';
      if (query.length < 2) { resultsDrop.style.display = 'none'; return; }
      const products = getNorkysProducts() || [];
      const filtered = products.filter(p => p.nombre.toLowerCase().includes(query));
      if (filtered.length === 0) {
        resultsList.innerHTML = `<div style="padding:20px; text-align:center;">No se encontraron productos para "${query}"</div>`;
      } else {
        filtered.forEach(prod => {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          item.innerHTML = `
            <img src="${prod.img}" class="search-result-img">
            <div class="search-result-info">
              <div class="search-result-name">${prod.nombre}</div>
              <div class="search-result-price">S/ ${prod.precio.toFixed(2)}</div>
            </div>
          `;
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
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) resultsDrop.style.display = 'none';
    });
  });
};


// ==========================================================
// VITRINA DE FAVORITOS DEL INDEX
// ==========================================================
const setupIndexFilters = () => {
  const favoritesGrid = document.getElementById('index-favorites-grid');
  if (!favoritesGrid) return;
  const products = getNorkysProducts() || [];
  favoritesGrid.innerHTML = '';
  const categoriasMostradas = new Set();
  const productosFinales = products
    .filter(prod => {
      if (categoriasMostradas.has(prod.categoria)) return false;
      categoriasMostradas.add(prod.categoria);
      return true;
    })
    .slice(0, 5);

  productosFinales.forEach(prod => {
    const article = document.createElement('article');
    article.className = 'product-card seller-card';
    article.innerHTML = `
      <div class="card-image-wrapper">
        <img src="${prod.img}" alt="${prod.nombre}">
      </div>
      <div class="card-info">
        <h3 class="product-name">${prod.nombre}</h3>
        <p style="font-size:24px; font-weight:900; color:var(--norkys-red-dark); margin-bottom:18px;">
          S/ ${prod.precio.toFixed(2)}
        </p>
        <button class="btn-ver-detalle" onclick="window.location.href='menu.html#${prod.categoria}'">
          Ver en la carta
        </button>
      </div>
    `;
    favoritesGrid.appendChild(article);
  });
};


// ==========================================================
// INICIALIZACIÓN — solo cosas que NO dependen del header
// El header se inicializa desde components.js via updateHeaderAndCart()
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Buscador y filtros (no dependen del header)
  setupFunctionalSearch();
  setupIndexFilters();

  // Cerrar modal
  const closeModalBtn = document.querySelector('.close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('productModal').classList.remove('active');
    });
  }

  // Botones cantidad del modal
  const btnMinus = document.getElementById('btnMinus');
  const btnPlus = document.getElementById('btnPlus');
  const qtyInput = document.getElementById('qtyInput');
  const modalPrice = document.getElementById('modalPrice');

  if (btnMinus && btnPlus) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      if (val > 1) {
        qtyInput.value = val - 1;
        modalPrice.textContent = `S/ ${(currentModalBasePrice * (val - 1)).toFixed(2)}`;
      }
    });
    btnPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      qtyInput.value = val + 1;
      modalPrice.textContent = `S/ ${(currentModalBasePrice * (val + 1)).toFixed(2)}`;
    });
  }
});