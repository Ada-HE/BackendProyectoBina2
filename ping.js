/*const https = require('https');

// URL de tu servidor en Render
const url = 'https://localhost:4000';

// Función para hacer una solicitud GET periódica
function pingServer() {
  https.get(url, (res) => {
    console.log(`Estado del servidor: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Error haciendo ping:', err.message);
  });
}

// Hacer ping cada 1 minuto (60,000 milisegundos)
setInterval(pingServer, 10000);  // Enviar ping cada 1 minuto*/
