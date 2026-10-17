class Producto {
    constructor(id, nombre, precio, stock, fechaCreacion) {
        this.id = id;
        this.nombre = nombre;
        this.precio = Number(precio);
        this.stock = Number(stock);
        this.fechaCreacion = fechaCreacion;
    }

    static fromRow(row) {
        if (!row) return null;
        return new Producto(row.id, row.nombre, row.precio, row.stock, row.fecha_creacion);
    }
}

module.exports = Producto;
