// app.js

// 1) IMPORTAR DEPENDENCIAS
const express = require('express');
const Database = require('better-sqlite3');

// 2) CREAR APLICACIÓN EXPRESS
const app = express();

// 3) CONFIGURAR PUERTO
const PORT = 3000;

// 4) CONECTAR / CREAR BASE DE DATOS SQLITE
//    'productos.db' será el archivo de la base de datos en el disco
const db = new Database('productos.db');

// (OPCIONAL PERO RECOMENDADO: mejorar rendimiento de SQLite)
db.pragma('journal_mode = WAL');

// 5) CREAR TABLA SI NO EXISTE
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    stock INTEGER NOT NULL,
    precio REAL NOT NULL
  )
`;
db.prepare(createTableSQL).run();

// 6) INSERTAR DATOS INICIALES SI LA TABLA ESTÁ VACÍA
const countRow = db.prepare('SELECT COUNT(*) AS total FROM productos').get();

if (countRow.total === 0) {
  const insertSQL = `
    INSERT INTO productos (nombre, stock, precio)
    VALUES (?, ?, ?)
  `;
  const insertStmt = db.prepare(insertSQL);

  // Insertamos al menos 3 productos
  insertStmt.run('Teclado', 10, 15000.00);
  insertStmt.run('Mouse', 25, 8000.50);
  insertStmt.run('Monitor', 5, 75000.99);
}

// 7) ENDPOINT GET /productos -> devuelve TODOS los productos
app.get('/productos', (req, res) => {
  const selectAllSQL = 'SELECT * FROM productos';
  const productos = db.prepare(selectAllSQL).all();
  res.json(productos);
});

// 8) ENDPOINT GET /productos/:id -> devuelve UN producto por ID
app.get('/productos/:id', (req, res) => {
  // req.params.id es el valor que viene en la URL
  const id = req.params.id;

  const selectByIdSQL = 'SELECT * FROM productos WHERE id = ?';
  const producto = db.prepare(selectByIdSQL).get(id);

  if (!producto) {
    // Si no se encontró, devolvemos el mensaje requerido
    return res.json({ mensaje: 'Producto no encontrado' });
  }

  // Si existe, lo devolvemos como JSON
  res.json(producto);
});

// 9) INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});