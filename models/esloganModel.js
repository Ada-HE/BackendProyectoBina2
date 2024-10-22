const db = require('../db');

// Obtener el eslogan actual
const getEslogan = (callback) => {
  const query = 'SELECT id, eslogan FROM empresa LIMIT 1'; // Incluimos el `id` para poder usarlo en la actualización
  db.query(query, callback);
};

// Crear un nuevo eslogan
const createEslogan = (eslogan, callback) => {
  const query = 'INSERT INTO empresa (eslogan) VALUES (?)';
  db.query(query, [eslogan], callback);
};

// Actualizar un eslogan existente
const updateEslogan = (id, eslogan, callback) => {
  const query = 'UPDATE empresa SET eslogan = ? WHERE id = ?'; // Actualizar según el `id` dinámico
  db.query(query, [eslogan, id], callback);
};

module.exports = {
  getEslogan,
  createEslogan,
  updateEslogan,
};
