const express = require('express');
const { registrarLogo, obtenerLogoVigente, obtenerLogosNoVigentes, activarLogo } = require('../controllers/logoNombreController');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'empresa_logo',
    format: async (req, file) => 'png',
    public_id: (req, file) => file.originalname,
  }
});

const upload = multer({ storage: storage });

router.get('/logo/vigente', obtenerLogoVigente);
router.get('/logo/no-vigente', obtenerLogosNoVigentes);
router.post('/logo/registrar', upload.single('logo'), registrarLogo);
router.put('/logo/activar', activarLogo);

module.exports = router;
