const mysql = require('mysql2');

// Configuración del pool de conexiones a MySQL (Hostinger)
const pool = mysql.createPool({
  host: '193.203.166.102',
  user: 'u666156220_consultorio',
  password: 'consultorioDental24$',
  database: 'u666156220_consulDental',
  port: 3306,
  connectionLimit: 10,  // Número máximo de conexiones en el pool
});

// Verificar la conexión al crear el pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('Conexión a MySQL exitosa');
  connection.release();  // Liberar la conexión después de usarla
});

module.exports = pool;  // Exportar el pool para usarlo en otros archivos

