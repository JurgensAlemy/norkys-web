// ================= DB.JS — Norky's API Client =================
// Todos los datos ahora vienen del backend Spring Boot
// URL base del backend
const API_URL = 'https://norkys-web-backend-production.up.railway.app/api';

// ============================================================
// MANEJO DE ERRORES DE CONEXIÓN
// ============================================================
const fetchConManejo = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    // Esto se dispara cuando el backend está apagado o no hay red
    mostrarErrorConexion();
    throw new Error('No se pudo conectar con el servidor. Verifica que el sistema esté disponible.');
  }
};

let _errorConexionMostrado = false;
const mostrarErrorConexion = () => {
  if (_errorConexionMostrado) return; // evita espamear el mismo aviso varias veces
  _errorConexionMostrado = true;

  const banner = document.createElement('div');
  banner.id = 'bannerErrorConexion';
  banner.style.cssText = `
    position:fixed;top:0;left:0;right:0;z-index:99999;
    background:#b91c1c;color:#fff;text-align:center;
    padding:12px 16px;font-family:'Plus Jakarta Sans',sans-serif;
    font-size:13px;font-weight:700;
    display:flex;align-items:center;justify-content:center;gap:10px;
  `;
  banner.innerHTML = `
    <i class="fa-solid fa-triangle-exclamation"></i>
    No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.
    <button onclick="document.getElementById('bannerErrorConexion').remove(); window._errorConexionMostrado=false;"
      style="background:none;border:1px solid #fff;color:#fff;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:11px;font-weight:700;margin-left:8px;">
      Cerrar
    </button>`;
  document.body.prepend(banner);

  setTimeout(() => {
    banner.remove();
    _errorConexionMostrado = false;
  }, 8000);
};

// ============================================================
// INICIALIZACIÓN — ya no necesita localStorage para productos/usuarios
// Solo inicializa el carrito si no existe
// ============================================================
const initNorkysDB = () => {
  if (!localStorage.getItem('norkys_cart')) {
    localStorage.setItem('norkys_cart', JSON.stringify([]));
  }
};

// ============================================================
// PRODUCTOS — desde la API
// ============================================================

// Obtener todos los productos (async)
const getNorkysProducts = async (categoria = null) => {
  try {
    const url = categoria
      ? `${API_URL}/productos?categoria=${categoria}`
      : `${API_URL}/productos`;
    const res = await fetchConManejo(url);
    if (!res.ok) throw new Error('Error al obtener productos');
    const data = await res.json();
    // Mapear imgUrl → img para compatibilidad con el frontend existente
    return data.map(p => ({ ...p, img: p.imgUrl }));
  } catch (err) {
    console.error('[db.js] getNorkysProducts:', err);
    return [];
  }
};

// Buscar productos por nombre
const buscarProductos = async (query) => {
  try {
    const res = await fetchConManejo(`${API_URL}/productos/buscar?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.map(p => ({ ...p, img: p.imgUrl }));
  } catch (err) {
    console.error('[db.js] buscarProductos:', err);
    return [];
  }
};

// ============================================================
// CARRITO — sigue en localStorage (sin cambios)
// ============================================================
const getNorkysCart = () => JSON.parse(localStorage.getItem('norkys_cart')) || [];

// ============================================================
// AUTENTICACIÓN — desde la API
// ============================================================

// Login contra el backend
const loginNorkys = async (correo, password) => {
  const res = await fetchConManejo(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password })
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
  const user = await res.json();
  // Guardar en localStorage para que el resto del frontend lo lea igual que antes
  localStorage.setItem('norkys_currentUser', JSON.stringify(user));
  return user;
};

// Registro contra el backend
const registrarNorkys = async (datos) => {
  const res = await fetchConManejo(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
  return await res.json();
};

// ===== NUEVO: recuperación de contraseña =====
const solicitarRecuperacionPassword = async (correo) => {
  const res = await fetchConManejo(`${API_URL}/auth/recuperar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || 'No se pudo procesar la solicitud'));
  return data; // { mensaje, codigoDemo }
};

const restablecerPassword = async (correo, codigo, nuevaPassword) => {
  const res = await fetchConManejo(`${API_URL}/auth/restablecer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, codigo, nuevaPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || 'No se pudo restablecer la contraseña'));
  return data;
};

// Obtener usuario logueado (sigue desde localStorage — igual que antes)
const getCurrentUser = () => JSON.parse(localStorage.getItem('norkys_currentUser'));

// Cerrar sesión
const logNorkysOut = () => {
  localStorage.removeItem('norkys_currentUser');
  window.location.href = 'index.html';
};

// ============================================================
// PEDIDOS — desde la API
// ============================================================

// Crear pedido en el backend
// metodoPago: "Efectivo" (por defecto) | "Yape" | "Plin" | "Tarjeta"
const crearPedido = async (direccion, metodoPago = 'Efectivo') => {
  const user = getCurrentUser();
  const cart = getNorkysCart();

  if (!user || cart.length === 0) throw new Error('Sin usuario o carrito vacío');

  const res = await fetchConManejo(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuarioId: user.id,
      direccionEntrega: direccion,
      metodoPago: metodoPago,
      items: cart.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad
      }))
    })
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }

  // Limpiar carrito tras pedido exitoso
  localStorage.setItem('norkys_cart', JSON.stringify([]));
  return await res.json();
};

// Obtener pedidos del usuario actual
const getPedidosUsuario = async () => {
  const user = getCurrentUser();
  if (!user) return [];
  try {
    const res = await fetchConManejo(`${API_URL}/pedidos/usuario/${user.id}`);
    return await res.json();
  } catch (err) {
    console.error('[db.js] getPedidosUsuario:', err);
    return [];
  }
};

// ============================================================
// INICIALIZAR
// ============================================================
initNorkysDB();
