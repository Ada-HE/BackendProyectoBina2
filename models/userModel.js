const db = require('../db');
const bcrypt = require('bcryptjs'); // Asegúrate de agregar esta línea


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
    SELECT id, correo 
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
  const query = 'SELECT id, nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, correo, cuenta_bloqueada FROM usuarios WHERE id = ?';
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
// Función para registrar un bloqueo en HistorialBloqueos
const registrarBloqueoEnHistorial = (usuarioId, callback) => {
  const query = `INSERT INTO HistorialBloqueos (usuario_id, fecha_bloqueo) VALUES (?, NOW())`;
  db.query(query, [usuarioId], (err, result) => {
    if (err) {
      console.error('Error al registrar el bloqueo en el historial:', err);
      return callback(err); // Devolver el error al callback
    }
    console.log(`Bloqueo registrado en el historial para el usuario ${usuarioId}`);
    return callback(null, result); // Devolver el resultado al callback
  });
};

// Función para obtener usuarios bloqueados por un rango de tiempo (día, semana, mes)
const obtenerUsuariosBloqueadosPorTiempo = (rango, callback) => {
  let intervalo;
  
  // Determinar el intervalo basado en el rango
  switch (rango) {
    case 'dia':
      intervalo = 'INTERVAL 1 DAY';
      break;
    case 'semana':
      intervalo = 'INTERVAL 1 WEEK';
      break;
    case 'mes':
      intervalo = 'INTERVAL 1 MONTH';
      break;
    default:
      return callback(new Error('Rango inválido'), null);
  }

  const query = `
    SELECT u.id, u.nombre, u.correo, hb.fecha_bloqueo
    FROM usuarios u
    JOIN HistorialBloqueos hb ON u.id = hb.usuario_id
    WHERE hb.fecha_bloqueo >= DATE_SUB(NOW(), ${intervalo})
    ORDER BY hb.fecha_bloqueo DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios bloqueados:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};
// Función para actualizar el estado de bloqueo del usuario
const actualizarEstadoBloqueo = (id, bloqueo, callback) => {
  // Mostrar los datos recibidos en la consola para depuración

  // Verificar que el id sea un número
  if (typeof id !== 'number' || typeof bloqueo !== 'number') {
    console.error('ID o bloqueo inválidos');
    return callback(new Error('ID o valor de bloqueo inválidos'));
  }

  const query = 'UPDATE usuarios SET cuenta_bloqueada = ? WHERE id = ?';
  
  db.query(query, [bloqueo, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el estado de bloqueo del usuario:', err);
      return callback(err);  // Retorna el error al callback para manejarlo
    }

    // Verificar si la actualización afectó alguna fila
    if (result.affectedRows === 0) {
      console.error(`No se encontró un usuario con el ID ${id}`);
      return callback(new Error('Usuario no encontrado'));
    }

    callback(null, result);  // Retorna el resultado si la consulta fue exitosa
  });
};
const guardarPasswordEnHistorial = (usuarioId, password, callback) => {
  const query = 'INSERT INTO historial_password (usuario_id, password) VALUES (?, ?)';
  db.query(query, [usuarioId, password], callback);
};

const verificarPasswordEnHistorial = (usuarioId, newPassword, callback) => {
  const query = 'SELECT password FROM historial_password WHERE usuario_id = ?';

  db.query(query, [usuarioId], async (err, results) => {
    if (err) {
      console.error("Error al consultar el historial de contraseñas:", err);
      return callback(err, null);
    }

    // Verificar si alguna contraseña del historial coincide con la nueva
    for (const record of results) {
      const isMatch = await bcrypt.compare(newPassword, record.password);
      if (isMatch) {
        // Si coincide, significa que la nueva contraseña ya ha sido usada
        return callback(null, true);
      }
    }

    // Si ninguna coincide, la nueva contraseña no está en el historial
    callback(null, false);
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
  obtenerMaxIntentos,
  registrarBloqueoEnHistorial,
  obtenerUsuariosBloqueadosPorTiempo,
  actualizarEstadoBloqueo,
  guardarPasswordEnHistorial,
  verificarPasswordEnHistorial
  
};
