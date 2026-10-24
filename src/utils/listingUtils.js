// Utilidades compartidas para anuncios (Vinted / Wallapop)

// Colores de marca aproximados
export const PLATFORM_STYLES = {
  Vinted: { bg: "#007782", text: "#ffffff", letter: "V", light: "#e6f4f5" },
  Wallapop: { bg: "#13C1AC", text: "#ffffff", letter: "w", light: "#e7f9f6" },
};

// Temáticas para filtrar anuncios. Se buscan en el nombre, la descripción y el lugar
// (salen de los expositores temáticos de LugaresDisponibles). Añade aquí las que quieras.
export const TEMATICAS = [
  { key: "disney", label: "Disney 🐭", words: ["disney"] },
  { key: "marvel", label: "Marvel", words: ["marvel"] },
  { key: "princesas", label: "Princesas 👑", words: ["princes"] },
  { key: "animales", label: "Animales 🐾", words: ["animal"] },
  { key: "viajes", label: "Viajes ✈️", words: ["viaje"] },
];

// Copia texto al portapapeles. Usa la API moderna y, si no está disponible
// (p. ej. abriendo la app por http en la red local), un textarea oculto.
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // seguimos con el método alternativo
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.fontSize = "16px"; // evita el zoom automático en iOS
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

// Precio en formato español sin símbolo: 3 -> "3", 3.5 -> "3,5", 3.25 -> "3,25"
export const formatPrecioAnuncio = (precio) => {
  const n = Number(precio);
  if (precio == null || precio === "" || isNaN(n)) return "";
  return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};
