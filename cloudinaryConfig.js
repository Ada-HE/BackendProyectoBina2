require('dotenv').config(); // Cargar las variables de entorno

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar Multer para almacenar archivos en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'logos', // Puedes poner un nombre de carpeta donde se guardarán los archivos
    format: async (req, file) => 'png', // Ajusta el formato si es necesario
    public_id: (req, file) => file.originalname, // El nombre del archivo en Cloudinary
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
