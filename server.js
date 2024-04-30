const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'capitan',
  host: 'localhost',
  database: 'joyas',
  port: 5432,
});

// Middleware para analizar la consulta de la URL
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware para registrar las solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Ruta GET /joyas
app.get('/joyas', async (req, res) => {
  try {
    const { limit = 10, page = 1, order_by = 'id_ASC' } = req.query;
    const offset = (page - 1) * limit;

    // Validar y procesar el parámetro order_by
    const validColumns = ['id', 'nombre', 'categoria', 'metal', 'precio', 'stock'];
    let [column, order] = order_by.split('_');
    if (!validColumns.includes(column)) {
      throw new Error('Columna de ordenamiento inválida');
    }
    if (order !== 'ASC' && order !== 'DESC') {
      throw new Error('Dirección de ordenamiento inválida');
    }

    const query = `SELECT * FROM inventario ORDER BY ${column} ${order} LIMIT $1 OFFSET $2`;
    const result = await pool.query(query, [limit, offset]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ruta GET /joyas/filtros
app.get('/joyas/filtros', async (req, res) => {
  try {
    const { precio_max, precio_min, categoria, metal } = req.query;

    let filters = [];
    let params = [];

    if (precio_max) {
      filters.push('precio <= $' + (params.length + 1));
      params.push(precio_max);
    }

    if (precio_min) {
      filters.push('precio >= $' + (params.length + 1));
      params.push(precio_min);
    }

    if (categoria) {
      filters.push('categoria = $' + (params.length + 1));
      params.push(categoria);
    }

    if (metal) {
      filters.push('metal = $' + (params.length + 1));
      params.push(metal);
    }

    if (filters.length === 0) {
      throw new Error('Debes proporcionar al menos un filtro');
    }

    const query = `SELECT * FROM inventario WHERE ${filters.join(' AND ')}`;
    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
