const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); 
const request = require('request');
const PaypalPlan = require('../models/paypalPlan');
const Profile = require('../models/profile');
const axios = require('axios');


const CLIENT = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.PAYPAL_API;

const auth = {
    username: CLIENT,
    password: SECRET
};

// primero
//para crear el plan primero hay que generar el producto, 
//el cual da como resultado :data : {id: PROD-4A346540KG295494N}


const createProduct = async (req, res) => {
    try {
        // 1. Extraer datos del body correctamente
        const { name, description, type, category, image_url, home_url } = req.body;

        const productPayload = {
            name,
            description,
            type: type || 'SERVICE', // SERVICE o PHYSICAL
            category: category || 'SOFTWARE',
            image_url,
            home_url
        };

        // 2. Petición a PayPal usando Axios (más robusto)
        const response = await axios.post(
            `${PAYPAL_API}/v1/catalogs/products`,
            productPayload,
            {
                auth: {
                    username: CLIENT,
                    password: SECRET
                },
                headers: {
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': `product-${Date.now()}` // Evita duplicados por reintentos
                }
            }
        );

        // 3. Retornar solo lo necesario
        res.status(201).json({
            ok: true,
            productId: response.data.id,
            details: response.data
        });

    } catch (error) {
        console.error('Error PayPal Product:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            ok: false,
            message: 'Error al crear el producto en PayPal',
            error: error.response?.data
        });
    }
};


// segundo

// este incluirlo en el request como product_id
// resultado id: P-69F139449T308873YMSOX7LY

const createPlan = async (req, res) => {
    try {
        // Capturamos lo que viene del body
        const body = req.body;

        // EXTRA DE SEGURIDAD: Intentamos sacar los valores si vienen en la raíz, 
        // o si vienen dentro de objetos (por si Angular mandó la estructura vieja)
        const name = body.name || "Plan Mensual";
        const product_id = body.product_id;
        const total_cycles = Number(body.total_cycles) || 0;
        
        // Validar unidad de tiempo (forzar MAYÚSCULAS)
        const interval_unit = String(body.interval_unit || "MONTH").trim().toUpperCase();

        // Validar fixed_price de forma segura
        let rawPrice = body.fixed_price;
        // Si venía anidado en pricing_scheme, lo rescatamos
        if (body.pricing_scheme?.fixed_price?.value) {
            rawPrice = body.pricing_scheme.fixed_price.value;
        }
        const valorPrecio = parseFloat(rawPrice || 19.90).toFixed(2).toString();

        // Validar setup_fee de forma segura
        let rawSetupFee = body.setup_fee;
        if (body.payment_preferences?.setup_fee?.value) {
            rawSetupFee = body.payment_preferences.setup_fee.value;
        }
        const valorSetupFee = parseFloat(rawSetupFee || 0.01).toFixed(2).toString();
        
        const percentage = String(body.percentage || "0");

        // Construcción limpia y garantizada del Payload
        const planPayload = {
            product_id: product_id,
            name: name,
            description: "Acceso completo a herramientas de la app y beneficios exclusivos",
            status: "ACTIVE", 
            billing_cycles: [{
                frequency: {
                    interval_unit: interval_unit, // Aquí irá "MONTH" garantizado
                    interval_count: 1
                },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: total_cycles, 
                pricing_scheme: {
                    fixed_price: {
                        value: valorPrecio, // <-- CORREGIDO: Usamos la variable segura formateada
                        currency_code: "USD"
                    }
                }
            }],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: valorSetupFee, // <-- CORREGIDO: Usamos la variable segura formateada
                    currency_code: "USD"
                },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3
            },
            taxes: {
                percentage: percentage,
                inclusive: false
            }
        };

        // Log crucial para que revises tu consola de Node
        console.log("JSON FINAL ENVIADO A PAYPAL:", JSON.stringify(planPayload, null, 2));

        const response = await axios.post(
            `${PAYPAL_API}/v1/billing/plans`,
            JSON.stringify(planPayload), 
            {
                auth,
                headers: {
                    'PayPal-Request-Id': `plan-${Date.now()}`,
                    'Content-Type': 'application/json' 
                }
            }
        );

        res.status(201).json({
            ok: true,
            planId: response.data.id, 
            details: response.data
        });

    } catch (error) {
        console.error('Error PayPal Plan:', error.response?.data || error.message);
        res.status(400).json({
            ok: false,
            error: error.response?.data
        });
    }
};


// hay que pasar el plan_id P-69F139449T308873YMSOX7LY para generar la subcripcion

const generateSubscription = async (req, res) => {
    try {
        const { plan_id, name, surname, email_address } = req.body;

        const subscriptionPayload = {
            plan_id: plan_id,
            // start_time debe ser en formato ISO (ej: 2026-05-04T12:00:00Z)
            // Si quieres que empiece YA, es mejor no enviarlo y PayPal usa el tiempo actual
            quantity: "1",
            subscriber: {
                name: {
                    given_name: name,
                    surname: surname
                },
                email_address: email_address,
            },
            application_context: { // IMPORTANTE: PayPal usa esto para las URLs
                brand_name: process.env.BRAND_NAME,
                locale: "es-ES",
                shipping_preference: "NO_SHIPPING", // Ideal para servicios digitales
                user_action: "SUBSCRIBE_NOW",
                return_url: process.env.GRACIAS_URL,
                cancel_url: process.env.FALLO_URL
            }
        };

        const response = await axios.post(
            `${PAYPAL_API}/v1/billing/subscriptions`,
            subscriptionPayload,
            {
                auth,
                headers: { 'PayPal-Request-Id': `sub-${Date.now()}` }
            }
        );

        const subscriptionId = response.data.id;
        // Guardamos el ID de suscripción en el PERFIL
        // Suponiendo que tienes el profileId a mano o lo buscas por el userId
        await Profile.findOneAndUpdate(
            { userId: req.user.id },
            { paypalSubscriptionId: subscriptionId }
        );

        // El 'id' que devuelve aquí es el ID de la suscripción (I-XXXXX)
        // También devuelve una lista de 'links', el de 'approve' es el que el usuario debe visitar
        res.status(201).json({
            ok: true,
            subscriptionId: response.data.id,
            approvalUrl: response.data.links.find(link => link.rel === 'approve').href,
            details: response.data
        });

    } catch (error) {
        console.error('Error PayPal Subscription:', error.response?.data || error.message);
        res.status(400).json({ ok: false, error: error.response?.data });
    }
};

const updatePlan = (req, res) => {
    const id = req.params.id;
    const { name, description, status } = req.body; // Campos que quieres actualizar

    // PayPal requiere este formato específico (Array de operaciones)
    const patchPayload = [];

    if (name) {
        patchPayload.push({ op: "replace", path: "/name", value: name });
    }
    if (description) {
        patchPayload.push({ op: "replace", path: "/description", value: description });
    }
    if (status) {
        patchPayload.push({ op: "replace", path: "/status", value: status });
    }

    // Si quieres cambiar el estado de las preferencias de pago (ej. auto_bill_outstanding)
    // patchPayload.push({ op: "replace", path: "/payment_preferences/auto_bill_outstanding", value: true });

    request.patch({
        url: `${PAYPAL_API}/v1/billing/plans/${id}`,
        auth,
        body: patchPayload, // Enviamos el array de parches
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    }, (err, response) => {
        if (err) {
            return res.status(500).json({ ok: false, err });
        }

        // PayPal devuelve un 204 No Content si todo sale bien en un PATCH
        if (response.statusCode === 204) {
            return res.json({ ok: true, msg: 'Plan actualizado correctamente' });
        }

        res.json({ planPaypal: response.body });
    });
};


// opcionales

//compras unicas
const createPayment = (req, res) => {
    const { body, user_id, article_id } = req.body; // Asegúrate de enviar estos desde el front

    const pago = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: body.value // Ejemplo: "10.00"
            },
            // IMPORTANTE: El custom_id es clave para tu Webhook
            custom_id: `${user_id}|${article_id}` 
        }],
        application_context: {
            brand_name: process.env.BRAND_NAME,
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: process.env.RETURN_URL,
            cancel_url: process.env.CANCEL_URL,
        }
    };

    // Usando la API v2 de PayPal
    request.post(`${PAYPAL_API}/v2/checkout/orders`, {
        auth,
        body: pago,
        json: true
    }, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: response.body });
    });
};

//captura el dinero
const executePayment = (req, res) => {
    const { token } = req.body; // El ID que viene de Angular

    // 1. Generamos el header de autorización manualmente
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

    // 2. Hacemos la petición con el header explícito
    request.post(`${process.env.PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: {}, // Cuerpo vacío según requiere la API de captura
        json: true
    }, (err, response) => {
        if (err) {
            console.error("Error de red:", err);
            return res.status(500).json({ ok: false, error: err.message });
        }

        // 3. Verificamos la respuesta real de PayPal en los logs
        console.log("Status de Captura:", response.statusCode);
        
        if (response.statusCode !== 201 && response.statusCode !== 200) {
            console.log("Detalle del Error:", JSON.stringify(response.body));
            return res.status(response.statusCode).json(response.body);
        }

        res.json({ ok: true, data: response.body });
    });
};


const getPlans = (req, res) => {
    // const token = req.query.token;
    // console.log(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`);
    const { body } = req;
    request.get(`${PAYPAL_API}/v1/billing/plans`, {
        auth,
        body: body,
        json: true
    },
        (err, response) => {
            res.json({ planPaypals: response.body });
        });
};

const getPlanbyId = (req, res) => {
    const { body } = req;
    const id = req.params.id;
    request.get(`${PAYPAL_API}/v1/billing/plans/${id}`, {
        auth,
        body: {},
        json: true
    }, (err, response) => {
        res.json({ planPaypal: response.body });
    });
};




const getPlanesPorPagina = (req, res) => {
    // Obtenemos la página de los parámetros de la URL (ej: /planes?page=2)
    // Si no envían página, por defecto será la 1
    const pagina = req.query.page || 1;
    const tamanoPagina = 20;

    request.get(`${PAYPAL_API}/v1/billing/plans?page_size=${tamanoPagina}&page=${pagina}`, {
        auth,
        json: true
    }, (err, response) => {
        if (err) {
            return res.status(500).json({ error: "Error al conectar con PayPal" });
        }
        res.json({
            planPaypal: response.body
        });
    });
};


const activatePlan = (req, res) => {
    const id = req.params.id; // El ID del plan (P-XXXXX)

    request.post(`${PAYPAL_API}/v1/billing/plans/${id}/activate`, {
        auth,
        json: true
    }, (err, response) => {

        // PayPal devuelve 204 si todo salió bien
        if (response.statusCode === 204) {
            return res.status(200).json({
                ok: true,
                msg: `Plan ${id} activado correctamente`
            });
        }

        // Si hay un error (ej: el plan ya está activo o no existe)
        res.status(response.statusCode).json({
            ok: false,
            msg: 'No se pudo activar el plan',
            error: response.body
        });
    });
};


const desactivatePlan = (req, res) => {
    const id = req.params.id; // Recibe el P-XXXXXXXX

    request.post(`${PAYPAL_API}/v1/billing/plans/${id}/deactivate`, {
        auth,
        json: true
    }, (err, response) => {

        // Verificamos si hubo un error de red
        if (err) {
            return res.status(500).json({ ok: false, msg: 'Error de conexión con PayPal' });
        }

        // PayPal responde 204 No Content si se desactivó correctamente
        if (response.statusCode === 204) {
            return res.status(200).json({
                ok: true,
                msg: `El plan ${id} ha sido desactivado con éxito.`
            });
        }

        // Si el plan ya estaba desactivado o no existe, PayPal devuelve el error en el body
        res.status(response.statusCode).json({
            ok: false,
            msg: 'No se pudo desactivar el plan',
            details: response.body
        });
    });
};


//products

const getProducts = (req, res) => {
    // Definimos cuántos queremos ver y en qué página empezar
    const pageSize = 50; // Máximo permitido por página en esta API
    const page = 1;

    // Agregamos los parámetros a la URL
    const url = `${PAYPAL_API}/v1/catalogs/products?page_size=${pageSize}&page=${page}&total_required=true`;

    request.get(url, {
        auth,
        json: true
    }, (err, response) => {
        if (err) {
            return res.status(500).json({ ok: false, error: err });
        }

        // Los productos suelen venir en response.body.products
        res.json({
            ok: true,
            productPaypals: response.body.products || []
        });
    });
};


const getProductsbyId = (req, res) => {
    const { id } = req.params; // Pasa PROD-84P82764JY185074Y
    request.get(`${PAYPAL_API}/v1/catalogs/products/${id}`, {
        auth,
        json: true
    }, (err, response) => {
        res.json(response.body);
    });
};

const updatePproduct = (req, res) => {
    const { body } = req;
    const id = req.params.id;
    request.patch(`${PAYPAL_API}/v1/catalogs/products/${id}`, {
        auth,
        body: {},
        json: true
    }, (err, response) => {
        res.json({ productPaypal: response.body });
    });
};


const getProductsByPage = (req, res) => {
    // Leemos la página desde la URL: /productos?page=2
    // Si no viene ninguna, usamos la 1 por defecto
    const page = req.query.page || 1;
    const pageSize = 10;

    request.get(`${PAYPAL_API}/v1/catalogs/products?page_size=${pageSize}&page=${page}&total_required=true`, {
        auth,
        json: true
    }, (err, response) => {
        if (err) {
            return res.status(500).json({ ok: false, error: err });
        }
        res.json({ productPaypal: response.body });
    });
};


const borrarProduct = async (req, res) => {

    const id = req.params.id;
    const data = [
        {
            op: "replace",
            path: "/name",
            value: "OBSOLETO - " + req.body.name // Le cambias el nombre para identificarlo
        }
    ];

    request.patch(`${PAYPAL_API}/v1/catalogs/products/${id}`, {
        auth,
        body: data,
        json: true
    }, (err, response) => {
        res.json({ ok: true, msg: "Producto marcado como obsoleto" });
    });
};

//subcriptions


const getSubcriptionbyId = async (req, res) => {
    const { id } = req.params;

    console.log("ClientID cargado:", process.env.PAYPAL_CLIENT_ID ? "SÍ" : "NO");

    try {
        const token = await getPayPalAccessToken(); // Obtenemos el token primero

        const response = await axios({
            url: `${PAYPAL_API}/v1/billing/subscriptions/${id}`,
            method: 'get',
            headers: {
                'Authorization': `Bearer ${token}`, // Usamos el token generado
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        res.json({ subscription: response.data });
    } catch (error) {
    // Esto te dirá exactamente qué falló en tu terminal
    console.log("--- ERROR COMPLETO ---");
    if (error.response) {
        // El servidor de PayPal respondió con un código de error (400, 401, 404, etc.)
        console.log("Data:", error.response.data);
        console.log("Status:", error.response.status);
    } else if (error.request) {
        // La petición se hizo pero no hubo respuesta (Problema de red o URL mal escrita)
        console.log("No hubo respuesta de PayPal. Revisa tu conexión o la URL.");
    } else {
        // Algo pasó al configurar la petición
        console.log("Error de configuración:", error.message);
    }
    
    res.status(500).json({
        error: 'Fallo al obtener la suscripción',
        mensaje_tecnico: error.message,
        detalles: error.response?.data || 'Sin respuesta del servidor'
    });
}

};



const getPayPalAccessToken = async () => {
    // 1. Extraemos con nombres claros
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;

    // 2. Verificación manual antes de usar .trim()
    if (!clientId) {
        throw new Error('Falta PAYPAL_CLIENT_ID en las variables de entorno');
    }
    if (!secret) {
        throw new Error('Falta PAYPAL_SECRET en las variables de entorno');
    }

    // 3. Ahora sí usamos trim con seguridad
    const auth = Buffer.from(`${clientId.trim()}:${secret.trim()}`).toString('base64');
    
    try {
        const response = await axios({
            url: process.env.PAYPAL_API,
            method: 'post',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: 'grant_type=client_credentials'
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error en PayPal Auth:', error.response?.data || error.message);
        throw error;
    }
};
const getPaypalSubscription = async (subscriptionId) => {
    const accessToken = 'TU_ACCESS_TOKEN_AQUI'; // Debes generarlo con tu ClientID y Secret
    const url = `${PAYPAL_API}/${subscriptionId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data; // Aquí vendrá el status (ACTIVE, SUSPENDED, etc.)
    } catch (error) {
        console.error("Error al consultar PayPal:", error);
    }
};




module.exports = {
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
    getPlanesPorPagina,
    getProductsByPage,
    getSubcriptionbyId,
    borrarProduct,
    getPaypalSubscription
};