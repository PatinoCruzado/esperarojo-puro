const pool = require('./backend/config/db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT 1 as val');
    console.log('DB SUCCESS', rows);
    process.exit(0);
  } catch (err) {
    console.error('DB ERROR', err.message);
    process.exit(1);
  }
}
test();
