const db = require('../db');

// Función para crear un nuevo deslinde legal
const createDeslindeLegal = (titulo, contenido, version, callback) => {
  const query = `
    INSERT INTO deslinde_legal (titulo, contenido, fecha_creacion, vigente, version)
    VALUES (?, ?, NOW(), TRUE, ?)
  `;
  db.query(query, [titulo, contenido, version], callback);
};

// Función para obtener la versión más alta
const getHighestVersion = (callback) => {
  const query = 'SELECT MAX(version) as version FROM deslinde_legal';
  db.query(query, callback);
};

// Función para desactivar el deslinde legal vigente
const deactivateCurrentDeslinde = (callback) => {
  const query = 'UPDATE deslinde_legal SET vigente = FALSE WHERE vigente = TRUE';
  db.query(query, callback);
};

// Función para obtener todos los deslindes legales (no eliminados)
const getAllDeslindes = (callback) => {
  const query = 'SELECT * FROM deslinde_legal WHERE eliminado = FALSE';
  db.query(query, callback);
};

// Función para obtener el deslinde legal vigente
const getActiveDeslinde = (callback) => {
  const query = 'SELECT * FROM deslinde_legal WHERE vigente = TRUE';
  db.query(query, callback);
};

// Función para actualizar un deslinde
const updateDeslinde = (id, titulo, contenido, version, callback) => {
  const query = `
    UPDATE deslinde_legal 
    SET titulo = ?, contenido = ?, version = ?
    WHERE id = ?
  `;
  db.query(query, [titulo, contenido, version, id], callback);
};

// Función para establecer un deslinde como vigente
const setDeslindeAsActive = (id, callback) => {
  // Primero, desactivar el deslinde vigente
  const deactivateQuery = 'UPDATE deslinde_legal SET vigente = FALSE WHERE vigente = TRUE';
  db.query(deactivateQuery, [], (err) => {
    if (err) return callback(err);

    // Luego, activar el nuevo deslinde
    const activateQuery = 'UPDATE deslinde_legal SET vigente = TRUE WHERE id = ?';
    db.query(activateQuery, [id], callback);
  });
};

// Función para eliminar lógicamente un deslinde legal
const deleteDeslinde = (id, callback) => {
  const query = 'UPDATE deslinde_legal SET eliminado = TRUE WHERE id = ?';
  db.query(query, [id], callback);
};

module.exports = {
  createDeslindeLegal,
  getHighestVersion,
  deactivateCurrentDeslinde,
  getAllDeslindes,
  getActiveDeslinde,
  updateDeslinde,
  setDeslindeAsActive,
  deleteDeslinde,
};
