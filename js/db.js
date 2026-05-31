// ================= DB.JS — Norky's API Client =================
// Todos los datos ahora vienen del backend Spring Boot
// URL base del backend
const API_URL = 'http://localhost:8080/api';

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
    const res = await fetch(url);
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
    const res = await fetch(`${API_URL}/productos/buscar?q=${encodeURIComponent(query)}`);
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
  const res = await fetch(`${API_URL}/auth/login`, {
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
  const res = await fetch(`${API_URL}/auth/registro`, {
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
const crearPedido = async (direccion) => {
  const user = getCurrentUser();
  const cart = getNorkysCart();

  if (!user || cart.length === 0) throw new Error('Sin usuario o carrito vacío');

  const res = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuarioId: user.id,
      direccionEntrega: direccion,
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
    const res = await fetch(`${API_URL}/pedidos/usuario/${user.id}`);
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