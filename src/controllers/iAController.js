const { response } = require('express');
const { GoogleGenAI } = require('@google/genai');
const DocumentoLegal = require('../models/documentoLegal');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generarDocumentoLegal = async (req, res) => {
    try {
        // EXTRA DE SEGURIDAD: Si Angular envía los datos sueltos o metidos dentro de 'data',
        // nos aseguramos de capturar la fuente correcta del body.
        const bodyOrigen = req.body.data ? req.body.data : req.body;

        const { prompt, titulo, usuario } = bodyOrigen;

        // Validación del requerimiento
        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ ok: false, msg: "El requerimiento es obligatorio" });
        }

        // 1. LLAMADA A LA API DE GEMINI
        // CORREGIDO: Usamos el objeto de inteligencia artificial 'ai', NO el modelo de la DB
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `Eres un asistente legal experto y calificado de alta gama. Redacta borradores formales de documentos jurídicos utilizando terminología técnica formal legal adaptada a las leyes locales del usuario. Devuelve únicamente el documento estructurado con marcadores entre corchetes como [Nombre del Cliente].`,
                temperature: 0.3,
            }
        });

        // Verificación de seguridad por si la API responde vacía
        const documentoGenerado = response.text;
        if (!documentoGenerado) {
            throw new Error("Gemini no devolvió texto para este prompt.");
        }

        // 2. GUARDAR EN LA BASE DE DATOS
        // Aquí usamos 'DocumentoLegal' correctamente para MongoDB
        const nuevoDocumento = new DocumentoLegal({
            usuario: usuario, 
            promptOriginal: prompt,
            documentoTexto: documentoGenerado,
            titulo: titulo || 'Borrador Legal'
        });

        await nuevoDocumento.save();

        // 3. RESPUESTA AL FRONTEND
        res.status(201).json({
            ok: true,
            msg: "Documento generado y respaldado con éxito",
            documento: documentoGenerado,
            idDocumento: nuevoDocumento._id 
        });

    } catch (error) {
        console.error('Error en Asistente Gemini y DB:', error.message || error);
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor al procesar o almacenar el documento"
        });
    }
};


const actualizarDocumentoLegal = async (req, res) => {
    try {
        const { id } = req.params; // El ID del documento enviado en la URL (ej: /ia/actualizar-documento/12345)
        const { documentoTexto, titulo } = req.body; // ❌ ELIMINADO: Ya no aceptamos el UID por aquí

        // 🛡️ SEGURIDAD EXTREMA: Extraemos el UID directamente del Token JWT
        const usuarioUID = req.uid || req.usuario?.uid || req.usuario?._id;

        if (!usuarioUID) {
            return res.status(401).json({
                ok: false,
                msg: "Token no válido o usuario no autenticado de forma segura."
            });
        }

        // 🔍 VALIDACIÓN DE PROPIEDAD: Buscamos el documento asegurándonos de que 
        // el campo 'usuario' coincida exactamente con el UID extraído del JWT.
        const documento = await DocumentoLegal.findOne({ _id: id, usuario: usuarioUID });

        if (!documento) {
            return res.status(403).json({
                ok: false,
                msg: "Acceso denegado. El documento no existe o no tienes permisos para editarlo."
            });
        }

        // 2. Modificamos los campos autorizados
        if (documentoTexto) documento.documentoTexto = documentoTexto;
        if (titulo) documento.titulo = titulo;

        await documento.save();

        res.json({
            ok: true,
            msg: "Documento actualizado correctamente",
            documento
        });

    } catch (error) {
        console.error('Error al actualizar documento:', error);
        res.status(500).json({
            ok: false,
            msg: "Error en el servidor al intentar actualizar el documento"
        });
    }
};

const getDocumentos = async (req, res) => {

    const documentos = await DocumentoLegal.find({})
        .populate('usuario')

    res.json({
        ok: true,
        documentos
    });
};

const getDocumento = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    DocumentoLegal.findById(id, {})
        .populate('usuario')
        .exec((err, documento) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar documento',
                    errors: err
                });
            }
            if (!documento) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El documento con el id ' + id + 'no existe',
                    errors: { message: 'No existe un documento con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                documento: documento
            });
        });

};

module.exports = {
    generarDocumentoLegal,
    actualizarDocumentoLegal,
    getDocumento,
    getDocumentos
};
