const db = require('../db');

const obtenerUltimaVersion = (callback) => {
  const query = `SELECT version FROM empresaNombre ORDER BY version DESC LIMIT 1`;
  db.query(query, (err, result) => {
    if (err) return callback(err, null);
    const ultimaVersion = result.length > 0 ? Math.floor(result[0].version) : 0;
    callback(null, ultimaVersion);
  });
};

const desactivarNombresAnteriores = (callback) => {
  const query = `UPDATE empresaNombre SET vigente = 0 WHERE vigente = 1`;
  db.query(query, callback);
};

const registrarNuevoNombre = (nombre, version, callback) => {
  const query = `INSERT INTO empresaNombre (nombre, version, vigente) VALUES (?, ?, 1)`;
  db.query(query, [nombre, version], callback);
};

const obtenerNombreVigente = (callback) => {
  const query = `SELECT * FROM empresaNombre WHERE vigente = 1 LIMIT 1`;
  db.query(query, callback);
};

const obtenerNombresNoVigentes = (callback) => {
  const query = `SELECT * FROM empresaNombre WHERE vigente = 0`;
  db.query(query, callback);
};

module.exports = {
  obtenerUltimaVersion,
  desactivarNombresAnteriores,
  registrarNuevoNombre,
  obtenerNombreVigente,
  obtenerNombresNoVigentes,
};
