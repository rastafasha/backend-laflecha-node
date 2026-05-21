var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DocumentoLegalSchema = Schema({
  usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario', // Debe coincidir con el nombre de tu modelo de usuarios
        required: true
    },
    promptOriginal: {
        type: String,
        required: true,
        trim: true
    },
    documentoTexto: {
        type: String,
        required: true
    },
    titulo: {
        type: String,
        trim: true,
        default: 'Documento Legal Automatizado'
    }
}, { collection: 'DocumentoLegal' });

module.exports = mongoose.model('DocumentoLegal', DocumentoLegalSchema);
