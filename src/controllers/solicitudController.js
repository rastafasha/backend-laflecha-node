const { response } = require('express');
const Solicitud = require('../models/solicitud');
const PushSubscription = require('../models/push-subscription');
const { sendNotification } = require('../helpers/notificaciones');

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

    const uid = req.uid; // ID del Cliente logueado que genera la solicitud
    
    const solicitud = new Solicitud({
        cliente: uid, // Mapeamos explícitamente al creador en el campo cliente
        ...req.body
    });

    try {
        const solicitudDB = await solicitud.save();

        // --- ENVIAR NOTIFICACIÓN AL ABOGADO / MIEMBRO RECEPTOR ---
        // Tu esquema guarda al profesional en el campo 'usuario'
        if (solicitudDB.usuario) {
            
            // 1. Buscamos el nombre del cliente para armar la alerta personalizada
            const clienteInfo = await Usuario.findById(uid).select('nombre');
            const nombreCliente = clienteInfo ? clienteInfo.nombre : 'Un cliente';

            const titulo = '📄 Nueva Solicitud Recibida';
            const mensaje = `${nombreCliente} ha creado una nueva solicitud de servicio para ti.`;
            const rutaDestino = `/solicitudes`; // Ruta en Angular para el abogado

            // 2. Buscamos canales de Web Push tradicionales en segundo plano
            const subs = await PushSubscription.find({ usuario: solicitudDB.usuario });

            if (subs.length > 0) {
                // Si tiene dispositivos push registrados, el helper envía push, socket e historial
                subs.forEach(s => {
                    sendNotification(
                        s.subscription, 
                        titulo, 
                        mensaje, 
                        rutaDestino, 
                        solicitudDB.usuario, 
                        'NUEVA_SOLICITUD', // ENUM de tu esquema de notificaciones
                        solicitudDB._id
                    ).catch(err => { if (err.statusCode === 410) s.deleteOne(); });
                });
            } else {
                // 💡 CASO IPHONE 6S (SOCKET + HISTORIAL BD DIRECTO AL ABOGADO)
                // Si el abogado eres tú probando desde el teléfono sin push activos,
                // enviamos null y el helper se encarga del túnel WebSocket en tiempo real.
                await sendNotification(
                    null, 
                    titulo, 
                    mensaje, 
                    rutaDestino, 
                    solicitudDB.usuario, 
                    'NUEVA_SOLICITUD', 
                    solicitudDB._id
                );
            }
        }
        // ----------------------------------------------------

        res.json({
            ok: true,
            solicitud: solicitudDB
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
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


const listarSolicitudPorUsuario = (req, res) => {
    var id = req.params['id'];
    const page = parseInt(req.query.page) || 1;
    const limit = 4; // Tu límite actual
    const skip = (page - 1) * limit; // Cuántos posts saltar

    Solicitud.find({ usuario: id })
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
                    solicitudes: data
                });
            } else {
                res.status(404).send({ ok: false, solicitudes: [] });
            }
        });
}

const listarSolicitudPorCliente = (req, res) => {
    var id = req.params['id'];
    const page = parseInt(req.query.page) || 1;
    const limit = 4; // Tu límite actual
    const skip = (page - 1) * limit; // Cuántos posts saltar

    Solicitud.find({ cliente: id })
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
                    solicitudes: data
                });
            } else {
                res.status(404).send({ ok: false, solicitudes: [] });
            }
        });
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

    const estadoFormateado = status.toUpperCase();

    try {
        // Quitamos .lean() momentáneamente para extraer de forma segura los campos poblados en el helper
        const solicitud_data = await Solicitud.findByIdAndUpdate(
            id, 
            { status: estadoFormateado }, 
            { new: true } 
        )
        .populate('usuario', 'username email role nombre')
        .populate('cliente', 'username email');

        if (!solicitud_data) {
            return res.status(404).json({ ok: false, message: 'No se encontró la solicitud especificada.' });
        }

        // ========================================================
        // 🔔 NOTIFICAR AL CLIENTE EN BASE A TUS ESTADOS REALES
        // ========================================================
        // Solo enviamos alertas si pasa a estados definitivos como VERIFIED o FINISHED
        if (estadoFormateado === 'VERIFIED' || estadoFormateado === 'FINISHED') {
            
            const esVerificado = estadoFormateado === 'VERIFIED';
            
            // 1. Configuramos textos dinámicos según tus ENUMs reales de Notificación
            const tituloNotif = esVerificado ? '✅ Solicitud Verificada' : '🏁 Solicitud Finalizada';
            const tipoNotif = esVerificado ? 'SOLICITUD_APROBADO' : 'SOLICITUD_RECHAZADO'; // Mapeas a tus enums existentes
            
            const nombreAbogado = solicitud_data.usuario?.nombre || 'El profesional';
            const mensajeNotif = esVerificado
                ? `${nombreAbogado} ha verificado y aceptado tu solicitud de servicio.`
                : `Tu solicitud de servicio ha sido marcada como completada/finalizada.`;

            const rutaDestino = `/mis-solicitudes`;
            
            // Extraemos el ID del cliente destinatario desde el objeto poblado o directo
            const clienteId = solicitud_data.cliente._id || solicitud_data.cliente;

            if (clienteId) {
                // 2. Buscamos canales de Web Push tradicionales en segundo plano
                const subs = await PushSubscription.find({ usuario: clienteId });

                if (subs.length > 0) {
                    subs.forEach(s => {
                        sendNotification(
                            s.subscription, 
                            tituloNotif, 
                            mensajeNotif, 
                            rutaDestino, 
                            clienteId, 
                            tipoNotif, 
                            solicitud_data._id
                        ).catch(err => { if (err.statusCode === 410) s.deleteOne(); });
                    });
                } else {
                    // 💡 CASO IPHONE 6S (SOCKET + HISTORIAL BD DIRECTO AL CLIENTE)
                    await sendNotification(
                        null, 
                        tituloNotif, 
                        mensajeNotif, 
                        rutaDestino, 
                        clienteId, 
                        tipoNotif, 
                        solicitud_data._id
                    );
                }
            }
        }
        // ========================================================

        // 3. RESPUESTA HTTP: Única y al final de toda la lógica del flujo
        return res.status(200).json({ 
            ok: true, 
            solicitud: solicitud_data 
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
    borrarSolicitud,
    listarSolicitudPorUsuario,
    listarSolicitudPorCliente,
    updateStatusSolicitud

};