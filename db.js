// db.js
const { Pool } = require('pg');

// Configura la conexión a la base de datos sin SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Exporta un objeto con el método 'query' para realizar consultas
module.exports = {
  query: (text, params) => pool.query(text, params),
};
