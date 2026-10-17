const productoRepository = require('../repositories/producto.repository');
const HttpError = require('../utils/http-error');

const validarId = (id) => {
    const numero = Number(id);
    // 2147483647 es el máximo de SERIAL/INTEGER; un id mayor haría fallar la consulta con 500
    if (!/^\d+$/.test(id) || !Number.isInteger(numero) || numero <= 0 || numero > 2147483647) throw new HttpError(400, 'El id debe ser un entero positivo');
    return numero;
};

const listar = (filtros) => productoRepository.findAll(filtros);

const obtenerPorId = async (id) => {
    const producto = await productoRepository.findById(validarId(id));
    if (!producto) throw new HttpError(404, 'Producto no encontrado');
    return producto;
};

const crear = (datos) => productoRepository.create(datos);

// Actualización parcial: los campos que no se envían conservan su valor actual
const actualizar = async (id, datos) => {
    const actual = await obtenerPorId(id);
    const actualizado = await productoRepository.update(actual.id, {
        nombre: datos.nombre ?? actual.nombre,
        precio: datos.precio ?? actual.precio,
        stock: datos.stock ?? actual.stock,
    });
    // Pudo eliminarse entre la lectura y la actualización
    if (!actualizado) throw new HttpError(404, 'Producto no encontrado');
    return actualizado;
};

const eliminar = async (id) => {
    const eliminado = await productoRepository.remove(validarId(id));
    if (!eliminado) throw new HttpError(404, 'Producto no encontrado');
};

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
