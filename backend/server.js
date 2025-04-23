import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import env from "dotenv";
import pg from "pg";
import nodemailer from 'nodemailer';
import fs from "fs";
import session from "express-session";
import cors from "cors";
import path from "path";
import multer from "multer";
import passport from "passport";
import {body , validationResult} from "express-validator";
import { Strategy as LocalStrategy } from "passport-local";
import { fileURLToPath } from 'url';

const app = express();
const port = 4000;
const saltRounds = 10;
const MemoryStore = memorystoreFactory(session);  

env.config();



// Configure allowed origins
const allowedOrigins = [                 // Local development
  'https://knight-trade.onrender.com',       // Production frontend
  // 'http://172.16.170.179:3000'            // Only include if you need LAN access
];

app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new MemoryStore({
      checkPeriod: 24 * 60 * 60 * 1000, 
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,      
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());



const PG = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); 
  },
});
const upload = multer({ storage });


PG.connect(err => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to the database');
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const authenticate = (req, res, next) => {
  if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,   
  },
});

const sendMail = async ({ to, subject, html }) => {

  if (!to || typeof to !== 'string' || to.trim() === "") {
    console.error('Recipient email is missing. Provided "to" value:', to);
    throw new Error('Recipient email is missing');
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  }; 

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
  try {
    const result = await PG.query("SELECT * FROM userdata WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return done(null, false, { message: "User not found" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Incorrect password" });
    }
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.email); 
});

passport.deserializeUser(async (email, done) => {
  try {
    const result = await PG.query("SELECT * FROM userdata WHERE email = $1", [email]);

    if (result.rows.length > 0) {
      done(null, result.rows[0]); 
    } else {
      done(new Error("User not found"), null);
    }
  } catch (err) {
    done(err, null);
  }
});


app.post("/signup", upload.single('profilePhoto'), async (req, res) => {
  const { email, password, username, address } = req.body;
  let profilePhotoUrl = '';

  if (req.file) {
    profilePhotoUrl = req.file.filename;
  }

  try {
    const checkResult = await PG.query("SELECT * FROM userdata WHERE email = $1", [email]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await PG.query(
      "INSERT INTO userdata (email, username, password, address, profile_photo) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [email, username, hashedPassword, address, profilePhotoUrl]
    );

    const user = result.rows[0];
    res.status(201).json({ message: "Registration successful", user });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/search', async (req, res) => {
  const { q, minPrice, maxPrice } = req.query;

  let query = `
    SELECT id, product_name, product_description, product_price, product_image , user_username
    FROM products
    WHERE 1=1`;
  const queryParams = [];

  if (q) {
    queryParams.push(`%${q}%`);
    query += ` AND (product_name ILIKE $${queryParams.length} OR product_description ILIKE $${queryParams.length})`;
  }


  if (minPrice) {
    const min = parseFloat(minPrice);
    if (isNaN(min)) {
      return res.status(400).json({ error: 'Invalid minimum price' });
    }
    queryParams.push(min);
    query += ` AND product_price >= $${queryParams.length}`;
  }

 
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (isNaN(max)) {
      return res.status(400).json({ error: 'Invalid maximum price' });
    }
    queryParams.push(max);
    query += ` AND product_price <= $${queryParams.length}`;
  }

  try {
    const result = await PG.query(query, queryParams);
    res.status(200).json(result.rows.length > 0 ? result.rows : []);
  } catch (error) {
    console.error('Error in /search route:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log("user:", req.user);
      res.status(200).json({ 
        message: "Login successful", 
        user: req.user, 
        token: req.sessionID 
      });
    });
  })(req, res, next);
});

app.post('/purchaseproduct', authenticate, async (req, res) => {
  const { userEmail, username, user_id, userAddress, productName, price, product_id } = req.body;

  if (!userEmail || !username || !userAddress || !productName || !price || !user_id || !product_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {

    const { rows } = await PG.query(
      'SELECT product_email FROM products WHERE product_name = $1',
      [productName]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const productOwnerEmail = rows[0].product_email;

    const emailHtml = `
      <p>Hello,</p>
      <p>You have received a new purchase request for your product: <strong>${productName}</strong>.</p>
      <p>Buyer Details:</p>
      <ul>
        <li>Name: ${username}</li>
        <li>Email: ${userEmail}</li>
        <li>Address: ${userAddress}</li>
      </ul>
      <p>Product Price: $${price}</p>
      <p>Please reach out to the buyer to confirm the purchase.</p>
      <p>Thank you,<br>Your Company Name</p>
    `;

    await sendMail({
      to: productOwnerEmail,
      subject: 'New Purchase Request for Your Product',
      html: emailHtml,
    });

    await PG.query(
      'INSERT INTO "order" (user_id, product_id) VALUES ($1, $2)',
      [user_id, product_id]
    );

    return res.status(200).json({ message: 'Purchase request sent and product added to wishlist' });
  } catch (error) {
    console.error('Error in /purchaseproduct endpoint:', error);
    return res.status(500).json({ message: 'An error occurred processing your request' });
  }
});




app.get("/profile", async (req, res) => {
  console.log("Session info:", req.session);
  console.log("Is Authenticated:", req.isAuthenticated());
  console.log("User:", req.user);

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
   else {
  const result = await PG.query("SELECT * FROM userdata WHERE email = $1", [req.user.email]);
    if (result.rows.length > 0) {
      console.log('Authenticated user:', result.rows[0]);
      return res.status(200).json({ user: result.rows[0], status: "ok" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
   }
});


app.post("/profile",
  upload.single('productImage'),
  (req, res, next) => {
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);
    next();
  },
  [
    body('productName').notEmpty().withMessage('Product name is required'),
    body('productDescription').notEmpty().withMessage('Product description is required'),
    body('productPrice').isFloat({ gt: 0 }).withMessage('Product price must be a valid number greater than 0'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) fs.unlinkSync(req.file.path); 
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { productName, productDescription, productPrice } = req.body;
    const productImage = req.file.filename;

    try {
      const result = await PG.query(
        'INSERT INTO products (product_name, product_description, product_price, product_image, user_username , product_email) VALUES ($1, $2, $3, $4, $5 , $6) RETURNING *',
        [productName, productDescription, productPrice, productImage, req.user.username , req.user.email]
      );

      res.status(200).json({ message: "Product added successfully", product: result.rows[0] });
    } catch (err) {
      console.error("Database error:", err.message);
      if (req.file) fs.unlinkSync(req.file.path); 
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/products', async (req, res) => {
  
  try {
    
      const result = await PG.query(
          'SELECT id, product_name, product_description, product_price, product_image, user_username FROM products '
      );
      res.status(200).json(result.rows);
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.get("/products", async (req, res) => {
  const { username } = req.query; 
  console.log("username", username);
  try {
      const result = await PG.query(
          'SELECT  id, product_name, product_description, product_price, product_image, user_username FROM products WHERE user_username = $1',
          [username]
      );
      res.json(result.rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/wishlist', async (req, res) => {
  
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id parameter' });
  }

  try {
    const query = `
      SELECT p.id, p.product_name, p.product_price, p.product_image ,p.product_description,p.user_username
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
    `;
    const { rows } = await PG.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching wishlist items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/order', async (req, res) => {
 
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id parameter' });
  }

  try {
    const query = `
      SELECT p.id, p.product_name, p.product_price, p.product_image , p.product_description,p.user_username,p.id
      FROM "order" w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
    `;
    const { rows } = await PG.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching wishlist items:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/wishlist/add', async (req, res) => {
  const {user_id} = req.body;
  const { product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ error: 'Missing product_id or user authentication' });
  }

  try {
    await PG.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)', [user_id, product_id]);
    res.status(201).json({ message: 'Product added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding to wishlist' });
  }
});

app.delete('/wishlist/remove', async (req, res) => {
  const { user_id, product_id } = req.body;

  try {
    await PG.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [user_id, product_id]);
    res.json({ message: 'product removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error removing from wishlist' });
  }
});

app.delete('/delete/product', async (req, res) => {
  const { product_id } = req.body;
  console.log(product_id);
  try {
    const result = await PG.query('DELETE FROM products WHERE id = $1', [product_id]);
   
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error removing from wishlist' });
  }
});



app.post('/logout', (req, res) => {
  req.logout((err) => {
      if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
          if (err) {
              console.error("Session destruction error:", err);
              return res.status(500).json({ message: "Session destruction failed" });
          }
          res.clearCookie('connect.sid', { path: '/' }); 
          res.status(200).json({ message: "Logout successful" });
      });
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
