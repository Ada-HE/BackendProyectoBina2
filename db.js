const mysql = require('mysql2');

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // O tu contraseña de MySQL si tienes una
  database: 'consultorio_dental',  // El nombre de la base de datos que creaste
  port: 3306  // Puerto de MySQL (3306 es el puerto por defecto)
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('Conexión a MySQL exitosa');
});

module.exports = db;  // Exporta la conexión para usarla en otros archivos
