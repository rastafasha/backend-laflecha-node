var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DocumentSchema = Schema({
  name_file: { type: String, required: true },
  size: { type: String, required: true },
  resolution: { type: String, required: true }, // Nota: los PDF no suelen llevar resolución, podrías dejarlo opcional o por defecto "N/A"
  file: { type: String, required: true },
  type: { type: String, required: true },
  name_category: { type: String, required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Obligatorio para saber quién lo subió
  sharedWith: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }], // Usuarios con los que se comparte
  isPublic: { type: Boolean, default: false }, // Por si se comparte con todos
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'documents' });


module.exports = mongoose.model('Document', DocumentSchema);