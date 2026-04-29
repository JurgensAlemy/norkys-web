 // ================= BASE DE DATOS LOCAL FUNCIONAL DE NORKY'S =================

// Función principal que inicializa toda la base de datos local
const initNorkysDB = () => {

  // ============================================================
  // 1. CARGA DE PRODUCTOS PREDETERMINADOS
  // Se cargan directamente en localStorage cada vez que inicia
  // ============================================================
  const defaultProducts = [

    // ================= POLLOS =================
    { id: 1, nombre: "1 Pollo a la Brasa", desc: "Pollo entero, papas familiares, ensalada fresca, cremas.", precio: 75.90, categoria: "pollos", img: "imgs/1 Pollo a la Brasa.webp" },
    { id: 2, nombre: "1/2 Pollo a la Brasa", desc: "Medio pollo, papas medianas, ensalada.", precio: 45.90, categoria: "pollos", img: "imgs/MedioPollo.webp" },
    { id: 9, nombre: "1/4 Pollo a la Brasa", desc: "Cuarto de pollo, porción de papas, ensalada clásica.", precio: 26.90, categoria: "pollos", img: "imgs/UnCuartoPollo.webp" },
    { id: 10, nombre: "Promoción 2 Pollos", desc: "2 Pollos enteros, doble porción de papas familiares, ensalada gigante.", precio: 139.90, categoria: "pollos", img: "imgs/DosPollos.webp" },
    { id: 11, nombre: "1/8 Pollo a la Brasa", desc: "Octavo de pollo, porción personal de papas, cremas.", precio: 15.90, categoria: "pollos", img: "imgs/UnOctavoPollo.webp" },

    // ================= PARRILLAS =================
    { id: 3, nombre: "Parrilla Mixta Personal", desc: "Bife, chuleta, chorizo, pollo, papas y ensalada.", precio: 85.00, categoria: "parrillas", img: "imgs/ParrillaMixta.webp" },
    { id: 12, nombre: "Bife Ancho a la Parrilla", desc: "Corte premium de bife ancho, papas doradas, chimichurri.", precio: 65.90, categoria: "parrillas", img: "imgs/BifeAncho.webp" },
    { id: 13, nombre: "Chuleta de Cerdo", desc: "Doble chuleta de cerdo a la parrilla, ensalada cocida, papas.", precio: 42.50, categoria: "parrillas", img: "imgs/ChuletaCerdo.webp" },
    { id: 14, nombre: "Medio Pollo Parrillero", desc: "Medio pollo deshuesado a la parrilla, papas, ensalada.", precio: 50.90, categoria: "parrillas", img: "imgs/PolloParrillero.webp" },
    { id: 15, nombre: "Parrillada Familiar", desc: "2 Bifes, 2 chuletas, 4 chorizos, medio pollo, anticuchos.", precio: 145.00, categoria: "parrillas", img: "imgs/ParrilladaFamiliar.webp" },

    // ================= COMBOS =================
    { id: 4, nombre: "Mega Combo Familiar", desc: "1 Pollo + Porción de Papas + Ensalada + Jarra Chicha 1L.", precio: 89.90, categoria: "combos", img: "imgs/MegaComboFamiliar.webp" },
    { id: 16, nombre: "Combo Pareja", desc: "1/2 Pollo a la brasa + Papas + Ensalada + 2 Gaseosas.", precio: 55.90, categoria: "combos", img: "imgs/ComboPareja.webp" },
    { id: 17, nombre: "Combo Anticuchero", desc: "1/4 Pollo + 2 Palitos Anticucho + Papas + Gaseosa.", precio: 38.90, categoria: "combos", img: "imgs/ComboAnticuchera.webp" },
    { id: 18, nombre: "Combo Chaufa", desc: "1/4 Pollo + Porción Arroz Chaufa + Gaseosa.", precio: 34.90, categoria: "combos", img: "imgs/ComboChaufa.webp" },
    { id: 53, nombre: "Combo Trío", desc: "3/4 Pollo + Papas Grandes + Ensalada + Gaseosa 1.5L.", precio: 65.00, categoria: "combos", img: "imgs/ComboTrio.webp" },

    // ================= HAMBURGUESAS =================
    { id: 5, nombre: "Hamburguesa Royal", desc: "Carne, huevo, queso, tocino, lechuga y papas.", precio: 22.90, categoria: "hamburguesas", img: "imgs/Hamburguesa.webp" },
    { id: 19, nombre: "Hamburguesa Clásica", desc: "Carne artesanal, lechuga, tomate, papas fritas.", precio: 16.90, categoria: "hamburguesas", img: "imgs/HamburguesaClasica.webp" },
    { id: 20, nombre: "Hamburguesa a lo Pobre", desc: "Carne, plátano frito, huevo frito, papas al hilo.", precio: 24.90, categoria: "hamburguesas", img: "imgs/HamburguesaPobre.webp" },
    { id: 21, nombre: "Doble Queso Bacon", desc: "Doble carne, queso cheddar, doble tocino, salsa especial.", precio: 28.90, categoria: "hamburguesas", img: "imgs/HamburguesaDobleQueso.webp" },
    { id: 63, nombre: "Burger Parrillera", desc: "Carne a la parrilla, chorizo en rodajas, chimichurri.", precio: 25.00, categoria: "hamburguesas", img: "imgs/HamburguesaParrillera.webp" },

    // ================= BEBIDAS =================
    { id: 6, nombre: "Jarra de Chicha Morada 1L", desc: "Preparada en casa, bien helada.", precio: 14.90, categoria: "bebidas", img: "imgs/Jarra de Chicha Morada 1L.webp" },
    { id: 22, nombre: "Gaseosa Inca Kola 1.5L", desc: "Gaseosa familiar helada.", precio: 11.00, categoria: "bebidas", img: "imgs/Gaseosa Inca Kola 1.5L.webp" },
    { id: 23, nombre: "Gaseosa Coca Cola 1.5L", desc: "Gaseosa familiar helada.", precio: 11.00, categoria: "bebidas", img: "imgs/Gaseosa Coca Cola 1.5L.webp" },
    { id: 24, nombre: "Limonada Frozen 1L", desc: "Jarra de limonada frozen recién preparada.", precio: 16.90, categoria: "bebidas", img: "imgs/Limonada Frozen 1L.webp" },
    { id: 25, nombre: "Gaseosa Personal 500ml", desc: "A elección: Inca Kola o Coca Cola.", precio: 5.50, categoria: "bebidas", img: "imgs/Gaseosa Personal 500ml.webp" },

    // ================= POSTRES =================
    { id: 7, nombre: "Torta de Chocolate", desc: "Porción de torta húmeda de chocolate con fudge.", precio: 12.00, categoria: "postres", img: "imgs/Torta de Chocolate.webp" },

    // ================= PORCIONES =================
    { id: 8, nombre: "Porción de Tequeños", desc: "8 unidades rellenos de queso con guacamole.", precio: 15.90, categoria: "porciones", img: "imgs/Porción de Tequeños.webp" }
  ];

  // Guardar productos en localStorage
  localStorage.setItem('norkys_products', JSON.stringify(defaultProducts));

  // ============================================================
  // 2. CREACIÓN DEL CARRITO
  // Se inicializa vacío si no existe
  // ============================================================
  if (!localStorage.getItem('norkys_cart')) {
    localStorage.setItem('norkys_cart', JSON.stringify([]));
  }

  // ============================================================
  // 3. CREACIÓN DE USUARIOS PREDETERMINADOS
  // Solo se crean si aún no existen
  // ============================================================
  if (!localStorage.getItem('norkys_users')) {
    const defaultUsers = [

      // Usuario cliente de prueba
      { 
        id: 1,
        nombres: "Jeremy",
        apellidos: "Kalheb",
        correo: "jeremy@ejemplo.com",
        celular: "999808501",
        password: "123",
        rol: "cliente"
      },

      // Usuario administrador
      { 
        id: 2,
        nombres: "Admin",
        apellidos: "Norkys",
        correo: "admin@norkys.pe",
        celular: "999999999",
        password: "admin",
        rol: "admin"
      }
    ];

    // Guardar usuarios
    localStorage.setItem('norkys_users', JSON.stringify(defaultUsers));
  }
};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

// Obtener todos los productos
const getNorkysProducts = () => JSON.parse(localStorage.getItem('norkys_products'));

// Obtener carrito actual
const getNorkysCart = () => JSON.parse(localStorage.getItem('norkys_cart'));

// Obtener usuario logueado
const getCurrentUser = () => JSON.parse(localStorage.getItem('norkys_currentUser'));

// Cerrar sesión
const logNorkysOut = () => {
  localStorage.removeItem('norkys_currentUser');
  window.location.href = 'index.html';
};

// Inicializar la base de datos local al cargar
initNorkysDB();
