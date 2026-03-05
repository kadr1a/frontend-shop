const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
  });
  next();
});

let products = [
  { id: nanoid(6), name: 'Ноутбук1', price: 800, category: 'Электроника', stock: 5 },
  { id: nanoid(6), name: 'Наушники1', price: 50, category: 'Аксессуары', stock: 10 },
  { id: nanoid(6), name: 'Мышь1', price: 25, category: 'Аксессуары', stock: 15 },
    { id: nanoid(6), name: 'Ноутбук2', price: 800, category: 'Электроника', stock: 5 },
  { id: nanoid(6), name: 'Наушники2', price: 50, category: 'Аксессуары', stock: 10 },
  { id: nanoid(6), name: 'Мышь2', price: 25, category: 'Аксессуары', stock: 15 },
    { id: nanoid(6), name: 'Ноутбук3', price: 800, category: 'Электроника', stock: 5 },
  { id: nanoid(6), name: 'Наушники3', price: 50, category: 'Аксессуары', stock: 10 },
  { id: nanoid(6), name: 'Мышь3', price: 25, category: 'Аксессуары', stock: 15 },
    { id: nanoid(6), name: 'Ноутбук4', price: 800, category: 'Электроника', stock: 5 },
];

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API интернет-магазина',
      version: '1.0.0',
      description: 'Управление товарами'
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Локальный сервер' }]
  },
  apis: ['./app.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (product) res.json(product);
});
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создает новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Товар создан
 */
app.post('/api/products', (req, res) => {
  const { name, price, category, stock } = req.body;
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    price: Number(price),
    category: category || 'Другое',
    stock: Number(stock) || 0
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  
  if (req.body.name) product.name = req.body.name.trim();
  if (req.body.price) product.price = Number(req.body.price);
  if (req.body.category) product.category = req.body.category;
  if (req.body.stock) product.stock = Number(req.body.stock);
  
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ error: 'Product not found' });
  
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
  console.log(`Swagger docs on http://localhost:${port}/api-docs`);
});