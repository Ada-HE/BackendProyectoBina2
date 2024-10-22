const db = require('../db');

// Crear una nueva red social
const createSocialMedia = (nombre, url, callback) => {
  const query = `
    INSERT INTO redes_sociales (nombre, url, fecha_creacion) 
    VALUES (?, ?, NOW())
  `;
  db.query(query, [nombre, url], callback);
};

// Obtener todas las redes sociales
const getAllSocialMedia = (callback) => {
  const query = 'SELECT * FROM redes_sociales WHERE eliminado = false';
  db.query(query, callback);
};

// Actualizar una red social
const updateSocialMedia = (id, nombre, url, callback) => {
  const query = `
    UPDATE redes_sociales 
    SET nombre = ?, url = ? 
    WHERE id = ?
  `;
  db.query(query, [nombre, url, id], callback);
};

// Eliminar una red social lógicamente
const deleteSocialMedia = (id, callback) => {
  const query = 'UPDATE redes_sociales SET eliminado = true WHERE id = ?';
  db.query(query, [id], callback);
};

module.exports = {
  createSocialMedia,
  getAllSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
};
