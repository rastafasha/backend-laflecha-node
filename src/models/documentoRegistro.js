var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DocumentRegistroSchema = Schema({
  name_file: { type: String, required: true },
  size: { type: String, required: true },
  resolution: { type: String, required: true }, // Nota: los PDF no suelen llevar resolución, podrías dejarlo opcional o por defecto "N/A"
  file: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, required: false, default: 'PENDING' },
  especialidad: { type: Schema.Types.ObjectId, require: false, ref: 'Speciality' },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Obligatorio para saber quién lo subió
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'documentregistros' });


module.exports = mongoose.model('DocumentRegisto', DocumentRegistroSchema);