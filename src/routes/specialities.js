/*
 Ruta: /api/specialities
 */

const { Router } = require('express');
const router = Router();
const {
    getSpecialities,
    getSpeciality,
    find_by_name,
    getSpecialitysList,
    crearSpeciality,
    actualizarSpeciality,
    borrarSpeciality,
} = require('../controllers/specialityController');

const { validarJWT } = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', getSpecialities);//para crear perfil
router.get('/lista', getSpecialitysList); // para obtener perfiles
router.get('/:id', getSpeciality);

router.post('/crear', [
    validarJWT,
    validarCampos
], crearSpeciality);

router.put('/editar/:id', [
    validarJWT,
    validarCampos
], actualizarSpeciality);

router.delete('/borrar/:id', validarJWT, borrarSpeciality);




router.get('/category_by_nombre/:nombre', find_by_name);


module.exports = router;