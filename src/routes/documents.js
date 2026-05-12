/*
 Ruta: /api/documents
 */

const { Router } = require('express');
const router = Router();
const {
    getDocumentos,
    crearDocumento,
    getDocumento,
    actualizarDocumento,
    borrarDocumento,
    listarDocumentoPorUsuario,

} = require('../controllers/documentoController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getDocumentos);
router.get('/:id', getDocumento);
router.get('/user/:id', listarDocumentoPorUsuario);

router.post('/crear', [
    validarJWT,
    validarCampos
], crearDocumento);

router.put('/editar/:id', [
    validarJWT,
    validarCampos
], actualizarDocumento);
router.delete('/borrar/:id', validarJWT, borrarDocumento);


module.exports = router;