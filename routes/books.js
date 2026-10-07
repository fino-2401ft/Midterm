const express = require('express');
const { getReadConn, getWriteConn } = require('../config/db');
const { getBookModel } = require('../models/Book');
const { PRODUCT_PREFIX, VAT_RATE, VAT_PERCENT } = require('../config/constants');

const router = express.Router();

/** GET /books — READ account only */
router.get('/', async (req, res, next) => {
  try {
    const BookRead = getBookModel(getReadConn());
    const books = await BookRead.find().sort({ createdAt: -1 }).lean();

    if (!req.session.visitCount) req.session.visitCount = 0;
    req.session.visitCount += 1;

    res.render('books/index', {
      title: 'Book list',
      books,
      visitCount: req.session.visitCount,
      productPrefix: PRODUCT_PREFIX,
      vatPercent: VAT_PERCENT,
    });
  } catch (err) {
    next(err);
  }
});

/** GET /books/create — add-book form */
router.get('/create', (req, res) => {
  res.render('books/create', {
    title: 'Add a new book',
    productPrefix: PRODUCT_PREFIX,
    vatPercent: VAT_PERCENT,
  });
});

/** POST /books — WRITE account only */
router.post('/', async (req, res, next) => {
  try {
    const { code, title, author, price } = req.body;
    const trimmedCode = (code || '').trim();

    if (!trimmedCode.startsWith(PRODUCT_PREFIX)) {
      return res.status(400).render('books/create', {
        title: 'Add a new book',
        productPrefix: PRODUCT_PREFIX,
        vatPercent: VAT_PERCENT,
        error: `Product code must start with prefix "${PRODUCT_PREFIX}" (last 3 digits of student ID).`,
        form: { code: trimmedCode, title, author, price },
      });
    }

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).render('books/create', {
        title: 'Add a new book',
        productPrefix: PRODUCT_PREFIX,
        vatPercent: VAT_PERCENT,
        error: 'Invalid price.',
        form: { code: trimmedCode, title, author, price },
      });
    }

    const priceAfterVAT = Math.round(priceNum * (1 + VAT_RATE));

    const BookWrite = getBookModel(getWriteConn());
    await BookWrite.create({
      code: trimmedCode,
      title: (title || '').trim(),
      author: (author || '').trim(),
      price: priceNum,
      priceAfterVAT,
    });

    res.redirect('/books');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
