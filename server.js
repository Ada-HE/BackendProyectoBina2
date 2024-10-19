const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');  // Importar las rutas de autenticación

const app = express();

// Middleware
app.use(express.json());

// Configurar CORS para permitir solicitudes desde múltiples dominios (producción y desarrollo)
const corsOptions = {
  origin: ['http://localhost:3000', 'https://consultoriodental.isoftuthh.com'], // Dominios permitidos
  credentials: true, // Necesario para que las cookies sean enviadas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
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
