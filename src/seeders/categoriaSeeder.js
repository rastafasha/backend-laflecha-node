require('dotenv').config();
const { dbConnection } = require('../database/config');
const Categoria = require('../models/categoria');

const seedCategorias = async () => {
    try {
        await dbConnection();
        console.log('🌱 Iniciando seeder de categorías...');

        // Limpiar categorías existentes
        await Categoria.deleteMany({});
        console.log('✅ Categorías existentes eliminadas');

        const categoriasData = [
            { nombre: 'Tecnología', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Lifestyle', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Educación', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Negocios', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Salud', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Entretenimiento', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Ciencia', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Arte', createdAt: new Date(), updatedAt: new Date() }
        ];

        await Categoria.insertMany(categoriasData);
        console.log(`✅ ${categoriasData.length} categorías insertadas correctamente`);

    } catch (error) {
        console.error('❌ Error en el seeder de categorías:', error.message);
        process.exit(1);
    } finally {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('🔌 Conexión a MongoDB cerrada');
        process.exit(0);
    }
};

seedCategorias();

