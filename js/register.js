// ================= register.js =================
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = this.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        this.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        this.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });

  const inputNombres = document.getElementById("regNombres");
  const inputApellidos = document.getElementById("regApellidos");
  const inputCelular = document.getElementById("regCelular");

  const soloLetras = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  };
  if (inputNombres) inputNombres.addEventListener("input", soloLetras);
  if (inputApellidos) inputApellidos.addEventListener("input", soloLetras);
  if (inputCelular) {
    inputCelular.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").substring(0, 9);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombres = inputNombres.value.trim();
      const apellidos = inputApellidos.value.trim();
      const correo = document.getElementById("regCorreo").value.trim();
      const celular = inputCelular.value.trim();
      const password = document.getElementById("regPassword").value;
      const confirm = document.getElementById("regConfirm").value;
      const terms = document.getElementById("regTerms").checked;

      if (!terms)
        return showNorkysToast(
          "Debes aceptar los Términos y Condiciones",
          "error",
        );
      if (celular.length !== 9)
        return showNorkysToast("El celular debe tener 9 dígitos", "error");
      if (password !== confirm)
        return showNorkysToast("Las contraseñas no coinciden", "error");

      try {
        await registrarNorkys({
          nombres,
          apellidos,
          correo,
          celular,
          password,
        });
        showNorkysToast("¡Cuenta creada exitosamente!", "success");
        setTimeout(() => (window.location.href = "login.html"), 1500);
      } catch (err) {
        showNorkysToast(err.message || "Error al registrarse", "error");
      }
    });
  }
});
