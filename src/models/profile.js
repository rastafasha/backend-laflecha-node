'use strict'
var mongoose = require('mongoose');
const { Schema, model } = require('mongoose');

const profileSchema = Schema({
    first_name: { type: String, require: true },
    last_name: { type: String, require: true },
    img: { type: String, require: false },
    n_doc: { type: String, require: false },
    gender: { type: Number, required: false },
    telhome: { type: String, require: false },
    telmovil: { type: String, require: false },
    direccion: { type: String, required: false },
    shortdescription: { type: String, require: false },
    redssociales: { type: Array, required: false },
    num_inpre: { type: String, required: false },
    lang: { type: String, required: false },
    precios: { type: Array, required: false },
    ciudad: { type: String, require: false },
    pais: { type: Schema.Types.ObjectId, require: false, ref: 'Pais' },
    status: { type: String, required: false, default: 'PENDING' },
    blogs: { type: Schema.Types.ObjectId, require: false, ref: 'Blog' },
    rating: { type: Schema.Types.ObjectId, require: false, ref: 'Comentario' },
    especialidad: { type: Schema.Types.ObjectId, require: false, ref: 'Speciality' },
    documents: { type: Schema.Types.ObjectId, require: false, ref: 'Document' },
    solicitudes: { type: Schema.Types.ObjectId, require: false, ref: 'Solicitud' },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    favoritos: [{ type: Schema.Types.ObjectId, ref: 'Favorito' }],
    pagos: [{ type: Schema.Types.ObjectId, ref: 'Pago' }],
    subcription: [{ type: Schema.Types.ObjectId, ref: 'Subcriptionpaypal' }],
    articulosVistos: { type: Number, default: 0 },
    paypalSubscriptionId: { type: String, required: false }, // Para identificar el perfil en el webhook
    plan: { type: String, default: 'free' }, // 'free', 'mensual', 'trimestral', 'anual'
    fechaReinicio: { type: Date, default: Date.now }, // Para resetear los 3 artículos cada mes
}, { collection: 'profiles' });



module.exports = mongoose.model('Profile', profileSchema);