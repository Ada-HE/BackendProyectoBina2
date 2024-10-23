const db = require('../db');

// Registrar los datos de contacto
const registrarContacto = (direccion, correo, telefono, callback) => {
  const query = 'INSERT INTO datosContacto (direccion, correo, telefono) VALUES (?, ?, ?)';
  db.query(query, [direccion, correo, telefono], callback);
};

// Actualizar los datos de contacto
const actualizarContacto = (id, direccion, correo, telefono, callback) => {
  const query = 'UPDATE datosContacto SET direccion = ?, correo = ?, telefono = ? WHERE id = ?';
  db.query(query, [direccion, correo, telefono, id], callback);
};

// Obtener los datos de contacto
const obtenerContacto = (callback) => {
  const query = 'SELECT id, direccion, correo, telefono FROM datosContacto LIMIT 1';
  db.query(query, callback);
};

module.exports = {
  registrarContacto,
  actualizarContacto,
  obtenerContacto
};
