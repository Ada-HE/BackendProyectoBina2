const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Logs para verificar variables de entorno
console.log('Entorno actual:', process.env.NODE_ENV);
console.log('Puerto definido:', process.env.PORT);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Configurar CORS
const corsOptions = {
  origin: ['https://consultoriodental.isoftuthh.com'],
  credentials: true,  // Esto permite enviar cookies con las solicitudes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));


// Asegurar que el preflight de OPTIONS esté habilitado
app.options('*', cors(corsOptions));

// Usar las rutas de autenticación
app.use('/api', authRoutes);

// Middleware para manejar errores globales
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('¡Algo salió mal en el servidor!');
});
console.log('Entorno actual:', process.env.NODE_ENV);

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
