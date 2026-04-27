document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  // --- LÓGICA DEL OJITO (Mostrar/Ocultar Contraseña) EN LOGIN ---
  document.querySelectorAll('.toggle-password').forEach(icon => {
      icon.addEventListener('click', function() {
          const input = this.previousElementSibling;
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

  // --- ENVÍO DEL FORMULARIO DE LOGIN ---
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const correo = document.getElementById('logCorreo').value.trim();
      const password = document.getElementById('logPassword').value;

      const users = JSON.parse(localStorage.getItem('norkys_users')) || [];
      const user = users.find(u => u.correo === correo && u.password === password);

      if (user) {
        localStorage.setItem('norkys_currentUser', JSON.stringify(user));
        
        if (typeof showNorkysToast === 'function') {
            showNorkysToast(`¡Bienvenido de nuevo, ${user.nombres.split(' ')[0]}!`, "success");
        } else {
            alert(`¡Bienvenido de nuevo, ${user.nombres.split(' ')[0]}!`);
        }

        setTimeout(() => {
          // Redirigir según el rol
          window.location.href = user.rol === 'admin' ? 'dashboard.html' : 'profile.html';
        }, 1000);
      } else {
        if (typeof showNorkysToast === 'function') {
            showNorkysToast("Correo o contraseña incorrectos", "error");
        } else {
            alert("Correo o contraseña incorrectos");
        }
      }
    });
  }
});
