'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BannerSchema = Schema({
    titulo: { type: String, required: true, unique: true },
    img: { type: String, required: false },
    description: { type: String, required: false },
    url: { type: String, required: false },
    target: { type: String, required: false },
    gotBoton: { type: Boolean, required: false },
    color: { type: String, required: false },
    colortext: { type: String, required: false },
    colortextboton: { type: String, required: false },
    botonName: { type: String, required: false },
    status: { type: String, required: false, default: 'Desactivado' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'banners' });

module.exports = mongoose.model('Banner', BannerSchema);