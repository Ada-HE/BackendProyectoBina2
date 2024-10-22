const db = require('../db');

// Registrar o actualizar el nombre y logo
const registrarLogoNombre = (nombre, logoNombre, callback) => {
  const query = `
    INSERT INTO logoNombre (nombre, logo)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), logo = VALUES(logo)
  `;
  db.query(query, [nombre, logoNombre], callback);
};
// Obtener todos los registros de la tabla logoNombre
const obtenerLogoNombre = (callback) => {
  const query = 'SELECT id, nombre, logo, fecha_creacion FROM logoNombre';
  db.query(query, callback);
};

// Actualizar nombre y logo
const actualizarLogoNombre = (id, nombre, logoNombre, callback) => {
  let query;
  const params = [nombre, id];

  if (logoNombre) {
    query = 'UPDATE logoNombre SET nombre = ?, logo = ? WHERE id = ?';
    params.splice(1, 0, logoNombre); // Inserta el logoNombre en la segunda posición
  } else {
    query = 'UPDATE logoNombre SET nombre = ? WHERE id = ?';
  }

  db.query(query, params, callback);
};


module.exports = {
  registrarLogoNombre,
  obtenerLogoNombre,
  actualizarLogoNombre
};
