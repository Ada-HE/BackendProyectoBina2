// backend/middleware/errorHandler.js
const logger = require('../logger'); // Importa el logger de Winston

// Middleware para manejar errores
function errorHandler(err, req, res, next) {
  // Registra el error en el archivo de logs
  logger.error({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl
  });

  // Envía una respuesta genérica al cliente
  res.status(500).json({
    error: 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.'
  });
}

module.exports = errorHandler;
