/*
 Ruta: /api/pagos
 */

const { Router } = require('express');
const router = Router();
const {
    getPagos,
    crearPago,
    getPago,
    actualizarPago,
    borrarPago,
    desactivar,
    activar,
    listarPagoPorUsuario,
    newest,
    actualizarPagoStatus

} = require('../controllers/pagoController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getPagos);
router.get('/recientes', newest);
router.get('/desactivar/:id', validarJWT, desactivar);
router.get('/activar/:id', validarJWT, activar);
router.get('/:id', getPago);
router.get('/user_pago/:id', listarPagoPorUsuario);
router.delete('/borrar/:id', validarJWT, borrarPago);

router.post('/crear', [
    validarJWT,
    check('referencia', 'El referencia es necesario').not().isEmpty(),
    check('usuario', 'El usuario id debe de ser valido').isMongoId(),
    validarCampos
], crearPago);

router.put('/editar/:id', [
    validarJWT,
    // check('referencia', 'El referencia es necesario').not().isEmpty(),
    validarCampos
], actualizarPago);
router.put('/updateStatus/:id', [
    validarJWT,
    // check('referencia', 'El referencia es necesario').not().isEmpty(),
    validarCampos
], actualizarPagoStatus);



module.exports = router;