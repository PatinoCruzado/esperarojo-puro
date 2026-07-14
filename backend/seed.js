const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSeed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const sqlPath = path.join(__dirname, '..', 'database', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando script SQL...');
    await connection.query(sql);
    console.log('Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  } finally {
    await connection.end();
  }
}

runSeed();
