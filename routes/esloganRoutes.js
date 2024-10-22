const express = require('express');
const router = express.Router();
const esloganController = require('../controllers/esloganController');

// Ruta para obtener el eslogan actual
router.get('/eslogan', esloganController.getEslogan);

// Ruta para actualizar el eslogan
router.post('/eslogan/actualizar', esloganController.updateEslogan);

module.exports = router;
