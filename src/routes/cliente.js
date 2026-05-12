/*
 Ruta: /api/clients
 */

const { Router } = require('express');
const router = Router();
const {
    crearClient,
    getClient,
    actualizarClient,
    borrarClient,
    listarClientPorUsuario,
    addClient,
    getMyClients,
    removeClient

} = require('../controllers/clientController');
const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/:id', getClient);
router.get('/myclients/:id', getMyClients);
router.get('/user/:id', listarClientPorUsuario);

router.post('/crear', [
    validarJWT,
    validarCampos
], crearClient);

router.post('/addclient/', [
    validarJWT,
    validarCampos
], addClient);

router.put('/editar/:id', [
    validarJWT,
    validarCampos
], actualizarClient);

router.delete('/removeclient/:clienteId', [ validarJWT, validarCampos ], removeClient);


router.delete('/borrar/:id', validarJWT, borrarClient);


module.exports = router;