'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SideadvertisingSchema = Schema({
    titulo: { type: String, required: false },
    img: { type: String, required: false },
    url: { type: String, required: false },
    target: { type: String, required: false },
    status: { type: String, required: false, default: 'Desactivado' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'Sideadvices' });

module.exports = mongoose.model('Sideadvice', SideadvertisingSchema);