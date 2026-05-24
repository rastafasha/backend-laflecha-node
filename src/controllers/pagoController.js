const { response } = require('express');
const Pago = require('../models/pago');
const PushSubscription = require('../models/push-subscription');
const { sendNotification } = require('../helpers/notificaciones');

const getPagos = async (req, res) => {

    const pagos = await Pago.find({})
        .populate('usuario')
        .populate('blog');

    res.json({
        ok: true,
        pagos
    });
};

const getPago = async (req, res) => {

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

const crearPago = async (req, res) => {
    const uid = req.uid; // El cliente logueado
    const pago = new Pago({
        cliente: uid,
        ...req.body
    });

    try {
        const pagoDB = await pago.save();

        // Si el pago incluye al abogado/miembro receptor, le notificamos de inmediato
        if (pagoDB.usuario) {
            
            // 1. Buscamos las suscripciones push que tenga activas ese abogado
            const subs = await PushSubscription.find({ usuario: pagoDB.usuario });

            const titulo = '💰 Nuevo Pago Recibido';
            const mensaje = `Se ha registrado un nuevo pago de $${pagoDB.amount}.`;
            const rutaDestino = `/mis-pagos`;

            if (subs.length > 0) {
                // Si tiene dispositivos push, iteramos y enviamos (el helper se encarga del socket e historial también)
                subs.forEach(s => {
                    sendNotification(s.subscription, titulo, mensaje, rutaDestino, pagoDB.usuario, 'NUEVO_PAGO', pagoDB._id)
                        .catch(err => { if (err.statusCode === 410) s.deleteOne(); });
                });
            } else {
                // 💡 CASO CLAVE PARA TU IPHONE 6S: Si no tiene Push activos, igual llamamos al helper
                // pasándole "null" en la suscripción. Así el SÓLO ejecutará el Socket + Historial en BD.
                sendNotification(null, titulo, mensaje, rutaDestino, pagoDB.usuario, 'NUEVO_PAGO', pagoDB._id);
            }
        }

        res.json({ ok: true, pago: pagoDB });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Hable con el admin' });
    }
};

const actualizarPago = async (req, res) => {

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

const actualizarPagoStatus = async (req, res) => {
    const { id } = req.params;
    const { nuevoEstado, observaciones } = req.body;
    const adminId = req.uid;

    try {
        const pago = await Pago.findById(id).populate('solicitud');
        if (!pago) return res.status(404).json({ ok: false, msg: 'Pago no encontrado' });

        // 1. Actualizamos los campos en el modelo de pagos
        pago.status = nuevoEstado;
        pago.usuario_validador = adminId;
        pago.observaciones = observaciones || '';
        
        await pago.save();

        // 2. Configurar los textos dinámicos de la Notificación
        const esAprobado = nuevoEstado === 'APROBADO';
        const tituloNotif = esAprobado ? '✅ Pago Aprobado' : '❌ Pago Rechazado';
        const tipoNotif = esAprobado ? 'PAGO_APROBADO' : 'PAGO_RECHAZADO';

        const mensajeNotif = esAprobado
            ? `Tu pago de $${pago.amount} ha sido verificado con éxito.`
            : `Motivo: ${observaciones || 'Datos incorrectos'}`;

        const rutaDestino = `/mis-pagos`;

        // 3. DISPARO HÍBRIDO (BD + Sockets + Push)
        // Buscamos si el cliente final tiene dispositivos registrados para notificaciones push
        const subs = await PushSubscription.find({ usuario: pago.cliente });

        if (subs.length > 0) {
            // Si el cliente usa un navegador compatible, el helper manda el push, el socket (iPhone) y guarda en BD
            subs.forEach(s => {
                sendNotification(
                    s.subscription, 
                    tituloNotif, 
                    mensajeNotif, 
                    rutaDestino, 
                    pago.cliente, 
                    tipoNotif, 
                    pago._id
                ).catch(err => { if (err.statusCode === 410) s.deleteOne(); });
            });
        } else {
            // 💡 CASO CLAVE IPHONE: Si el usuario no tiene Push activos, mandamos null en la suscripción.
            // El helper ejecutará limpiamente el Socket.io y el guardado en el historial de Mongo.
            await sendNotification(
                null, 
                tituloNotif, 
                mensajeNotif, 
                rutaDestino, 
                pago.cliente, 
                tipoNotif, 
                pago._id
            );
        }

        res.json({
            ok: true,
            msg: esAprobado ? 'Pago aprobado' : 'Pago rechazado',
            payment: pago
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Error al procesar la validación' });
    }
};

const borrarPago = async (req, res) => {

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
        .sort({ createdAt: 'DESC' }).limit(4).exec((err, pagos) => {
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