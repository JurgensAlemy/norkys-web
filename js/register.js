document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  // --- 1. LÓGICA DEL OJITO (Mostrar/Ocultar Contraseña) ---
  document.querySelectorAll('.toggle-password').forEach(icon => {
      icon.addEventListener('click', function() {
          const input = this.previousElementSibling; // El input está justo antes del icono
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

  // --- 2. VALIDACIONES EN TIEMPO REAL ---
  const inputNombres = document.getElementById('regNombres');
  const inputApellidos = document.getElementById('regApellidos');
  const inputCelular = document.getElementById('regCelular');

  // Función para prohibir números (Solo deja letras y espacios)
  const soloLetras = (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

  if (inputNombres) inputNombres.addEventListener('input', soloLetras);
  if (inputApellidos) inputApellidos.addEventListener('input', soloLetras);

  // Función para prohibir letras y limitar a 9 dígitos
  if (inputCelular) {
      inputCelular.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '').substring(0, 9);
      });
  }

  // --- 3. ENVÍO DEL FORMULARIO ---
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nombres = inputNombres.value.trim();
      const apellidos = inputApellidos.value.trim();
      const correo = document.getElementById('regCorreo').value.trim();
      const celular = inputCelular.value.trim();
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;
      const terms = document.getElementById('regTerms').checked;

      // Validaciones Finales
      if (!terms) {
        if (typeof showNorkysToast === 'function') showNorkysToast("Debes aceptar los Términos y Condiciones", "error");
        else alert("Debes aceptar los Términos y Condiciones");
        return;
      }

      if (celular.length !== 9) {
        if (typeof showNorkysToast === 'function') showNorkysToast("El celular debe tener exactamente 9 dígitos", "error");
        else alert("El celular debe tener exactamente 9 dígitos");
        return;
      }

      if (password !== confirm) {
        if (typeof showNorkysToast === 'function') showNorkysToast("Las contraseñas no coinciden", "error");
        else alert("Las contraseñas no coinciden");
        return;
      }

      const users = JSON.parse(localStorage.getItem('norkys_users')) || [];
      if (users.find(u => u.correo === correo)) {
        if (typeof showNorkysToast === 'function') showNorkysToast("Este correo ya está registrado", "error");
        else alert("Este correo ya está registrado");
        return;
      }

      // Crear y Guardar usuario
      const newUser = { id: Date.now(), nombres, apellidos, correo, celular, password, rol: "cliente", direcciones: [] };
      users.push(newUser);
      localStorage.setItem('norkys_users', JSON.stringify(users));
      
      if (typeof showNorkysToast === 'function') showNorkysToast("¡Cuenta creada exitosamente!", "success");
      else alert("¡Cuenta creada exitosamente!");

      setTimeout(() => window.location.href = 'login.html', 1500);
    });
  }
});