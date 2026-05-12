/*
 Ruta: /api/comments
 */

const { Router } = require('express');
const router = Router();
const {
    getComments,
    crearComment,
    getComment,
    actualizarComment,
    borrarComment,

} = require('../controllers/commentController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getComments);
router.get('/:id', getComment);

router.delete('/borrar/:id', validarJWT, borrarComment);

router.post('/crear', [
    validarJWT,
    validarCampos
], crearComment);

router.put('/editar/:id', [
    validarJWT,
    validarCampos
], actualizarComment);



module.exports = router;