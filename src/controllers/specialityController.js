const { response } = require('express');
const Speciality = require('../models/speciality');
const Profile = require('../models/profile');

const getSpecialities = async(req, res) => {

    const specialities = await Speciality.find()

    res.json({
        ok: true,
        specialities
    });
};

const getSpecialitysList = async(req, res) => {
    try {
        const specialities = await Speciality.aggregate([
            {
                $lookup: {
                    from: 'profiles',
                    let: { specialityId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [ { $toObjectId: '$especialidad' }, '$$specialityId' ]
                                }
                            }
                        }
                    ],
                    as: 'usuariosAsignados'
                }
            },
            {
                $match: {
                    'usuariosAsignados.0': { $exists: true }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                // Moldeamos la respuesta final
                $project: {
                    nombre: 1, // Reemplaza por el nombre real de tu campo en Speciality (ej. name, nombre, etc.)
                    slug: 1, // Reemplaza por el nombre real de tu campo en Speciality (ej. name, nombre, etc.)
                    createdAt: 1,
                    // Agrega este nuevo campo que calcula la cantidad exacta en tiempo real
                    totalUsuarios: { $size: '$usuariosAsignados' } 
                }
            }
        ]);

        return res.json({ ok: true, specialities });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al procesar especialidades' });
    }
};





const getSpeciality = async(req, res) => {

    const id = req.params.id;
    Speciality.findById(id, {})
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
     // Convertir el nombre en slug
    const nombre = req.body.nombre || '';
    const slug = nombre.toLowerCase()
        .trim()
        .replace(/[\s]+/g, '-') // reemplaza espacios por guiones
        .replace(/[^\w\-]+/g, '') // elimina caracteres no alfanuméricos excepto guiones
        .replace(/\-\-+/g, '-') // reemplaza guiones múltiples por uno solo
        // reemplaza acentos y caracteres especiales
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ó/g, 'o')
        .replace(/ú/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/ü/g, 'u');
  

    const speciality = new Speciality({
        usuario: uid,
        ...req.body,
        slug: slug,
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
        // Si viene el título actualizado, actualizar el slug
        if (req.body.nombre) {
            const name = req.body.name;
            const slug = name.toLowerCase()
                .trim()
                .replace(/[\s]+/g, '-') // reemplaza espacios por guiones
                .replace(/[^\w\-]+/g, '') // elimina caracteres no alfanuméricos excepto guiones
                .replace(/\-\-+/g, '-') // reemplaza guiones múltiples por uno solo
                // reemplaza acentos y caracteres especiales
                .replace(/á/g, 'a')
                .replace(/é/g, 'e')
                .replace(/í/g, 'i')
                .replace(/ó/g, 'o')
                .replace(/ú/g, 'u')
                .replace(/ñ/g, 'n')
                .replace(/ü/g, 'u');
            cambiosSpeciality.slug = slug;
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

const mongoose = require('mongoose'); 

async function listarUsuariosPorEpecialidad(req, res) {
    const slug = req.params['slug']; 
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    try {
        // 1. Buscamos la especialidad por su slug correcto
        const especialidadEncontrada = await Speciality.findOne({ slug: slug });

        if (!especialidadEncontrada) {
            return res.status(404).json({ 
                ok: false, 
                message: `No se encontró la especialidad con el slug: ${slug}` 
            });
        }

        // 2. Buscamos los perfiles vinculados a ese ID de especialidad
        const profiles = await Profile.find({ 
            especialidad: especialidadEncontrada._id 
        })
        .select('_id first_name last_name img especialidad usuario ciudad rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // 3. Contamos el total para la paginación del Front-end
        const totalProfiles = await Profile.countDocuments({ 
            especialidad: especialidadEncontrada._id 
        });

        // 4. Retornamos la estructura con los datos de la especialidad incluidos
        return res.status(200).json({ 
            ok: true, 
            speciality: {
                _id: especialidadEncontrada._id,
                nombre: especialidadEncontrada.nombre, // Nombre oficial para el título en tu vista
                slug: especialidadEncontrada.slug
            },
            profiles,
            totalProfiles,
            totalPages: Math.ceil(totalProfiles / limit),
            currentPage: page
        });

    } catch (err) {
        console.error('Error en controlador:', err);
        return res.status(500).json({ 
            ok: false, 
            message: 'Error en el servidor', 
            error: err.message 
        });
    }
}






module.exports = {
    getSpecialities,
    getSpeciality,
    getSpecialitysList,
    crearSpeciality,
    actualizarSpeciality,
    borrarSpeciality,
    listarUsuariosPorEpecialidad
};