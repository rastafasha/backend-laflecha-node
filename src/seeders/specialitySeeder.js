require('dotenv').config();
const { dbConnection } = require('../database/config');
const Speciality = require('../models/speciality');

const seedSpecialities = async () => {
    try {
        await dbConnection();
        console.log('🌱 Iniciando seeder de Especialidades...');

        // Limpiar Especialidades existentes
        await Speciality.deleteMany({});
        console.log('✅ Especialidades existentes eliminadas');

        const specialitiesData = [
            { nombre: 'Derecho Civil', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Penal', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Laboral', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Mercantil', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Administrativo', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Constitucional', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Tributario', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Internacional', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho de Familia', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Procesal', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Ambiental', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho de Propiedad Intelectual', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Bancario', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho de Seguros', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Notarial', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Registral', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Marítimo', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Aeronáutico', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Deportivo', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Médico', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Tecnológico', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Consumidor', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Minero', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Agrario', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Migratorio', createdAt: new Date(), updatedAt: new Date() },
        ];

        await Speciality.insertMany(specialitiesData);
        console.log(`✅ ${specialitiesData.length} Especialidades insertadas correctamente`);

    } catch (error) {
        console.error('❌ Error en el seeder de Especialidades:', error.message);
        process.exit(1);
    } finally {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('🔌 Conexión a MongoDB cerrada');
        process.exit(0);
    }
};

seedSpecialities();

