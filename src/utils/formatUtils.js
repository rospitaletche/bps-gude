export const formatDocumento = (nroDoc) => {
    const str = nroDoc.toString();
    if (str.length < 7) return str; // Manejar casos de longitud menor
    const base = str.slice(0, -1); // Todo excepto el último dígito
    const lastDigit = str.slice(-1); // Último dígito
    const formatted = `${base.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${lastDigit}`;
    return formatted;
  };
  