const db = require('../db');

const obtenerUltimaVersion = (callback) => {
  const query = `SELECT version FROM logoNombre ORDER BY version DESC LIMIT 1`;
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener la última versión:", err);
      return callback(err, null);
    }
    // Convertimos a número entero para evitar decimales y comenzamos en 1.0 si no hay registros previos
    const ultimaVersion = result.length > 0 ? parseInt(result[0].version) : 1.0;
    callback(null, ultimaVersion);
  });
};

const desactivarLogosAnteriores = (callback) => {
  const query = `UPDATE logoNombre SET vigente = 0 WHERE vigente = 1`;
  db.query(query, callback);
};

const registrarNuevoLogo = (logoUrl, version, callback) => {
  const query = `INSERT INTO logoNombre (logo, version, vigente) VALUES (?, ?, 1)`;
  db.query(query, [logoUrl, version.toFixed(1)], callback);
};

const obtenerLogoVigente = (callback) => {
  const query = `SELECT * FROM logoNombre WHERE vigente = 1 LIMIT 1`;
  db.query(query, callback);
};

const obtenerLogosNoVigentes = (callback) => {
  const query = `SELECT * FROM logoNombre WHERE vigente = 0`;
  db.query(query, callback);
};

module.exports = {
  obtenerUltimaVersion,
  desactivarLogosAnteriores,
  registrarNuevoLogo,
  obtenerLogoVigente,
  obtenerLogosNoVigentes,
};
