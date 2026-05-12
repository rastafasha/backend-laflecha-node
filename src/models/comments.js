var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = Schema({
    comentario: { type: String, required: true },
    pros: { type: String, required: true },
    cons: { type: String, required: true },
    estrellas: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    client: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    solicitud: { type: Schema.Types.ObjectId, ref: 'Solicitud' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'comments' });


module.exports = mongoose.model('Comment', CommentSchema);