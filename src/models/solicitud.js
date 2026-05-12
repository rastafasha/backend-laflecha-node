var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SolicitudSchema = Schema({
    pedido: { type: String, required: true },
    status: { type: String, required: false, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'solicitudes' });


module.exports = mongoose.model('Solicitud', SolicitudSchema);