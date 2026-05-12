const fs = require('fs');
const Profile = require('../models/profile');
const Blog = require('../models/blog');
const Sideadvertising = require('../models/sideadvice');
const Banner = require('../models/banner');
const Pago = require('../models/pago');
const borrarImagen = (path) => {

    if (fs.existsSync(path)) {
        //borrar la imagen anterior
        fs.unlinkSync(path);
    }
}

const actualizarImagen = async(tipo, id, nombreArchivo) => {

    let pathViejo = '';

    switch (tipo) {

        case 'profiles':
            const profile = await Profile.findById(id);
            if (!profile) {
                console.log('No es un profile por id');
                return false;
            }
            pathViejo = `./uploads/profiles/${profile.img}`;

            borrarImagen(pathViejo);

            profile.img = nombreArchivo;
            await profile.save();
            return true;
            break;

         case 'blogs':
            const blog = await Blog.findById(id);
            if (!blog) {
                console.log('No es un blog por id');
                return false;
            }
            pathViejo = `./uploads/blogs/${blog.img}`;

            borrarImagen(pathViejo);

            blog.img = nombreArchivo;
            await blog.save();
            return true;
            break;
         case 'sideadvertisings':
            const sideadvertising = await Sideadvertising.findById(id);
            if (!sideadvertising) {
                console.log('No es un sideadvertising por id');
                return false;
            }
            pathViejo = `./uploads/sideadvertisings/${sideadvertising.img}`;

            borrarImagen(pathViejo);

            sideadvertising.img = nombreArchivo;
            await sideadvertising.save();
            return true;
            break;

        case 'banners':
            const banner = await Banner.findById(id);
            if (!banner) {
                console.log('No es un banner por id');
                return false;
            }
            pathViejo = `./uploads/banners/${banner.img}`;

            borrarImagen(pathViejo);

            banner.img = nombreArchivo;
            await banner.save();
            return true;
            break;

        case 'pagos':
            const pago = await Pago.findById(id);
            if (!pago) {
                console.log('No es un pago por id');
                return false;
            }
            pathViejo = `./uploads/pagos/${pago.img}`;

            borrarImagen(pathViejo);

            pago.img = nombreArchivo;
            await pago.save();
            return true;
            break;



    }

};

module.exports = {
    actualizarImagen,
    borrarImagen
};