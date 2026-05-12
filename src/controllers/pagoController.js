const { response } = require('express');
const Pago = require('../models/pago');


const getPagos = async(req, res) => {

    const pagos = await Pago.find({})
        .populate('usuario')
        .populate('blog');

    res.json({
        ok: true,
        pagos
    });
};

const getPago = async(req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    Pago.findById(id)
        .populate('usuario')
        .populate('blog')
        // .populate('Subcriptionpaypal')
        .exec((err, pago) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar pago',
                    errors: err
                });
            }
            if (!pago) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El pago con el id ' + id + 'no existe',
                    errors: { message: 'No existe un pago con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                pago: pago
            });
        });

};

const crearPago = async(req, res) => {

    const uid = req.uid;
    const pago = new Pago({
        usuario: uid,
        ...req.body
    });

    try {

        const pagoDB = await pago.save();

        res.json({
            ok: true,
            pago: pagoDB
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarPago = async(req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const pago = await Pago.findById(id);
        if (!pago) {
            return res.status(500).json({
                ok: false,
                msg: 'pago no encontrado por el id'
            });
        }

        const cambiosPago = {
            ...req.body,
            usuario: uid
        }

        const pagoActualizado = await Pago.findByIdAndUpdate(id, cambiosPago, { new: true });

        res.json({
            ok: true,
            pagoActualizado
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};


const actualizarPagoStatus = async(req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const pago = await Pago.findById(id);
        if (!pago) {
            return res.status(500).json({
                ok: false,
                msg: 'pago no encontrado por el id'
            });
        }

        const cambiosPago = {
            ...req.body
        }

        const pagoActualizado = await Pago.findByIdAndUpdate(id, cambiosPago, { new: true });

        res.json({
            ok: true,
            pagoActualizado
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};

const borrarPago = async(req, res) => {

    const id = req.params.id;

    try {

        const pago = await Pago.findById(id);
        if (!pago) {
            return res.status(500).json({
                ok: false,
                msg: 'pago no encontrado por el id'
            });
        }

        await Plan.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'pago eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};


function desactivar(req, res) {
    var id = req.params['id'];

    Pago.findByIdAndUpdate({ _id: id }, { status: 'Desactivado' }, (err, pago_data) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            if (pago_data) {
                res.status(200).send({ pago: pago_data });
            } else {
                res.status(403).send({ message: 'No se actualizó el pago, vuelva a intentar nuevamente.' });
            }
        }
    })
}

function activar(req, res) {
    var id = req.params['id'];
    // console.log(id);
    Pago.findByIdAndUpdate({ _id: id }, { status: 'Activo' }, (err, pago_data) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            if (pago_data) {
                res.status(200).send({ pago: pago_data });
            } else {
                res.status(403).send({ message: 'No se actualizó el pago, vuelva a intentar nuevamente.' });
            }
        }
    })
}

const listarPagoPorUsuario = (req, res) => {
    var id = req.params['id'];
    Pago.find({ usuario: id },
         (err, pago_data) => {
        if (!err) {
            if (pago_data) {
                res.status(200).send({ pagos: pago_data });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    })
    .populate('blog')
    // .populate('Subcriptionpaypal')
    .populate('usuario');
}

function newest(req, res) {
    Pago.find()
    .populate('usuario')
    .sort({ createdAt:'DESC' }).limit(4).exec((err, pagos) => {
        if (pagos) {
            res.status(200).send({ pagos: pagos });
        }
    });

    

}

// function newest (req, res) {

//     Pago.findAll({
//         order: [
//             ['createdAt', 'DESC']
//         ]
//     });

//     res.json({
//         ok: true,
//         pagos
//     });

    
// };

// function methodToRun(){
//     console.log ("King Chronos")
// }



module.exports = {
    getPagos,
    crearPago,
    getPago,
    actualizarPago,
    borrarPago,
    desactivar,
    activar,
    listarPagoPorUsuario,
    newest,
    actualizarPagoStatus,
    // methodToRun


};