const { response } = require('express');
const Favorito = require('../models/favorito');
const Profile = require('../models/profile');

const crearFavorito = async(req, res) => {
    const uid = req.uid;
    const { blog } = req.body; // Extraemos el ID del blog del body

    try {
        // 1. Verificamos si ya existe para evitar duplicados
        const existe = await Favorito.findOne({ usuario: uid, blog: blog });
        
        if (existe) {
            return res.status(400).json({
                ok: false,
                msg: 'Este artículo ya está en tus favoritos'
            });
        }

        // 2. Si no existe, lo creamos
        const favorito = new Favorito({ usuario: uid, blog });
        const favoritoDB = await favorito.save();

        // 3. Actualizamos el perfil con el ID del favorito recién creado
        await Profile.updateOne(
            { usuario: uid },
            { $push: { favoritos: favoritoDB._id } }
        );

        res.json({
            ok: true,
            favorito: favoritoDB
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: 'Hable con el administrador' });
    }
};



const actualizarFavorito = async(req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const favorito = await Favorito.findById(id);
        if (!favorito) {
            return res.status(500).json({
                ok: false,
                msg: 'favorito no encontrado por el id'
            });
        }

        const cambiosFavorito = {
            ...req.body,
            usuario: uid
        }

        const favoritoActualizado = await Profile.findByIdAndUpdate(id, cambiosFavorito, { new: true });

        res.json({
            ok: true,
            favoritoActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};

const getFavoritos = async(req, res) => {

    const favoritos = await Favorito.find()
        .populate('blog')
        .populate('usuario')

    res.json({
        ok: true,
        favoritos
    });
};



const getFavorito = async(req, res) => {

    const id = req.params.id;

    Favorito.findById(id)
        .populate('usuario')
        .exec((err, favorito) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar favorito',
                    errors: err
                });
            }
            if (!favorito) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El favorito con el id ' + id + 'no existe',
                    errors: { message: 'No existe un favorito con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                favorito: favorito
            });
        });

};


const borrarFavorito = async(req, res) => {

    const id = req.params.id;

    try {

        const favorito = await Favorito.findById(id);
        if (!favorito) {
            return res.status(500).json({
                ok: false,
                msg: 'favorito no encontrado por el id'
            });
        }

        await Favorito.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'favorito eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

const listarFavoritoPorUsuario = (req, res) => {
    var id = req.params['id'];
    Favorito.find({ usuario: id }, (err, favorito_data) => {
        if (!err) {
            if (favorito_data) {
                res.status(200).send({ favoritos: favorito_data });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    }).populate('usuario',' username email uid')
    .populate('blog')
    .sort({ createdAt: -1 });
}



module.exports = {
    crearFavorito,
    actualizarFavorito,
    getFavoritos,
    getFavorito,
    borrarFavorito,
    listarFavoritoPorUsuario

};