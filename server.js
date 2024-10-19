const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Middleware para manejar cookies
const authRoutes = require('./routes/authRoutes');  // Importar las rutas de autenticación

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Usar cookie-parser

// Configurar CORS para permitir solicitudes desde múltiples dominios (producción y desarrollo)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://consultoriodental.isoftuthh.com' // Dominio de producción
    : 'http://localhost:3000',  // Dominio de desarrollo
  credentials: true, // Permitir cookies y credenciales cruzadas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
};

app.use(cors(corsOptions));

// Asegurar que el preflight de OPTIONS esté habilitado
app.options('*', cors(corsOptions));

// Usar las rutas de autenticación
app.use('/api', authRoutes);

// Middleware para manejar errores globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal en el servidor!');
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
