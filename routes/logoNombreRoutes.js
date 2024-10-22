const express = require('express');
const router = express.Router();
const logoNombreController = require('../controllers/logoNombreController');
const multer = require('multer');

// Configuración de Multer para subir archivos y limitar tamaño a 2MB
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 2 * 1024 * 1024 }, // Límite de 2MB
});

// Ruta para registrar nombre y logo
router.post('/logo-nombre/registrar', (req, res, next) => {
  upload.single('logo')(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El logo no puede pesar más de 2MB.' });
      }
      return res.status(500).json({ error: 'Error al subir el archivo.' });
    }
    next();
  });
}, logoNombreController.registrarLogoNombre);

// Ruta para obtener todos los registros
router.get('/logo-nombre/ver', logoNombreController.obtenerLogoNombre);

// Nueva ruta para actualizar nombre y logo
router.put('/logo-nombre/actualizar/:id', (req, res, next) => {
    upload.single('logo')(req, res, function (err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'El logo no puede pesar más de 2MB.' });
        }
        return res.status(500).json({ error: 'Error al subir el archivo.' });
      }
      next();
    });
  }, logoNombreController.actualizarLogoNombre);


module.exports = router;
