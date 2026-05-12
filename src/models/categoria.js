var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({
    nombre: { type: String, required: true },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true }
}, { collection: 'categorias' });


module.exports = mongoose.model('Categoria', CategoriaSchema);