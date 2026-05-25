var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ComentarioSchema = Schema({
    comentario: { type: String, required: true },
    pros: { type: String, required: true },
    cons: { type: String, required: true },
    estrellas: { type: Number, required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    cliente: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    solicitud: { type: Schema.ObjectId, ref: 'Solicitud' },
    createdAt: { type: Date, default: Date.now, required: true },
    updateddAt: { type: Date, default: Date.now, required: true },
}, { collection: 'comentarios' });

module.exports = mongoose.model('Comentario', ComentarioSchema);