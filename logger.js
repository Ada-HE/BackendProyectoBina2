// backend/logger.js
const winston = require('winston');
const path = require('path');

// Configuración de Winston para guardar logs en un archivo
const logger = winston.createLogger({
  level: 'error', // Se registrarán mensajes de nivel 'error' o más graves
  format: winston.format.combine(
    winston.format.timestamp(), // Añade timestamp a los logs
    winston.format.json() // Guarda los logs en formato JSON
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, 'logs', 'errores.log') // Archivo donde se guardan los errores
    })
  ]
});

module.exports = logger;
