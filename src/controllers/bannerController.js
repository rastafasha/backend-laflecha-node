const { response } = require('express');
const Banner = require('../models/banner');


const getBanners = async(req, res) => {

    const banners = await Banner.find();

    res.json({
        ok: true,
        banners
    });
};

const getBanner = async(req, res) => {

    const id = req.params.id;

    Banner.findById(id)
        .exec((err, banner) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar banner',
                    errors: err
                });
            }
            if (!banner) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El banner con el id ' + id + 'no existe',
                    errors: { message: 'No existe un banner con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                banner: banner
            });
        });

};

const crearBanner = async(req, res) => {

    const uid = req.uid;
    const banner = new Banner({
        usuario: uid,
        ...req.body
    });

    try {

        const bannerDB = await banner.save();

        res.json({
            ok: true,
            banner: bannerDB
        });

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarBanner = async(req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(500).json({
                ok: false,
                msg: 'banner no encontrado por el id'
            });
        }

        const cambiosBanner = {
            ...req.body,
            usuario: uid
        }

        const bannerActualizado = await Banner.findByIdAndUpdate(id, cambiosBanner, { new: true });

        res.json({
            ok: true,
            bannerActualizado
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};

const borrarBanner = async(req, res) => {

    const id = req.params.id;

    try {

        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(500).json({
                ok: false,
                msg: 'banner no encontrado por el id'
            });
        }

        await Banner.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'banner eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

function activos(req, res) {

    Banner.find({  status: ['Activo'] }).exec((err, banner_data) => {
        if (err) {
            res.status(500).send({ message: 'Ocurrió un error en el servidor.' });
        } else {
            if (banner_data) {
                res.status(200).send({ banners: banner_data });
            } else {
                res.status(500).send({ message: 'No se encontró ningun dato en esta sección.' });
            }
        }
    });
}



function desactivar(req, res) {
    var id = req.params['id'];

    Banner.findByIdAndUpdate({ _id: id }, { status: 'Desactivado' }, (err, banner_data) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            if (banner_data) {
                res.status(200).send({ banner: banner_data });
            } else {
                res.status(403).send({ message: 'No se actualizó el banner, vuelva a intentar nuevamente.' });
            }
        }
    })
}

function activar(req, res) {
    var id = req.params['id'];
    // console.log(id);
    Banner.findByIdAndUpdate({ _id: id }, { status: 'Activo' }, (err, banner_data) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            if (banner_data) {
                res.status(200).send({ banner: banner_data });
            } else {
                res.status(403).send({ message: 'No se actualizó el banner, vuelva a intentar nuevamente.' });
            }
        }
    })
}




module.exports = {
    getBanners,
    crearBanner,
    getBanner,
    actualizarBanner,
    borrarBanner,
    desactivar,
    activar,
    activos


};