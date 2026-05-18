const { Router } = require('express');
const { getByUser, createMessage } = require('../controllers/controllerMessage');
// Include your JWT validation middleware if you want to protect this route
// const { validarJWT } = require('../middlewares/validar-jwt'); 

const router = Router();

// Matches: GET /api/message/user/:usuario/:client
router.get('/user/:usuario/:client', getByUser);

// Matches: POST /api/message/store
router.post('/store', createMessage);

module.exports = router;
