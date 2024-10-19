const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Importar cookie-parser
const authRoutes = require('./routes/authRoutes');  // Importar las rutas de autenticación

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Añadir cookie-parser

// Configurar CORS para permitir solicitudes desde múltiples dominios (producción y desarrollo)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://consultoriodental.isoftuthh.com'] // Dominio de producción
    : ['http://localhost:3000'],  // Dominio local para desarrollo
  credentials: true, // Permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
};

app.use(cors(corsOptions));

// Asegurar que el preflight de OPTIONS esté habilitado
app.options('*', cors(corsOptions));

// Usar las rutas de autenticación
app.use('/api', authRoutes);

// Iniciar servidor
app.listen(4000, () => {
  console.log('Servidor corriendo en el puerto 4000');
});
