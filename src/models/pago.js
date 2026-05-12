'use strict'
const { Schema, model } = require('mongoose');

var PagoSchema = Schema({
    referencia: { type: String, required: true },
    monto: { type: Number, required: true },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    cliente: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
    subcriptionPaypal: { type: Schema.Types.ObjectId, ref: 'Subcriptionpaypal' },
    status: { type: String, required: false, default: 'PENDING' },
    validacion: { type: String, required: false, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'pagos' });


module.exports = model('Pago', PagoSchema);