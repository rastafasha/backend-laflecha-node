var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SpecialitySchema = Schema({
    nombre: { type: String, required: true },
    slug: { type: String, required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'specialties' });


module.exports = mongoose.model('Speciality', SpecialitySchema);