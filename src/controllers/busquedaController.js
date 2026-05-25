const { response } = require('express');
const Pago = require('../models/pago');
const Categoria = require('../models/categoria');
const Blog = require('../models/blog');
const Usuario = require('../models/usuario');
const Subcriptionpaypal = require('../models/subcriptionPaypal');
const Planpaypal = require('../models/paypalPlan');
const Presupuesto = require('../models/presupuesto');


const getTodo = async (req, res = response) => {
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');

    try {
        // Usamos $or para que busque en cualquiera de los campos
        const [usuarios, blogs, categorias, pagos, payments, subcriptions, planpaypals] = await Promise.all([
            Usuario.find({
                $or: [{ username: regex }, { email: regex }]
            }).select('-password'), // No enviar contraseñas en búsquedas

            Blog.find({
                $or: [{ name: regex }]
            }).populate('usuario', 'username email'),

            Categoria.find({
                $or: [{ nombre: regex }]
            }),

            Subcriptionpaypal.find({
                $or: [{ orderID: regex }]
            }),

            Planpaypal.find({
                $or: [{ orderID: regex }]
            }),

            Pago.find({
                $or: [{ referencia: regex }, { amount: regex },
                { bank_destino: regex }, { status: regex }, { fecha_pago: regex },
                { metodo_pago: regex }, { cliente: regex }
                ]
            }).populate('usuario', 'username email'),

            Presupuesto.find({
                $or: [{ titulo: regex }, { amount: regex }, { status: regex },
                { usuario: regex }, { cliente: regex }
                ]
            }).populate('usuario', 'username email'),

        ]);

        res.json({
            ok: true,
            usuarios,
            blogs,
            categorias,
            pagos,
            subcriptions,
            planpaypals,
            presupuestos
        });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error en la búsqueda' });
    }
}

const getDocumentosColeccion = async (req, res = response) => {

    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');
    const esNumero = !isNaN(busqueda); // Verificamos si la búsqueda es un número

    try {
        let data = [];

        switch (tabla) {
            case 'usuarios':
                data = await Usuario.find({
                    $or: [{ username: regex }, { email: regex }]
                }).select('-password');
                break;

            case 'blogs':
                data = await Blog.find({
                    $or: [{ titulo: regex }]
                });
                break;
            case 'categorias':
                data = await Categoria.find({
                    $or: [{ nombre: regex }]
                });
                break;
            case 'subcriptions':
                data = await Subcriptionpaypal.find({
                    $or: [{ orderID: regex }]
                });
                break;
            case 'planpaypals':
                data = await Planpaypal.find({
                    $or: [{ orderID: regex }]
                });
                break;





            case 'payments':
                // 1. Campos de texto (referencia, banco, status)
                // Si 'referencia' es String en la DB, el regex funciona para "A123" o "123"
                let queryPayment = {
                    $or: [
                        { referencia: regex },
                        { bank_destino: regex },
                        { status: regex }
                    ]
                };

                // 2. Solo si es número, buscamos en el monto (amount)
                if (esNumero) {
                    queryPayment.$or.push({ amount: Number(busqueda) });
                }

                // 3. Búsqueda por CLIENTE (Relación con Usuario)
                const usuariosEncontrados = await Usuario.find({ username: regex });
                if (usuariosEncontrados.length > 0) {
                    const idsUsuarios = usuariosEncontrados.map(u => u._id);
                    queryPayment.$or.push({ cliente: { $in: idsUsuarios } });
                }

                // 4. Ejecutar la búsqueda final
                data = await Payment.find(queryPayment)
                    .populate('cliente', 'username email');
                break;

            case 'presupuestos':
                // 1. Campos de texto (referencia, banco, status)
                // Si 'referencia' es String en la DB, el regex funciona para "A123" o "123"
                let queryPresupuesto = {
                    $or: [
                        { titulo: regex },
                        { status: regex }
                    ]
                };

                // 2. Solo si es número, buscamos en el monto (amount)
                if (esNumero) {
                    queryPresupuesto.$or.push({ amount: Number(busqueda) });
                }

                // 3. Búsqueda por CLIENTE (Relación con Usuario)
                const usuariosEncontradosPres = await Usuario.find({ username: regex });
                if (usuariosEncontradosPres.length > 0) {
                    const idsUsuarios = usuariosEncontradosPres.map(u => u._id);
                    queryPresupuesto.$or.push({ cliente: { $in: idsUsuarios } });
                }

                // 4. Ejecutar la búsqueda final
                data = await Presupuesto.find(queryPresupuesto)
                    .populate('cliente', 'username email');
                break;


            default:
                return res.status(400).json({ ok: false, msg: 'Tabla no válida' });
        }

        res.json({ ok: true, resultados: data });

    } catch (error) {
        console.error("ERROR EN BUSQUEDA:", error);
        res.status(500).json({ ok: false, msg: 'Error al buscar en la colección' });
    }
}
module.exports = {
    getTodo,
    getDocumentosColeccion
}