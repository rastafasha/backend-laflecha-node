/*
 Ruta: /api/solicitudes
 */

const { Router } = require('express');
const router = Router();
const {
    getSolicitudes,
    crearSolicitud,
    getSolicitud,
    borrarSolicitud,
    listarSolicitudPorUsuario,
    listarSolicitudPorCliente,
    updateStatusSolicitud

} = require('../controllers/solicitudController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getSolicitudes);
router.get('/:id', getSolicitud);
router.get('/user/:id', listarSolicitudPorUsuario);
router.get('/cliente/:id', listarSolicitudPorCliente);

router.post('/crear', [
    validarJWT,
    validarCampos
], crearSolicitud);

router.put('/update-status/:id', [
    validarJWT,
    validarCampos
], updateStatusSolicitud);

router.delete('/borrar/:id', validarJWT, borrarSolicitud);


module.exports = router;