/*
 Ruta: /api/comentarios
 */

const { Router } = require('express');
const router = Router();
const {
    getComentarios,
    crearComentario,
    actualizarComentario,
    borrarComentario,
    getComentario,
    listarLast,
    listarLikes,
    addDislike,
    addLike,
    getData,
    listarDislikes,
    listarCPorUsuario
} = require('../controllers/comentarioController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getComentarios);

router.get('/:id', validarJWT, getComentario);
router.get('/user/:id', listarCPorUsuario);
router.get('/comentarios_client/obtener/:id/:orden', getData);
router.get('/comentarios_dislikes/get/:id', listarDislikes);
router.get('/comentarios_likes/get/:id', listarLikes);


router.post('/store', [
    validarJWT,
    check('comentario', 'El comentario del categoria es necesario').not().isEmpty(),
    validarCampos
], crearComentario);
router.post('/comentarios_likes/add', addLike);
router.post('/comentarios_dislikes/add', addDislike);


router.put('/update/:id', [
    validarJWT,
    check('comentario', 'El comentario del categoria es necesario').not().isEmpty(),
    validarCampos
], actualizarComentario);

router.delete('/delete/:id', validarJWT, borrarComentario);


module.exports = router;