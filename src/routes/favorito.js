/*
    Ruta: /api/favoritos
*/
const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const {
    crearFavorito,
    actualizarFavorito,
    getFavoritos,
    getFavorito,
    borrarFavorito,
    listarFavoritoPorUsuario
} = require('../controllers/favoritoController');

const {
    validarJWT,
    validarAdminRoleOMismoUsuario,
} = require('../middlewares/validar-jwt');


router.get('/all/', validarJWT, getFavoritos);
router.get('/:id', [validarJWT], getFavorito);
router.delete('/borrar/:id', [validarJWT, ], borrarFavorito);
router.get('/user_favorites/:id', listarFavoritoPorUsuario);

router.post('/crear', [
    validarJWT,
    validarCampos
], crearFavorito);


router.put('/editar/:id', [
    validarJWT,
    validarCampos
], actualizarFavorito);



module.exports = router;