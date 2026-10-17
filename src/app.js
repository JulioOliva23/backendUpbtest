require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productoRoutes = require('./routes/producto.routes');
const initDb = require('./db/init');

const app = express();

// Permite peticiones desde cualquier origen (frontend desplegado)
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', mensaje: 'API backendUpb funcionando' });
});

// Healthcheck para Render (Health Check Path: /health)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/productos', productoRoutes);

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores: HttpError usa su status, cualquier otro error es 500
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido' });
    }
    if (err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const port = process.env.PORT || 3000;

const start = async () => {
    if (!process.env.DATABASE_URL) {
        console.error('Falta la variable de entorno DATABASE_URL ❌');
        process.exit(1);
    }
    try {
        await initDb();
        console.log('Tabla "productos" lista ✅');
    } catch (err) {
        console.error('No se pudo inicializar la base de datos ❌', err.message);
        process.exit(1);
    }
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

if (require.main === module) start();

module.exports = app;
