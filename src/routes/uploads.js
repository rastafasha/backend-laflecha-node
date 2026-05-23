/*
Ruta: /api/uploads/
*/

const { Router } = require('express');
const expressfileUpload = require('express-fileupload');
const path = require('path');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();
const { fileUpload, fileUploadRegistro, retornaImagen } = require('../controllers/uploadController');

router.use(expressfileUpload());

// 1. PRIMERO la ruta específica para documentos de registro
router.put('/docregist/:tipo/:id', validarJWT, fileUploadRegistro);

// 2. DESPUÉS las rutas genéricas con parámetros dinámicos
router.put('/:tipo/:id', validarJWT, fileUpload);
router.get('/:tipo/:foto', retornaImagen);

module.exports = router;
