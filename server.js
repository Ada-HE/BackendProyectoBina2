const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Importar cookie-parser
const authRoutes = require('./routes/authRoutes');  // Importar las rutas de autenticación

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Añadir cookie-parser

// Configuración de CORS en tu backend (Render)
const corsOptions = {
  origin: ['https://consultoriodental.isoftuthh.com'],  // Dominio del frontend
  credentials: true, // Permitir envío de cookies
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
