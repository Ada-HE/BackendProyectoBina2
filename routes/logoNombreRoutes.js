const express = require('express');
const { registrarLogoNombre, actualizarLogoNombre, obtenerLogoNombre } = require('../controllers/logoNombreController');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de Multer para almacenar en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'empresa_logo', // Nombre de la carpeta en Cloudinary
    format: async (req, file) => 'png', // Puedes ajustar el formato aquí
    public_id: (req, file) => file.originalname, // Nombre del archivo
  }
});

const upload = multer({ storage: storage });

// Ruta para registrar nombre y logo
router.post('/logo-nombre/registrar', upload.single('logo'), registrarLogoNombre);

// Ruta para obtener el nombre y logo actuales
router.get('/logo-nombre/ver', obtenerLogoNombre);

// Ruta para actualizar nombre y logo por ID
router.put('/logo-nombre/actualizar/:id', upload.single('logo'), actualizarLogoNombre);

module.exports = router;
