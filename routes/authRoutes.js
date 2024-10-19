const express = require('express');
const authController = require('../controllers/authController'); // Importar el controlador

const router = express.Router();

// Ruta de registro de usuario
router.post('/registro', authController.register); // Registro de usuario y envío de código de verificación

// Ruta de verificación de código de verificación
router.post('/verificar-codigo', authController.verificarCodigo); // Verificación del código recibido en el correo

// Ruta de login de usuario
router.post('/login', authController.login); // Login del usuario registrado

// Ruta para mostrar el código QR para configurar MFA
router.get('/mfa/setup/:email', authController.setupMFA); // Mostrar código QR para Google Authenticator

// Ruta para verificar el código TOTP de MFA
router.post('/mfa/verify', authController.verifyMFA); // Verificar el código TOTP de Google Authenticator

// Ruta para reenviar el código de verificación
router.post('/resend-code', authController.reenviarCodigo); // Reenviar código de verificación por correo

router.post('/logout', authController.logout); // Cerrar sesión


module.exports = router; // Exporta el router para usar en tu servidor principal
