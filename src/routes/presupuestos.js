/*
 Ruta: /api/presupuestos
 */

const { Router } = require('express');
const router = Router();
const {
    getPresupuestos,
    getPresupuesto,
    crearPresupuesto,
    actualizarPresupuesto,
    borrarPresupuesto,
    listarPresupuestoPorUsuario,
    listarPresupuestoPorCliente,
    updateStatusPresupuesto

} = require('../controllers/presupuestoController');
const { validarJWT, validarJWTOpcional} = require('../middlewares/validar-jwt');
const { verificarLimiteArticulos} = require('../middlewares/verificar-limite');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/:id', getPresupuesto);
router.get('/user/:id', listarPresupuestoPorUsuario);
router.get('/cliente/:id', listarPresupuestoPorCliente);
router.get('/', getPresupuestos);


router.post('/crear', [
    validarJWT,
    validarCampos
], crearPresupuesto);

router.put('/editar/:id', [
    validarJWT,
    validarCampos
], actualizarPresupuesto);

router.put('/update-status/:id', [
    validarJWT,
    validarCampos
], updateStatusPresupuesto);

router.delete('/borrar/:id', validarJWT, borrarPresupuesto);


module.exports = router;