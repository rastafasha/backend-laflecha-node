/*
 Ruta: /api/iaasistente
 */

const { Router } = require('express');
const router = Router();
const {
    generarDocumentoLegal,
    actualizarDocumentoLegal,
    getDocumentos,
    getDocumento,
    listarPorUsuario
} = require('../controllers/iAController');

const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');

router.get('/', getDocumentos);
router.get('/:id', getDocumento);
router.get('/user/:id', listarPorUsuario);

router.post('/generar-documento', [
    validarJWT,
], generarDocumentoLegal);

router.put('/actualizar-documento/:id', 
    [validarJWT],
     actualizarDocumentoLegal);

module.exports = router;




