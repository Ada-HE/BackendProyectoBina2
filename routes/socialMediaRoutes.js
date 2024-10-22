const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');

// Ruta para crear una nueva red social
router.post('/redSocial/crear', socialMediaController.createSocialMedia);

// Ruta para obtener todas las redes sociales
router.get('/redSocial', socialMediaController.getAllSocialMedia);

// Ruta para actualizar una red social
router.put('/redSocial/editar/:id', socialMediaController.updateSocialMedia);

// Ruta para eliminar una red social
router.delete('/redSocial/eliminar/:id', socialMediaController.deleteSocialMedia);

module.exports = router;
