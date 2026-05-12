/*
 Ruta: /api/sideadvices
 */

 const { Router } = require('express');
 const router = Router();
 const {
    getSideadvices,
    getSideadvice,
    crearSideadvice,
    actualizarSideadvice,
    borrarSideadvice,
    desactivar,
    activar,
    activos
 
 } = require('../controllers/sideadviceController');
 const { validarJWT } = require('../middlewares/validar-jwt');
 const { check } = require('express-validator');
 const { validarCampos } = require('../middlewares/validar-campos');
 
 router.get('/', getSideadvices);
 router.get('/activos', activos);
 router.get('/desactivar/:id', validarJWT, desactivar);
 router.get('/activar/:id', validarJWT, activar);
 router.get('/:id', getSideadvice);
 
 router.delete('/borrar/:id', validarJWT, borrarSideadvice);
 
 router.post('/crear', [
     validarJWT,
     validarCampos
 ], crearSideadvice);
 
 router.put('/editar/:id', [
     validarJWT,
     validarCampos
 ], actualizarSideadvice);
 
 
 
 module.exports = router;