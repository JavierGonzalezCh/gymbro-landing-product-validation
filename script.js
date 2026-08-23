/* ============================================
   GymBro OS — Landing Page (Beta) — Lógica
   Explorador de funciones, wizard de postulación,
   scroll-reveal y envío del formulario.
   ============================================ */

(function () {
  const tabs = document.querySelectorAll("#feTabs .fe-tab");
  const img = document.getElementById("feImage");
  const fallback = document.getElementById("feFallback");
  const fallbackText = document.getElementById("feFallbackText");
  // Mismo breakpoint que usa el CSS (820px) para pasar de tarjetas horizontales
  // (desktop) a tarjetas apiladas verticalmente (mobile)
  const desktopQuery = window.matchMedia("(min-width: 821px)");

  function imgSrcFor(tabEl) {
    return desktopQuery.matches ? tabEl.dataset.imgDesktop : tabEl.dataset.imgMobile;
  }

  function getActiveTab() {
    return document.querySelector("#feTabs .fe-tab.active") || tabs[0];
  }

  function setImage(tabEl, { animate } = { animate: true }) {
    if (!tabEl) return;
    const newSrc = imgSrcFor(tabEl);
    fallback.style.display = "none";
    if (animate) {
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = newSrc;
        fallbackText.textContent = "Vista previa — " + tabEl.dataset.label;
        img.style.opacity = "1";
      }, 180);
    } else {
      img.src = newSrc;
      fallbackText.textContent = "Vista previa — " + tabEl.dataset.label;
      img.style.opacity = "1";
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      setImage(this);
    });
  });

  // Al cargar la página, aseguramos que la imagen visible corresponda
  // a la variante correcta (mobile/desktop) del tab activo por defecto.
  setImage(getActiveTab(), { animate: false });

  // Si el visitante rota el dispositivo o cambia el tamaño de la ventana
  // cruzando el breakpoint, recargamos la variante de imagen correcta
  // para la tarjeta que esté activa en ese momento (sin animación de fade).
  desktopQuery.addEventListener("change", () => {
    setImage(getActiveTab(), { animate: false });
  });
})();

// ====== CONFIGURACIÓN ======
const WHATSAPP_NUMBER = "573013460118";
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzeRg65ag9MZXYJYk427d05pDzid5iOi75iS7W-nsXtmI7pqIwZMmdisflbtAqfrLWFzw/exec";

// ====== BOTÓN FLOTANTE DE WHATSAPP ======
(function () {
  const waFloat = document.getElementById("waFloat");
  if (!waFloat) return;
  const msg = encodeURIComponent("Hola! Vi la landing de GymBro y quiero más información.");
  waFloat.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
})();

// ====== WIZARD ======
const allSteps = Array.from(document.querySelectorAll(".step"));
const stepsByKey = {};
allSteps.forEach((s) => (stepsByKey[s.dataset.step] = s));
const track = document.getElementById("progressTrack");

let flow = ["1", "2a", "3", "4"]; // se recalcula tras el paso 1 según la rama elegida
let current = 0; // índice dentro de "flow"

function renderProgress() {
  track.innerHTML = "";
  flow.forEach((key, i) => {
    const seg = document.createElement("div");
    seg.className = "seg" + (i <= current ? " done" : "");
    track.appendChild(seg);
  });
}

function showStep(idx) {
  current = Math.max(0, Math.min(idx, flow.length - 1));
  allSteps.forEach((s) => s.classList.remove("active"));
  stepsByKey[flow[current]].classList.add("active");
  renderProgress();
  document.querySelector(".survey-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("surveyForm").addEventListener("click", function (e) {
  if (e.target.matches("[data-next]")) {
    const activeStep = stepsByKey[flow[current]];
    const inputs = activeStep.querySelectorAll("input[required], select[required]");
    for (const inp of inputs) {
      if (!inp.checkValidity()) {
        inp.reportValidity();
        return;
      }
    }
    // Al salir del paso 1, decidimos la rama del paso 2 según si usa software
    if (flow[current] === "1") {
      const usaSoftware = activeStep.querySelector('input[name="q_usa_software"]:checked');
      const rama = usaSoftware && usaSoftware.value === "si" ? "2a" : "2b";
      flow = ["1", rama, "3", "4"];
    }
    showStep(current + 1);
    return;
  }
  if (e.target.matches("[data-back]")) {
    showStep(current - 1);
  }
});
renderProgress();

// Mostrar/ocultar campo de texto cuando se marca "Otro" en dolor principal
const dolorOtroCheck = document.getElementById("dolorOtroCheck");
const dolorOtroInput = document.getElementById("dolorOtroInput");
dolorOtroCheck.addEventListener("change", function () {
  dolorOtroInput.style.display = this.checked ? "block" : "none";
  if (!this.checked) dolorOtroInput.value = "";
});

// ====== MICROINTERACCIÓN DE ENTRADA (scroll-reveal) ======
function setupScrollReveal(selector) {
  const cards = document.querySelectorAll(selector);
  if (!cards.length) return;

  function revealAll() {
    cards.forEach((card) => card.classList.add("in-view"));
  }

  // Si el navegador no soporta IntersectionObserver, mostramos las tarjetas directamente
  if (!("IntersectionObserver" in window)) {
    revealAll();
    return;
  }

  try {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    cards.forEach((card) => observer.observe(card));
  } catch (err) {
    console.warn("Scroll-reveal falló, mostrando tarjetas directamente", err);
    revealAll();
  }

  // Red de seguridad: si por cualquier motivo no se revelaron en 2s, se muestran igual
  setTimeout(revealAll, 2000);
}
setupScrollReveal(".pain-grid .pain-card");
setupScrollReveal(".other-grid .other-card");

// ====== ENVÍO ======
const form = document.getElementById("surveyForm");
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const fd = new FormData(form);
  const hasContactData = fd.get("nombre") || fd.get("gimnasio") || fd.get("email") || fd.get("whatsapp");
  const consentChecked = document.getElementById("consent").checked;
  if (hasContactData && !consentChecked) {
    alert("Ya que dejaste tus datos, necesitamos que aceptes el tratamiento de datos personales (Ley 1581) para poder contactarte.");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  const dolores = fd.getAll("q_dolor");

  const entry = {
    id: "lead_" + Date.now(),
    timestamp: new Date().toISOString(),
    interes_idea: fd.get("q_interes"),
    usa_software: fd.get("q_usa_software"),
    cual_software: fd.get("q_cual_software") || "",
    cuanto_paga: fd.get("q_cuanto_paga") || "",
    satisfaccion_actual: fd.get("q_satisfaccion") || "",
    precio_justo: fd.get("q_precio_justo") || "",
    precio_caro: fd.get("q_precio_caro") || "",
    dolores: dolores,
    dolor_otro: fd.get("q_dolor_otro") || "",
    probabilidad_uso: fd.get("q_probabilidad"),
    tamano_gimnasio: fd.get("q_tamano"),
    comentario: fd.get("q_comentario") || "",
    nombre: fd.get("nombre") || "",
    gimnasio: fd.get("gimnasio") || "",
    email: fd.get("email") || "",
    whatsapp: fd.get("whatsapp") || "",
    consentimiento_ley1581: !!hasContactData,
    fuente: "landing-v6-beta",
  };

  try {
    const existing = JSON.parse(localStorage.getItem("gymbro_leads") || "[]");
    existing.push(entry);
    localStorage.setItem("gymbro_leads", JSON.stringify(existing));
  } catch (err) {
    console.error("No se pudo guardar localmente", err);
  }

  if (WEBHOOK_URL) {
    try {
      // mode:'no-cors' es necesario para Google Apps Script (no responde con
      // headers CORS). No podemos leer la respuesta, pero el envío sí llega.
      // Content-Type 'text/plain' evita que el navegador dispare un preflight
      // OPTIONS que Apps Script no maneja bien.
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.warn("Webhook falló, el dato quedó guardado localmente", err);
    }
  }

  document.getElementById("tyName").textContent = entry.nombre ? `, ${entry.nombre.split(" ")[0]}` : "";
  const waMsg = encodeURIComponent(
    entry.nombre
      ? `Hola! Soy ${entry.nombre}${entry.gimnasio ? " de " + entry.gimnasio : ""}. Respondí la encuesta de GymBro y quiero más información sobre la Beta.`
      : `Hola! Respondí la encuesta de GymBro y quiero más información sobre la Beta.`,
  );
  document.getElementById("waBtn").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

  document.querySelector(".progress-track").style.display = "none";
  form.style.display = "none";
  document.getElementById("thankyou").style.display = "block";
});
