const { response } = require('express');
const Message = require('../models/message'); // Adjust the path to your Model

const getByUser = async (req, res = response) => {
    try {
        const { usuario, client } = req.params;

        // Fetch messages exchanged between these two specific IDs
        const messages = await Message.find({
            $or: [
                { de: usuario, para: client },
                { de: client, para: usuario }
            ]
        }).sort({ createdAt: 'asc' }); // Oldest to newest

        // Returning the exact structure your Angular map expects: { ok: true, messages: [...] }
        res.json({
            ok: true,
            messages 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error loading chat history'
        });
    }
};

const createMessage = async (req, res = response) => {
    try {
        // Your form data keys from Angular: user_id, cliente_id, message
        const { user_id, cliente_id, message } = req.body;

        const nuevoMensaje = new Message({
            de: user_id,
            para: cliente_id,
            message: message
        });

        await nuevoMensaje.save();

        res.json({
            ok: true,
            message: nuevoMensaje
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error storing message'
        });
    }
};

module.exports = {
    getByUser,
    createMessage
};
