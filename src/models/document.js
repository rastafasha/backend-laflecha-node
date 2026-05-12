var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DocumentSchema = Schema({
    name_file: { type: String, required: true },
    size: { type: String, required: true },
    resolution: { type: String, required: true },
    file: { type: String, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'documents' });


module.exports = mongoose.model('Document', DocumentSchema);