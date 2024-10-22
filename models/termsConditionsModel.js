const db = require('../db');

// Función para crear una nueva TyC
const createTermsConditions= (titulo, contenido, version, callback) => {
  // Obtener la versión actual más alta
  const getMaxVersionQuery = 'SELECT MAX(version) as maxVersion FROM terminos_condiciones';

  db.query(getMaxVersionQuery, (err, result) => {
    if (err) return callback(err); // Manejar errores

    const maxVersion = result[0].maxVersion || 0;
    const newVersion = (parseFloat(maxVersion) + 1).toFixed(1); // Incrementamos la versión

    // Desactivar la política vigente actual
    const deactivateCurrentQuery = 'UPDATE terminos_condiciones SET vigente = FALSE WHERE vigente = TRUE';
    db.query(deactivateCurrentQuery, (err) => {
      if (err) return callback(err); // Manejar errores

      // Insertar la nueva política con la nueva versión y marcarla como vigente
      const insertQuery = `
        INSERT INTO terminos_condiciones (titulo, contenido, fecha_creacion, vigente, version)
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
  const query = 'SELECT MAX(version) as version FROM terminos_condiciones';
  db.query(query, callback);
};

// Función para desactivar la TyC vigente
const deactivateCurrentTermsConditions = (callback) => {
  const query = 'UPDATE terminos_condiciones SET vigente = FALSE WHERE vigente = TRUE';
  db.query(query, callback);
};

// Función para obtener todas las TyC
const getTermsConditions = (callback) => {
  const query = 'SELECT * FROM terminos_condiciones WHERE eliminado = false';
  db.query(query, callback);
};


// Función para obtener la TyC vigente
const getActiveTermsConditions = (callback) => {
  const query = 'SELECT * FROM terminos_condiciones WHERE vigente = TRUE';
  db.query(query, callback);
};

// Función para actualizar una TyC y marcarla como vigente
const updateTermsConditions= (id, titulo, contenido, version, callback) => {
  const query = `
    UPDATE terminos_condiciones
    SET titulo = ?, contenido = ?, version = ?
    WHERE id = ?
  `;
  db.query(query, [titulo, contenido, version, id], callback);
};

// Función para establecer una TyC como vigente
const setTermsConditionsAsActive = (id, callback) => {
  // Primero, desactivar la política vigente
  const deactivateQuery = 'UPDATE terminos_condiciones SET vigente = FALSE WHERE vigente = TRUE';
  db.query(deactivateQuery, [], (err) => {
    if (err) return callback(err);

    // Después, activar la nueva política
    const activateQuery = 'UPDATE terminos_condiciones SET vigente = TRUE WHERE id = ?';
    db.query(activateQuery, [id], callback);
  });
};
const deleteTermsConditions = (id, callback) => {
  const query = 'UPDATE terminos_condiciones SET eliminado = true WHERE id = ?';
  db.query(query, [id], callback);
};


module.exports = {
  createTermsConditions,
  getTermsConditions,
  getActiveTermsConditions,
  updateTermsConditions,
  setTermsConditionsAsActive,
  deactivateCurrentTermsConditions,
  getHighestVersion,
  deleteTermsConditions,
};
