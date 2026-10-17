require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Crea la tabla "productos" si no existe (y migra el esquema anterior si hace falta)
const initDb = () => pool.query(sql);

module.exports = initDb;

// Permite ejecutarlo a mano con `npm run db:init`
if (require.main === module) {
    initDb()
        .then(() => console.log('Tabla "productos" lista ✅'))
        .catch((err) => {
            console.error('Error al crear la tabla ❌', err.message);
            process.exitCode = 1;
        })
        .finally(() => pool.end());
}
