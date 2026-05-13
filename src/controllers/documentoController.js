const { response } = require('express');
const Documento = require('../models/document');

const getDocumentos = async (req, res) => {

    const documentos = await Documento.find({})
        .populate('usuario')

    res.json({
        ok: true,
        documentos
    });
};

const getDocumento = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    Documento.findById(id, {})
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

const crearDocumento = async (req, res) => {

    const uid = req.uid;


    const documento = new Documento({
        usuario: uid,
        ...req.body,
    });

    try {

        const documentoDB = await documento.save();

        res.json({
            ok: true,
            documento: documentoDB
        });

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarDocumento = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const documento = await Documento.findById(id);
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

        const documento = await Documento.findById(id);
        if (!documento) {
            return res.status(500).json({
                ok: false,
                msg: 'documento no encontrado por el id'
            });
        }

        await Documento.findByIdAndDelete(id);

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
    Documento.find({ usuario: id }, (err, documento_data) => {
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

const listarDocumentoPorCategoria = (req, res) => {
    var id = req.params['id'];
    Documento.find({ usuario: id }, (err, documento_data) => {
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
const listarActivos = (req, res) => {
    var id = req.params['id'];
    Documento.find({ usuario: id }, (err, documento_data) => {
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

module.exports = {
    getDocumentos,
    getDocumento,
    crearDocumento,
    actualizarDocumento,
    borrarDocumento,
    listarDocumentoPorUsuario,
    listarDocumentoPorCategoria,
    listarActivos,


};