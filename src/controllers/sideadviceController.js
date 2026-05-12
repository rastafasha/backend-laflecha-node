const { response } = require('express');
const Sideadvice = require('../models/sideadvice');


const getSideadvices = async(req, res) => {

    const sideadvices = await Sideadvice.find();

    res.json({
        ok: true,
        sideadvices
    });
};

const getSideadvice = async(req, res) => {

    const id = req.params.id;

    Sideadvice.findById(id)
        .exec((err, sideadvice) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar sideadvice',
                    errors: err
                });
            }
            if (!sideadvice) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El sideadvice con el id ' + id + 'no existe',
                    errors: { message: 'No existe un sideadvice con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                sideadvice: sideadvice
            });
        });

};

const crearSideadvice = async(req, res) => {

    const uid = req.uid;
    const sideadvice = new Sideadvice({
        usuario: uid,
        ...req.body
    });

    try {

        const sideadviceDB = await sideadvice.save();

        res.json({
            ok: true,
            sideadvice: sideadviceDB
        });

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarSideadvice = async(req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const sideadvice = await Sideadvice.findById(id);
        if (!sideadvice) {
            return res.status(500).json({
                ok: false,
                msg: 'banner no encontrado por el id'
            });
        }

        const cambiosSideadvice = {
            ...req.body,
            usuario: uid
        }

        const sideadviceActualizado = await Sideadvice.findByIdAndUpdate(id, cambiosSideadvice, { new: true });

        res.json({
            ok: true,
            sideadviceActualizado
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};

const borrarSideadvice = async(req, res) => {

    const id = req.params.id;

    try {

        const sideadvice = await Sideadvice.findById(id);
        if (!sideadvice) {
            return res.status(500).json({
                ok: false,
                msg: 'sideadvice no encontrado por el id'
            });
        }

        await Sideadvice.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'sideadvice eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

function activos(req, res) {

    Sideadvice.find({  status: ['Activo'] }).exec((err, sideadvice_data) => {
        if (err) {
            res.status(500).send({ message: 'Ocurrió un error en el servidor.' });
        } else {
            if (sideadvice_data) {
                res.status(200).send({ sideadvices: sideadvice_data });
            } else {
                res.status(500).send({ message: 'No se encontró ningun dato en esta sección.' });
            }
        }
    });
}

function desactivar(req, res) {
    var id = req.params['id'];

    Sideadvice.findByIdAndUpdate({ _id: id }, { status: 'Desactivado' }, (err, sideadvice_data) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            if (sideadvice_data) {
                res.status(200).send({ sideadvice: sideadvice_data });
            } else {
                res.status(403).send({ message: 'No se actualizó el sideadvertising, vuelva a intentar nuevamente.' });
            }
        }
    })
}

function activar(req, res) {
    var id = req.params['id'];
    // console.log(id);
    Sideadvice.findByIdAndUpdate({ _id: id }, { status: 'Activo' }, (err, sideadvice_data) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            if (sideadvice_data) {
                res.status(200).send({ sideadvice: sideadvice_data });
            } else {
                res.status(403).send({ message: 'No se actualizó el sideadvertising, vuelva a intentar nuevamente.' });
            }
        }
    })
}


module.exports = {
    getSideadvices,
    getSideadvice,
    crearSideadvice,
    actualizarSideadvice,
    borrarSideadvice,
    desactivar,
    activar,
    activos


};