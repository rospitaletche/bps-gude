// src/config/menus.js
export const menus = {
  Inicio: [
    { text: "Dashboard", page: "Home" }
  ],
  Informes: [
    { text: "Pasivos", page: "InformePasivos" },
    { text: "Activos", page: "InformeActivos" },
    { text: "Adm Y P", page: "InformeAdm" }
  ],
  Atención: [
    { text: "Activos", page: "AtencionActivos" },
  ],
  Oficios: [
    { text: "Judiciales", page: "OficiosJudiciales" }
  ],
  // Menú por defecto (cuando no hay sidebar seleccionado o no coincide)
  default: [
    { text: "Pasivos", page: "InformePasivos" },
    { text: "Activos", page: "InformeActivos" }
  ]
};