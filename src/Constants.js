

export const diaMadridYYYYMMDD = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);




export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // meses van 0-11
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}  ${hours}:${mins}`;
};


export const formatCurrency = (value) => {
  if (value == null || isNaN(Number(value))) return "-";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(value));
}

export const normalizeString = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")                // separa letra + diacrítico
    .replace(/[\u0300-\u036f]/g, "") // quita tildes, diéresis...
    .toLowerCase();
  // Si quieres tratar ñ == n, descomenta la siguiente línea:
  // .replace(/ñ/g, "n").replace(/Ñ/g, "N")
};


export const LugaresDisponibles = [
  "Caja Beige",
  "Caja Marvel Blanca",
  "Caja Rosa Pandora",
  "Expositor Blanco",
  "Felpudo Grande",
  "Felpudo Negro",
  "Negro Alfa",
  "Negro Beta",
  "Rosa Grande",
  "Transparente 1",
  "Transparente 2",
  "Transparente 3",
];

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

