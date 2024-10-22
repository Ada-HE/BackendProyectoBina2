const express = require('express');
const router = express.Router();
const termsConditionsController = require('../controllers/termsConditionsController');
const multer = require('multer');

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para crear una nueva política (ahora con soporte para archivos PDF)
router.post('/TyC/crear', upload.single('file'), termsConditionsController.createTermsConditions);

// Ruta para obtener todas las políticas
router.get('/TyC/todas', termsConditionsController.getTermsConditions);

// Ruta para obtener la política vigente
router.get('/TyC/vigente', termsConditionsController.getActiveTermsConditions);

// Ruta para actualizar una política
router.put('/TyC/actualizar', termsConditionsController.updateTermsConditions);

// Ruta para establecer una política como vigente
router.put('/TyC/activar', termsConditionsController.setTermsConditionsAsActive);
router.post('/TyC/editar', termsConditionsController.editTermsConditions);
router.put('/TyC/eliminar', termsConditionsController.deleteTermsConditions);



module.exports = router;
