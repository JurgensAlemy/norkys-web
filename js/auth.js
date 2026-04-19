// --- SISTEMA DE TOAST (Notificaciones) ---
function showToast(msg, tipo = "success") {
  const cont = document.getElementById("toast-container");
  if (!cont) return;
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.style.background = tipo === "error" ? "#d32f2f" : "#27ae60";
  toast.style.color = "white";
  toast.style.padding = "15px 20px";
  toast.style.borderRadius = "8px";
  toast.style.marginTop = "10px";
  toast.style.fontWeight = "bold";
  toast.innerText = msg;
  cont.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function limpiarErrores() {
  document.querySelectorAll('.error-msg').forEach(el => el.innerText = "");
}

// --- FUNCIÓN PARA OBTENER LA "BASE DE DATOS" DE USUARIOS ---
function obtenerUsuarios() {
  const usuariosGuardados = localStorage.getItem("norkys_bd_usuarios");
  return usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
}

// --- LÓGICA DE REGISTRO ---
function register() {
  limpiarErrores();
  const name = document.getElementById("rname").value.trim();
  const email = document.getElementById("ruser").value.trim().toLowerCase();
  const pass = document.getElementById("rpass").value.trim();
  let valido = true;

  // Validaciones básicas
  if(name.length < 3) { document.getElementById("err-rname").innerText = "Ingresa tu nombre completo"; valido = false; }
  if(!email.includes("@")) { document.getElementById("err-ruser").innerText = "Correo no válido"; valido = false; }
  if(pass.length < 6) { document.getElementById("err-rpass").innerText = "Mínimo 6 caracteres"; valido = false; }

  if(!valido) {
    showToast("Por favor, corrige los errores", "error");
    return;
  }

  // Verificar si el correo ya está registrado en nuestra "BD"
  let usuarios = obtenerUsuarios();
  let usuarioExistente = usuarios.find(u => u.email === email);

  if(usuarioExistente) {
    document.getElementById("err-ruser").innerText = "Este correo ya está registrado";
    showToast("El usuario ya existe", "error");
    return;
  }

  // Crear el nuevo registro de usuario
  const nuevoUsuario = {
    nombre: name,
    email: email,
    password: pass // En un proyecto real esto iría encriptado
  };

  // Guardar en el arreglo y enviarlo al localStorage
  usuarios.push(nuevoUsuario);
  localStorage.setItem("norkys_bd_usuarios", JSON.stringify(usuarios));

  // Auto-iniciar sesión con la nueva cuenta
  localStorage.setItem("usuarioNorkys", name);
  localStorage.setItem("correoNorkys", email);

  showToast("¡Cuenta creada con éxito!");
  
  // Redirigir al inicio
  setTimeout(() => window.location.href = "index.html", 1500);
}

// --- LÓGICA DE LOGIN ---
function login() {
  limpiarErrores();
  const email = document.getElementById("user").value.trim().toLowerCase();
  const pass = document.getElementById("pass").value.trim();
  let valido = true;

  if(!email) { document.getElementById("err-user").innerText = "Ingresa tu correo"; valido = false; }
  if(!pass) { document.getElementById("err-pass").innerText = "Ingresa tu contraseña"; valido = false; }

  if(!valido) {
    showToast("Revisa los datos ingresados", "error");
    return;
  }

  // Traer la lista de usuarios y buscar coincidencias
  let usuarios = obtenerUsuarios();
  let usuarioEncontrado = usuarios.find(u => u.email === email && u.password === pass);

  if(usuarioEncontrado) {
    // Si coincide correo y contraseña, iniciamos sesión
    localStorage.setItem("usuarioNorkys", usuarioEncontrado.nombre);
    localStorage.setItem("correoNorkys", usuarioEncontrado.email);
    
    showToast(`¡Bienvenido de vuelta, ${usuarioEncontrado.nombre.split(" ")[0]}!`);
    
    setTimeout(() => window.location.href = "index.html", 1500);
  } else {
    // Si no coincide, mostramos error genérico por seguridad
    showToast("Correo o contraseña incorrectos", "error");
    document.getElementById("err-pass").innerText = "Credenciales inválidas";
  }
}