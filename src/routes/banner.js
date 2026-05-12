/*
 Ruta: /api/banners
 */

const { Router } = require('express');
const router = Router();
const {
    getBanners,
    crearBanner,
    getBanner,
    actualizarBanner,
    borrarBanner,
    desactivar,
    activar,
    activos

} = require('../controllers/bannerController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getBanners);
router.get('/activos', activos);
router.get('/desactivar/:id', validarJWT, desactivar);
router.get('/activar/:id', validarJWT, activar);
router.get('/:id', getBanner);

router.delete('/borrar/:id', validarJWT, borrarBanner);

router.post('/crear', [
    validarJWT,
    check('titulo', 'El titulo es necesario').not().isEmpty(),
    validarCampos
], crearBanner);

router.put('/editar/:id', [
    validarJWT,
    check('titulo', 'El titulo es necesario').not().isEmpty(),
    validarCampos
], actualizarBanner);



module.exports = router;