// Espera a que todo el contenido HTML cargue antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

  // Obtiene el formulario de inicio de sesión
  const loginForm = document.getElementById('loginForm');

  // =====================================================
  // FUNCIÓN: MOSTRAR / OCULTAR CONTRASEÑA
  // =====================================================
  // Recorre todos los íconos de tipo "ojito"
  document.querySelectorAll('.toggle-password').forEach(icon => {

      // Detecta el clic sobre el ícono
      icon.addEventListener('click', function() {

          // Obtiene el input de contraseña asociado
          const input = this.previousElementSibling;

          // Si está oculta, la muestra
          if (input.type === 'password') {
              input.type = 'text';

              // Cambia el ícono visualmente
              this.classList.remove('fa-eye');
              this.classList.add('fa-eye-slash');

          } else {
              // Si está visible, la vuelve a ocultar
              input.type = 'password';

              // Restaura el ícono original
              this.classList.remove('fa-eye-slash');
              this.classList.add('fa-eye');
          }
      });
  });

  // =====================================================
  // EVENTO: ENVÍO DEL FORMULARIO DE LOGIN
  // =====================================================
  if (loginForm) {

    loginForm.addEventListener('submit', (e) => {

      // Evita que la página se recargue
      e.preventDefault();

      // Captura los datos ingresados por el usuario
      const correo = document.getElementById('logCorreo').value.trim();
      const password = document.getElementById('logPassword').value;

      // Obtiene la lista de usuarios almacenados en localStorage
      const users = JSON.parse(localStorage.getItem('norkys_users')) || [];

      // Busca un usuario que coincida con correo y contraseña
      const user = users.find(u => u.correo === correo && u.password === password);

      // =====================================================
      // SI EL USUARIO EXISTE
      // =====================================================
      if (user) {

        // Guarda la sesión actual
        localStorage.setItem('norkys_currentUser', JSON.stringify(user));

        // Muestra mensaje de bienvenida
        if (typeof showNorkysToast === 'function') {
            showNorkysToast(`¡Bienvenido de nuevo, ${user.nombres.split(' ')[0]}!`, "success");
        } else {
            alert(`¡Bienvenido de nuevo, ${user.nombres.split(' ')[0]}!`);
        }

        // Espera 1 segundo antes de redirigir
        setTimeout(() => {

          // Redirige según el rol del usuario
          window.location.href =
            user.rol === 'admin'
              ? 'dashboard.html'
              : 'profile.html';

        }, 1000);

      } else {

        // =====================================================
        // SI LAS CREDENCIALES SON INCORRECTAS
        // =====================================================
        if (typeof showNorkysToast === 'function') {
            showNorkysToast("Correo o contraseña incorrectos", "error");
        } else {
            alert("Correo o contraseña incorrectos");
        }
      }
    });
  }
});
