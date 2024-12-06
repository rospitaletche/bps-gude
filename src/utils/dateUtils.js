export const parseDate = (dateValue) => {
    if (dateValue instanceof Date) {
      // Si ya es un objeto Date, simplemente lo devolvemos
      return dateValue;
    }
  
    if (typeof dateValue === 'number') {
      // Fecha serializada en Excel (basada en el sistema de fechas 1900)
      const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
      return excelDate;
    }
  
    if (typeof dateValue === 'string') {
      const [day, monthAbbr, year] = dateValue.split('-');
  
      if (!day || !monthAbbr || !year) {
        console.error('parseDate: formato de fecha inválido', dateValue);
        return null;
      }
  
      const monthMap = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12',
      };
  
      const month = monthMap[monthAbbr];
  
      if (!month) {
        console.error('parseDate: mes inválido', monthAbbr);
        return null;
      }
  
      const fullYear = year.length === 2 ? `20${year}` : year;
  
      return new Date(`${fullYear}-${month}-${day}`);
    }
  
    console.error('parseDate: tipo de dato no soportado', dateValue);
    return null;
  };
  
  