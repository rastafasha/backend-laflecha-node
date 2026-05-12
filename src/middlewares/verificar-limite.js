const Profile = require('../models/profile'); // Asegúrate de que la ruta al modelo sea correcta

const verificarLimiteArticulos = async (req, res, next) => {
    try {
        // Traemos el perfil y POBLAMOS los pagos para ver qué blogs contienen
        const perfil = await Profile.findOne({ usuario: req.uid }).populate('pagos');

        if (!perfil) return res.status(404).json({ msg: 'Perfil no encontrado' });

        // 1. SI ES PREMIUM: Acceso total
        if (perfil.plan !== 'free') return next();

        // 2. SI COMPRÓ EL BLOG: Buscar en el historial de pagos
        const blogId = req.params.id || req.body.blogId;

        // Revisamos si en alguno de sus pagos figura este blogId
        const blogComprado = perfil.pagos?.some(pago =>
            pago.blog && pago.blog.includes(blogId) // Busca el ID dentro del Array del modelo Pago
        );

        if (blogComprado) return next();

        // 3. REINICIO MENSUAL
        const ahora = new Date();
        if (!perfil.fechaReinicio || ahora > perfil.fechaReinicio) {
            perfil.articulosVistos = 0;
            let proximoMes = new Date();
            perfil.fechaReinicio = new Date(proximoMes.setMonth(proximoMes.getMonth() + 1));
        }

        // 4. VERIFICACIÓN DE LÍMITE (Créditos gratis)
        if (perfil.articulosVistos < 3) {
            perfil.articulosVistos += 1;
            await perfil.save();
            return next();
        } else {
            return res.status(403).json({
                ok: false,
                msg: 'Límite alcanzado. Pásate a Premium o compra este artículo.'
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al verificar límite' });
    }
};



module.exports = {
    verificarLimiteArticulos
};
