'use strict'
const { Schema, model } = require('mongoose');

var SubcriptionPaypalSchema = Schema({

    // subscriptionID: { type: String, required: true },
    email: { type: String, required: true },
    monto: { type: Number, required: true },
    orderID: { type: String, required: true },
    payerID: { type: String, required: true },
    plan_id: { type: String, required: true, ref: 'Paypalplan' },
    status: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    create_time: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'subcriptions' });



module.exports = model('Subcriptionpaypal', SubcriptionPaypalSchema);