/*
 Ruta: /api/documentregistro
 */

const { Router } = require('express');
const router = Router();
const {
    getDocumentos,
    guardarDocumento,
    getDocumento,
    actualizarDocumento,
    borrarDocumento,
    listarDocumentoPorUsuario,
    updateStatusDocumento

} = require('../controllers/documentoRegistroController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getDocumentos);
router.get('/:id', getDocumento);
router.get('/user/:id', listarDocumentoPorUsuario);

router.post('/crear', [
    validarJWT,
    validarCampos
], guardarDocumento);

router.put('/editar/:id', [
    validarJWT,
    validarCampos
], actualizarDocumento);

router.put('/update-status/:id', [
    validarJWT,
    validarCampos
], updateStatusDocumento);

router.delete('/borrar/:id', validarJWT, borrarDocumento);


module.exports = router;