require('dotenv').config();
const { dbConnection } = require('../database/config');
const Blog = require('../models/blog');
const Usuario = require('../models/usuario');
const Categoria = require('../models/categoria');
const bcryptjs = require('bcryptjs');

const seedBlogs = async () => {
    try {
        await dbConnection();
        console.log('🌱 Iniciando seeder de blogs...');

        // Limpiar blogs existentes
        await Blog.deleteMany({});
        console.log('✅ Blogs existentes eliminados');

        // Crear o buscar usuario dummy
        let usuario = await Usuario.findOne({ email: 'seeder@example.com' });
        if (!usuario) {
            const salt = bcryptjs.genSaltSync();
            const password = bcryptjs.hashSync('123456', salt);
            usuario = new Usuario({
                username: 'SeederUser',
                email: 'seeder@example.com',
                password: password,
                role: 'ADMIN',
                terminos: true,
                google: false,
                blog: null,
                pago: null
            });
            await usuario.save();
            console.log('✅ Usuario de prueba creado');
        }

        // Crear o buscar categorías dummy
        let categoriaTech = await Categoria.findOne({ nombre: 'Tecnología' });
        if (!categoriaTech) {
            categoriaTech = new Categoria({ nombre: 'Tecnología' });
            await categoriaTech.save();
        }

        let categoriaLifestyle = await Categoria.findOne({ nombre: 'Lifestyle' });
        if (!categoriaLifestyle) {
            categoriaLifestyle = new Categoria({ nombre: 'Lifestyle' });
            await categoriaLifestyle.save();
        }
        console.log('✅ Categorías de prueba creadas');

        // Datos de blogs de prueba (20 blogs)
        const blogsData = [
            {
                name: 'Introducción a Node.js',
                img: 'https://res.cloudinary.com/demo/image/upload/nodejs.png',
                introhome: 'Aprende los fundamentos de Node.js y construye apps escalables.',
                description: 'Node.js es un entorno de ejecución para JavaScript construido con el motor de JavaScript V8 de Chrome.',
                adicional: 'Incluye ejemplos prácticos de event loop, streams y módulos nativos.',
                price: 29.99,
                slug: 'introduccion-a-nodejs',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 120,
                status: 'Activo',
                isFeatured: true,
                createdAt: new Date('2024-01-15T10:00:00Z'),
                updatedAt: new Date('2024-01-15T10:00:00Z')
            },
            {
                name: 'Guía de Express.js',
                img: 'https://res.cloudinary.com/demo/image/upload/express.png',
                introhome: 'Domina Express, el framework web más popular de Node.js.',
                description: 'Express.js simplifica la creación de servidores web y APIs RESTful con Node.js.',
                adicional: 'Proyecto final: API completa con autenticación JWT.',
                price: 24.99,
                slug: 'guia-de-expressjs',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 85,
                status: 'Activo',
                isFeatured: true,
                createdAt: new Date('2024-02-01T12:00:00Z'),
                updatedAt: new Date('2024-02-01T12:00:00Z')
            },
            {
                name: 'Fundamentos de MongoDB',
                img: 'https://res.cloudinary.com/demo/image/upload/mongodb.png',
                introhome: 'Bases de datos NoSQL con MongoDB para aplicaciones modernas.',
                description: 'MongoDB es una base de datos orientada a documentos que ofrece escalabilidad y flexibilidad.',
                adicional: 'Incluye patrones de diseño de esquemas y agregaciones.',
                price: 19.99,
                slug: 'fundamentos-de-mongodb',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 200,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-02-20T09:30:00Z'),
                updatedAt: new Date('2024-02-20T09:30:00Z')
            },
            {
                name: 'Angular para Principiantes',
                img: 'https://res.cloudinary.com/demo/image/upload/angular.png',
                introhome: 'Crea aplicaciones web modernas con el framework de Google.',
                description: 'Angular es una plataforma para construir aplicaciones web y móviles.',
                adicional: 'Desarrolla un CRUD completo conectado a una API REST.',
                price: 34.99,
                slug: 'angular-para-principiantes',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 150,
                status: 'Activo',
                isFeatured: true,
                createdAt: new Date('2024-03-05T14:00:00Z'),
                updatedAt: new Date('2024-03-05T14:00:00Z')
            },
            {
                name: 'Hábitos para Developers',
                img: 'https://res.cloudinary.com/demo/image/upload/habits.jpg',
                introhome: 'Mejora tu productividad y bienestar como desarrollador.',
                description: 'Descubre rutinas diarias, ejercicios y técnicas de gestión del tiempo.',
                adicional: 'Incluye planes de estudio y técnicas de concentración profunda.',
                price: 14.99,
                slug: 'habitos-para-developers',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: categoriaLifestyle._id,
                ventas: 60,
                status: 'Desactivado',
                isFeatured: false,
                createdAt: new Date('2024-03-10T08:00:00Z'),
                updatedAt: new Date('2024-03-10T08:00:00Z')
            },
            {
                name: 'TypeScript Avanzado',
                img: 'https://res.cloudinary.com/demo/image/upload/typescript.png',
                introhome: 'Lleva tu código JavaScript al siguiente nivel con tipado estático.',
                description: 'TypeScript añade tipado estático opcional a JavaScript.',
                adicional: 'Patrones de diseño con TypeScript y migración de proyectos legacy.',
                price: 27.99,
                slug: 'typescript-avanzado',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 95,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-03-25T11:00:00Z'),
                updatedAt: new Date('2024-03-25T11:00:00Z')
            },
            {
                name: 'Docker para Desarrolladores',
                img: 'https://res.cloudinary.com/demo/image/upload/docker.png',
                introhome: 'Contenedores y despliegue profesional de aplicaciones.',
                description: 'Aprende a containerizar tus aplicaciones con Docker y Docker Compose.',
                adicional: 'Incluye ejemplos con Node.js, MongoDB y Nginx.',
                price: 32.99,
                slug: 'docker-para-desarrolladores',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 110,
                status: 'Activo',
                isFeatured: true,
                createdAt: new Date('2024-04-01T09:00:00Z'),
                updatedAt: new Date('2024-04-01T09:00:00Z')
            },
            {
                name: 'React.js desde Cero',
                img: 'https://res.cloudinary.com/demo/image/upload/react.png',
                introhome: 'Construye interfaces dinámicas con la librería de Facebook.',
                description: 'React.js permite crear componentes reutilizables y gestionar el estado eficientemente.',
                adicional: 'Hooks, Context API y Redux explicados paso a paso.',
                price: 29.99,
                slug: 'reactjs-desde-cero',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 180,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-04-10T10:00:00Z'),
                updatedAt: new Date('2024-04-10T10:00:00Z')
            },
            {
                name: 'Productividad y Mindfulness',
                img: 'https://res.cloudinary.com/demo/image/upload/mindfulness.jpg',
                introhome: 'Encuentra el equilibrio entre trabajo y vida personal.',
                description: 'Técnicas de mindfulness aplicadas al entorno laboral tecnológico.',
                adicional: 'Meditación guiada y gestión del estrés para equipos remotos.',
                price: 12.99,
                slug: 'productividad-y-mindfulness',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: categoriaLifestyle._id,
                ventas: 45,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-04-15T08:00:00Z'),
                updatedAt: new Date('2024-04-15T08:00:00Z')
            },
            {
                name: 'GraphQL vs REST',
                img: 'https://res.cloudinary.com/demo/image/upload/graphql.png',
                introhome: 'Compara y elige la mejor tecnología para tus APIs.',
                description: 'Análisis profundo de GraphQL y REST con casos de uso reales.',
                adicional: 'Implementación de un servidor Apollo con Node.js.',
                price: 22.99,
                slug: 'graphql-vs-rest',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 75,
                status: 'Desactivado',
                isFeatured: false,
                createdAt: new Date('2024-04-20T11:00:00Z'),
                updatedAt: new Date('2024-04-20T11:00:00Z')
            },
            {
                name: 'Seguridad Web',
                img: 'https://res.cloudinary.com/demo/image/upload/security.png',
                introhome: 'Protege tus aplicaciones contra vulnerabilidades comunes.',
                description: 'OWASP Top 10, JWT seguro, CORS, Helmet y buenas prácticas.',
                adicional: 'Laboratorio práctico con aplicaciones vulnerables.',
                price: 35.99,
                slug: 'seguridad-web',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 130,
                status: 'Activo',
                isFeatured: true,
                createdAt: new Date('2024-05-01T10:00:00Z'),
                updatedAt: new Date('2024-05-01T10:00:00Z')
            },
            {
                name: 'DevOps Básico',
                img: 'https://res.cloudinary.com/demo/image/upload/devops.png',
                introhome: 'Introducción a la cultura DevOps y herramientas esenciales.',
                description: 'CI/CD, Jenkins, GitHub Actions y despliegue automatizado.',
                adicional: 'Pipeline completa desde el commit hasta producción.',
                price: 31.99,
                slug: 'devops-basico',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 90,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-05-10T09:00:00Z'),
                updatedAt: new Date('2024-05-10T09:00:00Z')
            },
            {
                name: 'Vue.js Práctico',
                img: 'https://res.cloudinary.com/demo/image/upload/vue.png',
                introhome: 'Framework progresivo para construir interfaces de usuario.',
                description: 'Vue.js ofrece reactividad y componentes de forma sencilla.',
                adicional: 'Composition API, Vuex y Vue Router en proyectos reales.',
                price: 26.99,
                slug: 'vuejs-practico',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 105,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-05-15T12:00:00Z'),
                updatedAt: new Date('2024-05-15T12:00:00Z')
            },
            {
                name: 'Bases de Datos SQL',
                img: 'https://res.cloudinary.com/demo/image/upload/sql.png',
                introhome: 'Diseña y consulta bases de datos relacionales como un experto.',
                description: 'PostgreSQL y MySQL: modelado, normalización y consultas avanzadas.',
                adicional: 'Índices, transacciones y optimización de queries.',
                price: 23.99,
                slug: 'bases-de-datos-sql',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 140,
                status: 'Activo',
                isFeatured: true,
                createdAt: new Date('2024-05-20T10:00:00Z'),
                updatedAt: new Date('2024-05-20T10:00:00Z')
            },
            {
                name: 'Trabajo Remoto Eficiente',
                img: 'https://res.cloudinary.com/demo/image/upload/remote.jpg',
                introhome: 'Maximiza tu rendimiento desde cualquier lugar del mundo.',
                description: 'Herramientas, rutinas y estrategias para equipos distribuidos.',
                adicional: 'Comunicación asincrónica y gestión de proyectos remotos.',
                price: 16.99,
                slug: 'trabajo-remoto-eficiente',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: categoriaLifestyle._id,
                ventas: 55,
                status: 'Desactivado',
                isFeatured: false,
                createdAt: new Date('2024-05-25T08:00:00Z'),
                updatedAt: new Date('2024-05-25T08:00:00Z')
            },
            {
                name: 'Microservicios con Node.js',
                img: 'https://res.cloudinary.com/demo/image/upload/microservices.png',
                introhome: 'Arquitectura distribuida para aplicaciones escalables.',
                description: 'Diseña, implementa y despliega microservicios con Node.js.',
                adicional: 'Comunicación entre servicios, message brokers y patrones de resiliencia.',
                price: 39.99,
                slug: 'microservicios-con-nodejs',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 70,
                status: 'Activo',
                isFeatured: true,
                createdAt: new Date('2024-06-01T11:00:00Z'),
                updatedAt: new Date('2024-06-01T11:00:00Z')
            },
            {
                name: 'Testing en JavaScript',
                img: 'https://res.cloudinary.com/demo/image/upload/testing.png',
                introhome: 'Escribe código confiable con pruebas automatizadas.',
                description: 'Jest, Mocha, Cypress y TDD aplicados a proyectos reales.',
                adicional: 'Cobertura de código, mocks y pruebas de integración.',
                price: 21.99,
                slug: 'testing-en-javascript',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 115,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-06-10T09:00:00Z'),
                updatedAt: new Date('2024-06-10T09:00:00Z')
            },
            {
                name: 'Nutrición para Programadores',
                img: 'https://res.cloudinary.com/demo/image/upload/nutrition.jpg',
                introhome: 'Alimentación saludable para largas sesiones de código.',
                description: 'Planes de comidas, snacks saludables y hidratación óptima.',
                adicional: 'Recetas rápidas y ejercicios para combatir la sedentariedad.',
                price: 13.99,
                slug: 'nutricion-para-programadores',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: categoriaLifestyle._id,
                ventas: 40,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-06-15T08:00:00Z'),
                updatedAt: new Date('2024-06-15T08:00:00Z')
            },
            {
                name: 'WebSockets en Tiempo Real',
                img: 'https://res.cloudinary.com/demo/image/upload/websockets.png',
                introhome: 'Comunicación bidireccional para aplicaciones modernas.',
                description: 'Socket.io, eventos en tiempo real y salas de chat.',
                adicional: 'Escalabilidad con Redis Adapter y arquitectura de eventos.',
                price: 28.99,
                slug: 'websockets-en-tiempo-real',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 80,
                status: 'Activo',
                isFeatured: false,
                createdAt: new Date('2024-06-20T10:00:00Z'),
                updatedAt: new Date('2024-06-20T10:00:00Z')
            },
            {
                name: 'Git y GitHub Avanzado',
                img: 'https://res.cloudinary.com/demo/image/upload/git.png',
                introhome: 'Control de versiones profesional y flujos de trabajo en equipo.',
                description: 'Branching strategies, rebasing, hooks y GitHub Actions.',
                adicional: 'Resolución de conflictos y flujo GitFlow explicado.',
                price: 18.99,
                slug: 'git-y-github-avanzado',
                usuario: '69eaab0919ab9e7948b4bcc1',
                categoria: '69eaa8a734187f12acf53f57',
                ventas: 160,
                status: 'Activo',
                isFeatured: true,
                createdAt: new Date('2024-06-25T09:00:00Z'),
                updatedAt: new Date('2024-06-25T09:00:00Z')
            }
        ];

        // Insertar blogs
        await Blog.insertMany(blogsData);
        console.log(`✅ ${blogsData.length} blogs insertados correctamente`);

        // Actualizar referencia de blog en usuario (opcional)
        // Nota: En el modelo Usuario, blog es un ObjectId simple, no un array.
        // Solo actualizamos con el último blog creado si es necesario.
        // usuario.blog = blogsData[blogsData.length - 1]._id; // insertMany no retorna docs con _id en este formato directo
        // await usuario.save();

    } catch (error) {
        console.error('❌ Error en el seeder:', error.message);
        process.exit(1);
    } finally {
        // Cerrar conexión a MongoDB
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('🔌 Conexión a MongoDB cerrada');
        process.exit(0);
    }
};

seedBlogs();

