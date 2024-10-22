const db = require('../db');

// Función para crear una nueva política de privacidad
const createPrivacyPolicy = (titulo, contenido, version, callback) => {
  // Obtener la versión actual más alta
  const getMaxVersionQuery = 'SELECT MAX(version) as maxVersion FROM politicas_privacidad';

  db.query(getMaxVersionQuery, (err, result) => {
    if (err) return callback(err); // Manejar errores

    const maxVersion = result[0].maxVersion || 0;
    const newVersion = (parseFloat(maxVersion) + 1).toFixed(1); // Incrementamos la versión

    // Desactivar la política vigente actual
    const deactivateCurrentQuery = 'UPDATE politicas_privacidad SET vigente = FALSE WHERE vigente = TRUE';
    db.query(deactivateCurrentQuery, (err) => {
      if (err) return callback(err); // Manejar errores

      // Insertar la nueva política con la nueva versión y marcarla como vigente
      const insertQuery = `
        INSERT INTO politicas_privacidad (titulo, contenido, fecha_creacion, vigente, version)
        VALUES (?, ?, NOW(), TRUE, ?)
      `;
      db.query(insertQuery, [titulo, contenido, newVersion], (err, rows) => {
        if (err) return callback(err); // Manejar errores
        callback(null, rows); // Llamar al callback con el resultado si todo salió bien
      });
    });
  });
};


// Función para obtener la versión más alta
const getHighestVersion = (callback) => {
  const query = 'SELECT MAX(version) as version FROM politicas_privacidad';
  db.query(query, callback);
};

// Función para desactivar la política vigente
const deactivateCurrentPolicy = (callback) => {
  const query = 'UPDATE politicas_privacidad SET vigente = FALSE WHERE vigente = TRUE';
  db.query(query, callback);
};

// Función para obtener todas las políticas
const getAllPolicies = (callback) => {
  const query = 'SELECT * FROM politicas_privacidad WHERE eliminado = false';
  db.query(query, callback);
};


// Función para obtener la política vigente
const getActivePolicy = (callback) => {
  const query = 'SELECT * FROM politicas_privacidad WHERE vigente = TRUE';
  db.query(query, callback);
};

// Función para actualizar una política y marcarla como vigente
const updatePolicy = (id, titulo, contenido, version, callback) => {
  const query = `
    UPDATE politicas_privacidad 
    SET titulo = ?, contenido = ?, version = ?
    WHERE id = ?
  `;
  db.query(query, [titulo, contenido, version, id], callback);
};

// Función para establecer una política como vigente
const setPolicyAsActive = (id, callback) => {
  // Primero, desactivar la política vigente
  const deactivateQuery = 'UPDATE politicas_privacidad SET vigente = FALSE WHERE vigente = TRUE';
  db.query(deactivateQuery, [], (err) => {
    if (err) return callback(err);

    // Después, activar la nueva política
    const activateQuery = 'UPDATE politicas_privacidad SET vigente = TRUE WHERE id = ?';
    db.query(activateQuery, [id], callback);
  });
};
const deletePolicy = (id, callback) => {
  const query = 'UPDATE politicas_privacidad SET eliminado = true WHERE id = ?';
  db.query(query, [id], callback);
};


module.exports = {
  createPrivacyPolicy,
  getAllPolicies,
  getActivePolicy,
  updatePolicy,
  setPolicyAsActive,
  deactivateCurrentPolicy,
  getHighestVersion,
  deletePolicy,
};
