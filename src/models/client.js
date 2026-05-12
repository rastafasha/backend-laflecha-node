var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClientSchema = Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    cliente: { type: Schema.Types.ObjectId, ref: 'Usuario', unique:true },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'clients' });


module.exports = mongoose.model('Client', ClientSchema);