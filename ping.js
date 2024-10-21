const https = require('https');

// URL de tu servidor en Render
const url = 'https://backendproyectobina2.onrender.com';

// Función para hacer una solicitud GET periódica
function pingServer() {
  https.get(url, (res) => {
    console.log(`Estado del servidor: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Error haciendo ping:', err.message);
  });
}

// Hacer ping cada 5 minutos (300000 milisegundos)
setInterval(pingServer, 300);
