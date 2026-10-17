const HttpError = require('../utils/http-error');

// Límites de las columnas: NUMERIC(10, 2) e INTEGER de PostgreSQL
const PRECIO_MAXIMO = 99999999.99;
const STOCK_MAXIMO = 2147483647;

const esObjeto = (valor) => typeof valor === 'object' && valor !== null && !Array.isArray(valor);

// Valida y filtra lo que manda el cliente; solo deja pasar los campos permitidos
const validarCampos = (body, { parcial }) => {
    if (body !== undefined && !esObjeto(body)) {
        throw new HttpError(400, 'El cuerpo de la petición debe ser un objeto JSON');
    }

    const errores = [];
    const datos = {};
    const { nombre, precio, stock } = body || {};

    if (nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim() === '') errores.push('"nombre" debe ser un texto no vacío');
        else if (nombre.trim().length > 100) errores.push('"nombre" no puede superar 100 caracteres');
        else datos.nombre = nombre.trim();
    } else if (!parcial) {
        errores.push('"nombre" es obligatorio');
    }

    if (precio !== undefined) {
        // Number.isFinite descarta NaN, Infinity y cualquier valor que no sea number
        if (!Number.isFinite(precio) || precio <= 0) errores.push('"precio" debe ser un número mayor a 0');
        else if (precio > PRECIO_MAXIMO) errores.push(`"precio" no puede superar ${PRECIO_MAXIMO}`);
        else datos.precio = precio;
    } else if (!parcial) {
        errores.push('"precio" es obligatorio');
    }

    if (stock !== undefined) {
        if (!Number.isInteger(stock) || stock < 0) errores.push('"stock" debe ser un entero mayor o igual a 0');
        else if (stock > STOCK_MAXIMO) errores.push(`"stock" no puede superar ${STOCK_MAXIMO}`);
        else datos.stock = stock;
    } else if (!parcial) {
        errores.push('"stock" es obligatorio');
    }

    if (parcial && Object.keys(datos).length === 0 && errores.length === 0) {
        errores.push('Debes enviar al menos un campo: nombre, precio o stock');
    }

    if (errores.length > 0) throw new HttpError(400, errores.join(', '));
    return datos;
};

// DTO de entrada para POST (nombre, precio y stock obligatorios)
const crearProductoDto = (body) => validarCampos(body, { parcial: false });

// DTO de entrada para PUT (todos los campos opcionales, pero al menos uno)
const actualizarProductoDto = (body) => validarCampos(body, { parcial: true });

// DTO de filtros para GET /api/productos?nombre=...
const filtroProductoDto = (query) => {
    const { nombre } = query || {};
    if (nombre === undefined) return {};
    if (typeof nombre !== 'string') throw new HttpError(400, 'El filtro "nombre" debe enviarse una sola vez');
    const limpio = nombre.trim();
    return limpio === '' ? {} : { nombre: limpio };
};

// DTO de salida: lo que la API devuelve al cliente
const productoResponseDto = (producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    stock: producto.stock,
    fecha_creacion: producto.fechaCreacion,
});

module.exports = { crearProductoDto, actualizarProductoDto, filtroProductoDto, productoResponseDto };
