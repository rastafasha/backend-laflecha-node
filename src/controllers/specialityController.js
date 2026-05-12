const { response } = require('express');
const Speciality = require('../models/speciality');

const getSpecialities = async(req, res) => {

    const specialities = await Speciality.find()

    res.json({
        ok: true,
        specialities
    });
};

const getSpecialitysList = async(req, res) => {

    // const categorias = await Categoria.find()
    //     .populate('blog');

    const specialities = await Speciality.find()
    .populate('usuarios')
    .sort({ createdAt: -1 });

    res.json({
        ok: true,
        specialities
    });
};

const getSpeciality = async(req, res) => {

    const id = req.params.id;
    Speciality.findById(id, {})
        .populate('blog')
        .exec((err, speciality) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar speciality',
                    errors: err
                });
            }
            if (!speciality) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El speciality con el id ' + id + 'no existe',
                    errors: { message: 'No existe un speciality con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                speciality: speciality
            });
        });


    
};

const crearSpeciality = async(req, res) => {

    const uid = req.uid;
    const speciality = new Speciality({
        usuario: uid,
        ...req.body
    });

    try {

        const specialityDB = await speciality.save();

        res.json({
            ok: true,
            speciality: specialityDB
        });

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarSpeciality = async(req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const speciality = await Speciality.findById(id);
        if (!speciality) {
            return res.status(500).json({
                ok: false,
                msg: 'speciality no encontrado por el id'
            });
        }

        const cambiosSpeciality = {
            ...req.body,
            usuario: uid
        }

        const specialityActualizado = await Speciality.findByIdAndUpdate(id, cambiosSpeciality, { new: true });

        res.json({
            ok: true,
            specialityActualizado
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};

const borrarSpeciality = async(req, res) => {

    const id = req.params.id;

    try {

        const speciality = await Speciality.findById(id);
        if (!speciality) {
            return res.status(500).json({
                ok: false,
                msg: 'speciality no encontrado por el id'
            });
        }

        await Speciality.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'speciality eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};



module.exports = {
    getSpecialities,
    getSpeciality,
    getSpecialitysList,
    crearSpeciality,
    actualizarSpeciality,
    borrarSpeciality,
};