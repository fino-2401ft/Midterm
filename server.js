require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { engine } = require('express-handlebars');

const { connectDB } = require('./config/db');
const { MSSV, FULL_NAME, VAT_PERCENT, PRODUCT_PREFIX } = require('./config/constants');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    helpers: {
      formatMoney(value) {
        return Number(value || 0).toLocaleString('en-US');
      },
    },
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/** Stateless session: stored on MongoDB Atlas, NOT in server RAM */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'midterm-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI_WRITE,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  })
);

/** Locals for every view (required footer fields) */
app.use((req, res, next) => {
  res.locals.fullName = FULL_NAME;
  res.locals.mssv = MSSV;
  res.locals.vatPercent = VAT_PERCENT;
  res.locals.productPrefix = PRODUCT_PREFIX;
  next();
});

app.get('/', (req, res) => res.redirect('/books'));
app.use('/books', booksRouter);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'System error',
    message: err.message || 'Internal Server Error',
  });
});

async function start() {
  if (!process.env.MONGO_URI_READ || !process.env.MONGO_URI_WRITE) {
    throw new Error('Missing MONGO_URI_READ / MONGO_URI_WRITE in .env');
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`MSSV=${MSSV} | Prefix=${PRODUCT_PREFIX} | VAT=${VAT_PERCENT}%`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
