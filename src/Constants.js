

export const diaMadridYYYYMMDD = (date = new Date()) =>
    new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);




export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  const day   = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // meses van 0-11
  const year  = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const mins  = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}  ${hours}:${mins}`;
};

