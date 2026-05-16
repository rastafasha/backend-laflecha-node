const path = require('path');
const fs = require('fs');
const { response } = require('express');
const { v4: uuidv4 } = require('uuid');
const { actualizarImagen } = require('../helpers/actualizar-imagen');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require('cloudinary').v2;
const Documento = require('../models/document');
// configurar cloudinary
cloudinary.config({
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY,
    cloud_name: process.env.CLOUD_NAME
})

const fileUpload = async (req, res = response) => {
    const tipo = req.params.tipo;
    const id = req.params.id;

    // 1. Validar tipos de carpetas/colecciones
    const tiposValidos = [
        'profiles', 'blogs', 'pagos',
        'banners',
        'sideadvertisings',
        'documents'
    ];

    if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ ok: false, msg: 'Tipo de colección no permitido' });
    }

    // 2. Validar que venga un archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ ok: false, msg: 'No se seleccionó ninguna imagen' });
    }

    const file = req.files.imagen;

    // 3. VALIDACIÓN estricta de 3MB
    const MAX_SIZE_MB = 3;
    const bytesLimit = MAX_SIZE_MB * 1024 * 1024;

    if (file.size > bytesLimit) {
        return res.status(400).json({
            ok: false,
            msg: `La imagen supera el límite de ${MAX_SIZE_MB}MB. Por favor, sube una más ligera.`
        });
    }

    // 4. Validar extensión
    const nombreCortado = file.name.split('.');
    const extensionArchivo = nombreCortado[nombreCortado.length - 1].toLowerCase();
    const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'];

    if (!extensionesValidas.includes(extensionArchivo)) {
        return res.status(400).json({ ok: false, msg: 'Formato no permitido (usa jpg, png o webp)' });
    }

    try {
        // 5. Convertir el Buffer a Data URI
        const base64Image = Buffer.from(file.data).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64Image}`;

        // Configuración base de Cloudinary
        let cloudinaryOptions = {
            folder: `lawyerapp/uploads/${tipo}/`,
            public_id: uuidv4()
        };

        // 6. Configurar Cloudinary según el tipo de archivo (Evita romper los PDF)
        if (tipo === 'documents' || extensionArchivo === 'pdf') {
            cloudinaryOptions.resource_type = 'raw'; // Obligatorio para PDFs en Cloudinary
        } else {
            // Transformaciones exclusivas para imágenes
            cloudinaryOptions.transformation = [
                { width: 1000, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" }
            ];
        }

        // Subida a Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, cloudinaryOptions);
        const urlArchivo = result.secure_url;

        // 7. Lógica de persistencia en la Base de Datos
        if (tipo === 'documents') {
            // Obtenemos la categoría enviada desde el body de la petición
            const { name_category } = req.body;

            if (!name_category) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El nombre de la categoría es obligatorio para guardar documentos.'
                });
            }

            // Instanciar el nuevo documento con tu DocumentSchema
            const nuevoDocumento = new Documento({
                name_file: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, // Convierte bytes a string legible (ej: "1.20 MB")
                resolution: 'N/A', // Los PDFs no manejan resolución de imagen
                file: urlArchivo,
                type: file.mimetype,
                name_category: name_category,
                usuario: id // Asigna el documento al ID del usuario recibido por parámetro
            });

            // Guardado efectivo en MongoDB
            await nuevoDocumento.save();

            return res.json({
                ok: true,
                msg: 'Documento PDF guardado y asignado al usuario con éxito',
                documento: nuevoDocumento
            });

        } else {
            // Si es un perfil, pago, blog, etc., ejecuta tu función de actualización habitual
            await actualizarImagen(tipo, id, urlArchivo);

            return res.json({
                ok: true,
                msg: 'Imagen subida y optimizada con éxito',
                nombreArchivo: urlArchivo
            });
        }

    } catch (error) {
        console.error('Error Servidor:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Hubo un error al procesar el archivo en el servidor',
            error: error.message
        });
    }


};
const retornaImagen = (req, res) => {
    const tipo = req.params.tipo;
    const foto = req.params.foto;

    const pathImg = path.join(__dirname, `../uploads/${tipo}/${foto}`);

    //traigo la foto desde cloudinary
    const urlImg = cloudinary.url(foto, {
        width: 300,
        height: 300,
        crop: 'fill'
    });

    //imagen por defecto
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        const pathImg = path.join(__dirname, `../uploads/${tipo}/no-image.jpg`);
        res.sendFile(pathImg);
    }
};

module.exports = {
    fileUpload,
    retornaImagen
}
