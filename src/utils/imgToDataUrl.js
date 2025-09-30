// utils/imgToDataUrl.js
export async function urlToDataUrl(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // data:image/...;base64,....
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("No se pudo convertir la imagen a base64:", url, e);
    return null; // seguimos sin foto
  }
}

export async function withFotosBase64(rows, fotoKey = "foto") {
  return Promise.all(
    rows.map(async (r) => ({
      ...r,
      fotoBase64: r[fotoKey] ? await urlToDataUrl(r[fotoKey]) : null,
    }))
  );
}

export function getFormatFromDataUrl(dataUrl) {
  const m = /^data:image\/(png|jpeg|jpg)/i.exec(dataUrl || "");
  if (!m) return "JPEG";
  const fmt = m[1].toUpperCase();
  return fmt === "JPG" ? "JPEG" : fmt; // jsPDF usa 'JPEG' o 'PNG'
}
