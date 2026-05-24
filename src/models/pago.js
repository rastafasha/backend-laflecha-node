'use strict'
const { Schema, model } = require('mongoose');

var PagoSchema = Schema({
    referencia: { type: String, required: true },
    amount: { type: Number, required: true },
    tasaBCV: { type: Number, required: true },
    esPagoTotal: { type: Boolean, required: true },
    bank_destino: { type: String }, // Ej: Banesco, Mercantil
    img: { type: String, required: false },
     metodo_pago: { 
        type: String, 
        enum: ['Transferencia Dólares','Transferencia Bolívares', 'PAGO_MOVIL', 'EFECTIVO', 'ZELLE'], 
        required: true 
    },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    cliente: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
    solicitud: { type: Schema.Types.ObjectId, ref: 'Solicitud' },
    subcriptionPaypal: { type: Schema.Types.ObjectId, ref: 'Subcriptionpaypal' },
    status: { type: String, required: false, default: 'PENDING' },
    observaciones: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'pagos' });


module.exports = model('Pago', PagoSchema);