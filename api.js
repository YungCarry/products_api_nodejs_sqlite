const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

app.use(bodyParser.json());

const db = new sqlite3.Database('./products.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    picture TEXT,
    price REAL
  )`);
});

app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ products: rows });
  });
});

app.post('/products', (req, res) => {
  const { name, description, picture, price } = req.body;
  db.run('INSERT INTO products (name, description, picture, price) VALUES (?, ?, ?, ?)', [name, description, picture, price], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ product: row });
  });
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, picture, price } = req.body;
  db.run('UPDATE products SET name = ?, description = ?, picture = ?, price = ? WHERE id = ?', [name, description, picture, price, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Szerver fut:  http://localhost:${port}`);
});