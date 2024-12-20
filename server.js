const express = require('express');
const cors = require('cors');
const xss = require('xss-clean');
const errorHandler = require('./middleware/errorHandler'); // Importa el middleware de errores

const cookieParser = require('cookie-parser');
const csrf = require('csurf'); // Importar csurf
const rateLimit = require('express-rate-limit'); // Importar express-rate-limit
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const authRoutesPoliticas = require('./routes/privacyPolicyRoutes');
const authDeslindeLegal = require('./routes/deslindeLegalRoutes');
const authTyC = require('./routes/termsConditionsRoutes');
const authRedesSociales = require('./routes/socialMediaRoutes')
const authEslogan = require('./routes/esloganRoutes')
const authLogoNombre = require('./routes/logoNombreRoutes')
const authContacto = require('./routes/contactoRoutes')
const authEmpresaNombre = require('./routes/empresaNombreRoutes')

const app = express();
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
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,  // La cookie no es accesible desde JavaScript del lado del cliente
    secure: process.env.NODE_ENV === 'production',  // Solo enviar la cookie si estás en producción y usando HTTPS
    sameSite: 'None',  // Permitir el uso de cookies cross-site (entre sitios)
    path: '/',  // Asegúrate de que la cookie esté disponible en todas las rutas
  }
});
app.use(csrfProtection);  // Aplicar la protección CSRF en toda la app

// Ruta para obtener el token CSRF
app.get('/api/get-csrf-token', (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None', });
  res.json({ csrfToken: req.csrfToken() });
});



// Usar las rutas de autenticación
app.use('/api', authRoutes);
app.use('/api', authRoutesPoliticas);
app.use('/api', authDeslindeLegal);
app.use('/api', authTyC);
app.use('/api', authRedesSociales);
app.use('/api', authEslogan);
app.use('/api', authLogoNombre);
app.use('/api', authContacto);
app.use('/api', authEmpresaNombre);




// Manejo de errores (debe ir después de todas las rutas)
app.use(errorHandler);
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
require('./ping');
