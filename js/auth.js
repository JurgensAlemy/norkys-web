// ================= auth.js — Login =================
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  // Mostrar / ocultar contraseña
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function () {
      const input = this.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        this.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        this.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const correo = document.getElementById('logCorreo').value.trim();
      const password = document.getElementById('logPassword').value;

      try {
        const user = await loginNorkys(correo, password);  // db.js → API

        if (typeof showNorkysToast === 'function') {
          showNorkysToast(`¡Bienvenido de nuevo, ${user.nombres.split(' ')[0]}!`, 'success');
        }

        setTimeout(() => {
          window.location.href = user.rol === 'admin' ? 'dashboard.html' : 'profile.html';
        }, 1000);

      } catch (err) {
        if (typeof showNorkysToast === 'function') {
          showNorkysToast(err.message || 'Correo o contraseña incorrectos', 'error');
        }
      }
    });
  }
});