const { response } = require('express');
const Client = require('../models/client');
const Usuario = require('../models/usuario');

const getMyClients = async (req, res) => {
    const { usuarioId } = req.params;

    try {
        const myClients = await Client.find({ usuario: usuarioId })
            .populate('cliente', 'nombre email telefono') // Solo trae los campos necesarios
            .sort({ createdAt: -1 });

        res.json(myClients);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la lista" });
    }
};

const getClient = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    Client.findById(id, {})
        .exec((err, client) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar client',
                    errors: err
                });
            }
            if (!client) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El client con el id ' + id + 'no existe',
                    errors: { message: 'No existe un client con ese ID' }
                });

            }
            res.status(200).json({
                ok: true,
                client: client
            });
        });

};

const crearClient = async (req, res) => {

    const uid = req.uid;


    const client = new Client({
        usuario: uid,
        ...req.body,
    });

    try {

        const clientDB = await client.save();

        res.json({
            ok: true,
            client: clientDB
        });

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el admin'
        });
    }


};

const actualizarClient = async (req, res) => {

    const id = req.params.id;
    const uid = req.uid;

    try {

        const client = await Client.findById(id);
        if (!client) {
            return res.status(500).json({
                ok: false,
                msg: 'client no encontrado por el id'
            });
        }

        const cambiosClient = {
            ...req.body,
            usuario: uid
        }


        const clientActualizado = await Client.findByIdAndUpdate(id, cambiosClient, { new: true });

        res.json({
            ok: true,
            clientActualizado
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }


};


const borrarClient = async (req, res) => {

    const id = req.params.id;

    try {

        const client = await Client.findById(id);
        if (!client) {
            return res.status(500).json({
                ok: false,
                msg: 'client no encontrado por el id'
            });
        }

        await Client.findByIdAndDelete(id);

        res.json({
            ok: true,
            msg: 'client eliminado'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error hable con el admin'
        });
    }
};

const listarClientPorUsuario = (req, res) => {
    var id = req.params['id'];
    Client.find({ usuario: id }, (err, client_data) => {
        if (!err) {
            if (client_data) {
                res.status(200).send({ clients: client_data });
            } else {
                res.status(500).send({ error: err });
            }
        } else {
            res.status(500).send({ error: err });
        }
    });
}

const addClient = async (req, res) => {
    // Extraemos el ID del usuario directamente del token (validarJWT) 
    // y el ID del cliente del cuerpo de la petición
    const usuarioId = req.uid; // Asumiendo que tu middleware validarJWT guarda el ID en req.uid
    const { clienteId } = req.body;

    try {
        // 1. Validación básica
        if (!clienteId) {
            return res.status(400).json({ ok: false, msg: "El ID del cliente es necesario" });
        }

        if (usuarioId === clienteId) {
            return res.status(400).json({ ok: false, msg: "No puedes agregarte a ti mismo como cliente" });
        }

        // 2. Evitar duplicados (Muchos a Muchos)
        const existeRelacion = await Client.findOne({ usuario: usuarioId, cliente: clienteId });

        if (existeRelacion) {
            return res.status(400).json({ ok: false, msg: "Este cliente ya está en tu lista" });
        }

        // 3. Crear la relación
        const nuevaRelacion = new Client({
            usuario: usuarioId,
            cliente: clienteId
        });

        await nuevaRelacion.save();

        res.status(201).json({
            ok: true,
            msg: "Cliente agregado exitosamente",
            relacion: nuevaRelacion
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, msg: "Hable con el administrador" });
    }
};

const removeClient = async (req, res) => {
    const usuarioId = req.uid;          // Viene del token (seguro)
    const clienteId = req.params.clienteId; // Viene de la URL

    try {
        const resultado = await Client.findOneAndDelete({ 
            usuario: usuarioId, 
            cliente: clienteId 
        });

        if (!resultado) {
            return res.status(404).json({ ok: false, msg: "Relación no encontrada" });
        }

        res.json({ ok: true, msg: "Cliente eliminado" });
    } catch (error) {
        res.status(500).json({ ok: false, msg: "Error al eliminar" });
    }
};





module.exports = {
    getMyClients,
    getClient,
    crearClient,
    actualizarClient,
    borrarClient,
    listarClientPorUsuario,
    addClient,
    removeClient 


};