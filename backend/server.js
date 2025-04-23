import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import env from "dotenv";
import pkg from "pg";
import nodemailer from "nodemailer";
import fs from "fs";
import session from "express-session";
import cors from "cors";
import path from "path";
import multer from "multer";
import passport from "passport";
import { body, validationResult } from "express-validator";
import { Strategy as LocalStrategy } from "passport-local";
import { fileURLToPath } from "url";
import connectPgSimple from "connect-pg-simple";

// Destructure the Pool constructor from the default export of pg (CommonJS)
const { Pool } = pkg;

const app = express();
const port = 4000;
const saltRounds = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

env.config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// Test database connection
pool.connect()
  .then(() => console.log('✔ Connected to the database'))
  .catch(err => console.error('✖ DB connection error:', err.stack));

// Session store using pg pool
const PgSessionStore = connectPgSimple(session);

app.set('trust proxy', 1);

const allowedOrigins = [                
  'https://knight-trade.onrender.com',      
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy restricts access from this origin'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(session({
  store: new PgSessionStore({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Multer setup for file uploads\ nconst storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const authenticate = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

// Email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMail = async ({ to, subject, html }) => {
  if (!to || typeof to !== 'string' || to.trim() === '') {
    throw new Error('Recipient email is missing');
  }
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
};

// Passport local strategy\ npassport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM userdata WHERE email = $1', [email]);
    if (!rows.length) return done(null, false, { message: 'User not found' });
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    return done(null, isMatch ? user : false, isMatch ? undefined : { message: 'Incorrect password' });
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.email));
passport.deserializeUser(async (email, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM userdata WHERE email = $1', [email]);
    return rows.length ? done(null, rows[0]) : done(new Error('User not found'));
  } catch (err) {
    done(err);
  }
});

// Routes
app.post('/signup', upload.single('profilePhoto'), async (req, res) => {
  const { email, password, username, address } = req.body;
  const profilePhotoUrl = req.file ? req.file.filename : '';
  try {
    const { rows: existing } = await pool.query('SELECT 1 FROM userdata WHERE email = $1', [email]);
    if (existing.length) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, saltRounds);
    const { rows } = await pool.query(
      'INSERT INTO userdata (email, username, password, address, profile_photo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [email, username, hashed, address, profilePhotoUrl]
    );
    res.status(201).json({ message: 'Registration successful', user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
    req.logIn(user, err => err ? next(err) : res.json({ message: 'Login successful', user, token: req.sessionID }));
  })(req, res, next);
});

app.get('/search', async (req, res) => {
  let sql = 'SELECT id, product_name, product_description, product_price, product_image, user_username FROM products WHERE 1=1';
  const params = [];
  const { q, minPrice, maxPrice } = req.query;
  if (q) { params.push(`%${q}%`); sql += ` AND (product_name ILIKE $${params.length} OR product_description ILIKE $${params.length})`; }
  if (minPrice) { const m = parseFloat(minPrice); if (isNaN(m)) return res.status(400).json({ error: 'Invalid min price' }); params.push(m); sql += ` AND product_price >= $${params.length}`; }
  if (maxPrice) { const m = parseFloat(maxPrice); if (isNaN(m)) return res.status(400).json({ error: 'Invalid max price' }); params.push(m); sql += ` AND product_price <= $${params.length}`; }
  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/purchaseproduct', authenticate, async (req, res) => {
  const { userEmail, username, user_id, userAddress, productName, price, product_id } = req.body;
  if (!userEmail || !username || !userAddress || !productName || !price || !user_id || !product_id)
    return res.status(400).json({ message: 'Missing fields' });
  try {
    const { rows } = await pool.query('SELECT product_email FROM products WHERE product_name=$1', [productName]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    await sendMail({
      to: rows[0].product_email,
      subject: 'New Purchase Request',
      html: `<p>New purchase request for ${productName} by ${username} (${userEmail}), address: ${userAddress}, price: ${price}</p>`
    });
    await pool.query('INSERT INTO "order" (user_id,product_id) VALUES($1,$2)', [user_id, product_id]);
    res.json({ message: 'Purchase request processed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.get('/profile', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { rows } = await pool.query('SELECT * FROM userdata WHERE email=$1', [req.user.email]);
    res.json(rows[0] || { message: 'User not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.post('/profile', upload.single('productImage'), [
  body('productName').notEmpty(),
  body('productDescription').notEmpty(),
  body('productPrice').isFloat({ gt: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { if (req.file) fs.unlinkSync(req.file.path); return res.status(400).json({ errors: errors.array() }); }
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const { productName, productDescription, productPrice } = req.body;
    const productImage = req.file.filename;
    const { rows } = await pool.query(
      'INSERT INTO products (product_name,product_description,product_price,product_image,user_username,product_email) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [productName,productDescription,productPrice,productImage,req.user.username,req.user.email]
    );
    res.json({ message: 'Product added', product: rows[0] });
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// Generic GET lists
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,product_name,product_description,product_price,product_image,user_username FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,product_name,product_description,product_price,product_image,user_username FROM products WHERE user_username=$1',[req.query.username]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.get('/api/wishlist', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'Missing user_id' });
  try {
    const { rows } = await pool.query(
      `SELECT p.id,p.product_name,p.product_price,p.product_image,p.product_description,p.user_username
       FROM wishlist w JOIN products p ON w.product_id=p.id WHERE w.user_id=$1`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/order', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'Missing user_id' });
  try {
    const { rows } = await pool.query(
      `SELECT p.id,p.product_name,p.product_price,p.product_image,p.product_description,p.user_username
       FROM "order" w JOIN products p ON w.product_id=p.id WHERE w.user_id=$1`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/wishlist/add', async (req, res) => {
  const { user_id, product_id } = req.body;
  if (!user_id || !product_id) return res.status(400).json({ error: 'Missing fields' });
  try {
    await pool.query('INSERT INTO wishlist (user_id,product_id) VALUES($1,$2)',[user_id,product_id]);
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.delete('/wishlist/remove', async (req, res) => {
  const { user_id, product_id } = req.body;
  try {
    await pool.query('DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2',[user_id,product_id]);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.delete('/delete/product', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1',[req.body.product_id]);
    res.json(rowCount ? { message: 'Product deleted' } : { error: 'Not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    req.session.destroy(err => {
      if (err) return res.status(500).json({ message: 'Session destroy failed' });
      res.clearCookie('connect.sid',{ path:'/', secure:process.env.NODE_ENV==='production', sameSite:process.env.NODE_ENV==='production'? 'none':'lax' });
      res.json({ message: 'Logout successful' });
    });
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));