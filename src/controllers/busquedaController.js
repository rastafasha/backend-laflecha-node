const { response } = require('express');
const Pago = require('../models/pago');
const Categoria = require('../models/categoria');
const Blog = require('../models/blog');
const Usuario = require('../models/usuario');
const Subcriptionpaypal = require('../models/subcriptionPaypal');
const Planpaypal = require('../models/paypalPlan');

const getTodo = async(req, res = response) => {

    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');


    const [usuarios, blogs, categorias, pagos, subcriptions, planpaypals] = await Promise.all([
        Usuario.find({ username: regex}),
        Blog.find({ name: regex }),
        Categoria.find({ nombre: regex }),
        Pago.find({ referencia: regex }),
        Subcriptionpaypal.find({ orderID: regex }),
        Planpaypal.find({ orderID: regex })
    ]);

    res.json({
        ok: true,
        usuarios,
        blogs,
        categorias,
        pagos,
        subcriptions,
        planpaypals,

    })
}

const getDocumentosColeccion = async(req, res = response) => {

    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');

    let data = [];

    switch (tabla) {
        case 'usuarios':
            data = await Usuario.find({ username: regex });
            break;
        case 'blogs':
            data = await Blog.find({ name: regex })
                .populate('name', 'price img');
            break;
        case 'categorias':
            data = await Categoria.find({ nombre: regex });
            break;
        case 'pagos':
            data = await Pago.find({ referencia: regex })
                .populate('referencia', 'monto img');
            break;
        case 'subcriptions':
            data = await Subcriptionpaypal.find({ orderID: regex })
                .populate('orderID', 'orderID payerID plan_id status usuarios createdAt updatedAt');
            break;
        default:
            return res.status(400).json({
                ok: false,
                msg: 'la tabla debe ser usuarios/blogs/categorias/pagos'
            });
    }

    res.json({
        ok: true,
        resultados: data
    });

    const [usuarios, blogs, categorias, pagos, subcriptions] = await Promise.all([
        Usuario.find({ username: regex }),
        Blog.find({ name: regex }),
        Categoria.find({ nombre: regex }),
        Pago.find({ referencia: regex }),
        Subcriptionpaypal.find({ orderID: regex })
    ]);

    res.json({
        ok: true,
        usuarios,
        blogs,
        categorias,
        pagos,
        subcriptions

    })
}

module.exports = {
    getTodo,
    getDocumentosColeccion
}