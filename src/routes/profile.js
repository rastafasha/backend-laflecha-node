/*
    Ruta: /api/profile
*/
const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const {
    crearProfile,
    getProfiles,
    getProfile,
    actualizarProfile,
    borrarProfile,
    listarProfilePorUsuario,
    activarPlanGratuitoInterno,
    saveSubscriptionId,
    sincronizarSuscripcionExistente,
    fixSuscripcionAyer,
    limpiarYActualizarSuscripcion
} = require('../controllers/profileController');

const {
    validarJWT,
    validarAdminRoleOMismoUsuario,
} = require('../middlewares/validar-jwt');


router.get('/all/',
     getProfiles);
router.get('/fixsubscription', fixSuscripcionAyer);
router.get('/limpiarsubscription', limpiarYActualizarSuscripcion);
router.get('/:id', 
    // [validarJWT],
     getProfile);

router.get('/user_profile/:id',validarJWT, listarProfilePorUsuario);
router.get('/sincronizar-fix/:id', sincronizarSuscripcionExistente);



router.post('/plangratuito', [
    validarJWT,
], activarPlanGratuitoInterno);

router.post('/save-subscription', [
    validarJWT,
], saveSubscriptionId);

router.post('/store', [
    validarJWT,
    // check('first_name', 'el first_name es obligatorio').not().isEmpty(),
    // check('last_name', 'el last_name es obligatorio').not().isEmpty(),
    // check('usuario', 'El usuario id debe de ser valido').isMongoId(),
    validarCampos
], crearProfile);

router.put('/update/:id', [
    validarJWT,
    validarCampos
], actualizarProfile);
router.delete('/destroy/:id', [validarJWT, ], borrarProfile);





module.exports = router;