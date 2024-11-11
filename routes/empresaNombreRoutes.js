const express = require('express');
const { registrarNombre, obtenerNombreVigente, obtenerNombresNoVigentes, activarNombre } = require('../controllers/empresaNombreController');
const router = express.Router();

router.post('/nombre/registrar', registrarNombre);
router.get('/nombre/vigente', obtenerNombreVigente);
router.get('/nombre/no-vigente', obtenerNombresNoVigentes);
router.put('/nombre/activar', activarNombre);

module.exports = router;
