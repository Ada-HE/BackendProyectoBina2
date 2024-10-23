const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contactoController');

// Ruta para registrar o actualizar los datos de contacto
router.post('/contacto/registrar', contactoController.registrarActualizarContacto);

// Ruta para obtener los datos de contacto
router.get('/contacto/ver', contactoController.obtenerContacto);

router.put('/contacto/actualizar/:id', contactoController.registrarActualizarContacto);


module.exports = router;
