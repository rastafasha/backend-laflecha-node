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
            { nombre: 'Derecho Civil', slug: 'derecho_civil', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Penal', slug: 'derecho_penal', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Laboral',slug: 'derecho_laboral', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Mercantil',slug: 'derecho_mercantil', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Administrativo',slug: 'derecho_administrativo', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Constitucional',slug: 'derecho_constitucional', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Tributario',slug: 'derecho_tributario', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Internacional',slug: 'derecho_internacional', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho de Familia',slug: 'derecho_de_familia', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Procesal',slug: 'derecho_procesal', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Ambiental',slug: 'derecho_ambiental', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho de Propiedad Intelectual',slug: 'derecho_de_propiedad_intelectual', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Bancario',slug: 'derecho_bancario', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho de Seguros',slug: 'derecho_de_seguros', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Notarial',slug: 'derecho_notarial', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Registral',slug: 'derecho_registral', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Marítimo',slug: 'derecho_maritimo', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Aeronáutico',slug: 'derecho_aeronautico', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Deportivo',slug: 'derecho_deportivo', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Médico',slug: 'derecho_medico', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Tecnológico',slug: 'derecho_tecnologico', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Consumidor',slug: 'derecho_consumidor', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Minero',slug: 'derecho_minero', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Agrario',slug: 'derecho_agrario', createdAt: new Date(), updatedAt: new Date() },
            { nombre: 'Derecho Migratorio',slug: 'derecho_migratorio', createdAt: new Date(), updatedAt: new Date() },
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

