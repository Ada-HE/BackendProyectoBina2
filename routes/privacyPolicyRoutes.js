const express = require('express');
const router = express.Router();
const privacyPolicyController = require('../controllers/privacyPolicyController');
const multer = require('multer');

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para crear una nueva política (ahora con soporte para archivos PDF)
router.post('/crear', upload.single('file'), privacyPolicyController.createPolicy);

// Ruta para obtener todas las políticas
router.get('/todas', privacyPolicyController.getAllPolicies);

// Ruta para obtener la política vigente
router.get('/vigente', privacyPolicyController.getActivePolicy);

// Ruta para actualizar una política
router.put('/actualizar', privacyPolicyController.updatePolicy);

// Ruta para establecer una política como vigente
router.put('/activar', privacyPolicyController.setPolicyAsActive);
router.post('/editar', privacyPolicyController.editPolicy);
router.put('/eliminar', privacyPolicyController.deletePolicy);



module.exports = router;
