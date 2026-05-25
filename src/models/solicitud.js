var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SolicitudSchema = Schema({
    pedido: { type: Array, required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    cliente: { type: Schema.Types.ObjectId, ref: 'Usuario'},
    pago: { type: Schema.Types.ObjectId, ref: 'Pago'},
    status: { type: String, required: false, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'solicitudes' });


module.exports = mongoose.model('Solicitud', SolicitudSchema);