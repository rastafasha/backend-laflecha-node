const { response } = require('express');
const Presupuesto = require('../models/presupuesto');
const PushSubscription = require('../models/push-subscription');
const { sendNotification } = require('../helpers/notificaciones');

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
    const uid = req.uid; // ID del Abogado/Miembro que crea el presupuesto

    const presupuesto = new Presupuesto({
        usuario: uid, // Profesional asignado
        ...req.body,
    });

    try {
        const presupuestoDB = await presupuesto.save();

        // --- ENVIAR NOTIFICACIÓN AL CLIENTE ---
        // Verificamos que el presupuesto traiga asociado el ID del cliente de destino
        if (presupuestoDB.cliente) {
            
            const titulo = '📄 Nuevo Presupuesto';
            // Puedes ajustar el mensaje si tu modelo incluye campos como 'monto' o 'concepto'
            const mensaje = `Se ha generado una nueva propuesta de presupuesto para tu revisión.`;
            const rutaDestino = `/presupuestos`; // Ajusta la ruta según tu app en Angular

            // Buscamos si el cliente tiene suscripciones para notificaciones push tradicionales
            const subs = await PushSubscription.find({ usuario: presupuestoDB.cliente });

            if (subs.length > 0) {
                // Disparo masivo a sus dispositivos (Maneja Push + Socket + Historial BD automáticamente)
                subs.forEach(s => {
                    sendNotification(
                        s.subscription, 
                        titulo, 
                        mensaje, 
                        rutaDestino, 
                        presupuestoDB.cliente, 
                        'NUEVO_PRESUPUESTO', // O el ENUM exacto de tu modelo (ej: 'PRESUPUESTO_APROBADO' / personalizado)
                        presupuestoDB._id
                    ).catch(err => { if (err.statusCode === 410) s.deleteOne(); });
                });
            } else {
                // 💡 CASO CLAVE IPHONE: Si el cliente eres tú probando desde el iPhone 6s sin Push, 
                // pasamos null y el helper activará el WebSocket e insertará el registro en Mongo.
                await sendNotification(
                    null, 
                    titulo, 
                    mensaje, 
                    rutaDestino, 
                    presupuestoDB.cliente, 
                    'NUEVO_PRESUPUESTO', 
                    presupuestoDB._id
                );
            }
        }
        // --------------------------------------

        return res.json({
            ok: true,
            presupuesto: presupuestoDB
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }
};

const actualizarPresupuesto = async (req, res) => {
    const id = req.params.id;
    const uid = req.uid; // ID del Abogado/Miembro que está haciendo la modificación

    try {
        const presupuesto = await Presupuesto.findById(id);
        if (!presupuesto) {
            return res.status(404).json({
                ok: false,
                msg: 'Presupuesto no encontrado por el ID'
            });
        }

        const cambiosPresupuesto = {
            ...req.body,
            usuario: uid // Registramos al abogado que hizo los cambios
        }

        const presupuestoActualizado = await Presupuesto.findByIdAndUpdate(id, cambiosPresupuesto, { new: true });

        // ========================================================
        // 🔔 NOTIFICAR AL CLIENTE SOBRE LA ACTUALIZACIÓN
        // ========================================================
        // El destinatario siempre será el cliente asociado al presupuesto
        if (presupuestoActualizado.cliente) {
            
            const tituloNotif = '📝 Presupuesto Actualizado';
            const mensajeNotif = `El profesional ha realizado modificaciones en tu presupuesto. Por favor, revísalo.`;
            const tipoNotif = 'NUEVA_SOLICITUD'; // Usamos un enum compatible de tu lista
            const rutaDestino = `/presupuestos`;

            // Buscamos si el cliente tiene canales de Web Push tradicionales
            const subs = await PushSubscription.find({ usuario: presupuestoActualizado.cliente });

            if (subs.length > 0) {
                // Envío masivo a sus dispositivos (Maneja Push + Socket + Historial BD automáticamente)
                subs.forEach(s => {
                    sendNotification(
                        s.subscription, 
                        tituloNotif, 
                        mensajeNotif, 
                        rutaDestino, 
                        presupuestoActualizado.cliente, 
                        tipoNotif, 
                        presupuestoActualizado._id
                    ).catch(err => { if (err.statusCode === 410) s.deleteOne(); });
                });
            } else {
                // 💡 CASO IPHONE 6S (SOCKET + HISTORIAL BD DIRECTO AL CLIENTE)
                await sendNotification(
                    null, 
                    tituloNotif, 
                    mensajeNotif, 
                    rutaDestino, 
                    presupuestoActualizado.cliente, 
                    tipoNotif, 
                    presupuestoActualizado._id
                );
            }
        }
        // ========================================================

        return res.json({
            ok: true,
            presupuestoActualizado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error, hable con el admin'
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

    // 2. Validación obligatoria para rechazos
    if (estadoFormateado === 'REFUSED' && (!observaciones || observaciones.trim() === '')) {
        return res.status(400).json({
            ok: false,
            message: 'Las observaciones son obligatorias cuando el presupuesto es rechazado (REFUSED).'
        });
    }

    try {
        // 3. Crear el objeto con los datos a actualizar
        const camposAActualizar = {
            status: estadoFormateado
        };

        if (estadoFormateado === 'REFUSED' || observaciones) {
            camposAActualizar.observaciones = observaciones;
        } else {
            camposAActualizar.observaciones = null;
        }

        // 4. Actualizar el presupuesto en la Base de Datos
        // Quitamos .lean() para poder extraer el ID del abogado de forma segura
        const presupuesto_data = await Presupuesto.findByIdAndUpdate(
            id,
            camposAActualizar,      
            { new: true }           
        ).populate('usuario', 'username email role');

        if (!presupuesto_data) {
            return res.status(404).json({ ok: false, message: 'No se encontró el presupuesto especificado.' });
        }

        // 💡 OMITIMOS NOTIFICACIÓN SI PASA A "PENDING" (Solo notificamos Aprobación o Rechazo)
        if (estadoFormateado === 'APROVED' || estadoFormateado === 'REFUSED') {
            
            // 5. Configurar Notificación Dinámica mapeando tus ENUMs reales
            const esAprobado = estadoFormateado === 'APROVED';
            const tituloNotif = esAprobado ? '✅ Presupuesto Aprobado' : '❌ Presupuesto Rechazado';
            const tipoNotif = esAprobado ? 'PRESUPUESTO_APROBADO' : 'PRESUPUESTO_RECHAZADO';

            // Ajustamos a 'presupuesto_data' (el nombre de tu variable real)
            const nombrePresupuesto = presupuesto_data.titulo || 'de Servicios';

            const mensajeNotif = esAprobado
                ? `El cliente ha aprobado el presupuesto "${nombrePresupuesto}".`
                : `El cliente ha rechazado el presupuesto. Motivo: ${observaciones}`;

            const rutaDestino = `/presupuestos`; // Ruta para que el abogado lo revise en Angular
            
            // El destinatario de la alerta siempre es el abogado/miembro que armó la cotización
            const abogadoId = presupuesto_data.usuario._id || presupuesto_data.usuario;

            // 6. DISPARO HÍBRIDO (BD + Sockets + Push)
            // Buscamos si el abogado tiene registros de suscripción para alertas push de fondo
            const subs = await PushSubscription.find({ usuario: abogadoId });

            if (subs.length > 0) {
                subs.forEach(s => {
                    sendNotification(
                        s.subscription, 
                        tituloNotif, 
                        mensajeNotif, 
                        rutaDestino, 
                        abogadoId, 
                        tipoNotif, 
                        presupuesto_data._id
                    ).catch(err => { if (err.statusCode === 410) s.deleteOne(); });
                });
            } else {
                // Caso iPhone 6s: Al no tener push, inyecta directo el WebSocket y guarda historial en BD
                await sendNotification(
                    null, 
                    tituloNotif, 
                    mensajeNotif, 
                    rutaDestino, 
                    abogadoId, 
                    tipoNotif, 
                    presupuesto_data._id
                );
            }
        }

        // 7. RESPUESTA HTTP (Única, limpia y al final de toda la lógica)
        return res.status(200).json({
            ok: true,
            msg: estadoFormateado === 'APROVED' ? 'Presupuesto aprobado con éxito' : 'Presupuesto rechazado',
            presupuesto: presupuesto_data
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
    updateStatusPresupuesto


};