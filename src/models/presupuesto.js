var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PresupuestoSchema = Schema({
    usuario: { type: Schema.ObjectId, ref: 'Usuario' },
    cliente: { type: Schema.ObjectId, ref: 'Usuario' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    observaciones: { type: String, required: false },
    listItems: { type: Array, required: true },
    amount: { type: Number, required: true },
     status: { type: String, required: false, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now, required: true },
    updateddAt: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('presupuesto', PresupuestoSchema);