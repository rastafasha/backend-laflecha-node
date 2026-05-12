'use strict'
var mongoose = require('mongoose');
const { Schema, model } = require('mongoose');

const favoritoSchema = Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    client: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'favoritos' });


module.exports = mongoose.model('Favorito', favoritoSchema);