const { response } = require('express');
const Documento = require('../models/document');
const Usuario = require('../models/usuario');

const getDocumentos = async (req, res) => {

    const documentos = await Documento.find({})
        .populate('usuario')

    res.json({
        ok: true,
        documentos
    });
};

const getDocumento = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    Documento.findById(id, {})
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

const guardarDocumento = async (req, res) => {
  try {
    // 1. Validar que el archivo sea PDF si es obligatorio
    if (req.body.type !== 'application/pdf' && !req.body.name_file.endsWith('.pdf')) {
      return res.status(400).json({ ok: false, msg: 'El archivo debe ser un PDF' });
    }

    // 2. Crear la instancia del modelo con los datos del body y del usuario autenticado
    const nuevoDocumento = new Documento({
      name_file: req.body.name_file,
      size: req.body.size,
      resolution: req.body.resolution || 'N/A', 
      file: req.body.file, // Ruta o URL del archivo
      type: req.body.type,
      name_category: req.body.name_category, // Categoría obligatoria
      usuario: req.usuario.id // ID del usuario que sube (obtenido de tu JWT/Middleware)
    });

    // 3. Guardar en la base de datos
    const documentoGuardado = await nuevoDocumento.save();

    res.status(201).json({
      ok: true,
      documento: documentoGuardado
    });

  } catch (error) {
    console.error(error); // Revisa la consola para ver el error exacto si falla
    res.status(500).json({
      ok: false,
      msg: 'Error al guardar el documento en la base de datos'
    });
  }
};

const actualizarDocumento = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const documento = await Documento.findById(id);
        if (!documento) {
            return res.status(500).json({
                ok: false,
                msg: 'documento no encontrado por el id'
            });
        }

        const cambiosDocumento = {
            ...req.body,
            usuario: uid
        }


        const documentoActualizado = await Documento.findByIdAndUpdate(id, cambiosDocumento, { new: true });

        res.json({
            ok: true,
            documentoActualizado
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};


const borrarDocumento = async (req, res) => {

    const id = req.params.id;

    try {

        const documento = await Documento.findById(id);
        if (!documento) {
            return res.status(500).json({
                ok: false,
                msg: 'documento no encontrado por el id'
            });
        }

        await Documento.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'documento eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

const listarDocumentoPorUsuario = (req, res) => {
    var id = req.params['id'];
    Documento.find({ usuario: id }, (err, documento_data) => {
        if (!err) {
            if (documento_data) {
                res.status(200).send({ documentos: documento_data });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    }).populate('usuario');
}

const listarDocumentoPorCategoria = async (req, res) => {
  try {
    // 1. Capturar los parámetros exactos definidos en tu router (:userId y :name)
    const { userId, name } = req.params;

    // 2. Realizar la búsqueda aplicando ambos filtros a la vez
    // 'usuario' busca por el ID del dueño y 'name_category' busca por el string de la categoría
    const documento_data = await Documento.find({ 
      usuario: userId, 
      name_category: name 
    }).populate('usuario', 'nombre email'); // Ajusta los campos que quieres mostrar del usuario si es necesario

    // 3. Responder con los datos encontrados (si no hay, devolverá un arreglo vacío [])
    return res.status(200).json({
      ok: true,
      documentos: documento_data
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener los documentos por categoría',
      error: err.message
    });
  }
};

const listarActivos = (req, res) => {
    var id = req.params['id'];
    Documento.find({ usuario: id }, (err, documento_data) => {
        if (!err) {
            if (documento_data) {
                res.status(200).send({ documentos: documento_data });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    }).populate('usuario');
}

const compartirDocumento = async (req, res) => {
  try {
    // 1. Desestructuramos las variables que envías desde el cuerpo (body) de tu Angular
    const { documentId, emailACompartir, usuario } = req.body; 
    
    // 2. CORRECCIÓN CRÍTICA: Asegurar la obtención del ID del usuario autenticado.
    // Si usas req.usuario de un middleware JWT, verifica si es req.usuario.id, req.usuario._id o req.uid.
    // Como respaldo temporal por si no usas middleware en esta ruta, tomamos 'usuario' que envías en el body:
    const usuarioAutenticado = req.uid || (req.usuario ? (req.usuario.id || req.usuario._id) : usuario);

    if (!usuarioAutenticado) {
      return res.status(401).json({ ok: false, msg: 'No se pudo identificar al usuario autenticado' });
    }

    // 3. Verificar que el documento exista y pertenezca al usuario que intenta compartirlo
    // Al usar variables de texto ID limpias, MongoDB ejecutará la consulta de forma exitosa
    const documento = await Documento.findOne({ _id: documentId, usuario: usuarioAutenticado });
    
    if (!documento) {
      return res.status(404).json({ 
        ok: false, 
        msg: 'Documento no encontrado o no tienes permisos sobre este recurso' 
      });
    }

    // 4. Buscar al usuario con el que se quiere compartir mediante su email
    const usuarioDestino = await Usuario.findOne({ email: emailACompartir });
    if (!usuarioDestino) {
      return res.status(404).json({ ok: false, msg: 'El usuario con ese correo no existe' });
    }

    // 5. Evitar compartir el documento consigo mismo
    if (usuarioDestino._id.toString() === usuarioAutenticado.toString()) {
      return res.status(400).json({ ok: false, msg: 'No puedes compartir el documento contigo mismo' });
    }

    // 6. Verificar si ya está compartido con ese usuario
    if (documento.sharedWith.includes(usuarioDestino._id)) {
      return res.status(400).json({ ok: false, msg: 'Este documento ya está compartido con este usuario' });
    }

    // 7. Agregar el ID del nuevo usuario al arreglo y guardar
    documento.sharedWith.push(usuarioDestino._id);
    await documento.save();

    return res.status(200).json({ 
      ok: true, 
      msg: `Documento compartido con éxito con ${usuarioDestino.username || 'el usuario'}` 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Error al compartir el documento', error: error.message });
  }
};

const listarDocumentosCompartidosConmigo = async (req, res) => {
  try {
    // CORRECCIÓN: Leemos el parámetro de la URL en vez de req.usuario o req.uid
    const { miUsuarioId } = req.params; 

    if (!miUsuarioId) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'El ID del usuario es requerido' 
      });
    }

    // Buscamos tu ID dentro del arreglo 'sharedWith'
    const documentosCompartidos = await Documento.find({ 
      sharedWith: { $in: [miUsuarioId] } 
    })
    .populate('usuario', 'username email') // Trae los datos del dueño original
    .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      documentos: documentosCompartidos
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: 'Error al obtener los documentos compartidos',
      error: error.message
    });
  }
};



module.exports = {
    getDocumentos,
    getDocumento,
    guardarDocumento,
    actualizarDocumento,
    borrarDocumento,
    listarDocumentoPorUsuario,
    listarDocumentoPorCategoria,
    listarActivos,
    compartirDocumento,
    listarDocumentosCompartidosConmigo

};