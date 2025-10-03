export async function traducirAEspanol(texto) {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=es|en`
  );

  if (!res.ok) throw new Error("Error en la API");

  const data = await res.json();
  return data.responseData.translatedText;
}

