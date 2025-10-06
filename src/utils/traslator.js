// export async function traducirAEspanol(texto) {
//   const res = await fetch(
//     `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=es|en`
//   );

//   if (!res.ok) throw new Error("Error en la API");

//   const data = await res.json();
//   return data.responseData.translatedText;
// }

function limpiarTexto(texto) {
  return texto
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")   // comillas simples curvas → rectas
    .replace(/[\u201C\u201D]/g, '"')   // comillas dobles curvas → rectas
    .replace(/[^\x00-\x7F]/g, "");     // elimina símbolos no soportados por jsPDF
}

export async function traducirAEspanol(texto) {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=es|en`
  );

  if (!res.ok) throw new Error("Error en la API");

  const data = await res.json();
  return limpiarTexto(data.responseData.translatedText);
}

