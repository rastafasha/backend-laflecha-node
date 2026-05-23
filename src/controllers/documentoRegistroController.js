const { response } = require('express');
const DocumentRegisto = require('../models/documentoRegistro');
const Usuario = require('../models/usuario');
const Notificacion = require('../models/notificacion');
const PushSubscription = require('../models/push-subscription');

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
        const document_data = await DocumentRegisto.findByIdAndUpdate(
            id,
            camposAActualizar,      // 👈 Segundo parámetro: Todo lo que se va a modificar
            { new: true }           // 👈 Tercer parámetro: Opciones de Mongoose
        )
            .populate('usuario', 'username email role')
            .lean();

        if (!document_data) {
            return res.status(404).json({ ok: false, message: 'No se encontró el documento especificado.' });
        }

        return res.status(200).json({
            ok: true,
            documento: document_data
        });

        // Configurar Notificación Dinámica
        const esAprobado = status === 'APROVED';
        const tituloNotif = esAprobado ? '✅ Documento Aprobado' : '❌ Documento Rechazado';

        // Si es rechazado, usamos las observaciones enviadas
        const mensajeNotif = esAprobado
            ? `Tu Documento ${documento.tipoDoc} ha sido verificado.`
            : `Motivo: ${observaciones || 'Datos incorrectos'}`;

        const notif = new Notificacion({
            usuario: documento.usuario,
            titulo: tituloNotif,
            mensaje: mensajeNotif,
            tipo: esAprobado ? 'DOCUMENTO_APROBADO' : 'DOCUMENTO_RECHAZADO',
            referenciaId: documento._id
        });

        await notif.save();

        // Emitir por Socket
        if (req.io) {
            req.io.to(documento.usuario.toString()).emit('notificacion-nueva', notif);
        }

        res.json({
            ok: true,
            msg: esAprobado ? 'Documento aprobado' : 'Documento rechazado',
            documento: documento,
            notificacion: notif
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