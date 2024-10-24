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
// Función para registrar una incidencia
const registrarIncidencia = (usuarioId, correo, tipoIncidente, descripcion, callback) => {
  const query = `
    INSERT INTO incidencias (usuario_id, correo, tipo_incidente, descripcion) 
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [usuarioId, correo, tipoIncidente, descripcion], callback);
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

const incrementarIntentosFallidos = (correo, callback) => {
  const query = 'UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE correo = ?';
  db.query(query, [correo], callback);
};

const bloquearCuenta = (correo, callback) => {
  const tiempoBloqueo = new Date(Date.now() + 1 * 60 * 1000); // 5 minutos en milisegundos
  const query = 'UPDATE usuarios SET cuenta_bloqueada = TRUE, tiempo_bloqueo = ? WHERE correo = ?';
  db.query(query, [tiempoBloqueo, correo], callback);
};

const desbloquearCuenta = (correo, callback) => {
  const query = 'UPDATE usuarios SET cuenta_bloqueada = FALSE, intentos_fallidos = 0, tiempo_bloqueo = NULL WHERE correo = ?';
  db.query(query, [correo], callback);
};

const reiniciarIntentosFallidos = (correo, callback) => {
  const query = 'UPDATE usuarios SET intentos_fallidos = 0 WHERE correo = ?';
  db.query(query, [correo], callback);
};

// Función para buscar un usuario por correo o teléfono
const findUserByEmailOrPhone = (correo, telefono, callback) => {
  const query = 'SELECT * FROM usuarios WHERE correo = ? OR telefono = ?';
  db.query(query, [correo, telefono], callback);
};
// Función para buscar un usuario por su reset_token
const findUserByResetToken = (token, callback) => {
  const query = `
    SELECT correo 
    FROM usuarios 
    WHERE reset_token = ? 
    AND reset_token_expiration > DATE_SUB(NOW(), INTERVAL 6 HOUR)
  `;
  db.query(query, [token], callback);
};

// Función para actualizar la contraseña usando el correo
const updatePasswordByEmail = (correo, newPassword, callback) => {
  const query = `
    UPDATE usuarios 
    SET password = ?, reset_token = NULL, reset_token_expiration = NULL 
    WHERE correo = ?
  `;
  db.query(query, [newPassword, correo], (err, result) => {
    if (err) {
      console.log("Error al ejecutar la consulta SQL para actualizar la contraseña:", err);
      return callback(err); // Devolver el error
    }

    if (result.affectedRows === 0) {
      console.log("No se encontró ningún usuario con ese correo.");
      return callback(null, { message: 'No se encontró ningún usuario con ese correo.' });
    }

    console.log("Contraseña actualizada correctamente para el correo:", correo);
    return callback(null, { message: 'Contraseña actualizada exitosamente.' });
  });
};
// Guardar el token de restablecimiento de contraseña y su fecha de caducidad
const savePasswordResetToken = (correo, token, expiration, callback) => {
  const query = `
    UPDATE usuarios SET reset_token = ?, reset_token_expiration = ? WHERE correo = ?
  `;
  db.query(query, [token, expiration, correo], callback);
};
// Función para buscar un usuario por su ID
const findUserById = (id, callback) => {
  const query = 'SELECT id, nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, correo FROM usuarios WHERE id = ?';
  db.query(query, [id], callback);
};
// Función para actualizar la contraseña del usuario por ID
const updatePasswordById = (id, newPassword, callback) => {
  const query = 'UPDATE usuarios SET password = ? WHERE id = ?';
  db.query(query, [newPassword, id], callback);
};
const findUserPasswordById = (id, callback) => {
  const query = 'SELECT id, password FROM usuarios WHERE id = ?';
  db.query(query, [id], callback);
};
const getIncidencias = (callback) => {
  const query = 'SELECT * FROM incidencias';
  db.query(query, (err, results) => {
    if (err) {
      return callback(err, null); // Devolver el error al callback
    }
    callback(null, results); // Devolver los resultados al callback
  });
};
const updateMaxIntentosFallidos = (nuevoMaxIntentos, callback) => {
  const query = 'UPDATE usuarios SET max_intentos_fallidos = ?';
  

  db.query(query, [nuevoMaxIntentos], (err, result) => {
      if (err) {
          console.error('Error en la ejecución de la consulta SQL:', err);
          return callback(err);
      }

      callback(null, result);
  });
};
// Función para obtener el valor actual de los intentos fallidos
const obtenerMaxIntentos = (callback) => {
  const query = 'SELECT max_intentos_fallidos FROM usuarios LIMIT 1';  // O ajustar según la estructura de tu base de datos
  db.query(query, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    const maxIntentos = result[0].max_intentos_fallidos;
    callback(null, maxIntentos);
  });
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
  updatePasswordByEmail,
  findUserByResetToken,
  savePasswordResetToken,
  desbloquearCuenta,
  findUserById,
  updatePasswordById,
  findUserPasswordById,
  registrarIncidencia,
  getIncidencias,
  updateMaxIntentosFallidos,
  obtenerMaxIntentos
};
