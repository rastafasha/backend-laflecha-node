
/*
 Ruta: /api/paypal
 */

const { Router } = require('express');
const router = Router();
const {
   createPayment,
   executePayment,
   createProduct,
   createPlan,
   generateSubscription,
   getPlans,
   getPlanbyId,
   getProducts,
   getProductsbyId,
   updatePproduct,
   updatePlan,
   activatePlan,
   desactivatePlan,
   getProductsByPage,
   getPlanesPorPagina,
   getSubcriptionbyId,
   borrarProduct,
   getPaypalSubscription
   
} = require('../controllers/paypalController');
const { validarJWT } = require('../middlewares/validar-jwt');

router.get('/plans', getPlans);
router.get('/plan/:id', getPlanbyId);
router.get('/subcription/:id', getSubcriptionbyId);
router.get('/product/:id', getProductsbyId);
router.get('/user_subcription/:id', getPaypalSubscription);

router.get('/products', getProducts);
router.get('/planes-paypal', getPlanesPorPagina);
router.get('/products-paypal', getProductsByPage);

router.post('/create-payment', createPayment);

router.post('/create-product', createProduct);

router.post('/create-plan', createPlan);
router.post('/generate-subscription', generateSubscription);
router.post('/execute-payment', executePayment);

// Cambiamos .patch por .post
router.post('/activar-plan/:id', activatePlan);
router.post('/desactivar-plan/:id', desactivatePlan);

// Estos sí pueden seguir siendo .patch si solo actualizas datos en tu DB local
router.patch('/editar-product/:id', updatePproduct);
router.patch('/editar-plan/:id', updatePlan);

router.delete('/productborrar/:id', borrarProduct);


module.exports = router;