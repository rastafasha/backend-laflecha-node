/*
 Ruta: /api/documents
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
    listarDocumentoPorCategoria,
    listarActivos,
    compartirDocumento,
    listarDocumentosCompartidosConmigo

} = require('../controllers/documentoController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getDocumentos);
router.get('/:id', getDocumento);
router.get('/user/:id', listarDocumentoPorUsuario);
router.get('/activos', listarActivos);
router.get('/showByCategory/:userId/:name', listarDocumentoPorCategoria);
router.get('/sharewithme/:miUsuarioId', listarDocumentosCompartidosConmigo);

router.post('/crear', [
    validarJWT,
    validarCampos
], guardarDocumento);
router.post('/share', [
    validarJWT,
    validarCampos
], compartirDocumento);

router.put('/editar/:id', [
    validarJWT,
    validarCampos
], actualizarDocumento);
router.delete('/borrar/:id', validarJWT, borrarDocumento);


module.exports = router;