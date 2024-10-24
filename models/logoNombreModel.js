const db = require('../db');

const registrarLogoNombre = (nombre, logoUrl, callback) => {
  const query = `
    INSERT INTO logoNombre (nombre, logo)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), logo = VALUES(logo)
  `;

  db.query(query, [nombre, logoUrl], (err, result) => {
    if (err) {
      console.error('Error al registrar o actualizar en la base de datos:', err);
      return callback(err, null);
    }
    console.log('Inserción exitosa en la base de datos.');
    callback(null, result);
  });
};


// Función para obtener el registro actual de nombre y logo
const obtenerLogoNombre = (callback) => {
  const query = `SELECT * FROM logoNombre LIMIT 1`;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener el nombre y logo:', err);
      return callback(err, null);
    }
    callback(null, result);
  });
};

// Función para actualizar el nombre y logo por ID
const actualizarLogoNombre = (id, nombre, logoUrl, callback) => {
  const query = `
    UPDATE logoNombre 
    SET nombre = ?, logo = ?
    WHERE id = ?
  `;
  
  db.query(query, [nombre, logoUrl, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el nombre y logo:', err);
      return callback(err, null);
    }
    callback(null, result);
  });
};

module.exports = {
  registrarLogoNombre,
  obtenerLogoNombre,
  actualizarLogoNombre,
};
