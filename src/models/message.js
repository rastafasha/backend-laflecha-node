const { Schema, model } = require('mongoose');

const MessageSchema = Schema({
    de: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    para: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Esto crea automáticamente 'createdAt' y 'updatedAt'
});

// Limpiar la respuesta JSON para el frontend
MessageSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model('Message', MessageSchema);
