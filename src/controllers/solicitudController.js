const { response } = require('express');
const Solicitud = require('../models/solicitud');
const Notificacion = require('../models/notificacion');
const PushSubscription = require('../models/push-subscription');

const getSolicitudes = async (req, res) => {

    const solicitudes = await Solicitud.find({})
        .populate('usuario')

    res.json({
        ok: true,
        solicitudes
    });
};

const getSolicitud = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    Solicitud.findById(id, {})
        .populate('usuario')
        .exec((err, solicitud) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar solicitud',
                    errors: err
                });
            }
            if (!solicitud) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El solicitud con el id ' + id + 'no existe',
                    errors: { message: 'No existe un solicitud con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                solicitud: solicitud
            });
        });

};

const crearSolicitud = async (req, res) => {

    const uid = req.uid;
    const solicitud = new Solicitud({
        usuario: uid,
        ...req.body,
    });

    try {

        const solicitudDB = await solicitud.save();

        res.json({
            ok: true,
            solicitud: solicitudDB
        });

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarSolicitud = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const solicitud = await Solicitud.findById(id);
        if (!solicitud) {
            return res.status(500).json({
                ok: false,
                msg: 'solicitud no encontrado por el id'
            });
        }

        const cambiosSolicitud = {
            ...req.body,
            usuario: uid
        }


        const solicitudActualizado = await Solicitud.findByIdAndUpdate(id, cambiosSolicitud, { new: true });

        res.json({
            ok: true,
            solicitudActualizado
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};


const borrarSolicitud = async (req, res) => {

    const id = req.params.id;

    try {

        const solicitud = await Solicitud.findById(id);
        if (!solicitud) {
            return res.status(500).json({
                ok: false,
                msg: 'solicitud no encontrado por el id'
            });
        }

        await Solicitud.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'solicitud eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

const listarSolicitudPorUsuario = async (req, res) => {
    const id = req.params['id'];
    // const cliente = req.params['cliente'];

    try {
        // Ejecutamos la consulta unificando los filtros y aplicando el doble populate
        const solicitud_data = await Solicitud.find({ 
            usuario: id, 
            // cliente: cliente 
        })
        .populate('usuario', 'username email role') // Trae campos específicos del usuario profesional
        .populate('cliente', 'username email')     // Trae campos específicos del cliente que solicita
        .sort({ createdAt: -1 });                   // Ordena las solicitudes de la más reciente a la más antigua

        return res.status(200).json({ 
            ok: true,
            solicitudes: solicitud_data 
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error en el servidor al obtener las solicitudes',
            error: err.message 
        });
    }
}


const listarSolicitudPorCliente = async (req, res) => {
   const id = req.params['id'];
    // const cliente = req.params['cliente'];

    try {
        // Ejecutamos la consulta unificando los filtros y aplicando el doble populate
        const solicitud_data = await Solicitud.find({ 
            // usuario: id, 
            cliente: id 
        })
        .populate('usuario', 'username email role') // Trae campos específicos del usuario profesional
        .populate('cliente', 'username email')     // Trae campos específicos del cliente que solicita
        .sort({ createdAt: -1 });                   // Ordena las solicitudes de la más reciente a la más antigua

        return res.status(200).json({ 
            ok: true,
            solicitudes: solicitud_data 
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error en el servidor al obtener las solicitudes',
            error: err.message 
        });
    }
}
const updateStatusSolicitud = async (req, res) => {
    const id = req.params['id'];
    const { status } = req.body; 

    const estadosValidos = ['PENDING', 'VERIFIED', 'REVIEW', 'FINISHED'];
    
    if (!status || !estadosValidos.includes(status.toUpperCase())) {
        return res.status(400).json({ 
            ok: false, 
            message: `El estado enviado no es válido. Valores permitidos: ${estadosValidos.join(', ')}` 
        });
    }

    try {
        const solicitud_data = await Solicitud.findByIdAndUpdate(
            id, 
            { status: status.toUpperCase() }, 
            { new: true } 
        )
        .populate('usuario', 'username email role')
        .populate('cliente', 'username email')
        .lean(); // <- CORRECCIÓN 1: Convierte a JSON puro para evitar duplicaciones del campo pedido

        if (!solicitud_data) {
            return res.status(404).json({ ok: false, message: 'No se encontró la solicitud especificada.' });
        }

        // CORRECCIÓN 2: Cambiado "solicitudes:" por "solicitud:" en singular
        return res.status(200).json({ 
            ok: true, 
            solicitud: solicitud_data 
        });

        // Configurar Notificación Dinámica
        const esAprobado = status === 'APROVED';
        const tituloNotif = esAprobado ? '✅ Solicitud Aprobado' : '❌ Solicitud Rechazado';

        // Si es rechazado, usamos las observaciones enviadas
        const mensajeNotif = esAprobado
            ? `Tu Solicitud ${solicitud.titulo} ha sido verificado.`
            : `Motivo: ${observaciones || 'Datos incorrectos'}`;

        const notif = new Notificacion({
            usuario: solicitud.cliente,
            titulo: tituloNotif,
            mensaje: mensajeNotif,
            tipo: esAprobado ? 'SOLICITUD_APROBADO' : 'SOLICITUD_RECHAZADO',
            referenciaId: solicitud._id
        });

        await notif.save();

        // Emitir por Socket
        if (req.io) {
            req.io.to(solicitud.cliente.toString()).emit('notificacion-nueva', notif);
        }

        res.json({
            ok: true,
            msg: esAprobado ? 'Solicitud aprobado' : 'Solicitud rechazado',
            solicitud: solicitud,
            notificacion: notif
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Error en el servidor' });
    }
}








module.exports = {
    getSolicitudes,
    getSolicitud,
    crearSolicitud,
    actualizarSolicitud,
    borrarSolicitud,
    listarSolicitudPorUsuario,
    listarSolicitudPorCliente,
    updateStatusSolicitud

};