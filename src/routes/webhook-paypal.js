const { Router } = require('express');
const router = Router();

const { handlePaypalWebhook } = require('../controllers/webhook.controller');

// PayPal enviará sus notificaciones POST aquí
router.post('/paypal', handlePaypalWebhook);
module.exports = router;