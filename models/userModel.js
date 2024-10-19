const db = require('../db');

// Función para crear un nuevo usuario con el campo mfa_secret
const createUser = (nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, correo, password, tipo, codigoVerificacion, expirationTime, mfaSecret, callback) => {
  const query = `
    INSERT INTO usuarios 
    (nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, correo, password, tipo, codigo_verificacion, codigo_verificacion_expiracion, mfa_secret, intentos_fallidos, cuenta_bloqueada) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, FALSE)
  `;
  db.query(query, [nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, correo, password, tipo, codigoVerificacion, expirationTime, mfaSecret], callback);
};

// Función para buscar un usuario por correo
const findUserByEmail = (correo, callback) => {
  const query = 'SELECT * FROM usuarios WHERE correo = ?';
  db.query(query, [correo], callback);
};

// Función para actualizar todos los datos del usuario si no ha sido verificado
const updateUserData = (correo, nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, password, nuevoCodigo, nuevaExpiracion, mfaSecret, callback) => {
  const query = `
    UPDATE usuarios 
    SET nombre = ?, apellidoPaterno = ?, apellidoMaterno = ?, telefono = ?, edad = ?, sexo = ?, password = ?, codigo_verificacion = ?, codigo_verificacion_expiracion = ?, mfa_secret = ?
    WHERE correo = ? AND verificado = 0
  `;
  db.query(query, [nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, password, nuevoCodigo, nuevaExpiracion, mfaSecret, correo], callback);
};

// Función para actualizar el estado de verificación del usuario
const updateUserVerified = (correo, callback) => {
  const query = 'UPDATE usuarios SET verificado = TRUE WHERE correo = ?';
  db.query(query, [correo], callback);
};

// Función para eliminar un usuario no verificado si el código ha expirado
const deleteUserByEmail = (correo, callback) => {
  const query = 'DELETE FROM usuarios WHERE correo = ? AND verificado = 0';
  db.query(query, [correo], callback);
};

// Función para actualizar el código de verificación y el tiempo de expiración
const updateVerificationCodeAndExpiration = (correo, nuevoCodigo, nuevaExpiracion, callback) => {
  const query = 'UPDATE usuarios SET codigo_verificacion = ?, codigo_verificacion_expiracion = ? WHERE correo = ? AND verificado = 0';
  db.query(query, [nuevoCodigo, nuevaExpiracion, correo], callback);
};

// Función para incrementar los intentos fallidos
const incrementarIntentosFallidos = (correo, callback) => {
  const query = 'UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE correo = ?';
  db.query(query, [correo], callback);
};

// Función para bloquear la cuenta después de demasiados intentos fallidos
const bloquearCuenta = (correo, callback) => {
  const query = 'UPDATE usuarios SET cuenta_bloqueada = TRUE WHERE correo = ?';
  db.query(query, [correo], callback);
};

// Función para reiniciar los intentos fallidos después de un inicio de sesión exitoso
const reiniciarIntentosFallidos = (correo, callback) => {
  const query = 'UPDATE usuarios SET intentos_fallidos = 0 WHERE correo = ?';
  db.query(query, [correo], callback);
};

// Función para buscar un usuario por correo o teléfono
const findUserByEmailOrPhone = (correo, telefono, callback) => {
  const query = 'SELECT * FROM usuarios WHERE correo = ? OR telefono = ?';
  db.query(query, [correo, telefono], callback);
};

module.exports = {
  createUser,
  findUserByEmail,
  updateUserData,
  updateUserVerified,
  deleteUserByEmail,
  updateVerificationCodeAndExpiration,
  incrementarIntentosFallidos,
  bloquearCuenta,
  reiniciarIntentosFallidos,
  findUserByEmailOrPhone,
};
