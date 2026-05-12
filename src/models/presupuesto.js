var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PresupuestoSchema = Schema({
    usuario: { type: Schema.ObjectId, ref: 'Usuario' },
    cliente: { type: Schema.ObjectId, ref: 'Usuario' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    listItems: { type: Array, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    updateddAt: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('presupuesto', PresupuestoSchema);