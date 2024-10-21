const express = require('express');
const authController = require('../controllers/authController'); // Importar el controlador
const rateLimit = require('express-rate-limit'); // Importar express-rate-limit

const router = express.Router();

// Configuración de Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limitar cada IP a 100 solicitudes por ventana de tiempo
  message: { message: 'Demasiadas solicitudes, por favor intenta de nuevo más tarde.' },
  statusCode: 429, // Código de estado 429 (Too Many Requests)

  
});

// Ruta de registro de usuario
router.post('/registro', limiter, authController.register); // Registro de usuario y envío de código de verificación

// Ruta de verificación de código de verificación
router.post('/verificar-codigo', authController.verificarCodigo); // Verificación del código recibido en el correo

// Ruta de login de usuario
router.post('/login', limiter, authController.login); // Login del usuario registrado

// Ruta para mostrar el código QR para configurar MFA
router.get('/mfa/setup/:email', authController.setupMFA); // Mostrar código QR para Google Authenticator

// Ruta para verificar el código TOTP de MFA
router.post('/mfa/verify', limiter, authController.verifyMFA); // Verificar el código TOTP de Google Authenticator

// Ruta para reenviar el código de verificación
router.post('/resend-code', limiter, authController.reenviarCodigo); // Reenviar código de verificación por correo

router.post('/logout', authController.logout); // Cerrar sesión
// Ruta para verificar la autenticación
router.get('/verificar-autenticacion', authController.verificarAutenticacion);
// Ruta para solicitar el correo de recuperación de contraseña
router.post('/solicitar-recuperacion', limiter, authController.solicitarRecuperacion); // Ruta para solicitar el correo de recuperación de contraseña

// Ruta para cambiar la contraseña
router.post('/cambiar-contrasena', limiter, authController.cambiarContrasena); // Cambiar la contraseña

module.exports = router; // Exporta el router para usar en tu servidor principal
