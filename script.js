function mostrarAlerta() {
  alert("Gracias por tu interés. Nos pondremos en contacto contigo pronto.");
}

document.addEventListener("DOMContentLoaded", function () {
  const banner = document.getElementById("cookie-banner");
  const botonAceptar = document.getElementById("aceptar-cookies");

  if (!localStorage.getItem("cookiesAceptadas")) {
    banner.style.display = "block";
  }

  botonAceptar.addEventListener("click", function () {
    localStorage.setItem("cookiesAceptadas", "true");
    banner.style.display = "none";
  });
});
// ...existing code...

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-registro');
  const mensaje = document.getElementById('mensaje-confirmacion');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      mensaje.style.display = 'block';
      form.reset();
      setTimeout(() => {
        mensaje.style.display = 'none';
      }, 3500);
    });
  }
});
// Agrega esto en script.js
document.getElementById('form-registro').addEventListener('submit', function(e) {
  e.preventDefault();
  const datos = {
    nombre: this.nombre.value,
    email: this.email.value,
    telefono: this.telefono.value,
    empresa: this.empresa.value,
    mensaje: this.mensaje.value
  };
  fetch('http://localhost:3000/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
  .then(res => res.ok ? res.json() : Promise.reject(res))
  .then(data => {
    document.getElementById('mensaje-confirmacion').style.display = 'block';
    this.reset();
    setTimeout(() => {
      document.getElementById('mensaje-confirmacion').style.display = 'none';
    }, 3500);
  })
  .catch(() => alert('Error al registrar usuario.'));
});
// ...existing code...