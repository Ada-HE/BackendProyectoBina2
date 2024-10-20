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
    subject: 'Código de Verificación',
    text: `Tu código de verificación es: ${codigoVerificacion}`,
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

              // Enviar nuevo correo de verificación
              enviarCorreoVerificacion(correo, nuevoCodigo);
              return res.status(200).json({ message: 'Datos actualizados y código de verificación reenviado. Revisa tu correo para verificar tu cuenta.' });
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
          (err) => {
            if (err) {
              console.error('Error al crear el usuario:', err);
              return res.status(500).json({ error: 'Error al crear el usuario' });
            }

            // Enviar correo de verificación
            enviarCorreoVerificacion(correo, codigoVerificacion);
            return res.status(201).json({ message: 'Usuario registrado con éxito. Revisa tu correo para verificar tu cuenta.' });
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
        secure: process.env.NODE_ENV === 'production', // Solo enviar la cookie si está en producción
        sameSite: 'Strict',  // Protección contra CSRF
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

// Login de usuarios
const login = async (req, res) => {
  const { correo, password } = req.body;

  userModel.findUserByEmail(correo, async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

    const usuario = result[0];

    // Verificar si la cuenta está bloqueada
    if (usuario.cuenta_bloqueada) {
      return res.status(403).json({ message: 'Cuenta bloqueada debido a demasiados intentos fallidos.' });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    // Si el usuario tiene MFA habilitado
    if (usuario.mfa_secret && !usuario.mfaVerificado) {
      return res.json({ requireMfa: true }); // Indicar que se requiere MFA
    }

    // Si ya pasó el MFA o no tiene MFA habilitado, generamos un token con mfaVerificado = true
    const token = generarTokenSesion(usuario, true);

    // Establecer la cookie de sesión
    res.cookie('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo en producción para HTTPS
      sameSite: 'None', // Cambia a 'None' si tienes problemas con otros dominios
      maxAge: 1000 * 60 * 60 * 24 * 15, // 15 días de expiración
      path: '/'
    });

    return res.json({ message: 'Inicio de sesión exitoso', token });
  });
};
// Función para cerrar sesión y eliminar la cookie en producción
const logout = (req, res) => {
  res.cookie('sessionToken', '', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', // Igual que cuando la cookie fue creada
    sameSite: 'Strict',  // Igual que cuando la cookie fue creada
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


module.exports = {
  register,
  login,
  verificarCodigo,
  reenviarCodigo,
  setupMFA,
  verifyMFA,
  logout,
  verificarAutenticacion,
};
