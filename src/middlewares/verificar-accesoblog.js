const Profile = require('../models/profile'); 
const Blog = require('../models/blog'); 

const verificarAccesoBlog = async (req, res) => {
    try {
        const { blogId, usuarioId } = req.params;

        // 1. Buscamos el perfil y poblamos los pagos
        const profile = await Profile.findOne({ usuario: usuarioId }).populate('pagos');

        if (!profile) return res.status(404).send({ message: 'Perfil no encontrado' });

        // 2. Validación A: ¿Es Premium?
        const esPremium = profile.plan !== 'free';

        // 3. Validación B: ¿Compró este blog específico?
        // Buscamos en el array de pagos si existe uno que coincida con el blogId
        const blogComprado = profile.pagos.some(pago => 
            pago.blog && pago.blog.includes(blogId)
        );

        if (esPremium || blogComprado) {
            // Si cumple cualquiera de las dos, enviamos el contenido
            const blog = await Blog.findById(blogId);
            return res.status(200).send({ content: blog, acceso: true });
        } else {
            // Si no tiene acceso, podrías restarle uno de sus "3 artículos gratis"
            return res.status(403).send({ 
                message: 'Contenido bloqueado', 
                acceso: false,
                quedanGratis: Math.max(0, 3 - profile.articulosVistos)
            });
        }

    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};


module.exports = { 
    verificarAccesoBlog
 };
