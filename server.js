const express = require('express');
const cors = require('cors');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const csrf = require('csurf'); // Importar csurf
const rateLimit = require('express-rate-limit'); // Importar express-rate-limit
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

const app = express();

// Logs para verificar variables de entorno
console.log('Entorno actual:', process.env.NODE_ENV);
console.log('Puerto definido:', process.env.PORT);

// Middleware para parsear JSON y cookies
app.use(express.json());
app.use(cookieParser());

// Middleware de xss-clean para evitar inyecciones XSS
app.use(xss());

// Configurar CORS para aceptar solicitudes de frontends específicos
const corsOptions = {
  origin: ['https://consultoriodental.isoftuthh.com', 'http://localhost:3000'],
  credentials: true,  // Permitir envío de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token'],  // Incluir CSRF token en allowedHeaders
};

app.use(cors(corsOptions));

// Asegurar que el preflight de OPTIONS esté habilitado
app.options('*', cors(corsOptions));

// Configuración de CSRF usando cookies
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);  // Aplicar la protección CSRF en toda la app

// Ruta para obtener el token CSRF
app.get('/api/get-csrf-token', (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: true, secure: true, sameSite: 'None', });
  res.json({ csrfToken: req.csrfToken() });
});

// Usar las rutas de autenticación
app.use('/api', authRoutes);

// Middleware para manejar errores globales
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {  // Manejar errores de CSRF
    return res.status(403).json({ message: 'Fallo en la validación del CSRF token' });
  }
  console.error('Error:', err.stack);
  res.status(500).send('¡Algo salió mal en el servidor!');
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
