const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const ACCESS_SECRET = "access_secret_key_123";
const REFRESH_SECRET = "refresh_secret_key_456";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

let users = [];
async function createAdminIfNotExists() {
    const adminExists = users.find(u => u.username === 'admin');
    if (!adminExists) {
        const hashedPassword = await hashPassword('admin123');
        users.push({
            id: nanoid(8),
            username: 'admin',
            age: 30,
            role: 'admin',
            hashedPassword: hashedPassword,
            isActive: true
        });
    }
}
const refreshTokens = new Set();

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, role: user.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, role: user.role },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied. Insufficient permissions" });
        }
        next();
    };
}

app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
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

function findUserById(id, res) {
    const user = users.find(u => u.id === id);
    if (!user) {
        if (res) res.status(404).json({ error: "user not found" });
        return null;
    }
    return user;
}

function findUserByUsername(username) {
    return users.find(u => u.username === username);
}

function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API интернет-магазина',
      version: '1.0.0',
      description: 'Управление товарами и пользователями с RBAC'
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Локальный сервер' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            stock: { type: 'integer' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            age: { type: 'integer' },
            role: { type: 'string', enum: ['user', 'seller', 'admin'] }
          }
        },
        Tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./app.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - age
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               age:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Не хватает данных или пользователь уже существует
 */
app.post("/api/auth/register", async (req, res) => {
    const { username, age, password, role } = req.body;
    if (!username || !password || age === undefined) {
        return res.status(400).json({ error: "username, password and age are required" });
    }
    
    const existingUser = findUserByUsername(username);
    if (existingUser) {
        return res.status(400).json({ error: "username already exists" });
    }
    
    const userRole = role && ['user', 'seller', 'admin'].includes(role) ? role : 'user';
    
    const newUser = {
        id: nanoid(8),
        username: username,
        age: Number(age),
        role: userRole,
        hashedPassword: await hashPassword(password),
        isActive: true
    };
    users.push(newUser);
    res.status(201).json({ id: newUser.id, username: newUser.username, age: newUser.age, role: newUser.role });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Неверные учетные данные
 */
app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }
    
    const user = findUserByUsername(username);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (user.isActive === false) {
        return res.status(403).json({ error: "Account is blocked" });
    }
    
    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);
    
    res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление пары токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Неверный refresh токен
 */
app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required" });
    }
    
    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }
    
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);
        if (!user || user.isActive === false) {
            return res.status(401).json({ error: "User not found or blocked" });
        }
        
        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);
        
        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = findUserById(userId);
    if (!user) {
        return res.status(404).json({ error: "user not found" });
    }
    res.json({ id: user.id, username: user.username, age: user.age, role: user.role });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Недостаточно прав
 */
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const usersList = users.map(u => ({
        id: u.id,
        username: u.username,
        age: u.age,
        role: u.role,
        isActive: u.isActive
    }));
    res.json(usersList);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: user.id, username: user.username, age: user.age, role: user.role, isActive: user.isActive });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию о пользователе (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               age:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    if (req.body.username) user.username = req.body.username;
    if (req.body.age) user.age = Number(req.body.age);
    if (req.body.role && ['user', 'seller', 'admin'].includes(req.body.role)) {
        user.role = req.body.role;
    }
    
    res.json({ id: user.id, username: user.username, age: user.age, role: user.role });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    user.isActive = false;
    res.json({ message: "User blocked", id: user.id, username: user.username });
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары (доступно всем аутентифицированным)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', authMiddleware, (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID (доступно всем аутентифицированным)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (product) res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар (только продавец и админ)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *                 type: integer
 *     responses:
 *       201:
 *         description: Товар создан
 *       403:
 *         description: Недостаточно прав
 */
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
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

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар (только продавец и админ)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    
    if (req.body.name) product.name = req.body.name.trim();
    if (req.body.price) product.price = Number(req.body.price);
    if (req.body.category) product.category = req.body.category;
    if (req.body.stock) product.stock = Number(req.body.stock);
    
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (только админ)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удален
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const exists = products.some(p => p.id === req.params.id);
    if (!exists) return res.status(404).json({ error: 'Product not found' });
    
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

createAdminIfNotExists().then(() => {
    app.listen(port, () => {
        console.log(`Server on http://localhost:${port}`);
            console.log(`Swagger docs on http://localhost:${port}/api-docs`);
    });
});