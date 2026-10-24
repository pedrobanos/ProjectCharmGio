// Utilidades compartidas para anuncios (Vinted / Wallapop)

// Colores de marca aproximados
export const PLATFORM_STYLES = {
  Vinted: { bg: "#007782", text: "#ffffff", letter: "V", light: "#e6f4f5" },
  Wallapop: { bg: "#13C1AC", text: "#ffffff", letter: "w", light: "#e7f9f6" },
};

// Temáticas para filtrar anuncios. Se buscan (como palabras) en el nombre y la descripción
// del producto. Añade aquí temáticas o palabras nuevas cuando quieras.
export const TEMATICAS = [
  {
    key: "disney",
    label: "Disney 🐭",
    words: ["disney", "mickey", "minnie", "stitch", "frozen", "elsa", "olaf", "winnie", "pooh", "dumbo",
      "bambi", "simba", "nemo", "dory", "toy story", "buzz", "woody", "pluto", "goofy", "donald", "daisy",
      "lilo", "pinocho", "peter pan", "campanilla", "aladdin", "genio", "marie", "aristogatos"],
  },
  {
    key: "marvel",
    label: "Marvel 🦸",
    words: ["marvel", "spiderman", "spider", "araña", "iron man", "ironman", "hulk", "thor", "capitan america",
      "avengers", "vengadores", "venom", "deadpool", "groot", "loki", "thanos", "black panther", "viuda negra",
      "batman", "superman", "wonder woman"],
  },
  {
    key: "princesas",
    label: "Princesas 👑",
    words: ["princes", "ariel", "sirenita", "bella", "cenicienta", "rapunzel", "blancanieves", "jasmine",
      "aurora", "mulan", "moana", "vaiana", "tiana", "corona", "tiara"],
  },
  {
    key: "animales",
    label: "Animales 🐾",
    words: ["animal", "perro", "perrito", "gato", "gatito", "huella", "pata", "mariposa", "pajaro", "buho",
      "caballo", "oso", "conejo", "elefante", "delfin", "tortuga", "pez", "leon", "tigre", "unicornio",
      "panda", "zorro", "abeja", "mariquita", "pinguino", "ballena", "koala"],
  },
  {
    key: "viajes",
    label: "Viajes ✈️",
    words: ["viaje", "avion", "maleta", "torre eiffel", "eiffel", "paris", "londres", "london", "nueva york",
      "new york", "roma", "globo", "brujula", "mapa", "barco", "tren", "playa", "mundo", "bandera"],
  },
  {
    key: "amor",
    label: "Amor ❤️",
    words: ["corazon", "amor", "love", "beso", "infinito", "san valentin", "pareja"],
  },
  {
    key: "letras",
    label: "Letras 🔤",
    words: ["letra", "inicial", "numero", "abecedario"],
  },
  {
    key: "familia",
    label: "Familia 👨‍👩‍👧",
    words: ["mama", "papa", "madre", "padre", "abuela", "abuelo", "hermana", "hermano", "hija", "hijo",
      "familia", "bebe", "amiga", "amigas"],
  },
  {
    key: "navidad",
    label: "Navidad 🎄",
    words: ["navidad", "papa noel", "reno", "arbol de navidad", "copo", "nieve", "regalo", "muñeco de nieve"],
  },
  {
    key: "magia",
    label: "Magia ✨",
    words: ["harry potter", "hogwarts", "varita", "estrella", "luna", "sol", "magia", "hada", "trebol",
      "suerte", "angel", "ala"],
  },
];

// ¿El texto (ya normalizado: minúsculas y sin tildes) contiene la palabra?
// Palabras cortas (≤ 4 letras) deben ir completas ("sol" no encaja en "solitario");
// las largas valen como inicio de palabra ("princes" → "princesa", "animal" → "animales").
const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const textHasWord = (normalizedText, normalizedWord) => {
  if (!normalizedWord) return false;
  const w = escapeRe(normalizedWord);
  const end = normalizedWord.length <= 4 ? "(?:s|es)?(?![a-z0-9])" : "";
  return new RegExp(`(?:^|[^a-z0-9])${w}${end}`).test(normalizedText);
};

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
