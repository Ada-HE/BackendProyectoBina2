const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pwnedpasswords = require('pwnedpasswords');
const fetch = require('node-fetch');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const userModel = require('../models/userModel');


// Configurar transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '20221030@uthh.edu.mx', // Tu correo
    pass: 'jwtf dhjd dyno rdja',  // Tu contraseña de correo
  },
});

// Función para enviar el correo con el código de verificación
const enviarCorreoVerificacion = async (correo, codigoVerificacion) => {
  const mailOptions = {
    from: '20221030@uthh.edu.mx',
    to: correo,
    subject: 'Código de Verificación - Consultorio Dental',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
          <h2 style="color: #01349c; text-align: center;">¡Bienvenido a Consultorio Dental!</h2>
          <p style="font-size: 16px; color: #333333;">Hola,</p>
          <p style="font-size: 16px; color: #333333;">
            Gracias por elegirnos para tu cuidado dental. Para continuar con el proceso de verificación de tu cuenta, por favor utiliza el siguiente código:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; padding: 10px 20px; background-color: #01349c; color: #ffffff; font-size: 18px; font-weight: bold; border-radius: 5px;">
              ${codigoVerificacion}
            </span>
          </div>
          <p style="font-size: 16px; color: #333333;">
            Si no solicitaste este código, puedes ignorar este mensaje.
          </p>
          <p style="font-size: 16px; color: #333333;">¡Nos vemos pronto!</p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #999999;">
          <p>Consultorio Dental</p>
          <p>Dirección: Calle Principal #123, Ciudad</p>
          <p>Teléfono: (123) 456-7890</p>
        </div>
      </div>
    `,
  };


  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de verificación enviado');
  } catch (error) {
    console.error('Error al enviar el correo de verificación:', error);
  }
};

// Verificar si la contraseña ha sido comprometida
const verificarContrasenaComprometida = async (password) => {
  const resultado = await pwnedpasswords(password);
  return resultado > 0; // Si el resultado es mayor a 0, la contraseña ha sido comprometida
};

// Verificar el reCAPTCHA
const verificarReCAPTCHA = async (recaptchaToken) => {
  const secretKey = '6LdvPV0qAAAAAPi1sX0vjBb0lCfk2CewutnVB3D6'; // Tu clave secreta de Google reCAPTCHA
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

  const response = await fetch(verificationURL, { method: 'POST' });
  const data = await response.json();

  return data.success; // Devuelve si el reCAPTCHA fue validado correctamente
};

// Función para generar un código de verificación de 6 dígitos
const generarCodigoVerificacion = () => {
  return crypto.randomBytes(3).toString('hex'); // Crea un código de verificación de 6 caracteres
};

// Función para generar el secreto MFA
const generarMFASecret = () => {
  const secret = speakeasy.generateSecret({ name: 'TuAplicacion', length: 20 });
  return secret.base32;  // Guardar esto en la base de datos
};

// Registro de usuario
const register = async (req, res) => {
  const { nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, correo, password, tipo, recaptchaValue } = req.body;

  try {
    // Verificar el token de reCAPTCHA
    const recaptchaSuccess = await verificarReCAPTCHA(recaptchaValue);
    if (!recaptchaSuccess) {
      return res.status(400).json({ message: 'Falló la verificación de reCAPTCHA. Intenta nuevamente.' });
    }

    // Verificar si la contraseña ha sido comprometida
    if (await verificarContrasenaComprometida(password)) {
      return res.status(400).json({ message: 'La contraseña ha sido comprometida. Por favor, elige una contraseña diferente.' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar el secreto MFA
    const mfaSecret = generarMFASecret();

    // Verificar si el usuario ya existe (correo o teléfono)
    userModel.findUserByEmailOrPhone(correo, telefono, async (err, result) => {
      if (err) {
        console.error('Error en la búsqueda del usuario:', err);
        return res.status(500).json({ error: 'Error al buscar el usuario' });
      }

      if (result.length > 0) {
        const usuario = result[0];
        if (usuario.verificado) {
          // El correo o teléfono ya están registrados y verificados
          return res.status(400).json({ message: 'El correo o el teléfono ya están registrados.' });
        } else {
          // El usuario ya existe pero no ha sido verificado
          const nuevoCodigo = generarCodigoVerificacion();
          const nuevaExpiracion = new Date(Date.now() + 3 * 60 * 1000); // Nueva expiración de 3 minutos

          // Actualizar los datos del usuario no verificado
          userModel.updateUserData(
            correo,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            telefono,
            edad,
            sexo,
            hashedPassword,
            nuevoCodigo,
            nuevaExpiracion,
            mfaSecret,
            (err, result) => {
              if (err) {
                console.error('Error al actualizar los datos del usuario:', err);
                return res.status(500).json({ error: 'Error al actualizar los datos del usuario' });
              }

              // Guardar en el historial de contraseñas
              userModel.guardarPasswordEnHistorial(usuario.id, hashedPassword, (err) => {
                if (err) {
                  console.error('Error al guardar la contraseña en el historial:', err);
                  return res.status(500).json({ error: 'Error al guardar la contraseña en el historial' });
                }

                // Enviar nuevo correo de verificación
                enviarCorreoVerificacion(correo, nuevoCodigo);
                return res.status(200).json({ message: 'Datos actualizados y código de verificación reenviado. Revisa tu correo para verificar tu cuenta.' });
              });
            }
          );
        }
      } else {
        // Si no existe el usuario, crear uno nuevo
        const codigoVerificacion = generarCodigoVerificacion();
        const expirationTime = new Date(Date.now() + 3 * 60 * 1000); // 3 minutos

        userModel.createUser(
          nombre, apellidoPaterno, apellidoMaterno, telefono, edad, sexo, correo,
          hashedPassword, tipo || 'paciente', codigoVerificacion, expirationTime, mfaSecret,
          (err, result) => {
            if (err) {
              console.error('Error al crear el usuario:', err);
              return res.status(500).json({ error: 'Error al crear el usuario' });
            }

            // Obtener el ID del usuario recién creado
            const usuarioId = result.insertId;

            // Guardar en el historial de contraseñas
            userModel.guardarPasswordEnHistorial(usuarioId, hashedPassword, (err) => {
              if (err) {
                console.error('Error al guardar la contraseña en el historial:', err);
                return res.status(500).json({ error: 'Error al guardar la contraseña en el historial' });
              }

              // Enviar correo de verificación
              enviarCorreoVerificacion(correo, codigoVerificacion);
              return res.status(201).json({ message: 'Usuario registrado con éxito. Revisa tu correo para verificar tu cuenta.' });
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};


// Verificar el código de verificación enviado al correo
const verificarCodigo = (req, res) => {
  const { correo, codigo } = req.body;

  userModel.findUserByEmail(correo, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

    const usuario = result[0];
    const ahora = new Date();

    // Verificar si el código ha expirado
    if (new Date(usuario.codigo_verificacion_expiracion) < ahora) {
      userModel.deleteUserByEmail(correo, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(400).json({ message: 'El código de verificación ha expirado. El registro fue eliminado.' });
      });
    } else if (usuario.codigo_verificacion === codigo) {
      userModel.updateUserVerified(correo, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ message: 'Cuenta verificada con éxito' });
      });
    } else {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }
  });
};

// Función para reenviar un nuevo código de verificación si el usuario lo solicita
const reenviarCodigo = (req, res) => {
  const { correo } = req.body;

  const nuevoCodigo = generarCodigoVerificacion();
  const nuevaExpiracion = new Date(Date.now() + 3 * 60 * 1000); // Nueva expiración de 3 minutos

  userModel.updateVerificationCodeAndExpiration(correo, nuevoCodigo, nuevaExpiracion, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Enviar correo con el nuevo código de verificación
    enviarCorreoVerificacion(correo, nuevoCodigo);

    return res.json({ message: 'Nuevo código de verificación enviado. Tienes 3 minutos para verificar.' });
  });
};

// Función para mostrar el código QR para MFA
const setupMFA = (req, res) => {
  const correo = req.params.email;

  userModel.findUserByEmail(correo, (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const mfaSecret = result[0].mfa_secret;

    const otpAuthUrl = `otpauth://totp/TuAplicacion?secret=${mfaSecret}&issuer=TuAplicacion`;

    qrcode.toDataURL(otpAuthUrl, (err, qrCodeUrl) => {
      if (err) {
        return res.status(500).json({ error: 'Error al generar el código QR' });
      }

      res.json({ qrCodeUrl });
    });
  });
};

// Verificar MFA y luego generar el token con MFA verificado
const verifyMFA = (req, res) => {
  const { correo, token: mfaToken } = req.body;

  userModel.findUserByEmail(correo, (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = result[0];

    const verified = speakeasy.totp.verify({
      secret: usuario.mfa_secret,
      encoding: 'base32',
      token: mfaToken,
    });

    if (verified) {
      // Generar el token de sesión con MFA verificado
      const token = generarTokenSesion(usuario, true);

      // Establecer la cookie de sesión con el token
      res.cookie('sessionToken', token, {
        httpOnly: true,  // La cookie no es accesible mediante JavaScript del lado del cliente
        secure: true, // Solo enviar la cookie si está en producción
        sameSite: 'None',  // Protección contra CSRF
        maxAge: 1000 * 60 * 60 * 24 * 15, // 15 días de expiración
        path: '/', // Asegúrate de que la cookie esté disponible en todas las rutas
      });

      return res.json({ message: 'MFA verificado correctamente', token });
    } else {
      return res.status(400).json({ message: 'Código MFA incorrecto' });
    }
  });
};

// Después de que el usuario verifique MFA correctamente
const generarTokenSesion = (usuario, mfaVerificado = false) => {
  return jwt.sign(
    { id: usuario.id, tipo: usuario.tipo, mfaVerificado }, // Incluimos el estado de verificación MFA
    'secreto_super_seguro', // Llave secreta
    { expiresIn: '15d' } // El token expira en 15 días
  );
};


const login = async (req, res) => {
  const { correo, password } = req.body;

  userModel.findUserByEmail(correo, async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

    const usuario = result[0];

    // Verificar si la cuenta está bloqueada
    if (usuario.cuenta_bloqueada) {
      // Si la cuenta está bloqueada indefinidamente
      if (!usuario.intentos_fallidos && !usuario.tiempo_bloqueo) {
        return res.status(403).json({ message: 'Cuenta bloqueada indefinidamente por el administrador.' });
      }

      // Si la cuenta está bloqueada temporalmente (por intentos fallidos)
      if (usuario.tiempo_bloqueo) {
        const tiempoBloqueoFinalizado = new Date(usuario.tiempo_bloqueo);
        tiempoBloqueoFinalizado.setMinutes(tiempoBloqueoFinalizado.getMinutes());

        const tiempoActual = new Date();
        const tiempoRestanteMs = tiempoBloqueoFinalizado - tiempoActual;

        if (tiempoRestanteMs > 0) {
          const tiempoRestanteSegundos = Math.floor(tiempoRestanteMs / 1000);
          return res.status(403).json({
            message: 'Cuenta bloqueada temporalmente. Intenta de nuevo más tarde.',
            tiempoRestante: tiempoRestanteSegundos
          });
        } else {
          // Desbloquear automáticamente si ha pasado el tiempo de bloqueo
          await userModel.desbloquearCuenta(correo);
        }
      }
    }

    // Verificar la contraseña solo si la cuenta no está bloqueada
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      await userModel.incrementarIntentosFallidos(correo);
      userModel.registrarIncidencia(usuario.id, correo, 'Intento fallido', 'Intento de acceso fallido con contraseña incorrecta', (err) => {
        if (err) console.error('Error al registrar la incidencia:', err);
      });

      // Bloquear la cuenta si se excede el número de intentos fallidos 
      if (usuario.intentos_fallidos + 1 >= usuario.max_intentos_fallidos) {
        try {
          await userModel.bloquearCuenta(correo);

          // Después de bloquear la cuenta, registrar el bloqueo en el historial
          try {
            await userModel.registrarBloqueoEnHistorial(usuario.id);
          } catch (err) {
            console.error('Error al registrar el bloqueo en el historial:', err);
          }

          // Enviar respuesta de cuenta bloqueada
          return res.status(403).json({ message: 'Demasiados intentos fallidos. Cuenta bloqueada.' });

        } catch (err) {
          return res.status(500).json({ message: 'Error al bloquear la cuenta.' });
        }
      }

      // Si no se bloquea la cuenta, enviar mensaje de contraseña incorrecta
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    // Si la contraseña es correcta, reiniciar los intentos fallidos
    await userModel.reiniciarIntentosFallidos(correo);

    // Si el usuario tiene MFA habilitado
    if (usuario.mfa_secret && !usuario.mfaVerificado) {
      return res.json({ requireMfa: true });
    }

    const token = generarTokenSesion(usuario, true);

    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 1000 * 60 * 60 * 24 * 15,
      path: '/',
    });

    return res.json({ message: 'Inicio de sesión exitoso', token });
  });
};

// Función para cerrar sesión y eliminar la cookie en producción
const logout = (req, res) => {
  res.cookie('sessionToken', '', {
    httpOnly: true,
    secure: true, // Igual que cuando la cookie fue creada
    sameSite: 'None',  // Igual que cuando la cookie fue creada
    path: '/',  // Asegúrate de que el path sea el mismo que cuando se creó la cookie
    expires: new Date(0),  // Fecha de expiración pasada para eliminar la cookie
  });

  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};
// Verificar si el token de autenticación es válido
const verificarAutenticacion = (req, res) => {
  const token = req.cookies.sessionToken; // Leer el token de las cookies
  if (!token) {
    return res.status(401).json({ message: 'No estás autenticado' });
  }

  // Verificar el token
  jwt.verify(token, 'secreto_super_seguro', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    // Si el token es válido, enviamos la información del usuario
    return res.json({ message: 'Autenticación exitosa', tipoUsuario: decoded.tipo });
  });
};
// Función para enviar el correo con el enlace de recuperación
const enviarCorreoRecuperacion = async (correo, token) => {
  const link = `https://consultoriodental.isoftuthh.com/reset-password/${token}`;
  const mailOptions = {
    from: '20221030@uthh.edu.mx',
    to: correo,
    subject: 'Restablecimiento de Contraseña - Consultorio Dental',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
        <h2 style="color: #01349c; text-align: center;">Restablecimiento de Contraseña</h2>
        <p style="font-size: 16px; color: #333333;">Hola,</p>
        <p style="font-size: 16px; color: #333333;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en nuestro consultorio dental. Para continuar con el proceso, por favor haz clic en el siguiente enlace:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #01349c; color: #ffffff; font-size: 18px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 16px; color: #333333;">
          Si no solicitaste este restablecimiento, puedes ignorar este mensaje. El enlace expirará en 60 minutos.
        </p>
        <p style="font-size: 16px; color: #333333;">¡Nos vemos pronto!</p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #999999;">
        <p>Consultorio Dental</p>
        <p>Dirección: Calle Principal #123, Ciudad</p>
        <p>Teléfono: (123) 456-7890</p>
      </div>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de recuperación enviado');
  } catch (error) {
    console.error('Error al enviar el correo de recuperación:', error);
  }
};

// Solicitar recuperación de contraseña
const solicitarRecuperacion = async (req, res) => {
  const { correo } = req.body;

  try {
    // Verificar si el usuario existe
    userModel.findUserByEmail(correo, async (err, user) => {
      if (err || user.length === 0) {
        return res.status(400).json({ message: 'Usuario no encontrado.' });
      }

      // Generar token de recuperación y establecer caducidad (15 minutos)
      const token = crypto.randomBytes(20).toString('hex');
      const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Guardar el token en la base de datos
      userModel.savePasswordResetToken(correo, token, expiration, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error al guardar el token.' });
        }

        // Enviar el correo con el enlace de recuperación
        enviarCorreoRecuperacion(correo, token);
        return res.json({ message: 'Correo de recuperación enviado.' });
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error en el servidor.' });
  }
};

const cambiarContrasena = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  /* Imprimir para verificar
  console.log("Token recibido:", token);
  console.log("Nueva contraseña recibida:", newPassword);
  console.log("Confirmación de contraseña recibida:", confirmPassword);*/

  // Validar que las contraseñas coincidan
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
  }

  try {
    // Verificar si el token es válido y no ha expirado
    userModel.findUserByResetToken(token, async (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ message: 'Token inválido o expirado.' });
      }

      const { correo, id } = result[0]; // Obtener el correo y el id del usuario con ese token
     // console.log("ID del usuario:", id);
     // console.log("Usuario encontrado con el token, correo:", correo);

      // Verificar si la nueva contraseña ya ha sido utilizada
      userModel.verificarPasswordEnHistorial(id, newPassword, async (err, exists) => {
        if (err) {
          return res.status(500).json({ message: 'Error al verificar el historial de contraseñas.' });
        }

        if (exists) {
          return res.status(400).json({ message: 'La nueva contraseña ya ha sido usada anteriormente. Por favor, elige una contraseña diferente.' });
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña del usuario y limpiar el token y la expiración
        userModel.updatePasswordByEmail(correo, hashedPassword, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error al actualizar la contraseña.' });
          }

          // Guardar la nueva contraseña en el historial
          userModel.guardarPasswordEnHistorial(id, hashedPassword, (err) => {
            if (err) {
              console.error('Error al guardar la contraseña en el historial:', err);
            }
          });

          //console.log("Contraseña actualizada correctamente para el correo:", correo);
          return res.json({ message: 'Contraseña actualizada exitosamente.' });
        });
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ message: 'Error en el servidor.' });
  }
};


// Función para obtener los datos del perfil del usuario logueado
const getUserProfile = (req, res) => {
  const token = req.cookies.sessionToken; // Leer el token de las cookies
  if (!token) {
    return res.status(401).json({ message: 'No estás autenticado' });
  }

  // Verificar el token
  jwt.verify(token, 'secreto_super_seguro', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    // Buscar al usuario por su ID
    userModel.findUserById(decoded.id, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener la información del usuario' });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const usuario = result[0];

      // Devolver solo los datos importantes
      return res.json({
        id: usuario.id,  // Aquí se incluye el ID del usuario
        nombre: usuario.nombre,
        apellidoPaterno: usuario.apellidoPaterno,
        apellidoMaterno: usuario.apellidoMaterno,
        telefono: usuario.telefono,
        correo: usuario.correo,
        edad: usuario.edad,
        sexo: usuario.sexo,
      });
    });
  });
};


// Controlador para cambiar la contraseña
const modificarContrasena = async (req, res) => {
  const { id, currentPassword, newPassword, confirmPassword } = req.body;

  // Verificar si todos los campos están presentes
  if (!id || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // Verificar si las contraseñas nuevas coinciden
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    // Validar la nueva contraseña (al menos una mayúscula, un número, un signo y 8 caracteres)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'La nueva contraseña debe contener al menos una letra mayúscula, un número, un signo especial y ser de mínimo 8 caracteres.'
      });
    }

    // Buscar al usuario por su ID
    userModel.findUserPasswordById(id, async (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error al buscar el usuario en la base de datos.' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      const usuario = result[0];

      // Verificar que el campo de contraseña no sea undefined o null
      if (!usuario.password) {
        return res.status(500).json({ message: 'No se encontró la contraseña del usuario en la base de datos.' });
      }

      // Verificar la contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, usuario.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
      }

      // Verificar si la nueva contraseña ya ha sido utilizada en el historial
      userModel.verificarPasswordEnHistorial(id, newPassword, async (err, exists) => {
        if (err) {
          return res.status(500).json({ message: 'Error al verificar el historial de contraseñas.' });
        }

        if (exists) {
          return res.status(400).json({ message: 'La nueva contraseña ya ha sido usada anteriormente. Por favor, elige una contraseña diferente.' });
        }

        // Si la contraseña es nueva, encriptar y actualizar
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        userModel.updatePasswordById(id, hashedPassword, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error al actualizar la contraseña.' });
          }

          // Guardar la nueva contraseña en el historial
          userModel.guardarPasswordEnHistorial(id, hashedPassword, (err) => {
            if (err) {
              console.error('Error al guardar la contraseña en el historial:', err);
            }
          });

          return res.json({ message: 'Contraseña actualizada exitosamente.' });
        });
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Función para obtener las incidencias

const getIncidencias = (req, res) => {
  userModel.getIncidencias((err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results); // Aquí envías la respuesta con los resultados al cliente
  });
};
const cambiarMaxIntentosFallidos = (req, res) => {

  const { maxIntentos } = req.body;

  // Validación
  if (!maxIntentos || isNaN(maxIntentos)) {
    return res.status(400).json({ message: 'Valor inválido para máximo de intentos' });
  }


  userModel.updateMaxIntentosFallidos(maxIntentos, (err, result) => {
    if (err) {
      console.error('Error al actualizar el máximo de intentos en la base de datos:', err);
      return res.status(500).json({ message: 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.' });
    }

    res.status(200).json({ message: 'Máximo de intentos actualizado correctamente' });
  });
};
// Controlador para obtener el valor actual de los intentos fallidos
const obtenerMaxIntentos = (req, res) => {
  userModel.obtenerMaxIntentos((err, maxIntentos) => {
    if (err) {
      console.error('Error al obtener el máximo de intentos:', err);
      return res.status(500).json({ message: 'Error al obtener el máximo de intentos fallidos' });
    }
    res.json({ maxIntentos });
  });
};
const obtenerUsuariosBloqueados = (req, res) => {
  const { rango } = req.query; // Obtener el rango de la solicitud (dia, semana, mes)

  userModel.obtenerUsuariosBloqueadosPorTiempo(rango, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener los usuarios bloqueados.', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios bloqueados en el rango de tiempo seleccionado.' });
    }

    res.json(results); // Devolver los resultados
  });
};
// Controlador para actualizar el estado de bloqueo del usuario
const actualizarBloqueoUsuario = (req, res) => {
  const { id } = req.params;
  const { bloqueo } = req.body;


  if (!id || typeof bloqueo !== 'number') {
    return res.status(400).json({ message: 'Datos inválidos' });
  }

  userModel.actualizarEstadoBloqueo(parseInt(id), bloqueo, (err, result) => {
    if (err) {
      console.error('Error al actualizar el estado de bloqueo:', err);
      return res.status(500).json({ message: 'Error interno al actualizar el estado de bloqueo.' });
    }

    res.json({ message: 'Estado de bloqueo actualizado correctamente' });
  });
};





module.exports = {
  register,
  login,
  verificarCodigo,
  reenviarCodigo,
  setupMFA,
  verifyMFA,
  logout,
  verificarAutenticacion,
  solicitarRecuperacion,
  cambiarContrasena,
  getUserProfile,
  modificarContrasena,
  getIncidencias,
  cambiarMaxIntentosFallidos,
  obtenerMaxIntentos,
  obtenerUsuariosBloqueados,
  actualizarBloqueoUsuario,
  
};
