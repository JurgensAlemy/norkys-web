// ================= LÓGICA GLOBAL, BUSCADOR Y VITRINA DEL INDEX =================

// Sistema global de Notificaciones
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
  const icon = type === 'success' ? '<i class="fa-solid fa-circle-check success-icon"></i>' : '<i class="fa-solid fa-circle-exclamation error-icon"></i>';
  toast.innerHTML = `${icon} <span>${message}</span>`;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Actualizar Header (Nombre del usuario y Carrito)
const updateHeaderAndCart = () => {
  const user = getCurrentUser();
  const userActions = document.querySelector('.user-actions');
  
  if (user && userActions) {
    const actionItem = userActions.querySelector('.action-item');
    if (actionItem) {
      actionItem.href = user.rol === 'admin' ? 'dashboard.html' : 'profile.html';
      actionItem.innerHTML = `
        <i class="fa-solid fa-user-check" style="color: var(--norkys-red); font-size: 20px;"></i>
        <div class="action-text">
          <span>Hola, ${user.nombres.split(' ')[0]}</span>
          <strong>Mi cuenta <i class="fa-solid fa-chevron-down" style="font-size: 10px"></i></strong>
        </div>
      `;
    }
  }

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

// Lógica del Modal global (Usado principalmente en menu.html)
let currentModalBasePrice = 0;
window.openNorkysModal = function(title, desc, price, imgUrl) {
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

// Buscador Dinámico
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

      if (query.length < 2) {
        resultsDrop.style.display = 'none';
        return;
      }

      const products = getNorkysProducts() || [];
      const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(query));

      if (filteredProducts.length === 0) {
        resultsList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px; font-weight: 600;">No se encontraron productos para "${query}"</div>`;
      } else {
        filteredProducts.forEach(prod => {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          item.innerHTML = `
            <img src="${prod.img}" class="search-result-img" onerror="this.style.display='none'">
            <div class="search-result-info">
              <div class="search-result-name">${prod.nombre}</div>
              <div class="search-result-price">S/ ${prod.precio.toFixed(2)}</div>
            </div>
            <i class="fa-solid fa-chevron-right" style="color: #cbd5e1; font-size: 14px;"></i>
          `;
          item.addEventListener('click', () => {
            resultsDrop.style.display = 'none';
            searchInput.value = '';
            // Te lleva a la sección exacta de la carta
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

// ================= VITRINA INDEX (SOLO 4 FAVORITOS Y REDIRECCIÓN) =================
const setupIndexFilters = () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const favoritesGrid = document.getElementById('index-favorites-grid');
    
    if (!filterBtns.length || !favoritesGrid) return; 

    const products = getNorkysProducts() || [];

    const renderFavorites = (category) => {
        favoritesGrid.innerHTML = '';
        let filteredProducts = [];

        if (category === 'todos') {
            // Mix de 4 favoritos principales para la pantalla de inicio
            filteredProducts = [
                products.find(p => p.id === 1), // Pollo a la brasa
                products.find(p => p.id === 4), // Combo Familiar
                products.find(p => p.id === 3), // Parrilla
                products.find(p => p.id === 5)  // Burger
            ].filter(Boolean); 
        } else {
            // Extrae máximo 4 productos de la categoría seleccionada
            filteredProducts = products.filter(p => p.categoria === category).slice(0, 4);
        }

        if (filteredProducts.length === 0) {
            favoritesGrid.innerHTML = '<p style="color:#666; font-size:14px; grid-column: 1 / -1;">Próximamente más productos.</p>';
            return;
        }

        filteredProducts.forEach(prod => {
            const article = document.createElement('article');
            article.className = 'product-card seller-card';
            article.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${prod.img}" alt="${prod.nombre}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="product-placeholder" style="display:none;"><i class="fa-solid fa-bowl-food" style="font-size: 50px; color: #ccc;"></i></div>
                </div>
                <div class="card-info">
                    <h3 class="product-name">${prod.nombre}</h3>
                    <p style="font-weight:900; color:var(--norkys-red); font-size:16px; margin-bottom:15px;">S/ ${prod.precio.toFixed(2)}</p>
                    
                    <button class="btn-ver-detalle" onclick="window.location.href='menu.html#${prod.categoria}'">
                        Ver en la carta
                    </button>
                </div>
            `;
            favoritesGrid.appendChild(article);
        });
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderFavorites(btn.getAttribute('data-filter'));
        });
    });

    renderFavorites('todos');
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderAndCart();
  setupFunctionalSearch();
  setupIndexFilters();

  const closeModalBtn = document.querySelector('.close-modal');
  if(closeModalBtn) {
    closeModalBtn.addEventListener('click', () => document.getElementById('productModal').classList.remove('active'));
  }

  const btnMinus = document.getElementById('btnMinus');
  const btnPlus = document.getElementById('btnPlus');
  const qtyInput = document.getElementById('qtyInput');
  const modalPrice = document.getElementById('modalPrice');

  if(btnMinus && btnPlus) {
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
