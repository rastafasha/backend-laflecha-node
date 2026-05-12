const { response } = require('express');
const Solicitud = require('../models/solicitud');

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

const listarSolicitudPorUsuario = (req, res) => {
    var id = req.params['id'];
    Solicitud.find({ usuario: id }, (err, solicitud_data) => {
        if (!err) {
            if (solicitud_data) {
                res.status(200).send({ solicitudes: solicitud_data });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    }).populate('usuario');
}

module.exports = {
    getSolicitudes,
    getSolicitud,
    crearSolicitud,
    actualizarSolicitud,
    borrarSolicitud,
    listarSolicitudPorUsuario


};