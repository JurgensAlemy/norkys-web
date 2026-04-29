document.addEventListener('DOMContentLoaded', () => {
  // Obtener el formulario de registro
  const registerForm = document.getElementById('registerForm');

  // ================= MOSTRAR / OCULTAR CONTRASEÑA =================
  document.querySelectorAll('.toggle-password').forEach(icon => {
      icon.addEventListener('click', function() {
          const input = this.previousElementSibling; // Input asociado al ícono

          // Cambiar entre mostrar y ocultar contraseña
          if (input.type === 'password') {
              input.type = 'text';
              this.classList.remove('fa-eye');
              this.classList.add('fa-eye-slash');
          } else {
              input.type = 'password';
              this.classList.remove('fa-eye-slash');
              this.classList.add('fa-eye');
          }
      });
  });

  // ================= VALIDACIONES EN TIEMPO REAL =================
  const inputNombres = document.getElementById('regNombres');
  const inputApellidos = document.getElementById('regApellidos');
  const inputCelular = document.getElementById('regCelular');

  // Permitir solo letras y espacios en nombres/apellidos
  const soloLetras = (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

  if (inputNombres) inputNombres.addEventListener('input', soloLetras);
  if (inputApellidos) inputApellidos.addEventListener('input', soloLetras);

  // Permitir solo números y máximo 9 dígitos en celular
  if (inputCelular) {
      inputCelular.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '').substring(0, 9);
      });
  }

  // ================= ENVÍO DEL FORMULARIO =================
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Evitar recarga de página
      
      // Capturar valores ingresados
      const nombres = inputNombres.value.trim();
      const apellidos = inputApellidos.value.trim();
      const correo = document.getElementById('regCorreo').value.trim();
      const celular = inputCelular.value.trim();
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;
      const terms = document.getElementById('regTerms').checked;

      // ================= VALIDACIONES =================

      // Validar aceptación de términos
      if (!terms) {
        if (typeof showNorkysToast === 'function') 
          showNorkysToast("Debes aceptar los Términos y Condiciones", "error");
        else 
          alert("Debes aceptar los Términos y Condiciones");
        return;
      }

      // Validar longitud del celular
      if (celular.length !== 9) {
        if (typeof showNorkysToast === 'function') 
          showNorkysToast("El celular debe tener exactamente 9 dígitos", "error");
        else 
          alert("El celular debe tener exactamente 9 dígitos");
        return;
      }

      // Validar coincidencia de contraseñas
      if (password !== confirm) {
        if (typeof showNorkysToast === 'function') 
          showNorkysToast("Las contraseñas no coinciden", "error");
        else 
          alert("Las contraseñas no coinciden");
        return;
      }

      // Obtener usuarios guardados
      const users = JSON.parse(localStorage.getItem('norkys_users')) || [];

      // Validar correo único
      if (users.find(u => u.correo === correo)) {
        if (typeof showNorkysToast === 'function') 
          showNorkysToast("Este correo ya está registrado", "error");
        else 
          alert("Este correo ya está registrado");
        return;
      }

      // ================= CREAR NUEVO USUARIO =================
      const newUser = {
        id: Date.now(), // ID único
        nombres,
        apellidos,
        correo,
        celular,
        password,
        rol: "cliente",
        direcciones: []
      };

      // Guardar usuario
      users.push(newUser);
      localStorage.setItem('norkys_users', JSON.stringify(users));

      // Notificación de éxito
      if (typeof showNorkysToast === 'function') 
        showNorkysToast("¡Cuenta creada exitosamente!", "success");
      else 
        alert("¡Cuenta creada exitosamente!");

      // Redirigir al login
      setTimeout(() => window.location.href = 'login.html', 1500);
    });
  }
});
