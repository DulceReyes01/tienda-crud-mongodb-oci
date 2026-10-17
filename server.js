const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// URL de conexión (ajusta usuario/clave si tu mongo tiene auth)
const url = 'mongodb://admin:12345678@127.0.0.1:27017/tienda_db?authSource=admin';
// const url = 'mongodb://admin:12345678@127.0.0.1:27017/tienda_db?authSource=admin';

const dbName = 'tienda_db';

// 1. READ: Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const productos = await db.collection('productos').find({}).toArray();
    res.status(200).json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.close();
  }
});

// 2. CREATE: Insertar un nuevo producto
app.post('/api/productos', async (req, res) => {
  let client;
  try {
    const nuevoProducto = req.body;
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const resultado = await db.collection('productos').insertOne(nuevoProducto);
    res.status(201).json({ mensaje: 'Producto creado exitosamente', id: resultado.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.close();
  }
});

// 3. UPDATE: Actualizar precio o stock por SKU
app.put('/api/productos/:sku', async (req, res) => {
  let client;
  try {
    const { sku } = req.params;
    const { precio, stock } = req.body;
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(dbName);
    
    const resultado = await db.collection('productos').updateOne(
      { sku: sku },
      { $set: { precio: Number(precio), stock: Number(stock) } }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ mensaje: 'Producto actualizado con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.close();
  }
});

// 4. DELETE: Eliminar producto por SKU
app.delete('/api/productos/:sku', async (req, res) => {
  let client;
  try {
    const { sku } = req.params;
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const resultado = await db.collection('productos').deleteOne({ sku: sku });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.close();
  }
});

app.listen(port, () => {
  console.log(`Servidor CRUD corriendo en http://localhost:${port}`);
});
