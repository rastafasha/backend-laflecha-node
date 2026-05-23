const { response } = require('express');
const Presupuesto = require('../models/presupuesto');
const Notificacion = require('../models/notificacion');
const PushSubscription = require('../models/push-subscription');

const getPresupuestos = async (req, res) => {

    const presupuestos = await Presupuesto.find({})
        .populate('usuario')

    res.json({
        ok: true,
        presupuestos
    });
};

const getPresupuesto = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    Presupuesto.findById(id, {})
        .populate('usuario')
        .exec((err, presupuesto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar presupuesto',
                    errors: err
                });
            }
            if (!presupuesto) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El presupuesto con el id ' + id + 'no existe',
                    errors: { message: 'No existe un presupuesto con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                presupuesto: presupuesto
            });
        });

};

const crearPresupuesto = async (req, res) => {

    const uid = req.uid;


    const presupuesto = new Presupuesto({
        usuario: uid,
        ...req.body,
    });

    try {

        const presupuestoDB = await presupuesto.save();

        res.json({
            ok: true,
            presupuesto: presupuestoDB
        });

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarPresupuesto = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const presupuesto = await Presupuesto.findById(id);
        if (!presupuesto) {
            return res.status(500).json({
                ok: false,
                msg: 'presupuesto no encontrado por el id'
            });
        }

        const cambiosPresupuesto = {
            ...req.body,
            usuario: uid
        }


        const presupuestoActualizado = await Presupuesto.findByIdAndUpdate(id, cambiosPresupuesto, { new: true });

        res.json({
            ok: true,
            presupuestoActualizado
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};


const borrarPresupuesto = async (req, res) => {

    const id = req.params.id;

    try {

        const presupuesto = await Presupuesto.findById(id);
        if (!presupuesto) {
            return res.status(500).json({
                ok: false,
                msg: 'presupuesto no encontrado por el id'
            });
        }

        await Presupuesto.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'presupuesto eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

const listarPresupuestoPorUsuario = (req, res) => {
    var id = req.params['id'];
    const page = parseInt(req.query.page) || 1;
    const limit = 4; // Tu límite actual
    const skip = (page - 1) * limit; // Cuántos posts saltar

    Presupuesto.find({ usuario: id })
        .populate('cliente', 'email uid username')
        .sort({ createdAt: -1 })
        .skip(skip)   // <-- Nos saltamos los ya cargados
        .limit(limit) // <-- Traemos los siguientes 4
        .exec((err, data) => {
            if (err) {
                return res.status(500).send({ ok: false, message: 'Error en el servidor' });
            }

            if (data) {
                // Es buena práctica enviar 'ok: true' para que coincida con tu map del frontend
                res.status(200).send({
                    ok: true,
                    presupuestos: data
                });
            } else {
                res.status(404).send({ ok: false, presupuestos: [] });
            }
        });
}
const listarPresupuestoPorCliente = (req, res) => {
    var id = req.params['id'];
    const page = parseInt(req.query.page) || 1;
    const limit = 4; // Tu límite actual
    const skip = (page - 1) * limit; // Cuántos posts saltar

    Presupuesto.find({ cliente: id })
        .populate('usuario', 'email uid username')
        .sort({ createdAt: -1 })
        .skip(skip)   // <-- Nos saltamos los ya cargados
        .limit(limit) // <-- Traemos los siguientes 4
        .exec((err, data) => {
            if (err) {
                return res.status(500).send({ ok: false, message: 'Error en el servidor' });
            }

            if (data) {
                // Es buena práctica enviar 'ok: true' para que coincida con tu map del frontend
                res.status(200).send({
                    ok: true,
                    presupuestos: data
                });
            } else {
                res.status(404).send({ ok: false, presupuestos: [] });
            }
        });
}

function listar_newestPaginados(req, res) {
    // 1. Obtenemos la página de la URL (ej: /recientes?page=2). 
    // Si no viene nada, por defecto es la 1.
    const page = parseInt(req.query.page) || 1;
    const limit = 4; // Tu límite actual
    const skip = (page - 1) * limit; // Cuántos posts saltar

    Presupuesto.find()
        .populate('usuario', 'email uid username')
        .sort({ createdAt: -1 })
        .skip(skip)   // <-- Nos saltamos los ya cargados
        .limit(limit) // <-- Traemos los siguientes 4
        .exec((err, data) => {
            if (err) {
                return res.status(500).send({ ok: false, message: 'Error en el servidor' });
            }

            if (data) {
                // Es buena práctica enviar 'ok: true' para que coincida con tu map del frontend
                res.status(200).send({
                    ok: true,
                    presupuestos: data
                });
            } else {
                res.status(404).send({ ok: false, presupuestos: [] });
            }
        });
}

const updateStatusPresupuesto = async (req, res) => {
    const id = req.params['id'];
    const { status, observaciones } = req.body;

    const estadosValidos = ['APROVED', 'PENDING', 'REFUSED'];

    // 1. Validar que venga un estado y que esté dentro de la lista permitida
    if (!status || !estadosValidos.includes(status.toUpperCase())) {
        return res.status(400).json({
            ok: false,
            message: `El estado enviado no es válido. Valores permitidos: ${estadosValidos.join(', ')}`
        });
    }

    const estadoFormateado = status.toUpperCase();

    // 2. NUEVA VALIDACIÓN: Si es REFUSED, exigir las observaciones obligatoriamente
    if (estadoFormateado === 'REFUSED' && (!observaciones || observaciones.trim() === '')) {
        return res.status(400).json({
            ok: false,
            message: 'Las observaciones son obligatorias cuando el documento es rechazado (REFUSED).'
        });
    }

    try {
        // 3. Crear el objeto con los datos a actualizar
        const camposAActualizar = {
            status: estadoFormateado
        };

        // Si viene el estado REFUSED (o simplemente el usuario mandó observaciones), las añadimos al objeto
        if (estadoFormateado === 'REFUSED' || observaciones) {
            camposAActualizar.observaciones = observaciones;
        } else {
            // Opcional: Si pasa a APROVED o PENDING, puedes limpiar las observaciones anteriores poniéndolas en null
            camposAActualizar.observaciones = null;
        }

        // 4. CORRECCIÓN CRÍTICA: Pasar todos los campos juntos en el segundo parámetro
        const presupuesto_data = await Presupuesto.findByIdAndUpdate(
            id,
            camposAActualizar,      // 👈 Segundo parámetro: Todo lo que se va a modificar
            { new: true }           // 👈 Tercer parámetro: Opciones de Mongoose
        )
            .populate('usuario', 'username email role')
            .lean();

        if (!presupuesto_data) {
            return res.status(404).json({ ok: false, message: 'No se encontró el presupuesto especificado.' });
        }

        return res.status(200).json({
            ok: true,
            presupuesto: presupuesto_data
        });

        // Configurar Notificación Dinámica
        const esAprobado = status === 'APROVED';
        const tituloNotif = esAprobado ? '✅ Presupuesto Aprobado' : '❌ Presupuesto Rechazado';

        // Si es rechazado, usamos las observaciones enviadas
        const mensajeNotif = esAprobado
            ? `Tu Presupuesto ${presupuesto.titulo} ha sido verificado.`
            : `Motivo: ${observaciones || 'Datos incorrectos'}`;

        const notif = new Notificacion({
            usuario: presupuesto.usuario,
            titulo: tituloNotif,
            mensaje: mensajeNotif,
            tipo: esAprobado ? 'PRESUPUESTO_APROBADO' : 'PRESUPUESTO_RECHAZADO',
            referenciaId: presupuesto._id
        });

        await notif.save();

        // Emitir por Socket
        if (req.io) {
            req.io.to(presupuesto.usuario.toString()).emit('notificacion-nueva', notif);
        }

        res.json({
            ok: true,
            msg: esAprobado ? 'Presupuesto aprobado' : 'Presupuesto rechazado',
            presupuesto: presupuesto,
            notificacion: notif
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Error en el servidor al actualizar el estado' });
    }
}


module.exports = {
    getPresupuestos,
    getPresupuesto,
    crearPresupuesto,
    actualizarPresupuesto,
    borrarPresupuesto,
    listarPresupuestoPorUsuario,
    listarPresupuestoPorCliente,
    listar_newestPaginados,
    updateStatusPresupuesto


};