const mongoose = require('mongoose');

let readConn;
let writeConn;

async function connectDB() {
  readConn = mongoose.createConnection(process.env.MONGO_URI_READ);
  writeConn = mongoose.createConnection(process.env.MONGO_URI_WRITE);

  await Promise.all([
    readConn.asPromise(),
    writeConn.asPromise(),
  ]);

  console.log('MongoDB READ connected (user_read_23IT005)');
  console.log('MongoDB WRITE connected (user_write_23IT005)');

  return { readConn, writeConn };
}

function getReadConn() {
  if (!readConn) throw new Error('Read connection not ready');
  return readConn;
}

function getWriteConn() {
  if (!writeConn) throw new Error('Write connection not ready');
  return writeConn;
}

module.exports = { connectDB, getReadConn, getWriteConn };
