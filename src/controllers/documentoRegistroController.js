const { response } = require('express');
const DocumentRegisto = require('../models/documentoRegistro');
const Usuario = require('../models/usuario');
const PushSubscription = require('../models/push-subscription');
const { sendNotification } = require('../helpers/notificaciones');

const getDocumentos = async (req, res) => {

    const documentos = await DocumentRegisto.find({})
        .populate('usuario')

    res.json({
        ok: true,
        documentos
    });
};

const getDocumento = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    DocumentRegisto.findById(id, {})
        .populate('usuario')
        .exec((err, documento) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar documento',
                    errors: err
                });
            }
            if (!documento) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El documento con el id ' + id + 'no existe',
                    errors: { message: 'No existe un documento con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                documento: documento
            });
        });

};

const guardarDocumento = async (req, res) => {
    try {
        // 1. Validar que el archivo sea PDF si es obligatorio
        if (req.body.type !== 'application/pdf' && !req.body.name_file.endsWith('.pdf')) {
            return res.status(400).json({ ok: false, msg: 'El archivo debe ser un PDF' });
        }

        // 2. Crear la instancia del modelo con los datos del body y del usuario autenticado
        const nuevoDocumento = new DocumentRegisto({
            name_file: req.body.name_file,
            size: req.body.size,
            resolution: req.body.resolution || 'N/A',
            file: req.body.file, // Ruta o URL del archivo
            type: req.body.type,
            tipo: req.body.tipo,
            status: req.body.status,
            usuario: req.usuario.id // ID del usuario que sube (obtenido de tu JWT/Middleware)
        });

        // 3. Guardar en la base de datos
        const documentoGuardado = await nuevoDocumento.save();

        res.status(201).json({
            ok: true,
            documento: documentoGuardado
        });

    } catch (error) {
        console.error(error); // Revisa la consola para ver el error exacto si falla
        res.status(500).json({
            ok: false,
            msg: 'Error al guardar el documento en la base de datos'
        });
    }
};

const actualizarDocumento = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const documento = await DocumentRegisto.findById(id);
        if (!documento) {
            return res.status(500).json({
                ok: false,
                msg: 'documento no encontrado por el id'
            });
        }

        const cambiosDocumento = {
            ...req.body,
            usuario: uid
        }


        const documentoActualizado = await Documento.findByIdAndUpdate(id, cambiosDocumento, { new: true });

        res.json({
            ok: true,
            documentoActualizado
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};


const borrarDocumento = async (req, res) => {

    const id = req.params.id;

    try {

        const documento = await DocumentRegisto.findById(id);
        if (!documento) {
            return res.status(500).json({
                ok: false,
                msg: 'documento no encontrado por el id'
            });
        }

        await DocumentRegisto.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'documento eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

const listarDocumentoPorUsuario = (req, res) => {
    var id = req.params['id'];
    DocumentRegisto.find({ usuario: id }, (err, documento_data) => {
        if (!err) {
            if (documento_data) {
                res.status(200).send({ documentos: documento_data });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    }).populate('usuario');
}

const updateStatusDocumento = async (req, res) => {
    const id = req.params['id'];
    const { status, observaciones } = req.body;

    const estadosValidos = ['APROVED', 'PENDING', 'REFUSED'];

    // 1. Validaciones de entrada
    if (!status || !estadosValidos.includes(status.toUpperCase())) {
        return res.status(400).json({
            ok: false,
            message: `El estado enviado no es válido. Valores permitidos: ${estadosValidos.join(', ')}`
        });
    }

    const estadoFormateado = status.toUpperCase();

    if (estadoFormateado === 'REFUSED' && (!observaciones || observaciones.trim() === '')) {
        return res.status(400).json({
            ok: false,
            message: 'Las observaciones son obligatorias cuando el documento es rechazado (REFUSED).'
        });
    }

    try {
        // 2. Preparar campos a actualizar
        const camposAActualizar = { status: estadoFormateado };

        if (estadoFormateado === 'REFUSED' || observaciones) {
            camposAActualizar.observaciones = observaciones;
        } else {
            camposAActualizar.observaciones = null;
        }

        // 3. Actualizar en la Base de Datos
        // Eliminamos .lean() temporalmente para poder usar las propiedades cómodamente en la notificación
        const document_data = await DocumentRegisto.findByIdAndUpdate(
            id,
            camposAActualizar,      
            { new: true }           
        ).populate('usuario', 'username email role');

        if (!document_data) {
            return res.status(404).json({ ok: false, message: 'No se encontró el documento especificado.' });
        }

        // 💡 OMITIMOS NOTIFICACIÓN SI PASA A "PENDING" (Solo notificamos si es Aprobado o Rechazado)
        if (estadoFormateado === 'APROVED' || estadoFormateado === 'REFUSED') {
            
            // 4. Configurar Notificación Dinámica usando 'document_data'
            const esAprobado = estadoFormateado === 'APROVED';
            const tituloNotif = esAprobado ? '✅ Documento Aprobado' : '❌ Documento Rechazado';
            const tipoNotif = esAprobado ? 'DOCUMENTO_APROBADO' : 'DOCUMENTO_RECHAZADO';
            
            // Si tu modelo de documentos tiene un campo como 'nombre' o 'tipoDoc', úsalo aquí
            const nombreDoc = document_data.tipoDoc || 'de Registro'; 

            const mensajeNotif = esAprobado
                ? `Tu documento ${nombreDoc} ha sido verificado con éxito.`
                : `Motivo: ${observaciones || 'Datos incorrectos'}`;

            const rutaDestino = `/profile/carga-documentos`;
            
            // ID del dueño del documento (se extrae del documento o del populate)
            const usuarioDestinatarioId = document_data.usuario._id || document_data.usuario;

            // 5. DISPARO HÍBRIDO CENTRALIZADO (BD + Sockets + Push)
            const subs = await PushSubscription.find({ usuario: usuarioDestinatarioId });

            if (subs.length > 0) {
                subs.forEach(s => {
                    sendNotification(
                        s.subscription, 
                        tituloNotif, 
                        mensajeNotif, 
                        rutaDestino, 
                        usuarioDestinatarioId, 
                        tipoNotif, 
                        document_data._id
                    ).catch(err => { if (err.statusCode === 410) s.deleteOne(); });
                });
            } else {
                // Caso iPhone 6s: Envía el socket e inserta en el historial de Mongo
                await sendNotification(
                    null, 
                    tituloNotif, 
                    mensajeNotif, 
                    rutaDestino, 
                    usuarioDestinatarioId, 
                    tipoNotif, 
                    document_data._id
                );
            }
        }

        // 6. RESPUESTA HTTP (Ahora sí, al final de toda la lógica)
        return res.status(200).json({
            ok: true,
            msg: estadoFormateado === 'APROVED' ? 'Documento aprobado' : 'Documento rechazado',
            documento: document_data
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, message: 'Error en el servidor al actualizar el estado' });
    }
}




module.exports = {
    getDocumentos,
    getDocumento,
    guardarDocumento,
    actualizarDocumento,
    borrarDocumento,
    listarDocumentoPorUsuario,
    updateStatusDocumento
};