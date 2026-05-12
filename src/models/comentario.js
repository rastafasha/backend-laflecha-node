var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ComentarioSchema = Schema({
    comentario: { type: String, required: true },
    pros: { type: String, required: true },
    cons: { type: String, required: true },
    estrellas: { type: Number, required: true },
    usuario: { type: Schema.ObjectId, ref: 'Usuario' },
    solicitud: { type: Schema.ObjectId, ref: 'Solicitud' },
    createdAt: { type: Date, default: Date.now, required: true },
    updateddAt: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('comentario', ComentarioSchema);