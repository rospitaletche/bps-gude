// src/config/menus.js
const menus = {
  Informes: [
    { text: "Pasivos" },
    { text: "Activos" },
    { text: "Adm Y P" }
  ],
  Atención: [
    { text: "Opción A" },
    { text: "Opción B" }
  ],
  // Menú por defecto (cuando no hay sidebar seleccionado o no coincide)
  default: [
    { text: "Pasivos" },
    { text: "Activos" }
  ]
};

export default menus;
