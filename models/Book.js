const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    priceAfterVAT: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

function getBookModel(connection) {
  return connection.models.Book || connection.model('Book', bookSchema);
}

module.exports = { bookSchema, getBookModel };
