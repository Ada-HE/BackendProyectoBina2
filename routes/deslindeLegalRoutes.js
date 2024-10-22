const express = require('express');
const router = express.Router();
const deslindeLegalController = require('../controllers/deslindeLegalController');
const multer = require('multer');

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// Crear un nuevo deslinde legal (con archivo PDF)
router.post('/deslinde/crear', upload.single('file'), deslindeLegalController.createDeslinde);

// Obtener todas las versiones no eliminadas de deslinde legal
router.get('/deslinde/todas', deslindeLegalController.getAllDeslindes);

// Obtener el deslinde legal vigente
router.get('/deslinde/vigente', deslindeLegalController.getActiveDeslinde);

// Actualizar un deslinde legal
router.put('/deslinde/actualizar', deslindeLegalController.updateDeslinde);

// Establecer un deslinde como vigente
router.put('/deslinde/activar', deslindeLegalController.setDeslindeAsActive);

// Eliminar lógicamente un deslinde legal
router.put('/deslinde/eliminar', deslindeLegalController.deleteDeslinde);
router.post('/deslinde/editar', deslindeLegalController.editDeslinde);


module.exports = router;
