const MSSV = process.env.MSSV || '23IT005';
const FULL_NAME = process.env.FULL_NAME || 'Nguyen Le Quoc Anh';

/** Last 3 digits of student ID — required product code prefix */
const PRODUCT_PREFIX = MSSV.slice(-3);

/** VAT = (last digit of student ID + 6)% */
const VAT_PERCENT = Number(MSSV.slice(-1)) + 6;
const VAT_RATE = VAT_PERCENT / 100;

module.exports = {
  MSSV,
  FULL_NAME,
  PRODUCT_PREFIX,
  VAT_PERCENT,
  VAT_RATE,
};
