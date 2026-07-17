const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzigbcoIS84-LP31RtTKa9AvgASrukUYms5dtHw4ofHl_FRzXbHz5pAHDmBUyp7dsh8/exec";

const readerId = "reader";
const mensaje = document.getElementById("mensaje");
const btnCamara = document.getElementById("btnCamara");
const btnOtro = document.getElementById("btnOtro");

let lector = null;
let procesando = false;

btnCamara.addEventListener("click", iniciarCamara);
btnOtro.addEventListener("click", () => window.location.reload());

async function iniciarCamara() {
  btnCamara.disabled = true;
  mensaje.textContent = "Abriendo cámara...";

  lector = new Html5Qrcode(readerId);

  try {
    await lector.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        }
      },
      codigoLeido,
      () => {}
    );

    mensaje.textContent = "Apunte la cámara al código QR.";
    btnCamara.hidden = true;

  } catch (error) {
    console.error(error);

    mensaje.textContent =
      "No se pudo abrir la cámara. Revise los permisos del navegador.";

    btnCamara.disabled = false;
  }
}

async function codigoLeido(texto) {
  if (procesando) {
    return;
  }

  procesando = true;

  const codigo = extraerCodigo(texto);

  if (!codigo) {
    mensaje.textContent = "El código QR no es válido.";
    procesando = false;
    return;
  }

  mensaje.textContent = "Registrando asistencia...";

  try {
    if (lector) {
      await lector.stop();
      lector.clear();
    }
  } catch (error) {
    console.warn("No se pudo detener el lector:", error);
  }

  window.location.href =
    APPS_SCRIPT_URL + "?id=" + encodeURIComponent(codigo);
}

function extraerCodigo(texto) {
  const valor = String(texto || "").trim();

  if (/^FIH\d+$/i.test(valor)) {
    return valor.toUpperCase();
  }

  try {
    const datos = JSON.parse(valor);

    if (datos.id) {
      return String(datos.id).trim().toUpperCase();
    }
  } catch (error) {
    // No era JSON.
  }

  return null;
}
